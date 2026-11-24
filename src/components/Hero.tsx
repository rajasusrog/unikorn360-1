import React from 'react';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';

interface HeroProps {
  onOpenReviewModal: () => void;
  onScrollToSection: (sectionId: string) => void;
  onNavigate?: (path: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenReviewModal,
  onScrollToSection,
  onNavigate
}) => {
  return (
    <section
      className="bg-[#F6F5F1] border-b border-[#E4DFD5] py-16 sm:py-20 lg:py-24"
      id="hero"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0B1426] tracking-tight leading-[1.15]">
          Websites and software that help you run your business
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[#263449] leading-relaxed max-w-2xl mx-auto">
          We help small businesses build websites, manage enquiries and quotes, and automate everyday work such as invoicing and follow-ups.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenReviewModal}
            id="hero-cta-discuss"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#0B1426] hover:bg-[#172744] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Discuss your project</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <a
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) {
                onNavigate('/services');
              } else {
                onScrollToSection('buyer-needs');
              }
            }}
            id="hero-cta-services"
            className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#E4DFD5] hover:border-[#0B1426] text-[#0B1426] text-sm font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore services</span>
            <ArrowRight className="w-4 h-4 text-[#C49A36]" />
          </a>
        </div>

        <p className="mt-6 text-xs sm:text-sm text-[#526176] inline-flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C49A36] shrink-0" />
          <span>First assessment meeting at no cost · Pre-scoped written quotation before work starts</span>
        </p>
      </div>
    </section>
  );
};
