import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  Compass,
  MessageSquare
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';

interface MobileBottomBarProps {
  onOpenReviewModal: () => void;
  onScrollToFinder: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenReviewModal,
  onScrollToFinder
}) => {
  return (
    <>
      {/* Floating Prompt above bar */}
      <div className="lg:hidden fixed bottom-[65px] right-3 z-40">
        <button
          onClick={onScrollToFinder}
          className="px-3 py-1.5 bg-white border border-[#D8DEE5] text-xs font-semibold text-[#214E78] rounded-full shadow-md flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#214E78]"
        >
          <Compass className="w-3.5 h-3.5 text-[#214E78]" />
          <span className="text-[10px] uppercase tracking-wider">Service Finder</span>
        </button>
      </div>

      {/* Fixed Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#D8DEE5] backdrop-blur-md px-3 py-2 flex items-center justify-around shadow-lg">
        <a
          href={`tel:${BUSINESS_INFO.phoneRaw}`}
          className="flex flex-col items-center gap-0.5 text-[#505B66] hover:text-[#214E78] transition-colors py-1 px-2.5"
          aria-label="Call Unikorn360"
        >
          <Phone className="w-4 h-4 text-[#214E78]" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Call</span>
        </a>

        <a
          href={`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent('Hello Unikorn360, I would like to discuss a project for my business.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[#505B66] hover:text-emerald-600 transition-colors py-1 px-2.5"
          aria-label="WhatsApp Unikorn360"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">WhatsApp</span>
        </a>

        <button
          onClick={onOpenReviewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#214E78] text-white font-bold text-[10px] uppercase tracking-[0.1em] rounded shadow-sm hover:bg-[#173858] transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Discuss Project</span>
        </button>

        <button
          onClick={onScrollToFinder}
          className="flex flex-col items-center gap-0.5 text-[#505B66] hover:text-[#214E78] transition-colors py-1 px-2.5"
        >
          <Compass className="w-4 h-4 text-[#A57C35]" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Finder</span>
        </button>
      </div>
    </>
  );
};
