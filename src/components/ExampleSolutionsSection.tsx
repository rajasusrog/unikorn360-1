import React from 'react';
import { 
  AppWindow, 
  Globe, 
  BarChart3, 
  Cpu, 
  Check, 
  ArrowRight, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { EXAMPLE_SOLUTIONS } from '../data/servicesData';
import { ExampleSolution } from '../types';

interface ExampleSolutionsSectionProps {
  onOpenReviewModal: (solutionTitle: string) => void;
}

export const ExampleSolutionsSection: React.FC<ExampleSolutionsSectionProps> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-24 bg-[#F5F6F7] border-b border-[#D8DEE5]" id="example-solutions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3 shadow-2xs">
            <AppWindow className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Architecture &amp; Development</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            Example Custom Solutions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            Practical systems and web applications we can scope, design, and develop around your exact operational workflows.
          </p>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mb-8 p-4 bg-white border border-[#D8DEE5] rounded-lg shadow-2xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#A57C35] shrink-0 mt-0.5" />
          <div className="text-xs text-[#505B66]">
            <strong className="text-[#30363D] block font-semibold mb-0.5">
              Examples of solutions we can scope and build
            </strong>
            The software architectures below represent examples of custom applications and digital platforms Unikorn360 can develop to your requirements. They are not pre-packaged off-the-shelf software or completed client case studies. Every system is scoped and quoted individually.
          </div>
        </div>

        {/* 8 Example Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {EXAMPLE_SOLUTIONS.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-[#D8DEE5] rounded-lg p-5 shadow-xs hover:shadow-md hover:border-[#214E78] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#F5F6F7] text-[#214E78] border border-[#D8DEE5] rounded">
                    {item.scopeType}
                  </span>
                  <span className="text-[10px] text-[#A57C35] font-semibold">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#30363D] mb-1.5 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#505B66] leading-relaxed mb-3">
                  {item.summary}
                </p>

                {/* Features */}
                <div className="space-y-1.5 pt-2 border-t border-[#D8DEE5]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#30363D]">
                    Key Capabilities:
                  </p>
                  {item.keyFeatures.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#505B66]">
                      <Check className="w-3 h-3 text-[#214E78] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-[#D8DEE5] text-[11px] text-[#505B66]">
                  <strong className="text-[#30363D]">Ideal for: </strong>
                  {item.idealFor}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D8DEE5]">
                <button
                  onClick={() => onOpenReviewModal(`Solution: ${item.title}`)}
                  className="w-full py-2 px-3 bg-[#F5F6F7] hover:bg-[#214E78] text-[#30363D] hover:text-white border border-[#D8DEE5] rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss This Solution</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
