import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';
import { usePublishedCatalog } from '../hooks/usePublishedCatalog';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onSelectCategory?: (category: string) => void;
}

const FALLBACK_DIVISIONS = [
  { slug: 'websites-software', name: 'Websites & Software' },
  { slug: 'security-maintenance', name: 'Security & Maintenance' },
  { slug: 'marketing-creator-campaigns', name: 'Marketing & Creator Campaigns' },
  { slug: 'ai-automation-business-systems', name: 'AI, Automation & Business Systems' },
  { slug: 'research-business-strategy', name: 'Research & Business Strategy' },
  { slug: 'business-setup-documentation', name: 'Business Setup & Documentation' }
];

export const Footer: React.FC<FooterProps> = ({
  onNavigate = (path: string) => {
    if (typeof window !== 'undefined') window.location.pathname = path;
  },
  onOpenReviewModal,
  onScrollToSection
}) => {
  const { divisions, totalPublishedServices, status: catalogStatus } = usePublishedCatalog();

  const handleNav = (path: string, sectionId?: string) => {
    if (sectionId && typeof window !== 'undefined' && window.location.pathname === '/') {
      onScrollToSection(sectionId);
    } else {
      onNavigate(path);
    }
  };

  const divisionLinks = divisions.length > 0 ? divisions : FALLBACK_DIVISIONS;
  const directoryLabel =
    catalogStatus === 'ready'
      ? `Services Directory (${totalPublishedServices}) →`
      : 'Services Directory →';

  return (
    <footer className="bg-[#EFECE5] text-[#263449] border-t border-[#E4DFD5] pt-16 pb-24 lg:pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#E4DFD5]">

          {/* Col 1 & 2: Square BI Logo & Contact Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-[#E4DFD5] rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0 overflow-hidden">
                <img
                  src="/assets/brand/unikorn360-bi-square-v1.png"
                  alt="UNIKORN360 Business Intelligence — Intelligent Systems. Real-World Impact."
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="pt-1">
                <span className="text-xl font-bold tracking-tight text-[#0B1426] block">
                  UNIKORN360 Business Intelligence
                </span>
                <p className="text-xs text-[#526176] leading-relaxed mt-2 max-w-sm">
                  Custom websites, workflow software, business intelligence dashboards, and statutory business setup for growing companies.
                </p>
              </div>
            </div>

            <div className="pt-1 space-y-2.5 text-xs text-[#263449]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0B1426] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#0B1426]">Registered Office:</strong> {BUSINESS_INFO.address.full}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0B1426] shrink-0" />
                <span>
                  <strong className="text-[#0B1426]">Phone / WhatsApp:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline font-semibold">
                    {BUSINESS_INFO.phone}
                  </a>{' '}
                  <span className="text-[#526176]">({BUSINESS_INFO.founder})</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B1426] shrink-0" />
                <span>
                  <strong className="text-[#0B1426]">Email:</strong>{' '}
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#0B1426] hover:text-[#C49A36] hover:underline font-medium">
                    {BUSINESS_INFO.email}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#263449]">
                <CheckCircle2 className="w-4 h-4 text-[#C49A36] shrink-0" />
                <span>GSTIN: <strong className="text-[#0B1426]">{BUSINESS_INFO.gstin}</strong></span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenReviewModal('Footer CTA Discussion')}
                className="px-5 py-2.5 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuss your project</span>
              </button>
            </div>
          </div>

          {/* Col 3: Services & Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426]">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-[#526176]">
              {divisionLinks.map((div) => (
                <li key={div.slug}>
                  <a
                    href={`/services/${div.slug}`}
                    onClick={(e) => { e.preventDefault(); handleNav(`/services/${div.slug}`); }}
                    className="hover:text-[#0B1426] transition-colors"
                  >
                    {div.name}
                  </a>
                </li>
              ))}
              <li className="pt-2 border-t border-[#E4DFD5]">
                <a
                  href="/services"
                  onClick={(e) => { e.preventDefault(); handleNav('/services'); }}
                  className="text-[#0B1426] hover:text-[#C49A36] font-semibold block"
                >
                  {directoryLabel}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions & Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426]">
              Solutions &amp; Guides
            </h4>
            <ul className="space-y-2 text-xs text-[#526176]">
              <li>
                <a
                  href="/solutions/start-a-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/start-a-business'); }}
                  className="hover:text-[#0B1426] transition-colors"
                >
                  Start a Business
                </a>
              </li>
              <li>
                <a
                  href="/solutions/run-and-stay-compliant"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/run-and-stay-compliant'); }}
                  className="hover:text-[#0B1426] transition-colors"
                >
                  Run &amp; Stay Compliant
                </a>
              </li>
              <li>
                <a
                  href="/solutions/get-business-funding"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/get-business-funding'); }}
                  className="hover:text-[#0B1426] transition-colors"
                >
                  Business Funding &amp; DPRs
                </a>
              </li>
              <li>
                <a
                  href="/solutions/digitise-your-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/digitise-your-business'); }}
                  className="hover:text-[#0B1426] transition-colors"
                >
                  Digitise Your Business
                </a>
              </li>
              <li>
                <a
                  href="/solutions/automate-your-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/automate-your-business'); }}
                  className="hover:text-[#0B1426] transition-colors"
                >
                  Automate Operations
                </a>
              </li>
              <li className="pt-2 border-t border-[#E4DFD5]">
                <a
                  href="/resources"
                  onClick={(e) => { e.preventDefault(); handleNav('/resources'); }}
                  className="text-[#0B1426] hover:text-[#C49A36] font-semibold block"
                >
                  Resources &amp; Guides →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Products & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426]">
              Products &amp; Company
            </h4>
            <ul className="space-y-2 text-xs text-[#526176]">
              <li>
                <a
                  href="/products"
                  onClick={(e) => { e.preventDefault(); handleNav('/products'); }}
                  className="hover:text-[#0B1426] font-semibold text-[#0B1426] block"
                >
                  All Products →
                </a>
              </li>
              <li>
                <a
                  href="/products/invoicepro360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/invoicepro360'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  InvoicePro360
                </a>
              </li>
              <li>
                <a
                  href="/products/deeds360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/deeds360'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  Deeds360
                </a>
              </li>
              <li>
                <a
                  href="/products/property360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/property360'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  Property360
                </a>
              </li>
              <li>
                <a
                  href="/products/advocate360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/advocate360'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  Advocate360
                </a>
              </li>
              <li className="pt-2 border-t border-[#E4DFD5]">
                <a
                  href="/creators"
                  onClick={(e) => { e.preventDefault(); handleNav('/creators'); }}
                  className="hover:text-[#0B1426] font-semibold text-[#0B1426] block"
                >
                  Creators Network
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); handleNav('/about'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); handleNav('/contact'); }}
                  className="hover:text-[#0B1426] transition-colors block"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => { e.preventDefault(); handleNav('/admin'); }}
                  className="text-[11px] text-[#526176] hover:text-[#0B1426] transition-colors block"
                >
                  Admin Control Desk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#526176]">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.brand}. Founder: {BUSINESS_INFO.founder}. Vaniyambadi, Tamil Nadu.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>Written Scope &amp; Quotations</span>
            <span>·</span>
            <span>GSTIN: {BUSINESS_INFO.gstin}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
