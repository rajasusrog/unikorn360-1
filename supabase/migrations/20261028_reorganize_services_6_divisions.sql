-- UNIKORN360: REORGANIZE SERVICES INTO 6 DIVISIONS & 37 SERVICES
-- Migration: 20261028_reorganize_services_6_divisions.sql
-- This migration supersedes the previous 8-division, 64-service schema.

BEGIN;

-- 1. Archive superseded divisions not in the new 6-division structure
UPDATE service_divisions
SET status = 'archived', updated_at = now()
WHERE slug NOT IN (
    'websites-software',
    'security-maintenance',
    'marketing-creator-campaigns',
    'ai-automation-business-systems',
    'research-business-strategy',
    'business-setup-documentation'
);

-- 2. Upsert the 6 Canonical Divisions
INSERT INTO service_divisions (id, name, slug, short_description, full_description, seo_title, seo_description, status, display_order, updated_at)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Websites & Software',
    'websites-software',
    'Build or improve a digital platform.',
    'Engineered web presences, custom SaaS products, mobile applications, e-commerce platforms, and API integration architectures designed for real-world enterprise operations.',
    'Websites & Software Engineering | Unikorn360',
    'Enterprise web development, custom software applications, mobile apps, e-commerce platforms, and API systems integrations.',
    'published',
    1,
    now()
),
(
    'a2000000-0000-0000-0000-000000000002',
    'Security & Maintenance',
    'security-maintenance',
    'Protect and maintain existing technology.',
    'Rigorous code security audits, API penetration tests, database access hardening, Supabase Row-Level Security verification, and continuous infrastructure maintenance.',
    'Security & Application Maintenance | Unikorn360',
    'Application security reviews, AI-generated code scrutiny, API penetration audits, database hardening, and uptime maintenance.',
    'published',
    2,
    now()
),
(
    'a3000000-0000-0000-0000-000000000003',
    'Marketing & Creator Campaigns',
    'marketing-creator-campaigns',
    'Get more customers, attention, or leads.',
    'Performance search engine optimization, regional creator and influencer activations, authentic UGC video production, paid advertising management, and conversion tracking.',
    'Marketing & Creator Campaigns | Unikorn360',
    'Local and national SEO, regional creator campaigns, UGC video production, performance advertising, and analytics reporting.',
    'published',
    3,
    now()
),
(
    'a4000000-0000-0000-0000-000000000004',
    'AI, Automation & Business Systems',
    'ai-automation-business-systems',
    'Reduce manual work and improve business operations.',
    'Enterprise workflow automation, custom AI assistants, WhatsApp Business API pipelines, automated document processing, CRM pipelines, and executive dashboards.',
    'AI Automation & Business Systems | Unikorn360',
    'Custom AI agents, workflow automation, WhatsApp Business integrations, document OCR processing, and unified executive dashboards.',
    'published',
    4,
    now()
),
(
    'a5000000-0000-0000-0000-000000000005',
    'Research & Business Strategy',
    'research-business-strategy',
    'Make better business decisions using research and data.',
    'Comprehensive market analysis, competitor intelligence, industry opportunity mapping, operational bottleneck diagnostics, bankable feasibility studies, and startup advisory.',
    'Research & Business Strategy | Unikorn360',
    'Market research, competitor analysis, operational performance audits, financial feasibility studies, and strategic growth advisory.',
    'published',
    5,
    now()
),
(
    'a6000000-0000-0000-0000-000000000006',
    'Business Setup & Documentation',
    'business-setup-documentation',
    'Handle business paperwork, registrations, and official documentation.',
    'Fast-track entity registration, GST & Udyam licensing, trademark filing coordination, bank-ready DPR and loan documentation, and government scheme application support.',
    'Business Setup & Documentation | Unikorn360',
    'Entity registration, GST & MSME Udyam, trademark filing, bankable DPR project reports, and subsidy scheme documentation.',
    'published',
    6,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order,
    updated_at = now();

-- 3. Archive any obsolete services that do not belong to the 37 canonical services
UPDATE service_catalog
SET status = 'archived', updated_at = now()
WHERE slug NOT IN (
    -- Websites & Software (6)
    'website-development',
    'ecommerce-development',
    'custom-web-applications',
    'mobile-app-development',
    'saas-mvp-development',
    'api-system-integration',

    -- Security & Maintenance (6)
    'website-application-security-review',
    'ai-generated-code-security-review',
    'api-security-review',
    'database-supabase-security-review',
    'cloud-server-hardening',
    'website-application-maintenance',

    -- Marketing & Creator Campaigns (6)
    'seo-local-search',
    'paid-advertising-management',
    'social-media-content-management',
    'ugc-content-production',
    'influencer-campaign-management',
    'marketing-tracking-reporting',

    -- AI, Automation & Business Systems (7)
    'ai-chatbots-knowledge-assistants',
    'custom-ai-agents',
    'business-workflow-automation',
    'crm-sales-automation',
    'whatsapp-business-automation',
    'document-processing-automation',
    'business-dashboards-reporting-systems',

    -- Research & Business Strategy (6)
    'market-customer-research',
    'competitor-advertising-research',
    'industry-opportunity-research',
    'business-performance-analysis',
    'business-planning-financial-feasibility',
    'startup-growth-consulting',

    -- Business Setup & Documentation (6)
    'business-registration-assistance',
    'gst-udyam-assistance',
    'trademark-filing-coordination',
    'government-scheme-application-support',
    'dpr-loan-documentation',
    'property-documentation-coordination'
);

COMMIT;
