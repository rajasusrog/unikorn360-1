import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '../data/servicesData';
import { GovernmentScheme } from '../types';

interface GovernmentSchemesSectionProps {
  onOpenReviewModal: (prefill?: string) => void;
}

export const GovernmentSchemesSection: React.FC<GovernmentSchemesSectionProps> = ({ onOpenReviewModal }) => {
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme>(GOVERNMENT_SCHEMES[0]);
  const [quizInvestment, setQuizInvestment] = useState<string>('under25l');
  const [quizType, setQuizType] = useState<string>('manufacturing');
  const [quizAge, setQuizAge] = useState<string>('existing');
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const handleRunEligibilityCheck = () => {
    let result = '';
    if (quizType === 'manufacturing') {
      if (quizAge === 'new') {
        result = 'PMEGP (Up to 35% Margin Money Subsidy) and NEEDS Scheme (Up to ₹75 Lakhs Capital Subsidy + 3% Interest Subvention) are potential options for evaluation.';
      } else {
        result = 'State MSME Capital Subsidy (up to 25% on eligible plant & machinery) + Generator Subsidy + Interest Subvention schemes for existing units.';
      }
    } else {
      result = 'MUDRA Loan (up to ₹20 Lakhs collateral-free credit) and UYEGP / PMEGP service sector assistance.';
    }
    setQuizResult(result);
  };

  return (
    <section className="py-16 lg:py-24 bg-[#EFECE5] border-t border-[#E4DFD5] relative" id="schemes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C49A36] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0B1426]" />
            <span>Regulatory Advisory &amp; Subsidies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1426] tracking-tight">
            Government Schemes &amp; Subsidy Assistance
          </h2>
          <p className="mt-3 text-base text-[#526176] leading-relaxed max-w-2xl mx-auto">
            We provide structured DPR documentation, eligibility assessments, and statutory filing support for central and Tamil Nadu state industrial incentive programs.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#526176] bg-white px-3.5 py-1.5 rounded-lg border border-[#E4DFD5]">
            <Info className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
            <span>Note: Final sanction and disbursement are subject to bank credit appraisal and state committee approvals.</span>
          </div>
        </div>

        {/* Schemes Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {GOVERNMENT_SCHEMES.map((scheme) => (
            <button
              type="button"
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                selectedScheme.id === scheme.id
                  ? 'bg-[#0B1426] text-white shadow-xs'
                  : 'bg-white text-[#526176] hover:text-[#0B1426] border border-[#E4DFD5]'
              }`}
            >
              <span>{scheme.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Scheme Deep View Card */}
        <div className="bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-10 shadow-xs mb-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E4DFD5]">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 bg-[#EFECE5] border border-[#E4DFD5] text-xs font-bold text-[#0B1426] uppercase tracking-wider rounded">
                  {selectedScheme.name}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#526176]">Central &amp; Tamil Nadu Program</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1426]">
                {selectedScheme.fullName}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onOpenReviewModal(`Subsidy Assistance: ${selectedScheme.name} (${selectedScheme.fullName})`)}
              className="px-6 py-3 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 self-start lg:self-center cursor-pointer shadow-xs"
            >
              <span>Discuss Scheme Eligibility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left: Subsidy Amount & Highlights */}
            <div className="space-y-4">
              <div className="p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C49A36] block mb-1">
                  Incentive Benefit / Amount
                </span>
                <p className="text-sm font-semibold text-[#0B1426]">
                  {selectedScheme.subsidyAmount}
                </p>
              </div>

              <div className="p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526176] block mb-1">
                  Primary Purpose
                </span>
                <p className="text-xs text-[#263449] leading-relaxed">
                  {selectedScheme.purpose}
                </p>
              </div>

              <div className="p-4 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526176] block mb-1">
                  Eligibility Criteria
                </span>
                <p className="text-xs text-[#263449] leading-relaxed">
                  {selectedScheme.eligibility}
                </p>
              </div>
            </div>

            {/* Right 2 cols: What Unikorn360 Handles */}
            <div className="lg:col-span-2 p-6 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1426] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0B1426] rounded-full"></span>
                  <span>Scope of Professional Assistance</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {selectedScheme.ourRole.map((role, idx) => (
                    <div key={idx} className="p-3 bg-white border border-[#E4DFD5] rounded-lg text-xs text-[#263449] flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C49A36] shrink-0 mt-0.5" />
                      <span>{role}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#E4DFD5]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#526176] mb-2">
                    Key Highlights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedScheme.keyHighlights.map((hl, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-white text-[#0B1426] border border-[#E4DFD5] rounded-lg">
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedScheme.id === 'grievance-escalation' && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-950">Statutory Representation:</strong> We prepare structured representations, portal escalations, and clarification responses for applications facing administrative delays.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Scheme Eligibility Quiz Card */}
        <div className="bg-white border border-[#E4DFD5] rounded-xl p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B1426]">
              Check Which Schemes Apply to Your Unit
            </h3>
            <p className="text-xs sm:text-sm text-[#526176] mt-2">
              Select your parameters below to identify matching state or central incentive programs:
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-[#0B1426] block mb-1.5">
                Industry Activity
              </label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs font-medium text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
              >
                <option value="manufacturing">Manufacturing / Industrial</option>
                <option value="leather">Leather / Tannery / Footwear</option>
                <option value="trading">Trading / Wholesale</option>
                <option value="service">Service Enterprise</option>
                <option value="food">Food Processing / Agro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0B1426] block mb-1.5">
                Business Stage
              </label>
              <select
                value={quizAge}
                onChange={(e) => setQuizAge(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs font-medium text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
              >
                <option value="new">Setting Up New Unit / First Venture</option>
                <option value="existing">Existing Unit (Expanding / Modernising)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0B1426] block mb-1.5">
                Project Cost / Machinery
              </label>
              <select
                value={quizInvestment}
                onChange={(e) => setQuizInvestment(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E4DFD5] rounded-lg text-xs font-medium text-[#0B1426] focus:outline-none focus:border-[#0B1426]"
              >
                <option value="under25l">Under ₹25 Lakhs</option>
                <option value="25l-1cr">₹25 Lakhs to ₹1 Crore</option>
                <option value="1cr-5cr">₹1 Crore to ₹5 Crores</option>
                <option value="above5cr">Above ₹5 Crores</option>
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleRunEligibilityCheck}
              className="px-6 py-3 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Analyze Scheme Fit
            </button>
          </div>

          {quizResult && (
            <div className="mt-6 p-5 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B1426] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C49A36]" /> Identified Program Matches
              </div>
              <p className="text-sm font-medium text-[#263449] leading-relaxed mb-4">
                {quizResult}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E4DFD5]">
                <span className="text-xs text-[#526176]">
                  We can prepare your detailed project report (DPR) and statutory filings.
                </span>
                <button
                  type="button"
                  onClick={() => onOpenReviewModal(`Subsidy Eligibility Result: ${quizResult}`)}
                  className="px-4 py-2 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Schedule Consultation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
