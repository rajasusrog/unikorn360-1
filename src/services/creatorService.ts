import { 
  CreatorApplicationFormData, 
  CreatorApplicationRecord, 
  ApplicationStatus,
  CreatorUploadedFile,
  CreatorEvaluation
} from '../types/creator';
import { servicesDb } from '../lib/supabase';

export const TN_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Kanniyakumari',
  'Namakkal',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
  'Other State / UT'
];

export const CONTENT_CATEGORIES = [
  'Food & Culinary',
  'Travel & Staycations',
  'Automotive & Bikes',
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Technology & Gadgets',
  'Education & Career',
  'Fitness & Wellness',
  'Property & Real Estate',
  'Agriculture & Rural Life',
  'Business & MSME',
  'Lifestyle & Vlogging',
  'Entertainment & Comedy',
  'Family & Parenting',
  'Shopping & Retail Deals',
  'Photography & Filmmaking',
  'Product Reviews',
  'Other'
];

export const COLLABORATION_TYPES = [
  'UGC Video Creation Only',
  'Sponsored Reel / Short',
  'Video Creation & Publishing',
  'Product Reviews & Unboxing',
  'Photography & Still Assets',
  'Voice-over & Script Narration',
  'Event Coverage & Store Walkthrough',
  'On-location Shooting',
  'Long-term Brand Partnerships'
];

export const EQUIPMENT_OPTIONS = [
  'High-End Smartphone (iPhone / Pixel / Samsung S-series)',
  'Mirrorless / DSLR Camera (Sony, Canon, Fujifilm)',
  'Wireless Lavalier Microphone (DJI, Rode, Hollyland)',
  'Studio Softbox / Key Lighting',
  'Motorized Gimbal / Stabilizer',
  '4K Drone / Aerial Video',
  'Dedicated Video Editing Workstation (Final Cut / Premiere / DaVinci)'
];

export const REGIONAL_DIALECTS = [
  'Standard / Neutral Tamil',
  'Chennai Tamil / Madras Bashai',
  'Kongu Tamil (Coimbatore / Erode / Salem)',
  'Madurai Tamil',
  'Nellai / Tirunelveli Tamil',
  'Thanjavur / Delta Tamil',
  'Kanniyakumari / Nanjil Tamil',
  'North Arcot / Vellore / Tirupathur Tamil'
];

const STORAGE_KEY = 'unikorn360_creator_network_applications';

// Clean up any deprecated keys on load
if (typeof window !== 'undefined') {
  localStorage.removeItem('unikorn360_admin_token');
  localStorage.removeItem('unikorn360_admin_pin');
  localStorage.removeItem('unikorn360_admin_session');
}

export interface UploadResult {
  storagePath: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
}

export const creatorService = {
  // Obtain active SDK-managed admin access token Bearer header
  getAuthHeaders: async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = await servicesDb.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Secure File Upload using Supabase Signed Upload URLs with Progress Tracking
  uploadFileSecurely: async (
    file: File,
    category: 'video_sample' | 'audience_insight' | 'media_kit',
    onProgress: (percent: number) => void
  ): Promise<UploadResult> => {
    onProgress(10);

    // 1. Request signature from server
    const signRes = await fetch('/api/creators/upload-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        category
      })
    });

    if (!signRes.ok) {
      const errJson = await signRes.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to authorize secure upload.');
    }

    const signData = await signRes.json();
    onProgress(25);

    // 2. Direct upload using Supabase signed URL
    if (signData.mode === 'direct_signed_url' && signData.signedUrl) {
      return new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signData.signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round(25 + (e.loaded / e.total) * 70);
            onProgress(Math.min(pct, 98));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress(100);
            resolve({
              storagePath: signData.storagePath,
              originalFilename: file.name,
              fileSize: file.size,
              mimeType: file.type || 'application/octet-stream'
            });
          } else {
            reject(new Error(`Storage rejected upload with status ${xhr.status}.`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during file upload. Please check connection.'));
        };

        xhr.send(file);
      });
    }

    // 3. Fallback: Server Relay Upload (for local dev or if direct url not permitted)
    return new Promise<UploadResult>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          onProgress(50);

          const relayRes = await fetch('/api/creators/upload-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storagePath: signData.storagePath,
              fileData: base64,
              fileType: file.type || 'application/octet-stream',
              originalFilename: file.name,
              fileSize: file.size,
              category
            })
          });

          if (!relayRes.ok) {
            const err = await relayRes.json().catch(() => ({}));
            throw new Error(err.error || 'Relay upload failed.');
          }

          onProgress(100);
          resolve({
            storagePath: signData.storagePath,
            originalFilename: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream'
          });
        } catch (e: any) {
          reject(e);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  },

  // Submit Application to Real Backend API
  submitApplication: async (formData: CreatorApplicationFormData): Promise<CreatorApplicationRecord> => {
    const res = await fetch('/api/creators/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit creator application. Please check your inputs.');
    }

    const createdRecord: CreatorApplicationRecord = {
      ...formData,
      id: data.id || `app-${Date.now()}`,
      referenceNumber: data.referenceNumber,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Store in local cache as confirmation backup
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const apps = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([createdRecord, ...apps]));
      } catch (e) {
        // Ignore cache storage errors
      }
    }

    return createdRecord;
  },

  // Fetch Applications for Admin Dashboard
  // Fetch Applications and Intelligence Stats for Admin Dashboard
  getApplications: async (filters?: {
    status?: string;
    classification?: string;
    district?: string;
    town?: string;
    language?: string;
    dialect?: string;
    category?: string;
    platform?: string;
    followerRange?: string;
    search?: string;
  }): Promise<{ applications: CreatorApplicationRecord[]; stats: any }> => {
    const queryParams = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters?.classification && filters.classification !== 'all') queryParams.append('classification', filters.classification);
      if (filters?.district && filters.district !== 'all') queryParams.append('district', filters.district);
      if (filters?.town) queryParams.append('town', filters.town);
      if (filters?.language && filters.language !== 'all') queryParams.append('language', filters.language);
      if (filters?.dialect && filters.dialect !== 'all') queryParams.append('dialect', filters.dialect);
      if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters?.platform && filters.platform !== 'all') queryParams.append('platform', filters.platform);
      if (filters?.search) queryParams.append('search', filters.search);

      const url = `/api/admin/creators${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url, {
        headers: await creatorService.getAuthHeaders()
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.applications)) {
        // Map backend fields to frontend record
        const mappedApps: CreatorApplicationRecord[] = data.applications.map((app: any) => ({
          id: app.id,
          referenceNumber: app.application_reference,
          fullName: app.full_name,
          whatsapp: app.whatsapp_number,
          email: app.email,
          state: app.state || 'Tamil Nadu',
          district: app.district,
          cityTown: app.town,
          contactLanguage: app.contact_language,
          primaryPlatform: app.social_platforms?.[0] || 'Instagram',
          instagramUrl: app.instagram_url,
          youtubeUrl: app.youtube_url,
          otherPlatformUrl: app.other_profile_urls?.[0] || '',
          followerCount: app.follower_count,
          subscriberCount: app.subscriber_count,
          averageViewsLast10: app.average_views,
          publishingFrequency: app.publishing_frequency,
          categories: Array.isArray(app.creator_categories) ? app.creator_categories : [],
          otherCategoryText: '',
          primaryLanguage: app.languages?.[0] || 'Tamil',
          additionalLanguages: app.languages?.slice(1) || [],
          regionalDialects: app.dialects || [],
          classification: app.creator_classification,
          audienceLocation: app.audience_location || '',
          genderBreakdown: app.audience_insights?.gender || '',
          topAgeGroup: app.audience_insights?.age || '',
          hasPriorCollabs: app.previous_collaborations?.hasPrior ? 'yes' : 'no',
          priorCollabDetails: app.previous_collaborations?.details || '',
          sampleLinks: app.portfolio_urls || [],
          uploadedVideos: (app.assets || []).filter((a: any) => a.file_type === 'video_sample').map((a: any) => ({
            id: a.id,
            name: a.original_filename,
            size: Number(a.file_size),
            type: a.mime_type,
            category: 'video',
            progress: 100,
            status: 'ready',
            storagePath: a.storage_path
          })),
          uploadedInsights: (app.assets || []).filter((a: any) => a.file_type === 'audience_insight').map((a: any) => ({
            id: a.id,
            name: a.original_filename,
            size: Number(a.file_size),
            type: a.mime_type,
            category: 'insight',
            progress: 100,
            status: 'ready',
            storagePath: a.storage_path
          })),
          uploadedMediaKit: (app.assets || []).find((a: any) => a.file_type === 'media_kit') ? {
            id: 'mk',
            name: (app.assets || []).find((a: any) => a.file_type === 'media_kit').original_filename,
            size: Number((app.assets || []).find((a: any) => a.file_type === 'media_kit').file_size),
            type: 'application/pdf',
            category: 'mediakit',
            progress: 100,
            status: 'ready',
            storagePath: (app.assets || []).find((a: any) => a.file_type === 'media_kit').storage_path
          } : null,
          collaborationTypes: app.collaboration_preferences || [],
          rateUgcVideo: app.expected_rates?.ugc || '',
          rateSponsoredReel: app.expected_rates?.sponsoredReel || '',
          rateStory: app.expected_rates?.story || '',
          rateAdditionalProduction: app.expected_rates?.additionalProduction || '',
          rateOnLocationDaily: app.expected_rates?.onLocationDaily || '',
          travelAvailability: app.travel_availability || '',
          preferredCampaignLocations: '',
          equipmentSummary: [],
          equipmentOther: '',
          additionalNotes: '',
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          submittedAt: app.created_at,
          status: app.application_status as ApplicationStatus,
          adminNotes: typeof app.admin_notes === 'string' ? app.admin_notes : undefined,
          campaignMatches: app.campaign_matches || [],
          payments: Array.isArray(app.payments) ? app.payments : undefined,
          activityLog: app.activity_log || [],
          latestScore: app.latest_score || undefined
        }));

        return { applications: mappedApps, stats: data.stats || null };
      }
      return { applications: [], stats: null };
  },

  // Fetch Full Dossier with Signed Assets
  getApplicationDossier: async (id: string): Promise<any> => {
    const res = await fetch(`/api/admin/creators/${id}`, {
      headers: await creatorService.getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch dossier (${res.status})`);
    }
    const data = await res.json();
    return data.application;
  },

  // Generate Short-Lived Signed Download URL for Admin Preview
  getSignedDownloadUrl: async (storagePath: string): Promise<string | null> => {
    const res = await fetch('/api/admin/creators/signed-download', {
      method: 'POST',
      headers: await creatorService.getAuthHeaders(),
      body: JSON.stringify({ storagePath })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get signed download URL');
    }
    const data = await res.json();
    return data.signedUrl;
  },

  // Update Status & Notes in Supabase
  updateApplicationStatus: async (
    id: string, 
    status: ApplicationStatus, 
    notes?: string
  ): Promise<void> => {
    const res = await fetch(`/api/admin/creators/${id}/status`, {
      method: 'PATCH',
      headers: await creatorService.getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes: notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status update failed (${res.status})`);
    }
  },

  // Update Internal Campaign Matches
  updateCampaignMatches: async (id: string, campaignMatches: string[]): Promise<void> => {
    const res = await fetch(`/api/admin/creators/${id}/campaigns`, {
      method: 'PATCH',
      headers: await creatorService.getAuthHeaders(),
      body: JSON.stringify({ campaignMatches })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Campaign update failed (${res.status})`);
    }
  },

  // Record Creator Payment
  recordPayment: async (id: string, payment: {
    campaign_name: string;
    amount: number;
    status: 'paid' | 'processing' | 'pending';
    payment_date: string;
    reference_utr?: string;
    notes?: string;
  }): Promise<void> => {
    const res = await fetch(`/api/admin/creators/${id}/payments`, {
      method: 'POST',
      headers: await creatorService.getAuthHeaders(),
      body: JSON.stringify(payment)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record payment');
    }
  },

  // Save 100-Point Unicorn Creator Score Evaluation Matrix
  submitEvaluation: async (id: string, evaluation: CreatorEvaluation): Promise<{ total_score: number }> => {
    const res = await fetch(`/api/admin/creators/${id}/evaluate`, {
      method: 'POST',
      headers: await creatorService.getAuthHeaders(),
      body: JSON.stringify(evaluation)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit evaluation score.');
    }

    const data = await res.json();
    return { total_score: data.total_score || 0 };
  },

  deleteApplication: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/creators/${id}`, {
      method: 'DELETE',
      headers: await creatorService.getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed (${res.status})`);
    }
  },

  buildCSVContent: (apps: CreatorApplicationRecord[]): string => {
    const includePayments = apps.some(app => Array.isArray(app.payments));

    const headers = [
      'Reference',
      'Name',
      'Status',
      'Classification',
      'Unicorn Score / 100',
      'WhatsApp',
      'Email',
      'District',
      'City/Town',
      'Primary Platform',
      'Followers',
      'Subscribers',
      'Average Views',
      'Categories',
      'Languages',
      'Regional Dialects',
      'UGC Rate (INR)',
      'Sponsored Reel Rate (INR)',
      'Story Rate (INR)',
      'On-Location Daily Rate (INR)',
      'Assigned Campaigns',
      ...(includePayments ? ['Total Paid (INR)'] : []),
      'Submitted Date'
    ];

    const rows = apps.map(app => {
      const totalPaid = (app.payments || [])
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      return [
        `"${app.referenceNumber}"`,
        `"${app.fullName.replace(/"/g, '""')}"`,
        `"${app.status}"`,
        `"${app.classification}"`,
        `"${app.latestScore ?? 'Not Evaluated'}"`,
        `"${app.whatsapp}"`,
        `"${app.email}"`,
        `"${app.district}"`,
        `"${app.cityTown}"`,
        `"${app.primaryPlatform}"`,
        `"${app.followerCount}"`,
        `"${app.subscriberCount}"`,
        `"${app.averageViewsLast10}"`,
        `"${app.categories.join('; ')}"`,
        `"${[app.primaryLanguage, ...(app.additionalLanguages || [])].join('; ')}"`,
        `"${(app.regionalDialects || []).join('; ')}"`,
        `"${app.rateUgcVideo}"`,
        `"${app.rateSponsoredReel}"`,
        `"${app.rateStory}"`,
        `"${app.rateOnLocationDaily}"`,
        `"${(app.campaignMatches || []).join('; ')}"`,
        ...(includePayments ? [`"${totalPaid}"`] : []),
        `"${new Date(app.submittedAt).toLocaleDateString()}"`
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportCSV: async (customApps?: CreatorApplicationRecord[]): Promise<void> => {
    let apps = customApps;
    if (!apps || apps.length === 0) {
      const result = await creatorService.getApplications();
      apps = result.applications;
    }
    if (!apps || apps.length === 0) return;

    const csvBody = creatorService.buildCSVContent(apps);
    const csvContent = 'data:text/csv;charset=utf-8,' + csvBody;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unikorn360_creator_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
