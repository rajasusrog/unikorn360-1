import React, { useState, useEffect } from 'react';
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
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { servicesDb } from '../lib/supabase';
import { ServiceDivision, ServiceCatalogItem } from '../types/database';
import { BUSINESS_INFO } from '../data/servicesData';

interface DivisionPageProps {
  divisionSlug: string;
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

export const DivisionPage: React.FC<DivisionPageProps> = ({
  divisionSlug,
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [division, setDivision] = useState<ServiceDivision | null>(null);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [allDivisions, setAllDivisions] = useState<ServiceDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchDivisionData() {
      setLoading(true);
      setNotFound(false);
      try {
        const divs = await servicesDb.getDivisions();
        setAllDivisions(divs);

        const result = await servicesDb.getDivisionBySlug(divisionSlug);
        if (!result) {
          setNotFound(true);
          setDivision(null);
          setServices([]);
        } else {
          setDivision(result.division);
          setServices(result.services);
        }
      } catch (err) {
        console.error('Error fetching division data', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDivisionData();
  }, [divisionSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#214E78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-wider text-[#505B66] font-semibold">Loading Division...</p>
        </div>
      </div>
    );
  }

  // Handle Missing or Unknown Division (Strict 404 behavior - never fallback to first record)
  if (notFound || !division) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-[#A57C35] mx-auto mb-4" />
          <h1 className="text-xl font-bold font-serif text-[#30363D]">Division Not Found</h1>
          <p className="text-xs text-[#505B66] mt-2 leading-relaxed">
            The service division <code className="bg-[#F5F6F7] px-1.5 py-0.5 rounded text-[#214E78]">/services/{divisionSlug}</code> does not exist or has not been published yet.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/services')}
              className="w-full py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Browse All 8 Divisions
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] text-xs font-semibold rounded border border-[#D8DEE5] transition-colors cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = DIVISION_ICONS[division.slug] || Briefcase;
  const publishedCount = services.length;

  return (
    <div className="bg-[#F5F6F7] min-h-screen">
      <SEOHead
        title={division.seo_title || `${division.name} Services | Unikorn360`}
        description={division.seo_description || division.short_description}
        canonicalUrl={`https://www.unikorn360.com/services/${division.slug}`}
      />

      {/* Division Hero Header */}
      <section className="bg-white border-b border-[#D8DEE5] pt-10 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: division.name, current: true }
            ]}
          />

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#214E78]/5 border border-[#214E78]/20 rounded text-[#214E78] text-xs font-semibold uppercase tracking-wider mb-4">
                <IconComponent className="w-4 h-4 text-[#214E78]" />
                <span>Division: {division.name}</span>
                <span className="text-[#D8DEE5]">|</span>
                <span className="text-[#A57C35] font-bold">{publishedCount} {publishedCount === 1 ? 'Service' : 'Services'} Published</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
                {division.name}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
                {division.full_description || division.short_description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#505B66]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                  <span>Itemized Scope of Work</span>
                </span>
                <span className="text-[#D8DEE5]">|</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                  <span>No Lock-In Hidden Fees</span>
                </span>
                <span className="text-[#D8DEE5]">|</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                  <span>Remote &amp; In-Person Engagements</span>
                </span>
              </div>
            </div>

            {/* Quick Enquiry Card */}
            <div className="bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl p-6 lg:w-80 shrink-0">
              <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
                Advisory Desk
              </span>
              <h3 className="text-sm font-bold text-[#30363D]">
                Consult on {division.name} Requirements
              </h3>
              <p className="text-xs text-[#505B66] mt-1.5 leading-relaxed">
                Direct discussion with founder S. Rajkumar to structure scope and deliverables.
              </p>
              <button
                onClick={() => onOpenReviewModal(`Division Discussion: ${division.name}`)}
                className="mt-4 w-full py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded shadow transition-all cursor-pointer"
              >
                Discuss {division.name}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Division Switcher Bar */}
      <section className="bg-white border-b border-[#D8DEE5] py-2 overflow-x-auto scrollbar-none sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#505B66] whitespace-nowrap mr-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#A57C35]" />
            <span>Switch Division:</span>
          </span>
          {allDivisions.map((d) => (
            <button
              key={d.id}
              onClick={() => onNavigate(`/services/${d.slug}`)}
              className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors cursor-pointer ${
                d.slug === division.slug
                  ? 'bg-[#214E78] text-white'
                  : 'text-[#505B66] hover:text-[#30363D] hover:bg-[#F5F6F7]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em]">
              Published Delivery Capabilities
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#30363D] mt-1">
              Available Services in {division.name}
            </h2>
          </div>
          <p className="text-xs text-[#505B66]">
            Showing {publishedCount} published {publishedCount === 1 ? 'service' : 'services'}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border border-[#D8DEE5] rounded-xl p-12 text-center max-w-lg mx-auto">
            <HelpCircle className="w-12 h-12 text-[#505B66] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#30363D]">No Services Published Yet</h3>
            <p className="text-xs text-[#505B66] mt-2">
              Services under {division.name} are currently undergoing internal scoping and verification. Check back shortly or discuss custom requirements directly.
            </p>
            <button
              onClick={() => onOpenReviewModal(`Custom Scope Enquiry: ${division.name}`)}
              className="mt-5 px-5 py-2.5 bg-[#214E78] text-white text-xs font-bold uppercase tracking-wider rounded"
            >
              Request Custom Scope
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const approvedPackage = service.packages?.find(p => p.approval_status === 'approved');

              return (
                <div
                  key={service.id}
                  className="bg-white border border-[#D8DEE5] rounded-xl p-6 hover:border-[#214E78] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Price Header / Type */}
                    <div className="flex items-center justify-between mb-3 text-[11px]">
                      <span className="text-[#A57C35] font-bold uppercase tracking-wider">
                        {approvedPackage ? (
                          approvedPackage.price_type === 'starting-from' && approvedPackage.price
                            ? `Starting from ₹${approvedPackage.price.toLocaleString('en-IN')}`
                            : approvedPackage.price_type === 'starting-from'
                            ? 'Approved Starting Pricing'
                            : 'Pre-Scoped Package'
                        ) : (
                          'Scope-Based Quotation'
                        )}
                      </span>
                      <span className="text-[10px] bg-[#F5F6F7] text-[#505B66] px-2 py-0.5 rounded border border-[#D8DEE5]">
                        Verified
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className="text-lg font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                      <button
                        onClick={() => onNavigate(`/services/${division.slug}/${service.slug}`)}
                        className="text-left cursor-pointer hover:underline"
                      >
                        {service.service_name}
                      </button>
                    </h3>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-[#505B66] line-clamp-3 leading-relaxed">
                      {service.short_description}
                    </p>

                    {/* Deliverables snippet */}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#D8DEE5]/60">
                        <p className="text-[10px] font-bold text-[#30363D] uppercase tracking-wider mb-2">
                          Primary Deliverables:
                        </p>
                        <ul className="space-y-1.5">
                          {service.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-xs text-[#505B66] flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-6 border-t border-[#D8DEE5] flex items-center justify-between gap-3">
                    <button
                      onClick={() => onNavigate(`/services/${division.slug}/${service.slug}`)}
                      className="text-xs font-bold text-[#214E78] hover:text-[#173858] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore Scope</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => onOpenQuoteModal(service.service_name)}
                      className="px-3.5 py-1.5 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to All Services Navigation */}
        <div className="mt-16 pt-8 border-t border-[#D8DEE5] flex items-center justify-between">
          <button
            onClick={() => onNavigate('/services')}
            className="flex items-center gap-2 text-xs font-semibold text-[#505B66] hover:text-[#214E78] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All 8 Divisions</span>
          </button>

          <button
            onClick={() => onOpenReviewModal(`General ${division.name} Consultation`)}
            className="text-xs font-bold text-[#214E78] hover:underline cursor-pointer"
          >
            Schedule Assessment Meeting →
          </button>
        </div>
      </section>
    </div>
  );
};
