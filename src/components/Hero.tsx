import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass,
  MessageSquare
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';
import { HeroCarousel } from './HeroCarousel';

interface HeroProps {
  onOpenReviewModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReviewModal, onScrollToSection }) => {
  return (
    <section className="relative overflow-hidden pt-4 sm:pt-6 pb-12 lg:pb-16 border-b border-[#D8DEE5] bg-[#F5F6F7]" id="hero">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Homepage Hero Carousel (Directly below navbar with 16-24px top spacing) */}
        <div className="mb-6 sm:mb-8">
          <HeroCarousel />
        </div>

        {/* Top Badging & Main Editorial Headline & Copy */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white border border-[#D8DEE5] rounded-full text-xs text-[#505B66] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#A57C35]"></span>
              <span className="text-[#30363D] uppercase tracking-[0.15em] font-bold text-[10px]">
                UNIKORN360 BUSINESS INTELLIGENCE
              </span>
              <span className="text-[#D8DEE5]">|</span>
              <span className="text-[11px] text-[#505B66]">Business &amp; Technology Partner • Remote Consultations Available</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight leading-[1.15]">
            Intelligent Systems for Your Business.
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#505B66] leading-relaxed max-w-2xl mx-auto font-normal">
            Websites, software, cybersecurity, marketing, creator campaigns, AI automation and business intelligence—built around your goals.
          </p>

          <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-[#A57C35] font-semibold">
            For businesses, founders, teams and creators.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenReviewModal}
              id="hero-cta-discuss"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs uppercase tracking-[0.15em] font-bold rounded shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:ring-offset-2"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Discuss Your Project</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => onScrollToSection('services')}
              id="hero-cta-services"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#D8DEE5] hover:border-[#214E78] text-[#30363D] hover:text-[#214E78] text-xs uppercase tracking-[0.15em] font-bold rounded shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78]"
            >
              <span>Explore Our Services</span>
            </button>

            <button
              onClick={() => onScrollToSection('service-finder')}
              id="hero-cta-finder"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#E9EDF0] border border-[#D8DEE5] text-[#214E78] text-xs uppercase tracking-[0.15em] font-bold rounded hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#A57C35]" />
              <span>Service Finder</span>
            </button>
          </div>

          {/* Key Value Proposition Highlights */}
          <div className="mt-8 pt-8 border-t border-[#D8DEE5] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 bg-white border border-[#D8DEE5] rounded shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                01. Visibility
              </span>
              <h2 className="text-xs font-bold text-[#30363D] mb-0.5">Real-Time BI Cockpits</h2>
              <p className="text-[11px] text-[#505B66] leading-snug">Sales, stock, receivables, and cash margins in one glance.</p>
            </div>

            <div className="p-3.5 bg-white border border-[#D8DEE5] rounded shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                02. Web &amp; E-com
              </span>
              <h2 className="text-xs font-bold text-[#30363D] mb-0.5">High-Speed Websites</h2>
              <p className="text-[11px] text-[#505B66] leading-snug">Built to win corporate, export, and regional buyer inquiries.</p>
            </div>

            <div className="p-3.5 bg-white border border-[#D8DEE5] rounded shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                03. Custom Apps
              </span>
              <h2 className="text-xs font-bold text-[#30363D] mb-0.5">Workflow Tools</h2>
              <p className="text-[11px] text-[#505B66] leading-snug">Quotation calculators, CRM pipelines, and billing systems.</p>
            </div>

            <div className="p-3.5 bg-white border border-[#D8DEE5] rounded shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                04. Foundations
              </span>
              <h2 className="text-xs font-bold text-[#30363D] mb-0.5">Finance &amp; Licensing</h2>
              <p className="text-[11px] text-[#505B66] leading-snug">Bank DPRs, CMA data, Udyam MSME, and GST compliance.</p>
            </div>
          </div>

          {/* Transparent Working Guarantee */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#505B66]">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78]" />
              First Assessment Meeting at No Cost
            </span>
            <span className="text-[#D8DEE5]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78]" />
              Pre-Scoped Written Quotation Before Work Starts
            </span>
            <span className="text-[#D8DEE5]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78]" />
              Remote &amp; In-Person Consultations Available
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
