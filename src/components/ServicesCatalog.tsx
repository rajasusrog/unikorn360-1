import React, { useState, useMemo } from 'react';
import { 
  CATEGORY_INFO, 
  SERVICES_LIST, 
  MAIN_CATEGORY_KEYS 
} from '../data/servicesData';
import { ServiceItem } from '../types';
import { 
  Search, 
  Check, 
  Clock, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Globe,
  BarChart3,
  AppWindow,
  Cpu,
  Briefcase
} from 'lucide-react';

interface ServicesCatalogProps {
  selectedCategoryKey?: string;
  onOpenQuoteModal: (service: ServiceItem) => void;
  onSelectServiceModal: (service: ServiceItem) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'bi-dashboards': BarChart3,
  'websites-ecommerce': Globe,
  'custom-apps': AppWindow,
  'ai-automation': Cpu,
  'business-operations': Briefcase,
  'finance-compliance': ShieldCheck
};

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  selectedCategoryKey = 'bi-dashboards',
  onOpenQuoteModal,
  onSelectServiceModal
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    MAIN_CATEGORY_KEYS.includes(selectedCategoryKey) ? selectedCategoryKey : 'bi-dashboards'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    if (selectedCategoryKey) {
      if (MAIN_CATEGORY_KEYS.includes(selectedCategoryKey)) {
        setActiveCategory(selectedCategoryKey);
      } else if (CATEGORY_INFO[selectedCategoryKey]?.id) {
        setActiveCategory(CATEGORY_INFO[selectedCategoryKey].id);
      }
    }
  }, [selectedCategoryKey]);

  const filteredServices = useMemo(() => {
    return SERVICES_LIST.filter(item => {
      const matchesCategory = searchQuery.trim() !== '' ? true : item.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scopeList.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const currentCategoryMeta = CATEGORY_INFO[activeCategory] || CATEGORY_INFO['bi-dashboards'];

  return (
    <section className="py-16 lg:py-24 bg-[#F5F6F7] border-b border-[#D8DEE5] relative" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#214E78]" />
            <span>6 Main Service Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            Comprehensive Services &amp; Capabilities
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            From custom business intelligence and web platforms to workflow automation, operations consulting, and statutory finance support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-[#505B66] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. dashboards, website, quotation tool, CRM, GST, DPR)..."
              className="w-full pl-11 pr-14 py-3 bg-white border border-[#D8DEE5] rounded-lg text-[#30363D] placeholder-[#505B66]/60 text-xs sm:text-sm focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-[#505B66] hover:text-[#30363D] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#505B66]">
            <span>
              Showing {filteredServices.length} capabilities {searchQuery && `matching "${searchQuery}"`}
            </span>
            <span className="text-[#A57C35] font-medium">Pre-Scoped Written Quotations</span>
          </div>
        </div>

        {/* 6 Category Tabs (Ordered as specified in prompt) */}
        {!searchQuery && (
          <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 min-w-[700px] sm:min-w-0">
              {MAIN_CATEGORY_KEYS.map((key) => {
                const cat = CATEGORY_INFO[key];
                const IconComponent = CATEGORY_ICONS[key] || Layers;
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`p-3 rounded-lg text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-white border-[#214E78] shadow-md ring-1 ring-[#214E78]'
                        : 'bg-white/70 border-[#D8DEE5] hover:border-[#214E78]/50 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded ${isActive ? 'bg-[#214E78] text-white' : 'bg-[#F5F6F7] text-[#505B66]'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#214E78]' : 'text-[#505B66]'}`}>
                        0{cat.order}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold leading-snug ${isActive ? 'text-[#214E78]' : 'text-[#30363D]'}`}>
                        {cat.title}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Category Description Banner */}
        {!searchQuery && (
          <div className="mb-8 p-4 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block">
                Category {CATEGORY_INFO[activeCategory]?.order} of 6
              </span>
              <h3 className="text-base font-bold text-[#30363D]">
                {currentCategoryMeta.title}
              </h3>
              <p className="text-xs text-[#505B66] mt-0.5">
                {currentCategoryMeta.description}
              </p>
            </div>
            <div className="shrink-0 text-xs text-[#505B66] font-medium">
              {filteredServices.length} Services Listed
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#D8DEE5] rounded-lg p-5 shadow-xs hover:shadow-md hover:border-[#214E78] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded">
                    {service.serviceType === 'custom-development' ? 'Custom Development' : service.serviceType === 'consulting' ? 'Consulting' : 'Support'}
                  </span>
                  {service.isPopular && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#A57C35]/15 text-[#A57C35] border border-[#A57C35]/30 rounded">
                      High Demand
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors leading-snug">
                  {service.title}
                </h4>

                <p className="mt-1 text-xs text-[#505B66] line-clamp-2 leading-relaxed">
                  {service.subtitle}
                </p>

                {/* Scope highlights */}
                <div className="mt-4 pt-3 border-t border-[#D8DEE5] space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#30363D]">
                    Key Scope &amp; Deliverables:
                  </p>
                  {service.scopeList.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#505B66]">
                      <Check className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#505B66]">
                  <Clock className="w-3 h-3 text-[#A57C35]" />
                  <span>Timeline: <strong className="text-[#30363D]">{service.typicalTimeline}</strong></span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-[#D8DEE5] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectServiceModal(service)}
                  className="text-xs font-semibold text-[#214E78] hover:underline cursor-pointer"
                >
                  View Scope &rarr;
                </button>

                <button
                  onClick={() => onOpenQuoteModal(service)}
                  className="px-3.5 py-1.5 bg-[#214E78] hover:bg-[#173858] text-white text-[10px] uppercase tracking-wider font-bold rounded shadow-2xs transition-all cursor-pointer"
                >
                  Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white border border-[#D8DEE5] rounded-lg">
            <p className="text-sm text-[#505B66]">No services found matching your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-2 bg-[#214E78] text-white text-xs font-bold rounded"
            >
              Reset Search Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
