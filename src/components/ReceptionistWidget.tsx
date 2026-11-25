import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Minus,
  RotateCcw,
  Send,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  PhoneCall,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import {
  BUDGET_RANGE_OPTIONS,
  RECEPTIONIST_QUICK_ACTIONS,
  RECEPTIONIST_SERVICE_OPTIONS,
  RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE,
  RECEPTIONIST_WHATSAPP_DISPLAY,
  TIMELINE_OPTIONS,
  buildReceptionistWhatsAppUrl
} from '../lib/receptionistKnowledge';
import {
  EMPTY_ENQUIRY_DRAFT,
  ReceptionistChatMessage,
  ReceptionistEnquiryDraft,
  ReceptionistLanguage,
  ReceptionistMode,
  ReceptionistQuickAction
} from '../types/receptionist';
import {
  ReceptionistClientError,
  receptionistService
} from '../services/receptionistService';

interface ReceptionistWidgetProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `rec-${crypto.randomUUID()}`;
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function createWelcomeMessage(mode: ReceptionistMode): ReceptionistChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content:
      'Welcome to UNIKORN360 Business Intelligence. I can guide you across our 6 service divisions, 4 standalone software products, or help capture your project enquiry — in English, தமிழ், Tanglish, or हिन्दी. How can we assist your business today?',
    timestamp: new Date().toISOString(),
    mode,
    language: 'en'
  };
}

export const ReceptionistWidget: React.FC<ReceptionistWidgetProps> = ({
  currentPath,
  onNavigate
}) => {
  const [widgetState, setWidgetState] = useState<'closed' | 'minimised' | 'open'>('closed');
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [mode, setMode] = useState<ReceptionistMode>('live');
  const [sessionId, setSessionId] = useState<string>(() => createSessionId());
  const [messages, setMessages] = useState<ReceptionistChatMessage[]>(() => [
    createWelcomeMessage('live')
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<{ message: string; retryText?: string } | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<ReceptionistLanguage>('en');
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Inline enquiry review & submission state
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryDraft, setEnquiryDraft] = useState<ReceptionistEnquiryDraft>(EMPTY_ENQUIRY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [enquirySubmitError, setEnquirySubmitError] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    referenceCode: string;
    storage: 'supabase' | 'preview_memory';
    serviceRequired: string;
    customerName: string;
  } | null>(null);

  // Human handover helper state
  const [showHandoverCard, setShowHandoverCard] = useState(false);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const capturedFieldCount = useMemo(() => {
    return (Object.values(enquiryDraft) as string[]).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  }, [enquiryDraft]);

  useEffect(() => {
    if (widgetState === 'open') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, showEnquiryForm, showHandoverCard, submittedReceipt, widgetState]);

  useEffect(() => {
    if (widgetState === 'open') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [widgetState]);

  // Hide visitor chat widget inside /admin routes so admin dashboard stays unobstructed
  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const whatsAppMessage = useMemo(() => {
    if (submittedReceipt) {
      return `${RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE} Reference: ${submittedReceipt.referenceCode} (${submittedReceipt.serviceRequired}).`;
    }
    if (enquiryDraft.serviceRequired.trim()) {
      return `${RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE} I am interested in ${enquiryDraft.serviceRequired.trim()}.`;
    }
    return RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE;
  }, [enquiryDraft.serviceRequired, submittedReceipt]);

  const defaultWhatsAppHref = buildReceptionistWhatsAppUrl(RECEPTIONIST_WHATSAPP_DEFAULT_MESSAGE);
  const contextualWhatsAppHref = buildReceptionistWhatsAppUrl(whatsAppMessage);

  const handleOpenWidget = () => {
    setTeaserDismissed(true);
    setWidgetState('open');
  };

  const handleMinimise = () => {
    setWidgetState('minimised');
  };

  const handleClose = () => {
    setWidgetState('closed');
  };

  const handleResetConversation = () => {
    const freshId = createSessionId();
    setSessionId(freshId);
    setMessages([createWelcomeMessage(mode)]);
    setInputValue('');
    setChatError(null);
    setDetectedLanguage('en');
    setShowQuickActions(true);
    setShowEnquiryForm(false);
    setShowHandoverCard(false);
    setEnquiryDraft(EMPTY_ENQUIRY_DRAFT);
    setFieldErrors({});
    setEnquirySubmitError('');
    setSubmittedReceipt(null);
  };

  const handleModeSwitch = (nextMode: ReceptionistMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setChatError(null);
  };

  const sendMessageText = async (
    text: string,
    options?: { quickActionId?: string; presetService?: string; overrideMode?: ReceptionistMode }
  ) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const activeMode = options?.overrideMode || mode;
    setChatError(null);
    setShowQuickActions(false);

    const nextDraft = options?.presetService
      ? {
          ...enquiryDraft,
          serviceRequired: enquiryDraft.serviceRequired || options.presetService
        }
      : enquiryDraft;

    if (options?.presetService && !enquiryDraft.serviceRequired) {
      setEnquiryDraft(nextDraft);
    }

    const userMsg: ReceptionistChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      mode: activeMode,
      quickActionId: options?.quickActionId
    };

    const historyForApi = messages.slice(-14).map((m) => ({
      role: m.role,
      content: m.content
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await receptionistService.sendMessage({
        sessionId,
        message: trimmed,
        history: historyForApi,
        mode: activeMode,
        currentPage: currentPath,
        quickActionId: options?.quickActionId,
        collectedDraft: nextDraft
      });

      setDetectedLanguage(response.detectedLanguage);

      if (response.extractedFields && Object.keys(response.extractedFields).length > 0) {
        setEnquiryDraft((prev) => ({
          customerName: response.extractedFields.customerName || prev.customerName,
          businessName: response.extractedFields.businessName || prev.businessName,
          contactNumber: response.extractedFields.contactNumber || prev.contactNumber,
          email: response.extractedFields.email || prev.email,
          serviceRequired: response.extractedFields.serviceRequired || prev.serviceRequired,
          projectDescription: response.extractedFields.projectDescription || prev.projectDescription,
          budgetRange: response.extractedFields.budgetRange || prev.budgetRange,
          expectedTimeline: response.extractedFields.expectedTimeline || prev.expectedTimeline
        }));
      }

      const assistantMsg: ReceptionistChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        mode: response.mode,
        language: response.detectedLanguage,
        recommendedLinks: response.recommendedLinks,
        suggestEnquiryForm: response.suggestEnquiryForm
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.suggestHumanHandover) {
        setShowHandoverCard(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ReceptionistClientError
          ? err.message
          : 'Unable to reach the receptionist service right now. Please try again.';
      setChatError({ message, retryText: trimmed });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: ReceptionistQuickAction) => {
    if (action.isHumanHandover) {
      setShowHandoverCard(true);
      setShowQuickActions(false);
      const handoverMsg: ReceptionistChatMessage = {
        id: `handover-${Date.now()}`,
        role: 'assistant',
        content:
          'You can reach the UNIKORN360 team directly on WhatsApp (+91 98848 24360) using the Talk to UNIKORN360 button below, or leave your enquiry details here so our team can follow up with full context.',
        timestamp: new Date().toISOString(),
        mode,
        language: detectedLanguage
      };
      setMessages((prev) => [...prev, handoverMsg]);
      return;
    }

    sendMessageText(action.prompt, {
      quickActionId: action.id,
      presetService: action.serviceLabel
    });
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessageText(inputValue);
  };

  const handleCopyWhatsAppMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setCopiedWhatsAppMsg(true);
      setTimeout(() => setCopiedWhatsAppMsg(false), 2500);
    } catch {
      // Clipboard unavailable in restricted context
    }
  };

  const handleEnquiryFieldChange = (
    field: keyof ReceptionistEnquiryDraft,
    value: string
  ) => {
    setEnquiryDraft((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (enquirySubmitError) setEnquirySubmitError('');
  };

  const validateClientEnquiry = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (enquiryDraft.customerName.trim().length < 2) {
      errors.customerName = 'Enter your name (min 2 characters).';
    }
    const digits = enquiryDraft.contactNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      errors.contactNumber = 'Enter a valid 10–15 digit phone or WhatsApp number.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(enquiryDraft.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (enquiryDraft.serviceRequired.trim().length < 2) {
      errors.serviceRequired = 'Select the service you need.';
    }
    if (enquiryDraft.projectDescription.trim().length < 10) {
      errors.projectDescription = 'Describe your requirement (at least 10 characters).';
    }
    return errors;
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateClientEnquiry();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquirySubmitError('');

    try {
      const result = await receptionistService.submitEnquiry({
        sessionId,
        sourceMode: mode,
        detectedLanguage,
        pageUrl: currentPath,
        enquiry: {
          customerName: enquiryDraft.customerName.trim(),
          businessName: enquiryDraft.businessName.trim(),
          contactNumber: enquiryDraft.contactNumber.trim(),
          email: enquiryDraft.email.trim(),
          serviceRequired: enquiryDraft.serviceRequired.trim(),
          projectDescription: enquiryDraft.projectDescription.trim(),
          budgetRange: enquiryDraft.budgetRange.trim(),
          expectedTimeline: enquiryDraft.expectedTimeline.trim()
        },
        conversationHistory: messages
      });

      setSubmittedReceipt({
        referenceCode: result.referenceCode,
        storage: result.storage,
        serviceRequired: enquiryDraft.serviceRequired.trim(),
        customerName: enquiryDraft.customerName.trim()
      });
      setShowEnquiryForm(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `receipt-${Date.now()}`,
          role: 'assistant',
          content: `Thank you, ${enquiryDraft.customerName.trim()}. Your enquiry for ${enquiryDraft.serviceRequired.trim()} has been saved with reference ${result.referenceCode}. Our UNIKORN360 team will review your scope and follow up promptly. You can also continue directly on WhatsApp below.`,
          timestamp: new Date().toISOString(),
          mode,
          language: detectedLanguage
        }
      ]);
    } catch (err: unknown) {
      if (err instanceof ReceptionistClientError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setEnquirySubmitError(
        err instanceof Error
          ? err.message
          : 'Could not save your enquiry right now. Please try again or contact us on WhatsApp.'
      );
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <>
      {/* FLOATING LAUNCHER & INTRODUCTORY WELCOME TEASER */}
      {widgetState !== 'open' && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-2.5 max-w-[calc(100vw-2rem)]">
          {/* Dismissible introductory welcome message */}
          {widgetState === 'closed' && !teaserDismissed && (
            <div
              role="region"
              aria-label="UNIKORN360 Receptionist greeting"
              className="bg-white border border-[#E4DFD5] rounded-xl shadow-md px-4 py-3 max-w-[290px] text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={handleOpenWidget}
                  className="text-left cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#0B1426] group-hover:underline">
                    UNIKORN360 AI Receptionist
                  </p>
                  <p className="mt-1 text-xs text-[#526176] leading-relaxed">
                    Need help choosing a service, product, or submitting an enquiry? Ask in English, தமிழ், Tanglish, or हिन्दी.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTeaserDismissed(true)}
                  aria-label="Dismiss welcome message"
                  className="p-1 text-[#526176] hover:text-[#0B1426] rounded cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Floating bottom-right chat launcher */}
          <button
            type="button"
            id="unikorn-receptionist-launcher"
            onClick={handleOpenWidget}
            aria-label={
              widgetState === 'minimised'
                ? 'Resume UNIKORN360 AI Receptionist chat'
                : 'Open UNIKORN360 AI Receptionist chat'
            }
            className="inline-flex items-center gap-2.5 bg-[#0B1426] hover:bg-[#1A2844] text-white border border-[#C49A36]/50 rounded-xl px-4 min-h-[48px] shadow-lg transition-transform duration-150 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 text-[#C49A36] shrink-0" />
            <span className="text-sm font-semibold">
              {widgetState === 'minimised' ? 'Resume Chat' : 'Ask UNIKORN360'}
            </span>
          </button>
        </div>
      )}

      {/* RESPONSIVE CONVERSATION WINDOW */}
      {widgetState === 'open' && (
        <aside
          id="unikorn-receptionist-window"
          role="dialog"
          aria-label="UNIKORN360 AI Website Receptionist"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] sm:max-w-[calc(100vw-2rem)] h-full sm:h-[min(680px,calc(100vh-4.5rem))] bg-[#F6F5F1] sm:rounded-xl border-0 sm:border sm:border-[#E4DFD5] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <header className="bg-[#0B1426] text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0 border-b border-[#1A2844]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1A2844] border border-[#C49A36]/60 flex items-center justify-center text-[#C49A36] font-bold text-xs shrink-0">
                U360
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white truncate">
                  UNIKORN360 Receptionist
                </h2>
                <p className="text-[11px] text-slate-300 truncate">
                  English · தமிழ் · Tanglish · हिन्दी
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetConversation}
                aria-label="Reset conversation"
                title="Reset conversation"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleMinimise}
                aria-label="Minimise chat"
                title="Minimise chat"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close chat"
                title="Close chat"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* MODE SWITCH & ENQUIRY FORM TOOLBAR */}
          <div className="bg-white border-b border-[#E4DFD5] px-3.5 py-2 flex items-center justify-between gap-2 shrink-0">
            <div
              role="group"
              aria-label="Response mode"
              className="inline-flex items-center bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg p-0.5"
            >
              <button
                type="button"
                id="receptionist-mode-live"
                onClick={() => handleModeSwitch('live')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'live'
                    ? 'bg-[#0B1426] text-white'
                    : 'text-[#526176] hover:text-[#0B1426]'
                }`}
              >
                Live AI
              </button>
              <button
                type="button"
                id="receptionist-mode-demo"
                onClick={() => handleModeSwitch('demo')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'demo'
                    ? 'bg-[#C49A36] text-[#0B1426] font-semibold'
                    : 'text-[#526176] hover:text-[#0B1426]'
                }`}
              >
                Demo Mode
              </button>
            </div>

            <button
              type="button"
              id="receptionist-toggle-enquiry"
              onClick={() => setShowEnquiryForm((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                showEnquiryForm
                  ? 'bg-[#0B1426] text-white border-[#0B1426]'
                  : 'bg-white text-[#0B1426] border-[#E4DFD5] hover:border-[#0B1426]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>
                {showEnquiryForm
                  ? 'Back to Chat'
                  : capturedFieldCount > 0
                  ? `Enquiry (${capturedFieldCount}/8)`
                  : 'Submit Enquiry'}
              </span>
            </button>
          </div>

          {/* EXPLICIT DEMO MODE NOTICE BANNER */}
          {mode === 'demo' && (
            <div
              role="status"
              className="bg-[#FDF8EA] border-b border-[#E8D59E] px-3.5 py-1.5 text-[11px] text-[#6B4E08] flex items-center justify-between gap-2 shrink-0"
            >
              <span>
                <strong>Demo Mode:</strong> Responses below are simulated previews, not live Gemini AI.
              </span>
              <button
                type="button"
                onClick={() => handleModeSwitch('live')}
                className="font-semibold underline whitespace-nowrap cursor-pointer"
              >
                Use Live AI
              </button>
            </div>
          )}

          {/* BODY AREA: EITHER INLINE ENQUIRY REVIEW FORM OR CONVERSATION STREAM */}
          {showEnquiryForm ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F6F5F1]">
              <form onSubmit={handleEnquirySubmit} noValidate className="bg-white border border-[#E4DFD5] rounded-xl p-4 space-y-3.5">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1426]">
                    Project &amp; Consultation Enquiry
                  </h3>
                  <p className="text-xs text-[#526176] mt-0.5 leading-relaxed">
                    Review or complete your details below. We save your enquiry and conversation summary so our team can respond accurately.
                  </p>
                </div>

                {enquirySubmitError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{enquirySubmitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rec-customer-name" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Customer Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="rec-customer-name"
                      type="text"
                      value={enquiryDraft.customerName}
                      onChange={(e) => handleEnquiryFieldChange('customerName', e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/60 focus:border-[#0B1426]"
                    />
                    {fieldErrors.customerName && (
                      <p className="mt-1 text-[11px] text-red-700">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="rec-business-name" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Business Name
                    </label>
                    <input
                      id="rec-business-name"
                      type="text"
                      value={enquiryDraft.businessName}
                      onChange={(e) => handleEnquiryFieldChange('businessName', e.target.value)}
                      placeholder="Company or organisation"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/60 focus:border-[#0B1426]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rec-contact-number" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Contact Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="rec-contact-number"
                      type="tel"
                      value={enquiryDraft.contactNumber}
                      onChange={(e) => handleEnquiryFieldChange('contactNumber', e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/60 focus:border-[#0B1426]"
                    />
                    {fieldErrors.contactNumber && (
                      <p className="mt-1 text-[11px] text-red-700">{fieldErrors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="rec-email" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="rec-email"
                      type="email"
                      value={enquiryDraft.email}
                      onChange={(e) => handleEnquiryFieldChange('email', e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/60 focus:border-[#0B1426]"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-red-700">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="rec-service-required" className="block text-xs font-semibold text-[#0B1426] mb-1">
                    Service Required <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="rec-service-required"
                    value={
                      RECEPTIONIST_SERVICE_OPTIONS.includes(enquiryDraft.serviceRequired)
                        ? enquiryDraft.serviceRequired
                        : enquiryDraft.serviceRequired
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        handleEnquiryFieldChange('serviceRequired', e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] focus:border-[#0B1426]"
                  >
                    <option value="">Select a service or product...</option>
                    {RECEPTIONIST_SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {enquiryDraft.serviceRequired &&
                      !RECEPTIONIST_SERVICE_OPTIONS.includes(enquiryDraft.serviceRequired) && (
                        <option value="__custom__">{enquiryDraft.serviceRequired}</option>
                      )}
                  </select>
                  {fieldErrors.serviceRequired && (
                    <p className="mt-1 text-[11px] text-red-700">{fieldErrors.serviceRequired}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rec-project-desc" className="block text-xs font-semibold text-[#0B1426] mb-1">
                    Project Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="rec-project-desc"
                    rows={3}
                    value={enquiryDraft.projectDescription}
                    onChange={(e) => handleEnquiryFieldChange('projectDescription', e.target.value)}
                    placeholder="Briefly describe what you want to build, automate, or review..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/60 focus:border-[#0B1426] resize-none"
                  />
                  {fieldErrors.projectDescription && (
                    <p className="mt-1 text-[11px] text-red-700">{fieldErrors.projectDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rec-budget" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Budget Range
                    </label>
                    <select
                      id="rec-budget"
                      value={enquiryDraft.budgetRange}
                      onChange={(e) => handleEnquiryFieldChange('budgetRange', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] focus:border-[#0B1426]"
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_RANGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rec-timeline" className="block text-xs font-semibold text-[#0B1426] mb-1">
                      Expected Timeline
                    </label>
                    <select
                      id="rec-timeline"
                      value={enquiryDraft.expectedTimeline}
                      onChange={(e) => handleEnquiryFieldChange('expectedTimeline', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] focus:border-[#0B1426]"
                    >
                      <option value="">Select timeline</option>
                      {TIMELINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryForm(false)}
                    className="px-3 py-2 text-xs font-semibold text-[#526176] hover:text-[#0B1426] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="receptionist-submit-enquiry-btn"
                    disabled={isSubmittingEnquiry}
                    className="px-4 py-2.5 bg-[#0B1426] hover:bg-[#1A2844] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {isSubmittingEnquiry ? 'Saving Enquiry...' : 'Submit Enquiry'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3">
              {/* COLLAPSIBLE 10 QUICK ACTIONS */}
              <div className="bg-white border border-[#E4DFD5] rounded-xl p-3">
                <button
                  type="button"
                  onClick={() => setShowQuickActions((prev) => !prev)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#0B1426] cursor-pointer"
                >
                  <span>Quick Topics (10 Actions)</span>
                  {showQuickActions ? (
                    <ChevronUp className="w-4 h-4 text-[#526176]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#526176]" />
                  )}
                </button>

                {showQuickActions && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {RECEPTIONIST_QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        data-quick-action={action.id}
                        onClick={() => handleQuickAction(action)}
                        disabled={isSending}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                          action.isHumanHandover
                            ? 'bg-[#0B1426] text-white border-[#0B1426] hover:bg-[#1A2844]'
                            : 'bg-[#F6F5F1] text-[#0B1426] border-[#E4DFD5] hover:border-[#0B1426] hover:bg-white'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MESSAGES */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-[#0B1426] text-white'
                          : 'bg-white border border-[#E4DFD5] text-[#263449]'
                      }`}
                    >
                      {msg.content}

                      {/* Clickable approved UNIKORN360 recommendations & inline enquiry action */}
                      {!isUser &&
                        ((msg.recommendedLinks && msg.recommendedLinks.length > 0) ||
                          (msg.suggestEnquiryForm && !submittedReceipt)) && (
                          <div className="mt-2.5 pt-2 border-t border-[#E4DFD5] flex flex-wrap gap-1.5">
                            {msg.recommendedLinks?.map((link) => (
                              <button
                                key={link.path}
                                type="button"
                                onClick={() => {
                                  onNavigate(link.path);
                                  setWidgetState('minimised');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0B1426] bg-[#F6F5F1] hover:bg-[#EFECE5] border border-[#E4DFD5] rounded-lg transition-colors cursor-pointer"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
                              </button>
                            ))}
                            {msg.suggestEnquiryForm && !submittedReceipt && (
                              <button
                                type="button"
                                onClick={() => setShowEnquiryForm(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0B1426] hover:bg-[#1A2844] rounded-lg transition-colors cursor-pointer"
                              >
                                <ClipboardList className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
                                <span>Review &amp; Submit Enquiry</span>
                              </button>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Clean unboxed metadata distinguishing Live AI vs Simulated Demo */}
                    <div className="mt-1 px-1 flex items-center gap-1.5 text-[11px] text-[#526176] tabular-nums">
                      {!isUser && (
                        <>
                          <span className={msg.mode === 'demo' ? 'text-[#8A6510] font-medium' : ''}>
                            {msg.mode === 'demo' ? 'Demo Mode (Simulated)' : 'Live AI'}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}

              {/* TYPING INDICATOR */}
              {isSending && (
                <div className="flex items-start">
                  <div className="bg-white border border-[#E4DFD5] rounded-xl px-3.5 py-2.5 text-xs text-[#526176]">
                    {mode === 'demo' ? 'Preparing Demo Mode response...' : 'UNIKORN360 Receptionist is typing...'}
                  </div>
                </div>
              )}

              {/* HONEST LIVE API ERROR CARD WITH RETRY */}
              {chatError && (
                <div
                  role="alert"
                  className="bg-white border border-red-200 rounded-xl p-3.5 text-xs text-[#263449] space-y-2.5"
                >
                  <div className="flex items-start gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{chatError.message}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {chatError.retryText && (
                      <button
                        type="button"
                        onClick={() => sendMessageText(chatError.retryText!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0B1426] text-white font-semibold rounded-lg cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                    {mode === 'live' && chatError.retryText && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('demo');
                          sendMessageText(chatError.retryText!, { overrideMode: 'demo' });
                        }}
                        className="px-2.5 py-1.5 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] font-semibold rounded-lg hover:border-[#0B1426] cursor-pointer"
                      >
                        Preview in Demo Mode
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SUBMISSION RECEIPT CARD */}
              {submittedReceipt && (
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Enquiry Saved · Ref {submittedReceipt.referenceCode}</span>
                  </div>
                  <p className="text-xs text-[#526176] leading-relaxed">
                    Recorded for <strong>{submittedReceipt.customerName}</strong> ({submittedReceipt.serviceRequired}). Need an immediate reply? Continue directly on WhatsApp below.
                  </p>
                </div>
              )}

              {/* HUMAN HANDOVER WHATSAPP CARD */}
              {showHandoverCard && (
                <div className="bg-white border border-[#E4DFD5] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B1426]">
                      Direct WhatsApp Handover · {RECEPTIONIST_WHATSAPP_DISPLAY}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHandoverCard(false)}
                      aria-label="Hide WhatsApp card"
                      className="text-[#526176] hover:text-[#0B1426] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#526176] bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg p-2.5">
                    {whatsAppMessage}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={contextualWhatsAppHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0B1426] hover:bg-[#1A2844] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#C49A36]" />
                      <span>Open WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyWhatsAppMessage}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E4DFD5] hover:border-[#0B1426] text-[#0B1426] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedWhatsAppMsg ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* PROMINENT HUMAN HANDOVER BAR + MESSAGE COMPOSER */}
          <footer className="bg-white border-t border-[#E4DFD5] px-3.5 py-2.5 space-y-2 shrink-0">
            <a
              id="receptionist-talk-to-unikorn360"
              href={defaultWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#F6F5F1] hover:bg-[#EFECE5] border border-[#C49A36]/60 text-[#0B1426] text-xs font-semibold rounded-lg transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
              <span>Talk to UNIKORN360 on WhatsApp ({RECEPTIONIST_WHATSAPP_DISPLAY})</span>
            </a>

            {!showEnquiryForm && (
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  id="receptionist-chat-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  maxLength={1500}
                  placeholder="Ask in English, தமிழ், Tanglish, or हिन्दी..."
                  aria-label="Type your message to UNIKORN360"
                  className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-[#0B1426] placeholder:text-[#526176]/75 focus:bg-white focus:border-[#0B1426]"
                />
                <button
                  type="submit"
                  id="receptionist-send-btn"
                  disabled={isSending || !inputValue.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 shrink-0 rounded-lg bg-[#0B1426] hover:bg-[#1A2844] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </footer>
        </aside>
      )}
    </>
  );
};
