import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Layers3,
  Sparkles
} from 'lucide-react';

interface HeroProps {
  onOpenReviewModal: () => void;
  onScrollToSection: (sectionId: string) => void;
  onNavigate?: (path: string) => void;
}

const HERO_SCENES = [
  {
    id: 'brand',
    number: '01',
    label: 'Our vision',
    title: 'Intelligent systems. Real-world impact.',
    image: '/assets/hero/brand.webp',
    alt: 'UNIKORN360 brand introduction',
    note: 'A connected view of your business'
  },
  {
    id: 'services',
    number: '02',
    label: 'Our capabilities',
    title: 'One partner. A 360° perspective.',
    image: '/assets/hero/services.webp',
    alt: 'UNIKORN360 services and specialist divisions',
    note: 'Technology, operations and growth'
  },
  {
    id: 'products',
    number: '03',
    label: 'Our products',
    title: 'Purpose-built tools for better business.',
    image: '/assets/hero/products.webp',
    alt: 'UNIKORN360 product family',
    note: 'Practical software. Connected workflows.'
  }
] as const;

const DIVISIONS = [
  { label: 'Websites & Software', slug: 'websites-software' },
  { label: 'Security & Maintenance', slug: 'security-maintenance' },
  { label: 'Marketing & Creators', slug: 'marketing-creator-campaigns' },
  { label: 'AI & Automation', slug: 'ai-automation-business-systems' },
  { label: 'Research & Strategy', slug: 'research-business-strategy' },
  { label: 'Business Setup', slug: 'business-setup-documentation' }
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const Hero: React.FC<HeroProps> = ({
  onOpenReviewModal,
  onScrollToSection,
  onNavigate
}) => {
  const [activeScene, setActiveScene] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Optional scroll-scrubbed film. Add the licensed MP4 to the deployment and
  // set VITE_HERO_VIDEO_SRC to its public URL/path. Static artwork remains the
  // dependable fallback when no film is configured or the browser declines it.
  const heroVideoSrc = import.meta.env.VITE_HERO_VIDEO_SRC?.trim();
  const useScrollFilm = Boolean(heroVideoSrc) && !videoFailed;

  useEffect(() => {
    if (!useScrollFilm) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!section || !video || prefersReducedMotion) return;

    let frame = 0;

    const updateFrame = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const sectionTop = window.scrollY + section.getBoundingClientRect().top;
        const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1);
        const progress = clamp((window.scrollY - sectionTop) / scrollRange, 0, 1);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          const targetTime = progress * Math.max(video.duration - 0.04, 0);
          if (Math.abs(video.currentTime - targetTime) > 0.075) {
            try {
              video.currentTime = targetTime;
            } catch {
              // Some browsers do not permit seeking until the first video frame.
            }
          }
        }
      });
    };

    window.addEventListener('scroll', updateFrame, { passive: true });
    window.addEventListener('resize', updateFrame);
    video.addEventListener('loadedmetadata', updateFrame);
    updateFrame();

    return () => {
      window.removeEventListener('scroll', updateFrame);
      window.removeEventListener('resize', updateFrame);
      video.removeEventListener('loadedmetadata', updateFrame);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [useScrollFilm]);

  const handleDivisionClick = (slug: string) => {
    if (onNavigate) {
      onNavigate(`/services/${slug}`);
    } else {
      onScrollToSection('services');
    }
  };

  const active = HERO_SCENES[activeScene];

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="UNIKORN360 introduction"
      className={`relative isolate overflow-hidden bg-[#07111F] text-white ${useScrollFilm ? 'min-h-[138svh]' : 'min-h-[calc(100svh-5rem)]'}`}
    >
      <div className={`${useScrollFilm ? 'sticky top-20' : 'relative'} min-h-[calc(100svh-5rem)] overflow-hidden`}>
        {/* Cinematic background layer: a scroll-scrubbed film when configured,
            or the existing branded hero artwork when no film is available. */}
        <div className="absolute inset-0 overflow-hidden bg-[#07111F]">
          {useScrollFilm ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover opacity-55"
              muted
              playsInline
              preload="metadata"
              poster="/assets/hero/brand.webp"
              onError={() => setVideoFailed(true)}
              aria-hidden="true"
            >
              <source src={heroVideoSrc} type="video/mp4" />
            </video>
          ) : (
            <img
              key={active.image}
              src={active.image}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,25,.98)_0%,rgba(5,13,25,.88)_38%,rgba(5,13,25,.48)_72%,rgba(5,13,25,.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(196,154,54,.20),transparent_42%)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col justify-between px-4 pb-7 pt-12 sm:px-6 sm:pb-9 sm:pt-14 lg:px-8 lg:pt-16">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.03fr_.97fr] lg:gap-12">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#C49A36]/35 bg-[#C49A36]/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.24em] text-[#E5C77B] sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D8B45B] shadow-[0_0_12px_rgba(216,180,91,.9)]" />
                Business Intelligence · Systems · Technology
              </div>

              <p className="mb-4 text-xs font-medium uppercase tracking-[.26em] text-white/55">
                UNIKORN360 Business Intelligence
              </p>

              <h1 className="max-w-2xl text-[clamp(2.65rem,6.1vw,5.55rem)] font-semibold leading-[.99] tracking-[-.055em] text-white">
                Intelligent systems.
                <span className="mt-2 block font-serif font-normal italic tracking-[-.045em] text-[#D9B65D]">
                  Real-world impact.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-200/80 sm:text-lg sm:leading-8">
                We connect technology, business operations and practical intelligence — building digital platforms and systems that help organisations work smarter and grow with confidence.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  id="hero-cta-discuss"
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-[#C49A36] px-7 text-sm font-bold text-[#07111F] shadow-[0_12px_36px_rgba(196,154,54,.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D9B65D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C77B]"
                >
                  Discuss your project
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onScrollToSection('service-finder')}
                  id="hero-cta-services"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-white/25 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-[#D9B65D]/70 hover:bg-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C77B]"
                >
                  Explore what we do
                  <ArrowDownRight className="h-4 w-4 text-[#D9B65D]" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#D9B65D]" />
                  First assessment at no cost
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                <span>Clearly scoped proposals before work begins</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto">
              <div className="absolute -inset-7 rounded-[2rem] bg-[#C49A36]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0C1A2C]/80 p-3 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-4">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65">
                    <Compass className="h-3.5 w-3.5 text-[#D9B65D]" />
                    {active.label}
                  </div>
                  <span className="font-mono text-[10px] tracking-[.18em] text-[#D9B65D]">
                    {active.number} / 03
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#07111F]">
                  <img
                    key={active.image}
                    src={active.image}
                    alt={active.alt}
                    width={2172}
                    height={724}
                    loading="eager"
                    fetchPriority="high"
                    className="aspect-[3/1] w-full object-contain transition duration-700 motion-safe:animate-[heroReveal_.7s_ease-out_both]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07111F]/20 via-transparent to-white/[0.04]" />
                </div>

                <div className="flex items-end justify-between gap-4 px-1 pb-1 pt-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[.2em] text-[#D9B65D]">
                      {active.note}
                    </p>
                    <p className="mt-1 max-w-sm text-sm font-medium leading-6 text-white/90 sm:text-base">
                      {active.title}
                    </p>
                  </div>
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C49A36]/40 bg-[#C49A36]/10 text-[#D9B65D] sm:flex">
                    {activeScene === 0 ? <Sparkles className="h-5 w-5" /> : activeScene === 1 ? <Layers3 className="h-5 w-5" /> : <Compass className="h-5 w-5" />}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                  {HERO_SCENES.map((scene, index) => {
                    const isActive = index === activeScene;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => setActiveScene(index)}
                        aria-pressed={isActive}
                        className={`group flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition sm:text-[11px] ${isActive ? 'bg-[#C49A36]/15 text-[#E5C77B]' : 'text-white/50 hover:bg-white/[.06] hover:text-white/85'}`}
                      >
                        <span className={`font-mono ${isActive ? 'text-[#D9B65D]' : 'text-white/35'}`}>{scene.number}</span>
                        <span>{scene.id === 'brand' ? 'Brand' : scene.id === 'services' ? 'Services' : 'Products'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pointer-events-none absolute -right-4 top-[18%] hidden translate-x-1/2 rounded-xl border border-white/15 bg-[#0B192B]/90 px-4 py-3 shadow-xl backdrop-blur-lg xl:block">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[.2em] text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9B65D]" />
                  Connected thinking
                </div>
                <p className="mt-1 text-sm font-semibold text-white">One business. One view.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/45">
                Explore our specialist divisions
              </span>
              <span className="hidden items-center gap-1 text-[10px] uppercase tracking-[.14em] text-[#D9B65D]/80 sm:inline-flex">
                Six connected capabilities <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {DIVISIONS.map((division, index) => (
                <button
                  key={division.slug}
                  type="button"
                  onClick={() => handleDivisionClick(division.slug)}
                  className="group flex min-h-12 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[.035] px-3 py-2 text-left text-[11px] font-medium leading-4 text-white/70 transition hover:border-[#C49A36]/50 hover:bg-[#C49A36]/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C77B]"
                >
                  <span><span className="mr-1.5 font-mono text-[9px] text-[#D9B65D]/70">0{index + 1}</span>{division.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#D9B65D]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {useScrollFilm && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[.24em] text-white/50">
            Scroll to move through the film
          </div>
        )}
      </div>
    </section>
  );
};
