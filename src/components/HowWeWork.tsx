import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { WORKFLOW_STEPS } from '../data/servicesData';

interface HowWeWorkProps {
  onOpenReviewModal: () => void;
}

export const HowWeWork: React.FC<HowWeWorkProps> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5]" id="how-we-work">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3">
            <Clock className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Structured Engagement Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            How We Work
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            Transparent milestones, pre-scoped written proposals, and predictable delivery. Every engagement follows five clear steps.
          </p>
        </div>

        {/* 5-Step Process Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="p-5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#214E78]">
                    {step.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#A57C35]"></span>
                </div>

                <h3 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-1">
                  {step.title}
                </h3>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#A57C35] mb-2">
                  {step.subtitle}
                </p>
                <p className="text-xs text-[#505B66] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {idx === 2 && (
                <div className="mt-4 pt-3 border-t border-[#D8DEE5]">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E9EDF0] text-[#214E78] border border-[#D8DEE5] rounded block text-center">
                    Pre-Scoped Written Quotation
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Highlight Guarantee Box */}
        <div className="mt-12 p-6 sm:p-8 bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-[#D8DEE5] rounded-lg flex items-center justify-center shrink-0 text-[#214E78] shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#30363D]">
                First Assessment Meeting at No Cost
              </h4>
              <p className="text-xs text-[#505B66] mt-0.5 max-w-lg leading-relaxed">
                Bring your operational requirements, spreadsheets, or software ideas. We outline options and provide a written quotation before any commitment.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white font-bold text-xs uppercase tracking-wider rounded transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            Discuss Your Project
          </button>
        </div>

      </div>
    </section>
  );
};
