import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  ReceptionistChatRequest,
  ReceptionistChatResponse,
  ReceptionistEnquiryDraft,
  ReceptionistEnquiryRecord,
  ReceptionistEnquirySubmissionRequest,
  ReceptionistLanguage,
  ReceptionistLeadStatus
} from '../types/receptionist';
import {
  buildReceptionistSystemPrompt,
  detectMessageLanguage,
  extractBasicLeadFieldsFromText,
  generateDemoReceptionistReply,
  sanitizePlainText,
  sanitizeRecommendedLinks
} from './receptionistKnowledge';

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

const GEMINI_RECEPTIONIST_MODEL = 'gemini-4-hydrogen';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

/**
 * Generates a grounded UNIKORN360 receptionist reply using either Demo Mode
 * (only when explicitly requested) or Live Gemini API (`gemini-4-hydrogen`).
 */
export async function handleReceptionistChat(
  req: ReceptionistChatRequest,
  env: ReceptionistRuntimeEnv
): Promise<ReceptionistChatResponse> {
  if (req.mode === 'demo') {
    return generateDemoReceptionistReply(req);
  }

  const apiKey = (env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new ReceptionistApiError(
      'Live Gemini AI is not configured on the server yet. You can switch to Demo Mode to preview responses or contact UNIKORN360 on WhatsApp.',
      503,
      'GEMINI_NOT_CONFIGURED'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const systemInstruction = buildReceptionistSystemPrompt(req.currentPage, req.collectedDraft);

  const contents = [
    ...req.history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }]
    })),
    {
      role: 'user',
      parts: [{ text: req.message }]
    }
  ];

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description:
          'Helpful, concise receptionist reply in the visitor language (English, Tamil, Tanglish, or Hindi). Never invent prices or commitments.'
      },
      detectedLanguage: {
        type: Type.STRING,
        description: 'One of: en, ta, tanglish, hi'
      },
      recommendedLinks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            path: { type: Type.STRING }
          },
          required: ['label', 'path']
        }
      },
      extractedFields: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING },
          businessName: { type: Type.STRING },
          contactNumber: { type: Type.STRING },
          email: { type: Type.STRING },
          serviceRequired: { type: Type.STRING },
          projectDescription: { type: Type.STRING },
          budgetRange: { type: Type.STRING },
          expectedTimeline: { type: Type.STRING }
        }
      },
      suggestEnquiryForm: {
        type: Type.BOOLEAN
      },
      suggestHumanHandover: {
        type: Type.BOOLEAN
      }
    },
    required: ['reply', 'detectedLanguage', 'recommendedLinks', 'suggestEnquiryForm', 'suggestHumanHandover']
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_RECEPTIONIST_MODEL,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW
          },
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new ReceptionistApiError(
          'The AI receptionist returned an empty reply. Please try again.',
          502,
          'EMPTY_AI_RESPONSE'
        );
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Fallback if model returned plain prose despite schema
        parsed = {
          reply: rawText,
          detectedLanguage: detectMessageLanguage(req.message),
          recommendedLinks: [],
          extractedFields: extractBasicLeadFieldsFromText(req.message),
          suggestEnquiryForm: false,
          suggestHumanHandover: false
        };
      }

      const replyText = sanitizePlainText(parsed.reply, 2400);
      if (!replyText) {
        throw new ReceptionistApiError(
          'The AI receptionist could not formulate a response. Please try again.',
          502,
          'EMPTY_AI_RESPONSE'
        );
      }

      const rawLang = String(parsed.detectedLanguage || '').toLowerCase();
      const detectedLanguage: ReceptionistLanguage =
        rawLang === 'ta' || rawLang === 'tanglish' || rawLang === 'hi' || rawLang === 'en'
          ? (rawLang as ReceptionistLanguage)
          : detectMessageLanguage(req.message);

      const rawExtracted =
        parsed.extractedFields && typeof parsed.extractedFields === 'object'
          ? (parsed.extractedFields as Record<string, unknown>)
          : {};
      const heuristicFields = extractBasicLeadFieldsFromText(req.message);
      const extractedFields: Partial<ReceptionistEnquiryDraft> = {};

      const fieldKeys: Array<keyof ReceptionistEnquiryDraft> = [
        'customerName',
        'businessName',
        'contactNumber',
        'email',
        'serviceRequired',
        'projectDescription',
        'budgetRange',
        'expectedTimeline'
      ];
      for (const key of fieldKeys) {
        const val = sanitizePlainText(rawExtracted[key], key === 'projectDescription' ? 1200 : 160);
        if (val) {
          extractedFields[key] = val;
        } else if (heuristicFields[key]) {
          extractedFields[key] = heuristicFields[key];
        }
      }

      return {
        reply: replyText,
        mode: 'live',
        simulated: false,
        detectedLanguage,
        recommendedLinks: sanitizeRecommendedLinks(parsed.recommendedLinks),
        extractedFields,
        suggestEnquiryForm: Boolean(parsed.suggestEnquiryForm),
        suggestHumanHandover: Boolean(parsed.suggestHumanHandover),
        model: GEMINI_RECEPTIONIST_MODEL
      };
    } catch (err: unknown) {
      lastError = err;
      const errObj = err as { status?: number; message?: string };
      const status = Number(errObj?.status || 0);
      const msg = String(errObj?.message || '');

      if (status === 400 || status === 401 || status === 403 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(msg)) {
        throw new ReceptionistApiError(
          'Live AI credentials could not be verified. Please verify GEMINI_API_KEY in server secrets, or switch to Demo Mode.',
          502,
          'GEMINI_AUTH_ERROR'
        );
      }
      if (status === 429 || /RESOURCE_EXHAUSTED/i.test(msg)) {
        throw new ReceptionistApiError(
          'Live AI is temporarily busy due to quota limits. Please wait a moment and retry, or contact us on WhatsApp.',
          429,
          'GEMINI_QUOTA_EXCEEDED'
        );
      }
      if (status === 404 || /NOT_FOUND/i.test(msg)) {
        throw new ReceptionistApiError(
          'The configured AI model is temporarily unavailable. Please retry shortly or contact UNIKORN360 on WhatsApp.',
          502,
          'GEMINI_MODEL_UNAVAILABLE'
        );
      }

      if (attempt < 2) {
        await sleep(300 * (attempt + 1));
        continue;
      }
    }
  }

  console.error('Gemini receptionist request failed:', lastError);
  throw new ReceptionistApiError(
    'Unable to reach the live AI receptionist right now. Please try again or reach UNIKORN360 directly on WhatsApp.',
    502,
    'GEMINI_UPSTREAM_ERROR'
  );
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
