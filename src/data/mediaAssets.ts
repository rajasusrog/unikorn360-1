import { ProductSlug } from './productsData';

export interface DivisionBannerAsset {
  slug: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
}

export interface ProductDesignAsset {
  slug: ProductSlug;
  src: string;
  alt: string;
  width: number;
  height: number;
  badgeLabel: string;
  detailCaption: string;
}

/**
 * Approved division conceptual banners mapped by division slug.
 */
export const DIVISION_BANNERS_BY_SLUG: Record<string, DivisionBannerAsset> = {
  'websites-software': {
    slug: 'websites-software',
    src: '/assets/aistudio/Websites___Software_Business_Banner_1f957045.png',
    alt: 'UNIKORN360 Websites & Software — Websites, E-commerce, Custom Apps, API Integrations',
    width: 1671,
    height: 941,
    title: 'Websites & Software'
  },
  'security-maintenance': {
    slug: 'security-maintenance',
    src: '/assets/aistudio/UNIKORN360_Security___Maintenance_4e04af48.png',
    alt: 'UNIKORN360 Security & Maintenance — Application Reviews, API Security, Database Checks, Ongoing Maintenance',
    width: 1672,
    height: 941,
    title: 'Security & Maintenance'
  },
  'marketing-creator-campaigns': {
    slug: 'marketing-creator-campaigns',
    src: '/assets/aistudio/Unikorn360_Creator_Campaigns_8215efbc.png',
    alt: 'UNIKORN360 Marketing & Creator Campaigns — SEO, Paid Ads, Social Content, UGC, Creator Collaborations',
    width: 1672,
    height: 941,
    title: 'Marketing & Creator Campaigns'
  },
  'ai-automation-business-systems': {
    slug: 'ai-automation-business-systems',
    src: '/assets/aistudio/UNIKORN360_Workflow_Intelligence_Infographic_923e96aa.png',
    alt: 'UNIKORN360 AI, Automation & Business Systems — AI Assistants, CRM, Connected Workflows with Human Oversight',
    width: 1671,
    height: 941,
    title: 'AI, Automation & Business Systems'
  },
  'research-business-strategy': {
    slug: 'research-business-strategy',
    src: '/assets/aistudio/Research___Business_Strategy_Dashboard_9b5f0bd0.png',
    alt: 'UNIKORN360 Research & Business Strategy — Market Research, Competitor Analysis, Feasibility, Business Planning',
    width: 1672,
    height: 941,
    title: 'Research & Business Strategy'
  },
  'business-setup-documentation': {
    slug: 'business-setup-documentation',
    src: '/assets/aistudio/Business_Setup___Documentation_4c96fd6d.png',
    alt: 'UNIKORN360 Business Setup & Documentation — Registration Assistance, DPR Preparation, Filing Coordination, Document Support',
    width: 1672,
    height: 941,
    title: 'Business Setup & Documentation'
  }
};

/**
 * Proposed UI design mockups mapped by product slug.
 * Clearly labeled as proposed interface designs, not current application screenshots.
 */
export const PRODUCT_DESIGNS_BY_SLUG: Record<ProductSlug, ProductDesignAsset> = {
  invoicepro360: {
    slug: 'invoicepro360',
    src: '/assets/products/invoicepro360-proposed-ui.webp',
    alt: 'InvoicePro360 Design Preview — Invoice Editor & Live Preview Workspace',
    width: 1672,
    height: 940,
    badgeLabel: 'Design preview',
    detailCaption: 'Design preview — illustrative workspace interface.'
  },
  deeds360: {
    slug: 'deeds360',
    src: '/assets/products/deeds360-proposed-ui.webp',
    alt: 'Deeds360 Design Preview — Bilingual Property Deed Drafting Workspace',
    width: 1672,
    height: 941,
    badgeLabel: 'Design preview',
    detailCaption: 'Design preview — illustrative workspace interface.'
  },
  property360: {
    slug: 'property360',
    src: '/assets/products/property360-proposed-ui.webp',
    alt: 'Property360 Design Preview — Case Review & Land Revenue Dossier Workspace',
    width: 1672,
    height: 940,
    badgeLabel: 'Design preview',
    detailCaption: 'Design preview — illustrative workspace interface.'
  },
  advocate360: {
    slug: 'advocate360',
    src: '/assets/products/advocate360-proposed-ui.webp',
    alt: 'Advocate360 Design Preview — Daily Legal Workspace & Today Dashboard',
    width: 1672,
    height: 941,
    badgeLabel: 'Design preview',
    detailCaption: 'Design preview — illustrative workspace interface.'
  }
};

/**
 * Helper to retrieve a division banner by slug with fallback guard
 */
export function getDivisionBanner(slug: string): DivisionBannerAsset | null {
  return DIVISION_BANNERS_BY_SLUG[slug] || null;
}

/**
 * Helper to retrieve a product proposed design asset by slug
 */
export function getProductDesign(slug: ProductSlug | string): ProductDesignAsset | null {
  return PRODUCT_DESIGNS_BY_SLUG[slug as ProductSlug] || null;
}
