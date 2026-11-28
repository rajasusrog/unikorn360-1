import type { ServicePageEditorialContent } from '../types/database';

/**
 * Customer-facing scope and planning guidance for the canonical seed service catalogue.
 * This content is joined to each ServiceCatalogItem by canonical slug in seedData.ts.
 * Timelines are estimates only; signed proposals remain the source of contractual dates.
 */
export const SERVICE_PAGE_CONTENT: Record<string, ServicePageEditorialContent> = 
{
  "website-development": {
    "description": "A professional, mobile-friendly website that explains what your business does, showcases your products or services, and gives prospective customers a clear way to contact you.",
    "scope": [
      "Confirm the website objective, target customers and key enquiries the site should generate.",
      "Agree the sitemap, page count, navigation and content responsibilities before design begins.",
      "Design and develop the agreed responsive pages for desktop, tablet and mobile.",
      "Configure agreed contact forms, WhatsApp links and enquiry routing.",
      "Apply agreed on-page technical SEO basics, page titles, metadata and suitable structured data.",
      "Test the agreed browsers and screen sizes, then deploy to the client-approved hosting environment."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks for a standard 5–10 page website after content, assets and access are available. More pages, multiple languages, integrations or delayed approvals extend the schedule."
  },
  "ecommerce-development": {
    "description": "An online store or ordering portal where customers can browse your products, select quantities, place orders and complete the agreed payment or enquiry process.",
    "scope": [
      "Map product categories, variants, SKUs, tax fields, stock rules and customer types.",
      "Build the agreed storefront, product detail pages, search/filtering and cart or order enquiry flow.",
      "Configure customer accounts and dealer/retail pricing rules where included.",
      "Integrate one agreed payment gateway or payment workflow, subject to provider approval.",
      "Configure order notifications and the agreed invoice/document workflow.",
      "Test representative product, checkout, payment and order scenarios before handover."
    ],
    "timeline": "Indicative planning estimate: 4–8 weeks for a defined catalogue and standard checkout. Large catalogues, complex dealer pricing, shipping rules and ERP feeds require a separate estimate."
  },
  "custom-web-applications": {
    "description": "A browser-based business tool built around your actual workflow—for example, preparing quotations, tracking jobs, managing stock or giving customers access to selected information.",
    "scope": [
      "Document the current process, user roles, inputs, calculations, approvals and reports.",
      "Agree a functional specification and screen flow before development.",
      "Design the database and build the agreed front-end and back-end modules.",
      "Configure user authentication, role permissions and activity records appropriate to the scope.",
      "Import only the agreed data set and validate sample records with the client.",
      "Test with nominated users, fix agreed defects and deploy the application."
    ],
    "timeline": "Indicative planning estimate: 4–10 weeks for a small-to-medium defined application. Number of modules, approval complexity, data migration and integrations determine the final schedule."
  },
  "mobile-app-development": {
    "description": "A mobile application for customers or employees to complete agreed tasks from a phone, such as field reporting, service requests, order tracking or customer engagement.",
    "scope": [
      "Confirm whether the requirement is Android, iOS or cross-platform and identify the essential user journeys.",
      "Design mobile screens and agree offline, location, camera and notification requirements.",
      "Build the agreed app and connect it to the specified backend/API.",
      "Implement only the device permissions and integrations approved in the specification.",
      "Test on the agreed representative devices and resolve in-scope defects.",
      "Assist with store submission using client-owned publisher accounts, subject to store review."
    ],
    "timeline": "Indicative planning estimate: 8–16 weeks for a defined first release. Complex features, two-platform requirements, offline behaviour and store review can extend delivery."
  },
  "saas-mvp-development": {
    "description": "A first usable version of your software product, focused on the smallest set of features needed to test the idea with real users.",
    "scope": [
      "Clarify the target user, problem, core value proposition and success measure.",
      "Separate launch-critical features from later roadmap ideas.",
      "Define user roles, data ownership, subscription or payment approach and basic operating model.",
      "Build the agreed MVP, including authentication and tenant separation where required.",
      "Connect one agreed billing provider only if subscription billing is in scope.",
      "Run a pilot with nominated users, resolve agreed launch blockers and hand over the codebase."
    ],
    "timeline": "Indicative planning estimate: 4–8 weeks for a tightly bounded MVP; more complex products need a phased plan. The estimate starts after requirements and access are ready."
  },
  "api-system-integration": {
    "description": "A connection between the software tools you already use, so agreed information can move between them without staff repeatedly copying and re-entering data.",
    "scope": [
      "Map the source system, destination system, data fields and trigger for each integration.",
      "Check documented API availability, permissions, limits and vendor requirements.",
      "Build the agreed connector, middleware or webhook handler.",
      "Configure authentication, field mapping, error handling and retry behaviour appropriate to the scope.",
      "Test normal, duplicate, delayed and failed transactions using test data.",
      "Document the data flow, credential ownership and operational checks."
    ],
    "timeline": "Indicative planning estimate: 1–4 weeks for one to three standard API connections. Legacy systems, poor documentation, rate limits and complex synchronisation require additional time."
  },
  "website-application-security-review": {
    "description": "A structured review of an existing website or web application to identify security weaknesses, explain their impact and prioritise practical fixes.",
    "scope": [
      "Agree the exact domain, application, environment, test window and permitted testing methods in writing.",
      "Review the agreed application surface, authentication, authorisation, input handling, configuration and common web risks.",
      "Use non-destructive checks and limited proof-of-concept validation within the authorised scope.",
      "Rate findings by severity and explain business impact and recommended remediation.",
      "Conduct a findings walkthrough with the nominated technical contact.",
      "Perform a retest only if it is explicitly included in the agreed scope."
    ],
    "timeline": "Indicative planning estimate: 3–7 working days for a defined small-to-medium web application after access and written authorisation. Large scopes are estimated separately."
  },
  "ai-generated-code-security-review": {
    "description": "A review of software code created with AI coding tools or rapid prototyping platforms, focused on finding security and production-readiness issues before launch.",
    "scope": [
      "Review the agreed source repository, application architecture and deployment configuration.",
      "Inspect authentication, authorisation, input validation, secret handling, dependencies and data access paths.",
      "Check environment-variable patterns and identify secrets accidentally committed or exposed in client-side code.",
      "Review selected critical workflows and database access rules.",
      "Classify findings by severity and provide remediation steps.",
      "Walk through findings with the client’s developer or technical owner."
    ],
    "timeline": "Indicative planning estimate: 3–7 working days for a small-to-medium repository. Repository size, integrations and deployment complexity affect the schedule."
  },
  "api-security-review": {
    "description": "A focused security review of your application programming interfaces (APIs), checking whether only the right users and systems can access the right data and actions.",
    "scope": [
      "Agree the API base URLs, endpoint list, test environment, permitted methods and written authorisation.",
      "Review authentication, token handling, access controls and object-level permissions.",
      "Test agreed endpoints using role-specific test accounts.",
      "Review rate limiting, input validation, error responses and sensitive data exposure.",
      "Record evidence and practical remediation recommendations.",
      "Retest only the agreed fixes if included in the purchase scope."
    ],
    "timeline": "Indicative planning estimate: 3–7 working days for a bounded API surface. Endpoint count, authentication patterns and microservice architecture may extend the period."
  },
  "database-supabase-security-review": {
    "description": "A review of your database access rules and storage permissions to check whether private business or customer data is protected from unauthorised access.",
    "scope": [
      "Inventory the agreed database tables, roles, policies and storage buckets.",
      "Review Row Level Security (RLS) policies and test representative user-role access paths.",
      "Inspect service keys, client configuration and secret exposure patterns.",
      "Review storage access rules and the documented backup/recovery approach.",
      "Identify gaps and provide corrective policy recommendations.",
      "Prepare SQL changes for review and application only where explicitly included."
    ],
    "timeline": "Indicative planning estimate: 3–7 working days for a small-to-medium database. Table count, policies, storage use and environment complexity affect delivery."
  },
  "cloud-server-hardening": {
    "description": "A configuration review and hardening service for an agreed cloud server, intended to reduce unnecessary exposure and improve basic access, patching and backup practices.",
    "scope": [
      "Review the agreed server, operating system, exposed services and current access methods.",
      "Agree a maintenance window, backup/rollback method and change plan.",
      "Apply agreed access controls such as SSH key use and restricted administrative access.",
      "Configure firewall rules and basic intrusion-blocking controls appropriate to the server.",
      "Review patching, TLS and backup configuration.",
      "Verify agreed services after changes and document the configuration."
    ],
    "timeline": "Indicative planning estimate: 2–5 working days for one standard Linux server. Multiple servers, legacy applications and change approvals require a separate schedule."
  },
  "website-application-maintenance": {
    "description": "Scheduled technical care for an existing website or application, covering agreed updates, backups, uptime checks and support tasks so problems can be identified and handled more consistently.",
    "scope": [
      "Complete an onboarding review of the platform, dependencies, hosting and backup condition.",
      "Agree the monthly maintenance checklist, support hours, response targets and escalation contacts.",
      "Apply approved core, plugin or dependency updates within the supported stack.",
      "Configure or check backups and basic uptime monitoring where tools and permissions allow.",
      "Handle support tasks within the agreed monthly hour allowance.",
      "Provide a monthly activity and issue summary."
    ],
    "timeline": "Ongoing monthly engagement. Indicative onboarding: 3–5 working days after access and baseline review; recurring work follows the agreed maintenance calendar."
  },
  "seo-local-search": {
    "description": "Improvements that help search engines understand your website and help nearby or relevant customers find your business when they search for the products or services you offer.",
    "scope": [
      "Review the website, existing search performance and agreed target locations/services.",
      "Prepare a keyword and page-intent map based on the agreed business offer.",
      "Address agreed technical and on-page issues such as titles, headings, internal links and indexability.",
      "Review Google Business Profile information and recommend or make approved updates.",
      "Identify relevant local directory/citation consistency issues.",
      "Provide periodic progress reporting using available search data."
    ],
    "timeline": "Indicative setup: 2–4 weeks for baseline audit and first optimisation batch. SEO is ongoing; meaningful search movement commonly requires multiple months and is not guaranteed."
  },
  "paid-advertising-management": {
    "description": "Planning, setup and ongoing management of paid campaigns on agreed platforms such as Meta or Google, with tracking and regular reporting against the business goal.",
    "scope": [
      "Confirm the campaign objective, audience, geography, offer, budget and conversion action.",
      "Review the ad account and tracking readiness.",
      "Prepare campaign structure, audience settings, ad copy and creative direction.",
      "Configure campaigns after client approval and platform policy review.",
      "Monitor delivery and make agreed optimisation changes.",
      "Report spend, reach, clicks, leads or conversions using available tracking data."
    ],
    "timeline": "Indicative setup: 1–2 weeks after access, creative and landing page are ready. Campaign optimisation is ongoing and depends on budget, approval times and data volume."
  },
  "social-media-content-management": {
    "description": "A planned stream of business-focused social content, with agreed designs, captions and a publishing calendar to keep your company’s channels current and consistent.",
    "scope": [
      "Confirm target audience, brand voice, approved channels and monthly content themes.",
      "Prepare a monthly publishing calendar and content concepts.",
      "Create the agreed number and format of static posts, carousels or captions.",
      "Submit content for client review and make the agreed revision round.",
      "Publish or schedule approved content where platform access allows.",
      "Summarise available reach, engagement and content performance."
    ],
    "timeline": "Indicative onboarding: 1–2 weeks for brand intake and first calendar. Delivery then follows a monthly approval and publishing cycle."
  },
  "ugc-content-production": {
    "description": "Short-form product or service videos made in a natural, creator-style format for agreed social media and advertising uses.",
    "scope": [
      "Agree campaign objective, audience, key message, required claims and video formats.",
      "Develop scripts and opening-hook options for client approval.",
      "Source suitable creators or production resources for the agreed brief.",
      "Coordinate sample delivery, filming and one agreed feedback/revision process.",
      "Edit and deliver the approved video files and captions.",
      "Document the usage rights included in the creator agreement."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks per content batch after brief approval and sample availability. Creator scheduling, shipping and reshoots may extend it."
  },
  "influencer-campaign-management": {
    "description": "Planning and coordination of creator collaborations, from shortlisting and briefing through content review and campaign reporting.",
    "scope": [
      "Define campaign goal, geography, audience, budget and success measures.",
      "Research creators using available public information and prepare a shortlist with fit indicators.",
      "Coordinate client approval, creator brief, deliverables and commercial terms.",
      "Track agreed content milestones and conduct a brand-safety/content check before publication.",
      "Collect available reach, engagement and link/conversion data after the campaign.",
      "Prepare a post-campaign summary and recommendations."
    ],
    "timeline": "Indicative planning estimate: 3–6 weeks from brief to post-campaign reporting for a small campaign. Creator calendars, shipping and approval cycles affect timing."
  },
  "marketing-tracking-reporting": {
    "description": "A measurement setup that helps you understand where website visits and enquiries come from and which agreed marketing actions are producing measurable results.",
    "scope": [
      "Agree business conversions such as form submissions, calls, purchases or qualified leads.",
      "Review current analytics tags, consent requirements and platform access.",
      "Configure the agreed GA4, Tag Manager, pixel or conversion events.",
      "Set up a consistent UTM naming convention for campaign links.",
      "Connect agreed data sources to a basic reporting view where available.",
      "Test events and document known tracking limitations."
    ],
    "timeline": "Indicative planning estimate: 1–3 weeks for a standard website and a small number of channels. Multi-domain and server-side tracking require separate scoping."
  },
  "ai-chatbots-knowledge-assistants": {
    "description": "A question-and-answer assistant that uses your approved company information—such as product catalogues, policies and operating procedures—to help customers or staff find relevant answers.",
    "scope": [
      "Choose the intended users, channels and question types the assistant should handle.",
      "Review and organise the approved source documents and identify outdated/conflicting material.",
      "Configure document ingestion and retrieval so answers can be grounded in the supplied knowledge base.",
      "Design the agreed web or internal interface and fallback behaviour for unanswered questions.",
      "Test representative questions, citations/source references and escalation paths.",
      "Provide an update process for replacing or adding approved knowledge documents."
    ],
    "timeline": "Indicative planning estimate: 2–5 weeks for a focused knowledge assistant with a defined document set and one interface. Data cleanup and integrations can extend delivery."
  },
  "custom-ai-agents": {
    "description": "A controlled AI-assisted workflow that can prepare information or carry out agreed steps in connected tools, with approval checkpoints for sensitive actions.",
    "scope": [
      "Select one workflow and document its trigger, inputs, decisions, allowed actions and exception paths.",
      "Define tools/data the agent may access and actions that always require human approval.",
      "Build the agent workflow and connect only the agreed systems.",
      "Configure permissions, action logs, failure handling and manual handover.",
      "Test normal, edge and unsafe/unauthorised scenarios in a non-production environment.",
      "Deploy within agreed limits and train nominated operators."
    ],
    "timeline": "Indicative planning estimate: 4–10 weeks for one bounded workflow. Integrations, approvals, data quality and risk controls determine the final schedule."
  },
  "business-workflow-automation": {
    "description": "Automation of a defined business process so information and tasks move between people and software systems with fewer manual hand-offs.",
    "scope": [
      "Map the current workflow, systems, users, triggers and exceptions.",
      "Identify steps suitable for automation and steps that must remain human-approved.",
      "Configure agreed triggers, rules, notifications and system connections.",
      "Add basic failure alerts, retry behaviour and owner escalation where supported.",
      "Test with representative data and verify duplicate/failed event handling.",
      "Document the workflow and handover process."
    ],
    "timeline": "Indicative planning estimate: 2–6 weeks for one or a small group of related workflows. Legacy systems and complex exception paths require additional analysis."
  },
  "crm-sales-automation": {
    "description": "A structured way to collect enquiries, track sales opportunities, assign follow-ups and see what is happening from first contact to order or closure.",
    "scope": [
      "Map lead sources, qualification fields, sales stages, owners and follow-up rules.",
      "Configure an agreed CRM or lightweight pipeline with fields and permissions.",
      "Connect agreed lead sources such as website forms or approved messaging integrations.",
      "Configure reminder and follow-up workflows with human review where needed.",
      "Import a cleansed, agreed lead list and test assignment/reporting.",
      "Train the sales team and document pipeline definitions."
    ],
    "timeline": "Indicative planning estimate: 2–5 weeks for a basic-to-medium CRM pipeline. Data cleanup, multiple channels and ERP integration extend the schedule."
  },
  "whatsapp-business-automation": {
    "description": "An official WhatsApp Business messaging setup for approved customer notifications and enquiry routing, using agreed templates and hand-off to staff.",
    "scope": [
      "Confirm the business use cases, opt-in approach, message categories and agent hand-off process.",
      "Review the WhatsApp Business account, phone number eligibility and Meta verification requirements.",
      "Configure the approved Cloud API or authorised provider connection, subject to account approval.",
      "Prepare and submit message templates for platform review.",
      "Build the agreed conversation flow, buttons or notifications and connect one agreed CRM/inbox endpoint if included.",
      "Test inbound/outbound messages, failure states and human handover."
    ],
    "timeline": "Indicative planning estimate: 1–3 weeks for setup and a simple flow after account eligibility and documents are ready. Meta verification/template reviews can add external delays."
  },
  "document-processing-automation": {
    "description": "A workflow that extracts selected information from agreed business documents, organises the results and routes them for staff review or approval.",
    "scope": [
      "Select document types, required fields, file formats and expected monthly volume.",
      "Review representative samples to assess scan quality, layout variation and handwriting.",
      "Configure extraction and classification for the agreed document set.",
      "Add validation rules and a human review step for uncertain or high-impact fields.",
      "Generate the agreed output file/PDF or send data to one approved system.",
      "Test sample batches and document known accuracy limitations."
    ],
    "timeline": "Indicative planning estimate: 3–8 weeks for a limited set of standard document formats. Document variability, handwriting, volume and integrations affect accuracy and schedule."
  },
  "business-dashboards-reporting-systems": {
    "description": "A management dashboard that brings selected business numbers into one view—for example, sales, stock, orders, receivables or operational KPIs.",
    "scope": [
      "Identify decisions the dashboard should support and define each KPI precisely.",
      "Inventory source files, accounting exports, databases and update frequency.",
      "Agree the calculation rules, filters, user roles and refresh expectations.",
      "Build the dashboard and the agreed data-import process.",
      "Reconcile sample totals against the client’s source records.",
      "Train users and document data refresh, limitations and ownership."
    ],
    "timeline": "Indicative planning estimate: 3–8 weeks for a defined dashboard with a small number of data sources. Data quality and connector availability are major schedule dependencies."
  },
  "market-customer-research": {
    "description": "A structured study of customer demand, buyer types and market size to help you assess whether an opportunity is worth pursuing and whom to target first.",
    "scope": [
      "Agree the research question, geography, product/service definition and decisions to inform.",
      "Review available public, client-supplied and licensed secondary sources.",
      "Define target buyer segments and interview questions if primary interviews are included.",
      "Conduct the agreed number of interviews or desk-research activities.",
      "Estimate market size using disclosed assumptions and available evidence.",
      "Summarise findings, confidence limits and recommended next steps."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks for a focused desk study with limited interviews. Sample size, geography and access to participants determine the final schedule."
  },
  "competitor-advertising-research": {
    "description": "A review of visible competitor offers, positioning, public advertising and customer feedback to identify how your business can differentiate itself.",
    "scope": [
      "Agree the competitor set, geography, product categories and questions to answer.",
      "Collect and compare publicly available websites, catalogues, prices and advertising examples.",
      "Review public customer ratings and recurring feedback themes.",
      "Compare offer structure, messaging, visible service gaps and positioning.",
      "Identify defensible differentiation opportunities and practical tests.",
      "Document source dates and limitations."
    ],
    "timeline": "Indicative planning estimate: 1–3 weeks for a bounded competitor set and geography. Large markets and extensive product catalogues require more time."
  },
  "industry-opportunity-research": {
    "description": "A research brief on an industry or adjacent opportunity, covering demand signals, supply-chain factors, public policy and practical considerations before you invest time or capital.",
    "scope": [
      "Define the industry, opportunity, geography, investment question and decision deadline.",
      "Review relevant public industry, trade, supply-chain and policy sources.",
      "Map market participants, value chain, input dependencies and key risks.",
      "Identify applicable public policies or schemes for further verification.",
      "Prepare an opportunity comparison and high-level feasibility view using stated assumptions.",
      "Recommend questions requiring technical, legal or financial specialist review."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks for a focused opportunity study. Sector breadth, geography and source availability affect delivery."
  },
  "business-performance-analysis": {
    "description": "An operational and commercial review of your records to understand sales, product margins, costs, receivables and working-capital pressure—and identify areas that need management attention.",
    "scope": [
      "Agree the review period, business units, products and questions to investigate.",
      "Review client-supplied sales, purchase, stock, ledger and operating records.",
      "Analyse selected revenue, contribution margin, cost and working-capital indicators.",
      "Identify data gaps, unusual movements and questions for the finance team.",
      "Prioritise practical improvement opportunities based on available evidence.",
      "Present findings and assumptions to management."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks after complete data receipt for a single entity and defined review period. Reconciliation and fragmented records can extend the work."
  },
  "business-planning-financial-feasibility": {
    "description": "A structured business plan and financial model to examine expected investment, running costs, revenue assumptions, break-even and funding needs before a business decision.",
    "scope": [
      "Confirm the business model, product/service, location, capacity and planning period.",
      "Collect vendor quotations, rent/site assumptions, staffing and operating-cost inputs.",
      "Build revenue, cost, capital expenditure and working-capital assumptions.",
      "Prepare base, upside and downside scenarios and break-even sensitivities.",
      "Identify assumptions requiring confirmation by technical, tax or legal specialists.",
      "Present the plan and model with a clear explanation of limitations."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks after key cost, capacity and revenue inputs are complete. Multiple entities or complex scenarios take longer."
  },
  "startup-growth-consulting": {
    "description": "Structured advisory sessions to help founders clarify priorities, organise operating processes and turn growth goals into a practical plan with owners and milestones.",
    "scope": [
      "Conduct an initial discovery of the business model, team, customers and current bottlenecks.",
      "Agree a limited set of objectives and measurable indicators.",
      "Review operating processes, role ownership and decision routines.",
      "Prepare a prioritised roadmap with milestones and responsibilities.",
      "Hold advisory sessions at the agreed cadence and review progress.",
      "Update recommendations based on evidence and client implementation."
    ],
    "timeline": "Indicative engagement: 4–12 weeks for an initial advisory cycle, with kickoff typically within 1–2 weeks after agreement. Session cadence is set in the proposal."
  },
  "business-registration-assistance": {
    "description": "Documentation preparation and filing coordination for choosing and setting up an appropriate business form, such as a proprietorship, partnership, LLP or private limited company.",
    "scope": [
      "Collect basic promoter, ownership, activity and registered-office details.",
      "Explain common entity options and identify matters requiring qualified legal/tax advice.",
      "Prepare the agreed application and supporting document checklist.",
      "Coordinate name, digital-signature and incorporation steps through the appropriate portal/professional channel.",
      "Track submitted application queries and relay requests for additional information.",
      "Provide the available registration records and post-registration checklist."
    ],
    "timeline": "Indicative planning estimate: 1–4 weeks for document preparation and standard filing coordination after complete KYC. Authority queries and approvals can extend the timeline."
  },
  "gst-udyam-assistance": {
    "description": "Assistance with preparing and coordinating GST registration or Udyam MSME registration, along with clearly defined support for related records or return-filing tasks when included.",
    "scope": [
      "Identify the requested registration or support task and confirm the business constitution and jurisdiction details.",
      "Prepare a checklist of identity, address, bank and business-activity records.",
      "Assist with application data entry and document preparation through the applicable official portal.",
      "Coordinate clarification requests and share acknowledgement/status updates.",
      "For separately contracted return support, organise supplied sales/purchase data and coordinate the agreed filing workflow.",
      "Provide a handover of certificates, acknowledgements and the next compliance dates supplied/verified for the engagement."
    ],
    "timeline": "Indicative planning estimate: 3–10 working days for document preparation and a straightforward submission after complete information. Government processing/clarification time is outside the estimate."
  },
  "trademark-filing-coordination": {
    "description": "Administrative and filing coordination to help prepare an Indian trademark application for an agreed brand name or logo, including an initial similarity search and goods/services classification discussion.",
    "scope": [
      "Collect the proposed mark, owner details and description of goods/services.",
      "Conduct an initial search of publicly available trademark records for similar marks.",
      "Prepare a preliminary Nice class mapping for discussion and confirmation.",
      "Compile the application information and supporting documents for client review.",
      "Coordinate filing through the approved channel after written authorisation and payment of statutory fees.",
      "Track the application acknowledgement and relay official status/requests received."
    ],
    "timeline": "Indicative planning estimate: 3–7 working days for search, class discussion and application preparation after complete inputs. Registry examination, publication, opposition and registration timelines are external and may take months or longer."
  },
  "government-scheme-application-support": {
    "description": "Eligibility screening and documentation coordination for selected central or state business schemes, subsidies and incentives, based on the current published scheme rules.",
    "scope": [
      "Identify the proposed project, promoter category, location, activity and investment.",
      "Review current official scheme guidelines and prepare an eligibility checklist.",
      "Identify required registrations, quotations, financial inputs and supporting documents.",
      "Prepare or coordinate the project/application dossier within the agreed scope.",
      "Assist with portal submission and respond to document queries using client-approved information.",
      "Track status and provide a checklist for bank or department follow-up where applicable."
    ],
    "timeline": "Indicative planning estimate: 2–4 weeks for eligibility review and document preparation once inputs are complete. Scheme windows, portal availability, department scrutiny and bank processing are external."
  },
  "dpr-loan-documentation": {
    "description": "Preparation of a structured project report and financial schedules to help present a proposed project or expansion to a bank or other funding institution.",
    "scope": [
      "Confirm the funding purpose, project cost, promoter contribution and lender requirements.",
      "Collect historical financial statements, current performance data and vendor quotations.",
      "Prepare the project narrative, cost estimates, operating assumptions and projected financial schedules.",
      "Prepare CMA/DSCR or other schedules only where required and supported by the available inputs.",
      "Check internal consistency of assumptions and highlight missing evidence.",
      "Deliver the report and support the client in responding to clarification requests within the agreed period."
    ],
    "timeline": "Indicative planning estimate: 1–3 weeks after complete financial records and vendor quotations are received. Complex projects, multiple entities and lender-specific changes require extra time."
  },
  "property-documentation-coordination": {
    "description": "Help organising and coordinating property-related records for a business transaction, lease or bank documentation process, with clear identification of matters requiring an advocate or authorised professional.",
    "scope": [
      "Clarify the property purpose, location, parties and document set to be organised.",
      "Prepare a checklist of available title, tax, survey, lease and related records.",
      "Arrange and index client-supplied documents in a structured digital folder.",
      "Coordinate requests for official extracts or records where authorised and available.",
      "Prepare administrative observations or missing-document notes for review by the client and advocate.",
      "Coordinate with the client’s advocate, bank or other authorised professional where requested."
    ],
    "timeline": "Indicative planning estimate: 1–3 weeks for document collation and coordination on a single property file. Record availability, office response and advocate review can extend the period."
  }
};
