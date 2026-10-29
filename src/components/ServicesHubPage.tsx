import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import { CATEGORY_INFO, SERVICES_LIST, MAIN_CATEGORY_KEYS } from '../data/servicesData';
import { ServiceItem } from '../types';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface ServicesHubPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

export const ServicesHubPage: React.FC<ServicesHubPageProps> = ({
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = SERVICES_LIST.filter((svc) => {
    const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Business Intelligence & Technology Services | Unikorn360',
    description: 'Comprehensive catalogue of business intelligence, custom software, websites, automation, operations, and finance services.',
    url: 'https://www.unikorn360.com/services'
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-12 sm:pt-16">
      <SEOHead
        title="Services Catalogue | Unikorn360 Business Intelligence"
        description="Explore Unikorn360's services: Business intelligence dashboards, custom web applications, e-commerce, workflow automation, operations consulting, and finance compliance."
        canonicalPath="/services"
        schema={schema}
      />

      <Breadcrumbs
        items={[{ label: 'Services Catalogue' }]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="py-12 lg:py-16 border-b border-[#D8DEE5] bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A57C35] block mb-2">
              Official Services Directory
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight leading-[1.15]">
              Intelligent Systems &amp; Business Services
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Every service is delivered with an itemized written scope, transparent pricing, and dedicated execution. Remote consultations and registered office sessions available.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="mt-8 space-y-4">
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-[#505B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all services (e.g. dashboards, website, quotation tool, CRM, GST, DPR)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg text-xs text-[#30363D] placeholder-[#505B66]/60 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#214E78] text-white shadow-xs'
                    : 'bg-white border border-[#D8DEE5] text-[#505B66] hover:text-[#30363D]'
                }`}
              >
                All Services ({SERVICES_LIST.length})
              </button>

              {MAIN_CATEGORY_KEYS.map((catKey) => {
                const info = CATEGORY_INFO[catKey];
                if (!info) return null;
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#214E78] text-white shadow-xs'
                        : 'bg-white border border-[#D8DEE5] text-[#505B66] hover:text-[#30363D]'
                    }`}
                  >
                    {info.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-6 flex items-center justify-between text-xs text-[#505B66]">
          <span>
            Showing <strong>{filteredServices.length}</strong> services
          </span>
          <span className="text-[#A57C35] font-semibold">Pre-Scoped Written Quotation Terms</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#D8DEE5] rounded-lg p-6 shadow-xs hover:shadow-md hover:border-[#214E78] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#505B66] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#F5F6F7] text-[#214E78] rounded">
                    {service.serviceType === 'custom-development' ? 'Custom Development' : service.serviceType === 'consulting' ? 'Consulting' : 'Support'}
                  </span>
                  <span className="text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A57C35]" />
                    {service.typicalTimeline}
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#30363D] mb-1.5 leading-snug">
                  <a
                    href={`/services/${service.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/services/${service.id}`);
                    }}
                    className="hover:text-[#214E78] transition-colors"
                  >
                    {service.title}
                  </a>
                </h2>

                <p className="text-xs text-[#505B66] leading-relaxed mb-4 line-clamp-2">
                  {service.subtitle}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#D8DEE5]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#30363D]">
                    Included in Scope:
                  </p>
                  {service.scopeList.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#505B66]">
                      <Check className="w-3 h-3 text-[#214E78] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D8DEE5] flex items-center justify-between gap-3">
                <a
                  href={`/services/${service.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/services/${service.id}`);
                  }}
                  className="text-xs font-semibold text-[#214E78] hover:underline"
                >
                  Full Details &rarr;
                </a>

                <button
                  onClick={() => onOpenQuoteModal(service.title)}
                  className="px-3.5 py-1.5 bg-[#214E78] hover:bg-[#173858] text-white text-[10px] uppercase tracking-wider font-bold rounded shadow-2xs transition-all cursor-pointer"
                >
                  Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#D8DEE5] rounded-lg">
            <p className="text-sm text-[#505B66]">No services match your current filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 bg-[#214E78] text-white text-xs font-bold rounded"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
