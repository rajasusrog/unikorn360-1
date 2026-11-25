import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server';
import {
  RECEPTIONIST_QUICK_ACTIONS,
  RECEPTIONIST_WHATSAPP_BASE_URL,
  RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE,
  buildReceptionistWhatsAppUrl,
  createSlidingWindowRateLimiter,
  detectMessageLanguage,
  sanitizeRecommendedLinks,
  validateEnquirySubmissionPayload
} from '../src/lib/receptionistKnowledge';
import { handleReceptionistChat, ReceptionistApiError } from '../src/lib/receptionistServerCore';

async function runTests() {
  console.log('Running UNIKORN360 AI Website Receptionist verification suite...');

  // 1. Verify all 10 required quick actions exist
  assert.equal(RECEPTIONIST_QUICK_ACTIONS.length, 10, 'Must expose all 10 quick actions');
  const labels = RECEPTIONIST_QUICK_ACTIONS.map((a) => a.label);
  for (const requiredLabel of [
    'Website Development',
    'Software Development',
    'AI & Automation',
    'WhatsApp Automation',
    'Cybersecurity',
    'Digital Marketing',
    'Business Documentation',
    'Business Consulting',
    'Explore Software Products',
    'Talk to Human'
  ]) {
    assert.ok(labels.includes(requiredLabel), `Missing quick action: ${requiredLabel}`);
  }

  // 2. Verify official WhatsApp handover URL & prefilled message
  const waUrl = buildReceptionistWhatsAppUrl();
  assert.ok(waUrl.startsWith(`${RECEPTIONIST_WHATSAPP_BASE_URL}?text=`));
  assert.ok(
    decodeURIComponent(waUrl.split('?text=')[1]) === RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE,
    'WhatsApp default message must match specification'
  );

  // 3. Verify multilingual detection (English, Tamil, Tanglish, Hindi)
  assert.equal(detectMessageLanguage('We need an e-commerce website'), 'en');
  assert.equal(detectMessageLanguage('எங்களுக்கு வணிக இணையதளம் வேண்டும்'), 'ta');
  assert.equal(detectMessageLanguage('Vanakkam, enaku website development venum'), 'tanglish');
  assert.equal(detectMessageLanguage('हमें वेबसाइट और ऑटोमेशन चाहिए'), 'hi');

  // 4. Verify Demo mode vs Live mode separation (Live mode never silently masks missing key)
  const demoReply = await handleReceptionistChat(
    {
      sessionId: 'test-session-1',
      message: 'Vanakkam, enaku website venum. My name is Karthik from Apex Traders, phone 9876543210.',
      history: [],
      mode: 'demo',
      currentPage: '/'
    },
    {}
  );
  assert.equal(demoReply.mode, 'demo');
  assert.equal(demoReply.simulated, true);
  assert.equal(demoReply.detectedLanguage, 'tanglish');
  assert.equal(demoReply.extractedFields.contactNumber, '9876543210');

  let threwOnMissingKey = false;
  try {
    await handleReceptionistChat(
      {
        sessionId: 'test-session-2',
        message: 'Tell me about InvoicePro360',
        history: [],
        mode: 'live',
        currentPage: '/products'
      },
      { GEMINI_API_KEY: '' }
    );
  } catch (err) {
    threwOnMissingKey = err instanceof ReceptionistApiError && err.code === 'GEMINI_NOT_CONFIGURED';
  }
  assert.ok(threwOnMissingKey, 'Live mode must throw explicit error when GEMINI_API_KEY is unset');

  // 5. Verify link allowlist sanitization blocks arbitrary URLs
  const cleanLinks = sanitizeRecommendedLinks([
    { label: 'Valid', path: '/products/invoicepro360' },
    { label: 'Malicious', path: 'javascript:alert(1)' },
    { label: 'Unknown', path: '/unverified-path' }
  ]);
  assert.equal(cleanLinks.length, 1);
  assert.equal(cleanLinks[0].path, '/products/invoicepro360');

  // 6. Verify enquiry validation
  const badValidation = validateEnquirySubmissionPayload({
    sessionId: 'test-s',
    enquiry: {
      customerName: 'A',
      contactNumber: '123',
      email: 'not-an-email',
      serviceRequired: '',
      projectDescription: 'short'
    }
  });
  assert.equal(badValidation.ok, false);

  // 7. Verify sliding-window rate limiter
  const limiter = createSlidingWindowRateLimiter(2, 60_000);
  assert.equal(limiter('ip-1').allowed, true);
  assert.equal(limiter('ip-1').allowed, true);
  assert.equal(limiter('ip-1').allowed, false);

  // 8. End-to-end HTTP route verification (chat, enquiry submission, admin auth gate)
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Chat endpoint in demo mode
    const chatRes = await fetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'http-test-1',
        message: 'Show me UNIKORN360 standalone software products.',
        history: [],
        mode: 'demo',
        quickActionId: 'explore-software-products'
      })
    });
    assert.equal(chatRes.status, 200);
    const chatData = (await chatRes.json()) as { simulated: boolean; recommendedLinks: Array<{ path: string }> };
    assert.equal(chatData.simulated, true);
    assert.ok(chatData.recommendedLinks.some((l) => l.path === '/products'));

    // Enquiry submission endpoint with all 8 fields
    const enquiryRes = await fetch(`${baseUrl}/api/receptionist/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'http-test-1',
        sourceMode: 'demo',
        detectedLanguage: 'en',
        pageUrl: '/services',
        enquiry: {
          customerName: 'Arun Kumar',
          businessName: 'Arun Textiles Pvt Ltd',
          contactNumber: '+91 98765 43210',
          email: 'arun@example.com',
          serviceRequired: 'Website Development',
          projectDescription: 'Need a responsive B2B industrial catalogue website with WhatsApp enquiry routing.',
          budgetRange: '₹25,000 – ₹75,000',
          expectedTimeline: '1 Month'
        },
        conversationHistory: [
          {
            id: 'm1',
            role: 'user',
            content: 'I need a B2B website',
            timestamp: new Date().toISOString(),
            mode: 'demo'
          }
        ]
      })
    });
    assert.equal(enquiryRes.status, 201);
    const enquiryData = (await enquiryRes.json()) as { success: boolean; referenceCode: string };
    assert.equal(enquiryData.success, true);
    assert.ok(enquiryData.referenceCode.startsWith('U360-REC-'));

    // Admin enquiries endpoint must reject unauthenticated requests
    const unauthAdminRes = await fetch(`${baseUrl}/api/admin/receptionist-enquiries`);
    assert.equal(unauthAdminRes.status, 401);

    const unauthPatchRes = await fetch(`${baseUrl}/api/admin/receptionist-enquiries?id=00000000-0000-0000-0000-000000000000`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_status: 'contacted' })
    });
    assert.equal(unauthPatchRes.status, 401);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('ALL RECEPTIONIST TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('Receptionist test failure:', err);
  process.exit(1);
});
