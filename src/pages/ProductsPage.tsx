import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { UNIKORN_FOUR_PRODUCTS } from '../data/productsData';
import { getProductDesign } from '../data/mediaAssets';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'UNIKORN360 Software Products',
    url: 'https://www.unikorn360.com/products',
    numberOfItems: UNIKORN_FOUR_PRODUCTS.length,
    itemListElement: UNIKORN_FOUR_PRODUCTS.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: product.canonicalUrl,
      description: product.shortDescription
    }))
  };

  return (
    <div className="bg-[#F5F6F7] min-h-screen pb-20">
      <SEOHead
        title="Software Products — InvoicePro360, Deeds360, Property360 & Advocate360 | UNIKORN360"
        description="Explore UNIKORN360 standalone software applications: InvoicePro360, Deeds360, Property360, and Advocate360. View verified product details or open each web application."
        canonicalUrl="https://www.unikorn360.com/products"
        structuredData={itemListSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Products', path: '/products' }
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <section className="bg-white border-b border-[#D8DEE5] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#505B66] mb-3">
              <span className="font-semibold text-[#A57C35] uppercase tracking-wider">
                UNIKORN360 Product Suite
              </span>
              <span aria-hidden="true">·</span>
              <span>4 Standalone Web Applications</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
              UNIKORN360 Software Products
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Explore our four dedicated web applications engineered for business invoicing, bilingual property deed drafting, property and legal case evaluation, and legal chamber practice management.
            </p>

            <div className="mt-6 p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg text-xs text-[#505B66] leading-relaxed">
              <strong className="text-[#30363D]">Clear Scope Distinction:</strong> These four applications operate as standalone UNIKORN360 software products with their own independent web environments and sign-in boundaries. They are separate from our custom client engineering and consulting services (under{' '}
              <a
                href="/services"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/services');
                }}
                className="text-[#214E78] font-semibold hover:underline"
              >
                Services
              </a>
              ) and our regional creator roster (under{' '}
              <a
                href="/creators"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/creators');
                }}
                className="text-[#214E78] font-semibold hover:underline"
              >
                Creators
              </a>
              ).
            </div>

            {/* Corporate Brand Showcase Banner Card */}
            <div className="mt-6 bg-white border border-[#D8DEE5] rounded-xl overflow-hidden shadow-xs">
              <img
                src="/assets/aistudio/ChatGPT_Image_Oct_30__2026__06_57_44_AM_79f0182e.png"
                alt="UNIKORN360 Business Intelligence — Software, Digital Services, Automation"
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Four Responsive Product Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="UNIKORN360 Products Directory">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {UNIKORN_FOUR_PRODUCTS.map((product) => {
            const design = getProductDesign(product.slug);

            return (
              <article
                key={product.id}
                id={`product-card-${product.slug}`}
                className="bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8 hover:border-[#214E78] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Proposed UI Design Image Showcase */}
                  {design && (
                    <div
                      onClick={() => onNavigate(product.path)}
                      className="relative w-full aspect-[16/9] bg-[#09182B] rounded-lg overflow-hidden mb-5 border border-[#D8DEE5] flex items-center justify-center cursor-pointer group-hover:border-[#214E78] transition-colors"
                    >
                      <img
                        src={design.src}
                        alt={design.alt}
                        width={design.width}
                        height={design.height}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-[#09182B]/90 border border-white/20 text-[#A57C35] font-mono font-bold text-[10px] uppercase tracking-wider rounded backdrop-blur-xs">
                        {design.badgeLabel}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#505B66] mb-2">
                    <span className="font-semibold text-[#A57C35] uppercase tracking-wider">
                      {product.categoryLabel}
                    </span>
                  </div>

                {/* Product Name */}
                <h2 className="text-2xl font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                  <a
                    href={product.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(product.path);
                    }}
                    className="focus:outline-none focus:underline"
                  >
                    {product.name}
                  </a>
                </h2>

                {/* Approved Short Description */}
                <p className="mt-3 text-sm text-[#505B66] leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Intended Users Summary */}
                <div className="mt-5 pt-4 border-t border-[#D8DEE5]/70">
                  <span className="text-[11px] font-bold text-[#30363D] uppercase tracking-wider block mb-2">
                    Intended Users
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#505B66]">
                    {product.intendedUsers.map((user, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#A57C35] font-bold" aria-hidden="true">·</span>
                        <span className="leading-relaxed">{user}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verified Capabilities Summary */}
                <div className="mt-5 pt-4 border-t border-[#D8DEE5]/70">
                  <span className="text-[11px] font-bold text-[#30363D] uppercase tracking-wider block mb-2">
                    Verified Features
                  </span>
                  <ul className="space-y-2 text-xs text-[#505B66]">
                    {product.verifiedFeatures.slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-[#30363D]">{feat.title}:</strong> {feat.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dual Action Buttons: View Product & Open App */}
              <div className="pt-6 mt-6 border-t border-[#D8DEE5] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={product.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(product.path);
                  }}
                  id={`product-card-view-${product.slug}`}
                  className="flex-1 py-2.5 px-4 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] hover:border-[#214E78] rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>View Product</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#214E78]" />
                </a>

                <a
                  href={product.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`product-card-open-${product.slug}`}
                  className="flex-1 py-2.5 px-4 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          );
        })}
        </div>

        {/* Demo Enquiry Callout */}
        <div className="mt-12 bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#30363D]">
              Need a Guided Product Walkthrough?
            </h2>
            <p className="mt-2 text-sm text-[#505B66] leading-relaxed">
              Request a live demonstration of InvoicePro360, Deeds360, Property360, or Advocate360 through our standard project enquiry workflow.
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onOpenReviewModal('Product Demo Request')}
              className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-[0.15em] rounded transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Request a Demo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
