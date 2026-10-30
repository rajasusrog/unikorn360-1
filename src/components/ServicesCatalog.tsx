import React, { useState, useEffect } from 'react';
import { ArrowRight, Layers, ExternalLink } from 'lucide-react';
import { getDivisionBanner } from '../data/mediaAssets';
import { SEED_DIVISIONS } from '../data/seedData';
import { servicesDb } from '../lib/supabase';
import { ServiceDivision } from '../types/database';

interface ServicesCatalogProps {
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (service: any) => void;
  onSelectServiceModal?: (service: any) => void;
  selectedCategoryKey?: string;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onSelectServiceModal
}) => {
  const [divisions, setDivisions] = useState<ServiceDivision[]>(SEED_DIVISIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDivisions() {
      try {
        setLoading(true);
        const fetched = await servicesDb.getDivisions();
        if (fetched && fetched.length > 0) {
          const publishedOnly = fetched.filter((d) => d.status === 'published');
          if (publishedOnly.length > 0) {
            setDivisions(publishedOnly);
          }
        }
      } catch (err) {
        // Maintain default SEED_DIVISIONS on network/auth error
        console.warn('Could not fetch dynamic divisions from Supabase, using seed catalogue fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDivisions();
  }, []);

  const handleDivisionClick = (slug: string) => {
    const targetPath = `/services/${slug}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else if (typeof window !== 'undefined') {
      window.location.pathname = targetPath;
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F5F6F7] border-b border-[#D8DEE5] relative" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] mb-3 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#214E78]" />
            <span>6 Service Divisions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight">
            Comprehensive Service Divisions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            From custom software, e-commerce, and application security to creator marketing, AI workflow automation, strategic research, and business documentation.
          </p>
        </div>

        {/* 6 Division Cards Grid (Desktop: 3 cols x 2 rows, Tablet: 2 cols, Mobile: 1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {divisions.map((div) => {
            const banner = getDivisionBanner(div.slug);

            return (
              <div
                key={div.id || div.slug}
                className="bg-white border border-[#D8DEE5] rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#214E78] transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Matching Banner Image with Natural ~16:9 Aspect Ratio */}
                  {banner && (
                    <div className="w-full bg-[#09182B] aspect-[16/9] overflow-hidden flex items-center justify-center border-b border-[#D8DEE5]">
                      <img
                        src={banner.src}
                        alt={banner.alt || div.name}
                        width={banner.width}
                        height={banner.height}
                        loading="lazy"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#A57C35] uppercase tracking-wider">
                        Division 0{div.display_order}
                      </span>
                      <span className="text-[10px] font-semibold text-[#214E78] bg-[#214E78]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        Published
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors leading-snug">
                      {div.name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#505B66] leading-relaxed">
                      {div.short_description}
                    </p>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => handleDivisionClick(div.slug)}
                    className="w-full py-2.5 px-4 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Explore Services</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Directory Link Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={() => handleDivisionClick('')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#D8DEE5] hover:border-[#214E78] text-[#30363D] hover:text-[#214E78] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-2xs cursor-pointer"
          >
            <span>View Full Services Directory</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#A57C35]" />
          </button>
        </div>
      </div>
    </section>
  );
};
