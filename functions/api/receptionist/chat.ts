import {
  createSlidingWindowRateLimiter,
  validateChatRequestPayload
} from '../../../src/lib/receptionistKnowledge';
import {
  handleReceptionistChat,
  ReceptionistApiError,
  ReceptionistRuntimeEnv
} from '../../../src/lib/receptionistServerCore';

const checkChatRateLimit = createSlidingWindowRateLimiter(20, 60_000);

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

  const rate = checkChatRateLimit(`chat:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        error: `Too many chat requests. Please wait ${rate.retryAfterSeconds} seconds and try again.`,
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

  const validation = validateChatRequestPayload(body);
  if (validation.ok === false) {
    return jsonResponse({ error: validation.error, code: 'VALIDATION_ERROR' }, 400);
  }

  try {
    const result = await handleReceptionistChat(validation.data, env);
    return jsonResponse(result, 200);
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      return jsonResponse({ error: err.message, code: err.code }, err.status);
    }
    console.error('Cloudflare Worker /api/receptionist/chat error:', err);
    return jsonResponse(
      { error: 'Unexpected error processing your message. Please try again.', code: 'INTERNAL_ERROR' },
      500
    );
  }
}
