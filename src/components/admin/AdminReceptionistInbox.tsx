import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  UserCheck,
  Globe,
  Bot,
  User,
  ShieldCheck
} from 'lucide-react';
import {
  CONVERSATION_STATUS_OPTIONS,
  ReceptionistAdminAssigneeOption,
  ReceptionistConversationRecord,
  ReceptionistConversationStatus,
  ReceptionistLanguage,
  ReceptionistMessageRecord,
  ReceptionistSenderType
} from '../../types/receptionist';
import { receptionistService } from '../../services/receptionistService';

interface AdminReceptionistInboxProps {
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

function formatLanguageLabel(lang: ReceptionistLanguage): string {
  switch (lang) {
    case 'ta':
      return 'Tamil (TA)';
    case 'tanglish':
      return 'Tanglish';
    case 'hi':
      return 'Hindi (HI)';
    default:
      return 'English (EN)';
  }
}

function getConversationStatusMeta(status: ReceptionistConversationStatus) {
  return (
    CONVERSATION_STATUS_OPTIONS.find((opt) => opt.value === status) || {
      value: status,
      label: status,
      toneClass: 'text-[#526176]'
    }
  );
}

function getSenderBadgeLabel(senderType: ReceptionistSenderType, mode: 'live' | 'demo'): string {
  switch (senderType) {
    case 'customer':
      return 'Customer';
    case 'agent':
      return 'Team Agent';
    case 'system':
      return 'System Event';
    default:
      return mode === 'demo' ? 'AI Receptionist (Demo)' : 'AI Receptionist (Live)';
  }
}

export const AdminReceptionistInbox: React.FC<AdminReceptionistInboxProps> = ({ currentRole }) => {
  const [conversations, setConversations] = useState<ReceptionistConversationRecord[]>([]);
  const [assignees, setAssignees] = useState<ReceptionistAdminAssigneeOption[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    liveThreads: 0,
    demoThreads: 0,
    activeOrFollowUp: 0,
    unassigned: 0
  });
  const [storageMode, setStorageMode] = useState<'supabase' | 'preview_memory'>('supabase');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Server-backed filter controls
  const [searchInput, setSearchInput] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'website' | 'whatsapp'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'live' | 'demo'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReceptionistConversationStatus>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | ReceptionistLanguage>('all');

  // Slide-over inspection drawer
  const [selectedConversation, setSelectedConversation] =
    useState<ReceptionistConversationRecord | null>(null);
  const [drawerMessages, setDrawerMessages] = useState<ReceptionistMessageRecord[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editStatus, setEditStatus] = useState<ReceptionistConversationStatus>('active');
  const [editAssignee, setEditAssignee] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState('');
  const activeConversationIdRef = useRef<string | null>(null);

  const canModify = currentRole === 'superadmin' || currentRole === 'admin';

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await receptionistService.listAdminConversations({
        channel: channelFilter,
        mode: modeFilter,
        status: statusFilter,
        language: languageFilter,
        search: searchInput
      });
      setConversations(data.conversations);
      setAssignees(data.assignees || []);
      setStats(data.stats);
      setStorageMode(data.storage);
      setNotice(data.notice || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load conversation inbox.');
    } finally {
      setLoading(false);
    }
  }, [channelFilter, modeFilter, statusFilter, languageFilter, searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadConversations]);

  const closeConversationDrawer = () => {
    activeConversationIdRef.current = null;
    setSelectedConversation(null);
    setDrawerMessages([]);
    setDrawerLoading(false);
    setSaveBanner('');
  };

  const openConversationDrawer = async (conv: ReceptionistConversationRecord) => {
    activeConversationIdRef.current = conv.id;
    setSelectedConversation(conv);
    setEditStatus(conv.conversation_status);
    setEditAssignee(conv.assigned_employee || '');
    setDrawerMessages([]);
    setSaveBanner('');
    setDrawerLoading(true);
    try {
      const detail = await receptionistService.getAdminConversationDetail(conv.id);
      if (activeConversationIdRef.current !== conv.id) return;
      setSelectedConversation({
        ...conv,
        ...detail.conversation,
        enquiry_reference_code: conv.enquiry_reference_code || detail.conversation.enquiry_reference_code
      });
      setDrawerMessages((detail.messages || []).filter((m) => m.conversation_id === conv.id));
    } catch (err: unknown) {
      if (activeConversationIdRef.current !== conv.id) return;
      setError(err instanceof Error ? err.message : 'Failed to load conversation messages.');
    } finally {
      if (activeConversationIdRef.current === conv.id) {
        setDrawerLoading(false);
      }
    }
  };

  const handleSaveConversation = async () => {
    if (!selectedConversation || !canModify) return;
    setSaving(true);
    setSaveBanner('');
    setError('');
    try {
      const updated = await receptionistService.updateAdminConversation(selectedConversation.id, {
        conversation_status: editStatus,
        assigned_employee: editAssignee.trim() || null
      });
      const merged: ReceptionistConversationRecord = {
        ...selectedConversation,
        ...updated
      };
      setSelectedConversation(merged);
      setConversations((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
      setSaveBanner('Conversation status and assignment updated.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#526176]">Total Conversations</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1426] tabular-nums">{stats.total}</p>
          <p className="mt-1 text-xs text-[#526176]">
            {storageMode === 'supabase' ? 'Synced with Supabase CRM' : 'Preview session store'}
          </p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#526176]">Live AI Threads</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1426] tabular-nums">{stats.liveThreads}</p>
          <p className="mt-1 text-xs text-[#526176] tabular-nums">
            {stats.demoThreads} Demo Mode separated
          </p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#B45309]">Active / Follow-Up</p>
          <p className="mt-1 text-2xl font-bold text-[#B45309] tabular-nums">
            {stats.activeOrFollowUp}
          </p>
          <p className="mt-1 text-xs text-[#526176]">Needs team review or reply</p>
        </div>

        <div className="bg-white border border-[#E4DFD5] rounded-xl p-5">
          <p className="text-xs font-medium text-[#15803D]">Unassigned Threads</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1426] tabular-nums">{stats.unassigned}</p>
          <p className="mt-1 text-xs text-[#526176]">Ready for employee assignment</p>
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
            onClick={loadConversations}
            className="font-semibold underline whitespace-nowrap cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-[#E4DFD5] rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#526176] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Search conversations"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search customer, session ID, assignee, or message text..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/75 focus:bg-white focus:border-[#0B1426]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by source channel"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as 'all' | 'website' | 'whatsapp')}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">All Channels</option>
            <option value="website">Website Widget</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          <select
            aria-label="Filter by source mode"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as 'all' | 'live' | 'demo')}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">Live &amp; Demo</option>
            <option value="live">Live AI Only</option>
            <option value="demo">Demo Mode Only</option>
          </select>

          <select
            aria-label="Filter by conversation status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReceptionistConversationStatus)}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">All Statuses</option>
            {CONVERSATION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by detected language"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as 'all' | ReceptionistLanguage)}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426]"
          >
            <option value="all">All Languages</option>
            <option value="en">English (EN)</option>
            <option value="ta">Tamil (TA)</option>
            <option value="tanglish">Tanglish</option>
            <option value="hi">Hindi (HI)</option>
          </select>

          <button
            type="button"
            onClick={loadConversations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-[#E4DFD5] hover:border-[#0B1426] text-[#0B1426] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* CONVERSATIONS TABLE */}
      <div className="bg-white border border-[#E4DFD5] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 bg-[#F6F5F1] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare className="w-8 h-8 text-[#C49A36] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0B1426]">
              No customer conversations found
            </h3>
            <p className="mt-1 text-xs text-[#526176] max-w-md mx-auto leading-relaxed">
              Every customer and AI message from Website Live AI, Demo Mode, and future WhatsApp threads is logged here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4DFD5] bg-[#F6F5F1] text-xs font-semibold text-[#526176]">
                  <th className="py-3 px-4">Customer / Session</th>
                  <th className="py-3 px-4">Channel &amp; Mode</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Lead Status</th>
                  <th className="py-3 px-4">Assigned Employee</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD5] text-sm">
                {conversations.map((conv) => {
                  const statusMeta = getConversationStatusMeta(conv.conversation_status);
                  return (
                    <tr
                      key={conv.id}
                      onClick={() => openConversationDrawer(conv)}
                      className="hover:bg-[#F6F5F1]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-semibold text-[#0B1426] truncate">
                          {conv.customer_identifier || 'Website Visitor'}
                        </div>
                        <div
                          className="text-[11px] text-[#526176] font-mono mt-0.5 truncate"
                          title={`Conversation ID: ${conv.id} · Session ID: ${conv.session_id}`}
                        >
                          ID: {conv.id.slice(0, 8)} · {conv.session_id}
                          {conv.enquiry_reference_code ? ` · ${conv.enquiry_reference_code}` : ''}
                        </div>
                        {conv.last_message_preview && (
                          <div className="text-xs text-[#263449] mt-1 line-clamp-1">
                            {conv.last_message_preview}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#0B1426] capitalize">
                          {conv.source_channel}
                        </div>
                        <div className="text-[11px] text-[#526176] mt-0.5">
                          <span
                            className={
                              conv.source_mode === 'demo'
                                ? 'font-semibold text-[#9A6B00]'
                                : 'font-semibold text-[#0B1426]'
                            }
                          >
                            {conv.source_mode === 'demo' ? 'Demo Mode' : 'Live AI'}
                          </span>
                          {' · '}
                          <span className="font-mono">{conv.current_page || '/'}</span>
                          {(conv.failed_count ?? 0) > 0 && (
                            <span className="ml-1.5 font-semibold text-red-700">
                              · {conv.failed_count} failed
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs text-[#0B1426] font-medium">
                        {formatLanguageLabel(conv.detected_language)}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span className={`text-xs font-semibold ${statusMeta.toneClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs text-[#263449]">
                        {conv.assigned_employee ? (
                          <span className="inline-flex items-center gap-1 font-medium text-[#0B1426]">
                            <UserCheck className="w-3.5 h-3.5 text-[#15803D]" />
                            {conv.assigned_employee}
                          </span>
                        ) : (
                          <span className="text-[#526176]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs text-[#263449] tabular-nums">
                        {formatDateTime(conv.last_message_at)}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConversationDrawer(conv);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0B1426] bg-white border border-[#E4DFD5] hover:border-[#0B1426] rounded-lg transition-colors cursor-pointer tabular-nums"
                        >
                          View ({conv.message_count ?? 0})
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

      {/* CONVERSATION INSPECTION DRAWER */}
      {selectedConversation && (
        <div
          role="dialog"
          aria-label={`Conversation ${selectedConversation.session_id}`}
          className="fixed inset-0 z-50 bg-[#0B1426]/45 flex justify-end"
          onClick={closeConversationDrawer}
        >
          <div
            className="w-full max-w-2xl bg-[#F6F5F1] h-full overflow-y-auto border-l border-[#E4DFD5] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-[#E4DFD5] px-6 py-4 flex items-start justify-between gap-4 sticky top-0 z-10">
              <div>
                <div className="text-xs text-[#526176] flex flex-wrap items-center gap-2 tabular-nums">
                  <span className="font-mono font-semibold text-[#0B1426]">
                    {selectedConversation.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{selectedConversation.session_id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{selectedConversation.source_channel}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {selectedConversation.source_mode === 'demo' ? 'Demo Mode' : 'Live Gemini AI'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatLanguageLabel(selectedConversation.detected_language)}</span>
                </div>
                <h2 className="text-lg font-bold text-[#0B1426] mt-1">
                  {selectedConversation.customer_identifier || 'Website Visitor Conversation'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeConversationDrawer}
                aria-label="Close conversation drawer"
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

              {/* CONTEXT METADATA */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[#526176]">Current Page</dt>
                    <dd className="font-mono font-semibold text-[#0B1426] mt-0.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#C49A36]" />
                      {selectedConversation.current_page || '/'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Linked Enquiry</dt>
                    <dd className="font-mono font-semibold text-[#0B1426] mt-0.5">
                      {selectedConversation.enquiry_reference_code || 'Not submitted yet'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Conversation Started</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5 tabular-nums">
                      {formatDateTime(selectedConversation.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526176]">Last Activity</dt>
                    <dd className="font-semibold text-[#0B1426] mt-0.5 tabular-nums">
                      {formatDateTime(selectedConversation.last_message_at)}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* LEAD STATUS & ASSIGNED EMPLOYEE */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1426]">CRM Status &amp; Employee Assignment</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="conv-lead-status"
                      className="block text-xs font-semibold text-[#0B1426] mb-1"
                    >
                      Lead / Conversation Status
                    </label>
                    <select
                      id="conv-lead-status"
                      disabled={!canModify}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ReceptionistConversationStatus)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] disabled:bg-[#F6F5F1]"
                    >
                      {CONVERSATION_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="conv-assigned-employee"
                      className="block text-xs font-semibold text-[#0B1426] mb-1"
                    >
                      Assigned Employee
                    </label>
                    <select
                      id="conv-assigned-employee"
                      disabled={!canModify}
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] disabled:bg-[#F6F5F1]"
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((member) => (
                        <option key={member.email} value={member.email}>
                          {member.email} ({member.role})
                        </option>
                      ))}
                      {editAssignee && !assignees.some((a) => a.email === editAssignee) && (
                        <option value={editAssignee}>{editAssignee}</option>
                      )}
                    </select>
                  </div>
                </div>

                {canModify ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveConversation}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1426] hover:bg-[#1A2844] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save CRM Update'}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#526176]">
                    Read-only view for evaluator role. Contact an administrator to reassign or update conversation status.
                  </p>
                )}
              </section>

              {/* MESSAGE TIMELINE */}
              <section className="bg-white border border-[#E4DFD5] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B1426]">Individual Messages</h3>
                  <span className="text-xs text-[#526176] tabular-nums">
                    {drawerMessages.length} persisted
                  </span>
                </div>

                {drawerLoading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="h-14 bg-[#F6F5F1] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : drawerMessages.length === 0 ? (
                  <p className="text-xs text-[#526176]">
                    No individual messages stored in this conversation yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {drawerMessages.map((msg) => {
                      const isCustomer = msg.sender_type === 'customer';
                      const isSystem = msg.sender_type === 'system';
                      const isFailed = msg.delivery_status === 'failed';
                      return (
                        <div
                          key={msg.id}
                          className={`rounded-lg p-3.5 text-xs leading-relaxed border ${
                            isFailed
                              ? 'bg-red-50 text-red-900 border-red-200'
                              : isCustomer
                              ? 'bg-[#0B1426] text-white border-[#0B1426]'
                              : isSystem
                              ? 'bg-[#FDF8EA] text-[#6B4E08] border-[#E8D59E]'
                              : 'bg-[#F6F5F1] text-[#263449] border-[#E4DFD5]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 opacity-85 tabular-nums text-[11px]">
                            <span className="font-semibold inline-flex items-center gap-1.5">
                              {isFailed ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                              ) : isCustomer ? (
                                <User className="w-3.5 h-3.5" />
                              ) : isSystem ? (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Bot className="w-3.5 h-3.5 text-[#C49A36]" />
                              )}
                              {getSenderBadgeLabel(msg.sender_type, selectedConversation.source_mode)}
                              {msg.ai_model ? ` · ${msg.ai_model}` : ''}
                            </span>
                            <span className={isFailed ? 'font-semibold text-red-800' : ''}>
                              {msg.delivery_status} · {formatDateTime(msg.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-line">{msg.message_content}</p>
                          {(msg.message_metadata?.errorCode || msg.message_metadata?.failureStage) && (
                            <div className="mt-2 pt-2 border-t border-red-200/80 text-[11px] font-mono text-red-800 flex flex-wrap gap-2">
                              {msg.message_metadata.failureStage && (
                                <span>Stage: {msg.message_metadata.failureStage}</span>
                              )}
                              {msg.message_metadata.errorCode && (
                                <span>Code: {msg.message_metadata.errorCode}</span>
                              )}
                            </div>
                          )}
                          {Array.isArray(msg.message_metadata?.recommendedLinks) &&
                            msg.message_metadata.recommendedLinks.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-current/15 flex flex-wrap gap-1.5">
                                {msg.message_metadata.recommendedLinks.map((link) => (
                                  <span
                                    key={link.path}
                                    className="px-2 py-0.5 text-[10px] font-mono bg-white/80 text-[#0B1426] border border-[#E4DFD5] rounded"
                                  >
                                    {link.label} ({link.path})
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
