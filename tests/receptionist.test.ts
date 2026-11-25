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
import {
  CLOUDFLARE_RECEPTIONIST_CHAT_URL,
  ReceptionistApiError,
  buildCloudflareChatPayload,
  handleReceptionistChat
} from '../src/lib/receptionistServerCore';

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

  // 4. Verify Demo mode vs Live Cloudflare Worker mode & payload contract
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

  const mappedPayload = buildCloudflareChatPayload({
    message: 'How does WhatsApp automation work?',
    history: [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Welcome to UNIKORN360.' }
    ],
    turnstileToken: 'test-turnstile-token-mapped'
  });
  assert.deepEqual(mappedPayload, {
    message: 'How does WhatsApp automation work?',
    history: [
      { role: 'user', text: 'Hi' },
      { role: 'assistant', text: 'Welcome to UNIKORN360.' }
    ],
    turnstileToken: 'test-turnstile-token-mapped'
  });

  // Live mode without Turnstile token must fail closed before any network call
  let liveCalledWithoutToken = false;
  let threwMissingToken = false;
  try {
    await handleReceptionistChat(
      {
        sessionId: 'test-session-missing-token',
        message: 'Tell me about InvoicePro360',
        history: [],
        mode: 'live',
        currentPage: '/products'
      },
      {},
      async () => {
        liveCalledWithoutToken = true;
        return new Response('{}', { status: 200 });
      }
    );
  } catch (err) {
    threwMissingToken =
      err instanceof ReceptionistApiError &&
      err.status === 400 &&
      err.code === 'TURNSTILE_TOKEN_REQUIRED';
  }
  assert.ok(threwMissingToken, 'Live mode must reject requests missing turnstileToken');
  assert.equal(liveCalledWithoutToken, false, 'Must never call Cloudflare Worker without Turnstile token');

  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  const mockSuccessFetch: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return new Response(
      JSON.stringify({
        ok: true,
        reply: 'UNIKORN360 offers InvoicePro360 for billing and GST workflows.',
        text: 'UNIKORN360 offers InvoicePro360 for billing and GST workflows.',
        model: 'gemini-3.8-flash'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const liveSuccess = await handleReceptionistChat(
    {
      sessionId: 'test-session-live-1',
      message: 'Tell me about InvoicePro360',
      history: [{ role: 'user', content: 'Hello UNIKORN360' }],
      mode: 'live',
      currentPage: '/products',
      turnstileToken: 'fresh-turnstile-token-123'
    },
    {},
    mockSuccessFetch
  );
  assert.equal(capturedUrl, CLOUDFLARE_RECEPTIONIST_CHAT_URL);
  assert.equal(capturedInit?.method, 'POST');
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    message: 'Tell me about InvoicePro360',
    history: [{ role: 'user', text: 'Hello UNIKORN360' }],
    turnstileToken: 'fresh-turnstile-token-123'
  });
  assert.equal(liveSuccess.mode, 'live');
  assert.equal(liveSuccess.simulated, false);
  assert.equal(liveSuccess.model, 'gemini-3.8-flash');
  assert.ok(liveSuccess.reply.includes('InvoicePro360'));
  assert.ok(liveSuccess.recommendedLinks.some((l) => l.path === '/products/invoicepro360'));

  // Upstream failure must throw explicit error and NEVER fabricate an AI response
  let threwOnUpstreamBusy = false;
  const mockBusyFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: 'AI service is busy. Please try again shortly.'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    await handleReceptionistChat(
      {
        sessionId: 'test-session-live-2',
        message: 'Tell me about InvoicePro360',
        history: [],
        mode: 'live',
        currentPage: '/products',
        turnstileToken: 'fresh-turnstile-token-456'
      },
      {},
      mockBusyFetch
    );
  } catch (err) {
    threwOnUpstreamBusy =
      err instanceof ReceptionistApiError &&
      err.status === 503 &&
      err.code === 'CLOUDFLARE_BACKEND_ERROR' &&
      err.message.includes('AI service is busy');
  }
  assert.ok(threwOnUpstreamBusy, 'Live mode must throw explicit error when Cloudflare backend fails');

  let threwOnNetworkFailure = false;
  const mockNetworkFailFetch: typeof fetch = async () => {
    throw new Error('ECONNREFUSED');
  };
  try {
    await handleReceptionistChat(
      {
        sessionId: 'test-session-live-3',
        message: 'Hello',
        history: [],
        mode: 'live',
        currentPage: '/',
        turnstileToken: 'fresh-turnstile-token-789'
      },
      {},
      mockNetworkFailFetch
    );
  } catch (err) {
    threwOnNetworkFailure =
      err instanceof ReceptionistApiError &&
      err.status === 502 &&
      err.code === 'CLOUDFLARE_NETWORK_ERROR';
  }
  assert.ok(threwOnNetworkFailure, 'Live mode must throw explicit error on network failure');

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

    // Reject empty/invalid chat payload cleanly with HTTP 400
    const badChatRes = await fetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'http-test-bad',
        message: '   ',
        history: [],
        mode: 'live'
      })
    });
    assert.equal(badChatRes.status, 400);

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
