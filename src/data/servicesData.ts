import { ServiceItem, EngagementModel, GovernmentScheme, ExampleSolution } from '../types';

export const BUSINESS_INFO = {
  brand: 'UNIKORN360 BUSINESS INTELLIGENCE',
  shortBrand: 'Unikorn360',
  founder: 'S. Rajkumar',
  phone: '+91 98848 24360',
  phoneRaw: '+919884824360',
  whatsappRaw: '919884824360',
  email: 'contact.unikorn360@gmail.com',
  website: 'https://www.unikorn360.com',
  gstin: '33ANBPR6486P1CJ',
  address: {
    line1: '1st Floor, Shop No. 3, VK Complex',
    line2: 'P.J.N. Road, Kamarajapuram',
    city: 'Vaniyambadi',
    district: 'Tirupathur District',
    state: 'Tamil Nadu',
    pincode: '635751',
    full: '1st Floor, Shop No. 3, VK Complex, P.J.N. Road, Kamarajapuram, Vaniyambadi, Tirupathur District, Tamil Nadu – 635751.'
  }
};

export const CATEGORY_INFO: Record<string, { 
  id: string; 
  title: string; 
  subtitle: string; 
  icon: string; 
  count: number; 
  description: string;
  order: number;
}> = {
  'bi-dashboards': {
    id: 'bi-dashboards',
    title: 'Business Intelligence & Dashboards',
    subtitle: 'Real-time reporting • Executive KPI cockpits • Sales & inventory analytics • Accounting feeds',
    icon: 'BarChart3',
    count: 4,
    description: 'Unify scattered sales, purchase, stock, and bank figures into clear executive cockpits for confident business decisions.',
    order: 1
  },
  'websites-ecommerce': {
    id: 'websites-ecommerce',
    title: 'Websites & E-commerce',
    subtitle: 'B2B industrial websites • E-commerce stores • Product catalogues • Online inquiry systems',
    icon: 'Globe',
    count: 5,
    description: 'Custom, high-speed websites and e-commerce portals engineered to generate inquiries, showcase capabilities, and drive orders.',
    order: 2
  },
  'custom-apps': {
    id: 'custom-apps',
    title: 'Custom Apps & Business Software',
    subtitle: 'Quotation tools • CRM & lead tracking • Billing systems • Internal job portals',
    icon: 'AppWindow',
    count: 5,
    description: 'Software applications tailored to your exact operational workflows, eliminating spreadsheet bottlenecks and double-entry.',
    order: 3
  },
  'ai-automation': {
    id: 'ai-automation',
    title: 'AI & Workflow Automation',
    subtitle: 'Process mapping • WhatsApp & email triggers • Document workflows • Routine task automation',
    icon: 'Cpu',
    count: 4,
    description: 'Connect your tools, automate repetitive tasks, and trigger instant notifications from inquiry to dispatch.',
    order: 4
  },
  'business-operations': {
    id: 'business-operations',
    title: 'Business Operations & Consulting',
    subtitle: 'Operational audits • SOPs • Pricing & cost models • Digital document vaults • Expansion consulting',
    icon: 'Briefcase',
    count: 6,
    description: 'Structured business advisory to streamline processes, protect company archives, and improve operating margins.',
    order: 5
  },
  'finance-compliance': {
    id: 'finance-compliance',
    title: 'Finance, Compliance & Project Support',
    subtitle: 'GST • Udyam • DPR & CMA data • Bank loans • Licences • Subsidies • Factory approvals',
    icon: 'ShieldCheck',
    count: 18,
    description: 'Comprehensive statutory filing, banking loan documentation, regulatory approvals, and government scheme assistance.',
    order: 6
  },
  // Legacy aliases for backward compatibility
  'compliance': {
    id: 'finance-compliance',
    title: 'Finance, Compliance & Project Support',
    subtitle: 'GST • Udyam • DPR & CMA data • Bank loans • Licences • Subsidies • Factory approvals',
    icon: 'ShieldCheck',
    count: 18,
    description: 'Comprehensive statutory filing, banking loan documentation, regulatory approvals, and government scheme assistance.',
    order: 6
  },
  'finance': {
    id: 'finance-compliance',
    title: 'Finance, Compliance & Project Support',
    subtitle: 'GST • Udyam • DPR & CMA data • Bank loans • Licences • Subsidies • Factory approvals',
    icon: 'ShieldCheck',
    count: 18,
    description: 'Comprehensive statutory filing, banking loan documentation, regulatory approvals, and government scheme assistance.',
    order: 6
  },
  'consulting': {
    id: 'business-operations',
    title: 'Business Operations & Consulting',
    subtitle: 'Operational audits • SOPs • Pricing & cost models • Digital document vaults • Expansion consulting',
    icon: 'Briefcase',
    count: 6,
    description: 'Structured business advisory to streamline processes, protect company archives, and improve operating margins.',
    order: 5
  },
  'systems': {
    id: 'ai-automation',
    title: 'AI & Workflow Automation',
    subtitle: 'Process mapping • WhatsApp & email triggers • Document workflows • Routine task automation',
    icon: 'Cpu',
    count: 4,
    description: 'Connect your tools, automate repetitive tasks, and trigger instant notifications from inquiry to dispatch.',
    order: 4
  },
  'branding': {
    id: 'websites-ecommerce',
    title: 'Websites & E-commerce',
    subtitle: 'B2B industrial websites • E-commerce stores • Product catalogues • Online inquiry systems',
    icon: 'Globe',
    count: 5,
    description: 'Custom, high-speed websites and e-commerce portals engineered to generate inquiries, showcase capabilities, and drive orders.',
    order: 2
  },
  'project': {
    id: 'finance-compliance',
    title: 'Finance, Compliance & Project Support',
    subtitle: 'GST • Udyam • DPR & CMA data • Bank loans • Licences • Subsidies • Factory approvals',
    icon: 'ShieldCheck',
    count: 18,
    description: 'Comprehensive statutory filing, banking loan documentation, regulatory approvals, and government scheme assistance.',
    order: 6
  },
  'documentation': {
    id: 'business-operations',
    title: 'Business Operations & Consulting',
    subtitle: 'Operational audits • SOPs • Pricing & cost models • Digital document vaults • Expansion consulting',
    icon: 'Briefcase',
    count: 6,
    description: 'Structured business advisory to streamline processes, protect company archives, and improve operating margins.',
    order: 5
  }
};

export const MAIN_CATEGORY_KEYS = [
  'bi-dashboards',
  'websites-ecommerce',
  'custom-apps',
  'ai-automation',
  'business-operations',
  'finance-compliance'
];

export const ENGAGEMENT_MODELS: EngagementModel[] = [
  {
    id: 'verify',
    name: 'VERIFY',
    tagline: 'Diagnostic Assessment & Technical Discovery',
    subtitle: 'Clear, objective audit of your systems, tools, and operational workflows.',
    description: 'A structured evaluation of your current websites, digital tools, spreadsheets, data visibility, and statutory filings to identify security risks, manual bottlenecks, and priority software opportunities.',
    deliverables: [
      'Comprehensive Technology & Systems Gap Audit',
      'Operational Bottleneck & Spreadsheet Dependency Review',
      'Statutory & Registration Status Assessment',
      'Prioritised Technical Roadmap with itemized scope',
      'Transparent Pre-Scoped Written Quotation'
    ],
    bestFor: 'Proprietors who want clarity on where systems are leaking time, money, or customer inquiries.',
    ctaText: 'Request a Verify Diagnostic',
    badge: 'Diagnostic Assessment',
    accentColor: '#214E78'
  },
  {
    id: 'protect',
    name: 'PROTECT',
    tagline: 'Ongoing Systems, Technology & Compliance Support',
    subtitle: 'Keep your websites, applications, and statutory filings running smoothly.',
    description: 'Continuous retainer support. We maintain your websites and web applications, monitor automated notifications, assist staff with operational software issues, and manage routine statutory filings.',
    deliverables: [
      'Website & Custom Application Maintenance and Uptime Monitoring',
      'Automated Workflow & Notification Health Checks',
      'Monthly GST & Statutory Filings Management (GSTR-1, 3B, ITC-2B)',
      'Regular Security Backups and Digital File Synchronization',
      'Priority Helpdesk for Staff Technical Queries'
    ],
    bestFor: 'Growing enterprises that need reliable day-to-day technology and compliance support without full-time IT hires.',
    ctaText: 'Explore Protect Retainer',
    badge: 'Most Popular',
    accentColor: '#A57C35'
  },
  {
    id: 'guardian',
    name: 'GUARDIAN',
    tagline: 'Managed Operations & Technology Partner',
    subtitle: 'Your dedicated outsourced technology, business intelligence, and back-office team.',
    description: 'The complete enterprise operating partnership. From custom software feature updates and live executive BI dashboards to banking coordination, project reports, and strategic systems advisory.',
    deliverables: [
      'Everything in PROTECT plus active custom app enhancements',
      'Live Cloud Business Intelligence Cockpit management',
      'Active Banking Liaison, DPR updates & Working Capital reviews',
      'Quarterly Management Review & Systems Optimization roadmap',
      'Dedicated Key Account Manager & Direct Technical Lead'
    ],
    bestFor: 'Established manufacturing units, multi-branch trading firms, and expanding enterprises seeking institutional systems.',
    ctaText: 'Discuss Guardian Partnership',
    badge: 'Managed Operations',
    accentColor: '#30363D'
  }
];

export const EXAMPLE_SOLUTIONS: ExampleSolution[] = [
  {
    id: 'cctv-website-portal',
    title: 'CCTV & Security Solutions Business Website',
    category: 'Websites & E-commerce',
    scopeType: 'Custom Development',
    summary: 'A fast, high-converting service business website featuring interactive camera package calculators, AMC service request forms, WhatsApp inquiry triggers, and customer testimonial showcases.',
    keyFeatures: [
      'Interactive security package & camera estimator',
      'Direct WhatsApp inquiry routing with pre-filled models',
      'AMC service booking and warranty verification portal',
      'Mobile-optimized for quick customer contact'
    ],
    idealFor: 'Security contractors, hardware system integrators, and installation businesses.',
    disclaimer: 'Illustrative solution example — designed, scoped, and built to order around your specific products and service pricing.'
  },
  {
    id: 'custom-ecommerce-store',
    title: 'Custom B2B E-Commerce & Ordering Portal',
    category: 'Websites & E-commerce',
    scopeType: 'Custom Development',
    summary: 'A responsive digital store for wholesale or retail operations, featuring tiered dealer pricing, minimum order quantities (MOQ), GST-compliant invoicing, and payment gateway integration.',
    keyFeatures: [
      'Dealer vs retail pricing tiers with authenticated login',
      'Instant order confirmation via WhatsApp & Email',
      'Real-time inventory level synchronization',
      'Automated GST invoice generation on checkout'
    ],
    idealFor: 'Wholesale distributors, manufacturers selling direct, and specialized retail businesses.',
    disclaimer: 'Illustrative solution example — custom software scoped and developed to your catalog and distribution workflow.'
  },
  {
    id: 'quotation-estimation-tool',
    title: 'Dynamic Quotation & Cost Estimation Tool',
    category: 'Custom Apps & Business Software',
    scopeType: 'Custom Development',
    summary: 'Replaces error-prone manual spreadsheets with a web-based quotation builder. Sales reps configure specs, calculate raw material and labor costs, apply margins, and download branded PDFs in seconds.',
    keyFeatures: [
      'Granular formula-based cost calculation & margin safeguards',
      'Instant professional PDF generation with terms and bank details',
      'Revision tracking and quote expiry notifications',
      'Sales team permission controls and discount thresholds'
    ],
    idealFor: 'Custom fabrication, engineering workshops, printing, and made-to-order manufacturing.',
    disclaimer: 'Illustrative solution example — customized to your bill of materials (BOM), margin rules, and quotation layout.'
  },
  {
    id: 'lightweight-crm-pipeline',
    title: 'Lightweight CRM & Inquiry Tracking System',
    category: 'Custom Apps & Business Software',
    scopeType: 'Custom Development',
    summary: 'A clean, mobile-accessible pipeline that captures inquiries from your website, WhatsApp, phone, and IndiaMART. Tracks every deal from initial inquiry to quotation, sample approval, and dispatch.',
    keyFeatures: [
      'Multi-channel inquiry aggregation in one clean dashboard',
      'Visual deal stages (Inquiry → Sample → Quote → Won → Shipped)',
      'Automated follow-up reminders so no prospect goes cold',
      'Sales rep activity logs and conversion analytics'
    ],
    idealFor: 'B2B suppliers, industrial component exporters, and growing sales teams.',
    disclaimer: 'Illustrative solution example — scoped and built to your sales pipeline without complex enterprise software bloat.'
  },
  {
    id: 'inventory-billing-system',
    title: 'Inventory & Multi-Location Billing Software',
    category: 'Custom Apps & Business Software',
    scopeType: 'Custom Development',
    summary: 'A straightforward web-based billing and inventory management tool that handles stock across godowns, barcode scanning, fast invoice generation, and pending payment tracking.',
    keyFeatures: [
      'Real-time stock tracking across godowns and showrooms',
      'Fast 15-second counter billing with keyboard shortcuts',
      'Customer outstanding ledger with WhatsApp payment reminder links',
      'Low-stock threshold alerts sent directly to owners'
    ],
    idealFor: 'Hardware merchants, building material distributors, and multi-godown traders.',
    disclaimer: 'Illustrative solution example — developed specifically around your item categorisation, godowns, and billing speed.'
  },
  {
    id: 'customer-vendor-portal',
    title: 'Customer & Vendor Self-Service Portal',
    category: 'Custom Apps & Business Software',
    scopeType: 'Custom Development',
    summary: 'A secure cloud portal where key clients can log in to check order dispatch status, download past GST tax invoices, review statement of accounts, and submit support tickets.',
    keyFeatures: [
      'Self-service invoice & ledger statement downloads',
      'Live order dispatch & transporter tracking links',
      'Repeat order submission with one-click re-ordering',
      'Secure passwordless OTP login for clients'
    ],
    idealFor: 'Distributors, contract manufacturers, and long-term B2B supply agreements.',
    disclaimer: 'Illustrative solution example — engineered to integrate with your existing operational database or accounting records.'
  },
  {
    id: 'executive-bi-dashboard',
    title: 'Real-Time Executive BI Reporting Cockpit',
    category: 'Business Intelligence & Dashboards',
    scopeType: 'Integrated Systems',
    summary: 'Consolidates data from your accounting software, production records, and bank accounts into a single visual dashboard. View sales trends, gross margins, overdue debtors, and cash flow on your phone.',
    keyFeatures: [
      'Automated daily data sync from accounting software and spreadsheets',
      'Visual KPIs: Daily Revenue, Aged Debtors (>60/90 days), Cash in Bank',
      'Product and customer profitability ranking',
      'Automated daily morning digest sent via WhatsApp'
    ],
    idealFor: 'Business owners and managing directors who need numbers without asking the accountant.',
    disclaimer: 'Illustrative solution example — built with custom data connectors mapped to your exact chart of accounts.'
  },
  {
    id: 'document-workflow-vault',
    title: 'Automated Document Vault & Expiry Workflow',
    category: 'AI & Workflow Automation',
    scopeType: 'Consulting & Setup',
    summary: 'A centralized digital repository for all statutory licences, agreements, property deeds, and vehicle insurance. Automated bots notify directors 60, 30, and 15 days before any statutory permit expires.',
    keyFeatures: [
      'Searchable indexed cloud vault with permission controls',
      'Automated WhatsApp and email expiry alerts for licences & policies',
      'Instant retrieval of certificates during audits and inspections',
      'Audit log tracking who accessed or shared critical documents'
    ],
    idealFor: 'Factories, logistics operators, and enterprises with multiple statutory licences.',
    disclaimer: 'Illustrative solution example — structured, organized, and deployed according to your organizational structure.'
  }
];

export const BUSINESS_PROBLEMS_SOLVED = [
  {
    problem: 'Spreadsheets out of control and data scattered across WhatsApp',
    impact: 'Orders get missed, prices are misquoted, and staff duplicate data entry across notebooks, Excel files, and personal phone chats.',
    solution: 'We build unified web tools and automated notification pipelines so every inquiry, order, and dispatch is tracked centrally in one place.'
  },
  {
    problem: 'Outdated or non-existent web presence costing you B2B deals',
    impact: 'High-value corporate clients and export buyers search your brand online, find nothing or an outdated page, and award the contract to competitors.',
    solution: 'We design modern, mobile-responsive websites that showcase your plant capacity, machinery specs, certifications, and direct inquiry channels.'
  },
  {
    problem: 'Manual quotation bottlenecks delaying customer deals',
    impact: 'Proprietors spend 2 to 3 days calculating raw material costs, labor, and margin formulas manually, causing prospective buyers to look elsewhere.',
    solution: 'We build custom quotation tools with preset cost formulas so your sales staff can generate accurate, branded PDF estimates in 60 seconds.'
  },
  {
    problem: 'No real-time visibility into monthly cash profit and aged receivables',
    impact: 'Revenue looks strong on paper, but cash is perpetually trapped in overdue debtors, excess stock, or unbilled dispatches.',
    solution: 'We configure executive BI dashboards that connect your sales and billing feeds, showing debtor aging, gross margins, and cash positions at a glance.'
  },
  {
    problem: 'Repetitive daily tasks consuming valuable managerial hours',
    impact: 'Management spends hours copying invoice numbers into WhatsApp, chasing payment updates, and sending dispatch tracking numbers manually.',
    solution: 'We implement automated workflow triggers that automatically dispatch SMS/WhatsApp alerts upon invoice generation or courier pickup.'
  },
  {
    problem: 'Statutory compliance friction, bank loan bottlenecks, and licensing delays',
    impact: 'Unfiled returns trigger GST blocks, bank loan files stall without bankable DPRs, and new factory expansions get delayed by regulatory red tape.',
    solution: 'Our dedicated Finance & Compliance desk handles DPR preparation, CMA data, Udyam MSME classification, and statutory licensing with pre-scoped clarity.'
  }
];

export const SERVICES_LIST: ServiceItem[] = [
  // ==========================================
  // 1. BUSINESS INTELLIGENCE & DASHBOARDS
  // ==========================================
  {
    id: 'custom-dashboards',
    category: 'bi-dashboards',
    title: 'Real-Time Business Dashboards & Executive Cockpits',
    subtitle: 'Know your sales, stock, receivables, and operational health in one glance.',
    tagline: 'Consolidate multiple spreadsheets and accounting feeds into a single visual screen',
    description: 'We design and deploy custom executive dashboards accessible on mobile or desktop that pull data from your accounting software, production records, and bank feeds. Monitor daily collections, overdue receivables, and gross margins without manual report generation.',
    scopeList: [
      'Key Metric (KPI) definition tailored to business promoter needs',
      'Automated data ingestion from accounting software, Google Sheets & Excel',
      'Visual cards for Cash, Receivables, Overdue Debtors, Production Output',
      'Role-based access control for owners, partners, and managers',
      'Daily/weekly automated summary digest sent via WhatsApp or Email'
    ],
    deliverables: ['Live Cloud Dashboard Access', 'Automated Executive Digest Setup', 'Documentation & User Guide'],
    typicalTimeline: '10 – 20 business days',
    targetAudience: ['Business Promoters', 'Managing Partners', 'Enterprises with multiple branches/godowns'],
    serviceType: 'custom-development',
    relatedServices: ['inventory-sales-analytics', 'systems-automation', 'bookkeeping-mis'],
    isPopular: true
  },
  {
    id: 'inventory-sales-analytics',
    category: 'bi-dashboards',
    title: 'Inventory & Sales Analytics Systems',
    subtitle: 'Track fast-moving goods, dead stock, customer purchase cycles, and margins.',
    description: 'Custom analytics models that analyze your sales invoices and purchase registers to identify high-margin clients, slow-moving items tied up in working capital, and seasonal purchasing trends.',
    scopeList: [
      'Historical sales and inventory data cleaning and structuring',
      'Fast-moving vs Dead-stock categorization and holding cost review',
      'Customer profitability and order frequency analysis',
      'Automated replenishment threshold indicators'
    ],
    deliverables: ['Custom Analytics Dashboard', 'Monthly Stock Hygiene Report', 'Margin Optimization Matrix'],
    typicalTimeline: '14 – 25 business days',
    targetAudience: ['Wholesale Distributors', 'Component Manufacturers', 'Retail Chains'],
    serviceType: 'custom-development',
    relatedServices: ['custom-dashboards', 'inventory-billing-systems']
  },
  {
    id: 'bookkeeping-mis',
    category: 'bi-dashboards',
    title: 'Monthly Bookkeeping & Executive MIS Reporting',
    subtitle: 'Structured financial visibility instead of waiting for year-end tax audits.',
    description: 'Transform raw bank statements, purchase vouchers, and sales registers into structured accounting, monthly P&L, balance sheets, and debtor ageing dashboards.',
    scopeList: [
      'Accounting ledger entry and transaction tagging',
      'Monthly bank and supplier reconciliations',
      'Debtor ageing analysis (0-30, 31-60, 61-90, 90+ days)',
      'Monthly Executive MIS pack for the promoter'
    ],
    deliverables: ['Monthly MIS Report Pack', 'Reconciled Trial Balance & Ledgers'],
    typicalTimeline: 'Monthly continuous retainer',
    targetAudience: ['Proprietors who want clarity on real profit and trapped receivables'],
    serviceType: 'consulting',
    relatedServices: ['custom-dashboards', 'gst-returns', 'cma-data']
  },
  {
    id: 'data-pipeline-integration',
    category: 'bi-dashboards',
    title: 'Data Pipeline & Accounting Software Integration',
    subtitle: 'Bridge the gap between accounting software, cloud databases, and reporting tools.',
    description: 'We construct secure, automated data extraction pipelines from your local accounting systems into cloud databases for real-time reporting without manual data export and re-typing.',
    scopeList: [
      'Local database connectivity and extraction script setup',
      'Data transformation, deduplication, and schema mapping',
      'Automated scheduled sync to secure cloud database',
      'Error handling and alert logging'
    ],
    deliverables: ['Configured Data Pipeline', 'Secure Cloud Database Setup', 'System Documentation'],
    typicalTimeline: '7 – 15 business days',
    targetAudience: ['Growing businesses with fragmented software systems'],
    serviceType: 'custom-development',
    relatedServices: ['custom-dashboards', 'systems-automation']
  },

  // ==========================================
  // 2. WEBSITES & E-COMMERCE
  // ==========================================
  {
    id: 'modern-website',
    category: 'websites-ecommerce',
    title: 'High-Conversion B2B Industrial Website',
    subtitle: 'A high-performance digital presence that proves capability to domestic and overseas buyers.',
    tagline: 'Built specifically for manufacturers, exporters, and technical B2B suppliers',
    description: 'Clean, fast, mobile-first website showcasing your products, factory machinery, testing certifications, and direct inquiry channels. Built with lightweight modern code for rapid loading and search engine visibility.',
    scopeList: [
      'Mobile-responsive layout engineered for industrial showcases',
      'Product catalogue showcase with direct inquiry buttons',
      'Plant capacity, machinery list, and quality infrastructure pages',
      'Google Maps, WhatsApp chat, and inquiry form integration',
      'Search engine optimization (SEO) for your industry keywords'
    ],
    deliverables: ['Live Deployed Website', 'Domain & SSL Setup', 'Admin Content Access', 'Mobile Responsive Views'],
    typicalTimeline: '14 – 25 business days',
    targetAudience: ['Manufacturers', 'Exporters', 'Industrial Service Providers without a modern web presence'],
    serviceType: 'custom-development',
    relatedServices: ['ecommerce-stores', 'corporate-identity', 'crm-order-tracking'],
    isPopular: true
  },
  {
    id: 'ecommerce-stores',
    category: 'websites-ecommerce',
    title: 'Custom E-Commerce Stores & B2B Ordering Catalogues',
    subtitle: 'Sell products online with customized B2B dealer pricing or retail payment gateways.',
    description: 'Full-featured web stores configured around how you trade. Includes category browsing, bulk ordering tables, minimum order quantities (MOQ), payment gateway integration, and GST invoicing.',
    scopeList: [
      'Product catalog architecture with variants, specs, and stock indicators',
      'Shopping cart with wholesale or retail checkout workflows',
      'Payment gateway integration (UPI, Netbanking, Cards)',
      'Customer login portal and order history lookup',
      'Automated email and WhatsApp order confirmations'
    ],
    deliverables: ['Deployed E-Commerce Website', 'Payment Gateway Integration', 'Product Management Training'],
    typicalTimeline: '20 – 35 business days',
    targetAudience: ['Distributors', 'D2C Brands', 'Wholesalers expanding into direct customer orders'],
    serviceType: 'custom-development',
    relatedServices: ['modern-website', 'inventory-billing-systems']
  },
  {
    id: 'cctv-services-website',
    category: 'websites-ecommerce',
    title: 'Service Business & Technical Contractor Websites',
    subtitle: 'Purpose-built websites for CCTV installers, HVAC contractors, and technical firms.',
    description: 'Tailored lead-generation websites featuring interactive project cost estimators, AMC service booking forms, technician dispatch requests, and customer trust signals.',
    scopeList: [
      'Service package comparison and instant quotation estimator',
      'Emergency service and maintenance booking forms',
      'Case study and past installation portfolio showcases',
      'Click-to-call and WhatsApp inquiry routing'
    ],
    deliverables: ['Custom Service Website', 'Lead Notification Setup', 'SEO Configuration'],
    typicalTimeline: '10 – 18 business days',
    targetAudience: ['CCTV & Security Contractors', 'HVAC & Solar Installers', 'Equipment Service Businesses'],
    serviceType: 'custom-development',
    relatedServices: ['modern-website', 'quotation-estimation-tools']
  },
  {
    id: 'corporate-identity',
    category: 'websites-ecommerce',
    title: 'Institutional Corporate Identity & Brand Mark',
    subtitle: 'Build the visual gravitas that commands buyer trust and banking credibility.',
    description: 'Corporate brand design including vector logo, typography system, business cards, letterheads, invoice templates, and digital presentation assets.',
    scopeList: [
      'Distinct concept directions grounded in industrial positioning',
      'Refined logo suite (Dark, Light, Monochrome, Favicon)',
      'Stationery system (Visiting card, Letterhead, Envelope, Invoice template)',
      'Brand Identity Guidebook (PDF)'
    ],
    deliverables: ['Master Vector File Pack (AI, EPS, SVG, PNG)', 'Print-Ready Stationery PDF', 'Brand Style Guide'],
    typicalTimeline: '7 – 12 business days',
    targetAudience: ['New Companies', 'Generational businesses modernising their market face'],
    serviceType: 'custom-development',
    relatedServices: ['modern-website', 'company-profile']
  },
  {
    id: 'company-profile',
    category: 'websites-ecommerce',
    title: 'Executive Company Profile & Capability Brochure',
    subtitle: 'The document your team sends to institutional buyers, banks, and export clients.',
    description: 'Professionally written and designed corporate profile detailing company history, machinery specifications, testing certifications, client list, and production capacities.',
    scopeList: [
      'Content interview and professional copywriting',
      'Factory photo curation and layout styling',
      'Infographic presentation of production capacity & quality labs',
      'Interactive PDF version with clickable contact links'
    ],
    deliverables: ['High-Resolution Print PDF (8-16 pages)', 'Lightweight WhatsApp-shareable PDF'],
    typicalTimeline: '10 – 15 business days',
    targetAudience: ['Manufacturing Units bidding for institutional contracts or exports'],
    serviceType: 'custom-development',
    relatedServices: ['corporate-identity', 'modern-website']
  },

  // ==========================================
  // 3. CUSTOM APPS & BUSINESS SOFTWARE
  // ==========================================
  {
    id: 'quotation-estimation-tools',
    category: 'custom-apps',
    title: 'Custom Quotation & Cost Estimation Tools',
    subtitle: 'Replace messy spreadsheets with accurate, formula-driven quote generators.',
    tagline: 'Generate branded, itemized PDF estimates in 60 seconds with protected margins',
    description: 'A custom web application built specifically for your pricing formulas. Sales reps select products or specifications, input dimensions or raw material quantities, and the tool calculates unit cost, margin, taxes, and outputs a customer-ready PDF quotation.',
    scopeList: [
      'Scrutiny of existing Excel pricing sheets and margin formulas',
      'Web-based calculator development with input validation',
      'Branded PDF generator with terms of supply, GST, and bank details',
      'User permission controls (prevent unapproved discounts)',
      'Quotation log and status tracking (Draft, Sent, Approved, Expired)'
    ],
    deliverables: ['Web Application Deployment', 'Admin Control Panel', 'Quotation History Database'],
    typicalTimeline: '14 – 25 business days',
    targetAudience: ['Custom Manufacturers', 'Fabrication & Engineering Shops', 'Printers & Packaging Units'],
    serviceType: 'custom-development',
    relatedServices: ['crm-order-tracking', 'custom-dashboards'],
    isPopular: true
  },
  {
    id: 'crm-order-tracking',
    category: 'custom-apps',
    title: 'Lightweight CRM & Sales Pipeline Software',
    subtitle: 'Never lose track of an inquiry or let a high-value quotation go cold.',
    description: 'Simple, frictionless sales pipeline software tailored for Indian MSMEs without the bloat or cost of complex enterprise platforms. Capture leads from phone, WhatsApp, and web, assign them to sales staff, and track deals to closure.',
    scopeList: [
      'Inquiry capture from website forms, WhatsApp, phone, and lead aggregators',
      'Pipeline stages: Inquiry → Sample Sent → Quotation → Won / Lost',
      'Automated follow-up reminders for sales reps and management',
      'Customer interaction notes and call logs',
      'Monthly sales conversion report'
    ],
    deliverables: ['Configured Mobile-Friendly Web App', 'User Accounts Setup', 'Staff Training Session'],
    typicalTimeline: '10 – 20 business days',
    targetAudience: ['B2B Suppliers', 'Industrial Exporters', 'Service Businesses with 3+ sales reps'],
    serviceType: 'custom-development',
    relatedServices: ['quotation-estimation-tools', 'systems-automation']
  },
  {
    id: 'inventory-billing-systems',
    category: 'custom-apps',
    title: 'Custom Inventory, Invoicing & Billing Software',
    subtitle: 'Fast, straightforward billing and multi-godown stock management.',
    description: 'Custom billing software built around your exact trade requirements. Handles batch numbers, item variations, barcode scanning, fast invoice generation, and customer payment tracking.',
    scopeList: [
      'Multi-godown stock ledger with inward and dispatch logs',
      'Fast counter billing with GST calculation and print formatting',
      'Customer outstanding ledger with payment recording',
      'Low stock warning triggers and reorder lists'
    ],
    deliverables: ['Custom Billing Application', 'Database Setup', 'Hardware Printer Integration Guidance'],
    typicalTimeline: '20 – 35 business days',
    targetAudience: ['Hardware Merchants', 'Wholesale Distributors', 'Multi-Branch Traders'],
    serviceType: 'custom-development',
    relatedServices: ['inventory-sales-analytics', 'custom-dashboards']
  },
  {
    id: 'customer-client-portals',
    category: 'custom-apps',
    title: 'Customer & Vendor Self-Service Portals',
    subtitle: 'Give high-value clients secure 24/7 access to invoices, ledger statements, and dispatch status.',
    description: 'A dedicated web portal where your regular B2B customers or suppliers can log in to check dispatch tracking numbers, download tax invoices, view credit statements, and submit new purchase orders.',
    scopeList: [
      'Secure customer authentication and password management',
      'Past invoice search and PDF download repository',
      'Statement of account (ledger) view with running balances',
      'Order dispatch status tracking with transporter details'
    ],
    deliverables: ['Deployed Customer Portal', 'Database Integration', 'Security Configuration'],
    typicalTimeline: '15 – 30 business days',
    targetAudience: ['Distributors', 'Contract Manufacturers with recurring institutional buyers'],
    serviceType: 'custom-development',
    relatedServices: ['crm-order-tracking', 'modern-website']
  },
  {
    id: 'internal-staff-portals',
    category: 'custom-apps',
    title: 'Internal Operations & Job Card Tracking Apps',
    subtitle: 'Track production job cards and staff assignments across factory stages.',
    description: 'A practical internal web app for production supervisors and department heads. Track raw material issuance, stages of production (cutting, stitching, finishing, packing), and identify work-in-progress bottlenecks.',
    scopeList: [
      'Job card generation with unique barcode/reference tracking',
      'Production stage status updates via tablet or smartphone',
      'Worker output and machine downtime logs',
      'End-of-day production summary report for owners'
    ],
    deliverables: ['Operational Job Card System', 'Staff Training', 'Cloud Database Setup'],
    typicalTimeline: '15 – 30 business days',
    targetAudience: ['Manufacturing Units', 'Leather & Footwear Factories', 'Job-work Engineering Units'],
    serviceType: 'custom-development',
    relatedServices: ['systems-automation', 'custom-dashboards']
  },

  // ==========================================
  // 4. AI & WORKFLOW AUTOMATION
  // ==========================================
  {
    id: 'systems-automation',
    category: 'ai-automation',
    title: 'Process Mapping & End-to-End Workflow Automation',
    subtitle: 'Eliminate duplicate paperwork, manual WhatsApp follow-ups, and spreadsheet chaos.',
    tagline: 'Turn repetitive human tasks into reliable, automated digital pipelines',
    description: 'We audit your daily operations, map key information flows from customer inquiry through quotation, production, dispatch, and billing, and deploy automated notifications, task assignments, and status alerts.',
    scopeList: [
      'On-ground study of daily staff communication & bottleneck analysis',
      'Automated WhatsApp / Email notification triggers for order stages',
      'Elimination of double-entry between factory floor and accounts',
      'Integration between forms, spreadsheets, and cloud databases',
      'Standard Operating Procedure (SOP) blueprints'
    ],
    deliverables: ['Custom Workflow Automation System', 'Documented Process Map', 'Staff Training Session'],
    typicalTimeline: '14 – 30 business days',
    targetAudience: ['Manufacturing Units', 'Trading Hubs with 5+ office staff'],
    serviceType: 'custom-development',
    relatedServices: ['custom-dashboards', 'quotation-estimation-tools'],
    isPopular: true
  },
  {
    id: 'whatsapp-order-notifications',
    category: 'ai-automation',
    title: 'Automated WhatsApp & Email Notification Pipelines',
    subtitle: 'Keep customers and dispatch teams automatically informed at every milestone.',
    description: 'Connect your billing software or website directly to official WhatsApp business APIs. Automatically send order confirmation, payment receipts, dispatch airway bill (LR) numbers, and delivery alerts.',
    scopeList: [
      'WhatsApp Business API account and template approval setup',
      'Webhook connection to your invoicing or billing software',
      'Automated triggers for: Order Placed, Payment Received, Dispatched, Delivery Confirmed',
      'Customer query auto-reply and routing rules'
    ],
    deliverables: ['Active API Integration', 'Approved WhatsApp Message Templates', 'Webhook Setup'],
    typicalTimeline: '7 – 14 business days',
    targetAudience: ['E-Commerce Stores', 'Wholesalers with active customer dispatch communication'],
    serviceType: 'custom-development',
    relatedServices: ['systems-automation', 'modern-website']
  },
  {
    id: 'document-automation',
    category: 'ai-automation',
    title: 'Document & Invoice Data Extraction (OCR)',
    subtitle: 'Extract data from supplier invoices, purchase orders, and physical receipts automatically.',
    description: 'Automate invoice data entry using optical character recognition (OCR) and intelligent parsing. Read incoming vendor bills or purchase orders and convert them into structured accounting entries without manual typing.',
    scopeList: [
      'Document parsing model setup for vendor invoice formats',
      'Extraction of GSTIN, Invoice Number, Date, Line Items, and Total Amounts',
      'Validation against purchase order records',
      'Structured export to Excel, CSV, or accounting software'
    ],
    deliverables: ['Configured Document Parser', 'Integration Script', 'Accuracy Validation Audit'],
    typicalTimeline: '12 – 25 business days',
    targetAudience: ['Accounts Departments handling 100+ vendor bills monthly'],
    serviceType: 'custom-development',
    relatedServices: ['systems-automation', 'document-digitisation']
  },
  {
    id: 'lead-inquiry-automation',
    category: 'ai-automation',
    title: 'Omnichannel Inquiry Capture & Auto-Routing',
    subtitle: 'Capture leads from websites, WhatsApp, and portals into a single organized queue.',
    description: 'Connect all your lead channels into an automated intake pipeline. Leads are instantly acknowledged, logged into your CRM, and assigned to the right sales executive with WhatsApp alerts.',
    scopeList: [
      'Inquiry webhooks from website forms, WhatsApp, and advertising platforms',
      'Instant automated customer acknowledgement message',
      'Round-robin or territory-based lead assignment to sales team',
      'Notification triggers sent to executive phones'
    ],
    deliverables: ['Automated Intake Pipeline', 'Staff Notification Rules', 'Testing & Verification'],
    typicalTimeline: '5 – 10 business days',
    targetAudience: ['Fast-response sales teams', 'Industrial suppliers with high inquiry volume'],
    serviceType: 'custom-development',
    relatedServices: ['crm-order-tracking', 'systems-automation']
  },

  // ==========================================
  // 5. BUSINESS OPERATIONS & CONSULTING
  // ==========================================
  {
    id: 'business-structuring',
    category: 'business-operations',
    title: 'Business Structuring, Cost Economics & Margins',
    subtitle: 'Rethink overhead, unit economics, and vendor contracts for sustainable cash profit.',
    description: 'We scrutinize your unit cost economics, overhead allocation, payment terms, and vendor agreements to eliminate hidden operational losses and improve working capital cycles.',
    scopeList: [
      'Direct vs Indirect Cost dissection across product lines',
      'Break-even volume and margin contribution analysis',
      'Customer payment terms and cash-conversion cycle review',
      'Partnership deed revision & profit-sharing restructuring'
    ],
    deliverables: ['Operational Costing Model', 'Pricing Matrix Sheet', 'Restructured Agreement Drafts'],
    typicalTimeline: '10 – 20 business days',
    targetAudience: ['Factories with high revenue but tight cash reserves', 'Multi-partner firms'],
    serviceType: 'consulting',
    relatedServices: ['standard-operating-procedures', 'detailed-project-report']
  },
  {
    id: 'standard-operating-procedures',
    category: 'business-operations',
    title: 'Standard Operating Procedures (SOPs) & Process Maps',
    subtitle: 'Document your core workflows so operations run reliably without owner micromanagement.',
    description: 'We interview staff, observe shop-floor and office routines, and translate scattered institutional knowledge into written, step-by-step SOPs with clear ownership and checklists.',
    scopeList: [
      'Process discovery sessions with key managers and supervisors',
      'Step-by-step documentation of Procurement, Production, Quality, and Dispatch',
      'Staff accountability checklists and handover protocols',
      'Digital SOP repository accessible on mobile devices'
    ],
    deliverables: ['Complete Enterprise SOP Manual (PDF & Web)', 'Operational Checklists', 'Staff Orientation Session'],
    typicalTimeline: '15 – 30 business days',
    targetAudience: ['Growing family businesses transitioning to professional management'],
    serviceType: 'consulting',
    relatedServices: ['systems-automation', 'business-structuring']
  },
  {
    id: 'document-digitisation',
    category: 'business-operations',
    title: 'Enterprise Document Digitisation & Indexed Archival',
    subtitle: 'Never lose a title deed, licence renewal, or subsidy order in dusty office files.',
    tagline: 'Turn scattered filing cabinets into a searchable 10-second digital file room',
    description: 'On-site or managed scanning, high-resolution processing, optical character recognition (OCR), and structured metadata tagging for all enterprise documents.',
    scopeList: [
      'Sorting and physical classification of business archives',
      'High-speed scanning with OCR text-searchability',
      'Standardized naming conventions (Entity_Type_Date_Subject)',
      'Folder structure designed around Statutory, Banking, HR, and Real Estate'
    ],
    deliverables: ['Encrypted Master Cloud Archive', 'Offline Backup Storage Drive', 'Index Master Sheet'],
    typicalTimeline: '7 – 20 business days',
    targetAudience: ['Multi-generation family businesses', 'Factories with years of physical records'],
    serviceType: 'consulting',
    relatedServices: ['digital-file-room', 'dsc-token']
  },
  {
    id: 'digital-file-room',
    category: 'business-operations',
    title: 'Digital File Room & Licence Expiry Tracker',
    subtitle: 'A secure cloud vault that notifies you 60 days before any statutory permit expires.',
    description: 'We deploy a private, encrypted digital document vault for your directors and key managers, with built-in automated expiry date alerts for all statutory permits and insurance policies.',
    scopeList: [
      'Private cloud vault configuration with multi-factor authentication',
      'Metadata tagging with licence validity dates',
      'Automated WhatsApp/Email alerts at 90, 60, and 30 days before renewal dates',
      'Instant search by keyword (e.g., "Fire NOC 2025")'
    ],
    deliverables: ['Configured Cloud Vault System', 'Active Expiry Alert Automation'],
    typicalTimeline: '5 – 10 business days',
    targetAudience: ['Managing Partners and Directors'],
    serviceType: 'consulting',
    relatedServices: ['document-digitisation', 'factory-licence']
  },
  {
    id: 'project-feasibility',
    category: 'business-operations',
    title: 'Industrial Feasibility Study & Expansion Roadmap',
    subtitle: 'Validate your expansion or new unit before committing capital to land and machinery.',
    tagline: 'De-risk capital investments through ground-truth financial and technical vetting',
    description: 'Rigorous assessment of market demand, raw material supply lines, statutory zoning, power requirements, and capital recovery cycles.',
    scopeList: [
      'Market demand and catchment area assessment',
      'Statutory site zoning check (SIPCOT / SIDCO / Non-plan Panchayats)',
      'Power load sanction feasibility (TANGEDCO / HT / LT)',
      'Estimated project capital cost vs revenue sensitivity'
    ],
    deliverables: ['Comprehensive Feasibility Report', 'Go/No-Go Decision Matrix'],
    typicalTimeline: '14 – 25 business days',
    targetAudience: ['Promoters planning new factories', 'Business owners expanding into new product lines'],
    serviceType: 'consulting',
    relatedServices: ['detailed-project-report', 'statutory-approvals-roadmap']
  },
  {
    id: 'statutory-approvals-roadmap',
    category: 'business-operations',
    title: 'Statutory Approvals Roadmap & Single Window Advisory',
    subtitle: 'Navigate the complete labyrinth of state, municipal, and pollution approvals without delays.',
    description: 'We map out every single approval needed from land purchase to factory inauguration, sequencing submissions so licenses don’t bottleneck machinery installation.',
    scopeList: [
      'Identification of all required departmental approvals (DTCP, Fire, TNPCB, DISH, Local Body)',
      'Sequencing timeline to ensure parallel processing',
      'Guidance on Tamil Nadu Single Window Portal (Biz Buddy / TN SWP)',
      'Documentation checklists for pending departmental files'
    ],
    deliverables: ['Clearance Sequencing Timeline', 'Department Liaison Dossier'],
    typicalTimeline: '7 – 14 business days',
    targetAudience: ['Industrialists setting up new plants or modernising existing units'],
    serviceType: 'consulting',
    relatedServices: ['project-feasibility', 'tnpcb-approvals', 'factory-licence']
  },

  // ==========================================
  // 6. FINANCE, COMPLIANCE & PROJECT SUPPORT
  // ==========================================
  {
    id: 'gst-registration',
    category: 'finance-compliance',
    title: 'GST Registration for MSMEs',
    subtitle: 'Flawless tax identity setup with verified HSN/SAC code mapping and jurisdiction selection.',
    tagline: 'Mandatory statutory tax identity for trade and inter-state supplies',
    description: 'Complete GST registration documentation, application drafting, Aadhaar authentication follow-up, and prompt reply to departmental clarification notices.',
    scopeList: [
      'Document collection and verification (Premises proof, PAN, Aadhaar)',
      'Application drafting & HSN/SAC classification',
      'Filing on GST Common Portal with Aadhaar authentication',
      'Clarification replies & query resolution with tax officer',
      'Department follow-up until certificate grant'
    ],
    deliverables: ['GSTIN (GST Identification Number)', 'Official Registration Certificate (Form GST REG-06)'],
    typicalTimeline: '3 – 7 business days',
    targetAudience: ['Manufacturers', 'Wholesalers & Traders', 'Service Providers', 'New Entities'],
    serviceType: 'consulting',
    relatedServices: ['gst-returns', 'itc-reconciliation', 'udyam-registration'],
    isPopular: true
  },
  {
    id: 'gst-returns',
    category: 'finance-compliance',
    title: 'GST Monthly & Quarterly Returns Filing',
    subtitle: 'Accurate GSTR-1 and GSTR-3B filings with strict input tax credit reconciliation.',
    description: 'Timely collation of outward sales invoices, credit notes, purchase registers, and input tax credit reconciliations to prevent statutory interest and late fee exposure.',
    scopeList: [
      'Outward supply validation (GSTR-1)',
      'Input Tax Credit reconciliation against GSTR-2B',
      'Tax computation and offset in GSTR-3B',
      'Generation of PMT-06 challans and payment coordination'
    ],
    deliverables: ['Filed Return Acknowledgements', 'Monthly ITC Summary Report', 'Challan receipts'],
    typicalTimeline: 'Monthly cycle (before 11th & 20th)',
    targetAudience: ['Regular GST Registered Taxpayers', 'Quarterly QRMP Taxpayers'],
    serviceType: 'consulting',
    relatedServices: ['itc-reconciliation', 'bookkeeping-mis']
  },
  {
    id: 'itc-reconciliation',
    category: 'finance-compliance',
    title: 'Input Tax Credit (ITC) Reconciliation & Audit',
    subtitle: 'Identify vendor defaults, reclaim blocked credits, and prevent DRC-01B notices.',
    description: 'Deep audit comparing purchase registers against official GSTR-2B portal data, identifying supplier non-compliance and reclaiming blocked credits.',
    scopeList: [
      'Automated invoice-level matching (Books vs GSTR-2B)',
      'Categorisation of eligible, ineligible, and timing mismatches',
      'Vendor default report for debit note recovery',
      'Quarterly reconciliation statement'
    ],
    deliverables: ['Unclaimed ITC Recovery Report', 'Vendor Follow-Up Notice Templates', 'Rule 37 Reversal Statement'],
    typicalTimeline: '3 – 5 business days per audit',
    targetAudience: ['Manufacturing Units with heavy raw material procurement', 'High-volume Trading firms'],
    serviceType: 'consulting',
    relatedServices: ['gst-returns', 'bookkeeping-mis']
  },
  {
    id: 'udyam-registration',
    category: 'finance-compliance',
    title: 'Udyam MSME Registration & Priority Status',
    subtitle: 'Unlock government priority lending, interest concessions, and MSME protection.',
    tagline: 'The master gateway for all MSME central and state benefits',
    description: 'Formal classification of your enterprise into Micro, Small, or Medium with Aadhaar, PAN and GST linkages. Note: Eligibility benefits depend on applicable ministry guidelines.',
    scopeList: [
      'Turnover and investment valuation under revised MSME guidelines',
      'NIC code selection matching actual plant/trading activities',
      'Portal submission and verification',
      'Linking with MSME Samadhaan & GeM portal access'
    ],
    deliverables: ['Official Udyam Registration Certificate with QR Code'],
    typicalTimeline: '1 – 3 business days',
    targetAudience: ['All Micro, Small and Medium Enterprises', 'Proprietorships', 'Partnership Firms'],
    serviceType: 'consulting',
    relatedServices: ['detailed-project-report', 'government-subsidy-assistance']
  },
  {
    id: 'detailed-project-report',
    category: 'finance-compliance',
    title: 'Bank-Ready Detailed Project Report (DPR)',
    subtitle: 'Comprehensive techno-economic feasibility reports structured for commercial bank underwriting.',
    tagline: 'The cornerstone document for term loans, bank credit, and scheme submissions',
    description: 'Crafted with granular technical costings, 7-year financial projections (P&L, Balance Sheet, Cash Flow), DSCR, BEP, and IRR metrics. Note: Final loan sanction is at the sole discretion of the lending bank.',
    scopeList: [
      'Promoter background & project concept articulation',
      'Technical capacity, plant & machinery scrutiny',
      'Cost of project & means of finance structuring',
      '7-Year projected financial statements with sensitivity analysis',
      'Ratio analysis: DSCR, ISCR, Current Ratio, Debt-Equity'
    ],
    deliverables: ['Bank-Ready DPR Document (PDF)', 'Editable Financial Model (Excel)'],
    typicalTimeline: '7 – 14 business days',
    targetAudience: ['New Entrepreneurs', 'Expanding Factories', 'Firms seeking Term Loans > ₹25 Lakhs'],
    serviceType: 'consulting',
    relatedServices: ['cma-data', 'working-capital', 'government-subsidy-assistance'],
    isPopular: true
  },
  {
    id: 'cma-data',
    category: 'finance-compliance',
    title: 'CMA Data Preparation (Credit Monitoring Arrangement)',
    subtitle: 'Standardized 7-sheet format demanded by Indian banks for working capital sanction.',
    description: 'Historical and projected financial statements aligned to banking norms (Tandon & Chore committee benchmarks) for Cash Credit (CC) and Overdraft (OD) renewals.',
    scopeList: [
      'Past 2 years audited data transcription',
      'Estimates and projections benchmarking against industry norms',
      'Form II (Operating Statement), Form III (Balance Sheet Analysis)',
      'Form IV (Working Capital Assessment), Form V (Funds Flow)'
    ],
    deliverables: ['Bank-Standard CMA Excel File', 'Signed Executive Summary Note'],
    typicalTimeline: '3 – 6 business days',
    targetAudience: ['Manufacturing Units', 'Traders with Cash Credit / Overdraft lines'],
    serviceType: 'consulting',
    relatedServices: ['detailed-project-report', 'working-capital']
  },
  {
    id: 'working-capital',
    category: 'finance-compliance',
    title: 'Working Capital Assessment & Bank Liaison',
    subtitle: 'Analyze your operating cycle and prepare justification papers for bank limit enhancements.',
    description: 'Detailed analysis of your operating cycle (raw material holding, WIP, finished goods, debtor credit period) to justify appropriate credit lines with banks.',
    scopeList: [
      'Operating cycle duration calculation',
      'Drawing Power (DP) sheet restructuring',
      'Stock & book debts statement hygiene audit',
      'Liaison and presentation documentation for bank branch review'
    ],
    deliverables: ['Working Capital Optimization Report', 'Bank Justification Paper'],
    typicalTimeline: '5 – 10 business days',
    targetAudience: ['Growing businesses facing liquidity crunches', 'Seasonal manufacturers'],
    serviceType: 'consulting',
    relatedServices: ['cma-data', 'detailed-project-report']
  },
  {
    id: 'company-incorporation',
    category: 'finance-compliance',
    title: 'Company Formation (Pvt Ltd / LLP / OPC)',
    subtitle: 'Establish limited liability corporate structures with MCA incorporation and PAN/TAN.',
    description: 'Complete MCA registration including RUN name reservation, SPICe+ drafting, MOA/AOA customization, PAN, TAN, and EPFO/ESIC auto-allotment.',
    scopeList: [
      'Name availability search & trademark pre-check',
      'Director Identification Number (DIN) and DSC processing',
      'Drafting tailored Memorandum & Articles of Association (MOA/AOA)',
      'Bank current account opening facilitation'
    ],
    deliverables: ['Certificate of Incorporation (COI)', 'PAN & TAN Letters', 'Certified MOA & AOA'],
    typicalTimeline: '5 – 10 business days',
    targetAudience: ['Partnerships upgrading to Private Limited', 'New startups and ventures'],
    serviceType: 'consulting',
    relatedServices: ['roc-compliance', 'gst-registration']
  },
  {
    id: 'roc-compliance',
    category: 'finance-compliance',
    title: 'ROC Annual Filings & Secretarial Compliance',
    subtitle: 'Keep your company compliant with timely MCA annual filings and director KYC.',
    description: 'Preparation and filing of Form AOC-4 (Financial Statements), MGT-7 (Annual Return), DIR-3 KYC, and maintenance of statutory minute books.',
    scopeList: [
      'Annual General Meeting (AGM) notices and minutes drafting',
      'Directors Report and Financial Statement packaging',
      'MCA portal e-filing with digital signatures',
      'Director KYC renewal and disqualification prevention'
    ],
    deliverables: ['Filed MCA Challans & Form Receipts', 'Updated Statutory Registers'],
    typicalTimeline: 'Annual cycle',
    targetAudience: ['All Private Limited Companies', 'One Person Companies', 'LLPs'],
    serviceType: 'consulting',
    relatedServices: ['company-incorporation', 'income-tax-audit']
  },
  {
    id: 'tnpcb-approvals',
    category: 'finance-compliance',
    title: 'TNPCB Pollution Control Consents (CTE / CTO)',
    subtitle: 'Statutory environmental clearance documentation for manufacturing, leather, and processing units.',
    description: 'Preparation of Consent to Establish (CTE) and Consent to Operate (CTO) applications under Water & Air Acts for Tamil Nadu units. Note: Approvals are granted solely by the TNPCB after official inspection.',
    scopeList: [
      'Categorisation (Red / Orange / Green / White) analysis',
      'Site plan, effluent treatment flow diagrams, and emission balance sheets',
      'OCMMS portal filing and fee calculation',
      'Liaison with District Environmental Engineer (DEE)',
      'Joint inspection preparation & compliance report'
    ],
    deliverables: ['Official TNPCB CTE / CTO Order Copy', 'Statutory Conditions Register'],
    typicalTimeline: '30 – 60 days (subject to board inspection cycles)',
    targetAudience: ['Leather Processing & Tanneries', 'Footwear Factories', 'Chemical Units', 'Food Processors'],
    serviceType: 'consulting',
    relatedServices: ['factory-licence', 'project-feasibility']
  },
  {
    id: 'factory-licence',
    category: 'finance-compliance',
    title: 'Factory Licence (Plan Approval & Grant)',
    subtitle: 'Compliance documentation under the Factories Act, 1948 for industrial establishments.',
    description: 'Engineering layout reviews, machinery horsepower calculations, and licence grant/renewal filings with the Directorate of Industrial Safety and Health (DISH).',
    scopeList: [
      'Factory building & machinery layout scrutiny',
      'Form 1 & Form 2 preparation with horse-power & worker metrics',
      'Industrial Safety and Health Directorate coordination',
      'Renewal submissions for 1 to 5 years'
    ],
    deliverables: ['Factory Plan Approval Order Copy', 'Valid Factory Licence in Form 4'],
    typicalTimeline: '20 – 45 days (subject to department review)',
    targetAudience: ['Manufacturing Plants with 10+ workers using power, or 20+ without power'],
    serviceType: 'consulting',
    relatedServices: ['tnpcb-approvals', 'fire-noc', 'labour-epf-esi']
  },
  {
    id: 'labour-epf-esi',
    category: 'finance-compliance',
    title: 'EPF & ESI Registration and Monthly Filings',
    subtitle: 'Maintain compliant employer codes and monthly ECR challan generation.',
    description: 'End-to-end employer registration, employee UAN generation, monthly ECR generation, and inspection compliance handling.',
    scopeList: [
      'Employer Code creation on Unified Shram Suvidha portal',
      'Wage structure review for statutory compliance',
      'Monthly wage register compilation and challan generation',
      'Handling annual inspection documentation'
    ],
    deliverables: ['EPF & ESI Employer Code Letters', 'Monthly Paid ECR Challans'],
    typicalTimeline: '3 – 5 business days for setup; monthly filings',
    targetAudience: ['Establishments with 10/20 or more staff', 'Contractor-employing manufacturers'],
    serviceType: 'consulting',
    relatedServices: ['factory-licence']
  },
  {
    id: 'trade-licence',
    category: 'finance-compliance',
    title: 'Municipal / Panchayat Trade Licence',
    subtitle: 'Local body operating permits from municipality or village panchayat authorities.',
    description: 'Documentation and filing for trade permits under local municipality or panchayat guidelines, ensuring legitimate local operation.',
    scopeList: [
      'Application drafting with property tax receipts and ownership docs',
      'Premises condition verification and D&O trade classification',
      'Department fee payment and physical follow-up'
    ],
    deliverables: ['Official Local Body Trade Licence Certificate'],
    typicalTimeline: '7 – 14 business days',
    targetAudience: ['Retailers', 'Commercial Showrooms', 'Warehouses', 'Small workshops'],
    serviceType: 'consulting',
    relatedServices: ['fire-noc', 'fssai-licence']
  },
  {
    id: 'fssai-licence',
    category: 'finance-compliance',
    title: 'FSSAI Food Safety Licence & Registration',
    subtitle: 'Food Safety Standards Authority permit for food manufacturing and trading.',
    description: 'Basic Registration, State Licence, or Central Licence based on production capacity, turnover, and facility equipment.',
    scopeList: [
      'Eligibility tier calculation (Basic vs State vs Central)',
      'Water testing report & premises hygiene documentation',
      'FoSCoS portal application submission',
      'Filing responses to inspection queries'
    ],
    deliverables: ['14-digit FSSAI Registration or State Licence Certificate'],
    typicalTimeline: '10 – 20 business days',
    targetAudience: ['Food Processors', 'Restaurants & Caterers', 'Agro-commodities Traders'],
    serviceType: 'consulting',
    relatedServices: ['trade-licence', 'gst-registration']
  },
  {
    id: 'fire-noc',
    category: 'finance-compliance',
    title: 'Fire & Rescue Services NOC',
    subtitle: 'Clearance certificate for commercial and industrial buildings.',
    description: 'Documentation, fire safety equipment specification reviews, and field inspection coordination with Fire & Rescue services.',
    scopeList: [
      'Building layout review against Fire Safety Rules',
      'Equipment check (hydrants, extinguishers, egress stairs)',
      'Fire & Rescue Services portal filing',
      'Station Officer inspection liaison'
    ],
    deliverables: ['Fire NOC Clearance Certificate Copy'],
    typicalTimeline: '15 – 30 days',
    targetAudience: ['Industrial buildings', 'Commercial complexes', 'Warehouses'],
    serviceType: 'consulting',
    relatedServices: ['factory-licence', 'tnpcb-approvals']
  },
  {
    id: 'iec-registration',
    category: 'finance-compliance',
    title: 'Import Export Code (IEC)',
    subtitle: 'DGFT 10-digit code required to export or import goods and remit foreign exchange.',
    description: 'Instant DGFT registration with proper bank account linkage, AD Code registration guidance, and annual IEC profile validation.',
    scopeList: [
      'DGFT portal registration with DSC',
      'Bank certificate verification and ICEGATE readiness',
      'Certificate generation and annual update SOP'
    ],
    deliverables: ['Official DGFT IEC Certificate', 'Port Registration Guidance'],
    typicalTimeline: '1 – 3 business days',
    targetAudience: ['Exporters', 'Leather manufacturers exporting uppers/shoes', 'Importers'],
    serviceType: 'consulting',
    relatedServices: ['gst-registration', 'modern-website']
  },
  {
    id: 'government-subsidy-assistance',
    category: 'finance-compliance',
    title: 'Government Scheme & Subsidy Advisory',
    subtitle: 'Consulting for PMEGP, NEEDS, MUDRA, and Tamil Nadu State Capital Subsidies.',
    tagline: 'Technical documentation and application follow-up for eligible government schemes',
    description: 'Eligibility verification, detailed project profile preparation, online scheme submission, and bank branch documentation. Note: Government subsidies are sanctioned at the discretion of the respective nodal committees and funding banks.',
    scopeList: [
      'Scheme eligibility validation against current department criteria',
      'DPR and financial statement preparation aligned to DIC / KVIC guidelines',
      'Online e-portal application filing with certified annexures',
      'Coordination with bank branch during appraisal'
    ],
    deliverables: ['Submitted Scheme Application Pack', 'Bank-Compliant Project Profile'],
    typicalTimeline: '10 – 20 business days',
    targetAudience: ['New Entrepreneurs', 'Expanding Manufacturing Units in Tamil Nadu'],
    serviceType: 'consulting',
    relatedServices: ['detailed-project-report', 'udyam-registration'],
    isPopular: true
  },
  {
    id: 'income-tax-audit',
    category: 'finance-compliance',
    title: 'Income Tax Return (ITR) & Coordination',
    subtitle: 'Statutory income tax computation and audit coordination for firms and directors.',
    description: 'Filing of ITR-3, 5, 6 with comprehensive tax planning, depreciation computation on industrial plant & machinery, and CA coordination.',
    scopeList: [
      'Income computation and deduction verification',
      'Depreciation schedule on industrial plant and machinery',
      'Advance tax schedule and TDS credit verification (26AS / AIS)',
      'Coordination for audit completion under 44AB'
    ],
    deliverables: ['Filed ITR Acknowledgement', 'Computation of Total Income Sheet'],
    typicalTimeline: 'Annual cycle',
    targetAudience: ['Sole Proprietors', 'Partnership Firms', 'Pvt Ltd Companies'],
    serviceType: 'consulting',
    relatedServices: ['bookkeeping-mis', 'gst-returns']
  },
  {
    id: 'dsc-token',
    category: 'finance-compliance',
    title: 'Class 3 Digital Signature Certificate (DSC)',
    subtitle: 'Class 3 Signing & Encryption USB tokens for MCA, GST, Income Tax, and E-Tendering.',
    description: 'Fast issuance of Class 3 Digital Signature Certificate tokens on secure FIPS-compliant USB hardware for directors and partners.',
    scopeList: [
      'Identity verification & video KYC guidance',
      'Issuance on secure USB crypto token',
      'Driver installation and token testing'
    ],
    deliverables: ['Pre-Configured USB DSC Token', '2-Year Validity Certificate'],
    typicalTimeline: '1 business day',
    targetAudience: ['Company Directors', 'Partners', 'Tender Bidders'],
    serviceType: 'consulting',
    relatedServices: ['company-incorporation', 'roc-compliance']
  }
];

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pmegp',
    name: 'PMEGP',
    fullName: 'Prime Minister’s Employment Generation Programme',
    subsidyAmount: '15% to 35% Margin Money Subsidy (Project cost up to ₹50 Lakhs for Manufacturing)',
    eligibility: 'New entrepreneurs, age 18+, individuals, SHGs, Co-operatives. Special categories get up to 35% subsidy.',
    purpose: 'Setting up new micro manufacturing or service units with government capital assistance. Approvals subject to KVIC / DIC guidelines.',
    ourRole: [
      'Eligibility validation & category benefit analysis',
      'Techno-Economic DPR preparation tailored to KVIC / DIC norms',
      'Online e-portal application filing with required annexures',
      'Bank branch coordination for loan appraisal',
      'Margin Money TDR claim filing assistance'
    ],
    keyHighlights: [
      'Up to ₹17.5 Lakhs government grant (subject to scheme rules)',
      'Bank finance 90-95% of approved project cost',
      'Available across urban and rural locations'
    ]
  },
  {
    id: 'mudra',
    name: 'MUDRA Loan',
    fullName: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    subsidyAmount: 'Collateral-free business credit up to ₹20 Lakhs (Tarun Plus Category)',
    eligibility: 'Non-corporate small business enterprises, micro manufacturers, repair shops, artisans.',
    purpose: 'Working capital and light machinery purchase without mortgage of immovable assets. Underwriting by lending bank.',
    ourRole: [
      'Categorisation into Shishu, Kishore, Tarun, or Tarun Plus',
      'Financial statement compilation and project viability profile',
      'Credit Guarantee Fund for Micro Units (CGFMU) documentation'
    ],
    keyHighlights: [
      'Zero collateral security needed under scheme rules',
      'Competitive bank interest rates',
      'Term loan and cash credit options'
    ]
  },
  {
    id: 'needs',
    name: 'NEEDS',
    fullName: 'New Entrepreneur-cum-Enterprise Development Scheme',
    subsidyAmount: '25% Capital Subsidy (Up to ₹75 Lakhs) + 3% Interest Subvention',
    eligibility: 'First-generation entrepreneurs with degree/diploma/ITI, age 21 to 35 (45 for special categories).',
    purpose: 'Setting up greenfield manufacturing and service ventures with project costs up to ₹5 Crores in Tamil Nadu.',
    ourRole: [
      'Comprehensive bankable DPR with rigorous DCF model',
      'Task Force Committee presentation guidance',
      'Coordination with TIIC or commercial banks',
      'Assistance with capital subsidy and interest relief claims'
    ],
    keyHighlights: [
      'Highest subsidy threshold in Tamil Nadu (up to ₹75 Lakhs)',
      '3% rebate on bank interest for loan tenure',
      'State enterprise mentoring support'
    ]
  },
  {
    id: 'capital-subsidy',
    name: 'MSME Capital Subsidy',
    fullName: 'State Capital Subsidy on Plant & Machinery (Tamil Nadu)',
    subsidyAmount: '25% on eligible plant and machinery value (up to ₹50 Lakhs)',
    eligibility: 'Micro and Small manufacturing enterprises setting up or expanding in designated taluks.',
    purpose: 'Modernising plant, purchasing eligible machinery, and factory capacity expansion.',
    ourRole: [
      'Valuation review of eligible vs non-eligible machinery items',
      'Chartered Engineer valuation and CA investment certificate coordination',
      'Application submission within statutory timeline',
      'District and State level committee approval follow-ups'
    ],
    keyHighlights: [
      'Direct credit into term loan account',
      'Additional 5% subsidy for backward taluks and special thrust sectors',
      'Can be clubbed with interest subvention'
    ]
  }
];

export const WHO_WE_HELP_SECTORS = [
  {
    title: 'Manufacturing & Engineering',
    subtitle: 'Machine Shops, Fabrication, Plastics & Assembly',
    description: 'Custom quotation builders, production job-card trackers, factory licensing, machine term loans, and real-time inventory systems.',
    icon: 'Factory'
  },
  {
    title: 'Trading, Wholesale & Distribution',
    subtitle: 'Commodity Merchants, Hardware, Electrical & Materials',
    description: 'B2B ordering portals, multi-godown stock management, fast billing software, aged debtor dashboards, and GST reconciliation.',
    icon: 'Truck'
  },
  {
    title: 'Leather, Footwear & Tannery Cluster',
    subtitle: 'Specialized Industrial Manufacturing Clusters',
    description: 'Deep sector familiarity. Export web presence, environmental compliance, CETP coordination, and bank DPRs.',
    icon: 'Footprints'
  },
  {
    title: 'Service Contractors & Technical Businesses',
    subtitle: 'CCTV Installers, HVAC, Security, Solar & Maintenance',
    description: 'High-converting service websites, AMC contract portals, technician dispatch apps, and automated client billing.',
    icon: 'Wrench'
  },
  {
    title: 'First-Generation Entrepreneurs & Startups',
    subtitle: 'New Industrial Ventures & Digital Commerce',
    description: 'From company incorporation and branding to custom web platforms, PMEGP/NEEDS subsidy support, and bank loan documentation.',
    icon: 'Rocket'
  },
  {
    title: 'Growing Family Enterprises',
    subtitle: 'Generational Transitions & Systems Modernization',
    description: 'Moving legacy paper and Excel habits into automated cloud dashboards, digital document rooms, and executive MIS reporting.',
    icon: 'Building2'
  }
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Discuss Your Project',
    subtitle: 'Initial Discovery • No Cost',
    description: 'Share your requirements, current pain points, or expansion ideas. We evaluate your goals and outline practical options without commitment.'
  },
  {
    step: '02',
    title: 'Systems & Requirements Mapping',
    subtitle: 'Granular Scope & Architecture',
    description: 'We audit your existing tools, spreadsheets, and workflows to define the exact deliverables, technical specifications, and timeline.'
  },
  {
    step: '03',
    title: 'Transparent Written Quotation',
    subtitle: 'Pre-Scoped Milestones • Zero Hidden Fees',
    description: 'You receive an itemized proposal detailing scope of work, technical deliverables, milestones, and statutory fees. No work starts without your sign-off.'
  },
  {
    step: '04',
    title: 'Development, Testing & Execution',
    subtitle: 'Direct Follow-Up & Milestones',
    description: 'Our team builds the custom software, configures automations, or processes documentation, with regular check-ins and test demonstrations.'
  },
  {
    step: '05',
    title: 'Launch, Training & Ongoing Retainer',
    subtitle: 'Clean Handover & Retainer Options',
    description: 'We train your staff, deploy your live system, and provide smooth ongoing maintenance under our PROTECT or GUARDIAN support tiers.'
  }
];

export const WHY_UNIKORN_PILLARS = [
  {
    pillar: 'Business Intelligence',
    tagline: 'Know your real numbers.',
    detail: 'Stop guessing cash flow. Monitor sales, overdue debtors, and margins in one unified executive cockpit.'
  },
  {
    pillar: 'Custom Software',
    tagline: 'Built around how you work.',
    detail: 'Tailor-made quotation tools, billing systems, and client portals that fit your exact business process.'
  },
  {
    pillar: 'Automation',
    tagline: 'Eliminate repetitive manual toil.',
    detail: 'Connect WhatsApp alerts, email triggers, and document workflows to free up valuable managerial time.'
  },
  {
    pillar: 'Web Presence',
    tagline: 'Win buyer and export trust.',
    detail: 'Fast, modern websites and e-commerce stores that showcase technical capability and generate verified inquiries.'
  },
  {
    pillar: 'Compliance & Finance',
    tagline: 'Solid statutory foundations.',
    detail: 'Bank-ready project reports, verified working capital, GST returns, and regulatory licensing handled with precision.'
  },
  {
    pillar: 'Operating Partner',
    tagline: 'One point of accountability.',
    detail: 'A dedicated business intelligence and technology partner combining systems, strategy, and operations under one roof.'
  }
];
