import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Workflow, 
  Gauge, 
  Zap,
  FileCheck
} from 'lucide-react';

interface AISystemsWorkflowProps {
  onOpenReviewModal: (prefill?: string) => void;
}

const TECH_FLOW_STEPS = [
  {
    step: '01',
    phase: 'Current Assessment',
    name: 'Paper / WhatsApp / Spreadsheets',
    desc: 'Businesses often manage inquiries, orders, and dispatches across uncoordinated WhatsApp messages and manual spreadsheets.',
    impact: 'Orders get delayed, invoices mismatch, staff make duplicate manual entries.'
  },
  {
    step: '02',
    phase: 'Operational Mapping',
    name: 'Process Architecture',
    desc: 'Unikorn360 traces the actual workflow from customer inquiry and quotation to order fulfillment, billing, and payment collection.',
    impact: 'Pinpoints bottlenecks, manual data handoffs, and error-prone administrative tasks.'
  },
  {
    step: '03',
    phase: 'System Implementation',
    name: 'Workflow Automation',
    desc: 'Configure automated WhatsApp status alerts, automatic invoice & challan generation, and inventory sync across operations.',
    impact: 'Eliminates repetitive data entry and prevents customer miscommunication.'
  },
  {
    step: '04',
    phase: 'Centralized Visibility',
    name: 'Operational Dashboard',
    desc: 'A unified responsive interface accessible from phone or desktop showing daily sales, pending receivables, and fulfillment status.',
    impact: 'Proprietors make operational decisions based on live numbers rather than delayed month-end summaries.'
  },
  {
    step: '05',
    phase: 'Continuous Improvement',
    name: 'Business Intelligence',
    desc: 'Customer margin analytics, seasonal demand forecasting, inventory turnover metrics, and structured operational reports.',
    impact: 'Enables informed capital investments, pricing revisions, and disciplined growth.'
  }
];

export const AISystemsWorkflow: React.FC<AISystemsWorkflowProps> = ({ onOpenReviewModal }) => {
  const [activeStep, setActiveStep] = useState<number>(2);

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-[#D8DEE5] relative" id="ai-systems">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-xs font-semibold text-[#214E78] uppercase tracking-wider mb-4 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-[#A57C35]" />
            Systems &amp; Operating Workflows
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#30363D] tracking-tight">
            Turn Repetitive Work Into Reliable Systems
          </h2>
          <p className="mt-3 text-base text-[#505B66] leading-relaxed max-w-2xl mx-auto">
            When teams spend hours on manual coordination, data entry, and status chasing, errors happen. We replace ad-hoc routines with structured digital workflows.
          </p>
        </div>

        {/* Visual Workflow Steps */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {TECH_FLOW_STEPS.map((s, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 text-left rounded-lg transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#214E78] text-white border-[#214E78] shadow-sm'
                      : 'bg-[#F5F6F7] border-[#D8DEE5] text-[#505B66] hover:bg-white hover:border-[#214E78]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white/80' : 'text-[#505B66]/70'}`}>
                      {s.step}
                    </span>
                    <span 
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#A57C35]' : 'bg-[#D8DEE5]'}`}
                    ></span>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isSelected ? 'text-white/80' : 'text-[#505B66]/80'
                  }`}>
                    {s.phase}
                  </p>
                  <h4 className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-[#30363D]'
                  }`}>
                    {s.name}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card */}
          <div className="mt-4 p-6 sm:p-8 bg-[#F5F6F7] border border-[#D8DEE5] rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#214E78]/10 text-[#214E78] rounded border border-[#214E78]/20">
                  STAGE {TECH_FLOW_STEPS[activeStep].step}
                </span>
                <span className="text-base font-bold text-[#30363D]">
                  {TECH_FLOW_STEPS[activeStep].name}
                </span>
              </div>
              <p className="text-sm text-[#505B66] leading-relaxed">
                {TECH_FLOW_STEPS[activeStep].desc}
              </p>
              <p className="text-xs text-[#505B66]">
                <strong className="text-[#A57C35] font-semibold">Operational Value: </strong>
                {TECH_FLOW_STEPS[activeStep].impact}
              </p>
            </div>

            <button
              onClick={() => onOpenReviewModal(`AI & Systems Workflow Consultation: ${TECH_FLOW_STEPS[activeStep].name}`)}
              className="px-5 py-2.5 bg-[#214E78] text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#1a3d5e] transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow active:scale-95"
            >
              <span>Discuss This Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Core Systems Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all group shadow-sm">
            <div className="w-10 h-10 bg-[#214E78]/10 rounded-md border border-[#214E78]/20 flex items-center justify-center text-[#214E78] mb-4">
              <Workflow className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-2">
              Process Mapping &amp; SOPs
            </h4>
            <p className="text-xs text-[#505B66] leading-relaxed">
              We eliminate reliance on individual memory by designing clear Standard Operating Procedures and visual handoff steps for sales and operations.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all group shadow-sm">
            <div className="w-10 h-10 bg-[#214E78]/10 rounded-md border border-[#214E78]/20 flex items-center justify-center text-[#214E78] mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-2">
              Automated Messaging &amp; Billing
            </h4>
            <p className="text-xs text-[#505B66] leading-relaxed">
              Order confirmations, dispatch alerts, payment notifications, and delivery challans automatically generated and dispatched to customers.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all group shadow-sm">
            <div className="w-10 h-10 bg-[#214E78]/10 rounded-md border border-[#214E78]/20 flex items-center justify-center text-[#214E78] mb-4">
              <Gauge className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-2">
              Business Intelligence Dashboards
            </h4>
            <p className="text-xs text-[#505B66] leading-relaxed">
              Custom dashboards that connect your sales, inventory, and pending collections to a clean web view accessible on mobile or desktop.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#D8DEE5] rounded-lg hover:border-[#214E78] transition-all group shadow-sm">
            <div className="w-10 h-10 bg-[#214E78]/10 rounded-md border border-[#214E78]/20 flex items-center justify-center text-[#214E78] mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#30363D] group-hover:text-[#214E78] transition-colors mb-2">
              Document Management
            </h4>
            <p className="text-xs text-[#505B66] leading-relaxed">
              Structured digital archives with indexed records and automated renewal notifications so statutory and operational licenses never lapse unnoticed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
