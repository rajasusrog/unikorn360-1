import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Film, 
  Video, 
  Camera, 
  Users, 
  ChevronDown, 
  Info, 
  MapPin, 
  Layers, 
  ExternalLink,
  Clock,
  Briefcase,
  HelpCircle,
  FileCheck2,
  Lock,
  X
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { CONTENT_CATEGORIES } from '../../services/creatorService';
import { BUSINESS_INFO } from '../../data/servicesData';

interface CreatorLandingPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal?: (prefill?: string) => void;
}

export const CreatorLandingPage: React.FC<CreatorLandingPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  const FAQS = [
    {
      q: 'Is there any registration fee to join the UNIKORN360 Creator Network?',
      a: 'No. UNIKORN360 never charges creators any registration fee, evaluation fee, or subscription cost. Joining our private creator network is 100% free of charge.'
    },
    {
      q: 'What is the indicative payment for brand video assignments?',
      a: 'Approved creators typically earn between ₹1,000 and ₹10,000+ per selected brand-video assignment. Exact remuneration is determined per campaign based on production scope, script length, location requirements, and your channel metrics.'
    },
    {
      q: 'Do I need a large follower count to be accepted?',
      a: 'Not necessarily! We actively recruit UGC (User Generated Content) creators who have strong on-camera confidence, clear Tamil presentation, and solid audio-video quality, even with zero or modest followers. Nano (1k-10k) and micro creators (10k-50k) are also high in demand for regional campaigns.'
    },
    {
      q: 'Does submitting an application guarantee paid brand assignments?',
      a: 'No. Registration enters your verified profile into our private commercial directory. Brand clients select creators that match their specific product category, audience geography, and creative brief. Selection depends entirely on client campaign requirements.'
    },
    {
      q: 'Which districts and towns can creators apply from?',
      a: 'Creators from all 38 districts of Tamil Nadu (including Chennai, Coimbatore, Madurai, Salem, Tirupathur, Vellore, Trichy, Tirunelveli, and rural towns) are welcome. Regional Tamil dialect creators are highly sought after.'
    },
    {
      q: 'Is this a public influencer marketplace?',
      a: 'No. UNIKORN360 operates a private, managed talent network for verified brand clients. Your personal phone number, private rates, and application data remain strictly confidential and are never published on an open directory.'
    },
    {
      q: 'How and when are creators paid for assignments?',
      a: 'Once selected and a campaign agreement is executed, payments are processed directly via NEFT/UPI upon milestone approvals or video publication as stipulated in the campaign scope.'
    }
  ];

  return (
    <div className="bg-[#06162D] text-white min-h-screen">
      <SEOHead
        title="Tamil Content Creators Wanted — UNIKORN360 Creator Network"
        description="Get paid to create brand videos. Join the UNIKORN360 Creator Network. Free registration for Tamil UGC, nano, micro, and established digital creators across all districts."
        canonicalUrl="https://www.unikorn360.com/creators"
      />

      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[#06162D]/60 bg-[#06162D]/90 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <button 
              onClick={() => onNavigate('/')} 
              className="hover:text-[#F3C94F] transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#43C8E8] font-medium">Creator Network</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#43C8E8]/10 text-[#43C8E8] border border-[#43C8E8]/30 font-semibold tracking-wide text-[11px]">
              <Sparkles className="w-3 h-3 text-[#F3C94F]" />
              Open Call for Tamil Creators
            </span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-800">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#43C8E8]/15 via-[#F3C94F]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#F3C94F]/40 text-[#F3C94F] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#F3C94F]" />
              <span>UNIKORN360 Creator Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-white leading-tight">
              TAMIL CONTENT CREATORS <span className="text-[#F3C94F]">WANTED!</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-lg sm:text-2xl text-slate-200 font-medium leading-relaxed">
              Get paid to create brand videos. Join the UNIKORN360 Creator Network.
            </p>

            {/* Indicative Compensation Callout */}
            <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-[#43C8E8]/40 shadow-xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#F3C94F]/20 text-[#F3C94F] flex items-center justify-center shrink-0 border border-[#F3C94F]/30">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#43C8E8] uppercase tracking-wider block">
                    Indicative Compensation
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    ₹1,000 – ₹10,000+
                  </span>
                  <span className="text-xs text-slate-300 block">
                    per selected brand-video assignment
                  </span>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[10px] text-slate-400 block">Registration Fee</span>
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                  ₹0 — Always Free
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/creators/apply')}
                id="hero-apply-btn"
                className="w-full sm:w-auto px-8 py-4 bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-[#F3C94F]/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F3C94F]"
              >
                <span>Apply to Join Network</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works-creators');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>See How It Works</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Key Transparency Highlights */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#43C8E8] mb-1.5" />
                <p className="text-xs font-semibold text-white">All Districts Welcome</p>
                <p className="text-[11px] text-slate-400">Chennai, Madurai, Coimbatore &amp; all 38 TN towns</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#43C8E8] mb-1.5" />
                <p className="text-xs font-semibold text-white">UGC Creators Wanted</p>
                <p className="text-[11px] text-slate-400">No minimum follower count required for UGC</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-[#43C8E8] mb-1.5" />
                <p className="text-xs font-semibold text-white">Direct Brand Payouts</p>
                <p className="text-[11px] text-slate-400">Timely bank transfers for selected assignments</p>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 max-w-xl mx-auto italic">
              Note: Selection into the roster does not guarantee paid assignments. Remuneration depends on verified brand campaign requirements and client selection.
            </p>
          </div>
        </div>
      </section>

      {/* WHO CAN APPLY & CREATOR TIERS */}
      <section className="py-16 bg-[#081B37] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-bold text-[#F3C94F] uppercase tracking-[0.2em] block mb-2">
              Who Can Apply
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Every Stage of Digital Creator is Welcome
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Brands need diverse voices. Whether you create candid smartphone reviews in your town or produce high-budget cinematic reels, there are brand campaigns built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: UGC Creators */}
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 hover:border-[#43C8E8]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#43C8E8]/10 text-[#43C8E8] flex items-center justify-center mb-4">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#F3C94F] uppercase tracking-wider block mb-1">
                  No Follower Minimum
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  UGC Creators
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Confident on camera with natural Tamil communication. Create relatable video ads and testimonials for brands to run on their social channels.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-[#43C8E8] font-semibold">
                Typical Scope: ₹1,000 – ₹3,000 per video
              </div>
            </div>

            {/* Card 2: Nano Creators */}
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 hover:border-[#43C8E8]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F3C94F]/10 text-[#F3C94F] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#43C8E8] uppercase tracking-wider block mb-1">
                  1,000 – 10,000 Followers
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Nano Creators
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Niche community leaders with tight-knit engagement. Exceptional conversion rates for local retail, specialized services, and district-level campaigns.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-[#F3C94F] font-semibold">
                Typical Scope: ₹1,500 – ₹4,000 per reel
              </div>
            </div>

            {/* Card 3: Micro Creators */}
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 hover:border-[#43C8E8]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#43C8E8]/10 text-[#43C8E8] flex items-center justify-center mb-4">
                  <Film className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#F3C94F] uppercase tracking-wider block mb-1">
                  10,000 – 50,000 Followers
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Micro Creators
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Proven track record of consistent views and reach. Strong regional dialect authority in food, travel, fashion, technology, and farming.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-[#43C8E8] font-semibold">
                Typical Scope: ₹3,500 – ₹7,500 per reel
              </div>
            </div>

            {/* Card 4: Mid & Established Creators */}
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 hover:border-[#43C8E8]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F3C94F]/10 text-[#F3C94F] flex items-center justify-center mb-4">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#43C8E8] uppercase tracking-wider block mb-1">
                  50,000+ Followers
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Mid &amp; Macro Creators
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High virality potential and statewide recognition. Selected for major brand rollouts, store inaugurations, and comprehensive multi-asset campaigns.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-[#F3C94F] font-semibold">
                Typical Scope: ₹8,000 – ₹15,000+ per deal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 17+ CONTENT CATEGORIES */}
      <section className="py-16 bg-[#06162D] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-[#43C8E8] uppercase tracking-[0.2em] block mb-2">
              Industry Demands
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Categories Brands Actively Seek
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              We match creators with brand campaigns across all major consumer and business verticals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CONTENT_CATEGORIES.map((category) => (
              <div
                key={category}
                className="p-3.5 rounded-xl bg-[#081B37] border border-slate-800 hover:border-[#F3C94F]/50 transition-colors flex items-center gap-2.5 text-left group"
              >
                <div className="w-2 h-2 rounded-full bg-[#F3C94F] shrink-0 group-hover:scale-125 transition-transform" />
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY JOIN US */}
      <section className="py-16 bg-[#081B37] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-bold text-[#F3C94F] uppercase tracking-[0.2em] block mb-2">
              Why Join Unikorn360
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Professional Brand Relationships. No Middleman Exploitation.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-[#43C8E8]/15 text-[#43C8E8] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                100% Free &amp; Transparent
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero sign-up costs, zero hidden cutbacks. We never deduct unexpected platform fees from creator payments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-[#F3C94F]/15 text-[#F3C94F] flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Clear Creative Briefs
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No guessing games. Every brand assignment comes with clear messaging points, deliverable deadlines, and expectations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-[#43C8E8]/15 text-[#43C8E8] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Timely, Reliable Payouts
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bank transfers directly upon deliverable completion. No chasing invoices for months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works-creators" className="py-16 bg-[#06162D] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-[#F3C94F] uppercase tracking-[0.2em] block mb-2">
              Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              How the Network Operates
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Simple 4-stage journey from application to paid brand assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#081B37] border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-[#43C8E8]/30 font-serif block mb-2">01</span>
              <h3 className="text-base font-bold text-white mb-2">Submit Profile</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete our multi-step registration with your links, video sample proofs, and category preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#081B37] border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-[#F3C94F]/30 font-serif block mb-2">02</span>
              <h3 className="text-base font-bold text-white mb-2">Quality Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our creator desk audits your audio-video quality, presentation clarity, and engagement within 3–5 working days.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#081B37] border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-[#43C8E8]/30 font-serif block mb-2">03</span>
              <h3 className="text-base font-bold text-white mb-2">Brand Matching</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a brand client needs your specific niche, audience district, or UGC style, we present your portfolio.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#081B37] border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-[#F3C94F]/30 font-serif block mb-2">04</span>
              <h3 className="text-base font-bold text-white mb-2">Deliver &amp; Get Paid</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Shoot according to the agreed brief, submit deliverables, and receive your agreed remuneration directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CREATOR PAYMENT STRUCTURE EXPLANATION */}
      <section className="py-16 bg-[#081B37] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-[11px] font-bold text-[#43C8E8] uppercase tracking-[0.2em] block mb-2">
              Fair Compensation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Creator Payment Structure
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Clear guidelines on how compensation is structured for campaign assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 text-left">
              <div className="text-[#F3C94F] font-bold text-sm uppercase tracking-wider mb-2">
                1. Pure UGC Videos
              </div>
              <p className="text-xl font-bold text-white mb-2">₹1,000 – ₹3,000+</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                You record a vertical video (30-60s) following the brand's script or creative hooks. You do not need to post it on your personal page.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 text-left">
              <div className="text-[#43C8E8] font-bold text-sm uppercase tracking-wider mb-2">
                2. Sponsored Reels / Shorts
              </div>
              <p className="text-xl font-bold text-white mb-2">₹2,500 – ₹7,500+</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Video created and published on your Instagram or YouTube account, tapping into your follower audience and reach.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06162D] border border-slate-800 text-left">
              <div className="text-[#F3C94F] font-bold text-sm uppercase tracking-wider mb-2">
                3. On-Location &amp; Event Shoots
              </div>
              <p className="text-xl font-bold text-white mb-2">₹5,000 – ₹10,000+</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Store launches, restaurant tasting walkthroughs, property tours, or factory inspections with on-site filming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 bg-[#06162D] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-[#F3C94F] uppercase tracking-[0.2em] block mb-2">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl bg-[#081B37] border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#F3C94F] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-16 bg-gradient-to-b from-[#081B37] to-[#06162D] text-center border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-[#F3C94F]/40 text-[#F3C94F] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Registration is 100% Free</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white mb-4">
            Ready to Monetize Your Content Creation?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Complete the 6-step registration. It takes less than 5 minutes to submit your details and portfolio links.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/creators/apply')}
              className="w-full sm:w-auto px-8 py-4 bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] font-bold text-sm tracking-wider uppercase rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Start Creator Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              Creator Terms &amp; Conditions
            </button>
            <span>•</span>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              Privacy &amp; Data Policy
            </button>
          </div>
        </div>
      </section>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081B37] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto relative text-left">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F3C94F]" />
              UNIKORN360 Creator Network Terms
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Nature of the Network:</strong> The UNIKORN360 Creator Network is a private creator roster managed by UNIKORN360 Business Intelligence for connecting content creators with commercial brand clients. It is not an open marketplace or employment relationship.
              </p>
              <p>
                <strong>2. Zero Registration Fees:</strong> UNIKORN360 guarantees that creator application and membership within the network are strictly free of charge. No creator shall ever be charged for registration or profile inclusion.
              </p>
              <p>
                <strong>3. No Guarantee of Assignments:</strong> Acceptance of an application confirms your inclusion in our internal evaluated database. It does not constitute a promise or guarantee of paid assignments, which are awarded solely upon individual client campaign requirements.
              </p>
              <p>
                <strong>4. Accuracy of Metrics:</strong> Creators warrant that all follower metrics, sample links, and portfolio materials submitted are authentic and genuinely represent their own work.
              </p>
              <p>
                <strong>5. Independent Contractor Status:</strong> For any brand engagement executed through UNIKORN360, the creator operates as an independent contractor under a separate, campaign-specific statement of work.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 text-right">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081B37] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto relative text-left">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#43C8E8]" />
              Creator Data Privacy Policy
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Data Collected:</strong> We collect your name, phone number, email, social profile links, viewer statistics, sample videos, and commercial preferences strictly for the purpose of matching you with relevant brand campaigns.
              </p>
              <p>
                <strong>Confidentiality:</strong> Your private contact details (phone, email) are kept strictly confidential by UNIKORN360 administrators and are never sold or published on any public website.
              </p>
              <p>
                <strong>Client Sharing:</strong> Only your public channel metrics, sample video links, and category profile will be presented to prospective brand clients for campaign selection with your express consent.
              </p>
              <p>
                <strong>Data Rights:</strong> You may at any time request the update or deletion of your creator application by contacting contact.unikorn360@gmail.com.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 text-right">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
