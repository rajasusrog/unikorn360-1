import React, { useState } from 'react';
import { 
  Factory, 
  ArrowRight, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface ProjectConsultingTimelineProps {
  onOpenReviewModal: (prefill?: string) => void;
}

const PROJECT_STEPS = [
  {
    phase: '01',
    name: 'IDEA',
    title: 'Concept & Site Selection',
    desc: 'Clarifying the industrial concept, capacity requirements, target market demand, and raw material logistics.',
    deliverable: 'Initial Concept Note & Land Requirement Matrix'
  },
  {
    phase: '02',
    name: 'FEASIBILITY',
    title: 'Techno-Economic Study',
    desc: 'Validating commercial viability, break-even points, power load requirements (HT/LT), and environmental classification.',
    deliverable: 'Comprehensive Feasibility Study Report'
  },
  {
    phase: '03',
    name: 'APPROVALS',
    title: 'Statutory Roadmap',
    desc: 'Sequencing approvals across DTCP / Local Body, TNPCB (CTE), DISH Factory Plan, Fire & Rescue, and Public Health.',
    deliverable: 'Statutory Clearances Roadmap & Timeline'
  },
  {
    phase: '04',
    name: 'COSTING',
    title: 'Project Cost Estimation',
    desc: 'Civil works budgeting, industrial shed fabrication costs, utility lines (power, water, treatment), and contingencies.',
    deliverable: 'Detailed Bill of Quantities (BOQ) Scrutiny'
  },
  {
    phase: '05',
    name: 'FUNDING',
    title: 'Bank DPR & Subsidies',
    desc: 'Preparing bankable Detailed Project Reports (DPR), CMA data, and evaluating eligible state capital subsidies.',
    deliverable: 'Bank-Ready DPR & Credit Appraisal Dossier'
  },
  {
    phase: '06',
    name: 'MACHINERY',
    title: 'Sourcing & Evaluation',
    desc: 'Assessing indigenous and imported plant machinery, vendor quotes, power ratings, and maintenance warranties.',
    deliverable: 'Machine Comparison & Technical Dossier'
  },
  {
    phase: '07',
    name: 'EXECUTION',
    title: 'Erection & Installation',
    desc: 'Managing execution schedules, electrical transformer inspections, pollution control trial runs, and factory safety measures.',
    deliverable: 'Implementation Milestones Tracker'
  },
  {
    phase: '08',
    name: 'COMMISSIONING',
    title: 'Commercial Production',
    desc: 'Final Consent to Operate (CTO) from TNPCB, Factory License grant, labour compliance setups, and incentive claims.',
    deliverable: 'Commercial Production Hand-Over File'
  }
];

export const ProjectConsultingTimeline: React.FC<ProjectConsultingTimelineProps> = ({ onOpenReviewModal }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section className="py-16 lg:py-24 bg-[#F6F5F1] border-t border-[#E4DFD5] relative" id="project-consulting">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C49A36] uppercase tracking-wider mb-3">
            <Factory className="w-3.5 h-3.5 text-[#0B1426]" />
            <span>Industrial &amp; Project Consulting</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1426] tracking-tight">
            From Project Concept to Operational Facility
          </h2>
          <p className="mt-3 text-base text-[#526176] leading-relaxed max-w-2xl mx-auto">
            New units, plant expansions, and modernization. We advise manufacturing entrepreneurs through the complete approvals, DPR preparation, and project execution path.
          </p>
        </div>

        {/* Linear Progression Bar on Desktop */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex items-center min-w-[760px] justify-between relative px-2">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E4DFD5] -translate-y-1/2 z-0"></div>
            {PROJECT_STEPS.map((step, idx) => {
              const isSelected = activeStep === idx;
              const isPast = idx < activeStep;
              return (
                <button
                  type="button"
                  key={step.phase}
                  onClick={() => setActiveStep(idx)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-[#0B1426] text-white ring-4 ring-[#0B1426]/15 scale-110'
                      : isPast
                      ? 'bg-white text-[#0B1426] border-2 border-[#0B1426]'
                      : 'bg-white text-[#526176] border border-[#E4DFD5] hover:border-[#0B1426]'
                  }`}>
                    {step.phase}
                  </div>
                  <span className={`text-[11px] font-semibold mt-2 uppercase tracking-wider transition-colors ${
                    isSelected ? 'text-[#0B1426]' : 'text-[#526176] group-hover:text-[#0B1426]'
                  }`}>
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Detailed Breakdown Box */}
        <div className="bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E4DFD5]">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 bg-[#EFECE5] text-[#0B1426] rounded border border-[#E4DFD5]">
                  PHASE {PROJECT_STEPS[activeStep].phase} OF 08
                </span>
                <span className="text-xs uppercase tracking-wider text-[#526176]">Project Lifecycle</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1426]">
                {PROJECT_STEPS[activeStep].title} ({PROJECT_STEPS[activeStep].name})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onOpenReviewModal(`Project Consulting: Phase ${PROJECT_STEPS[activeStep].phase} - ${PROJECT_STEPS[activeStep].title}`)}
              className="px-6 py-3 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 self-start lg:self-center cursor-pointer shadow-xs"
            >
              <span>Discuss This Phase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426]">
                What We Execute During This Stage
              </h4>
              <p className="text-sm text-[#263449] leading-relaxed">
                {PROJECT_STEPS[activeStep].desc}
              </p>
              <div className="p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg text-xs text-[#0B1426]">
                <strong className="text-[#C49A36] block mb-1 text-xs font-bold uppercase tracking-wider">Key Milestone Deliverable:</strong>
                {PROJECT_STEPS[activeStep].deliverable}
              </div>
            </div>

            <div className="p-6 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0B1426] mb-3">
                  Scope Covered
                </h5>
                <ul className="space-y-2 text-xs text-[#263449]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A36]" />
                    <span>Feasibility Studies &amp; Market Demand Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A36]" />
                    <span>TN Single Window Portal &amp; Statutory Approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A36]" />
                    <span>Industrial Land &amp; Shed Verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A36]" />
                    <span>Bank-Grade Detailed Project Report (DPR) Preparation</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E4DFD5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  className="text-xs text-[#526176] hover:text-[#0B1426] disabled:opacity-30 cursor-pointer font-medium"
                >
                  ← Previous Phase
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.min(PROJECT_STEPS.length - 1, prev + 1))}
                  disabled={activeStep === PROJECT_STEPS.length - 1}
                  className="text-xs font-bold text-[#0B1426] hover:text-[#C49A36] hover:underline disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                >
                  Next Phase →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
