import React, { useState } from 'react';
import { 
  Compass, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Globe, 
  BarChart3, 
  AppWindow, 
  Cpu, 
  Briefcase, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { SERVICES_LIST } from '../data/servicesData';
import { ServiceItem } from '../types';

interface ServiceFinderWizardProps {
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (service: ServiceItem) => void;
  onSelectService: (service: ServiceItem) => void;
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
  onSelectService
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [selectedBottleneck, setSelectedBottleneck] = useState<string>('');

  const handleSelectArea = (areaId: string) => {
    setSelectedArea(areaId);
    setStep(2);
  };

  const handleSelectBusinessType = (typeId: string) => {
    setSelectedBusinessType(typeId);
    setStep(3);
  };

  const handleSelectBottleneck = (bottleneckId: string) => {
    setSelectedBottleneck(bottleneckId);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedArea('');
    setSelectedBusinessType('');
    setSelectedBottleneck('');
  };

  // Compute recommendation
  const getRecommendation = () => {
    let pathway: 'verify' | 'protect' | 'guardian' = 'verify';
    let pathwayTitle = 'VERIFY DIAGNOSTIC & SCOPING PATHWAY';
    let summaryRationale = '';
    let matchedServiceIds: string[] = [];

    if (selectedArea === 'websites' || selectedBottleneck === 'no-online-credibility') {
      pathway = 'verify';
      pathwayTitle = 'DIGITAL PRESENCE & B2B WEB ARCHITECTURE';
      summaryRationale = 'Your immediate priority is establishing a high-performance web presence that demonstrates technical capability and captures buyer inquiries directly.';
      matchedServiceIds = selectedBusinessType === 'cctv-services' 
        ? ['cctv-services-website', 'quotation-estimation-tools', 'modern-website']
        : ['modern-website', 'corporate-identity', 'crm-order-tracking'];
    } else if (selectedArea === 'ecommerce') {
      pathway = 'guardian';
      pathwayTitle = 'COMMERCE & DIGITAL ORDERING ARCHITECTURE';
      summaryRationale = 'You are looking to digitise product sales. We recommend scoping a custom B2B e-commerce platform with dealer pricing, catalog filters, and automated order confirmation.';
      matchedServiceIds = ['ecommerce-stores', 'inventory-billing-systems', 'whatsapp-order-notifications'];
    } else if (selectedArea === 'custom-apps' || selectedBottleneck === 'manual-calc') {
      pathway = 'verify';
      pathwayTitle = 'CUSTOM OPERATIONAL SOFTWARE PATHWAY';
      summaryRationale = 'Eliminate manual spreadsheet errors with a custom web application designed around your exact cost calculations, quotation templates, and order tracking.';
      matchedServiceIds = ['quotation-estimation-tools', 'crm-order-tracking', 'inventory-billing-systems'];
    } else if (selectedArea === 'dashboards' || selectedBottleneck === 'lack-visibility') {
      pathway = 'guardian';
      pathwayTitle = 'BUSINESS INTELLIGENCE & EXECUTIVE COCKPIT';
      summaryRationale = 'Consolidate multiple spreadsheets and accounting records into a single executive dashboard for real-time visibility into sales, aged debtors, and stock.';
      matchedServiceIds = ['custom-dashboards', 'inventory-sales-analytics', 'bookkeeping-mis'];
    } else if (selectedArea === 'automation' || selectedBottleneck === 'double-entry' || selectedBottleneck === 'inquiry-leak') {
      pathway = 'protect';
      pathwayTitle = 'AI & WORKFLOW AUTOMATION PATHWAY';
      summaryRationale = 'Automate repetitive staff communication, connect WhatsApp notifications to order milestones, and auto-route customer inquiries to sales reps.';
      matchedServiceIds = ['systems-automation', 'whatsapp-order-notifications', 'lead-inquiry-automation'];
    } else if (selectedArea === 'operations') {
      pathway = 'verify';
      pathwayTitle = 'BUSINESS OPERATIONS & CONSULTING PATHWAY';
      summaryRationale = 'Streamline internal processes with written Standard Operating Procedures (SOPs), margin economics scrutiny, and secure digital document rooms.';
      matchedServiceIds = ['standard-operating-procedures', 'business-structuring', 'digital-file-room'];
    } else if (selectedArea === 'compliance' || selectedBottleneck === 'statutory-stress') {
      pathway = 'protect';
      pathwayTitle = 'FINANCE, COMPLIANCE & BANK LOAN SUPPORT';
      summaryRationale = 'Address statutory licensing, build bank-ready Detailed Project Reports (DPR), CMA data for credit enhancements, or apply for government MSME subsidies.';
      matchedServiceIds = ['detailed-project-report', 'cma-data', 'gst-registration', 'government-subsidy-assistance'];
    } else {
      pathway = 'verify';
      pathwayTitle = 'SYSTEMS & OPERATIONS DISCOVERY';
      summaryRationale = 'An objective, no-cost diagnostic meeting to audit your existing tools, spreadsheets, and statutory records to pinpoint your highest-leverage software opportunities.';
      matchedServiceIds = ['custom-dashboards', 'quotation-estimation-tools', 'modern-website', 'detailed-project-report'];
    }

    const matchedServices = matchedServiceIds
      .map(id => SERVICES_LIST.find(s => s.id === id))
      .filter((s): s is ServiceItem => Boolean(s));

    return {
      pathway,
      pathwayTitle,
      summaryRationale,
      matchedServices
    };
  };

  const recommendation = step === 4 ? getRecommendation() : null;

  return (
    <section className="py-16 lg:py-20 bg-white border-b border-[#D8DEE5]" id="service-finder">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.15em] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Interactive Service Finder</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#30363D] tracking-tight">
            Find the Right System or Service for Your Business
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#505B66]">
            Answer 3 quick questions about your business, software requirements, and current bottlenecks to see tailored recommendations.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  step === i 
                    ? 'w-10 bg-[#214E78]' 
                    : step > i 
                    ? 'w-5 bg-[#A57C35]' 
                    : 'w-4 bg-[#D8DEE5]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg p-6 sm:p-8 shadow-sm">
          
          {/* STEP 1: Primary Capability / Area */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#D8DEE5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35]">
                    Step 1 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#30363D]">
                    What primary system or capability do you want to build or improve?
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {PRIMARY_AREAS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectArea(item.id)}
                      className="p-3.5 text-left bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded transition-all group cursor-pointer flex items-start gap-3 shadow-2xs hover:shadow-xs"
                    >
                      <div className="p-2 bg-[#F5F6F7] border border-[#D8DEE5] text-[#214E78] rounded group-hover:bg-[#214E78] group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-[#505B66] mt-0.5 leading-snug">
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
              <div className="border-b border-[#D8DEE5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35]">
                    Step 2 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#30363D]">
                    What industry / sector does your business operate in?
                  </h3>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BUSINESS_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBusinessType(b.id)}
                    className="p-3.5 text-left bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <p className="text-xs font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                      {b.label}
                    </p>
                    <p className="text-[11px] text-[#505B66] mt-0.5 leading-snug">
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
              <div className="border-b border-[#D8DEE5] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35]">
                    Step 3 of 3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#30363D]">
                    What is your biggest operational bottleneck right now?
                  </h3>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BOTTLENECKS.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => handleSelectBottleneck(btn.id)}
                    className="p-3.5 text-left bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <p className="text-xs font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                      {btn.label}
                    </p>
                    <p className="text-[11px] text-[#505B66] mt-0.5 leading-snug">
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
              <div className="flex items-center justify-between border-b border-[#D8DEE5] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block">
                    Recommended Architecture
                  </span>
                  <h3 className="text-lg font-bold text-[#30363D]">
                    {recommendation.pathwayTitle}
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-[#505B66] hover:text-[#214E78] flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded border border-[#D8DEE5]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start Over</span>
                </button>
              </div>

              <div className="p-4 bg-white border border-[#D8DEE5] rounded">
                <p className="text-xs text-[#505B66] leading-relaxed">
                  {recommendation.summaryRationale}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#30363D] uppercase tracking-wider mb-3">
                  Recommended Services &amp; Systems:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.matchedServices.map((service) => (
                    <div 
                      key={service.id} 
                      className="p-4 bg-white border border-[#D8DEE5] rounded space-y-2 hover:border-[#214E78] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-[#30363D]">
                          {service.title}
                        </h5>
                        <span className="text-[9px] font-mono font-bold uppercase text-[#214E78] px-1.5 py-0.5 bg-[#E9EDF0] rounded shrink-0">
                          {service.serviceType === 'custom-development' ? 'Custom Dev' : service.serviceType === 'consulting' ? 'Consulting' : 'Support'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#505B66] line-clamp-2">
                        {service.subtitle}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#D8DEE5]">
                        <button
                          onClick={() => onSelectService(service)}
                          className="text-[#214E78] hover:underline font-semibold text-[11px]"
                        >
                          View Scope →
                        </button>
                        <button
                          onClick={() => onOpenQuoteModal(service)}
                          className="px-3 py-1 bg-[#214E78] hover:bg-[#173858] text-white text-[10px] font-bold uppercase tracking-wider rounded"
                        >
                          Get Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-5 bg-white border border-[#D8DEE5] rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#30363D]">
                    Ready to evaluate your exact specifications?
                  </h4>
                  <p className="text-[11px] text-[#505B66]">
                    Book a no-cost initial assessment meeting to discuss timelines and written quotation.
                  </p>
                </div>
                <button
                  onClick={() => onOpenReviewModal(`Finder Result: ${recommendation.pathwayTitle}`)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-sm"
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
