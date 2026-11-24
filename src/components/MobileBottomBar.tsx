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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E4DFD5] backdrop-blur-md px-3 py-2 flex items-center justify-around shadow-lg">
      <a
        href={`tel:${BUSINESS_INFO.phoneRaw}`}
        className="flex flex-col items-center gap-0.5 text-[#526176] hover:text-[#0B1426] transition-colors py-1 px-2.5"
        aria-label="Call Unikorn360"
      >
        <Phone className="w-4 h-4 text-[#0B1426]" />
        <span className="text-[10px] uppercase tracking-wider font-semibold">Call</span>
      </a>

      <a
        href={`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent('Hello Unikorn360, I would like to discuss a project for my business.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-0.5 text-[#526176] hover:text-emerald-700 transition-colors py-1 px-2.5"
        aria-label="WhatsApp Unikorn360"
      >
        <MessageCircle className="w-4 h-4 text-emerald-700" />
        <span className="text-[10px] uppercase tracking-wider font-semibold">WhatsApp</span>
      </a>

      <button
        type="button"
        onClick={onOpenReviewModal}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Discuss project</span>
      </button>

      <button
        type="button"
        onClick={onScrollToFinder}
        className="flex flex-col items-center gap-0.5 text-[#526176] hover:text-[#0B1426] transition-colors py-1 px-2.5 cursor-pointer"
      >
        <Compass className="w-4 h-4 text-[#C49A36]" />
        <span className="text-[10px] uppercase tracking-wider font-semibold">Finder</span>
      </button>
    </div>
  );
};
