import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import { loadBuyerEnquiryDraft, saveBuyerEnquiryDraft } from '../lib/enquiryDraft';

export const ProjectEnquirySection: React.FC = () => {
  const initialDraft = loadBuyerEnquiryDraft();
  const [name, setName] = useState(() => initialDraft.name || '');
  const [phone, setPhone] = useState(() => initialDraft.phone || '');
  const [email, setEmail] = useState(() => initialDraft.email || '');
  const [businessName, setBusinessName] = useState(() => initialDraft.businessName || '');
  const [requirement, setRequirement] = useState('Business Intelligence & Dashboards');
  const [notes, setNotes] = useState(() => initialDraft.notes || '');

  const [errorMessage, setErrorMessage] = useState('');
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to discuss a project from the website:
• Name: ${name.trim()}
• Phone: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}${businessName.trim() ? `• Business Name: ${businessName.trim()}\n` : ''}• Requirement / Service: ${requirement}
${notes.trim() ? `• Project Details: ${notes.trim()}\n` : ''}
Please let me know a suitable time to connect.`;
  };

  const handlePrepareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    saveBuyerEnquiryDraft({ name, phone, email, businessName, notes });

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

  return (
    <section className="py-16 lg:py-20 bg-white border-b border-[#E4DFD5]" id="project-enquiry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left 5 Cols: Context & Direct Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight">
                Discuss Your Project
              </h2>
              <p className="mt-3 text-sm text-[#263449] leading-relaxed">
                Whether you need a business website, custom quotation or invoicing software, automated follow-ups, or statutory documentation—share what you need and get a written quotation before work starts.
              </p>
            </div>

            <div className="p-5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-xl space-y-4 text-xs text-[#263449]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#0B1426] block text-sm">Direct Phone &amp; WhatsApp</strong>
                  <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline font-semibold text-sm">
                    {BUSINESS_INFO.phone}
                  </a>
                  <p className="text-xs text-[#526176]">Founder: {BUSINESS_INFO.founder}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#0B1426] block text-sm">Email Inquiry</strong>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#E4DFD5] rounded-lg text-[#0B1426] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#0B1426] block text-sm">Registered Office</strong>
                  <p className="text-[#526176] leading-relaxed">
                    {BUSINESS_INFO.address.full}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4DFD5] text-xs text-[#0B1426]">
                GSTIN: <strong>{BUSINESS_INFO.gstin}</strong>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-[#F6F5F1] border border-[#E4DFD5] rounded-xl shadow-xs">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-[#0B1426]">
                  Quick Project Inquiry
                </h3>
                <p className="text-xs text-[#526176] mt-0.5">
                  Prepare your message for WhatsApp or direct phone consultation.
                </p>
              </div>

              {preparedMessage ? (
                <WhatsAppMessagePreview
                  message={preparedMessage}
                  serviceLabel={requirement}
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
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. S. Rajendran"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
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
                      <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                        Business / Enterprise Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Star Engineering & Manufacturing"
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
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
                        placeholder="e.g. info@yourdomain.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          saveBuyerEnquiryDraft({ email: e.target.value });
                        }}
                        className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:outline-none focus:border-[#0B1426]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                      Primary Service Category
                    </label>
                    <select
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
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
                    <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                      Brief Notes on Your Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your current system or what you want built..."
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
                      subtext="Prepares your message for review before opening WhatsApp."
                    />
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
