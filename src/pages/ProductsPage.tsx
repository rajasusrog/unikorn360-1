import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { UNIKORN_PRODUCTS } from '../data/seedData';
import { BUSINESS_INFO } from '../data/servicesData';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  return (
    <div className="bg-[#F5F6F7] min-h-screen">
      <SEOHead
        title="Software Products & Business OS Suites | UNIKORN360"
        description="Explore UNIKORN360 proprietary software platforms: InvoicePro360, Nilam360, Deeds360, Advocate360, Startup360, Wellness360, Creator360, Personal OS, and Elite OS."
        canonicalUrl="https://www.unikorn360.com/products"
      />

      {/* Header */}
      <section className="bg-white border-b border-[#D8DEE5] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Products', current: true }
            ]}
          />

          <div className="max-w-3xl mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#214E78]/5 border border-[#214E78]/20 rounded text-[#214E78] text-xs font-semibold uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Specialized Business OS Suites &amp; Platforms</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
              Turnkey Software Platforms for Focused Industries
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              In addition to bespoke development, Unikorn360 develops pre-engineered operational platforms tailored to Indian business workflows. Each product addresses specific operational friction—from counter billing to land registry archives.
            </p>

            <div className="mt-6 p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg text-xs text-[#505B66]">
              <strong className="text-[#30363D]">Commercial Distinction:</strong> Our bespoke client software services (under the Build division) are scoped and developed from scratch around your specific company workflows. The platforms below are pre-engineered turnkey frameworks available for direct deployment or pilot participation.
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIKORN_PRODUCTS.map((prod) => {
            const isAvailable = prod.status === 'available';
            const isPilot = prod.status === 'in-pilot';
            const isComingSoon = prod.status === 'coming-soon';

            return (
              <div
                key={prod.id}
                className="bg-white border border-[#D8DEE5] rounded-xl p-6 hover:border-[#214E78] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#A57C35]">
                      {prod.division_ref ? `Division: ${prod.division_ref.toUpperCase()}` : 'System OS'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isPilot
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {isAvailable ? '● Available' : isPilot ? '◐ In Pilot' : '○ Coming Soon'}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#A57C35] mt-0.5">
                    {prod.tagline}
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-xs text-[#505B66] leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Target Audience */}
                  <div className="mt-4 pt-3 border-t border-[#D8DEE5]/60 text-xs">
                    <span className="text-[10px] font-bold text-[#30363D] uppercase tracking-wider block mb-1">
                      Target Deployment:
                    </span>
                    <p className="text-[#505B66] text-[11px] leading-relaxed">
                      {prod.target_audience}
                    </p>
                  </div>

                  {/* Key Capabilities */}
                  <div className="mt-4 pt-3 border-t border-[#D8DEE5]/60">
                    <span className="text-[10px] font-bold text-[#30363D] uppercase tracking-wider block mb-2">
                      Core Platform Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#505B66]">
                      {prod.key_capabilities.map((cap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-relaxed">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-5 mt-6 border-t border-[#D8DEE5]">
                  <button
                    onClick={() => onOpenReviewModal(`Product Discussion: ${prod.name}`)}
                    className="w-full py-2.5 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{prod.cta_text}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
