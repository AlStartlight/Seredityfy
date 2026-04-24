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

function DesignGenerativeCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-8 p-6 lg:p-8 relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-wrap items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/40 border border-[#d5baff]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={FILL_ICON}>
            architecture
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold text-on-surface font-headline truncate">
            Design Generative
          </h2>
          <p className="text-[11px] uppercase tracking-[0.18em] font-label text-on-surface-variant/70 mt-1">
            Powered by Gemini Flash 2.5
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] font-label text-secondary font-bold">
            Turbo Enabled
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: prompt */}
        <div className="flex flex-col">
          <label className="text-[11px] uppercase tracking-[0.18em] font-label text-on-surface-variant/70 mb-3">
            Blueprint Prompt
          </label>
          <textarea
            placeholder="Describe the architecture… e.g. 'A bioluminescent deep-sea city carved from obsidian spires, volumetric light, cinematic.'"
            className="w-full min-h-[160px] resize-none rounded-2xl bg-[#1f0438]/50 border border-[#d5baff]/10 px-5 py-4 text-on-surface placeholder:text-on-surface-variant/40 font-body focus:outline-none focus:border-primary/50 focus:bg-[#1f0438]/80 transition-colors"
          />
          <button
            type="button"
            className="mt-5 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]" style={FILL_ICON}>
              bolt
            </span>
            Generate Blueprint
          </button>
        </div>

        {/* Right: preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-label text-on-surface-variant/70">
              Live Preview
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] font-label text-primary/80 px-2 py-1 rounded-md bg-primary/10">
              v 1.4.2
            </span>
          </div>
          <div className="relative flex-1 rounded-2xl overflow-hidden border border-[#d5baff]/10 bg-[#1f0438]/40 min-h-[220px]">
            <img
              src="/assets/card1.png"
              alt="Generated blueprint preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438]/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#2c1245]/80 backdrop-blur-md border border-[#d5baff]/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                aria-label="Download"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#2c1245]/80 backdrop-blur-md border border-[#d5baff]/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                aria-label="Share"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ArtisanImageCard() {
  return (
    <GlassCard className="col-span-12 md:col-span-4 p-6 lg:p-7 relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-tertiary-container/40 border border-tertiary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary" style={FILL_ICON}>
            palette
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline leading-tight">Artisan Image</h2>
          <p className="text-[10px] uppercase tracking-[0.16em] font-label text-on-surface-variant/70 mt-0.5">
            GPT 4.1 Vision
          </p>
        </div>
      </div>

      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#d5baff]/10 mb-5">
        <img src="/assets/card2.png" alt="Artisan preview" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.16em] font-label text-on-surface-variant/70">
            Aesthetic Weight
          </span>
          <span className="text-xs font-bold text-secondary font-label">94%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1f0438]/70 overflow-hidden">
          <div className="h-full rounded-full bg-secondary shadow-[0_0_12px_rgba(255,171,243,0.6)]" style={{ width: '94%' }} />
        </div>
      </div>

      <div className="mb-5 p-3 rounded-xl bg-[#1f0438]/40 border border-[#d5baff]/5">
        <p className="text-[10px] uppercase tracking-[0.16em] font-label text-on-surface-variant/60 mb-1">
          Last prompt
        </p>
        <p className="text-sm text-on-surface font-body line-clamp-2">
          &ldquo;Velvet portrait of a luminous android dreaming in static.&rdquo;
        </p>
      </div>

      <Link
        href="/admin/gallery"
        className="w-full inline-flex items-center justify-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary font-label font-bold py-3 rounded-xl hover:bg-secondary/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">collections</span>
        Explore Gallery
      </Link>
    </GlassCard>
  );
}

function ComputeHubCard() {
  return (
    <GlassCard className="col-span-12 p-6 lg:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 left-1/3 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-on-surface font-headline">
            Compute & Workshop Hub
          </h2>
          <p className="text-on-surface-variant/80 font-body mt-2 max-w-xl">
            Book raw horsepower, mentorship, and curated upgrades — all in one orbit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#1f0438]/60 border border-[#d5baff]/10">
            <span className="material-symbols-outlined text-primary text-[18px]">database</span>
            <span className="text-xs font-label font-bold text-on-surface">1.2 TB Free</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#1f0438]/60 border border-[#d5baff]/10">
            <span className="material-symbols-outlined text-secondary text-[18px]">toll</span>
            <span className="text-xs font-label font-bold text-on-surface">450 Tokens</span>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
        <TicketCard
          kind="Workshop"
          title="Deep Learning Pro"
          price="$120"
          detail="Oct 12 · 4 Hours"
          icon="school"
          accent="primary"
          button={{ label: 'Buy Ticket', variant: 'primary-outline' }}
        />
        <TicketCard
          kind="Compute"
          title="5k Token Cluster"
          price="$45"
          detail="Instant Provisioning"
          icon="memory"
          accent="secondary"
          badge="Most Popular"
          button={{ label: 'Get Access', variant: 'secondary-solid' }}
        />
        <TicketCard
          kind="Session"
          title="AI Creative Audit"
          price="$250"
          detail="Limited · Remote"
          icon="insights"
          accent="tertiary"
          button={{ label: 'Book Now', variant: 'tertiary-outline' }}
        />
      </div>
    </GlassCard>
  );
}

function TicketCard({ kind, title, price, detail, icon, accent, badge, button }) {
  const accentText =
    accent === 'primary' ? 'text-primary' : accent === 'secondary' ? 'text-secondary' : 'text-tertiary';
  const accentBg =
    accent === 'primary'
      ? 'bg-primary/10 border-primary/20'
      : accent === 'secondary'
      ? 'bg-secondary/10 border-secondary/20'
      : 'bg-tertiary/10 border-tertiary/20';

  const btnClass =
    button.variant === 'primary-outline'
      ? 'border border-primary/40 text-primary hover:bg-primary/10'
      : button.variant === 'secondary-solid'
      ? 'bg-secondary text-[#1f0438] hover:brightness-110'
      : 'border border-tertiary/40 text-tertiary hover:bg-tertiary/10';

  return (
    <div className="relative rounded-2xl p-6 bg-[#371e50]/60 border border-[#d5baff]/5 flex flex-col">
      {badge && (
        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.14em] font-label font-bold px-2.5 py-1 rounded-full bg-secondary text-[#1f0438]">
          {badge}
        </span>
      )}

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${accentBg} mb-4`}>
        <span className={`material-symbols-outlined ${accentText}`} style={FILL_ICON}>
          {icon}
        </span>
      </div>

      <p className={`text-[10px] uppercase tracking-[0.18em] font-label font-bold ${accentText}`}>{kind}</p>
      <h3 className="text-lg font-bold text-on-surface font-headline mt-1">{title}</h3>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-on-surface font-headline">{price}</span>
      </div>
      <p className="text-sm text-on-surface-variant/80 font-body mt-1">{detail}</p>

      <button
        type="button"
        className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-label font-bold transition-colors ${btnClass}`}
      >
        {button.label}
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <header className="mb-10 max-w-5xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface font-headline tracking-tight leading-[1.05]">
          Intelligence <span className="text-secondary italic font-light">&</span> Hub
        </h1>
        <p className="mt-5 text-base lg:text-lg text-on-surface-variant/80 font-body max-w-2xl leading-relaxed">
          Harness the pulse of high-speed neural processing. Orchestrate generative design, artisan imagery,
          and on-demand compute from a single luminous console.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        <DesignGenerativeCard />
        <ArtisanImageCard />
        <ComputeHubCard />
      </div>
    </main>
  );
}
