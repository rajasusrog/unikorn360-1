import React from 'react';
import { ArrowRight, Globe, Workflow, FileCheck2 } from 'lucide-react';

interface ThreeBuyerNeedsSectionProps {
  onNavigate: (path: string) => void;
}

const BUYER_NEEDS = [
  {
    id: 'get-enquiries',
    icon: Globe,
    title: 'Get more enquiries',
    deliverable:
      'A fast business website, digital catalogue, or creator-led campaign built to capture customer leads on web and WhatsApp.',
    primaryActionLabel: 'Websites & Software',
    primaryPath: '/services/websites-software',
    secondaryActionLabel: 'Marketing & Campaigns',
    secondaryPath: '/services/marketing-creator-campaigns'
  },
  {
    id: 'reduce-manual-work',
    icon: Workflow,
    title: 'Reduce manual work',
    deliverable:
      'Custom quotation tools, GST billing software, live sales dashboards, and automated follow-ups that replace scattered spreadsheets.',
    primaryActionLabel: 'AI & Business Systems',
    primaryPath: '/services/ai-automation-business-systems',
    secondaryActionLabel: 'Research & Strategy',
    secondaryPath: '/services/research-business-strategy'
  },
  {
    id: 'setup-business',
    icon: FileCheck2,
    title: 'Set up or improve your business',
    deliverable:
      'Bank-ready project reports, MSME and GST registration documentation, and practical security reviews to keep operations protected.',
    primaryActionLabel: 'Business Setup & Docs',
    primaryPath: '/services/business-setup-documentation',
    secondaryActionLabel: 'Security & Maintenance',
    secondaryPath: '/services/security-maintenance'
  }
];

export const ThreeBuyerNeedsSection: React.FC<ThreeBuyerNeedsSectionProps> = ({
  onNavigate
}) => {
  return (
    <section
      id="buyer-needs"
      aria-labelledby="buyer-needs-heading"
      className="py-16 lg:py-20 bg-white border-b border-[#E4DFD5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
            What We Build For Businesses
          </span>
          <h2
            id="buyer-needs-heading"
            className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight"
          >
            Choose the Outcome Your Business Needs Right Now
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUYER_NEEDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#F6F5F1] border border-[#E4DFD5] rounded-xl p-6 flex flex-col justify-between hover:border-[#0B1426] transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E4DFD5] flex items-center justify-center text-[#0B1426] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1426]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-[#263449] leading-relaxed">
                    {item.deliverable}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4DFD5] space-y-2">
                  <a
                    href={item.primaryPath}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.primaryPath);
                    }}
                    className="flex items-center justify-between text-sm font-semibold text-[#0B1426] hover:text-[#C49A36] transition-colors"
                  >
                    <span>{item.primaryActionLabel}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>
                  <a
                    href={item.secondaryPath}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.secondaryPath);
                    }}
                    className="flex items-center justify-between text-xs font-medium text-[#526176] hover:text-[#0B1426] transition-colors"
                  >
                    <span>{item.secondaryActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
