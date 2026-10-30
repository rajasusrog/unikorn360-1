import React from 'react';
import { ArrowRight, ExternalLink, MessageSquare } from 'lucide-react';
import { UNIKORN_FOUR_PRODUCTS } from '../data/productsData';

interface OurProductsSectionProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const OurProductsSection: React.FC<OurProductsSectionProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  return (
    <section
      id="our-products"
      aria-labelledby="our-products-heading"
      className="py-16 lg:py-20 bg-white border-y border-[#D8DEE5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#505B66] mb-2">
              <span className="font-semibold text-[#A57C35] uppercase tracking-wider">
                Standalone Software Suite
              </span>
              <span aria-hidden="true">·</span>
              <span>Separate from Agency Services &amp; Creator Network</span>
            </div>

            <h2
              id="our-products-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#30363D] tracking-tight"
            >
              Our Products
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed">
              Alongside our bespoke agency services and creator recruitment network, UNIKORN360 operates four dedicated software applications for business invoicing, property deed drafting, property and legal case evaluation, and chamber practice management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/products');
              }}
              className="px-4 py-2.5 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] hover:border-[#214E78] rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <span>All Products</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#214E78]" />
            </a>

            <button
              type="button"
              onClick={() => onOpenReviewModal('Product Demo Request')}
              className="px-4 py-2.5 bg-white hover:bg-[#F5F6F7] text-[#214E78] border border-[#D8DEE5] rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Request a Demo</span>
            </button>
          </div>
        </div>

        {/* Four Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {UNIKORN_FOUR_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl p-6 flex flex-col justify-between hover:border-[#214E78] transition-all"
            >
              <div>
                <div className="text-[11px] font-semibold text-[#A57C35] uppercase tracking-wider mb-1.5">
                  {product.categoryLabel}
                </div>

                <h3 className="text-xl font-serif font-bold text-[#30363D]">
                  <a
                    href={product.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(product.path);
                    }}
                    className="hover:text-[#214E78] transition-colors"
                  >
                    {product.name}
                  </a>
                </h3>

                <p className="mt-2.5 text-xs text-[#505B66] leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D8DEE5] flex flex-col gap-2">
                <a
                  href={product.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(product.path);
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>View Product</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#214E78]" />
                </a>

                <a
                  href={product.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-[#214E78] hover:bg-[#173858] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
