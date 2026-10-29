import React, { useState } from 'react';
import { 
  Clock, 
  ArrowRight, 
  Search, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { RESOURCE_GUIDES } from '../data/resourcesData';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface ResourcesHubPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const ResourcesHubPage: React.FC<ResourcesHubPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const guidesList = Object.values(RESOURCE_GUIDES);

  const filteredGuides = guidesList.filter((guide) => {
    const matchesCategory = selectedCategory === 'all' || guide.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = ['all', 'Compliance', 'Subsidies', 'Finance', 'Industrial', 'Automation'];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MSME Business Resources & Regulatory Guides | Unikorn360',
    description: 'Comprehensive guides on GST compliance, central & state subsidies, bank-grade DPR preparation, factory licensing, and MSME business automation.',
    url: 'https://www.unikorn360.com/resources'
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-20">
      <SEOHead
        title="MSME Knowledge Base & Regulatory Guides | Unikorn360"
        description="Comprehensive guides for growing businesses on GST compliance, subsidies, DPR preparation for bank loans, factory licences, and business automation."
        canonicalPath="/resources"
        schema={schema}
      />

      <Breadcrumbs
        items={[{ label: 'Resources & Guides' }]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="py-12 lg:py-16 border-b border-[#D8DEE5] bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#A57C35] block mb-3">
              Knowledge Base &amp; Regulatory Playbooks
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#30363D] tracking-tight leading-tight">
              Real-World MSME Guides &amp; Practical Resources
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Practical, jargon-free guidance on GST compliance, government subsidies, bank DPR preparation, factory approvals, and digital workflows for growing business owners.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#505B66]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides (e.g., GST, PMEGP, DPR, TNPCB)..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#D8DEE5] rounded-md text-sm text-[#30363D] placeholder:text-[#505B66]/60 focus:outline-none focus:border-[#214E78] focus:ring-1 focus:ring-[#214E78]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors shrink-0 cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#214E78] text-white shadow-sm'
                      : 'bg-white border border-[#D8DEE5] text-[#505B66] hover:text-[#30363D] hover:bg-[#F5F6F7]'
                  }`}
                >
                  {cat === 'all' ? 'All Guides' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Guides Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <article
              key={guide.id}
              className="bg-white border border-[#D8DEE5] rounded-lg shadow-sm hover:border-[#214E78] hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 text-xs text-[#505B66] mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#214E78] px-2.5 py-0.5 bg-[#214E78]/10 rounded border border-[#214E78]/20">
                    {guide.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#505B66]/70" />
                    {guide.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-3 leading-snug">
                  <a
                    href={`/resources/${guide.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/resources/${guide.slug}`);
                    }}
                  >
                    {guide.title}
                  </a>
                </h2>

                <p className="text-xs text-[#505B66] line-clamp-3 leading-relaxed mb-5">
                  {guide.summary}
                </p>

                <div className="space-y-1.5 pt-4 border-t border-[#D8DEE5]">
                  {guide.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[12px] text-[#505B66]">
                      <div className="w-1.5 h-1.5 bg-[#A57C35] rounded-full mt-1.5 shrink-0"></div>
                      <span className="line-clamp-1">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0">
                <a
                  href={`/resources/${guide.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/resources/${guide.slug}`);
                  }}
                  className="w-full py-2.5 bg-[#F5F6F7] hover:bg-[#214E78] hover:text-white border border-[#D8DEE5] text-[#214E78] text-xs font-semibold rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Free Consultation Callout */}
        <section className="mt-14 p-8 sm:p-10 bg-white border border-[#D8DEE5] rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-2">
              Business Intelligence &amp; Advisory
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#30363D] mb-2">
              Have Specific Questions About Your Enterprise Systems?
            </h2>
            <p className="text-sm text-[#505B66] leading-relaxed">
              Every business has unique workflows, software needs, and compliance histories. Discuss your specific requirements directly with our team in Vaniyambadi.
            </p>
          </div>

          <button
            onClick={() => onOpenReviewModal()}
            className="px-6 py-3.5 bg-[#214E78] text-white font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#1a3d5e] transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#A57C35]" />
            <span>Request Diagnostic Review</span>
          </button>
        </section>
      </main>
    </div>
  );
};
