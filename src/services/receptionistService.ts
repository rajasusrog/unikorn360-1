import { supabase } from '../lib/supabase';
import {
  ReceptionistAdminConversationDetailResponse,
  ReceptionistAdminConversationsListResponse,
  ReceptionistAdminListResponse,
  ReceptionistChatRequest,
  ReceptionistChatResponse,
  ReceptionistConversationRecord,
  ReceptionistConversationStatus,
  ReceptionistEnquiryRecord,
  ReceptionistEnquirySubmissionRequest,
  ReceptionistEnquirySubmissionResponse,
  ReceptionistLeadStatus,
  ReceptionistMode,
  ReceptionistPersistTurnRequest,
  ReceptionistPersistTurnResponse,
  ReceptionistSessionHydrationResponse,
  ReceptionistSourceChannel
} from '../types/receptionist';

import {
  detectMessageLanguage,
  generateDemoReceptionistReply,
  inferReceptionistMetadataFromConversation,
  sanitizePlainText
} from '../lib/receptionistKnowledge';

export const CLOUDFLARE_CHAT_ENDPOINT =
  'https://inbox360-whatsapp-webhook.raj-asusrog.workers.dev/api/chat';

const envObj: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : {};

const API_BASE = (envObj.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export function isProductionUnikornOrigin(): boolean {
  if (typeof window === 'undefined' || !window.location?.hostname) return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'www.unikorn360.com' || host === 'unikorn360.com';
}

function createMessageId(prefix: 'usr' | 'ast' | 'sys'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

export class ReceptionistClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status = 500,
    code?: string,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ReceptionistClientError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function tryPersistTurnSafe(
  payload: ReceptionistPersistTurnRequest
): Promise<ReceptionistPersistTurnResponse | null> {
  try {
    const res = await fetch(apiUrl('/api/receptionist/messages'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    return (await res.json().catch(() => null)) as ReceptionistPersistTurnResponse | null;
  } catch {
    return null;
  }
}

export const receptionistService = {
  async persistMessages(
    payload: ReceptionistPersistTurnRequest
  ): Promise<ReceptionistPersistTurnResponse> {
    const res = await fetch(apiUrl('/api/receptionist/messages'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Unable to persist conversation messages.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistPersistTurnResponse;
  },

  async hydrateSessionMessages(params: {
    sessionId: string;
    sessionToken: string;
    sourceChannel?: ReceptionistSourceChannel;
    sourceMode: ReceptionistMode;
  }): Promise<ReceptionistSessionHydrationResponse> {
    const query = new URLSearchParams({
      sessionId: params.sessionId,
      sourceChannel: params.sourceChannel || 'website',
      sourceMode: params.sourceMode
    });
    const res = await fetch(apiUrl(`/api/receptionist/messages?${query.toString()}`), {
      method: 'GET',
      headers: {
        'X-Receptionist-Session-Token': params.sessionToken
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Unable to restore previous session messages.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistSessionHydrationResponse;
  },

  async sendMessage(payload: ReceptionistChatRequest): Promise<ReceptionistChatResponse> {
    const sourceChannel = payload.sourceChannel || 'website';
    const sourceMode = payload.sourceMode || payload.mode;
    const currentPage = payload.currentPage || '/';
    const customerMessageId = payload.clientMessageId || createMessageId('usr');
    const assistantMessageId = payload.assistantMessageId || createMessageId('ast');
    const detectedLang = payload.detectedLanguage || detectMessageLanguage(payload.message);

    if (sourceMode === 'demo') {
      const demoResponse = generateDemoReceptionistReply(payload);
      let persisted = false;
      let conversationId: string | undefined;

      if (payload.sessionToken) {
        const customerIdentifier =
          demoResponse.extractedFields?.customerName ||
          payload.collectedDraft?.customerName ||
          demoResponse.extractedFields?.contactNumber ||
          undefined;

        const saved = await tryPersistTurnSafe({
          sessionId: payload.sessionId,
          sessionToken: payload.sessionToken,
          sourceChannel,
          sourceMode: 'demo',
          currentPage,
          detectedLanguage: demoResponse.detectedLanguage || detectedLang,
          customerIdentifier,
          messages: [
            {
              messageId: customerMessageId,
              senderType: 'customer',
              messageContent: payload.message,
              messageMetadata: {
                quickActionId: payload.quickActionId,
                currentPage,
                detectedLanguage: detectedLang
              },
              deliveryStatus: 'received'
            },
            {
              messageId: assistantMessageId,
              senderType: 'assistant',
              messageContent: demoResponse.reply,
              messageMetadata: {
                recommendedLinks: demoResponse.recommendedLinks,
                suggestEnquiryForm: demoResponse.suggestEnquiryForm,
                suggestHumanHandover: demoResponse.suggestHumanHandover,
                currentPage,
                detectedLanguage: demoResponse.detectedLanguage
              },
              aiModel: demoResponse.model || 'demo-simulator',
              deliveryStatus: 'delivered'
            }
          ]
        });
        if (saved) {
          persisted = true;
          conversationId = saved.conversationId;
        }
      }

      return {
        ...demoResponse,
        conversationId,
        customerMessageId,
        assistantMessageId,
        persisted
      };
    }

    const turnstileToken = sanitizePlainText(payload.turnstileToken, 2048);
    if (!turnstileToken) {
      throw new ReceptionistClientError(
        'Security verification (Cloudflare Turnstile) is required before contacting Live AI.',
        400,
        'TURNSTILE_TOKEN_REQUIRED'
      );
    }

    // Production origin (www.unikorn360.com / unikorn360.com): call Cloudflare Worker directly via fetch()
    // and independently persist customer & assistant turns to same-origin /api/receptionist/messages.
    if (isProductionUnikornOrigin()) {
      let conversationId: string | undefined;

      if (payload.sessionToken) {
        const savedUser = await tryPersistTurnSafe({
          sessionId: payload.sessionId,
          sessionToken: payload.sessionToken,
          sourceChannel,
          sourceMode: 'live',
          currentPage,
          detectedLanguage: detectedLang,
          customerIdentifier: payload.collectedDraft?.customerName || undefined,
          messages: [
            {
              messageId: customerMessageId,
              senderType: 'customer',
              messageContent: payload.message,
              messageMetadata: {
                quickActionId: payload.quickActionId,
                currentPage,
                detectedLanguage: detectedLang
              },
              deliveryStatus: 'received'
            }
          ]
        });
        conversationId = savedUser?.conversationId;
      }

      const workerBody = {
        message: payload.message,
        history: payload.history.slice(-14).map((turn) => ({
          role: turn.role,
          text: turn.content
        })),
        turnstileToken
      };

      let res: Response;
      try {
        res = await fetch(CLOUDFLARE_CHAT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(workerBody)
        });
      } catch {
        throw new ReceptionistClientError(
          'Unable to reach UNIKORN360 Live AI right now. Please try again or reach us on WhatsApp.',
          502,
          'CLOUDFLARE_NETWORK_ERROR'
        );
      }

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reply?: string;
        text?: string;
        model?: string;
        error?: string;
      } | null;

      if (!res.ok || !data || data.ok !== true) {
        throw new ReceptionistClientError(
          sanitizePlainText(data?.error, 300) ||
            'The UNIKORN360 Live AI service is temporarily unavailable. Please try again shortly.',
          res.status || 502,
          res.status === 429 ? 'CLOUDFLARE_RATE_LIMITED' : 'CLOUDFLARE_BACKEND_ERROR'
        );
      }

      const replyText = sanitizePlainText(data.reply || data.text, 4000);
      if (!replyText) {
        throw new ReceptionistClientError(
          'Live AI returned an empty reply. Please try again.',
          502,
          'CLOUDFLARE_EMPTY_REPLY'
        );
      }

      const inferred = inferReceptionistMetadataFromConversation(
        payload.message,
        replyText,
        payload.quickActionId,
        payload.collectedDraft
      );
      const aiModel = sanitizePlainText(data.model, 80) || 'gemini-3.8-flash';
      let persisted = false;

      if (payload.sessionToken) {
        const customerIdentifier =
          inferred.extractedFields?.customerName ||
          payload.collectedDraft?.customerName ||
          inferred.extractedFields?.contactNumber ||
          undefined;

        const savedReply = await tryPersistTurnSafe({
          sessionId: payload.sessionId,
          sessionToken: payload.sessionToken,
          sourceChannel,
          sourceMode: 'live',
          currentPage,
          detectedLanguage: inferred.detectedLanguage || detectedLang,
          customerIdentifier,
          messages: [
            {
              messageId: assistantMessageId,
              senderType: 'assistant',
              messageContent: replyText,
              messageMetadata: {
                recommendedLinks: inferred.recommendedLinks,
                suggestEnquiryForm: inferred.suggestEnquiryForm,
                suggestHumanHandover: inferred.suggestHumanHandover,
                currentPage,
                detectedLanguage: inferred.detectedLanguage
              },
              aiModel,
              deliveryStatus: 'delivered'
            }
          ]
        });
        if (savedReply) {
          persisted = true;
          conversationId = savedReply.conversationId;
        }
      }

      return {
        reply: replyText,
        mode: 'live',
        simulated: false,
        detectedLanguage: inferred.detectedLanguage,
        recommendedLinks: inferred.recommendedLinks,
        extractedFields: inferred.extractedFields,
        suggestEnquiryForm: inferred.suggestEnquiryForm,
        suggestHumanHandover: inferred.suggestHumanHandover,
        model: aiModel,
        conversationId,
        customerMessageId,
        assistantMessageId,
        persisted
      };
    }

    // Preview / localhost origins: relay cleanly through /api/receptionist/chat
    // which forwards to Cloudflare Worker AND persists both messages in Supabase.
    const res = await fetch(apiUrl('/api/receptionist/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        sourceChannel,
        sourceMode: 'live',
        currentPage,
        detectedLanguage: detectedLang,
        clientMessageId: customerMessageId,
        assistantMessageId
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Unable to get a response from the receptionist right now.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistChatResponse;
  },

  async submitEnquiry(
    payload: ReceptionistEnquirySubmissionRequest
  ): Promise<ReceptionistEnquirySubmissionResponse> {
    const res = await fetch(apiUrl('/api/receptionist/enquiry'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Unable to submit your enquiry. Please check your details and try again.',
        res.status,
        data?.code,
        data?.fieldErrors
      );
    }

    return data as ReceptionistEnquirySubmissionResponse;
  },

  async listAdminEnquiries(): Promise<ReceptionistAdminListResponse> {
    const headers = await getAdminAuthHeaders();
    const res = await fetch(apiUrl('/api/admin/receptionist-enquiries'), {
      method: 'GET',
      headers
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Failed to load AI receptionist enquiries.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistAdminListResponse;
  },

  async updateAdminEnquiry(
    enquiryId: string,
    updates: {
      lead_status?: ReceptionistLeadStatus;
      follow_up_required?: boolean;
      follow_up_notes?: string | null;
      follow_up_date?: string | null;
    }
  ): Promise<ReceptionistEnquiryRecord> {
    const headers = await getAdminAuthHeaders();
    const res = await fetch(
      apiUrl(`/api/admin/receptionist-enquiries?id=${encodeURIComponent(enquiryId)}`),
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: enquiryId, ...updates })
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Failed to update enquiry record.',
        res.status,
        data?.code
      );
    }

    return data.enquiry as ReceptionistEnquiryRecord;
  },

  async listAdminConversations(filters?: {
    channel?: string;
    mode?: string;
    status?: string;
    language?: string;
    search?: string;
  }): Promise<ReceptionistAdminConversationsListResponse> {
    const headers = await getAdminAuthHeaders();
    const query = new URLSearchParams();
    if (filters?.channel && filters.channel !== 'all') query.set('channel', filters.channel);
    if (filters?.mode && filters.mode !== 'all') query.set('mode', filters.mode);
    if (filters?.status && filters.status !== 'all') query.set('status', filters.status);
    if (filters?.language && filters.language !== 'all') query.set('language', filters.language);
    if (filters?.search?.trim()) query.set('search', filters.search.trim());

    const qs = query.toString();
    const res = await fetch(
      apiUrl(`/api/admin/receptionist-conversations${qs ? `?${qs}` : ''}`),
      {
        method: 'GET',
        headers
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Failed to load AI receptionist conversations.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistAdminConversationsListResponse;
  },

  async getAdminConversationDetail(
    conversationId: string
  ): Promise<ReceptionistAdminConversationDetailResponse> {
    const headers = await getAdminAuthHeaders();
    const res = await fetch(
      apiUrl(`/api/admin/receptionist-conversations?id=${encodeURIComponent(conversationId)}`),
      {
        method: 'GET',
        headers
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Failed to load conversation messages.',
        res.status,
        data?.code
      );
    }

    return data as ReceptionistAdminConversationDetailResponse;
  },

  async updateAdminConversation(
    conversationId: string,
    updates: {
      conversation_status?: ReceptionistConversationStatus;
      assigned_employee?: string | null;
    }
  ): Promise<ReceptionistConversationRecord> {
    const headers = await getAdminAuthHeaders();
    const res = await fetch(
      apiUrl(`/api/admin/receptionist-conversations?id=${encodeURIComponent(conversationId)}`),
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: conversationId, ...updates })
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ReceptionistClientError(
        data?.error || 'Failed to update conversation details.',
        res.status,
        data?.code
      );
    }

    return data.conversation as ReceptionistConversationRecord;
  }
};
