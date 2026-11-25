import {
  createSlidingWindowRateLimiter,
  normalizeReceptionistChannel,
  sanitizePlainText,
  validatePersistMessagesPayload
} from '../../../src/lib/receptionistKnowledge';
import {
  hydrateVisitorSessionMessages,
  persistConversationMessages
} from '../../../src/lib/receptionistConversationStore';
import {
  ReceptionistApiError,
  ReceptionistRuntimeEnv
} from '../../../src/lib/receptionistServerCore';

const checkMessagePersistRateLimit = createSlidingWindowRateLimiter(30, 60_000);
const checkSessionHydrateRateLimit = createSlidingWindowRateLimiter(40, 60_000);
const SAFE_TOKEN_REGEX = /^[a-zA-Z0-9_.:-]{16,128}$/;
const SAFE_SESSION_REGEX = /^[a-zA-Z0-9_.:-]{4,80}$/;

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

function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export async function onRequestGet(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;
  const clientIp = getClientIp(request);
  const rate = checkSessionHydrateRateLimit(`hydrate:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        error: `Too many requests. Please wait ${rate.retryAfterSeconds} seconds.`,
        code: 'RATE_LIMITED'
      },
      429,
      { 'Retry-After': String(rate.retryAfterSeconds) }
    );
  }

  const url = new URL(request.url);
  const sessionId = sanitizePlainText(url.searchParams.get('sessionId'), 80);
  const sessionToken = sanitizePlainText(
    request.headers.get('X-Receptionist-Session-Token'),
    128
  );
  const sourceChannel = normalizeReceptionistChannel(url.searchParams.get('sourceChannel'), 'website');
  const sourceMode = url.searchParams.get('sourceMode') === 'demo' ? 'demo' : 'live';

  if (!sessionId || !SAFE_SESSION_REGEX.test(sessionId)) {
    return jsonResponse({ error: 'A valid sessionId query parameter is required.', code: 'VALIDATION_ERROR' }, 400);
  }

  if (!sessionToken || !SAFE_TOKEN_REGEX.test(sessionToken)) {
    return jsonResponse(
      { error: 'A valid X-Receptionist-Session-Token header is required.', code: 'SESSION_TOKEN_REQUIRED' },
      401
    );
  }

  try {
    const result = await hydrateVisitorSessionMessages(
      {
        sessionId,
        sessionToken,
        sourceChannel,
        sourceMode
      },
      env
    );
    return jsonResponse(result, 200);
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      return jsonResponse({ error: err.message, code: err.code }, err.status);
    }
    console.error('GET /api/receptionist/messages error:', err);
    return jsonResponse({ error: 'Unable to restore session conversation.' }, 500);
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;
  const clientIp = getClientIp(request);
  const rate = checkMessagePersistRateLimit(`persist:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        error: `Too many requests. Please wait ${rate.retryAfterSeconds} seconds.`,
        code: 'RATE_LIMITED'
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

  const validation = validatePersistMessagesPayload(body);
  if (validation.ok === false) {
    return jsonResponse({ error: validation.error, code: 'VALIDATION_ERROR' }, 400);
  }

  try {
    const result = await persistConversationMessages(validation.data, env);
    return jsonResponse(result, 200);
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      return jsonResponse({ error: err.message, code: err.code }, err.status);
    }
    console.error('POST /api/receptionist/messages error:', err);
    return jsonResponse({ error: 'Failed to persist conversation messages.' }, 500);
  }
}
