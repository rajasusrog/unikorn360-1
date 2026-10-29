import React from 'react';
import { 
  X, 
  Check, 
  Clock, 
  ArrowRight, 
  MessageSquare,
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onOpenQuoteModal: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onOpenQuoteModal
}) => {
  if (!service) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-detail-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-[#D8DEE5] rounded-lg p-6 sm:p-8 shadow-2xl my-8 text-[#505B66]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-md bg-[#F5F6F7] text-[#505B66] hover:text-[#30363D] hover:bg-[#E9EDF0] border border-[#D8DEE5] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
            Service Specification • {service.category.toUpperCase()}
          </span>
          <h3 id="service-detail-title" className="text-2xl sm:text-3xl font-bold text-[#30363D]">
            {service.title}
          </h3>
          <p className="text-xs text-[#214E78] font-semibold mt-1">
            {service.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 text-xs">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#30363D] mb-1.5">
              Service Overview:
            </h4>
            <p className="text-[#505B66] leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="p-4 bg-[#F5F6F7] border border-[#D8DEE5] rounded-md">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#30363D] mb-2.5">
              What We Handle in Scope:
            </h4>
            <div className="space-y-2">
              {service.scopeList.map((scope, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#505B66]">
                  <Check className="w-3.5 h-3.5 text-[#214E78] shrink-0 mt-0.5" />
                  <span>{scope}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
                Concrete Deliverables:
              </span>
              <p className="text-[#30363D] font-medium">
                {service.deliverables.join(' • ')}
              </p>
            </div>

            <div className="p-3.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                Typical Timeline:
              </span>
              <p className="text-[#30363D] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#214E78]" />
                {service.typicalTimeline}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#D8DEE5] rounded text-[11px] text-[#505B66]">
            <strong className="text-[#30363D]">Target Audience: </strong>
            {service.targetAudience.join(', ')}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-7 pt-4 border-t border-[#D8DEE5] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#505B66] hover:text-[#30363D] cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenQuoteModal(service);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request Pre-Scoped Quotation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
