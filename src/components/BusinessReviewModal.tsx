import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import { ReviewRequestForm } from '../types';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import { loadBuyerEnquiryDraft, saveBuyerEnquiryDraft } from '../lib/enquiryDraft';

interface BusinessReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNeed?: string;
}

export const BusinessReviewModal: React.FC<BusinessReviewModalProps> = ({
  isOpen,
  onClose,
  initialNeed = ''
}) => {
  const initialDraft = loadBuyerEnquiryDraft();
  const [formData, setFormData] = useState<ReviewRequestForm>({
    fullName: initialDraft.name || '',
    phone: initialDraft.phone || '',
    email: initialDraft.email || '',
    businessName: initialDraft.businessName || '',
    businessType: 'Manufacturing / Industrial',
    location: '',
    primaryNeed: initialNeed || 'Intelligent Systems & Technology Review',
    currentSituation: 'Existing & Operational',
    existingRegistrations: ['GST'],
    urgency: 'regular',
    meetingMode: 'virtual',
    notes: initialDraft.notes || ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialNeed) {
      setFormData(prev => ({ ...prev, primaryNeed: initialNeed }));
    }
  }, [initialNeed]);

  if (!isOpen) return null;

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to discuss a project / schedule an assessment consultation:
• Name: ${formData.fullName.trim()}
• Phone: ${formData.phone.trim()}
${formData.email.trim() ? `• Email: ${formData.email.trim()}\n` : ''}${formData.businessName.trim() ? `• Business Name: ${formData.businessName.trim()}\n` : ''}${formData.location.trim() ? `• Location: ${formData.location.trim()}\n` : ''}• Business Sector: ${formData.businessType}
• Topic / Requirement: ${formData.primaryNeed}
• Preferred Mode: ${formData.meetingMode === 'office' ? 'In-Person (Registered Office: Vaniyambadi)' : formData.meetingMode === 'phone' ? 'Phone Call' : 'Online / Video Call'}
• Current Setup: ${formData.currentSituation}
${formData.notes.trim() ? `• Notes: ${formData.notes.trim()}\n` : ''}
Please let me know a suitable time to discuss.`;
  };

  const handlePrepareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    saveBuyerEnquiryDraft({
      name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      businessName: formData.businessName,
      notes: formData.notes
    });

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 8) {
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
      aria-labelledby="review-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-8 shadow-2xl my-8 text-[#263449]">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close review modal"
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F6F5F1] text-[#526176] hover:text-[#0B1426] hover:bg-[#EFECE5] border border-[#E4DFD5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C49A36] mb-1.5">
            <span>Initial Project Discussion</span>
            <span>·</span>
            <span>No Cost</span>
          </div>
          <h3 id="review-modal-title" className="text-2xl sm:text-3xl font-bold text-[#0B1426]">
            Discuss Your Project with Unikorn360
          </h3>
          <p className="text-xs sm:text-sm text-[#526176] mt-1.5 leading-relaxed">
            Share what you need to build or streamline. We evaluate your requirements, outline viable technical architectures, and provide a pre-scoped proposal.
          </p>
        </div>

        {preparedMessage ? (
          <WhatsAppMessagePreview
            message={preparedMessage}
            serviceLabel={formData.primaryNeed}
            onEdit={() => setPreparedMessage(null)}
          />
        ) : (
          <form onSubmit={handlePrepareWhatsApp} className="space-y-4" noValidate>
            {errorMessage && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Rajendran"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    saveBuyerEnquiryDraft({ name: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98848 24360"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    saveBuyerEnquiryDraft({ phone: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Business / Enterprise
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Industries"
                  value={formData.businessName}
                  onChange={(e) => {
                    setFormData({ ...formData, businessName: e.target.value });
                    saveBuyerEnquiryDraft({ businessName: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    saveBuyerEnquiryDraft({ email: e.target.value });
                  }}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  City / Region <span className="text-[#526176] text-[10px] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Bengaluru"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Primary Project Requirement
                </label>
                <select
                  value={formData.primaryNeed}
                  onChange={(e) => setFormData({ ...formData, primaryNeed: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
                >
                  <option value="Business Intelligence & Real-Time Dashboards">Business Intelligence &amp; Dashboards</option>
                  <option value="Custom Website or B2B Portal">Custom Website or B2B Portal</option>
                  <option value="E-Commerce Store & Ordering System">E-Commerce Store &amp; Ordering System</option>
                  <option value="Custom Web Application or Business Software">Custom Web App or Business Software</option>
                  <option value="Process Mapping & Workflow Automation">Process Mapping &amp; AI Automation</option>
                  <option value="Cybersecurity Audit & Hardening">Cybersecurity Audit &amp; Hardening</option>
                  <option value="Performance Marketing & Brand Growth">Performance Marketing &amp; Brand Growth</option>
                  <option value="Business Operations & SOP Consulting">Business Operations &amp; Consulting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                  Preferred Discussion Format
                </label>
                <select
                  value={formData.meetingMode}
                  onChange={(e) => setFormData({ ...formData, meetingMode: e.target.value as any })}
                  className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
                >
                  <option value="virtual">Online / Video Call (Google Meet)</option>
                  <option value="phone">Direct Phone Call / WhatsApp Audio</option>
                  <option value="office">In-Person (Registered Office: Vaniyambadi)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                Project Context / Specific Questions
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about your current challenges, systems in use, or what you want built..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  saveBuyerEnquiryDraft({ notes: e.target.value });
                }}
                className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
              />
            </div>

            <div className="pt-2">
              <WhatsAppSubmitButton
                label="Review WhatsApp Message"
                subtext="Prepares your message for review before opening WhatsApp."
              />
            </div>
          </form>
        )}

        {/* Direct Contact Footer */}
        <div className="mt-6 pt-4 border-t border-[#E4DFD5] text-xs text-[#526176] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#C49A36]" />
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="hover:text-[#0B1426] font-medium">
              Call Desk: {BUSINESS_INFO.phone}
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
