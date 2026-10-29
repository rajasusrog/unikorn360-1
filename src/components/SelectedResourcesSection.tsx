import React from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  Clock, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { RESOURCE_GUIDES } from '../data/resourcesData';

interface SelectedResourcesSectionProps {
  onNavigate: (path: string) => void;
}

export const SelectedResourcesSection: React.FC<SelectedResourcesSectionProps> = ({ onNavigate }) => {
  const featuredGuides = Object.values(RESOURCE_GUIDES).slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-[#F5F6F7] border-b border-[#D8DEE5]" id="selected-resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8DEE5] rounded-full text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.15em] mb-2 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-[#214E78]" />
              <span>Knowledge Base &amp; Guides</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#30363D] tracking-tight">
              Selected Resources for MSME Owners
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#505B66]">
              Actionable checklists and regulatory guides compiled by our advisory desk.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/resources')}
            className="text-xs font-bold text-[#214E78] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Guides &amp; Checklists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGuides.map((guide) => (
            <article 
              key={guide.slug}
              className="bg-white border border-[#D8DEE5] rounded-lg p-6 shadow-xs hover:shadow-md hover:border-[#214E78] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#505B66] mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-[#214E78]">
                    {guide.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#A57C35]" />
                    {guide.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#30363D] mb-2 leading-snug">
                  {guide.title}
                </h3>

                <p className="text-xs text-[#505B66] line-clamp-3 leading-relaxed mb-4">
                  {guide.summary}
                </p>

                <div className="space-y-1 pt-3 border-t border-[#D8DEE5]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#30363D]">
                    Key Takeaways:
                  </p>
                  {guide.keyTakeaways.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="text-[11px] text-[#505B66] flex items-start gap-1.5">
                      <span className="text-[#214E78] font-bold">•</span>
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D8DEE5]">
                <button
                  onClick={() => onNavigate(`/resources/${guide.slug}`)}
                  className="w-full py-2 px-3 bg-[#F5F6F7] hover:bg-[#214E78] text-[#30363D] hover:text-white border border-[#D8DEE5] rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Read Full Guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
