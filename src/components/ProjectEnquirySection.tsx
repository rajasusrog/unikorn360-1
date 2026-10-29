import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';

export const ProjectEnquirySection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [requirement, setRequirement] = useState('Business Intelligence & Dashboards');
  const [notes, setNotes] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsAppInitiated, setWhatsAppInitiated] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to discuss a project from the website:
• Name: ${name.trim()}
• Phone: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}${businessName.trim() ? `• Business Name: ${businessName.trim()}\n` : ''}• Requirement / Service: ${requirement}
${notes.trim() ? `• Project Details: ${notes.trim()}\n` : ''}
Please let me know a suitable time to connect.`;
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
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setIsPreparing(false);
      setWhatsAppInitiated(true);
    }, 1200);
  };

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5]" id="project-enquiry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left 5 Cols: Context & Direct Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block mb-2">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#30363D] tracking-tight">
                Discuss Your Project
              </h2>
              <p className="mt-3 text-sm text-[#505B66] leading-relaxed">
                Whether you need a custom web application, real-time reporting dashboards, workflow automation, or statutory licensing support—we're here to help.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="p-5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg space-y-4 text-xs text-[#505B66]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#D8DEE5] rounded text-[#214E78] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#30363D] block text-sm">Direct Phone &amp; WhatsApp</strong>
                  <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#214E78] hover:underline font-bold text-sm">
                    {BUSINESS_INFO.phone}
                  </a>
                  <p className="text-[11px] text-[#505B66]">Founder: {BUSINESS_INFO.founder}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#D8DEE5] rounded text-[#214E78] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#30363D] block text-sm">Email Inquiry</strong>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#214E78] hover:underline">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#D8DEE5] rounded text-[#214E78] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#30363D] block text-sm">Registered Office</strong>
                  <p className="text-[#505B66] leading-relaxed">
                    {BUSINESS_INFO.address.full}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8DEE5] text-[11px] text-[#30363D] font-mono">
                GSTIN: <strong>{BUSINESS_INFO.gstin}</strong>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#D8DEE5] rounded-lg text-xs space-y-1.5">
              <strong className="text-[#30363D] font-bold block">
                Pre-Scoped Written Quotation Terms:
              </strong>
              <p className="text-[#505B66]">
                Every project is preceded by a clear scope of work and quotation before work commences. Zero surprise bills.
              </p>
            </div>
          </div>

          {/* Right 7 Cols: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl shadow-xs">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-[#30363D]">
                  Quick Project Inquiry
                </h3>
                <p className="text-xs text-[#505B66] mt-0.5">
                  Prepare your message for WhatsApp or direct phone consultation.
                </p>
              </div>

              {whatsAppInitiated && (
                <div className="mb-5 p-4 bg-[#E9EDF0] border-l-4 border-[#214E78] rounded-r text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#30363D] font-bold">
                    <MessageSquare className="w-4 h-4 text-[#214E78]" />
                    <span>WhatsApp message window opened</span>
                  </div>
                  <p className="text-[#505B66] leading-relaxed">
                    Please remember to press <strong>Send</strong> inside your WhatsApp app to deliver your message to Founder S. Rajkumar ({BUSINESS_INFO.phone}).
                  </p>
                  <p className="text-[11px] text-[#505B66]">
                    Your form inputs remain saved below.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleContinueToWhatsApp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S. Rajendran"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
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
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                      Business / Enterprise Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Star Engineering & Manufacturing"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. info@yourdomain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                    Primary Service Category
                  </label>
                  <select
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
                  >
                    <option value="Business Intelligence & Dashboards">Business Intelligence &amp; Dashboards</option>
                    <option value="Websites & Custom Software">Websites &amp; Custom Software</option>
                    <option value="Cybersecurity & Audit">Cybersecurity &amp; Audit</option>
                    <option value="Performance Marketing & Growth">Performance Marketing &amp; Growth</option>
                    <option value="Creator Campaigns & Influence">Creator Campaigns &amp; Influence</option>
                    <option value="AI & Workflow Automation">AI &amp; Workflow Automation</option>
                    <option value="Business Operations & Support">Business Operations &amp; Support</option>
                    <option value="Strategic & Executive Consulting">Strategic &amp; Executive Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#30363D] block mb-1">
                    Brief Notes on Your Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your current system or what you want built (e.g. CCTV business website, quotation tool, sales dashboard, GST filing, bank DPR)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78]"
                  />
                </div>

                <div className="pt-2">
                  <WhatsAppSubmitButton
                    isPreparing={isPreparing}
                    label={whatsAppInitiated ? "Re-open in WhatsApp" : "Continue to WhatsApp"}
                    subtext="Directly addresses Founder S. Rajkumar (+91 98848 24360). You will review and send the message inside WhatsApp."
                  />
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
