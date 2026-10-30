export type ProductSlug = 'invoicepro360' | 'deeds360' | 'property360' | 'advocate360';

export interface ApprovedProductScreenshot {
  src: string;
  alt: string;
  caption?: string;
}

export interface ConfirmedProductPricingTier {
  planName: string;
  priceLabel: string;
  billingNote?: string;
  inclusions: string[];
}

export interface VerifiedProductFeature {
  title: string;
  description: string;
}

export interface ProductFaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Capabilities & Scope' | 'Access & Boundaries' | 'Demo & Onboarding';
}

export interface UnikornProduct {
  id: string;
  slug: ProductSlug;
  name: string;
  path: string;
  appUrl: string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  intendedUsers: string[];
  verifiedFeatures: VerifiedProductFeature[];
  /**
   * Populated only when approved product screenshots are provided.
   * Empty array omits the screenshot gallery rather than rendering placeholders.
   */
  approvedScreenshots: ApprovedProductScreenshot[];
  /**
   * Populated only when public commercial pricing is confirmed.
   * Null omits pricing tables rather than publishing unconfirmed rates.
   */
  confirmedPricing: ConfirmedProductPricingTier[] | null;
  faqs: ProductFaqItem[];
  relatedProductSlugs: ProductSlug[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

/**
 * Verified FAQ data structure for each of the four UNIKORN360 products.
 * Grounded strictly in confirmed application capabilities and security boundaries.
 */
export const PRODUCT_FAQS_BY_SLUG: Record<ProductSlug, ProductFaqItem[]> = {
  invoicepro360: [
    {
      id: 'faq-invoicepro360-capabilities',
      category: 'Capabilities & Scope',
      question: 'What invoice and GST validation workflows are supported in InvoicePro360?',
      answer:
        'InvoicePro360 provides a workspace to draft structured tax invoices, scan uploaded business invoices for OCR line-item extraction, and validate GSTIN formats, HSN codes, and state-wise CGST, SGST, and IGST tax breakdowns.'
    },
    {
      id: 'faq-invoicepro360-payments-queries',
      category: 'Capabilities & Scope',
      question: 'Can I record invoice payments and search ledger records in InvoicePro360?',
      answer:
        'Yes. You can log payment transactions with transaction or UTR reference numbers, track remaining balances due per invoice, and run plain-English queries to filter invoices by vendor, customer, amount, or tax discrepancies.'
    },
    {
      id: 'faq-invoicepro360-access',
      category: 'Access & Boundaries',
      question: 'How do I access the InvoicePro360 web application?',
      answer:
        'You can launch the standalone web application directly at https://invoicepro360.unikorn360.com/ using the "Open App" button on this page.'
    },
    {
      id: 'faq-invoicepro360-auth-boundary',
      category: 'Access & Boundaries',
      question: 'Does InvoicePro360 share login credentials with the UNIKORN360 company website?',
      answer:
        'No. InvoicePro360 operates as an independent web application with its own authentication and isolated database workspace. No passwords, access tokens, or personal information are transferred through links from this website.'
    },
    {
      id: 'faq-invoicepro360-demo',
      category: 'Demo & Onboarding',
      question: 'How can our team request a guided product walkthrough or commercial plan details?',
      answer:
        'Click the "Request a Demo" button on this page to submit your inquiry through the standard UNIKORN360 project enquiry workflow.'
    }
  ],
  deeds360: [
    {
      id: 'faq-deeds360-deed-types',
      category: 'Capabilities & Scope',
      question: 'Which Tamil Nadu property deed categories does Deeds360 support?',
      answer:
        'Deeds360 supports guided bilingual (English and Tamil) drafting workflows for Sale Deeds, Gift Deeds, Settlement Deeds, Mortgage Deeds, Lease Deeds, Release Deeds, Power of Attorney, and Cancellation Deeds.'
    },
    {
      id: 'faq-deeds360-ocr-comparison',
      category: 'Capabilities & Scope',
      question: 'How does Deeds360 verify parent deeds and property schedules?',
      answer:
        'Deeds360 includes a scanned parent-deed OCR reader to extract party and survey variables, side-by-side comparison between historical parent deeds and new drafts, and cross-verification between body text and property schedules for Survey Numbers, Patta numbers, sub-divisions, and party names.'
    },
    {
      id: 'faq-deeds360-stamp-duty',
      category: 'Capabilities & Scope',
      question: 'Are stamp duty and registration fee estimates in Deeds360 a substitute for Sub-Registrar verification?',
      answer:
        'No. Stamp duty and registration fee calculations (including family-line settlement concession estimates) are provided for drafting preparation and must be verified at the Sub-Registrar Office (SRO) counter prior to registration.'
    },
    {
      id: 'faq-deeds360-access-boundary',
      category: 'Access & Boundaries',
      question: 'Where is Deeds360 hosted and how is account sign-in handled?',
      answer:
        'Deeds360 is hosted at https://deeds360.unikorn360.com/ as a standalone web application with its own independent authentication and database environment separate from the UNIKORN360 company website.'
    },
    {
      id: 'faq-deeds360-demo',
      category: 'Demo & Onboarding',
      question: 'How do I schedule a demonstration of Deeds360 for our documentation office?',
      answer:
        'Select "Request a Demo" on this page to coordinate a guided walkthrough through the UNIKORN360 enquiry desk.'
    }
  ],
  property360: [
    {
      id: 'faq-property360-analysis',
      category: 'Capabilities & Scope',
      question: 'How does Property360 evaluate property, land revenue, and legal disputes?',
      answer:
        'Property360 accepts natural-language dispute descriptions, classifies the applicable statutory domains (including Property & Land Revenue and Succession), prompts for domain-specific details such as Survey Numbers and Patta stages, and maps applicable statutes and High Court / Supreme Court precedents into a structured case dossier.'
    },
    {
      id: 'faq-property360-languages-exports',
      category: 'Capabilities & Scope',
      question: 'What languages and PDF export formats are available in Property360?',
      answer:
        'Property360 supports bilingual Tamil and English case analysis and provides PDF export options for the Complete Case Report, Client Action Plan, and draft Legal Notices or Petitions.'
    },
    {
      id: 'faq-property360-legal-disclaimer',
      category: 'Capabilities & Scope',
      question: 'Are outputs generated in Property360 a substitute for formal representation by an advocate?',
      answer:
        'No. Property360 generates structured legal intelligence dossiers and draft documents for evaluation and preparation, with formal advocate review recommended before filing.'
    },
    {
      id: 'faq-property360-access-boundary',
      category: 'Access & Boundaries',
      question: 'How do I open Property360 and is login shared with this website?',
      answer:
        'Click "Open App" to launch https://property360.unikorn360.com/ in a new tab. Property360 manages user authentication and case records independently; no credentials or session tokens are shared with the UNIKORN360 company website.'
    },
    {
      id: 'faq-property360-demo',
      category: 'Demo & Onboarding',
      question: 'How can I request a guided walkthrough of Property360?',
      answer:
        'Use the "Request a Demo" button on this page to contact the UNIKORN360 advisory desk via our project enquiry flow.'
    }
  ],
  advocate360: [
    {
      id: 'faq-advocate360-workflows',
      category: 'Capabilities & Scope',
      question: 'What chamber management and legal intelligence workflows are included in Advocate360?',
      answer:
        'Advocate360 combines a daily chamber overview ("Today"), matter files, and task management with case analysis, legal research, legal drafting, evidence scoring, contradiction detection, and statutory mapping across BNS, BNSS, BSA, and CPC.'
    },
    {
      id: 'faq-advocate360-quick-notes',
      category: 'Capabilities & Scope',
      question: 'How do Urgent Quick Notes and Voice Dictation work in Advocate360?',
      answer:
        'Advocates can capture voice-to-text or typed quick notes for hearing preparation, cross-examination points, or client instructions, and either map them to specific case matters or convert them into actionable chamber tasks.'
    },
    {
      id: 'faq-advocate360-translation-memory',
      category: 'Capabilities & Scope',
      question: 'How does the Legal Translation Memory (TM) handle identifiers during bilingual conversion?',
      answer:
        'Advocate360 supports canonical English, target-language, and side-by-side bilingual reports while protecting non-translatable identifiers such as dates, survey numbers, Patta/document numbers, statutory section citations, and monetary values.'
    },
    {
      id: 'faq-advocate360-access-boundary',
      category: 'Access & Boundaries',
      question: 'What is the direct application link for Advocate360 and how are chamber workspaces isolated?',
      answer:
        'Advocate360 opens directly at https://advocate360.unikorn360.com/app/today via the "Open App" button. It operates as an independent application with its own authentication and isolated chamber workspace separate from the UNIKORN360 website.'
    },
    {
      id: 'faq-advocate360-demo',
      category: 'Demo & Onboarding',
      question: 'How can a law chamber request a demonstration of Advocate360?',
      answer:
        'Click "Request a Demo" on this page to schedule a walkthrough through the UNIKORN360 enquiry workflow.'
    }
  ]
};

export const UNIKORN_FOUR_PRODUCTS: UnikornProduct[] = [
  {
    id: 'prod-invoicepro360',
    slug: 'invoicepro360',
    name: 'InvoicePro360',
    path: '/products/invoicepro360',
    appUrl: 'https://invoicepro360.unikorn360.com/',
    categoryLabel: 'Business Invoicing & Ledger Workspace',
    shortDescription:
      'AI workspace for business invoices to create, scan, extract, validate GST tax breakdowns, track payment balances, and query invoice records.',
    fullDescription:
      'InvoicePro360 is a dedicated UNIKORN360 web application built for creating, scanning, extracting, validating, and querying business invoices. Teams can draft structured tax invoices, extract line-item details from uploaded invoice files via OCR, verify GSTIN and HSN tax splits (CGST, SGST, and IGST), record partial or full payment transactions with UTR references, and query ledger records in plain English.',
    intendedUsers: [
      'Business owners and finance teams preparing and tracking GST tax invoices',
      'Accounts and billing operators extracting line-item data from vendor and customer bills',
      'Commercial operations teams reconciling invoice balances and payment transaction references'
    ],
    verifiedFeatures: [
      {
        title: 'Invoice Creation & Structured Line-Item Drafting',
        description:
          'Create tax invoices and structure itemized billing records within an isolated workspace.'
      },
      {
        title: 'Invoice Scanning & OCR Line-Item Extraction',
        description:
          'Scan uploaded business invoices to extract vendor, customer, and line-item details into structured fields.'
      },
      {
        title: 'GSTIN, HSN & Tax Breakdown Validation',
        description:
          'Check GSTIN format rules, HSN codes, and state-wise CGST, SGST, and IGST tax calculations across invoice records.'
      },
      {
        title: 'Payment Ledger & Balance-Due Tracking',
        description:
          'Record invoice payments with transaction or UTR reference numbers and track remaining balances per invoice.'
      },
      {
        title: 'Plain-English Invoice Ledger Queries',
        description:
          'Search and filter invoice records by vendor, customer, threshold amount, or tax discrepancies using natural-language queries.'
      }
    ],
    approvedScreenshots: [],
    confirmedPricing: null,
    faqs: PRODUCT_FAQS_BY_SLUG.invoicepro360,
    relatedProductSlugs: ['deeds360', 'property360', 'advocate360'],
    seoTitle: 'InvoicePro360 — Business Invoice & GST Ledger Workspace | UNIKORN360',
    seoDescription:
      'Create, scan, extract, validate, and query business invoices with InvoicePro360 by UNIKORN360. Explore verified capabilities or open the web application.',
    canonicalUrl: 'https://www.unikorn360.com/products/invoicepro360'
  },
  {
    id: 'prod-deeds360',
    slug: 'deeds360',
    name: 'Deeds360',
    path: '/products/deeds360',
    appUrl: 'https://deeds360.unikorn360.com/',
    categoryLabel: 'Property Deed Drafting & Registration Readiness',
    shortDescription:
      'Bilingual (English and Tamil) property deed drafting, scanned parent-deed OCR extraction, draft comparison, and Tamil Nadu STAR 2.0 readiness workspace.',
    fullDescription:
      'Deeds360 (DeedOS360) is a UNIKORN360 property documentation and deed-drafting application engineered for Tamil Nadu registration workflows. It combines guided client intake with OCR extraction from scanned parent deeds, side-by-side comparison between parent deeds and new drafts, schedule and survey-number cross-verification, stamp duty and registration fee estimation, and English–Tamil legal deed translation.',
    intendedUsers: [
      'Document writers and property registration practitioners preparing sub-registrar submissions',
      'Legal professionals drafting and auditing Sale, Gift, Settlement, Lease, Mortgage, and Release deeds',
      'Property documentation teams cross-checking parent deeds, survey numbers, and property schedules'
    ],
    verifiedFeatures: [
      {
        title: 'Guided Multi-Deed Drafting Workflows',
        description:
          'Structured drafting support for Sale Deeds, Gift Deeds, Settlement Deeds, Mortgage Deeds, Lease Deeds, Release Deeds, Power of Attorney, and Cancellation Deeds.'
      },
      {
        title: 'Scanned Parent-Deed OCR Extraction',
        description:
          'Extract structured party names, survey numbers, and schedule variables from uploaded PDF or scanned Tamil and English parent deeds.'
      },
      {
        title: 'Parent Deed vs. New Draft Side-by-Side Comparison',
        description:
          'Compare historical parent deeds against new draft deeds to identify clause changes, survey sub-division updates, extent variations, and boundary shifts.'
      },
      {
        title: 'Schedule, Survey & Party Name Cross-Verification',
        description:
          'Verify body text against schedule text for Survey Numbers, Patta numbers, sub-divisions, and consistent party name spelling across pages.'
      },
      {
        title: 'Tamil Nadu Stamp Duty & Registration Fee Estimator',
        description:
          'Estimate Tamil Nadu stamp duty and registration fees across deed categories, including family-line settlement concession calculations.'
      },
      {
        title: 'Bilingual English ↔ Tamil Legal Translation & Clause Audit',
        description:
          'Translate deed drafts between English and Tamil while checking mandatory covenants such as possession, indemnity, consideration, witness, and schedule clauses.'
      }
    ],
    approvedScreenshots: [],
    confirmedPricing: null,
    faqs: PRODUCT_FAQS_BY_SLUG.deeds360,
    relatedProductSlugs: ['property360', 'advocate360', 'invoicepro360'],
    seoTitle: 'Deeds360 — Bilingual Property Deed Drafting & OCR Workspace | UNIKORN360',
    seoDescription:
      'Draft and review Tamil Nadu property deeds in English and Tamil with Deeds360 by UNIKORN360. Includes parent-deed OCR, schedule verification, and fee estimation.',
    canonicalUrl: 'https://www.unikorn360.com/products/deeds360'
  },
  {
    id: 'prod-property360',
    slug: 'property360',
    name: 'Property360',
    path: '/products/property360',
    appUrl: 'https://property360.unikorn360.com/',
    categoryLabel: 'Property, Land Revenue & Multi-Domain Legal Analysis',
    shortDescription:
      'Bilingual (Tamil and English) property, land revenue, and multi-domain legal case evaluation, statutory mapping, and structured dossier generation system.',
    fullDescription:
      'Property360 is a UNIKORN360 property, land revenue, and multi-domain legal case analysis system with bilingual Tamil and English support. It takes natural-language dispute descriptions, identifies the relevant statutory domains, prompts for domain-specific records (such as Survey Numbers, Patta transfer stages, or succession documents), maps applicable statutes and High Court / Supreme Court precedents, and compiles structured case dossiers and action plans.',
    intendedUsers: [
      'Property owners and families assessing land revenue, Patta transfer, survey demarcation, or inheritance disputes',
      'Legal consultants and practitioners preparing structured statutory and precedent evaluations',
      'Domestic and NRI property holders organizing documentation for property and regulatory matters'
    ],
    verifiedFeatures: [
      {
        title: 'Natural-Language Dispute Intake & Domain Triage',
        description:
          'Submit property and legal dispute facts in natural language to classify applicable domains including Property & Land Revenue, Succession, and cross-statute matters.'
      },
      {
        title: 'Dynamic Domain-Specific Intake Prompts',
        description:
          'Guided follow-up questions tailored to the matter type, such as Survey Numbers, Tahsildar Patta inquiry stages, legal heir records, or regulatory notice timelines.'
      },
      {
        title: 'Cross-Law Statutory & Precedent Mapping',
        description:
          'Synthesizes relevant statutory provisions, Tamil Nadu Revenue Standing Orders, Registration Act circulars, and Supreme Court / Madras High Court precedents.'
      },
      {
        title: 'Structured Multi-Stage Case Dossiers',
        description:
          'Organizes case evaluations across structured stages covering risk and limitation assessment, document checklists, and procedural routes.'
      },
      {
        title: 'Bilingual (Tamil & English) Reports & PDF Exports',
        description:
          'Generate and export case reports, client action plans, and draft legal notices or petitions in Tamil and English.'
      }
    ],
    approvedScreenshots: [],
    confirmedPricing: null,
    faqs: PRODUCT_FAQS_BY_SLUG.property360,
    relatedProductSlugs: ['deeds360', 'advocate360', 'invoicepro360'],
    seoTitle: 'Property360 — Property, Land Revenue & Legal Case Analysis | UNIKORN360',
    seoDescription:
      'Evaluate property, land revenue, Patta, and multi-domain legal matters in Tamil and English with Property360 by UNIKORN360. View verified features or open the app.',
    canonicalUrl: 'https://www.unikorn360.com/products/property360'
  },
  {
    id: 'prod-advocate360',
    slug: 'advocate360',
    name: 'Advocate360',
    path: '/products/advocate360',
    appUrl: 'https://advocate360.unikorn360.com/app/today',
    categoryLabel: 'Legal Chamber Workspace & Editorial Legal Intelligence',
    shortDescription:
      'Chamber practice management, daily matter overview, case analysis, legal drafting, evidence scoring, and multilingual legal translation for advocates.',
    fullDescription:
      'Advocate360 is a UNIKORN360 legal workspace and practice management platform designed for advocates and litigation chambers. Centering on a daily chamber overview ("Today"), it brings together case analysis, legal research, legal drafting, evidence scoring, contradiction detection, voice and text quick notes mapped to specific matters, and a Legal Translation Memory (TM) engine that preserves statutory and numerical identifiers across Indian languages.',
    intendedUsers: [
      'Practising advocates and litigation chambers managing daily hearings, case files, and chamber tasks',
      'Senior and junior counsel conducting case analysis, contradiction checks, evidence scoring, and legal drafting',
      'Legal teams preparing side-by-side bilingual or multilingual case reports and filings'
    ],
    verifiedFeatures: [
      {
        title: 'Chamber "Today" Overview & Matter Task Management',
        description:
          'Manage active case matters, daily chamber priorities, and actionable tasks inside an isolated chamber workspace.'
      },
      {
        title: 'Case Analysis, Evidence Scoring & Contradiction Detection',
        description:
          'Analyze case facts, score supporting evidence, detect contradictions across statements, and prepare structured legal research.'
      },
      {
        title: 'Statutory & Procedural Drafting Support',
        description:
          'Supports legal drafting and statutory mapping across BNS (Bharatiya Nyaya Sanhita), BNSS (Bharatiya Nagarik Suraksha Sanhita), BSA (Bharatiya Sakshya Adhiniyam), and CPC petitions.'
      },
      {
        title: 'Urgent Quick Notes & Voice-to-Text Dictation',
        description:
          'Capture voice or text memos for cross-examination points or client instructions, assign them to specific case matters, or convert them into chamber tasks.'
      },
      {
        title: 'Legal Translation Memory (TM) with Identifier Protection',
        description:
          'Generate canonical English, target-language, or side-by-side bilingual reports while preserving dates, survey numbers, Patta/document numbers, section citations, and monetary values.'
      }
    ],
    approvedScreenshots: [],
    confirmedPricing: null,
    faqs: PRODUCT_FAQS_BY_SLUG.advocate360,
    relatedProductSlugs: ['property360', 'deeds360', 'invoicepro360'],
    seoTitle: 'Advocate360 — Chamber Workspace & Legal Intelligence Platform | UNIKORN360',
    seoDescription:
      'Practice management, case analysis, legal drafting, evidence scoring, and bilingual legal translation for advocates with Advocate360 by UNIKORN360.',
    canonicalUrl: 'https://www.unikorn360.com/products/advocate360'
  }
];

export const PRODUCTS_BY_SLUG: Record<string, UnikornProduct> = UNIKORN_FOUR_PRODUCTS.reduce(
  (acc, product) => {
    acc[product.slug] = product;
    return acc;
  },
  {} as Record<string, UnikornProduct>
);
