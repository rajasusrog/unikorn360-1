import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileCheck2,
  Phone,
  Home
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { BUSINESS_INFO } from '../../data/servicesData';
import { extractCreatorReference } from '../../lib/router';

interface CreatorSuccessPageProps {
  onNavigate: (path: string) => void;
  search?: string;
}

export const CreatorSuccessPage: React.FC<CreatorSuccessPageProps> = ({ onNavigate, search }) => {
  const [copied, setCopied] = useState(false);

  const refNumber = extractCreatorReference(search);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#06162D] text-white min-h-screen py-16 px-4 sm:px-6">
      <SEOHead
        title="Application Received — UNIKORN360 Creator Network"
        description="Your creator network application has been recorded. Review timeline, evaluation steps, and campaign matching details."
        canonicalUrl="https://www.unikorn360.com/creators/success"
      />

      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10 animate-checkmark" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#F3C94F]/40 text-[#F3C94F] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Application Successfully Logged</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white mb-3">
          Welcome to the UNIKORN360 Creator Pipeline
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto mb-8">
          Thank you for applying. Your profile and portfolio examples have been saved to our private creator database for brand campaign matching.
        </p>

        {/* Reference Number Box */}
        <div className="p-5 rounded-2xl bg-[#081B37] border border-[#43C8E8]/40 shadow-xl mb-10 text-left">
          <span className="text-[11px] font-bold text-[#43C8E8] uppercase tracking-wider block mb-1">
            Application Reference Number
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {refNumber}
            </span>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Ref</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Keep this reference code for future correspondence with the UNIKORN360 Creator Desk.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="p-6 rounded-2xl bg-[#081B37] border border-slate-800 text-left mb-10">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F3C94F]" />
            What Happens Next?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-[#43C8E8] border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Quality &amp; Link Verification</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Our creator relations team reviews your video samples, audio clarity, and social handles within 3 to 5 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-[#F3C94F] border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Placement in Private Brand Catalogue</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your verified profile is classified by niche, dialect, follower tier, and district, ready to be presented to brand clients for campaign pitches.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-[#43C8E8] border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Direct Campaign Outreach</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  When a verified brand confirms a campaign matching your creator profile, you will receive the brief, delivery schedule, and payout confirmation directly via WhatsApp and Email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Assurances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
          <div className="p-4 rounded-xl bg-[#081B37] border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white">100% Free Registration</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              UNIKORN360 never asks creators for registration, entry, or evaluation fees.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#081B37] border border-slate-800">
            <FileCheck2 className="w-5 h-5 text-[#F3C94F] mb-2" />
            <h3 className="text-xs font-bold text-white">Direct Campaign Payouts</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Indicative ₹1,000 to ₹10,000+ per assignment paid via bank transfer upon milestone sign-offs.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('/creators')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>Back to Creator Hub</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
