'use client';

import Link from 'next/link';

const FILL_ICON = { fontVariationSettings: "'FILL' 1" };

function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`bg-[#2c1245]/40 backdrop-blur-[24px] border border-[#d5baff]/[0.05] rounded-3xl ${className}`}
    >
      {children}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative mb-16 py-12 lg:py-20 px-6 lg:px-12 overflow-hidden rounded-3xl border border-[#d5baff]/[0.05] bg-[#2c1245]/30 backdrop-blur-[24px]">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-0 right-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-tertiary/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1f0438]/70 border border-primary/20 text-[11px] uppercase tracking-[0.24em] font-label font-bold text-primary">
          <span className="material-symbols-outlined text-[16px]" style={FILL_ICON}>
            bolt
          </span>
          Version 4.0 &ldquo;Electric&rdquo;
        </span>

        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface font-headline tracking-tight leading-[1.05]">
          Empower Your{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
            Creative Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base lg:text-lg text-on-surface-variant/80 font-body max-w-2xl mx-auto leading-relaxed">
          A constellation of power tools tuned for studio-grade generative work. Explore, refine, and deploy
          — all from one electric nocturne.
        </p>
      </div>
    </section>
  );
}

function CreativeExplorerCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-8 overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — text */}
        <div className="p-8 lg:p-10 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/40 border border-primary/10 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-primary" style={FILL_ICON}>
              explore
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-on-surface font-headline leading-tight">
            Creative Explorer
          </h2>
          <p className="mt-3 text-on-surface-variant/80 font-body leading-relaxed">
            Drift through an infinite mood-space of styles, palettes, and references. Fork any ember into
            your next imagination.
          </p>
          <div className="mt-auto pt-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-label font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Launch Tool
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
        {/* Right — image */}
        <div className="relative min-h-[260px] lg:min-h-[320px]">
          <img src="/assets/card1.png" alt="Creative Explorer" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c1245] via-[#2c1245]/40 to-transparent lg:block" />
        </div>
      </div>
    </GlassCard>
  );
}

function HyperDriveCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-4 p-6 lg:p-7 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-secondary" style={FILL_ICON}>
          bolt
        </span>
      </div>
      <h2 className="relative text-xl font-bold text-on-surface font-headline">Hyper-Drive</h2>
      <p className="relative mt-2 text-sm text-on-surface-variant/80 font-body leading-relaxed">
        Burst-render up to 32 variants in parallel. Cold-start free, priority queues included.
      </p>

      <div className="relative h-40 mt-5 rounded-2xl overflow-hidden border border-[#d5baff]/10">
        <img src="/assets/card2.png" alt="Hyper-Drive" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <button
        type="button"
        className="relative mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#371e50]/70 border border-primary/30 text-primary font-label font-bold py-3 rounded-xl hover:bg-primary/10 transition-colors"
      >
        Learn More
        <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
      </button>
    </GlassCard>
  );
}

function NeuralForgeCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-6 overflow-hidden relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
        <div className="p-7 lg:p-8 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-tertiary" style={FILL_ICON}>
              psychology
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-on-surface font-headline">Neural Forge</h2>
          <p className="mt-2 text-sm text-on-surface-variant/80 font-body leading-relaxed">
            Train specialty LoRAs and style kits on your own imagery — safely isolated, yours forever.
          </p>
          <div className="mt-auto pt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-primary/40 text-primary font-label font-bold px-5 py-2.5 rounded-xl hover:bg-primary/10 transition-colors"
            >
              Open Kits
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="relative min-h-[220px]">
          <img src="/assets/card3.png" alt="Neural Forge" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c1245] via-transparent to-transparent sm:block" />
        </div>
      </div>
    </GlassCard>
  );
}

function AudienceResonanceCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-6 p-6 lg:p-8 relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-secondary" style={FILL_ICON}>
          insights
        </span>
      </div>
      <h2 className="relative text-xl lg:text-2xl font-bold text-on-surface font-headline">
        Audience Resonance
      </h2>
      <p className="relative mt-2 text-sm text-on-surface-variant/80 font-body leading-relaxed max-w-md">
        Feel where your work lands. Pulse metrics, sentiment heat, and re-share velocity visualized in
        real-time.
      </p>

      <div className="relative mt-6 rounded-2xl overflow-hidden border border-[#d5baff]/10 flex-1 min-h-[180px]">
        <img src="/assets/image6.png" alt="Audience Resonance" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <button
        type="button"
        className="relative mt-5 self-start inline-flex items-center gap-2 bg-secondary text-[#1f0438] font-label font-bold px-5 py-3 rounded-xl shadow-lg shadow-secondary/20 hover:brightness-110 transition-all"
      >
        Insights Lab
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </GlassCard>
  );
}

function CtaFooter() {
  return (
    <section className="relative mt-16 py-16 px-6 rounded-3xl overflow-hidden border border-[#d5baff]/[0.05] bg-[#2c1245]/30 backdrop-blur-[24px] text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[200%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface font-headline tracking-tight leading-[1.1]">
          Ready to enter the{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nocturne?
          </span>
        </h2>
        <p className="mt-5 text-base lg:text-lg text-on-surface-variant/80 font-body leading-relaxed">
          Join 10,000+ creators already shipping with Seredityfy&rsquo;s generative toolkit.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            Get Started Free
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#d5baff]/20 text-on-surface font-label font-bold px-7 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            View Documentation
            <span className="material-symbols-outlined text-[20px]">description</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <HeroSection />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        <CreativeExplorerCard />
        <HyperDriveCard />
        <NeuralForgeCard />
        <AudienceResonanceCard />
      </div>

      <CtaFooter />
    </main>
  );
}
