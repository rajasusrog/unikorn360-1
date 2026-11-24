import React from 'react';
import {
  Shield,
  MapPin,
  Layers,
  Cpu,
  BarChart3,
  Globe,
  AppWindow,
  MessageSquare
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { BUSINESS_INFO } from '../data/servicesData';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenReviewModal }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Unikorn360 Business Intelligence',
    description: 'Learn about Unikorn360 Business Intelligence, the technology, business intelligence, and operations partner founded by S. Rajkumar.',
    url: 'https://www.unikorn360.com/about',
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
      url: 'https://www.unikorn360.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1st Floor, Shop No. 3, VK Complex, P.J.N. Road, Kamarajapuram',
        addressLocality: 'Vaniyambadi',
        addressRegion: 'Tamil Nadu',
        postalCode: '635751',
        addressCountry: 'IN'
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#263449]">
      <SEOHead
        title="About Unikorn360 Business Intelligence | Technology & Systems Partner"
        description="Learn about Unikorn360 Business Intelligence: technology, custom applications, automation, and business intelligence partner founded by S. Rajkumar."
        canonicalPath="/about"
        schema={schema}
      />

      <Breadcrumbs
        items={[{ label: 'About Us' }]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="py-12 lg:py-16 border-b border-[#E4DFD5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
              Business &amp; Technology Partner · Remote &amp; In-Person
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1426] tracking-tight leading-[1.15]">
              Practical Websites, Software, and Systems Built Around Your Business
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#526176] leading-relaxed">
              Unikorn360 Business Intelligence builds custom websites, software workflows, automation, and reporting cockpits for small and growing enterprises.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#263449]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-[#0B1426]" />
                <span>VK Complex, Vaniyambadi, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <Shield className="w-3.5 h-3.5 text-[#0B1426]" />
                <span>Founder: {BUSINESS_INFO.founder}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg font-medium">
                <span>GSTIN: {BUSINESS_INFO.gstin}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">

        {/* Supplied Wide Brand Banner */}
        <div className="bg-[#FAF8F2] border border-[#E4DFD5] rounded-xl overflow-hidden shadow-xs p-2 sm:p-4">
          <img
            src="/assets/brand/unikorn360-bi-banner-v1.png"
            alt="UNIKORN360 Business Intelligence — Software, Digital Services, Automation"
            className="w-full h-auto object-contain max-h-80 sm:max-h-96 mx-auto"
          />
        </div>

        {/* Core Narrative */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4 text-sm text-[#263449] leading-relaxed">
            <h2 className="text-2xl font-bold text-[#0B1426] border-b border-[#E4DFD5] pb-3">
              Why We Built Unikorn360
            </h2>

            <p>
              Across manufacturing workshops, trading godowns, and service enterprises, a common pattern plays out every day: business owners rely on fragmented tools—personal WhatsApp chats, multiple spreadsheets, paper notebooks, and disjointed accounting entries.
            </p>

            <p>
              When operations grow, this manual approach causes friction: quotations take days to prepare, customer inquiries leak between staff members, owners lack real-time visibility into aged debtors, and compliance renewals cause last-minute delays.
            </p>

            <p>
              Unikorn360 acts as your dedicated technology and operations partner. Instead of bloated packages, we scope and build targeted websites, custom software, automated follow-ups, and executive dashboards designed specifically around how your business operates.
            </p>

            <div className="p-5 bg-white border border-[#E4DFD5] rounded-xl">
              <strong className="text-[#0B1426] block text-xs uppercase tracking-wider mb-1.5">
                Our Working Standard
              </strong>
              <p className="text-xs sm:text-sm text-[#526176]">
                Every engagement starts with a free initial assessment meeting followed by an itemized written quotation with stated deliverables before work commences.
              </p>
            </div>
          </div>

          {/* Six Core Competencies */}
          <div className="p-6 sm:p-8 bg-white border border-[#E4DFD5] rounded-xl shadow-xs space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block">
              Six Service Divisions
            </span>
            <h3 className="text-xl font-bold text-[#0B1426]">
              Capabilities Built for Day-to-Day Operations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <Globe className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">Websites &amp; Software</strong>
                  <span className="text-[#526176]">Business websites, digital catalogues, quotation calculators, and custom billing portals.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <Shield className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">Security &amp; Maintenance</strong>
                  <span className="text-[#526176]">Website security hardening, backup routines, and reliable upkeep plans.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <AppWindow className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">Marketing &amp; Creator Campaigns</strong>
                  <span className="text-[#526176]">Regional creator collaborations and practical lead-generation campaigns.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <Cpu className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">AI, Automation &amp; Business Systems</strong>
                  <span className="text-[#526176]">WhatsApp order and reminder workflows, document OCR, and CRM lead pipelines.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <BarChart3 className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">Research &amp; Business Strategy</strong>
                  <span className="text-[#526176]">Feasibility reviews, reporting cockpits, and standard operating procedures.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <Layers className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B1426] block">Business Setup &amp; Documentation</strong>
                  <span className="text-[#526176]">Bank-ready DPRs, CMA data, Udyam MSME registration, and statutory documentation.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office & Founder Details */}
        <section className="p-6 sm:p-8 bg-white border border-[#E4DFD5] rounded-xl shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
                Founder &amp; Principal
              </span>
              <h4 className="text-base font-bold text-[#0B1426]">
                {BUSINESS_INFO.founder}
              </h4>
              <p className="text-xs text-[#526176] mt-1">
                Founder, Unikorn360 Business Intelligence
              </p>
              <div className="mt-3 text-xs space-y-1">
                <p>Phone / WhatsApp: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#0B1426] hover:text-[#C49A36] font-semibold">{BUSINESS_INFO.phone}</a></p>
                <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#0B1426] hover:text-[#C49A36] font-semibold">{BUSINESS_INFO.email}</a></p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
                Office Location
              </span>
              <h4 className="text-base font-bold text-[#0B1426]">
                Registered Office Address
              </h4>
              <p className="text-xs text-[#526176] mt-1 leading-relaxed">
                {BUSINESS_INFO.address.full}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
                Statutory Registration
              </span>
              <h4 className="text-base font-bold text-[#0B1426]">
                GSTIN: {BUSINESS_INFO.gstin}
              </h4>
              <p className="text-xs text-[#526176] mt-1">
                Registered MSME business intelligence and technology advisory service in Tamil Nadu.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  className="px-5 py-2.5 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss your project</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
