import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Save, 
  X,
  Search,
  Filter,
  Check,
  Sparkles
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { servicesDb } from '../lib/supabase';
import { ServiceDivision, ServiceCatalogItem, RecordStatus, ServicePackage } from '../types/database';
import { AdminCreatorManager } from '../components/admin/AdminCreatorManager';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<'superadmin' | 'admin' | 'evaluator' | null>(null);
  const [adminTab, setAdminTab] = useState<'creators' | 'services'>('creators');

  // Data states
  const [services, setServices] = useState<(ServiceCatalogItem & { division_name: string; division_slug: string })[]>([]);
  const [divisions, setDivisions] = useState<ServiceDivision[]>([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    publishedServices: 0,
    draftServices: 0,
    archivedServices: 0
  });

  const [loading, setLoading] = useState(true);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingService, setEditingService] = useState<Partial<ServiceCatalogItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [authStatusReason, setAuthStatusReason] = useState<string>('');

  // Verify authentic Supabase administrator session and subscribe to SDK auth state changes
  useEffect(() => {
    let active = true;

    const applyVerificationResult = (result: Awaited<ReturnType<typeof servicesDb.verifyAdminSession>>) => {
      if (!active) return;
      if (result.status === 'authenticated' && result.session) {
        setCurrentUser(result.session.user);
        setCurrentRole(result.session.role);
        setAuthStatusReason('');
        if (result.session.role === 'evaluator') {
          setAdminTab('creators');
        }
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
        setAuthStatusReason(result.error || '');
      }
      setSessionLoading(false);
    };

    servicesDb.verifyAdminSession().then(applyVerificationResult);

    const unsubscribe = servicesDb.onAdminAuthStateChange((result) => {
      applyVerificationResult(result);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await servicesDb.getAllServicesForAdmin();
      setServices(data.services);
      setDivisions(data.divisions);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to load admin catalog data', err);
      setErrorMessage(err?.message || 'Failed to load service catalogue from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentRole !== 'evaluator') {
      loadAdminData();
    }
  }, [currentUser, currentRole]);

  const handleLogout = async () => {
    const result = await servicesDb.logoutAdmin();
    setCurrentUser(null);
    setCurrentRole(null);
    if (!result.success && result.error) {
      setErrorMessage(result.error);
      setAuthStatusReason(result.error);
      return;
    }
    onNavigate('/admin/login');
  };

  // Status Change (Publish / Draft / Archive)
  const handleStatusChange = async (serviceId: string, newStatus: RecordStatus) => {
    try {
      await servicesDb.updateServiceStatus(serviceId, newStatus);
      await loadAdminData();
      setSaveMessage(`Service status updated to ${newStatus}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Status update failed');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Division Reordering
  const handleMoveDivision = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= divisions.length) return;

    const newDivs = [...divisions];
    const [moved] = newDivs.splice(index, 1);
    newDivs.splice(targetIndex, 0, moved);

    try {
      const orderedIds = newDivs.map(d => d.id);
      await servicesDb.reorderDivisions(orderedIds);
      await loadAdminData();
      setSaveMessage('Division display order saved to Supabase.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reorder divisions in Supabase.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Service Reordering within Division
  const handleMoveService = async (serviceId: string, divisionId: string, direction: 'up' | 'down') => {
    const divServices = services
      .filter(s => s.division_id === divisionId)
      .sort((a, b) => a.display_order - b.display_order);

    const index = divServices.findIndex(s => s.id === serviceId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= divServices.length) return;

    const reordered = [...divServices];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await servicesDb.reorderServices(divisionId, reordered.map(s => s.id));
      await loadAdminData();
      setSaveMessage('Service display order saved to Supabase.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reorder services in Supabase.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Service Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      if (isCreatingNew) {
        if (!editingService.division_id || !editingService.service_name || !editingService.slug) {
          throw new Error('Please fill in required fields (Division, Service Name, Slug).');
        }

        const siblingCount = services.filter(s => s.division_id === editingService.division_id).length;
        await servicesDb.createService({
          division_id: editingService.division_id,
          service_name: editingService.service_name,
          slug: editingService.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
          short_description: editingService.short_description || '',
          full_description: editingService.full_description || '',
          problems_solved: editingService.problems_solved || [],
          target_customers: editingService.target_customers || [],
          benefits: editingService.benefits || [],
          deliverables: editingService.deliverables || [],
          packages: editingService.packages || [],
          process_steps: editingService.process_steps || [],
          client_responsibilities: editingService.client_responsibilities || [],
          exclusions: editingService.exclusions || [],
          additional_charges: editingService.additional_charges || [],
          gallery: [],
          faqs: editingService.faqs || [],
          seo_title: editingService.seo_title || `${editingService.service_name} | Unikorn360`,
          seo_description: editingService.seo_description || editingService.short_description || '',
          status: editingService.status || 'draft',
          display_order: siblingCount + 1
        });
        setSaveMessage('New service created in Supabase.');
      } else {
        if (!editingService.id) return;
        await servicesDb.updateService(editingService.id, editingService);
        setSaveMessage('Service updated in Supabase.');
      }

      setEditingService(null);
      setIsCreatingNew(false);
      await loadAdminData();
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Save failed');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Filtered Services for Admin View
  const filteredServices = services.filter(s => {
    if (selectedDivisionFilter !== 'all' && s.division_id !== selectedDivisionFilter) return false;
    if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.service_name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.division_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Session verification loader
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#06162D] flex items-center justify-center p-4">
        <SEOHead
          title="Verifying Admin Access | UNIKORN360"
          description="Verifying Supabase authentication credentials."
        />
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <div className="w-8 h-8 border-2 border-[#43C8E8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#06162D] flex items-center justify-center p-4">
        <SEOHead
          title="Access Restricted | UNIKORN360"
          description="Administrative control desk for Unikorn360."
        />
        <div className="bg-[#081B37] border border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-serif text-white">
            Admin Authentication Required
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {authStatusReason || 'This console is strictly restricted to authenticated UNIKORN360 administrators. Please sign in with your credentials.'}
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => onNavigate('/admin/login')}
              className="w-full py-3 bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Go to Administrator Login
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-400 hover:text-white transition-colors block w-full py-2 cursor-pointer"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F6F7] min-h-screen pb-20">
      <SEOHead
        title="Admin Services Manager | UNIKORN360"
        description="Manage the 8 divisions, 64 services, packages, and statuses."
      />

      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-[#D8DEE5] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#214E78] text-white flex items-center justify-center font-bold text-xs">
              U360
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#30363D]">
                Dynamic Services Control Center
              </h1>
              <p className="text-[10px] text-[#505B66]">
                Supabase / Resilient Schema • Administration Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-xs font-semibold text-[#30363D]">{currentUser?.email}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                currentRole === 'superadmin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                currentRole === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {currentRole}
              </span>
            </div>
            <button
              onClick={() => onNavigate('/services')}
              className="text-xs text-[#214E78] font-semibold hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Public View</span>
            </button>
            <span className="text-[#D8DEE5]">|</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-[#F5F6F7] hover:bg-red-50 text-red-600 border border-[#D8DEE5] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner / Flash Alerts */}
      {saveMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveMessage}
          </span>
          <button onClick={() => setSaveMessage('')}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-800 font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage('')}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top-Level Admin Navigation Tabs */}
        <div className="flex border-b border-[#D8DEE5] gap-2 pb-1">
          <button
            onClick={() => setAdminTab('creators')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              adminTab === 'creators'
                ? 'bg-white text-[#214E78] border-[#214E78] shadow-xs'
                : 'text-[#505B66] hover:text-[#30363D] border-transparent hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#A57C35]" />
            <span>Creator Intelligence Dashboard</span>
          </button>

          {currentRole !== 'evaluator' && (
            <button
              onClick={() => setAdminTab('services')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
                adminTab === 'services'
                  ? 'bg-white text-[#214E78] border-[#214E78] shadow-xs'
                  : 'text-[#505B66] hover:text-[#30363D] border-transparent hover:bg-white/50'
              }`}
            >
              <Layers className="w-4 h-4 text-[#214E78]" />
              <span>Services Catalog ({stats.totalServices})</span>
            </button>
          )}
        </div>

        {/* TAB 1: CREATOR NETWORK */}
        {adminTab === 'creators' && (
          <AdminCreatorManager currentRole={currentRole || 'evaluator'} />
        )}

        {/* TAB 2: SERVICES CATALOG */}
        {adminTab === 'services' && (
          <div className="space-y-8">
            {/* KPI Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#D8DEE5] rounded-xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-[#505B66] uppercase tracking-wider">
                  Total In Catalogue
                </span>
                <div className="text-2xl font-bold font-serif text-[#30363D] mt-1">
                  {stats.totalServices}
                </div>
                <span className="text-[10px] text-[#505B66]">Across {divisions.length} Divisions</span>
              </div>

          <div className="bg-white border border-[#D8DEE5] rounded-xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Published (Live)
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              {stats.publishedServices}
            </div>
            <span className="text-[10px] text-[#505B66]">Visible to public</span>
          </div>

          <div className="bg-white border border-[#D8DEE5] rounded-xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-wider">
              Draft (Under Scoping)
            </span>
            <div className="text-2xl font-bold font-serif text-[#A57C35] mt-1">
              {stats.draftServices}
            </div>
            <span className="text-[10px] text-[#505B66]">Protected by RLS</span>
          </div>

          <div className="bg-white border border-[#D8DEE5] rounded-xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Archived
            </span>
            <div className="text-2xl font-bold font-serif text-gray-600 mt-1">
              {stats.archivedServices}
            </div>
            <span className="text-[10px] text-[#505B66]">Soft deleted</span>
          </div>
        </div>

        {/* Division Ordering and Status */}
        <div className="bg-white border border-[#D8DEE5] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-serif text-[#30363D]">
                Service Divisions (Display Order &amp; Live Counts)
              </h2>
              <p className="text-xs text-[#505B66]">
                Reorder divisions in Supabase or verify dynamic published count.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {divisions.map((div, idx) => (
              <div
                key={div.id}
                className="p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#A57C35] block">
                    #{idx + 1} • {div.slug}
                  </span>
                  <p className="text-xs font-bold text-[#30363D]">{div.name}</p>
                  <span className="text-[10px] text-[#505B66]">
                    {div.published_service_count || 0} Published
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveDivision(idx, 'up')}
                    className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3 text-[#505B66]" />
                  </button>
                  <button
                    disabled={idx === divisions.length - 1}
                    onClick={() => handleMoveDivision(idx, 'down')}
                    className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3 text-[#505B66]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Catalog Manager */}
        <div className="bg-white border border-[#D8DEE5] rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold font-serif text-[#30363D]">
                Services Catalog Management
              </h2>
              <p className="text-xs text-[#505B66]">
                Manage public status, pricing, deliverables, and SEO for all 64 services.
              </p>
            </div>

            <button
              onClick={() => {
                setIsCreatingNew(true);
                setEditingService({
                  division_id: divisions[0]?.id || '',
                  service_name: '',
                  slug: '',
                  short_description: '',
                  full_description: '',
                  status: 'draft',
                  problems_solved: [],
                  target_customers: [],
                  benefits: [],
                  deliverables: [],
                  packages: [],
                  process_steps: [],
                  client_responsibilities: [],
                  exclusions: [],
                  faqs: []
                });
              }}
              className="px-4 py-2 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Service (Draft)</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-[#505B66] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services or slugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <select
                value={selectedDivisionFilter}
                onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none"
              >
                <option value="all">All Divisions ({divisions.length})</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="draft">Draft Only</option>
                <option value="archived">Archived Only</option>
              </select>
            </div>
          </div>

          {/* Table of Services */}
          <div className="overflow-x-auto border border-[#D8DEE5] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F7] border-b border-[#D8DEE5] text-[10px] uppercase font-bold text-[#505B66]">
                <tr>
                  <th className="py-3 px-4">Service Name &amp; Slug</th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Packages</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE5]">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#505B66]">
                      No services found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr key={srv.id} className="hover:bg-[#F5F6F7]/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#30363D]">
                          {srv.service_name}
                        </div>
                        <div className="font-mono text-[10px] text-[#505B66]">
                          /services/{srv.division_slug}/{srv.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#505B66]">
                        <span className="px-2 py-0.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-[10px] font-semibold text-[#214E78]">
                          {srv.division_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#505B66]">
                        {srv.packages && srv.packages.length > 0 ? (
                          <span className="text-[11px]">
                            {srv.packages.length} {srv.packages.length === 1 ? 'tier' : 'tiers'}
                            {srv.packages.some(p => p.approval_status === 'approved') && (
                              <span className="text-emerald-700 font-semibold ml-1">✓ Approved</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">Custom Quote</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={srv.status}
                          onChange={(e) => handleStatusChange(srv.id, e.target.value as RecordStatus)}
                          className={`text-[10px] font-bold uppercase rounded px-2 py-1 border cursor-pointer ${
                            srv.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : srv.status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleMoveService(srv.id, srv.division_id, 'up')}
                          className="p-1 hover:bg-[#E9EDF0] text-[#505B66] rounded cursor-pointer"
                          title="Move Up in Division"
                        >
                          <ArrowUp className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => handleMoveService(srv.id, srv.division_id, 'down')}
                          className="p-1 hover:bg-[#E9EDF0] text-[#505B66] rounded cursor-pointer"
                          title="Move Down in Division"
                        >
                          <ArrowDown className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingNew(false);
                            setEditingService({ ...srv });
                          }}
                          className="p-1 hover:bg-[#E9EDF0] text-[#214E78] rounded cursor-pointer"
                          title="Edit Service Scope"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" />
                        </button>
                        <a
                          href={`/services/${srv.division_slug}/${srv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-[#E9EDF0] text-[#505B66] rounded inline-block"
                          title="Open Page View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </main>

      {/* Edit / Create Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D8DEE5] rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#D8DEE5] mb-4">
              <h3 className="text-base font-bold font-serif text-[#30363D]">
                {isCreatingNew ? 'Create New Service' : `Edit: ${editingService.service_name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingService(null);
                  setIsCreatingNew(false);
                }}
                className="text-[#505B66] hover:text-[#30363D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Parent Division *
                  </label>
                  <select
                    required
                    value={editingService.division_id || ''}
                    onChange={(e) => setEditingService({ ...editingService, division_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Status *
                  </label>
                  <select
                    value={editingService.status || 'draft'}
                    onChange={(e) => setEditingService({ ...editingService, status: e.target.value as RecordStatus })}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Live to Public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingService.service_name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = isCreatingNew
                      ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      : editingService.slug;
                    setEditingService({ ...editingService, service_name: name, slug: autoSlug });
                  }}
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  URL Slug (Unique within division) *
                </label>
                <input
                  type="text"
                  required
                  value={editingService.slug || ''}
                  onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs font-mono text-[#30363D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingService.short_description || ''}
                  onChange={(e) => setEditingService({ ...editingService, short_description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={editingService.full_description || ''}
                  onChange={(e) => setEditingService({ ...editingService, full_description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                />
              </div>

              <div className="pt-4 border-t border-[#D8DEE5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 border border-[#D8DEE5] rounded text-xs font-semibold text-[#505B66] hover:bg-[#F5F6F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
