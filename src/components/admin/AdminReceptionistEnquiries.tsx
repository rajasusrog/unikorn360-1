import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  ExternalLink,
  Inbox
} from 'lucide-react';
import {
  LEAD_STATUS_OPTIONS,
  ReceptionistEnquiryRecord,
  ReceptionistLeadStatus
} from '../../types/receptionist';
import { receptionistService } from '../../services/receptionistService';
import { buildReceptionistWhatsAppUrl } from '../../lib/receptionistKnowledge';
import { AdminReceptionistInbox } from './AdminReceptionistInbox';

interface AdminReceptionistEnquiriesProps {
  currentRole: 'superadmin' | 'admin' | 'evaluator';
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

function getStatusMeta(status: ReceptionistLeadStatus) {
  return (
    LEAD_STATUS_OPTIONS.find((opt) => opt.value === status) || {
      value: status,
      label: status,
      toneClass: 'text-[#526176]'
    }
  );
}

export const AdminReceptionistEnquiries: React.FC<AdminReceptionistEnquiriesProps> = ({
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'enquiries' | 'inbox'>('enquiries');
  const [enquiries, setEnquiries] = useState<ReceptionistEnquiryRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    newLeads: 0,
    followUpRequired: 0,
    qualifiedOrWon: 0
  });
  const [storageMode, setStorageMode] = useState<'supabase' | 'preview_memory'>('supabase');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReceptionistLeadStatus>('all');
  const [followUpOnly, setFollowUpOnly] = useState(false);
  const [modeFilter, setModeFilter] = useState<'all' | 'live' | 'demo'>('all');

  // Selected detail drawer state
  const [selectedEnquiry, setSelectedEnquiry] = useState<ReceptionistEnquiryRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ReceptionistLeadStatus>('new');
  const [editFollowUpRequired, setEditFollowUpRequired] = useState(true);
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editFollowUpNotes, setEditFollowUpNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState('');

  const canModify = currentRole === 'superadmin' || currentRole === 'admin';

  const loadEnquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await receptionistService.listAdminEnquiries();
      setEnquiries(data.enquiries);
      setStats(data.stats);
      setStorageMode(data.storage);
      setNotice(data.notice || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load receptionist enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const openEnquiryDrawer = (item: ReceptionistEnquiryRecord) => {
    setSelectedEnquiry(item);
    setEditStatus(item.lead_status);
    setEditFollowUpRequired(item.follow_up_required);
    setEditFollowUpDate(item.follow_up_date || '');
    setEditFollowUpNotes(item.follow_up_notes || '');
    setSaveBanner('');
  };

  const handleSaveChanges = async () => {
    if (!selectedEnquiry || !canModify) return;
    setSaving(true);
    setSaveBanner('');
    setError('');
    try {
      const updated = await receptionistService.updateAdminEnquiry(selectedEnquiry.id, {
        lead_status: editStatus,
        follow_up_required: editFollowUpRequired,
        follow_up_date: editFollowUpDate.trim() || null,
        follow_up_notes: editFollowUpNotes.trim() || null
      });
      setSelectedEnquiry(updated);
      setEnquiries((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      setSaveBanner('Lead status and follow-up details saved.');
      // Recompute quick KPI counts cleanly
      setEnquiries((current) => {
        const next = current.map((r) => (r.id === updated.id ? updated : r));
        setStats({
          total: next.length,
          newLeads: next.filter((r) => r.lead_status === 'new').length,
          followUpRequired: next.filter((r) => r.follow_up_required || r.lead_status === 'follow_up').length,
          qualifiedOrWon: next.filter((r) => r.lead_status === 'qualified' || r.lead_status === 'won').length
        });
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save enquiry updates.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enquiries.filter((item) => {
      if (statusFilter !== 'all' && item.lead_status !== statusFilter) return false;
      if (followUpOnly && !item.follow_up_required && item.lead_status !== 'follow_up') return false;
      if (modeFilter !== 'all' && item.source_mode !== modeFilter) return false;
      if (q) {
        const haystack = [
          item.reference_code,
          item.customer_name,
          item.business_name || '',
          item.contact_number,
          item.email,
          item.service_required,
          item.project_description
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [enquiries, searchQuery, statusFilter, followUpOnly, modeFilter]);

  return (
    <div className="space-y-6">
      {/* RECEPTIONIST SUB-TABS: ENQUIRIES | CONVERSATION INBOX */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E4DFD5] rounded-xl p-2">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="AI Receptionist sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'enquiries'}
            onClick={() => setActiveSubTab('enquiries')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'enquiries'
                ? 'bg-[#0B1426] text-white'
                : 'text-[#526176] hover:text-[#0B1426] hover:bg-[#F6F5F1]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C49A36]" />
            <span>Submitted Enquiries ({stats.total})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'inbox'}
            onClick={() => setActiveSubTab('inbox')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'inbox'
                ? 'bg-[#0B1426] text-white'
                : 'text-[#526176] hover:text-[#0B1426] hover:bg-[#F6F5F1]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-[#C49A36]" />
            <span>Conversation Inbox</span>
          </button>
        </div>

        <span className="text-[11px] text-[#526176] px-2">
          {activeSubTab === 'inbox'
            ? 'Every Live AI, Demo & future WhatsApp chat turn'
            : 'Structured lead forms captured by AI Receptionist'}
        </span>
      </div>

      {activeSubTab === 'inbox' ? (
        <AdminReceptionistInbox currentRole={currentRole} />
      ) : (
        <>
          {/* KPI SUMMARY STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#526176]">Total Enquiries</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1426] tabular-nums">{stats.total}</p>
          <p className="mt-1 text-xs text-[#526176]">
            {storageMode === 'supabase' ? 'Synced with Supabase' : 'Preview session store'}
          </p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#526176]">New Leads</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1426] tabular-nums">{stats.newLeads}</p>
          <p className="mt-1 text-xs text-[#526176]">Awaiting first contact</p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#B45309]">Follow-Up Required</p>
          <p className="mt-1 text-2xl font-bold text-[#B45309] tabular-nums">
            {stats.followUpRequired}
          </p>
          <p className="mt-1 text-xs text-[#526176]">Flagged for team follow-up</p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#15803D]">Qualified / Won</p>
          <p className="mt-1 text-2xl font-bold text-[#15803D] tabular-nums">
            {stats.qualifiedOrWon}
          </p>
          <p className="mt-1 text-xs text-[#526176]">Active proposals &amp; wins</p>
        </div>
      </div>

      {notice && (
        <div className="bg-[#FDF8EA] border border-[#E8D59E] rounded-xl px-4 py-3 text-xs text-[#6B4E08] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            {error}
          </span>
          <button
            type="button"
            onClick={loadEnquiries}
            className="font-semibold underline whitespace-nowrap cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E4DFD5] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#526176] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, business, email, phone, or service..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/75 focus:bg-white focus:border-[#0B1426]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by lead status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReceptionistLeadStatus)}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">All Statuses</option>
            {LEAD_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by mode"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as 'all' | 'live' | 'demo')}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">Live &amp; Demo</option>
            <option value="live">Live AI Only</option>
            <option value="demo">Demo Mode Only</option>
          </select>

          <button
            type="button"
            onClick={() => setFollowUpOnly((prev) => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
              followUpOnly
                ? 'bg-[#0B1426] text-white border-[#0B1426]'
                : 'bg-white text-[#0B1426] border-[#E4DFD5] hover:border-[#0B1426]'
            }`}
          >
            Follow-Up Only
          </button>

          <button
            type="button"
            onClick={loadEnquiries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-[#E4DFD5] hover:border-[#0B1426] text-[#0B1426] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ENQUIRIES TABLE */}
      <div className="bg-white border border-[#E4DFD5] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 bg-[#F6F5F1] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare className="w-8 h-8 text-[#C49A36] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0B1426]">
              {enquiries.length === 0
                ? 'No AI Receptionist enquiries yet'
                : 'No enquiries match the active filters'}
            </h3>
            <p className="mt-1 text-xs text-[#526176] max-w-md mx-auto leading-relaxed">
              {enquiries.length === 0
                ? 'When visitors submit project enquiries through the website AI Receptionist widget, their details and full conversation history will appear here.'
                : 'Adjust your search term, status filter, or mode selection to view other enquiries.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4DFD5] bg-[#F6F5F1] text-xs font-semibold text-[#526176]">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Service Interest</th>
                  <th className="py-3 px-4">Lead Status</th>
                  <th className="py-3 px-4">Enquiry Date</th>
                  <th className="py-3 px-4">Follow-Up</th>
                  <th className="py-3 px-4 text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD5] text-sm">
                {filteredEnquiries.map((item) => {
                  const statusMeta = getStatusMeta(item.lead_status);
                  const turnCount = Array.isArray(item.conversation_history)
                    ? item.conversation_history.length
                    : 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => openEnquiryDrawer(item)}
                      className="hover:bg-[#F6F5F1]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-[#0B1426]">{item.customer_name}</div>
                        <div className="text-xs text-[#526176] mt-0.5 flex flex-wrap items-center gap-1.5">
                          {item.business_name && (
                            <>
                              <span>{item.business_name}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span className="tabular-nums">{item.contact_number}</span>
                        </div>
                        <div className="text-xs text-[#526176] mt-0.5">{item.email}</div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-medium text-[#0B1426]">{item.service_required}</div>
                        <div className="text-xs text-[#526176] mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>{item.budget_range || 'Budget TBD'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.expected_timeline || 'Timeline TBD'}</span>
                        </div>
                        <div className="text-[11px] text-[#526176] mt-0.5 font-mono">
                          {item.reference_code} · {item.source_mode === 'demo' ? 'Demo' : 'Live AI'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span className={`text-xs font-semibold ${statusMeta.toneClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs text-[#263449] tabular-nums">
                        {formatDateTime(item.created_at)}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div
                          className={`text-xs font-semibold ${
                            item.follow_up_required ? 'text-[#B45309]' : 'text-[#526176]'
                          }`}
                        >
                          {item.follow_up_required ? 'Required' : 'No follow-up'}
                        </div>
                        {item.follow_up_date && (
                          <div className="text-[11px] text-[#526176] tabular-nums mt-0.5">
                            Due {item.follow_up_date}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEnquiryDrawer(item);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0B1426] bg-white border border-[#E4DFD5] hover:border-[#0B1426] rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect ({turnCount})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECTION DRAWER: CUSTOMER DETAILS, FOLLOW-UP CONTROLS & FULL TRANSCRIPT */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-label={`Enquiry details for ${selectedEnquiry.customer_name}`}
          className="fixed inset-0 z-50 bg-[#0B1426]/45 flex justify-end"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#F6F5F1] h-full overflow-y-auto border-l border-[#E4DFD5] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-white border-b border-[#E4DFD5] px-6 py-4 flex items-start justify-between gap-4 sticky top-0 z-10">
              <div>
                <div className="text-xs text-[#526176] flex items-center gap-2 tabular-nums">
                  <span className="font-mono font-semibold text-[#0B1426]">
                    {selectedEnquiry.reference_code}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(selectedEnquiry.created_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {selectedEnquiry.source_mode === 'demo' ? 'Demo Mode' : 'Live Gemini AI'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0B1426] mt-1">
                  {selectedEnquiry.customer_name}
                  {selectedEnquiry.business_name ? ` — ${selectedEnquiry.business_name}` : ''}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry drawer"
                className="p-2 text-[#526176] hover:text-[#0B1426] rounded-lg hover:bg-[#F6F5F1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {saveBanner && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveBanner}</span>
                </div>
              )}

              {/* CUSTOMER & PROJECT DETAILS */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0B1426]">Customer &amp; Scope Details</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={buildReceptionistWhatsAppUrl(
                        `Hello ${selectedEnquiry.customer_name}, following up on your UNIKORN360 enquiry (${selectedEnquiry.reference_code}) regarding ${selectedEnquiry.service_required}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1426] text-white text-xs font-semibold rounded-lg hover:bg-[#1A2844]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C49A36]" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                        `UNIKORN360 Enquiry Follow-Up — ${selectedEnquiry.reference_code}`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4DFD5] hover:border-[#0B1426] text-[#0B1426] text-xs font-semibold rounded-lg"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[#526176]">Customer Name</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.customer_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Business Name</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.business_name || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Contact Number</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5 tabular-nums">
                      {selectedEnquiry.contact_number}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Email</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">{selectedEnquiry.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Service Required</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.service_required}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Budget Range</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.budget_range || 'To be discussed'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Expected Timeline</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.expected_timeline || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Detected Language / Page</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5">
                      {selectedEnquiry.detected_language.toUpperCase()} ·{' '}
                      {selectedEnquiry.page_url || '/'}
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 border-t border-[#E4DFD5]">
                  <p className="text-xs text-[#526176] mb-1">Project Description</p>
                  <p className="text-sm text-[#263449] leading-relaxed whitespace-pre-line">
                    {selectedEnquiry.project_description}
                  </p>
                </div>
              </section>

              {/* LEAD STATUS & FOLLOW-UP CONTROLS */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1426]">Lead Status &amp; Follow-Up</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-lead-status"
                      className="block text-xs font-semibold text-[#0B1426] mb-1"
                    >
                      Lead Status
                    </label>
                    <select
                      id="admin-lead-status"
                      disabled={!canModify}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ReceptionistLeadStatus)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] disabled:bg-[#F6F5F1]"
                    >
                      {LEAD_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-followup-date"
                      className="block text-xs font-semibold text-[#0B1426] mb-1"
                    >
                      Follow-Up Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#526176] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-followup-date"
                        type="date"
                        disabled={!canModify}
                        value={editFollowUpDate}
                        onChange={(e) => setEditFollowUpDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] tabular-nums disabled:bg-[#F6F5F1]"
                      />
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0B1426] cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canModify}
                    checked={editFollowUpRequired}
                    onChange={(e) => setEditFollowUpRequired(e.target.checked)}
                    className="w-4 h-4 accent-[#0B1426]"
                  />
                  <span>Follow-up required by UNIKORN360 team</span>
                </label>

                <div>
                  <label
                    htmlFor="admin-followup-notes"
                    className="block text-xs font-semibold text-[#0B1426] mb-1"
                  >
                    Internal Follow-Up Notes
                  </label>
                  <textarea
                    id="admin-followup-notes"
                    rows={3}
                    disabled={!canModify}
                    value={editFollowUpNotes}
                    onChange={(e) => setEditFollowUpNotes(e.target.value)}
                    placeholder="Record call notes, proposal status, or next action..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] resize-none disabled:bg-[#F6F5F1]"
                  />
                </div>

                {canModify ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1426] hover:bg-[#1A2844] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#526176]">
                    Read-only view for evaluator role. Contact an admin to update lead status.
                  </p>
                )}
              </section>

              {/* FULL CONVERSATION HISTORY */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B1426]">Conversation History</h3>
                  <span className="text-xs text-[#526176] tabular-nums">
                    {selectedEnquiry.conversation_history?.length || 0} messages
                  </span>
                </div>

                {!selectedEnquiry.conversation_history ||
                selectedEnquiry.conversation_history.length === 0 ? (
                  <p className="text-xs text-[#526176]">
                    No chat messages were recorded before submission.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {selectedEnquiry.conversation_history.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`rounded-lg p-3 text-xs leading-relaxed border ${
                          msg.role === 'user'
                            ? 'bg-[#0B1426] text-white border-[#0B1426]'
                            : 'bg-[#F6F5F1] text-[#263449] border-[#E4DFD5]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 opacity-80 tabular-nums text-[11px]">
                          <span className="font-semibold">
                            {msg.role === 'user'
                              ? selectedEnquiry.customer_name
                              : `UNIKORN360 Receptionist (${msg.mode === 'demo' ? 'Demo' : 'Live AI'})`}
                          </span>
                          <span>{formatDateTime(msg.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
