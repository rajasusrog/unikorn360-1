import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SEED_DIVISIONS } from '../data/seedData';
import { getDivisionBanner } from '../data/mediaAssets';
import { usePublishedCatalog } from '../hooks/usePublishedCatalog';
import { ServiceCardImage } from './ServiceCardImage';

interface OurServicesSectionProps {
  onNavigate: (path: string) => void;
}

const DIVISION_SENTENCES: Record<string, string> = {
  'websites-software':
    'We build custom business websites, e-commerce stores, and tailored web applications around your workflow.',
  'security-maintenance':
    'We audit websites, APIs, and databases and provide ongoing technical maintenance to keep systems dependable.',
  'marketing-creator-campaigns':
    'We manage technical SEO, paid search and social campaigns, UGC production, and regional creator collaborations.',
  'ai-automation-business-systems':
    'We connect enquiry capture, CRM pipelines, WhatsApp workflows, and dashboards with clear human oversight.',
  'research-business-strategy':
    'We deliver market research, competitor benchmarks, performance diagnostics, and financial feasibility studies.',
  'business-setup-documentation':
    'We assist with business registration, GST and Udyam filings, bank-ready DPRs, and commercial documentation.'
};

export const OurServicesSection: React.FC<OurServicesSectionProps> = ({
  onNavigate
}) => {
  const { divisions: publishedDivisions, status, retry } = usePublishedCatalog();

  const divisionsToRender =
    publishedDivisions.length > 0 ? publishedDivisions : SEED_DIVISIONS;

  return (
    <section
      id="our-services"
      aria-labelledby="our-services-heading"
      className="py-16 lg:py-20 bg-[#F6F5F1] border-b border-[#E4DFD5] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
              Our Services
            </span>
            <h2
              id="our-services-heading"
              className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight"
            >
              Six Service Divisions Built Around Business Outcomes
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#526176] leading-relaxed">
              Select a division to view individual services, deliverables, and consultation options.
            </p>
          </div>

          <a
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/services');
            }}
            id="home-view-all-services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1426] hover:text-[#C49A36] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            <span>View all services</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisionsToRender.map((div) => {
            const banner = getDivisionBanner(div.slug);
            const divisionPath = `/services/${div.slug}`;
            const sentence =
              DIVISION_SENTENCES[div.slug] || div.short_description;

            return (
              <article
                key={div.id}
                data-division-card={div.slug}
                className="bg-white border border-[#E4DFD5] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#0B1426] hover:shadow-md card-hover-scale shadow-xs"
              >
                <div>
                  <a
                    href={divisionPath}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(divisionPath);
                    }}
                    className="block border-b border-[#E4DFD5] focus-visible:outline-2 focus-visible:outline-[#0B1426]"
                    aria-label={`Open ${div.name} division page`}
                  >
                    <ServiceCardImage
                      divisionSlug={div.slug}
                      alt={banner?.alt || div.name}
                      loading="eager"
                    />
                  </a>

                  <div className="p-6 pb-4">
                    <h3 className="text-lg font-bold text-[#0B1426] tracking-tight">
                      <a
                        href={divisionPath}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(divisionPath);
                        }}
                        className="hover:underline"
                      >
                        {div.name}
                      </a>
                    </h3>

                    <p className="mt-2 text-sm text-[#263449] leading-relaxed">
                      {sentence}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-[#E4DFD5]">
                  <a
                    href={divisionPath}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(divisionPath);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1426] hover:text-[#C49A36] transition-colors py-1"
                  >
                    <span>Explore division</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {status === 'error' && (
          <div className="mt-6 p-3.5 bg-white border border-[#E4DFD5] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#526176]">
            <span>Showing division overview while live catalogue counts are temporarily unavailable.</span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={retry}
                className="font-semibold text-[#0B1426] hover:text-[#C49A36] underline cursor-pointer"
              >
                Retry live sync
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
