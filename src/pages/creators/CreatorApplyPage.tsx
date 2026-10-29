import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  X, 
  AlertCircle, 
  FileVideo, 
  FileText, 
  Image as ImageIcon, 
  HelpCircle, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Edit3,
  DollarSign,
  User,
  Share2,
  Tag,
  Briefcase
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { 
  TN_DISTRICTS, 
  CONTENT_CATEGORIES, 
  COLLABORATION_TYPES, 
  EQUIPMENT_OPTIONS, 
  REGIONAL_DIALECTS,
  creatorService 
} from '../../services/creatorService';
import { 
  CreatorApplicationFormData, 
  CreatorUploadedFile, 
  CreatorClassification 
} from '../../types/creator';

interface CreatorApplyPageProps {
  onNavigate: (path: string) => void;
}

const INITIAL_FORM_DATA: CreatorApplicationFormData = {
  fullName: '',
  whatsapp: '',
  email: '',
  state: 'Tamil Nadu',
  district: 'Chennai',
  cityTown: '',
  contactLanguage: 'Tamil',
  is18Plus: false,

  primaryPlatform: 'Instagram',
  instagramUrl: '',
  youtubeUrl: '',
  otherPlatformUrl: '',
  followerCount: '',
  subscriberCount: '',
  averageViewsLast10: '',
  publishingFrequency: '3-5 videos per week',

  categories: ['Food & Culinary'],
  otherCategoryText: '',
  primaryLanguage: 'Tamil',
  additionalLanguages: ['English'],
  regionalDialects: ['Standard / Neutral Tamil'],
  classification: 'ugc',
  audienceLocation: 'Tamil Nadu',
  genderBreakdown: '',
  topAgeGroup: '18 - 35 years',
  hasPriorCollabs: 'no',
  priorCollabDetails: '',

  sampleLinks: ['', '', ''],
  uploadedVideos: [],
  uploadedInsights: [],
  uploadedMediaKit: null,

  collaborationTypes: ['UGC Video Creation Only'],
  rateUgcVideo: '₹1,500',
  rateSponsoredReel: '₹3,000',
  rateStory: '₹800',
  rateAdditionalProduction: '₹1,000',
  rateOnLocationDaily: '₹4,000',
  travelAvailability: 'Across Tamil Nadu',
  preferredCampaignLocations: '',
  equipmentSummary: ['High-End Smartphone (iPhone / Pixel / Samsung S-series)'],
  equipmentOther: '',
  additionalNotes: '',

  consentAccuracy: false,
  consentProcessing: false,
  consentContact: false,
  consentBrandSharing: false
};

const STEP_TITLES = [
  'Personal Information',
  'Social Media Profiles',
  'Creator Identity',
  'Portfolio & Uploads',
  'Collaboration & Rates',
  'Review & Submit'
];

export const CreatorApplyPage: React.FC<CreatorApplyPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CreatorApplicationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  // Helper updater
  const updateField = <K extends keyof CreatorApplicationFormData>(field: K, value: CreatorApplicationFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.whatsapp.trim()) {
      errs.whatsapp = 'WhatsApp number is required.';
    } else if (!/^[0-9+ -]{8,16}$/.test(formData.whatsapp.trim())) {
      errs.whatsapp = 'Enter a valid phone/WhatsApp number (e.g. +91 98848 24360).';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!formData.cityTown.trim()) errs.cityTown = 'City or Town is required.';
    if (!formData.is18Plus) errs.is18Plus = 'You must confirm that you are at least 18 years old.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.primaryPlatform === 'Instagram' && !formData.instagramUrl.trim()) {
      errs.instagramUrl = 'Please provide your Instagram profile link or handle.';
    }
    if (formData.primaryPlatform === 'YouTube' && !formData.youtubeUrl.trim()) {
      errs.youtubeUrl = 'Please provide your YouTube channel link.';
    }
    if (!formData.followerCount.trim() && !formData.subscriberCount.trim()) {
      errs.followerCount = 'Please indicate your approximate followers or subscribers (or 0 for new UGC creators).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.categories.length === 0) {
      errs.categories = 'Select at least one content category.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 4 Validation
  const validateStep4 = (): boolean => {
    const errs: Record<string, string> = {};
    const validLinksCount = formData.sampleLinks.filter(l => l.trim().length > 0).length;
    const uploadedVideosCount = formData.uploadedVideos.length;
    const totalPortfolioItems = validLinksCount + uploadedVideosCount;

    if (totalPortfolioItems < 2) {
      errs.portfolio = 'Please provide at least 2 portfolio examples (either sample video links or video file uploads).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 5 Validation
  const validateStep5 = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.collaborationTypes.length === 0) {
      errs.collaborationTypes = 'Please select at least one collaboration type.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 6 Validation
  const validateStep6 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.consentAccuracy) errs.consentAccuracy = 'You must declare that the submitted details are accurate.';
    if (!formData.consentProcessing) errs.consentProcessing = 'Application processing consent is required.';
    if (!formData.consentContact) errs.consentContact = 'Consent to be contacted is required.';
    if (!formData.consentBrandSharing) errs.consentBrandSharing = 'Consent to share profile with prospective brand clients is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();
    else if (currentStep === 5) isValid = validateStep5();

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Helper to update individual video state
  const updateVideoProgress = (id: string, updates: Partial<CreatorUploadedFile>) => {
    setFormData(prev => ({
      ...prev,
      uploadedVideos: prev.uploadedVideos.map(v => v.id === id ? { ...v, ...updates } : v)
    }));
  };

  const updateInsightProgress = (id: string, updates: Partial<CreatorUploadedFile>) => {
    setFormData(prev => ({
      ...prev,
      uploadedInsights: prev.uploadedInsights.map(ins => ins.id === id ? { ...ins, ...updates } : ins)
    }));
  };

  // Real File Upload Handlers (Supabase Storage Signed URL)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.uploadedVideos.length + files.length > 3) {
      alert('You can upload a maximum of 3 video samples.');
      return;
    }

    const filesArray: File[] = Array.from(files);
    e.target.value = '';

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const validTypes = ['video/mp4', 'video/quicktime'];
      const isMovOrMp4 = validTypes.includes(file.type) || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
      
      if (!isMovOrMp4) {
        alert(`File "${file.name}" is not MP4 or MOV. Please upload only MP4 or MOV videos.`);
        continue;
      }

      if (file.size > 30 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 30 MB size limit.`);
        continue;
      }

      const fileId = `vid-${Date.now()}-${i}`;
      const placeholder: CreatorUploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        category: 'video',
        progress: 10,
        status: 'uploading'
      };

      setFormData(prev => ({
        ...prev,
        uploadedVideos: [...prev.uploadedVideos, placeholder]
      }));

      try {
        const result = await creatorService.uploadFileSecurely(file, 'video_sample', (pct) => {
          updateVideoProgress(fileId, { progress: pct });
        });

        updateVideoProgress(fileId, {
          progress: 100,
          status: 'ready',
          storagePath: result.storagePath
        });
      } catch (err: any) {
        updateVideoProgress(fileId, {
          status: 'error',
          errorMessage: err.message || 'Upload failed'
        });
      }
    }
  };

  const removeUploadedVideo = (id: string) => {
    updateField('uploadedVideos', formData.uploadedVideos.filter(v => v.id !== id));
  };

  const handleInsightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.uploadedInsights.length + files.length > 5) {
      alert('You can upload a maximum of 5 audience insight screenshots.');
      return;
    }

    const filesArray: File[] = Array.from(files);
    e.target.value = '';

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const isValid = validTypes.includes(file.type) || /\.(jpg|jpeg|png|pdf)$/i.test(file.name);
      
      if (!isValid) {
        alert(`File "${file.name}" is not JPG, PNG, or PDF.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 5 MB limit.`);
        continue;
      }

      const fileId = `ins-${Date.now()}-${i}`;
      const placeholder: CreatorUploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'image/png',
        category: 'insight',
        progress: 10,
        status: 'uploading'
      };

      setFormData(prev => ({
        ...prev,
        uploadedInsights: [...prev.uploadedInsights, placeholder]
      }));

      try {
        const result = await creatorService.uploadFileSecurely(file, 'audience_insight', (pct) => {
          updateInsightProgress(fileId, { progress: pct });
        });

        updateInsightProgress(fileId, {
          progress: 100,
          status: 'ready',
          storagePath: result.storagePath
        });
      } catch (err: any) {
        updateInsightProgress(fileId, {
          status: 'error',
          errorMessage: err.message || 'Upload failed'
        });
      }
    }
  };

  const removeUploadedInsight = (id: string) => {
    updateField('uploadedInsights', formData.uploadedInsights.filter(i => i.id !== id));
  };

  const handleMediaKitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Media kit must be a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Media kit PDF must be under 10 MB.');
      return;
    }

    e.target.value = '';
    const fileId = `mk-${Date.now()}`;
    const placeholder: CreatorUploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: 'application/pdf',
      category: 'mediakit',
      progress: 15,
      status: 'uploading'
    };

    updateField('uploadedMediaKit', placeholder);

    try {
      const result = await creatorService.uploadFileSecurely(file, 'media_kit', (pct) => {
        setFormData(prev => prev.uploadedMediaKit ? ({
          ...prev,
          uploadedMediaKit: { ...prev.uploadedMediaKit, progress: pct }
        }) : prev);
      });

      setFormData(prev => prev.uploadedMediaKit ? ({
        ...prev,
        uploadedMediaKit: {
          ...prev.uploadedMediaKit,
          progress: 100,
          status: 'ready',
          storagePath: result.storagePath
        }
      }) : prev);
    } catch (err: any) {
      setFormData(prev => prev.uploadedMediaKit ? ({
        ...prev,
        uploadedMediaKit: {
          ...prev.uploadedMediaKit,
          status: 'error',
          errorMessage: err.message || 'Upload failed'
        }
      }) : prev);
    }
  };

  const removeMediaKit = () => {
    updateField('uploadedMediaKit', null);
  };

  // Real Server Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateStep6()) return;

    // Check if any file is still uploading
    const hasUploadingVideo = formData.uploadedVideos.some(v => v.status === 'uploading');
    const hasUploadingInsight = formData.uploadedInsights.some(i => i.status === 'uploading');
    const hasUploadingMediaKit = formData.uploadedMediaKit?.status === 'uploading';

    if (hasUploadingVideo || hasUploadingInsight || hasUploadingMediaKit) {
      alert('Please wait for your file uploads to complete before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await creatorService.submitApplication(formData);
      // Route to success page with real reference number
      onNavigate(`/creators/success?ref=${record.referenceNumber}`);
    } catch (err: any) {
      console.error('Failed to submit application', err);
      setServerError(err.message || 'An error occurred while saving your application. Please try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#06162D] text-white min-h-screen pb-24">
      <SEOHead
        title="Apply to UNIKORN360 Creator Network — Tamil Content Creators"
        description="Submit your creator registration for commercial brand video assignments. 100% free registration for Tamil creators, influencers, and UGC producers."
        canonicalUrl="https://www.unikorn360.com/creators/apply"
      />

      {/* Top Banner */}
      <div className="border-b border-[#06162D]/60 bg-[#06162D]/95 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <button onClick={() => onNavigate('/creators')} className="hover:text-[#F3C94F]">
              Creators
            </button>
            <span>/</span>
            <span className="text-[#43C8E8] font-medium">Application Wizard</span>
          </div>
          <span className="text-[11px] font-bold text-[#F3C94F] bg-[#F3C94F]/10 px-2.5 py-1 rounded border border-[#F3C94F]/30">
            Step {currentStep} of 6: {STEP_TITLES[currentStep - 1]}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Progress Stepper Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#43C8E8] uppercase tracking-wider">
              Registration Progress
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {Math.round((currentStep / 6) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#43C8E8] to-[#F3C94F] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Stepper Dots (Desktop) */}
          <div className="hidden sm:grid grid-cols-6 gap-2 mt-3 text-center">
            {STEP_TITLES.map((title, i) => {
              const stepNum = i + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div key={title} className="text-[11px]">
                  <div className={`font-semibold mb-0.5 ${
                    isCurrent ? 'text-[#F3C94F]' : isPast ? 'text-[#43C8E8]' : 'text-slate-400'
                  }`}>
                    {stepNum}. {title.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-white mb-0.5">Submission Notice</p>
                <p className="leading-relaxed">{serverError}</p>
              </div>
            </div>
          )}

          {/* Hidden Honeypot Fields to trap automated spam bots */}
          <input type="text" name="company_website_hp" className="hidden" tabIndex={-1} autoComplete="off" />
          <input type="text" name="business_tax_id_hp" className="hidden" tabIndex={-1} autoComplete="off" />

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#F3C94F]" />
                  Step 1: Personal Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  We use your contact details solely for campaign coordination. Never published publicly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Full Legal / Creator Name <span className="text-[#F3C94F]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="e.g. S. Karthik / Karthik Vlogs"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.fullName && <p className="text-rose-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    WhatsApp Phone Number <span className="text-[#F3C94F]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="+91 98848 XXXXX"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.whatsapp && <p className="text-rose-400 text-xs mt-1">{errors.whatsapp}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Email Address <span className="text-[#F3C94F]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="creator@gmail.com"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    District <span className="text-[#F3C94F]">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#43C8E8] focus:outline-none cursor-pointer"
                  >
                    {TN_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist} className="bg-[#06162D] text-white">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Town/City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Town / City / Area <span className="text-[#F3C94F]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cityTown}
                    onChange={(e) => updateField('cityTown', e.target.value)}
                    placeholder="e.g. Vaniyambadi, Anna Nagar, Gandhipuram"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.cityTown && <p className="text-rose-400 text-xs mt-1">{errors.cityTown}</p>}
                </div>

                {/* Preferred Contact Language */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Preferred Communication Language
                  </label>
                  <select
                    value={formData.contactLanguage}
                    onChange={(e) => updateField('contactLanguage', e.target.value as any)}
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#43C8E8] focus:outline-none cursor-pointer"
                  >
                    <option value="Tamil" className="bg-[#06162D] text-white">Tamil (தமிழ்)</option>
                    <option value="English" className="bg-[#06162D] text-white">English</option>
                    <option value="Tanglish / Both" className="bg-[#06162D] text-white">Tanglish / Both</option>
                  </select>
                </div>
              </div>

              {/* 18+ Checkbox (Mandatory, NOT pre-selected) */}
              <div className="pt-4 border-t border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is18Plus}
                    onChange={(e) => updateField('is18Plus', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#F3C94F] focus:ring-[#F3C94F]"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I confirm that I am at least 18 years of age or older, and legally eligible to enter into commercial creator assignments. <span className="text-[#F3C94F]">*</span>
                  </span>
                </label>
                {errors.is18Plus && <p className="text-rose-400 text-xs mt-1 pl-7">{errors.is18Plus}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: SOCIAL MEDIA PROFILES */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#43C8E8]" />
                  Step 2: Social Media Profiles &amp; Metrics
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Share where you publish content. Even if you have zero followers, you can apply as a UGC creator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Platform */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Primary Platform
                  </label>
                  <select
                    value={formData.primaryPlatform}
                    onChange={(e) => updateField('primaryPlatform', e.target.value as any)}
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#43C8E8] focus:outline-none cursor-pointer"
                  >
                    <option value="Instagram" className="bg-[#06162D] text-white">Instagram</option>
                    <option value="YouTube" className="bg-[#06162D] text-white">YouTube</option>
                    <option value="Facebook" className="bg-[#06162D] text-white">Facebook</option>
                    <option value="LinkedIn" className="bg-[#06162D] text-white">LinkedIn</option>
                    <option value="Other" className="bg-[#06162D] text-white">Other</option>
                  </select>
                </div>

                {/* Instagram URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Instagram Profile Link or Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.instagramUrl && <p className="text-rose-400 text-xs mt-1">{errors.instagramUrl}</p>}
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    YouTube Channel Link
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeUrl}
                    onChange={(e) => updateField('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.youtubeUrl && <p className="text-rose-400 text-xs mt-1">{errors.youtubeUrl}</p>}
                </div>

                {/* Other Platform URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Other Platform Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.otherPlatformUrl}
                    onChange={(e) => updateField('otherPlatformUrl', e.target.value)}
                    placeholder="Facebook page, portfolio website, Twitter, etc."
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>

                {/* Follower Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Approximate Instagram Followers
                  </label>
                  <input
                    type="text"
                    value={formData.followerCount}
                    onChange={(e) => updateField('followerCount', e.target.value)}
                    placeholder="e.g. 5,400 (or '0 - UGC Creator')"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                  {errors.followerCount && <p className="text-rose-400 text-xs mt-1">{errors.followerCount}</p>}
                </div>

                {/* Subscriber Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    YouTube Subscribers (if applicable)
                  </label>
                  <input
                    type="text"
                    value={formData.subscriberCount}
                    onChange={(e) => updateField('subscriberCount', e.target.value)}
                    placeholder="e.g. 12,000 (or 'None')"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>

                {/* Average Views on Recent 10 Videos */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Average Views of Last 10 Videos
                  </label>
                  <input
                    type="text"
                    value={formData.averageViewsLast10}
                    onChange={(e) => updateField('averageViewsLast10', e.target.value)}
                    placeholder="e.g. 8,000 - 25,000 views"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>

                {/* Publishing Frequency */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Publishing Frequency
                  </label>
                  <select
                    value={formData.publishingFrequency}
                    onChange={(e) => updateField('publishingFrequency', e.target.value)}
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#43C8E8] focus:outline-none cursor-pointer"
                  >
                    <option value="Daily" className="bg-[#06162D] text-white">Daily</option>
                    <option value="3-5 videos per week" className="bg-[#06162D] text-white">3-5 videos per week</option>
                    <option value="1-2 videos per week" className="bg-[#06162D] text-white">1-2 videos per week</option>
                    <option value="Bi-weekly" className="bg-[#06162D] text-white">Bi-weekly</option>
                    <option value="Monthly / As needed" className="bg-[#06162D] text-white">Monthly / As needed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CREATOR IDENTITY & DEMOGRAPHICS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#F3C94F]" />
                  Step 3: Creator Identity &amp; Niches
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Help us match you with brands in your exact domain and dialect.
                </p>
              </div>

              {/* Creator Classification */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Creator Classification Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'ugc', title: 'UGC Creator', desc: 'No follower minimum. Focus on video ads/hooks.' },
                    { id: 'nano', title: 'Nano (1k - 10k)', desc: 'Niche local community authority.' },
                    { id: 'micro', title: 'Micro (10k - 50k)', desc: 'Consistent engagement & regional views.' },
                    { id: 'mid', title: 'Mid-Tier (50k - 500k)', desc: 'Broad reach & brand campaign experience.' },
                    { id: 'macro', title: 'Macro (500k+)', desc: 'Statewide brand ambassador reach.' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => updateField('classification', tier.id as CreatorClassification)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.classification === tier.id 
                          ? 'bg-[#06162D] border-[#F3C94F] shadow-md ring-1 ring-[#F3C94F]' 
                          : 'bg-[#06162D]/60 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className={`text-xs font-bold block ${
                        formData.classification === tier.id ? 'text-[#F3C94F]' : 'text-white'
                      }`}>
                        {tier.title}
                      </span>
                      <span className="text-[11px] text-slate-300 block mt-1">
                        {tier.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Categories (Multi-select) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Content Categories (Select all that apply) <span className="text-[#F3C94F]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTENT_CATEGORIES.map((cat) => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField('categories', formData.categories.filter(c => c !== cat));
                          } else {
                            updateField('categories', [...formData.categories, cat]);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#43C8E8]/10 border-[#43C8E8] text-white font-semibold' 
                            : 'bg-[#06162D] border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#43C8E8]" />}
                      </button>
                    );
                  })}
                </div>
                {errors.categories && <p className="text-rose-400 text-xs mt-1">{errors.categories}</p>}

                {formData.categories.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.otherCategoryText}
                      onChange={(e) => updateField('otherCategoryText', e.target.value)}
                      placeholder="Specify your other category"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Regional Dialects */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Tamil Dialects &amp; Speech Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REGIONAL_DIALECTS.map((dialect) => {
                    const isSelected = formData.regionalDialects.includes(dialect);
                    return (
                      <button
                        key={dialect}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField('regionalDialects', formData.regionalDialects.filter(d => d !== dialect));
                          } else {
                            updateField('regionalDialects', [...formData.regionalDialects, dialect]);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#F3C94F]/10 border-[#F3C94F] text-white font-semibold' 
                            : 'bg-[#06162D] border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{dialect}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F3C94F]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Primary Audience Territory
                  </label>
                  <input
                    type="text"
                    value={formData.audienceLocation}
                    onChange={(e) => updateField('audienceLocation', e.target.value)}
                    placeholder="e.g. Tamil Nadu (Chennai & Coimbatore)"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Gender Split (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.genderBreakdown}
                    onChange={(e) => updateField('genderBreakdown', e.target.value)}
                    placeholder="e.g. 60% Female / 40% Male"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Prior Brand Experience */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Have you previously executed brand collaborations?
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="hasPriorCollabs"
                      value="yes"
                      checked={formData.hasPriorCollabs === 'yes'}
                      onChange={() => updateField('hasPriorCollabs', 'yes')}
                      className="text-[#F3C94F]"
                    />
                    <span>Yes, I have brand deal experience</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="hasPriorCollabs"
                      value="no"
                      checked={formData.hasPriorCollabs === 'no'}
                      onChange={() => updateField('hasPriorCollabs', 'no')}
                      className="text-[#F3C94F]"
                    />
                    <span>No, I am new to brand partnerships</span>
                  </label>
                </div>

                {formData.hasPriorCollabs === 'yes' && (
                  <textarea
                    rows={2}
                    value={formData.priorCollabDetails}
                    onChange={(e) => updateField('priorCollabDetails', e.target.value)}
                    placeholder="Briefly mention 1-3 brands you worked with or campaign types"
                    className="w-full bg-[#06162D] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PORTFOLIO & UPLOADS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-[#43C8E8]" />
                  Step 4: Portfolio Samples &amp; Uploads
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Provide at least 2 portfolio examples (either sample video links or video file uploads).
                </p>
              </div>

              {errors.portfolio && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.portfolio}</span>
                </div>
              )}

              {/* Sample Video Links */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-200">
                  Sample Video Links (Up to 3 Instagram Reels or YouTube Shorts)
                </label>
                {formData.sampleLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 w-6">#{idx + 1}</span>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...formData.sampleLinks];
                        newLinks[idx] = e.target.value;
                        updateField('sampleLinks', newLinks);
                      }}
                      placeholder={`https://www.instagram.com/reel/example${idx + 1}/`}
                      className="flex-1 bg-[#06162D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>
                ))}
                <p className="text-[11px] text-slate-300">
                  Links can be your best recent Reels, Shorts, or unlisted YouTube video links demonstrating your camera presentation.
                </p>
              </div>

              {/* Video File Uploads (MP4/MOV, max 3, max 30MB) */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200">
                      Upload Video Samples (Optional if links provided)
                    </label>
                    <span className="text-[11px] text-slate-300">
                      MP4 or MOV format • Max 3 files • Up to 30 MB each
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {formData.uploadedVideos.length} / 3
                  </span>
                </div>

                {formData.uploadedVideos.length < 3 && (
                  <label className="border-2 border-dashed border-slate-700 hover:border-[#43C8E8] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#06162D]/60 transition-colors">
                    <UploadCloud className="w-6 h-6 text-[#43C8E8] mb-1.5" />
                    <span className="text-xs font-medium text-slate-200">
                      Click to choose video files
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Client-side checked: MP4 / MOV &lt; 30 MB
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Uploaded Video Cards */}
                {formData.uploadedVideos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.uploadedVideos.map((vid) => (
                      <div key={vid.id} className="p-3 rounded-xl bg-[#06162D] border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileVideo className="w-4 h-4 text-[#43C8E8] shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-white truncate max-w-xs">{vid.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className="text-slate-400">{(vid.size / (1024 * 1024)).toFixed(1)} MB</span>
                                <span>•</span>
                                {vid.status === 'uploading' && (
                                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                    Uploading ({vid.progress}%)...
                                  </span>
                                )}
                                {vid.status === 'ready' && (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Secured in Private Storage
                                  </span>
                                )}
                                {vid.status === 'error' && (
                                  <span className="text-rose-400 font-semibold">
                                    {vid.errorMessage || 'Upload failed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadedVideo(vid.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-slate-800"
                            title="Remove video file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {vid.status === 'uploading' && (
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#43C8E8] to-[#F3C94F] transition-all duration-200"
                              style={{ width: `${vid.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audience Insights Screenshot Upload (Optional, JPG/PNG/PDF, max 5, max 5MB) */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200">
                      Audience Insights Screenshot (Optional)
                    </label>
                    <span className="text-[11px] text-slate-300">
                      JPG, PNG, or PDF screenshot of your account analytics • Max 5 files • Up to 5 MB each
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {formData.uploadedInsights.length} / 5
                  </span>
                </div>

                {formData.uploadedInsights.length < 5 && (
                  <label className="border-2 border-dashed border-slate-700 hover:border-[#F3C94F] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#06162D]/60 transition-colors">
                    <ImageIcon className="w-5 h-5 text-[#F3C94F] mb-1" />
                    <span className="text-xs font-medium text-slate-200">
                      Upload insights screenshot
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      multiple
                      onChange={handleInsightUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {formData.uploadedInsights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.uploadedInsights.map((ins) => (
                      <div key={ins.id} className="p-2.5 rounded-lg bg-[#06162D] border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#F3C94F] shrink-0" />
                          <div>
                            <span className="text-xs text-white truncate max-w-xs block">{ins.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{(ins.size / (1024 * 1024)).toFixed(1)} MB</span>
                              {ins.status === 'uploading' && <span className="text-amber-400 font-semibold">• Uploading ({ins.progress}%)...</span>}
                              {ins.status === 'ready' && <span className="text-emerald-400 font-semibold">• Secured</span>}
                              {ins.status === 'error' && <span className="text-rose-400 font-semibold">• Failed</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedInsight(ins.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Kit PDF (Optional, max 10MB) */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Creator Media Kit / Ratecard (Optional PDF, max 10 MB)
                </label>
                {formData.uploadedMediaKit ? (
                  <div className="p-3 rounded-lg bg-[#06162D] border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#43C8E8] shrink-0" />
                      <div>
                        <span className="text-xs text-white truncate max-w-xs block">{formData.uploadedMediaKit.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{(formData.uploadedMediaKit.size / (1024 * 1024)).toFixed(1)} MB</span>
                          {formData.uploadedMediaKit.status === 'uploading' && <span className="text-amber-400 font-semibold">• Uploading ({formData.uploadedMediaKit.progress}%)...</span>}
                          {formData.uploadedMediaKit.status === 'ready' && <span className="text-emerald-400 font-semibold">• Secured</span>}
                          {formData.uploadedMediaKit.status === 'error' && <span className="text-rose-400 font-semibold">• Failed</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeMediaKit}
                      className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-slate-700 hover:border-slate-500 rounded-xl p-3 flex items-center gap-3 cursor-pointer bg-[#06162D]">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-300">Choose PDF Media Kit</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleMediaKitUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: COLLABORATION PREFERENCES & RATES */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F3C94F]" />
                  Step 5: Collaboration Types &amp; Indicative Rates
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Specify what assignments you take and your typical commercial expectations.
                </p>
              </div>

              {/* Collaboration Types */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Collaboration Formats You Accept <span className="text-[#F3C94F]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COLLABORATION_TYPES.map((type) => {
                    const isSelected = formData.collaborationTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField('collaborationTypes', formData.collaborationTypes.filter(t => t !== type));
                          } else {
                            updateField('collaborationTypes', [...formData.collaborationTypes, type]);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#F3C94F]/10 border-[#F3C94F] text-white font-semibold' 
                            : 'bg-[#06162D] border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{type}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F3C94F]" />}
                      </button>
                    );
                  })}
                </div>
                {errors.collaborationTypes && <p className="text-rose-400 text-xs mt-1">{errors.collaborationTypes}</p>}
              </div>

              {/* Expected Rates Breakdown */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Indicative Expected Rates (in INR ₹)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      1 UGC Video Creation
                    </label>
                    <input
                      type="text"
                      value={formData.rateUgcVideo}
                      onChange={(e) => updateField('rateUgcVideo', e.target.value)}
                      placeholder="e.g. ₹1,500"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      1 Sponsored Reel / Short
                    </label>
                    <input
                      type="text"
                      value={formData.rateSponsoredReel}
                      onChange={(e) => updateField('rateSponsoredReel', e.target.value)}
                      placeholder="e.g. ₹3,500"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      1 Story Post
                    </label>
                    <input
                      type="text"
                      value={formData.rateStory}
                      onChange={(e) => updateField('rateStory', e.target.value)}
                      placeholder="e.g. ₹800"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Additional Production / Editing
                    </label>
                    <input
                      type="text"
                      value={formData.rateAdditionalProduction}
                      onChange={(e) => updateField('rateAdditionalProduction', e.target.value)}
                      placeholder="e.g. ₹1,000"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      On-Location Daily / Shoot Rate
                    </label>
                    <input
                      type="text"
                      value={formData.rateOnLocationDaily}
                      onChange={(e) => updateField('rateOnLocationDaily', e.target.value)}
                      placeholder="e.g. ₹5,000"
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Travel Availability
                    </label>
                    <select
                      value={formData.travelAvailability}
                      onChange={(e) => updateField('travelAvailability', e.target.value)}
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#43C8E8] focus:outline-none cursor-pointer"
                    >
                      <option value="Within district only" className="bg-[#06162D] text-white">Within district only</option>
                      <option value="Across Tamil Nadu" className="bg-[#06162D] text-white">Across Tamil Nadu</option>
                      <option value="Across South India" className="bg-[#06162D] text-white">Across South India</option>
                      <option value="Anywhere in India" className="bg-[#06162D] text-white">Anywhere in India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Equipment Capabilities */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Production Gear &amp; Equipment Available
                </label>
                <div className="space-y-1.5">
                  {EQUIPMENT_OPTIONS.map((equip) => {
                    const isSelected = formData.equipmentSummary.includes(equip);
                    return (
                      <button
                        key={equip}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField('equipmentSummary', formData.equipmentSummary.filter(e => e !== equip));
                          } else {
                            updateField('equipmentSummary', [...formData.equipmentSummary, equip]);
                          }
                        }}
                        className={`w-full p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#43C8E8]/10 border-[#43C8E8] text-white font-medium' 
                            : 'bg-[#06162D] border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{equip}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#43C8E8]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Additional Notes or Portfolio Highlights (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="e.g. Can deliver in 24 hours; have studio setup with greenscreen; fluent in English & Tamil"
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & CONSENT */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F3C94F]" />
                  Step 6: Review &amp; Consent
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Please review your details before final submission. You can click 'Edit' on any section.
                </p>
              </div>

              {/* Summary Cards with Edit buttons */}
              <div className="space-y-4">
                {/* 1. Personal */}
                <div className="p-4 rounded-xl bg-[#06162D] border border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#F3C94F] uppercase tracking-wider mb-1">
                      1. Personal Details
                    </h3>
                    <p className="text-sm font-semibold text-white">{formData.fullName}</p>
                    <p className="text-xs text-slate-300">
                      WhatsApp: {formData.whatsapp} • {formData.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      Location: {formData.cityTown}, {formData.district}, {formData.state}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="p-1.5 text-xs text-[#43C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 2. Socials */}
                <div className="p-4 rounded-xl bg-[#06162D] border border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#43C8E8] uppercase tracking-wider mb-1">
                      2. Social Accounts &amp; Metrics
                    </h3>
                    <p className="text-xs text-slate-300">
                      Primary Platform: <span className="font-semibold text-white">{formData.primaryPlatform}</span>
                    </p>
                    {formData.instagramUrl && (
                      <p className="text-xs text-slate-300 truncate max-w-sm">
                        Instagram: {formData.instagramUrl} ({formData.followerCount || '0'} followers)
                      </p>
                    )}
                    {formData.youtubeUrl && (
                      <p className="text-xs text-slate-300 truncate max-w-sm">
                        YouTube: {formData.youtubeUrl} ({formData.subscriberCount || '0'} subs)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="p-1.5 text-xs text-[#43C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 3. Identity & Niches */}
                <div className="p-4 rounded-xl bg-[#06162D] border border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#F3C94F] uppercase tracking-wider mb-1">
                      3. Niche &amp; Classification
                    </h3>
                    <p className="text-xs text-slate-300">
                      Tier: <span className="font-semibold text-white uppercase">{formData.classification}</span>
                    </p>
                    <p className="text-xs text-slate-300">
                      Categories: <span className="text-white">{formData.categories.join(', ')}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Dialects: {formData.regionalDialects.join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="p-1.5 text-xs text-[#43C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 4. Portfolio */}
                <div className="p-4 rounded-xl bg-[#06162D] border border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#43C8E8] uppercase tracking-wider mb-1">
                      4. Portfolio Samples
                    </h3>
                    <p className="text-xs text-slate-300">
                      Links provided: {formData.sampleLinks.filter(l => l.trim()).length}
                    </p>
                    <p className="text-xs text-slate-300">
                      Videos uploaded: {formData.uploadedVideos.length}
                    </p>
                    <p className="text-xs text-slate-400">
                      Audience screenshots: {formData.uploadedInsights.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="p-1.5 text-xs text-[#43C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 5. Rates */}
                <div className="p-4 rounded-xl bg-[#06162D] border border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#F3C94F] uppercase tracking-wider mb-1">
                      5. Rates &amp; Preferences
                    </h3>
                    <p className="text-xs text-slate-300">
                      UGC: {formData.rateUgcVideo} • Sponsored Reel: {formData.rateSponsoredReel} • Daily: {formData.rateOnLocationDaily}
                    </p>
                    <p className="text-xs text-slate-400">
                      Travel: {formData.travelAvailability}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="p-1.5 text-xs text-[#43C8E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* MANDATORY CONSENT CHECKBOXES (All unchecked by default) */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Declarations &amp; Consents <span className="text-[#F3C94F]">*</span>
                </h3>

                {/* Consent 1: Accuracy */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAccuracy}
                    onChange={(e) => updateField('consentAccuracy', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#F3C94F] focus:ring-[#F3C94F]"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I certify that all details, follower metrics, and sample video links submitted are true, authentic, and represent my genuine creator work.
                  </span>
                </label>
                {errors.consentAccuracy && <p className="text-rose-400 text-xs pl-7">{errors.consentAccuracy}</p>}

                {/* Consent 2: Processing */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentProcessing}
                    onChange={(e) => updateField('consentProcessing', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#F3C94F] focus:ring-[#F3C94F]"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I consent to UNIKORN360 processing my registration data and evaluating my creator profile for network inclusion.
                  </span>
                </label>
                {errors.consentProcessing && <p className="text-rose-400 text-xs pl-7">{errors.consentProcessing}</p>}

                {/* Consent 3: Contact */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentContact}
                    onChange={(e) => updateField('consentContact', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#F3C94F] focus:ring-[#F3C94F]"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I agree to be contacted via WhatsApp or Email regarding potential brand campaigns, creative briefs, and rate confirmations.
                  </span>
                </label>
                {errors.consentContact && <p className="text-rose-400 text-xs pl-7">{errors.consentContact}</p>}

                {/* Consent 4: Brand Sharing */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentBrandSharing}
                    onChange={(e) => updateField('consentBrandSharing', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#F3C94F] focus:ring-[#F3C94F]"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    I authorize UNIKORN360 to present my creator profile, niche tags, and sample videos to verified prospective brand clients for campaign selection.
                  </span>
                </label>
                {errors.consentBrandSharing && <p className="text-rose-400 text-xs pl-7">{errors.consentBrandSharing}</p>}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving Application...</span>
                ) : (
                  <>
                    <span>Submit Creator Application</span>
                    <CheckCircle2 className="w-4 h-4 text-[#06162D]" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
