import { supabase } from '../lib/supabase';
import {
  ReceptionistAdminListResponse,
  ReceptionistChatRequest,
  ReceptionistChatResponse,
  ReceptionistEnquiryRecord,
  ReceptionistEnquirySubmissionRequest,
  ReceptionistEnquirySubmissionResponse,
  ReceptionistLeadStatus
} from '../types/receptionist';

import {
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

export const receptionistService = {
  async sendMessage(payload: ReceptionistChatRequest): Promise<ReceptionistChatResponse> {
    if (payload.mode === 'demo') {
      return generateDemoReceptionistReply(payload);
    }

    // Production origin (www.unikorn360.com): call Cloudflare Worker directly via fetch()
    if (isProductionUnikornOrigin()) {
      const workerBody = {
        message: payload.message,
        history: payload.history.slice(-14).map((turn) => ({
          role: turn.role,
          text: turn.content
        }))
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

    // Preview / localhost origins: relay cleanly through /api/receptionist/chat
    // so Cloudflare's www.unikorn360.com CORS policy never blocks preview testing.
    const res = await fetch(apiUrl('/api/receptionist/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
  }
};
