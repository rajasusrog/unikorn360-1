import type {
  BillingPeriod,
  PriceType,
  ServiceFaq
} from './database';
import type {
  ConfirmedProductPricingTier,
  ProductFaqItem,
  ProductSlug,
  VerifiedProductFeature
} from '../data/productsData';

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
  turnstileToken?: string;
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

// ====================================================================
// CENTRAL BUSINESS KNOWLEDGE ENGINE TYPES (GET /api/receptionist/knowledge)
// ====================================================================
export interface CentralKnowledgeCompany {
  brand: string;
  shortBrand: string;
  founder: string;
  gstin: string;
  website: string;
  email: string;
  phone: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  whatsappUrl: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    full: string;
  };
}

export interface CentralKnowledgeDivision {
  id: string;
  slug: string;
  name: string;
  displayOrder: number;
  shortDescription: string;
  fullDescription: string;
  path: string;
  url: string;
  publishedServiceCount: number;
}

export interface CentralKnowledgeApprovedPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  priceType: PriceType;
  inclusions: string[];
  limits: string[];
  exclusions: string[];
  setupCharges: string | null;
  taxTreatment: string;
  isPopular: boolean;
}

export interface CentralKnowledgeService {
  id: string;
  divisionId: string;
  divisionSlug: string;
  divisionName: string;
  slug: string;
  name: string;
  displayOrder: number;
  shortDescription: string;
  fullDescription: string;
  serviceType: 'custom-development' | 'consulting' | 'managed-support';
  problemsSolved: string[];
  targetCustomers: string[];
  benefits: string[];
  deliverables: string[];
  faqs: ServiceFaq[];
  approvedPackages: CentralKnowledgeApprovedPackage[];
  path: string;
  url: string;
}

export interface CentralKnowledgeProduct {
  id: string;
  slug: ProductSlug;
  name: string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  intendedUsers: string[];
  verifiedFeatures: VerifiedProductFeature[];
  faqs: ProductFaqItem[];
  relatedProductSlugs: ProductSlug[];
  publicPath: string;
  canonicalUrl: string;
  appUrl: string;
  confirmedPricing: ConfirmedProductPricingTier[] | null;
}

export interface CentralKnowledgeEngagementModel {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  bestFor: string;
}

export interface CentralKnowledgeCommercialPolicies {
  pricingPolicy: string;
  unapprovedPricingRule: string;
  timelinePolicy: string;
  taxNote: string;
  supportedLanguages: ReceptionistLanguage[];
  engagementModels: CentralKnowledgeEngagementModel[];
  humanHandover: {
    whatsappDisplay: string;
    whatsappUrl: string;
    defaultMessage: string;
    email: string;
  };
}

export interface CentralKnowledgePublicLinkItem {
  label: string;
  path: string;
  url: string;
}

export interface CentralKnowledgePublicLinks {
  websiteOrigin: string;
  whatsappHandoverUrl: string;
  corePages: CentralKnowledgePublicLinkItem[];
  divisions: CentralKnowledgePublicLinkItem[];
  services: CentralKnowledgePublicLinkItem[];
  products: Array<CentralKnowledgePublicLinkItem & { appUrl: string }>;
}

export interface CentralBusinessKnowledgeResponse {
  ok: true;
  schemaVersion: '1.0';
  sourceDataVersion: string;
  catalogSource: 'supabase_published' | 'canonical_seed';
  counts: {
    divisions: number;
    services: number;
    products: number;
  };
  company: CentralKnowledgeCompany;
  divisions: CentralKnowledgeDivision[];
  services: CentralKnowledgeService[];
  products: CentralKnowledgeProduct[];
  publicLinks: CentralKnowledgePublicLinks;
  commercialPolicies: CentralKnowledgeCommercialPolicies;
  updatedAt: string;
}
