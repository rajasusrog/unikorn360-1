import React, { useEffect, useState } from 'react';
import { 
  Compass, 
    RotateCcw, 
    Globe, 
  BarChart3, 
  AppWindow, 
  Cpu, 
  Briefcase, 
  ShieldCheck, 
  HelpCircle,
    MessageSquare
} from 'lucide-react';
import { getSeedDivisionsWithCounts, getSeedPublishedServices } from '../data/seedData';
import { servicesDb, isRemoteSupabaseConfigured } from '../lib/supabase';
import type { ServiceCatalogItem, ServiceDivision } from '../types/database';

interface ServiceFinderWizardProps {
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
  onNavigate: (path: string) => void;
}

const PRIMARY_AREAS = [
  { id: 'websites', label: 'Websites & Industrial Web Presence', icon: Globe, desc: 'B2B showcase, contractor website, company portfolio' },
  { id: 'ecommerce', label: 'E-Commerce & Digital Catalogues', icon: Globe, desc: 'Online order portal, wholesale dealer pricing, shopping cart' },
  { id: 'custom-apps', label: 'Custom Apps & Business Software', icon: AppWindow, desc: 'Quotation builder, CRM lead pipeline, billing system' },
  { id: 'dashboards', label: 'Business Intelligence & Dashboards', icon: BarChart3, desc: 'Consolidated sales, aged debtors, inventory, and margin cockpits' },
  { id: 'automation', label: 'AI & Workflow Automation', icon: Cpu, desc: 'WhatsApp order notifications, invoice OCR, paperless pipelines' },
  { id: 'operations', label: 'Business Operations & SOP Consulting', icon: Briefcase, desc: 'Standard operating procedures, pricing strategy, digital document vaults' },
  { id: 'compliance', label: 'Finance, Loans & Regulatory Compliance', icon: ShieldCheck, desc: 'Bank DPRs, CMA data, Udyam MSME, GST filings, factory licences' },
  { id: 'dont-know', label: 'Help Me Identify What We Need', icon: HelpCircle, desc: 'Discuss our operational bottlenecks in an assessment meeting' }
];

const BUSINESS_TYPES = [
  { id: 'manufacturing', label: 'Manufacturing & Engineering', desc: 'Machine shops, fabrication, plastics, component makers' },
  { id: 'trading', label: 'Trading & Wholesale Distribution', desc: 'Hardware, building supplies, FMCG, multi-godown stock' },
  { id: 'leather', label: 'Leather, Tannery & Footwear', desc: 'Tanneries, shoe factories, component workshops' },
  { id: 'cctv-services', label: 'Technical Services & Contractors', desc: 'CCTV installation, HVAC, security, electrical, AMC services' },
  { id: 'food', label: 'Food Processing & Agro', desc: 'Mills, packaged goods, beverage manufacturing' },
  { id: 'startup', label: 'New Business / First-Time Venture', desc: 'Concept stage or expanding into new industrial line' }
];

const BOTTLENECKS = [
  { id: 'manual-calc', label: 'Quotation & pricing take too long', desc: 'Manual spreadsheet calculations bottleneck sales responses' },
  { id: 'lack-visibility', label: 'No real-time numbers on cash & debtors', desc: 'Cannot see who owes money or actual monthly cash margins' },
  { id: 'inquiry-leak', label: 'Inquiries get lost across personal chats', desc: 'No central place to track leads from WhatsApp, phone, or web' },
  { id: 'no-online-credibility', label: 'Outdated or missing web presence', desc: 'Losing institutional, B2B, or export deals to competitors' },
  { id: 'double-entry', label: 'Staff re-typing data across Excel and books', desc: 'Too much time wasted copying details between departments' },
  { id: 'statutory-stress', label: 'Bank loan paperwork or GST compliance friction', desc: 'Need bankable DPR, CMA data, or license clearance' }
];

export const ServiceFinderWizard: React.FC<ServiceFinderWizardProps> = ({
  onOpenReviewModal,
  onOpenQuoteModal,
  onNavigate
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [availableServices, setAvailableServices] = useState<ServiceCatalogItem[]>(() => getSeedPublishedServices());
  const [availableDivisions, setAvailableDivisions] = useState<ServiceDivision[]>(() => getSeedDivisionsWithCounts());
  const [selectedBottleneck, setSelectedBottleneck] = useState<string>('');

  const handleSelectArea = (areaId: string) => {
    setSelectedArea(areaId);
    setStep(2);
  };

  const handleSelectBusinessType = (_typeId: string) => {
    setStep(3);
  };

  const handleSelectBottleneck = (bottleneckId: string) => {
    setSelectedBottleneck(bottleneckId);
    setStep(4);
  };

  useEffect(() => {
    if (!isRemoteSupabaseConfigured) return;

    let cancelled = false;
    Promise.all([servicesDb.getDivisions(), servicesDb.getAllPublishedServices()])
      .then(([divisions, services]) => {
        if (cancelled) return;
        setAvailableDivisions(divisions);
        setAvailableServices(services);
      })
      .catch((error) => {
        console.warn('Could not load published services for the service finder:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = () => {
    setStep(1);
    setSelectedArea('');
    setSelectedBottleneck('');
  };

  // Compute recommendation
  const getRecommendation = () => {
    let pathwayTitle = 'Business Requirement Review';
    let summaryRationale = '';
    let matchedServiceSlugs: string[] = [];
    let recommendedDivisionSlug = 'research-business-strategy';

    if (selectedArea === 'websites' || selectedBottleneck === 'no-online-credibility') {
      pathwayTitle = 'Website Development';
      recommendedDivisionSlug = 'websites-software';
      summaryRationale = 'You need a clear business website that explains your offer, shows relevant products or services and captures customer enquiries.';
      matchedServiceSlugs = ['website-development', 'api-system-integration'];
    } else if (selectedArea === 'ecommerce') {
      pathwayTitle = 'E-commerce and Online Ordering';
      recommendedDivisionSlug = 'websites-software';
      summaryRationale = 'You need customers or dealers to browse a catalogue, submit orders and use the agreed payment or enquiry process.';
      matchedServiceSlugs = ['ecommerce-development', 'api-system-integration'];
    } else if (selectedArea === 'custom-apps' || selectedBottleneck === 'manual-calc') {
      pathwayTitle = 'Custom Business Software';
      recommendedDivisionSlug = 'websites-software';
      summaryRationale = 'You need a browser-based tool to manage a business process such as quotations, job tracking, stock or customer access.';
      matchedServiceSlugs = ['custom-web-applications', 'mobile-app-development'];
    } else if (selectedArea === 'dashboards' || selectedBottleneck === 'lack-visibility') {
      pathwayTitle = 'Business Dashboards and Reporting';
      recommendedDivisionSlug = 'research-business-strategy';
      summaryRationale = 'You need agreed business numbers—such as sales, stock, receivables or margins—organised into a reporting view for management.';
      matchedServiceSlugs = ['business-dashboards-reporting-systems', 'business-performance-analysis'];
    } else if (selectedArea === 'automation' || selectedBottleneck === 'double-entry' || selectedBottleneck === 'inquiry-leak') {
      pathwayTitle = 'AI and Workflow Automation';
      recommendedDivisionSlug = 'ai-automation-business-systems';
      summaryRationale = 'You want to reduce repeated data entry, route enquiries or automate selected customer and staff notifications.';
      matchedServiceSlugs = ['ai-chatbots-knowledge-assistants', 'business-workflow-automation', 'whatsapp-business-automation'];
    } else if (selectedArea === 'operations') {
      pathwayTitle = 'Business Operations and Growth Advisory';
      recommendedDivisionSlug = 'research-business-strategy';
      summaryRationale = 'You need help reviewing a business process, setting priorities, defining operating measures or preparing an improvement plan.';
      matchedServiceSlugs = ['startup-growth-consulting', 'business-performance-analysis'];
    } else if (selectedArea === 'compliance' || selectedBottleneck === 'statutory-stress') {
      pathwayTitle = 'Business Setup and Documentation';
      recommendedDivisionSlug = 'business-setup-documentation';
      summaryRationale = 'You need support preparing business registration, GST/Udyam, government-scheme, project-report or property-documentation records.';
      matchedServiceSlugs = ['business-registration-assistance', 'gst-udyam-assistance', 'government-scheme-application-support', 'dpr-loan-documentation'];
    } else {
      pathwayTitle = 'Business Requirement Review';
      recommendedDivisionSlug = 'research-business-strategy';
      summaryRationale = 'You are unsure which service fits. We can review the current process, records and business goal before recommending a defined scope.';
      matchedServiceSlugs = ['business-performance-analysis', 'business-planning-financial-feasibility'];
    }

    const matchedServices: ServiceCatalogItem[] = matchedServiceSlugs
      .map((slug) => availableServices.find((service) => service.slug === slug))
      .filter((service): service is ServiceCatalogItem => Boolean(service));

    return {
      pathwayTitle,
      summaryRationale,
      matchedServices,
      recommendedDivisionSlug,
      recommendedDivision: availableDivisions.find((division) => division.slug === recommendedDivisionSlug) || null
    };
  };

  const recommendation = step === 4 ? getRecommendation() : null;

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-[#E4DFD5]" id="service-finder">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C49A36] uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-[#0B1426]" />
            <span>Interactive Service Finder</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight">
            Find the Right System or Service for Your Business
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#526176]">
            Answer 3 quick questions about your business, software requirements, and current bottlenecks to see tailored recommendations.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step === i
                    ? 'w-10 bg-[#0B1426]'
                    : step > i
                    ? 'w-5 bg-[#C49A36]'
                    : 'w-4 bg-[#E4DFD5]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-[#F6F5F1] border border-[#E4DFD5] rounded-xl p-6 sm:p-8 shadow-xs">

          {/* STEP 1: Primary Capability / Area */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#E4DFD5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36]">
                    Step 1 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1426]">
                    What primary system or capability do you want to build or improve?
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {PRIMARY_AREAS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectArea(item.id)}
                      className="p-3.5 text-left bg-white border border-[#E4DFD5] hover:border-[#0B1426] rounded-lg transition-all group cursor-pointer flex items-start gap-3 shadow-2xs hover:shadow-xs"
                    >
                      <div className="p-2 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] rounded-lg group-hover:bg-[#0B1426] group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0B1426]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#526176] mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Business Type */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#E4DFD5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36]">
                    Step 2 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1426]">
                    What industry / sector does your business operate in?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#0B1426] hover:text-[#C49A36] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BUSINESS_TYPES.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => handleSelectBusinessType(b.id)}
                    className="p-3.5 text-left bg-white border border-[#E4DFD5] hover:border-[#0B1426] rounded-lg transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <p className="text-xs font-bold text-[#0B1426]">
                      {b.label}
                    </p>
                    <p className="text-xs text-[#526176] mt-0.5 leading-snug">
                      {b.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Operational Bottleneck */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#E4DFD5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36]">
                    Step 3 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1426]">
                    What is your biggest operational bottleneck right now?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-[#0B1426] hover:text-[#C49A36] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BOTTLENECKS.map((btn) => (
                  <button
                    type="button"
                    key={btn.id}
                    onClick={() => handleSelectBottleneck(btn.id)}
                    className="p-3.5 text-left bg-white border border-[#E4DFD5] hover:border-[#0B1426] rounded-lg transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <p className="text-xs font-bold text-[#0B1426]">
                      {btn.label}
                    </p>
                    <p className="text-xs text-[#526176] mt-0.5 leading-snug">
                      {btn.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Results & Recommendations */}
          {step === 4 && recommendation && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block">
                    Recommended Architecture
                  </span>
                  <h3 className="text-lg font-bold text-[#0B1426]">
                    {recommendation.pathwayTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#526176] hover:text-[#0B1426] flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#E4DFD5]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start Over</span>
                </button>
              </div>

              <div className="p-4 bg-white border border-[#E4DFD5] rounded-lg">
                <p className="text-xs text-[#263449] leading-relaxed">
                  {recommendation.summaryRationale}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider mb-3">
                  Published services matching this requirement
                </h4>
                {recommendation.matchedServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendation.matchedServices.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 bg-white border border-[#E4DFD5] rounded-lg space-y-2 hover:border-[#0B1426] transition-colors"
                      >
                        <h5 className="text-xs font-bold text-[#0B1426]">{service.service_name}</h5>
                        <p className="text-xs text-[#526176] line-clamp-2">{service.short_description}</p>
                        <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E4DFD5]">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/services/${recommendation.recommendedDivisionSlug}/${service.slug}`)}
                            className="text-[#0B1426] hover:text-[#C49A36] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            View Scope →
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenQuoteModal(service.service_name)}
                            className="px-3 py-1.5 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Get Quote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#E4DFD5] bg-white p-4">
                    <p className="text-xs text-[#526176]">
                      Your requirement maps to the {recommendation.recommendedDivision?.name || 'relevant'} service area. Individual service listings are not published yet; tell us what you need and we can review a suitable scope.
                    </p>
                    {recommendation.recommendedDivision && (
                      <button
                        type="button"
                        onClick={() => onNavigate(`/services/${recommendation.recommendedDivision.slug}`)}
                        className="mt-3 text-xs font-semibold text-[#0B1426] hover:text-[#C49A36] hover:underline"
                      >
                        Browse {recommendation.recommendedDivision.name} →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Banner */}
              <div className="p-5 bg-white border border-[#E4DFD5] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#0B1426]">
                    Ready to evaluate your exact specifications?
                  </h4>
                  <p className="text-xs text-[#526176]">
                    Book a no-cost initial assessment meeting to discuss timelines and written quotation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenReviewModal(`Finder Result: ${recommendation.pathwayTitle}`)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss This Project</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
};
