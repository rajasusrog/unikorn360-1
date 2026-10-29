import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { BUSINESS_PROBLEMS_SOLVED } from '../data/servicesData';

interface BusinessProblemsSectionProps {
  onOpenReviewModal: (prefill?: string) => void;
}

export const BusinessProblemsSection: React.FC<BusinessProblemsSectionProps> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5]" id="problems-we-solve">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Operational Bottlenecks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            Business Problems We Help Solve
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            Most businesses don't need generic software with hundreds of unused features. They need targeted systems designed around how their specific operations work.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_PROBLEMS_SOLVED.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg p-6 shadow-2xs hover:shadow-sm hover:border-[#214E78]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-[#A57C35] uppercase">
                    Challenge 0{idx + 1}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#A57C35]"></span>
                </div>

                <h3 className="text-base font-bold text-[#30363D] mb-2 leading-snug">
                  {item.problem}
                </h3>

                <div className="space-y-3 mt-3 text-xs">
                  <div className="p-3 bg-white/70 border border-[#D8DEE5] rounded">
                    <strong className="text-[10px] uppercase font-bold text-red-700 block mb-1">
                      Day-to-Day Friction:
                    </strong>
                    <p className="text-[#505B66] leading-relaxed">
                      {item.impact}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-[#D8DEE5] rounded shadow-2xs">
                    <strong className="text-[10px] uppercase font-bold text-[#214E78] block mb-1">
                      How We Fix It:
                    </strong>
                    <p className="text-[#30363D] leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D8DEE5]">
                <button
                  onClick={() => onOpenReviewModal(`Discuss: ${item.problem}`)}
                  className="text-xs font-bold text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Discuss this challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
