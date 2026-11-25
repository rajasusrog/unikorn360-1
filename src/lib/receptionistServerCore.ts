import {
  CentralBusinessKnowledgeResponse,
  ReceptionistChatRequest,
  ReceptionistChatResponse,
  ReceptionistEnquiryRecord,
  ReceptionistEnquirySubmissionRequest,
  ReceptionistLeadStatus
} from '../types/receptionist';
import type { ServiceCatalogItem, ServiceDivision } from '../types/database';
import {
  assembleCentralBusinessKnowledge,
  generateDemoReceptionistReply,
  inferReceptionistMetadataFromConversation,
  sanitizePlainText
} from './receptionistKnowledge';

export const CLOUDFLARE_RECEPTIONIST_CHAT_URL =
  'https://inbox360-whatsapp-webhook.raj-asusrog.workers.dev/api/chat';

export interface ReceptionistRuntimeEnv {
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export class ReceptionistApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ReceptionistApiError';
    this.status = status;
    this.code = code;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateReferenceCode(): string {
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `U360-REC-${randomPart}`;
}

export function resolveWorkerSupabaseConfig(env: ReceptionistRuntimeEnv) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const isValidUrl =
    Boolean(url) &&
    url.startsWith('https://') &&
    !url.includes('example.com') &&
    !url.includes('your-project');

  const isPlaceholder = (v: string) =>
    !v || v.startsWith('your-') || v.includes('...') || v === 'sb_publishable_';

  const pubKeyCandidates = [
    env.SUPABASE_PUBLISHABLE_KEY,
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    env.SUPABASE_ANON_KEY,
    env.VITE_SUPABASE_ANON_KEY
  ];
  let publishableKey = '';
  for (const raw of pubKeyCandidates) {
    const val = (raw || '').trim();
    if (val && !val.startsWith('sb_secret_') && !isPlaceholder(val)) {
      publishableKey = val;
      break;
    }
  }

  let privilegedKey = '';
  const secretKey = (env.SUPABASE_SECRET_KEY || '').trim();
  const legacyRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (secretKey && !isPlaceholder(secretKey) && !secretKey.startsWith('sb_publishable_')) {
    privilegedKey = secretKey;
  } else if (
    legacyRoleKey &&
    !isPlaceholder(legacyRoleKey) &&
    !legacyRoleKey.startsWith('sb_publishable_')
  ) {
    privilegedKey = legacyRoleKey;
  }

  return {
    url,
    publishableKey,
    privilegedKey,
    isPrivilegedConfigured: Boolean(isValidUrl && privilegedKey),
    isAuthConfigured: Boolean(isValidUrl && (publishableKey || privilegedKey))
  };
}

export interface CloudflareWorkerChatPayload {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  turnstileToken: string;
}

export function buildCloudflareChatPayload(
  req: Pick<ReceptionistChatRequest, 'message' | 'history' | 'turnstileToken'>
): CloudflareWorkerChatPayload {
  const token = (req.turnstileToken || '').trim();
  return {
    message: req.message,
    history: req.history.slice(-14).map((turn) => ({
      role: turn.role,
      text: turn.content
    })),
    turnstileToken: token
  };
}

/**
 * Generates a UNIKORN360 receptionist reply using either Demo Mode
 * (only when explicitly requested) or Live AI routed strictly to the
 * UNIKORN360 Cloudflare Worker backend. Never fabricates AI responses
 * when the Cloudflare backend is unavailable or returns an error, and
 * never calls Live AI without a valid Turnstile token.
 */
export async function handleReceptionistChat(
  req: ReceptionistChatRequest,
  _env: ReceptionistRuntimeEnv,
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistChatResponse> {
  if (req.mode === 'demo') {
    return generateDemoReceptionistReply(req);
  }

  const upstreamPayload = buildCloudflareChatPayload(req);
  if (!upstreamPayload.turnstileToken) {
    throw new ReceptionistApiError(
      'Security verification (Cloudflare Turnstile) is required before contacting Live AI.',
      400,
      'TURNSTILE_TOKEN_REQUIRED'
    );
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetchImpl(CLOUDFLARE_RECEPTIONIST_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(upstreamPayload)
    });
  } catch (err) {
    console.error('Cloudflare AI backend network error:', err);
    throw new ReceptionistApiError(
      'Unable to connect to the UNIKORN360 Live AI service right now. Please try again or reach us on WhatsApp.',
      502,
      'CLOUDFLARE_NETWORK_ERROR'
    );
  }

  const data = (await upstreamRes.json().catch(() => null)) as {
    ok?: boolean;
    reply?: string;
    text?: string;
    model?: string;
    error?: string;
  } | null;

  if (!upstreamRes.ok || !data || data.ok !== true) {
    const upstreamMsg = sanitizePlainText(data?.error, 300);
    const status = upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 502;
    throw new ReceptionistApiError(
      upstreamMsg || 'The UNIKORN360 Live AI service is temporarily unavailable. Please try again shortly.',
      status,
      status === 429 ? 'CLOUDFLARE_RATE_LIMITED' : 'CLOUDFLARE_BACKEND_ERROR'
    );
  }

  const replyText = sanitizePlainText(data.reply || data.text, 4000);
  if (!replyText) {
    throw new ReceptionistApiError(
      'The UNIKORN360 Live AI service returned an empty reply. Please try again.',
      502,
      'CLOUDFLARE_EMPTY_REPLY'
    );
  }

  const inferred = inferReceptionistMetadataFromConversation(
    req.message,
    replyText,
    req.quickActionId,
    req.collectedDraft
  );

  return {
    reply: replyText,
    mode: 'live',
    simulated: false,
    detectedLanguage: inferred.detectedLanguage,
    recommendedLinks: inferred.recommendedLinks,
    extractedFields: inferred.extractedFields,
    suggestEnquiryForm: inferred.suggestEnquiryForm,
    suggestHumanHandover: inferred.suggestHumanHandover,
    model: sanitizePlainText(data.model, 80) || 'gemini-3.8-flash'
  };
}

// ====================================================================
// CENTRAL BUSINESS KNOWLEDGE ENGINE FETCHER (SUPABASE + SEED FALLBACK)
// ====================================================================
const KNOWLEDGE_DIVISION_COLUMNS = [
  'id',
  'name',
  'slug',
  'short_description',
  'full_description',
  'seo_title',
  'seo_description',
  'status',
  'display_order',
  'icon_name',
  'created_at',
  'updated_at'
].join(',');

const KNOWLEDGE_SERVICE_COLUMNS = [
  'id',
  'division_id',
  'service_name',
  'slug',
  'short_description',
  'full_description',
  'problems_solved',
  'target_customers',
  'benefits',
  'deliverables',
  'packages',
  'faqs',
  'service_type',
  'status',
  'display_order',
  'published_at',
  'created_at',
  'updated_at'
].join(',');

export async function fetchCentralBusinessKnowledge(
  env: ReceptionistRuntimeEnv,
  fetchImpl: typeof fetch = fetch
): Promise<CentralBusinessKnowledgeResponse> {
  const cfg = resolveWorkerSupabaseConfig(env);
  const readKey = cfg.publishableKey || cfg.privilegedKey;

  if (!cfg.isAuthConfigured || !readKey) {
    return assembleCentralBusinessKnowledge({ catalogSource: 'canonical_seed' });
  }

  try {
    const headers = {
      apikey: readKey,
      Authorization: `Bearer ${readKey}`
    };

    const [divRes, svcRes] = await Promise.all([
      fetchImpl(
        `${cfg.url}/rest/v1/service_divisions?select=${KNOWLEDGE_DIVISION_COLUMNS}&status=eq.published&order=display_order.asc`,
        { method: 'GET', headers }
      ),
      fetchImpl(
        `${cfg.url}/rest/v1/service_catalog?select=${KNOWLEDGE_SERVICE_COLUMNS}&status=eq.published&order=display_order.asc`,
        { method: 'GET', headers }
      )
    ]);

    if (!divRes.ok || !svcRes.ok) {
      return assembleCentralBusinessKnowledge({ catalogSource: 'canonical_seed' });
    }

    const divRows = (await divRes.json().catch(() => null)) as ServiceDivision[] | null;
    const svcRows = (await svcRes.json().catch(() => null)) as ServiceCatalogItem[] | null;

    if (
      !Array.isArray(divRows) ||
      !Array.isArray(svcRows) ||
      divRows.length === 0 ||
      svcRows.length === 0
    ) {
      return assembleCentralBusinessKnowledge({ catalogSource: 'canonical_seed' });
    }

    const assembled = assembleCentralBusinessKnowledge({
      divisions: divRows,
      services: svcRows,
      catalogSource: 'supabase_published'
    });

    if (assembled.divisions.length === 0 || assembled.services.length === 0) {
      return assembleCentralBusinessKnowledge({ catalogSource: 'canonical_seed' });
    }

    return assembled;
  } catch (err) {
    console.warn('Central knowledge Supabase fetch fell back to canonical seed:', err);
    return assembleCentralBusinessKnowledge({ catalogSource: 'canonical_seed' });
  }
}

// ====================================================================
// SUPABASE REST STORAGE HELPERS (CLOUDFLARE WORKER + NODE COMPATIBLE)
// ====================================================================
export interface SupabaseWriteResult {
  record: ReceptionistEnquiryRecord;
  storage: 'supabase' | 'preview_memory';
}

export async function insertEnquiryIntoSupabaseRest(
  submission: ReceptionistEnquirySubmissionRequest,
  env: ReceptionistRuntimeEnv
): Promise<{ ok: true; record: ReceptionistEnquiryRecord } | { ok: false; tableMissing?: boolean; unconfigured?: boolean; error: string }> {
  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    return {
      ok: false,
      unconfigured: true,
      error: 'Supabase server credentials are not configured.'
    };
  }

  const referenceCode = generateReferenceCode();
  const payload = {
    reference_code: referenceCode,
    session_id: submission.sessionId,
    source_mode: submission.sourceMode,
    detected_language: submission.detectedLanguage,
    page_url: submission.pageUrl || '/',
    customer_name: submission.enquiry.customerName,
    business_name: submission.enquiry.businessName || null,
    contact_number: submission.enquiry.contactNumber,
    email: submission.enquiry.email,
    service_required: submission.enquiry.serviceRequired,
    project_description: submission.enquiry.projectDescription,
    budget_range: submission.enquiry.budgetRange || null,
    expected_timeline: submission.enquiry.expectedTimeline || null,
    lead_status: 'new' as ReceptionistLeadStatus,
    follow_up_required: true,
    conversation_history: submission.conversationHistory
  };

  const res = await fetch(`${cfg.url}/rest/v1/receptionist_enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.privilegedKey,
      Authorization: `Bearer ${cfg.privilegedKey}`,
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const tableMissing =
      res.status === 404 || /42P01|PGRST205|does not exist|Could not find the table/i.test(errText);
    return {
      ok: false,
      tableMissing,
      error: tableMissing
        ? 'The receptionist_enquiries table is not yet migrated in Supabase.'
        : `Supabase insert failed (${res.status}).`
    };
  }

  const rows = (await res.json()) as ReceptionistEnquiryRecord[];
  const record = Array.isArray(rows) ? rows[0] : (rows as unknown as ReceptionistEnquiryRecord);
  return { ok: true, record };
}

export async function listEnquiriesFromSupabaseRest(
  env: ReceptionistRuntimeEnv
): Promise<{ ok: true; enquiries: ReceptionistEnquiryRecord[] } | { ok: false; tableMissing?: boolean; unconfigured?: boolean; error: string }> {
  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    return {
      ok: false,
      unconfigured: true,
      error: 'Supabase server credentials are not configured.'
    };
  }

  const res = await fetch(
    `${cfg.url}/rest/v1/receptionist_enquiries?select=*&order=created_at.desc&limit=250`,
    {
      method: 'GET',
      headers: {
        apikey: cfg.privilegedKey,
        Authorization: `Bearer ${cfg.privilegedKey}`
      }
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const tableMissing =
      res.status === 404 || /42P01|PGRST205|does not exist|Could not find the table/i.test(errText);
    return {
      ok: false,
      tableMissing,
      error: tableMissing
        ? 'Run migration 20261125_ai_receptionist_enquiries.sql in Supabase to enable permanent enquiry storage.'
        : `Failed to fetch receptionist enquiries (${res.status}).`
    };
  }

  const rows = (await res.json()) as ReceptionistEnquiryRecord[];
  return { ok: true, enquiries: Array.isArray(rows) ? rows : [] };
}

export async function updateEnquiryInSupabaseRest(
  enquiryId: string,
  updates: {
    lead_status?: ReceptionistLeadStatus;
    follow_up_required?: boolean;
    follow_up_notes?: string | null;
    follow_up_date?: string | null;
  },
  env: ReceptionistRuntimeEnv
): Promise<{ ok: true; record: ReceptionistEnquiryRecord } | { ok: false; status?: number; tableMissing?: boolean; unconfigured?: boolean; error: string }> {
  if (!UUID_REGEX.test(enquiryId)) {
    return { ok: false, status: 400, error: 'Invalid enquiry ID format.' };
  }

  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    return {
      ok: false,
      unconfigured: true,
      error: 'Supabase server credentials are not configured.'
    };
  }

  const res = await fetch(
    `${cfg.url}/rest/v1/receptionist_enquiries?id=eq.${encodeURIComponent(enquiryId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.privilegedKey,
        Authorization: `Bearer ${cfg.privilegedKey}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const tableMissing =
      res.status === 404 || /42P01|PGRST205|does not exist|Could not find the table/i.test(errText);
    return {
      ok: false,
      status: res.status,
      tableMissing,
      error: tableMissing
        ? 'The receptionist_enquiries table is not yet migrated in Supabase.'
        : `Failed to update enquiry (${res.status}).`
    };
  }

  const rows = (await res.json()) as ReceptionistEnquiryRecord[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, status: 404, error: 'Enquiry not found.' };
  }
  return { ok: true, record: rows[0] };
}

export async function verifySupabaseAdminBearerToken(
  authHeader: string | null,
  env: ReceptionistRuntimeEnv
): Promise<
  | { ok: true; user: { id: string; email: string }; role: 'superadmin' | 'admin' | 'evaluator' }
  | { ok: false; status: number; error: string }
> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing administrator authentication token.' };
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false, status: 401, error: 'Empty administrator authentication token.' };
  }

  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isAuthConfigured || !cfg.isPrivilegedConfigured) {
    return { ok: false, status: 503, error: 'Supabase authentication is not configured.' };
  }

  const userRes = await fetch(`${cfg.url}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: cfg.publishableKey || cfg.privilegedKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userRes.ok) {
    return { ok: false, status: 401, error: 'Invalid or expired administrator session.' };
  }

  const userData = (await userRes.json()) as { id?: string; email?: string };
  if (!userData?.id || !UUID_REGEX.test(userData.id)) {
    return { ok: false, status: 401, error: 'Unable to verify administrator identity.' };
  }

  const roleRes = await fetch(
    `${cfg.url}/rest/v1/creator_admin_users?select=role&authenticated_user_id=eq.${encodeURIComponent(userData.id)}&limit=1`,
    {
      method: 'GET',
      headers: {
        apikey: cfg.privilegedKey,
        Authorization: `Bearer ${cfg.privilegedKey}`
      }
    }
  );

  if (!roleRes.ok) {
    return { ok: false, status: 403, error: 'Unable to verify administrator role.' };
  }

  const roleRows = (await roleRes.json()) as Array<{ role?: string }>;
  const role = roleRows?.[0]?.role;
  if (role !== 'superadmin' && role !== 'admin' && role !== 'evaluator') {
    return { ok: false, status: 403, error: 'Administrator privileges are required.' };
  }

  return {
    ok: true,
    user: { id: userData.id, email: userData.email || '' },
    role
  };
}

export function computeEnquiryStats(enquiries: ReceptionistEnquiryRecord[]) {
  let newLeads = 0;
  let followUpRequired = 0;
  let qualifiedOrWon = 0;

  for (const item of enquiries) {
    if (item.lead_status === 'new') newLeads += 1;
    if (item.follow_up_required || item.lead_status === 'follow_up') followUpRequired += 1;
    if (item.lead_status === 'qualified' || item.lead_status === 'won') qualifiedOrWon += 1;
  }

  return {
    total: enquiries.length,
    newLeads,
    followUpRequired,
    qualifiedOrWon
  };
}

export function buildInMemoryEnquiryRecord(
  submission: ReceptionistEnquirySubmissionRequest
): ReceptionistEnquiryRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    reference_code: generateReferenceCode(),
    session_id: submission.sessionId,
    source_mode: submission.sourceMode,
    detected_language: submission.detectedLanguage,
    page_url: submission.pageUrl || '/',
    customer_name: submission.enquiry.customerName,
    business_name: submission.enquiry.businessName || null,
    contact_number: submission.enquiry.contactNumber,
    email: submission.enquiry.email,
    service_required: submission.enquiry.serviceRequired,
    project_description: submission.enquiry.projectDescription,
    budget_range: submission.enquiry.budgetRange || null,
    expected_timeline: submission.enquiry.expectedTimeline || null,
    lead_status: 'new',
    follow_up_required: true,
    follow_up_notes: null,
    follow_up_date: null,
    conversation_history: submission.conversationHistory,
    created_at: now,
    updated_at: now
  };
}
