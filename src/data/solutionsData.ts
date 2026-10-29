export interface SolutionItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  heroTagline: string;
  problemStatement: string;
  solutionOverview: string;
  challengesSolved: { title: string; explanation: string }[];
  stepByStepRoadmap: { step: number; title: string; description: string }[];
  keyDeliverables: string[];
  serviceIds: string[];
  recommendedModel: 'verify' | 'protect' | 'guardian';
  targetBusinesses: string[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
}

export const SOLUTIONS_DATA: Record<string, SolutionItem> = {
  'start-a-business': {
    id: 'start-a-business',
    slug: 'start-a-business',
    title: 'Start a Business with Clean Statutory Architecture',
    shortTitle: 'Start a Business',
    subtitle: 'From entity incorporation and PAN/GST to Udyam, local trade licences, and bank account setup.',
    metaTitle: 'Start a Business | Incorporation & Statutory Architecture | Unikorn360',
    metaDescription: 'Complete new business setup. Entity structure (Proprietorship, LLP, Pvt Ltd), GST, Udyam, trade licence, bank account and seed subsidy assistance.',
    heroTagline: 'Build right from day one — zero missed registrations, zero structural rework.',
    problemStatement: 'Most first-time founders rush into business using the easiest registration rather than the right legal structure. Starting with a sole proprietorship when taking high debts, or registering for GST before setting up proper billing codes, frequently results in tax penalties, banking hurdles, or personal asset liability.',
    solutionOverview: 'Unikorn360 provides an end-to-end launch architecture. We evaluate your capital, co-founders, supplier liabilities, and scale plans to recommend the optimal legal form (Private Limited, LLP, Partnership, or Sole Proprietorship), obtain all initial statutory certificates, secure Udyam priority status, and coordinate your first commercial bank account setup.',
    challengesSolved: [
      {
        title: 'Choosing the wrong legal structure',
        explanation: 'We guide you through the liability, tax rate, and compliance trade-offs of Private Limited, LLP, Partnership, and Proprietorship.'
      },
      {
        title: 'Delayed bank current account opening',
        explanation: 'We assemble the certified resolution, PAN, GST certificate, and Udyam pack so bank branches approve accounts in 48 hours without repeated branch visits.'
      },
      {
        title: 'Missing early-stage subsidy windows',
        explanation: 'Many state and central subsidies (such as NEEDS or PMEGP) must be applied for BEFORE buying machinery or signing lease deeds. We secure your eligibility upfront.'
      },
      {
        title: 'Disorganized trade and local body approvals',
        explanation: 'We handle local panchayat / municipal trade licences, fire safety clearances, and FSSAI if handling food products.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Entity Selection & Name Approval', description: 'Evaluate business model, check name availability on MCA portal, and secure Digital Signature Certificates (DSC).' },
      { step: 2, title: 'Incorporation & Charter Drafting', description: 'Draft Memorandum of Association (MOA), Articles (AOA), or Partnership Deed with clear partner profit/liability clauses.' },
      { step: 3, title: 'Statutory Tax Identifiers', description: 'Secure Company PAN, TAN, and Goods & Services Tax Identification Number (GSTIN) with precise HSN/SAC codes.' },
      { step: 4, title: 'MSME Classification & Local Licencing', description: 'Obtain lifetime Udyam Registration and local Municipal/Panchayat Trade Licences.' },
      { step: 5, title: 'Bank Account & Operational Handover', description: 'Complete bank account opening, board resolution documentation, and set up your initial invoice template.' }
    ],
    keyDeliverables: [
      'Certificate of Incorporation / Registered Deed',
      'Company PAN & TAN Allotment Letters',
      'Form GST REG-06 Certificate',
      'Lifetime Udyam Registration Certificate',
      'Municipal Trade Licence Application Copy',
      'Ready-to-use Corporate Invoice & Quotation Templates'
    ],
    serviceIds: ['company-incorporation', 'gst-registration', 'udyam-registration', 'trade-licence', 'corporate-branding'],
    recommendedModel: 'verify',
    targetBusinesses: ['New Entrepreneurs', 'Spin-off Manufacturing Units', 'First-generation Traders', 'Partnership Formations'],
    faqs: [
      {
        question: 'Should I register a Private Limited Company or a Sole Proprietorship?',
        answer: 'If you have substantial capital, plan to borrow large bank funds, or have partners, a Private Limited Company or LLP offers limited liability protecting your personal home and family assets. If you are starting a low-risk single-owner trading business with minimal credit exposure, a proprietorship is faster and cheaper to maintain. We analyze your specific situation before advising.'
      },
      {
        question: 'How long does it take to start a business from scratch with Unikorn360?',
        answer: 'Typically 7 to 15 business days for complete incorporation, PAN, GST, and Udyam certification, depending on MCA portal approval timelines and Aadhaar OTP verification turnaround.'
      },
      {
        question: 'Can I apply for PMEGP or NEEDS government subsidies for a new business?',
        answer: 'Yes! Both PMEGP (up to 35% margin money subsidy) and NEEDS Tamil Nadu (up to 25% with ₹75L ceiling) are specifically aimed at new enterprises. Crucially, the scheme must be applied for before purchasing commercial equipment.'
      }
    ],
    ctaText: 'Start Your Business Review'
  },

  'run-and-stay-compliant': {
    id: 'run-and-stay-compliant',
    slug: 'run-and-stay-compliant',
    title: 'Run Your Enterprise with Zero Compliance Headaches',
    shortTitle: 'Run & Stay Compliant',
    subtitle: 'Ongoing monthly GST returns, TDS, labour compliance, annual renewals, and notice defense.',
    metaTitle: 'MSME Compliance Retainer | Unikorn360 Protect',
    metaDescription: 'Eliminate tax penalties and factory closure notices. Monthly GST, TDS, EPF, ESI, factory renewals, and department reply management for MSMEs.',
    heroTagline: 'Never carry statutory filing deadlines in your head again.',
    problemStatement: 'Running a busy factory or distribution warehouse leaves zero time to monitor shifting GST notifications, 180-day vendor payment rules, E-way bill portal updates, or annual factory licence renewals. Small businesses frequently accumulate ₹50,000 to ₹3,00,000 annually in avoidable late fees, blocked Input Tax Credit, and department summons.',
    solutionOverview: 'Under the Unikorn360 PROTECT retainer, we take complete custody of statutory compliance. Every month, we reconcile your purchase register against GSTR-2B to save lost tax credits, compute net liability, file GSTR-1 and GSTR-3B on time, process EPF/ESI payroll challans, track annual renewal calendars, and draft professional replies to department notices.',
    challengesSolved: [
      {
        title: 'Losing tens of thousands in missing Input Tax Credit (ITC)',
        explanation: 'Suppliers who fail to file returns or misreport invoices cause your ITC to be rejected in GSTR-2B. We run monthly invoice-level matching so you hold payments to defaulting vendors.'
      },
      {
        title: 'Sudden department notices and demand letters',
        explanation: 'When tax or labour officers issue ASMT-10 or 7A inquiry notices, our advisory desk drafts point-by-point factual replies backed by statutory records.'
      },
      {
        title: 'Lapsed operating licences causing operational stops',
        explanation: 'We maintain an active renewal tracker for Factory Licences, Fire NOCs, TNPCB Consent, and Municipal Trade Licences.'
      },
      {
        title: 'Employee payroll and labour compliance friction',
        explanation: 'We prepare monthly EPF and ESI challans on the Shram Suvidha portal, ensuring worker social security compliance without factory inspection disputes.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Monthly Data Collation (1st–5th)', description: 'Collect sales registers, purchase invoices, credit notes, and bank statements via our secure digital file room.' },
      { step: 2, title: 'GSTR-2B Audit & Reconciliations (6th–10th)', description: 'Perform algorithmic invoice matching to pinpoint vendor defaults before outward GSTR-1 filing.' },
      { step: 3, title: 'Return Filing & Challan Generation (11th–20th)', description: 'File GSTR-1 by the 11th, calculate cash tax offset, and submit GSTR-3B by the 20th with advance payment instructions.' },
      { step: 4, title: 'Payroll & Statutory Remittances (15th)', description: 'Generate EPF Electronic Challan-cum-Return (ECR) and ESI monthly contributions.' },
      { step: 5, title: 'Executive Health Summary & Notice Support', description: 'Deliver a one-page monthly compliance scorecard showing tax paid, ITC recovered, and upcoming licence renewals.' }
    ],
    keyDeliverables: [
      'Filed GSTR-1 and GSTR-3B Acknowledgement Receipts',
      'Monthly GSTR-2B vs Books Variance & Vendor Default Report',
      'EPF & ESI Monthly Challan Remittance Receipts',
      'Statutory Renewal Calendar with 60-Day Advance Alerts',
      'Legal Replies to Tax & Labour Inquiries'
    ],
    serviceIds: ['gst-returns', 'itc-reconciliation', 'labour-epf-esi', 'factory-licence', 'roc-compliance'],
    recommendedModel: 'protect',
    targetBusinesses: ['Active Manufacturers', 'Wholesale Distributors', 'Job-work Units', 'Growing Retail Establishments'],
    faqs: [
      {
        question: 'What happens if a vendor does not upload their invoice in GSTR-1?',
        answer: 'Under Section 16(2)(aa) of the CGST Act, you cannot legally claim ITC unless the invoice appears in your GSTR-2B. We flag these missing invoices every month so you can immediately notify the vendor or withhold their payment until they upload.'
      },
      {
        question: 'Do you represent us if we receive a GST notice or scrutiny order?',
        answer: 'Yes. We review the notice, reconcile the historical books, prepare a written factual rebuttal with annexures, and guide you or your accountant through personal hearings if required.'
      },
      {
        question: 'Is your retainer fee fixed or variable?',
        answer: 'Our retainers are pre-agreed monthly fees based strictly on transaction volume and service scope. We give you a written scope document before any engagement — there are never hidden billing surprises.'
      }
    ],
    ctaText: 'Switch to a Protect Retainer'
  },

  'get-business-funding': {
    id: 'get-business-funding',
    slug: 'get-business-funding',
    title: 'Secure MSME Bank Funding & Working Capital',
    shortTitle: 'Get Business Funding',
    subtitle: 'Bank-ready Detailed Project Reports (DPR), CMA data, term loans, working capital enhancement & subsidies.',
    metaTitle: 'MSME Loan Support & DPR Preparation | Unikorn360',
    metaDescription: 'Get your bank loan approved. Detailed Project Reports (DPR), CMA data preparation, working capital assessment, and subsidy assistance.',
    heroTagline: 'Speak the language bank credit managers respect.',
    problemStatement: 'Over 65% of MSME loan applications are delayed or rejected not because the business lacks merit, but because the loan application package is poorly prepared. Hand-written project reports, unrealistic revenue projections, missing DSCR ratios, and improperly justified working capital cycles cause credit appraisal teams to return files.',
    solutionOverview: 'Unikorn360 bridges the gap between your real factory operations and bank credit expectations. We prepare comprehensive Detailed Project Reports (DPR), realistic Credit Monitoring Arrangement (CMA) projections for 5 to 7 years, compute working capital drawing power, and integrate eligible government subsidies (like PMEGP or Tamil Nadu Capital Subsidy) to lower your debt burden.',
    challengesSolved: [
      {
        title: 'Bank credit managers rejecting unformatted project reports',
        explanation: 'We build institutional-grade DPRs containing complete technical, financial, and market feasibility analysis conforming to SIDBI and commercial banking norms.'
      },
      {
        title: 'CMA data projections that fail banking scrutiny',
        explanation: 'We balance historical audited statements with projected balance sheets, profit & loss, cash flows, and Debt Service Coverage Ratios (DSCR) that pass credit committee validation.'
      },
      {
        title: 'Insufficient working capital limits choking production',
        explanation: 'We analyze inventory holding days and debtor collection cycles to justify higher Cash Credit (CC) / Overdraft (OD) limits under the Nayak Committee turnover method.'
      },
      {
        title: 'Leaving lakhs in government interest and capital subsidies on the table',
        explanation: 'We link your loan application with PMEGP (up to 35% margin money) or NEEDS (up to 25%) to reduce net equity requirements.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Financial Diagnostic & Borrowing Capacity Scan', description: 'Review 3 years of audited balance sheets, ITRs, GST turnover, and current banking limits.' },
      { step: 2, title: 'Technical Feasibility & Cost Assessment', description: 'Consolidate supplier quotes for machinery, civil construction estimates, and raw material working capital margins.' },
      { step: 3, title: 'CMA Data Model & Financial Projections', description: 'Construct a 5–7 year financial projection model calculating DSCR, BEP, IRR, and Cash Flow sensitivity.' },
      { step: 4, title: 'DPR Compilation & Subsidy Integration', description: 'Draft the comprehensive project document and file online subsidy applications under PMEGP/NEEDS.' },
      { step: 5, title: 'Bank Liaison & Clarification Replies', description: 'Coordinate with the Chief Manager / Credit Officer to resolve queries during inspection and file appraisal.' }
    ],
    keyDeliverables: [
      'Bank-Ready Detailed Project Report (DPR)',
      'Certified 5–7 Year CMA Data Projection Workbook',
      'Debt Service Coverage Ratio (DSCR) & Sensitivity Analysis',
      'PMEGP / NEEDS Online Portal Subsidy Application Pack',
      'Credit Committee Query Clarification Docket'
    ],
    serviceIds: ['dpr-preparation', 'cma-data', 'working-capital', 'pmegp-subsidy', 'needs-scheme', 'term-loans'],
    recommendedModel: 'verify',
    targetBusinesses: ['Manufacturing Units expanding machinery', 'Tanneries modernizing effluent plants', 'Traders expanding inventory', 'New Industrial Startups'],
    faqs: [
      {
        question: 'What is the difference between a simple project report and a bank-grade DPR?',
        answer: 'A simple project report is often a generic 5-page summary that banks dismiss. A bank-grade DPR prepared by Unikorn360 includes plant layout details, supplier machinery specifications, raw material availability analysis, manpower schedule, 5-year projected profit & loss, balance sheets, cash flow statements, break-even analysis, and DSCR metrics that credit appraisal teams require.'
      },
      {
        question: 'How do you help if our working capital limit is stuck or under-assessed?',
        answer: 'We review your operating cycle (raw material holding, work-in-progress, finished goods, and debtor turnover days) and present a structured re-assessment note using the Nayak Committee turnover method or Tandon Committee MPBF method to convince the bank to sanction appropriate limits.'
      },
      {
        question: 'Can Unikorn360 guarantee loan approval?',
        answer: 'No consultant can legally guarantee loan sanction, as sanction is the sole prerogative of the lending bank. What we guarantee is a thoroughly documented, mathematically consistent, bank-compliant DPR and CMA file that gives your application the highest possible chance of approval.'
      }
    ],
    ctaText: 'Request DPR & Funding Consultation'
  },

  'digitise-your-business': {
    id: 'digitise-your-business',
    slug: 'digitise-your-business',
    title: 'Digitise Your Core Records & Documentation',
    shortTitle: 'Digitise Your Business',
    subtitle: 'Secure digital file vault, searchable document indexing, cloud backup, and digital signature custody.',
    metaTitle: 'MSME Document Digitisation & Digital Vault | Unikorn360',
    metaDescription: 'Organize your business records. Paperless enterprise indexing, secure cloud file room, title deeds, factory licences, and digital signature management.',
    heroTagline: 'Never waste 3 hours hunting for a land deed or pollution clearance again.',
    problemStatement: 'In most MSMEs, vital business records — property title deeds, factory approvals, partnership deeds, GST registration orders, loan sanction letters, and supplier contracts — are scattered across dusty physical file cabinets, old computers, and personal WhatsApp chats. When a bank audit, tax inspector, or buyer demands a record, hours are lost searching.',
    solutionOverview: 'Unikorn360 builds your enterprise Digital Control Vault. We organize, scan, high-resolution index, and secure your company’s entire historical and active documentation into a categorized, searchable digital structure. Access any licence, property deed, or tax order in 15 seconds from your phone, with bank-grade encryption and access controls.',
    challengesSolved: [
      {
        title: 'Lost statutory licences and expensive duplicate charges',
        explanation: 'Misplaced factory licences or fire safety approvals can delay bank renewals or attract inspection penalties. We create indexed permanent digital copies.'
      },
      {
        title: 'Physical document degradation and fire risk',
        explanation: 'We systematically scan, clean, and catalog original title deeds, board resolutions, and certificates into a secure, encrypted digital file room.'
      },
      {
        title: 'Confusion over active vs outdated versions',
        explanation: 'We implement standardized version naming and folder hierarchies so staff never send obsolete GST certificates or revoked power of attorneys.'
      },
      {
        title: 'Expired Digital Signature Certificates (DSC) halting filings',
        explanation: 'We track Class 3 DSC validity for directors and partners, renewing them seamlessly before MCA or GST portals lock you out.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Document Audit & Physical Inventory', description: 'Collect and categorise physical files into Statutory, Financial, Legal, Operational, and HR archives.' },
      { step: 2, title: 'High-Resolution OCR Digitisation', description: 'Scan all multi-page certificates, blueprint plans, and deeds into searchable PDF formats with optical text recognition.' },
      { step: 3, title: 'Structured Indexing & Folder Taxonomy', description: 'Deploy the Unikorn360 Enterprise Directory structure with clear metadata tags and search keywords.' },
      { step: 4, title: 'Secure Vault Setup & Access Permissions', description: 'Establish encrypted cloud storage with role-based owner and accountant access permissions.' },
      { step: 5, title: 'Owner Mobile Access & Handover Training', description: 'Configure smartphone access for the promoter and train internal staff on standard filing conventions.' }
    ],
    keyDeliverables: [
      'Complete Categorised Enterprise Digital Vault',
      'Searchable Master Document Register (Excel & Cloud)',
      'Digital Signature (DSC) Class 3 Tokens & Custody Log',
      'Standard Operating Procedure (SOP) for Daily Filing',
      'Secure Offline Encrypted Backup Drive'
    ],
    serviceIds: ['document-digitisation', 'digital-file-room', 'dsc-issuance', 'corporate-profile', 'compliance-audit'],
    recommendedModel: 'verify',
    targetBusinesses: ['Multi-generational Family Enterprises', 'Manufacturing Plants with 10+ years of paperwork', 'High-volume Trading Firms'],
    faqs: [
      {
        question: 'Are digital copies of statutory licences accepted by government departments?',
        answer: 'Yes! Most central and state departments (GST, MCA, Udyam, TNPCB, EPF) now issue digitally signed certificates and recognize authenticated electronic PDF copies for verification and renewal.'
      },
      {
        question: 'How do you ensure our confidential business information remains secure?',
        answer: 'Unikorn360 executes a binding Non-Disclosure Agreement (NDA) before touching any client documents. Your files are encrypted using 256-bit AES storage standards with two-factor authentication access granted strictly to authorized individuals.'
      }
    ],
    ctaText: 'Digitise Your Business Records'
  },

  'automate-your-business': {
    id: 'automate-your-business',
    slug: 'automate-your-business',
    title: 'Automate Workflows & Build Real-Time Owner Dashboards',
    shortTitle: 'Automate Your Business',
    subtitle: 'Move beyond scattered WhatsApp chats and manual registers to automated order tracking and live MIS.',
    metaTitle: 'MSME Business Automation & Dashboards | Unikorn360',
    metaDescription: 'Eliminate manual bottlenecks. WhatsApp order automation, payment reminder pipelines, inventory tracking, and real-time business dashboards for MSMEs.',
    heroTagline: 'Stop chasing employees for basic daily numbers.',
    problemStatement: 'Most business owners spend 60% of their working day acting as human routers — answering phone calls about dispatch statuses, manually calculating daily production, checking who owes overdue payments, and typing WhatsApp messages to customers. When the promoter leaves the premises, operations slow down.',
    solutionOverview: 'Unikorn360 builds practical, low-friction automation systems tailored specifically for Indian MSMEs. We integrate WhatsApp Business automation, customer inquiry pipelines, automated overdue payment reminders, and live executive dashboards that display sales, production, receivables, and cash balances on your phone every morning.',
    challengesSolved: [
      {
        title: 'Customer orders and enquiries lost in personal WhatsApp chats',
        explanation: 'We configure structured inquiry capture and auto-acknowledgement workflows so sales leads are tracked systematically from quote to dispatch.'
      },
      {
        title: 'Overdue receivables choking liquidity',
        explanation: 'Automated polite payment reminders sent via WhatsApp and email on due dates, reducing collection cycles by 15 to 30 days.'
      },
      {
        title: 'Lack of daily operational visibility for the owner',
        explanation: 'Custom Google Sheets / Power BI dashboards connecting billing data, bank balances, and factory dispatches into a single morning overview.'
      },
      {
        title: 'Repetitive clerical work wasting staff hours',
        explanation: 'Automating invoice generation, quotation formatting, and delivery challans, cutting administrative time by 70%.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Workflow & Bottleneck Audit', description: 'Map how customer orders, dispatches, invoices, and payments currently move through your office.' },
      { step: 2, title: 'System Blueprint & Tool Selection', description: 'Design simple, cost-effective automation using tools your team already knows (WhatsApp API, Google Workspace, Zapier/Make).' },
      { step: 3, title: 'Pipeline & Reminder Automation', description: 'Set up automated lead capture, quotation follow-ups, and automated payment reminder triggers.' },
      { step: 4, title: 'Executive MIS Dashboard Build', description: 'Connect accounting registers and dispatch logs into a real-time visual control dashboard.' },
      { step: 5, title: 'Staff Training & Go-Live', description: 'Conduct hands-on training with office staff to ensure 100% daily adoption.' }
    ],
    keyDeliverables: [
      'Automated WhatsApp Inquiry & Dispatch System',
      'Automated Overdue Payment Reminder Pipeline',
      'Live Owner Business Control Center Dashboard',
      'Standardized Quotation & Purchase Order Generators',
      'Staff Training Video & Quick-Reference Cheatsheet'
    ],
    serviceIds: ['business-automation', 'business-dashboards', 'crm-setup', 'inventory-systems', 'document-automation'],
    recommendedModel: 'guardian',
    targetBusinesses: ['Manufacturers with 10–50 workers', 'Distributors with multiple sales reps', 'Job-work service centers'],
    faqs: [
      {
        question: 'Do we need to buy expensive ERP software like SAP or Salesforce?',
        answer: 'No! Most MSMEs struggle with expensive ERPs because they are too complicated for factory staff to use. We build lightweight, intuitive automations on top of tools you already use (like WhatsApp, Google Workspace, and smart forms) costing a fraction of legacy ERPs.'
      },
      {
        question: 'Will our non-technical staff be able to use these automations?',
        answer: 'Yes. Every automation is designed with simplicity as the first rule. If your team knows how to send a WhatsApp message or type into a clean form, they can run the system effortlessly.'
      }
    ],
    ctaText: 'Explore Business Automation'
  },

  'expand-your-business': {
    id: 'expand-your-business',
    slug: 'expand-your-business',
    title: 'Expand Production, Factory Facilities & Market Reach',
    shortTitle: 'Expand Your Business',
    subtitle: 'Industrial feasibility studies, factory licensing, TNPCB consent, machinery procurement, and subsidies.',
    metaTitle: 'MSME Factory Expansion & Project Consulting | Unikorn360',
    metaDescription: 'End-to-end guidance for factory setup, machinery expansion, environmental clearances, and industrial capital subsidies.',
    heroTagline: 'Expand your factory footprint with zero regulatory friction.',
    problemStatement: 'Expanding from a small workshop to a licensed industrial factory or setting up a secondary manufacturing line involves a maze of government departments: Directorate of Industrial Safety (DIS), Tamil Nadu Pollution Control Board (TNPCB), Local Planning Authorities, Fire & Rescue Services, and TANGEDCO power sanctioning. A single misstep can delay commissioning by 6 to 12 months.',
    solutionOverview: 'Unikorn360 serves as your outsourced project management and statutory liaison team. From initial techno-economic feasibility studies and civil plan scrutiny to plant layout design, machinery procurement evaluation, TNPCB Consent to Establish (CTE), Factory Building approvals, and 25% State Capital Subsidy claims, we drive your expansion from concept to commercial production.',
    challengesSolved: [
      {
        title: 'Regulatory delays in pollution and factory clearances',
        explanation: 'We prepare technical effluent balance sheets, emission charts, and architectural drawings to secure prompt TNPCB CTE and Factory Plan approvals.'
      },
      {
        title: 'Capital budget overruns during plant construction',
        explanation: 'We prepare phased project timelines and capital expenditure cash flows, preventing unexpected working capital shortfalls during construction.'
      },
      {
        title: 'Missing out on the 25% Tamil Nadu MSME Capital Subsidy',
        explanation: 'Tamil Nadu offers up to ₹1.5 Crore in capital subsidy on eligible plant and machinery. Applications must strictly adhere to DIC timelines after machinery installation.'
      },
      {
        title: 'Power load sanctions and transformer clearances',
        explanation: 'We assist with TANGEDCO industrial HT/LT power load applications and generator subsidy documentation.'
      }
    ],
    stepByStepRoadmap: [
      { step: 1, title: 'Techno-Economic Feasibility & Land Check', description: 'Review proposed industrial plot, zoning classification, water/power availability, and initial capex estimates.' },
      { step: 2, title: 'Architectural Blueprint & Machine Layout', description: 'Design industrial layout matching Factories Act specifications for ventilation, worker spacing, and fire exits.' },
      { step: 3, title: 'Statutory CTE & Plan Filings', description: 'Submit applications on TNPCB OCMMS portal and Industrial Safety Directorate for Consent to Establish and Plan Approval.' },
      { step: 4, title: 'Machinery Procurement & Installation Tracking', description: 'Validate machinery vendor commercial invoices and test certificates for bank loan drawdowns and subsidy auditing.' },
      { step: 5, title: 'Consent to Operate (CTO) & Subsidy Claims', description: 'Conduct joint department inspection, obtain CTO, and lodge 25% State Capital Subsidy claim with the District Industries Centre (DIC).' }
    ],
    keyDeliverables: [
      'Comprehensive Project Feasibility & Capex Report',
      'TNPCB Consent to Establish (CTE) & Consent to Operate (CTO)',
      'Approved Factory Building & Machinery Layout Plan',
      'Fire & Rescue Services NOC Certificate',
      'Tamil Nadu State Capital Subsidy (25%) Filing Docket'
    ],
    serviceIds: ['project-feasibility', 'tnpcb-approvals', 'factory-licence', 'capital-subsidy', 'fire-noc', 'generator-subsidy'],
    recommendedModel: 'guardian',
    targetBusinesses: ['Expanding Leather & Footwear Factories', 'Food Processing Facilities', 'Chemical & Dyeing Plants', 'Engineering Fabrication Units'],
    faqs: [
      {
        question: 'When should we contact Unikorn360 for an expansion project?',
        answer: 'Ideally before purchasing industrial land or placing machinery orders. Land zoning (commercial vs industrial), proximity to water bodies (for TNPCB red/orange categories), and power availability determine project feasibility.'
      },
      {
        question: 'How much capital subsidy can our business receive in Tamil Nadu?',
        answer: 'Under the Tamil Nadu Micro, Small and Medium Enterprises Policy, eligible manufacturing enterprises can receive a 25% capital subsidy on the value of eligible plant and machinery, subject to specific caps and location incentives.'
      }
    ],
    ctaText: 'Plan Your Factory Expansion'
  }
};
