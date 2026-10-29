export interface ResourceGuide {
  id: string;
  slug: string;
  title: string;
  category: 'Compliance' | 'Subsidies' | 'Finance' | 'Industrial' | 'Automation';
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  publishedDate: string;
  summary: string;
  author: string;
  keyTakeaways: string[];
  sections: {
    heading: string;
    subheading?: string;
    content: string[];
    checklistItems?: string[];
    calloutBox?: { title: string; text: string };
  }[];
  relatedServices: string[];
  relatedSolutions: string[];
}

export const RESOURCE_GUIDES: Record<string, ResourceGuide> = {
  'gst-compliance-checklist-tamil-nadu': {
    id: 'gst-compliance-checklist-tamil-nadu',
    slug: 'gst-compliance-checklist-tamil-nadu',
    title: 'Complete GST Compliance Checklist for MSMEs in Tamil Nadu (2025–2026)',
    category: 'Compliance',
    readTime: '8 min read',
    metaTitle: 'MSME GST Compliance Checklist Tamil Nadu | Unikorn360',
    metaDescription: 'Essential GST compliance guide for Tamil Nadu businesses: monthly GSTR-1 & 3B timelines, GSTR-2B ITC reconciliation rules, E-Invoicing, and Rule 37 vendor payment penalties.',
    publishedDate: 'January 2025 (Updated)',
    summary: 'A step-by-step practical guide for manufacturers, wholesalers, and service providers in Tamil Nadu to avoid tax notices, maximize eligible input credit, and eliminate late fee exposure.',
    author: 'Unikorn360 Statutory Compliance Desk',
    keyTakeaways: [
      'Strict monthly timeline: GSTR-1 before 11th, GSTR-3B before 20th',
      'Under Section 16(2)(aa), never claim ITC unless invoice reflects in GSTR-2B',
      'Rule 37: Reversal of ITC + 18% interest if supplier is not paid within 180 days',
      'Mandatory E-Invoicing for taxpayers exceeding ₹5 Crore aggregate turnover in any preceding FY'
    ],
    sections: [
      {
        heading: '1. Monthly & Quarterly Filing Calendar',
        subheading: 'Critical dates every business owner must enforce',
        content: [
          'Late fees and interest on delayed GST payments accumulate rapidly. While the late fee is capped per day per Act, the compounding 18% per annum interest on net tax liability severely impacts cash reserves.',
          'Under the regular monthly scheme, outward sales (GSTR-1) must be finalized by the 11th of every month. For quarterly QRMP filers, the Invoice Furnishing Facility (IFF) is available till the 13th.'
        ],
        checklistItems: [
          '11th of month: GSTR-1 outward supply return filed',
          '13th of month: IFF cutoff for quarterly filers',
          '14th of month: GSTR-2B auto-generation and review',
          '20th of month: GSTR-3B summary return and cash tax offset'
        ]
      },
      {
        heading: '2. The GSTR-2B Reconciliation Protocol',
        subheading: 'How to prevent losing lakhs in uncredited input tax',
        content: [
          'Since the introduction of Section 16(2)(aa) of the CGST Act, Input Tax Credit (ITC) can only be availed if your supplier has uploaded the invoice in their GSTR-1 and it appears in your auto-drafted GSTR-2B.',
          'If you rely solely on purchase bills entered into Tally without checking GSTR-2B, any excess claim will trigger an automated DRC-01B or ASMT-10 scrutiny notice from the department demanding tax repayment plus interest.'
        ],
        calloutBox: {
          title: 'Unikorn360 Operating Rule',
          text: 'Never pay suppliers their final GST portion until the corresponding invoice is verified in your GSTR-2B portal report for the month.'
        }
      },
      {
        heading: '3. Rule 37: The 180-Day Vendor Payment Trap',
        subheading: 'A major cause of unexpected tax recoveries during audits',
        content: [
          'Under Rule 37 of the CGST Rules, if a recipient fails to pay the supplier the invoice value along with tax within 180 days from the invoice date, the ITC availed must be reversed in GSTR-3B along with interest at 18%.',
          'Once the payment is eventually made to the supplier, the ITC can be re-claimed. However, the interest paid to the government is permanently lost.'
        ]
      },
      {
        heading: '4. E-Invoicing & E-Way Bill Synchronization',
        subheading: 'Thresholds applicable to growing enterprises',
        content: [
          'Enterprises with aggregate turnover exceeding ₹5 Crore in any financial year from 2017–18 onwards must mandatorily generate Invoice Reference Numbers (IRN) with a signed QR code via the IRP portal.',
          'B2B invoices issued without an IRN are legally invalid under Rule 48(4), meaning the buyer cannot claim ITC and the supplier faces a penalty of up to ₹25,000 per invoice.'
        ]
      }
    ],
    relatedServices: ['gst-returns', 'itc-reconciliation', 'e-invoicing', 'gst-registration'],
    relatedSolutions: ['run-and-stay-compliant', 'start-a-business']
  },

  'msme-government-subsidy-schemes-tamil-nadu': {
    id: 'msme-government-subsidy-schemes-tamil-nadu',
    slug: 'msme-government-subsidy-schemes-tamil-nadu',
    title: 'Central & Tamil Nadu Government Subsidy Schemes for MSMEs (PMEGP, NEEDS, Capital Subsidy)',
    category: 'Subsidies',
    readTime: '10 min read',
    metaTitle: 'MSME Subsidies in Tamil Nadu (PMEGP, NEEDS, 25% Capital Subsidy) | Unikorn360',
    metaDescription: 'Detailed guide to government subsidies for Tamil Nadu MSMEs: PMEGP 35% margin money, NEEDS ₹75 Lakhs, 25% state capital subsidy, generator subsidy & escalation.',
    publishedDate: 'January 2025',
    summary: 'Everything Tamil Nadu entrepreneurs need to know about securing legitimate central and state subsidies, calculating eligible amounts, avoiding middleman traps, and unlocking stalled claims.',
    author: 'Unikorn360 Government Incentives Team',
    keyTakeaways: [
      'PMEGP provides 25% to 35% margin money subsidy on project costs up to ₹50 Lakhs (Manufacturing)',
      'NEEDS (Tamil Nadu) provides 25% subsidy up to ₹75 Lakhs + 3% interest subvention for educated youth',
      'Tamil Nadu State Capital Subsidy provides 25% subsidy on eligible plant and machinery',
      'Crucial rule: Applications must be initiated before commercial production starts'
    ],
    sections: [
      {
        heading: '1. Prime Minister’s Employment Generation Programme (PMEGP)',
        subheading: 'Central Government Flagship Credit-Linked Scheme',
        content: [
          'Administered by KVIC, PMEGP is one of the most reliable subsidy routes for micro-enterprises. For manufacturing projects up to ₹50 Lakhs and service projects up to ₹20 Lakhs, the government provides margin money assistance deposited directly into a 3-year term deposit in your lending bank.',
          'In rural areas and for special categories (including SC/ST, Women, Minorities, and Ex-servicemen), the subsidy percentage reaches 35% of total project cost. In urban centers, it is 25%.'
        ],
        checklistItems: [
          'Age: Above 18 years (no upper age limit)',
          'Education: Minimum 8th standard pass for manufacturing projects above ₹10L',
          'Own Contribution: 5% for special categories; 10% for general categories',
          'Lock-in Period: 3 years under bank fixed deposit lien'
        ]
      },
      {
        heading: '2. NEEDS Scheme (New Entrepreneur-cum-Enterprise Development Scheme)',
        subheading: 'Tamil Nadu State Government Special Incentive',
        content: [
          'Designed specifically for first-generation educated entrepreneurs in Tamil Nadu, the NEEDS scheme offers 25% subsidy on project costs between ₹10 Lakhs and ₹5 Crores, subject to a maximum subsidy cap of ₹75 Lakhs.',
          'In addition to the capital subsidy, beneficiaries receive a 3% interest subvention on the term loan for the entire repayment tenure, significantly reducing monthly EMI outgo.'
        ]
      },
      {
        heading: '3. Tamil Nadu State MSME Capital Subsidy (25%)',
        subheading: 'Direct assistance on factory plant and machinery',
        content: [
          'Existing or new manufacturing MSMEs installing new plant and machinery in Tamil Nadu are eligible for a 25% capital subsidy on the value of eligible equipment.',
          'Units located in backward industrial blocks or specialized clusters (such as leather in Tirupathur/Ranipet districts) may receive additional special capital subsidies.'
        ]
      },
      {
        heading: '4. How to Recover Stalled or Delayed Subsidies',
        subheading: 'Administrative escalation without paying unauthorized commissions',
        content: [
          'Many genuine MSMEs submit subsidy files that remain stuck for 12 to 24 months in District Industries Centres (DIC) or regional bank offices due to minor clerical mismatches or lack of active follow-up.',
          'Unikorn360 prepares structured administrative appeals, Right to Information (RTI) status inquiries, and Central Public Grievance Redress and Monitoring System (CPGRAMS) escalation petitions to track and unlock stalled subsidy disbursements legally.'
        ]
      }
    ],
    relatedServices: ['pmegp-subsidy', 'needs-scheme', 'capital-subsidy', 'generator-subsidy'],
    relatedSolutions: ['get-business-funding', 'expand-your-business']
  },

  'dpr-preparation-guide-msme-bank-loans': {
    id: 'dpr-preparation-guide-msme-bank-loans',
    slug: 'dpr-preparation-guide-msme-bank-loans',
    title: 'How to Prepare a Bank-Ready Detailed Project Report (DPR) & CMA Data',
    category: 'Finance',
    readTime: '9 min read',
    metaTitle: 'Bank-Ready DPR & CMA Data Preparation Guide for MSMEs | Unikorn360',
    metaDescription: 'Step-by-step framework for preparing bankable DPRs and CMA projections for MSME term loans and working capital in Tamil Nadu.',
    publishedDate: 'February 2025',
    summary: 'A financial architect’s guide to structuring project costs, DSCR calculations, cash flows, and working capital limits that pass bank credit committee scrutiny on the first submission.',
    author: 'Unikorn360 Financial Advisory Desk',
    keyTakeaways: [
      'Credit managers judge viability on Debt Service Coverage Ratio (DSCR), ideally between 1.5 and 2.0',
      'Never copy-paste generic industry financial ratios; projections must balance against your historical GST turnover',
      'Working capital must be justified using the Nayak Committee turnover method (20% bank finance minimum)',
      'Include 3 competitive supplier machinery quotations and architect cost estimates for civil works'
    ],
    sections: [
      {
        heading: '1. What Credit Officers Actually Look For in a DPR',
        subheading: 'Beyond pretty covers and executive summaries',
        content: [
          'When a bank branch credit officer reviews a loan file, they look for answers to three fundamental questions: Can this factory produce and sell the projected volume? Will the cash flow cover principal and interest comfortably? If something goes wrong, what is the security and promoter net worth?',
          'A generic 5-page write-up cannot answer these questions. A bankable DPR includes promoter background, process flowcharts, machine specifications, raw material supplier details, power/water sanction proofs, and 5-year audited financial models.'
        ]
      },
      {
        heading: '2. Building Realistic CMA (Credit Monitoring Arrangement) Projections',
        subheading: 'The mathematical backbone of your loan appraisal',
        content: [
          'CMA data forms the core submission required by all public and private commercial banks. It consists of past audited figures (2-3 years) and projections for the proposed loan tenure.',
          'The most critical ratio is the Average Debt Service Coverage Ratio (DSCR). If DSCR is below 1.25, the bank considers repayment risky. If it is shown as an unrealistic 4.0+, the credit officer suspects artificially inflated margins. A healthy DSCR range is 1.50 to 1.85.'
        ]
      },
      {
        heading: '3. Sizing Working Capital: Nayak vs Tandon Formulas',
        subheading: 'How to prevent your Cash Credit (CC) limit from being cut',
        content: [
          'For MSME manufacturing and trading units with limits up to ₹5–10 Crores, banks apply the Nayak Committee Turnover Method: total working capital requirement is calculated as 25% of projected annual turnover, where the promoter brings in 5% as margin and the bank finances 20%.',
          'For larger or inventory-heavy units, the Traditional MPBF (Maximum Permissible Bank Finance) method applies, assessing raw material holding periods, work-in-progress days, and debtor collection periods.'
        ]
      }
    ],
    relatedServices: ['dpr-preparation', 'cma-data', 'working-capital', 'business-loans'],
    relatedSolutions: ['get-business-funding', 'start-a-business']
  },

  'factory-licence-tnpcb-consent-guide': {
    id: 'factory-licence-tnpcb-consent-guide',
    slug: 'factory-licence-tnpcb-consent-guide',
    title: 'Industrial Licencing in Tamil Nadu: Factory Licence & TNPCB Consent (CTE / CTO) Explained',
    category: 'Industrial',
    readTime: '11 min read',
    metaTitle: 'Factory Licence & TNPCB Clearances Guide Tamil Nadu | Unikorn360',
    metaDescription: 'Complete roadmap for Factory Plan approvals, DIS licences, and TNPCB Consent to Establish (CTE) & Operate (CTO) in Tamil Nadu manufacturing clusters.',
    publishedDate: 'February 2025',
    summary: 'A practical compliance guide for factory promoters, tanners, and manufacturers in Vaniyambadi, Ambur, Ranipet, and across Tamil Nadu navigating environmental and industrial safety approvals.',
    author: 'Unikorn360 Industrial Projects Team',
    keyTakeaways: [
      'Factories Act applies to units with 10+ workers using electric power or 20+ workers without power',
      'TNPCB classifies units into Red, Orange, Green, and White categories based on pollution potential',
      'Never install machinery before obtaining Consent to Establish (CTE)',
      'Consent to Operate (CTO) requires prior zero-liquid discharge (ZLD) or ETP verification in leather clusters'
    ],
    sections: [
      {
        heading: '1. The Factories Act, 1948 Approval Process',
        subheading: 'Plan approval vs Licence to Operate',
        content: [
          'Before constructing a factory shed or installing industrial machinery, blue-print drawings must be submitted to the Directorate of Industrial Safety and Health (DISH) for Plan Approval under Form 1.',
          'The drawings must demonstrate adequate natural lighting, ventilation, emergency escape stairs, minimum working space per employee (14.2 cubic meters), and sanitary facilities.',
          'Once construction is completed, Form 2 is submitted for the grant of Factory Licence in Form 4.'
        ]
      },
      {
        heading: '2. Tamil Nadu Pollution Control Board (TNPCB) Consents',
        subheading: 'CTE vs CTO on the OCMMS Portal',
        content: [
          'Under the Water (Prevention & Control of Pollution) Act and Air Act, all manufacturing units must obtain Consent to Establish (CTE) before beginning site preparation or installing plant equipment.',
          'After plant completion and installation of pollution control devices (Effluent Treatment Plant or Bag Filters), the enterprise must apply for Consent to Operate (CTO) before commercial trials.'
        ]
      },
      {
        heading: '3. Special Cluster Regulations: Vaniyambadi & Palar Valley Basin',
        subheading: 'Leather, footwear, and textile specific environmental requirements',
        content: [
          'The leather tanning and processing cluster in Vaniyambadi, Ambur, and Ranipet is subject to stringent environmental oversight, including mandatory connection to Common Effluent Treatment Plants (CETPs) or individual Zero Liquid Discharge (ZLD) installations.',
          'Unikorn360 works with factory engineers to ensure trade effluent flow diagrams, hazardous waste authorization (Form 1), and water balance sheets comply with both National Green Tribunal (NGT) directives and TNPCB board standards.'
        ]
      }
    ],
    relatedServices: ['factory-licence', 'tnpcb-approvals', 'fire-noc', 'project-feasibility'],
    relatedSolutions: ['expand-your-business', 'run-and-stay-compliant']
  },

  'msme-business-automation-roadmap': {
    id: 'msme-business-automation-roadmap',
    slug: 'msme-business-automation-roadmap',
    title: 'Business Automation Roadmap for MSMEs: Moving from Paper & WhatsApp to Automated Control',
    category: 'Automation',
    readTime: '7 min read',
    metaTitle: 'MSME Business Automation Roadmap | Unikorn360 Systems',
    metaDescription: 'Step-by-step playbook for Indian MSMEs to automate customer order pipelines, WhatsApp billing notices, inventory tracking, and daily owner dashboards.',
    publishedDate: 'March 2025',
    summary: 'How small factory owners and traders can automate 80% of daily clerical routine without hiring software engineers or spending lakhs on complex ERPs.',
    author: 'Unikorn360 AI & Systems Desk',
    keyTakeaways: [
      'Do not buy heavyweight ERPs that your staff will abandon in 30 days',
      'Automate the 3 biggest friction points first: order logging, payment reminders, and dispatch status',
      'Integrate official WhatsApp Business API with Google Sheets to create a zero-friction CRM',
      'Build a single morning executive dashboard so you never have to ask "how much did we collect yesterday?"'
    ],
    sections: [
      {
        heading: '1. The "Human Router" Problem in Small Business',
        subheading: 'Why business owners stay trapped in daily operations',
        content: [
          'In most enterprises with 5 to 50 employees, the promoter acts as the single point of failure. Every price quotation, delivery question, supplier follow-up, and staff payment query routes through the owner’s mobile phone.',
          'This operational bottleneck prevents the founder from focusing on business development, key client relationships, or strategic capacity expansion.'
        ]
      },
      {
        heading: '2. Phase 1: Customer Lead & Order Automation',
        subheading: 'Capturing every enquiry without manual data entry',
        content: [
          'By connecting customer WhatsApp inquiries and website forms into a unified Google Workspace or Notion pipeline, every lead is automatically assigned a tracking ID, quotation template, and follow-up date.',
          'When an order is confirmed, the system auto-generates the proforma invoice and notifies the dispatch supervisor instantly.'
        ]
      },
      {
        heading: '3. Phase 2: Automated Accounts Receivable Pipelines',
        subheading: 'Recovering cash without awkward phone calls',
        content: [
          'Instead of office staff manually dialing customers about overdue invoices, automated polite WhatsApp notifications are triggered 3 days before the due date, on the due date, and at 7-day intervals post-due date with copy of invoice and UPI payment links.',
          'Clients who implement this systematic pipeline consistently reduce their Days Sales Outstanding (DSO) by 18 to 25 days within 90 days of rollout.'
        ]
      },
      {
        heading: '4. Phase 3: The Morning Executive Dashboard',
        subheading: 'One screen on your mobile phone at 8:00 AM',
        content: [
          'Connect billing data, bank balances, dispatch quantities, and pending factory orders into a single executive dashboard. Before walking onto the factory floor, the promoter knows exact cash positions, yesterday’s billings, and today’s delivery commitments.'
        ]
      }
    ],
    relatedServices: ['business-automation', 'business-dashboards', 'crm-setup', 'document-automation'],
    relatedSolutions: ['automate-your-business', 'digitise-your-business']
  }
};
