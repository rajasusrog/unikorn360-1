import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  FolderLock, 
  Cpu, 
  Layers, 
  Gauge, 
  ArrowRight, 
  Sparkles,
  BarChart3,
  Globe,
  AppWindow,
  MessageSquare
} from 'lucide-react';
import { WHY_UNIKORN_PILLARS, BUSINESS_INFO } from '../data/servicesData';

interface WhyUnikorn360Props {
  onOpenReviewModal: () => void;
}

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  'Business Intelligence': <BarChart3 className="w-5 h-5 text-[#214E78]" />,
  'Custom Software': <AppWindow className="w-5 h-5 text-[#214E78]" />,
  'Automation': <Cpu className="w-5 h-5 text-[#214E78]" />,
  'Web Presence': <Globe className="w-5 h-5 text-[#214E78]" />,
  'Compliance & Finance': <ShieldCheck className="w-5 h-5 text-[#214E78]" />,
  'Operating Partner': <Layers className="w-5 h-5 text-[#214E78]" />
};

export const WhyUnikorn360: React.FC<WhyUnikorn360Props> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5] relative" id="why-unikorn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Integrated Value Proposition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            One Business. One Systems Partner.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            Instead of managing separate website freelancers, software vendors, accountants, and consultants who never communicate, Unikorn360 brings technology and operations together.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_UNIKORN_PILLARS.map((pillar) => (
            <div
              key={pillar.pillar}
              className="p-6 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="w-11 h-11 bg-white border border-[#D8DEE5] rounded-lg flex items-center justify-center mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                  {PILLAR_ICONS[pillar.pillar] || <Layers className="w-5 h-5 text-[#214E78]" />}
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                  {pillar.pillar}
                </span>
                <h3 className="text-lg font-bold text-[#30363D] mb-1">
                  {pillar.tagline}
                </h3>
                <p className="text-xs text-[#505B66] leading-relaxed mt-2">
                  {pillar.detail}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D8DEE5]">
                <span className="text-[11px] font-semibold text-[#214E78] flex items-center gap-1">
                  Built around how you work →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Big Final Conversion Banner */}
        <div className="mt-16 bg-[#F5F6F7] border border-[#D8DEE5] rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A57C35] px-3 py-1 bg-white border border-[#D8DEE5] rounded-full inline-block mb-3">
            Initial Discovery Discussion
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#30363D] tracking-tight">
            Ready to Build Better Systems for Your Business?
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-[#505B66] max-w-xl mx-auto leading-relaxed">
            First assessment meeting at no cost. Bring your existing spreadsheets, software requirements, or expansion ideas. We’ll outline a clear technical scope and written quotation before any commitment.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenReviewModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#214E78] hover:bg-[#173858] text-white font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Discuss Your Project</span>
            </button>
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#D8DEE5] text-[#30363D] hover:text-[#214E78] hover:border-[#214E78] font-bold text-xs uppercase tracking-wider rounded shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Call: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
