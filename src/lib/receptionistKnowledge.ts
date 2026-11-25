import { BUSINESS_INFO } from '../data/servicesData';
import { SEED_DIVISIONS, SEED_SERVICES } from '../data/seedData';
import { UNIKORN_FOUR_PRODUCTS } from '../data/productsData';
import {
  ReceptionistChatRequest,
  ReceptionistChatResponse,
  ReceptionistEnquiryDraft,
  ReceptionistEnquirySubmissionRequest,
  ReceptionistLanguage,
  ReceptionistLeadStatus,
  ReceptionistQuickAction,
  RecommendedLink
} from '../types/receptionist';

export const RECEPTIONIST_WHATSAPP_NUMBER = '919884824360';
export const RECEPTIONIST_WHATSAPP_DISPLAY = '+91 98848 24360';
export const RECEPTIONIST_WHATSAPP_BASE_URL = 'https://wa.me/919884824360';
export const RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE =
  'Hello UNIKORN360, I need assistance regarding your services.';

export function buildReceptionistWhatsAppUrl(customMessage?: string): string {
  const text = (customMessage || RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE).trim();
  return `${RECEPTIONIST_WHATSAPP_BASE_URL}?text=${encodeURIComponent(text)}`;
}

export const RECEPTIONIST_QUICK_ACTIONS: ReceptionistQuickAction[] = [
  {
    id: 'website-development',
    label: 'Website Development',
    prompt: 'I need help with Website Development for my business.',
    serviceLabel: 'Website Development'
  },
  {
    id: 'software-development',
    label: 'Software Development',
    prompt: 'I am looking for Custom Software or Web Application Development.',
    serviceLabel: 'Custom Software Development'
  },
  {
    id: 'ai-automation',
    label: 'AI & Automation',
    prompt: 'Tell me about your AI & Workflow Automation services.',
    serviceLabel: 'AI & Automation'
  },
  {
    id: 'whatsapp-automation',
    label: 'WhatsApp Automation',
    prompt: 'How can UNIKORN360 help with WhatsApp Automation and CRM follow-ups?',
    serviceLabel: 'WhatsApp Automation'
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    prompt: 'I want to know about Cybersecurity, application security audits, and maintenance.',
    serviceLabel: 'Cybersecurity & Maintenance'
  },
  {
    id: 'digital-marketing',
    label: 'Digital Marketing',
    prompt: 'What Digital Marketing, SEO, and Creator Campaign services do you offer?',
    serviceLabel: 'Digital Marketing & Creator Campaigns'
  },
  {
    id: 'business-documentation',
    label: 'Business Documentation',
    prompt: 'I need support with Business Setup, GST, DPR, or Business Documentation.',
    serviceLabel: 'Business Setup & Documentation'
  },
  {
    id: 'business-consulting',
    label: 'Business Consulting',
    prompt: 'Tell me about your Research, Feasibility, and Business Strategy Consulting.',
    serviceLabel: 'Research & Business Consulting'
  },
  {
    id: 'explore-software-products',
    label: 'Explore Software Products',
    prompt: 'Show me UNIKORN360 standalone software products.',
    serviceLabel: 'UNIKORN360 Software Products'
  },
  {
    id: 'talk-to-human',
    label: 'Talk to Human',
    prompt: 'I would like to speak directly with the UNIKORN360 team.',
    serviceLabel: 'Human Consultation',
    isHumanHandover: true
  }
];

export const RECEPTIONIST_SERVICE_OPTIONS: string[] = [
  'Website Development',
  'Software Development',
  'AI & Automation',
  'WhatsApp Automation',
  'Cybersecurity & Maintenance',
  'Digital Marketing & Creator Campaigns',
  'Business Setup & Documentation',
  'Business Consulting & Strategy',
  'InvoicePro360 (Software Product)',
  'Deeds360 (Software Product)',
  'Property360 (Software Product)',
  'Advocate360 (Software Product)',
  'Other / General Business Enquiry'
];

export const BUDGET_RANGE_OPTIONS: string[] = [
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000 – ₹5,00,000',
  'Above ₹5,00,000',
  'To be discussed after scope review'
];

export const TIMELINE_OPTIONS: string[] = [
  'Immediate (Within 2 weeks)',
  '1 Month',
  '1 – 3 Months',
  '3+ Months',
  'Flexible / Exploratory'
];

// Build verified allowlist of public paths on www.unikorn360.com
const DIVISION_BY_ID = new Map(SEED_DIVISIONS.map((d) => [d.id, d]));

export const APPROVED_PUBLIC_LINKS: Map<string, RecommendedLink> = (() => {
  const map = new Map<string, RecommendedLink>();
  map.set('/services', { label: 'All Services Directory', path: '/services' });
  map.set('/products', { label: 'UNIKORN360 Software Products', path: '/products' });
  map.set('/about', { label: 'About UNIKORN360', path: '/about' });
  map.set('/contact', { label: 'Contact UNIKORN360', path: '/contact' });

  for (const div of SEED_DIVISIONS) {
    map.set(`/services/${div.slug}`, {
      label: div.name,
      path: `/services/${div.slug}`
    });
  }

  for (const svc of SEED_SERVICES) {
    const div = DIVISION_BY_ID.get(svc.division_id);
    if (div) {
      const fullPath = `/services/${div.slug}/${svc.slug}`;
      map.set(fullPath, {
        label: svc.service_name,
        path: fullPath
      });
    }
  }

  for (const prod of UNIKORN_FOUR_PRODUCTS) {
    map.set(prod.path, {
      label: prod.name,
      path: prod.path
    });
  }

  return map;
})();

export function sanitizeRecommendedLinks(rawLinks: unknown): RecommendedLink[] {
  if (!Array.isArray(rawLinks)) return [];
  const seen = new Set<string>();
  const verified: RecommendedLink[] = [];

  for (const item of rawLinks) {
    if (!item || typeof item !== 'object') continue;
    const rawPath = String((item as Record<string, unknown>).path || '').trim();
    const rawLabel = String((item as Record<string, unknown>).label || '').trim();
    const approved = APPROVED_PUBLIC_LINKS.get(rawPath);
    if (approved && !seen.has(approved.path)) {
      seen.add(approved.path);
      verified.push({
        label: rawLabel && rawLabel.length <= 64 ? rawLabel : approved.label,
        path: approved.path
      });
    }
    if (verified.length >= 3) break;
  }

  return verified;
}

/**
 * Compact, verified knowledge base grounded strictly in UNIKORN360's published site data.
 */
export function buildUnikornKnowledgeContext(): string {
  const divisionsSummary = SEED_DIVISIONS.map((div) => {
    const divServices = SEED_SERVICES.filter((s) => s.division_id === div.id)
      .map((s) => `  - ${s.service_name} (path: /services/${div.slug}/${s.slug}): ${s.short_description}`)
      .join('\n');
    return `Division: ${div.name} (path: /services/${div.slug})\nOverview: ${div.short_description}\nPublished Services:\n${divServices}`;
  }).join('\n\n');

  const productsSummary = UNIKORN_FOUR_PRODUCTS.map(
    (p) =>
      `- ${p.name} (${p.categoryLabel}) — Page: ${p.path} | Live App: ${p.appUrl}\n  Summary: ${p.shortDescription}\n  Intended Users: ${p.intendedUsers.join(', ')}\n  Key Capabilities: ${p.verifiedFeatures.map((f) => f.title).join('; ')}`
  ).join('\n');

  return `
COMPANY PROFILE (PUBLISHED FACTS ONLY):
- Brand: ${BUSINESS_INFO.brand} (${BUSINESS_INFO.shortBrand})
- Founder: ${BUSINESS_INFO.founder}
- Official Website: ${BUSINESS_INFO.website}
- Official Phone & WhatsApp: ${RECEPTIONIST_WHATSAPP_DISPLAY} (${RECEPTIONIST_WHATSAPP_BASE_URL})
- Official Email: ${BUSINESS_INFO.email}
- GSTIN: ${BUSINESS_INFO.gstin}
- Registered Office: ${BUSINESS_INFO.address.full}

STANDALONE SOFTWARE PRODUCTS (4 PRODUCTS — Page: /products):
${productsSummary}

SIX SERVICE DIVISIONS & PUBLISHED CATALOGUE (Directory: /services):
${divisionsSummary}
`.trim();
}

export function buildReceptionistSystemPrompt(
  currentPage?: string,
  collectedDraft?: Partial<ReceptionistEnquiryDraft>
): string {
  const capturedEntries = collectedDraft
    ? Object.entries(collectedDraft)
        .filter(([, val]) => typeof val === 'string' && val.trim().length > 0)
        .map(([k, v]) => `${k}: ${String(v).trim()}`)
    : [];

  return `You are the official UNIKORN360 AI Website Receptionist on https://www.unikorn360.com/.

CORE ROLE:
- Act as a courteous, concise, knowledgeable customer support and sales receptionist for UNIKORN360 Business Intelligence.
- Answer strictly using the verified UNIKORN360 Knowledge Base below.
- Match the visitor's language naturally: support English, Tamil (தமிழ்), Tanglish (Tamil written in Latin script), and Hindi (हिन्दी or Hinglish). If the visitor writes in Tamil, reply in clear, natural Tamil. If in Tanglish, reply in natural polite Tanglish. If in Hindi/Hinglish, reply in natural polite Hindi/Hinglish. Otherwise reply in clear business English.

STRICT ACCURACY & NON-HALLUCINATION RULES:
1. NEVER invent prices, fee quotes, discounts, fixed delivery guarantees, government approval guarantees, or unverified features.
2. When asked about pricing or timelines, clearly explain that UNIKORN360 provides a written commercial proposal after reviewing exact project scope, and invite the visitor to share their requirements or speak with the team on WhatsApp (+91 98848 24360).
3. Recommend the most relevant UNIKORN360 service division, specific service, or standalone software product (InvoicePro360, Deeds360, Property360, Advocate360). Include 1 to 3 exact approved paths in recommendedLinks when helpful.
4. Keep replies concise (typically 2 to 4 short paragraphs or crisp bullet points) and easy to read on mobile.

GRADUAL ENQUIRY COLLECTION:
- Over the course of the conversation, gently gather up to 8 enquiry details without interrogating the visitor (ask at most 1–2 natural follow-up questions per turn):
  customerName, businessName, contactNumber, email, serviceRequired, projectDescription, budgetRange, expectedTimeline.
- Extract any newly shared details accurately into extractedFields. Never fabricate values that the customer did not state.
- Set suggestEnquiryForm=true once the customer shows clear project interest or has shared at least 2–3 details and is ready to submit their enquiry.
- Set suggestHumanHandover=true if the customer asks to speak to a human, asks for urgent help, asks for exact pricing/negotiation, or seems stuck.

CURRENT CONTEXT:
- Visitor is viewing page: ${currentPage || '/'}
- Already captured enquiry fields: ${capturedEntries.length > 0 ? capturedEntries.join(' | ') : 'None yet'}

${buildUnikornKnowledgeContext()}`;
}

// ====================================================================
// LANGUAGE DETECTION & DEMO MODE MULTILINGUAL SIMULATOR
// ====================================================================
export function detectMessageLanguage(text: string): ReceptionistLanguage {
  const trimmed = text.trim();
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'ta';
  if (/[\u0900-\u097F]/.test(trimmed)) return 'hi';

  const lower = ` ${trimmed.toLowerCase()} `;
  const tanglishMarkers = [
    ' vanakkam ',
    ' venum ',
    ' vendum ',
    ' pannanum ',
    ' pannalama ',
    ' sollunga ',
    ' evlo ',
    ' evalavu ',
    ' eppadi ',
    ' irukka ',
    ' iruku ',
    ' irukku ',
    ' enaku ',
    ' enakku ',
    ' namma ',
    ' unga ',
    ' theriyuma ',
    ' kudunga ',
    ' kidaikuma ',
    ' pesa ',
    ' pesalama ',
    ' romba ',
    ' nandri '
  ];
  if (tanglishMarkers.some((m) => lower.includes(m))) {
    return 'tanglish';
  }

  const hinglishMarkers = [
    ' namaste ',
    ' chahiye ',
    ' kitna ',
    ' kaise ',
    ' bataye ',
    ' batao ',
    ' madad ',
    ' mera ',
    ' meri ',
    ' humko ',
    ' aapke ',
    ' baat karni ',
    ' kya hai '
  ];
  if (hinglishMarkers.some((m) => lower.includes(m))) {
    return 'hi';
  }

  return 'en';
}

export function extractBasicLeadFieldsFromText(text: string): Partial<ReceptionistEnquiryDraft> {
  const extracted: Partial<ReceptionistEnquiryDraft> = {};

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) {
    extracted.email = emailMatch[0].trim();
  }

  const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\+?\d[\d\s-]{8,14}\d/);
  if (phoneMatch) {
    const cleaned = phoneMatch[0].trim();
    if (cleaned.replace(/\D/g, '').length >= 10) {
      extracted.contactNumber = cleaned;
    }
  }

  const nameMatch = text.match(/(?:my name is|i am|i'm|this is|en peru|mera naam)\s+([A-Za-z][A-Za-z.\s]{1,35}?)(?:[,.!?\n]|from|at|for|and|$)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    if (candidate.split(/\s+/).length <= 4 && !/looking|interested|need|want/i.test(candidate)) {
      extracted.customerName = candidate;
    }
  }

  const bizMatch = text.match(/(?:company is|business is|from|company name|business name)\s+([A-Za-z0-9&.\-\s]{2,45}?)(?:[,.!?\n]|and|we|need|want|$)/i);
  if (bizMatch && bizMatch[1]) {
    const candidate = bizMatch[1].trim();
    if (candidate.length >= 2 && !/^(india|tamil nadu|chennai|vaniyambadi)$/i.test(candidate)) {
      extracted.businessName = candidate;
    }
  }

  if (/(?:₹|rs\.?|inr|lakh|lakhs|budget|k\b)/i.test(text)) {
    const budgetMatch = text.match(/(?:budget(?:\s+is|\s+around|\s+range)?[:\s-]*)([^.!?\n]{3,40})/i);
    if (budgetMatch && budgetMatch[1]) {
      extracted.budgetRange = budgetMatch[1].trim();
    }
  }

  const timelineMatch = text.match(/(?:within\s+\d+\s+(?:days?|weeks?|months?)|in\s+\d+\s+(?:weeks?|months?)|next\s+month|urgent|immediately)/i);
  if (timelineMatch) {
    extracted.expectedTimeline = timelineMatch[0].trim();
  }

  return extracted;
}

export function generateDemoReceptionistReply(
  req: ReceptionistChatRequest
): ReceptionistChatResponse {
  const text = req.message.trim();
  const lower = text.toLowerCase();
  const lang = detectMessageLanguage(text);
  const extracted = extractBasicLeadFieldsFromText(text);
  const draft = { ...(req.collectedDraft || {}), ...extracted };

  const quickId = req.quickActionId || '';
  let recommendedLinks: RecommendedLink[] = [];
  let reply = '';
  let suggestEnquiryForm = false;
  let suggestHumanHandover = false;

  const isPricingAsk = /(price|pricing|cost|rate|budget|quote|fees?|evlo|evalavu|kitna|விலை|கட்டணம்|कीमत)/i.test(text);
  const isHumanAsk =
    quickId === 'talk-to-human' ||
    /(human|person|agent|call me|whatsapp|talk to|speak to|representative|pesanum|baat karni|மனிதர்|தொடர்பு)/i.test(lower);

  if (isHumanAsk) {
    suggestHumanHandover = true;
    suggestEnquiryForm = true;
    recommendedLinks = [{ label: 'Contact UNIKORN360', path: '/contact' }];
    if (lang === 'ta') {
      reply =
        'நிச்சயமாக! கீழே உள்ள "Talk to UNIKORN360" WhatsApp பொத்தானை கிளிக் செய்து எங்கள் குழுவுடன் (+91 98848 24360) நேரடியாகப் பேசலாம். விருப்பப்பட்டால், உங்கள் பெயர் மற்றும் தேவை விவரங்களை Enquiry படிவத்தில் பகிர்ந்தால் எங்கள் குழு விரைவாகத் தொடர்பு கொள்ளும்.';
    } else if (lang === 'tanglish') {
      reply =
        'Sure! Keela irukura "Talk to UNIKORN360" WhatsApp button-a click panni direct-a enga team (+91 98848 24360) kooda pesalam. Neenga virumbinaal unga enquiry details-a inga share pannunga, naanga save panni follow-up panrom.';
    } else if (lang === 'hi') {
      reply =
        'बिल्कुल! आप नीचे दिए गए "Talk to UNIKORN360" WhatsApp बटन पर क्लिक करके हमारी टीम (+91 98848 24360) से सीधे बात कर सकते हैं। चाहें तो आप यहीं अपनी enquiry details भी सबमिट कर सकते हैं।';
    } else {
      reply =
        'Of course — you can connect directly with our team on WhatsApp (+91 98848 24360) using the "Talk to UNIKORN360" button below. You can also share your details using the inline Enquiry form so our team has full context when reaching out.';
    }
  } else if (
    quickId === 'explore-software-products' ||
    /(product|invoicepro|deeds360|property360|advocate360|software product|saas)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'UNIKORN360 Software Products';
    recommendedLinks = [
      { label: 'Explore All 4 Software Products', path: '/products' },
      { label: 'InvoicePro360', path: '/products/invoicepro360' },
      { label: 'Deeds360', path: '/products/deeds360' }
    ];
    suggestEnquiryForm = true;
    if (lang === 'ta') {
      reply =
        'UNIKORN360 நான்கு தனித்தனி மென்பொருள் தயாரிப்புகளை வழங்குகிறது:\n• InvoicePro360 — GST பில்லிங் மற்றும் இன்வாய்ஸ் OCR சரிபார்ப்பு\n• Deeds360 — தமிழ் & ஆங்கில பத்திர வரைவு உதவி\n• Property360 — சொத்து ஆவண ஆய்வு மற்றும் வழக்கு தொகுப்பு\n• Advocate360 — வழக்கறிஞர்களுக்கான தினசரி பணி மேலாண்மை\n\nஎந்தத் தயாரிப்பிற்கு டெமோ தேவை? உங்கள் பெயர் மற்றும் வணிக விவரங்களைப் பகிர்ந்தால் குழு தொடர்பு கொள்ளும்.';
    } else if (lang === 'tanglish') {
      reply =
        'UNIKORN360-la 4 standalone software products iruku:\n• InvoicePro360 — GST invoice drafting & OCR validation\n• Deeds360 — Tamil & English property deed drafting workspace\n• Property360 — Land revenue & property case review dossier\n• Advocate360 — Legal practice daily workspace\n\nUngalukku edhu demo venum? Unga peru and business details share pannaal team arrange pannuvanga.';
    } else if (lang === 'hi') {
      reply =
        'UNIKORN360 चार standalone software products प्रदान करता है:\n• InvoicePro360 — GST इनवॉइसिंग और OCR सत्यापन\n• Deeds360 — तमिल और अंग्रेज़ी प्रॉपर्टी डीड ड्राफ्टिंग\n• Property360 — प्रॉपर्टी केस रिव्यू और डॉक्यूमेंट डोज़ियर\n• Advocate360 — वकीलों के लिए दैनिक केस वर्कस्पेस\n\nआप किस प्रोडक्ट का डेमो देखना चाहेंगे?';
    } else {
      reply =
        'UNIKORN360 builds four standalone software products:\n• InvoicePro360 — GST invoice drafting, OCR extraction, and ledger validation\n• Deeds360 — Bilingual (English & Tamil) property deed drafting workspace\n• Property360 — Land revenue and case-review dossier workspace\n• Advocate360 — Daily legal workspace for advocates\n\nWhich product would you like to explore or book a walkthrough for?';
    }
  } else if (
    quickId === 'whatsapp-automation' ||
    /(whatsapp automation|whatsapp bot|crm follow|lead routing)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'WhatsApp Automation';
    recommendedLinks = [
      { label: 'AI, Automation & Business Systems', path: '/services/ai-automation-business-systems' }
    ];
    suggestEnquiryForm = true;
    reply =
      lang === 'ta'
        ? 'எங்கள் AI, Automation & Business Systems பிரிவின் கீழ் வாடிக்கையாளர் விசாரணை பதிவு, CRM பைப்லைன் மற்றும் WhatsApp வணிகப் பணிப்பாய்வு இணைப்புகளை மனித மேற்பார்வையுடன் அமைக்கிறோம். உங்கள் வணிகத்தின் பெயர் மற்றும் தற்போதைய செயல்முறையைப் பகிரலாமா?'
        : lang === 'tanglish'
        ? 'Enga AI, Automation & Business Systems division-la enquiry capture, CRM pipeline, and WhatsApp business workflows human oversight-oda build panrom. Unga business name and current enquiry volume sollunga?'
        : lang === 'hi'
        ? 'हमारी AI, Automation & Business Systems टीम enquiry capture, CRM pipeline और WhatsApp workflow automation को मानव निगरानी के साथ सेटअप करती है। कृपया अपने बिज़नेस और मौजूदा प्रोसेस के बारे में थोड़ा बताएं।'
        : 'Under our AI, Automation & Business Systems division, we connect enquiry capture, CRM pipelines, and structured WhatsApp business workflows with clear human oversight. To recommend the right setup, what type of business do you run and roughly how many enquiries do you handle weekly?';
  } else if (
    quickId === 'ai-automation' ||
    /(ai|automation|chatbot|agent|workflow|dashboard|bi\b)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'AI & Automation';
    recommendedLinks = [
      { label: 'AI, Automation & Business Systems', path: '/services/ai-automation-business-systems' }
    ];
    suggestEnquiryForm = true;
    reply =
      lang === 'ta'
        ? 'UNIKORN360 AI உதவியாளர்கள், தனிப்பயன் பணிப்பாய்வு ஆட்டோமேஷன், CRM இணைப்புகள் மற்றும் நிர்வாக டாஷ்போர்டுகளை உருவாக்குகிறது. நீங்கள் எந்தப் பணியைத் தானியக்கமாக்க விரும்புகிறீர்கள்? (குறிப்பு: துல்லியமான கட்டணம் தேவைகளை ஆய்வு செய்த பின்னரே உறுதி செய்யப்படும்.)'
        : lang === 'tanglish'
        ? 'UNIKORN360-la AI assistants, workflow automation, CRM integration, and executive dashboards build panrom. Neenga endha manual work-a automate panna pakkureenga? Exact pricing scope review-ku apparam written quote-a tharuvom.'
        : lang === 'hi'
        ? 'UNIKORN360 AI assistants, workflow automation, CRM integration और executive dashboards तैयार करता है। आप किस प्रक्रिया को ऑटोमेट करना चाहते हैं? सटीक लागत scope review के बाद लिखित प्रस्ताव में दी जाती है।'
        : 'UNIKORN360 builds AI knowledge assistants, custom workflow automations, CRM integrations, and executive dashboards with human approval checkpoints. Which manual process are you looking to streamline first?';
  } else if (
    quickId === 'website-development' ||
    /(website|web site|ecommerce|e-commerce|landing page|store|web design)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Website Development';
    recommendedLinks = [
      { label: 'Website Development', path: '/services/websites-software/website-development' },
      { label: 'Websites & Software Division', path: '/services/websites-software' }
    ];
    suggestEnquiryForm = true;
    reply =
      lang === 'ta'
        ? 'எங்கள் Websites & Software பிரிவின் மூலம் மொபைல்-நட்பு வணிக இணையதளங்கள், ஈ-காமர்ஸ் தளங்கள் மற்றும் விசாரணை இணைப்புகளை உருவாக்குகிறோம். உங்கள் இணையதளத்திற்கான முக்கிய நோக்கம் மற்றும் எதிர்பார்க்கும் கால அளவு என்ன? துல்லியமான கட்டணம் தேவை ஆய்வுக்குப் பின் வழங்கப்படும்.'
        : lang === 'tanglish'
        ? 'Enga Websites & Software division-la fast mobile-first business websites, e-commerce stores, and enquiry-ready portals build panrom. Ungalukku corporate website venuma illa e-commerce store-aa? Exact quote scope review-ku apparam written proposal-a kidaikum.'
        : lang === 'hi'
        ? 'हमारी Websites & Software टीम मोबाइल-रिस्पॉन्सिव बिज़नेस वेबसाइट, ई-कॉमर्स स्टोर और लीड-कैप्चर पोर्टल बनाती है। क्या आपको कॉर्पोरेट वेबसाइट चाहिए या ई-कॉमर्स स्टोर? सटीक कीमत scope review के बाद दी जाती है।'
        : 'Through our Websites & Software division, we design and build mobile-first business websites, e-commerce stores, and enquiry-driven portals with technical SEO setup. Are you looking for a company website or an e-commerce store, and what is your target timeline?';
  } else if (
    quickId === 'software-development' ||
    /(software|web app|mobile app|mvp|erp|portal|api|custom app)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Software Development';
    recommendedLinks = [
      { label: 'Websites & Software Division', path: '/services/websites-software' }
    ];
    suggestEnquiryForm = true;
    reply =
      'Our Websites & Software division engineers custom web applications, internal business portals, mobile apps, SaaS MVPs, and API integrations tailored around your workflows. Could you share a brief overview of what the software should handle and your expected timeline?';
  } else if (
    quickId === 'cybersecurity' ||
    /(cyber|security|audit|vulnerability|maintenance|harden|server)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Cybersecurity & Maintenance';
    recommendedLinks = [
      { label: 'Security & Maintenance Division', path: '/services/security-maintenance' }
    ];
    suggestEnquiryForm = true;
    reply =
      'Our Security & Maintenance division handles application security reviews, AI-generated code audits, API and database checks, server hardening, and ongoing technical maintenance retainers. Is this for an existing live application or a pre-launch security review?';
  } else if (
    quickId === 'digital-marketing' ||
    /(marketing|seo|ads|google ads|meta ads|ugc|creator|social media)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Digital Marketing & Creator Campaigns';
    recommendedLinks = [
      { label: 'Marketing & Creator Campaigns', path: '/services/marketing-creator-campaigns' }
    ];
    suggestEnquiryForm = true;
    reply =
      'Our Marketing & Creator Campaigns division covers technical and local SEO, Google and Meta paid advertising, social media content, UGC production, and regional creator collaborations. Which channel are you prioritizing for lead generation?';
  } else if (
    quickId === 'business-documentation' ||
    /(gst|udyam|dpr|registration|trademark|subsidy|license|documentation|setup|loan)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Business Setup & Documentation';
    recommendedLinks = [
      { label: 'Business Setup & Documentation', path: '/services/business-setup-documentation' }
    ];
    suggestEnquiryForm = true;
    reply =
      'Our Business Setup & Documentation division assists with business registration coordination, GST and Udyam filings, trademark coordination, bank-ready DPR preparation, government scheme documentation, and commercial property paperwork. Which registration or document support do you need?';
  } else if (
    quickId === 'business-consulting' ||
    /(consult|research|strategy|feasibility|competitor|market|plan)/i.test(lower)
  ) {
    extracted.serviceRequired = extracted.serviceRequired || 'Business Consulting & Strategy';
    recommendedLinks = [
      { label: 'Research & Business Strategy', path: '/services/research-business-strategy' }
    ];
    suggestEnquiryForm = true;
    reply =
      'Our Research & Business Strategy division delivers market research, competitor benchmarks, performance diagnostics, financial feasibility studies, and growth planning. Tell me briefly about your business stage or expansion goal so we can guide you accurately.';
  } else if (isPricingAsk) {
    suggestEnquiryForm = true;
    suggestHumanHandover = true;
    recommendedLinks = [{ label: 'Browse All Services', path: '/services' }];
    reply =
      lang === 'ta'
        ? 'UNIKORN360 திட்டத்தின் துல்லியமான தேவைகளை ஆய்வு செய்த பின்னரே எழுத்துப்பூர்வ கட்டண முன்மொழிவை (written proposal) வழங்குகிறது; நாங்கள் யூக விலைகளைக் கூறுவதில்லை. உங்கள் தேவை, பட்ஜெட் வரம்பு மற்றும் கால அளவை Enquiry படிவத்தில் பகிருங்கள் அல்லது WhatsApp (+91 98848 24360) மூலம் தொடர்பு கொள்ளுங்கள்.'
        : lang === 'tanglish'
        ? 'UNIKORN360-la exact scope review pannitu dhaan written commercial quote tharuvom; naanga guess price solla mattom. Unga requirement, budget range, and timeline-a enquiry form-la share pannunga, illa direct-a WhatsApp (+91 98848 24360) pannalam.'
        : lang === 'hi'
        ? 'UNIKORN360 आपकी प्रोजेक्ट आवश्यकताओं की समीक्षा के बाद लिखित कमर्शियल प्रस्ताव देता है; हम अनुमानित या मनगढ़ंत कीमत नहीं बताते। कृपया अपनी आवश्यकता, बजट रेंज और समय-सीमा Enquiry फ़ॉर्म में साझा करें या WhatsApp (+91 98848 24360) पर संपर्क करें।'
        : 'UNIKORN360 prepares an itemized written commercial proposal after reviewing your exact project scope — we never quote invented or unconfirmed rates. Share your required service, approximate budget range, and timeline in the Enquiry form below, or message our team directly on WhatsApp (+91 98848 24360).';
  } else {
    recommendedLinks = [
      { label: 'Browse All Services', path: '/services' },
      { label: 'Explore Software Products', path: '/products' }
    ];
    const hasSomeDetails = Boolean(
      draft.customerName || draft.contactNumber || draft.email || draft.serviceRequired
    );
    suggestEnquiryForm = hasSomeDetails;
    if (lang === 'ta') {
      reply =
        'வணக்கம்! UNIKORN360 Business Intelligence-க்கு வரவேற்கிறோம். இணையதள & மென்பொருள் மேம்பாடு, AI ஆட்டோமேஷன், பாதுகாப்பு ஆய்வு, டிஜிட்டல் மார்க்கெட்டிங், வணிக ஆலோசனை, வணிக ஆவண உதவி மற்றும் எங்கள் 4 மென்பொருள் தயாரிப்புகளில் (InvoicePro360, Deeds360, Property360, Advocate360) உங்களுக்கு எவ்வாறு உதவலாம்?';
    } else if (lang === 'tanglish') {
      reply =
        'Vanakkam! UNIKORN360 Business Intelligence-ku varaverkirom. Website & software development, AI & WhatsApp automation, cybersecurity, digital marketing, business consulting, documentation, or enga 4 software products pathi enna help venum sollunga?';
    } else if (lang === 'hi') {
      reply =
        'नमस्ते! UNIKORN360 Business Intelligence में आपका स्वागत है। हम वेबसाइट और सॉफ्टवेयर डेवलपमेंट, AI व WhatsApp ऑटोमेशन, साइबर सुरक्षा, डिजिटल मार्केटिंग, बिज़नेस कंसल्टिंग, डॉक्यूमेंटेशन और हमारे 4 सॉफ्टवेयर प्रोडक्ट्स में आपकी कैसे मदद कर सकते हैं?';
    } else {
      reply =
        'Welcome to UNIKORN360 Business Intelligence. We help businesses across six service divisions — Websites & Software, Security & Maintenance, Marketing & Creator Campaigns, AI & Automation, Research & Strategy, and Business Setup & Documentation — plus four standalone software products. Which area would you like help with today?';
    }
  }

  return {
    reply,
    mode: 'demo',
    simulated: true,
    detectedLanguage: lang,
    recommendedLinks,
    extractedFields: extracted,
    suggestEnquiryForm,
    suggestHumanHandover,
    model: 'demo-simulator'
  };
}

// ====================================================================
// VALIDATION & RATE LIMITING (SHARED ACROSS CLOUDFLARE & EXPRESS)
// ====================================================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CLEAN_REGEX = /[^\d+]/g;
const ALLOWED_LEAD_STATUSES = new Set<ReceptionistLeadStatus>([
  'new',
  'contacted',
  'qualified',
  'follow_up',
  'won',
  'closed'
]);

export function sanitizePlainText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

/**
 * Infers language, approved UNIKORN360 page links, captured enquiry fields,
 * and handover prompts from user text + Cloudflare AI reply text without
 * inventing any pricing or AI response content.
 */
export function inferReceptionistMetadataFromConversation(
  userMessage: string,
  replyText: string,
  quickActionId?: string,
  currentDraft?: Partial<ReceptionistEnquiryDraft>
): {
  detectedLanguage: ReceptionistLanguage;
  recommendedLinks: RecommendedLink[];
  extractedFields: Partial<ReceptionistEnquiryDraft>;
  suggestEnquiryForm: boolean;
  suggestHumanHandover: boolean;
} {
  const userLang = detectMessageLanguage(userMessage);
  const detectedLanguage =
    userLang !== 'en' ? userLang : detectMessageLanguage(replyText);

  const extractedFields = extractBasicLeadFieldsFromText(userMessage);
  const combined = `${userMessage} ${replyText}`.toLowerCase();
  const quickId = (quickActionId || '').trim();

  const candidateLinks: RecommendedLink[] = [];
  const pushApproved = (path: string, label?: string) => {
    const entry = APPROVED_PUBLIC_LINKS.get(path);
    if (entry && !candidateLinks.some((c) => c.path === entry.path)) {
      candidateLinks.push({ label: label || entry.label, path: entry.path });
    }
  };

  if (
    quickId === 'explore-software-products' ||
    /(invoicepro360|deeds360|property360|advocate360|software product)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'UNIKORN360 Software Products';
    if (/invoicepro/i.test(combined)) pushApproved('/products/invoicepro360');
    if (/deeds360/i.test(combined)) pushApproved('/products/deeds360');
    if (/property360/i.test(combined)) pushApproved('/products/property360');
    if (/advocate360/i.test(combined)) pushApproved('/products/advocate360');
    pushApproved('/products', 'Explore All Software Products');
  }

  if (
    quickId === 'whatsapp-automation' ||
    /(whatsapp automation|whatsapp bot|whatsapp business|crm pipeline)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'WhatsApp Automation';
    pushApproved('/services/ai-automation-business-systems');
  }

  if (
    quickId === 'ai-automation' ||
    /(ai automation|workflow automation|chatbot|ai agent|executive dashboard)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'AI & Automation';
    pushApproved('/services/ai-automation-business-systems');
  }

  if (
    quickId === 'website-development' ||
    /(website|e-commerce|ecommerce|web portal|landing page|company site)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Website Development';
    pushApproved('/services/websites-software/website-development');
    pushApproved('/services/websites-software');
  }

  if (
    quickId === 'software-development' ||
    /(custom software|web application|mobile app|saas mvp|api integration)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Software Development';
    pushApproved('/services/websites-software');
  }

  if (
    quickId === 'cybersecurity' ||
    /(cybersecurity|security review|security audit|maintenance|server hardening)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Cybersecurity & Maintenance';
    pushApproved('/services/security-maintenance');
  }

  if (
    quickId === 'digital-marketing' ||
    /(digital marketing|\bseo\b|paid ads|meta ads|google ads|creator campaign|\bugc\b)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Digital Marketing & Creator Campaigns';
    pushApproved('/services/marketing-creator-campaigns');
  }

  if (
    quickId === 'business-documentation' ||
    /(gst|udyam|\bdpr\b|trademark|registration|business documentation|subsidy)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Business Setup & Documentation';
    pushApproved('/services/business-setup-documentation');
  }

  if (
    quickId === 'business-consulting' ||
    /(consulting|feasibility|market research|business strategy|competitor)/i.test(combined)
  ) {
    extractedFields.serviceRequired =
      extractedFields.serviceRequired || 'Business Consulting & Strategy';
    pushApproved('/services/research-business-strategy');
  }

  if (candidateLinks.length === 0 && /(service|solution|division)/i.test(combined)) {
    pushApproved('/services', 'Browse All Services');
  }

  const mergedDraft = { ...(currentDraft || {}), ...extractedFields };
  const hasLeadInterest = Boolean(
    mergedDraft.serviceRequired ||
      mergedDraft.customerName ||
      mergedDraft.contactNumber ||
      mergedDraft.email ||
      /(quote|enquiry|inquiry|proposal|project|build|need|want|demo|venum|chahiye|வேண்டும்)/i.test(
        userMessage
      )
  );

  const suggestHumanHandover =
    quickId === 'talk-to-human' ||
    /(whatsapp|talk to human|speak to|call me|human|representative|98848|pesanum|baat karni|மனிதர்|தொடர்பு)/i.test(
      combined
    );

  return {
    detectedLanguage,
    recommendedLinks: candidateLinks.slice(0, 3),
    extractedFields,
    suggestEnquiryForm: hasLeadInterest,
    suggestHumanHandover
  };
}

export function validateChatRequestPayload(
  raw: unknown
): { ok: true; data: ReceptionistChatRequest } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Request payload must be a JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  const message = sanitizePlainText(obj.message, 1500);
  if (!message) {
    return { ok: false, error: 'Please enter a message before sending.' };
  }

  const sessionId = sanitizePlainText(obj.sessionId, 80) || 'anonymous-session';
  const mode = obj.mode === 'demo' ? 'demo' : 'live';
  const currentPage = sanitizePlainText(obj.currentPage, 160) || '/';
  const quickActionId = sanitizePlainText(obj.quickActionId, 60) || undefined;

  const historyRaw = Array.isArray(obj.history) ? obj.history.slice(-16) : [];
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const item of historyRaw) {
    if (!item || typeof item !== 'object') continue;
    const itemObj = item as Record<string, unknown>;
    const role = itemObj.role;
    const rawContent = itemObj.content !== undefined ? itemObj.content : itemObj.text;
    const content = sanitizePlainText(rawContent, 1500);
    if ((role === 'user' || role === 'assistant') && content) {
      history.push({ role, content });
    }
  }

  const draftRaw =
    obj.collectedDraft && typeof obj.collectedDraft === 'object'
      ? (obj.collectedDraft as Record<string, unknown>)
      : {};
  const collectedDraft: Partial<ReceptionistEnquiryDraft> = {
    customerName: sanitizePlainText(draftRaw.customerName, 120) || undefined,
    businessName: sanitizePlainText(draftRaw.businessName, 160) || undefined,
    contactNumber: sanitizePlainText(draftRaw.contactNumber, 30) || undefined,
    email: sanitizePlainText(draftRaw.email, 160) || undefined,
    serviceRequired: sanitizePlainText(draftRaw.serviceRequired, 160) || undefined,
    projectDescription: sanitizePlainText(draftRaw.projectDescription, 1500) || undefined,
    budgetRange: sanitizePlainText(draftRaw.budgetRange, 100) || undefined,
    expectedTimeline: sanitizePlainText(draftRaw.expectedTimeline, 100) || undefined
  };

  return {
    ok: true,
    data: {
      sessionId,
      message,
      history,
      mode,
      currentPage,
      quickActionId,
      collectedDraft
    }
  };
}

export function validateEnquirySubmissionPayload(
  raw: unknown
): { ok: true; data: ReceptionistEnquirySubmissionRequest } | { ok: false; error: string; fieldErrors?: Record<string, string> } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Enquiry payload must be a JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  const enquiryRaw =
    obj.enquiry && typeof obj.enquiry === 'object' ? (obj.enquiry as Record<string, unknown>) : {};

  const customerName = sanitizePlainText(enquiryRaw.customerName, 120);
  const businessName = sanitizePlainText(enquiryRaw.businessName, 160);
  const contactNumber = sanitizePlainText(enquiryRaw.contactNumber, 30);
  const email = sanitizePlainText(enquiryRaw.email, 160).toLowerCase();
  const serviceRequired = sanitizePlainText(enquiryRaw.serviceRequired, 160);
  const projectDescription = sanitizePlainText(enquiryRaw.projectDescription, 2000);
  const budgetRange = sanitizePlainText(enquiryRaw.budgetRange, 100);
  const expectedTimeline = sanitizePlainText(enquiryRaw.expectedTimeline, 100);

  const fieldErrors: Record<string, string> = {};
  if (customerName.length < 2) {
    fieldErrors.customerName = 'Please enter your full name (at least 2 characters).';
  }
  const digitsOnly = contactNumber.replace(PHONE_CLEAN_REGEX, '').replace(/\+/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    fieldErrors.contactNumber = 'Please enter a valid 10–15 digit phone or WhatsApp number.';
  }
  if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }
  if (serviceRequired.length < 2) {
    fieldErrors.serviceRequired = 'Please select or enter the service you need.';
  }
  if (projectDescription.length < 10) {
    fieldErrors.projectDescription = 'Please share a brief project description (at least 10 characters).';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors
    };
  }

  const sessionId = sanitizePlainText(obj.sessionId, 80) || 'web-session';
  const sourceMode = obj.sourceMode === 'demo' ? 'demo' : 'live';
  const detectedLanguage: ReceptionistLanguage =
    obj.detectedLanguage === 'ta' ||
    obj.detectedLanguage === 'tanglish' ||
    obj.detectedLanguage === 'hi'
      ? obj.detectedLanguage
      : 'en';
  const pageUrl = sanitizePlainText(obj.pageUrl, 240) || '/';

  const historyRaw = Array.isArray(obj.conversationHistory)
    ? obj.conversationHistory.slice(-40)
    : [];
  const conversationHistory = historyRaw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => ({
      id: sanitizePlainText(item.id, 60) || `msg-${idx + 1}`,
      role: (item.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: sanitizePlainText(item.content, 2000),
      timestamp: sanitizePlainText(item.timestamp, 40) || new Date().toISOString(),
      mode: (item.mode === 'demo' ? 'demo' : 'live') as 'live' | 'demo'
    }))
    .filter((m) => m.content.length > 0);

  return {
    ok: true,
    data: {
      sessionId,
      sourceMode,
      detectedLanguage,
      pageUrl,
      enquiry: {
        customerName,
        businessName,
        contactNumber,
        email,
        serviceRequired,
        projectDescription,
        budgetRange,
        expectedTimeline
      },
      conversationHistory
    }
  };
}

export function validateAdminEnquiryUpdatePayload(raw: unknown):
  | {
      ok: true;
      data: {
        lead_status?: ReceptionistLeadStatus;
        follow_up_required?: boolean;
        follow_up_notes?: string | null;
        follow_up_date?: string | null;
      };
    }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Update payload must be a JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  const data: {
    lead_status?: ReceptionistLeadStatus;
    follow_up_required?: boolean;
    follow_up_notes?: string | null;
    follow_up_date?: string | null;
  } = {};

  if (obj.lead_status !== undefined) {
    const status = String(obj.lead_status) as ReceptionistLeadStatus;
    if (!ALLOWED_LEAD_STATUSES.has(status)) {
      return { ok: false, error: 'Invalid lead status value.' };
    }
    data.lead_status = status;
  }

  if (obj.follow_up_required !== undefined) {
    if (typeof obj.follow_up_required !== 'boolean') {
      return { ok: false, error: 'follow_up_required must be a boolean.' };
    }
    data.follow_up_required = obj.follow_up_required;
  }

  if (obj.follow_up_notes !== undefined) {
    data.follow_up_notes =
      obj.follow_up_notes === null ? null : sanitizePlainText(obj.follow_up_notes, 1000) || null;
  }

  if (obj.follow_up_date !== undefined) {
    if (obj.follow_up_date === null || obj.follow_up_date === '') {
      data.follow_up_date = null;
    } else {
      const dateStr = sanitizePlainText(obj.follow_up_date, 32);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return { ok: false, error: 'follow_up_date must be YYYY-MM-DD.' };
      }
      data.follow_up_date = dateStr;
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: 'No valid fields provided for update.' };
  }

  return { ok: true, data };
}

export function createSlidingWindowRateLimiter(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, number[]>();

  return function checkRateLimit(key: string): {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = (buckets.get(key) || []).filter((ts) => ts > cutoff);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0] || now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      buckets.set(key, timestamps);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds
      };
    }

    timestamps.push(now);
    buckets.set(key, timestamps);

    // Opportunistic cleanup to avoid unbounded memory growth
    if (buckets.size > 2000) {
      for (const [bucketKey, list] of buckets.entries()) {
        if (list.length === 0 || list[list.length - 1] <= cutoff) {
          buckets.delete(bucketKey);
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - timestamps.length),
      retryAfterSeconds: 0
    };
  };
}
