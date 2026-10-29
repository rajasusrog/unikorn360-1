import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  AlertCircle,
  Clock,
  MapPin,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import { SolutionItem } from '../data/solutionsData';
import { SERVICES_LIST, ENGAGEMENT_MODELS, BUSINESS_INFO } from '../data/servicesData';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface SolutionPageProps {
  solution: SolutionItem;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

export const SolutionPage: React.FC<SolutionPageProps> = ({
  solution,
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const includedServices = solution.serviceIds
    .map(id => SERVICES_LIST.find(s => s.id === id || s.id.includes(id)))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const recommendedModelObj = ENGAGEMENT_MODELS.find(m => m.id === solution.recommendedModel);

  const solutionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `https://www.unikorn360.com/solutions/${solution.slug}#webpage`,
        name: solution.title,
        description: solution.metaDescription,
        url: `https://www.unikorn360.com/solutions/${solution.slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'Unikorn360 Business Intelligence',
          url: 'https://www.unikorn360.com'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.unikorn360.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Solutions',
            item: 'https://www.unikorn360.com/solutions'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: solution.shortTitle,
            item: `https://www.unikorn360.com/solutions/${solution.slug}`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: solution.faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer
          }
        }))
      }
    ]
  };

  return (
    <article className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-12 sm:pt-16">
      <SEOHead
        title={solution.metaTitle}
        description={solution.metaDescription}
        canonicalPath={`/solutions/${solution.slug}`}
        schema={solutionSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Solutions', path: '/solutions' },
          { label: solution.shortTitle }
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="relative py-12 lg:py-16 border-b border-[#D8DEE5] bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] uppercase font-mono tracking-[0.2em] text-[#A57C35] mb-4">
              <span>Solution Pathway</span>
              <span className="text-[#D8DEE5]">•</span>
              <span>Recommended Tier: {solution.recommendedModel.toUpperCase()}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight leading-[1.15]">
              {solution.title}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-[#214E78] font-semibold leading-relaxed">
              {solution.heroTagline}
            </p>

            <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed">
              {solution.solutionOverview}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenReviewModal(`Solution: ${solution.shortTitle}`)}
                className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs uppercase tracking-[0.15em] font-bold rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{solution.ctaText}</span>
              </button>

              <button
                onClick={() => onOpenQuoteModal(solution.shortTitle)}
                className="px-6 py-3 bg-white border border-[#D8DEE5] hover:border-[#214E78] text-[#30363D] hover:text-[#214E78] text-xs uppercase tracking-[0.15em] font-bold rounded shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Written Proposal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. Core Problem Statement */}
            <section className="p-6 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-600 font-bold block mb-1">
                The Operational Problem
              </span>
              <h2 className="text-xl font-bold text-[#30363D] mb-3">
                Why Businesses Struggle at This Stage
              </h2>
              <p className="text-xs sm:text-sm text-[#505B66] leading-relaxed">
                {solution.problemStatement}
              </p>
            </section>

            {/* 2. Specific Challenges Solved */}
            <section>
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Root-Cause Resolution
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Specific Friction Points We Eliminate
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solution.challengesSolved.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs">
                    <h3 className="text-xs font-bold text-[#30363D] mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#214E78]"></span>
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#505B66] leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Step-by-Step Execution Roadmap */}
            <section>
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Structured Pathway
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Step-by-Step Implementation Roadmap
                </h2>
              </div>

              <div className="space-y-3">
                {solution.stepByStepRoadmap.map((step, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#D8DEE5] rounded-lg flex items-start gap-3.5 shadow-2xs">
                    <span className="w-7 h-7 bg-[#E9EDF0] text-[#214E78] font-mono text-xs font-bold rounded flex items-center justify-center shrink-0">
                      0{step.step}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#30363D] mb-0.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#505B66] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Deliverables */}
            <section>
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Tangible Outcomes
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Key Deliverables
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {solution.keyDeliverables.map((deliv, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-[#D8DEE5] rounded-lg flex items-center gap-2.5 shadow-2xs">
                    <FileCheck className="w-4 h-4 text-[#214E78] shrink-0" />
                    <span className="text-xs font-semibold text-[#30363D]">{deliv}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. FAQs */}
            <section>
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Common Questions
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-2.5">
                {solution.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-[#D8DEE5] rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-[#F5F6F7] transition-colors cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className="text-xs sm:text-sm font-bold text-[#30363D]">
                          {faq.question}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#214E78] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#D8DEE5] text-xs text-[#505B66] leading-relaxed">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            
            {/* Recommended Model Card */}
            {recommendedModelObj && (
              <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                  Recommended Model
                </span>
                <h3 className="text-base font-bold text-[#30363D]">
                  Tier {recommendedModelObj.name}
                </h3>
                <p className="text-xs text-[#214E78] font-semibold mt-0.5">
                  {recommendedModelObj.tagline}
                </p>
                <p className="text-xs text-[#505B66] mt-2 leading-relaxed">
                  {recommendedModelObj.description}
                </p>

                <button
                  onClick={() => onOpenReviewModal(`Tier: ${recommendedModelObj.name} (${solution.shortTitle})`)}
                  className="w-full mt-4 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-xs"
                >
                  <span>Select {recommendedModelObj.name} Tier</span>
                </button>
              </div>
            )}

            {/* Linked Services */}
            {includedServices.length > 0 && (
              <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] mb-3">
                  Underlying Services
                </h4>
                <div className="space-y-2">
                  {includedServices.map((svc) => (
                    <a
                      key={svc.id}
                      href={`/services/${svc.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/services/${svc.id}`);
                      }}
                      className="block p-2.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded transition-all"
                    >
                      <p className="text-xs font-semibold text-[#30363D] flex items-center justify-between">
                        <span>{svc.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#505B66]" />
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Contact */}
            <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg text-xs text-[#505B66] space-y-2.5 shadow-2xs">
              <strong className="text-[#30363D] block text-xs">Business &amp; Technology Advisory Desk</strong>
              <p>Advisory helpline: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#214E78] font-bold">{BUSINESS_INFO.phone}</a></p>
              <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#214E78] font-bold">{BUSINESS_INFO.email}</a></p>
              <p className="text-[11px] text-[#505B66]">Registered Office: {BUSINESS_INFO.address.full}</p>
            </div>

          </aside>

        </div>
      </div>
    </article>
  );
};
