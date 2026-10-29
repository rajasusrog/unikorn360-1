import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { WhatsAppSubmitButton } from '../components/WhatsAppSubmitButton';
import { BUSINESS_INFO } from '../data/servicesData';

interface CreatorNetworkPageProps {
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
}

export const CreatorNetworkPage: React.FC<CreatorNetworkPageProps> = ({
  onNavigate,
  onOpenReviewModal
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [language, setLanguage] = useState('English');
  const [niche, setNiche] = useState('Business / Tech / Lifestyle');
  const [audienceLocation, setAudienceLocation] = useState('');
  const [followers, setFollowers] = useState('10k - 50k');
  const [phone, setPhone] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !handle.trim()) {
      alert('Please fill in your name, channel handle, and WhatsApp number.');
      return;
    }

    setIsPreparing(true);

    const messageLines = [
      `*UNIKORN360 — CREATOR NETWORK APPLICATION*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *Creator Name:* ${name.trim()}`,
      `• *Channel/Handle:* ${handle.trim()}`,
      `• *Primary Platform:* ${platform}`,
      `• *Follower Tier:* ${followers}`,
      `• *Content Language:* ${language}`,
      `• *Content Niche:* ${niche}`,
      ...(audienceLocation.trim() ? [`• *Audience Territory:* ${audienceLocation.trim()}`] : []),
      `• *WhatsApp Phone:* ${phone.trim()}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `I would like to register with Unikorn360 for brand collaboration campaigns.`
    ];

    const encoded = encodeURIComponent(messageLines.join('\n'));
    const url = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encoded}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setIsPreparing(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-[#F5F6F7] min-h-screen">
      <SEOHead
        title="Creator Network — Join the UNIKORN360 Creator Roster"
        description="Join Unikorn360's creator network for authentic brand partnerships, transparent payouts, and commercial collaborations."
        canonicalUrl="https://www.unikorn360.com/creator-network"
      />

      {/* Header */}
      <section className="bg-white border-b border-[#D8DEE5] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Creator Network', current: true }
            ]}
          />

          <div className="max-w-3xl mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A57C35]/10 border border-[#A57C35]/30 rounded text-[#A57C35] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Digital Content Creators &amp; Influencers</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#30363D] tracking-tight leading-tight">
              Partner with Trusted Businesses &amp; Growing Brands
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#505B66] leading-relaxed">
              Are you a content creator on YouTube, Instagram, or LinkedIn? We connect authentic creators with verified MSME brands, manufacturing enterprises, retail groups, and technology companies with guaranteed transparent commercial payouts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 pt-6 border-t border-[#D8DEE5] text-xs text-[#505B66]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                <span>Zero Agency Commission Gouging</span>
              </span>
              <span className="text-[#D8DEE5]">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                <span>Prompt Milestone Payments</span>
              </span>
              <span className="text-[#D8DEE5]">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#214E78]" />
                <span>Legally Binding Contracts</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Application Form & Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white border border-[#D8DEE5] rounded-xl p-6 sm:p-8 shadow-sm">
            <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block mb-1">
              Creator Onboarding Desk
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#30363D]">
              Join the UNIKORN360 Creator Network
            </h2>
            <p className="text-xs text-[#505B66] mt-1 mb-6">
              Complete your profile below. When a matching brand campaign arises for your niche or audience, our team contacts you directly with clear commercial briefs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyan S."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:ring-1 focus:ring-[#214E78]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Channel / Handle Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@yourhandle / Channel Name"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D] focus:outline-none focus:ring-1 focus:ring-[#214E78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Primary Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Podcast">Podcast / Audio</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Audience Size Tier
                  </label>
                  <select
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  >
                    <option value="5k - 20k (Micro)">5,000 – 20,000 (Micro)</option>
                    <option value="20k - 100k (Mid-Tier)">20,000 – 100,000 (Mid-Tier)</option>
                    <option value="100k - 500k (Macro)">100,000 – 500,000 (Macro)</option>
                    <option value="500k+ (Enterprise)">500,000+ (High Reach)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Primary Content Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Bilingual / Multilingual">Bilingual / Multilingual</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                    Content Niche
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Business, Tech, Manufacturing, Retail"
                    className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  Primary Audience Territory (Optional)
                </label>
                <input
                  type="text"
                  value={audienceLocation}
                  onChange={(e) => setAudienceLocation(e.target.value)}
                  placeholder="e.g. Pan-India, Metro, South India, Tier 2 &amp; Tier 3"
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                />
               </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#505B66] block mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98848 XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs text-[#30363D]"
                />
              </div>

              <div className="pt-2">
                <WhatsAppSubmitButton
                  onClick={handleSubmit}
                  isPreparing={isPreparing}
                  label="Submit Application via WhatsApp"
                  preparedLabel="Application Prepared · Opening WhatsApp..."
                  className="w-full justify-center"
                />
              </div>

              {submitted && (
                <p className="text-[10px] text-[#505B66] text-center italic mt-1">
                  * Application formatted. Please tap <strong>Send</strong> in WhatsApp.
                </p>
              )}
            </form>
          </div>

          {/* Right Column: Why Join */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#D8DEE5] rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-serif font-bold text-[#30363D] mb-3">
                Why Join Unikorn360 Network?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#214E78]/10 text-[#214E78] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#30363D]">Verified Commercial Contracts</h4>
                    <p className="text-[11px] text-[#505B66] mt-0.5">
                      No verbal ambiguity or ghosting. Every campaign has signed scope, clear video briefs, and defined usage rights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#214E78]/10 text-[#214E78] flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#30363D]">Guaranteed Payout Terms</h4>
                    <p className="text-[11px] text-[#505B66] mt-0.5">
                      Agreed commercial fees paid promptly upon deliverable approval with formal TDS tax challans provided.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#214E78]/10 text-[#214E78] flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#30363D]">Authentic Enterprise Brands</h4>
                    <p className="text-[11px] text-[#505B66] mt-0.5">
                      Collaborate with genuine manufacturing brands, educational institutes, and growing enterprises that resonate with your audience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note distinguishing client services */}
            <div className="p-5 bg-[#214E78]/5 border border-[#214E78]/20 rounded-xl text-xs text-[#505B66]">
              <strong className="text-[#214E78] block mb-1">Looking to hire creators for your business?</strong>
              If you are a company seeking to run an influencer marketing campaign, please explore our <button onClick={() => onNavigate('/services/influence/creator-campaign-management')} className="text-[#214E78] font-bold hover:underline cursor-pointer">Creator Campaign Management</button> service under the Influence division.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
