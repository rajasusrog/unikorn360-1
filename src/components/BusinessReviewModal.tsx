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
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ReviewRequestForm } from '../types';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';

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
  const [formData, setFormData] = useState<ReviewRequestForm>({
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    businessType: 'Manufacturing / Industrial',
    location: '',
    primaryNeed: initialNeed || 'Intelligent Systems & Technology Review',
    currentSituation: 'Existing & Operational',
    existingRegistrations: ['GST'],
    urgency: 'regular',
    meetingMode: 'virtual',
    notes: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [whatsAppInitiated, setWhatsAppInitiated] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

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

  const handleContinueToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(message)}`;

    setIsPreparing(true);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setIsPreparing(false);
      setWhatsAppInitiated(true);
    }, 1200);
  };

  const handleClose = () => {
    setErrorMessage('');
    setWhatsAppInitiated(false);
    setIsPreparing(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-[#D8DEE5] rounded-lg p-6 sm:p-8 shadow-2xl my-8 text-[#505B66]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close review modal"
          className="absolute top-5 right-5 p-2 rounded-md bg-[#F5F6F7] text-[#505B66] hover:text-[#30363D] hover:bg-[#E9EDF0] border border-[#D8DEE5] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E9EDF0] text-[#214E78] text-[10px] font-bold uppercase tracking-[0.15em] rounded mb-2">
            <span>Initial Project Discussion</span>
            <span>•</span>
            <span>No Cost</span>
          </div>
          <h3 id="review-modal-title" className="text-2xl sm:text-3xl font-semibold text-[#30363D]">
            Discuss Your Project with Unikorn360
          </h3>
          <p className="text-xs text-[#505B66] mt-1.5 leading-relaxed">
            Share what you need to build or streamline. We evaluate your requirements, outline viable technical architectures, and provide a pre-scoped proposal.
          </p>
        </div>

        {/* Notice banner if WhatsApp opened */}
        {whatsAppInitiated && (
          <div className="mb-6 p-4 bg-[#E9EDF0] border-l-4 border-[#214E78] rounded-r text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#30363D] font-bold">
              <MessageSquare className="w-4 h-4 text-[#214E78]" />
              <span>WhatsApp message prepared</span>
            </div>
            <p className="text-[#505B66] leading-relaxed">
              A new tab has opened with your inquiry formatted for Founder S. Rajkumar ({BUSINESS_INFO.phone}). 
              <strong> You must click "Send" inside WhatsApp</strong> to deliver the message.
            </p>
            <p className="text-[11px] text-[#505B66]">
              Your information remains saved below. You may modify your details and click "Continue to WhatsApp" again if needed.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleContinueToWhatsApp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. S. Rajendran"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Phone / WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98848 24360"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Business / Enterprise
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Industries"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                City / Region <span className="text-[#505B66]/60 text-[10px] font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chennai, Bengaluru"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Primary Project Requirement
              </label>
              <select
                value={formData.primaryNeed}
                onChange={(e) => setFormData({ ...formData, primaryNeed: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
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
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Preferred Discussion Format
              </label>
              <select
                value={formData.meetingMode}
                onChange={(e) => setFormData({ ...formData, meetingMode: e.target.value as any })}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
              >
                <option value="virtual">Online / Video Call (Google Meet)</option>
                <option value="phone">Direct Phone Call / WhatsApp Audio</option>
                <option value="office">In-Person (Registered Office: Vaniyambadi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
              Project Context / Specific Questions
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about your current challenges, systems in use, or what you want built..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78]"
            />
          </div>

          <div className="pt-2">
            <WhatsAppSubmitButton
              isPreparing={isPreparing}
              label={whatsAppInitiated ? "Re-open in WhatsApp" : "Continue to WhatsApp"}
              subtext="Opens WhatsApp directly addressed to Founder S. Rajkumar (+91 98848 24360)."
            />
          </div>
        </form>

        {/* Direct Contact Footer */}
        <div className="mt-6 pt-4 border-t border-[#D8DEE5] text-xs text-[#505B66] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#214E78]" />
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="hover:text-[#214E78] font-medium">
              Call Desk: {BUSINESS_INFO.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#214E78]" />
            <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-[#214E78] font-medium">
              {BUSINESS_INFO.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
