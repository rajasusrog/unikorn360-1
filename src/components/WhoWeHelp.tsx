import React from 'react';
import { 
  Building2, 
  Factory, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Truck,
  Footprints,
  Wrench,
  Rocket
} from 'lucide-react';
import { WHO_WE_HELP_SECTORS, BUSINESS_INFO } from '../data/servicesData';

interface WhoWeHelpProps {
  onOpenReviewModal: (prefill?: string) => void;
}

const SECTOR_ICONS: Record<string, any> = {
  'Factory': Factory,
  'Truck': Truck,
  'Footprints': Footprints,
  'Wrench': Wrench,
  'Rocket': Rocket,
  'Building2': Building2
};

export const WhoWeHelp: React.FC<WhoWeHelpProps> = ({ onOpenReviewModal }) => {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5]" id="who-we-help">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Target Industries &amp; Clusters</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#30363D] tracking-tight">
            Industries We Support
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            Practical systems and consulting engineered for enterprises with real operational workflows—inventory, billing, quotations, and statutory requirements.
          </p>
        </div>

        {/* Specialized Industrial Cluster Banner */}
        <div className="mb-12 p-6 sm:p-8 bg-[#F5F6F7] border border-[#D8DEE5] rounded-xl shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white border border-[#D8DEE5] rounded-lg flex items-center justify-center shrink-0 text-[#214E78] shadow-xs">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E9EDF0] text-[#214E78] rounded">
                  INDUSTRIAL &amp; MSME FOCUS
                </span>
                <span className="text-xs text-[#505B66]">Manufacturing, Engineering &amp; Export Clusters</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#30363D]">
                Built for Production, Processing &amp; Commercial Enterprises
              </h3>
              <p className="text-xs text-[#505B66] mt-1 max-w-2xl leading-relaxed">
                We understand the operational reality of growing enterprises: quotation engines, billing tools, multi-godown inventory, compliance documentation, and bank-ready DPRs. Remote consultations and registered office visits available.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenReviewModal('Industrial & Commercial Systems Consultation')}
            className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white font-bold text-xs uppercase tracking-wider rounded transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Schedule Consultation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Core Sector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHO_WE_HELP_SECTORS.map((sector, index) => {
            const Icon = SECTOR_ICONS[sector.icon] || Factory;
            return (
              <div
                key={index}
                className="p-6 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg hover:border-[#214E78] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 bg-white border border-[#D8DEE5] rounded flex items-center justify-center text-[#214E78] mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-1">
                    {sector.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#A57C35] mb-2">
                    {sector.subtitle}
                  </p>
                  <p className="text-xs text-[#505B66] leading-relaxed">
                    {sector.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8DEE5]">
                  <button
                    onClick={() => onOpenReviewModal(`Industry: ${sector.title}`)}
                    className="text-xs font-semibold text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Discuss your sector needs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
