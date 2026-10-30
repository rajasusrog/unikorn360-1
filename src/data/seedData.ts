import { ServiceDivision, ServiceCatalogItem, ProductItem } from '../types/database';

// ====================================================================
// 1. THE SIX CANONICAL DIVISIONS (Ordered 1 to 6)
// ====================================================================
export const SEED_DIVISIONS: ServiceDivision[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Websites & Software',
    slug: 'websites-software',
    short_description: 'Custom websites, e-commerce stores, web applications, mobile apps, SaaS MVPs, and API integrations.',
    full_description: 'Build or improve your digital platform. We architect and engineer high-performance web software, e-commerce ordering platforms, custom business tools, mobile apps, and robust API integrations designed specifically around your real-world business workflows.',
    seo_title: 'Websites, E-Commerce & Custom Software Development | Unikorn360',
    seo_description: 'Professional website development, e-commerce stores, custom web applications, mobile apps, SaaS MVPs, and API integrations for growing businesses.',
    status: 'published',
    display_order: 1,
    icon_name: 'Code2',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  },
  {
    id: 'a2000000-0000-0000-0000-000000000002',
    name: 'Security & Maintenance',
    slug: 'security-maintenance',
    short_description: 'Application security reviews, AI code audits, API security, database reviews, server hardening, and maintenance.',
    full_description: 'Protect and maintain existing technology. We evaluate web applications, review AI-generated code for production risks, audit APIs and database security, harden cloud servers, and provide dependable ongoing technical maintenance.',
    seo_title: 'Application Security Reviews & Technical Maintenance | Unikorn360',
    seo_description: 'Website and application security reviews, AI-generated code audits, API security, database reviews, server hardening, and ongoing maintenance retainers.',
    status: 'published',
    display_order: 2,
    icon_name: 'ShieldCheck',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  },
  {
    id: 'a3000000-0000-0000-0000-000000000003',
    name: 'Marketing & Creator Campaigns',
    slug: 'marketing-creator-campaigns',
    short_description: 'SEO, paid advertising management, social media content, UGC production, and creator campaign management.',
    full_description: 'Attract customers and build market visibility. We deliver technical and local SEO, paid advertising management across Meta and Google, social media content calendars, authentic UGC video assets, and regional creator campaign management.',
    seo_title: 'SEO, Paid Advertising & Creator Campaign Management | Unikorn360',
    seo_description: 'Technical and local search SEO, Meta and Google ads management, social media management, UGC video production, and regional creator campaigns.',
    status: 'published',
    display_order: 3,
    icon_name: 'Sparkles',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  },
  {
    id: 'a4000000-0000-0000-0000-000000000004',
    name: 'AI, Automation & Business Systems',
    slug: 'ai-automation-business-systems',
    short_description: 'AI chatbots, custom AI agents, business workflow automation, CRM, WhatsApp automation, and executive dashboards.',
    full_description: 'Reduce manual work and improve operations. We build conversational knowledge assistants, custom AI agents with human approval loops, cross-tool workflow automations, CRM pipelines, official WhatsApp automation, and executive dashboard systems.',
    seo_title: 'AI Automation, Custom Agents & Business Systems | Unikorn360',
    seo_description: 'AI chatbots, custom AI agents, cross-tool workflow automation, CRM automation, WhatsApp Business systems, and real-time executive dashboards.',
    status: 'published',
    display_order: 4,
    icon_name: 'Workflow',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  },
  {
    id: 'a5000000-0000-0000-0000-000000000005',
    name: 'Research & Business Strategy',
    slug: 'research-business-strategy',
    short_description: 'Market research, competitor analysis, industry trends, performance diagnostics, feasibility, and growth consulting.',
    full_description: 'Understand opportunities and make informed business decisions. We conduct customer and competitor research, analyze business performance and margins, prepare commercial feasibility plans, and advise founders on operational growth.',
    seo_title: 'Business Research, Performance Analysis & Strategy Consulting | Unikorn360',
    seo_description: 'Customer research, competitor and advertising intelligence, business performance analysis, financial feasibility models, and startup consulting.',
    status: 'published',
    display_order: 5,
    icon_name: 'BarChart3',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  },
  {
    id: 'a6000000-0000-0000-0000-000000000006',
    name: 'Business Setup & Documentation',
    slug: 'business-setup-documentation',
    short_description: 'Company registration, GST & Udyam, trademark filing coordination, government schemes, DPRs, and property documentation.',
    full_description: 'Establish the business and prepare required documentation. We support business incorporation, GST and Udyam MSME priority registration, trademark filing coordination, government subsidy applications, bank-ready DPRs, and commercial property documentation.',
    seo_title: 'Business Registration, GST, DPR & Documentation Support | Unikorn360',
    seo_description: 'Incorporation assistance, GST and Udyam registration, trademark filing coordination, DPR loan reports, government subsidy support, and property documentation.',
    status: 'published',
    display_order: 6,
    icon_name: 'LifeBuoy',
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z'
  }
];

// ====================================================================
// 2. THE 37 PRIMARY CANONICAL SERVICES
// ====================================================================
export const SEED_SERVICES: ServiceCatalogItem[] = [
  // ------------------------------------------------------------------
  // 01. WEBSITES & SOFTWARE (6 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000001',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'Website Development',
    slug: 'website-development',
    short_description: 'Custom, mobile-first corporate and industrial websites built to generate client inquiries and showcase capabilities.',
    full_description: 'We architect and build fast, responsive websites for B2B enterprises, manufacturers, contractors, and service businesses. Every project includes structured information architecture, WhatsApp/inquiry routing, cloud hosting deployment options, and technical SEO hygiene.',
    problems_solved: [
      'Outdated legacy websites that look unprofessional on mobile devices',
      'Losing prospective contracts due to absence of an authoritative digital profile',
      'Missing or broken inquiry pathways that fail to capture customer leads'
    ],
    target_customers: ['Manufacturers', 'B2B Suppliers', 'Engineering Contractors', 'Service Businesses', 'Growing MSMEs'],
    benefits: ['Immediate brand credibility', 'Direct WhatsApp and email lead routing', 'High-speed load performance across mobile and desktop'],
    deliverables: ['Custom Mobile-Responsive Website (5–10 pages)', 'Inquiry Capture & Lead Routing Integration', 'Technical SEO Setup & Schema Markup', 'Cloud Deployment & Domain Configuration'],
    packages: [
      {
        id: 'pkg-ws-corporate',
        name: 'Corporate Presence',
        description: 'Complete professional website for businesses needing clear positioning and inquiry capture.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Up to 8 Custom Pages', 'Responsive Design', 'Inquiry Forms & WhatsApp Trigger', 'Google Analytics & Search Console Setup'],
        limits: ['Single domain setup', 'Content and imagery drafts supplied by client'],
        exclusions: ['Annual third-party hosting and domain registry fees', 'E-commerce cart checkout'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Discovery & Architecture', description: 'Review your products, target buyers, certifications, and information architecture.' },
      { step: 2, title: 'UI & Layout Review', description: 'Design clean, responsive page templates for approval before coding.' },
      { step: 3, title: 'Frontend Engineering & Integration', description: 'Build high-speed pages, inquiry routing, and cloud deployment pipelines.' },
      { step: 4, title: 'Testing & Handover', description: 'Audit mobile responsiveness, configure analytics, and deliver verified production build.' }
    ],
    client_responsibilities: ['Provide company logo, product photos, and business registration details', 'Designate a project lead for timely milestone sign-offs'],
    exclusions: ['Commercial video photoshoots (available as separate UGC scope)', 'Ongoing post-warranty content changes without maintenance plan'],
    additional_charges: ['Multi-language support (e.g. Tamil + English)', 'Custom API feeds or third-party CRM hooks'],
    gallery: [],
    faqs: [
      { question: 'Is cloud hosting deployment included?', answer: 'Yes, initial deployment to your cloud environment (Vercel, Cloudflare, AWS, or DigitalOcean) is included in delivery.' },
      { question: 'Will the website work smoothly on all mobile devices?', answer: 'Yes, every layout is built mobile-first and tested across iOS and Android viewports.' }
    ],
    seo_title: 'Custom Website Development | Unikorn360',
    seo_description: 'Custom B2B and corporate website development. Fast, responsive, inquiry-focused websites for manufacturers, service firms, and growing teams.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['modern-website', 'cctv-services-website']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'E-commerce Development',
    slug: 'ecommerce-development',
    short_description: 'Digital ordering portals and online storefronts with wholesale tiered pricing, catalog management, and payment checkout.',
    full_description: 'Custom e-commerce platforms engineered for B2B distributors and direct-to-consumer businesses. Includes structured catalog hierarchies, dealer pricing tiers, automated tax invoices, order notifications, and payment gateway integration.',
    problems_solved: [
      'Managing dealer orders and repeat wholesale inquiries manually over phone calls and WhatsApp',
      'Pricing errors caused by complex customer-specific discount tiers',
      'Fulfillment delays and lost orders due to fragmented order tracking'
    ],
    target_customers: ['Wholesale Distributors', 'Direct-to-Consumer Brands', 'Specialty Component Suppliers', 'Retail Chains'],
    benefits: ['24/7 self-service digital order capture', 'Automated GST invoices and dealer pricing rules', 'Streamlined order management and dispatch workflows'],
    deliverables: ['Custom Storefront & Shopping Cart', 'Dealer Tier Pricing & Account Authentication', 'Payment Gateway Integration (Razorpay/Stripe)', 'Order Management & Automated Invoice PDF Generation'],
    packages: [
      {
        id: 'pkg-ws-ecom-core',
        name: 'B2B & Retail Ordering System',
        description: 'Complete digital catalog with authentication and payment processing.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Product Catalog Management', 'Tiered Pricing Engine', 'Payment Gateway Setup', 'WhatsApp Order Notifications'],
        limits: ['Initial setup up to 1,000 SKUs'],
        exclusions: ['Payment gateway merchant gateway transaction processing fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Catalog & SKU Structuring', description: 'Define product categories, variants, unit specifications, and pricing tiers.' },
      { step: 2, title: 'Storefront Engineering', description: 'Build responsive product listings, search filters, cart, and dealer accounts.' },
      { step: 3, title: 'Payment & Invoice Integration', description: 'Connect merchant payment gateways and automated tax invoice generation.' },
      { step: 4, title: 'End-to-End Testing', description: 'Conduct end-to-end checkout, invoice, and dispatch alert verification.' }
    ],
    client_responsibilities: ['Provide merchant KYC documents for payment gateway approval', 'Supply initial product catalogue dataset in Excel/CSV'],
    exclusions: ['Third-party shipping carrier freight fees', 'Product catalog photography'],
    additional_charges: ['Multi-warehouse inventory synchronization', 'Custom ERP inventory feeds'],
    gallery: [],
    faqs: [
      { question: 'Can dealers have different pricing from retail customers?', answer: 'Yes, our e-commerce architecture supports authenticated dealer accounts with custom wholesale pricing tiers.' }
    ],
    seo_title: 'E-commerce & B2B Ordering Portals | Unikorn360',
    seo_description: 'Custom e-commerce development and B2B ordering portals with tiered dealer pricing, GST invoicing, and secure payment checkout.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['ecommerce-stores']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000003',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'Custom Web Applications',
    slug: 'custom-web-applications',
    short_description: 'Tailored operational web applications, internal tools, client portals, and quotation calculators.',
    full_description: 'Bespoke web applications engineered around your exact operational rules. Eliminates repetitive spreadsheet manual work, replaces fragile disconnected files, and gives your teams role-based permissions, job status tracking, and structured audit logs.',
    problems_solved: [
      'Operations bogged down by cluttered, prone-to-error Excel workbooks',
      'Staff wasting hours manually assembling complex quotations and job-work sheets',
      'Lack of visibility into real-time job stage completion across internal departments'
    ],
    target_customers: ['Operations Managers', 'Manufacturers', 'Custom Fabricators', 'Service Agencies', 'Enterprises'],
    benefits: ['100% customized to your operating rules', 'Role-based access control for staff and managers', 'Centralized, secure operational database'],
    deliverables: ['Custom Web Application Frontend & Backend', 'Role-Based Authentication & Permissions', 'Relational Database Schema & Data Migration', 'Cloud Deployment & Admin User Documentation'],
    packages: [
      {
        id: 'pkg-ws-app-standard',
        name: 'Operational Application Core',
        description: 'Custom internal tool engineered for your specific departmental workflow.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Custom Workflow Modules', 'Multi-User Role Permissions', 'Data Export & Audit Logs', 'Cloud Production Deployment'],
        limits: ['Scoped according to agreed Technical Specification Document'],
        exclusions: ['Third-party infrastructure compute hosting costs'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Workflow Scrutiny', description: 'Map exact inputs, calculations, approval gates, and output documents.' },
      { step: 2, title: 'Architecture Specification', description: 'Deliver technical specification and database schema before coding.' },
      { step: 3, title: 'Modular Application Build', description: 'Develop full-stack web application with secure authentication.' },
      { step: 4, title: 'UAT & Staff Handover', description: 'Conduct user acceptance testing with real data and train team.' }
    ],
    client_responsibilities: ['Provide sample spreadsheets, calculation formulas, and workflow rules', 'Ensure key department users participate in acceptance testing'],
    exclusions: ['Unscoped feature additions requested after technical specification sign-off'],
    additional_charges: ['Legacy database data cleaning & historical migration', 'Hardware barcode scanner integration'],
    gallery: [],
    faqs: [
      { question: 'Can our staff access this securely on mobile devices and PCs?', answer: 'Yes, web applications are fully responsive and accessible securely via browser on phones, tablets, and desktop computers.' }
    ],
    seo_title: 'Custom Web Application Development | Unikorn360',
    seo_description: 'Bespoke web applications and internal operations software. Eliminate spreadsheet bottlenecks with custom business tools.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['quotation-estimation-tools', 'inventory-billing-systems', 'customer-client-portals', 'internal-staff-portals']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000004',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'Mobile App Development',
    slug: 'mobile-app-development',
    short_description: 'Cross-platform iOS and Android mobile apps for field teams, customer engagement, and on-the-go business workflows.',
    full_description: 'High-performance mobile applications engineered with React Native and native APIs. Built for field technicians, mobile sales agents, or customer loyalty experiences with offline data sync, GPS logging, camera uploads, and push notifications.',
    problems_solved: [
      'Field agents unable to access company software without a laptop',
      'Delayed reporting from job sites, stores, or distribution routes',
      'Customer churn due to lack of a convenient mobile booking or ordering interface'
    ],
    target_customers: ['Field Service Companies', 'Logistics & Distribution Teams', 'D2C Consumer Brands', 'Service Networks'],
    benefits: ['Real-time field data sync', 'Offline data caching when signal drops', 'Push notifications for immediate updates'],
    deliverables: ['Cross-Platform iOS & Android App', 'Backend API Integration', 'Offline Sync & Push Notification System', 'App Store & Play Store Deployment Support'],
    packages: [
      {
        id: 'pkg-ws-mobile-core',
        name: 'Business Mobile Application',
        description: 'Complete cross-platform application with authenticated API connectivity.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['iOS & Android Builds', 'User Authentication', 'Camera & GPS Logging', 'App Store Publishing Guidance'],
        limits: ['Scoped according to agreed mobile feature roadmap'],
        exclusions: ['Apple Developer ($99/yr) & Google Play ($25 one-time) publisher account fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'UX Flow & Screen Mapping', description: 'Design interactive mobile wireframes and user interaction states.' },
      { step: 2, title: 'App Development', description: 'Build cross-platform client app with native API integration.' },
      { step: 3, title: 'API & Push Setup', description: 'Connect backend services, data sync, and push notification infrastructure.' },
      { step: 4, title: 'Publishing & Release', description: 'Submit build to Google Play Console and Apple App Store.' }
    ],
    client_responsibilities: ['Create Apple and Google publisher accounts under your organization', 'Provide tester devices for physical hardware testing'],
    exclusions: ['App Store annual developer account subscription fees charged by Apple/Google'],
    additional_charges: ['Bluetooth thermal printer integration', 'Biometric scanner hardware support'],
    gallery: [],
    faqs: [
      { question: 'Will one codebase work on both Android and iPhone?', answer: 'Yes, we develop cross-platform applications ensuring consistent performance and design across iOS and Android.' }
    ],
    seo_title: 'Mobile App Development (iOS & Android) | Unikorn360',
    seo_description: 'Cross-platform mobile application development for field teams, customer engagement, and business operations.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000005',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'SaaS & MVP Development',
    slug: 'saas-mvp-development',
    short_description: 'Rapid, production-ready MVP development for software startups and founders validating market demand.',
    full_description: 'We turn software ideas into functional, testable products in weeks. Includes multi-tenant database design, user authentication, subscription billing, core application logic, and cloud infrastructure designed to scale.',
    problems_solved: [
      'Founders burning months of runway with slow or bloated dev agencies',
      'Over-engineering features before testing real customer willingness to pay',
      'Security and architectural debt that prevents scaling after launch'
    ],
    target_customers: ['Startup Founders', 'SaaS Innovators', 'Corporate Innovation Teams', 'Domain Experts Building Software'],
    benefits: ['Launch to early adopters in 4 to 8 weeks', 'Clean modern code architecture ready for seed funding', 'Integrated subscription billing and analytics'],
    deliverables: ['Production Minimum Viable Product (MVP)', 'Subscription Billing (Stripe / LemonSqueezy / Razorpay)', 'Authentication & Multi-Tenant Database', 'Source Code Repository & Architecture Documentation'],
    packages: [
      {
        id: 'pkg-ws-mvp-core',
        name: 'Production MVP Sprint',
        description: 'End-to-end development of your core software concept.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Scoped Core Feature Set', 'Auth & Database Design', 'Payment / Subscription Integration', 'Deployment & CI/CD Pipeline'],
        limits: ['Strictly scoped to core value hypothesis'],
        exclusions: ['Post-launch marketing ad spend'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Scope Pruning & MVP Definition', description: 'Strip non-essential features and isolate the single most critical problem solved.' },
      { step: 2, title: 'Clickable Prototype', description: 'Review high-fidelity interactive screens and data flows.' },
      { step: 3, title: 'Sprint Build', description: 'Rapid, test-driven full-stack development with weekly milestone reviews.' },
      { step: 4, title: 'Production Launch', description: 'Deploy to cloud, configure production monitoring, and hand over source code.' }
    ],
    client_responsibilities: ['Clarify target user problem and core value metric', 'Perform prompt reviews at each weekly milestone demo'],
    exclusions: ['Continuous post-launch feature iteration outside of sprint scope'],
    additional_charges: ['AI model fine-tuning or specialized vector database integration'],
    gallery: [],
    faqs: [
      { question: 'Do I own 100% of the intellectual property and code?', answer: 'Yes. Upon project completion and final settlement, complete source code repository ownership and IP are transferred to your organization.' }
    ],
    seo_title: 'SaaS MVP Development for Founders | Unikorn360',
    seo_description: 'Rapid, scalable MVP and SaaS development. Turn your software product vision into a production application in weeks.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000006',
    division_id: 'a1000000-0000-0000-0000-000000000001',
    service_name: 'API & System Integration',
    slug: 'api-system-integration',
    short_description: 'Connect disparate business tools, payment gateways, ERP databases, and third-party web services.',
    full_description: 'Bridge disconnected software systems. We build robust API connections, secure webhook receivers, and real-time data pipelines between your web platforms, payment processors, accounting packages, CRMs, and internal databases.',
    problems_solved: [
      'Staff wasting time manually copying data between software systems',
      'Payment receipts not reflecting automatically in billing databases',
      'Inventory mismatches between e-commerce orders and warehouse ERPs'
    ],
    target_customers: ['Growing MSMEs', 'E-commerce Operators', 'Service Networks', 'Companies with Multiple Disconnected Software'],
    benefits: ['Zero manual double-entry', 'Instant real-time data consistency', 'Automated error logging and retry mechanisms'],
    deliverables: ['Custom API Connector / Middleware', 'Webhook Listeners with Retry Logic', 'Authentication & Token Management', 'Data Transformation & Integration Documentation'],
    packages: [
      {
        id: 'pkg-ws-api-connector',
        name: 'Standard System Integration',
        description: 'Two-way or one-way reliable integration between two business software systems.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['API Connection & Transformation', 'Webhook Handlers', 'Error Alerting', '30-Day Post-Launch Monitoring'],
        limits: ['Requires active API access on both third-party platforms'],
        exclusions: ['Third-party API subscription costs or transaction fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'API Audit', description: 'Review API schemas, authentication mechanisms, and rate limits of both systems.' },
      { step: 2, title: 'Data Mapping', description: 'Define field-level data transformations, fallbacks, and validation rules.' },
      { step: 3, title: 'Integration Build', description: 'Deploy secure middleware with exponential backoff and error logging.' },
      { step: 4, title: 'Live Stress Testing', description: 'Simulate high transaction loads, edge case failures, and confirm sync.' }
    ],
    client_responsibilities: ['Provide API developer credentials or admin access to connected tools', 'Verify field mappings align with internal accounting/operating policies'],
    exclusions: ['Direct reverse-engineering of closed software without export capabilities'],
    additional_charges: ['On-premise legacy database driver development'],
    gallery: [],
    faqs: [
      { question: 'What happens if a third-party service is temporarily down?', answer: 'Our integrations include robust retry queues and automated failure alerting so data is never lost during third-party downtime.' }
    ],
    seo_title: 'API & System Integration Services | Unikorn360',
    seo_description: 'Connect third-party APIs, payment gateways, and business software. Reliable webhook pipelines and data sync.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['data-pipeline-integration']
  },

  // ------------------------------------------------------------------
  // 02. SECURITY & MAINTENANCE (6 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000007',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'Website & Application Security Review',
    slug: 'website-application-security-review',
    short_description: 'Comprehensive vulnerability assessment, findings report, and prioritized remediation recommendations for web applications.',
    full_description: 'We conduct independent security assessments of existing websites and web applications. Scans for OWASP Top 10 vulnerabilities, authentication loopholes, data exposure risks, and misconfigured permissions. Note: Delivers a detailed findings report with prioritized fixes; remediation implementation can be performed in-house or separately quoted.',
    problems_solved: [
      'Uncertainty regarding whether your web platform is vulnerable to unauthorized data access',
      'Meeting security compliance requirements before launching commercial transactions',
      'Discovering hidden vulnerabilities before malicious actors exploit them'
    ],
    target_customers: ['E-commerce Stores', 'Web Application Founders', 'Companies Handling Customer Data', 'MSMEs Upgrading Legacy Web Systems'],
    benefits: ['Clear visibility into existing technical security risks', 'Prioritized fix roadmap ranked by severity', 'Independent technical review without vendor bias'],
    deliverables: ['Executive Summary of Risk Posture', 'Technical Findings Log with Proof of Concept', 'Prioritized Remediation Recommendations', 'Debriefing Call with Technical Findings Walkthrough'],
    packages: [
      {
        id: 'pkg-sec-web-assessment',
        name: 'Standard Application Security Audit',
        description: 'Comprehensive assessment of web application surfaces and report delivery.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Automated & Manual Vulnerability Review', 'Authentication & Permission Audits', 'Prioritized Remediation Report', 'Follow-up Verification of Applied Fixes'],
        limits: ['Single domain / web application scope'],
        exclusions: ['Hands-on remediation code authoring (available as a separate scope)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Scope & Authorization', description: 'Establish clear testing boundaries, staging targets, and formal written testing authorization.' },
      { step: 2, title: 'Vulnerability Analysis', description: 'Perform automated scanning and manual inspection of input vectors, auth flows, and headers.' },
      { step: 3, title: 'Report Compilation', description: 'Document reproducible findings, calculate CVSS severity, and draft specific remediation code examples.' },
      { step: 4, title: 'Executive Walkthrough', description: 'Review findings with your engineering team and advise on implementation priorities.' }
    ],
    client_responsibilities: ['Provide written authorization and staging test environment access', 'Designate engineering lead to receive confidential vulnerability details'],
    exclusions: ['Hands-on code rewriting is not included in the audit fee and is quoted separately upon review'],
    additional_charges: ['Expedited 48-hour turn-around audit', 'Third-party vendor API penetration testing'],
    gallery: [],
    faqs: [
      { question: 'Is remediation included in the review fee?', answer: 'The assessment fee covers the comprehensive security review and prioritized remediation report. Fixing the code can be executed by your own developers or separately quoted by Unikorn360.' }
    ],
    seo_title: 'Website & Web Application Security Review | Unikorn360',
    seo_description: 'Independent vulnerability assessment and security reviews for web applications. Actionable findings and prioritized remediation recommendations.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000008',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'AI-Generated Code Security Review',
    slug: 'ai-generated-code-security-review',
    short_description: 'Security and production-readiness inspection of code produced by AI models, Cursor, Copilot, or rapid prototypes.',
    full_description: 'AI-generated code frequently contains subtle authorization bypasses, exposed API keys, hallucinated package dependencies, and unvalidated inputs. We review AI-generated codebases to identify security flaws before you deploy to production. Boundary note: This is an architectural and vulnerability review; we do not promise formal certification or guarantee absolute immunity.',
    problems_solved: [
      'Deploying AI-built prototypes to production without knowing what hidden security risks exist',
      'Accidentally exposing secret API keys, admin endpoints, or database service role keys in frontend bundles',
      'Vulnerable package dependencies and unvalidated data deserialization'
    ],
    target_customers: ['Non-Technical Founders Building with AI Tools', 'Agencies Using AI Coding Assistants', 'Teams Launching V0/Cursor Prototypes'],
    benefits: ['Identify critical authorization bugs before customers do', 'Ensure secrets are properly confined to secure backend environments', 'Objective assessment of production readiness'],
    deliverables: ['Codebase Security Audit Report', 'Identified Vulnerability Log with Severity Ratings', 'Key Leakage & Environment Configuration Audit', 'Actionable Code Fix Guidelines'],
    packages: [
      {
        id: 'pkg-sec-ai-audit',
        name: 'AI Prototype Security Audit',
        description: 'Complete codebase review of AI-assisted web application.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Source Code Repository Review', 'Secrets & Environment Audit', 'Auth Bypass & RLS Validation', 'Remediation Action Plan'],
        limits: ['Single codebase repository up to 25,000 LOC'],
        exclusions: ['Certification claims or guarantees of 100% immunity'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Code Ingestion & Dependency Check', description: 'Review package manifest, lockfiles, and scanning for hallucinated or malicious packages.' },
      { step: 2, title: 'Static & Logical Code Analysis', description: 'Trace data flow from user inputs to database queries and verify access controls.' },
      { step: 3, title: 'Secrets & Environment Review', description: 'Verify that server role keys, tokens, and database credentials are strictly server-side.' },
      { step: 4, title: 'Remediation Delivery', description: 'Deliver report with specific code snippets illustrating safe implementation patterns.' }
    ],
    client_responsibilities: ['Provide read access to Git repository', 'Provide environment variable template (.env.example) and context on business use-case'],
    exclusions: ['We do not issue commercial certifications or legal warranties of absolute security'],
    additional_charges: ['Hands-on remediation refactoring performed by our engineering team'],
    gallery: [],
    faqs: [
      { question: 'Why does AI-generated code need a human security review?', answer: 'AI code generators prioritize completing functional requests over verifying multi-tenant isolation, authorization bounds, and credential handling. Human review catches subtle logic bugs.' }
    ],
    seo_title: 'AI-Generated Code Security Review | Unikorn360',
    seo_description: 'Security audits for AI-generated code, Cursor, and Copilot applications. Identify leaked keys, authorization bypasses, and production vulnerabilities.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000009',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'API Security Review',
    slug: 'api-security-review',
    short_description: 'Authentication audits, authorization boundary tests, token leakage checks, and rate-limiting scrutiny for web APIs.',
    full_description: 'APIs are the primary entry point for modern business data. We scrutinize your REST and GraphQL endpoints for broken object-level authorization (BOLA), missing rate limits, token replay vulnerabilities, and sensitive data overexposure.',
    problems_solved: [
      'Endpoints leaking sensitive customer data to unauthenticated requests',
      'APIs vulnerable to automated scraping or denial-of-service due to lack of rate limiting',
      'Broken object-level authorization allowing one user to access another user\'s records'
    ],
    target_customers: ['SaaS Platforms', 'Mobile App Backends', 'Fintech & Billing APIs', 'Enterprises with Public/Partner APIs'],
    benefits: ['Prevent unauthorized database access via API endpoints', 'Harden authentication and token revocation routines', 'Ensure compliance with data protection best practices'],
    deliverables: ['API Endpoint Vulnerability Report', 'Authorization & Token Flow Review', 'Rate Limiting & Abuse Prevention Recommendations', 'Post-Remediation Verification Scan'],
    packages: [
      {
        id: 'pkg-sec-api-core',
        name: 'API Endpoint Audit',
        description: 'Comprehensive security testing of API endpoints and token flows.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Up to 30 API Endpoints Tested', 'BOLA / Broken Auth Testing', 'Rate Limiting Verification', 'Remediation Guide'],
        limits: ['Staging / non-production API testing environment'],
        exclusions: ['Volumetric Distributed Denial of Service (DDoS) testing'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Endpoint Inventory', description: 'Enumerate public and private routes, parameters, and authentication methods.' },
      { step: 2, title: 'Authorization & Boundary Testing', description: 'Test for multi-tenant isolation, IDOR, and privilege escalation vulnerabilities.' },
      { step: 3, title: 'Data Exposure & Header Audit', description: 'Evaluate CORS configuration, caching headers, and response payload filtering.' },
      { step: 4, title: 'Report Delivery', description: 'Deliver findings with actionable remediation code for your backend stack.' }
    ],
    client_responsibilities: ['Provide API documentation (Swagger/OpenAPI or Postman collection)', 'Set up test accounts across multiple role tiers'],
    exclusions: ['Physical hardware penetration testing'],
    additional_charges: ['Custom microservices architecture audits spanning multiple cloud networks'],
    gallery: [],
    faqs: [
      { question: 'Do tests run on our production database?', answer: 'We strongly recommend and prioritize testing on an isolated staging environment with anonymized data to prevent service disruption.' }
    ],
    seo_title: 'API Security Review & Penetration Testing | Unikorn360',
    seo_description: 'Security review for REST and GraphQL APIs. Scrutinize authentication, broken object-level authorization (BOLA), and token flows.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000010',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'Database & Supabase Security Review',
    slug: 'database-supabase-security-review',
    short_description: 'Audit PostgreSQL and Supabase databases for Row Level Security (RLS) leaks, secrets exposure, and backup resilience.',
    full_description: 'Supabase and PostgreSQL backends require rigorous Row Level Security (RLS) policies to prevent unauthorized data access. We audit your table permissions, RLS policies, storage bucket rules, database roles, connection pooling, and automated backup procedures.',
    problems_solved: [
      'Missing or misconfigured RLS policies allowing anonymous users to query private tables',
      'Accidentally public Supabase storage buckets exposing confidential customer documents',
      'Exposing the confidential service_role key in frontend browser code'
    ],
    target_customers: ['Supabase Developers', 'PostgreSQL Database Administrators', 'Founders Managing User Data', 'Web Application Teams'],
    benefits: ['Ironclad multi-tenant data isolation', 'Validated private storage bucket access rules', 'Eliminate anonymous data scraping risks'],
    deliverables: ['Database RLS Policy Audit Matrix', 'Storage Bucket Security Inspection', 'Database Roles & Key Exposure Check', 'Ready-to-Apply SQL Security Migration Script'],
    packages: [
      {
        id: 'pkg-sec-db-supabase',
        name: 'Supabase & Database Hardening Audit',
        description: 'Complete inspection of Supabase tables, RLS policies, and storage security.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Table-by-Table RLS Policy Verification', 'Storage Object Permission Scrutiny', 'Key Leak Audit in Frontend Bundles', 'Hardened SQL Migration Script'],
        limits: ['Single database instance / Supabase project'],
        exclusions: ['On-premise hardware infrastructure physical maintenance'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Policy Extraction', description: 'Export active RLS policies, roles, triggers, and storage bucket configuration.' },
      { step: 2, title: 'Adversarial Access Simulation', description: 'Execute authenticated and unauthenticated queries to test for data leakage.' },
      { step: 3, title: 'SQL Hardening Patch', description: 'Author optimized PostgreSQL security policies and security definer functions.' },
      { step: 4, title: 'Validation & Handover', description: 'Confirm zero regressions and train your team on safe schema evolution.' }
    ],
    client_responsibilities: ['Provide temporary developer/reviewer access to the Supabase dashboard or read replica', 'Clarify multi-role permissions expectations'],
    exclusions: ['Ongoing automated 24/7 database DBA operations (available under maintenance retainers)'],
    additional_charges: ['Database query performance tuning and index optimization'],
    gallery: [],
    faqs: [
      { question: 'Why is Supabase RLS verification so important?', answer: 'In Supabase, client applications query the database directly using the public anon key. Without properly written Row Level Security policies on every table, anyone can download your entire database.' }
    ],
    seo_title: 'Database & Supabase Security Review | Unikorn360',
    seo_description: 'Audit PostgreSQL and Supabase databases for Row Level Security (RLS) leaks, private storage bucket permissions, and service role security.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000011',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'Cloud & Server Hardening',
    slug: 'cloud-server-hardening',
    short_description: 'Linux server hardening, firewall configuration, SSH key policies, TLS/SSL certificates, and backup isolation.',
    full_description: 'Harden cloud servers (Ubuntu/Debian on AWS, DigitalOcean, Hetzner, or GCP) against unauthorized access and brute force attacks. Includes UFW/iptables firewalls, SSH key-only authentication, automated security patching, SSL/TLS hardening, and isolated offsite backups.',
    problems_solved: [
      'Servers exposed to public internet with default ports and password authentication',
      'Unpatched operating system packages and obsolete software dependencies',
      'Absence of automated, isolated offsite backups in case of server corruption'
    ],
    target_customers: ['Businesses Hosting Production Web Apps', 'Self-Hosted Database Owners', 'Agencies Managing VPS Infrastructure'],
    benefits: ['Substantially reduced attack surface', 'Automated security updates without breaking production', 'Reliable, encrypted offsite backup snapshots'],
    deliverables: ['Hardened Linux Server Configuration', 'Firewall & Fail2Ban Implementation', 'SSH Key Authentication Enforcement', 'Automated Offsite Backup Routine & Documentation'],
    packages: [
      {
        id: 'pkg-sec-server-hardening',
        name: 'Single Server Hardening Sprint',
        description: 'Complete security configuration for one production Linux server.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['UFW Firewall & Port Locking', 'SSH Hardening (Key-only, non-standard port)', 'Fail2ban Brute-Force Protection', 'Automated Daily Encrypted Backups'],
        limits: ['Single VPS or dedicated cloud instance'],
        exclusions: ['Cloud hosting compute provider monthly charges'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Server Audit', description: 'Inspect open ports, active services, user accounts, and current backup status.' },
      { step: 2, title: 'Hardening Execution', description: 'Configure UFW firewall, enforce SSH key authentication, and install brute-force protection.' },
      { step: 3, title: 'TLS & Service Configuration', description: 'Apply modern TLS/SSL ciphers and isolate web server processes.' },
      { step: 4, title: 'Backup & Recovery Drill', description: 'Test automated backup generation and execute a test restoration drill.' }
    ],
    client_responsibilities: ['Provide root or sudo SSH access for configuration', 'Designate emergency technical contact during setup maintenance window'],
    exclusions: ['Continuous 24/7 incident response monitoring (available under ongoing maintenance retainer)'],
    additional_charges: ['Multi-server cluster or Kubernetes node hardening'],
    gallery: [],
    faqs: [
      { question: 'Will hardening cause downtime for our live users?', answer: 'We schedule configuration during low-traffic maintenance windows, with typical downtime under 5 minutes.' }
    ],
    seo_title: 'Cloud & Linux Server Hardening Services | Unikorn360',
    seo_description: 'Production Linux server hardening, firewall setup, SSH key policies, Fail2ban configuration, and automated offsite backups.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['digital-file-room']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000012',
    division_id: 'a2000000-0000-0000-0000-000000000002',
    service_name: 'Website & Application Maintenance',
    slug: 'website-application-maintenance',
    short_description: 'Ongoing technical maintenance, updates and patches, backups, uptime monitoring, and priority troubleshooting.',
    full_description: 'Keep your web platforms fast, secure, and operational. Covers WordPress and custom web application maintenance, security patch updates, automated cloud backups, 24/7 uptime monitoring, broken link fixes, and reserved monthly developer hours for technical support.',
    problems_solved: [
      'Websites breaking unexpectedly due to neglected plugin or package updates',
      'Losing days of customer orders because there were no recent working backups',
      'Scrambling to find reliable technical help when critical site errors occur'
    ],
    target_customers: ['E-commerce Stores', 'Corporate Websites', 'SaaS Platforms', 'Businesses Relying on Digital Inquiries'],
    benefits: ['Prevent unexpected website outages', 'Guaranteed monthly backups stored in isolated cloud storage', 'Priority developer support when you need changes'],
    deliverables: ['Monthly Core & Dependency Updates', 'Weekly / Daily Automated Cloud Backups', '24/7 Real-Time Uptime Monitoring', 'Reserved Monthly Technical Support Hours'],
    packages: [
      {
        id: 'pkg-sec-maint-monthly',
        name: 'Technical Care Retainer',
        description: 'Proactive monthly maintenance and emergency support.',
        price: null,
        currency: 'INR',
        billing_period: 'monthly',
        price_type: 'starting-from',
        inclusions: ['Regular Security Patching', 'Automated Daily Cloud Backups', 'Uptime Monitoring & Immediate Incident Response', 'Dedicated 4 Hours of Developer Changes/mo'],
        limits: ['Single website or web application'],
        exclusions: ['Major redesigns or substantial feature additions exceeding monthly hours'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Onboarding & Backup Baseline', description: 'Audit current dependencies and configure automated daily offsite snapshots.' },
      { step: 2, title: 'Staging Patch Testing', description: 'Test updates in staging before pushing live to prevent layout breaks.' },
      { step: 3, title: 'Live Update & Verification', description: 'Apply patches, verify mobile responsiveness, and confirm checkout flows.' },
      { step: 4, title: 'Monthly Executive Report', description: 'Deliver monthly summary of applied updates, uptime logs, and backup health.' }
    ],
    client_responsibilities: ['Provide hosting/admin credentials', 'Designate an authorized contact for approving site changes'],
    exclusions: ['Major architectural redesigns are quoted as separate projects'],
    additional_charges: ['Additional support hours beyond monthly plan allotment'],
    gallery: [],
    faqs: [
      { question: 'What happens if my site goes down unexpectedly?', answer: 'Our uptime monitoring triggers instant alerts, and our team immediately initiates recovery from the latest verified snapshot.' }
    ],
    seo_title: 'Website & Application Maintenance Retainers | Unikorn360',
    seo_description: 'Dependable website and web application maintenance. Security updates, cloud backups, 24/7 uptime monitoring, and technical support.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },

  // ------------------------------------------------------------------
  // 03. MARKETING & CREATOR CAMPAIGNS (6 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000013',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'SEO & Local Search',
    slug: 'seo-local-search',
    short_description: 'Technical SEO, on-page optimization, and Google Business Profile visibility to rank for high-intent customer searches.',
    full_description: 'Drive qualified organic traffic from buyers searching for your products and services. Covers technical site audits, Core Web Vitals optimization, semantic keyword targeting, content structure, Google Business Profile enhancement, and local citations.',
    problems_solved: [
      'Invisibility on Google when prospective clients search for your services',
      'Competitors ranking above you and capturing local inbound inquiries',
      'Technical site errors and slow speeds that suppress search engine rankings'
    ],
    target_customers: ['Manufacturers', 'Local & Regional Service Providers', 'B2B Firms', 'Retailers Seeking Store Footfall'],
    benefits: ['Sustainable inbound customer discovery without continuous ad spend', 'Enhanced Google Maps and local 3-pack visibility', 'Higher search ranking for commercial purchase-intent terms'],
    deliverables: ['Technical SEO Audit & Error Remediation', 'On-Page Content & Meta Tag Optimization', 'Google Business Profile Audit & Optimization', 'Local Citation Alignment & Keyword Tracking Reports'],
    packages: [
      {
        id: 'pkg-mkt-seo-core',
        name: 'Organic Search Foundation',
        description: 'Comprehensive technical and local SEO setup with ongoing optimization.',
        price: null,
        currency: 'INR',
        billing_period: 'monthly',
        price_type: 'starting-from',
        inclusions: ['Technical SEO Audits & Fixes', 'Target Keyword Research (15 Core Terms)', 'Google Business Profile Management', 'Monthly Keyword Ranking Reports'],
        limits: ['Single primary business website and business profile'],
        exclusions: ['Black-hat link schemes or guaranteed #1 rankings'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Technical Audit & Keyword Research', description: 'Identify crawl errors, speed bottlenecks, and commercial search terms.' },
      { step: 2, title: 'On-Page & Schema Implementation', description: 'Optimize title tags, headings, content structure, and LocalBusiness schema.' },
      { step: 3, title: 'Google Business Profile Tuning', description: 'Align categories, services, photos, and citation consistency.' },
      { step: 4, title: 'Performance Review', description: 'Monitor search impressions, keyword rank movements, and inquiry volume.' }
    ],
    client_responsibilities: ['Provide Google Search Console and Google Business Profile manager access', 'Approve recommended website copy updates'],
    exclusions: ['We do not guarantee specific numerical search rankings, adhering strictly to Google webmaster guidelines'],
    additional_charges: ['Multi-location enterprise SEO expansion'],
    gallery: [],
    faqs: [
      { question: 'How long does SEO take to produce measurable results?', answer: 'Technical fixes and local profile updates often show positive momentum within 4 to 8 weeks, with substantial organic growth compounding over 3 to 6 months.' }
    ],
    seo_title: 'SEO & Local Search Optimization Services | Unikorn360',
    seo_description: 'Technical SEO, on-page content optimization, and Google Business Profile management. Drive qualified inbound buyer inquiries.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000014',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'Paid Advertising Management',
    slug: 'paid-advertising-management',
    short_description: 'Strategic management of Meta Ads and Google Ads campaigns focused on return on ad spend (ROAS) and lead generation.',
    full_description: 'End-to-end paid campaign management across Google Search, Performance Max, and Meta (Instagram & Facebook). We handle audience targeting, ad copywriting, retargeting sequences, and continuous bid optimization. Boundary note: Management fees are separate from platform advertising spend paid directly to Google/Meta.',
    problems_solved: [
      'Burning advertising budgets on unoptimized campaigns with zero qualified leads',
      'Inability to track which ad sets actually generate paying customers',
      'Struggling to scale ad budgets without experiencing severe cost-per-lead spikes'
    ],
    target_customers: ['D2C Brands', 'Service Businesses', 'Educational Institutions', 'B2B Companies with Clear Offerings'],
    benefits: ['Immediate targeted traffic and lead acquisition', 'Structured retargeting to convert undecided visitors', 'Transparent reporting separating management fee from ad spend'],
    deliverables: ['Campaign Strategy & Audience Architecture', 'Ad Copywriting & Creative Direction', 'Conversion Tracking & Pixel Configuration', 'Weekly Bid Optimization & Transparent ROI Reporting'],
    packages: [
      {
        id: 'pkg-mkt-ads-core',
        name: 'Growth Ads Management',
        description: 'Professional campaign management across Google or Meta.',
        price: null,
        currency: 'INR',
        billing_period: 'monthly',
        price_type: 'starting-from',
        inclusions: ['Campaign Setup & Audience Research', 'A/B Creative & Copy Testing', 'Conversion Tracking Setup', 'Weekly Optimization & Performance Calls'],
        limits: ['Ad spend budget billed directly to client credit card'],
        exclusions: ['Media ad spend budget paid directly to advertising networks'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft',
        ad_spend_details: {
          agency_fee: 'Professional management retainer',
          ad_spend: 'Billed directly to client payment method by Google / Meta',
          creative_fee: 'Includes copywriting and ad design templates'
        }
      }
    ],
    process_steps: [
      { step: 1, title: 'Offer & Audience Scoping', description: 'Define the target customer, value proposition, and conversion tracking milestones.' },
      { step: 2, title: 'Campaign Build & Creative Copy', description: 'Set up ad account architecture, audiences, creative angles, and tracking pixels.' },
      { step: 3, title: 'Launch & A/B Testing', description: 'Launch campaigns, monitor initial CPA, and iterate on winning ad combinations.' },
      { step: 4, title: 'Weekly Scaling & Reporting', description: 'Scale top-performing ad sets and deliver transparent ROI performance reports.' }
    ],
    client_responsibilities: ['Provide ad account manager access with valid payment method attached', 'Provide brand creative assets and product photography'],
    exclusions: ['Platform ad spend is paid directly by client to Meta/Google; agency fee covers strategy and management only'],
    additional_charges: ['Custom dedicated landing page design and conversion rate optimization (CRO)'],
    gallery: [],
    faqs: [
      { question: 'How is ad budget handled?', answer: 'Ad spend is billed directly to your own credit card by Google or Meta. Our management fee is completely separate, ensuring 100% transparency.' }
    ],
    seo_title: 'Paid Advertising Management (Meta & Google Ads) | Unikorn360',
    seo_description: 'ROI-focused paid advertising management across Google Search, Performance Max, Instagram, and Facebook. Transparent management fees.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000015',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'Social Media & Content Management',
    slug: 'social-media-content-management',
    short_description: 'Consistent organic content creation, brand design templates, and publishing calendars for corporate channels.',
    full_description: 'Build enterprise brand authority through disciplined organic social media publishing. We plan monthly content themes, design high-quality graphics and carousels, write engaging captions, and maintain active brand visibility across LinkedIn, Instagram, and Facebook.',
    problems_solved: [
      'Inconsistent, neglected social profiles that make your business look inactive',
      'Poor visual design that undermines corporate credibility with high-value clients',
      'Internal staff lacking time to write structured, educational social content'
    ],
    target_customers: ['Corporate Enterprises', 'MSME Manufacturers', 'Founders Building Authority', 'Retail & Consumer Brands'],
    benefits: ['Consistent brand publishing cadence', 'Polished, corporate visual identity across all platforms', 'Educates customers on your capabilities and products'],
    deliverables: ['Monthly Content Calendar (12–16 Posts)', 'Custom Graphic Designs & Carousels', 'Caption Copywriting & Hashtag Research', 'Monthly Reach & Engagement Analytics'],
    packages: [
      {
        id: 'pkg-mkt-social-retainer',
        name: 'Brand Presence Retainer',
        description: 'Consistent monthly organic social media content creation and publishing.',
        price: null,
        currency: 'INR',
        billing_period: 'monthly',
        price_type: 'starting-from',
        inclusions: ['12 Custom Branded Graphics / Carousels', 'Editorial Caption Writing', 'Publishing Scheduling', 'Monthly Performance Report'],
        limits: ['Up to 2 social channels (e.g. LinkedIn + Instagram)'],
        exclusions: ['Paid advertising budget', 'Daily community customer support management'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Brand Tone & Template Setup', description: 'Establish typography, color palette, and repeatable design templates.' },
      { step: 2, title: 'Monthly Calendar Plan', description: 'Draft post topics, educational hooks, and case studies for client approval.' },
      { step: 3, title: 'Design & Copy Production', description: 'Create branded visuals, carousels, and engaging captions.' },
      { step: 4, title: 'Publishing & Analytics Review', description: 'Schedule approved content and deliver monthly reach analysis.' }
    ],
    client_responsibilities: ['Approve monthly content calendar within agreed review window', 'Provide high-res factory, team, or product imagery'],
    exclusions: ['Direct 24/7 direct-message customer service handling'],
    additional_charges: ['On-site video production or custom animation reels'],
    gallery: [],
    faqs: [
      { question: 'Do we get to approve posts before they go live?', answer: 'Yes, every monthly calendar and visual asset is submitted for your written approval prior to publishing.' }
    ],
    seo_title: 'Social Media & Content Management Services | Unikorn360',
    seo_description: 'Professional organic social media management and content design for businesses, manufacturers, and corporate brands.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['corporate-identity', 'company-profile']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000016',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'UGC Content Production',
    slug: 'ugc-content-production',
    short_description: 'Authentic user-generated style video assets, demonstrations, and testimonials produced for ad campaigns and social media.',
    full_description: 'High-converting user-generated style video assets crafted specifically for paid ads and social channels. We handle concept scripting, creator casting, authentic video production, hook testing, and professional editing. Boundary note: Usage rights, commercial licensing periods, and production scope are explicitly defined in every project agreement.',
    problems_solved: [
      'Stiff, overly polished studio ads that users skip immediately on social feeds',
      'Difficulty sourcing reliable creators who deliver professional, brand-safe video files',
      'Low click-through rates on social ads due to lack of authentic product demonstrations'
    ],
    target_customers: ['D2C Consumer Brands', 'E-commerce Stores', 'Mobile Apps', 'Local & Regional Brands Expanding Online'],
    benefits: ['Higher ad click-through rates and thumb-stop ratios', 'Relatable, believable product demonstrations in regional languages', 'Full commercial usage rights for agreed digital campaign periods'],
    deliverables: ['Concept Scripts with Multiple Hook Angles', 'Curated Creator Casting & Production', 'Final High-Res 9:16 Video Deliverables with Captions', 'Commercial Usage License for Digital Advertising'],
    packages: [
      {
        id: 'pkg-mkt-ugc-bundle',
        name: 'Core UGC Video Pack',
        description: '3 custom UGC video concepts with multiple hooks for paid social testing.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['3 Unique Video Concepts', 'Multiple Hook Variations (3x hooks per video)', 'Scriptwriting & Regional Creator Selection', '12-Month Digital Ad Usage Rights'],
        limits: ['Agreed video duration up to 60 seconds each'],
        exclusions: ['Television broadcast or theatrical licensing'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Angle Strategy & Scriptwriting', description: 'Develop pain-point, unboxing, and demonstration script angles with bold hooks.' },
      { step: 2, title: 'Creator Casting & Briefing', description: 'Match vetted creators from our network matching your target customer demographics.' },
      { step: 3, title: 'Shooting & Raw Review', description: 'Creators record native high-res mobile footage following detailed production guidelines.' },
      { step: 4, title: 'Editing & Delivery', description: 'Add dynamic captions, callouts, and deliver ad-ready MP4 files.' }
    ],
    client_responsibilities: ['Ship physical product samples directly to designated creators', 'Provide brand guidelines and any mandatory regulatory claims'],
    exclusions: ['Raw camera footage without licensing agreement; broadcast television usage'],
    additional_charges: ['Perpetual worldwide commercial license buyout', 'Additional language voice-overs'],
    gallery: [],
    faqs: [
      { question: 'What usage rights are included with the videos?', answer: 'Our standard UGC package includes full commercial digital advertising and organic social media usage rights for 12 months.' }
    ],
    seo_title: 'UGC Content Production & Video Ad Creation | Unikorn360',
    seo_description: 'Authentic user-generated style video production for Meta and TikTok ads. Scriptwriting, creator casting, and commercial licensing.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000017',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'Influencer Campaign Management',
    slug: 'influencer-campaign-management',
    short_description: 'End-to-end management of regional creator collaborations, hyperlocal campaigns, and performance tracking.',
    full_description: 'Strategic management of regional creator and influencer marketing campaigns. We handle creator discovery, campaign-specific creator evaluation reports using our 10-point intelligence scoring matrix, commercial contract coordination, briefing, content approvals, and post-campaign reach analytics. Boundary note: Agency management covers selection, coordination, and reporting; creator compensation fees and usage rights are quoted according to the agreed roster.',
    problems_solved: [
      'Wasting money on creators with inflated follower counts and fake engagement',
      'Time-consuming back-and-forth negotiations with unreliable influencers',
      'Campaigns failing to drive local store walk-ins or regional sales'
    ],
    target_customers: ['Retail Store Chains', 'Consumer Brands', 'Regional Manufacturers', 'Hospitality & Entertainment Venues'],
    benefits: ['100% human-evaluated creators vetted for authentic local engagement', 'Structured commercial contracts with guaranteed deliverables', 'Clear post-campaign reporting on reach, views, and interactions'],
    deliverables: ['Curated Creator Shortlist & Intelligence Scoring Report', 'Creator Contracting, Briefing & Deliverable Management', 'Pre-Publication Quality & Brand Safety Review', 'Comprehensive Post-Campaign Analytics Report'],
    packages: [
      {
        id: 'pkg-mkt-influencer-core',
        name: 'Regional Campaign Coordination',
        description: 'End-to-end management of a dedicated regional creator campaign roster.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Creator Discovery & Vetting (Up to 10 Creators)', 'Contract Negotiation & Deliverable Tracking', 'Content Quality & Script Review', 'Final Performance Analytics Dossier'],
        limits: ['Campaign coordination fee for up to 10 creator partnerships'],
        exclusions: ['Individual creator compensation fees (itemized transparently in campaign budget)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Campaign Strategy & Budget Allocation', description: 'Define target district, reach goals, creator tiers (L1 to L6), and messaging.' },
      { step: 2, title: 'Discovery & Scoring Report', description: 'Deliver curated dossier of verified regional creators with engagement scores.' },
      { step: 3, title: 'Contracting & Content Review', description: 'Sign standardized agreements, ship products, and review drafts before publishing.' },
      { step: 4, title: 'Campaign Execution & Reporting', description: 'Coordinate synchronized release dates and aggregate verified view analytics.' }
    ],
    client_responsibilities: ['Approve final creator shortlist and campaign creative brief', 'Supply product inventory or store access for creator visits'],
    exclusions: ['Individual creator appearance and publishing fees are billed transparently as separate pass-through costs'],
    additional_charges: ['On-location event supervision and physical filming coordination'],
    gallery: [],
    faqs: [
      { question: 'Are creator fees included in the management price?', answer: 'Our management fee covers creator discovery, scoring, contracts, and reporting. Creator compensation is transparently itemized in your campaign roster budget with zero hidden markups.' }
    ],
    seo_title: 'Influencer Campaign Management & Regional Creators | Unikorn360',
    seo_description: 'End-to-end creator campaign coordination, influencer discovery, 10-point engagement scoring, and performance analytics across Tamil Nadu.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000018',
    division_id: 'a3000000-0000-0000-0000-000000000003',
    service_name: 'Marketing Tracking & Reporting',
    slug: 'marketing-tracking-reporting',
    short_description: 'Implementation of Google Analytics 4, Meta Pixel, server-side tracking, UTM pipelines, and executive dashboards.',
    full_description: 'Accurately measure where your customers come from. We implement Google Analytics 4, Meta Conversions API (server-side tracking), Google Tag Manager, custom event tracking, and clean executive reporting dashboards to verify campaign ROI.',
    problems_solved: [
      'Running marketing campaigns without knowing which channels drive paying customers',
      'Data loss caused by ad blockers and browser cookie restrictions',
      'Conflicting metrics across Meta, Google Ads, and website analytics'
    ],
    target_customers: ['E-commerce Stores', 'Marketing Leaders', 'Businesses Running Multi-Channel Ads', 'Founders Needing Clean Attribution'],
    benefits: ['Accurate attribution of revenue and leads to specific marketing channels', 'Server-side tracking resilient to browser cookie restrictions', 'Unified executive dashboard displaying key commercial metrics'],
    deliverables: ['Google Analytics 4 & Google Tag Manager Setup', 'Server-Side Meta Conversions API (CAPI) Integration', 'Standardized UTM Link Convention & Tracking Framework', 'Custom Real-Time Marketing Performance Dashboard'],
    packages: [
      {
        id: 'pkg-mkt-tracking-core',
        name: 'Attribution & Tracking Foundation',
        description: 'Complete audit and implementation of server and client analytics tracking.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['GA4 & GTM Implementation', 'Meta Pixel & CAPI Setup', 'E-commerce Purchase / Lead Event Mapping', 'Attribution Reporting Walkthrough'],
        limits: ['Single website domain / web application'],
        exclusions: ['Third-party analytics tool enterprise subscription fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Tracking Audit', description: 'Audit existing tags, broken triggers, duplicate event firing, and consent banners.' },
      { step: 2, title: 'GTM & Event Configuration', description: 'Configure custom triggers for button clicks, form submissions, and purchases.' },
      { step: 3, title: 'Server-Side CAPI Setup', description: 'Deploy server-side event forwarding for privacy-compliant data resilience.' },
      { step: 4, title: 'Validation & Dashboard', description: 'Verify event match quality in Meta and Google, and deliver reporting dashboard.' }
    ],
    client_responsibilities: ['Provide admin access to Google Tag Manager, GA4, and Meta Business Manager', 'Clarify target commercial conversion events'],
    exclusions: ['Legal drafting of corporate privacy policy terms'],
    additional_charges: ['Multi-domain enterprise cross-domain tracking setup'],
    gallery: [],
    faqs: [
      { question: 'Why is server-side tracking necessary today?', answer: 'Modern browser privacy settings and ad blockers drop up to 30% of client-side tracking pixels. Server-side tracking restores accurate data capture.' }
    ],
    seo_title: 'Marketing Tracking & GA4 Reporting Services | Unikorn360',
    seo_description: 'Google Analytics 4, Meta Conversions API (CAPI), and Google Tag Manager tracking implementation. Accurate marketing attribution.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },

  // ------------------------------------------------------------------
  // 04. AI, AUTOMATION & BUSINESS SYSTEMS (7 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000019',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'AI Chatbots & Knowledge Assistants',
    slug: 'ai-chatbots-knowledge-assistants',
    short_description: 'Conversational AI assistants grounded strictly in your approved company documents, SOPs, and product catalogs.',
    full_description: 'Equip your staff and customers with conversational AI that answers questions accurately using your company’s approved knowledge base. Uses Retrieval-Augmented Generation (RAG) so the assistant never hallucinates outside of your verified manuals, policies, or product documentation.',
    problems_solved: [
      'Staff constantly interrupting senior managers with routine procedural questions',
      'Customer support representatives taking minutes to look up complex product specifications',
      'New employees taking months to onboard due to scattered, hard-to-search documentation'
    ],
    target_customers: ['Manufacturing Units with Complex SOPs', 'Customer Support Teams', 'Service Networks', 'Enterprises with Extensive Documentation'],
    benefits: ['Instant answers in seconds grounded in your verified documents', 'Zero unauthorized hallucination beyond provided knowledge sources', 'Available 24/7 across web portals and internal team chat'],
    deliverables: ['Custom AI Knowledge Assistant', 'Document Ingestion & Vector Search Pipeline', 'Web Widget or Internal Team Interface', 'Admin Knowledge Base Update Portal'],
    packages: [
      {
        id: 'pkg-ai-bot-core',
        name: 'Enterprise Knowledge Assistant',
        description: 'Custom conversational assistant connected to your verified document archive.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Document Ingestion (Up to 100 PDFs/Docs)', 'RAG Vector Search Pipeline', 'Custom Web Chat Interface', 'Source Attribution & Reference Links'],
        limits: ['Knowledge base updates via structured admin dashboard'],
        exclusions: ['Third-party LLM API compute tokens (billed at direct cost)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Knowledge Base Curation', description: 'Collect, clean, and organize official company manuals, policies, and product guides.' },
      { step: 2, title: 'Embedding & RAG Pipeline', description: 'Chunk documents and index them in a high-speed vector retrieval database.' },
      { step: 3, title: 'Prompt & Guardrail Engineering', description: 'Configure strict behavioral guardrails to refuse answering out-of-scope queries.' },
      { step: 4, title: 'Deployment & Testing', description: 'Deploy interface and benchmark accuracy against real staff and customer questions.' }
    ],
    client_responsibilities: ['Provide current, approved company documentation and SOPs in PDF/Doc format', 'Review and validate sample answer outputs during testing'],
    exclusions: ['Unsupervised direct modification of backend database records'],
    additional_charges: ['Integration into internal Slack/Microsoft Teams workspaces'],
    gallery: [],
    faqs: [
      { question: 'Will the AI invent answers or hallucinate?', answer: 'No. We configure strict retrieval guardrails instructing the assistant to only synthesize answers from your provided documents, and to explicitly state when information is not found.' }
    ],
    seo_title: 'AI Chatbots & Knowledge Assistants | Unikorn360',
    seo_description: 'Custom conversational AI assistants and enterprise RAG systems. Accurate, grounded answers from your company documentation.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000020',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'Custom AI Agents',
    slug: 'custom-ai-agents',
    short_description: 'Scoped, tool-using AI agents that execute multi-step workflows with strict permission bounds and human approval gates.',
    full_description: 'Move beyond text generation to autonomous task execution. We build scoped AI agents capable of querying databases, summarizing reports, drafting customer correspondence, and preparing transaction drafts. Every high-stakes action includes mandatory human approval gates.',
    problems_solved: [
      'Knowledge workers drowning in repetitive multi-step research and data assembly tasks',
      'Slow response times to complex commercial inquiries requiring multiple data lookups',
      'Risk of human oversight when compiling weekly operational summaries'
    ],
    target_customers: ['Operations Leaders', 'Financial Analysts', 'Logistics Coordinators', 'Customer Experience Directors'],
    benefits: ['Execute multi-step workflows in seconds rather than hours', 'Enforce strict human-in-the-loop review before sending emails or updating records', 'Clear audit logs showing agent reasoning and tool usage steps'],
    deliverables: ['Custom AI Agent Workflow Architecture', 'Tool-Use Integrations (Database, Email, CRM)', 'Human Approval Dashboard / Review Gate', 'Audit Logging & Monitoring System'],
    packages: [
      {
        id: 'pkg-ai-agent-core',
        name: 'Workflow AI Agent',
        description: 'Scoped tool-using agent with explicit human approval controls.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Custom Agent Logic & Tool Schemas', 'Database & API Tool Connectors', 'Human Review Queue UI', '30-Day Performance Tuning'],
        limits: ['Strictly scoped tool permissions'],
        exclusions: ['Fully autonomous financial disbursement without human authorization'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Workflow Decomposition', description: 'Break down the multi-step operational task into explicit tools, inputs, and validation gates.' },
      { step: 2, title: 'Tool Schema Engineering', description: 'Build secure, deterministic API functions the agent is permitted to execute.' },
      { step: 3, title: 'Approval Interface Build', description: 'Create clean dashboard where managers can review and approve proposed agent actions.' },
      { step: 4, title: 'Supervised Pilot', description: 'Run agent under close human supervision to calibrate reliability and output quality.' }
    ],
    client_responsibilities: ['Provide clear operational guidelines on what requires human authorization', 'Designate operators to test and review agent action proposals'],
    exclusions: ['We do not build fully unmonitored agents that bypass financial or legal human review'],
    additional_charges: ['Multi-agent orchestration pipelines across complex ERPs'],
    gallery: [],
    faqs: [
      { question: 'Can the AI agent send emails or modify records without our approval?', answer: 'No. All our custom agent architectures enforce explicit human approval gates before executing external actions or modifying critical business databases.' }
    ],
    seo_title: 'Custom AI Agents & Autonomous Workflows | Unikorn360',
    seo_description: 'Scoped tool-using AI agents for business workflows. Secure tool integration, multi-step execution, and human approval controls.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000021',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'Business Workflow Automation',
    slug: 'business-workflow-automation',
    short_description: 'End-to-end operational process automation, webhook triggers, cross-department handoffs, and task synchronization.',
    full_description: 'Eliminate friction across business handoffs. We connect your inquiries, sales orders, inventory updates, and accounting notifications into an automated pipeline. Cross-links directly with specialized CRM, WhatsApp, and document automation services without redundant duplication.',
    problems_solved: [
      'Orders slipping through the cracks when transitioning from sales to production',
      'Manual status updating across multiple departmental spreadsheets',
      'Slow response times to new client inquiries outside standard office hours'
    ],
    target_customers: ['Manufacturers', 'Service Companies', 'Wholesale Distributors', 'Multi-Branch Businesses'],
    benefits: ['Zero lost leads or forgotten order milestones', 'Automatic notification handoffs between departments', 'Real-time visibility into overall workflow velocity'],
    deliverables: ['Visual Workflow Architecture Map', 'Automated Webhook & Pipeline Configuration', 'Cross-Tool Integration Scripts', 'System Health Monitoring & Failure Alerting'],
    packages: [
      {
        id: 'pkg-ai-workflow-core',
        name: 'Process Automation Suite',
        description: 'Complete cross-tool operational workflow automation.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Cross-Department Process Mapping', 'Up to 5 Automated Workflow Pipelines', 'Error Handling & Retry Queues', 'Admin Dashboard Overview'],
        limits: ['Supported third-party tools with webhooks or APIs'],
        exclusions: ['Third-party automation platform subscription charges'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Process Mapping', description: 'Diagram existing manual handoffs, bottleneck delays, and data flow paths.' },
      { step: 2, title: 'Automation Engineering', description: 'Configure triggers, conditionals, data validation, and retry queues.' },
      { step: 3, title: 'Staging Dry Runs', description: 'Simulate high transaction volumes and test failure recovery modes.' },
      { step: 4, title: 'Production Handover', description: 'Deploy live automations and train department heads on managing exceptions.' }
    ],
    client_responsibilities: ['Provide login or API credentials for connected software', 'Validate edge cases and exception handling rules'],
    exclusions: ['Manual operational data entry tasks'],
    additional_charges: ['Integration with legacy non-API Windows desktop software'],
    gallery: [],
    faqs: [
      { question: 'How does this connect with WhatsApp and CRM?', answer: 'This service handles the overarching cross-tool workflow logic and links directly with our specialized WhatsApp and CRM automation modules.' }
    ],
    seo_title: 'Business Workflow Automation Services | Unikorn360',
    seo_description: 'End-to-end business workflow automation. Streamline cross-tool processes, departmental handoffs, and automated triggers.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['systems-automation', 'business-automation']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000022',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'CRM & Sales Automation',
    slug: 'crm-sales-automation',
    short_description: 'Automated lead capture, deal pipeline tracking, quotation follow-up sequences, and sales activity logging.',
    full_description: 'Never lose a qualified sales lead. We configure and automate custom CRM pipelines that instantly capture leads from your website, WhatsApp, and paid ads, assign them to sales representatives, trigger follow-up reminders, and track deal stages through to closure.',
    problems_solved: [
      'Inquiries sitting uncontacted in email inboxes for days',
      'Sales reps forgetting to follow up on pending quotations',
      'Leadership lacking clear visibility into the sales pipeline and conversion rates'
    ],
    target_customers: ['B2B Sales Teams', 'Real Estate & Construction Firms', 'Industrial Suppliers', 'High-Ticket Service Companies'],
    benefits: ['Sub-5-minute lead response times', 'Automated quotation follow-up sequences', 'Real-time sales pipeline visibility for management'],
    deliverables: ['Custom CRM Pipeline Setup & Custom Fields', 'Automated Lead Ingestion from Web & WhatsApp', 'Follow-up Email/WhatsApp Reminder Workflows', 'Sales Activity & Conversion Dashboard'],
    packages: [
      {
        id: 'pkg-ai-crm-core',
        name: 'Sales Pipeline Automation',
        description: 'Complete CRM setup with automated lead capture and follow-ups.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Pipeline Stages & Custom Fields', 'Inbound Lead Routing Rules', 'Quotation Follow-Up Automations', 'Sales Team Training Session'],
        limits: ['Implementation on approved CRM platform (HubSpot, Zoho, or Custom CRM)'],
        exclusions: ['Third-party CRM software monthly seat licensing fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Sales Cycle Audit', description: 'Review your sales stages, quotation processes, and qualification criteria.' },
      { step: 2, title: 'Pipeline Architecture', description: 'Configure custom deal stages, lead scoring, and representative assignment logic.' },
      { step: 3, title: 'Automation Sequences', description: 'Set up instant acknowledgment, manager alerts, and staged follow-ups.' },
      { step: 4, title: 'Team Training', description: 'Train sales representatives and managers on daily pipeline management.' }
    ],
    client_responsibilities: ['Provide CRM admin access and existing lead database exports', 'Ensure sales team attends scheduled pipeline training'],
    exclusions: ['Cold outbound prospect list purchasing'],
    additional_charges: ['Custom bi-directional sync with internal ERP billing databases'],
    gallery: [],
    faqs: [
      { question: 'Can this connect with our official WhatsApp?', answer: 'Yes, we integrate CRM pipelines directly with official WhatsApp Business API so reps can trigger templates and receive chat updates.' }
    ],
    seo_title: 'CRM & Sales Pipeline Automation | Unikorn360',
    seo_description: 'Automate sales pipelines, lead capture, and quotation follow-ups. Streamline sales operations and improve conversion rates.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['crm-order-tracking', 'lead-inquiry-automation']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000023',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'WhatsApp Business Automation',
    slug: 'whatsapp-business-automation',
    short_description: 'Official WhatsApp Business API setup, automated order/booking confirmations, customer service routing, and templates.',
    full_description: 'Deploy compliant, automated WhatsApp communications using the official WhatsApp Business Cloud API. We implement automated order confirmations, dispatch tracking notifications, appointment reminders, interactive button menus, and team inbox routing.',
    problems_solved: [
      'Customer support teams overwhelmed answering repetitive status questions',
      'Manual sending of dispatch details and invoice receipts over personal phones',
      'Risk of account ban from using unapproved third-party scrapers'
    ],
    target_customers: ['E-commerce Stores', 'Service Contractors', 'Healthcare Clinics', 'Distributors Sending Daily Notifications'],
    benefits: ['Official Green Tick eligible Cloud API compliance', 'Instant automated responses 24/7', 'Unified multi-agent support inbox on a single business number'],
    deliverables: ['Meta WhatsApp Cloud API Verification', 'Approved Message Templates (Utility & Marketing)', 'Interactive Automated Flow & Button Menus', 'Multi-Agent Web Inbox or CRM Webhook Integration'],
    packages: [
      {
        id: 'pkg-ai-whatsapp-core',
        name: 'Official WhatsApp Automation Suite',
        description: 'Complete official Meta WhatsApp Cloud API setup and automation.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Meta Business Manager Verification Support', 'Up to 5 Approved Utility Templates', 'Interactive Auto-Responder Menu', 'Webhook Routing to Database or CRM'],
        limits: ['Dedicated phone number not currently registered on personal WhatsApp'],
        exclusions: ['Meta per-conversation messaging fees billed directly by Meta'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Meta Verification', description: 'Guide your company through official Meta Business verification and number onboarding.' },
      { step: 2, title: 'Template Submission', description: 'Draft and submit compliant utility and marketing templates for Meta approval.' },
      { step: 3, title: 'Flow & Webhook Build', description: 'Program interactive button menus and webhook triggers from your business systems.' },
      { step: 4, title: 'Live Testing & Go-Live', description: 'Test automated delivery, verify delivery receipts, and train your support team.' }
    ],
    client_responsibilities: ['Provide dedicated clean mobile number for WhatsApp Business API', 'Provide business registration proof for Meta verification'],
    exclusions: ['Unsolicited cold spam broadcasting adhering strictly to Meta policies'],
    additional_charges: ['AI chatbot NLP integration into WhatsApp conversations'],
    gallery: [],
    faqs: [
      { question: 'Is this the official WhatsApp API?', answer: 'Yes, we only implement the official Meta WhatsApp Business Cloud API, protecting your business phone number from spam blocks.' }
    ],
    seo_title: 'Official WhatsApp Business Automation | Unikorn360',
    seo_description: 'Official Meta WhatsApp Business Cloud API setup. Automated order notifications, interactive button menus, and team support inbox.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['whatsapp-order-notifications']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000024',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'Document Processing & Automation',
    slug: 'document-processing-automation',
    short_description: 'OCR data extraction from invoices, document classification, automated PDF generation, and approval workflows.',
    full_description: 'Eliminate manual paperwork transcription. We engineer automated document processing pipelines that extract structured data from scanned invoices, receipts, and challans using OCR, classify incoming files, generate standardized PDF documents, and route them through multi-stage approval workflows.',
    problems_solved: [
      'Accounting teams spending days manually typing vendor invoices into ERP software',
      'Mismatches between purchase bills and receiving inventory reports',
      'Slow, untracked paper approval processes across multi-department offices'
    ],
    target_customers: ['Accounts Departments', 'Logistics & Freight Operators', 'Trading Businesses', 'Industrial Units'],
    benefits: ['90%+ reduction in manual document typing time', 'High-accuracy automated extraction of invoice line items', 'Digital audit trails for every document approval'],
    deliverables: ['Custom OCR Extraction Pipeline', 'Automated Document Classification Engine', 'Dynamic PDF Document Generator', 'Multi-Stage Web Approval Workflow'],
    packages: [
      {
        id: 'pkg-ai-doc-core',
        name: 'Document Automation Pipeline',
        description: 'End-to-end OCR extraction and document generation workflow.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Custom OCR Model / Parser for Invoices', 'ERP / Database Data Export', 'Automated PDF Generation', 'Approval Workflow UI'],
        limits: ['Standardized document format templates'],
        exclusions: ['Physical document courier handling or manual scanning hardware'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Document Sample Analysis', description: 'Collect sample invoices and define target fields (GSTIN, line items, totals, dates).' },
      { step: 2, title: 'OCR & Parser Training', description: 'Configure optical character recognition and extraction regex validation rules.' },
      { step: 3, title: 'Integration & Approval UI', description: 'Build interface for staff to review extracted data and approve sync to database.' },
      { step: 4, title: 'Production Rollout', description: 'Deploy pipeline with automated error handling for illegible scans.' }
    ],
    client_responsibilities: ['Provide representative batches of scanned PDF invoices and bills', 'Define approval rules and financial authorization thresholds'],
    exclusions: ['Physical paper document scanning on client premises'],
    additional_charges: ['Handwriting recognition (ICR) for non-standard handwritten slips'],
    gallery: [],
    faqs: [
      { question: 'What formats can the system extract data from?', answer: 'The pipeline extracts structured data from digital PDFs, scanned image PDFs, TIFFs, JPGs, and PNG document uploads.' }
    ],
    seo_title: 'Document Processing & OCR Automation | Unikorn360',
    seo_description: 'Automated invoice OCR data extraction, document classification, dynamic PDF generation, and digital approval workflows.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['document-digitisation', 'document-automation']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000025',
    division_id: 'a4000000-0000-0000-0000-000000000004',
    service_name: 'Business Dashboards & Reporting Systems',
    slug: 'business-dashboards-reporting-systems',
    short_description: 'Custom web reporting dashboards, operational KPI cockpits, automated data feeds, and scheduled email reports.',
    full_description: 'Build and maintain executive reporting tools that deliver single-pane-of-glass visibility. We unify data from your accounting software, production records, CRMs, and bank statements into real-time interactive web dashboards with role-based access and automated scheduled PDF summaries.',
    problems_solved: [
      'Founders having to wait until the 15th of the next month to understand profitability',
      'Scattered data across five different platforms that never agree with each other',
      'Lack of visibility into real-time debtor ageing, cash runway, and inventory turns'
    ],
    target_customers: ['Business Promoters', 'Chief Operating Officers', 'Financial Controllers', 'Multi-Unit Managing Partners'],
    benefits: ['Daily clarity on real gross margins and cash flow runway', 'Single unified view without logging into multiple tools', 'Accessible securely on mobile and desktop devices'],
    deliverables: ['Custom Web Executive Dashboard', 'Automated Database / Spreadsheet Data Ingestion Feeds', 'Role-Based Dashboard Access Permissions', 'Scheduled Automated Executive Summary Reports'],
    packages: [
      {
        id: 'pkg-ai-dash-core',
        name: 'Executive Intelligence Cockpit',
        description: 'Complete custom business reporting dashboard with automated feeds.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Up to 15 Core Business Metrics / Charts', 'Automated Daily Data Sync Pipeline', 'Mobile & Desktop Responsive Dashboard', 'Scheduled Weekly PDF Executive Summary'],
        limits: ['Single organization scope'],
        exclusions: ['Third-party database hosting compute fees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'KPI & Metric Scrutiny', description: 'Define the critical 10–15 numbers that genuinely drive your business decisions.' },
      { step: 2, title: 'Data Feed Engineering', description: 'Build automated connectors to your accounting software, databases, or sheets.' },
      { step: 3, title: 'Dashboard Interface Build', description: 'Develop clean, interactive charts, KPI metric cards, and drill-down tables.' },
      { step: 4, title: 'Reconciliation & Launch', description: 'Verify dashboard calculations against audited figures and launch secure access.' }
    ],
    client_responsibilities: ['Provide access to source data files, databases, or accounting reports', 'Verify calculation logic with internal finance controller'],
    exclusions: ['Manual entry of unrecorded offline cash transactions'],
    additional_charges: ['Real-time factory floor IoT sensor machine monitoring integration'],
    gallery: [],
    faqs: [
      { question: 'Can this show our real gross margins and cash position daily?', answer: 'Yes. By synchronizing with your sales registers, purchase bills, and bank balance feeds, the dashboard calculates real-time margins and cash runways.' }
    ],
    seo_title: 'Business Dashboards & Reporting Systems | Unikorn360',
    seo_description: 'Custom executive business dashboards, KPI cockpits, automated data pipelines, and scheduled performance reporting tools.',
    status: 'draft',
    display_order: 7,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['business-dashboards', 'custom-dashboards']
  },

  // ------------------------------------------------------------------
  // 05. RESEARCH & BUSINESS STRATEGY (6 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000026',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Market & Customer Research',
    slug: 'market-customer-research',
    short_description: 'Customer demand mapping, buyer persona interviews, addressable market sizing, and purchasing behavior research.',
    full_description: 'Make informed commercial bets grounded in verified market demand. We conduct qualitative customer interviews, analyze regional market demand, estimate addressable market size, and map customer decision criteria before you invest capital in expansion or new products.',
    problems_solved: [
      'Investing heavy capital into product lines without verifying customer willingness to pay',
      'Unclear understanding of why prospective clients choose competing alternatives',
      'Entering new geographic territories without localized buyer insights'
    ],
    target_customers: ['Founders Launching New Products', 'Companies Entering New Regions', 'MSMEs Planning Facility Expansions'],
    benefits: ['Clear evidence of real customer demand before spending capital', 'Granular understanding of customer purchase objections and criteria', 'Actionable positioning recommendations'],
    deliverables: ['Market Demand & Opportunity Dossier', 'Target Buyer Personas & Decision Drivers', 'Addressable Market Size (TAM/SAM/SOM) Model', 'Executive Strategic Findings Presentation'],
    packages: [
      {
        id: 'pkg-res-market-study',
        name: 'Market Opportunity Assessment',
        description: 'Structured customer and market research study for business decision-makers.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Customer & Buyer Demand Interviews', 'Secondary Market Size Analysis', 'Customer Journey Mapping', 'Written Strategic Assessment Report'],
        limits: ['Scoped according to agreed target category and geography'],
        exclusions: ['Large-scale randomized statistical consumer polling (>1,000 respondents)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Hypothesis Scoping', description: 'Define the core market questions, target categories, and geographic focus.' },
      { step: 2, title: 'Customer & Channel Research', description: 'Conduct structured buyer interviews and analyze channel demand indicators.' },
      { step: 3, title: 'Synthesis & Market Sizing', description: 'Synthesize qualitative feedback and model addressable market volume.' },
      { step: 4, title: 'Strategic Recommendations', description: 'Deliver comprehensive research findings and go-to-market advisory.' }
    ],
    client_responsibilities: ['Provide introductions to past/current customer contacts for interviews where appropriate', 'Clarify unit economics and pricing boundaries'],
    exclusions: ['Academic theoretical research with no commercial operational utility'],
    additional_charges: ['Cross-border international export market destination studies'],
    gallery: [],
    faqs: [
      { question: 'How is this research conducted?', answer: 'We combine direct buyer and channel interviews with verifiable industry data, pricing benchmarks, and demand trends.' }
    ],
    seo_title: 'Market & Customer Research Services | Unikorn360',
    seo_description: 'Customer demand research, buyer persona interviews, market opportunity sizing, and go-to-market strategic assessments.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000027',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Competitor & Advertising Research',
    slug: 'competitor-advertising-research',
    short_description: 'Competitive intelligence on competitor positioning, pricing strategies, active advertising campaigns, and market gaps.',
    full_description: 'Understand exactly how your competitors position themselves, what ad angles they run, and where their weaknesses lie. We audit competitor websites, advertising creative history across Meta/Google ad libraries, pricing structures, customer reviews, and identify exploitable market gaps.',
    problems_solved: [
      'Blind spots regarding what offers and creative angles competitors are actively running',
      'Price competition eroding margins because your value proposition lacks clear differentiation',
      'Launching ad campaigns that blend in rather than standing out from the competitive set'
    ],
    target_customers: ['Business Owners Facing Price Wars', 'D2C Brand Founders', 'Companies Launching Paid Ads', 'Expanding MSMEs'],
    benefits: ['Clear map of competitor strengths, weaknesses, and pricing tiers', 'Intelligence on competitor best-selling offers and active ad angles', 'Identify underserved customer segments competitors ignore'],
    deliverables: ['Competitor Positioning & Offer Matrix', 'Advertising Creative & Messaging Breakdown', 'Customer Review Sentiment & Complaints Audit', 'Strategic Differentiation Playbook'],
    packages: [
      {
        id: 'pkg-res-comp-audit',
        name: 'Competitor Intelligence Dossier',
        description: 'Comprehensive research into 5 key competitors and active market dynamics.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Audit of 5 Core Competitors', 'Ad Library Creative History Analysis', 'Pricing & Packaging Comparison', 'Actionable Differentiation Recommendations'],
        limits: ['Publicly observable and commercial market data'],
        exclusions: ['Illicit corporate espionage or non-public trade secret acquisition'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Competitor Set Selection', description: 'Identify direct, indirect, and emerging alternative competitors.' },
      { step: 2, title: 'Digital & Advertising Audit', description: 'Analyze active Meta/Google ads, traffic sources, landing pages, and messaging.' },
      { step: 3, title: 'Sentiment & Gap Analysis', description: 'Mine public customer reviews to identify common complaints and unmet needs.' },
      { step: 4, title: 'Strategy Synthesis', description: 'Deliver competitive matrix and recommendations to position your business decisively.' }
    ],
    client_responsibilities: ['Identify current known competitors and key lost deal situations', 'Clarify your proprietary advantages and operational constraints'],
    exclusions: ['Unethical or illegal corporate espionage practices'],
    additional_charges: ['Continuous quarterly competitor advertising monitoring subscription'],
    gallery: [],
    faqs: [
      { question: 'What sources are used to analyze competitors?', answer: 'We analyze public advertising libraries (Meta, Google), web architecture, pricing structures, review sentiment, and published commercial collateral.' }
    ],
    seo_title: 'Competitor & Advertising Research | Unikorn360',
    seo_description: 'Competitive intelligence, advertising analysis, competitor pricing audits, and strategic positioning research for business growth.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000028',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Industry & Opportunity Research',
    slug: 'industry-opportunity-research',
    short_description: 'Analysis of emerging sector trends, regulatory shifts, supply chain developments, and new product opportunities.',
    full_description: 'Identify emerging business opportunities before your competitors. We analyze macro industry trends, technological developments, raw material supply chain dynamics, and regulatory policy shifts to help business promoters evaluate diversification and investment opportunities.',
    problems_solved: [
      'Over-reliance on a single declining legacy product category',
      'Missing profitable opportunities created by new government industrial policies',
      'Lack of structured market data when considering entering an adjacent industry'
    ],
    target_customers: ['Industrial Promoters Planning Diversification', 'Second-Generation Business Leaders', 'MSME Investors'],
    benefits: ['Identify high-margin emerging niches before market saturation', 'Understand regulatory tailwinds and subsidy opportunities early', 'Rigorous data-backed foundation for diversification decisions'],
    deliverables: ['Industry Trends & Opportunity Brief', 'Supply Chain & Margin Dynamics Assessment', 'Regulatory & Subsidy Policy Landscape Review', 'Feasibility & Action Roadmap'],
    packages: [
      {
        id: 'pkg-res-ind-opportunity',
        name: 'Sector Opportunity Assessment',
        description: 'Comprehensive research into an emerging industry or adjacent market sector.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['Sector Growth Drivers & Headwinds', 'Regulatory Policies & Incentive Schemes', 'Margin Benchmark Analysis', 'Executive Briefing Dossier'],
        limits: ['Single specified industry or niche category'],
        exclusions: ['Stock market equities trading advice'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Sector Framing', description: 'Define the target sector, product category, and investment capacity.' },
      { step: 2, title: 'Data Gathering', description: 'Evaluate trade statistics, industry production figures, and regulatory policies.' },
      { step: 3, title: 'Value Chain Mapping', description: 'Map raw materials, intermediate processors, distribution margins, and end-buyers.' },
      { step: 4, title: 'Executive Briefing', description: 'Deliver strategic report highlighting concrete diversification opportunities.' }
    ],
    client_responsibilities: ['Clarify available manufacturing capabilities, factory space, and capital budget', 'Participate in milestone review sessions'],
    exclusions: ['Financial investment advice or SEBI-regulated securities recommendations'],
    additional_charges: ['Detailed technical plant layout feasibility studies'],
    gallery: [],
    faqs: [
      { question: 'How does this help our manufacturing business diversify?', answer: 'We identify adjacent products utilizing your existing factory infrastructure or equipment with higher gross margins and growing market demand.' }
    ],
    seo_title: 'Industry & Opportunity Research for MSMEs | Unikorn360',
    seo_description: 'Sector trends research, industry opportunity assessments, supply chain analysis, and diversification studies for business leaders.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000029',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Business Performance Analysis',
    slug: 'business-performance-analysis',
    short_description: 'Deep-dive operational diagnostics, true product margin analysis, cost-leakage detection, and growth recommendations.',
    full_description: 'Understand the real financial and operational health of your business. We analyze historical sales registers, billings, unit economics, working capital cycle, and production overheads to uncover hidden cost leaks, identify your most profitable customers, and deliver concrete findings to boost net margins.',
    problems_solved: [
      'Revenue is increasing but bank balances and net profits are not growing',
      'Unclear which product lines generate real profit versus subsidizing loss-makers',
      'Operating cash trapped in slow-moving inventory and overdue customer receivables'
    ],
    target_customers: ['Established MSME Promoters', 'Factory Owners', 'Service Firm Partners', 'Companies Preparing for Growth Financing'],
    benefits: ['Clear diagnosis of true gross and contribution margins by SKU', 'Identify cost leakages and unprofitable accounts', 'Actionable operational fixes to improve working capital liquidity'],
    deliverables: ['Financial & Operational Diagnostic Report', 'Product Unit Economics & Margin Breakdown', 'Working Capital & Cash Conversion Cycle Audit', 'Prioritized Profit Improvement Roadmap'],
    packages: [
      {
        id: 'pkg-res-diagnostic-audit',
        name: 'Operational & Margin Diagnostic',
        description: 'Comprehensive operational and financial diagnostic audit.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Historical Financial Data Review (Last 1–3 Years)', 'Product-Level Unit Economics Analysis', 'Working Capital & Debtor Ageing Diagnostic', 'Written Findings & Profit Optimization Roadmap'],
        limits: ['Single business entity'],
        exclusions: ['Statutory tax audit or CA audit sign-off'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Data Ingestion', description: 'Review Tally/ERP ledger backups, sales registers, purchase bills, and bank statements.' },
      { step: 2, title: 'Margin & Cost Decomposition', description: 'Calculate actual direct material, labor, overhead, and finance costs per unit.' },
      { step: 3, title: 'Cash Flow & Receivables Analysis', description: 'Analyze customer payment timelines and slow-moving inventory holding costs.' },
      { step: 4, title: 'Executive Presentation', description: 'Present diagnostic findings and prioritized profit improvement action plan.' }
    ],
    client_responsibilities: ['Provide complete ledger backups, P&L statements, and billings datasets', 'Designate financial controller or accountant for data clarification'],
    exclusions: ['Statutory statutory audit certifications (performed by your chartered accountant)'],
    additional_charges: ['Hands-on monthly retainer implementation of diagnostic recommendations'],
    gallery: [],
    faqs: [
      { question: 'Is this the same as a chartered accountant audit?', answer: 'No. A statutory CA audit verifies tax compliance. Our performance analysis is an operational management diagnostic designed to increase profits and eliminate cost leaks.' }
    ],
    seo_title: 'Business Performance Analysis & Margin Diagnostics | Unikorn360',
    seo_description: 'Operational diagnostics, true margin analysis, cost-leakage detection, and working capital optimization for business promoters.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['inventory-sales-analytics', 'business-diagnostic-audit', 'verify-audit', 'standard-operating-procedures']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000030',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Business Planning & Financial Feasibility',
    slug: 'business-planning-financial-feasibility',
    short_description: 'Comprehensive business plans, commercial financial models, break-even analysis, and capital requirement forecasting.',
    full_description: 'Develop structured commercial business plans and financial projection models. Designed for promoters planning major expansions, launching new ventures, or seeking investor funding. Includes multi-year revenue projections, CAPEX/OPEX budgets, debt servicing calculations, and break-even models.',
    problems_solved: [
      'Uncertainty about how much capital is genuinely needed to reach break-even',
      'Investors or financial partners requesting robust, defensible financial models',
      'Expansion projects running into cash shortages due to poor working capital planning'
    ],
    target_customers: ['Founders Seeking Investment', 'Promoters Planning Facility Expansions', 'Business Partners Structuring New Ventures'],
    benefits: ['Robust, banker- and investor-grade financial model', 'Clear visibility on break-even timeline and cash runway requirements', 'Scenario sensitivity analysis for best, expected, and worst cases'],
    deliverables: ['Commercial Business Plan Document', 'Multi-Year Dynamic Financial Projection Model (Excel)', 'CAPEX / OPEX / Break-Even Sensitivity Analysis', 'Executive Pitch Summary Deck'],
    packages: [
      {
        id: 'pkg-res-feasibility-core',
        name: 'Comprehensive Feasibility & Financial Model',
        description: 'Complete commercial business plan and multi-year projection model.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'quotation',
        inclusions: ['3–5 Year Financial Projection Model', 'Detailed Cost & Revenue Assumptions Matrix', 'Break-Even & Sensitivity Analysis', 'Professional Business Plan Document'],
        limits: ['Single venture or expansion project'],
        exclusions: ['Direct investor matchmaking guarantees'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Commercial Assumptions Scrutiny', description: 'Establish capacity, pricing, bill of materials, staffing, and fixed overheads.' },
      { step: 2, title: 'Financial Model Construction', description: 'Engineer dynamic P&L, balance sheet, cash flow, and debt servicing schedules.' },
      { step: 3, title: 'Scenario & Stress Testing', description: 'Test sensitivity against raw material inflation, delay in sales, and interest rates.' },
      { step: 4, title: 'Business Plan Synthesis', description: 'Deliver bound business plan and editable Excel model for stakeholder review.' }
    ],
    client_responsibilities: ['Provide technical quotes for planned plant/machinery and facility lease estimates', 'Clarify targeted commercial sales volumes'],
    exclusions: ['Legal investor solicitation or equity broker services'],
    additional_charges: ['Multiple brand or multi-entity consolidated financial models'],
    gallery: [],
    faqs: [
      { question: 'Will this model be editable by our team?', answer: 'Yes, we provide fully unlocked, documented Excel models with dynamic assumption toggles so you can adjust scenarios at any time.' }
    ],
    seo_title: 'Business Planning & Financial Feasibility Modeling | Unikorn360',
    seo_description: 'Commercial business plans, multi-year financial projection models, break-even analysis, and capital requirement forecasting.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['project-feasibility', 'feasibility-study', 'project-consulting']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000031',
    division_id: 'a5000000-0000-0000-0000-000000000005',
    service_name: 'Startup & Growth Consulting',
    slug: 'startup-growth-consulting',
    short_description: 'Strategic advisory for founders and leadership teams navigating early scaling, operational bottlenecks, and milestones.',
    full_description: 'Hands-on strategic consulting for founders and business partners. We help you structure your operating rhythms, refine your business model, establish milestone tracking, resolve founder alignment bottlenecks, and prepare your organization for sustainable scaling.',
    problems_solved: [
      'Founders overwhelmed wearing every operational hat with no time for strategy',
      'Growth stalling after early customer traction due to operational chaos',
      'Disagreement between partners on operational priorities and capital allocation'
    ],
    target_customers: ['Early-Stage Founders', 'Growing MSME Managing Partners', 'Second-Generation Business Leaders'],
    benefits: ['Clear quarterly milestone roadmap and operational priorities', 'Objective outside perspective on structural bottlenecks', 'Disciplined executive decision-making rhythm'],
    deliverables: ['Strategic Growth Roadmap', 'Operating Rhythms & KPI Framework', 'Bi-Weekly Executive Advisory Sessions', 'Direct Founder Advisory Access'],
    packages: [
      {
        id: 'pkg-res-growth-advisory',
        name: 'Founder Strategic Retainer',
        description: 'Bi-weekly strategic consulting sessions and milestone oversight.',
        price: null,
        currency: 'INR',
        billing_period: 'monthly',
        price_type: 'starting-from',
        inclusions: ['Two 90-Minute Executive Strategy Sessions / Month', 'Quarterly Growth Roadmap Calibration', 'Review of Commercial Proposals & Models', 'Direct WhatsApp Access to Lead Advisor'],
        limits: ['Founder and leadership team scope'],
        exclusions: ['Full-time interim operational executive management'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Diagnostic Assessment', description: 'Review business model, current traction, operational bottlenecks, and partner goals.' },
      { step: 2, title: 'Roadmap & OKR Setting', description: 'Establish clear 90-day targets, accountability owners, and key metrics.' },
      { step: 3, title: 'Bi-Weekly Advisory Sprints', description: 'Review milestone progress, remove execution roadblocks, and evaluate opportunities.' },
      { step: 4, title: 'Quarterly Strategic Reset', description: 'Assess quarterly results against plan and recalibrate commercial objectives.' }
    ],
    client_responsibilities: ['Commit key founders to scheduled advisory sessions', 'Execute agreed operational action items between sessions'],
    exclusions: ['Day-to-day routine operational staff management'],
    additional_charges: ['On-site full-day strategy retreats with leadership teams'],
    gallery: [],
    faqs: [
      { question: 'What makes your consulting practical rather than theoretical?', answer: 'We are grounded in real-world systems, technology, compliance, and cash flow economics. Every session focuses on actionable operational decisions.' }
    ],
    seo_title: 'Startup & Growth Advisory Consulting | Unikorn360',
    seo_description: 'Strategic consulting for founders and business owners. Resolve operational bottlenecks, establish milestone tracking, and scale sustainably.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['business-structuring']
  },

  // ------------------------------------------------------------------
  // 06. BUSINESS SETUP & DOCUMENTATION (6 Services)
  // ------------------------------------------------------------------
  {
    id: 'b0000000-0000-4000-8000-000000000032',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'Business Registration Assistance',
    slug: 'business-registration-assistance',
    short_description: 'Documentation support for Sole Proprietorships, Partnerships, Limited Liability Partnerships (LLP), and Private Limited companies.',
    full_description: 'Establish your legal business entity with complete documentation support. We assist with name reservation, drafting Partnership Deeds, MOA/AOA documentation, Director Identification Numbers (DIN), Digital Signature Certificates (DSC), and Ministry of Corporate Affairs (MCA) incorporation filings.',
    problems_solved: [
      'Confusion regarding whether to incorporate as an LLP, Pvt Ltd, or Partnership',
      'Name rejection and delays due to non-compliant incorporation documentation',
      'Missing statutory post-incorporation registrations that lead to penalties'
    ],
    target_customers: ['New Entrepreneurs', 'Partnerships Formalizing Entities', 'Proprietors Transitioning to Pvt Ltd'],
    benefits: ['Clear advice on the right legal entity structure', 'Complete end-to-end documentation preparation', 'Accelerated turnaround with zero name rejection rework'],
    deliverables: ['Entity Structure Recommendation', 'Drafting of MOA, AOA, or Partnership Deed', 'MCA Filing Support & Certificate of Incorporation', 'Company PAN, TAN & Digital Signature Certificates'],
    packages: [
      {
        id: 'pkg-doc-pvt-ltd',
        name: 'Private Limited Incorporation Support',
        description: 'Complete documentation and filing support for Private Limited company incorporation.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Name Reservation Support (RUN/SPICe+)', '2 Director DSCs & DIN Allocation', 'Drafting of MOA & AOA', 'Certificate of Incorporation, PAN & TAN'],
        limits: ['Up to 2 directors and authorized capital within standard slab'],
        exclusions: ['Government MCA stamp duty fees for capital above standard slabs'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Structure & Name Check', description: 'Verify proposed entity names against trademark registry and MCA database.' },
      { step: 2, title: 'KYC & DSC Preparation', description: 'Obtain Class 3 Digital Signature Certificates and assemble director KYC documents.' },
      { step: 3, title: 'Drafting & SPICe+ Filing', description: 'Draft MOA/AOA bylaws and submit incorporation application on MCA portal.' },
      { step: 4, title: 'Certificate & Bank Account Kit', description: 'Receive Certificate of Incorporation, PAN, TAN, and assemble bank current account kit.' }
    ],
    client_responsibilities: ['Provide clean identity (PAN/Aadhaar) and address proofs for all promoters', 'Provide registered office premises electricity bill and owner NOC'],
    exclusions: ['Commercial lease security deposit payments'],
    additional_charges: ['Foreign national director compliance and embassy attestation support'],
    gallery: [],
    faqs: [
      { question: 'How long does company incorporation take?', answer: 'With clean KYC documents and an approved name, incorporation is typically completed in 7 to 10 working days on the MCA portal.' }
    ],
    seo_title: 'Business Registration & Company Incorporation Support | Unikorn360',
    seo_description: 'Documentation support for Private Limited company incorporation, LLP registration, Partnership Deeds, DSC, and MCA filings.',
    status: 'draft',
    display_order: 1,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['company-incorporation', 'roc-compliance', 'factory-licence', 'fire-noc', 'fssai-licence', 'trade-licence', 'labour-epf-esi']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000033',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'GST & Udyam Assistance',
    slug: 'gst-udyam-assistance',
    short_description: 'GST tax registration, Udyam MSME priority certificate support, monthly filing coordination, and ITC reconciliations.',
    full_description: 'Ensure statutory tax and MSME priority compliance. We assist with new GST registrations, jurisdiction alignment, HSN classification, Udyam MSME priority certificates (unlocking collateral-free bank loans and government subsidies), monthly GSTR-1 and GSTR-3B coordination, and GSTR-2B input tax credit reconciliations.',
    problems_solved: [
      'Show-cause notices and rejected GST applications due to documentation mismatches',
      'Missing out on MSME priority lending benefits, interest subventions, and subsidies',
      'Losing thousands of rupees in uncredited Input Tax Credit (ITC) due to defaulting vendors'
    ],
    target_customers: ['New Businesses Requiring GSTIN', 'Manufacturers Needing Udyam Priority', 'Traders & Exporters with Monthly Filings'],
    benefits: ['Accurate HSN/SAC code selection with zero departmental rejection', 'Udyam certificate unlocking government tender priority and MSME schemes', 'Disciplined monthly filing coordination preventing late fee penalties'],
    deliverables: ['GST Registration Certificate (Form REG-06)', 'Udyam MSME Registration Certificate', 'Monthly Return Filing Coordination Dossier', 'GSTR-2B Input Tax Credit Reconciliation Reports'],
    packages: [
      {
        id: 'pkg-doc-gst-udyam-bundle',
        name: 'GST & Udyam Startup Foundation',
        description: 'Complete registration assistance for GST and Udyam MSME certificates.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['New GSTIN Registration Support', 'Aadhaar Authentication Handling', 'Udyam MSME Priority Certificate', 'HSN Code Mapping & Compliance Guidance'],
        limits: ['Single business entity'],
        exclusions: ['Subsequent monthly return filings (available under monthly retainer)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Document & Jurisdiction Review', description: 'Examine premises electricity bill, rental agreement, PAN, and assign correct tax ward.' },
      { step: 2, title: 'HSN & Portal Application', description: 'Select 6/8-digit HSN codes and file application with biometric/Aadhaar OTP auth.' },
      { step: 3, title: 'Clarification Follow-Up', description: 'Address any departmental REG-03 clarification notices within 24 hours.' },
      { step: 4, title: 'Certificate Grant & Udyam', description: 'Deliver active GSTIN certificate and generate corresponding Udyam MSME priority card.' }
    ],
    client_responsibilities: ['Provide Aadhaar-linked mobile OTP for instant authentication', 'Provide latest premises electricity bill and landlord NOC'],
    exclusions: ['Payment of statutory tax dues, interest, or historical departmental penalties'],
    additional_charges: ['GST cancellation revocation and department notice appeal support'],
    gallery: [],
    faqs: [
      { question: 'What is the benefit of obtaining a Udyam certificate?', answer: 'Udyam registration certifies your business as a recognized MSME, unlocking eligibility for collateral-free bank loans (CGTMSE), lower trademark fees, and government capital subsidies.' }
    ],
    seo_title: 'GST & Udyam MSME Registration Assistance | Unikorn360',
    seo_description: 'Fast, compliant GST registration and Udyam MSME priority certificate support. HSN classification and monthly filing coordination.',
    status: 'draft',
    display_order: 2,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['gst-registration', 'new-gst-registration', 'gst-returns', 'monthly-gst-filing', 'itc-reconciliation', 'udyam-registration', 'bookkeeping-mis', 'dsc-token']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000034',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'Trademark Filing Coordination',
    slug: 'trademark-filing-coordination',
    short_description: 'Comprehensive brand name availability searches, Nice class mapping, trademark application coordination, and examination support.',
    full_description: 'Protect your brand name, logo, and intellectual property. We coordinate comprehensive trademark availability searches across Indian Trademark Registry classes, map your products to the correct Nice classifications, prepare application documentation, and coordinate TM application filings.',
    problems_solved: [
      'Building a successful brand only to discover a competitor has trademarked your name',
      'Receiving trademark objections due to incorrect class selection or descriptive names',
      'Wasting time and government fees on trademark applications destined for rejection'
    ],
    target_customers: ['Brand Founders', 'Product Manufacturers', 'E-commerce Sellers', 'Expanding Retail Businesses'],
    benefits: ['Immediate legal priority upon application number generation (use of ™ symbol)', 'Thorough similarity search preventing costly infringement disputes', 'Special 50% government fee concession support for registered MSMEs/Startups'],
    deliverables: ['Pre-Filing Trademark Similarity Search Report', 'Nice Classification Mapping Strategy', 'Trademark Form TM-A Documentation Dossier', 'Official Trademark Application Acknowledgment'],
    packages: [
      {
        id: 'pkg-doc-tm-coordination',
        name: 'Single Class Trademark Filing Coordination',
        description: 'Comprehensive search, documentation, and filing coordination.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Comprehensive Trademark Database Similarity Search', 'Class Mapping & Specification Drafting', 'Filing Coordination on IP India Portal', 'Application Tracking & Status Alerts'],
        limits: ['Single brand mark in single Nice classification'],
        exclusions: ['Government statutory filing fees paid directly to IP India (₹4,500 for MSME / ₹9,000 for non-MSME)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Similarity Search', description: 'Analyze phonetically and visually similar existing registered and pending marks.' },
      { step: 2, title: 'Class & Specification Drafting', description: 'Draft precise description of goods and services under relevant Nice classes.' },
      { step: 3, title: 'Application Coordination', description: 'Submit TM-A documentation with digital signature on IP India portal.' },
      { step: 4, title: 'Application Handover', description: 'Deliver official government filing receipt and instructions for legal ™ symbol usage.' }
    ],
    client_responsibilities: ['Provide high-resolution logo graphic and clear list of goods/services sold', 'Provide Udyam certificate to qualify for 50% government fee discount'],
    exclusions: ['IP India government official filing fee; formal legal contestation in trademark opposition hearings'],
    additional_charges: ['Written legal reply drafting for Trademark Examination Report objections'],
    gallery: [],
    faqs: [
      { question: 'When can I start using the ™ symbol?', answer: 'You can legally display the ™ symbol immediately upon receiving the official trademark application number and government filing receipt.' }
    ],
    seo_title: 'Trademark Filing Coordination & Brand Protection | Unikorn360',
    seo_description: 'Brand name search, Nice classification mapping, and trademark application filing coordination for Indian businesses and startups.',
    status: 'draft',
    display_order: 3,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  },
  {
    id: 'b0000000-0000-4000-8000-000000000035',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'Government Scheme Application Support',
    slug: 'government-scheme-application-support',
    short_description: 'Documentation and application coordination for MSME subsidies including PMEGP, NEEDS, and capital investment incentives.',
    full_description: 'Access government capital subsidies and incentive schemes designed for MSMEs. We evaluate your eligibility for central and state programs (including PMEGP, NEEDS, and capital investment subsidies), assemble compliant project files, coordinate portal filings, and support bank coordination through to sanction.',
    problems_solved: [
      'Missing out on non-repayable government capital subsidies of 15% to 35%',
      'Applications rejected due to improper project documentation or missing eligibility certificates',
      'Getting lost in multi-department portal procedures between District Industries Centres (DIC) and banks'
    ],
    target_customers: ['New Manufacturing Entrepreneurs', 'Expanding Industrial Units', 'Women & SC/ST Promoters Eligible for Special Slabs'],
    benefits: ['Maximize legitimate capital subsidy eligibility (up to 25%–35% under PMEGP/NEEDS)', 'Bank-compliant project documentation aligned with scheme guidelines', 'Guidance through DIC scrutiny and task force committee presentations'],
    deliverables: ['Scheme Eligibility Assessment & Subsidy Calculation Matrix', 'Scheme-Compliant Detailed Project Report (DPR)', 'Portal Application Dossier & Upload Coordination', 'Bank Branch Subsidy Claim Follow-up Kit'],
    packages: [
      {
        id: 'pkg-doc-subsidy-support',
        name: 'Government Scheme Facilitation',
        description: 'Complete eligibility evaluation, DPR, and portal application support.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Scheme Eligibility Verification', 'Scheme-Compliant Project Report & Financials', 'Government Portal Filing Coordination', 'Guidance on Task Force Committee Interview'],
        limits: ['Single project investment proposal'],
        exclusions: ['We do not promise or guarantee government approvals, adhering strictly to official merit criteria'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Eligibility Scrutiny', description: 'Evaluate promoter qualifications, community criteria, location, and proposed project cost.' },
      { step: 2, title: 'DPR & Financial Formulation', description: 'Draft detailed scheme-compliant project report matching DIC and bank norms.' },
      { step: 3, title: 'Portal Application', description: 'Coordinate online application filing with required quotations and statutory attachments.' },
      { step: 4, title: 'Sanction & Subsidy Claim Support', description: 'Assist bank branch with subsidy claim submission upon loan disbursement.' }
    ],
    client_responsibilities: ['Provide legitimate machinery quotations from verified GST-registered vendors', 'Attend mandatory DIC Task Force Committee interview in person'],
    exclusions: ['We do not guarantee government sanctions or make unofficial claims; approval rests strictly with government task force committees'],
    additional_charges: ['Multi-department pollution control or factory clearance coordination'],
    gallery: [],
    faqs: [
      { question: 'What is the typical subsidy under PMEGP and NEEDS?', answer: 'PMEGP offers 15% to 35% margin money subsidy on project costs up to ₹50 Lakhs for manufacturing. The NEEDS scheme provides 25% subsidy up to ₹75 Lakhs for first-generation entrepreneurs.' }
    ],
    seo_title: 'MSME Government Subsidy Support (PMEGP / NEEDS) | Unikorn360',
    seo_description: 'Application support and project reports for PMEGP, NEEDS, and MSME capital subsidies. Eligibility verification and portal filing coordination.',
    status: 'draft',
    display_order: 4,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['government-subsidy-assistance', 'pmegp-assistance', 'statutory-approvals-roadmap', 'tnpcb-approvals']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000036',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'DPR & Loan Documentation',
    slug: 'dpr-loan-documentation',
    short_description: 'Bank-ready Detailed Project Reports (DPR), CMA data, debt-service coverage (DSCR) calculations, and term loan files.',
    full_description: 'Secure institutional bank financing with banker-grade loan documentation. We prepare comprehensive Detailed Project Reports (DPR), Credit Monitoring Arrangement (CMA) data spreadsheets, Debt Service Coverage Ratio (DSCR) schedules, cash flow projections, and bank proposal dossiers compliant with nationalized and private bank credit norms.',
    problems_solved: [
      'Bank credit officers rejecting loan files due to amateur or incomplete project reports',
      'Unrealistic financial projections that fail banking scrutiny during credit committee reviews',
      'Delays in working capital (CC/OD) limit enhancements due to improper CMA data formulation'
    ],
    target_customers: ['Manufacturers Expanding Plant & Machinery', 'Businesses Applying for Bank Term Loans', 'Firms Seeking Working Capital Enhancements (CC/OD)'],
    benefits: ['DPR formulated to banking credit standards minimizing underwriting queries', 'Accurate DSCR, MPBF, and IRR models aligned with credit guidelines', 'Faster loan appraisal and sanction process at commercial banks'],
    deliverables: ['Bank-Ready Detailed Project Report (DPR)', 'Multi-Year CMA Data (Past 2 yrs + Current yr + Next 5 yrs)', 'Debt Service Coverage Ratio (DSCR) Schedule', 'Executive Bank Credit Proposal Summary'],
    packages: [
      {
        id: 'pkg-doc-dpr-standard',
        name: 'Bank-Ready DPR & CMA Package',
        description: 'Complete institutional project report and financial model for bank financing.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Comprehensive Detailed Project Report (DPR)', 'Bank-Standard CMA Data File', 'DSCR & Repayment Schedule', 'Addressing Bank Credit Officer Queries'],
        limits: ['Single project loan application up to standard institutional limits'],
        exclusions: ['Loan sanction guarantees (sanction decisions rest strictly with bank credit committees)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Project Scrutiny & Costing', description: 'Analyze proposed civil works, machinery quotations, promoter margin, and loan amount.' },
      { step: 2, title: 'Financial Modeling & CMA', description: 'Formulate dynamic CMA data with defensible sales assumptions and working capital ratios.' },
      { step: 3, title: 'DPR Drafting', description: 'Author technical, commercial, managerial, and economic viability sections.' },
      { step: 4, title: 'Bank Dossier Handover', description: 'Deliver bound DPR and Excel CMA data ready for immediate submission to branch manager.' }
    ],
    client_responsibilities: ['Provide past 2–3 years audited balance sheets and current year provisional statements', 'Supply formal machinery quotations and building estimates'],
    exclusions: ['We do not guarantee loan sanctions; approval decisions rest solely with bank credit underwriting teams'],
    additional_charges: ['Consolidated financial models for multi-company borrower groups'],
    gallery: [],
    faqs: [
      { question: 'What is CMA data and why do banks require it?', answer: 'CMA (Credit Monitoring Arrangement) data analyzes past and projected financial performance across 7 standardized tables. Banks mandate it to assess repayment capacity and calculate working capital limits.' }
    ],
    seo_title: 'Bank-Ready DPR & CMA Data Preparation | Unikorn360',
    seo_description: 'Bank-ready Detailed Project Reports (DPR), CMA data formulation, working capital assessments, and loan documentation for MSMEs.',
    status: 'draft',
    display_order: 5,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: ['detailed-project-report', 'dpr-preparation', 'cma-data', 'cma-data-preparation', 'working-capital', 'working-capital-assessment', 'business-loan-support', 'mudra-loan-assistance']
  },
  {
    id: 'b0000000-0000-4000-8000-000000000037',
    division_id: 'a6000000-0000-0000-0000-000000000006',
    service_name: 'Property Documentation Coordination',
    slug: 'property-documentation-coordination',
    short_description: 'Coordination and review support for industrial lease deeds, title search documentation, and bank collateral indexing.',
    full_description: 'Secure your real estate and facility paperwork. We support businesses and industrial promoters in reviewing commercial lease agreements, compiling property title documents for bank mortgage collateral, coordinating Encumbrance Certificate (EC) verification, and creating indexed digital property document vaults.',
    problems_solved: [
      'Commercial lease deeds containing unfavorable lock-in clauses or unclear maintenance liabilities',
      'Bank loan disbursements delayed because property collateral documents are incomplete or disordered',
      'Difficulty locating historical title documents, patta transfers, or tax receipts during bank scrutiny'
    ],
    target_customers: ['Manufacturers Leasing Industrial Sheds', 'Borrowers Pledging Property for Bank Loans', 'Business Owners Buying Commercial Premises'],
    benefits: ['Clear scrutiny of commercial lease covenants before signing', 'Indexed collateral document dossier ready for bank legal panel scrutiny', 'Reduced risk of title defects or encumbrance surprises'],
    deliverables: ['Commercial Lease Deed Review & Modification Notes', 'Bank Collateral Property Document Checklist', 'Encumbrance Certificate & Tax Receipt Coordination', 'Secure Digital Property Document Vault'],
    packages: [
      {
        id: 'pkg-doc-prop-coordination',
        name: 'Property Documentation Review & Index',
        description: 'Coordination and review of property documents for commercial leasing or bank collateral.',
        price: null,
        currency: 'INR',
        billing_period: 'project-based',
        price_type: 'starting-from',
        inclusions: ['Commercial Lease Deed Scrutiny', 'Title Chain Chronology Compilation', 'Bank Legal Scrutiny Checklist Review', 'Digital Document Vault Indexing'],
        limits: ['Single commercial property / industrial shed'],
        exclusions: ['Direct legal advocate title opinion certification (issued by bar-registered advocates)'],
        setup_charges: 'None',
        tax_treatment: 'Subject to applicable GST (18%)',
        approval_status: 'draft'
      }
    ],
    process_steps: [
      { step: 1, title: 'Document Intake & Chain Review', description: 'Assemble parent deeds, sale deeds, patta, chitta, and encumbrance records.' },
      { step: 2, title: 'Chronological Indexing', description: 'Organize uninterrupted title chain chronology and identify any missing links.' },
      { step: 3, title: 'Lease / Agreement Review', description: 'Review draft commercial lease terms for exit clauses, sublease rights, and utility liabilities.' },
      { step: 4, title: 'Collateral Dossier Assembly', description: 'Package indexed property kit ready for advocate or bank legal panel inspection.' }
    ],
    client_responsibilities: ['Provide legible copies of all available historical property deeds and latest tax receipts', 'Coordinate with landlord for premises documents when leasing'],
    exclusions: ['Advocate title certification is issued by your designated legal counsel; we provide documentation coordination and review support'],
    additional_charges: ['Multi-property agricultural-to-industrial land conversion documentation support'],
    gallery: [],
    faqs: [
      { question: 'Do you provide advocate legal opinions?', answer: 'We handle documentation coordination, chronological indexing, and commercial lease review. Formal title legal opinions required by banks are executed in coordination with designated bar-registered advocates.' }
    ],
    seo_title: 'Property Documentation Coordination & Lease Review | Unikorn360',
    seo_description: 'Commercial lease deed review, industrial property documentation coordination, title chain indexing, and bank collateral preparation.',
    status: 'draft',
    display_order: 6,
    published_at: null,
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
    legacy_slugs: []
  }
];

// ====================================================================
// 3. SECONDARY OFFERINGS OUTSIDE THE MAIN 37 SERVICES
// ====================================================================

// A. Training Section (Maintained outside primary 37 services)
export interface TrainingOffering {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  targetAudience: string;
  curriculumHighlights: string[];
}

export const SEED_TRAINING_PROGRAMS: TrainingOffering[] = [
  {
    id: 'trn-ai-systems',
    title: 'AI & Systems for Business Teams',
    slug: 'ai-training',
    category: 'Technology & Automation',
    description: 'Practical training on using AI tools, prompt engineering, and workflow automation for operations and management staff.',
    duration: '2-Day Intensive Workshop or 4-Week Cohort',
    targetAudience: 'Operations managers, department leads, and business executives.',
    curriculumHighlights: [
      'Grounded AI Prompt Engineering for Business Workflows',
      'Automating Routine Email and WhatsApp Customer Queries',
      'Document Data Extraction and Excel Copilot Workflows',
      'Data Privacy & Safe AI Usage Protocols'
    ]
  },
  {
    id: 'trn-digital-marketing',
    title: 'Digital Marketing & Lead Generation',
    slug: 'digital-marketing-training',
    category: 'Marketing & Sales',
    description: 'Hands-on training covering organic SEO, Meta ads management, Google Ads, and conversion tracking fundamentals.',
    duration: '3-Day Workshop or 6-Week Practical Program',
    targetAudience: 'Internal marketing personnel, business owners, and sales heads.',
    curriculumHighlights: [
      'Technical SEO and Local Search Optimization',
      'Creating High-Converting Meta & Google Ad Campaigns',
      'UGC Video Scripting and Creator Collaboration Basics',
      'Analytics, Google Tag Manager & Attribution Measurement'
    ]
  },
  {
    id: 'trn-web-development',
    title: 'Modern Web Development Fundamentals',
    slug: 'website-development-training',
    category: 'Software Engineering',
    description: 'Foundational development training on responsive websites, modern web frameworks, and cloud deployment pipelines.',
    duration: '6-Week Hands-On Practical Bootcamp',
    targetAudience: 'Junior developers, IT staff, and technical apprentices.',
    curriculumHighlights: [
      'Semantic HTML5, Responsive Tailwind CSS & UI Principles',
      'Modern JavaScript / TypeScript Fundamentals',
      'Component-Driven Development with React',
      'Git Version Control, APIs & Cloud Deployment'
    ]
  }
];

// B. Advisory Offering: Personal & Executive Systems
export interface AdvisoryOffering {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  deliverables: string[];
  description: string;
}

export const SEED_ADVISORY_OFFERINGS: AdvisoryOffering[] = [
  {
    id: 'adv-executive-os',
    title: 'Personal & Executive Systems',
    slug: 'personal-executive-systems',
    subtitle: 'Founder Operational Architecture & Decision Rhythms',
    description: 'Executive advisory focused on structuring the personal operating rhythms, information diet, and delegation architecture of business founders. Delivers concrete operating playbooks distinct from software products.',
    deliverables: [
      'Executive Calendar & Priority Architecture Playbook',
      'Personal Knowledge Management & Decision Ledger System',
      'Delegation & Key Result Tracking Dashboard',
      'Bi-Weekly 1-on-1 Strategic Calibration Sessions'
    ]
  },
  {
    id: 'adv-rti-petitions',
    title: 'RTI & Representation Assistance',
    slug: 'rti-petition-assistance',
    subtitle: 'Secondary Regulatory Documentation Support',
    description: 'Structured documentation support for drafting formal Right to Information (RTI) applications, administrative appeals, and regulatory representations before statutory departments.',
    deliverables: [
      'RTI Application Drafting under Central/State Acts',
      'Departmental Authority Jurisdiction Mapping',
      'First and Second Appeal Documentation Support',
      'Postal Dispatch & Online Tracking Ledger'
    ]
  }
];

// C. Software Products (Preserved in separate /products section)
export const SEED_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-invoicepro360',
    name: 'InvoicePro360',
    tagline: 'Business Invoicing & Ledger Workspace',
    description:
      'AI workspace for business invoices to create, scan, extract, validate GST tax breakdowns, track payment balances, and query invoice records.',
    status: 'available',
    target_audience:
      'Business owners, finance teams, and billing operators preparing and reconciling GST tax invoices.',
    key_capabilities: [
      'Invoice creation and structured line-item drafting',
      'Invoice scanning and OCR line-item extraction',
      'GSTIN format, HSN code, and CGST/SGST/IGST tax breakdown validation',
      'Payment ledger with balance-due and UTR reference tracking'
    ],
    cta_text: 'View InvoicePro360',
    division_ref: 'websites-software'
  },
  {
    id: 'prod-deeds360',
    name: 'Deeds360',
    tagline: 'Property Deed Drafting & Registration Readiness',
    description:
      'Bilingual (English and Tamil) property deed drafting, scanned parent-deed OCR extraction, draft comparison, and Tamil Nadu STAR 2.0 readiness workspace.',
    status: 'available',
    target_audience:
      'Document writers, property registration practitioners, and legal teams preparing Tamil Nadu registration deeds.',
    key_capabilities: [
      'Guided drafting for Sale, Gift, Settlement, Lease, Mortgage, and Release deeds',
      'Scanned parent-deed OCR extraction and side-by-side draft comparison',
      'Schedule, Survey Number, Patta, and party name cross-verification',
      'Tamil Nadu stamp duty and registration fee estimation'
    ],
    cta_text: 'View Deeds360',
    division_ref: 'business-setup-documentation'
  },
  {
    id: 'prod-property360',
    name: 'Property360',
    tagline: 'Property, Land Revenue & Multi-Domain Legal Analysis',
    description:
      'Bilingual (Tamil and English) property, land revenue, and multi-domain legal case evaluation, statutory mapping, and structured dossier generation system.',
    status: 'available',
    target_audience:
      'Property owners, families, and legal practitioners assessing land revenue, Patta, succession, and title matters.',
    key_capabilities: [
      'Natural-language dispute intake and legal domain classification',
      'Dynamic domain-specific prompts for survey, Patta, and revenue records',
      'Cross-law statutory and High Court / Supreme Court precedent mapping',
      'Bilingual (Tamil and English) multi-stage case dossiers and PDF exports'
    ],
    cta_text: 'View Property360',
    division_ref: 'business-setup-documentation'
  },
  {
    id: 'prod-advocate360',
    name: 'Advocate360',
    tagline: 'Legal Chamber Workspace & Editorial Legal Intelligence',
    description:
      'Chamber practice management, daily matter overview, case analysis, legal drafting, evidence scoring, and multilingual legal translation for advocates.',
    status: 'available',
    target_audience:
      'Practising advocates, litigation chambers, and legal counsel managing daily matters, drafting, and research.',
    key_capabilities: [
      'Chamber "Today" overview, matter files, and actionable task tracking',
      'Case analysis, evidence scoring, and contradiction detection',
      'Urgent quick notes and voice-to-text dictation mapped to matters',
      'Legal Translation Memory (TM) preserving statutory and numerical identifiers'
    ],
    cta_text: 'View Advocate360',
    division_ref: 'ai-automation-business-systems'
  }
];

export const UNIKORN_PRODUCTS = SEED_PRODUCTS;

// ====================================================================
// 4. COMPREHENSIVE OLD-TO-NEW URL REDIRECTS (Explicit Mapping)
// ====================================================================
export const LEGACY_URL_REDIRECTS: Record<string, string> = {
  // Legacy Division Slugs
  'build': '/services/websites-software',
  'secure': '/services/security-maintenance',
  'grow': '/services/business-setup-documentation',
  'influence': '/services/marketing-creator-campaigns',
  'automate': '/services/ai-automation-business-systems',
  'intelligence': '/services/research-business-strategy',
  'business-support': '/services/business-setup-documentation',
  'consulting-education': '/services/research-business-strategy',

  // Legacy Division Paths
  '/services/build': '/services/websites-software',
  '/services/secure': '/services/security-maintenance',
  '/services/grow': '/services/business-setup-documentation',
  '/services/influence': '/services/marketing-creator-campaigns',
  '/services/automate': '/services/ai-automation-business-systems',
  '/services/intelligence': '/services/research-business-strategy',
  '/services/business-support': '/services/business-setup-documentation',
  '/services/consulting-education': '/services/research-business-strategy',

  // Old Build Services
  'modern-website': '/services/websites-software/website-development',
  'website-development': '/services/websites-software/website-development',
  '/services/build/modern-website': '/services/websites-software/website-development',
  '/services/build/website-development': '/services/websites-software/website-development',
  'ecommerce-stores': '/services/websites-software/ecommerce-development',
  'ecommerce-development': '/services/websites-software/ecommerce-development',
  '/services/build/ecommerce-stores': '/services/websites-software/ecommerce-development',
  'cctv-services-website': '/services/websites-software/website-development',
  '/services/build/cctv-services-website': '/services/websites-software/website-development',
  'quotation-estimation-tools': '/services/websites-software/custom-web-applications',
  '/services/build/quotation-estimation-tools': '/services/websites-software/custom-web-applications',
  'crm-order-tracking': '/services/ai-automation-business-systems/crm-sales-automation',
  '/services/build/crm-order-tracking': '/services/ai-automation-business-systems/crm-sales-automation',
  'inventory-billing-systems': '/services/websites-software/custom-web-applications',
  '/services/build/inventory-billing-systems': '/services/websites-software/custom-web-applications',
  'customer-client-portals': '/services/websites-software/custom-web-applications',
  '/services/build/customer-client-portals': '/services/websites-software/custom-web-applications',
  'internal-staff-portals': '/services/websites-software/custom-web-applications',
  '/services/build/internal-staff-portals': '/services/websites-software/custom-web-applications',

  // Old Secure Services
  'factory-licence': '/services/business-setup-documentation/business-registration-assistance',
  '/services/secure/factory-licence': '/services/business-setup-documentation/business-registration-assistance',
  'tnpcb-approvals': '/services/business-setup-documentation/government-scheme-application-support',
  '/services/secure/tnpcb-approvals': '/services/business-setup-documentation/government-scheme-application-support',
  'fire-noc': '/services/business-setup-documentation/business-registration-assistance',
  '/services/secure/fire-noc': '/services/business-setup-documentation/business-registration-assistance',
  'fssai-licence': '/services/business-setup-documentation/business-registration-assistance',
  '/services/secure/fssai-licence': '/services/business-setup-documentation/business-registration-assistance',
  'trade-licence': '/services/business-setup-documentation/business-registration-assistance',
  '/services/secure/trade-licence': '/services/business-setup-documentation/business-registration-assistance',
  'dsc-token': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/secure/dsc-token': '/services/business-setup-documentation/gst-udyam-assistance',
  'document-digitisation': '/services/ai-automation-business-systems/document-processing-automation',
  '/services/secure/document-digitisation': '/services/ai-automation-business-systems/document-processing-automation',
  'digital-file-room': '/services/security-maintenance/cloud-server-hardening',
  '/services/secure/digital-file-room': '/services/security-maintenance/cloud-server-hardening',

  // Old Grow Services
  'detailed-project-report': '/services/business-setup-documentation/dpr-loan-documentation',
  'dpr-preparation': '/services/business-setup-documentation/dpr-loan-documentation',
  '/services/grow/detailed-project-report': '/services/business-setup-documentation/dpr-loan-documentation',
  'cma-data': '/services/business-setup-documentation/dpr-loan-documentation',
  'cma-data-preparation': '/services/business-setup-documentation/dpr-loan-documentation',
  '/services/grow/cma-data': '/services/business-setup-documentation/dpr-loan-documentation',
  'working-capital': '/services/business-setup-documentation/dpr-loan-documentation',
  'working-capital-assessment': '/services/business-setup-documentation/dpr-loan-documentation',
  'business-loan-support': '/services/business-setup-documentation/dpr-loan-documentation',
  '/services/grow/working-capital': '/services/business-setup-documentation/dpr-loan-documentation',
  'government-subsidy-assistance': '/services/business-setup-documentation/government-scheme-application-support',
  '/services/grow/government-subsidy-assistance': '/services/business-setup-documentation/government-scheme-application-support',
  'pmegp-assistance': '/services/business-setup-documentation/government-scheme-application-support',
  '/services/grow/pmegp-assistance': '/services/business-setup-documentation/government-scheme-application-support',
  'mudra-loan-assistance': '/services/business-setup-documentation/dpr-loan-documentation',
  '/services/grow/mudra-loan-assistance': '/services/business-setup-documentation/dpr-loan-documentation',
  'project-feasibility': '/services/research-business-strategy/business-planning-financial-feasibility',
  'feasibility-study': '/services/research-business-strategy/business-planning-financial-feasibility',
  'project-consulting': '/services/research-business-strategy/business-planning-financial-feasibility',
  '/services/grow/project-feasibility': '/services/research-business-strategy/business-planning-financial-feasibility',
  'statutory-approvals-roadmap': '/services/business-setup-documentation/government-scheme-application-support',
  '/services/grow/statutory-approvals-roadmap': '/services/business-setup-documentation/government-scheme-application-support',

  // Old Influence Services
  'corporate-identity': '/services/marketing-creator-campaigns/social-media-content-management',
  'corporate-branding': '/services/marketing-creator-campaigns/social-media-content-management',
  '/services/influence/corporate-identity': '/services/marketing-creator-campaigns/social-media-content-management',
  'company-profile': '/services/marketing-creator-campaigns/social-media-content-management',
  '/services/influence/company-profile': '/services/marketing-creator-campaigns/social-media-content-management',

  // Old Automate Services
  'systems-automation': '/services/ai-automation-business-systems/business-workflow-automation',
  'business-automation': '/services/ai-automation-business-systems/business-workflow-automation',
  '/services/automate/systems-automation': '/services/ai-automation-business-systems/business-workflow-automation',
  'whatsapp-order-notifications': '/services/ai-automation-business-systems/whatsapp-business-automation',
  '/services/automate/whatsapp-order-notifications': '/services/ai-automation-business-systems/whatsapp-business-automation',
  'document-automation': '/services/ai-automation-business-systems/document-processing-automation',
  '/services/automate/document-automation': '/services/ai-automation-business-systems/document-processing-automation',
  'lead-inquiry-automation': '/services/ai-automation-business-systems/crm-sales-automation',
  '/services/automate/lead-inquiry-automation': '/services/ai-automation-business-systems/crm-sales-automation',
  'business-dashboards': '/services/ai-automation-business-systems/business-dashboards-reporting-systems',
  '/services/automate/business-dashboards': '/services/ai-automation-business-systems/business-dashboards-reporting-systems',

  // Old Intelligence Services
  'custom-dashboards': '/services/ai-automation-business-systems/business-dashboards-reporting-systems',
  '/services/intelligence/custom-dashboards': '/services/ai-automation-business-systems/business-dashboards-reporting-systems',
  'inventory-sales-analytics': '/services/research-business-strategy/business-performance-analysis',
  '/services/intelligence/inventory-sales-analytics': '/services/research-business-strategy/business-performance-analysis',
  'data-pipeline-integration': '/services/websites-software/api-system-integration',
  '/services/intelligence/data-pipeline-integration': '/services/websites-software/api-system-integration',

  // Old Business Support Services
  'gst-registration': '/services/business-setup-documentation/gst-udyam-assistance',
  'new-gst-registration': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/business-support/gst-registration': '/services/business-setup-documentation/gst-udyam-assistance',
  'gst-returns': '/services/business-setup-documentation/gst-udyam-assistance',
  'gst-return-filing': '/services/business-setup-documentation/gst-udyam-assistance',
  'monthly-gst-filing': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/business-support/gst-returns': '/services/business-setup-documentation/gst-udyam-assistance',
  'itc-reconciliation': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/business-support/itc-reconciliation': '/services/business-setup-documentation/gst-udyam-assistance',
  'udyam-registration': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/business-support/udyam-registration': '/services/business-setup-documentation/gst-udyam-assistance',
  'company-incorporation': '/services/business-setup-documentation/business-registration-assistance',
  '/services/business-support/company-incorporation': '/services/business-setup-documentation/business-registration-assistance',
  'roc-compliance': '/services/business-setup-documentation/business-registration-assistance',
  '/services/business-support/roc-compliance': '/services/business-setup-documentation/business-registration-assistance',
  'bookkeeping-mis': '/services/business-setup-documentation/gst-udyam-assistance',
  '/services/business-support/bookkeeping-mis': '/services/business-setup-documentation/gst-udyam-assistance',
  'labour-epf-esi': '/services/business-setup-documentation/business-registration-assistance',
  '/services/business-support/labour-epf-esi': '/services/business-setup-documentation/business-registration-assistance',

  // Old Consulting & Education Services
  'business-structuring': '/services/research-business-strategy/startup-growth-consulting',
  '/services/consulting-education/business-structuring': '/services/research-business-strategy/startup-growth-consulting',
  'standard-operating-procedures': '/services/research-business-strategy/business-performance-analysis',
  '/services/consulting-education/standard-operating-procedures': '/services/research-business-strategy/business-performance-analysis',
  'business-diagnostic-audit': '/services/research-business-strategy/business-performance-analysis',
  'verify-audit': '/services/research-business-strategy/business-performance-analysis',
  '/services/consulting-education/business-diagnostic-audit': '/services/research-business-strategy/business-performance-analysis'
};
