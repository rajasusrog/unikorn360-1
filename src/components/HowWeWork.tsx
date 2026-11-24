import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WORKFLOW_STEPS } from '../data/servicesData';

interface HowWeWorkProps {
  onOpenReviewModal: () => void;
}

export const HowWeWork: React.FC<HowWeWorkProps> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-20 bg-[#F6F5F1] border-b border-[#E4DFD5]" id="how-we-work">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
            Clear Delivery Cadence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight">
            How We Work
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#526176] leading-relaxed max-w-2xl mx-auto">
            From initial requirement review to a pre-scoped written quotation, predictable build milestones, and ongoing support.
          </p>
        </div>

        {/* 5-Step Process Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-5 bg-white border border-[#E4DFD5] rounded-xl hover:border-[#0B1426] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-1 bg-[#C49A36] rounded mb-3"></div>
                <h3 className="text-sm font-bold text-[#0B1426] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-[#C49A36] mb-2">
                  {step.subtitle}
                </p>
                <p className="text-xs text-[#263449] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Box */}
        <div className="mt-10 p-6 sm:p-8 bg-white border border-[#E4DFD5] rounded-xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex items-center justify-center shrink-0 text-[#0B1426]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0B1426]">
                First assessment meeting at no cost
              </h4>
              <p className="text-xs sm:text-sm text-[#526176] mt-0.5 max-w-lg leading-relaxed">
                Share your current spreadsheets, workflow bottlenecks, or software goals and receive a clear written quotation before any commitment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReviewModal}
            className="px-6 py-3 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            Discuss your project
          </button>
        </div>

      </div>
    </section>
  );
};
