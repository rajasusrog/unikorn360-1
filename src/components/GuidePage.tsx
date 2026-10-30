import React from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';
import { ResourceGuide } from '../data/resourcesData';
import { SERVICES_LIST } from '../data/servicesData';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface GuidePageProps {
  guide: ResourceGuide;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onOpenQuoteModal: (serviceTitle: string) => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({
  guide,
  onNavigate,
  onOpenReviewModal,
  onOpenQuoteModal
}) => {
  // Find linked services
  const relatedServices = guide.relatedServices
    .map(id => SERVICES_LIST.find(s => s.id === id || s.id.includes(id)))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Schema for Article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://www.unikorn360.com/resources/${guide.slug}#article`,
        headline: guide.title,
        description: guide.metaDescription,
        datePublished: '2025-01-15T09:00:00+05:30',
        dateModified: '2025-03-01T10:00:00+05:30',
        author: {
          '@type': 'Organization',
          name: 'Unikorn360 Business Intelligence',
          url: 'https://www.unikorn360.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Unikorn360 Business Intelligence',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.unikorn360.com/assets/aistudio/ChatGPT_Image_Oct_30__2026__06_57_30_AM_a8896c5c.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.unikorn360.com/resources/${guide.slug}`
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.unikorn360.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Resources & Guides',
            item: 'https://www.unikorn360.com/resources'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: `https://www.unikorn360.com/resources/${guide.slug}`
          }
        ]
      }
    ]
  };

  return (
    <article className="min-h-screen bg-[#F5F6F7] text-[#505B66] pt-20">
      <SEOHead
        title={guide.metaTitle}
        description={guide.metaDescription}
        canonicalPath={`/resources/${guide.slug}`}
        schema={articleSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Resources', path: '/resources' },
          { label: guide.category },
          { label: guide.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Guide Header */}
      <header className="py-12 lg:py-16 border-b border-[#D8DEE5] bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#505B66] mb-4">
            <span className="px-2.5 py-0.5 bg-[#214E78]/10 border border-[#214E78]/20 text-[#214E78] font-mono uppercase tracking-wider text-[11px] font-semibold rounded">
              {guide.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A57C35]" />
              {guide.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#505B66]/70" />
              {guide.publishedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#30363D] tracking-tight leading-tight">
            {guide.title}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#505B66] leading-relaxed">
            {guide.summary}
          </p>

          <div className="mt-6 pt-6 border-t border-[#D8DEE5] flex items-center justify-between text-xs text-[#505B66]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E9EDF0] border border-[#D8DEE5] flex items-center justify-center text-[#214E78] text-[11px] font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Authored by: <strong className="text-[#30363D] font-medium">{guide.author}</strong></span>
            </div>
            <span className="hidden sm:inline text-[#505B66]/70">Practical MSME &amp; Business Guidance</span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Executive Takeaways Box */}
        <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg shadow-sm mb-10 relative">
          <div className="absolute top-0 left-0 w-12 h-1 bg-[#A57C35] rounded-t-lg"></div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-2">
            Executive Summary
          </span>
          <h2 className="text-lg font-bold text-[#30363D] mb-3">
            Key Takeaways for Business Owners
          </h2>
          <ul className="space-y-2 text-sm text-[#505B66]">
            {guide.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#A57C35] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10">
          {guide.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#30363D] border-b border-[#D8DEE5] pb-2">
                {section.heading}
              </h2>

              {section.subheading && (
                <p className="text-sm font-semibold text-[#214E78] tracking-wide">
                  {section.subheading}
                </p>
              )}

              <div className="space-y-3 text-sm sm:text-base text-[#505B66] leading-relaxed">
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              {section.checklistItems && section.checklistItems.length > 0 && (
                <div className="my-4 p-5 bg-[#E9EDF0]/50 border border-[#D8DEE5] rounded-lg space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#214E78] block mb-1">
                    Action Checklist
                  </span>
                  {section.checklistItems.map((c, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#30363D]">
                      <div className="w-1.5 h-1.5 bg-[#A57C35] rounded-full shrink-0"></div>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.calloutBox && (
                <div className="my-4 p-5 bg-white border-l-4 border-[#214E78] border-r border-t border-b border-[#D8DEE5] rounded-r-lg text-xs sm:text-sm shadow-sm">
                  <p className="font-bold text-[#30363D] mb-1 uppercase tracking-wider text-[11px]">
                    {section.calloutBox.title}
                  </p>
                  <p className="text-[#505B66] leading-relaxed">
                    {section.calloutBox.text}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA & Professional Support Banner */}
        <div className="mt-14 p-8 bg-white border border-[#D8DEE5] rounded-lg shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A57C35] block mb-1">
              Need Professional Assistance?
            </span>
            <h3 className="text-xl font-bold text-[#30363D] mb-2">
              Let Unikorn360 Support Your Implementation
            </h3>
            <p className="text-sm text-[#505B66] leading-relaxed">
              We provide pre-scoped proposals and handle systems architecture, software development, documentation, and compliance support with complete transparency.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenReviewModal(guide.title)}
              className="px-6 py-3 bg-[#214E78] text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#1a3d5e] transition-all flex items-center gap-2 cursor-pointer shadow active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A57C35]" />
              <span>Request Review</span>
            </button>
            <button
              onClick={() => onOpenQuoteModal(guide.title)}
              className="px-5 py-3 border border-[#D8DEE5] bg-white text-[#30363D] font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#F5F6F7] transition-all cursor-pointer"
            >
              <span>Request Scope</span>
            </button>
          </div>
        </div>

        {/* Related Services Internal Links */}
        {relatedServices.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#D8DEE5]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A57C35] mb-4">
              Related Services Mentioned in this Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedServices.map((svc) => (
                <a
                  key={svc.id}
                  href={`/services/${svc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/services/${svc.id}`);
                  }}
                  className="p-4 bg-white hover:bg-[#F5F6F7] border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all block group shadow-sm"
                >
                  <p className="text-xs font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors flex items-center justify-between">
                    <span>{svc.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#505B66]" />
                  </p>
                  <p className="text-[11px] text-[#505B66] line-clamp-1 mt-1">
                    {svc.subtitle}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
