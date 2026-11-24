import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Users
} from 'lucide-react';
import { ServiceItem } from '../types';
import { ServiceCatalogItem, ServicePackage } from '../types/database';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import { loadBuyerEnquiryDraft, saveBuyerEnquiryDraft } from '../lib/enquiryDraft';

export type QuoteModalTarget =
  | ServiceItem
  | ServiceCatalogItem
  | {
      service: ServiceCatalogItem;
      divisionName?: string;
      selectedPackage?: ServicePackage | null;
    };

interface QuoteModalProps {
  isOpen: boolean;
  service: QuoteModalTarget | null;
  onClose: () => void;
}

function isCatalogItem(obj: any): obj is ServiceCatalogItem {
  return Boolean(obj && typeof obj === 'object' && 'service_name' in obj);
}

function isCatalogWrapper(
  obj: any
): obj is { service: ServiceCatalogItem; divisionName?: string; selectedPackage?: ServicePackage | null } {
  return Boolean(obj && typeof obj === 'object' && 'service' in obj && isCatalogItem(obj.service));
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  service,
  onClose
}) => {
  const initialDraft = loadBuyerEnquiryDraft();
  const [name, setName] = useState(() => initialDraft.name || '');
  const [phone, setPhone] = useState(() => initialDraft.phone || '');
  const [email, setEmail] = useState(() => initialDraft.email || '');
  const [businessName, setBusinessName] = useState(() => initialDraft.businessName || '');
  const [businessType, setBusinessType] = useState('Manufacturing / Engineering');
  const [urgency, setUrgency] = useState('Within 2 weeks');
  const [notes, setNotes] = useState(() => initialDraft.notes || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  // Validation & review state (no timer auto-open)
  const [errorMessage, setErrorMessage] = useState('');
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);

  const normalized = useMemo(() => {
    if (!service) return null;

    if (isCatalogWrapper(service) || isCatalogItem(service)) {
      const cat = isCatalogWrapper(service) ? service.service : service;
      const divisionName = isCatalogWrapper(service) ? service.divisionName : undefined;
      const initialPkg = isCatalogWrapper(service) ? service.selectedPackage : undefined;
      const packages = cat.packages || [];
      return {
        kind: 'catalog' as const,
        slug: cat.slug,
        title: cat.service_name,
        divisionName,
        timeline: 'As per approved scope of work',
        targetAudience: cat.target_customers || [],
        deliverables: cat.deliverables || [],
        packages,
        defaultPackageId:
          initialPkg?.id ||
          packages.find((p) => p.approval_status === 'approved')?.id ||
          packages[0]?.id ||
          ''
      };
    }

    const legacy = service as ServiceItem;
    return {
      kind: 'legacy' as const,
      slug: legacy.id,
      title: legacy.title,
      divisionName: undefined,
      timeline: legacy.typicalTimeline,
      targetAudience: legacy.targetAudience || [],
      deliverables: legacy.deliverables || [],
      scopeList: legacy.scopeList || [],
      packages: [] as ServicePackage[],
      defaultPackageId: ''
    };
  }, [service]);

  useEffect(() => {
    if (!isOpen || !normalized) return;
    setPreparedMessage(null);
    setErrorMessage('');

    const draft = loadBuyerEnquiryDraft();
    if (draft.name !== undefined) setName(draft.name);
    if (draft.phone !== undefined) setPhone(draft.phone);
    if (draft.email !== undefined) setEmail(draft.email);
    if (draft.businessName !== undefined) setBusinessName(draft.businessName);
    if (draft.notes !== undefined) setNotes(draft.notes);

    const savedPkg = draft.selectedPackagesByService?.[normalized.slug];
    const hasSavedPkg =
      savedPkg && normalized.packages.some((p) => p.id === savedPkg);

    setSelectedPackageId(hasSavedPkg ? savedPkg : normalized.defaultPackageId);
  }, [isOpen, normalized]);

  if (!isOpen || !normalized) return null;

  const activePackage: ServicePackage | null =
    normalized.packages.find((p) => p.id === selectedPackageId) ||
    normalized.packages[0] ||
    null;

  const priceDisplay =
    activePackage &&
    activePackage.approval_status === 'approved' &&
    typeof activePackage.price === 'number' &&
    activePackage.price > 0
      ? `₹${activePackage.price.toLocaleString('en-IN')} (${activePackage.billing_period})`
      : 'Request a quote';

  const includedItems = (
    activePackage?.inclusions && activePackage.inclusions.length > 0
      ? activePackage.inclusions
      : normalized.kind === 'legacy'
      ? normalized.scopeList
      : normalized.deliverables
  ).slice(0, 4);

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setPreparedMessage(null);
    saveBuyerEnquiryDraft({
      selectedPackagesByService: {
        [normalized.slug]: pkgId
      }
    });
  };

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to request a scoped quotation / discuss a service:
• Service: ${normalized.title} (${normalized.slug})${normalized.divisionName ? `\n• Division: ${normalized.divisionName}` : ''}
• Selected Option / Package: ${activePackage ? activePackage.name : 'Standard / Custom Scope'}
• Pricing: ${priceDisplay}${includedItems.length > 0 ? `\n• Key Inclusions: ${includedItems.join(', ')}` : ''}
• Name: ${name.trim()}
• Phone: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}${businessName.trim() ? `• Business: ${businessName.trim()}\n` : ''}• Business Sector: ${businessType}
• Timeline: ${urgency}
${notes.trim() ? `• Requirements / Notes: ${notes.trim()}\n` : ''}
Please share the scope of work and quotation details.`;
  };

  const handlePrepareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    saveBuyerEnquiryDraft({
      name,
      phone,
      email,
      businessName,
      notes,
      ...(activePackage ? { selectedPackagesByService: { [normalized.slug]: activePackage.id } } : {})
    });

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone.trim() || digitsOnly.length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }

    setPreparedMessage(buildWhatsAppMessage());
  };

  const handleClose = () => {
    setErrorMessage('');
    setPreparedMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1426]/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-8 shadow-2xl my-8 text-[#263449]">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close quote modal"
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F6F5F1] text-[#526176] hover:text-[#0B1426] hover:bg-[#EFECE5] border border-[#E4DFD5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
            {normalized.divisionName ? `${normalized.divisionName} · Quotation` : 'Pre-Scoped Quotation Request'}
          </span>
          <h3 id="quote-modal-title" className="text-xl sm:text-2xl font-bold text-[#0B1426]">
            {normalized.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#526176]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C49A36]" />
              <span>Timeline: <strong className="text-[#0B1426]">{normalized.timeline}</strong></span>
            </span>
            <span>·</span>
            <span>
              Pricing: <strong className="text-[#0B1426]">{priceDisplay}</strong>
            </span>
          </div>
        </div>

        {/* Who it is for + What's Included + Package selection */}
        <div className="mb-5 p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg space-y-3 text-xs">
          {normalized.targetAudience.length > 0 && (
            <div>
              <p className="font-bold uppercase tracking-wider text-[#0B1426] mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C49A36]" />
                <span>Who This Service Is For</span>
              </p>
              <p className="text-[#263449] leading-relaxed">
                {normalized.targetAudience.slice(0, 4).join(' · ')}
              </p>
            </div>
          )}

          {normalized.packages.length > 0 && (
            <div className={normalized.targetAudience.length > 0 ? 'pt-2.5 border-t border-[#E4DFD5]' : ''}>
              <label htmlFor="quote-modal-package" className="font-bold uppercase tracking-wider text-[#0B1426] block mb-1.5">
                Package / Pricing Option
              </label>
              <select
                id="quote-modal-package"
                value={activePackage?.id || ''}
                onChange={(e) => handleSelectPackage(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
              >
                {normalized.packages.map((p) => {
                  const pPrice =
                    p.approval_status === 'approved' && typeof p.price === 'number' && p.price > 0
                      ? `₹${p.price.toLocaleString('en-IN')} (${p.billing_period})`
                      : 'Request a quote';
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} — {pPrice}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {includedItems.length > 0 && (
            <div className="pt-2.5 border-t border-[#E4DFD5]">
              <p className="font-bold uppercase tracking-wider text-[#0B1426] mb-1.5">
                What’s Included
              </p>
              <div className="space-y-1">
                {includedItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[#263449]">
                    <Check className="w-3.5 h-3.5 text-[#C49A36] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {normalized.deliverables.length > 0 && (
            <div className="pt-2.5 border-t border-[#E4DFD5] text-[#526176]">
              <strong className="text-[#0B1426]">Deliverables: </strong>
              {normalized.deliverables.join(', ')}
            </div>
          )}
        </div>

        {preparedMessage ? (
          <WhatsAppMessagePreview
            message={preparedMessage}
            serviceLabel={normalized.title}
            packageLabel={activePackage?.name || 'Standard / Custom Scope'}
            priceLabel={priceDisplay}
            onEdit={() => setPreparedMessage(null)}
          />
        ) : (
          <form onSubmit={handlePrepareWhatsApp} className="space-y-4" noValidate>
            {errorMessage && (
              <div
                role="alert"
                data-testid="quote-modal-error"
                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-modal-name" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="quote-modal-name"
                  type="text"
                  required
                  placeholder="e.g. S. Suresh / K. Ahmed"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    saveBuyerEnquiryDraft({ name: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>

              <div>
                <label htmlFor="quote-modal-phone" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="quote-modal-phone"
                  type="tel"
                  required
                  placeholder="+91 98848 24360"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    saveBuyerEnquiryDraft({ phone: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-modal-business" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Business / Enterprise Name
                </label>
                <input
                  id="quote-modal-business"
                  type="text"
                  placeholder="e.g. Apex Engineering Works"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    saveBuyerEnquiryDraft({ businessName: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>

              <div>
                <label htmlFor="quote-modal-email" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Email Address
                </label>
                <input
                  id="quote-modal-email"
                  type="email"
                  placeholder="e.g. contact@yourfirm.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    saveBuyerEnquiryDraft({ email: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-modal-sector" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Industry Sector
                </label>
                <select
                  id="quote-modal-sector"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
                >
                  <option value="Manufacturing / Engineering">Manufacturing / Engineering</option>
                  <option value="Trading / Wholesale / Distribution">Trading / Wholesale / Distribution</option>
                  <option value="Leather / Tannery / Footwear">Leather / Tannery / Footwear</option>
                  <option value="CCTV / Security / Technical Services">CCTV / Security / Technical Services</option>
                  <option value="Food & Agro Processing">Food &amp; Agro Processing</option>
                  <option value="New Venture / Startup">New Venture / Startup</option>
                  <option value="Other Commercial Business">Other Commercial Business</option>
                </select>
              </div>

              <div>
                <label htmlFor="quote-modal-urgency" className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Timeline Expectation
                </label>
                <select
                  id="quote-modal-urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
                >
                  <option value="Immediately (Within 3 days)">Immediately (Within 3 days)</option>
                  <option value="Within 2 weeks">Within 2 weeks</option>
                  <option value="Planning for next month">Planning for next month</option>
                  <option value="Exploratory / Information gathering">Exploratory / Information gathering</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="quote-modal-notes" className="text-xs font-semibold text-[#0B1426] block mb-1">
                Project Notes / Specific Requirements
              </label>
              <textarea
                id="quote-modal-notes"
                rows={3}
                placeholder="Describe your current setup, volume, or key questions..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  saveBuyerEnquiryDraft({ notes: e.target.value });
                }}
                className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
              />
            </div>

            <div className="pt-2">
              <WhatsAppSubmitButton
                label="Review WhatsApp Message"
                subtext="Prepares your message for review before you open WhatsApp."
              />
            </div>
          </form>
        )}

        {/* Alternative direct contact footer */}
        <div className="mt-6 pt-4 border-t border-[#E4DFD5] text-xs text-[#526176] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#C49A36]" />
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="hover:text-[#0B1426] font-medium">
              Direct Desk: {BUSINESS_INFO.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#C49A36]" />
            <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-[#0B1426] font-medium">
              {BUSINESS_INFO.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
