export type ReceptionistMode = 'live' | 'demo';

export type ReceptionistLanguage = 'en' | 'ta' | 'tanglish' | 'hi';

export type ReceptionistLeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'follow_up'
  | 'won'
  | 'closed';

export interface RecommendedLink {
  label: string;
  path: string;
  external?: boolean;
}

export interface ReceptionistChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: ReceptionistMode;
  language?: ReceptionistLanguage;
  recommendedLinks?: RecommendedLink[];
  quickActionId?: string;
  suggestEnquiryForm?: boolean;
  model?: string;
}

export interface ReceptionistEnquiryDraft {
  customerName: string;
  businessName: string;
  contactNumber: string;
  email: string;
  serviceRequired: string;
  projectDescription: string;
  budgetRange: string;
  expectedTimeline: string;
}

export interface ReceptionistQuickAction {
  id: string;
  label: string;
  prompt: string;
  serviceLabel: string;
  isHumanHandover?: boolean;
}

export interface ReceptionistChatRequest {
  sessionId: string;
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  mode: ReceptionistMode;
  currentPage?: string;
  quickActionId?: string;
  collectedDraft?: Partial<ReceptionistEnquiryDraft>;
}

export interface ReceptionistChatResponse {
  reply: string;
  mode: ReceptionistMode;
  simulated: boolean;
  detectedLanguage: ReceptionistLanguage;
  recommendedLinks: RecommendedLink[];
  extractedFields: Partial<ReceptionistEnquiryDraft>;
  suggestEnquiryForm: boolean;
  suggestHumanHandover: boolean;
  model?: string;
}

export interface ReceptionistEnquirySubmissionRequest {
  sessionId: string;
  sourceMode: ReceptionistMode;
  detectedLanguage: ReceptionistLanguage;
  pageUrl?: string;
  enquiry: ReceptionistEnquiryDraft;
  conversationHistory: ReceptionistChatMessage[];
}

export interface ReceptionistEnquiryRecord {
  id: string;
  reference_code: string;
  session_id: string;
  source_mode: ReceptionistMode;
  detected_language: ReceptionistLanguage;
  page_url: string | null;
  customer_name: string;
  business_name: string | null;
  contact_number: string;
  email: string;
  service_required: string;
  project_description: string;
  budget_range: string | null;
  expected_timeline: string | null;
  lead_status: ReceptionistLeadStatus;
  follow_up_required: boolean;
  follow_up_notes: string | null;
  follow_up_date: string | null;
  conversation_history: ReceptionistChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ReceptionistEnquirySubmissionResponse {
  success: boolean;
  referenceCode: string;
  enquiryId: string;
  storage: 'supabase' | 'preview_memory';
  createdAt: string;
}

export interface ReceptionistAdminListResponse {
  enquiries: ReceptionistEnquiryRecord[];
  storage: 'supabase' | 'preview_memory';
  notice?: string;
  stats: {
    total: number;
    newLeads: number;
    followUpRequired: number;
    qualifiedOrWon: number;
  };
}

export const EMPTY_ENQUIRY_DRAFT: ReceptionistEnquiryDraft = {
  customerName: '',
  businessName: '',
  contactNumber: '',
  email: '',
  serviceRequired: '',
  projectDescription: '',
  budgetRange: '',
  expectedTimeline: ''
};

export const LEAD_STATUS_OPTIONS: Array<{
  value: ReceptionistLeadStatus;
  label: string;
  toneClass: string;
}> = [
  { value: 'new', label: 'New', toneClass: 'text-[#0B1426]' },
  { value: 'contacted', label: 'Contacted', toneClass: 'text-[#1D4ED8]' },
  { value: 'qualified', label: 'Qualified', toneClass: 'text-[#0F766E]' },
  { value: 'follow_up', label: 'Follow-Up', toneClass: 'text-[#B45309]' },
  { value: 'won', label: 'Won', toneClass: 'text-[#15803D]' },
  { value: 'closed', label: 'Closed', toneClass: 'text-[#526176]' }
];
