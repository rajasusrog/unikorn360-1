/**
 * Types for the UNIKORN360 Dynamic Services Architecture & Supabase Schema
 */

export type RecordStatus = 'draft' | 'published' | 'archived';

export type PriceType = 'fixed' | 'starting-from' | 'quotation';
export type BillingPeriod = 'one-time' | 'monthly' | 'quarterly' | 'annual' | 'project-based';
export type PackageApprovalStatus = 'approved' | 'pending' | 'draft';

export interface AdSpendDetails {
  agency_fee?: string;
  ad_spend?: string;
  creative_fee?: string;
  landing_page_fee?: string;
  tracking_setup?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string; // e.g. 'INR'
  billing_period: BillingPeriod;
  price_type: PriceType;
  inclusions: string[];
  limits: string[];
  exclusions: string[];
  setup_charges: string | null;
  tax_treatment: string; // e.g. 'Subject to applicable GST (18%)'
  approval_status: PackageApprovalStatus;
  ad_spend_details?: AdSpendDetails;
  is_popular?: boolean;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDivision {
  id: string;
  name: string;
  slug: string; // e.g. 'build', 'secure', 'grow', 'influence', 'automate', 'intelligence', 'business-support', 'consulting-education'
  short_description: string;
  full_description: string;
  seo_title: string;
  seo_description: string;
  status: RecordStatus;
  display_order: number;
  icon_name?: string;
  created_at: string;
  updated_at: string;
  // Computed client-side
  published_service_count?: number;
}

export interface ServiceCatalogItem {
  id: string;
  division_id: string;
  service_name: string;
  slug: string;
  short_description: string;
  full_description: string;
  problems_solved: string[];
  target_customers: string[];
  benefits: string[];
  deliverables: string[];
  packages: ServicePackage[];
  process_steps: ProcessStep[];
  client_responsibilities: string[];
  exclusions: string[];
  additional_charges: string[];
  hero_image_url?: string;
  hero_image_alt?: string;
  gallery: string[];
  faqs: ServiceFaq[];
  seo_title: string;
  seo_description: string;
  social_image_url?: string;
  status: RecordStatus;
  display_order: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  // Metadata for legacy mappings & routing
  legacy_slugs?: string[];
  service_type?: 'custom-development' | 'consulting' | 'managed-support';
}

export interface ServiceRelation {
  id: string;
  service_id: string;
  related_service_id: string;
  relation_type: 'prerequisite' | 'recommended' | 'bundle' | 'next_step';
  display_order: number;
  created_at: string;
}

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'available' | 'in-pilot' | 'coming-soon';
  target_audience: string;
  key_capabilities: string[];
  cta_text: string;
  division_ref?: string;
}
