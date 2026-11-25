import { createSlidingWindowRateLimiter } from '../../../src/lib/receptionistKnowledge';
import {
  fetchCentralBusinessKnowledge,
  ReceptionistRuntimeEnv
} from '../../../src/lib/receptionistServerCore';

const checkKnowledgeRateLimit = createSlidingWindowRateLimiter(60, 60_000);

const PUBLIC_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
  headOnly = false
): Response {
  return new Response(headOnly ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...PUBLIC_CORS_HEADERS,
      ...(extraHeaders || {})
    }
  });
}

export function onRequestOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...PUBLIC_CORS_HEADERS,
      'Access-Control-Max-Age': '86400'
    }
  });
}

async function handleKnowledgeRequest(
  context: {
    request: Request;
    env: ReceptionistRuntimeEnv;
  },
  headOnly: boolean
): Promise<Response> {
  const { request, env } = context;

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';

  const rate = checkKnowledgeRateLimit(`knowledge:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        ok: false,
        error: `Too many knowledge requests. Please wait ${rate.retryAfterSeconds} seconds and try again.`,
        code: 'RATE_LIMITED',
        retryAfterSeconds: rate.retryAfterSeconds
      },
      429,
      {
        'Cache-Control': 'no-store',
        'Retry-After': String(rate.retryAfterSeconds)
      },
      headOnly
    );
  }

  try {
    const knowledge = await fetchCentralBusinessKnowledge(env);
    return jsonResponse(
      knowledge,
      200,
      {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      },
      headOnly
    );
  } catch (err) {
    console.error('Cloudflare Worker /api/receptionist/knowledge error:', err);
    return jsonResponse(
      {
        ok: false,
        error: 'Unable to load UNIKORN360 central business knowledge right now.',
        code: 'KNOWLEDGE_UNAVAILABLE'
      },
      500,
      { 'Cache-Control': 'no-store' },
      headOnly
    );
  }
}

export async function onRequestGet(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  return handleKnowledgeRequest(context, false);
}

export async function onRequestHead(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  return handleKnowledgeRequest(context, true);
}
