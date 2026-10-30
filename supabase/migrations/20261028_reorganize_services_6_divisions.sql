-- UNIKORN360: REORGANIZE SERVICES INTO 6 DIVISIONS & 37 SERVICES
-- Migration: 20261028_reorganize_services_6_divisions.sql
-- This migration supersedes the previous 8-division, 64-service schema.

BEGIN;

-- 1. Archive old divisions that are being replaced or merged
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

-- 2. Upsert the 6 Canonical Divisions with updated names, descriptions, and SEO metadata
INSERT INTO service_divisions (id, name, slug, short_description, full_description, seo_title, seo_description, status, display_order, updated_at)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Websites & Software',
    'websites-software',
    'Custom websites, e-commerce stores, web applications, mobile apps, SaaS MVPs, and API integrations.',
    'Build or improve your digital platform. We architect and engineer high-performance web software, e-commerce ordering platforms, custom business tools, mobile apps, and robust API integrations designed specifically around your real-world business workflows.',
    'Websites, E-Commerce & Custom Software Development | Unikorn360',
    'Professional website development, e-commerce stores, custom web applications, mobile apps, SaaS MVPs, and API integrations for growing businesses.',
    'published',
    1,
    now()
),
(
    'a2000000-0000-0000-0000-000000000002',
    'Security & Maintenance',
    'security-maintenance',
    'Application security reviews, AI code audits, API security, database reviews, server hardening, and maintenance.',
    'Protect and maintain existing technology. We evaluate web applications, review AI-generated code for production risks, audit APIs and database security, harden cloud servers, and provide dependable ongoing technical maintenance.',
    'Application Security Reviews & Technical Maintenance | Unikorn360',
    'Website and application security reviews, AI-generated code audits, API security, database reviews, server hardening, and ongoing maintenance retainers.',
    'published',
    2,
    now()
),
(
    'a3000000-0000-0000-0000-000000000003',
    'Marketing & Creator Campaigns',
    'marketing-creator-campaigns',
    'SEO, paid advertising management, social media content, UGC production, and creator campaign management.',
    'Attract customers and build market visibility. We deliver technical and local SEO, paid advertising management across Meta and Google, social media content calendars, authentic UGC video assets, and regional creator campaign management.',
    'SEO, Paid Advertising & Creator Campaign Management | Unikorn360',
    'Technical and local search SEO, Meta and Google ads management, social media management, UGC video production, and regional creator campaigns.',
    'published',
    3,
    now()
),
(
    'a4000000-0000-0000-0000-000000000004',
    'AI, Automation & Business Systems',
    'ai-automation-business-systems',
    'AI chatbots, custom AI agents, business workflow automation, CRM, WhatsApp automation, and executive dashboards.',
    'Reduce manual work and improve operations. We build conversational knowledge assistants, custom AI agents with human approval loops, cross-tool workflow automations, CRM pipelines, official WhatsApp automation, and executive dashboard systems.',
    'AI Automation, Custom Agents & Business Systems | Unikorn360',
    'AI chatbots, custom AI agents, cross-tool workflow automation, CRM automation, WhatsApp Business systems, and real-time executive dashboards.',
    'published',
    4,
    now()
),
(
    'a5000000-0000-0000-0000-000000000005',
    'Research & Business Strategy',
    'research-business-strategy',
    'Market research, competitor analysis, industry trends, performance diagnostics, feasibility, and growth consulting.',
    'Understand opportunities and make informed business decisions. We conduct customer and competitor research, analyze business performance and margins, prepare commercial feasibility plans, and advise founders on operational growth.',
    'Business Research, Performance Analysis & Strategy Consulting | Unikorn360',
    'Customer research, competitor and advertising intelligence, business performance analysis, financial feasibility models, and startup consulting.',
    'published',
    5,
    now()
),
(
    'a6000000-0000-0000-0000-000000000006',
    'Business Setup & Documentation',
    'business-setup-documentation',
    'Company registration, GST & Udyam, trademark filing coordination, government schemes, DPRs, and property documentation.',
    'Establish the business and prepare required documentation. We support business incorporation, GST and Udyam MSME priority registration, trademark filing coordination, government subsidy applications, bank-ready DPRs, and commercial property documentation.',
    'Business Registration, GST, DPR & Documentation Support | Unikorn360',
    'Incorporation assistance, GST and Udyam registration, trademark filing coordination, DPR loan reports, government subsidy support, and property documentation.',
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
    status = 'published',
    display_order = EXCLUDED.display_order,
    updated_at = now();

-- 3. Archive any legacy services not part of the new 37-service catalog
UPDATE service_catalog
SET status = 'archived', updated_at = now()
WHERE slug NOT IN (
    'website-development', 'ecommerce-development', 'custom-web-applications', 'mobile-app-development', 'saas-mvp-development', 'api-system-integration',
    'website-application-security-review', 'ai-generated-code-security-review', 'api-security-review', 'database-supabase-security-review', 'cloud-server-hardening', 'website-application-maintenance',
    'seo-local-search', 'paid-advertising-management', 'social-media-content-management', 'ugc-content-production', 'influencer-campaign-management', 'marketing-tracking-reporting',
    'ai-chatbots-knowledge-assistants', 'custom-ai-agents', 'business-workflow-automation', 'crm-sales-automation', 'whatsapp-business-automation', 'document-processing-automation', 'business-dashboards-reporting-systems',
    'market-customer-research', 'competitor-advertising-research', 'industry-opportunity-research', 'business-performance-analysis', 'business-planning-financial-feasibility', 'startup-growth-consulting',
    'business-registration-assistance', 'gst-udyam-assistance', 'trademark-filing-coordination', 'government-scheme-application-support', 'dpr-loan-documentation', 'property-documentation-coordination'
);

COMMIT;
