import React, { useEffect, useRef } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  caption?: string;
  badgeLabel?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  caption,
  badgeLabel
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={imageAlt || 'Full Screen Design Preview'}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-[#0B192C] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lightbox Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#09182B]">
          <div className="flex items-center gap-3">
            {badgeLabel && (
              <span className="px-2.5 py-0.5 bg-[#A57C35] text-white text-[10px] font-bold uppercase tracking-wider rounded">
                {badgeLabel}
              </span>
            )}
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-[#A57C35]" />
              <span>Full Design Preview</span>
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close design preview"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A57C35]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lightbox Image Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto flex items-center justify-center bg-[#050C16]">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg border border-white/10"
          />
        </div>

        {/* Lightbox Caption */}
        {caption && (
          <div className="px-6 py-3 bg-[#09182B] border-t border-white/10 text-center text-xs text-slate-300">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
