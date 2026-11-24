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
    src: '/assets/divisions/websites-software.webp',
    alt: 'UNIKORN360 Websites & Software Division Showcase — High-Speed Web & Custom Software',
    width: 1920,
    height: 1080,
    title: 'Websites & Software'
  },
  'security-maintenance': {
    slug: 'security-maintenance',
    src: '/assets/divisions/security-maintenance.webp',
    alt: 'UNIKORN360 Security & Maintenance Division Showcase — Application Security & Maintenance',
    width: 1920,
    height: 1080,
    title: 'Security & Maintenance'
  },
  'marketing-creator-campaigns': {
    slug: 'marketing-creator-campaigns',
    src: '/assets/divisions/marketing-creator-campaigns.webp',
    alt: 'UNIKORN360 Marketing & Creator Campaigns Division Showcase — Performance Marketing & Creator Campaigns',
    width: 1920,
    height: 1080,
    title: 'Marketing & Creator Campaigns'
  },
  'ai-automation-business-systems': {
    slug: 'ai-automation-business-systems',
    src: '/assets/divisions/ai-automation-business-systems.webp',
    alt: 'UNIKORN360 AI, Automation & Business Systems Division Showcase — Automated Workflows & Systems',
    width: 1920,
    height: 1080,
    title: 'AI, Automation & Business Systems'
  },
  'research-business-strategy': {
    slug: 'research-business-strategy',
    src: '/assets/divisions/research-business-strategy.webp',
    alt: 'UNIKORN360 Research & Business Strategy Division Showcase — Market Research & Feasibility',
    width: 1920,
    height: 1080,
    title: 'Research & Business Strategy'
  },
  'business-setup-documentation': {
    slug: 'business-setup-documentation',
    src: '/assets/divisions/business-setup-documentation.webp',
    alt: 'UNIKORN360 Business Setup & Documentation Division Showcase — DPRs, MSME, & Licensing',
    width: 1920,
    height: 1080,
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
