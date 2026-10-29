import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  X, 
  Eye, 
  Save, 
  Trash2, 
  Video, 
  FileText, 
  Share2, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Camera, 
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Layers,
  Award,
  TrendingUp,
  BarChart3,
  Tag,
  CreditCard,
  History,
  UserCheck,
  ChevronRight,
  Info,
  Lock,
  Plus,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { 
  creatorService, 
  TN_DISTRICTS, 
  CONTENT_CATEGORIES,
  REGIONAL_DIALECTS 
} from '../../services/creatorService';
import { 
  CreatorApplicationRecord, 
  ApplicationStatus, 
  CreatorClassification,
  CLASSIFICATION_LABELS,
  STATUS_CONFIG,
  CreatorEvaluation,
  CreatorPayment
} from '../../types/creator';

interface AdminCreatorManagerProps {
  currentRole?: 'superadmin' | 'admin' | 'evaluator';
}

export const AdminCreatorManager: React.FC<AdminCreatorManagerProps> = ({ currentRole = 'evaluator' }) => {
  // Navigation view: 'overview' | 'directory' | 'dossier'
  const [activeView, setActiveView] = useState<'overview' | 'directory'>('overview');
  
  // Data state
  const [applications, setApplications] = useState<CreatorApplicationRecord[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [townFilter, setTownFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [dialectFilter, setDialectFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [followerRangeFilter, setFollowerRangeFilter] = useState<string>('all');

  // Dossier Modal State
  const [selectedApp, setSelectedApp] = useState<CreatorApplicationRecord | null>(null);
  const [dossierTab, setDossierTab] = useState<'profile' | 'assets' | 'commercials' | 'score' | 'campaigns' | 'payments' | 'activity'>('profile');
  const [modalStatus, setModalStatus] = useState<ApplicationStatus>('new');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string>('');
  const [downloadingAsset, setDownloadingAsset] = useState<string | null>(null);

  // 100-Point Unicorn Creator Score State
  const [evalEngagement, setEvalEngagement] = useState<number>(12);      // Max 15
  const [evalViewsScore, setEvalViewsScore] = useState<number>(8);       // Max 10
  const [evalContent, setEvalContent] = useState<number>(8);             // Max 10
  const [evalAuthenticity, setEvalAuthenticity] = useState<number>(8);   // Max 10
  const [evalPresentation, setEvalPresentation] = useState<number>(8);   // Max 10
  const [evalBrandFit, setEvalBrandFit] = useState<number>(12);          // Max 15
  const [evalLocalRelevance, setEvalLocalRelevance] = useState<number>(8);// Max 10
  const [evalHistorical, setEvalHistorical] = useState<number>(8);       // Max 10
  const [evalCostEfficiency, setEvalCostEfficiency] = useState<number>(4);// Max 5
  const [evalReliability, setEvalReliability] = useState<number>(4);     // Max 5
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [evaluatorName, setEvaluatorName] = useState<string>('Lead Evaluator');
  const [evalSaveMessage, setEvalSaveMessage] = useState<string>('');

  // Campaign Matching State
  const [newCampaignInput, setNewCampaignInput] = useState('');
  const [campaignSaveMessage, setCampaignSaveMessage] = useState('');

  // Payment Recording State
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [payCampaign, setPayCampaign] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payStatus, setPayStatus] = useState<'paid' | 'processing' | 'pending'>('paid');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payUtr, setPayUtr] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paySaveMessage, setPaySaveMessage] = useState('');

  // Calculate live Unicorn Score / 100
  const computedTotalScore = useMemo(() => {
    return (
      Number(evalEngagement) +
      Number(evalViewsScore) +
      Number(evalContent) +
      Number(evalAuthenticity) +
      Number(evalPresentation) +
      Number(evalBrandFit) +
      Number(evalLocalRelevance) +
      Number(evalHistorical) +
      Number(evalCostEfficiency) +
      Number(evalReliability)
    );
  }, [
    evalEngagement,
    evalViewsScore,
    evalContent,
    evalAuthenticity,
    evalPresentation,
    evalBrandFit,
    evalLocalRelevance,
    evalHistorical,
    evalCostEfficiency,
    evalReliability
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await creatorService.getApplications({
        status: statusFilter,
        classification: classificationFilter,
        district: districtFilter,
        town: townFilter,
        category: categoryFilter,
        language: languageFilter,
        dialect: dialectFilter,
        platform: platformFilter,
        search: searchQuery
      });
      setApplications(result.applications);
      setStatsData(result.stats);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, classificationFilter, districtFilter, categoryFilter, languageFilter, dialectFilter, platformFilter]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Open Dossier Modal
  const openDossier = (app: CreatorApplicationRecord) => {
    setSelectedApp(app);
    setModalStatus(app.status);
    setModalNotes(app.adminNotes || '');
    setDossierTab('profile');
    setSaveFeedback('');
    setEvalSaveMessage('');
    setCampaignSaveMessage('');
    setPaySaveMessage('');

    // Pre-populate evaluation fields if available
    const existingEval = app.evaluations?.[0];
    if (existingEval) {
      setEvalEngagement(existingEval.engagement_quality ?? 12);
      setEvalViewsScore(existingEval.average_views_score ?? 8);
      setEvalContent(existingEval.content_quality ?? 8);
      setEvalAuthenticity(existingEval.authenticity ?? 8);
      setEvalPresentation(existingEval.presentation ?? 8);
      setEvalBrandFit(existingEval.audience_brand_fit ?? 12);
      setEvalLocalRelevance(existingEval.local_relevance ?? 8);
      setEvalHistorical(existingEval.historical_performance ?? 8);
      setEvalCostEfficiency(existingEval.cost_efficiency ?? 4);
      setEvalReliability(existingEval.reliability ?? 4);
      setEvalNotes(existingEval.evaluation_notes || '');
      setEvaluatorName(existingEval.evaluated_by_name || 'Lead Evaluator');
    } else {
      // Defaults
      setEvalEngagement(12);
      setEvalViewsScore(8);
      setEvalContent(8);
      setEvalAuthenticity(8);
      setEvalPresentation(8);
      setEvalBrandFit(12);
      setEvalLocalRelevance(8);
      setEvalHistorical(8);
      setEvalCostEfficiency(4);
      setEvalReliability(4);
      setEvalNotes('');
    }
  };

  // Status & Notes Update
  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    try {
      await creatorService.updateApplicationStatus(selectedApp.id, modalStatus, modalNotes);
      setSaveFeedback('Workflow status & audit notes successfully updated.');
      
      // Update local state
      setSelectedApp(prev => prev ? ({ ...prev, status: modalStatus, adminNotes: modalNotes }) : null);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: modalStatus, adminNotes: modalNotes } : a));

      setTimeout(() => setSaveFeedback(''), 3000);
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  // Save 100-Point Unicorn Score
  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;
    try {
      const evaluationPayload: CreatorEvaluation = {
        application_id: selectedApp.id,
        engagement_quality: evalEngagement,
        average_views_score: evalViewsScore,
        content_quality: evalContent,
        authenticity: evalAuthenticity,
        presentation: evalPresentation,
        audience_brand_fit: evalBrandFit,
        local_relevance: evalLocalRelevance,
        historical_performance: evalHistorical,
        cost_efficiency: evalCostEfficiency,
        reliability: evalReliability,
        evaluation_notes: evalNotes,
        evaluated_by_name: evaluatorName
      };

      const result = await creatorService.submitEvaluation(selectedApp.id, evaluationPayload);
      setEvalSaveMessage(`Unicorn Score saved: ${result.total_score}/100 recorded in database.`);

      // Update in local state
      setSelectedApp(prev => prev ? ({
        ...prev,
        latestScore: result.total_score,
        evaluations: [evaluationPayload, ...(prev.evaluations || [])]
      }) : null);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, latestScore: result.total_score } : a));

      setTimeout(() => setEvalSaveMessage(''), 4000);
    } catch (e: any) {
      alert(`Failed to save evaluation: ${e.message}`);
    }
  };

  // Add Campaign Match Tag
  const handleAddCampaign = async (campaignTitle: string) => {
    if (!selectedApp || !campaignTitle.trim()) return;
    const currentMatches = selectedApp.campaignMatches || [];
    if (currentMatches.includes(campaignTitle.trim())) return;

    const updated = [...currentMatches, campaignTitle.trim()];
    try {
      await creatorService.updateCampaignMatches(selectedApp.id, updated);
      setSelectedApp(prev => prev ? ({ ...prev, campaignMatches: updated }) : null);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, campaignMatches: updated } : a));
      setNewCampaignInput('');
      setCampaignSaveMessage(`Assigned to "${campaignTitle.trim()}".`);
      setTimeout(() => setCampaignSaveMessage(''), 3000);
    } catch (e: any) {
      alert(`Failed to assign campaign: ${e.message}`);
    }
  };

  // Remove Campaign Tag
  const handleRemoveCampaign = async (campaignTitle: string) => {
    if (!selectedApp) return;
    const currentMatches = selectedApp.campaignMatches || [];
    const updated = currentMatches.filter(c => c !== campaignTitle);
    try {
      await creatorService.updateCampaignMatches(selectedApp.id, updated);
      setSelectedApp(prev => prev ? ({ ...prev, campaignMatches: updated }) : null);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, campaignMatches: updated } : a));
    } catch (e: any) {
      alert(`Failed to remove campaign: ${e.message}`);
    }
  };

  // Permanently Delete Creator (Superadmin only)
  const handleDeleteCreator = async () => {
    if (!selectedApp) return;
    if (confirm(`Are you sure you want to permanently delete creator application ${selectedApp.referenceNumber} (${selectedApp.fullName})? This action is strictly restricted to Superadmins and is irreversible.`)) {
      try {
        await creatorService.deleteApplication(selectedApp.id);
        setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
        setSelectedApp(null);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !payCampaign || !payAmount) return;

    try {
      await creatorService.recordPayment(selectedApp.id, {
        campaign_name: payCampaign.trim(),
        amount: Number(payAmount),
        status: payStatus,
        payment_date: payDate,
        reference_utr: payUtr.trim(),
        notes: payNotes.trim()
      });

      const newPayItem: CreatorPayment = {
        id: `pay_${Date.now()}`,
        campaign_name: payCampaign.trim(),
        amount: Number(payAmount),
        status: payStatus,
        payment_date: payDate,
        reference_utr: payUtr.trim(),
        notes: payNotes.trim()
      };

      setSelectedApp(prev => prev ? ({
        ...prev,
        payments: [newPayItem, ...(prev.payments || [])]
      }) : null);

      setApplications(prev => prev.map(a => a.id === selectedApp.id ? ({
        ...a,
        payments: [newPayItem, ...(a.payments || [])]
      }) : a));

      setShowAddPaymentModal(false);
      setPayCampaign('');
      setPayAmount('');
      setPayUtr('');
      setPayNotes('');
      setPaySaveMessage('Payment logged successfully.');
      setTimeout(() => setPaySaveMessage(''), 3000);
    } catch (e: any) {
      alert(`Failed to record payment: ${e.message}`);
    }
  };

  // Download signed asset
  const handleDownloadAsset = async (storagePath?: string) => {
    if (!storagePath) {
      alert('No storage path found for this asset.');
      return;
    }
    setDownloadingAsset(storagePath);
    try {
      const signedUrl = await creatorService.getSignedDownloadUrl(storagePath);
      if (signedUrl && !signedUrl.startsWith('data:')) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('File is securely stored in private bucket. Signed download link authorized.');
      }
    } catch (e: any) {
      alert(`Download authorization failed: ${e.message}`);
    } finally {
      setDownloadingAsset(null);
    }
  };

  // Filtered List calculation
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          app.fullName.toLowerCase().includes(q) ||
          app.referenceNumber.toLowerCase().includes(q) ||
          app.whatsapp.includes(q) ||
          app.email.toLowerCase().includes(q) ||
          app.cityTown.toLowerCase().includes(q) ||
          app.district.toLowerCase().includes(q) ||
          app.categories.some(c => c.toLowerCase().includes(q)) ||
          (app.campaignMatches && app.campaignMatches.some(c => c.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      // Town filter
      if (townFilter.trim()) {
        if (!app.cityTown.toLowerCase().includes(townFilter.trim().toLowerCase())) return false;
      }

      // Follower range filter
      if (followerRangeFilter !== 'all') {
        const raw = app.followerCount.replace(/[^0-9]/g, '');
        const count = parseInt(raw, 10) || 0;
        if (followerRangeFilter === '<10k' && count >= 10000) return false;
        if (followerRangeFilter === '10k-50k' && (count < 10000 || count > 50000)) return false;
        if (followerRangeFilter === '50k-100k' && (count < 50000 || count > 100000)) return false;
        if (followerRangeFilter === '100k-500k' && (count < 100000 || count > 500000)) return false;
        if (followerRangeFilter === '500k+' && count < 500000) return false;
      }

      return true;
    });
  }, [applications, searchQuery, townFilter, followerRangeFilter]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = applications.length;
    const newCount = applications.filter(a => a.status === 'new' || a.status === 'pending').length;
    const reviewing = applications.filter(a => a.status === 'reviewing' || a.status === 'reviewed').length;
    const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const inactive = applications.filter(a => a.status === 'inactive').length;

    // District breakdown
    const districtCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const levelCounts: Record<string, number> = {
      l1_community: 0,
      l2_nano: 0,
      l3_micro: 0,
      l4_regional: 0,
      l5_mid_tier: 0,
      l6_established: 0
    };

    for (const a of applications) {
      if (a.district) districtCounts[a.district] = (districtCounts[a.district] || 0) + 1;
      for (const cat of a.categories) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
      const cls = a.classification;
      if (cls === 'l1_community' || cls === 'ugc') levelCounts.l1_community++;
      else if (cls === 'l2_nano' || cls === 'nano') levelCounts.l2_nano++;
      else if (cls === 'l3_micro' || cls === 'micro') levelCounts.l3_micro++;
      else if (cls === 'l4_regional') levelCounts.l4_regional++;
      else if (cls === 'l5_mid_tier' || cls === 'mid') levelCounts.l5_mid_tier++;
      else if (cls === 'l6_established' || cls === 'macro') levelCounts.l6_established++;
    }

    return { total, newCount, reviewing, shortlisted, approved, rejected, inactive, districtCounts, categoryCounts, levelCounts };
  }, [applications]);

  // Color generator for score badge
  const getScoreBadgeColor = (score?: number) => {
    if (score === undefined || score === null) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (score >= 85) return 'bg-[#F3C94F]/15 text-[#F3C94F] border-[#F3C94F]/30 font-bold';
    if (score >= 70) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    if (score >= 55) return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setClassificationFilter('all');
    setDistrictFilter('all');
    setTownFilter('');
    setCategoryFilter('all');
    setLanguageFilter('all');
    setDialectFilter('all');
    setPlatformFilter('all');
    setFollowerRangeFilter('all');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner: Private Access & Human Review Guarantee */}
      <div className="bg-gradient-to-r from-[#081B37] via-[#0A2246] to-[#081B37] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F3C94F]/15 text-[#F3C94F] border border-[#F3C94F]/30">
                <Lock className="w-3 h-3" />
                Private Admin Console
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Supabase Auth Protected
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-blue-500/15 text-blue-300 border border-blue-500/30">
                <UserCheck className="w-3 h-3" />
                100% Human Review Policy (No Auto-Rejection)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2.5">
              <span>UNIKORN<span className="text-[#F3C94F]">360</span> Creator Intelligence</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                v2.6 Enterprise
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Recruit, evaluate, classify, and match verified regional content creators for targeted brand campaigns across Tamil Nadu. Creator profiles are private and never publicly searchable.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
              title="Refresh Creator Intelligence Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#43C8E8]' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => creatorService.exportCSV(filteredApps)}
              className="px-4 py-2 rounded-xl bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredApps.length})</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'overview'
                ? 'bg-[#43C8E8] text-[#06162D] shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Overview & Analytics</span>
          </button>
          <button
            onClick={() => setActiveView('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'directory'
                ? 'bg-[#43C8E8] text-[#06162D] shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Creator Directory ({filteredApps.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. DASHBOARD OVERVIEW VIEW */}
      {/* ==================================================================== */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-xl bg-[#081B37] border border-slate-800 shadow">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Applications</span>
              <span className="text-2xl font-bold font-serif text-white mt-1 block">{stats.total}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Full Pipeline Roster</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('new'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 shadow hover:border-sky-500 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">New Applications</span>
              <span className="text-2xl font-bold font-serif text-sky-200 mt-1 block">{stats.newCount}</span>
              <span className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">Awaiting Review →</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('reviewing'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 shadow hover:border-amber-500 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">Under Review</span>
              <span className="text-2xl font-bold font-serif text-amber-200 mt-1 block">{stats.reviewing}</span>
              <span className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">Dossier in evaluation →</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('shortlisted'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 shadow hover:border-cyan-500 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">Shortlisted</span>
              <span className="text-2xl font-bold font-serif text-cyan-200 mt-1 block">{stats.shortlisted}</span>
              <span className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">Brand Pitch Ready →</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('approved'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 shadow hover:border-emerald-500 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Approved Creators</span>
              <span className="text-2xl font-bold font-serif text-emerald-200 mt-1 block">{stats.approved}</span>
              <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">Active Network →</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('rejected'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 shadow hover:border-rose-500 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider block">Rejected</span>
              <span className="text-2xl font-bold font-serif text-rose-200 mt-1 block">{stats.rejected}</span>
              <span className="text-[10px] text-rose-400 mt-1 block">Human decided</span>
            </div>
            <div 
              onClick={() => { setStatusFilter('inactive'); setActiveView('directory'); }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow hover:border-slate-700 cursor-pointer transition-all"
            >
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Inactive / Paused</span>
              <span className="text-2xl font-bold font-serif text-slate-300 mt-1 block">{stats.inactive}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Roster paused</span>
            </div>
          </div>

          {/* Three Intelligence Breakdowns: Level Distribution, District Count, Category Count */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Creator Level Distribution (L1 - L6) */}
            <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F3C94F]" />
                  <span>Creator Level Distribution</span>
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-mono">L1 to L6 Scale</span>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'l1_community', name: 'L1 Community Creator', range: '< 5K Followers', count: stats.levelCounts.l1_community, color: 'bg-emerald-400' },
                  { key: 'l2_nano', name: 'L2 Nano Creator', range: '5K - 20K Followers', count: stats.levelCounts.l2_nano, color: 'bg-cyan-400' },
                  { key: 'l3_micro', name: 'L3 Micro Creator', range: '20K - 100K Followers', count: stats.levelCounts.l3_micro, color: 'bg-blue-400' },
                  { key: 'l4_regional', name: 'L4 Regional Creator', range: '100K - 250K Followers', count: stats.levelCounts.l4_regional, color: 'bg-indigo-400' },
                  { key: 'l5_mid_tier', name: 'L5 Mid-tier Creator', range: '250K - 500K Followers', count: stats.levelCounts.l5_mid_tier, color: 'bg-purple-400' },
                  { key: 'l6_established', name: 'L6 Established Creator', range: '500K+ Followers', count: stats.levelCounts.l6_established, color: 'bg-[#F3C94F]' }
                ].map((lvl) => {
                  const pct = stats.total > 0 ? Math.round((lvl.count / stats.total) * 100) : 0;
                  return (
                    <div 
                      key={lvl.key}
                      onClick={() => { setClassificationFilter(lvl.key); setActiveView('directory'); }}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 group-hover:text-[#43C8E8] transition-colors">{lvl.name}</span>
                          <span className="text-[10px] text-slate-400">({lvl.range})</span>
                        </div>
                        <div className="font-mono text-slate-300">
                          <span className="font-bold text-white">{lvl.count}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${lvl.color} transition-all duration-500`} 
                          style={{ width: `${Math.max(pct, lvl.count > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Creator Count by District (Tamil Nadu) */}
            <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#43C8E8]" />
                  <span>Regional Footprint by District</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Tamil Nadu Focus</span>
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {Object.keys(stats.districtCounts).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No district submissions recorded yet.</p>
                ) : (
                  Object.entries(stats.districtCounts)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .map(([district, count]) => {
                      const pct = stats.total > 0 ? Math.round((Number(count) / stats.total) * 100) : 0;
                      return (
                        <div
                          key={district}
                          onClick={() => { setDistrictFilter(district); setActiveView('directory'); }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-[#43C8E8]/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#43C8E8]" />
                            <span className="text-xs font-semibold text-slate-200">{district}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{pct}%</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-[#43C8E8] border border-slate-700">
                              {count} {count === 1 ? 'creator' : 'creators'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* 3. Creator Count by Content Category */}
            <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span>Content Category Breakdown</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Niches & Topics</span>
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {Object.keys(stats.categoryCounts).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No category tags recorded.</p>
                ) : (
                  Object.entries(stats.categoryCounts)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .map(([cat, count]) => (
                      <div
                        key={cat}
                        onClick={() => { setCategoryFilter(cat); setActiveView('directory'); }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <span className="text-xs font-medium text-slate-300">{cat}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-800/50">
                          {count}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. CREATOR DIRECTORY VIEW & MULTI-FILTERS */}
      {/* ==================================================================== */}
      {activeView === 'directory' && (
        <div className="space-y-6">
          {/* Multi-Filter Bar (Search, District, Town, Language, Dialect, Category, Platform, Followers, Classification, Status) */}
          <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, reference (U360-CR-...), WhatsApp, town, email, or campaign..."
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#43C8E8]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reset Filters */}
              <button
                onClick={clearAllFilters}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                Clear All Filters
              </button>
            </div>

            {/* 10 Advanced Filter Dropdowns in a Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800">
              {/* 1. Status Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New / Awaiting Review</option>
                  <option value="reviewing">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* 2. Creator Classification (L1 - L6) */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classification</label>
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Levels (L1-L6)</option>
                  <option value="l1_community">L1 Community Creator (&lt;5K)</option>
                  <option value="l2_nano">L2 Nano Creator (5K-20K)</option>
                  <option value="l3_micro">L3 Micro Creator (20K-100K)</option>
                  <option value="l4_regional">L4 Regional Creator (100K-250K)</option>
                  <option value="l5_mid_tier">L5 Mid-tier Creator (250K-500K)</option>
                  <option value="l6_established">L6 Established Creator (500K+)</option>
                </select>
              </div>

              {/* 3. District Filter (38 TN Districts) */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">District (TN)</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Districts</option>
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 4. Town / City Text Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">City / Town</label>
                <input
                  type="text"
                  value={townFilter}
                  onChange={(e) => setTownFilter(e.target.value)}
                  placeholder="e.g. Vaniyambadi, Anna Nagar"
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#43C8E8]"
                />
              </div>

              {/* 5. Content Category */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Categories</option>
                  {CONTENT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 6. Language */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Language</label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Languages</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="Tanglish / Both">Tanglish / Both</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* 7. Regional Dialect */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Regional Dialect</label>
                <select
                  value={dialectFilter}
                  onChange={(e) => setDialectFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Dialects</option>
                  {REGIONAL_DIALECTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 8. Primary Platform */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>

              {/* 9. Followers Range */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Followers Range</label>
                <select
                  value={followerRangeFilter}
                  onChange={(e) => setFollowerRangeFilter(e.target.value)}
                  className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#43C8E8]"
                >
                  <option value="all">Any Range</option>
                  <option value="<10k">&lt; 10,000</option>
                  <option value="10k-50k">10,000 - 50,000</option>
                  <option value="50k-100k">50,000 - 100,000</option>
                  <option value="100k-500k">100,000 - 500,000</option>
                  <option value="500k+">500,000+</option>
                </select>
              </div>

              {/* 10. Filter Counter Indicator */}
              <div className="flex flex-col justify-end">
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Matching Creators</span>
                  <span className="text-sm font-bold text-[#F3C94F]">{filteredApps.length} of {applications.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table / List View */}
          <div className="bg-[#081B37] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#06162D] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Reference & Name</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Level (L1-L6)</th>
                    <th className="py-3.5 px-3">Unicorn Score / 100</th>
                    <th className="py-3.5 px-3">Platform & Reach</th>
                    <th className="py-3.5 px-3">Categories & Campaigns</th>
                    <th className="py-3.5 px-3">Workflow Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                        <p className="text-sm font-semibold">No creator applications match the selected criteria.</p>
                        <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const levelMeta = CLASSIFICATION_LABELS[app.classification] || CLASSIFICATION_LABELS.l2_nano;
                      const statusMeta = STATUS_CONFIG[app.status] || STATUS_CONFIG.new;

                      return (
                        <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Reference & Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[10px] text-[#43C8E8] font-bold">
                              {app.referenceNumber}
                            </div>
                            <div className="text-xs font-bold text-white mt-0.5">
                              {app.fullName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{app.whatsapp}</span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-3">
                            <div className="text-slate-200 font-medium">{app.cityTown}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-500" />
                              <span>{app.district}</span>
                            </div>
                          </td>

                          {/* Level Classification */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${levelMeta.badge}`}>
                              {levelMeta.label}
                            </span>
                          </td>

                          {/* Unicorn Score / 100 */}
                          <td className="py-3.5 px-3">
                            {app.latestScore ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getScoreBadgeColor(app.latestScore)}`}>
                                <Sparkles className="w-3 h-3" />
                                <span>{app.latestScore} / 100</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                Pending Score
                              </span>
                            )}
                          </td>

                          {/* Platform & Reach */}
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-200">{app.primaryPlatform}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {app.followerCount} followers
                            </div>
                            {app.averageViewsLast10 && (
                              <div className="text-[10px] text-slate-500">
                                ~{app.averageViewsLast10} views
                              </div>
                            )}
                          </td>

                          {/* Categories & Campaigns */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {app.categories.slice(0, 2).map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 border border-slate-800">
                                  {c}
                                </span>
                              ))}
                              {app.categories.length > 2 && (
                                <span className="text-[9px] text-slate-500">+{app.categories.length - 2}</span>
                              )}
                            </div>
                            {app.campaignMatches && app.campaignMatches.length > 0 && (
                              <div className="mt-1 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5 text-[#F3C94F]" />
                                <span className="text-[10px] text-[#F3C94F] truncate max-w-[160px]">
                                  {app.campaignMatches[0]}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badge}`}>
                              {statusMeta.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${app.fullName}, this is UNIKORN360 Business Intelligence regarding your Creator Network application (${app.referenceNumber}).`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 transition-colors"
                                title="Direct WhatsApp Chat"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => openDossier(app)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#43C8E8] font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Dossier</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CREATOR DETAIL PAGE / COMPREHENSIVE DOSSIER MODAL */}
      {/* ==================================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="max-w-4xl w-full bg-[#081B37] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#06162D] border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#43C8E8] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {selectedApp.referenceNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${(CLASSIFICATION_LABELS[selectedApp.classification] || CLASSIFICATION_LABELS.l2_nano).badge}`}>
                    {(CLASSIFICATION_LABELS[selectedApp.classification] || CLASSIFICATION_LABELS.l2_nano).label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${(STATUS_CONFIG[selectedApp.status] || STATUS_CONFIG.new).badge}`}>
                    {(STATUS_CONFIG[selectedApp.status] || STATUS_CONFIG.new).label}
                  </span>
                  {selectedApp.latestScore && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getScoreBadgeColor(selectedApp.latestScore)}`}>
                      ★ {selectedApp.latestScore}/100 Unicorn Score
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white">
                  {selectedApp.fullName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedApp.cityTown}, {selectedApp.district}, {selectedApp.state} • Submitted on {new Date(selectedApp.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedApp.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedApp.fullName}, this is UNIKORN360 regarding your Creator Network application (${selectedApp.referenceNumber}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                {currentRole === 'superadmin' && (
                  <button
                    onClick={handleDeleteCreator}
                    title="Permanently Delete Creator (Superadmin only)"
                    className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900 border border-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-1 bg-[#071933] px-5 sm:px-6 border-b border-slate-800 overflow-x-auto text-xs py-2">
              {[
                { id: 'profile', label: 'Profile & Socials', icon: Users },
                { id: 'assets', label: 'Media Assets & Files', icon: Video },
                { id: 'commercials', label: 'Pricing & Gear', icon: DollarSign },
                { id: 'score', label: 'Unicorn Score / 100', icon: Sparkles },
                { id: 'campaigns', label: 'Campaign Matches', icon: Tag },
                ...(currentRole !== 'evaluator' ? [{ id: 'payments', label: 'Payment History', icon: CreditCard }] : []),
                { id: 'activity', label: 'Activity Audit Log', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = dossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDossierTab(tab.id as any)}
                    className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#43C8E8] text-[#06162D] shadow' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* TAB 1: Profile & Socials */}
              {dossierTab === 'profile' && (
                <div className="space-y-6">
                  {/* Personal & Contact Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Personal Profile & Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">WhatsApp Number</span>
                        <span className="font-semibold text-white mt-0.5 block">{selectedApp.whatsapp}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                        <span className="font-semibold text-white mt-0.5 block truncate">{selectedApp.email}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Contact Language</span>
                        <span className="font-semibold text-white mt-0.5 block">{selectedApp.contactLanguage}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">District & State</span>
                        <span className="font-semibold text-white mt-0.5 block">{selectedApp.district}, {selectedApp.state}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">City / Town</span>
                        <span className="font-semibold text-white mt-0.5 block">{selectedApp.cityTown}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Legal Age (18+)</span>
                        <span className="font-semibold text-emerald-400 mt-0.5 block">Verified (18+ Confirmed)</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Channels & Metrics */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Social Channels & Audience Reach
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Primary Platform</span>
                        <span className="font-bold text-white text-sm mt-0.5 block">{selectedApp.primaryPlatform}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Followers / Subscribers</span>
                        <span className="font-bold text-[#F3C94F] text-sm mt-0.5 block font-mono">{selectedApp.followerCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Average Views (Last 10)</span>
                        <span className="font-bold text-cyan-300 text-sm mt-0.5 block font-mono">{selectedApp.averageViewsLast10 || 'N/A'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Publishing Cadence</span>
                        <span className="font-bold text-white text-sm mt-0.5 block">{selectedApp.publishingFrequency || 'Regular'}</span>
                      </div>
                    </div>

                    {/* Social URLs */}
                    <div className="space-y-2">
                      {selectedApp.instagramUrl && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400">Instagram Profile</span>
                          <a
                            href={selectedApp.instagramUrl.startsWith('http') ? selectedApp.instagramUrl : `https://${selectedApp.instagramUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#43C8E8] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>{selectedApp.instagramUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedApp.youtubeUrl && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400">YouTube Channel</span>
                          <a
                            href={selectedApp.youtubeUrl.startsWith('http') ? selectedApp.youtubeUrl : `https://${selectedApp.youtubeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#43C8E8] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>{selectedApp.youtubeUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedApp.otherPlatformUrl && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400">Other Channel / Portfolio</span>
                          <a
                            href={selectedApp.otherPlatformUrl.startsWith('http') ? selectedApp.otherPlatformUrl : `https://${selectedApp.otherPlatformUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#43C8E8] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>{selectedApp.otherPlatformUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Languages, Dialects & Demographics */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Language, Dialect & Audience Insights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Linguistic Profile</div>
                        <div>
                          <span className="text-slate-400">Primary:</span>{' '}
                          <span className="font-semibold text-white">{selectedApp.primaryLanguage}</span>
                        </div>
                        {selectedApp.additionalLanguages?.length > 0 && (
                          <div>
                            <span className="text-slate-400">Additional:</span>{' '}
                            <span className="text-slate-300">{selectedApp.additionalLanguages.join(', ')}</span>
                          </div>
                        )}
                        {selectedApp.regionalDialects?.length > 0 && (
                          <div>
                            <span className="text-slate-400">Regional Dialects:</span>{' '}
                            <span className="text-amber-300 font-medium">{selectedApp.regionalDialects.join('; ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Audience Demographics</div>
                        <div>
                          <span className="text-slate-400">Primary Geographic Location:</span>{' '}
                          <span className="text-white font-medium">{selectedApp.audienceLocation || 'Tamil Nadu'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Gender Ratio:</span>{' '}
                          <span className="text-slate-300">{selectedApp.genderBreakdown || 'Balanced'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Primary Age Bracket:</span>{' '}
                          <span className="text-slate-300">{selectedApp.topAgeGroup || '18 - 35'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Media Assets & Secure Files */}
              {dossierTab === 'assets' && (
                <div className="space-y-6">
                  {/* Video Reels */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#43C8E8]" />
                        <span>Uploaded Video Samples (Private Storage)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedApp.uploadedVideos?.length || 0} files stored
                      </span>
                    </div>

                    {selectedApp.uploadedVideos && selectedApp.uploadedVideos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedApp.uploadedVideos.map((vid, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-9 h-9 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-800 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-white truncate text-xs">{vid.name}</p>
                                <p className="text-[10px] text-slate-400">
                                  {vid.size ? `${(vid.size / (1024 * 1024)).toFixed(1)} MB` : 'MP4 Reel'} • Private
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadAsset(vid.storagePath)}
                              disabled={downloadingAsset === vid.storagePath}
                              className="px-3 py-1.5 rounded-lg bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] font-bold text-[10px] uppercase flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>{downloadingAsset === vid.storagePath ? 'Signing...' : 'Signed Download'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-center">
                        No direct video files uploaded. Creator submitted links in the portfolio section.
                      </div>
                    )}
                  </div>

                  {/* Portfolio Links */}
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                      Content Sample Links
                    </h4>
                    {selectedApp.sampleLinks && selectedApp.sampleLinks.length > 0 ? (
                      <div className="space-y-2">
                        {selectedApp.sampleLinks.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="font-mono text-slate-300 truncate max-w-lg">{url}</span>
                            <a
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#43C8E8] hover:underline flex items-center gap-1 font-semibold shrink-0"
                            >
                              <span>Open Reel</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No portfolio URLs submitted.</p>
                    )}
                  </div>

                  {/* Uploaded Insights & Media Kit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Insights Screenshots */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                        Audience Insight Screenshots
                      </h4>
                      {selectedApp.uploadedInsights && selectedApp.uploadedInsights.length > 0 ? (
                        <div className="space-y-2">
                          {selectedApp.uploadedInsights.map((ins, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                              <span className="text-white truncate max-w-[200px]">{ins.name}</span>
                              <button
                                onClick={() => handleDownloadAsset(ins.storagePath)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[#43C8E8] font-bold text-[10px] flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">No analytics screenshots attached.</p>
                      )}
                    </div>

                    {/* Media Kit PDF */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                        Brand Media Kit (PDF)
                      </h4>
                      {selectedApp.uploadedMediaKit ? (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold truncate max-w-[200px]">{selectedApp.uploadedMediaKit.name}</p>
                            <p className="text-[10px] text-slate-400">Official Media Kit PDF</p>
                          </div>
                          <button
                            onClick={() => handleDownloadAsset(selectedApp.uploadedMediaKit?.storagePath)}
                            className="px-3 py-1.5 rounded-lg bg-[#43C8E8] text-[#06162D] font-bold text-[10px] flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-400">No PDF media kit uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Commercials & Pricing */}
              {dossierTab === 'commercials' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Indicative Creator Compensation & Rates
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">UGC Video Ad</span>
                        <span className="text-base font-bold text-[#F3C94F] mt-1 block">
                          {selectedApp.rateUgcVideo ? `₹${selectedApp.rateUgcVideo}` : '₹1,500 - ₹3,000'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Sponsored Reel / Post</span>
                        <span className="text-base font-bold text-[#F3C94F] mt-1 block">
                          {selectedApp.rateSponsoredReel ? `₹${selectedApp.rateSponsoredReel}` : '₹3,500 - ₹8,000'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Story Post</span>
                        <span className="text-base font-bold text-white mt-1 block">
                          {selectedApp.rateStory ? `₹${selectedApp.rateStory}` : '₹800 - ₹1,500'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">On-Location Daily</span>
                        <span className="text-base font-bold text-white mt-1 block">
                          {selectedApp.rateOnLocationDaily ? `₹${selectedApp.rateOnLocationDaily}` : 'Negotiable'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Production Extras</span>
                        <span className="text-base font-bold text-white mt-1 block">
                          {selectedApp.rateAdditionalProduction || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration Preferences */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Collaboration Formats Accepted
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.collaborationTypes?.length > 0 ? (
                        selectedApp.collaborationTypes.map((type, i) => (
                          <span key={i} className="px-3 py-1 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-medium">
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">All standard video brand collaboration formats.</span>
                      )}
                    </div>
                  </div>

                  {/* Previous Campaigns */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Previous Brand Collaboration Experience
                    </h4>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-slate-300 leading-relaxed">
                        {selectedApp.priorCollabDetails || 'Open to initial brand collaborations with UNIKORN360 guidance.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Unicorn Creator Score / 100 */}
              {dossierTab === 'score' && (
                <div className="space-y-6">
                  {/* Score Header */}
                  <div className="p-4 rounded-xl bg-[#06162D] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-[#43C8E8] font-bold uppercase tracking-wider block">
                        Official Evaluation Metric
                      </span>
                      <h3 className="text-base font-bold font-serif text-white mt-0.5">
                        UNIKORN360 Creator Intelligence Score
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        10-Factor Weighted Evaluation Rubric (Total max: 100 points). Evaluated by authorized human reviewers.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Calculated Total</span>
                        <div className="text-3xl font-bold font-serif text-[#F3C94F]">
                          {computedTotalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${getScoreBadgeColor(computedTotalScore)}`}>
                        {computedTotalScore >= 85 ? 'A+' : computedTotalScore >= 70 ? 'A' : computedTotalScore >= 55 ? 'B' : 'C'}
                      </div>
                    </div>
                  </div>

                  {evalSaveMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-medium text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{evalSaveMessage}</span>
                    </div>
                  )}

                  {/* 10 Scoring Dimension Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dimension 1: Engagement Quality (15) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">1. Engagement Quality (Max 15)</span>
                        <span className="font-mono font-bold text-[#F3C94F]">{evalEngagement} / 15</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Genuine comment discussions, shareability, low bot ratio.</p>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={evalEngagement}
                        onChange={(e) => setEvalEngagement(Number(e.target.value))}
                        className="w-full accent-[#F3C94F] cursor-pointer"
                      />
                    </div>

                    {/* Dimension 2: Average/Reliable Views (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">2. Average / Reliable Views (Max 10)</span>
                        <span className="font-mono font-bold text-cyan-300">{evalViewsScore} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Consistent view baseline across last 10-15 published reels.</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalViewsScore}
                        onChange={(e) => setEvalViewsScore(Number(e.target.value))}
                        className="w-full accent-[#43C8E8] cursor-pointer"
                      />
                    </div>

                    {/* Dimension 3: Content Quality (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">3. Content Quality & Framing (Max 10)</span>
                        <span className="font-mono font-bold text-white">{evalContent} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Lighting, camera clarity, editing pace, audio cleanliness.</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalContent}
                        onChange={(e) => setEvalContent(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Dimension 4: Authenticity (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">4. Authenticity & Trust (Max 10)</span>
                        <span className="font-mono font-bold text-white">{evalAuthenticity} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Natural delivery, believable opinions, organic follower affinity.</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalAuthenticity}
                        onChange={(e) => setEvalAuthenticity(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Dimension 5: Speaking / Presentation (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">5. Speaking & Presentation (Max 10)</span>
                        <span className="font-mono font-bold text-white">{evalPresentation} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Voice modulation, confidence on camera, hook retention.</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalPresentation}
                        onChange={(e) => setEvalPresentation(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Dimension 6: Audience-Brand Fit (15) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">6. Audience-Brand Fit (Max 15)</span>
                        <span className="font-mono font-bold text-[#F3C94F]">{evalBrandFit} / 15</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Purchasing propensity of followers for MSME & consumer products.</p>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={evalBrandFit}
                        onChange={(e) => setEvalBrandFit(Number(e.target.value))}
                        className="w-full accent-[#F3C94F] cursor-pointer"
                      />
                    </div>

                    {/* Dimension 7: Local Relevance (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">7. Local / Regional Relevance (Max 10)</span>
                        <span className="font-mono font-bold text-cyan-300">{evalLocalRelevance} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">District resonance (Kongu, Delta, North Arcot, Madurai).</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalLocalRelevance}
                        onChange={(e) => setEvalLocalRelevance(Number(e.target.value))}
                        className="w-full accent-[#43C8E8] cursor-pointer"
                      />
                    </div>

                    {/* Dimension 8: Historical Performance (10) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">8. Historical Performance (Max 10)</span>
                        <span className="font-mono font-bold text-white">{evalHistorical} / 10</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Past collaboration ROI, deadline compliance, brief execution.</p>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={evalHistorical}
                        onChange={(e) => setEvalHistorical(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Dimension 9: Cost Efficiency (5) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">9. Cost Efficiency (Max 5)</span>
                        <span className="font-mono font-bold text-emerald-400">{evalCostEfficiency} / 5</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Commercial viability compared to regional creator benchmarks.</p>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={evalCostEfficiency}
                        onChange={(e) => setEvalCostEfficiency(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    {/* Dimension 10: Reliability & Professionalism (5) */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">10. Reliability & Professionalism (Max 5)</span>
                        <span className="font-mono font-bold text-emerald-400">{evalReliability} / 5</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Prompt communication, responsiveness, revision willingness.</p>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={evalReliability}
                        onChange={(e) => setEvalReliability(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Private Evaluation Notes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white">Confidential Reviewer Notes</label>
                    <textarea
                      rows={3}
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      placeholder="Enter internal qualitative notes for this creator..."
                      className="w-full bg-[#06162D] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#43C8E8]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Reviewer:</span>
                      <input
                        type="text"
                        value={evaluatorName}
                        onChange={(e) => setEvaluatorName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveEvaluation}
                      className="px-5 py-2.5 rounded-xl bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Score to Supabase</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: Campaign Matches */}
              {dossierTab === 'campaigns' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Internal Campaign Matching
                    </h4>
                    <p className="text-xs text-slate-300 mb-4">
                      Match and assign this creator to active UNIKORN360 brand campaigns.
                    </p>

                    {campaignSaveMessage && (
                      <div className="p-3 mb-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{campaignSaveMessage}</span>
                      </div>
                    )}

                    {/* Active assigned campaigns */}
                    <div className="mb-4">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">
                        Currently Assigned Campaigns ({selectedApp.campaignMatches?.length || 0})
                      </span>
                      {selectedApp.campaignMatches && selectedApp.campaignMatches.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.campaignMatches.map((camp, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-xs font-semibold"
                            >
                              <span>{camp}</span>
                              {currentRole !== 'evaluator' && (
                                <button
                                  onClick={() => handleRemoveCampaign(camp)}
                                  className="w-4 h-4 rounded-full hover:bg-cyan-800 flex items-center justify-center text-cyan-400 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No campaigns currently assigned to this creator.</p>
                      )}
                    </div>

                    {/* Add Campaign Tag Form (Superadmin & Admin only) */}
                    {currentRole !== 'evaluator' && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <span className="text-xs font-bold text-white block">Assign to Brand Campaign</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCampaignInput}
                            onChange={(e) => setNewCampaignInput(e.target.value)}
                            placeholder="Type or select campaign title..."
                            className="flex-1 bg-[#06162D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#43C8E8]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCampaign(newCampaignInput)}
                            disabled={!newCampaignInput.trim()}
                            className="px-4 py-2 rounded-xl bg-[#43C8E8] hover:bg-[#34b6d4] text-[#06162D] font-bold text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        </div>

                        {/* Quick preset suggestions */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1.5">Quick Campaign Presets:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Diwali Festive Footwear UGC',
                              'Tirupathur MSME Retail Spotlight',
                              'Coimbatore Industrial Tech Showcase',
                              'Tamil Nadu Agro & Food Tour',
                              'D2C Ayurvedic Skincare Q4',
                              'EV Scooter Endurance Trial'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleAddCampaign(preset)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 cursor-pointer"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: Payment History */}
              {dossierTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Creator Compensation & Payout History
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Audit records of campaign fees disbursed to this creator.
                      </p>
                    </div>

                    {currentRole === 'superadmin' && (
                      <button
                        onClick={() => setShowAddPaymentModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
                      </button>
                    )}
                  </div>

                  {paySaveMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{paySaveMessage}</span>
                    </div>
                  )}

                  {/* Payments Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#06162D] text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Campaign</th>
                          <th className="py-2.5 px-3">Amount (INR)</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Reference / UTR</th>
                          <th className="py-2.5 px-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedApp.payments && selectedApp.payments.length > 0 ? (
                          selectedApp.payments.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-mono text-slate-300">{p.payment_date}</td>
                              <td className="py-2.5 px-3 font-semibold text-white">{p.campaign_name}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                ₹{Number(p.amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">{p.reference_utr || '—'}</td>
                              <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{p.notes || '—'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No payments recorded yet for this creator.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Payment Modal Form */}
                  {showAddPaymentModal && (
                    <form onSubmit={handleRecordPayment} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                      <h5 className="font-bold text-white text-xs">Record New Campaign Payment</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Campaign Name *</label>
                          <input
                            type="text"
                            required
                            value={payCampaign}
                            onChange={(e) => setPayCampaign(e.target.value)}
                            placeholder="e.g. Diwali Footwear UGC"
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Amount (INR) *</label>
                          <input
                            type="number"
                            required
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Payment Status</label>
                          <select
                            value={payStatus}
                            onChange={(e) => setPayStatus(e.target.value as any)}
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Disbursement Date</label>
                          <input
                            type="date"
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">UTR / Bank Reference</label>
                          <input
                            type="text"
                            value={payUtr}
                            onChange={(e) => setPayUtr(e.target.value)}
                            placeholder="e.g. UTR1234567890"
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Payment Notes</label>
                          <input
                            type="text"
                            value={payNotes}
                            onChange={(e) => setPayNotes(e.target.value)}
                            placeholder="e.g. Stage 1 Deliverable Complete"
                            className="w-full bg-[#06162D] border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddPaymentModal(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          Save Payment Record
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 7: Activity Audit Log */}
              {dossierTab === 'activity' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Chronological Activity & Review History
                  </h4>
                  {selectedApp.activityLog && selectedApp.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApp.activityLog.map((act, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#43C8E8] mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{act.action}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {act.details && (
                              <p className="text-[11px] text-slate-300 mt-0.5">{act.details}</p>
                            )}
                            {act.actor_email && (
                              <span className="text-[10px] text-slate-500 mt-1 block">Logged by {act.actor_email}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No activity history recorded yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer: Workflow Status Changer & Save */}
            <div className="p-4 sm:p-5 bg-[#06162D] border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Workflow Status:</span>
                {currentRole === 'evaluator' ? (
                  <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white capitalize">
                    {modalStatus} <span className="text-[10px] text-slate-400 font-normal">(Read-only)</span>
                  </span>
                ) : (
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as ApplicationStatus)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#43C8E8]"
                  >
                    <option value="new">New (Awaiting Review)</option>
                    <option value="reviewing">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive / Paused</option>
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                {saveFeedback && (
                  <span className="text-xs font-medium text-emerald-400 mr-2 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{saveFeedback}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Close Dossier
                </button>
                {currentRole !== 'evaluator' && (
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="px-5 py-2 rounded-xl bg-[#43C8E8] hover:bg-[#34b6d4] text-[#06162D] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Workflow Status</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
