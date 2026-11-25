import {
  createSlidingWindowRateLimiter,
  validateEnquirySubmissionPayload
} from '../../../src/lib/receptionistKnowledge';
import { linkEnquiryToConversation } from '../../../src/lib/receptionistConversationStore';
import {
  insertEnquiryIntoSupabaseRest,
  ReceptionistRuntimeEnv
} from '../../../src/lib/receptionistServerCore';

const checkEnquiryRateLimit = createSlidingWindowRateLimiter(6, 5 * 60_000);

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(extraHeaders || {})
    }
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';

  const rate = checkEnquiryRateLimit(`enquiry:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        error: `Please wait ${rate.retryAfterSeconds} seconds before submitting another enquiry.`,
        code: 'RATE_LIMITED',
        retryAfterSeconds: rate.retryAfterSeconds
      },
      429,
      { 'Retry-After': String(rate.retryAfterSeconds) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.', code: 'INVALID_JSON' }, 400);
  }

  const validation = validateEnquirySubmissionPayload(body);
  if (validation.ok === false) {
    return jsonResponse(
      {
        error: validation.error,
        fieldErrors: validation.fieldErrors,
        code: 'VALIDATION_ERROR'
      },
      400
    );
  }

  try {
    const saved = await insertEnquiryIntoSupabaseRest(validation.data, env);
    if (saved.ok === false) {
      return jsonResponse(
        {
          error: saved.error,
          code: saved.tableMissing ? 'MIGRATION_REQUIRED' : 'STORAGE_UNAVAILABLE'
        },
        503
      );
    }

    await linkEnquiryToConversation(
      {
        sessionId: validation.data.sessionId,
        sourceMode: validation.data.sourceMode,
        enquiryId: saved.record.id,
        customerName: validation.data.enquiry.customerName,
        contactNumber: validation.data.enquiry.contactNumber,
        detectedLanguage: validation.data.detectedLanguage
      },
      env
    );

    return jsonResponse(
      {
        success: true,
        referenceCode: saved.record.reference_code,
        enquiryId: saved.record.id,
        storage: 'supabase',
        createdAt: saved.record.created_at
      },
      201
    );
  } catch (err) {
    console.error('Cloudflare Worker /api/receptionist/enquiry error:', err);
    return jsonResponse(
      { error: 'Unable to save your enquiry right now. Please try again or reach us on WhatsApp.' },
      500
    );
  }
}
