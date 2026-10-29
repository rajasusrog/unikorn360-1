import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { BUSINESS_INFO } from '../data/servicesData';
import { WhatsAppSubmitButton } from './WhatsAppSubmitButton';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    location: '',
    primaryNeed: 'Business Intelligence & Dashboards',
    meetingMode: 'virtual',
    notes: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [whatsAppInitiated, setWhatsAppInitiated] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

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

  const handleContinueToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!form.phone.trim() || form.phone.trim().length < 8) {
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
      taxID: '33ANBPR6486P1CJ',
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
    <div className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-12 sm:pt-16">
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
      <header className="py-12 lg:py-16 border-b border-[#D8DEE5] bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block mb-2">
              Business &amp; Technology Advisory Desk
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#30363D] tracking-tight">
              Let’s Discuss Your Business &amp; Systems
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#505B66] leading-relaxed">
              First assessment meetings cost nothing. Share your operational challenges, software needs, or growth plans—we’ll provide an objective appraisal and a clear technical scope. Remote consultations available.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left 5 Cols: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 bg-white border border-[#D8DEE5] rounded-lg shadow-sm space-y-6">
              <h2 className="text-xl font-semibold text-[#30363D] border-b border-[#D8DEE5] pb-3">
                Office &amp; Contact Details
              </h2>

              <div className="space-y-4 text-xs text-[#505B66]">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#30363D] block text-sm mb-0.5">Registered Office</strong>
                    <p className="text-[#505B66] leading-relaxed">
                      {BUSINESS_INFO.brand}<br />
                      {BUSINESS_INFO.address.line1}<br />
                      {BUSINESS_INFO.address.line2}<br />
                      {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.district}<br />
                      {BUSINESS_INFO.address.state} – {BUSINESS_INFO.address.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#30363D] block text-sm mb-0.5">Phone &amp; WhatsApp</strong>
                    <p className="text-[#505B66]">
                      <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#214E78] hover:underline font-semibold text-sm">
                        {BUSINESS_INFO.phone}
                      </a>
                    </p>
                    <p className="text-[11px] text-[#505B66] mt-0.5">
                      Founder: {BUSINESS_INFO.founder}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#30363D] block text-sm mb-0.5">Official Email</strong>
                    <p>
                      <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#214E78] hover:underline">
                        {BUSINESS_INFO.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#30363D] block text-sm mb-0.5">Advisory Desk Hours</strong>
                    <p className="text-[#505B66]">
                      Monday – Saturday: 9:30 AM – 7:00 PM<br />
                      Sunday: By prior appointment
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory details box */}
              <div className="p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded space-y-1.5 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block">
                  Tax Registration
                </span>
                <p className="text-[#30363D] font-mono">
                  GSTIN: <strong>{BUSINESS_INFO.gstin}</strong>
                </p>
                <p className="text-[11px] text-[#505B66]">
                  Registered MSME Business Intelligence &amp; Technology Advisory Service.
                </p>
              </div>

              {/* Direct call action */}
              <div className="pt-2">
                <a
                  href={`tel:${BUSINESS_INFO.phoneRaw}`}
                  className="w-full py-3 px-4 bg-white border border-[#214E78] text-[#214E78] hover:bg-[#214E78] hover:text-white rounded text-xs font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {BUSINESS_INFO.phone}</span>
                </a>
              </div>
            </div>

            {/* Coverage note */}
            <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg text-xs space-y-2">
              <h3 className="font-bold text-[#30363D] uppercase tracking-wider text-[11px]">
                Consultations &amp; Delivery
              </h3>
              <p className="text-[#505B66] leading-relaxed">
                We work with businesses, founders, teams and creators across India through structured remote consultations and digital delivery. In-person meetings are hosted at our registered office in Vaniyambadi, Tamil Nadu.
              </p>
            </div>
          </div>

          {/* Right 7 Cols: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-white border border-[#D8DEE5] rounded-lg shadow-sm">
              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Direct Project Inquiry
                </span>
                <h2 className="text-2xl font-semibold text-[#30363D]">
                  Tell Us What You’d Like to Build
                </h2>
                <p className="text-xs text-[#505B66] mt-1">
                  Fill in your details below to prepare a formatted inquiry for WhatsApp or direct follow-up.
                </p>
              </div>

              {whatsAppInitiated && (
                <div className="mb-6 p-4 bg-[#E9EDF0] border-l-4 border-[#214E78] rounded-r text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#30363D] font-bold">
                    <MessageSquare className="w-4 h-4 text-[#214E78]" />
                    <span>WhatsApp message window opened</span>
                  </div>
                  <p className="text-[#505B66] leading-relaxed">
                    Please remember to press <strong>Send</strong> inside your WhatsApp app to deliver the message to Founder S. Rajkumar ({BUSINESS_INFO.phone}).
                  </p>
                  <p className="text-[11px] text-[#505B66]">
                    Your form inputs are saved here. If you need to make changes, modify the fields below and click "Continue to WhatsApp" again.
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
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S. Rajendran"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      Business / Firm Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Star Enterprises"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. info@business.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      City / Region <span className="text-[#505B66]/60 text-[10px] font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai, Bengaluru, Mumbai"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66]/50 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      Primary Service Category
                    </label>
                    <select
                      value={form.primaryNeed}
                      onChange={(e) => setForm({ ...form, primaryNeed: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:border-[#214E78]"
                    >
                      <option value="Business Intelligence & Dashboards">Business Intelligence &amp; Dashboards</option>
                      <option value="Websites & Custom Software (BUILD)">Websites &amp; Custom Software (BUILD)</option>
                      <option value="Cybersecurity & Audit (SECURE)">Cybersecurity &amp; Audit (SECURE)</option>
                      <option value="Performance Marketing & Growth (GROW)">Performance Marketing &amp; Growth (GROW)</option>
                      <option value="Creator Campaigns & Influence (INFLUENCE)">Creator Campaigns &amp; Influence (INFLUENCE)</option>
                      <option value="AI & Workflow Automation (AUTOMATE)">AI &amp; Workflow Automation (AUTOMATE)</option>
                      <option value="Business Operations & Support">Business Operations &amp; Support</option>
                      <option value="Strategic & Executive Consulting">Strategic &amp; Executive Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#30363D] block mb-1">
                      Preferred Discussion Mode
                    </label>
                    <select
                      value={form.meetingMode}
                      onChange={(e) => setForm({ ...form, meetingMode: e.target.value })}
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
                    Your Requirements &amp; Current Setup
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you want to build or fix (e.g. CCTV business website, quotation tool, sales dashboard, GST filing, bank DPR)..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
      </main>
    </div>
  );
};
