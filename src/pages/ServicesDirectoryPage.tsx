import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Workflow, 
  BarChart3, 
  LifeBuoy, 
  GraduationCap, 
  ArrowRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { servicesDb, isRemoteSupabaseConfigured } from '../lib/supabase';
import { getSeedPublishedServices, getSeedDivisionsWithCounts } from '../data/seedData';
import { ServiceDivision, ServiceCatalogItem } from '../types/database';
import { BUSINESS_INFO } from '../data/servicesData';
import { getDivisionBanner } from '../data/mediaAssets';

interface ServicesDirectoryPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

const DIVISION_ICONS: Record<string, React.ElementType> = {
  'websites-software': Code2,
  'security-maintenance': ShieldCheck,
  'marketing-creator-campaigns': Sparkles,
  'ai-automation-business-systems': Workflow,
  'research-business-strategy': BarChart3,
  'business-setup-documentation': LifeBuoy
};

export const ServicesDirectoryPage: React.FC<ServicesDirectoryPageProps> = ({
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [divisions, setDivisions] = useState<ServiceDivision[]>(() => getSeedDivisionsWithCounts());
  const [allServices, setAllServices] = useState<ServiceCatalogItem[]>(() => getSeedPublishedServices());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionSlug, setSelectedDivisionSlug] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      if (!isRemoteSupabaseConfigured) {
        return;
      }
      try {
        const divs = await servicesDb.getDivisions();
        const srvs = await servicesDb.getAllPublishedServices();
        setDivisions(divs);
        setAllServices(srvs);
      } catch (err) {
        console.warn('Could not load services directory from Supabase, using seed fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    let list = allServices;

    if (selectedDivisionSlug !== 'all') {
      const parentDiv = divisions.find(d => d.slug === selectedDivisionSlug);
      if (parentDiv) {
        list = list.filter(s => s.division_id === parentDiv.id);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((service) =>
        service.service_name.toLowerCase().includes(q) ||
        service.short_description.toLowerCase().includes(q) ||
        (service.full_description || '').toLowerCase().includes(q) ||
        service.problems_solved.some((problem) => problem.toLowerCase().includes(q)) ||
        service.deliverables.some((deliverable) => deliverable.toLowerCase().includes(q)) ||
        (service.scope_includes || []).some((scopeItem) => scopeItem.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allServices, divisions, selectedDivisionSlug, searchQuery]);

  // Total published count
  const totalPublishedCount = allServices.length;

  return (
    <main className="bg-[#F5F6F7] min-h-screen">
      <SEOHead
        title="Services Directory | UNIKORN360 Business Intelligence & Systems"
        description="Explore Unikorn360's six specialized divisions: Websites & Software, Security & Maintenance, Marketing & Creator Campaigns, AI Automation, Research & Strategy, and Business Setup."
        canonicalUrl="https://www.unikorn360.com/services"
      />

      {/* Top Header Banner */}
      <section className="bg-white border-b border-[#D8DEE5] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Services' }
            ]}
            onNavigate={onNavigate}
          />

          <div className="max-w-3xl mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#214E78]/5 border border-[#214E78]/20 rounded text-[#214E78] text-xs font-semibold uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Service Architecture • 6 Core Divisions</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
              Business services with clear scope and deliverables
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Choose the service area that matches your requirement. Each published service explains the work included, what you receive, what we need from you, exclusions and how pricing is confirmed.
            </p>

            {/* Quick Stats Banner */}
            <div className="mt-8 flex flex-wrap items-center gap-6 pt-6 border-t border-[#D8DEE5] text-xs text-[#505B66]">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#214E78]">6</span>
                <span className="uppercase tracking-wider font-semibold">Specialized Divisions</span>
              </div>
              <span className="text-[#D8DEE5]">|</span>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#A57C35]">{totalPublishedCount}</span>
                <span className="uppercase tracking-wider font-semibold">Published Services</span>
              </div>
              <span className="text-[#D8DEE5]">|</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                <span>Written scope • Defined exclusions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-[#D8DEE5] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#505B66]" />
              <input
                type="text"
                placeholder="Search services, deliverables, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] placeholder-[#505B66] focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#505B66] hover:text-[#30363D]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Division Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedDivisionSlug('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDivisionSlug === 'all'
                    ? 'bg-[#214E78] text-white shadow-sm'
                    : 'bg-[#F5F6F7] text-[#505B66] hover:text-[#30363D] hover:bg-[#E9EDF0]'
                }`}
              >
                All Divisions ({totalPublishedCount})
              </button>
              {divisions.map((div) => (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivisionSlug(div.slug)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDivisionSlug === div.slug
                      ? 'bg-[#214E78] text-white shadow-sm'
                      : 'bg-[#F5F6F7] text-[#505B66] hover:text-[#30363D] hover:bg-[#E9EDF0]'
                  }`}
                >
                  {div.name} ({div.published_service_count || 0})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 6 Divisions Overview Grid (Only shown when not searching and viewing 'all') */}
        {!searchQuery && selectedDivisionSlug === 'all' && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block">
                  Browse by service area
                </span>
                <h2 className="text-2xl font-bold font-serif text-[#30363D] mt-1">
                  Choose a service area
                </h2>
              </div>
              <p className="hidden sm:block text-xs text-[#505B66] max-w-md text-right">
                Open a division to see its published services and their detailed scope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions.map((div) => {
                const IconComponent = DIVISION_ICONS[div.slug] || Briefcase;
                const count = div.published_service_count || 0;
                const banner = getDivisionBanner(div.slug);

                return (
                  <div
                    key={div.id}
                    className="bg-white border border-[#D8DEE5] rounded-xl p-5 hover:border-[#214E78] hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Artwork Thumbnail (Complete artwork with object-contain) */}
                      {banner && (
                        <a
                          href={`/services/${div.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/services/${div.slug}`);
                          }}
                          className="w-full aspect-[16/9] bg-[#FFFEFB] rounded-lg overflow-hidden mb-4 border border-[#D8DEE5] flex items-center justify-center cursor-pointer group-hover:border-[#214E78] transition-colors"
                        >
                          <img
                            src={banner.src}
                            alt={banner.alt}
                            width={banner.width}
                            height={banner.height}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        </a>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-[#F5F6F7] border border-[#D8DEE5] flex items-center justify-center text-[#214E78] group-hover:bg-[#214E78] group-hover:text-white transition-all">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35]">
                            Division
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded">
                          {count} {count === 1 ? 'Service' : 'Services'}
                        </span>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                        <a
                          href={`/services/${div.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/services/${div.slug}`);
                          }}
                          className="text-left cursor-pointer hover:underline"
                        >
                          {div.name}
                        </a>
                      </h3>

                      <p className="mt-2 text-xs text-[#505B66] line-clamp-3 leading-relaxed">
                        {div.short_description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#D8DEE5]/60 flex items-center justify-between text-xs font-semibold">
                      <a
                        href={`/services/${div.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/services/${div.slug}`);
                        }}
                        className="text-[#214E78] group-hover:text-[#173858] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Explore Division</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Service Catalog Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block">
                {selectedDivisionSlug !== 'all' 
                  ? `Division: ${divisions.find(d => d.slug === selectedDivisionSlug)?.name || ''}` 
                  : 'Published Catalog'}
              </span>
              <h2 className="text-xl font-bold font-serif text-[#30363D] mt-1">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Individual Service Capabilities'}
                <span className="ml-2 text-sm font-normal text-[#505B66]">({filteredServices.length} available)</span>
              </h2>
            </div>
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#214E78] font-semibold hover:underline"
              >
                Reset Search
              </button>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-[#D8DEE5] rounded-lg p-12 text-center max-w-lg mx-auto">
              <HelpCircle className="w-12 h-12 text-[#505B66] mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-[#30363D]">{allServices.length === 0 ? 'Individual service listings are being prepared' : 'No matching services found'}</h3>
              <p className="text-xs text-[#505B66] mt-1">
                {allServices.length === 0
                  ? 'The six service areas are available to explore. Individual service pages will appear after their delivery scope and commercial details are approved. You can still discuss a specific requirement with us.'
                  : 'Try another search term or clear the filters to browse the published catalogue.'}
              </p>
              <button
                onClick={() => {
                  if (allServices.length === 0) {
                    onOpenReviewModal('Help me identify the right UNIKORN360 service for my business requirement');
                  } else {
                    setSearchQuery('');
                    setSelectedDivisionSlug('all');
                  }
                }}
                className="mt-4 px-4 py-2 bg-[#214E78] text-white text-xs font-semibold rounded hover:bg-[#173858] transition-colors"
              >
                {allServices.length === 0 ? 'Discuss Your Requirement' : 'View All Services'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const parentDiv = divisions.find(d => d.id === service.division_id);
                const divisionSlug = parentDiv?.slug || 'build';
                const approvedPkg = service.packages.find(p => p.approval_status === 'approved');

                return (
                  <div
                    key={service.id}
                    className="bg-white border border-[#D8DEE5] rounded-lg p-6 hover:border-[#214E78] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Badge / Division label */}
                      <div className="flex items-center justify-between mb-3 text-[10px] text-[#505B66]">
                        <span className="uppercase tracking-wider font-semibold text-[#A57C35]">
                          {parentDiv?.name || 'Service'}
                        </span>
                        {approvedPkg?.price_type === 'starting-from' && (
                          <span className="bg-[#E9EDF0] text-[#214E78] px-2 py-0.5 rounded font-medium">
                            Starting price
                          </span>
                        )}
                      </div>

                      {/* Service Title */}
                      <h3 className="text-base font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                        <a
                          href={`/services/${divisionSlug}/${service.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/services/${divisionSlug}/${service.slug}`);
                          }}
                          className="text-left cursor-pointer hover:underline"
                        >
                          {service.service_name}
                        </a>
                      </h3>

                      {/* Short Description */}
                      <p className="mt-2 text-xs text-[#505B66] line-clamp-3 leading-relaxed">
                        {service.full_description || service.short_description}
                      </p>

                      {/* Deliverables preview */}
                      {service.deliverables && service.deliverables.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#D8DEE5]/60">
                          <p className="text-[10px] font-bold text-[#30363D] uppercase tracking-wider mb-2">
                            Key Deliverables:
                          </p>
                          <ul className="space-y-1">
                            {service.deliverables.slice(0, 2).map((del, i) => (
                              <li key={i} className="text-[11px] text-[#505B66] flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 mt-4 border-t border-[#D8DEE5] flex items-center justify-between gap-3">
                      <a
                        href={`/services/${divisionSlug}/${service.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/services/${divisionSlug}/${service.slug}`);
                        }}
                        className="text-xs font-semibold text-[#214E78] hover:text-[#173858] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Scope</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>

                      <button
                        onClick={() => onOpenQuoteModal(service.service_name)}
                        className="px-3 py-1.5 bg-[#F5F6F7] hover:bg-[#214E78] text-[#30363D] hover:text-white border border-[#D8DEE5] hover:border-[#214E78] rounded text-xs font-semibold transition-all cursor-pointer"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Diagnostic Callout */}
        <div className="mt-16 bg-white border border-[#D8DEE5] rounded-xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em]">
              Not Sure Which Service Matches Your Need?
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#30363D] mt-1">
              Start with the VERIFY Business Diagnostic Audit
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#505B66] leading-relaxed">
              We conduct a structured review of your current spreadsheets, statutory filings, tools, and debtor timelines. Identifies high-priority gaps and delivers an itemized scope before you commit capital.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenReviewModal('VERIFY Diagnostic Assessment Request')}
              className="w-full sm:w-auto px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded shadow cursor-pointer transition-all text-center"
            >
              Request Free First Assessment
            </button>
            <a
              href="/services/research-business-strategy/business-performance-analysis"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/services/research-business-strategy/business-performance-analysis');
              }}
              className="w-full sm:w-auto px-5 py-3 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] text-xs font-bold uppercase tracking-wider rounded border border-[#D8DEE5] cursor-pointer transition-all text-center"
            >
              Learn About VERIFY
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
