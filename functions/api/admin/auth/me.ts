import {
  ReceptionistRuntimeEnv,
  verifySupabaseAdminBearerToken
} from '../../../../src/lib/receptionistServerCore';

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

  return jsonResponse({
    user: {
      id: auth.user.id,
      email: auth.user.email
    },
    role: auth.role
  });
}
