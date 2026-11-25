import {
  sanitizePlainText,
  validateAdminConversationUpdatePayload
} from '../../../src/lib/receptionistKnowledge';
import {
  getAdminConversationDetail,
  listAdminConversations,
  updateAdminConversation
} from '../../../src/lib/receptionistConversationStore';
import {
  ReceptionistApiError,
  ReceptionistRuntimeEnv,
  verifySupabaseAdminBearerToken
} from '../../../src/lib/receptionistServerCore';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestGet(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;

  const auth = await verifySupabaseAdminBearerToken(request.headers.get('Authorization'), env);
  if (auth.ok === false) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  const url = new URL(request.url);
  const conversationId = sanitizePlainText(url.searchParams.get('id'), 64);

  try {
    if (conversationId) {
      const detail = await getAdminConversationDetail(conversationId, env);
      return jsonResponse(detail, 200);
    }

    const list = await listAdminConversations(
      {
        channel: sanitizePlainText(url.searchParams.get('channel'), 32) || undefined,
        mode: sanitizePlainText(url.searchParams.get('mode'), 32) || undefined,
        status: sanitizePlainText(url.searchParams.get('status'), 32) || undefined,
        language: sanitizePlainText(url.searchParams.get('language'), 32) || undefined,
        search: sanitizePlainText(url.searchParams.get('search'), 160) || undefined
      },
      env
    );
    return jsonResponse(list, 200);
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      return jsonResponse({ error: err.message, code: err.code }, err.status);
    }
    console.error('GET /api/admin/receptionist-conversations error:', err);
    return jsonResponse({ error: 'Failed to load customer conversations.' }, 500);
  }
}

export async function onRequestPatch(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;

  const auth = await verifySupabaseAdminBearerToken(request.headers.get('Authorization'), env);
  if (auth.ok === false) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  if (auth.role !== 'superadmin' && auth.role !== 'admin') {
    return jsonResponse(
      { error: 'Only admin or superadmin users can update conversation assignments or statuses.' },
      403
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
  }

  const url = new URL(request.url);
  const conversationId = String(url.searchParams.get('id') || body.id || '').trim();
  if (!conversationId) {
    return jsonResponse({ error: 'Conversation id is required.' }, 400);
  }

  const validation = validateAdminConversationUpdatePayload(body);
  if (validation.ok === false) {
    return jsonResponse({ error: validation.error }, 400);
  }

  try {
    const conversation = await updateAdminConversation(conversationId, validation.data, env);
    return jsonResponse({ success: true, conversation }, 200);
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      return jsonResponse({ error: err.message, code: err.code }, err.status);
    }
    console.error('PATCH /api/admin/receptionist-conversations error:', err);
    return jsonResponse({ error: 'Failed to update conversation.' }, 500);
  }
}
