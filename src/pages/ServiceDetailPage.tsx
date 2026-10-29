import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Clock, 
  Users, 
  Layers, 
  FileText, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  MessageSquare,
  Sparkles,
  Phone
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { WhatsAppSubmitButton } from '../components/WhatsAppSubmitButton';
import { servicesDb } from '../lib/supabase';
import { ServiceDivision, ServiceCatalogItem, ServicePackage } from '../types/database';
import { BUSINESS_INFO } from '../data/servicesData';

interface ServiceDetailPageProps {
  divisionSlug: string;
  serviceSlug: string;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  divisionSlug,
  serviceSlug,
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  const [data, setData] = useState<{
    service: ServiceCatalogItem;
    division: ServiceDivision;
    relatedServices: ServiceCatalogItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [legacyRedirectTarget, setLegacyRedirectTarget] = useState<string | null>(null);

  // Selected package for quick WhatsApp inquiry
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [isPreparingWhatsApp, setIsPreparingWhatsApp] = useState(false);
  const [whatsAppInitiated, setWhatsAppInitiated] = useState(false);

  // Active FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      setNotFound(false);
      setLegacyRedirectTarget(null);

      try {
        // First check if this slug is a legacy URL redirect
        const legacyTarget = servicesDb.resolveLegacyUrl(serviceSlug);
        if (legacyTarget && legacyTarget !== `/services/${divisionSlug}/${serviceSlug}`) {
          setLegacyRedirectTarget(legacyTarget);
        }

        const res = await servicesDb.getServiceByDivisionAndSlug(divisionSlug, serviceSlug);
        if (!res) {
          setNotFound(true);
          setData(null);
        } else {
          setData(res);
          // Auto-select first approved package if available
          const approved = res.service.packages?.find(p => p.approval_status === 'approved');
          if (approved) setSelectedPackage(approved);
        }
      } catch (err) {
        console.error('Error fetching service detail', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [divisionSlug, serviceSlug]);

  // Handle WhatsApp Submission with honest preparation feedback
  const handlePackageWhatsAppInquiry = (pkg?: ServicePackage) => {
    const targetPkg = pkg || selectedPackage;
    if (!data) return;

    if (!visitorName.trim() || !visitorPhone.trim()) {
      alert('Please enter your Name and Phone Number to prepare your WhatsApp enquiry.');
      return;
    }

    setIsPreparingWhatsApp(true);

    const messageLines = [
      `*UNIKORN360 — NEW SERVICE ENQUIRY*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *Division:* ${data.division.name}`,
      `• *Service:* ${data.service.service_name}`,
      targetPkg ? `• *Selected Package:* ${targetPkg.name}` : `• *Scope:* Custom Proposal`,
      targetPkg?.price ? `• *Estimated Budget:* ₹${targetPkg.price.toLocaleString('en-IN')}` : `• *Budget:* Custom Quotation`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Client Details:*`,
      `• Name: ${visitorName.trim()}`,
      `• Phone: ${visitorPhone.trim()}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Please share the detailed scope of work and scheduling options.`
    ];

    const encoded = encodeURIComponent(messageLines.join('\n'));
    const url = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encoded}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setIsPreparingWhatsApp(false);
      setWhatsAppInitiated(true);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#214E78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-wider text-[#505B66] font-semibold">Loading Service Details...</p>
        </div>
      </div>
    );
  }

  // Handle Missing or Unknown Service (Strict 404 behavior - never fallback to first record)
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 max-w-lg w-full text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-[#A57C35] mx-auto mb-4" />
          <h1 className="text-xl font-bold font-serif text-[#30363D]">Service Not Found</h1>
          <p className="text-xs text-[#505B66] mt-2 leading-relaxed">
            The requested service <code className="bg-[#F5F6F7] px-1.5 py-0.5 rounded text-[#214E78]">/services/{divisionSlug}/{serviceSlug}</code> is not in the published catalog or has been restructured.
          </p>

          {legacyRedirectTarget && (
            <div className="mt-4 p-3 bg-[#214E78]/5 border border-[#214E78]/20 rounded text-left">
              <p className="text-xs font-semibold text-[#214E78]">Looking for this service?</p>
              <p className="text-[11px] text-[#505B66] mt-0.5">This service has been migrated to a new location in the architecture:</p>
              <button
                onClick={() => onNavigate(legacyRedirectTarget)}
                className="mt-2 text-xs font-bold text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Continue to {legacyRedirectTarget}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onNavigate(`/services/${divisionSlug}`)}
              className="w-full py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Back to {divisionSlug.toUpperCase()} Division
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className="w-full py-2 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] text-xs font-semibold rounded border border-[#D8DEE5] transition-colors cursor-pointer"
            >
              Browse All Services Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { service, division, relatedServices } = data;

  // Generate Schema.org JSON-LD structured data for FAQ and Service
  const faqSchema = service.faqs && service.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.service_name,
    "description": service.short_description,
    "provider": {
      "@type": "LocalBusiness",
      "name": BUSINESS_INFO.brand,
      "telephone": BUSINESS_INFO.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": BUSINESS_INFO.address.line1,
        "addressLocality": BUSINESS_INFO.address.city,
        "addressRegion": BUSINESS_INFO.address.state,
        "postalCode": BUSINESS_INFO.address.pincode,
        "addressCountry": "IN"
      }
    }
  };

  return (
    <div className="bg-[#F5F6F7] min-h-screen">
      <SEOHead
        title={service.seo_title || `${service.service_name} | Unikorn360`}
        description={service.seo_description || service.short_description}
        canonicalUrl={`https://www.unikorn360.com/services/${division.slug}/${service.slug}`}
        structuredData={[serviceSchema, ...(faqSchema ? [faqSchema] : [])]}
      />

      {/* Hero Header */}
      <section className="bg-white border-b border-[#D8DEE5] pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: division.name, href: `/services/${division.slug}` },
              { label: service.service_name, current: true }
            ]}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 8 Cols: Title, Value Prop, Problem Solved */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-[#214E78]/10 text-[#214E78] text-[10px] font-bold uppercase tracking-wider rounded">
                  Division: {division.name}
                </span>
                <span className="px-2.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] text-[#505B66] text-[10px] font-semibold uppercase tracking-wider rounded">
                  Status: Published &amp; Verified
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
                {service.service_name}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
                {service.full_description || service.short_description}
              </p>

              {/* Problems Solved Section */}
              {service.problems_solved && service.problems_solved.length > 0 && (
                <div className="mt-8 p-5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl">
                  <p className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Business Friction We Eliminate</span>
                  </p>
                  <ul className="space-y-2">
                    {service.problems_solved.map((prob, i) => (
                      <li key={i} className="text-xs text-[#30363D] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A57C35] mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">{prob}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Customers & Core Benefits */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.target_customers && service.target_customers.length > 0 && (
                  <div className="p-4 bg-white border border-[#D8DEE5] rounded-lg">
                    <p className="text-[10px] font-bold text-[#214E78] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Target Enterprises</span>
                    </p>
                    <ul className="space-y-1 text-xs text-[#505B66]">
                      {service.target_customers.map((c, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#214E78]">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.benefits && service.benefits.length > 0 && (
                  <div className="p-4 bg-white border border-[#D8DEE5] rounded-lg">
                    <p className="text-[10px] font-bold text-[#214E78] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Key Strategic Benefits</span>
                    </p>
                    <ul className="space-y-1 text-xs text-[#505B66]">
                      {service.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Quick Enquiry Box */}
            <div className="lg:col-span-4 bg-white border border-[#214E78] rounded-xl p-6 shadow-md sticky top-24">
              <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
                Direct Consultation
              </span>
              <h3 className="text-lg font-serif font-bold text-[#30363D]">
                Enquire for {service.service_name}
              </h3>
              <p className="text-xs text-[#505B66] mt-1.5 leading-relaxed">
                Discuss exact requirements, timelines, and receive a pre-scoped written quotation.
              </p>

              {/* Quick Input Fields */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Mohammad / Ramesh"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:ring-1 focus:ring-[#214E78]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98848 XXXXX"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:ring-1 focus:ring-[#214E78]"
                  />
                </div>

                {selectedPackage && (
                  <div className="p-2.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-[11px] text-[#505B66]">
                    <span className="font-semibold text-[#30363D]">Package Selected:</span> {selectedPackage.name}
                    {selectedPackage.price && (
                      <span className="block text-[#214E78] font-bold">
                        ₹{selectedPackage.price.toLocaleString('en-IN')} ({selectedPackage.billing_period})
                      </span>
                    )}
                  </div>
                )}

                <WhatsAppSubmitButton
                  onClick={() => handlePackageWhatsAppInquiry()}
                  isPreparing={isPreparingWhatsApp}
                  label="Continue to WhatsApp"
                  preparedLabel="Inquiry Prepared · Opening WhatsApp..."
                  className="w-full justify-center"
                />

                {whatsAppInitiated && (
                  <p className="text-[10px] text-[#505B66] text-center italic mt-1">
                    * Message formatted. Please press <strong>Send</strong> in WhatsApp.
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#D8DEE5] text-[11px] text-[#505B66] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#214E78]" />
                  <span>Call Advisory Desk: {BUSINESS_INFO.phone}</span>
                </div>
                <p className="text-[10px] text-[#505B66]">
                  Registered Office: VK Complex, P.J.N. Road, Vaniyambadi, Tamil Nadu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concrete Deliverables Section */}
      {service.deliverables && service.deliverables.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 sm:p-10 shadow-sm">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
              Tangible Output
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#30363D]">
              What You Receive (Deliverables)
            </h2>
            <p className="text-xs text-[#505B66] mt-1 mb-6">
              Every deliverable is handed over in pristine, industry-standard digital formats with full enterprise ownership.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.deliverables.map((del, idx) => (
                <div key={idx} className="p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#214E78] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#30363D]">{del}</h3>
                    <p className="text-[11px] text-[#505B66] mt-0.5">
                      Verified by Unikorn360 Technical Desk before final client sign-off.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages & Transparent Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block">
            Commercial Structure
          </span>
          <h2 className="text-2xl font-bold font-serif text-[#30363D] mt-1">
            Packages &amp; Scope Options
          </h2>
          <p className="text-xs text-[#505B66] mt-1">
            Only approved prices are displayed publicly. Custom requirements are priced via transparent, itemized quotations.
          </p>
        </div>

        {service.packages && service.packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.packages.map((pkg) => {
              const isApproved = pkg.approval_status === 'approved';
              const isSelected = selectedPackage?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#214E78] ring-2 ring-[#214E78]/20 shadow-md' : 'border-[#D8DEE5] hover:border-[#214E78]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#214E78] uppercase tracking-wider">
                        {pkg.name}
                      </span>
                      {pkg.is_popular && (
                        <span className="bg-[#A57C35] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>

                    {/* Price display */}
                    <div className="my-3">
                      {isApproved && pkg.price ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-serif font-bold text-[#30363D]">
                              ₹{pkg.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-[#505B66]">
                              /{pkg.billing_period}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#A57C35] font-semibold uppercase tracking-wider">
                            {pkg.price_type === 'starting-from' ? 'Starting Price' : 'Fixed Scope'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-lg font-serif font-bold text-[#30363D]">
                            Request a Quotation
                          </span>
                          <span className="block text-[10px] text-[#505B66]">
                            Custom pre-scoped proposal
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#505B66] leading-relaxed mb-4">
                      {pkg.description}
                    </p>

                    {/* Inclusions */}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="pt-3 border-t border-[#D8DEE5]">
                        <p className="text-[10px] font-bold text-[#30363D] uppercase tracking-wider mb-2">
                          Inclusions:
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#505B66]">
                          {pkg.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ad spend details if present */}
                    {pkg.ad_spend_details && (
                      <div className="mt-4 p-3 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-[11px] text-[#505B66] space-y-1">
                        <p className="font-bold text-[#30363D] uppercase tracking-wider text-[10px]">
                          Fee &amp; Spend Disclosure:
                        </p>
                        {pkg.ad_spend_details.agency_fee && (
                          <p>• <strong>Management:</strong> {pkg.ad_spend_details.agency_fee}</p>
                        )}
                        {pkg.ad_spend_details.ad_spend && (
                          <p>• <strong>Creator Spend:</strong> {pkg.ad_spend_details.ad_spend}</p>
                        )}
                        {pkg.ad_spend_details.creative_fee && (
                          <p>• <strong>Creative:</strong> {pkg.ad_spend_details.creative_fee}</p>
                        )}
                        {pkg.ad_spend_details.tracking_setup && (
                          <p>• <strong>Analytics:</strong> {pkg.ad_spend_details.tracking_setup}</p>
                        )}
                      </div>
                    )}

                    {/* Tax treatment */}
                    {pkg.tax_treatment && (
                      <p className="text-[10px] text-[#505B66] mt-3 italic">
                        * {pkg.tax_treatment}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D8DEE5]">
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        const box = document.getElementById('package-inquiry-box');
                        if (box) box.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#214E78] text-white shadow-sm'
                          : 'bg-[#F5F6F7] text-[#30363D] hover:bg-[#E9EDF0]'
                      }`}
                    >
                      {isSelected ? '✓ Selected in Form' : 'Select Package'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 max-w-xl text-center">
            <h3 className="text-base font-bold text-[#30363D]">Quotation-Based Service</h3>
            <p className="text-xs text-[#505B66] mt-1.5 leading-relaxed">
              Due to variable plant capacities and scope requirements, pricing is tailored via an itemized written quotation following discovery.
            </p>
            <button
              onClick={() => onOpenQuoteModal(service.service_name)}
              className="mt-4 px-5 py-2.5 bg-[#214E78] text-white text-xs font-bold uppercase tracking-wider rounded"
            >
              Request Scoped Quotation
            </button>
          </div>
        )}
      </section>

      {/* Process Steps Timeline */}
      {service.process_steps && service.process_steps.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 sm:p-10 shadow-sm">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
              Standard Operating Procedure
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#30363D]">
              How We Deliver (Execution Steps)
            </h2>
            <p className="text-xs text-[#505B66] mt-1 mb-8">
              Predictable, transparent 4-stage protocol ensuring zero delays and complete procedural accountability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process_steps.map((st) => (
                <div key={st.step} className="p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg relative">
                  <span className="text-2xl font-serif font-bold text-[#214E78] block mb-2">
                    0{st.step}
                  </span>
                  <h3 className="text-xs font-bold text-[#30363D] mb-1.5">{st.title}</h3>
                  <p className="text-[11px] text-[#505B66] leading-relaxed">{st.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Client Responsibilities & Exclusions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.client_responsibilities && service.client_responsibilities.length > 0 && (
            <div className="bg-white border border-[#D8DEE5] rounded-xl p-6">
              <p className="text-[10px] font-bold text-[#214E78] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Client Responsibilities</span>
              </p>
              <ul className="space-y-2 text-xs text-[#505B66]">
                {service.client_responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#214E78] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.exclusions && service.exclusions.length > 0 && (
            <div className="bg-white border border-[#D8DEE5] rounded-xl p-6">
              <p className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Exclusions (Honest Boundary)</span>
              </p>
              <ul className="space-y-2 text-xs text-[#505B66]">
                {service.exclusions.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#A57C35] font-bold">•</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-[#D8DEE5] rounded-xl p-8 sm:p-10 shadow-sm">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#30363D] mb-6">
              Frequently Asked Questions on {service.service_name}
            </h2>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-[#D8DEE5] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 bg-[#F5F6F7] hover:bg-[#E9EDF0] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#30363D]">
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#505B66] transition-transform ${isOpen ? 'rotate-180 text-[#214E78]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 py-4 bg-white text-xs text-[#505B66] leading-relaxed border-t border-[#D8DEE5]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Services in Same Division */}
      {relatedServices && relatedServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#D8DEE5]">
          <div className="mb-6">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em]">
              Complementary Capabilities
            </span>
            <h2 className="text-xl font-bold font-serif text-[#30363D] mt-1">
              Related Services in {division.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((rel) => (
              <div
                key={rel.id}
                className="bg-white border border-[#D8DEE5] rounded-xl p-5 hover:border-[#214E78] transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                    {rel.service_name}
                  </h3>
                  <p className="mt-2 text-xs text-[#505B66] line-clamp-2">
                    {rel.short_description}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(`/services/${division.slug}/${rel.slug}`)}
                  className="mt-4 pt-3 border-t border-[#D8DEE5] text-xs font-semibold text-[#214E78] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Back / Navigation Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => onNavigate(`/services/${division.slug}`)}
            className="flex items-center gap-1.5 text-[#505B66] hover:text-[#214E78] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {division.name} Division</span>
          </button>
          <button
            onClick={() => onNavigate('/services')}
            className="text-[#214E78] hover:underline cursor-pointer"
          >
            All Services Directory →
          </button>
        </div>
      </section>
    </div>
  );
};
