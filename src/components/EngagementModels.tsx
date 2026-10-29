import React from 'react';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Layers,
  MessageSquare
} from 'lucide-react';
import { ENGAGEMENT_MODELS } from '../data/servicesData';
import { EngagementModel } from '../types';

interface EngagementModelsProps {
  onOpenReviewModal: (modelName: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const EngagementModels: React.FC<EngagementModelsProps> = ({ 
  onOpenReviewModal,
  onScrollToSection
}) => {
  return (
    <section className="py-16 lg:py-24 bg-[#F5F6F7] border-b border-[#D8DEE5] relative" id="models">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3">
            <Layers className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Support Tiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            How You Can Work with Us
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            From single diagnostic audits and custom software builds to ongoing technical support and fully managed business intelligence.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {ENGAGEMENT_MODELS.map((model) => {
            const isFeatured = model.id === 'protect';
            return (
              <div
                key={model.id}
                className={`relative flex flex-col justify-between transition-all duration-200 rounded-lg p-6 sm:p-8 bg-white border ${
                  isFeatured
                    ? 'border-[#214E78] shadow-md ring-1 ring-[#214E78]'
                    : 'border-[#D8DEE5] shadow-xs hover:border-[#214E78]/60 hover:shadow-sm'
                }`}
              >
                {/* Badge if featured */}
                {model.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      isFeatured 
                        ? 'bg-[#214E78] text-white shadow-xs'
                        : 'bg-[#F5F6F7] text-[#214E78] border border-[#D8DEE5]'
                    }`}>
                      {model.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Title & Tagline */}
                  <div className="mb-5 pt-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#A57C35] block mb-1 uppercase">
                      Tier: {model.name}
                    </span>
                    <h3 className="text-2xl font-bold text-[#30363D]">
                      {model.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#214E78] mt-1">
                      {model.tagline}
                    </p>
                    <p className="text-xs text-[#505B66] italic mt-2">
                      "{model.subtitle}"
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#505B66] leading-relaxed mb-5">
                    {model.description}
                  </p>

                  {/* Best For */}
                  <div className="mb-5 p-3.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#505B66]">
                    <strong className="text-[#30363D] uppercase tracking-wider text-[10px] block mb-1">
                      Best Suited For:
                    </strong>
                    {model.bestFor}
                  </div>

                  {/* Concrete Deliverables */}
                  <div className="space-y-2 mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#30363D]">
                      Included Capabilities:
                    </p>
                    {model.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#505B66]">
                        <Check className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Button */}
                <button
                  onClick={() => onOpenReviewModal(`Tier: ${model.name}`)}
                  className={`w-full py-3 px-4 rounded text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isFeatured
                      ? 'bg-[#214E78] hover:bg-[#173858] text-white'
                      : 'bg-[#F5F6F7] hover:bg-[#214E78] text-[#30363D] hover:text-white border border-[#D8DEE5]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{model.ctaText}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
