import { validateAdminEnquiryUpdatePayload } from '../../../src/lib/receptionistKnowledge';
import {
  computeEnquiryStats,
  listEnquiriesFromSupabaseRest,
  ReceptionistRuntimeEnv,
  updateEnquiryInSupabaseRest,
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

  const result = await listEnquiriesFromSupabaseRest(env);
  if (result.ok === false) {
    return jsonResponse({ error: result.error }, result.tableMissing ? 503 : 500);
  }

  return jsonResponse({
    enquiries: result.enquiries,
    storage: 'supabase',
    stats: computeEnquiryStats(result.enquiries)
  });
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
    return jsonResponse({ error: 'Only admin or superadmin users can update lead statuses.' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
  }

  const url = new URL(request.url);
  const enquiryId = String(url.searchParams.get('id') || body.id || '').trim();
  if (!enquiryId) {
    return jsonResponse({ error: 'Enquiry id is required.' }, 400);
  }

  const validation = validateAdminEnquiryUpdatePayload(body);
  if (validation.ok === false) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const updated = await updateEnquiryInSupabaseRest(enquiryId, validation.data, env);
  if (updated.ok === false) {
    return jsonResponse({ error: updated.error }, updated.status || 500);
  }

  return jsonResponse({
    success: true,
    enquiry: updated.record
  });
}
