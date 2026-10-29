-- ============================================================================
-- Migration: 20261028_location_neutral_update.sql
-- Purpose: Position Unikorn360 around capabilities & customer needs without
--          restricting audience to Vaniyambadi, Tirupathur or Tamil Nadu.
--          Preserves statutory jurisdiction tags (TNPCB, NEEDS, State Subsidies)
--          and local campaign offerings (Hyperlocal, Local SEO).
-- ============================================================================

-- 1. Update Divisions SEO Descriptions
UPDATE service_divisions
SET 
  seo_description = 'Professional web development, custom internal software, and e-commerce portals for MSMEs, manufacturers, and growing businesses.',
  updated_at = NOW()
WHERE slug = 'build';

UPDATE service_divisions
SET 
  seo_description = 'Regulatory approvals, factory licence renewals, pollution control consents (CTE/CTO), and secure digital record vaults.',
  updated_at = NOW()
WHERE slug = 'secure';

UPDATE service_divisions
SET 
  seo_description = 'Bank project reports, working capital assessment, and government subsidy advisory for industrial growth.',
  updated_at = NOW()
WHERE slug = 'grow';

UPDATE service_divisions
SET 
  seo_description = 'Reliable monthly GST filings, company incorporation (Pvt Ltd / LLP), Udyam registration, and outsourced bookkeeping.',
  updated_at = NOW()
WHERE slug = 'business-support';

UPDATE service_divisions
SET 
  seo_description = 'Strategic business advisory, process documentation, cost-structure engineering, and founder training programs.',
  updated_at = NOW()
WHERE slug = 'consulting-education';

-- 2. Update Generic Service Catalog SEO Titles and Descriptions
UPDATE service_catalog
SET
  seo_description = 'Custom B2B websites for manufacturers, exporters, and engineering units. Drive qualified buyer inquiries with high-speed performance.',
  updated_at = NOW()
WHERE slug = 'modern-website';

UPDATE service_catalog
SET
  seo_description = 'Web-based quotation tools for manufacturers and engineering workshops with instant PDF export.',
  updated_at = NOW()
WHERE slug = 'quotation-pricing-tool';

UPDATE service_catalog
SET
  seo_description = 'Simple, effective CRM for MSMEs. Track inquiries, quotes, and samples with zero complexity.',
  updated_at = NOW()
WHERE slug = 'b2b-customer-crm';

UPDATE service_catalog
SET
  seo_description = 'Fast, cloud-backed billing and stock software for multi-godown businesses and wholesale distributors.',
  updated_at = NOW()
WHERE slug = 'billing-inventory-app';

UPDATE service_catalog
SET
  seo_description = 'Bank-ready Detailed Project Reports (DPR) for term loans, factory expansion, and government subsidies.',
  updated_at = NOW()
WHERE slug = 'bank-dpr-report';

UPDATE service_catalog
SET
  seo_description = 'RBI-standard CMA Data preparation for working capital renewals, CC limits, and loan enhancements.',
  updated_at = NOW()
WHERE slug = 'cma-data-preparation';

UPDATE service_catalog
SET
  seo_description = 'Working capital advisory, drawing power optimization, and bank loan enhancement for MSMEs.',
  updated_at = NOW()
WHERE slug = 'working-capital-optimization';

UPDATE service_catalog
SET
  seo_title = 'Industrial Project Feasibility Studies | Unikorn360 Grow',
  seo_description = 'Techno-commercial feasibility studies and manufacturing plant expansion advisory for industrial ventures.',
  updated_at = NOW()
WHERE slug = 'industrial-feasibility-study';

UPDATE service_catalog
SET
  seo_title = 'Corporate Identity & Brand Design | Unikorn360 Influence',
  seo_description = 'Professional logo design, corporate branding, and stationery systems for growing businesses.',
  updated_at = NOW()
WHERE slug = 'brand-identity-system';

UPDATE service_catalog
SET
  seo_description = 'Professional B2B corporate profiles, capability decks, and brochures for manufacturers and enterprises.',
  updated_at = NOW()
WHERE slug = 'b2b-corporate-deck';

UPDATE service_catalog
SET
  seo_title = 'Workflow Automation & Process Mapping | Unikorn360 Automate',
  seo_description = 'End-to-end workflow automation, webhook pipelines, and spreadsheet elimination for growing MSMEs.',
  updated_at = NOW()
WHERE slug = 'process-automation-audit';

UPDATE service_catalog
SET
  seo_description = 'Automated WhatsApp notification pipelines, dispatch alerts, and Meta Business API integration for businesses.',
  updated_at = NOW()
WHERE slug = 'whatsapp-business-pipeline';

UPDATE service_catalog
SET
  seo_description = 'Custom business dashboard software, live production displays, and operational management tooling.',
  updated_at = NOW()
WHERE slug = 'custom-dashboard-software';

UPDATE service_catalog
SET
  seo_description = 'Real-time executive dashboards, daily business intelligence, and promoter KPI cockpits for business leaders.',
  updated_at = NOW()
WHERE slug = 'promoter-cockpit-bi';

UPDATE service_catalog
SET
  seo_title = 'GST Registration for MSMEs | Unikorn360 Business Support',
  seo_description = 'Hassle-free GST registration for manufacturers, traders, and service providers. Fast approval in 3-7 days.',
  updated_at = NOW()
WHERE slug = 'gst-registration';

UPDATE service_catalog
SET
  seo_title = 'GST Return Filing Services (GSTR-1 & 3B) | Unikorn360 Business Support',
  seo_description = 'Accurate monthly GST return filing and GSTR-2B input tax credit reconciliation. Zero late fees and audit defense.',
  updated_at = NOW()
WHERE slug = 'gst-monthly-returns';

UPDATE service_catalog
SET
  seo_title = 'Udyam MSME Registration | Unikorn360 Business Support',
  seo_description = 'Official Udyam MSME registration for growing enterprises. Unlock priority lending, subsidies, and tender benefits.',
  updated_at = NOW()
WHERE slug = 'udyam-msme-registration';

UPDATE service_catalog
SET
  seo_title = 'Company Incorporation (Pvt Ltd / LLP) | Unikorn360 Business Support',
  seo_description = 'Fast Private Limited company and LLP registration with MCA, corporate name approval, DSC, and PAN/TAN.',
  updated_at = NOW()
WHERE slug = 'company-incorporation';

UPDATE service_catalog
SET
  seo_title = 'Outsourced Bookkeeping & Monthly MIS | Unikorn360 Business Support',
  seo_description = 'Professional monthly bookkeeping, bank reconciliation, ledger hygiene, and MIS reporting for MSMEs.',
  updated_at = NOW()
WHERE slug = 'monthly-bookkeeping-mis';

UPDATE service_catalog
SET
  seo_description = 'Comprehensive business diagnostic assessment for MSMEs. Systems audit, bottleneck analysis, and technical roadmap.',
  updated_at = NOW()
WHERE slug = 'business-diagnostic-verify';
