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

const envObj: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : {};

const API_BASE = (envObj.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
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
