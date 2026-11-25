import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server';
import {
  CENTRAL_KNOWLEDGE_SCHEMA_VERSION,
  assembleCentralBusinessKnowledge,
  buildUnikornKnowledgeContext,
  sanitizeApprovedPackages
} from '../src/lib/receptionistKnowledge';
import { fetchCentralBusinessKnowledge } from '../src/lib/receptionistServerCore';
import {
  onRequestGet as cfKnowledgeGet,
  onRequestHead as cfKnowledgeHead,
  onRequestOptions as cfKnowledgeOptions
} from '../functions/api/receptionist/knowledge';
import { SEED_DIVISIONS, SEED_SERVICES } from '../src/data/seedData';
import type { CentralBusinessKnowledgeResponse } from '../src/types/receptionist';

async function runKnowledgeTests() {
  console.log('Running Inbox360 Central Business Knowledge Engine verification suite...');

  // 1. Verify canonical baseline assembly (6 divisions, 37 services, 4 products, zero draft pricing)
  const baseline = assembleCentralBusinessKnowledge();
  assert.equal(baseline.ok, true);
  assert.equal(baseline.schemaVersion, CENTRAL_KNOWLEDGE_SCHEMA_VERSION);
  assert.equal(baseline.catalogSource, 'canonical_seed');
  assert.ok(baseline.sourceDataVersion.includes('canonical_seed'));
  assert.ok(!Number.isNaN(Date.parse(baseline.updatedAt)), 'updatedAt must be valid ISO date');

  assert.equal(baseline.divisions.length, 6, 'Must return exactly 6 published business divisions');
  assert.equal(baseline.counts.divisions, 6);
  assert.equal(baseline.services.length, 37, 'Must represent all 37 primary services');
  assert.equal(baseline.counts.services, 37);
  assert.equal(baseline.products.length, 4, 'Must return all 4 standalone software products');
  assert.equal(baseline.counts.products, 4);

  // Verify company profile & official contact details
  assert.equal(baseline.company.brand, 'UNIKORN360 BUSINESS INTELLIGENCE');
  assert.equal(baseline.company.gstin, '33ANBPR6486P2Z7');
  assert.equal(baseline.company.website, 'https://www.unikorn360.com');
  assert.equal(baseline.company.whatsappDisplay, '+91 98848 24360');
  assert.ok(baseline.company.whatsappUrl.startsWith('https://wa.me/919884824360'));

  // Verify every product has verified capabilities & null unconfirmed pricing
  for (const prod of baseline.products) {
    assert.ok(prod.verifiedFeatures.length >= 4, `${prod.name} must include verified features`);
    assert.equal(prod.confirmedPricing, null, `${prod.name} must not invent unconfirmed pricing`);
    assert.ok(prod.canonicalUrl.startsWith('https://www.unikorn360.com/products/'));
    assert.ok(prod.appUrl.startsWith('https://'));
  }

  // Verify zero draft commercial packages or unapproved pricing leaked in seed mode
  for (const svc of baseline.services) {
    assert.equal(
      svc.approvedPackages.length,
      0,
      `Seed service ${svc.slug} has draft packages only and must expose 0 approved packages`
    );
    assert.ok(svc.url.startsWith('https://www.unikorn360.com/services/'));
  }

  // Verify commercial policies & engagement models (VERIFY, PROTECT, GUARDIAN)
  assert.deepEqual(
    baseline.commercialPolicies.engagementModels.map((m) => m.name),
    ['VERIFY', 'PROTECT', 'GUARDIAN']
  );
  assert.deepEqual(baseline.commercialPolicies.supportedLanguages, ['en', 'ta', 'tanglish', 'hi']);

  // Verify public links contain only valid public URLs (no /admin, /login, or malformed paths)
  const allUrls = [
    ...baseline.publicLinks.corePages.map((l) => l.url),
    ...baseline.publicLinks.divisions.map((l) => l.url),
    ...baseline.publicLinks.services.map((l) => l.url),
    ...baseline.publicLinks.products.map((l) => l.url)
  ];
  for (const url of allUrls) {
    assert.ok(url.startsWith('https://www.unikorn360.com'), `Invalid public URL: ${url}`);
    assert.ok(!url.includes('/admin') && !url.includes('/login'), `Restricted route leaked: ${url}`);
  }

  // Verify zero credentials, API keys, or internal/private data exposed
  const serialized = JSON.stringify(baseline);
  for (const forbidden of [
    'GEMINI_API_KEY',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'sb_secret_',
    'sb_publishable_',
    'admin_notes',
    'submission_secret',
    'karthik.maduraifoodie'
  ]) {
    assert.ok(!serialized.includes(forbidden), `Forbidden token/data exposed: ${forbidden}`);
  }

  // 2. Verify strict package sanitization and Supabase publication filters
  const mixedPackages = sanitizeApprovedPackages([
    {
      id: 'pkg-draft',
      name: 'Draft Tier',
      description: 'Should be filtered out',
      price: 49999,
      currency: 'INR',
      billing_period: 'one-time',
      price_type: 'fixed',
      inclusions: ['Feature A'],
      limits: [],
      exclusions: [],
      setup_charges: null,
      tax_treatment: 'GST 18%',
      approval_status: 'draft'
    },
    {
      id: 'pkg-pending',
      name: 'Pending Tier',
      description: 'Should be filtered out',
      price: 55555,
      currency: 'INR',
      billing_period: 'monthly',
      price_type: 'fixed',
      inclusions: ['Feature B'],
      limits: [],
      exclusions: [],
      setup_charges: null,
      tax_treatment: 'GST 18%',
      approval_status: 'pending'
    },
    {
      id: 'pkg-approved-null-price',
      name: 'Approved Without Price',
      description: 'Should be excluded because price is null',
      price: null,
      currency: 'INR',
      billing_period: 'project-based',
      price_type: 'quotation',
      inclusions: ['Custom scope'],
      limits: [],
      exclusions: [],
      setup_charges: null,
      tax_treatment: 'GST 18%',
      approval_status: 'approved'
    },
    {
      id: 'pkg-approved-valid',
      name: 'Approved Standard',
      description: 'Public approved tier',
      price: 25000,
      currency: 'INR',
      billing_period: 'one-time',
      price_type: 'starting-from',
      inclusions: ['Core setup'],
      limits: ['Single domain'],
      exclusions: ['Third-party hosting'],
      setup_charges: 'None',
      tax_treatment: 'Subject to applicable GST (18%)',
      approval_status: 'approved',
      is_popular: true
    }
  ]);
  assert.equal(mixedPackages.length, 1);
  assert.equal(mixedPackages[0].id, 'pkg-approved-valid');
  assert.equal(mixedPackages[0].price, 25000);

  // Mock Supabase returning published + draft/archived rows to confirm strict filtering
  const mockSupabaseFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes('/rest/v1/service_divisions')) {
      return new Response(
        JSON.stringify([
          SEED_DIVISIONS[0],
          { ...SEED_DIVISIONS[1], status: 'draft' }
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url.includes('/rest/v1/service_catalog')) {
      return new Response(
        JSON.stringify([
          {
            ...SEED_SERVICES[0],
            status: 'published',
            packages: [
              { ...SEED_SERVICES[0].packages[0], price: 99999, approval_status: 'draft' },
              {
                ...SEED_SERVICES[0].packages[0],
                id: 'pkg-live-approved',
                name: 'Approved Website Launch',
                price: 35000,
                approval_status: 'approved'
              }
            ]
          },
          { ...SEED_SERVICES[1], status: 'draft' },
          { ...SEED_SERVICES[2], status: 'archived' },
          { ...SEED_SERVICES[6], status: 'published' } // belongs to draft division[1], must be excluded
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('Not found', { status: 404 });
  };

  const liveFiltered = await fetchCentralBusinessKnowledge(
    {
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'public-read-test-key'
    },
    mockSupabaseFetch
  );
  assert.equal(liveFiltered.catalogSource, 'supabase_published');
  assert.equal(liveFiltered.divisions.length, 1, 'Draft divisions must be excluded');
  assert.equal(liveFiltered.services.length, 1, 'Draft/archived/orphan services must be excluded');
  assert.equal(liveFiltered.services[0].approvedPackages.length, 1);
  assert.equal(liveFiltered.services[0].approvedPackages[0].price, 35000);
  assert.ok(!JSON.stringify(liveFiltered).includes('99999'), 'Draft price must never leak');

  // When Supabase has zero published services, falls back cleanly to canonical 6 divisions & 37 services
  const emptyDbFallback = await fetchCentralBusinessKnowledge(
    {
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'public-read-test-key'
    },
    async () => new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
  );
  assert.equal(emptyDbFallback.catalogSource, 'canonical_seed');
  assert.equal(emptyDbFallback.divisions.length, 6);
  assert.equal(emptyDbFallback.services.length, 37);

  // 3. Verify shared chatbot knowledge context is synced with central engine
  const chatbotContext = buildUnikornKnowledgeContext();
  assert.ok(chatbotContext.includes('33ANBPR6486P2Z7'));
  assert.ok(chatbotContext.includes('InvoicePro360'));
  assert.ok(chatbotContext.includes('Website Development'));

  // 4. Verify Cloudflare Pages Function handlers (GET, HEAD, OPTIONS)
  const optRes = cfKnowledgeOptions();
  assert.equal(optRes.status, 204);
  assert.equal(optRes.headers.get('access-control-allow-origin'), '*');

  const getRes = await cfKnowledgeGet({
    request: new Request('https://www.unikorn360.com/api/receptionist/knowledge', { method: 'GET' }),
    env: {}
  });
  assert.equal(getRes.status, 200);
  assert.equal(getRes.headers.get('access-control-allow-origin'), '*');
  const cfJson = (await getRes.json()) as CentralBusinessKnowledgeResponse;
  assert.equal(cfJson.ok, true);
  assert.equal(cfJson.divisions.length, 6);
  assert.equal(cfJson.services.length, 37);
  assert.equal(cfJson.products.length, 4);

  const headRes = await cfKnowledgeHead({
    request: new Request('https://www.unikorn360.com/api/receptionist/knowledge', { method: 'HEAD' }),
    env: {}
  });
  assert.equal(headRes.status, 200);
  assert.equal(await headRes.text(), '');

  // 5. Verify Express parity HTTP endpoint + existing receptionist endpoints
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const httpKnowledgeRes = await fetch(`${baseUrl}/api/receptionist/knowledge`);
    assert.equal(httpKnowledgeRes.status, 200);
    assert.equal(httpKnowledgeRes.headers.get('access-control-allow-origin'), '*');
    const httpJson = (await httpKnowledgeRes.json()) as CentralBusinessKnowledgeResponse;
    assert.equal(httpJson.ok, true);
    assert.equal(httpJson.schemaVersion, '1.0');
    assert.equal(httpJson.divisions.length, 6);
    assert.equal(httpJson.services.length, 37);
    assert.equal(httpJson.products.length, 4);

    // Ensure existing Demo Mode chat & enquiry submission still work
    const demoRes = await fetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'kb-regression-demo',
        message: 'Tell me about Website Development',
        history: [],
        mode: 'demo',
        quickActionId: 'website-development'
      })
    });
    assert.equal(demoRes.status, 200);
    const demoJson = (await demoRes.json()) as { simulated: boolean };
    assert.equal(demoJson.simulated, true);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('ALL CENTRAL BUSINESS KNOWLEDGE ENGINE TESTS PASSED!');
}

runKnowledgeTests().catch((err) => {
  console.error('Central Business Knowledge test failure:', err);
  process.exit(1);
});
