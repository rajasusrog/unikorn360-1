import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users,
  HelpCircle,
  Layers,
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { getProductDesign } from '../data/mediaAssets';
import {
  PRODUCTS_BY_SLUG,
  PRODUCT_FAQS_BY_SLUG,
  UNIKORN_FOUR_PRODUCTS,
  UnikornProduct
} from '../data/productsData';

interface ProductDetailPageProps {
  productSlug: string;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  onNavigate,
  onOpenReviewModal
}) => {
  const normalizedSlug = productSlug.toLowerCase().trim();
  const product: UnikornProduct | undefined = PRODUCTS_BY_SLUG[normalizedSlug];
  const productFaqs = product ? (PRODUCT_FAQS_BY_SLUG[product.slug] || product.faqs) : [];

  const [openFaqIds, setOpenFaqIds] = useState<string[]>(() =>
    productFaqs.length > 0 ? [productFaqs[0].id] : []
  );

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const design = product ? getProductDesign(product.slug) : null;

  // Reset open accordion state when navigating between products
  useEffect(() => {
    const faqsForSlug = product ? (PRODUCT_FAQS_BY_SLUG[product.slug] || product.faqs) : [];
    setOpenFaqIds(faqsForSlug.length > 0 ? [faqsForSlug[0].id] : []);
    setIsLightboxOpen(false);
  }, [normalizedSlug, product]);

  const toggleFaqItem = (faqId: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]
    );
  };

  const allFaqsExpanded =
    productFaqs.length > 0 && productFaqs.every((f) => openFaqIds.includes(f.id));

  const handleToggleAllFaqs = () => {
    if (allFaqsExpanded) {
      setOpenFaqIds([]);
    } else {
      setOpenFaqIds(productFaqs.map((f) => f.id));
    }
  };

  if (!product) {
    return (
      <div className="bg-[#F5F6F7] min-h-screen">
        <SEOHead
          title="Product Not Found | UNIKORN360 Products"
          description="The requested UNIKORN360 software product page was not found. View all published UNIKORN360 software applications."
          canonicalUrl="https://www.unikorn360.com/products"
        />
        <Breadcrumbs
          items={[
            { label: 'Products', path: '/products' },
            { label: 'Product Not Found' }
          ]}
          onNavigate={onNavigate}
        />
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-serif font-bold text-[#30363D]">
            Product Page Not Found
          </h1>
          <p className="mt-3 text-sm text-[#505B66] max-w-lg mx-auto">
            The requested product route does not match one of our four published software applications.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/products');
              }}
              className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Products</span>
            </a>
          </div>
        </section>
      </div>
    );
  }

  const relatedProducts = product.relatedProductSlugs
    .map((slug) => PRODUCTS_BY_SLUG[slug])
    .filter((item): item is UnikornProduct => Boolean(item));

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: product.canonicalUrl,
    sameAs: product.appUrl,
    description: product.fullDescription,
    publisher: {
      '@type': 'Organization',
      name: 'UNIKORN360 Business Intelligence',
      url: 'https://www.unikorn360.com'
    }
  };

  const faqSchema =
    productFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: productFaqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer
            }
          }))
        }
      : null;

  return (
    <div className="bg-[#F5F6F7] min-h-screen pb-20">
      <SEOHead
        title={product.seoTitle}
        description={product.seoDescription}
        canonicalUrl={product.canonicalUrl}
        structuredData={faqSchema ? [softwareSchema, faqSchema] : [softwareSchema]}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Products', path: '/products' },
          { label: product.name }
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero / Product Introduction Header */}
      <section className="bg-white border-b border-[#D8DEE5] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#505B66] mb-3">
              <span className="font-semibold text-[#A57C35] uppercase tracking-wider">
                UNIKORN360 Product
              </span>
              <span aria-hidden="true">·</span>
              <span>{product.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Standalone Web Application</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#30363D] tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#30363D] font-medium leading-relaxed">
              {product.shortDescription}
            </p>

            <p className="mt-4 text-sm sm:text-base text-[#505B66] leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={product.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                id={`product-detail-open-app-${product.slug}`}
                className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-[0.15em] rounded shadow-sm transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:ring-offset-2"
              >
                <span>Open App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => onOpenReviewModal(`Product Demo Request: ${product.name}`)}
                id={`product-detail-request-demo-${product.slug}`}
                className="px-6 py-3 bg-white hover:bg-[#F5F6F7] text-[#30363D] border border-[#D8DEE5] hover:border-[#214E78] text-xs font-bold uppercase tracking-[0.15em] rounded transition-colors inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:ring-offset-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#214E78]" />
                <span>Request a Demo</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-[#505B66]">
              Application URL:{' '}
              <a
                href={product.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#214E78] hover:underline break-all"
              >
                {product.appUrl}
              </a>{' '}
              <span aria-hidden="true">·</span> Opens in a separate browser tab with independent application sign-in.
            </p>

            {/* Proposed Interface Design Preview (Beneath introduction & CTAs) */}
            {design && (
              <div className="mt-8 pt-6 border-t border-[#D8DEE5]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#09182B] text-[#A57C35] font-mono font-bold text-[10px] uppercase tracking-wider rounded border border-[#A57C35]/30">
                      {design.badgeLabel}
                    </span>
                    <span className="text-xs text-[#505B66] font-medium">
                      Design Preview
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="text-xs font-semibold text-[#214E78] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#214E78]" />
                    <span>Expand Full Size</span>
                  </button>
                </div>

                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="bg-[#09182B] border border-[#D8DEE5] rounded-xl overflow-hidden shadow-md group relative cursor-pointer hover:border-[#214E78] transition-all"
                >
                  <img
                    src={design.src}
                    alt={design.alt}
                    width={design.width}
                    height={design.height}
                    loading="eager"
                    className="w-full h-auto object-contain max-h-[460px] sm:max-h-[560px] mx-auto"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-[#09182B]/90 text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                      <Maximize2 className="w-4 h-4 text-[#A57C35]" />
                      <span>Click to Enlarge</span>
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-center text-xs text-[#505B66] italic">
                  {design.detailCaption}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Accessible Image Lightbox Modal */}
      {design && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageSrc={design.src}
          imageAlt={design.alt}
          caption={design.detailCaption}
          badgeLabel={design.badgeLabel}
        />
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Intended Users */}
        <section aria-labelledby="intended-users-heading" className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A57C35] mb-2">
            <Users className="w-4 h-4 text-[#214E78]" />
            <span>Intended Users</span>
          </div>
          <h2 id="intended-users-heading" className="text-2xl font-serif font-bold text-[#30363D]">
            Who {product.name} Is Built For
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.intendedUsers.map((userGroup, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#214E78] shrink-0 mt-0.5" />
                <p className="text-sm text-[#30363D] leading-relaxed font-medium">
                  {userGroup}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Verified Features */}
        <section aria-labelledby="verified-features-heading" className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A57C35] mb-2">
            <Layers className="w-4 h-4 text-[#214E78]" />
            <span>Verified Capabilities</span>
          </div>
          <h2 id="verified-features-heading" className="text-2xl font-serif font-bold text-[#30363D]">
            Verified Features in {product.name}
          </h2>
          <p className="mt-2 text-sm text-[#505B66]">
            The capabilities listed below correspond directly to verified modules in the {product.name} web application.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.verifiedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg"
              >
                <div className="text-xs font-mono text-[#505B66] mb-1">
                  0{idx + 1}.
                </div>
                <h3 className="text-base font-serif font-bold text-[#30363D]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#505B66] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Approved Screenshots — Rendered ONLY where approved screenshots exist */}
        {product.approvedScreenshots.length > 0 && (
          <section aria-labelledby="approved-screenshots-heading" className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8">
            <h2 id="approved-screenshots-heading" className="text-2xl font-serif font-bold text-[#30363D]">
              Application Screenshots
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.approvedScreenshots.map((shot, idx) => (
                <figure key={idx} className="border border-[#D8DEE5] rounded-lg overflow-hidden bg-[#F5F6F7]">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  {shot.caption && (
                    <figcaption className="p-3 text-xs text-[#505B66] border-t border-[#D8DEE5]">
                      {shot.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Confirmed Pricing — Rendered ONLY where pricing is confirmed */}
        {product.confirmedPricing && product.confirmedPricing.length > 0 && (
          <section aria-labelledby="confirmed-pricing-heading" className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8">
            <h2 id="confirmed-pricing-heading" className="text-2xl font-serif font-bold text-[#30363D]">
              Confirmed Pricing
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.confirmedPricing.map((plan, idx) => (
                <div key={idx} className="p-6 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#30363D]">{plan.planName}</h3>
                    <p className="mt-2 text-2xl font-bold text-[#214E78]">{plan.priceLabel}</p>
                    {plan.billingNote && (
                      <p className="mt-1 text-xs text-[#505B66]">{plan.billingNote}</p>
                    )}
                    <ul className="mt-4 space-y-2 text-xs text-[#505B66]">
                      {plan.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accordion-Style FAQ Section based on Verified Product Information */}
        {productFaqs.length > 0 && (
          <section aria-labelledby="product-faqs-heading" className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A57C35] mb-2">
                  <HelpCircle className="w-4 h-4 text-[#214E78]" />
                  <span>Confirmed Product Information</span>
                </div>
                <h2 id="product-faqs-heading" className="text-2xl font-serif font-bold text-[#30363D]">
                  Frequently Asked Questions about {product.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleToggleAllFaqs}
                className="self-start sm:self-auto px-3 py-1.5 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] rounded text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78]"
              >
                {allFaqsExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="space-y-3" role="region" aria-label={`${product.name} Frequently Asked Questions`}>
              {productFaqs.map((faq, idx) => {
                const isOpen = openFaqIds.includes(faq.id);
                const panelId = `faq-panel-${faq.id}`;
                const triggerId = `faq-trigger-${faq.id}`;

                return (
                  <div
                    key={faq.id}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      isOpen ? 'border-[#214E78]' : 'border-[#D8DEE5]'
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={triggerId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleFaqItem(faq.id)}
                        className="w-full text-left px-5 py-4 bg-[#F5F6F7] hover:bg-[#E9EDF0] flex items-center justify-between gap-4 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#214E78]"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-[#505B66] mb-1">
                            <span className="font-mono">0{idx + 1}.</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#A57C35] font-semibold uppercase tracking-wider">
                              {faq.category}
                            </span>
                          </div>
                          <span className="text-sm sm:text-base font-serif font-bold text-[#30363D] block">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#214E78]' : 'text-[#505B66]'
                          }`}
                        />
                      </button>
                    </h3>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="px-5 py-4 bg-white text-sm text-[#505B66] leading-relaxed border-t border-[#D8DEE5]"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Action Banner: Open App or Request a Demo */}
        <section className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#30363D]">
              Access {product.name} or Schedule a Guided Walkthrough
            </h2>
            <p className="mt-2 text-sm text-[#505B66] leading-relaxed">
              Launch the standalone {product.name} web application directly, or request a live demonstration with the UNIKORN360 team through our project enquiry workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={product.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2"
            >
              <span>Open App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onOpenReviewModal(`Product Demo Request: ${product.name}`)}
              className="px-5 py-2.5 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#214E78]" />
              <span>Request a Demo</span>
            </button>
          </div>
        </section>

        {/* Related Products */}
        <section aria-labelledby="related-products-heading" className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A57C35]">
                UNIKORN360 Product Suite
              </div>
              <h2 id="related-products-heading" className="text-2xl font-serif font-bold text-[#30363D] mt-1">
                Related UNIKORN360 Products
              </h2>
            </div>
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/products');
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#214E78] hover:underline inline-flex items-center gap-1.5"
            >
              <span>View All 4 Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(relatedProducts.length > 0 ? relatedProducts : UNIKORN_FOUR_PRODUCTS.filter((p) => p.slug !== product.slug)).map((rel) => (
              <div
                key={rel.id}
                className="bg-white border border-[#D8DEE5] rounded-xl p-6 flex flex-col justify-between hover:border-[#214E78] transition-colors"
              >
                <div>
                  <div className="text-xs text-[#505B66] mb-1">
                    {rel.categoryLabel}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#30363D]">
                    {rel.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#505B66] leading-relaxed">
                    {rel.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8DEE5] flex flex-wrap items-center gap-2">
                  <a
                    href={rel.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(rel.path);
                    }}
                    className="flex-1 py-2 px-3 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] rounded text-xs font-bold uppercase tracking-wider text-center transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href={rel.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider text-center transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Open App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
