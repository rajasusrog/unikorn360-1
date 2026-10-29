import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Building, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { ServiceItem } from '../types';
import { CATEGORY_INFO, SERVICES_LIST, BUSINESS_INFO } from '../data/servicesData';
import { EXTENDED_SERVICE_MAP } from '../data/extendedServiceDetails';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface ServiceLandingPageProps {
  service: ServiceItem;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

export const ServiceLandingPage: React.FC<ServiceLandingPageProps> = ({
  service,
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Get category info
  const category = CATEGORY_INFO[service.category] || {
    title: 'Business Advisory',
    subtitle: 'Consulting & Systems',
    description: ''
  };

  // Check for extended SEO meta and FAQs
  const extended = EXTENDED_SERVICE_MAP[service.id] || {
    metaTitle: `${service.title} | Unikorn360`,
    metaDescription: `${service.description} Dedicated business intelligence and systems support from Unikorn360.`,
    canonicalSlug: service.id,
    ctaButtonText: `Request ${service.title} Quote`,
    processSteps: [
      { step: 1, title: 'Requirements & Initial Scoping', description: 'Gather specifications, current spreadsheets, or existing paperwork.' },
      { step: 2, title: 'Architecture & Written Quotation', description: 'Define the itemized scope of work, technical architecture, and transparent quote.' },
      { step: 3, title: 'Execution, Build & Department Follow-up', description: 'Develop custom features or process filings with direct status check-ins.' },
      { step: 4, title: 'Deployment, Training & Ongoing Handover', description: 'Deliver live system or certificate copy and train staff on daily operations.' }
    ],
    faqs: [
      {
        question: `How does Unikorn360 execute ${service.title}?`,
        answer: `We provide complete end-to-end execution: requirements mapping, transparent written quotation, milestone delivery, and ongoing support. You receive regular status updates and a dedicated point of contact.`
      },
      {
        question: 'What details are required to get started?',
        answer: 'Typically, an overview of your current business setup, specific operational pain points, and any relevant documents or sample spreadsheets. We provide a clear checklist during your initial discussion.'
      },
      {
        question: 'How are project quotations structured?',
        answer: 'We provide an itemized written quotation before starting any work. Pricing is based strictly on pre-defined scope and deliverables with zero hidden surprise charges.'
      },
      {
        question: 'Do we receive ongoing maintenance and support?',
        answer: 'Yes. Once deployed, our systems and regulatory filings can be transitioned into ongoing monthly support under our PROTECT or GUARDIAN retainers.'
      }
    ],
    localContext: 'Supporting manufacturing units, traders, contractors, and growing enterprises.'
  };

  // Find related service objects
  const relatedServiceItems = (service.relatedServices || [])
    .map(relId => SERVICES_LIST.find(s => s.id === relId || s.id.includes(relId)))
    .filter((s): s is ServiceItem => s !== undefined)
    .slice(0, 3);

  // Construct JSON-LD Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `https://www.unikorn360.com/services/${service.id}#service`,
        name: service.title,
        serviceType: category.title,
        description: service.description,
        provider: {
          '@type': 'LocalBusiness',
          name: 'Unikorn360 Business Intelligence',
          telephone: BUSINESS_INFO.phoneRaw,
          email: BUSINESS_INFO.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: '1st Floor, Shop No. 3, VK Complex, P.J.N. Road, Kamarajapuram',
            addressLocality: 'Vaniyambadi',
            addressRegion: 'Tamil Nadu',
            postalCode: '635751',
            addressCountry: 'IN'
          }
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'INR',
          description: 'Quoted by written scope before engagement with zero hidden surprises'
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
            name: 'Services',
            item: 'https://www.unikorn360.com/services'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: `https://www.unikorn360.com/services/${service.id}`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: extended.faqs.map(f => ({
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
        title={extended.metaTitle}
        description={extended.metaDescription}
        canonicalPath={`/services/${service.id}`}
        schema={serviceSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Services', path: '/services' },
          { label: category.title, path: '/services' },
          { label: service.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero Section */}
      <header className="relative py-12 lg:py-16 border-b border-[#D8DEE5] bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] uppercase font-mono tracking-[0.15em] text-[#A57C35] mb-4">
              <span>Domain: {category.title}</span>
              <span className="text-[#D8DEE5]">•</span>
              <span>Pre-Scoped Quotation</span>
            </div>

            {/* Exactly ONE H1 per page */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight leading-[1.15]">
              {service.title}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-[#214E78] font-semibold leading-relaxed">
              {service.subtitle}
            </p>

            <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed">
              {service.description}
            </p>

            {/* Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#505B66]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <Clock className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Typical Timeline: <strong className="text-[#30363D]">{service.typicalTimeline}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Pre-Scoped Written Quotation Terms</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded">
                <MapPin className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Remote &amp; In-Person Consultations</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenQuoteModal(service.title)}
                id="service-cta-quote"
                className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs uppercase tracking-[0.15em] font-bold rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{extended.ctaButtonText}</span>
              </button>

              <button
                onClick={() => onOpenReviewModal(service.title)}
                id="service-cta-review"
                className="px-6 py-3 bg-white border border-[#D8DEE5] hover:border-[#214E78] text-[#30363D] hover:text-[#214E78] text-xs uppercase tracking-[0.15em] font-bold rounded shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Discuss In Initial Review</span>
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
            
            {/* 1. What We Handle (Scope of Work) */}
            <section aria-labelledby="scope-heading">
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Deliverable Framework
                </span>
                <h2 id="scope-heading" className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  What Unikorn360 Handles
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.scopeList.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#D8DEE5] rounded-lg flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#505B66] leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Concrete Deliverables */}
            <section aria-labelledby="deliverables-heading">
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Tangible Outcomes
                </span>
                <h2 id="deliverables-heading" className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  What You Receive
                </h2>
              </div>

              <div className="space-y-2.5">
                {service.deliverables.map((deliv, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#D8DEE5] rounded-lg flex items-center gap-3 shadow-2xs">
                    <FileCheck className="w-5 h-5 text-[#214E78] shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#30363D]">
                        {deliv}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Step-by-Step Process */}
            <section aria-labelledby="process-heading">
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Execution Pathway
                </span>
                <h2 id="process-heading" className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  How the Process Works
                </h2>
              </div>

              <div className="space-y-3">
                {extended.processSteps.map((step, idx) => (
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

            {/* 4. Who Needs This */}
            <section aria-labelledby="audience-heading">
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Target Profiles
                </span>
                <h2 id="audience-heading" className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Who Needs This Service
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {service.targetAudience.map((audience, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white border border-[#D8DEE5] rounded text-xs text-[#30363D] font-medium shadow-2xs"
                  >
                    {audience}
                  </span>
                ))}
              </div>

              {extended.localContext && (
                <div className="mt-4 p-4 bg-white border-l-4 border-[#214E78] rounded-r text-xs text-[#505B66]">
                  <strong className="text-[#30363D] font-semibold block mb-0.5">Regional Context: </strong>
                  <p>{extended.localContext}</p>
                </div>
              )}
            </section>

            {/* 5. FAQs Section */}
            <section aria-labelledby="faqs-heading">
              <div className="border-b border-[#D8DEE5] pb-3 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A57C35] block mb-1">
                  Common Questions
                </span>
                <h2 id="faqs-heading" className="text-xl sm:text-2xl font-bold text-[#30363D]">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-2.5">
                {extended.faqs.map((faq, idx) => {
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

          {/* Sidebar Column */}
          <aside className="space-y-6">
            
            {/* Quote Request Card */}
            <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg shadow-sm">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                Transparent Engagement
              </span>
              <h3 className="text-lg font-bold text-[#30363D] mb-1.5">
                Get a Pre-Scoped Quote
              </h3>
              <p className="text-xs text-[#505B66] mb-5 leading-relaxed">
                Receive an itemized written quote with deliverables and timelines before starting work.
              </p>

              <button
                onClick={() => onOpenQuoteModal(service.title)}
                className="w-full py-3 bg-[#214E78] hover:bg-[#173858] text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Request Custom Quote</span>
              </button>

              <button
                onClick={() => onOpenReviewModal(service.title)}
                className="w-full mt-2.5 py-2.5 bg-[#F5F6F7] border border-[#D8DEE5] text-[#30363D] hover:bg-white font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Initial Assessment Meeting</span>
              </button>
            </div>

            {/* Direct Contacts */}
            <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg text-xs text-[#505B66] space-y-3 shadow-2xs">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35]">
                Direct Advisory Desk
              </h4>
              <p className="leading-relaxed">
                Connect directly with our advisory desk. Remote sessions and registered office visits available.
              </p>

              <div className="space-y-2 text-xs">
                <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="flex items-center gap-2 text-[#214E78] hover:underline font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#214E78]" />
                  <span>{BUSINESS_INFO.phone}</span>
                </a>
                <a href={`mailto:${BUSINESS_INFO.email}`} className="flex items-center gap-2 text-[#214E78] hover:underline">
                  <Mail className="w-3.5 h-3.5 text-[#214E78]" />
                  <span>{BUSINESS_INFO.email}</span>
                </a>
                <div className="flex items-start gap-2 text-[#505B66]">
                  <MapPin className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                  <span>{BUSINESS_INFO.address.full}</span>
                </div>
              </div>
            </div>

            {/* Related Services */}
            {relatedServiceItems.length > 0 && (
              <div className="p-5 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] mb-3">
                  Related Services
                </h4>
                <div className="space-y-2">
                  {relatedServiceItems.map((rel) => (
                    <a
                      key={rel.id}
                      href={`/services/${rel.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/services/${rel.id}`);
                      }}
                      className="block p-2.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded transition-all group"
                    >
                      <p className="text-xs font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors flex items-center justify-between">
                        <span>{rel.title}</span>
                        <ChevronRight className="w-3 h-3 text-[#505B66]" />
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>
      </div>
    </article>
  );
};
