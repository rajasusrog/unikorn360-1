import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  alt: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'brand',
    title: 'Brand Introduction',
    subtitle: 'Intelligent Systems. Real-World Impact.',
    src: '/assets/hero/brand.webp',
    alt: 'UNIKORN360 Business Intelligence — Intelligent Systems. Real-World Impact.'
  },
  {
    id: 'services',
    title: 'Service Divisions',
    subtitle: 'One Partner. A 360° Perspective.',
    src: '/assets/hero/services.webp',
    alt: 'UNIKORN360 Service Divisions — One Partner. A 360° Perspective.'
  },
  {
    id: 'products',
    title: 'Product Family',
    subtitle: 'Four Products. One Vision.',
    src: '/assets/hero/products.webp',
    alt: 'UNIKORN360 Product Suite — Four Products. One Vision. InvoicePro360, Deeds360, Property360, Advocate360.'
  }
];

export const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  };

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="UNIKORN360 Hero Showcase Carousel"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[1280px] mx-auto bg-[#09182B] rounded-xl sm:rounded-2xl overflow-hidden border border-[#1E293B] shadow-lg group focus:outline-none focus:ring-2 focus:ring-[#A57C35] focus:ring-offset-2 focus:ring-offset-[#F5F6F7]"
    >
      {/* Aspect ratio frame 3:1 */}
      <div className="relative w-full aspect-[3/1] bg-[#09182B]">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide.title}: ${slide.subtitle}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={2172}
                height={724}
                loading={idx === 0 ? 'eager' : 'lazy'}
                // @ts-ignore fetchpriority HTML attribute support
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                className="w-full h-full object-contain bg-[#09182B]"
              />
            </div>
          );
        })}

        {/* Previous Button */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#0B192C]/85 hover:bg-[#0B192C] text-white border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A57C35]"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#0B192C]/85 hover:bg-[#0B192C] text-white border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A57C35]"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      {/* Labelled Slide Indicators Bar */}
      <div className="bg-[#0B192C] border-t border-[#1E293B] px-3 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 sm:gap-3 mx-auto">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                aria-current={isActive ? 'true' : 'false'}
                className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#A57C35] text-white shadow-sm ring-1 ring-[#A57C35]'
                    : 'bg-[#132238] text-slate-300 hover:bg-[#1C2E4A] hover:text-white border border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`} />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
