import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import { loadBuyerEnquiryDraft, saveBuyerEnquiryDraft } from '../lib/enquiryDraft';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const initialDraft = loadBuyerEnquiryDraft();
  const [form, setForm] = useState({
    fullName: initialDraft.name || '',
    phone: initialDraft.phone || '',
    email: initialDraft.email || '',
    businessName: initialDraft.businessName || '',
    location: '',
    primaryNeed: 'Business Intelligence & Dashboards',
    meetingMode: 'virtual',
    notes: initialDraft.notes || ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);

  const buildWhatsAppMessage = () => {
    return `Hello Unikorn360,
I would like to discuss a project with the advisory team:
• Name: ${form.fullName.trim()}
• Phone: ${form.phone.trim()}
${form.email.trim() ? `• Email: ${form.email.trim()}\n` : ''}${form.businessName.trim() ? `• Business Name: ${form.businessName.trim()}\n` : ''}${form.location.trim() ? `• Location: ${form.location.trim()}\n` : ''}• Primary Interest: ${form.primaryNeed}
• Preferred Mode: ${form.meetingMode === 'office' ? 'In-Person (Registered Office: Vaniyambadi)' : form.meetingMode === 'phone' ? 'Phone Call' : 'Online / Video Call'}
${form.notes.trim() ? `• Requirements / Notes: ${form.notes.trim()}\n` : ''}
Please let me know how we can connect.`;
  };

  const handlePrepareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    saveBuyerEnquiryDraft({
      name: form.fullName,
      phone: form.phone,
      email: form.email,
      businessName: form.businessName,
      notes: form.notes
    });

    if (!form.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const digitsOnly = form.phone.replace(/\D/g, '');
    if (!form.phone.trim() || digitsOnly.length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }

    setPreparedMessage(buildWhatsAppMessage());
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Unikorn360 Business Intelligence',
    description: 'Contact Unikorn360. Discuss custom websites, software, AI automation, cybersecurity, and business intelligence.',
    url: 'https://www.unikorn360.com/contact',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Unikorn360 Business Intelligence',
      founder: {
        '@type': 'Person',
        name: 'S. Rajkumar'
      },
      taxID: BUSINESS_INFO.gstin,
      telephone: '+919884824360',
      email: 'contact.unikorn360@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1st Floor, Shop No. 3, VK Complex, P.J.N. Road, Kamarajapuram',
        addressLocality: 'Vaniyambadi',
        addressRegion: 'Tamil Nadu',
        postalCode: '635751',
        addressCountry: 'IN'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:30',
          closes: '19:00'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#263449]">
      <SEOHead
        title="Contact Unikorn360 | Business Intelligence & Technology Advisory"
        description="Connect with Unikorn360. Phone/WhatsApp: +91 98848 24360. Email: contact.unikorn360@gmail.com. Online consultations and registered office visits available."
        canonicalPath="/contact"
        schema={schema}
      />

      <Breadcrumbs
        items={[{ label: 'Contact Us' }]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="py-12 lg:py-16 border-b border-[#E4DFD5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
              Business &amp; Technology Advisory Desk
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1426] tracking-tight">
              Let’s Discuss Your Business &amp; Systems
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#526176] leading-relaxed">
              First assessment meetings are free. Share your requirements or software needs and we will provide an objective review and pre-scoped written quotation.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left 5 Cols: Founder Business Card & Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            {/* Standalone Dark-Gold Founder Contact Card */}
            <figure className="bg-white border border-[#E4DFD5] rounded-xl p-3 shadow-xs">
              <div className="rounded-lg overflow-hidden bg-[#080A0E]">
                <img
                  src="/assets/brand/unikorn360-founder-card-v1.jpg"
                  alt="UNIKORN360 Business Card — S. Rajkumar, Founder & CEO, +91 98848 24360, Vaniyambadi"
                  className="w-full h-auto object-contain"
                />
              </div>
              <figcaption className="mt-2.5 px-1 text-xs text-[#526176] flex items-center justify-between">
                <span>Founder contact card · {BUSINESS_INFO.founder}</span>
                <span className="font-medium text-[#0B1426]">GSTIN: {BUSINESS_INFO.gstin}</span>
              </figcaption>
            </figure>

            <div className="p-6 sm:p-8 bg-white border border-[#E4DFD5] rounded-xl shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-[#0B1426] border-b border-[#E4DFD5] pb-3">
                Office &amp; Contact Details
              </h2>

              <div className="space-y-4 text-xs text-[#263449]">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#0B1426] block text-sm mb-0.5">Registered Office</strong>
                    <p className="text-[#526176] leading-relaxed">
                      {BUSINESS_INFO.brand}<br />
                      {BUSINESS_INFO.address.line1}<br />
                      {BUSINESS_INFO.address.line2}<br />
                      {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.district}<br />
                      {BUSINESS_INFO.address.state} – {BUSINESS_INFO.address.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#0B1426] block text-sm mb-0.5">Phone &amp; WhatsApp</strong>
                    <p>
                      <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline font-semibold text-sm">
                        {BUSINESS_INFO.phone}
                      </a>
                    </p>
                    <p className="text-xs text-[#526176] mt-0.5">
                      Founder: {BUSINESS_INFO.founder}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#0B1426] block text-sm mb-0.5">Official Email</strong>
                    <p>
                      <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline">
                        {BUSINESS_INFO.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] rounded-lg shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#0B1426] block text-sm mb-0.5">Advisory Desk Hours</strong>
                    <p className="text-[#526176]">
                      Monday – Saturday: 9:30 AM – 7:00 PM<br />
                      Sunday: By prior appointment
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${BUSINESS_INFO.phoneRaw}`}
                  className="w-full py-3 px-4 bg-[#0B1426] hover:bg-[#172744] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {BUSINESS_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-white border border-[#E4DFD5] rounded-xl shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
                  Direct Project Inquiry
                </span>
                <h2 className="text-2xl font-bold text-[#0B1426]">
                  Tell Us What You’d Like to Build
                </h2>
                <p className="text-xs text-[#526176] mt-1">
                  Fill in your details below to prepare a formatted inquiry for WhatsApp or direct follow-up.
                </p>
              </div>

              {preparedMessage ? (
                <WhatsAppMessagePreview
                  message={preparedMessage}
                  serviceLabel={form.primaryNeed}
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
                        value={form.fullName}
                        onChange={(e) => {
                          setForm({ ...form, fullName: e.target.value });
                          saveBuyerEnquiryDraft({ name: e.target.value });
                        }}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
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
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value });
                          saveBuyerEnquiryDraft({ phone: e.target.value });
                        }}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                        Business / Firm Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Star Enterprises"
                        value={form.businessName}
                        onChange={(e) => {
                          setForm({ ...form, businessName: e.target.value });
                          saveBuyerEnquiryDraft({ businessName: e.target.value });
                        }}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. info@business.com"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          saveBuyerEnquiryDraft({ email: e.target.value });
                        }}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                        City / Region
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai, Bengaluru"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                        Primary Service Category
                      </label>
                      <select
                        value={form.primaryNeed}
                        onChange={(e) => setForm({ ...form, primaryNeed: e.target.value })}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:bg-white focus:outline-none focus:border-[#0B1426]"
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
                        Preferred Discussion Mode
                      </label>
                      <select
                        value={form.meetingMode}
                        onChange={(e) => setForm({ ...form, meetingMode: e.target.value })}
                        className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] focus:bg-white focus:outline-none focus:border-[#0B1426]"
                      >
                        <option value="virtual">Online / Video Call (Google Meet)</option>
                        <option value="phone">Direct Phone Call / WhatsApp Audio</option>
                        <option value="office">In-Person (Registered Office: Vaniyambadi)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#0B1426] block mb-1">
                      Your Requirements &amp; Current Setup
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you want to build or fix..."
                      value={form.notes}
                      onChange={(e) => {
                        setForm({ ...form, notes: e.target.value });
                        saveBuyerEnquiryDraft({ notes: e.target.value });
                      }}
                      className="w-full p-2.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426] placeholder-[#526176]/60 focus:bg-white focus:outline-none focus:border-[#0B1426]"
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
      </main>
    </div>
  );
};
