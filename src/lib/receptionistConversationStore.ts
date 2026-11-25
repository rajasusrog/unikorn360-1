import {
  ReceptionistAdminAssigneeOption,
  ReceptionistAdminConversationDetailResponse,
  ReceptionistAdminConversationsListResponse,
  ReceptionistConversationRecord,
  ReceptionistConversationStatus,
  ReceptionistLanguage,
  ReceptionistMessageRecord,
  ReceptionistMode,
  ReceptionistPersistTurnRequest,
  ReceptionistPersistTurnResponse,
  ReceptionistSessionHydrationMessage,
  ReceptionistSessionHydrationResponse,
  ReceptionistSourceChannel
} from '../types/receptionist';
import {
  normalizeReceptionistChannel,
  normalizeReceptionistLanguage,
  sanitizeConversationMetadata,
  sanitizePlainText
} from './receptionistKnowledge';
import {
  ReceptionistApiError,
  ReceptionistRuntimeEnv,
  resolveWorkerSupabaseConfig
} from './receptionistServerCore';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CONVERSATION_PUBLIC_COLUMNS = [
  'id',
  'session_id',
  'source_channel',
  'source_mode',
  'customer_identifier',
  'detected_language',
  'current_page',
  'conversation_status',
  'assigned_employee',
  'enquiry_id',
  'created_at',
  'updated_at',
  'last_message_at'
].join(',');

const CONVERSATION_INTERNAL_COLUMNS = `${CONVERSATION_PUBLIC_COLUMNS},session_token_hash`;

const MESSAGE_COLUMNS = [
  'id',
  'conversation_id',
  'message_id',
  'sender_type',
  'message_content',
  'message_metadata',
  'ai_model',
  'delivery_status',
  'created_at'
].join(',');

interface StoredMemoryConversation extends ReceptionistConversationRecord {
  session_token_hash: string | null;
}

const memoryConversations = new Map<string, StoredMemoryConversation>();
const memoryMessagesByConversation = new Map<string, ReceptionistMessageRecord[]>();

export function clearPreviewConversationStore(): void {
  memoryConversations.clear();
  memoryMessagesByConversation.clear();
}

function makeConversationKey(
  sessionId: string,
  channel: ReceptionistSourceChannel,
  mode: ReceptionistMode
): string {
  return `${channel}:${mode}:${sessionId}`;
}

export async function hashSessionToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isProductionRuntime(env: ReceptionistRuntimeEnv & { NODE_ENV?: string }): boolean {
  if (typeof env.NODE_ENV === 'string') {
    return env.NODE_ENV === 'production';
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === 'production';
  }
  return false;
}

function isPreviewFallbackAllowed(env: ReceptionistRuntimeEnv & { NODE_ENV?: string }): boolean {
  if (typeof process !== 'undefined' && process.env?.DISABLE_TEST_MEMORY_FALLBACK === 'true') {
    return false;
  }
  return !isProductionRuntime(env);
}

function stripInternalConversationFields(
  row: StoredMemoryConversation | (ReceptionistConversationRecord & { session_token_hash?: unknown })
): ReceptionistConversationRecord {
  return {
    id: row.id,
    session_id: row.session_id,
    source_channel: normalizeReceptionistChannel(row.source_channel),
    source_mode: row.source_mode === 'demo' ? 'demo' : 'live',
    customer_identifier: row.customer_identifier || null,
    detected_language: normalizeReceptionistLanguage(row.detected_language),
    current_page: row.current_page || '/',
    conversation_status: row.conversation_status || 'active',
    assigned_employee: row.assigned_employee || null,
    enquiry_id: row.enquiry_id || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_at: row.last_message_at,
    message_count: row.message_count,
    last_message_preview: row.last_message_preview,
    enquiry_reference_code: row.enquiry_reference_code
  };
}

function isMissingRelationResponse(status: number, bodyText: string): boolean {
  return status === 404 || /42P01|PGRST205|does not exist|Could not find the table/i.test(bodyText);
}

export async function persistConversationMessages(
  payload: ReceptionistPersistTurnRequest,
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistPersistTurnResponse> {
  const cfg = resolveWorkerSupabaseConfig(env);
  const tokenHash = await hashSessionToken(payload.sessionToken);
  const nowIso = new Date().toISOString();

  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) {
      throw new ReceptionistApiError(
        'Supabase server credentials are not configured for conversation storage.',
        503,
        'STORAGE_UNAVAILABLE'
      );
    }
    return persistInMemory(payload, tokenHash, nowIso);
  }

  const headers = {
    'Content-Type': 'application/json',
    apikey: cfg.privilegedKey,
    Authorization: `Bearer ${cfg.privilegedKey}`
  };

  // 1. Lookup existing thread by unique (session_id, source_channel, source_mode)
  const lookupUrl =
    `${cfg.url}/rest/v1/receptionist_conversations` +
    `?select=${CONVERSATION_INTERNAL_COLUMNS}` +
    `&session_id=eq.${encodeURIComponent(payload.sessionId)}` +
    `&source_channel=eq.${encodeURIComponent(payload.sourceChannel)}` +
    `&source_mode=eq.${encodeURIComponent(payload.sourceMode)}` +
    `&limit=1`;

  const existingRes = await fetchImpl(lookupUrl, { method: 'GET', headers });
  if (!existingRes.ok) {
    const errText = await existingRes.text().catch(() => '');
    if (isMissingRelationResponse(existingRes.status, errText) && isPreviewFallbackAllowed(env)) {
      return persistInMemory(payload, tokenHash, nowIso);
    }
    throw new ReceptionistApiError(
      isMissingRelationResponse(existingRes.status, errText)
        ? 'Run migration 20261126_ai_receptionist_conversations.sql to enable conversation storage.'
        : `Failed to query receptionist conversation (${existingRes.status}).`,
      503,
      'MIGRATION_REQUIRED'
    );
  }

  const existingRows = (await existingRes.json().catch(() => [])) as Array<
    ReceptionistConversationRecord & { session_token_hash?: string | null }
  >;
  let conversation = Array.isArray(existingRows) ? existingRows[0] : undefined;

  if (conversation) {
    if (
      conversation.session_token_hash &&
      !timingSafeEqualHex(conversation.session_token_hash, tokenHash)
    ) {
      throw new ReceptionistApiError(
        'Invalid session verification token for this conversation.',
        403,
        'INVALID_SESSION_TOKEN'
      );
    }

    const patchBody: Record<string, unknown> = {
      detected_language: payload.detectedLanguage,
      current_page: payload.currentPage || conversation.current_page || '/',
      updated_at: nowIso
    };
    if (!conversation.session_token_hash) {
      patchBody.session_token_hash = tokenHash;
    }
    if (payload.customerIdentifier && !conversation.customer_identifier) {
      patchBody.customer_identifier = payload.customerIdentifier;
    }

    await fetchImpl(
      `${cfg.url}/rest/v1/receptionist_conversations?id=eq.${encodeURIComponent(conversation.id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(patchBody)
      }
    );
  } else {
    const insertConvRes = await fetchImpl(
      `${cfg.url}/rest/v1/receptionist_conversations?on_conflict=session_id,source_channel,source_mode`,
      {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({
          session_id: payload.sessionId,
          source_channel: payload.sourceChannel,
          source_mode: payload.sourceMode,
          customer_identifier: payload.customerIdentifier || null,
          detected_language: payload.detectedLanguage,
          current_page: payload.currentPage || '/',
          conversation_status: 'active',
          session_token_hash: tokenHash,
          last_message_at: nowIso
        })
      }
    );

    if (!insertConvRes.ok) {
      const errText = await insertConvRes.text().catch(() => '');
      throw new ReceptionistApiError(
        `Failed to create conversation record (${insertConvRes.status}): ${sanitizePlainText(errText, 120)}`,
        502,
        'CONVERSATION_PERSIST_FAILED'
      );
    }

    const createdRows = (await insertConvRes.json().catch(() => [])) as Array<
      ReceptionistConversationRecord & { session_token_hash?: string | null }
    >;
    conversation = Array.isArray(createdRows) ? createdRows[0] : undefined;
    if (!conversation) {
      throw new ReceptionistApiError(
        'Conversation record could not be initialized.',
        502,
        'CONVERSATION_PERSIST_FAILED'
      );
    }
  }

  // 2. Idempotently insert each message using unique (conversation_id, message_id)
  const savedMessageIds: string[] = [];
  const duplicateSkippedIds: string[] = [];

  for (const msg of payload.messages) {
    const insertMsgRes = await fetchImpl(
      `${cfg.url}/rest/v1/receptionist_messages?on_conflict=conversation_id,message_id`,
      {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=ignore-duplicates,return=representation'
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          message_id: msg.messageId,
          sender_type: msg.senderType,
          message_content: msg.messageContent,
          message_metadata: sanitizeConversationMetadata(msg.messageMetadata),
          ai_model: msg.aiModel || null,
          delivery_status:
            msg.deliveryStatus || (msg.senderType === 'customer' ? 'received' : 'delivered')
        })
      }
    );

    if (!insertMsgRes.ok) {
      const errText = await insertMsgRes.text().catch(() => '');
      throw new ReceptionistApiError(
        `Failed to save conversation message (${insertMsgRes.status}): ${sanitizePlainText(errText, 120)}`,
        502,
        'MESSAGE_PERSIST_FAILED'
      );
    }

    const inserted = (await insertMsgRes.json().catch(() => [])) as ReceptionistMessageRecord[];
    if (Array.isArray(inserted) && inserted.length > 0) {
      savedMessageIds.push(msg.messageId);
    } else {
      duplicateSkippedIds.push(msg.messageId);
    }
  }

  return {
    ok: true,
    conversationId: conversation.id,
    storage: 'supabase',
    savedMessageIds,
    duplicateSkippedIds,
    lastMessageAt: nowIso
  };
}

function persistInMemory(
  payload: ReceptionistPersistTurnRequest,
  tokenHash: string,
  nowIso: string
): ReceptionistPersistTurnResponse {
  const key = makeConversationKey(payload.sessionId, payload.sourceChannel, payload.sourceMode);
  let conv = memoryConversations.get(key);

  if (conv) {
    if (conv.session_token_hash && !timingSafeEqualHex(conv.session_token_hash, tokenHash)) {
      throw new ReceptionistApiError(
        'Invalid session verification token for this conversation.',
        403,
        'INVALID_SESSION_TOKEN'
      );
    }
    if (!conv.session_token_hash) {
      conv.session_token_hash = tokenHash;
    }
    conv.detected_language = payload.detectedLanguage;
    conv.current_page = payload.currentPage || conv.current_page || '/';
    if (payload.customerIdentifier && !conv.customer_identifier) {
      conv.customer_identifier = payload.customerIdentifier;
    }
    conv.updated_at = nowIso;
  } else {
    conv = {
      id: crypto.randomUUID(),
      session_id: payload.sessionId,
      source_channel: payload.sourceChannel,
      source_mode: payload.sourceMode,
      customer_identifier: payload.customerIdentifier || null,
      detected_language: payload.detectedLanguage,
      current_page: payload.currentPage || '/',
      conversation_status: 'active',
      assigned_employee: null,
      enquiry_id: null,
      session_token_hash: tokenHash,
      created_at: nowIso,
      updated_at: nowIso,
      last_message_at: nowIso
    };
    memoryConversations.set(key, conv);
    memoryMessagesByConversation.set(conv.id, []);
  }

  const list = memoryMessagesByConversation.get(conv.id) || [];
  const savedMessageIds: string[] = [];
  const duplicateSkippedIds: string[] = [];

  for (const msg of payload.messages) {
    if (list.some((existing) => existing.message_id === msg.messageId)) {
      duplicateSkippedIds.push(msg.messageId);
      continue;
    }

    const msgTime = new Date().toISOString();
    list.push({
      id: crypto.randomUUID(),
      conversation_id: conv.id,
      message_id: msg.messageId,
      sender_type: msg.senderType,
      message_content: msg.messageContent,
      message_metadata: sanitizeConversationMetadata(msg.messageMetadata),
      ai_model: msg.aiModel || null,
      delivery_status:
        msg.deliveryStatus || (msg.senderType === 'customer' ? 'received' : 'delivered'),
      created_at: msgTime
    });
    conv.last_message_at = msgTime;
    conv.updated_at = msgTime;
    savedMessageIds.push(msg.messageId);
  }

  memoryMessagesByConversation.set(conv.id, list);

  return {
    ok: true,
    conversationId: conv.id,
    storage: 'preview_memory',
    savedMessageIds,
    duplicateSkippedIds,
    lastMessageAt: conv.last_message_at
  };
}

export async function hydrateVisitorSessionMessages(
  params: {
    sessionId: string;
    sessionToken: string;
    sourceChannel: ReceptionistSourceChannel;
    sourceMode: ReceptionistMode;
  },
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistSessionHydrationResponse> {
  const tokenHash = await hashSessionToken(params.sessionToken);
  const cfg = resolveWorkerSupabaseConfig(env);

  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) {
      throw new ReceptionistApiError(
        'Conversation retrieval service is unavailable.',
        503,
        'STORAGE_UNAVAILABLE'
      );
    }
    return hydrateInMemory(params, tokenHash);
  }

  const headers = {
    apikey: cfg.privilegedKey,
    Authorization: `Bearer ${cfg.privilegedKey}`
  };

  const convRes = await fetchImpl(
    `${cfg.url}/rest/v1/receptionist_conversations` +
      `?select=${CONVERSATION_INTERNAL_COLUMNS}` +
      `&session_id=eq.${encodeURIComponent(params.sessionId)}` +
      `&source_channel=eq.${encodeURIComponent(params.sourceChannel)}` +
      `&source_mode=eq.${encodeURIComponent(params.sourceMode)}` +
      `&limit=1`,
    { method: 'GET', headers }
  );

  if (!convRes.ok) {
    const errText = await convRes.text().catch(() => '');
    if (isMissingRelationResponse(convRes.status, errText) && isPreviewFallbackAllowed(env)) {
      return hydrateInMemory(params, tokenHash);
    }
    throw new ReceptionistApiError(
      'Unable to restore conversation history right now.',
      503,
      'STORAGE_UNAVAILABLE'
    );
  }

  const convRows = (await convRes.json().catch(() => [])) as Array<
    ReceptionistConversationRecord & { session_token_hash?: string | null }
  >;
  const conv = Array.isArray(convRows) ? convRows[0] : undefined;

  if (!conv) {
    return {
      ok: true,
      found: false,
      storage: 'supabase',
      messages: []
    };
  }

  if (!conv.session_token_hash || !timingSafeEqualHex(conv.session_token_hash, tokenHash)) {
    throw new ReceptionistApiError(
      'Session token does not authorize access to this conversation.',
      403,
      'INVALID_SESSION_TOKEN'
    );
  }

  const msgRes = await fetchImpl(
    `${cfg.url}/rest/v1/receptionist_messages` +
      `?select=${MESSAGE_COLUMNS}` +
      `&conversation_id=eq.${encodeURIComponent(conv.id)}` +
      `&order=created_at.asc&limit=100`,
    { method: 'GET', headers }
  );

  if (!msgRes.ok) {
    throw new ReceptionistApiError('Unable to fetch session messages.', 502, 'STORAGE_UNAVAILABLE');
  }

  const msgRows = (await msgRes.json().catch(() => [])) as ReceptionistMessageRecord[];
  const messages = toHydrationMessages(
    Array.isArray(msgRows) ? msgRows : [],
    conv.source_mode,
    conv.detected_language
  );

  return {
    ok: true,
    found: true,
    conversationId: conv.id,
    detectedLanguage: normalizeReceptionistLanguage(conv.detected_language),
    storage: 'supabase',
    messages
  };
}

function hydrateInMemory(
  params: {
    sessionId: string;
    sourceChannel: ReceptionistSourceChannel;
    sourceMode: ReceptionistMode;
  },
  tokenHash: string
): ReceptionistSessionHydrationResponse {
  const key = makeConversationKey(params.sessionId, params.sourceChannel, params.sourceMode);
  const conv = memoryConversations.get(key);

  if (!conv) {
    return {
      ok: true,
      found: false,
      storage: 'preview_memory',
      messages: []
    };
  }

  if (!conv.session_token_hash || !timingSafeEqualHex(conv.session_token_hash, tokenHash)) {
    throw new ReceptionistApiError(
      'Session token does not authorize access to this conversation.',
      403,
      'INVALID_SESSION_TOKEN'
    );
  }

  const rows = memoryMessagesByConversation.get(conv.id) || [];
  return {
    ok: true,
    found: true,
    conversationId: conv.id,
    detectedLanguage: normalizeReceptionistLanguage(conv.detected_language),
    storage: 'preview_memory',
    messages: toHydrationMessages(rows, conv.source_mode, conv.detected_language)
  };
}

function toHydrationMessages(
  rows: ReceptionistMessageRecord[],
  mode: ReceptionistMode,
  fallbackLang: ReceptionistLanguage
): ReceptionistSessionHydrationMessage[] {
  return rows.map((row) => {
    const meta = sanitizeConversationMetadata(row.message_metadata);
    return {
      id: row.id,
      messageId: row.message_id,
      senderType: row.sender_type,
      content: row.message_content,
      timestamp: row.created_at,
      mode: mode === 'demo' ? 'demo' : 'live',
      language: meta.detectedLanguage || fallbackLang,
      aiModel: row.ai_model || undefined,
      recommendedLinks: meta.recommendedLinks,
      quickActionId: meta.quickActionId,
      suggestEnquiryForm: meta.suggestEnquiryForm
    };
  });
}

export async function linkEnquiryToConversation(
  params: {
    sessionId: string;
    sourceMode: ReceptionistMode;
    enquiryId: string;
    customerName: string;
    contactNumber?: string;
    detectedLanguage?: ReceptionistLanguage;
  },
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const customerIdentifier = params.contactNumber
    ? sanitizePlainText(`${params.customerName} (${params.contactNumber})`, 160)
    : sanitizePlainText(params.customerName, 160);

  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) return;
    const key = makeConversationKey(params.sessionId, 'website', params.sourceMode);
    const conv = memoryConversations.get(key);
    if (conv) {
      conv.enquiry_id = params.enquiryId;
      conv.customer_identifier = customerIdentifier || conv.customer_identifier;
      if (conv.conversation_status === 'active') {
        conv.conversation_status = 'new';
      }
      if (params.detectedLanguage) {
        conv.detected_language = params.detectedLanguage;
      }
      conv.updated_at = new Date().toISOString();
    }
    return;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      apikey: cfg.privilegedKey,
      Authorization: `Bearer ${cfg.privilegedKey}`
    };

    const lookupRes = await fetchImpl(
      `${cfg.url}/rest/v1/receptionist_conversations` +
        `?select=id,conversation_status` +
        `&session_id=eq.${encodeURIComponent(params.sessionId)}` +
        `&source_channel=eq.website` +
        `&source_mode=eq.${encodeURIComponent(params.sourceMode)}` +
        `&limit=1`,
      { method: 'GET', headers }
    );
    if (!lookupRes.ok) return;
    const rows = (await lookupRes.json().catch(() => [])) as Array<{
      id: string;
      conversation_status: ReceptionistConversationStatus;
    }>;
    const conv = rows?.[0];
    if (!conv) return;

    const patch: Record<string, unknown> = {
      enquiry_id: params.enquiryId,
      updated_at: new Date().toISOString()
    };
    if (customerIdentifier) patch.customer_identifier = customerIdentifier;
    if (conv.conversation_status === 'active') patch.conversation_status = 'new';
    if (params.detectedLanguage) patch.detected_language = params.detectedLanguage;

    await fetchImpl(
      `${cfg.url}/rest/v1/receptionist_conversations?id=eq.${encodeURIComponent(conv.id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(patch)
      }
    );
  } catch (err) {
    console.warn('Non-fatal error linking enquiry to conversation:', err);
  }
}

export function computeConversationStats(conversations: ReceptionistConversationRecord[]) {
  let liveThreads = 0;
  let demoThreads = 0;
  let activeOrFollowUp = 0;
  let unassigned = 0;

  for (const item of conversations) {
    if (item.source_mode === 'demo') {
      demoThreads += 1;
    } else {
      liveThreads += 1;
    }
    if (
      item.conversation_status === 'active' ||
      item.conversation_status === 'new' ||
      item.conversation_status === 'follow_up'
    ) {
      activeOrFollowUp += 1;
    }
    if (!item.assigned_employee || !item.assigned_employee.trim()) {
      unassigned += 1;
    }
  }

  return {
    total: conversations.length,
    liveThreads,
    demoThreads,
    activeOrFollowUp,
    unassigned
  };
}

export async function listAdminConversations(
  filters: {
    channel?: string;
    mode?: string;
    status?: string;
    language?: string;
    search?: string;
  },
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistAdminConversationsListResponse> {
  const cfg = resolveWorkerSupabaseConfig(env);

  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) {
      throw new ReceptionistApiError(
        'Supabase server credentials are not configured.',
        503,
        'STORAGE_UNAVAILABLE'
      );
    }
    return listInMemoryConversations(filters);
  }

  const headers = {
    apikey: cfg.privilegedKey,
    Authorization: `Bearer ${cfg.privilegedKey}`
  };

  const convRes = await fetchImpl(
    `${cfg.url}/rest/v1/receptionist_conversations?select=${CONVERSATION_PUBLIC_COLUMNS}&order=last_message_at.desc&limit=250`,
    { method: 'GET', headers }
  );

  if (!convRes.ok) {
    const errText = await convRes.text().catch(() => '');
    if (isMissingRelationResponse(convRes.status, errText) && isPreviewFallbackAllowed(env)) {
      return listInMemoryConversations(filters, 'Run migration 20261126_ai_receptionist_conversations.sql in Supabase to enable permanent CRM conversation storage.');
    }
    throw new ReceptionistApiError(
      isMissingRelationResponse(convRes.status, errText)
        ? 'Run migration 20261126_ai_receptionist_conversations.sql in Supabase to enable permanent CRM conversation storage.'
        : `Failed to load receptionist conversations (${convRes.status}).`,
      isMissingRelationResponse(convRes.status, errText) ? 503 : 500,
      isMissingRelationResponse(convRes.status, errText) ? 'MIGRATION_REQUIRED' : 'STORAGE_UNAVAILABLE'
    );
  }

  const convRows = (await convRes.json().catch(() => [])) as ReceptionistConversationRecord[];
  const safeConvs = (Array.isArray(convRows) ? convRows : []).map((c) =>
    stripInternalConversationFields(c)
  );

  // Fetch recent messages for counts/previews/search + admin assignees + linked enquiry codes cleanly
  const [msgRes, assigneeRes, enquiryRes] = await Promise.all([
    fetchImpl(
      `${cfg.url}/rest/v1/receptionist_messages?select=conversation_id,message_content,sender_type,created_at&order=created_at.desc&limit=1000`,
      { method: 'GET', headers }
    ).catch(() => null),
    fetchImpl(
      `${cfg.url}/rest/v1/creator_admin_users?select=email,role&order=role.asc`,
      { method: 'GET', headers }
    ).catch(() => null),
    fetchImpl(
      `${cfg.url}/rest/v1/receptionist_enquiries?select=id,reference_code&limit=250`,
      { method: 'GET', headers }
    ).catch(() => null)
  ]);

  const msgSummary = new Map<string, { count: number; latestPreview: string | null; textBlob: string }>();
  if (msgRes && msgRes.ok) {
    const msgRows = (await msgRes.json().catch(() => [])) as Array<{
      conversation_id: string;
      message_content: string;
    }>;
    if (Array.isArray(msgRows)) {
      for (const m of msgRows) {
        const entry = msgSummary.get(m.conversation_id) || {
          count: 0,
          latestPreview: m.message_content || null,
          textBlob: ''
        };
        entry.count += 1;
        if (!entry.latestPreview && m.message_content) {
          entry.latestPreview = m.message_content;
        }
        if (entry.textBlob.length < 3000 && m.message_content) {
          entry.textBlob += ` ${m.message_content}`;
        }
        msgSummary.set(m.conversation_id, entry);
      }
    }
  }

  const enquiryCodeById = new Map<string, string>();
  if (enquiryRes && enquiryRes.ok) {
    const eqRows = (await enquiryRes.json().catch(() => [])) as Array<{
      id: string;
      reference_code: string;
    }>;
    if (Array.isArray(eqRows)) {
      for (const e of eqRows) {
        enquiryCodeById.set(e.id, e.reference_code);
      }
    }
  }

  const assignees: ReceptionistAdminAssigneeOption[] = [];
  if (assigneeRes && assigneeRes.ok) {
    const userRows = (await assigneeRes.json().catch(() => [])) as Array<{
      email?: string;
      role?: string;
    }>;
    if (Array.isArray(userRows)) {
      for (const u of userRows) {
        if (
          u.email &&
          (u.role === 'superadmin' || u.role === 'admin' || u.role === 'evaluator')
        ) {
          assignees.push({ email: u.email, role: u.role });
        }
      }
    }
  }

  const enriched = safeConvs.map((conv) => {
    const summary = msgSummary.get(conv.id);
    return {
      ...conv,
      message_count: summary?.count ?? 0,
      last_message_preview: summary?.latestPreview ?? null,
      enquiry_reference_code: conv.enquiry_id ? enquiryCodeById.get(conv.enquiry_id) || null : null
    };
  });

  const filtered = filterConversationsList(enriched, filters, (id) => msgSummary.get(id)?.textBlob || '');

  return {
    conversations: filtered,
    assignees,
    storage: 'supabase',
    stats: computeConversationStats(enriched)
  };
}

function listInMemoryConversations(
  filters: {
    channel?: string;
    mode?: string;
    status?: string;
    language?: string;
    search?: string;
  },
  notice?: string
): ReceptionistAdminConversationsListResponse {
  const all = Array.from(memoryConversations.values())
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    .map((conv) => {
      const msgs = memoryMessagesByConversation.get(conv.id) || [];
      const lastMsg = msgs[msgs.length - 1];
      return {
        ...stripInternalConversationFields(conv),
        message_count: msgs.length,
        last_message_preview: lastMsg?.message_content || null
      };
    });

  const filtered = filterConversationsList(all, filters, (id) => {
    const msgs = memoryMessagesByConversation.get(id) || [];
    return msgs.map((m) => m.message_content).join(' ');
  });

  return {
    conversations: filtered,
    assignees: [
      { email: 'superadmin@unikorn360.com', role: 'superadmin' },
      { email: 'operations@unikorn360.com', role: 'admin' }
    ],
    storage: 'preview_memory',
    notice,
    stats: computeConversationStats(all)
  };
}

function filterConversationsList(
  list: ReceptionistConversationRecord[],
  filters: {
    channel?: string;
    mode?: string;
    status?: string;
    language?: string;
    search?: string;
  },
  getMessageTextBlob: (conversationId: string) => string
): ReceptionistConversationRecord[] {
  const q = sanitizePlainText(filters.search, 160).toLowerCase();

  return list.filter((conv) => {
    if (filters.channel && filters.channel !== 'all' && conv.source_channel !== filters.channel) {
      return false;
    }
    if (filters.mode && filters.mode !== 'all' && conv.source_mode !== filters.mode) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && conv.conversation_status !== filters.status) {
      return false;
    }
    if (filters.language && filters.language !== 'all' && conv.detected_language !== filters.language) {
      return false;
    }
    if (q) {
      const haystack = [
        conv.customer_identifier || '',
        conv.session_id,
        conv.assigned_employee || '',
        conv.current_page || '',
        conv.enquiry_reference_code || '',
        conv.last_message_preview || '',
        getMessageTextBlob(conv.id)
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    }
    return true;
  });
}

export async function getAdminConversationDetail(
  conversationId: string,
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistAdminConversationDetailResponse> {
  if (!UUID_REGEX.test(conversationId)) {
    throw new ReceptionistApiError('Invalid conversation ID format.', 400, 'VALIDATION_ERROR');
  }

  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) {
      throw new ReceptionistApiError('Supabase credentials are not configured.', 503, 'STORAGE_UNAVAILABLE');
    }
    const found = Array.from(memoryConversations.values()).find((c) => c.id === conversationId);
    if (!found) {
      throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
    }
    return {
      conversation: stripInternalConversationFields(found),
      messages: [...(memoryMessagesByConversation.get(found.id) || [])],
      storage: 'preview_memory'
    };
  }

  const headers = {
    apikey: cfg.privilegedKey,
    Authorization: `Bearer ${cfg.privilegedKey}`
  };

  const [convRes, msgRes] = await Promise.all([
    fetchImpl(
      `${cfg.url}/rest/v1/receptionist_conversations?select=${CONVERSATION_PUBLIC_COLUMNS}&id=eq.${encodeURIComponent(conversationId)}&limit=1`,
      { method: 'GET', headers }
    ),
    fetchImpl(
      `${cfg.url}/rest/v1/receptionist_messages?select=${MESSAGE_COLUMNS}&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc&limit=250`,
      { method: 'GET', headers }
    )
  ]);

  if (!convRes.ok) {
    const errText = await convRes.text().catch(() => '');
    if (isMissingRelationResponse(convRes.status, errText) && isPreviewFallbackAllowed(env)) {
      const found = Array.from(memoryConversations.values()).find((c) => c.id === conversationId);
      if (!found) throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
      return {
        conversation: stripInternalConversationFields(found),
        messages: [...(memoryMessagesByConversation.get(found.id) || [])],
        storage: 'preview_memory'
      };
    }
    throw new ReceptionistApiError('Failed to fetch conversation details.', 500, 'STORAGE_UNAVAILABLE');
  }

  const convRows = (await convRes.json().catch(() => [])) as ReceptionistConversationRecord[];
  const conv = convRows?.[0];
  if (!conv) {
    throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
  }

  const msgRows = msgRes.ok
    ? ((await msgRes.json().catch(() => [])) as ReceptionistMessageRecord[])
    : [];

  return {
    conversation: {
      ...stripInternalConversationFields(conv),
      message_count: Array.isArray(msgRows) ? msgRows.length : 0
    },
    messages: Array.isArray(msgRows) ? msgRows : [],
    storage: 'supabase'
  };
}

export async function updateAdminConversation(
  conversationId: string,
  updates: {
    conversation_status?: ReceptionistConversationStatus;
    assigned_employee?: string | null;
  },
  env: ReceptionistRuntimeEnv & { NODE_ENV?: string },
  fetchImpl: typeof fetch = fetch
): Promise<ReceptionistConversationRecord> {
  if (!UUID_REGEX.test(conversationId)) {
    throw new ReceptionistApiError('Invalid conversation ID format.', 400, 'VALIDATION_ERROR');
  }

  const cfg = resolveWorkerSupabaseConfig(env);
  if (!cfg.isPrivilegedConfigured) {
    if (!isPreviewFallbackAllowed(env)) {
      throw new ReceptionistApiError('Supabase credentials are not configured.', 503, 'STORAGE_UNAVAILABLE');
    }
    const found = Array.from(memoryConversations.values()).find((c) => c.id === conversationId);
    if (!found) {
      throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
    }
    if (updates.conversation_status !== undefined) {
      found.conversation_status = updates.conversation_status;
    }
    if (updates.assigned_employee !== undefined) {
      found.assigned_employee = updates.assigned_employee;
    }
    found.updated_at = new Date().toISOString();
    return stripInternalConversationFields(found);
  }

  const res = await fetchImpl(
    `${cfg.url}/rest/v1/receptionist_conversations?id=eq.${encodeURIComponent(conversationId)}&select=${CONVERSATION_PUBLIC_COLUMNS}`,
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
    if (isMissingRelationResponse(res.status, errText) && isPreviewFallbackAllowed(env)) {
      const found = Array.from(memoryConversations.values()).find((c) => c.id === conversationId);
      if (!found) throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
      if (updates.conversation_status !== undefined) {
        found.conversation_status = updates.conversation_status;
      }
      if (updates.assigned_employee !== undefined) {
        found.assigned_employee = updates.assigned_employee;
      }
      found.updated_at = new Date().toISOString();
      return stripInternalConversationFields(found);
    }
    throw new ReceptionistApiError('Failed to update conversation.', res.status || 500, 'UPDATE_FAILED');
  }

  const rows = (await res.json().catch(() => [])) as ReceptionistConversationRecord[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ReceptionistApiError('Conversation not found.', 404, 'NOT_FOUND');
  }

  return stripInternalConversationFields(rows[0]);
}
