-- ============================================================================
-- UNIKORN360: STEP 1C — EVALUATOR NESTED-JSON PRIVACY & SAFE 37-SERVICE SEED
-- Migration: 20261101_step1c_evaluator_nested_json_and_catalog_seed.sql
--
-- Purpose:
-- 1. Enforce strict allowlist and scalar-type projection on all JSONB columns
--    returned by public.get_creator_applications_for_evaluator() so nested
--    objects, arrays, or unapproved keys inside expected_rates,
--    audience_insights, previous_collaborations, or string-array columns can
--    never leak financial amounts, UTRs, or internal notes to evaluators.
-- 2. Reconcile and seed the 6 canonical service divisions and 37 canonical
--    services into public.service_divisions and public.service_catalog
--    NON-DESTRUCTIVELY:
--    - Existing rows and edits are preserved (ON CONFLICT DO NOTHING / WHERE NOT EXISTS).
--    - Existing draft/archived services are never overwritten or auto-published.
--    - Newly inserted services are set to 'published' ONLY if seed_status is
--      'published' AND all packages have approval_status = 'approved';
--      otherwise they remain 'draft'.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: STEP 1C EVALUATOR NESTED-JSON PROJECTION HELPERS & RPC
-- ============================================================================

-- 1A. Project JSONB string arrays: keep only primitive string elements in order
CREATE OR REPLACE FUNCTION public.project_jsonb_string_array_for_evaluator(raw_arr JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN raw_arr IS NULL OR jsonb_typeof(raw_arr) <> 'array' THEN '[]'::jsonb
        ELSE COALESCE(
            (
                SELECT jsonb_agg(elem ORDER BY ord ASC)
                FROM jsonb_array_elements(
                    CASE WHEN jsonb_typeof(raw_arr) = 'array' THEN raw_arr ELSE '[]'::jsonb END
                ) WITH ORDINALITY AS t(elem, ord)
                WHERE jsonb_typeof(elem) = 'string'
            ),
            '[]'::jsonb
        )
    END;
$$;

REVOKE ALL ON FUNCTION public.project_jsonb_string_array_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_jsonb_string_array_for_evaluator(JSONB) TO authenticated;

-- 1B. Project expected_rates: allowlist 5 rate keys with primitive string/number values only
CREATE OR REPLACE FUNCTION public.project_expected_rates_for_evaluator(raw_obj JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN raw_obj IS NULL OR jsonb_typeof(raw_obj) <> 'object' THEN '{}'::jsonb
        ELSE COALESCE(
            (
                SELECT jsonb_object_agg(k, v)
                FROM jsonb_each(
                    CASE WHEN jsonb_typeof(raw_obj) = 'object' THEN raw_obj ELSE '{}'::jsonb END
                ) AS t(k, v)
                WHERE k IN ('ugc', 'sponsoredReel', 'story', 'additionalProduction', 'onLocationDaily')
                  AND jsonb_typeof(v) IN ('string', 'number')
            ),
            '{}'::jsonb
        )
    END;
$$;

REVOKE ALL ON FUNCTION public.project_expected_rates_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_expected_rates_for_evaluator(JSONB) TO authenticated;

-- 1C. Project audience_insights: allowlist 5 insight keys with primitive string/number (or string[] for topLocations)
CREATE OR REPLACE FUNCTION public.project_audience_insights_for_evaluator(raw_obj JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN raw_obj IS NULL OR jsonb_typeof(raw_obj) <> 'object' THEN '{}'::jsonb
        ELSE COALESCE(
            (
                SELECT jsonb_object_agg(
                    k,
                    CASE
                        WHEN k = 'topLocations' AND jsonb_typeof(v) = 'array'
                            THEN public.project_jsonb_string_array_for_evaluator(v)
                        ELSE v
                    END
                )
                FROM jsonb_each(
                    CASE WHEN jsonb_typeof(raw_obj) = 'object' THEN raw_obj ELSE '{}'::jsonb END
                ) AS t(k, v)
                WHERE (
                    k IN ('gender', 'age', 'genderBreakdown', 'topAgeGroup')
                    AND jsonb_typeof(v) IN ('string', 'number')
                ) OR (
                    k = 'topLocations'
                    AND jsonb_typeof(v) IN ('string', 'array')
                )
            ),
            '{}'::jsonb
        )
    END;
$$;

REVOKE ALL ON FUNCTION public.project_audience_insights_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_audience_insights_for_evaluator(JSONB) TO authenticated;

-- 1D. Project previous_collaborations: allowlist hasPrior (boolean) and details (string) only
CREATE OR REPLACE FUNCTION public.project_previous_collaborations_for_evaluator(raw_obj JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN raw_obj IS NULL OR jsonb_typeof(raw_obj) <> 'object' THEN '{}'::jsonb
        ELSE COALESCE(
            (
                SELECT jsonb_object_agg(k, v)
                FROM jsonb_each(
                    CASE WHEN jsonb_typeof(raw_obj) = 'object' THEN raw_obj ELSE '{}'::jsonb END
                ) AS t(k, v)
                WHERE (k = 'hasPrior' AND jsonb_typeof(v) = 'boolean')
                   OR (k = 'details' AND jsonb_typeof(v) = 'string')
            ),
            '{}'::jsonb
        )
    END;
$$;

REVOKE ALL ON FUNCTION public.project_previous_collaborations_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_previous_collaborations_for_evaluator(JSONB) TO authenticated;

-- 1E. Replace public.get_creator_applications_for_evaluator() with full nested-JSON projection
DROP FUNCTION IF EXISTS public.get_creator_applications_for_evaluator();

CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()
RETURNS TABLE (
    id UUID,
    application_reference VARCHAR(50),
    full_name VARCHAR(255),
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    state VARCHAR(100),
    district VARCHAR(100),
    town VARCHAR(150),
    contact_language VARCHAR(50),
    social_platforms JSONB,
    instagram_url TEXT,
    youtube_url TEXT,
    other_profile_urls JSONB,
    follower_count VARCHAR(50),
    subscriber_count VARCHAR(50),
    average_views VARCHAR(100),
    publishing_frequency VARCHAR(100),
    creator_categories JSONB,
    languages JSONB,
    dialects JSONB,
    creator_classification VARCHAR(50),
    audience_location TEXT,
    audience_insights JSONB,
    collaboration_preferences JSONB,
    expected_rates JSONB,
    travel_availability VARCHAR(100),
    previous_collaborations JSONB,
    portfolio_urls JSONB,
    privacy_consent BOOLEAN,
    contact_consent BOOLEAN,
    brand_sharing_consent BOOLEAN,
    application_status VARCHAR(50),
    campaign_matches JSONB,
    activity_log JSONB,
    latest_score NUMERIC(5,2),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_creator_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator membership required';
    END IF;

    RETURN QUERY
    SELECT
        ca.id,
        ca.application_reference,
        ca.full_name,
        ca.whatsapp_number,
        ca.email,
        ca.state,
        ca.district,
        ca.town,
        ca.contact_language,
        public.project_jsonb_string_array_for_evaluator(ca.social_platforms) AS social_platforms,
        ca.instagram_url,
        ca.youtube_url,
        public.project_jsonb_string_array_for_evaluator(ca.other_profile_urls) AS other_profile_urls,
        ca.follower_count,
        ca.subscriber_count,
        ca.average_views,
        ca.publishing_frequency,
        public.project_jsonb_string_array_for_evaluator(ca.creator_categories) AS creator_categories,
        public.project_jsonb_string_array_for_evaluator(ca.languages) AS languages,
        public.project_jsonb_string_array_for_evaluator(ca.dialects) AS dialects,
        ca.creator_classification,
        ca.audience_location,
        public.project_audience_insights_for_evaluator(ca.audience_insights) AS audience_insights,
        public.project_jsonb_string_array_for_evaluator(ca.collaboration_preferences) AS collaboration_preferences,
        public.project_expected_rates_for_evaluator(ca.expected_rates) AS expected_rates,
        ca.travel_availability,
        public.project_previous_collaborations_for_evaluator(ca.previous_collaborations) AS previous_collaborations,
        public.project_jsonb_string_array_for_evaluator(ca.portfolio_urls) AS portfolio_urls,
        ca.privacy_consent,
        ca.contact_consent,
        ca.brand_sharing_consent,
        ca.application_status,
        public.project_jsonb_string_array_for_evaluator(ca.campaign_matches) AS campaign_matches,
        public.filter_activity_log_for_evaluator(ca.activity_log) AS activity_log,
        ca.latest_score,
        ca.created_at,
        ca.updated_at
    FROM public.creator_applications ca
    ORDER BY ca.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_creator_applications_for_evaluator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_creator_applications_for_evaluator() TO authenticated;

-- ============================================================================
-- PART 2: NON-DESTRUCTIVE 6-DIVISION & 37-SERVICE CATALOGUE SEEDING
-- ============================================================================
-- Rules enforced:
-- 1. Helper public.is_service_seed_approved_for_publish(JSONB) verifies that
--    every package in a seed service has approval_status = 'approved' before
--    allowing seed publication; unapproved seed rows remain 'draft'.
-- 2. Existing administrator edits to divisions and services are preserved
--    (ON CONFLICT DO NOTHING / WHERE NOT EXISTS).

CREATE OR REPLACE FUNCTION public.is_service_seed_approved_for_publish(p_packages JSONB)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN p_packages IS NULL OR jsonb_typeof(p_packages) <> 'array' OR jsonb_array_length(p_packages) = 0 THEN false
        ELSE COALESCE(
            (
                SELECT bool_and(
                    jsonb_typeof(elem) = 'object'
                    AND COALESCE(elem->>'approval_status', '') = 'approved'
                )
                FROM jsonb_array_elements(p_packages) AS elem
            ),
            false
        )
    END;
$$;

-- 2A. Archive any superseded divisions not in the 6 canonical division slugs
UPDATE public.service_divisions
SET status = 'archived', updated_at = now()
WHERE slug NOT IN (
    'websites-software',
    'security-maintenance',
    'marketing-creator-campaigns',
    'ai-automation-business-systems',
    'research-business-strategy',
    'business-setup-documentation'
)
AND status <> 'archived';

-- 2B. Seed any missing canonical divisions among the 6 WITHOUT overwriting existing edits
INSERT INTO public.service_divisions (
    id,
    name,
    slug,
    short_description,
    full_description,
    seo_title,
    seo_description,
    status,
    display_order
)
VALUES
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Websites & Software', 'websites-software', 'Custom websites, e-commerce stores, web applications, mobile apps, SaaS MVPs, and API integrations.', 'Build or improve your digital platform. We architect and engineer high-performance web software, e-commerce ordering platforms, custom business tools, mobile apps, and robust API integrations designed specifically around your real-world business workflows.', 'Websites, E-Commerce & Custom Software Development | Unikorn360', 'Professional website development, e-commerce stores, custom web applications, mobile apps, SaaS MVPs, and API integrations for growing businesses.', 'published', 1),
  ('a2000000-0000-0000-0000-000000000002'::uuid, 'Security & Maintenance', 'security-maintenance', 'Application security reviews, AI code audits, API security, database reviews, server hardening, and maintenance.', 'Protect and maintain existing technology. We evaluate web applications, review AI-generated code for production risks, audit APIs and database security, harden cloud servers, and provide dependable ongoing technical maintenance.', 'Application Security Reviews & Technical Maintenance | Unikorn360', 'Website and application security reviews, AI-generated code audits, API security, database reviews, server hardening, and ongoing maintenance retainers.', 'published', 2),
  ('a3000000-0000-0000-0000-000000000003'::uuid, 'Marketing & Creator Campaigns', 'marketing-creator-campaigns', 'SEO, paid advertising management, social media content, UGC production, and creator campaign management.', 'Attract customers and build market visibility. We deliver technical and local SEO, paid advertising management across Meta and Google, social media content calendars, authentic UGC video assets, and regional creator campaign management.', 'SEO, Paid Advertising & Creator Campaign Management | Unikorn360', 'Technical and local search SEO, Meta and Google ads management, social media management, UGC video production, and regional creator campaigns.', 'published', 3),
  ('a4000000-0000-0000-0000-000000000004'::uuid, 'AI, Automation & Business Systems', 'ai-automation-business-systems', 'AI chatbots, custom AI agents, business workflow automation, CRM, WhatsApp automation, and executive dashboards.', 'Reduce manual work and improve operations. We build conversational knowledge assistants, custom AI agents with human approval loops, cross-tool workflow automations, CRM pipelines, official WhatsApp automation, and executive dashboard systems.', 'AI Automation, Custom Agents & Business Systems | Unikorn360', 'AI chatbots, custom AI agents, cross-tool workflow automation, CRM automation, WhatsApp Business systems, and real-time executive dashboards.', 'published', 4),
  ('a5000000-0000-0000-0000-000000000005'::uuid, 'Research & Business Strategy', 'research-business-strategy', 'Market research, competitor analysis, industry trends, performance diagnostics, feasibility, and growth consulting.', 'Understand opportunities and make informed business decisions. We conduct customer and competitor research, analyze business performance and margins, prepare commercial feasibility plans, and advise founders on operational growth.', 'Business Research, Performance Analysis & Strategy Consulting | Unikorn360', 'Customer research, competitor and advertising intelligence, business performance analysis, financial feasibility models, and startup consulting.', 'published', 5),
  ('a6000000-0000-0000-0000-000000000006'::uuid, 'Business Setup & Documentation', 'business-setup-documentation', 'Company registration, GST & Udyam, trademark filing coordination, government schemes, DPRs, and property documentation.', 'Establish the business and prepare required documentation. We support business incorporation, GST and Udyam MSME priority registration, trademark filing coordination, government subsidy applications, bank-ready DPRs, and commercial property documentation.', 'Business Registration, GST, DPR & Documentation Support | Unikorn360', 'Incorporation assistance, GST and Udyam registration, trademark filing coordination, DPR loan reports, government subsidy support, and property documentation.', 'published', 6)
ON CONFLICT (slug) DO NOTHING;

-- 2C. Archive any legacy services not in the 37 canonical slugs
UPDATE public.service_catalog
SET status = 'archived', updated_at = now()
WHERE slug NOT IN (
    'website-development', 'ecommerce-development', 'custom-web-applications', 'mobile-app-development', 'saas-mvp-development', 'api-system-integration',
    'website-application-security-review', 'ai-generated-code-security-review', 'api-security-review', 'database-supabase-security-review', 'cloud-server-hardening', 'website-application-maintenance',
    'seo-local-search', 'paid-advertising-management', 'social-media-content-management', 'ugc-content-production', 'influencer-campaign-management', 'marketing-tracking-reporting',
    'ai-chatbots-knowledge-assistants', 'custom-ai-agents', 'business-workflow-automation', 'crm-sales-automation', 'whatsapp-business-automation', 'document-processing-automation', 'business-dashboards-reporting-systems',
    'market-customer-research', 'competitor-advertising-research', 'industry-opportunity-research', 'business-performance-analysis', 'business-planning-financial-feasibility', 'startup-growth-consulting',
    'business-registration-assistance', 'gst-udyam-assistance', 'trademark-filing-coordination', 'government-scheme-application-support', 'dpr-loan-documentation', 'property-documentation-coordination'
)
AND status <> 'archived';

-- 2D. Seed missing canonical services among the 37 WITHOUT overwriting existing edits
INSERT INTO public.service_catalog (
    id,
    division_id,
    service_name,
    slug,
    short_description,
    full_description,
    problems_solved,
    target_customers,
    benefits,
    deliverables,
    packages,
    process_steps,
    client_responsibilities,
    exclusions,
    additional_charges,
    gallery,
    faqs,
    seo_title,
    seo_description,
    status,
    display_order,
    published_at
)
SELECT
    v.id,
    sd.id AS division_id,
    v.service_name,
    v.slug,
    v.short_description,
    v.full_description,
    v.problems_solved,
    v.target_customers,
    v.benefits,
    v.deliverables,
    v.packages,
    v.process_steps,
    v.client_responsibilities,
    v.exclusions,
    v.additional_charges,
    v.gallery,
    v.faqs,
    v.seo_title,
    v.seo_description,
    CASE
        WHEN v.seed_status = 'published' AND public.is_service_seed_approved_for_publish(v.packages)
            THEN 'published'
        ELSE 'draft'
    END AS status,
    v.display_order,
    CASE
        WHEN v.seed_status = 'published' AND public.is_service_seed_approved_for_publish(v.packages)
            THEN now()
        ELSE NULL
    END AS published_at
FROM (
    VALUES
  (
    'b0000000-0000-4000-8000-000000000001'::uuid,
    'websites-software',
    'Website Development',
    'website-development',
    'Custom, mobile-first corporate and industrial websites built to generate client inquiries and showcase capabilities.',
    'We architect and build fast, responsive websites for B2B enterprises, manufacturers, contractors, and service businesses. Every project includes structured information architecture, WhatsApp/inquiry routing, cloud hosting deployment options, and technical SEO hygiene.',
    '["Outdated legacy websites that look unprofessional on mobile devices","Losing prospective contracts due to absence of an authoritative digital profile","Missing or broken inquiry pathways that fail to capture customer leads"]'::jsonb,
    '["Manufacturers","B2B Suppliers","Engineering Contractors","Service Businesses","Growing MSMEs"]'::jsonb,
    '["Immediate brand credibility","Direct WhatsApp and email lead routing","High-speed load performance across mobile and desktop"]'::jsonb,
    '["Custom Mobile-Responsive Website (5–10 pages)","Inquiry Capture & Lead Routing Integration","Technical SEO Setup & Schema Markup","Cloud Deployment & Domain Configuration"]'::jsonb,
    '[{"id":"pkg-ws-corporate","name":"Corporate Presence","description":"Complete professional website for businesses needing clear positioning and inquiry capture.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Up to 8 Custom Pages","Responsive Design","Inquiry Forms & WhatsApp Trigger","Google Analytics & Search Console Setup"],"limits":["Single domain setup","Content and imagery drafts supplied by client"],"exclusions":["Annual third-party hosting and domain registry fees","E-commerce cart checkout"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Discovery & Architecture","description":"Review your products, target buyers, certifications, and information architecture."},{"step":2,"title":"UI & Layout Review","description":"Design clean, responsive page templates for approval before coding."},{"step":3,"title":"Frontend Engineering & Integration","description":"Build high-speed pages, inquiry routing, and cloud deployment pipelines."},{"step":4,"title":"Testing & Handover","description":"Audit mobile responsiveness, configure analytics, and deliver verified production build."}]'::jsonb,
    '["Provide company logo, product photos, and business registration details","Designate a project lead for timely milestone sign-offs"]'::jsonb,
    '["Commercial video photoshoots (available as separate UGC scope)","Ongoing post-warranty content changes without maintenance plan"]'::jsonb,
    '["Multi-language support (e.g. Tamil + English)","Custom API feeds or third-party CRM hooks"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Is cloud hosting deployment included?","answer":"Yes, initial deployment to your cloud environment (Vercel, Cloudflare, AWS, or DigitalOcean) is included in delivery."},{"question":"Will the website work smoothly on all mobile devices?","answer":"Yes, every layout is built mobile-first and tested across iOS and Android viewports."}]'::jsonb,
    'Custom Website Development | Unikorn360',
    'Custom B2B and corporate website development. Fast, responsive, inquiry-focused websites for manufacturers, service firms, and growing teams.',
    'published',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000002'::uuid,
    'websites-software',
    'E-commerce Development',
    'ecommerce-development',
    'Digital ordering portals and online storefronts with wholesale tiered pricing, catalog management, and payment checkout.',
    'Custom e-commerce platforms engineered for B2B distributors and direct-to-consumer businesses. Includes structured catalog hierarchies, dealer pricing tiers, automated tax invoices, order notifications, and payment gateway integration.',
    '["Managing dealer orders and repeat wholesale inquiries manually over phone calls and WhatsApp","Pricing errors caused by complex customer-specific discount tiers","Fulfillment delays and lost orders due to fragmented order tracking"]'::jsonb,
    '["Wholesale Distributors","Direct-to-Consumer Brands","Specialty Component Suppliers","Retail Chains"]'::jsonb,
    '["24/7 self-service digital order capture","Automated GST invoices and dealer pricing rules","Streamlined order management and dispatch workflows"]'::jsonb,
    '["Custom Storefront & Shopping Cart","Dealer Tier Pricing & Account Authentication","Payment Gateway Integration (Razorpay/Stripe)","Order Management & Automated Invoice PDF Generation"]'::jsonb,
    '[{"id":"pkg-ws-ecom-core","name":"B2B & Retail Ordering System","description":"Complete digital catalog with authentication and payment processing.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Product Catalog Management","Tiered Pricing Engine","Payment Gateway Setup","WhatsApp Order Notifications"],"limits":["Initial setup up to 1,000 SKUs"],"exclusions":["Payment gateway merchant gateway transaction processing fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Catalog & SKU Structuring","description":"Define product categories, variants, unit specifications, and pricing tiers."},{"step":2,"title":"Storefront Engineering","description":"Build responsive product listings, search filters, cart, and dealer accounts."},{"step":3,"title":"Payment & Invoice Integration","description":"Connect merchant payment gateways and automated tax invoice generation."},{"step":4,"title":"End-to-End Testing","description":"Conduct end-to-end checkout, invoice, and dispatch alert verification."}]'::jsonb,
    '["Provide merchant KYC documents for payment gateway approval","Supply initial product catalogue dataset in Excel/CSV"]'::jsonb,
    '["Third-party shipping carrier freight fees","Product catalog photography"]'::jsonb,
    '["Multi-warehouse inventory synchronization","Custom ERP inventory feeds"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Can dealers have different pricing from retail customers?","answer":"Yes, our e-commerce architecture supports authenticated dealer accounts with custom wholesale pricing tiers."}]'::jsonb,
    'E-commerce & B2B Ordering Portals | Unikorn360',
    'Custom e-commerce development and B2B ordering portals with tiered dealer pricing, GST invoicing, and secure payment checkout.',
    'draft',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000003'::uuid,
    'websites-software',
    'Custom Web Applications',
    'custom-web-applications',
    'Tailored operational web applications, internal tools, client portals, and quotation calculators.',
    'Bespoke web applications engineered around your exact operational rules. Eliminates repetitive spreadsheet manual work, replaces fragile disconnected files, and gives your teams role-based permissions, job status tracking, and structured audit logs.',
    '["Operations bogged down by cluttered, prone-to-error Excel workbooks","Staff wasting hours manually assembling complex quotations and job-work sheets","Lack of visibility into real-time job stage completion across internal departments"]'::jsonb,
    '["Operations Managers","Manufacturers","Custom Fabricators","Service Agencies","Enterprises"]'::jsonb,
    '["100% customized to your operating rules","Role-based access control for staff and managers","Centralized, secure operational database"]'::jsonb,
    '["Custom Web Application Frontend & Backend","Role-Based Authentication & Permissions","Relational Database Schema & Data Migration","Cloud Deployment & Admin User Documentation"]'::jsonb,
    '[{"id":"pkg-ws-app-standard","name":"Operational Application Core","description":"Custom internal tool engineered for your specific departmental workflow.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Custom Workflow Modules","Multi-User Role Permissions","Data Export & Audit Logs","Cloud Production Deployment"],"limits":["Scoped according to agreed Technical Specification Document"],"exclusions":["Third-party infrastructure compute hosting costs"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Workflow Scrutiny","description":"Map exact inputs, calculations, approval gates, and output documents."},{"step":2,"title":"Architecture Specification","description":"Deliver technical specification and database schema before coding."},{"step":3,"title":"Modular Application Build","description":"Develop full-stack web application with secure authentication."},{"step":4,"title":"UAT & Staff Handover","description":"Conduct user acceptance testing with real data and train team."}]'::jsonb,
    '["Provide sample spreadsheets, calculation formulas, and workflow rules","Ensure key department users participate in acceptance testing"]'::jsonb,
    '["Unscoped feature additions requested after technical specification sign-off"]'::jsonb,
    '["Legacy database data cleaning & historical migration","Hardware barcode scanner integration"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Can our staff access this securely on mobile devices and PCs?","answer":"Yes, web applications are fully responsive and accessible securely via browser on phones, tablets, and desktop computers."}]'::jsonb,
    'Custom Web Application Development | Unikorn360',
    'Bespoke web applications and internal operations software. Eliminate spreadsheet bottlenecks with custom business tools.',
    'draft',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000004'::uuid,
    'websites-software',
    'Mobile App Development',
    'mobile-app-development',
    'Cross-platform iOS and Android mobile apps for field teams, customer engagement, and on-the-go business workflows.',
    'High-performance mobile applications engineered with React Native and native APIs. Built for field technicians, mobile sales agents, or customer loyalty experiences with offline data sync, GPS logging, camera uploads, and push notifications.',
    '["Field agents unable to access company software without a laptop","Delayed reporting from job sites, stores, or distribution routes","Customer churn due to lack of a convenient mobile booking or ordering interface"]'::jsonb,
    '["Field Service Companies","Logistics & Distribution Teams","D2C Consumer Brands","Service Networks"]'::jsonb,
    '["Real-time field data sync","Offline data caching when signal drops","Push notifications for immediate updates"]'::jsonb,
    '["Cross-Platform iOS & Android App","Backend API Integration","Offline Sync & Push Notification System","App Store & Play Store Deployment Support"]'::jsonb,
    '[{"id":"pkg-ws-mobile-core","name":"Business Mobile Application","description":"Complete cross-platform application with authenticated API connectivity.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["iOS & Android Builds","User Authentication","Camera & GPS Logging","App Store Publishing Guidance"],"limits":["Scoped according to agreed mobile feature roadmap"],"exclusions":["Apple Developer ($99/yr) & Google Play ($25 one-time) publisher account fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"UX Flow & Screen Mapping","description":"Design interactive mobile wireframes and user interaction states."},{"step":2,"title":"App Development","description":"Build cross-platform client app with native API integration."},{"step":3,"title":"API & Push Setup","description":"Connect backend services, data sync, and push notification infrastructure."},{"step":4,"title":"Publishing & Release","description":"Submit build to Google Play Console and Apple App Store."}]'::jsonb,
    '["Create Apple and Google publisher accounts under your organization","Provide tester devices for physical hardware testing"]'::jsonb,
    '["App Store annual developer account subscription fees charged by Apple/Google"]'::jsonb,
    '["Bluetooth thermal printer integration","Biometric scanner hardware support"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Will one codebase work on both Android and iPhone?","answer":"Yes, we develop cross-platform applications ensuring consistent performance and design across iOS and Android."}]'::jsonb,
    'Mobile App Development (iOS & Android) | Unikorn360',
    'Cross-platform mobile application development for field teams, customer engagement, and business operations.',
    'draft',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000005'::uuid,
    'websites-software',
    'SaaS & MVP Development',
    'saas-mvp-development',
    'Rapid, production-ready MVP development for software startups and founders validating market demand.',
    'We turn software ideas into functional, testable products in weeks. Includes multi-tenant database design, user authentication, subscription billing, core application logic, and cloud infrastructure designed to scale.',
    '["Founders burning months of runway with slow or bloated dev agencies","Over-engineering features before testing real customer willingness to pay","Security and architectural debt that prevents scaling after launch"]'::jsonb,
    '["Startup Founders","SaaS Innovators","Corporate Innovation Teams","Domain Experts Building Software"]'::jsonb,
    '["Launch to early adopters in 4 to 8 weeks","Clean modern code architecture ready for seed funding","Integrated subscription billing and analytics"]'::jsonb,
    '["Production Minimum Viable Product (MVP)","Subscription Billing (Stripe / LemonSqueezy / Razorpay)","Authentication & Multi-Tenant Database","Source Code Repository & Architecture Documentation"]'::jsonb,
    '[{"id":"pkg-ws-mvp-core","name":"Production MVP Sprint","description":"End-to-end development of your core software concept.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Scoped Core Feature Set","Auth & Database Design","Payment / Subscription Integration","Deployment & CI/CD Pipeline"],"limits":["Strictly scoped to core value hypothesis"],"exclusions":["Post-launch marketing ad spend"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Scope Pruning & MVP Definition","description":"Strip non-essential features and isolate the single most critical problem solved."},{"step":2,"title":"Clickable Prototype","description":"Review high-fidelity interactive screens and data flows."},{"step":3,"title":"Sprint Build","description":"Rapid, test-driven full-stack development with weekly milestone reviews."},{"step":4,"title":"Production Launch","description":"Deploy to cloud, configure production monitoring, and hand over source code."}]'::jsonb,
    '["Clarify target user problem and core value metric","Perform prompt reviews at each weekly milestone demo"]'::jsonb,
    '["Continuous post-launch feature iteration outside of sprint scope"]'::jsonb,
    '["AI model fine-tuning or specialized vector database integration"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Do I own 100% of the intellectual property and code?","answer":"Yes. Upon project completion and final settlement, complete source code repository ownership and IP are transferred to your organization."}]'::jsonb,
    'SaaS MVP Development for Founders | Unikorn360',
    'Rapid, scalable MVP and SaaS development. Turn your software product vision into a production application in weeks.',
    'draft',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000006'::uuid,
    'websites-software',
    'API & System Integration',
    'api-system-integration',
    'Connect disparate business tools, payment gateways, ERP databases, and third-party web services.',
    'Bridge disconnected software systems. We build robust API connections, secure webhook receivers, and real-time data pipelines between your web platforms, payment processors, accounting packages, CRMs, and internal databases.',
    '["Staff wasting time manually copying data between software systems","Payment receipts not reflecting automatically in billing databases","Inventory mismatches between e-commerce orders and warehouse ERPs"]'::jsonb,
    '["Growing MSMEs","E-commerce Operators","Service Networks","Companies with Multiple Disconnected Software"]'::jsonb,
    '["Zero manual double-entry","Instant real-time data consistency","Automated error logging and retry mechanisms"]'::jsonb,
    '["Custom API Connector / Middleware","Webhook Listeners with Retry Logic","Authentication & Token Management","Data Transformation & Integration Documentation"]'::jsonb,
    '[{"id":"pkg-ws-api-connector","name":"Standard System Integration","description":"Two-way or one-way reliable integration between two business software systems.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["API Connection & Transformation","Webhook Handlers","Error Alerting","30-Day Post-Launch Monitoring"],"limits":["Requires active API access on both third-party platforms"],"exclusions":["Third-party API subscription costs or transaction fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"API Audit","description":"Review API schemas, authentication mechanisms, and rate limits of both systems."},{"step":2,"title":"Data Mapping","description":"Define field-level data transformations, fallbacks, and validation rules."},{"step":3,"title":"Integration Build","description":"Deploy secure middleware with exponential backoff and error logging."},{"step":4,"title":"Live Stress Testing","description":"Simulate high transaction loads, edge case failures, and confirm sync."}]'::jsonb,
    '["Provide API developer credentials or admin access to connected tools","Verify field mappings align with internal accounting/operating policies"]'::jsonb,
    '["Direct reverse-engineering of closed software without export capabilities"]'::jsonb,
    '["On-premise legacy database driver development"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What happens if a third-party service is temporarily down?","answer":"Our integrations include robust retry queues and automated failure alerting so data is never lost during third-party downtime."}]'::jsonb,
    'API & System Integration Services | Unikorn360',
    'Connect third-party APIs, payment gateways, and business software. Reliable webhook pipelines and data sync.',
    'draft',
    6
  ),
  (
    'b0000000-0000-4000-8000-000000000007'::uuid,
    'security-maintenance',
    'Website & Application Security Review',
    'website-application-security-review',
    'Comprehensive vulnerability assessment, findings report, and prioritized remediation recommendations for web applications.',
    'We conduct independent security assessments of existing websites and web applications. Scans for OWASP Top 10 vulnerabilities, authentication loopholes, data exposure risks, and misconfigured permissions. Note: Delivers a detailed findings report with prioritized fixes; remediation implementation can be performed in-house or separately quoted.',
    '["Uncertainty regarding whether your web platform is vulnerable to unauthorized data access","Meeting security compliance requirements before launching commercial transactions","Discovering hidden vulnerabilities before malicious actors exploit them"]'::jsonb,
    '["E-commerce Stores","Web Application Founders","Companies Handling Customer Data","MSMEs Upgrading Legacy Web Systems"]'::jsonb,
    '["Clear visibility into existing technical security risks","Prioritized fix roadmap ranked by severity","Independent technical review without vendor bias"]'::jsonb,
    '["Executive Summary of Risk Posture","Technical Findings Log with Proof of Concept","Prioritized Remediation Recommendations","Debriefing Call with Technical Findings Walkthrough"]'::jsonb,
    '[{"id":"pkg-sec-web-assessment","name":"Standard Application Security Audit","description":"Comprehensive assessment of web application surfaces and report delivery.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Automated & Manual Vulnerability Review","Authentication & Permission Audits","Prioritized Remediation Report","Follow-up Verification of Applied Fixes"],"limits":["Single domain / web application scope"],"exclusions":["Hands-on remediation code authoring (available as a separate scope)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Scope & Authorization","description":"Establish clear testing boundaries, staging targets, and formal written testing authorization."},{"step":2,"title":"Vulnerability Analysis","description":"Perform automated scanning and manual inspection of input vectors, auth flows, and headers."},{"step":3,"title":"Report Compilation","description":"Document reproducible findings, calculate CVSS severity, and draft specific remediation code examples."},{"step":4,"title":"Executive Walkthrough","description":"Review findings with your engineering team and advise on implementation priorities."}]'::jsonb,
    '["Provide written authorization and staging test environment access","Designate engineering lead to receive confidential vulnerability details"]'::jsonb,
    '["Hands-on code rewriting is not included in the audit fee and is quoted separately upon review"]'::jsonb,
    '["Expedited 48-hour turn-around audit","Third-party vendor API penetration testing"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Is remediation included in the review fee?","answer":"The assessment fee covers the comprehensive security review and prioritized remediation report. Fixing the code can be executed by your own developers or separately quoted by Unikorn360."}]'::jsonb,
    'Website & Web Application Security Review | Unikorn360',
    'Independent vulnerability assessment and security reviews for web applications. Actionable findings and prioritized remediation recommendations.',
    'published',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000008'::uuid,
    'security-maintenance',
    'AI-Generated Code Security Review',
    'ai-generated-code-security-review',
    'Security and production-readiness inspection of code produced by AI models, Cursor, Copilot, or rapid prototypes.',
    'AI-generated code frequently contains subtle authorization bypasses, exposed API keys, hallucinated package dependencies, and unvalidated inputs. We review AI-generated codebases to identify security flaws before you deploy to production. Boundary note: This is an architectural and vulnerability review; we do not promise formal certification or guarantee absolute immunity.',
    '["Deploying AI-built prototypes to production without knowing what hidden security risks exist","Accidentally exposing secret API keys, admin endpoints, or database service role keys in frontend bundles","Vulnerable package dependencies and unvalidated data deserialization"]'::jsonb,
    '["Non-Technical Founders Building with AI Tools","Agencies Using AI Coding Assistants","Teams Launching V0/Cursor Prototypes"]'::jsonb,
    '["Identify critical authorization bugs before customers do","Ensure secrets are properly confined to secure backend environments","Objective assessment of production readiness"]'::jsonb,
    '["Codebase Security Audit Report","Identified Vulnerability Log with Severity Ratings","Key Leakage & Environment Configuration Audit","Actionable Code Fix Guidelines"]'::jsonb,
    '[{"id":"pkg-sec-ai-audit","name":"AI Prototype Security Audit","description":"Complete codebase review of AI-assisted web application.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Source Code Repository Review","Secrets & Environment Audit","Auth Bypass & RLS Validation","Remediation Action Plan"],"limits":["Single codebase repository up to 25,000 LOC"],"exclusions":["Certification claims or guarantees of 100% immunity"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Code Ingestion & Dependency Check","description":"Review package manifest, lockfiles, and scanning for hallucinated or malicious packages."},{"step":2,"title":"Static & Logical Code Analysis","description":"Trace data flow from user inputs to database queries and verify access controls."},{"step":3,"title":"Secrets & Environment Review","description":"Verify that server role keys, tokens, and database credentials are strictly server-side."},{"step":4,"title":"Remediation Delivery","description":"Deliver report with specific code snippets illustrating safe implementation patterns."}]'::jsonb,
    '["Provide read access to Git repository","Provide environment variable template (.env.example) and context on business use-case"]'::jsonb,
    '["We do not issue commercial certifications or legal warranties of absolute security"]'::jsonb,
    '["Hands-on remediation refactoring performed by our engineering team"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Why does AI-generated code need a human security review?","answer":"AI code generators prioritize completing functional requests over verifying multi-tenant isolation, authorization bounds, and credential handling. Human review catches subtle logic bugs."}]'::jsonb,
    'AI-Generated Code Security Review | Unikorn360',
    'Security audits for AI-generated code, Cursor, and Copilot applications. Identify leaked keys, authorization bypasses, and production vulnerabilities.',
    'published',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000009'::uuid,
    'security-maintenance',
    'API Security Review',
    'api-security-review',
    'Authentication audits, authorization boundary tests, token leakage checks, and rate-limiting scrutiny for web APIs.',
    'APIs are the primary entry point for modern business data. We scrutinize your REST and GraphQL endpoints for broken object-level authorization (BOLA), missing rate limits, token replay vulnerabilities, and sensitive data overexposure.',
    '["Endpoints leaking sensitive customer data to unauthenticated requests","APIs vulnerable to automated scraping or denial-of-service due to lack of rate limiting","Broken object-level authorization allowing one user to access another user''s records"]'::jsonb,
    '["SaaS Platforms","Mobile App Backends","Fintech & Billing APIs","Enterprises with Public/Partner APIs"]'::jsonb,
    '["Prevent unauthorized database access via API endpoints","Harden authentication and token revocation routines","Ensure compliance with data protection best practices"]'::jsonb,
    '["API Endpoint Vulnerability Report","Authorization & Token Flow Review","Rate Limiting & Abuse Prevention Recommendations","Post-Remediation Verification Scan"]'::jsonb,
    '[{"id":"pkg-sec-api-core","name":"API Endpoint Audit","description":"Comprehensive security testing of API endpoints and token flows.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Up to 30 API Endpoints Tested","BOLA / Broken Auth Testing","Rate Limiting Verification","Remediation Guide"],"limits":["Staging / non-production API testing environment"],"exclusions":["Volumetric Distributed Denial of Service (DDoS) testing"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Endpoint Inventory","description":"Enumerate public and private routes, parameters, and authentication methods."},{"step":2,"title":"Authorization & Boundary Testing","description":"Test for multi-tenant isolation, IDOR, and privilege escalation vulnerabilities."},{"step":3,"title":"Data Exposure & Header Audit","description":"Evaluate CORS configuration, caching headers, and response payload filtering."},{"step":4,"title":"Report Delivery","description":"Deliver findings with actionable remediation code for your backend stack."}]'::jsonb,
    '["Provide API documentation (Swagger/OpenAPI or Postman collection)","Set up test accounts across multiple role tiers"]'::jsonb,
    '["Physical hardware penetration testing"]'::jsonb,
    '["Custom microservices architecture audits spanning multiple cloud networks"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Do tests run on our production database?","answer":"We strongly recommend and prioritize testing on an isolated staging environment with anonymized data to prevent service disruption."}]'::jsonb,
    'API Security Review & Penetration Testing | Unikorn360',
    'Security review for REST and GraphQL APIs. Scrutinize authentication, broken object-level authorization (BOLA), and token flows.',
    'draft',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000010'::uuid,
    'security-maintenance',
    'Database & Supabase Security Review',
    'database-supabase-security-review',
    'Audit PostgreSQL and Supabase databases for Row Level Security (RLS) leaks, secrets exposure, and backup resilience.',
    'Supabase and PostgreSQL backends require rigorous Row Level Security (RLS) policies to prevent unauthorized data access. We audit your table permissions, RLS policies, storage bucket rules, database roles, connection pooling, and automated backup procedures.',
    '["Missing or misconfigured RLS policies allowing anonymous users to query private tables","Accidentally public Supabase storage buckets exposing confidential customer documents","Exposing the confidential service_role key in frontend browser code"]'::jsonb,
    '["Supabase Developers","PostgreSQL Database Administrators","Founders Managing User Data","Web Application Teams"]'::jsonb,
    '["Ironclad multi-tenant data isolation","Validated private storage bucket access rules","Eliminate anonymous data scraping risks"]'::jsonb,
    '["Database RLS Policy Audit Matrix","Storage Bucket Security Inspection","Database Roles & Key Exposure Check","Ready-to-Apply SQL Security Migration Script"]'::jsonb,
    '[{"id":"pkg-sec-db-supabase","name":"Supabase & Database Hardening Audit","description":"Complete inspection of Supabase tables, RLS policies, and storage security.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Table-by-Table RLS Policy Verification","Storage Object Permission Scrutiny","Key Leak Audit in Frontend Bundles","Hardened SQL Migration Script"],"limits":["Single database instance / Supabase project"],"exclusions":["On-premise hardware infrastructure physical maintenance"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Policy Extraction","description":"Export active RLS policies, roles, triggers, and storage bucket configuration."},{"step":2,"title":"Adversarial Access Simulation","description":"Execute authenticated and unauthenticated queries to test for data leakage."},{"step":3,"title":"SQL Hardening Patch","description":"Author optimized PostgreSQL security policies and security definer functions."},{"step":4,"title":"Validation & Handover","description":"Confirm zero regressions and train your team on safe schema evolution."}]'::jsonb,
    '["Provide temporary developer/reviewer access to the Supabase dashboard or read replica","Clarify multi-role permissions expectations"]'::jsonb,
    '["Ongoing automated 24/7 database DBA operations (available under maintenance retainers)"]'::jsonb,
    '["Database query performance tuning and index optimization"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Why is Supabase RLS verification so important?","answer":"In Supabase, client applications query the database directly using the public anon key. Without properly written Row Level Security policies on every table, anyone can download your entire database."}]'::jsonb,
    'Database & Supabase Security Review | Unikorn360',
    'Audit PostgreSQL and Supabase databases for Row Level Security (RLS) leaks, private storage bucket permissions, and service role security.',
    'published',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000011'::uuid,
    'security-maintenance',
    'Cloud & Server Hardening',
    'cloud-server-hardening',
    'Linux server hardening, firewall configuration, SSH key policies, TLS/SSL certificates, and backup isolation.',
    'Harden cloud servers (Ubuntu/Debian on AWS, DigitalOcean, Hetzner, or GCP) against unauthorized access and brute force attacks. Includes UFW/iptables firewalls, SSH key-only authentication, automated security patching, SSL/TLS hardening, and isolated offsite backups.',
    '["Servers exposed to public internet with default ports and password authentication","Unpatched operating system packages and obsolete software dependencies","Absence of automated, isolated offsite backups in case of server corruption"]'::jsonb,
    '["Businesses Hosting Production Web Apps","Self-Hosted Database Owners","Agencies Managing VPS Infrastructure"]'::jsonb,
    '["Substantially reduced attack surface","Automated security updates without breaking production","Reliable, encrypted offsite backup snapshots"]'::jsonb,
    '["Hardened Linux Server Configuration","Firewall & Fail2Ban Implementation","SSH Key Authentication Enforcement","Automated Offsite Backup Routine & Documentation"]'::jsonb,
    '[{"id":"pkg-sec-server-hardening","name":"Single Server Hardening Sprint","description":"Complete security configuration for one production Linux server.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["UFW Firewall & Port Locking","SSH Hardening (Key-only, non-standard port)","Fail2ban Brute-Force Protection","Automated Daily Encrypted Backups"],"limits":["Single VPS or dedicated cloud instance"],"exclusions":["Cloud hosting compute provider monthly charges"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Server Audit","description":"Inspect open ports, active services, user accounts, and current backup status."},{"step":2,"title":"Hardening Execution","description":"Configure UFW firewall, enforce SSH key authentication, and install brute-force protection."},{"step":3,"title":"TLS & Service Configuration","description":"Apply modern TLS/SSL ciphers and isolate web server processes."},{"step":4,"title":"Backup & Recovery Drill","description":"Test automated backup generation and execute a test restoration drill."}]'::jsonb,
    '["Provide root or sudo SSH access for configuration","Designate emergency technical contact during setup maintenance window"]'::jsonb,
    '["Continuous 24/7 incident response monitoring (available under ongoing maintenance retainer)"]'::jsonb,
    '["Multi-server cluster or Kubernetes node hardening"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Will hardening cause downtime for our live users?","answer":"We schedule configuration during low-traffic maintenance windows, with typical downtime under 5 minutes."}]'::jsonb,
    'Cloud & Linux Server Hardening Services | Unikorn360',
    'Production Linux server hardening, firewall setup, SSH key policies, Fail2ban configuration, and automated offsite backups.',
    'published',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000012'::uuid,
    'security-maintenance',
    'Website & Application Maintenance',
    'website-application-maintenance',
    'Ongoing technical maintenance, updates and patches, backups, uptime monitoring, and priority troubleshooting.',
    'Keep your web platforms fast, secure, and operational. Covers WordPress and custom web application maintenance, security patch updates, automated cloud backups, 24/7 uptime monitoring, broken link fixes, and reserved monthly developer hours for technical support.',
    '["Websites breaking unexpectedly due to neglected plugin or package updates","Losing days of customer orders because there were no recent working backups","Scrambling to find reliable technical help when critical site errors occur"]'::jsonb,
    '["E-commerce Stores","Corporate Websites","SaaS Platforms","Businesses Relying on Digital Inquiries"]'::jsonb,
    '["Prevent unexpected website outages","Guaranteed monthly backups stored in isolated cloud storage","Priority developer support when you need changes"]'::jsonb,
    '["Monthly Core & Dependency Updates","Weekly / Daily Automated Cloud Backups","24/7 Real-Time Uptime Monitoring","Reserved Monthly Technical Support Hours"]'::jsonb,
    '[{"id":"pkg-sec-maint-monthly","name":"Technical Care Retainer","description":"Proactive monthly maintenance and emergency support.","price":null,"currency":"INR","billing_period":"monthly","price_type":"starting-from","inclusions":["Regular Security Patching","Automated Daily Cloud Backups","Uptime Monitoring & Immediate Incident Response","Dedicated 4 Hours of Developer Changes/mo"],"limits":["Single website or web application"],"exclusions":["Major redesigns or substantial feature additions exceeding monthly hours"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Onboarding & Backup Baseline","description":"Audit current dependencies and configure automated daily offsite snapshots."},{"step":2,"title":"Staging Patch Testing","description":"Test updates in staging before pushing live to prevent layout breaks."},{"step":3,"title":"Live Update & Verification","description":"Apply patches, verify mobile responsiveness, and confirm checkout flows."},{"step":4,"title":"Monthly Executive Report","description":"Deliver monthly summary of applied updates, uptime logs, and backup health."}]'::jsonb,
    '["Provide hosting/admin credentials","Designate an authorized contact for approving site changes"]'::jsonb,
    '["Major architectural redesigns are quoted as separate projects"]'::jsonb,
    '["Additional support hours beyond monthly plan allotment"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What happens if my site goes down unexpectedly?","answer":"Our uptime monitoring triggers instant alerts, and our team immediately initiates recovery from the latest verified snapshot."}]'::jsonb,
    'Website & Application Maintenance Retainers | Unikorn360',
    'Dependable website and web application maintenance. Security updates, cloud backups, 24/7 uptime monitoring, and technical support.',
    'published',
    6
  ),
  (
    'b0000000-0000-4000-8000-000000000013'::uuid,
    'marketing-creator-campaigns',
    'SEO & Local Search',
    'seo-local-search',
    'Technical SEO, on-page optimization, and Google Business Profile visibility to rank for high-intent customer searches.',
    'Drive qualified organic traffic from buyers searching for your products and services. Covers technical site audits, Core Web Vitals optimization, semantic keyword targeting, content structure, Google Business Profile enhancement, and local citations.',
    '["Invisibility on Google when prospective clients search for your services","Competitors ranking above you and capturing local inbound inquiries","Technical site errors and slow speeds that suppress search engine rankings"]'::jsonb,
    '["Manufacturers","Local & Regional Service Providers","B2B Firms","Retailers Seeking Store Footfall"]'::jsonb,
    '["Sustainable inbound customer discovery without continuous ad spend","Enhanced Google Maps and local 3-pack visibility","Higher search ranking for commercial purchase-intent terms"]'::jsonb,
    '["Technical SEO Audit & Error Remediation","On-Page Content & Meta Tag Optimization","Google Business Profile Audit & Optimization","Local Citation Alignment & Keyword Tracking Reports"]'::jsonb,
    '[{"id":"pkg-mkt-seo-core","name":"Organic Search Foundation","description":"Comprehensive technical and local SEO setup with ongoing optimization.","price":null,"currency":"INR","billing_period":"monthly","price_type":"starting-from","inclusions":["Technical SEO Audits & Fixes","Target Keyword Research (15 Core Terms)","Google Business Profile Management","Monthly Keyword Ranking Reports"],"limits":["Single primary business website and business profile"],"exclusions":["Black-hat link schemes or guaranteed #1 rankings"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Technical Audit & Keyword Research","description":"Identify crawl errors, speed bottlenecks, and commercial search terms."},{"step":2,"title":"On-Page & Schema Implementation","description":"Optimize title tags, headings, content structure, and LocalBusiness schema."},{"step":3,"title":"Google Business Profile Tuning","description":"Align categories, services, photos, and citation consistency."},{"step":4,"title":"Performance Review","description":"Monitor search impressions, keyword rank movements, and inquiry volume."}]'::jsonb,
    '["Provide Google Search Console and Google Business Profile manager access","Approve recommended website copy updates"]'::jsonb,
    '["We do not guarantee specific numerical search rankings, adhering strictly to Google webmaster guidelines"]'::jsonb,
    '["Multi-location enterprise SEO expansion"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How long does SEO take to produce measurable results?","answer":"Technical fixes and local profile updates often show positive momentum within 4 to 8 weeks, with substantial organic growth compounding over 3 to 6 months."}]'::jsonb,
    'SEO & Local Search Optimization Services | Unikorn360',
    'Technical SEO, on-page content optimization, and Google Business Profile management. Drive qualified inbound buyer inquiries.',
    'published',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000014'::uuid,
    'marketing-creator-campaigns',
    'Paid Advertising Management',
    'paid-advertising-management',
    'Strategic management of Meta Ads and Google Ads campaigns focused on return on ad spend (ROAS) and lead generation.',
    'End-to-end paid campaign management across Google Search, Performance Max, and Meta (Instagram & Facebook). We handle audience targeting, ad copywriting, retargeting sequences, and continuous bid optimization. Boundary note: Management fees are separate from platform advertising spend paid directly to Google/Meta.',
    '["Burning advertising budgets on unoptimized campaigns with zero qualified leads","Inability to track which ad sets actually generate paying customers","Struggling to scale ad budgets without experiencing severe cost-per-lead spikes"]'::jsonb,
    '["D2C Brands","Service Businesses","Educational Institutions","B2B Companies with Clear Offerings"]'::jsonb,
    '["Immediate targeted traffic and lead acquisition","Structured retargeting to convert undecided visitors","Transparent reporting separating management fee from ad spend"]'::jsonb,
    '["Campaign Strategy & Audience Architecture","Ad Copywriting & Creative Direction","Conversion Tracking & Pixel Configuration","Weekly Bid Optimization & Transparent ROI Reporting"]'::jsonb,
    '[{"id":"pkg-mkt-ads-core","name":"Growth Ads Management","description":"Professional campaign management across Google or Meta.","price":null,"currency":"INR","billing_period":"monthly","price_type":"starting-from","inclusions":["Campaign Setup & Audience Research","A/B Creative & Copy Testing","Conversion Tracking Setup","Weekly Optimization & Performance Calls"],"limits":["Ad spend budget billed directly to client credit card"],"exclusions":["Media ad spend budget paid directly to advertising networks"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved","ad_spend_details":{"agency_fee":"Professional management retainer","ad_spend":"Billed directly to client payment method by Google / Meta","creative_fee":"Includes copywriting and ad design templates"}}]'::jsonb,
    '[{"step":1,"title":"Offer & Audience Scoping","description":"Define the target customer, value proposition, and conversion tracking milestones."},{"step":2,"title":"Campaign Build & Creative Copy","description":"Set up ad account architecture, audiences, creative angles, and tracking pixels."},{"step":3,"title":"Launch & A/B Testing","description":"Launch campaigns, monitor initial CPA, and iterate on winning ad combinations."},{"step":4,"title":"Weekly Scaling & Reporting","description":"Scale top-performing ad sets and deliver transparent ROI performance reports."}]'::jsonb,
    '["Provide ad account manager access with valid payment method attached","Provide brand creative assets and product photography"]'::jsonb,
    '["Platform ad spend is paid directly by client to Meta/Google; agency fee covers strategy and management only"]'::jsonb,
    '["Custom dedicated landing page design and conversion rate optimization (CRO)"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How is ad budget handled?","answer":"Ad spend is billed directly to your own credit card by Google or Meta. Our management fee is completely separate, ensuring 100% transparency."}]'::jsonb,
    'Paid Advertising Management (Meta & Google Ads) | Unikorn360',
    'ROI-focused paid advertising management across Google Search, Performance Max, Instagram, and Facebook. Transparent management fees.',
    'published',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000015'::uuid,
    'marketing-creator-campaigns',
    'Social Media & Content Management',
    'social-media-content-management',
    'Consistent organic content creation, brand design templates, and publishing calendars for corporate channels.',
    'Build enterprise brand authority through disciplined organic social media publishing. We plan monthly content themes, design high-quality graphics and carousels, write engaging captions, and maintain active brand visibility across LinkedIn, Instagram, and Facebook.',
    '["Inconsistent, neglected social profiles that make your business look inactive","Poor visual design that undermines corporate credibility with high-value clients","Internal staff lacking time to write structured, educational social content"]'::jsonb,
    '["Corporate Enterprises","MSME Manufacturers","Founders Building Authority","Retail & Consumer Brands"]'::jsonb,
    '["Consistent brand publishing cadence","Polished, corporate visual identity across all platforms","Educates customers on your capabilities and products"]'::jsonb,
    '["Monthly Content Calendar (12–16 Posts)","Custom Graphic Designs & Carousels","Caption Copywriting & Hashtag Research","Monthly Reach & Engagement Analytics"]'::jsonb,
    '[{"id":"pkg-mkt-social-retainer","name":"Brand Presence Retainer","description":"Consistent monthly organic social media content creation and publishing.","price":null,"currency":"INR","billing_period":"monthly","price_type":"starting-from","inclusions":["12 Custom Branded Graphics / Carousels","Editorial Caption Writing","Publishing Scheduling","Monthly Performance Report"],"limits":["Up to 2 social channels (e.g. LinkedIn + Instagram)"],"exclusions":["Paid advertising budget","Daily community customer support management"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Brand Tone & Template Setup","description":"Establish typography, color palette, and repeatable design templates."},{"step":2,"title":"Monthly Calendar Plan","description":"Draft post topics, educational hooks, and case studies for client approval."},{"step":3,"title":"Design & Copy Production","description":"Create branded visuals, carousels, and engaging captions."},{"step":4,"title":"Publishing & Analytics Review","description":"Schedule approved content and deliver monthly reach analysis."}]'::jsonb,
    '["Approve monthly content calendar within agreed review window","Provide high-res factory, team, or product imagery"]'::jsonb,
    '["Direct 24/7 direct-message customer service handling"]'::jsonb,
    '["On-site video production or custom animation reels"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Do we get to approve posts before they go live?","answer":"Yes, every monthly calendar and visual asset is submitted for your written approval prior to publishing."}]'::jsonb,
    'Social Media & Content Management Services | Unikorn360',
    'Professional organic social media management and content design for businesses, manufacturers, and corporate brands.',
    'published',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000016'::uuid,
    'marketing-creator-campaigns',
    'UGC Content Production',
    'ugc-content-production',
    'Authentic user-generated style video assets, demonstrations, and testimonials produced for ad campaigns and social media.',
    'High-converting user-generated style video assets crafted specifically for paid ads and social channels. We handle concept scripting, creator casting, authentic video production, hook testing, and professional editing. Boundary note: Usage rights, commercial licensing periods, and production scope are explicitly defined in every project agreement.',
    '["Stiff, overly polished studio ads that users skip immediately on social feeds","Difficulty sourcing reliable creators who deliver professional, brand-safe video files","Low click-through rates on social ads due to lack of authentic product demonstrations"]'::jsonb,
    '["D2C Consumer Brands","E-commerce Stores","Mobile Apps","Local & Regional Brands Expanding Online"]'::jsonb,
    '["Higher ad click-through rates and thumb-stop ratios","Relatable, believable product demonstrations in regional languages","Full commercial usage rights for agreed digital campaign periods"]'::jsonb,
    '["Concept Scripts with Multiple Hook Angles","Curated Creator Casting & Production","Final High-Res 9:16 Video Deliverables with Captions","Commercial Usage License for Digital Advertising"]'::jsonb,
    '[{"id":"pkg-mkt-ugc-bundle","name":"Core UGC Video Pack","description":"3 custom UGC video concepts with multiple hooks for paid social testing.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["3 Unique Video Concepts","Multiple Hook Variations (3x hooks per video)","Scriptwriting & Regional Creator Selection","12-Month Digital Ad Usage Rights"],"limits":["Agreed video duration up to 60 seconds each"],"exclusions":["Television broadcast or theatrical licensing"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Angle Strategy & Scriptwriting","description":"Develop pain-point, unboxing, and demonstration script angles with bold hooks."},{"step":2,"title":"Creator Casting & Briefing","description":"Match vetted creators from our network matching your target customer demographics."},{"step":3,"title":"Shooting & Raw Review","description":"Creators record native high-res mobile footage following detailed production guidelines."},{"step":4,"title":"Editing & Delivery","description":"Add dynamic captions, callouts, and deliver ad-ready MP4 files."}]'::jsonb,
    '["Ship physical product samples directly to designated creators","Provide brand guidelines and any mandatory regulatory claims"]'::jsonb,
    '["Raw camera footage without licensing agreement; broadcast television usage"]'::jsonb,
    '["Perpetual worldwide commercial license buyout","Additional language voice-overs"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What usage rights are included with the videos?","answer":"Our standard UGC package includes full commercial digital advertising and organic social media usage rights for 12 months."}]'::jsonb,
    'UGC Content Production & Video Ad Creation | Unikorn360',
    'Authentic user-generated style video production for Meta and TikTok ads. Scriptwriting, creator casting, and commercial licensing.',
    'published',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000017'::uuid,
    'marketing-creator-campaigns',
    'Influencer Campaign Management',
    'influencer-campaign-management',
    'End-to-end management of regional creator collaborations, hyperlocal campaigns, and performance tracking.',
    'Strategic management of regional creator and influencer marketing campaigns. We handle creator discovery, campaign-specific creator evaluation reports using our 10-point intelligence scoring matrix, commercial contract coordination, briefing, content approvals, and post-campaign reach analytics. Boundary note: Agency management covers selection, coordination, and reporting; creator compensation fees and usage rights are quoted according to the agreed roster.',
    '["Wasting money on creators with inflated follower counts and fake engagement","Time-consuming back-and-forth negotiations with unreliable influencers","Campaigns failing to drive local store walk-ins or regional sales"]'::jsonb,
    '["Retail Store Chains","Consumer Brands","Regional Manufacturers","Hospitality & Entertainment Venues"]'::jsonb,
    '["100% human-evaluated creators vetted for authentic local engagement","Structured commercial contracts with guaranteed deliverables","Clear post-campaign reporting on reach, views, and interactions"]'::jsonb,
    '["Curated Creator Shortlist & Intelligence Scoring Report","Creator Contracting, Briefing & Deliverable Management","Pre-Publication Quality & Brand Safety Review","Comprehensive Post-Campaign Analytics Report"]'::jsonb,
    '[{"id":"pkg-mkt-influencer-core","name":"Regional Campaign Coordination","description":"End-to-end management of a dedicated regional creator campaign roster.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Creator Discovery & Vetting (Up to 10 Creators)","Contract Negotiation & Deliverable Tracking","Content Quality & Script Review","Final Performance Analytics Dossier"],"limits":["Campaign coordination fee for up to 10 creator partnerships"],"exclusions":["Individual creator compensation fees (itemized transparently in campaign budget)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Campaign Strategy & Budget Allocation","description":"Define target district, reach goals, creator tiers (L1 to L6), and messaging."},{"step":2,"title":"Discovery & Scoring Report","description":"Deliver curated dossier of verified regional creators with engagement scores."},{"step":3,"title":"Contracting & Content Review","description":"Sign standardized agreements, ship products, and review drafts before publishing."},{"step":4,"title":"Campaign Execution & Reporting","description":"Coordinate synchronized release dates and aggregate verified view analytics."}]'::jsonb,
    '["Approve final creator shortlist and campaign creative brief","Supply product inventory or store access for creator visits"]'::jsonb,
    '["Individual creator appearance and publishing fees are billed transparently as separate pass-through costs"]'::jsonb,
    '["On-location event supervision and physical filming coordination"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Are creator fees included in the management price?","answer":"Our management fee covers creator discovery, scoring, contracts, and reporting. Creator compensation is transparently itemized in your campaign roster budget with zero hidden markups."}]'::jsonb,
    'Influencer Campaign Management & Regional Creators | Unikorn360',
    'End-to-end creator campaign coordination, influencer discovery, 10-point engagement scoring, and performance analytics across Tamil Nadu.',
    'published',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000018'::uuid,
    'marketing-creator-campaigns',
    'Marketing Tracking & Reporting',
    'marketing-tracking-reporting',
    'Implementation of Google Analytics 4, Meta Pixel, server-side tracking, UTM pipelines, and executive dashboards.',
    'Accurately measure where your customers come from. We implement Google Analytics 4, Meta Conversions API (server-side tracking), Google Tag Manager, custom event tracking, and clean executive reporting dashboards to verify campaign ROI.',
    '["Running marketing campaigns without knowing which channels drive paying customers","Data loss caused by ad blockers and browser cookie restrictions","Conflicting metrics across Meta, Google Ads, and website analytics"]'::jsonb,
    '["E-commerce Stores","Marketing Leaders","Businesses Running Multi-Channel Ads","Founders Needing Clean Attribution"]'::jsonb,
    '["Accurate attribution of revenue and leads to specific marketing channels","Server-side tracking resilient to browser cookie restrictions","Unified executive dashboard displaying key commercial metrics"]'::jsonb,
    '["Google Analytics 4 & Google Tag Manager Setup","Server-Side Meta Conversions API (CAPI) Integration","Standardized UTM Link Convention & Tracking Framework","Custom Real-Time Marketing Performance Dashboard"]'::jsonb,
    '[{"id":"pkg-mkt-tracking-core","name":"Attribution & Tracking Foundation","description":"Complete audit and implementation of server and client analytics tracking.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["GA4 & GTM Implementation","Meta Pixel & CAPI Setup","E-commerce Purchase / Lead Event Mapping","Attribution Reporting Walkthrough"],"limits":["Single website domain / web application"],"exclusions":["Third-party analytics tool enterprise subscription fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Tracking Audit","description":"Audit existing tags, broken triggers, duplicate event firing, and consent banners."},{"step":2,"title":"GTM & Event Configuration","description":"Configure custom triggers for button clicks, form submissions, and purchases."},{"step":3,"title":"Server-Side CAPI Setup","description":"Deploy server-side event forwarding for privacy-compliant data resilience."},{"step":4,"title":"Validation & Dashboard","description":"Verify event match quality in Meta and Google, and deliver reporting dashboard."}]'::jsonb,
    '["Provide admin access to Google Tag Manager, GA4, and Meta Business Manager","Clarify target commercial conversion events"]'::jsonb,
    '["Legal drafting of corporate privacy policy terms"]'::jsonb,
    '["Multi-domain enterprise cross-domain tracking setup"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Why is server-side tracking necessary today?","answer":"Modern browser privacy settings and ad blockers drop up to 30% of client-side tracking pixels. Server-side tracking restores accurate data capture."}]'::jsonb,
    'Marketing Tracking & GA4 Reporting Services | Unikorn360',
    'Google Analytics 4, Meta Conversions API (CAPI), and Google Tag Manager tracking implementation. Accurate marketing attribution.',
    'published',
    6
  ),
  (
    'b0000000-0000-4000-8000-000000000019'::uuid,
    'ai-automation-business-systems',
    'AI Chatbots & Knowledge Assistants',
    'ai-chatbots-knowledge-assistants',
    'Conversational AI assistants grounded strictly in your approved company documents, SOPs, and product catalogs.',
    'Equip your staff and customers with conversational AI that answers questions accurately using your company’s approved knowledge base. Uses Retrieval-Augmented Generation (RAG) so the assistant never hallucinates outside of your verified manuals, policies, or product documentation.',
    '["Staff constantly interrupting senior managers with routine procedural questions","Customer support representatives taking minutes to look up complex product specifications","New employees taking months to onboard due to scattered, hard-to-search documentation"]'::jsonb,
    '["Manufacturing Units with Complex SOPs","Customer Support Teams","Service Networks","Enterprises with Extensive Documentation"]'::jsonb,
    '["Instant answers in seconds grounded in your verified documents","Zero unauthorized hallucination beyond provided knowledge sources","Available 24/7 across web portals and internal team chat"]'::jsonb,
    '["Custom AI Knowledge Assistant","Document Ingestion & Vector Search Pipeline","Web Widget or Internal Team Interface","Admin Knowledge Base Update Portal"]'::jsonb,
    '[{"id":"pkg-ai-bot-core","name":"Enterprise Knowledge Assistant","description":"Custom conversational assistant connected to your verified document archive.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Document Ingestion (Up to 100 PDFs/Docs)","RAG Vector Search Pipeline","Custom Web Chat Interface","Source Attribution & Reference Links"],"limits":["Knowledge base updates via structured admin dashboard"],"exclusions":["Third-party LLM API compute tokens (billed at direct cost)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Knowledge Base Curation","description":"Collect, clean, and organize official company manuals, policies, and product guides."},{"step":2,"title":"Embedding & RAG Pipeline","description":"Chunk documents and index them in a high-speed vector retrieval database."},{"step":3,"title":"Prompt & Guardrail Engineering","description":"Configure strict behavioral guardrails to refuse answering out-of-scope queries."},{"step":4,"title":"Deployment & Testing","description":"Deploy interface and benchmark accuracy against real staff and customer questions."}]'::jsonb,
    '["Provide current, approved company documentation and SOPs in PDF/Doc format","Review and validate sample answer outputs during testing"]'::jsonb,
    '["Unsupervised direct modification of backend database records"]'::jsonb,
    '["Integration into internal Slack/Microsoft Teams workspaces"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Will the AI invent answers or hallucinate?","answer":"No. We configure strict retrieval guardrails instructing the assistant to only synthesize answers from your provided documents, and to explicitly state when information is not found."}]'::jsonb,
    'AI Chatbots & Knowledge Assistants | Unikorn360',
    'Custom conversational AI assistants and enterprise RAG systems. Accurate, grounded answers from your company documentation.',
    'published',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000020'::uuid,
    'ai-automation-business-systems',
    'Custom AI Agents',
    'custom-ai-agents',
    'Scoped, tool-using AI agents that execute multi-step workflows with strict permission bounds and human approval gates.',
    'Move beyond text generation to autonomous task execution. We build scoped AI agents capable of querying databases, summarizing reports, drafting customer correspondence, and preparing transaction drafts. Every high-stakes action includes mandatory human approval gates.',
    '["Knowledge workers drowning in repetitive multi-step research and data assembly tasks","Slow response times to complex commercial inquiries requiring multiple data lookups","Risk of human oversight when compiling weekly operational summaries"]'::jsonb,
    '["Operations Leaders","Financial Analysts","Logistics Coordinators","Customer Experience Directors"]'::jsonb,
    '["Execute multi-step workflows in seconds rather than hours","Enforce strict human-in-the-loop review before sending emails or updating records","Clear audit logs showing agent reasoning and tool usage steps"]'::jsonb,
    '["Custom AI Agent Workflow Architecture","Tool-Use Integrations (Database, Email, CRM)","Human Approval Dashboard / Review Gate","Audit Logging & Monitoring System"]'::jsonb,
    '[{"id":"pkg-ai-agent-core","name":"Workflow AI Agent","description":"Scoped tool-using agent with explicit human approval controls.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Custom Agent Logic & Tool Schemas","Database & API Tool Connectors","Human Review Queue UI","30-Day Performance Tuning"],"limits":["Strictly scoped tool permissions"],"exclusions":["Fully autonomous financial disbursement without human authorization"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Workflow Decomposition","description":"Break down the multi-step operational task into explicit tools, inputs, and validation gates."},{"step":2,"title":"Tool Schema Engineering","description":"Build secure, deterministic API functions the agent is permitted to execute."},{"step":3,"title":"Approval Interface Build","description":"Create clean dashboard where managers can review and approve proposed agent actions."},{"step":4,"title":"Supervised Pilot","description":"Run agent under close human supervision to calibrate reliability and output quality."}]'::jsonb,
    '["Provide clear operational guidelines on what requires human authorization","Designate operators to test and review agent action proposals"]'::jsonb,
    '["We do not build fully unmonitored agents that bypass financial or legal human review"]'::jsonb,
    '["Multi-agent orchestration pipelines across complex ERPs"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Can the AI agent send emails or modify records without our approval?","answer":"No. All our custom agent architectures enforce explicit human approval gates before executing external actions or modifying critical business databases."}]'::jsonb,
    'Custom AI Agents & Autonomous Workflows | Unikorn360',
    'Scoped tool-using AI agents for business workflows. Secure tool integration, multi-step execution, and human approval controls.',
    'draft',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000021'::uuid,
    'ai-automation-business-systems',
    'Business Workflow Automation',
    'business-workflow-automation',
    'End-to-end operational process automation, webhook triggers, cross-department handoffs, and task synchronization.',
    'Eliminate friction across business handoffs. We connect your inquiries, sales orders, inventory updates, and accounting notifications into an automated pipeline. Cross-links directly with specialized CRM, WhatsApp, and document automation services without redundant duplication.',
    '["Orders slipping through the cracks when transitioning from sales to production","Manual status updating across multiple departmental spreadsheets","Slow response times to new client inquiries outside standard office hours"]'::jsonb,
    '["Manufacturers","Service Companies","Wholesale Distributors","Multi-Branch Businesses"]'::jsonb,
    '["Zero lost leads or forgotten order milestones","Automatic notification handoffs between departments","Real-time visibility into overall workflow velocity"]'::jsonb,
    '["Visual Workflow Architecture Map","Automated Webhook & Pipeline Configuration","Cross-Tool Integration Scripts","System Health Monitoring & Failure Alerting"]'::jsonb,
    '[{"id":"pkg-ai-workflow-core","name":"Process Automation Suite","description":"Complete cross-tool operational workflow automation.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Cross-Department Process Mapping","Up to 5 Automated Workflow Pipelines","Error Handling & Retry Queues","Admin Dashboard Overview"],"limits":["Supported third-party tools with webhooks or APIs"],"exclusions":["Third-party automation platform subscription charges"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Process Mapping","description":"Diagram existing manual handoffs, bottleneck delays, and data flow paths."},{"step":2,"title":"Automation Engineering","description":"Configure triggers, conditionals, data validation, and retry queues."},{"step":3,"title":"Staging Dry Runs","description":"Simulate high transaction volumes and test failure recovery modes."},{"step":4,"title":"Production Handover","description":"Deploy live automations and train department heads on managing exceptions."}]'::jsonb,
    '["Provide login or API credentials for connected software","Validate edge cases and exception handling rules"]'::jsonb,
    '["Manual operational data entry tasks"]'::jsonb,
    '["Integration with legacy non-API Windows desktop software"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How does this connect with WhatsApp and CRM?","answer":"This service handles the overarching cross-tool workflow logic and links directly with our specialized WhatsApp and CRM automation modules."}]'::jsonb,
    'Business Workflow Automation Services | Unikorn360',
    'End-to-end business workflow automation. Streamline cross-tool processes, departmental handoffs, and automated triggers.',
    'published',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000022'::uuid,
    'ai-automation-business-systems',
    'CRM & Sales Automation',
    'crm-sales-automation',
    'Automated lead capture, deal pipeline tracking, quotation follow-up sequences, and sales activity logging.',
    'Never lose a qualified sales lead. We configure and automate custom CRM pipelines that instantly capture leads from your website, WhatsApp, and paid ads, assign them to sales representatives, trigger follow-up reminders, and track deal stages through to closure.',
    '["Inquiries sitting uncontacted in email inboxes for days","Sales reps forgetting to follow up on pending quotations","Leadership lacking clear visibility into the sales pipeline and conversion rates"]'::jsonb,
    '["B2B Sales Teams","Real Estate & Construction Firms","Industrial Suppliers","High-Ticket Service Companies"]'::jsonb,
    '["Sub-5-minute lead response times","Automated quotation follow-up sequences","Real-time sales pipeline visibility for management"]'::jsonb,
    '["Custom CRM Pipeline Setup & Custom Fields","Automated Lead Ingestion from Web & WhatsApp","Follow-up Email/WhatsApp Reminder Workflows","Sales Activity & Conversion Dashboard"]'::jsonb,
    '[{"id":"pkg-ai-crm-core","name":"Sales Pipeline Automation","description":"Complete CRM setup with automated lead capture and follow-ups.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Pipeline Stages & Custom Fields","Inbound Lead Routing Rules","Quotation Follow-Up Automations","Sales Team Training Session"],"limits":["Implementation on approved CRM platform (HubSpot, Zoho, or Custom CRM)"],"exclusions":["Third-party CRM software monthly seat licensing fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Sales Cycle Audit","description":"Review your sales stages, quotation processes, and qualification criteria."},{"step":2,"title":"Pipeline Architecture","description":"Configure custom deal stages, lead scoring, and representative assignment logic."},{"step":3,"title":"Automation Sequences","description":"Set up instant acknowledgment, manager alerts, and staged follow-ups."},{"step":4,"title":"Team Training","description":"Train sales representatives and managers on daily pipeline management."}]'::jsonb,
    '["Provide CRM admin access and existing lead database exports","Ensure sales team attends scheduled pipeline training"]'::jsonb,
    '["Cold outbound prospect list purchasing"]'::jsonb,
    '["Custom bi-directional sync with internal ERP billing databases"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Can this connect with our official WhatsApp?","answer":"Yes, we integrate CRM pipelines directly with official WhatsApp Business API so reps can trigger templates and receive chat updates."}]'::jsonb,
    'CRM & Sales Pipeline Automation | Unikorn360',
    'Automate sales pipelines, lead capture, and quotation follow-ups. Streamline sales operations and improve conversion rates.',
    'published',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000023'::uuid,
    'ai-automation-business-systems',
    'WhatsApp Business Automation',
    'whatsapp-business-automation',
    'Official WhatsApp Business API setup, automated order/booking confirmations, customer service routing, and templates.',
    'Deploy compliant, automated WhatsApp communications using the official WhatsApp Business Cloud API. We implement automated order confirmations, dispatch tracking notifications, appointment reminders, interactive button menus, and team inbox routing.',
    '["Customer support teams overwhelmed answering repetitive status questions","Manual sending of dispatch details and invoice receipts over personal phones","Risk of account ban from using unapproved third-party scrapers"]'::jsonb,
    '["E-commerce Stores","Service Contractors","Healthcare Clinics","Distributors Sending Daily Notifications"]'::jsonb,
    '["Official Green Tick eligible Cloud API compliance","Instant automated responses 24/7","Unified multi-agent support inbox on a single business number"]'::jsonb,
    '["Meta WhatsApp Cloud API Verification","Approved Message Templates (Utility & Marketing)","Interactive Automated Flow & Button Menus","Multi-Agent Web Inbox or CRM Webhook Integration"]'::jsonb,
    '[{"id":"pkg-ai-whatsapp-core","name":"Official WhatsApp Automation Suite","description":"Complete official Meta WhatsApp Cloud API setup and automation.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Meta Business Manager Verification Support","Up to 5 Approved Utility Templates","Interactive Auto-Responder Menu","Webhook Routing to Database or CRM"],"limits":["Dedicated phone number not currently registered on personal WhatsApp"],"exclusions":["Meta per-conversation messaging fees billed directly by Meta"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Meta Verification","description":"Guide your company through official Meta Business verification and number onboarding."},{"step":2,"title":"Template Submission","description":"Draft and submit compliant utility and marketing templates for Meta approval."},{"step":3,"title":"Flow & Webhook Build","description":"Program interactive button menus and webhook triggers from your business systems."},{"step":4,"title":"Live Testing & Go-Live","description":"Test automated delivery, verify delivery receipts, and train your support team."}]'::jsonb,
    '["Provide dedicated clean mobile number for WhatsApp Business API","Provide business registration proof for Meta verification"]'::jsonb,
    '["Unsolicited cold spam broadcasting adhering strictly to Meta policies"]'::jsonb,
    '["AI chatbot NLP integration into WhatsApp conversations"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Is this the official WhatsApp API?","answer":"Yes, we only implement the official Meta WhatsApp Business Cloud API, protecting your business phone number from spam blocks."}]'::jsonb,
    'Official WhatsApp Business Automation | Unikorn360',
    'Official Meta WhatsApp Business Cloud API setup. Automated order notifications, interactive button menus, and team support inbox.',
    'published',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000024'::uuid,
    'ai-automation-business-systems',
    'Document Processing & Automation',
    'document-processing-automation',
    'OCR data extraction from invoices, document classification, automated PDF generation, and approval workflows.',
    'Eliminate manual paperwork transcription. We engineer automated document processing pipelines that extract structured data from scanned invoices, receipts, and challans using OCR, classify incoming files, generate standardized PDF documents, and route them through multi-stage approval workflows.',
    '["Accounting teams spending days manually typing vendor invoices into ERP software","Mismatches between purchase bills and receiving inventory reports","Slow, untracked paper approval processes across multi-department offices"]'::jsonb,
    '["Accounts Departments","Logistics & Freight Operators","Trading Businesses","Industrial Units"]'::jsonb,
    '["90%+ reduction in manual document typing time","High-accuracy automated extraction of invoice line items","Digital audit trails for every document approval"]'::jsonb,
    '["Custom OCR Extraction Pipeline","Automated Document Classification Engine","Dynamic PDF Document Generator","Multi-Stage Web Approval Workflow"]'::jsonb,
    '[{"id":"pkg-ai-doc-core","name":"Document Automation Pipeline","description":"End-to-end OCR extraction and document generation workflow.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Custom OCR Model / Parser for Invoices","ERP / Database Data Export","Automated PDF Generation","Approval Workflow UI"],"limits":["Standardized document format templates"],"exclusions":["Physical document courier handling or manual scanning hardware"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Document Sample Analysis","description":"Collect sample invoices and define target fields (GSTIN, line items, totals, dates)."},{"step":2,"title":"OCR & Parser Training","description":"Configure optical character recognition and extraction regex validation rules."},{"step":3,"title":"Integration & Approval UI","description":"Build interface for staff to review extracted data and approve sync to database."},{"step":4,"title":"Production Rollout","description":"Deploy pipeline with automated error handling for illegible scans."}]'::jsonb,
    '["Provide representative batches of scanned PDF invoices and bills","Define approval rules and financial authorization thresholds"]'::jsonb,
    '["Physical paper document scanning on client premises"]'::jsonb,
    '["Handwriting recognition (ICR) for non-standard handwritten slips"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What formats can the system extract data from?","answer":"The pipeline extracts structured data from digital PDFs, scanned image PDFs, TIFFs, JPGs, and PNG document uploads."}]'::jsonb,
    'Document Processing & OCR Automation | Unikorn360',
    'Automated invoice OCR data extraction, document classification, dynamic PDF generation, and digital approval workflows.',
    'draft',
    6
  ),
  (
    'b0000000-0000-4000-8000-000000000025'::uuid,
    'ai-automation-business-systems',
    'Business Dashboards & Reporting Systems',
    'business-dashboards-reporting-systems',
    'Custom web reporting dashboards, operational KPI cockpits, automated data feeds, and scheduled email reports.',
    'Build and maintain executive reporting tools that deliver single-pane-of-glass visibility. We unify data from your accounting software, production records, CRMs, and bank statements into real-time interactive web dashboards with role-based access and automated scheduled PDF summaries.',
    '["Founders having to wait until the 15th of the next month to understand profitability","Scattered data across five different platforms that never agree with each other","Lack of visibility into real-time debtor ageing, cash runway, and inventory turns"]'::jsonb,
    '["Business Promoters","Chief Operating Officers","Financial Controllers","Multi-Unit Managing Partners"]'::jsonb,
    '["Daily clarity on real gross margins and cash flow runway","Single unified view without logging into multiple tools","Accessible securely on mobile and desktop devices"]'::jsonb,
    '["Custom Web Executive Dashboard","Automated Database / Spreadsheet Data Ingestion Feeds","Role-Based Dashboard Access Permissions","Scheduled Automated Executive Summary Reports"]'::jsonb,
    '[{"id":"pkg-ai-dash-core","name":"Executive Intelligence Cockpit","description":"Complete custom business reporting dashboard with automated feeds.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Up to 15 Core Business Metrics / Charts","Automated Daily Data Sync Pipeline","Mobile & Desktop Responsive Dashboard","Scheduled Weekly PDF Executive Summary"],"limits":["Single organization scope"],"exclusions":["Third-party database hosting compute fees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"KPI & Metric Scrutiny","description":"Define the critical 10–15 numbers that genuinely drive your business decisions."},{"step":2,"title":"Data Feed Engineering","description":"Build automated connectors to your accounting software, databases, or sheets."},{"step":3,"title":"Dashboard Interface Build","description":"Develop clean, interactive charts, KPI metric cards, and drill-down tables."},{"step":4,"title":"Reconciliation & Launch","description":"Verify dashboard calculations against audited figures and launch secure access."}]'::jsonb,
    '["Provide access to source data files, databases, or accounting reports","Verify calculation logic with internal finance controller"]'::jsonb,
    '["Manual entry of unrecorded offline cash transactions"]'::jsonb,
    '["Real-time factory floor IoT sensor machine monitoring integration"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Can this show our real gross margins and cash position daily?","answer":"Yes. By synchronizing with your sales registers, purchase bills, and bank balance feeds, the dashboard calculates real-time margins and cash runways."}]'::jsonb,
    'Business Dashboards & Reporting Systems | Unikorn360',
    'Custom executive business dashboards, KPI cockpits, automated data pipelines, and scheduled performance reporting tools.',
    'published',
    7
  ),
  (
    'b0000000-0000-4000-8000-000000000026'::uuid,
    'research-business-strategy',
    'Market & Customer Research',
    'market-customer-research',
    'Customer demand mapping, buyer persona interviews, addressable market sizing, and purchasing behavior research.',
    'Make informed commercial bets grounded in verified market demand. We conduct qualitative customer interviews, analyze regional market demand, estimate addressable market size, and map customer decision criteria before you invest capital in expansion or new products.',
    '["Investing heavy capital into product lines without verifying customer willingness to pay","Unclear understanding of why prospective clients choose competing alternatives","Entering new geographic territories without localized buyer insights"]'::jsonb,
    '["Founders Launching New Products","Companies Entering New Regions","MSMEs Planning Facility Expansions"]'::jsonb,
    '["Clear evidence of real customer demand before spending capital","Granular understanding of customer purchase objections and criteria","Actionable positioning recommendations"]'::jsonb,
    '["Market Demand & Opportunity Dossier","Target Buyer Personas & Decision Drivers","Addressable Market Size (TAM/SAM/SOM) Model","Executive Strategic Findings Presentation"]'::jsonb,
    '[{"id":"pkg-res-market-study","name":"Market Opportunity Assessment","description":"Structured customer and market research study for business decision-makers.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Customer & Buyer Demand Interviews","Secondary Market Size Analysis","Customer Journey Mapping","Written Strategic Assessment Report"],"limits":["Scoped according to agreed target category and geography"],"exclusions":["Large-scale randomized statistical consumer polling (>1,000 respondents)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Hypothesis Scoping","description":"Define the core market questions, target categories, and geographic focus."},{"step":2,"title":"Customer & Channel Research","description":"Conduct structured buyer interviews and analyze channel demand indicators."},{"step":3,"title":"Synthesis & Market Sizing","description":"Synthesize qualitative feedback and model addressable market volume."},{"step":4,"title":"Strategic Recommendations","description":"Deliver comprehensive research findings and go-to-market advisory."}]'::jsonb,
    '["Provide introductions to past/current customer contacts for interviews where appropriate","Clarify unit economics and pricing boundaries"]'::jsonb,
    '["Academic theoretical research with no commercial operational utility"]'::jsonb,
    '["Cross-border international export market destination studies"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How is this research conducted?","answer":"We combine direct buyer and channel interviews with verifiable industry data, pricing benchmarks, and demand trends."}]'::jsonb,
    'Market & Customer Research Services | Unikorn360',
    'Customer demand research, buyer persona interviews, market opportunity sizing, and go-to-market strategic assessments.',
    'draft',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000027'::uuid,
    'research-business-strategy',
    'Competitor & Advertising Research',
    'competitor-advertising-research',
    'Competitive intelligence on competitor positioning, pricing strategies, active advertising campaigns, and market gaps.',
    'Understand exactly how your competitors position themselves, what ad angles they run, and where their weaknesses lie. We audit competitor websites, advertising creative history across Meta/Google ad libraries, pricing structures, customer reviews, and identify exploitable market gaps.',
    '["Blind spots regarding what offers and creative angles competitors are actively running","Price competition eroding margins because your value proposition lacks clear differentiation","Launching ad campaigns that blend in rather than standing out from the competitive set"]'::jsonb,
    '["Business Owners Facing Price Wars","D2C Brand Founders","Companies Launching Paid Ads","Expanding MSMEs"]'::jsonb,
    '["Clear map of competitor strengths, weaknesses, and pricing tiers","Intelligence on competitor best-selling offers and active ad angles","Identify underserved customer segments competitors ignore"]'::jsonb,
    '["Competitor Positioning & Offer Matrix","Advertising Creative & Messaging Breakdown","Customer Review Sentiment & Complaints Audit","Strategic Differentiation Playbook"]'::jsonb,
    '[{"id":"pkg-res-comp-audit","name":"Competitor Intelligence Dossier","description":"Comprehensive research into 5 key competitors and active market dynamics.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Audit of 5 Core Competitors","Ad Library Creative History Analysis","Pricing & Packaging Comparison","Actionable Differentiation Recommendations"],"limits":["Publicly observable and commercial market data"],"exclusions":["Illicit corporate espionage or non-public trade secret acquisition"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Competitor Set Selection","description":"Identify direct, indirect, and emerging alternative competitors."},{"step":2,"title":"Digital & Advertising Audit","description":"Analyze active Meta/Google ads, traffic sources, landing pages, and messaging."},{"step":3,"title":"Sentiment & Gap Analysis","description":"Mine public customer reviews to identify common complaints and unmet needs."},{"step":4,"title":"Strategy Synthesis","description":"Deliver competitive matrix and recommendations to position your business decisively."}]'::jsonb,
    '["Identify current known competitors and key lost deal situations","Clarify your proprietary advantages and operational constraints"]'::jsonb,
    '["Unethical or illegal corporate espionage practices"]'::jsonb,
    '["Continuous quarterly competitor advertising monitoring subscription"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What sources are used to analyze competitors?","answer":"We analyze public advertising libraries (Meta, Google), web architecture, pricing structures, review sentiment, and published commercial collateral."}]'::jsonb,
    'Competitor & Advertising Research | Unikorn360',
    'Competitive intelligence, advertising analysis, competitor pricing audits, and strategic positioning research for business growth.',
    'published',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000028'::uuid,
    'research-business-strategy',
    'Industry & Opportunity Research',
    'industry-opportunity-research',
    'Analysis of emerging sector trends, regulatory shifts, supply chain developments, and new product opportunities.',
    'Identify emerging business opportunities before your competitors. We analyze macro industry trends, technological developments, raw material supply chain dynamics, and regulatory policy shifts to help business promoters evaluate diversification and investment opportunities.',
    '["Over-reliance on a single declining legacy product category","Missing profitable opportunities created by new government industrial policies","Lack of structured market data when considering entering an adjacent industry"]'::jsonb,
    '["Industrial Promoters Planning Diversification","Second-Generation Business Leaders","MSME Investors"]'::jsonb,
    '["Identify high-margin emerging niches before market saturation","Understand regulatory tailwinds and subsidy opportunities early","Rigorous data-backed foundation for diversification decisions"]'::jsonb,
    '["Industry Trends & Opportunity Brief","Supply Chain & Margin Dynamics Assessment","Regulatory & Subsidy Policy Landscape Review","Feasibility & Action Roadmap"]'::jsonb,
    '[{"id":"pkg-res-ind-opportunity","name":"Sector Opportunity Assessment","description":"Comprehensive research into an emerging industry or adjacent market sector.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["Sector Growth Drivers & Headwinds","Regulatory Policies & Incentive Schemes","Margin Benchmark Analysis","Executive Briefing Dossier"],"limits":["Single specified industry or niche category"],"exclusions":["Stock market equities trading advice"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Sector Framing","description":"Define the target sector, product category, and investment capacity."},{"step":2,"title":"Data Gathering","description":"Evaluate trade statistics, industry production figures, and regulatory policies."},{"step":3,"title":"Value Chain Mapping","description":"Map raw materials, intermediate processors, distribution margins, and end-buyers."},{"step":4,"title":"Executive Briefing","description":"Deliver strategic report highlighting concrete diversification opportunities."}]'::jsonb,
    '["Clarify available manufacturing capabilities, factory space, and capital budget","Participate in milestone review sessions"]'::jsonb,
    '["Financial investment advice or SEBI-regulated securities recommendations"]'::jsonb,
    '["Detailed technical plant layout feasibility studies"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How does this help our manufacturing business diversify?","answer":"We identify adjacent products utilizing your existing factory infrastructure or equipment with higher gross margins and growing market demand."}]'::jsonb,
    'Industry & Opportunity Research for MSMEs | Unikorn360',
    'Sector trends research, industry opportunity assessments, supply chain analysis, and diversification studies for business leaders.',
    'draft',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000029'::uuid,
    'research-business-strategy',
    'Business Performance Analysis',
    'business-performance-analysis',
    'Deep-dive operational diagnostics, true product margin analysis, cost-leakage detection, and growth recommendations.',
    'Understand the real financial and operational health of your business. We analyze historical sales registers, billings, unit economics, working capital cycle, and production overheads to uncover hidden cost leaks, identify your most profitable customers, and deliver concrete findings to boost net margins.',
    '["Revenue is increasing but bank balances and net profits are not growing","Unclear which product lines generate real profit versus subsidizing loss-makers","Operating cash trapped in slow-moving inventory and overdue customer receivables"]'::jsonb,
    '["Established MSME Promoters","Factory Owners","Service Firm Partners","Companies Preparing for Growth Financing"]'::jsonb,
    '["Clear diagnosis of true gross and contribution margins by SKU","Identify cost leakages and unprofitable accounts","Actionable operational fixes to improve working capital liquidity"]'::jsonb,
    '["Financial & Operational Diagnostic Report","Product Unit Economics & Margin Breakdown","Working Capital & Cash Conversion Cycle Audit","Prioritized Profit Improvement Roadmap"]'::jsonb,
    '[{"id":"pkg-res-diagnostic-audit","name":"Operational & Margin Diagnostic","description":"Comprehensive operational and financial diagnostic audit.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Historical Financial Data Review (Last 1–3 Years)","Product-Level Unit Economics Analysis","Working Capital & Debtor Ageing Diagnostic","Written Findings & Profit Optimization Roadmap"],"limits":["Single business entity"],"exclusions":["Statutory tax audit or CA audit sign-off"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Data Ingestion","description":"Review Tally/ERP ledger backups, sales registers, purchase bills, and bank statements."},{"step":2,"title":"Margin & Cost Decomposition","description":"Calculate actual direct material, labor, overhead, and finance costs per unit."},{"step":3,"title":"Cash Flow & Receivables Analysis","description":"Analyze customer payment timelines and slow-moving inventory holding costs."},{"step":4,"title":"Executive Presentation","description":"Present diagnostic findings and prioritized profit improvement action plan."}]'::jsonb,
    '["Provide complete ledger backups, P&L statements, and billings datasets","Designate financial controller or accountant for data clarification"]'::jsonb,
    '["Statutory statutory audit certifications (performed by your chartered accountant)"]'::jsonb,
    '["Hands-on monthly retainer implementation of diagnostic recommendations"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Is this the same as a chartered accountant audit?","answer":"No. A statutory CA audit verifies tax compliance. Our performance analysis is an operational management diagnostic designed to increase profits and eliminate cost leaks."}]'::jsonb,
    'Business Performance Analysis & Margin Diagnostics | Unikorn360',
    'Operational diagnostics, true margin analysis, cost-leakage detection, and working capital optimization for business promoters.',
    'published',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000030'::uuid,
    'research-business-strategy',
    'Business Planning & Financial Feasibility',
    'business-planning-financial-feasibility',
    'Comprehensive business plans, commercial financial models, break-even analysis, and capital requirement forecasting.',
    'Develop structured commercial business plans and financial projection models. Designed for promoters planning major expansions, launching new ventures, or seeking investor funding. Includes multi-year revenue projections, CAPEX/OPEX budgets, debt servicing calculations, and break-even models.',
    '["Uncertainty about how much capital is genuinely needed to reach break-even","Investors or financial partners requesting robust, defensible financial models","Expansion projects running into cash shortages due to poor working capital planning"]'::jsonb,
    '["Founders Seeking Investment","Promoters Planning Facility Expansions","Business Partners Structuring New Ventures"]'::jsonb,
    '["Robust, banker- and investor-grade financial model","Clear visibility on break-even timeline and cash runway requirements","Scenario sensitivity analysis for best, expected, and worst cases"]'::jsonb,
    '["Commercial Business Plan Document","Multi-Year Dynamic Financial Projection Model (Excel)","CAPEX / OPEX / Break-Even Sensitivity Analysis","Executive Pitch Summary Deck"]'::jsonb,
    '[{"id":"pkg-res-feasibility-core","name":"Comprehensive Feasibility & Financial Model","description":"Complete commercial business plan and multi-year projection model.","price":null,"currency":"INR","billing_period":"project-based","price_type":"quotation","inclusions":["3–5 Year Financial Projection Model","Detailed Cost & Revenue Assumptions Matrix","Break-Even & Sensitivity Analysis","Professional Business Plan Document"],"limits":["Single venture or expansion project"],"exclusions":["Direct investor matchmaking guarantees"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Commercial Assumptions Scrutiny","description":"Establish capacity, pricing, bill of materials, staffing, and fixed overheads."},{"step":2,"title":"Financial Model Construction","description":"Engineer dynamic P&L, balance sheet, cash flow, and debt servicing schedules."},{"step":3,"title":"Scenario & Stress Testing","description":"Test sensitivity against raw material inflation, delay in sales, and interest rates."},{"step":4,"title":"Business Plan Synthesis","description":"Deliver bound business plan and editable Excel model for stakeholder review."}]'::jsonb,
    '["Provide technical quotes for planned plant/machinery and facility lease estimates","Clarify targeted commercial sales volumes"]'::jsonb,
    '["Legal investor solicitation or equity broker services"]'::jsonb,
    '["Multiple brand or multi-entity consolidated financial models"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Will this model be editable by our team?","answer":"Yes, we provide fully unlocked, documented Excel models with dynamic assumption toggles so you can adjust scenarios at any time."}]'::jsonb,
    'Business Planning & Financial Feasibility Modeling | Unikorn360',
    'Commercial business plans, multi-year financial projection models, break-even analysis, and capital requirement forecasting.',
    'draft',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000031'::uuid,
    'research-business-strategy',
    'Startup & Growth Consulting',
    'startup-growth-consulting',
    'Strategic advisory for founders and leadership teams navigating early scaling, operational bottlenecks, and milestones.',
    'Hands-on strategic consulting for founders and business partners. We help you structure your operating rhythms, refine your business model, establish milestone tracking, resolve founder alignment bottlenecks, and prepare your organization for sustainable scaling.',
    '["Founders overwhelmed wearing every operational hat with no time for strategy","Growth stalling after early customer traction due to operational chaos","Disagreement between partners on operational priorities and capital allocation"]'::jsonb,
    '["Early-Stage Founders","Growing MSME Managing Partners","Second-Generation Business Leaders"]'::jsonb,
    '["Clear quarterly milestone roadmap and operational priorities","Objective outside perspective on structural bottlenecks","Disciplined executive decision-making rhythm"]'::jsonb,
    '["Strategic Growth Roadmap","Operating Rhythms & KPI Framework","Bi-Weekly Executive Advisory Sessions","Direct Founder Advisory Access"]'::jsonb,
    '[{"id":"pkg-res-growth-advisory","name":"Founder Strategic Retainer","description":"Bi-weekly strategic consulting sessions and milestone oversight.","price":null,"currency":"INR","billing_period":"monthly","price_type":"starting-from","inclusions":["Two 90-Minute Executive Strategy Sessions / Month","Quarterly Growth Roadmap Calibration","Review of Commercial Proposals & Models","Direct WhatsApp Access to Lead Advisor"],"limits":["Founder and leadership team scope"],"exclusions":["Full-time interim operational executive management"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Diagnostic Assessment","description":"Review business model, current traction, operational bottlenecks, and partner goals."},{"step":2,"title":"Roadmap & OKR Setting","description":"Establish clear 90-day targets, accountability owners, and key metrics."},{"step":3,"title":"Bi-Weekly Advisory Sprints","description":"Review milestone progress, remove execution roadblocks, and evaluate opportunities."},{"step":4,"title":"Quarterly Strategic Reset","description":"Assess quarterly results against plan and recalibrate commercial objectives."}]'::jsonb,
    '["Commit key founders to scheduled advisory sessions","Execute agreed operational action items between sessions"]'::jsonb,
    '["Day-to-day routine operational staff management"]'::jsonb,
    '["On-site full-day strategy retreats with leadership teams"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What makes your consulting practical rather than theoretical?","answer":"We are grounded in real-world systems, technology, compliance, and cash flow economics. Every session focuses on actionable operational decisions."}]'::jsonb,
    'Startup & Growth Advisory Consulting | Unikorn360',
    'Strategic consulting for founders and business owners. Resolve operational bottlenecks, establish milestone tracking, and scale sustainably.',
    'published',
    6
  ),
  (
    'b0000000-0000-4000-8000-000000000032'::uuid,
    'business-setup-documentation',
    'Business Registration Assistance',
    'business-registration-assistance',
    'Documentation support for Sole Proprietorships, Partnerships, Limited Liability Partnerships (LLP), and Private Limited companies.',
    'Establish your legal business entity with complete documentation support. We assist with name reservation, drafting Partnership Deeds, MOA/AOA documentation, Director Identification Numbers (DIN), Digital Signature Certificates (DSC), and Ministry of Corporate Affairs (MCA) incorporation filings.',
    '["Confusion regarding whether to incorporate as an LLP, Pvt Ltd, or Partnership","Name rejection and delays due to non-compliant incorporation documentation","Missing statutory post-incorporation registrations that lead to penalties"]'::jsonb,
    '["New Entrepreneurs","Partnerships Formalizing Entities","Proprietors Transitioning to Pvt Ltd"]'::jsonb,
    '["Clear advice on the right legal entity structure","Complete end-to-end documentation preparation","Accelerated turnaround with zero name rejection rework"]'::jsonb,
    '["Entity Structure Recommendation","Drafting of MOA, AOA, or Partnership Deed","MCA Filing Support & Certificate of Incorporation","Company PAN, TAN & Digital Signature Certificates"]'::jsonb,
    '[{"id":"pkg-doc-pvt-ltd","name":"Private Limited Incorporation Support","description":"Complete documentation and filing support for Private Limited company incorporation.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Name Reservation Support (RUN/SPICe+)","2 Director DSCs & DIN Allocation","Drafting of MOA & AOA","Certificate of Incorporation, PAN & TAN"],"limits":["Up to 2 directors and authorized capital within standard slab"],"exclusions":["Government MCA stamp duty fees for capital above standard slabs"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Structure & Name Check","description":"Verify proposed entity names against trademark registry and MCA database."},{"step":2,"title":"KYC & DSC Preparation","description":"Obtain Class 3 Digital Signature Certificates and assemble director KYC documents."},{"step":3,"title":"Drafting & SPICe+ Filing","description":"Draft MOA/AOA bylaws and submit incorporation application on MCA portal."},{"step":4,"title":"Certificate & Bank Account Kit","description":"Receive Certificate of Incorporation, PAN, TAN, and assemble bank current account kit."}]'::jsonb,
    '["Provide clean identity (PAN/Aadhaar) and address proofs for all promoters","Provide registered office premises electricity bill and owner NOC"]'::jsonb,
    '["Commercial lease security deposit payments"]'::jsonb,
    '["Foreign national director compliance and embassy attestation support"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"How long does company incorporation take?","answer":"With clean KYC documents and an approved name, incorporation is typically completed in 7 to 10 working days on the MCA portal."}]'::jsonb,
    'Business Registration & Company Incorporation Support | Unikorn360',
    'Documentation support for Private Limited company incorporation, LLP registration, Partnership Deeds, DSC, and MCA filings.',
    'published',
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000033'::uuid,
    'business-setup-documentation',
    'GST & Udyam Assistance',
    'gst-udyam-assistance',
    'GST tax registration, Udyam MSME priority certificate support, monthly filing coordination, and ITC reconciliations.',
    'Ensure statutory tax and MSME priority compliance. We assist with new GST registrations, jurisdiction alignment, HSN classification, Udyam MSME priority certificates (unlocking collateral-free bank loans and government subsidies), monthly GSTR-1 and GSTR-3B coordination, and GSTR-2B input tax credit reconciliations.',
    '["Show-cause notices and rejected GST applications due to documentation mismatches","Missing out on MSME priority lending benefits, interest subventions, and subsidies","Losing thousands of rupees in uncredited Input Tax Credit (ITC) due to defaulting vendors"]'::jsonb,
    '["New Businesses Requiring GSTIN","Manufacturers Needing Udyam Priority","Traders & Exporters with Monthly Filings"]'::jsonb,
    '["Accurate HSN/SAC code selection with zero departmental rejection","Udyam certificate unlocking government tender priority and MSME schemes","Disciplined monthly filing coordination preventing late fee penalties"]'::jsonb,
    '["GST Registration Certificate (Form REG-06)","Udyam MSME Registration Certificate","Monthly Return Filing Coordination Dossier","GSTR-2B Input Tax Credit Reconciliation Reports"]'::jsonb,
    '[{"id":"pkg-doc-gst-udyam-bundle","name":"GST & Udyam Startup Foundation","description":"Complete registration assistance for GST and Udyam MSME certificates.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["New GSTIN Registration Support","Aadhaar Authentication Handling","Udyam MSME Priority Certificate","HSN Code Mapping & Compliance Guidance"],"limits":["Single business entity"],"exclusions":["Subsequent monthly return filings (available under monthly retainer)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Document & Jurisdiction Review","description":"Examine premises electricity bill, rental agreement, PAN, and assign correct tax ward."},{"step":2,"title":"HSN & Portal Application","description":"Select 6/8-digit HSN codes and file application with biometric/Aadhaar OTP auth."},{"step":3,"title":"Clarification Follow-Up","description":"Address any departmental REG-03 clarification notices within 24 hours."},{"step":4,"title":"Certificate Grant & Udyam","description":"Deliver active GSTIN certificate and generate corresponding Udyam MSME priority card."}]'::jsonb,
    '["Provide Aadhaar-linked mobile OTP for instant authentication","Provide latest premises electricity bill and landlord NOC"]'::jsonb,
    '["Payment of statutory tax dues, interest, or historical departmental penalties"]'::jsonb,
    '["GST cancellation revocation and department notice appeal support"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What is the benefit of obtaining a Udyam certificate?","answer":"Udyam registration certifies your business as a recognized MSME, unlocking eligibility for collateral-free bank loans (CGTMSE), lower trademark fees, and government capital subsidies."}]'::jsonb,
    'GST & Udyam MSME Registration Assistance | Unikorn360',
    'Fast, compliant GST registration and Udyam MSME priority certificate support. HSN classification and monthly filing coordination.',
    'published',
    2
  ),
  (
    'b0000000-0000-4000-8000-000000000034'::uuid,
    'business-setup-documentation',
    'Trademark Filing Coordination',
    'trademark-filing-coordination',
    'Comprehensive brand name availability searches, Nice class mapping, trademark application coordination, and examination support.',
    'Protect your brand name, logo, and intellectual property. We coordinate comprehensive trademark availability searches across Indian Trademark Registry classes, map your products to the correct Nice classifications, prepare application documentation, and coordinate TM application filings.',
    '["Building a successful brand only to discover a competitor has trademarked your name","Receiving trademark objections due to incorrect class selection or descriptive names","Wasting time and government fees on trademark applications destined for rejection"]'::jsonb,
    '["Brand Founders","Product Manufacturers","E-commerce Sellers","Expanding Retail Businesses"]'::jsonb,
    '["Immediate legal priority upon application number generation (use of ™ symbol)","Thorough similarity search preventing costly infringement disputes","Special 50% government fee concession support for registered MSMEs/Startups"]'::jsonb,
    '["Pre-Filing Trademark Similarity Search Report","Nice Classification Mapping Strategy","Trademark Form TM-A Documentation Dossier","Official Trademark Application Acknowledgment"]'::jsonb,
    '[{"id":"pkg-doc-tm-coordination","name":"Single Class Trademark Filing Coordination","description":"Comprehensive search, documentation, and filing coordination.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Comprehensive Trademark Database Similarity Search","Class Mapping & Specification Drafting","Filing Coordination on IP India Portal","Application Tracking & Status Alerts"],"limits":["Single brand mark in single Nice classification"],"exclusions":["Government statutory filing fees paid directly to IP India (₹4,500 for MSME / ₹9,000 for non-MSME)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Similarity Search","description":"Analyze phonetically and visually similar existing registered and pending marks."},{"step":2,"title":"Class & Specification Drafting","description":"Draft precise description of goods and services under relevant Nice classes."},{"step":3,"title":"Application Coordination","description":"Submit TM-A documentation with digital signature on IP India portal."},{"step":4,"title":"Application Handover","description":"Deliver official government filing receipt and instructions for legal ™ symbol usage."}]'::jsonb,
    '["Provide high-resolution logo graphic and clear list of goods/services sold","Provide Udyam certificate to qualify for 50% government fee discount"]'::jsonb,
    '["IP India government official filing fee; formal legal contestation in trademark opposition hearings"]'::jsonb,
    '["Written legal reply drafting for Trademark Examination Report objections"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"When can I start using the ™ symbol?","answer":"You can legally display the ™ symbol immediately upon receiving the official trademark application number and government filing receipt."}]'::jsonb,
    'Trademark Filing Coordination & Brand Protection | Unikorn360',
    'Brand name search, Nice classification mapping, and trademark application filing coordination for Indian businesses and startups.',
    'published',
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000035'::uuid,
    'business-setup-documentation',
    'Government Scheme Application Support',
    'government-scheme-application-support',
    'Documentation and application coordination for MSME subsidies including PMEGP, NEEDS, and capital investment incentives.',
    'Access government capital subsidies and incentive schemes designed for MSMEs. We evaluate your eligibility for central and state programs (including PMEGP, NEEDS, and capital investment subsidies), assemble compliant project files, coordinate portal filings, and support bank coordination through to sanction.',
    '["Missing out on non-repayable government capital subsidies of 15% to 35%","Applications rejected due to improper project documentation or missing eligibility certificates","Getting lost in multi-department portal procedures between District Industries Centres (DIC) and banks"]'::jsonb,
    '["New Manufacturing Entrepreneurs","Expanding Industrial Units","Women & SC/ST Promoters Eligible for Special Slabs"]'::jsonb,
    '["Maximize legitimate capital subsidy eligibility (up to 25%–35% under PMEGP/NEEDS)","Bank-compliant project documentation aligned with scheme guidelines","Guidance through DIC scrutiny and task force committee presentations"]'::jsonb,
    '["Scheme Eligibility Assessment & Subsidy Calculation Matrix","Scheme-Compliant Detailed Project Report (DPR)","Portal Application Dossier & Upload Coordination","Bank Branch Subsidy Claim Follow-up Kit"]'::jsonb,
    '[{"id":"pkg-doc-subsidy-support","name":"Government Scheme Facilitation","description":"Complete eligibility evaluation, DPR, and portal application support.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Scheme Eligibility Verification","Scheme-Compliant Project Report & Financials","Government Portal Filing Coordination","Guidance on Task Force Committee Interview"],"limits":["Single project investment proposal"],"exclusions":["We do not promise or guarantee government approvals, adhering strictly to official merit criteria"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Eligibility Scrutiny","description":"Evaluate promoter qualifications, community criteria, location, and proposed project cost."},{"step":2,"title":"DPR & Financial Formulation","description":"Draft detailed scheme-compliant project report matching DIC and bank norms."},{"step":3,"title":"Portal Application","description":"Coordinate online application filing with required quotations and statutory attachments."},{"step":4,"title":"Sanction & Subsidy Claim Support","description":"Assist bank branch with subsidy claim submission upon loan disbursement."}]'::jsonb,
    '["Provide legitimate machinery quotations from verified GST-registered vendors","Attend mandatory DIC Task Force Committee interview in person"]'::jsonb,
    '["We do not guarantee government sanctions or make unofficial claims; approval rests strictly with government task force committees"]'::jsonb,
    '["Multi-department pollution control or factory clearance coordination"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What is the typical subsidy under PMEGP and NEEDS?","answer":"PMEGP offers 15% to 35% margin money subsidy on project costs up to ₹50 Lakhs for manufacturing. The NEEDS scheme provides 25% subsidy up to ₹75 Lakhs for first-generation entrepreneurs."}]'::jsonb,
    'MSME Government Subsidy Support (PMEGP / NEEDS) | Unikorn360',
    'Application support and project reports for PMEGP, NEEDS, and MSME capital subsidies. Eligibility verification and portal filing coordination.',
    'published',
    4
  ),
  (
    'b0000000-0000-4000-8000-000000000036'::uuid,
    'business-setup-documentation',
    'DPR & Loan Documentation',
    'dpr-loan-documentation',
    'Bank-ready Detailed Project Reports (DPR), CMA data, debt-service coverage (DSCR) calculations, and term loan files.',
    'Secure institutional bank financing with banker-grade loan documentation. We prepare comprehensive Detailed Project Reports (DPR), Credit Monitoring Arrangement (CMA) data spreadsheets, Debt Service Coverage Ratio (DSCR) schedules, cash flow projections, and bank proposal dossiers compliant with nationalized and private bank credit norms.',
    '["Bank credit officers rejecting loan files due to amateur or incomplete project reports","Unrealistic financial projections that fail banking scrutiny during credit committee reviews","Delays in working capital (CC/OD) limit enhancements due to improper CMA data formulation"]'::jsonb,
    '["Manufacturers Expanding Plant & Machinery","Businesses Applying for Bank Term Loans","Firms Seeking Working Capital Enhancements (CC/OD)"]'::jsonb,
    '["DPR formulated to banking credit standards minimizing underwriting queries","Accurate DSCR, MPBF, and IRR models aligned with credit guidelines","Faster loan appraisal and sanction process at commercial banks"]'::jsonb,
    '["Bank-Ready Detailed Project Report (DPR)","Multi-Year CMA Data (Past 2 yrs + Current yr + Next 5 yrs)","Debt Service Coverage Ratio (DSCR) Schedule","Executive Bank Credit Proposal Summary"]'::jsonb,
    '[{"id":"pkg-doc-dpr-standard","name":"Bank-Ready DPR & CMA Package","description":"Complete institutional project report and financial model for bank financing.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Comprehensive Detailed Project Report (DPR)","Bank-Standard CMA Data File","DSCR & Repayment Schedule","Addressing Bank Credit Officer Queries"],"limits":["Single project loan application up to standard institutional limits"],"exclusions":["Loan sanction guarantees (sanction decisions rest strictly with bank credit committees)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"approved"}]'::jsonb,
    '[{"step":1,"title":"Project Scrutiny & Costing","description":"Analyze proposed civil works, machinery quotations, promoter margin, and loan amount."},{"step":2,"title":"Financial Modeling & CMA","description":"Formulate dynamic CMA data with defensible sales assumptions and working capital ratios."},{"step":3,"title":"DPR Drafting","description":"Author technical, commercial, managerial, and economic viability sections."},{"step":4,"title":"Bank Dossier Handover","description":"Deliver bound DPR and Excel CMA data ready for immediate submission to branch manager."}]'::jsonb,
    '["Provide past 2–3 years audited balance sheets and current year provisional statements","Supply formal machinery quotations and building estimates"]'::jsonb,
    '["We do not guarantee loan sanctions; approval decisions rest solely with bank credit underwriting teams"]'::jsonb,
    '["Consolidated financial models for multi-company borrower groups"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"What is CMA data and why do banks require it?","answer":"CMA (Credit Monitoring Arrangement) data analyzes past and projected financial performance across 7 standardized tables. Banks mandate it to assess repayment capacity and calculate working capital limits."}]'::jsonb,
    'Bank-Ready DPR & CMA Data Preparation | Unikorn360',
    'Bank-ready Detailed Project Reports (DPR), CMA data formulation, working capital assessments, and loan documentation for MSMEs.',
    'published',
    5
  ),
  (
    'b0000000-0000-4000-8000-000000000037'::uuid,
    'business-setup-documentation',
    'Property Documentation Coordination',
    'property-documentation-coordination',
    'Coordination and review support for industrial lease deeds, title search documentation, and bank collateral indexing.',
    'Secure your real estate and facility paperwork. We support businesses and industrial promoters in reviewing commercial lease agreements, compiling property title documents for bank mortgage collateral, coordinating Encumbrance Certificate (EC) verification, and creating indexed digital property document vaults.',
    '["Commercial lease deeds containing unfavorable lock-in clauses or unclear maintenance liabilities","Bank loan disbursements delayed because property collateral documents are incomplete or disordered","Difficulty locating historical title documents, patta transfers, or tax receipts during bank scrutiny"]'::jsonb,
    '["Manufacturers Leasing Industrial Sheds","Borrowers Pledging Property for Bank Loans","Business Owners Buying Commercial Premises"]'::jsonb,
    '["Clear scrutiny of commercial lease covenants before signing","Indexed collateral document dossier ready for bank legal panel scrutiny","Reduced risk of title defects or encumbrance surprises"]'::jsonb,
    '["Commercial Lease Deed Review & Modification Notes","Bank Collateral Property Document Checklist","Encumbrance Certificate & Tax Receipt Coordination","Secure Digital Property Document Vault"]'::jsonb,
    '[{"id":"pkg-doc-prop-coordination","name":"Property Documentation Review & Index","description":"Coordination and review of property documents for commercial leasing or bank collateral.","price":null,"currency":"INR","billing_period":"project-based","price_type":"starting-from","inclusions":["Commercial Lease Deed Scrutiny","Title Chain Chronology Compilation","Bank Legal Scrutiny Checklist Review","Digital Document Vault Indexing"],"limits":["Single commercial property / industrial shed"],"exclusions":["Direct legal advocate title opinion certification (issued by bar-registered advocates)"],"setup_charges":"None","tax_treatment":"Subject to applicable GST (18%)","approval_status":"draft"}]'::jsonb,
    '[{"step":1,"title":"Document Intake & Chain Review","description":"Assemble parent deeds, sale deeds, patta, chitta, and encumbrance records."},{"step":2,"title":"Chronological Indexing","description":"Organize uninterrupted title chain chronology and identify any missing links."},{"step":3,"title":"Lease / Agreement Review","description":"Review draft commercial lease terms for exit clauses, sublease rights, and utility liabilities."},{"step":4,"title":"Collateral Dossier Assembly","description":"Package indexed property kit ready for advocate or bank legal panel inspection."}]'::jsonb,
    '["Provide legible copies of all available historical property deeds and latest tax receipts","Coordinate with landlord for premises documents when leasing"]'::jsonb,
    '["Advocate title certification is issued by your designated legal counsel; we provide documentation coordination and review support"]'::jsonb,
    '["Multi-property agricultural-to-industrial land conversion documentation support"]'::jsonb,
    '[]'::jsonb,
    '[{"question":"Do you provide advocate legal opinions?","answer":"We handle documentation coordination, chronological indexing, and commercial lease review. Formal title legal opinions required by banks are executed in coordination with designated bar-registered advocates."}]'::jsonb,
    'Property Documentation Coordination & Lease Review | Unikorn360',
    'Commercial lease deed review, industrial property documentation coordination, title chain indexing, and bank collateral preparation.',
    'draft',
    6
  )
) AS v(
    id,
    division_slug,
    service_name,
    slug,
    short_description,
    full_description,
    problems_solved,
    target_customers,
    benefits,
    deliverables,
    packages,
    process_steps,
    client_responsibilities,
    exclusions,
    additional_charges,
    gallery,
    faqs,
    seo_title,
    seo_description,
    seed_status,
    display_order
)
JOIN public.service_divisions sd ON sd.slug = v.division_slug
WHERE NOT EXISTS (
    SELECT 1
    FROM public.service_catalog existing_sc
    WHERE existing_sc.slug = v.slug
)
ON CONFLICT (division_id, slug) DO NOTHING;

COMMIT;
