import React from 'react';
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2
} from 'lucide-react';
import { BUSINESS_INFO, MAIN_CATEGORY_KEYS, CATEGORY_INFO } from '../data/servicesData';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate = (path: string) => { window.location.pathname = path; },
  onOpenReviewModal,
  onScrollToSection,
  onSelectCategory
}) => {
  const handleNav = (path: string, sectionId?: string) => {
    if (sectionId && window.location.pathname === '/') {
      onScrollToSection(sectionId);
    } else {
      onNavigate(path);
    }
  };

  return (
    <footer className="bg-[#E9EDF0] text-[#505B66] border-t border-[#D8DEE5] pt-16 pb-20 lg:pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#D8DEE5]">
          
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-[#D8DEE5] rounded flex items-center justify-center text-[#214E78] shadow-sm">
                <Shield className="w-5 h-5 text-[#214E78]" />
              </div>
              <div>
                <span className="text-xl font-serif font-bold tracking-wider text-[#30363D]">
                  UNIKORN<span className="text-[#A57C35]">360</span>
                </span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#505B66] font-semibold">
                  Business Intelligence &amp; Technology Partner
                </p>
              </div>
            </div>

            <p className="text-xs text-[#505B66] leading-relaxed max-w-md">
              Websites, software, cybersecurity, marketing, creator campaigns, AI automation and business intelligence—built around your goals. Solutions for businesses, founders, teams and creators with remote consultations available.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#505B66]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <span>
                  <strong>Registered Office:</strong> {BUSINESS_INFO.address.full}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#214E78] shrink-0" />
                <span>
                  <strong>Helpline / WhatsApp:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#214E78] hover:underline font-semibold">
                    {BUSINESS_INFO.phone}
                  </a>{' '}
                  (Founder: {BUSINESS_INFO.founder})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#214E78] shrink-0" />
                <span>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#214E78] hover:underline">
                    {BUSINESS_INFO.email}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#30363D]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0" />
                <span>GSTIN: {BUSINESS_INFO.gstin}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenReviewModal('Footer CTA Discussion')}
                className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white font-bold text-[11px] uppercase tracking-[0.15em] rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discuss Your Project</span>
              </button>
            </div>
          </div>

          {/* Col 3: The 6 Divisions */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-[#30363D]">
              The 6 Divisions
            </h4>
            <ul className="space-y-1.5 text-xs text-[#505B66]">
              <li>
                <a href="/services/websites-software" onClick={(e) => { e.preventDefault(); handleNav('/services/websites-software'); }} className="hover:text-[#214E78] transition-colors">
                  Websites &amp; Software
                </a>
              </li>
              <li>
                <a href="/services/security-maintenance" onClick={(e) => { e.preventDefault(); handleNav('/services/security-maintenance'); }} className="hover:text-[#214E78] transition-colors">
                  Security &amp; Maintenance
                </a>
              </li>
              <li>
                <a href="/services/marketing-creator-campaigns" onClick={(e) => { e.preventDefault(); handleNav('/services/marketing-creator-campaigns'); }} className="hover:text-[#214E78] transition-colors">
                  Marketing &amp; Creator Campaigns
                </a>
              </li>
              <li>
                <a href="/services/ai-automation-business-systems" onClick={(e) => { e.preventDefault(); handleNav('/services/ai-automation-business-systems'); }} className="hover:text-[#214E78] transition-colors">
                  AI Automation &amp; Systems
                </a>
              </li>
              <li>
                <a href="/services/research-business-strategy" onClick={(e) => { e.preventDefault(); handleNav('/services/research-business-strategy'); }} className="hover:text-[#214E78] transition-colors">
                  Research &amp; Business Strategy
                </a>
              </li>
              <li>
                <a href="/services/business-setup-documentation" onClick={(e) => { e.preventDefault(); handleNav('/services/business-setup-documentation'); }} className="hover:text-[#214E78] transition-colors">
                  Business Setup &amp; Documentation
                </a>
              </li>
              <li className="pt-1.5 border-t border-[#D8DEE5]">
                <a
                  href="/services"
                  onClick={(e) => { e.preventDefault(); handleNav('/services'); }}
                  className="text-[#214E78] hover:underline font-bold block"
                >
                  Full Services Directory (37) →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions & Lifecycle */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-[#30363D]">
              Solutions &amp; Models
            </h4>
            <ul className="space-y-2 text-xs text-[#505B66]">
              <li>
                <a
                  href="/solutions/start-a-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/start-a-business'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Start a Business
                </a>
              </li>
              <li>
                <a
                  href="/solutions/run-and-stay-compliant"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/run-and-stay-compliant'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Run &amp; Stay Compliant
                </a>
              </li>
              <li>
                <a
                  href="/solutions/get-business-funding"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/get-business-funding'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Get Business Funding &amp; Loans
                </a>
              </li>
              <li>
                <a
                  href="/solutions/digitise-your-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/digitise-your-business'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Digitise Your Business
                </a>
              </li>
              <li>
                <a
                  href="/solutions/automate-your-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/automate-your-business'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Automate Workflows &amp; Ops
                </a>
              </li>
              <li>
                <a
                  href="/solutions/expand-your-business"
                  onClick={(e) => { e.preventDefault(); handleNav('/solutions/expand-your-business'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Expand Your Business
                </a>
              </li>
              <li className="pt-2 border-t border-[#D8DEE5]">
                <span className="text-[10px] text-[#505B66] uppercase tracking-wider block mb-1">
                  Support Tiers:
                </span>
                <span className="text-xs font-semibold text-[#30363D]">VERIFY • PROTECT • GUARDIAN</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Knowledge Base & Company */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-[#30363D]">
              Resources &amp; Company
            </h4>
            <ul className="space-y-2 text-xs text-[#505B66]">
              <li>
                <a
                  href="/resources/msme-business-automation-roadmap"
                  onClick={(e) => { e.preventDefault(); handleNav('/resources/msme-business-automation-roadmap'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Business Automation Roadmap
                </a>
              </li>
              <li>
                <a
                  href="/resources/dpr-preparation-guide-msme-bank-loans"
                  onClick={(e) => { e.preventDefault(); handleNav('/resources/dpr-preparation-guide-msme-bank-loans'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Bank-Ready DPR Guide
                </a>
              </li>
              <li>
                <a
                  href="/resources/gst-compliance-checklist-tamil-nadu"
                  onClick={(e) => { e.preventDefault(); handleNav('/resources/gst-compliance-checklist-tamil-nadu'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  GST Compliance Checklist
                </a>
              </li>
              <li>
                <a
                  href="/resources/msme-government-subsidy-schemes-tamil-nadu"
                  onClick={(e) => { e.preventDefault(); handleNav('/resources/msme-government-subsidy-schemes-tamil-nadu'); }}
                  className="hover:text-[#214E78] transition-colors"
                >
                  Tamil Nadu MSME Subsidies
                </a>
              </li>
              <li className="pt-2 border-t border-[#D8DEE5]">
                <a
                  href="/products"
                  onClick={(e) => { e.preventDefault(); handleNav('/products'); }}
                  className="hover:text-[#214E78] transition-colors block font-bold text-[#30363D]"
                >
                  All Products →
                </a>
              </li>
              <li>
                <a
                  href="/products/invoicepro360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/invoicepro360'); }}
                  className="hover:text-[#214E78] transition-colors block"
                >
                  InvoicePro360
                </a>
              </li>
              <li>
                <a
                  href="/products/deeds360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/deeds360'); }}
                  className="hover:text-[#214E78] transition-colors block"
                >
                  Deeds360
                </a>
              </li>
              <li>
                <a
                  href="/products/property360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/property360'); }}
                  className="hover:text-[#214E78] transition-colors block"
                >
                  Property360
                </a>
              </li>
              <li>
                <a
                  href="/products/advocate360"
                  onClick={(e) => { e.preventDefault(); handleNav('/products/advocate360'); }}
                  className="hover:text-[#214E78] transition-colors block"
                >
                  Advocate360
                </a>
              </li>
              <li className="pt-2 border-t border-[#D8DEE5]">
                <a
                  href="/creators"
                  onClick={(e) => { e.preventDefault(); handleNav('/creators'); }}
                  className="hover:text-[#A57C35] transition-colors block font-semibold text-[#A57C35]"
                >
                  Join Creator Network (Tamil Creators)
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); handleNav('/about'); }}
                  className="hover:text-[#214E78] transition-colors block font-medium"
                >
                  About Unikorn360
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); handleNav('/contact'); }}
                  className="hover:text-[#214E78] transition-colors block font-medium"
                >
                  Contact Advisory Desk
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => { e.preventDefault(); handleNav('/admin'); }}
                  className="text-[10px] text-[#505B66]/60 hover:text-[#505B66] transition-colors block"
                >
                  Admin Control Desk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#505B66]">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.brand}. Founder: {BUSINESS_INFO.founder}. Registered Office: Vaniyambadi, Tamil Nadu.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Pre-Scoped Written Quotation Terms</span>
            <span>•</span>
            <span>No Hidden Charges</span>
            <span>•</span>
            <span>GSTIN: {BUSINESS_INFO.gstin}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
