import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ServiceItem } from '../types';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';

interface QuoteModalProps {
  isOpen: boolean;
  service: ServiceItem | null;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  service,
  onClose
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Manufacturing / Engineering');
  const [urgency, setUrgency] = useState('within-2-weeks');
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsAppInitiated, setWhatsAppInitiated] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  if (!isOpen || !service) return null;

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to request a scoped quotation / discuss a service:
• Service: ${service.title} (${service.id})
• Name: ${name.trim()}
• Phone: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}${businessName.trim() ? `• Business: ${businessName.trim()}\n` : ''}• Business Sector: ${businessType}
• Timeline: ${urgency}
${notes.trim() ? `• Requirements / Notes: ${notes.trim()}\n` : ''}
Please let me know the scope of work and quotation details.`;
  };

  const handleContinueToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(message)}`;
    
    setIsPreparing(true);
    // Open WhatsApp in new tab
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
      aria-labelledby="quote-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#D8DEE5] rounded-lg p-6 sm:p-8 shadow-2xl my-8 text-[#505B66]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close quote modal"
          className="absolute top-5 right-5 p-2 rounded-md bg-[#F5F6F7] text-[#505B66] hover:text-[#30363D] hover:bg-[#E9EDF0] border border-[#D8DEE5] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
            Pre-Scoped Quotation Request
          </span>
          <h3 id="quote-modal-title" className="text-xl sm:text-2xl font-semibold text-[#30363D]">
            {service.title}
          </h3>
          <p className="text-xs text-[#505B66] mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Typical Timeline: <strong className="text-[#30363D]">{service.typicalTimeline}</strong></span>
          </p>
        </div>

        {/* Scope Summary Preview */}
        <div className="mb-6 p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#30363D] mb-2">
            Included in Service Scope:
          </p>
          <div className="space-y-1.5">
            {service.scopeList.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#505B66]">
                <Check className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8DEE5] text-xs text-[#505B66]">
            <strong className="text-[#30363D]">Deliverables: </strong>
            {service.deliverables.join(', ')}
          </div>
        </div>

        {/* Notice banner if WhatsApp opened */}
        {whatsAppInitiated && (
          <div className="mb-6 p-4 bg-[#E9EDF0] border-l-4 border-[#214E78] rounded-r text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#30363D] font-bold">
              <MessageSquare className="w-4 h-4 text-[#214E78]" />
              <span>WhatsApp message window opened</span>
            </div>
            <p className="text-[#505B66] leading-relaxed">
              Please click <strong>Send</strong> inside your WhatsApp app to deliver your message to Founder S. Rajkumar ({BUSINESS_INFO.phone}).
            </p>
            <p className="text-[11px] text-[#505B66]">
              Your details are preserved in the form below. If WhatsApp did not open automatically, you can click "Continue to WhatsApp" again or contact us directly.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quotation Form */}
        <form onSubmit={handleContinueToWhatsApp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. S. Suresh / K. Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98848 24360"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Business / Enterprise Name
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Engineering Works"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. contact@yourfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Industry Sector
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
              >
                <option value="Manufacturing / Engineering">Manufacturing / Engineering</option>
                <option value="Trading / Wholesale / Distribution">Trading / Wholesale / Distribution</option>
                <option value="Leather / Tannery / Footwear">Leather / Tannery / Footwear</option>
                <option value="CCTV / Security / Technical Services">CCTV / Security / Technical Services</option>
                <option value="Food & Agro Processing">Food & Agro Processing</option>
                <option value="New Venture / Startup">New Venture / Startup</option>
                <option value="Other Commercial Business">Other Commercial Business</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                Timeline Expectation
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
              >
                <option value="Immediately (Within 3 days)">Immediately (Within 3 days)</option>
                <option value="Within 2 weeks">Within 2 weeks</option>
                <option value="Planning for next month">Planning for next month</option>
                <option value="Exploratory / Information gathering">Exploratory / Information gathering</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
              Project Notes / Specific Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Describe your current setup, volume, or key questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78]"
            />
          </div>

          <div className="pt-2">
            <WhatsAppSubmitButton
              isPreparing={isPreparing}
              label={whatsAppInitiated ? "Re-open in WhatsApp" : "Continue to WhatsApp"}
              subtext="Opens WhatsApp with your pre-filled inquiry. You must hit 'Send' in WhatsApp to deliver the message."
            />
          </div>
        </form>

        {/* Alternative direct contact footer */}
        <div className="mt-6 pt-4 border-t border-[#D8DEE5] text-xs text-[#505B66] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#214E78]" />
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="hover:text-[#214E78] font-medium">
              Direct Desk: {BUSINESS_INFO.phone}
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
