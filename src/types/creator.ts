export type CreatorClassification = 
  | 'l1_community'
  | 'l2_nano'
  | 'l3_micro'
  | 'l4_regional'
  | 'l5_mid_tier'
  | 'l6_established'
  // Legacy compatibility:
  | 'ugc'
  | 'nano'
  | 'micro'
  | 'mid'
  | 'macro';

export const CLASSIFICATION_LABELS: Record<string, { label: string; badge: string; minFollowers: string }> = {
  l1_community: { label: 'L1 Community Creator', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', minFollowers: '< 5K' },
  l2_nano: { label: 'L2 Nano Creator', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', minFollowers: '5K - 20K' },
  l3_micro: { label: 'L3 Micro Creator', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', minFollowers: '20K - 100K' },
  l4_regional: { label: 'L4 Regional Creator', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', minFollowers: '100K - 250K' },
  l5_mid_tier: { label: 'L5 Mid-tier Creator', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', minFollowers: '250K - 500K' },
  l6_established: { label: 'L6 Established Creator', badge: 'bg-[#F3C94F]/20 text-[#F3C94F] border-[#F3C94F]/40', minFollowers: '500K+' },
  // Legacy aliases
  ugc: { label: 'L1 Community Creator', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', minFollowers: '< 5K' },
  nano: { label: 'L2 Nano Creator', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', minFollowers: '5K - 20K' },
  micro: { label: 'L3 Micro Creator', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', minFollowers: '20K - 100K' },
  mid: { label: 'L5 Mid-tier Creator', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', minFollowers: '250K - 500K' },
  macro: { label: 'L6 Established Creator', badge: 'bg-[#F3C94F]/20 text-[#F3C94F] border-[#F3C94F]/40', minFollowers: '500K+' }
};

export type ApplicationStatus = 
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'approved'
  | 'rejected'
  | 'inactive'
  // Legacy compatibility:
  | 'pending'
  | 'reviewed';

export const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  new: { label: 'New', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', color: '#38bdf8' },
  pending: { label: 'New', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', color: '#38bdf8' },
  reviewing: { label: 'Under Review', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', color: '#fbbf24' },
  reviewed: { label: 'Under Review', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', color: '#fbbf24' },
  shortlisted: { label: 'Shortlisted', badge: 'bg-[#43C8E8]/15 text-[#43C8E8] border-[#43C8E8]/30', color: '#43C8E8' },
  approved: { label: 'Approved', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', color: '#34d399' },
  rejected: { label: 'Rejected', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', color: '#f43f5e' },
  inactive: { label: 'Inactive', badge: 'bg-slate-500/15 text-slate-400 border-slate-600/30', color: '#94a3b8' }
};

export interface CreatorPortfolioLink {
  id: string;
  url: string;
  platform: 'instagram' | 'youtube' | 'other';
  label?: string;
}

export interface CreatorUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'video' | 'insight' | 'mediakit';
  progress: number;
  status: 'ready' | 'uploading' | 'error';
  errorMessage?: string;
  storagePath?: string;
  signedDownloadUrl?: string;
}

// 100-Point Unicorn Creator Score Rubric
export interface CreatorEvaluation {
  id?: string;
  application_id?: string;
  engagement_quality: number; // max 15
  average_views_score: number; // max 10
  content_quality: number; // max 10
  authenticity: number; // max 10
  presentation: number; // max 10
  audience_brand_fit: number; // max 15
  local_relevance: number; // max 10
  historical_performance: number; // max 10
  cost_efficiency: number; // max 5
  reliability: number; // max 5
  total_score?: number; // max 100
  evaluation_notes?: string;
  evaluated_by_name?: string;
  created_at?: string;
}

export interface CreatorPayment {
  id: string;
  campaign_name: string;
  amount: number;
  status: 'paid' | 'processing' | 'pending';
  payment_date: string;
  reference_utr?: string;
  notes?: string;
}

export interface CreatorActivityLog {
  id: string;
  event_type?: string;
  action: string;
  actor_email?: string;
  timestamp: string;
  details?: string;
}

export interface CreatorApplicationFormData {
  // Step 1: Personal Information
  fullName: string;
  whatsapp: string;
  email: string;
  state: string;
  district: string;
  cityTown: string;
  contactLanguage: 'Tamil' | 'English' | 'Tanglish / Both';
  is18Plus: boolean;

  // Step 2: Social Media Profiles
  primaryPlatform: 'Instagram' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'Other';
  instagramUrl: string;
  youtubeUrl: string;
  otherPlatformUrl: string;
  followerCount: string;
  subscriberCount: string;
  averageViewsLast10: string;
  publishingFrequency: string;

  // Step 3: Creator Identity & Demographics
  categories: string[];
  otherCategoryText: string;
  primaryLanguage: string;
  additionalLanguages: string[];
  regionalDialects: string[];
  classification: CreatorClassification;
  audienceLocation: string;
  genderBreakdown: string;
  topAgeGroup: string;
  hasPriorCollabs: 'yes' | 'no';
  priorCollabDetails: string;

  // Step 4: Portfolio & Uploads
  sampleLinks: string[]; // up to 3 links
  uploadedVideos: CreatorUploadedFile[];
  uploadedInsights: CreatorUploadedFile[];
  uploadedMediaKit: CreatorUploadedFile | null;

  // Step 5: Collaboration Preferences & Rates
  collaborationTypes: string[];
  rateUgcVideo: string;
  rateSponsoredReel: string;
  rateStory: string;
  rateAdditionalProduction: string;
  rateOnLocationDaily: string;
  travelAvailability: string;
  preferredCampaignLocations: string;
  equipmentSummary: string[];
  equipmentOther: string;
  additionalNotes: string;

  // Step 6: Review & Consent
  consentAccuracy: boolean;
  consentProcessing: boolean;
  consentContact: boolean;
  consentBrandSharing: boolean;
}

export interface CreatorApplicationRecord extends CreatorApplicationFormData {
  id: string;
  referenceNumber: string;
  submittedAt: string;
  status: ApplicationStatus;
  adminNotes?: string;
  tags?: string[];
  verifiedChannels?: boolean;
  campaignMatches?: string[];
  payments?: CreatorPayment[];
  activityLog?: CreatorActivityLog[];
  evaluations?: CreatorEvaluation[];
  latestScore?: number;
}

