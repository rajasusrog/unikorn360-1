export interface ServiceExtendedMeta {
  metaTitle: string;
  metaDescription: string;
  canonicalSlug: string;
  aliasSlugs?: string[];
  ctaButtonText: string;
  processSteps: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  localContext?: string;
}

export const EXTENDED_SERVICE_MAP: Record<string, ServiceExtendedMeta> = {
  'gst-registration': {
    metaTitle: 'GST Registration for MSMEs | Unikorn360',
    metaDescription: 'Hassle-free GST registration for manufacturers, traders, and service units. HSN code selection, Aadhaar authentication, and jurisdictional follow-up.',
    canonicalSlug: 'gst-registration',
    aliasSlugs: ['gst-registration-services', 'new-gst-registration'],
    ctaButtonText: 'Apply for GST Registration',
    processSteps: [
      { step: 1, title: 'Document Verification & Structure Check', description: 'Review electricity bill, rental agreement/patta, PAN, Aadhaar, and bank proof to ensure zero mismatch.' },
      { step: 2, title: 'HSN/SAC Classification & Jurisdiction', description: 'Map exact 6-digit/8-digit HSN codes matching your goods and assign correct State/Central jurisdictional ward.' },
      { step: 3, title: 'Portal Filing & Aadhaar Authentication', description: 'Submit Form GST REG-01 with Aadhaar OTP authentication, avoiding mandatory physical site visits.' },
      { step: 4, title: 'Clarification & Certificate Grant', description: 'Handle any REG-03 clarification queries promptly and deliver Form GST REG-06 with active GSTIN.' }
    ],
    faqs: [
      {
        question: 'Who is required to register for GST in India?',
        answer: 'Any business with aggregate turnover exceeding ₹40 Lakhs for goods (₹20 Lakhs for services) must register. Furthermore, mandatory registration is required for inter-state sales, e-commerce sellers, and entities making payments under reverse charge (RCM), regardless of turnover.'
      },
      {
        question: 'How long does it take to obtain a GSTIN?',
        answer: 'With Aadhaar authentication, the GST department typically approves registration within 3 to 7 working days. If the officer raises a clarification notice (Form REG-03), we file the response within 24 hours to secure approval swiftly.'
      },
      {
        question: 'Can I register GST from a rented property or residential address?',
        answer: 'Yes. For rented premises, an active rental agreement and the latest electricity bill from the landlord, along with an NOC, are legally sufficient. For residential addresses used as offices, property tax receipts or parental consent letters apply.'
      },
      {
        question: 'What happens after I receive my GST certificate?',
        answer: 'You must display your GSTIN and certificate at your principal place of business, open a current account linked to the GSTIN within 30 days, and file regular monthly or quarterly returns to prevent cancellation.'
      }
    ],
    localContext: 'Supporting manufacturing units, commercial components makers, and retail traders with compliant tax registration.'
  },

  'gst-return-filing': {
    metaTitle: 'GST Return Filing Services (GSTR-1 & 3B) | Unikorn360',
    metaDescription: 'Accurate monthly GST return filing and GSTR-2B input tax credit reconciliation. Zero late fees, maximum ITC recovery, and department notice defense.',
    canonicalSlug: 'gst-return-filing',
    aliasSlugs: ['gst-returns', 'monthly-gst-filing'],
    ctaButtonText: 'Outsource Your Monthly GST Filings',
    processSteps: [
      { step: 1, title: 'Sales & Purchase Invoices Ingestion', description: 'Collect sales registers, e-invoices, purchase bills, and debit/credit notes by the 5th of each month.' },
      { step: 2, title: 'Algorithmic GSTR-2B ITC Matching', description: 'Compare purchase register against auto-drafted GSTR-2B to detect defaulting vendors and prevent blocked credit.' },
      { step: 3, title: 'GSTR-1 Outward Filing (by 11th)', description: 'Upload B2B invoices, B2C summaries, and export documentation with zero HSN discrepancy.' },
      { step: 4, title: 'GSTR-3B Tax Computation & Offset (by 20th)', description: 'Calculate net cash payable after setting off verified ITC, generate PMT-06 challans, and file on time.' }
    ],
    faqs: [
      {
        question: 'Why is GSTR-2B reconciliation critical for our business?',
        answer: 'Under Section 16(2)(aa), claiming Input Tax Credit on bills not reflected in GSTR-2B triggers automated scrutiny notices (DRC-01B) and mandatory 18% interest penalties. We protect you by verifying vendor uploads before filing.'
      },
      {
        question: 'What if our business has no sales in a particular month?',
        answer: 'Filing a Nil Return is mandatory. Missing a Nil Return still attracts statutory late fees of ₹20 per day under CGST & SGST.'
      },
      {
        question: 'Do you provide year-end GSTR-9 annual return filing as well?',
        answer: 'Yes, our team reconciles the entire financial year’s monthly returns against audited financial statements to prepare and file GSTR-9 and GSTR-9C.'
      }
    ],
    localContext: 'Serving manufacturing workshops, exporters, and commercial retail chains with regular monthly filing cycles.'
  },

  'udyam-registration': {
    metaTitle: 'Udyam Registration for MSMEs | Unikorn360',
    metaDescription: 'Get official Udyam Registration certificate with QR code for Micro, Small and Medium enterprises. Access priority bank loans, lower interest rates, and subsidies.',
    canonicalSlug: 'udyam-registration',
    aliasSlugs: ['msme-registration', 'udyam-certificate'],
    ctaButtonText: 'Get Udyam MSME Certificate',
    processSteps: [
      { step: 1, title: 'Plant & Machinery and Turnover Assessment', description: 'Calculate investment in plant and machinery excluding pollution control/R&D equipment to ensure accurate classification.' },
      { step: 2, title: 'NIC Code Identification', description: 'Select 5-digit National Industrial Classification (NIC) codes accurately reflecting all manufacturing and service activities.' },
      { step: 3, title: 'Portal Filing & Aadhaar Linking', description: 'Submit on official National Udyam Portal linking promoter PAN and GSTIN.' },
      { step: 4, title: 'Certificate Delivery & GeM/Samadhaan Integration', description: 'Deliver official Udyam certificate with QR code and enable GeM portal access for government procurement.' }
    ],
    faqs: [
      {
        question: 'What are the benefits of having an Udyam Certificate?',
        answer: 'Udyam registration gives you priority sector lending status at commercial banks, 1% interest rate concessions on bank loans, 50% patent/trademark discount, eligibility for PMEGP/NEEDS subsidies, protection against delayed payments under the MSME Samadhaan portal, and exemption from earnest money deposits (EMD) in government tenders.'
      },
      {
        question: 'Is Udyam registration a one-time process or does it need annual renewal?',
        answer: 'Udyam Registration has lifetime validity. However, your turnover and investment metrics auto-update from linked Income Tax and GST returns annually.'
      },
      {
        question: 'Can a trader or retail shop apply for Udyam?',
        answer: 'Yes! Wholesale and retail trade enterprises are eligible for Udyam registration under the retail and wholesale trade NIC codes for priority sector bank lending.'
      }
    ],
    localContext: 'Essential gateway for MSMEs applying for government schemes and priority bank credit.'
  },

  'government-subsidy-assistance': {
    metaTitle: 'MSME Government Subsidy Assistance in Tamil Nadu | Unikorn360',
    metaDescription: 'End-to-end guidance for PMEGP, NEEDS, Tamil Nadu 25% State Capital Subsidy, generator subsidies, and unlocking stalled government claims.',
    canonicalSlug: 'government-subsidy-assistance',
    aliasSlugs: ['subsidies', 'msme-subsidy-consultant'],
    ctaButtonText: 'Check Your Subsidy Eligibility',
    processSteps: [
      { step: 1, title: 'Scheme Identification & Feasibility Scan', description: 'Evaluate your project cost, location, promoter category, and business type against active central and state subsidy rules.' },
      { step: 2, title: 'Project Report & Documentation Pack', description: 'Prepare bankable DPR, quotation verification, land/lease approvals, and required affidavit formats.' },
      { step: 3, title: 'Online Portal Submission & DIC Liaison', description: 'Submit application on official government portals (KVIC or MSME Tamil Nadu) and coordinate with District Industries Centre.' },
      { step: 4, title: 'Joint Inspection & Subsidy Release', description: 'Coordinate field inspection with DIC officers and track subsidy credit into your bank term deposit / capital account.' }
    ],
    faqs: [
      {
        question: 'Can we apply for subsidy after purchasing machinery?',
        answer: 'Most schemes (such as PMEGP and NEEDS) strictly require that applications be submitted and bank loan sanctioned BEFORE commercial machinery is installed. For the 25% State Capital Subsidy, the application must be submitted within 1 year of commercial production commencement.'
      },
      {
        question: 'How do you charge for subsidy consulting?',
        answer: 'Unikorn360 operates with 100% pricing transparency. We charge a defined, pre-scoped professional fee for DPR preparation and documentation. We never demand unauthorized percentage cuts or make illegal promises.'
      },
      {
        question: 'What if our subsidy claim has been stuck for months at the DIC?',
        answer: 'We prepare formal administrative status representations, file targeted Right to Information (RTI) petitions, and escalate through CPGRAMS to hold officers accountable and unlock your pending disbursement.'
      }
    ],
    localContext: 'Active liaison with District Industries Centre (DIC) Tirupathur and regional bank branches across the district.'
  },

  'pmegp-assistance': {
    metaTitle: 'PMEGP Subsidy Loan Scheme Assistance in Tamil Nadu | Unikorn360',
    metaDescription: 'Secure 25% to 35% margin money subsidy under PMEGP for new manufacturing and service enterprises in Tamil Nadu. Complete DPR and portal filing support.',
    canonicalSlug: 'pmegp-assistance',
    aliasSlugs: ['pmegp-subsidy', 'pmegp-loan-project-report'],
    ctaButtonText: 'Apply for PMEGP Subsidy',
    processSteps: [
      { step: 1, title: 'Eligibility & Project Sizing', description: 'Structure project cost within scheme limits (up to ₹50 Lakhs for manufacturing, ₹20 Lakhs for services).' },
      { step: 2, title: 'DPR & Quotation Compilation', description: 'Draft comprehensive project report with machinery quotations, civil estimates, and working capital requirements.' },
      { step: 3, title: 'KVIC Portal Submission', description: 'File official online application choosing your preferred financing bank branch in Tirupathur/Tamil Nadu.' },
      { step: 4, title: 'Task Force Interview & Bank Sanction', description: 'Prepare promoter for District Level Task Force Committee (DLTFC) interview and follow up with bank credit manager.' }
    ],
    faqs: [
      {
        question: 'How much subsidy does a borrower get under PMEGP in Tamil Nadu?',
        answer: 'In rural areas, special category beneficiaries (SC/ST, OBC, Women, Minorities, Ex-servicemen, PH) receive a 35% subsidy on project cost, while general category receives 25%. In urban areas, special category receives 25% and general category receives 15%.'
      },
      {
        question: 'Is collateral security required for PMEGP loans?',
        answer: 'Under the Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE), loans up to ₹50 Lakhs under PMEGP can be sanctioned by banks without third-party collateral or mortgage.'
      },
      {
        question: 'What is the promoter’s own contribution under PMEGP?',
        answer: 'Special category promoters contribute only 5% of the project cost as equity margin; general category promoters contribute 10%.'
      }
    ],
    localContext: 'Guiding entrepreneurs across Vaniyambadi, Natrampalli, Alangayam, and Tirupathur blocks in tapping rural/urban KVIC subsidy allocations.'
  },

  'mudra-loan-assistance': {
    metaTitle: 'MUDRA Loan Assistance (Shishu, Kishore, Tarun) | Unikorn360',
    metaDescription: 'Collateral-free business loan assistance up to ₹20 Lakhs under Pradhan Mantri MUDRA Yojana (PMMY). Documentation, business plan, and bank file submission.',
    canonicalSlug: 'mudra-loan-assistance',
    aliasSlugs: ['mudra-loan', 'mudra-loan-tamil-nadu'],
    ctaButtonText: 'Apply for MUDRA Loan Support',
    processSteps: [
      { step: 1, title: 'Category Selection & Loan Sizing', description: 'Identify appropriate tier: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakhs), Tarun (₹5 Lakhs to ₹10 Lakhs), or Tarun Plus (up to ₹20 Lakhs).' },
      { step: 2, title: 'Document Preparation', description: 'Assemble business profile, proof of identity, Udyam registration, 12-month bank statements, and quotations for tools/stock.' },
      { step: 3, title: 'Simplified Project Profile Drafting', description: 'Prepare brief viability profile showing sales turnover, gross margins, and debt repayment capability.' },
      { step: 4, title: 'Bank Branch Liaison', description: 'Submit docket through Udyamimitra portal or directly to designated public/private sector bank branch.' }
    ],
    faqs: [
      {
        question: 'Do banks require collateral or property mortgage for MUDRA loans?',
        answer: 'No! Under government guidelines, all MUDRA loans are collateral-free and covered under the Credit Guarantee for Micro Units (CGFMU).'
      },
      {
        question: 'Who is eligible for a MUDRA loan in Tamil Nadu?',
        answer: 'Any Indian citizen who has a viable business plan for a non-farm sector income generating activity such as manufacturing, processing, trading, or service sector.'
      }
    ],
    localContext: 'Assisting small workshop proprietors, shoe component artisans, and retail merchants in Tirupathur District.'
  },

  'dpr-preparation': {
    metaTitle: 'Detailed Project Report (DPR) Preparation for Bank Loans | Unikorn360',
    metaDescription: 'Bank-grade Detailed Project Reports (DPR) for MSME term loans, factory expansion, and government subsidies in Tamil Nadu. DSCR, cash flows, and technical feasibility.',
    canonicalSlug: 'dpr-preparation',
    aliasSlugs: ['detailed-project-report', 'bank-dpr-consultant'],
    ctaButtonText: 'Get Bank-Grade DPR Prepared',
    processSteps: [
      { step: 1, title: 'Technical & Operational Parameter Mapping', description: 'Gather details on proposed plant capacity, machinery specs, civil construction estimates, power/water loads, and labor schedules.' },
      { step: 2, title: 'Market & Raw Material Analysis', description: 'Document raw material supply chains, competitive advantage, pricing models, and target distribution channels.' },
      { step: 3, title: 'Financial Modeling & Sensitivity Analysis', description: 'Compute 5 to 7 year projected Balance Sheets, Profit & Loss, Cash Flows, DSCR, Break-Even Point (BEP), and Internal Rate of Return (IRR).' },
      { step: 4, title: 'Executive Report Compilation & Banker Review', description: 'Deliver a bound, professional DPR compliant with SIDBI and commercial bank credit guidelines, ready for submission.' }
    ],
    faqs: [
      {
        question: 'Why do bank credit managers reject cheap project reports?',
        answer: 'Generic 5-page reports lack technical machinery specifications, realistic cost of production breakdowns, and mathematically verified Debt Service Coverage Ratios (DSCR). Credit officers need substantiated data to justify approval to their regional risk committees.'
      },
      {
        question: 'How fast can Unikorn360 deliver a complete DPR?',
        answer: 'Our typical turnaround is 3 to 7 business days once we receive the machinery quotations and audited historical statements.'
      },
      {
        question: 'Do you modify the DPR if the bank raises queries?',
        answer: 'Yes! Our engagement covers bank query assistance — if the credit manager requests ratio sensitivity adjustments or altered repayment tenure, we update the model at no extra charge.'
      }
    ],
    localContext: 'Trusted by manufacturing units, tanneries, and agro-enterprises across Vaniyambadi, Ranipet, and Vellore.'
  },

  'business-loan-support': {
    metaTitle: 'MSME Business Loan & Working Capital Support | Unikorn360',
    metaDescription: 'Get your MSME term loan and Cash Credit (CC) limit approved. Complete CMA data, balance sheet restructuring, and professional loan dossier preparation.',
    canonicalSlug: 'business-loan-support',
    aliasSlugs: ['business-loans', 'msme-loan-advisory'],
    ctaButtonText: 'Structure Your Business Loan',
    processSteps: [
      { step: 1, title: 'Financial Diagnostic & Borrowing Capacity', description: 'Analyze historical ITRs, balance sheets, GST turnover, and existing EMI commitments to determine maximum borrowing limit.' },
      { step: 2, title: 'CMA Data & Working Capital Formulation', description: 'Prepare 5-year Credit Monitoring Arrangement (CMA) data using the Nayak Committee turnover method or MPBF method.' },
      { step: 3, title: 'Loan Proposal Packaging', description: 'Assemble complete banker dossier: DPR, CMA, KYC, title deed documentation, GST returns, and stock statements.' },
      { step: 4, title: 'Branch Liaison & Sanction Coordination', description: 'Coordinate with credit appraisal officers through pre-sanction inspection and legal clearance.' }
    ],
    faqs: [
      {
        question: 'What is the maximum Cash Credit (CC) limit an MSME can get?',
        answer: 'Under the Nayak Committee guidelines, MSMEs can receive working capital finance up to 20% of their projected annual turnover, provided the promoter contributes 5% margin and maintains regular banking transactions.'
      },
      {
        question: 'Can businesses with low CIBIL scores obtain bank finance?',
        answer: 'We review past repayment delays, clear disputed entries, and help structure loan applications with stronger collateral, CGTMSE coverage, or co-borrower guarantees to rebuild creditworthiness.'
      }
    ],
    localContext: 'Professional loan dossier preparation and credit appraisal compliance.'
  },

  'company-incorporation': {
    metaTitle: 'Private Limited Company & LLP Incorporation | Unikorn360',
    metaDescription: 'Incorporate your Private Limited Company, LLP, or Partnership firm with clean legal architecture. Fast name approval, DSC, MOA/AOA, and PAN/TAN.',
    canonicalSlug: 'company-incorporation',
    aliasSlugs: ['company-registration', 'pvt-ltd-incorporation'],
    ctaButtonText: 'Incorporate Your Enterprise',
    processSteps: [
      { step: 1, title: 'Name Reservation (RUN / SPICe+ Part A)', description: 'Search MCA database and trademark registry to ensure unique name approval on the first attempt.' },
      { step: 2, title: 'Digital Signatures & DIN Allotment', description: 'Issue Class 3 DSC tokens for all directors and secure Director Identification Numbers (DIN).' },
      { step: 3, title: 'Charter Drafting (MOA & AOA)', description: 'Draft comprehensive main object clauses and tailored Articles of Association protecting promoter rights.' },
      { step: 4, title: 'SPICe+ Part B Filing & Certificate Grant', description: 'File integrated MCA application and receive Certificate of Incorporation with PAN, TAN, and EPFO/ESIC registrations.' }
    ],
    faqs: [
      {
        question: 'What is the minimum capital required to start a Private Limited Company?',
        answer: 'There is no minimum paid-up capital requirement under the Companies Act. You can start with an authorized capital of ₹1,00,000 and paid-up capital of whatever amount suits your initial operational needs.'
      },
      {
        question: 'How many people are needed to incorporate a company?',
        answer: 'A Private Limited Company requires a minimum of 2 directors and 2 shareholders (directors can also be shareholders). For a single founder, a One Person Company (OPC) is an alternative.'
      }
    ],
    localContext: 'Helping emerging industrial founders transition from informal sole proprietorships to corporate entities.'
  },

  'roc-compliance': {
    metaTitle: 'Annual ROC Compliance & Corporate Secretarial Services | Unikorn360',
    metaDescription: 'Mandatory annual ROC filing (AOC-4, MGT-7), DIR-3 KYC, board resolutions, and statutory secretarial registers for Private Limited & LLP firms.',
    canonicalSlug: 'roc-compliance',
    aliasSlugs: ['annual-roc-filing', 'corporate-compliance'],
    ctaButtonText: 'Maintain Flawless ROC Compliance',
    processSteps: [
      { step: 1, title: 'Board & AGM Documentation', description: 'Draft statutory notice, directors’ report, and minutes for Board Meetings and Annual General Meeting.' },
      { step: 2, title: 'Financial Statements Filing (AOC-4)', description: 'Format balance sheet and profit & loss accounts into MCA XBRL/PDF format and file within 30 days of AGM.' },
      { step: 3, title: 'Annual Return Filing (MGT-7/7A)', description: 'Compile shareholding pattern, indebtedness details, and file Form MGT-7 before statutory deadlines.' },
      { step: 4, title: 'Director KYC & Secretarial Records', description: 'Complete annual DIR-3 KYC for all directors to prevent DIN deactivation.' }
    ],
    faqs: [
      {
        question: 'What are the penalties for missing annual ROC filings?',
        answer: 'The Ministry of Corporate Affairs imposes a severe daily penalty of ₹100 per day per form with no upper ceiling. Prolonged non-filing can lead to director disqualification for 5 years and company strike-off.'
      }
    ],
    localContext: 'Keeping Private Limited and LLP corporate entities fully compliant year-round.'
  },

  'business-automation': {
    metaTitle: 'MSME Business Workflow Automation | Unikorn360',
    metaDescription: 'Automate sales orders, customer WhatsApp pipelines, invoice reminders, and inventory tracking without heavy ERP costs for growing businesses.',
    canonicalSlug: 'business-automation',
    aliasSlugs: ['workflow-automation', 'msme-automation'],
    ctaButtonText: 'Automate Your Operations',
    processSteps: [
      { step: 1, title: 'Bottleneck Audit & Process Mapping', description: 'Analyze your current daily operations to pinpoint where paper, WhatsApp confusion, or staff delays slow down work.' },
      { step: 2, title: 'Lightweight Architecture Design', description: 'Select high-reliability, low-cost tools (Google Workspace, WhatsApp Business API, Make/Zapier) that match your staff capabilities.' },
      { step: 3, title: 'Automation Build & Testing', description: 'Implement automated quotation generation, delivery status triggers, and automated overdue payment reminders.' },
      { step: 4, title: 'Floor Training & SOP Delivery', description: 'Train office clerks and factory supervisors with simple video tutorials and quick-reference cheatsheets.' }
    ],
    faqs: [
      {
        question: 'Why should we choose automation over traditional ERP software?',
        answer: 'Heavy ERPs like SAP or custom enterprise suites cost lakhs to implement, take 6 to 12 months to deploy, and fail 70% of the time in small enterprises because factory staff find them too complex. Unikorn360 builds lightweight automations on tools your team already uses, delivering live results in days.'
      }
    ],
    localContext: 'Designed for owner-operated manufacturing, processing, and trading enterprises.'
  },

  'business-dashboards': {
    metaTitle: 'Custom Business Dashboards & Real-Time MIS for Business Owners | Unikorn360',
    metaDescription: 'Real-time executive business dashboards on mobile and desktop. Track sales, collections, factory production, and bank balances in one screen without asking staff.',
    canonicalSlug: 'business-dashboards',
    aliasSlugs: ['mis-dashboards', 'executive-dashboards'],
    ctaButtonText: 'Build Your Owner Dashboard',
    processSteps: [
      { step: 1, title: 'Metric & KPI Identification', description: 'Determine the 6 to 10 vital numbers you need daily: bank balances, daily collections, pending dispatches, and factory output.' },
      { step: 2, title: 'Data Source Integration', description: 'Connect billing software (Tally, Zoho, Excel), bank accounts, and factory logs via secure cloud connectors.' },
      { step: 3, title: 'Visual Dashboard Engineering', description: 'Build high-contrast, clean desktop and mobile views with automated daily refreshes and threshold alerts.' },
      { step: 4, title: 'Daily Digest Configuration', description: 'Configure automated morning summaries delivered directly to the business owner via WhatsApp or email at 8:00 AM.' }
    ],
    faqs: [
      {
        question: 'Can the dashboard connect with our existing Tally software?',
        answer: 'Yes! We configure automated sync scripts that pull voucher registers and ledger summaries from Tally into your secure cloud dashboard without changing your accounting routine.'
      }
    ],
    localContext: 'Empowering business owners and plant directors with instant visibility over operations.'
  },

  'digital-documentation': {
    metaTitle: 'Digital Documentation & Enterprise Vault for MSMEs | Unikorn360',
    metaDescription: 'Paperless digital file room, document indexing, secure cloud backup, and Class 3 DSC token management for growing enterprises.',
    canonicalSlug: 'digital-documentation',
    aliasSlugs: ['document-indexing', 'paperless-office'],
    ctaButtonText: 'Organize Your Company Vault',
    processSteps: [
      { step: 1, title: 'Document Inventory & Sorting', description: 'Categorize all legal, statutory, property, and banking records into standardized corporate classifications.' },
      { step: 2, title: 'High-Speed OCR Scanning', description: 'Convert physical land deeds, blue-prints, and licences into searchable, text-recognized digital files.' },
      { step: 3, title: 'Folder Structure & Metadata Tagging', description: 'Establish the Unikorn360 Enterprise Vault taxonomy with expiry date tracking and search tags.' },
      { step: 4, title: 'Secure Multi-Device Deployment', description: 'Deploy bank-grade encrypted cloud access with role-based owner/accountant security controls.' }
    ],
    faqs: [
      {
        question: 'How quickly can I locate a specific document once digitised?',
        answer: 'With optical character recognition (OCR) and our indexing taxonomy, you can find any licence, tax order, or agreement in under 15 seconds by typing a keyword on your smartphone.'
      }
    ],
    localContext: 'Protecting decades of factory blueprints, environmental clearances, and title deeds for multi-generational enterprises.'
  },

  'corporate-branding': {
    metaTitle: 'B2B Corporate Branding & Profiles for MSMEs | Unikorn360',
    metaDescription: 'Institutional B2B corporate profiles, product catalogues, logos, and digital web presence that command banking credibility and high-value buyer trust.',
    canonicalSlug: 'corporate-branding',
    aliasSlugs: ['company-profile-design', 'b2b-branding'],
    ctaButtonText: 'Elevate Your Corporate Profile',
    processSteps: [
      { step: 1, title: 'Enterprise Positioning & Value Proposition', description: 'Clarify manufacturing capabilities, infrastructure scale, quality certifications, and institutional strengths.' },
      { step: 2, title: 'Visual Identity & Collateral Design', description: 'Craft clean, executive typography, logos, and corporate presentation templates that project institutional maturity.' },
      { step: 3, title: 'Banker & Buyer Profile Compilation', description: 'Develop authoritative 12 to 20 page corporate profiles formatted for bank credit teams, tender bids, and export buyers.' },
      { step: 4, title: 'Digital Asset Delivery & Print Packaging', description: 'Deliver high-resolution print PDFs, interactive digital versions, and web-ready presentation assets.' }
    ],
    faqs: [
      {
        question: 'How does a corporate profile help with bank financing and large orders?',
        answer: 'Bank credit managers and multinational buyers assess organizational seriousness through institutional presentation. A professional corporate profile detailing machinery, plant capacity, quality controls, and client portfolios builds immediate credibility.'
      }
    ],
    localContext: 'Positioning industrial manufacturers, exporters, and enterprises to win high-value commercial contracts.'
  },

  'project-consulting': {
    metaTitle: 'Factory Setup & Industrial Project Consulting | Unikorn360',
    metaDescription: 'End-to-end guidance for new factory setup, industrial expansion, building plan approvals, environmental clearances, and machinery commissioning.',
    canonicalSlug: 'project-consulting',
    aliasSlugs: ['factory-consulting', 'industrial-project-consultant'],
    ctaButtonText: 'Discuss Your Factory Project',
    processSteps: [
      { step: 1, title: 'Site Selection & Statutory Land Due Diligence', description: 'Verify industrial zoning, title documentation, approach road widths, and environmental clearance feasibility.' },
      { step: 2, title: 'Plant Architecture & Machinery Layout', description: 'Draft industrial architectural blueprints complying with the Factories Act, 1948 and local planning authorities.' },
      { step: 3, title: 'Statutory Clearances (TNPCB / State PCB, DISH, Fire)', description: 'Secure Consent to Establish (CTE), Factory Building Plan Approval, Fire NOC, and power load sanctions.' },
      { step: 4, title: 'Commissioning & Subsidy Auditing', description: 'Coordinate trial operations, Consent to Operate (CTO) grant, and file for eligible state capital subsidies.' }
    ],
    faqs: [
      {
        question: 'What is the biggest mistake founders make when setting up a factory?',
        answer: 'Beginning civil construction or installing machinery before obtaining Consent to Establish (CTE) and Factory Plan Approval. Doing so leads to stop-work notices, compounding fines, and disqualification from government capital subsidies.'
      }
    ],
    localContext: 'On-the-ground project consulting for industrial corridors and manufacturing clusters.'
  },

  'feasibility-study': {
    metaTitle: 'Techno-Economic Feasibility Studies for MSMEs | Unikorn360',
    metaDescription: 'Comprehensive industrial and commercial techno-economic feasibility studies, financial viability modeling, and risk assessments for new investments.',
    canonicalSlug: 'feasibility-study',
    aliasSlugs: ['project-feasibility', 'market-feasibility-study'],
    ctaButtonText: 'Commission a Feasibility Study',
    processSteps: [
      { step: 1, title: 'Market Demand & Supply Gap Analysis', description: 'Assess regional consumption trends, competitor capacities, pricing dynamics, and raw material availability.' },
      { step: 2, title: 'Technical Feasibility & Capex Estimation', description: 'Scrutinize plant capacity, utility requirements (water/power), civil infrastructure, and machinery quotations.' },
      { step: 3, title: 'Financial Modeling & Sensitivity Analysis', description: 'Build dynamic financial models with Payback Period, Net Present Value (NPV), Internal Rate of Return (IRR), and Break-Even Point.' },
      { step: 4, title: 'Risk Assessment & Recommendation Dossier', description: 'Deliver an executive feasibility report outlining potential operational bottlenecks, regulatory hurdles, and definitive go/no-go recommendations.' }
    ],
    faqs: [
      {
        question: 'When should a business promoter commission a feasibility study?',
        answer: 'Before investing significant capital in purchasing industrial land, committing to heavy machinery imports, or signing long-term lease agreements.'
      }
    ],
    localContext: 'Assessing commercial investment viability for industrial manufacturing and expansion.'
  }
};
