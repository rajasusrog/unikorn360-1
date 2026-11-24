import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  ChevronRight, 
  Layers,
  FileCheck,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { SOLUTIONS_DATA, SolutionItem } from '../data/solutionsData';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';

interface SolutionsHubPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const SolutionsHubPage: React.FC<SolutionsHubPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  const solutionsList = Object.values(SOLUTIONS_DATA);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Integrated Enterprise Solutions | Unikorn360',
    description: 'Outcome-oriented business solutions for enterprises: Start, Run, Fund, Digitise, Automate, and Expand.',
    url: 'https://www.unikorn360.com/solutions'
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#263449]">
      <SEOHead
        title="Business Solutions | Unikorn360 Business Intelligence"
        description="Comprehensive solutions for enterprises: Start a Business, Run & Stay Compliant, Get Funding, Digitise, Automate, and Expand."
        canonicalPath="/solutions"
        schema={schema}
      />

      <Breadcrumbs
        items={[{ label: 'Solutions' }]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <header className="py-12 lg:py-16 border-b border-[#E4DFD5] bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
              Lifecycle Business Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1426] tracking-tight leading-[1.15]">
              Integrated Solutions for Enterprise Growth
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#526176] leading-relaxed">
              Instead of managing ten disconnected vendors, Unikorn360 delivers cohesive systems aligned to your core objective: starting clean, remaining compliant, securing capital, digitising records, automating friction, or expanding capacity.
            </p>
          </div>
        </div>
      </header>

      {/* Solutions Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutionsList.map((sol) => (
            <article
              key={sol.slug}
              className="bg-white border border-[#E4DFD5] rounded-xl hover:border-[#0B1426] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-[#526176] mb-3">
                  <span className="text-xs uppercase font-bold text-[#0B1426] bg-[#EFECE5] px-2.5 py-0.5 rounded">
                    Tier: {sol.recommendedModel.toUpperCase()}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#0B1426] mb-1.5 leading-snug group-hover:text-[#0B1426] transition-colors">
                  <a
                    href={`/solutions/${sol.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/solutions/${sol.slug}`);
                    }}
                    className="hover:underline"
                  >
                    {sol.shortTitle}
                  </a>
                </h2>

                <p className="text-xs text-[#526176] leading-relaxed mb-4 line-clamp-2">
                  {sol.subtitle}
                </p>

                <div className="p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg mb-4 text-xs text-[#263449]">
                  <strong className="text-[#0B1426] block text-[10px] uppercase tracking-wider mb-1">
                    Problem It Solves
                  </strong>
                  <p className="line-clamp-2">{sol.problemStatement}</p>
                </div>

                <div className="space-y-1.5 text-xs text-[#263449]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#526176]">
                    Key Deliverables
                  </p>
                  {sol.keyDeliverables.slice(0, 3).map((deliv, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A36] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-3 border-t border-[#E4DFD5] flex items-center justify-between">
                <a
                  href={`/solutions/${sol.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/solutions/${sol.slug}`);
                  }}
                  className="text-xs font-semibold text-[#0B1426] hover:text-[#C49A36] hover:underline"
                >
                  Explore Solution &rarr;
                </a>

                <button
                  type="button"
                  onClick={() => onOpenReviewModal(`Solution: ${sol.shortTitle}`)}
                  className="px-3.5 py-1.5 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Discuss Setup
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
