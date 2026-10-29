export type ServiceCategory = 
  | 'bi-dashboards'
  | 'websites-ecommerce'
  | 'custom-apps'
  | 'ai-automation'
  | 'business-operations'
  | 'finance-compliance'
  // Legacy / alias categories for backwards compatibility
  | 'compliance'
  | 'finance'
  | 'consulting'
  | 'systems'
  | 'branding'
  | 'project'
  | 'documentation';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  subtitle: string;
  tagline?: string;
  description: string;
  scopeList: string[];
  deliverables: string[];
  typicalTimeline: string;
  targetAudience: string[];
  serviceType?: 'custom-development' | 'consulting' | 'managed-support';
  relatedServices?: string[];
  isPopular?: boolean;
}

export interface EngagementModel {
  id: 'verify' | 'protect' | 'guardian';
  name: string;
  tagline: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  bestFor: string;
  ctaText: string;
  badge?: string;
  accentColor: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  fullName: string;
  subsidyAmount: string;
  eligibility: string;
  purpose: string;
  ourRole: string[];
  keyHighlights: string[];
}

export interface WizardState {
  step: number;
  primaryArea: string;
  businessType: string;
  currentBottleneck: string;
  recommendedPathway?: 'verify' | 'protect' | 'guardian';
  recommendedServices?: string[];
}

export interface ReviewRequestForm {
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  location: string;
  primaryNeed: string;
  currentSituation: string;
  existingRegistrations: string[];
  urgency: 'urgent' | 'regular' | 'planning';
  meetingMode: 'office' | 'phone' | 'virtual';
  notes: string;
}

export interface ExampleSolution {
  id: string;
  title: string;
  category: string;
  scopeType: 'Custom Development' | 'Consulting & Setup' | 'Integrated Systems';
  summary: string;
  keyFeatures: string[];
  idealFor: string;
  disclaimer: string;
}
