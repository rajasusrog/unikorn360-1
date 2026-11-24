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
  isOpen?: boolean;
  service: ServiceItem | null;
  onClose: () => void;
  onOpenQuoteModal: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen = true,
  service,
  onClose,
  onOpenQuoteModal
}) => {
  if (!isOpen || !service) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1426]/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-detail-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-8 shadow-2xl my-8 text-[#526176]">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F6F5F1] text-[#526176] hover:text-[#0B1426] hover:bg-[#EFECE5] border border-[#E4DFD5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-1">
            Service Specification · {service.category}
          </span>
          <h3 id="service-detail-title" className="text-2xl sm:text-3xl font-bold text-[#0B1426]">
            {service.title}
          </h3>
          <p className="text-xs text-[#263449] font-semibold mt-1">
            {service.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 text-xs">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426] mb-1.5">
              Service Overview
            </h4>
            <p className="text-[#263449] leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426] mb-2.5">
              What We Handle in Scope
            </h4>
            <div className="space-y-2">
              {service.scopeList.map((scope, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#263449]">
                  <Check className="w-3.5 h-3.5 text-[#C49A36] shrink-0 mt-0.5" />
                  <span>{scope}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C49A36] block mb-1">
                Deliverables
              </span>
              <p className="text-[#0B1426] font-medium">
                {service.deliverables.join(' · ')}
              </p>
            </div>

            <div className="p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526176] block mb-1">
                Typical Timeline
              </span>
              <p className="text-[#0B1426] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C49A36]" />
                {service.typicalTimeline}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#526176]">
            <strong className="text-[#0B1426]">Target Audience: </strong>
            {service.targetAudience.join(', ')}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-7 pt-4 border-t border-[#E4DFD5] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#526176] hover:text-[#0B1426] cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenQuoteModal(service);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request Pre-Scoped Quotation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
