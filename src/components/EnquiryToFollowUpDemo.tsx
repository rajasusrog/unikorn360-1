import React, { useState } from 'react';
import {
  Inbox,
  FileText,
  BellRing,
  CheckCircle2,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface EnquiryToFollowUpDemoProps {
  onOpenReviewModal: (prefill?: string) => void;
}

const DEMO_STEPS = [
  {
    id: 1,
    icon: Inbox,
    label: '1. Enquiry captured',
    summary: 'A new customer inquiry from your website or WhatsApp is logged automatically in one place.',
    cardTitle: 'Incoming Enquiry · #ENQ-1042',
    badge: 'Received automatically',
    fields: [
      { label: 'Customer', value: 'Sri Lakshmi Engineering Works' },
      { label: 'Channel', value: 'Website Enquiry Form' },
      { label: 'Requirement', value: '30 Custom Packaging Crates · Monthly Supply' },
      { label: 'Owner Action', value: 'Assigned to Sales Desk · Instant alert sent' }
    ],
    outcome: 'Result: Zero lost leads sitting unread across staff phones.'
  },
  {
    id: 2,
    icon: FileText,
    label: '2. Quote prepared',
    summary: 'Generate a consistent itemized quotation with GST calculations in under two minutes.',
    cardTitle: 'Draft Quotation · #QT-2026-104',
    badge: 'Ready to share',
    fields: [
      { label: 'Items & Qty', value: '30 Heavy-Duty Pallets @ ₹1,850/unit' },
      { label: 'Tax Split', value: '₹55,500 + 18% GST (₹9,990) = ₹65,490' },
      { label: 'Delivery Terms', value: 'Dispatch within 5 working days' },
      { label: 'Customer Copy', value: 'PDF Quotation sent via WhatsApp & Email' }
    ],
    outcome: 'Result: Clean pricing without formula errors or manual Word edits.'
  },
  {
    id: 3,
    icon: BellRing,
    label: '3. Follow-up automated',
    summary: 'Polite reminders go out on schedule until the order confirms and invoice balance settles.',
    cardTitle: 'Follow-Up Timeline · Active',
    badge: 'Scheduled automatically',
    fields: [
      { label: 'Day 2 Reminder', value: 'Polite WhatsApp check-in sent at 10:30 AM' },
      { label: 'Order Confirmed', value: 'Converted to GST Invoice #INV-2026-088' },
      { label: 'Advance Paid', value: '₹35,000 recorded · ₹30,490 balance due' },
      { label: 'Balance Alert', value: 'Due-date reminder queued for dispatch day' }
    ],
    outcome: 'Result: Faster confirmations and timely payment collections.'
  }
];

export const EnquiryToFollowUpDemo: React.FC<EnquiryToFollowUpDemoProps> = ({
  onOpenReviewModal
}) => {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const currentStep = DEMO_STEPS.find((s) => s.id === activeStepId) || DEMO_STEPS[0];

  return (
    <section
      id="practical-example"
      aria-labelledby="practical-example-heading"
      className="py-16 lg:py-20 bg-[#F6F5F1] border-b border-[#E4DFD5]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block mb-2">
              Sample Interactive Demo
            </span>
            <h2
              id="practical-example-heading"
              className="text-2xl sm:text-3xl font-bold text-[#0B1426] tracking-tight"
            >
              Practical Example: Enquiry to Quote to Follow-Up
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#526176] leading-relaxed">
              Click each step below to see a sample demonstration of how a connected business system replaces manual spreadsheets.
            </p>
          </div>
          <span className="text-xs font-medium text-[#526176] bg-white border border-[#E4DFD5] px-3 py-1.5 rounded-lg shrink-0 self-start md:self-auto">
            Sample workflow demonstration
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 3 Step Triggers */}
          <div className="lg:col-span-5 space-y-3" role="tablist" aria-label="Enquiry to follow-up workflow steps">
            {DEMO_STEPS.map((step) => {
              const Icon = step.icon;
              const isSelected = step.id === activeStepId;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B1426] border-[#0B1426] text-white shadow-sm'
                      : 'bg-white border-[#E4DFD5] text-[#263449] hover:border-[#0B1426]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#C49A36] text-[#0B1426]'
                          : 'bg-[#F6F5F1] text-[#0B1426] border border-[#E4DFD5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-[#0B1426]'
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? 'text-white/85' : 'text-[#526176]'
                        }`}
                      >
                        {step.summary}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Interactive Sample View */}
          <div
            role="tabpanel"
            className="lg:col-span-7 bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E4DFD5]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A36] block">
                  Sample Demo View · Step {currentStep.id} of 3
                </span>
                <h3 className="text-lg font-bold text-[#0B1426] mt-0.5">
                  {currentStep.cardTitle}
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#0B1426] bg-[#F6F5F1] border border-[#E4DFD5] px-3 py-1 rounded-lg">
                {currentStep.badge}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStep.fields.map((field) => (
                <div
                  key={field.label}
                  className="p-3.5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#526176] block">
                    {field.label}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#0B1426] mt-1 block">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-[#0B1426] text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#C49A36] shrink-0 mt-0.5" />
                <span>{currentStep.outcome}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeStepId < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStepId(activeStepId + 1)}
                    className="px-4 py-2 bg-[#C49A36] hover:bg-[#D5AF4E] text-[#0B1426] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenReviewModal('Enquiry-to-Follow-Up Workflow Discussion')}
                    className="px-4 py-2 bg-[#C49A36] hover:bg-[#D5AF4E] text-[#0B1426] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss a workflow like this</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
