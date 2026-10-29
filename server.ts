import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Support body parsing with realistic size bounds
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// ====================================================================
// SUPABASE CLIENT SETUP (Strict Separation of Server Secrets & Capabilities)
// ====================================================================
export interface ResolvedSupabaseConfig {
  url: string;
  publishableKey: string;
  publishableKeySource:
    | 'SUPABASE_PUBLISHABLE_KEY'
    | 'VITE_SUPABASE_PUBLISHABLE_KEY'
    | 'SUPABASE_ANON_KEY'
    | 'VITE_SUPABASE_ANON_KEY'
    | 'none';
  privilegedKey: string;
  privilegedKeySource: 'SUPABASE_SECRET_KEY' | 'SUPABASE_SERVICE_ROLE_KEY' | 'none';
  isValidUrl: boolean;
  isPublicClientConfigured: boolean;
  isUserAuthConfigured: boolean;
  isPrivilegedServerConfigured: boolean;
}

export function resolveSupabaseConfig(env: NodeJS.ProcessEnv = process.env): ResolvedSupabaseConfig {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim();
  const isValidUrl = Boolean(url && !url.includes('example.com') && url.startsWith('https://'));

  // 1. Publishable / Public key resolution (never allow secret keys here)
  let publishableKey = '';
  let publishableKeySource: ResolvedSupabaseConfig['publishableKeySource'] = 'none';
  const pubCandidates: Array<[ResolvedSupabaseConfig['publishableKeySource'], string | undefined]> = [
    ['SUPABASE_PUBLISHABLE_KEY', env.SUPABASE_PUBLISHABLE_KEY],
    ['VITE_SUPABASE_PUBLISHABLE_KEY', env.VITE_SUPABASE_PUBLISHABLE_KEY],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY],
    ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY]
  ];
  for (const [source, rawVal] of pubCandidates) {
    const val = (rawVal || '').trim();
    if (val && !val.startsWith('sb_secret_')) {
      publishableKey = val;
      publishableKeySource = source;
      break;
    }
  }

  // 2. Privileged server credential resolution:
  //    - SUPABASE_SECRET_KEY is the preferred privileged server credential
  //    - SUPABASE_SERVICE_ROLE_KEY is supported only as a legacy compatibility fallback
  //    - Never substitute a publishable/anon key for a privileged client
  let privilegedKey = '';
  let privilegedKeySource: ResolvedSupabaseConfig['privilegedKeySource'] = 'none';
  const secretKeyVal = (env.SUPABASE_SECRET_KEY || '').trim();
  const legacyServiceRoleVal = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (secretKeyVal && !secretKeyVal.startsWith('sb_publishable_') && secretKeyVal !== publishableKey) {
    privilegedKey = secretKeyVal;
    privilegedKeySource = 'SUPABASE_SECRET_KEY';
  } else if (
    legacyServiceRoleVal &&
    !legacyServiceRoleVal.startsWith('sb_publishable_') &&
    legacyServiceRoleVal !== publishableKey
  ) {
    privilegedKey = legacyServiceRoleVal;
    privilegedKeySource = 'SUPABASE_SERVICE_ROLE_KEY';
  }

  return {
    url,
    publishableKey,
    publishableKeySource,
    privilegedKey,
    privilegedKeySource,
    isValidUrl,
    isPublicClientConfigured: Boolean(isValidUrl && publishableKey),
    isUserAuthConfigured: Boolean(isValidUrl && (publishableKey || privilegedKey)),
    isPrivilegedServerConfigured: Boolean(isValidUrl && privilegedKey)
  };
}

export const supabaseConfig = resolveSupabaseConfig(process.env);
export const isSupabaseConfigured = supabaseConfig.isUserAuthConfigured;

// Server-side privileged client using SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY fallback).
// CRITICAL: Never substitute a publishable/anon key for supabaseAdmin!
const supabaseAdmin: SupabaseClient | null = supabaseConfig.isPrivilegedServerConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.privilegedKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Public client for normal user-token verification (never uses privileged key)
const supabasePublic: SupabaseClient | null = supabaseConfig.isPublicClientConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// In-memory fallback repository used ONLY in automated test mode (NODE_ENV=test)
export interface InMemAppRecord {
  id: string;
  application_reference: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  state: string;
  district: string;
  town: string;
  contact_language: string;
  social_platforms: any;
  instagram_url: string;
  youtube_url: string;
  other_profile_urls: any;
  follower_count: string;
  subscriber_count: string;
  average_views: string;
  publishing_frequency: string;
  creator_categories: string[];
  languages: string[];
  dialects: string[];
  creator_classification: string;
  audience_location: string;
  audience_insights: any;
  collaboration_preferences: string[];
  expected_rates: any;
  travel_availability: string;
  previous_collaborations: any;
  portfolio_urls: string[];
  privacy_consent: boolean;
  contact_consent: boolean;
  brand_sharing_consent: boolean;
  application_status: string;
  admin_notes?: string;
  campaign_matches?: string[];
  payments?: any[];
  activity_log?: any[];
  latest_score?: number;
  ip_hash?: string;
  created_at: string;
  updated_at: string;
  assets?: any[];
  evaluations?: any[];
}

export const memoryApplications: InMemAppRecord[] = [
  {
    id: 'mem-app-01',
    application_reference: 'U360-CR-TM7841',
    full_name: 'Karthik Senthilnathan',
    whatsapp_number: '+91 94432 18900',
    email: 'karthik.maduraifoodie@gmail.com',
    state: 'Tamil Nadu',
    district: 'Madurai',
    town: 'Madurai City',
    contact_language: 'Tamil',
    social_platforms: ['Instagram', 'YouTube'],
    instagram_url: 'https://instagram.com/madurai_flavors_official',
    youtube_url: 'https://youtube.com/@maduraiflavors',
    other_profile_urls: [],
    follower_count: '48,500',
    subscriber_count: '12,200',
    average_views: '35,000 - 90,000',
    publishing_frequency: '4-5 videos per week',
    creator_categories: ['Food & Culinary', 'Travel & Staycations'],
    languages: ['Tamil', 'English'],
    dialects: ['Madurai Tamil', 'Standard / Neutral Tamil'],
    creator_classification: 'l3_micro',
    audience_location: 'Tamil Nadu (Madurai, Chennai, Coimbatore)',
    audience_insights: { gender: '58% Male / 42% Female', age: '22 - 35 years' },
    collaboration_preferences: ['Sponsored Reel / Short', 'On-location Shooting'],
    expected_rates: { ugc: '₹2,500', sponsoredReel: '₹4,500', story: '₹1,000', onLocationDaily: '₹6,000' },
    travel_availability: 'Across South India',
    previous_collaborations: { details: 'Partnered with regional hospitality and sweet brands.' },
    portfolio_urls: ['https://www.instagram.com/reel/DBa123_sample1/', 'https://www.instagram.com/reel/DCb456_sample2/'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'shortlisted',
    admin_notes: 'High production quality food content. Strong regional engagement in Madurai & Dindigul.',
    campaign_matches: ['Diwali Traditional Sweets UGC', 'Madurai Heritage Food Trail'],
    latest_score: 87,
    ip_hash: 'a91f4c82d01e7b33',
    payments: [
      {
        id: 'pay-001',
        campaign_name: 'Madurai Heritage Food Trail',
        amount: 4500,
        status: 'paid',
        payment_date: '2026-10-15',
        reference_utr: 'UTR849204829103',
        notes: 'Sponsored reel delivery completed and verified.'
      }
    ],
    activity_log: [
      {
        id: 'act-001',
        event_type: 'application_submitted',
        action: 'Application Submitted',
        actor_email: 'portal@unikorn360.com',
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
        details: 'Self-registered through UNIKORN360 Creator Portal.'
      },
      {
        id: 'act-002',
        event_type: 'status_updated',
        action: 'Status Changed to Shortlisted',
        actor_email: 'admin@unikorn360.com',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        details: 'Qualified for regional food brand collaborations.'
      },
      {
        id: 'act-003',
        event_type: 'evaluation_submitted',
        action: 'Unicorn Score Evaluated (87/100)',
        actor_email: 'evaluator@unikorn360.com',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        details: 'Exceptional regional relevance and authenticity.'
      }
    ],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    assets: [
      {
        id: 'asset-01',
        file_type: 'video_sample',
        original_filename: 'sample_reel_restaurant.mp4',
        storage_path: 'applications/U360-CR-TM7841/video/sample_reel_restaurant.mp4',
        mime_type: 'video/mp4',
        file_size: 14200000,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'mem-app-02',
    application_reference: 'U360-CR-UG9102',
    full_name: 'Pooja Venkatesh',
    whatsapp_number: '+91 98401 54321',
    email: 'pooja.ugctamil@gmail.com',
    state: 'Tamil Nadu',
    district: 'Chennai',
    town: 'Anna Nagar, Chennai',
    contact_language: 'Tanglish / Both',
    social_platforms: ['Instagram'],
    instagram_url: 'https://instagram.com/pooja.ugc.tamil',
    youtube_url: '',
    other_profile_urls: ['https://linkedin.com/in/poojavenkatesh-ugc'],
    follower_count: '6,400',
    subscriber_count: '0',
    average_views: '12,000 - 28,000',
    publishing_frequency: 'Daily or 4x weekly',
    creator_categories: ['Beauty & Skincare', 'Fashion & Apparel', 'Product Reviews'],
    languages: ['Tamil', 'English'],
    dialects: ['Chennai Tamil / Madras Bashai'],
    creator_classification: 'l2_nano',
    audience_location: 'Tamil Nadu (Chennai, Tier-2 cities)',
    audience_insights: { gender: '74% Female / 26% Male', age: '18 - 28 years' },
    collaboration_preferences: ['UGC Video Creation Only', 'Product Reviews & Unboxing'],
    expected_rates: { ugc: '₹1,500', sponsoredReel: '₹2,500', story: '₹800', onLocationDaily: '₹3,500' },
    travel_availability: 'Within district only',
    previous_collaborations: { details: 'Created 14 UGC video ads for D2C skincare brands.' },
    portfolio_urls: ['https://www.instagram.com/reel/DFg789_sampleUGC1/', 'https://www.instagram.com/reel/DGh012_sampleUGC2/'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'reviewing',
    admin_notes: 'Excellent UGC presentation skills. Natural speaking voice in Tamil and English.',
    campaign_matches: ['D2C Ayurvedic Skincare Q4 Launch'],
    latest_score: 79,
    payments: [],
    activity_log: [
      {
        id: 'act-004',
        action: 'Application Submitted',
        actor_email: 'portal@unikorn360.com',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        details: 'Submitted with 2 UGC video links.'
      },
      {
        id: 'act-005',
        action: 'Status Changed to Under Review',
        actor_email: 'admin@unikorn360.com',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        details: 'Under evaluation for direct-to-consumer video briefs.'
      }
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assets: []
  },
  {
    id: 'mem-app-03',
    application_reference: 'U360-CR-CB4420',
    full_name: 'Dinesh Kumar (TechTamilan)',
    whatsapp_number: '+91 97892 45610',
    email: 'dinesh.techtamil@outlook.com',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    town: 'Gandhipuram, Coimbatore',
    contact_language: 'Tamil',
    social_platforms: ['YouTube', 'Instagram'],
    instagram_url: 'https://instagram.com/dinesh_tech_tamil',
    youtube_url: 'https://youtube.com/@techtamilanofficial',
    other_profile_urls: [],
    follower_count: '142,000',
    subscriber_count: '215,000',
    average_views: '80,000 - 180,000',
    publishing_frequency: '3 videos per week',
    creator_categories: ['Technology & Gadgets', 'Business & MSME'],
    languages: ['Tamil', 'English'],
    dialects: ['Kongu Tamil (Coimbatore / Erode / Salem)', 'Standard / Neutral Tamil'],
    creator_classification: 'l4_regional',
    audience_location: 'Across Tamil Nadu, Coimbatore & Western Belt',
    audience_insights: { gender: '82% Male / 18% Female', age: '20 - 40 years' },
    collaboration_preferences: ['Video Creation & Publishing', 'Product Reviews & Unboxing', 'Long-term Brand Partnerships'],
    expected_rates: { ugc: '₹5,000', sponsoredReel: '₹12,000', story: '₹3,000', onLocationDaily: '₹15,000' },
    travel_availability: 'Across Tamil Nadu',
    previous_collaborations: { details: 'Reviewed 40+ SaaS platforms, smartphones, and industrial machinery.' },
    portfolio_urls: ['https://youtube.com/watch?v=sample_tech1', 'https://instagram.com/reel/sample_tech2'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'approved',
    admin_notes: 'Highly credible regional tech authority. Top conversion track record for B2B & consumer electronics.',
    campaign_matches: ['MSME Cloud ERP Showcase', 'Coimbatore Industrial Tech Expo'],
    latest_score: 93,
    payments: [
      {
        id: 'pay-002',
        campaign_name: 'MSME Cloud ERP Showcase',
        amount: 12000,
        status: 'paid',
        payment_date: '2026-10-20',
        reference_utr: 'UTR930219840291',
        notes: 'Full review video delivered on YouTube channel.'
      }
    ],
    activity_log: [
      {
        id: 'act-006',
        action: 'Application Approved',
        actor_email: 'admin@unikorn360.com',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        details: 'Approved as UNIKORN360 Lead Regional Tech Creator.'
      }
    ],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assets: []
  },
  {
    id: 'mem-app-04',
    application_reference: 'U360-CR-TP8810',
    full_name: 'Sathya Priya S.',
    whatsapp_number: '+91 99403 67112',
    email: 'sathya.vnbcrafts@gmail.com',
    state: 'Tamil Nadu',
    district: 'Tirupathur',
    town: 'Vaniyambadi',
    contact_language: 'Tamil',
    social_platforms: ['Instagram'],
    instagram_url: 'https://instagram.com/sathya_vnb_handlooms',
    youtube_url: '',
    other_profile_urls: [],
    follower_count: '3,800',
    subscriber_count: '0',
    average_views: '5,000 - 15,000',
    publishing_frequency: 'Daily',
    creator_categories: ['Business & MSME', 'Fashion & Apparel', 'Shopping & Retail Deals'],
    languages: ['Tamil', 'English'],
    dialects: ['North Arcot / Vellore / Tirupathur Tamil'],
    creator_classification: 'l1_community',
    audience_location: 'Vaniyambadi, Ambur, Tirupathur, Vellore',
    audience_insights: { gender: '65% Female / 35% Male', age: '24 - 45 years' },
    collaboration_preferences: ['UGC Video Creation Only', 'Event Coverage & Store Walkthrough'],
    expected_rates: { ugc: '₹1,000', sponsoredReel: '₹1,800', story: '₹500', onLocationDaily: '₹2,500' },
    travel_availability: 'Within district only',
    previous_collaborations: { details: 'Handloom saree launches and local boutique coverage.' },
    portfolio_urls: ['https://instagram.com/reel/sample_vnb_sathya'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'new',
    admin_notes: 'Hyper-local influence in Vaniyambadi and Ambur commercial clusters. Sincere and direct voice.',
    campaign_matches: ['Tirupathur Retail MSME Spotlight'],
    latest_score: 75,
    payments: [],
    activity_log: [
      {
        id: 'act-007',
        action: 'Application Submitted',
        actor_email: 'portal@unikorn360.com',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        details: 'Received from Vaniyambadi regional creator.'
      }
    ],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assets: []
  },
  {
    id: 'mem-app-05',
    application_reference: 'U360-CR-SL6612',
    full_name: 'Vignesh Rajan',
    whatsapp_number: '+91 96291 88320',
    email: 'vignesh.salemriders@gmail.com',
    state: 'Tamil Nadu',
    district: 'Salem',
    town: 'Salem City',
    contact_language: 'Tamil',
    social_platforms: ['Instagram', 'YouTube'],
    instagram_url: 'https://instagram.com/salem_moto_vignesh',
    youtube_url: 'https://youtube.com/@salemmotovlog',
    other_profile_urls: [],
    follower_count: '310,000',
    subscriber_count: '180,000',
    average_views: '120,000 - 350,000',
    publishing_frequency: '2-3 videos weekly',
    creator_categories: ['Automotive & Bikes', 'Travel & Staycations'],
    languages: ['Tamil', 'English'],
    dialects: ['Kongu Tamil (Coimbatore / Erode / Salem)'],
    creator_classification: 'l5_mid_tier',
    audience_location: 'Across South India & Tamil Nadu',
    audience_insights: { gender: '89% Male / 11% Female', age: '18 - 32 years' },
    collaboration_preferences: ['Sponsored Reel / Short', 'On-location Shooting', 'Long-term Brand Partnerships'],
    expected_rates: { ugc: '₹8,000', sponsoredReel: '₹18,000', story: '₹4,500', onLocationDaily: '₹22,000' },
    travel_availability: 'Anywhere in India',
    previous_collaborations: { details: 'Major OEM bike launches and automotive lubricants.' },
    portfolio_urls: ['https://instagram.com/reel/salem_bike_reel1', 'https://youtube.com/watch?v=salem_bike_tour'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'approved',
    admin_notes: 'High reach automotive creator with cinematic drone & action camera equipment.',
    campaign_matches: ['Tamil Nadu EV Highway Endurance Tour'],
    latest_score: 95,
    payments: [
      {
        id: 'pay-003',
        campaign_name: 'Tamil Nadu EV Highway Endurance Tour',
        amount: 22000,
        status: 'paid',
        payment_date: '2026-10-22',
        reference_utr: 'UTR771028394012',
        notes: 'Stage 1 on-location coverage complete.'
      }
    ],
    activity_log: [
      {
        id: 'act-008',
        action: 'Application Approved',
        actor_email: 'admin@unikorn360.com',
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        details: 'Approved for premium automotive campaigns.'
      }
    ],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    assets: []
  },
  {
    id: 'mem-app-06',
    application_reference: 'U360-CR-TR3321',
    full_name: 'Anitha Ramesh',
    whatsapp_number: '+91 94860 12399',
    email: 'anitha.familytrichy@gmail.com',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    town: 'Thillai Nagar, Trichy',
    contact_language: 'Tamil',
    social_platforms: ['Instagram', 'YouTube'],
    instagram_url: 'https://instagram.com/trichy_mom_anitha',
    youtube_url: 'https://youtube.com/@trichymomanitha',
    other_profile_urls: [],
    follower_count: '620,000',
    subscriber_count: '490,000',
    average_views: '200,000 - 600,000',
    publishing_frequency: 'Daily',
    creator_categories: ['Family & Parenting', 'Lifestyle & Vlogging', 'Shopping & Retail Deals'],
    languages: ['Tamil'],
    dialects: ['Thanjavur / Delta Tamil', 'Standard / Neutral Tamil'],
    creator_classification: 'l6_established',
    audience_location: 'Tamil diaspora & Tamil Nadu state-wide',
    audience_insights: { gender: '81% Female / 19% Male', age: '25 - 50 years' },
    collaboration_preferences: ['Sponsored Reel / Short', 'Video Creation & Publishing'],
    expected_rates: { ugc: '₹15,000', sponsoredReel: '₹35,000', story: '₹10,000', onLocationDaily: '₹40,000' },
    travel_availability: 'Across Tamil Nadu',
    previous_collaborations: { details: 'FMCG and retail apparel brand ambassador campaigns.' },
    portfolio_urls: ['https://instagram.com/reel/trichy_sample_reel'],
    privacy_consent: true,
    contact_consent: true,
    brand_sharing_consent: true,
    application_status: 'inactive',
    admin_notes: 'Currently on maternity sabbatical. Roster paused until Q1 2027.',
    campaign_matches: [],
    latest_score: 68,
    payments: [],
    activity_log: [
      {
        id: 'act-009',
        action: 'Status Changed to Inactive',
        actor_email: 'admin@unikorn360.com',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        details: 'Creator requested temporary pause due to personal scheduling.'
      }
    ],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    assets: []
  }
];

// Memory evaluations
const memoryEvaluations: any[] = [];

// ====================================================================
// SECURITY HELPERS & RATE LIMITING
// ====================================================================
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitBucket>();

function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = ipRateLimits.get(ip);

    if (!bucket || bucket.resetAt < now) {
      ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    bucket.count += 1;
    next();
  };
}

// Clean sanitized filename
function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const hash = crypto.randomBytes(4).toString('hex');
  return `${base}_${hash}${ext}`;
}

// Validate file constraints
function validateFileConstraints(type: string, size: number, category: string): { valid: boolean; error?: string } {
  const allowedCategories = ['video_sample', 'audience_insight', 'media_kit'];
  if (!allowedCategories.includes(category)) {
    return { valid: false, error: 'Invalid asset category' };
  }

  if (category === 'video_sample') {
    const allowedVideoMimes = ['video/mp4', 'video/quicktime'];
    if (!allowedVideoMimes.includes(type.toLowerCase())) {
      return { valid: false, error: 'Video samples must be MP4 or MOV files.' };
    }
    if (size > 30 * 1024 * 1024) {
      return { valid: false, error: 'Video samples must not exceed 30 MB.' };
    }
  } else if (category === 'audience_insight') {
    const allowedImageMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedImageMimes.includes(type.toLowerCase())) {
      return { valid: false, error: 'Audience insights must be JPG, PNG or PDF.' };
    }
    if (size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Insight screenshots must not exceed 5 MB.' };
    }
  } else if (category === 'media_kit') {
    if (type.toLowerCase() !== 'application/pdf') {
      return { valid: false, error: 'Media kits must be in PDF format.' };
    }
    if (size > 10 * 1024 * 1024) {
      return { valid: false, error: 'Media kits must not exceed 10 MB.' };
    }
  }

  return { valid: true };
}

// In-memory admin users registry for test runner / isolated verification
export interface InMemAdminUser {
  id: string;
  authenticated_user_id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'evaluator';
}
export const memoryAdminUsers: InMemAdminUser[] = [];
export const memoryTokens = new Map<string, { id: string; email: string; role: 'superadmin' | 'admin' | 'evaluator' }>();

export function isTestMemoryFallbackEnabled(): boolean {
  return process.env.NODE_ENV === 'test' && process.env.DISABLE_TEST_MEMORY_FALLBACK !== 'true';
}

function createUserScopedClient(accessToken: string): SupabaseClient | null {
  if (!supabaseConfig.isPublicClientConfigured) return null;
  return createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

// ====================================================================
// ROLE-AWARE CREATOR RESPONSE PROJECTION (Strict Evaluator Privacy)
// ====================================================================
export const EVALUATOR_CREATOR_FIELD_ALLOWLIST = [
  'id',
  'application_reference',
  'full_name',
  'whatsapp_number',
  'email',
  'state',
  'district',
  'town',
  'contact_language',
  'social_platforms',
  'instagram_url',
  'youtube_url',
  'other_profile_urls',
  'follower_count',
  'subscriber_count',
  'average_views',
  'publishing_frequency',
  'creator_categories',
  'languages',
  'dialects',
  'creator_classification',
  'audience_location',
  'audience_insights',
  'collaboration_preferences',
  'expected_rates',
  'travel_availability',
  'previous_collaborations',
  'portfolio_urls',
  'privacy_consent',
  'contact_consent',
  'brand_sharing_consent',
  'application_status',
  'campaign_matches',
  'activity_log',
  'latest_score',
  'created_at',
  'updated_at',
  'assets',
  'evaluations'
] as const;

export const EVALUATOR_ASSET_FIELD_ALLOWLIST = [
  'id',
  'application_id',
  'file_type',
  'original_filename',
  'storage_path',
  'mime_type',
  'file_size',
  'created_at'
] as const;

export const EVALUATOR_EVALUATION_FIELD_ALLOWLIST = [
  'id',
  'application_id',
  'engagement_quality',
  'average_views_score',
  'content_quality',
  'authenticity',
  'presentation',
  'audience_brand_fit',
  'local_relevance',
  'historical_performance',
  'cost_efficiency',
  'reliability',
  'total_score',
  'evaluation_notes',
  'evaluated_by',
  'evaluated_by_name',
  'created_at'
] as const;

export const EVALUATOR_EXPECTED_RATES_FIELD_ALLOWLIST = [
  'ugc',
  'sponsoredReel',
  'story',
  'additionalProduction',
  'onLocationDaily'
] as const;

export const EVALUATOR_AUDIENCE_INSIGHTS_FIELD_ALLOWLIST = [
  'gender',
  'age',
  'genderBreakdown',
  'topAgeGroup',
  'topLocations'
] as const;

export const EVALUATOR_PREVIOUS_COLLABS_FIELD_ALLOWLIST = [
  'hasPrior',
  'details'
] as const;

export const EVALUATOR_ACTIVITY_SUMMARY_MAP: Record<string, string> = {
  application_submitted: 'Application submitted',
  status_updated: 'Application status updated',
  campaigns_updated: 'Campaign assignments updated',
  evaluation_submitted: 'Creator evaluation submitted'
};

export const EVALUATOR_ALLOWED_ACTIVITY_EVENT_TYPES = new Set(
  Object.keys(EVALUATOR_ACTIVITY_SUMMARY_MAP)
);

const SAFE_ACTIVITY_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;
const ISO8601_TIMESTAMP_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|[+-](\d{2}):(\d{2}))$/;

export function isValidIso8601Timestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO8601_TIMESTAMP_REGEX.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const tzHour = match[8] !== undefined ? Number(match[8]) : 0;
  const tzMinute = match[9] !== undefined ? Number(match[9]) : 0;

  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;
  if (tzHour > 23 || tzMinute > 59) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return false;

  const parsedMs = Date.parse(value);
  return !Number.isNaN(parsedMs);
}

function projectAllowlistedObject<T extends readonly string[]>(
  rawObj: any,
  allowlist: T
): Record<string, any> | null {
  if (!rawObj || typeof rawObj !== 'object' || Array.isArray(rawObj)) return null;
  const out: Record<string, any> = {};
  for (const key of allowlist) {
    if (Object.prototype.hasOwnProperty.call(rawObj, key)) {
      out[key] = rawObj[key];
    }
  }
  return out;
}

export function filterActivityLogForEvaluator(rawLog: any, _payments?: any[]): Array<{
  id: string;
  event_type: string;
  action: string;
  timestamp: string;
}> {
  if (!Array.isArray(rawLog)) return [];

  const safeEntries: Array<{
    id: string;
    event_type: string;
    action: string;
    timestamp: string;
  }> = [];

  for (const item of rawLog) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;

    if (typeof item.id !== 'string' || !SAFE_ACTIVITY_ID_REGEX.test(item.id)) {
      continue;
    }

    if (
      typeof item.event_type !== 'string' ||
      !Object.prototype.hasOwnProperty.call(EVALUATOR_ACTIVITY_SUMMARY_MAP, item.event_type)
    ) {
      continue;
    }

    if (!isValidIso8601Timestamp(item.timestamp)) {
      continue;
    }

    // Construct synthetic summary strictly from approved event_type.
    // Never copy original free-text action, details, actor_email, notes, or nested metadata.
    safeEntries.push({
      id: item.id,
      event_type: item.event_type,
      action: EVALUATOR_ACTIVITY_SUMMARY_MAP[item.event_type],
      timestamp: item.timestamp
    });
  }

  return safeEntries;
}

export function projectCreatorForRole(
  record: any,
  role: 'superadmin' | 'admin' | 'evaluator'
): any {
  if (!record || typeof record !== 'object') return record;

  if (role === 'evaluator') {
    const projected: Record<string, any> = {};
    for (const key of EVALUATOR_CREATOR_FIELD_ALLOWLIST) {
      if (key === 'activity_log') {
        projected.activity_log = filterActivityLogForEvaluator(record.activity_log);
      } else if (key === 'assets') {
        if (Array.isArray(record.assets)) {
          projected.assets = record.assets
            .map((asset: any) => projectAllowlistedObject(asset, EVALUATOR_ASSET_FIELD_ALLOWLIST))
            .filter(Boolean);
        }
      } else if (key === 'evaluations') {
        if (Array.isArray(record.evaluations)) {
          projected.evaluations = record.evaluations
            .map((ev: any) => projectAllowlistedObject(ev, EVALUATOR_EVALUATION_FIELD_ALLOWLIST))
            .filter(Boolean);
        }
      } else if (key === 'expected_rates') {
        if (record.expected_rates && typeof record.expected_rates === 'object') {
          projected.expected_rates = projectAllowlistedObject(
            record.expected_rates,
            EVALUATOR_EXPECTED_RATES_FIELD_ALLOWLIST
          ) || {};
        }
      } else if (key === 'audience_insights') {
        if (record.audience_insights && typeof record.audience_insights === 'object') {
          projected.audience_insights = projectAllowlistedObject(
            record.audience_insights,
            EVALUATOR_AUDIENCE_INSIGHTS_FIELD_ALLOWLIST
          ) || {};
        }
      } else if (key === 'previous_collaborations') {
        if (record.previous_collaborations && typeof record.previous_collaborations === 'object') {
          projected.previous_collaborations = projectAllowlistedObject(
            record.previous_collaborations,
            EVALUATOR_PREVIOUS_COLLABS_FIELD_ALLOWLIST
          ) || {};
        }
      } else if (Object.prototype.hasOwnProperty.call(record, key)) {
        projected[key] = record[key];
      }
    }
    return projected;
  }

  // For superadmin and admin: preserve full financial history, admin_notes, and activity_log, strip internal ip_hash
  const { ip_hash, ...safeRecord } = record;
  return safeRecord;
}

// ====================================================================
// ADMIN AUTHENTICATION & RBAC AUTHORIZATION MIDDLEWARE
// ====================================================================
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Strict Token Authentication: Bearer token is REQUIRED.
  // All PIN headers (e.g. x-admin-pin) and bypasses are completely eliminated.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required. Missing or malformed Bearer authorization header.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ 
      error: 'Empty authorization token provided.',
      code: 'UNAUTHORIZED'
    });
  }

  const testFallback = isTestMemoryFallbackEnabled();

  // If Supabase user-token verification is not configured outside test mode, deny protected access (fail closed)
  if (!testFallback && !supabaseConfig.isUserAuthConfigured) {
    return res.status(503).json({
      error: 'Administrator authentication service is unavailable. Backend Supabase configuration is missing.',
      code: 'AUTH_UNAVAILABLE'
    });
  }

  try {
    let verifiedUser: { id: string; email: string } | null = null;

    // 1. Verify with Supabase Auth
    if (supabasePublic || supabaseAdmin) {
      const client = supabasePublic || supabaseAdmin!;
      const { data, error } = await client.auth.getUser(token);
      if (!error && data?.user) {
        verifiedUser = {
          id: data.user.id,
          email: data.user.email || ''
        };
      }
    }

    // 2. Check test / memory tokens registry ONLY when NODE_ENV === 'test'
    if (!verifiedUser && testFallback && memoryTokens.has(token)) {
      const mem = memoryTokens.get(token)!;
      verifiedUser = { id: mem.id, email: mem.email };
    }

    if (!verifiedUser) {
      return res.status(401).json({ 
        error: 'Invalid or expired session. Please sign in again.',
        code: 'INVALID_TOKEN'
      });
    }

    // 3. Verify Administrator Membership from creator_admin_users table
    // CRITICAL: An email address ALONE never grants privileges!
    // No hardcoded emails or caller-supplied claims are accepted.
    let verifiedRole: 'superadmin' | 'admin' | 'evaluator' | null = null;
    const roleClient = supabaseAdmin || createUserScopedClient(token);

    if (roleClient) {
      const { data: adminRecord, error: roleError } = await roleClient
        .from('creator_admin_users')
        .select('role')
        .eq('authenticated_user_id', verifiedUser.id)
        .maybeSingle();

      if (roleError && !testFallback) {
        return res.status(503).json({
          error: 'Unable to verify administrator membership against creator_admin_users.',
          code: 'MEMBERSHIP_VERIFICATION_UNAVAILABLE'
        });
      }

      if (adminRecord?.role && ['superadmin', 'admin', 'evaluator'].includes(adminRecord.role)) {
        verifiedRole = adminRecord.role as any;
      }
    } else if (!testFallback) {
      return res.status(503).json({
        error: 'Administrator membership database verification is not configured.',
        code: 'MEMBERSHIP_VERIFICATION_UNAVAILABLE'
      });
    }

    // Check memory admin users ONLY when NODE_ENV === 'test'
    if (!verifiedRole && testFallback) {
      const memUser = memoryAdminUsers.find(
        u => u.authenticated_user_id === verifiedUser!.id
      );
      if (memUser) {
        verifiedRole = memUser.role;
      }
    }

    if (!verifiedRole) {
      return res.status(403).json({ 
        error: 'Access Denied: User account is not an authorized administrator in creator_admin_users.',
        code: 'FORBIDDEN'
      });
    }

    (req as any).user = verifiedUser;
    (req as any).adminRole = verifiedRole;
    return next();
  } catch (err: any) {
    console.error('Error verifying admin bearer token:', err);
    return res.status(401).json({ 
      error: 'Authentication verification failed.',
      code: 'AUTH_VERIFICATION_FAILED'
    });
  }
}

export function requireRole(allowedRoles: ('superadmin' | 'admin' | 'evaluator')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).adminRole as 'superadmin' | 'admin' | 'evaluator' | undefined;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Permission Denied: This operation requires one of [${allowedRoles.join(', ')}] permissions. Current role: ${role || 'none'}`,
        code: 'FORBIDDEN_ROLE'
      });
    }
    next();
  };
}

function sendMissingPrivilegedConfig(res: Response) {
  return res.status(503).json({
    error: 'Privileged server credential (SUPABASE_SECRET_KEY) is not configured. Database/storage operation cannot be completed.',
    code: 'PRIVILEGED_CONFIG_MISSING'
  });
}

// ====================================================================
// PUBLIC CREATOR API ENDPOINTS
// ====================================================================

// 1. Storage Upload URL Signer (Generates short-lived signed upload URL for private bucket)
app.post('/api/creators/upload-sign', rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const { filename, fileType, fileSize, category, applicationRef } = req.body;

    if (!filename || !fileType || !fileSize || !category) {
      return res.status(400).json({ error: 'Missing required file metadata.' });
    }

    const validation = validateFileConstraints(fileType, fileSize, category);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const sanitizedName = sanitizeFilename(filename);
    const refCode = (applicationRef || `temp_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const storagePath = `applications/${refCode}/${category}/${Date.now()}_${sanitizedName}`;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from('creator-submissions')
        .createSignedUploadUrl(storagePath);

      if (error) {
        return res.status(503).json({
          error: `Storage upload signing failed: ${error.message}`,
          code: 'STORAGE_UNAVAILABLE'
        });
      }

      return res.json({
        mode: 'direct_signed_url',
        signedUrl: data.signedUrl,
        token: data.token,
        storagePath,
        sanitizedName
      });
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    // Test-only relay mode
    return res.json({
      mode: 'server_relay',
      storagePath,
      sanitizedName,
      uploadEndpoint: `/api/creators/upload-relay`
    });
  } catch (err: any) {
    console.error('Error in /api/creators/upload-sign:', err);
    res.status(500).json({ error: 'Failed to generate upload signature.' });
  }
});

// 2. Server Relay Upload
app.post('/api/creators/upload-relay', rateLimit(20, 60000), async (req: Request, res: Response) => {
  try {
    const { storagePath, fileData, fileType, originalFilename, fileSize, category } = req.body;

    if (!storagePath || !fileData || !fileType) {
      return res.status(400).json({ error: 'Missing required upload payload.' });
    }

    if (supabaseAdmin) {
      const buffer = Buffer.from(fileData, 'base64');
      const { error } = await supabaseAdmin.storage
        .from('creator-submissions')
        .upload(storagePath, buffer, {
          contentType: fileType,
          upsert: true
        });

      if (error) {
        console.error('Error uploading to Supabase storage:', error);
        return res.status(500).json({ error: 'Failed to upload file to secure storage.' });
      }

      return res.json({
        success: true,
        storagePath,
        originalFilename,
        fileSize,
        fileType,
        category
      });
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    return res.json({
      success: true,
      storagePath,
      originalFilename,
      fileSize,
      fileType,
      category
    });
  } catch (err: any) {
    console.error('Error in /api/creators/upload-relay:', err);
    res.status(500).json({ error: 'Server upload error.' });
  }
});

// 3. Application Submission Endpoint
app.post('/api/creators/apply', rateLimit(10, 3600000), async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // A. Honeypot Anti-Bot Field check
    if (payload.company_website_hp || payload.business_tax_id_hp) {
      return res.status(400).json({ error: 'Invalid submission parameters.' });
    }

    // B. Required Fields Validation
    const required = [
      'fullName',
      'whatsapp',
      'email',
      'state',
      'district',
      'cityTown',
      'classification',
      'categories'
    ];

    for (const field of required) {
      if (!payload[field] || (Array.isArray(payload[field]) && payload[field].length === 0)) {
        return res.status(400).json({ error: `Field '${field}' is required.` });
      }
    }

    // C. Strict Consents Validation (Must all be true)
    if (
      !payload.consentAccuracy || 
      !payload.consentProcessing || 
      !payload.consentContact || 
      !payload.consentBrandSharing
    ) {
      return res.status(400).json({
        error: 'All 4 declarations and consents must be explicitly accepted by the applicant.'
      });
    }

    // D. Email & Phone Format Validation
    const emailClean = payload.email.trim().toLowerCase();
    const phoneClean = payload.whatsapp.trim().replace(/\s+/g, '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (!/^[0-9+]{8,16}$/.test(phoneClean)) {
      return res.status(400).json({ error: 'Invalid WhatsApp contact number format.' });
    }

    // E. Minimum Portfolio Check (at least 2 samples between links + uploaded videos)
    const validLinks = Array.isArray(payload.sampleLinks) 
      ? payload.sampleLinks.filter((l: string) => typeof l === 'string' && l.trim().length > 0)
      : [];
    const uploadedVideos = Array.isArray(payload.uploadedVideos) ? payload.uploadedVideos : [];
    if (validLinks.length + uploadedVideos.length < 2) {
      return res.status(400).json({
        error: 'At least two portfolio examples (video links or uploads) are required.'
      });
    }

    if ((!supabaseAdmin || !resolveSupabaseConfig(process.env).isPrivilegedServerConfigured) && !isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    // F. Duplicate Submission Protection
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('creator_applications')
        .select('id, application_reference, application_status, created_at')
        .or(`email.eq.${emailClean},whatsapp_number.eq.${phoneClean}`)
        .in('application_status', ['pending', 'reviewed'])
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(409).json({
          error: `An active application with this email or WhatsApp number is already being evaluated under reference ${existing[0].application_reference}.`,
          referenceNumber: existing[0].application_reference
        });
      }
    } else {
      const duplicate = memoryApplications.find(
        a => (a.email.toLowerCase() === emailClean || a.whatsapp_number.replace(/\s+/g, '') === phoneClean) &&
             ['pending', 'reviewed'].includes(a.application_status)
      );
      if (duplicate) {
        return res.status(409).json({
          error: `An active application with this email or WhatsApp number is already registered under reference ${duplicate.application_reference}.`,
          referenceNumber: duplicate.application_reference
        });
      }
    }

    // G. Generate Cryptographically Distinct Reference Number
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const timestampCode = Date.now().toString(36).slice(-4).toUpperCase();
    const referenceNumber = `U360-CR-${timestampCode}${randomSuffix}`;

    // H. Hash Client IP for anti-fraud
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(rawIp + 'u360_salt').digest('hex').substring(0, 16);

    const newRecordData = {
      application_reference: referenceNumber,
      full_name: payload.fullName.trim(),
      whatsapp_number: phoneClean,
      email: emailClean,
      state: payload.state || 'Tamil Nadu',
      district: payload.district,
      town: payload.cityTown.trim(),
      contact_language: payload.contactLanguage || 'Tamil',
      social_platforms: [payload.primaryPlatform || 'Instagram'],
      instagram_url: payload.instagramUrl || '',
      youtube_url: payload.youtubeUrl || '',
      other_profile_urls: payload.otherPlatformUrl ? [payload.otherPlatformUrl] : [],
      follower_count: payload.followerCount || '',
      subscriber_count: payload.subscriberCount || '',
      average_views: payload.averageViewsLast10 || '',
      publishing_frequency: payload.publishingFrequency || '',
      creator_categories: payload.categories || [],
      languages: [payload.primaryLanguage || 'Tamil', ...(payload.additionalLanguages || [])],
      dialects: payload.regionalDialects || [],
      creator_classification: payload.classification || 'ugc',
      audience_location: payload.audienceLocation || '',
      audience_insights: {
        genderBreakdown: payload.genderBreakdown || '',
        topAgeGroup: payload.topAgeGroup || ''
      },
      collaboration_preferences: payload.collaborationTypes || [],
      expected_rates: {
        ugc: payload.rateUgcVideo || '',
        sponsoredReel: payload.rateSponsoredReel || '',
        story: payload.rateStory || '',
        additionalProduction: payload.rateAdditionalProduction || '',
        onLocationDaily: payload.rateOnLocationDaily || ''
      },
      travel_availability: payload.travelAvailability || '',
      previous_collaborations: {
        hasPrior: payload.hasPriorCollabs === 'yes',
        details: payload.priorCollabDetails || ''
      },
      portfolio_urls: validLinks,
      privacy_consent: true,
      contact_consent: true,
      brand_sharing_consent: true,
      application_status: 'pending',
      admin_notes: '',
      ip_hash: ipHash
    };

    let insertedId = `app_${Date.now()}`;

    // I. Persist to Supabase (or test-only memory store)
    if (supabaseAdmin) {
      const { data: insertedApp, error: appInsertError } = await supabaseAdmin
        .from('creator_applications')
        .insert(newRecordData)
        .select('id')
        .single();

      if (appInsertError) {
        console.error('Failed to insert creator application into Supabase:', appInsertError);
        return res.status(500).json({ error: 'Database storage error. Please try again.' });
      }

      insertedId = insertedApp.id;

      // J. Persist Assets records into `creator_assets`
      const assetInserts: any[] = [];

      if (Array.isArray(payload.uploadedVideos)) {
        for (const vid of payload.uploadedVideos) {
          if (vid.name && vid.storagePath) {
            assetInserts.push({
              application_id: insertedId,
              file_type: 'video_sample',
              original_filename: vid.name,
              storage_path: vid.storagePath,
              mime_type: vid.type || 'video/mp4',
              file_size: vid.size || 0
            });
          }
        }
      }

      if (Array.isArray(payload.uploadedInsights)) {
        for (const ins of payload.uploadedInsights) {
          if (ins.name && ins.storagePath) {
            assetInserts.push({
              application_id: insertedId,
              file_type: 'audience_insight',
              original_filename: ins.name,
              storage_path: ins.storagePath,
              mime_type: ins.type || 'image/png',
              file_size: ins.size || 0
            });
          }
        }
      }

      if (payload.uploadedMediaKit?.name && payload.uploadedMediaKit?.storagePath) {
        assetInserts.push({
          application_id: insertedId,
          file_type: 'media_kit',
          original_filename: payload.uploadedMediaKit.name,
          storage_path: payload.uploadedMediaKit.storagePath,
          mime_type: payload.uploadedMediaKit.type || 'application/pdf',
          file_size: payload.uploadedMediaKit.size || 0
        });
      }

      if (assetInserts.length > 0) {
        const { error: assetError } = await supabaseAdmin
          .from('creator_assets')
          .insert(assetInserts);

        if (assetError) {
          console.error('Error logging assets into creator_assets:', assetError);
        }
      }
    } else {
      const inMemRecord: InMemAppRecord = {
        ...newRecordData,
        id: insertedId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activity_log: [
          {
            id: `act_${Date.now()}`,
            event_type: 'application_submitted',
            action: 'Application Submitted',
            actor_email: 'portal@unikorn360.com',
            timestamp: new Date().toISOString(),
            details: 'Self-registered through UNIKORN360 Creator Portal.'
          }
        ],
        assets: [
          ...(payload.uploadedVideos || []).map((v: any) => ({
            id: `asset_${Date.now()}_${Math.random()}`,
            file_type: 'video_sample',
            original_filename: v.name,
            storage_path: v.storagePath || `local_${v.name}`,
            mime_type: v.type,
            file_size: v.size
          }))
        ]
      };
      memoryApplications.unshift(inMemRecord);
    }

    return res.status(201).json({
      success: true,
      referenceNumber,
      id: insertedId,
      message: 'Application recorded into UNIKORN360 Creator Network pipeline.'
    });
  } catch (err: any) {
    console.error('Error in /api/creators/apply:', err);
    res.status(500).json({ error: 'Failed to process application.' });
  }
});

// ====================================================================
// ADMINISTRATOR API ENDPOINTS (Protected with RBAC & Supabase Auth)
// ====================================================================

// 1. Current Verified Session Endpoint (Used after browser SDK signInWithPassword / getSession)
app.get('/api/admin/auth/me', requireAdminAuth, async (req: Request, res: Response) => {
  return res.json({
    user: {
      id: (req as any).user.id,
      email: (req as any).user.email
    },
    role: (req as any).adminRole
  });
});

// Public Creator Network Taxonomy / Catalog Endpoint (No Auth Required)
app.get('/api/creators/catalog', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    categories: ['Food & Culinary', 'Travel & Staycations', 'Technology & Gadgets', 'Fashion & Apparel', 'Business & MSME'],
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tirupathur', 'Vellore']
  });
});

// 2. List Applications (Search, Multi-Filter, and Intelligence Analytics Stats)
app.get('/api/admin/creators', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      tier, 
      classification, 
      district, 
      town, 
      language, 
      dialect, 
      category, 
      platform, 
      search 
    } = req.query;

    const targetTier = (classification || tier) as string | undefined;
    const callerRole = (req as any).adminRole as 'superadmin' | 'admin' | 'evaluator';

    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from('creator_applications')
        .select(`
          id,
          application_reference,
          full_name,
          whatsapp_number,
          email,
          state,
          district,
          town,
          contact_language,
          social_platforms,
          instagram_url,
          youtube_url,
          other_profile_urls,
          follower_count,
          subscriber_count,
          average_views,
          publishing_frequency,
          creator_categories,
          languages,
          dialects,
          creator_classification,
          application_status,
          admin_notes,
          campaign_matches,
          payments,
          activity_log,
          latest_score,
          expected_rates,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        if (status === 'new') {
          query = query.in('application_status', ['new', 'pending']);
        } else if (status === 'reviewing') {
          query = query.in('application_status', ['reviewing', 'reviewed']);
        } else {
          query = query.eq('application_status', status);
        }
      }

      if (targetTier && targetTier !== 'all') {
        query = query.eq('creator_classification', targetTier);
      }

      if (district && district !== 'all') {
        query = query.eq('district', district);
      }

      if (search && typeof search === 'string') {
        query = query.or(`full_name.ilike.%${search}%,application_reference.ilike.%${search}%,whatsapp_number.ilike.%${search}%,email.ilike.%${search}%,town.ilike.%${search}%`);
      }

      const { data: rawApps, error } = await query;
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }

      let apps: any[] = !error && rawApps ? rawApps : [...memoryApplications];

      if (town && typeof town === 'string' && town.trim()) {
        const t = town.trim().toLowerCase();
        apps = apps.filter(a => a.town?.toLowerCase().includes(t));
      }
      if (language && language !== 'all') {
        apps = apps.filter(a => Array.isArray(a.languages) && a.languages.includes(language));
      }
      if (dialect && dialect !== 'all') {
        apps = apps.filter(a => Array.isArray(a.dialects) && a.dialects.includes(dialect));
      }
      if (category && category !== 'all') {
        apps = apps.filter(a => Array.isArray(a.creator_categories) && a.creator_categories.includes(category));
      }
      if (platform && platform !== 'all') {
        apps = apps.filter(a => Array.isArray(a.social_platforms) && a.social_platforms.includes(platform));
      }

      const { data: allRecords } = await supabaseAdmin
        .from('creator_applications')
        .select('application_status, creator_classification, district, creator_categories');

      const allApps = (allRecords && allRecords.length > 0) ? allRecords : memoryApplications;
      const stats = computeCreatorStats(allApps);

      // Consistent role-aware projection (strips payments, ip_hash, and financial activity events for evaluator)
      const projectedApps = apps.map((app: any) => projectCreatorForRole(app, callerRole));

      return res.json({ applications: projectedApps, stats });
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    // Test-mode in-memory repository
    let results = [...memoryApplications];

    if (status && status !== 'all') {
      if (status === 'new') {
        results = results.filter(a => a.application_status === 'new' || a.application_status === 'pending');
      } else if (status === 'reviewing') {
        results = results.filter(a => a.application_status === 'reviewing' || a.application_status === 'reviewed');
      } else {
        results = results.filter(a => a.application_status === status);
      }
    }

    if (targetTier && targetTier !== 'all') {
      results = results.filter(a => a.creator_classification === targetTier);
    }

    if (district && district !== 'all') {
      results = results.filter(a => a.district === district);
    }

    if (town && typeof town === 'string' && town.trim()) {
      const t = town.trim().toLowerCase();
      results = results.filter(a => a.town.toLowerCase().includes(t));
    }

    if (language && language !== 'all') {
      results = results.filter(a => a.languages?.includes(language as string));
    }

    if (dialect && dialect !== 'all') {
      results = results.filter(a => a.dialects?.includes(dialect as string));
    }

    if (category && category !== 'all') {
      results = results.filter(a => a.creator_categories?.includes(category as string));
    }

    if (platform && platform !== 'all') {
      results = results.filter(a => a.social_platforms?.includes(platform as string));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(a => 
        a.full_name.toLowerCase().includes(q) ||
        a.application_reference.toLowerCase().includes(q) ||
        a.whatsapp_number.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.town.toLowerCase().includes(q) ||
        (a.campaign_matches && a.campaign_matches.some(c => c.toLowerCase().includes(q)))
      );
    }

    const stats = computeCreatorStats(memoryApplications);
    const projectedResults = results.map((app: any) => projectCreatorForRole(app, callerRole));

    return res.json({ applications: projectedResults, stats });
  } catch (err: any) {
    console.error('Error in /api/admin/creators:', err);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

function computeCreatorStats(apps: any[]) {
  const stats = {
    total: apps.length,
    newCount: apps.filter(a => a.application_status === 'new' || a.application_status === 'pending').length,
    reviewingCount: apps.filter(a => a.application_status === 'reviewing' || a.application_status === 'reviewed').length,
    shortlistedCount: apps.filter(a => a.application_status === 'shortlisted').length,
    approvedCount: apps.filter(a => a.application_status === 'approved').length,
    rejectedCount: apps.filter(a => a.application_status === 'rejected').length,
    inactiveCount: apps.filter(a => a.application_status === 'inactive').length,
    districtCounts: {} as Record<string, number>,
    categoryCounts: {} as Record<string, number>,
    levelCounts: {
      l1_community: 0,
      l2_nano: 0,
      l3_micro: 0,
      l4_regional: 0,
      l5_mid_tier: 0,
      l6_established: 0
    } as Record<string, number>
  };

  for (const app of apps) {
    if (app.district) {
      stats.districtCounts[app.district] = (stats.districtCounts[app.district] || 0) + 1;
    }
    const cls = app.creator_classification;
    if (cls === 'l1_community' || cls === 'ugc') stats.levelCounts.l1_community++;
    else if (cls === 'l2_nano' || cls === 'nano') stats.levelCounts.l2_nano++;
    else if (cls === 'l3_micro' || cls === 'micro') stats.levelCounts.l3_micro++;
    else if (cls === 'l4_regional') stats.levelCounts.l4_regional++;
    else if (cls === 'l5_mid_tier' || cls === 'mid') stats.levelCounts.l5_mid_tier++;
    else if (cls === 'l6_established' || cls === 'macro') stats.levelCounts.l6_established++;

    if (Array.isArray(app.creator_categories)) {
      for (const cat of app.creator_categories) {
        stats.categoryCounts[cat] = (stats.categoryCounts[cat] || 0) + 1;
      }
    }
  }

  return stats;
}

// 3. Get Full Application Details Dossier (With assets and evaluations)
app.get('/api/admin/creators/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const callerRole = (req as any).adminRole as 'superadmin' | 'admin' | 'evaluator';

    if (supabaseAdmin) {
      const { data: application, error: appErr } = await supabaseAdmin
        .from('creator_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (!appErr && application) {
        const { data: assets } = await supabaseAdmin
          .from('creator_assets')
          .select('*')
          .eq('application_id', id);

        const { data: evaluations } = await supabaseAdmin
          .from('creator_evaluations')
          .select('*')
          .eq('application_id', id)
          .order('created_at', { ascending: false });

        const appData = {
          ...application,
          assets: assets || [],
          evaluations: evaluations || []
        };

        return res.json({ application: projectCreatorForRole(appData, callerRole) });
      }
      if (appErr && !isTestMemoryFallbackEnabled()) {
        return res.status(404).json({ error: 'Application not found' });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const item = memoryApplications.find(a => a.id === id || a.application_reference === id);
    if (!item) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const evaluations = memoryEvaluations.filter(e => e.application_id === item.id);
    const memAppData = { ...item, evaluations };

    return res.json({ application: projectCreatorForRole(memAppData, callerRole) });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id:', err);
    res.status(500).json({ error: 'Failed to fetch application dossier' });
  }
});

// 4. Generate Short-Lived Signed Download URL for Private Asset (Admins Only)
app.post('/api/admin/creators/signed-download', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { storagePath } = req.body;
    if (!storagePath) {
      return res.status(400).json({ error: 'Missing storagePath.' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from('creator-submissions')
        .createSignedUrl(storagePath, 900);

      if (error) {
        return res.status(404).json({ error: error.message });
      }

      return res.json({ signedUrl: data.signedUrl, expiresInSeconds: 900 });
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    return res.json({ signedUrl: `data:application/octet-stream;base64,`, mock: true });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/signed-download:', err);
    res.status(500).json({ error: 'Failed to generate download authorization' });
  }
});

// 5. Update Status & Admin Notes (Superadmin & Admin only — Evaluators Forbidden)
app.patch('/api/admin/creators/:id/status', requireAdminAuth, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const callerRole = (req as any).adminRole as 'superadmin' | 'admin';

    const allowed = ['new', 'reviewing', 'shortlisted', 'approved', 'rejected', 'inactive', 'pending', 'reviewed'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status code' });
    }

    // Derive audit actor identity from verified session, NEVER hardcoded or caller-supplied
    const actorEmail = (req as any).user?.email || 'admin-session';

    const newActivity = {
      id: `act_${Date.now()}`,
      event_type: 'status_updated',
      action: `Status Changed to ${status ? status.toUpperCase() : 'UPDATED'}`,
      actor_email: actorEmail,
      timestamp: new Date().toISOString(),
      details: adminNotes || `Workflow status updated to ${status}.`
    };

    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('creator_applications')
        .select('activity_log')
        .eq('id', id)
        .single();

      const currentLog = Array.isArray(existing?.activity_log) ? existing.activity_log : [];
      const updatedLog = [newActivity, ...currentLog];

      const updateData: any = { 
        updated_at: new Date().toISOString(),
        activity_log: updatedLog
      };
      if (status) updateData.application_status = status;
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

      const { data, error } = await supabaseAdmin
        .from('creator_applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, application: projectCreatorForRole(data, callerRole) });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const item = memoryApplications.find(a => a.id === id || a.application_reference === id);
    if (!item) return res.status(404).json({ error: 'Application not found' });
    if (status) item.application_status = status;
    if (adminNotes !== undefined) item.admin_notes = adminNotes;
    item.activity_log = [newActivity, ...(item.activity_log || [])];
    item.updated_at = new Date().toISOString();

    return res.json({ success: true, application: projectCreatorForRole(item, callerRole) });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id/status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 6. Update Internal Campaign Matches (Superadmin & Admin only — Evaluators Forbidden)
app.patch('/api/admin/creators/:id/campaigns', requireAdminAuth, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { campaignMatches } = req.body;
    const callerRole = (req as any).adminRole as 'superadmin' | 'admin';

    if (!Array.isArray(campaignMatches)) {
      return res.status(400).json({ error: 'campaignMatches must be an array of campaign titles' });
    }

    const actorEmail = (req as any).user?.email || 'admin-session';

    const newActivity = {
      id: `act_${Date.now()}`,
      event_type: 'campaigns_updated',
      action: 'Campaign Tags Updated',
      actor_email: actorEmail,
      timestamp: new Date().toISOString(),
      details: `Active campaigns: ${campaignMatches.join(', ') || 'None'}`
    };

    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('creator_applications')
        .select('activity_log')
        .eq('id', id)
        .single();

      const currentLog = Array.isArray(existing?.activity_log) ? existing.activity_log : [];
      const updatedLog = [newActivity, ...currentLog];

      const { data, error } = await supabaseAdmin
        .from('creator_applications')
        .update({
          campaign_matches: campaignMatches,
          activity_log: updatedLog,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, application: projectCreatorForRole(data, callerRole) });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const item = memoryApplications.find(a => a.id === id || a.application_reference === id);
    if (!item) return res.status(404).json({ error: 'Application not found' });
    item.campaign_matches = campaignMatches;
    item.activity_log = [newActivity, ...(item.activity_log || [])];
    item.updated_at = new Date().toISOString();

    return res.json({ success: true, application: projectCreatorForRole(item, callerRole) });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id/campaigns:', err);
    res.status(500).json({ error: 'Failed to update campaigns' });
  }
});

// 7. Record Creator Payment (Superadmin ONLY — Admin & Evaluator Forbidden)
app.post('/api/admin/creators/:id/payments', requireAdminAuth, requireRole(['superadmin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { campaign_name, amount, status, payment_date, reference_utr, notes } = req.body;

    if (!campaign_name || !amount) {
      return res.status(400).json({ error: 'Missing campaign name or amount' });
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      campaign_name,
      amount: Number(amount),
      status: status || 'paid',
      payment_date: payment_date || new Date().toISOString().slice(0, 10),
      reference_utr: reference_utr || '',
      notes: notes || ''
    };

    const actorEmail = (req as any).user?.email || 'finance@unikorn360.com';

    const newActivity = {
      id: `act_${Date.now()}`,
      event_type: 'payment_recorded',
      action: `Payment Recorded: ₹${Number(amount).toLocaleString('en-IN')}`,
      actor_email: actorEmail,
      timestamp: new Date().toISOString(),
      details: `Campaign: ${campaign_name} | Status: ${newPayment.status} | UTR: ${newPayment.reference_utr || 'N/A'}${newPayment.notes ? ` | Notes: ${newPayment.notes}` : ''}`
    };

    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('creator_applications')
        .select('payments, activity_log')
        .eq('id', id)
        .single();

      const currentPayments = Array.isArray(existing?.payments) ? existing.payments : [];
      const currentLog = Array.isArray(existing?.activity_log) ? existing.activity_log : [];

      const updatedPayments = [newPayment, ...currentPayments];
      const updatedLog = [newActivity, ...currentLog];

      const { data, error } = await supabaseAdmin
        .from('creator_applications')
        .update({
          payments: updatedPayments,
          activity_log: updatedLog,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({ success: true, payment: newPayment, application: projectCreatorForRole(data, 'superadmin') });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const item = memoryApplications.find(a => a.id === id || a.application_reference === id);
    if (!item) return res.status(404).json({ error: 'Application not found' });
    item.payments = [newPayment, ...(item.payments || [])];
    item.activity_log = [newActivity, ...(item.activity_log || [])];
    item.updated_at = new Date().toISOString();

    return res.status(201).json({ success: true, payment: newPayment, application: projectCreatorForRole(item, 'superadmin') });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id/payments:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// 8. Submit 100-Point Unicorn Creator Score Evaluation (Superadmin, Admin, and Evaluator allowed)
app.post('/api/admin/creators/:id/evaluate', requireAdminAuth, requireRole(['superadmin', 'admin', 'evaluator']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      engagement_quality = 12,
      average_views_score = 8,
      content_quality = 8,
      authenticity = 8,
      presentation = 8,
      audience_brand_fit = 12,
      local_relevance = 8,
      historical_performance = 8,
      cost_efficiency = 4,
      reliability = 4,
      evaluation_notes,
      evaluated_by_name
    } = req.body;

    const total_score = 
      Number(engagement_quality) +
      Number(average_views_score) +
      Number(content_quality) +
      Number(authenticity) +
      Number(presentation) +
      Number(audience_brand_fit) +
      Number(local_relevance) +
      Number(historical_performance) +
      Number(cost_efficiency) +
      Number(reliability);

    const reviewerEmail = (req as any).user?.email || evaluated_by_name || 'verified_evaluator@unikorn360.com';
    const reviewerId = (req as any).user?.id || null;

    const evalRecord = {
      application_id: id,
      engagement_quality: Number(engagement_quality),
      average_views_score: Number(average_views_score),
      content_quality: Number(content_quality),
      authenticity: Number(authenticity),
      presentation: Number(presentation),
      audience_brand_fit: Number(audience_brand_fit),
      local_relevance: Number(local_relevance),
      historical_performance: Number(historical_performance),
      cost_efficiency: Number(cost_efficiency),
      reliability: Number(reliability),
      total_score,
      evaluation_notes: evaluation_notes || '',
      evaluated_by: reviewerId,
      evaluated_by_name: reviewerEmail,
      created_at: new Date().toISOString()
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      event_type: 'evaluation_submitted',
      action: `Unicorn Score Evaluated: ${total_score}/100`,
      actor_email: reviewerEmail,
      timestamp: new Date().toISOString(),
      details: evaluation_notes || 'Score matrix submitted by authorized reviewer.'
    };

    if (supabaseAdmin) {
      const { data: insertedEval, error } = await supabaseAdmin
        .from('creator_evaluations')
        .insert(evalRecord)
        .select()
        .single();

      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }

      const { data: existing } = await supabaseAdmin
        .from('creator_applications')
        .select('activity_log')
        .eq('id', id)
        .single();

      const currentLog = Array.isArray(existing?.activity_log) ? existing.activity_log : [];
      await supabaseAdmin
        .from('creator_applications')
        .update({
          latest_score: total_score,
          activity_log: [newActivity, ...currentLog],
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (!error) {
        return res.status(201).json({ success: true, evaluation: insertedEval || evalRecord, total_score });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    memoryEvaluations.unshift({ id: `eval_${Date.now()}`, ...evalRecord });
    const item = memoryApplications.find(a => a.id === id || a.application_reference === id);
    if (item) {
      item.latest_score = total_score;
      item.activity_log = [newActivity, ...(item.activity_log || [])];
      item.updated_at = new Date().toISOString();
    }

    return res.status(201).json({ success: true, evaluation: evalRecord, total_score });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id/evaluate:', err);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

// 9. Delete Creator Application (Superadmin ONLY — Admin & Evaluator Forbidden)
app.delete('/api/admin/creators/:id', requireAdminAuth, requireRole(['superadmin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (supabaseAdmin) {
      const { data: assets } = await supabaseAdmin
        .from('creator_assets')
        .select('storage_path')
        .eq('application_id', id);

      if (assets && assets.length > 0) {
        const paths = assets.map(a => a.storage_path);
        await supabaseAdmin.storage.from('creator-submissions').remove(paths);
      }

      const { error } = await supabaseAdmin
        .from('creator_applications')
        .delete()
        .eq('id', id);

      if (!error) {
        return res.json({ success: true, message: 'Application deleted.' });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const idx = memoryApplications.findIndex(a => a.id === id || a.application_reference === id);
    if (idx !== -1) {
      memoryApplications.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Application deleted.' });
  } catch (err: any) {
    console.error('Error in /api/admin/creators/:id DELETE:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// ====================================================================
// 10. ADMINISTRATOR MEMBERSHIP MANAGEMENT (Superadmin ONLY)
// ====================================================================
app.get('/api/admin/members', requireAdminAuth, requireRole(['superadmin']), async (req: Request, res: Response) => {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_admin_users')
        .select('id, authenticated_user_id, email, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ members: data });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    return res.json({ members: memoryAdminUsers });
  } catch (err: any) {
    console.error('Error fetching admin members:', err);
    res.status(500).json({ error: 'Failed to retrieve admin members' });
  }
});

app.post('/api/admin/members', requireAdminAuth, requireRole(['superadmin']), async (req: Request, res: Response) => {
  try {
    const { authenticated_user_id, email, role } = req.body;
    if (!authenticated_user_id || !role) {
      return res.status(400).json({ error: 'authenticated_user_id and role are required.' });
    }
    if (!['superadmin', 'admin', 'evaluator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be superadmin, admin, or evaluator.' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_admin_users')
        .insert({ authenticated_user_id, email: email || null, role })
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({ success: true, member: data });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const newMember: InMemAdminUser = {
      id: `mem_user_${Date.now()}`,
      authenticated_user_id,
      email: email || '',
      role
    };
    memoryAdminUsers.push(newMember);
    return res.status(201).json({ success: true, member: newMember });
  } catch (err: any) {
    console.error('Error creating admin member:', err);
    res.status(500).json({ error: 'Failed to create admin member' });
  }
});

app.delete('/api/admin/members/:id', requireAdminAuth, requireRole(['superadmin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('creator_admin_users')
        .delete()
        .eq('id', id);

      if (!error) {
        return res.json({ success: true, message: 'Membership removed.' });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    const idx = memoryAdminUsers.findIndex(u => u.id === id || u.authenticated_user_id === id);
    if (idx !== -1) memoryAdminUsers.splice(idx, 1);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting admin member:', err);
    res.status(500).json({ error: 'Failed to delete admin member' });
  }
});

// ====================================================================
// 11. SERVICE CATALOGUE BACKEND MUTATIONS (Superadmin & Admin only)
// ====================================================================
app.patch('/api/admin/services/:id/status', requireAdminAuth, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status code' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('service_catalog')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, service: data });
      }
      if (error && !isTestMemoryFallbackEnabled()) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (!isTestMemoryFallbackEnabled()) {
      return sendMissingPrivilegedConfig(res);
    }

    return res.json({ success: true, id, status, message: 'Service status updated.' });
  } catch (err: any) {
    console.error('Error updating service status:', err);
    res.status(500).json({ error: 'Failed to update service status' });
  }
});

export { app };

// ====================================================================
// VITE SPA & STATIC ASSETS SETUP
// ====================================================================
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Unikorn360] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Unikorn360] Public Auth Configured: ${supabaseConfig.isPublicClientConfigured ? 'YES' : 'NO'}`);
    console.log(`[Unikorn360] Privileged DB Configured: ${supabaseConfig.isPrivilegedServerConfigured ? `YES (${supabaseConfig.privilegedKeySource})` : 'NO'}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
