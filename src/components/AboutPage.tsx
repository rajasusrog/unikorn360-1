import React from 'react';
import { 
  Shield, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Target, 
  Phone, 
  Mail,
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
    <div className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-12 sm:pt-16">
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
      <header className="py-12 lg:py-16 border-b border-[#D8DEE5] bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] uppercase font-mono tracking-[0.15em] text-[#A57C35] mb-3">
              <span>Business &amp; Technology Partner</span>
              <span className="text-[#D8DEE5]">•</span>
              <span>Remote &amp; In-Person Engagements</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight leading-[1.15]">
              Intelligent Systems. Built Around How You Work.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Unikorn360 Business Intelligence provides custom websites, applications, workflow automation, and business intelligence cockpits for businesses, founders, teams and creators.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#505B66]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <MapPin className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Registered Office: VK Complex, Vaniyambadi</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Shield className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Founder: {BUSINESS_INFO.founder}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded font-mono text-[11px]">
                <span>GSTIN: {BUSINESS_INFO.gstin}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        
        {/* Core Narrative */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4 text-xs sm:text-sm text-[#505B66] leading-relaxed">
            <h2 className="text-2xl font-bold text-[#30363D] border-b border-[#D8DEE5] pb-3">
              Why We Built Unikorn360
            </h2>

            <p>
              Across manufacturing workshops, trading godowns, and service enterprises, a common pattern plays out every day: business owners rely on fragmented tools—personal WhatsApp chats, multiple spreadsheets, paper notebooks, and disjointed accounting entries.
            </p>

            <p>
              When operations grow, this manual approach causes friction: quotations take days to prepare, customer inquiries leak between staff members, owners lack real-time visibility into aged debtors, and compliance renewals cause last-minute panic.
            </p>

            <p>
              Unikorn360 acts as your dedicated technology and operations partner. We don't push bloated enterprise packages. Instead, we scope and build targeted custom software, automated notification pipelines, and executive dashboards designed specifically around how your business works.
            </p>

            <div className="p-4 bg-white border border-[#D8DEE5] rounded-lg">
              <strong className="text-[#30363D] block text-xs mb-1">Our Operating Principle:</strong>
              <p className="text-xs text-[#505B66]">
                Every project begins with an initial no-cost discussion, followed by a transparent, itemized written quotation with clearly stated deliverables. No hidden charges and no surprise scope.
              </p>
            </div>
          </div>

          {/* Six Core Competencies */}
          <div className="p-6 sm:p-8 bg-white border border-[#D8DEE5] rounded-lg shadow-sm space-y-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block">
              Our 6 Competency Pillars
            </span>
            <h3 className="text-xl font-bold text-[#30363D]">
              Complete Technology &amp; Operations Spectrum
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <BarChart3 className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">1. Business Intelligence &amp; Dashboards</strong>
                  <span className="text-[#505B66]">Consolidate sales, stock, and overdue debtor feeds into real-time executive cockpits.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Globe className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">2. Websites &amp; E-commerce</strong>
                  <span className="text-[#505B66]">High-conversion B2B industrial websites, dealer order catalogues, and brand identity.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <AppWindow className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">3. Custom Apps &amp; Business Software</strong>
                  <span className="text-[#505B66]">Formula-driven quotation builders, lightweight CRM pipelines, and billing tools.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Cpu className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">4. AI &amp; Workflow Automation</strong>
                  <span className="text-[#505B66]">Automated WhatsApp order alerts, invoice OCR, and omnichannel lead routing.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Layers className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">5. Business Operations &amp; Consulting</strong>
                  <span className="text-[#505B66]">Standard Operating Procedures (SOPs), margin optimization, and digital document vaults.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Shield className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#30363D] block text-xs">6. Finance, Compliance &amp; Project Support</strong>
                  <span className="text-[#505B66]">Bank-ready DPRs, CMA data, Udyam MSME classification, and statutory licensing.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office & Founder Details */}
        <section className="p-6 sm:p-8 bg-white border border-[#D8DEE5] rounded-xl shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                Founder &amp; Principal
              </span>
              <h4 className="text-base font-bold text-[#30363D]">
                {BUSINESS_INFO.founder}
              </h4>
              <p className="text-xs text-[#505B66] mt-1">
                Founder, Unikorn360 Business Intelligence
              </p>
              <div className="mt-3 text-xs space-y-1">
                <p>Phone / WhatsApp: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#214E78] font-bold">{BUSINESS_INFO.phone}</a></p>
                <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#214E78] font-bold">{BUSINESS_INFO.email}</a></p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                Office Location
              </span>
              <h4 className="text-base font-bold text-[#30363D]">
                Registered Office Address
              </h4>
              <p className="text-xs text-[#505B66] mt-1 leading-relaxed">
                {BUSINESS_INFO.address.full}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                Statutory Registration
              </span>
              <h4 className="text-base font-bold text-[#30363D] font-mono">
                GSTIN: {BUSINESS_INFO.gstin}
              </h4>
              <p className="text-xs text-[#505B66] mt-1">
                Registered MSME business intelligence and technology advisory service in Tamil Nadu.
              </p>
              <div className="mt-4">
                <button
                  onClick={onOpenReviewModal}
                  className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss Your Project</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
