'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const FILL = { fontVariationSettings: "'FILL' 1" };

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-container-low rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
    </div>
  ),
});

const PIPELINE_STEPS = [
  { id: 0, label: 'Analyze Image',     desc: 'Gemini vision — scene understanding',            ms: 400 },
  { id: 1, label: 'Enhance Prompt',    desc: 'Cinematic prompt enrichment',                    ms: 300 },
  { id: 2, label: 'Send to Veo AI',    desc: 'Veo 3.1 — image-to-video generation',            ms: 1000 },
  { id: 3, label: 'Motion Rendering',  desc: 'Camera + subject animation pipeline',             ms: 1500 },
  { id: 4, label: 'Encode & Deliver',  desc: 'Compress H.264, attach metadata',                ms: 500 },
];

const ENGINES = [
  { id: 'VEO',     name: 'Veo 3.1',     desc: 'Google DeepMind — most natural',  badge: '🔥 Best' },
  { id: 'LUMA',    name: 'Luma AI',      desc: 'Dream Machine — Ray-2',          badge: null },
  { id: 'RUNWAY',  name: 'Runway ML',    desc: 'Gen-3 — cinematic',              badge: null },
];

const CAMERA_OPTS = ['Slow push in', 'Orbit around', 'Pan left/right', 'Tracking shot', 'Drone flyover', 'Static subtle'];
const MOTION_OPTS  = ['Cinematic', 'Slow motion', 'Hyper real', 'Dreamlike', 'Action', 'Flowing'];
const STYLE_OPTS   = ['Ultra Realistic', 'Unreal Engine 5', 'Cinematic', 'Anime', '3D Render', 'Pixel Art'];

const CREDIT_PER_SECOND = 24;
const DURATION_SECONDS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DURATION_PRESETS  = [10, 20, 30, 60];

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',  icon: 'smart_display',          aspectRatio: '16:9', resolution: '1080p', tag: '16:9 · 1080p' },
  { id: 'ig_story',  label: 'IG Story', icon: 'photo_camera',           aspectRatio: '9:16', resolution: '1080p', tag: '9:16 · 1080p' },
  { id: 'tiktok',    label: 'TikTok',   icon: 'music_note',             aspectRatio: '9:16', resolution: '1080p', tag: '9:16 · 1080p' },
  { id: 'facebook',  label: 'Facebook', icon: 'groups',                 aspectRatio: '16:9', resolution: '720p',  tag: '16:9 · 720p' },
  { id: 'portrait',  label: 'Portrait', icon: 'stay_current_portrait',  aspectRatio: '9:16', resolution: '720p',  tag: '9:16 · 720p' },
  { id: 'landscape', label: 'Landscape',icon: 'stay_current_landscape', aspectRatio: '16:9', resolution: '720p',  tag: '16:9 · 720p' },
];

const TAG_COLOR = {
  Cyberpunk: 'text-primary bg-primary/10',
  Fantasy:   'text-emerald-400 bg-emerald-400/10',
  Mystic:    'text-secondary bg-secondary/10',
  'Sci-Fi':  'text-yellow-400 bg-yellow-400/10',
  History:   'text-tertiary bg-tertiary/10',
  Upload:    'text-on-surface-variant/40 bg-white/5',
};

function StepPills({ steps = PIPELINE_STEPS, activeStep, generating }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const done    = activeStep > s.id;
        const current = activeStep === s.id && generating;
        return (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-label font-bold uppercase tracking-widest transition-all ${done ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : current ? 'bg-secondary/15 text-secondary border border-secondary/30 animate-pulse' : 'bg-white/5 text-on-surface-variant/30 border border-white/5'}`}>
              {done
                ? <span className="material-symbols-outlined text-[10px]" style={FILL}>check</span>
                : current
                ? <span className="material-symbols-outlined text-[10px] animate-spin">progress_activity</span>
                : <span className="text-[8px]">{s.id + 1}</span>
              }
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-3 h-px bg-white/8 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SourcePanel({ src, historyImages, onSelect, onFile }) {
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  const handleDrop = (e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); };

  const allSources = [
    ...(historyImages || [])
      .filter(h => h.status === 'COMPLETED' && (h.thumbnailUrl || h.imageUrl))
      .map(h => ({
        id: `hist_${h.id}`,
        name: h.prompt?.slice(0, 28) || 'History',
        img: h.thumbnailUrl || h.imageUrl,
        tag: 'History',
      })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">
          Source Image
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-label font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-[11px]" style={FILL}>upload</span>
          Upload
        </button>
      </div>

      <div
        className={`relative w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${src ? 'border-secondary/40' : 'border-dashed border-white/10 hover:border-white/25'}`}
        style={{ aspectRatio: '16/9' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !src && fileRef.current?.click()}
      >
        {src ? (
          <>
            <img src={src.img} alt={src.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438]/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-[10px] font-label font-bold text-white/90 truncate">{src.name}</span>
              <span className={`text-[8px] font-label font-bold px-1.5 py-0.5 rounded-full ${TAG_COLOR[src.tag] || 'text-primary bg-primary/10'}`}>{src.tag}</span>
            </div>
            <button
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              onClick={e => { e.stopPropagation(); onSelect(null); }}
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-[8px] font-label font-bold text-white/80 backdrop-blur-sm uppercase tracking-widest">
              Selected
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/20" style={FILL}>add_photo_alternate</span>
            <span className="text-[10px] font-label text-on-surface-variant/35 text-center">
              Drop an image here or click to browse
            </span>
            <span className="text-[8px] font-label text-on-surface-variant/20">PNG, JPG, WEBP supported</span>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={e => onFile(e.target.files[0])} />

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {allSources.map(g => (
          <button key={g.id} onClick={() => onSelect(g)}
            className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${src?.id === g.id ? 'border-secondary ring-2 ring-secondary/20 scale-95' : 'border-transparent hover:border-white/15'}`}>
            <img src={g.img} alt={g.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-0.5 left-1 right-1 text-[6px] font-label text-white/70 truncate text-center">{g.name}</p>
            {src?.id === g.id && (
              <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[14px]" style={FILL}>check_circle</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ sourceImage, videoData, generating, generationStep }) {
  const hasVideo = videoData?.videoUrl;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 rounded-xl overflow-hidden border border-white/5 bg-surface-container-low">
        {hasVideo ? (
          <VideoPlayer
            src={videoData.videoUrl}
            poster={videoData.thumbnailUrl || sourceImage?.img}
          />
        ) : sourceImage ? (
          <img src={sourceImage.img} alt={sourceImage.name}
            className="w-full h-full object-contain" />
        ) : null}

        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0a14]/75 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-secondary/40 border-t-secondary animate-spin" />
              <div>
                <p className="text-sm font-label font-bold text-secondary">Generating Video</p>
                <p className="text-[10px] text-on-surface-variant/50 font-label">
                  {PIPELINE_STEPS[generationStep]?.label || 'Processing'}
                </p>
              </div>
            </div>
            <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${((generationStep + 1) / PIPELINE_STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}

        {!sourceImage && !generating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-on-surface-variant/20">
              <span className="material-symbols-outlined text-5xl" style={FILL}>movie</span>
              <span className="text-[10px] font-label uppercase tracking-widest">Select an image to start</span>
            </div>
          </div>
        )}

        {hasVideo && (
          <>
            {/* Top-left: Video Ready + platform */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 backdrop-blur-sm border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[8px] font-label text-emerald-400 uppercase tracking-widest font-bold">Video Ready</span>
              </div>
              {videoData?.platform && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="text-[8px] font-label text-white/70 uppercase tracking-widest">
                    {videoData.platform.replace('ig_story', 'IG Story').replace('tiktok', 'TikTok').replace('youtube', 'YouTube').replace('facebook', 'Facebook').replace('portrait', 'Portrait').replace('landscape', 'Landscape')}
                  </span>
                </div>
              )}
              {videoData?.watermarked && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-900/60 backdrop-blur-sm border border-amber-500/25">
                  <span className="material-symbols-outlined text-[9px] text-amber-400" style={FILL}>verified</span>
                  <span className="text-[8px] font-label text-amber-400 font-bold">Watermarked</span>
                </div>
              )}
            </div>
            {/* Top-right: duration + resolution */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {videoData?.resolution && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="text-[8px] font-label text-white/70 uppercase tracking-widest">{videoData.resolution}</span>
                </div>
              )}
              {videoData?.duration && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="material-symbols-outlined text-emerald-400 text-[10px]" style={FILL}>schedule</span>
                  <span className="text-[8px] font-label text-white/80 uppercase tracking-widest">{videoData.duration}s</span>
                </div>
              )}
            </div>
            {/* Bottom watermark notice for FREE users */}
            {videoData?.watermarked && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-900/50 backdrop-blur-sm border border-amber-500/20">
                <span className="material-symbols-outlined text-[12px] text-amber-400 shrink-0">workspace_premium</span>
                <span className="text-[9px] font-label text-amber-300/80">
                  Watermark aktif untuk akun Free. Upgrade untuk video tanpa watermark.
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {(generating || hasVideo) && (
        <div className="mt-3">
          <StepPills steps={PIPELINE_STEPS} activeStep={generationStep} generating={generating} />
        </div>
      )}
    </div>
  );
}

function ConfigPanel({
  prompt, setPrompt, engine, setEngine, camera, setCamera,
  motion, setMotion, style, setStyle, duration, setDuration,
  platform, setPlatform,
  src, generating, onGenerate, onEnhance, enhancing,
  videoData, credits, genError,
}) {
  const ready = !!src && prompt.trim().length > 0 && !generating;
  const hasVideo = videoData?.videoUrl;
  const activePlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto no-scrollbar pr-1">
      <div>
        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
          Video Prompt
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="A fantasy knight standing on a cliff, camera slowly orbiting..."
          className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/20 font-body resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed"
        />
        <button
          onClick={onEnhance}
          disabled={!src || enhancing}
          className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/25 to-secondary/15 border border-secondary/25 text-secondary text-[9px] font-label font-bold uppercase tracking-widest hover:from-purple-600/35 hover:to-secondary/25 transition-all disabled:opacity-40"
        >
          {enhancing ? (
            <><span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>Analyzing with Gemini…</>
          ) : (
            <><span className="material-symbols-outlined text-[12px]" style={FILL}>auto_awesome</span>Enhance with Gemini</>
          )}
        </button>
      </div>

      <div>
        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
          Video Engine
        </label>
        <div className="flex gap-1.5">
          {ENGINES.map(e => (
            <button key={e.id} onClick={() => setEngine(e.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[9px] font-label transition-all ${engine === e.id ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-white/5 border border-transparent hover:border-white/10 text-on-surface-variant/50'}`}>
              <span className="font-bold">{e.name}</span>
              {e.badge && <span className="text-[7px] px-1 py-0.5 rounded-full bg-secondary/20 text-secondary font-bold mt-0.5">{e.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Platform / Format */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">
            Platform & Format
          </label>
          <span className="text-[8px] font-label text-on-surface-variant/30 px-1.5 py-0.5 rounded-full bg-white/5">
            {activePlatform.tag}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[8px] font-label font-bold transition-all ${
                platform === p.id
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : 'bg-white/5 border border-transparent hover:border-white/15 text-on-surface-variant/45 hover:text-on-surface/70'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${platform === p.id ? 'text-primary' : 'text-on-surface-variant/40'}`} style={FILL}>
                {p.icon}
              </span>
              <span>{p.label}</span>
              <span className={`text-[6px] font-mono ${platform === p.id ? 'text-primary/60' : 'text-on-surface-variant/20'}`}>
                {p.aspectRatio}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
            Camera
          </label>
          <select value={camera} onChange={e => setCamera(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2 text-[11px] text-on-surface font-body focus:outline-none focus:border-primary/50">
            {CAMERA_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
            Motion
          </label>
          <select value={motion} onChange={e => setMotion(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2 text-[11px] text-on-surface font-body focus:outline-none focus:border-primary/50">
            {MOTION_OPTS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
          Style
        </label>
        <select value={style} onChange={e => setStyle(e.target.value)}
          className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2 text-[11px] text-on-surface font-body focus:outline-none focus:border-primary/50">
          {STYLE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Duration Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">
            Duration
          </label>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="material-symbols-outlined text-[10px] text-secondary">bolt</span>
            <span className="text-[9px] font-label font-bold text-secondary">{CREDIT_PER_SECOND} CR/s</span>
          </div>
        </div>

        {/* Per-second: 1–10 */}
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {DURATION_SECONDS.map(d => {
            const cost = d * CREDIT_PER_SECOND;
            const canAfford = !credits || (credits.remaining ?? 0) >= cost;
            return (
              <button
                key={d}
                disabled={!canAfford}
                onClick={() => setDuration(d)}
                title={`${cost} credits`}
                className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-label font-bold transition-all ${
                  duration === d
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : canAfford
                    ? 'bg-white/5 text-on-surface-variant/50 hover:text-secondary border border-transparent hover:border-secondary/20'
                    : 'bg-white/[0.02] text-on-surface-variant/20 border border-transparent cursor-not-allowed opacity-40'
                }`}
              >
                <span className="font-bold">{d}s</span>
                <span className={`text-[7px] font-mono mt-0.5 ${duration === d ? 'text-secondary/70' : 'text-on-surface-variant/30'}`}>
                  {cost}
                </span>
              </button>
            );
          })}
        </div>

        {/* Preset clips: 10/20/30/60 */}
        <div className="pt-2 border-t border-white/5">
          <span className="text-[8px] font-label text-on-surface-variant/30 uppercase tracking-widest mb-1.5 block">Preset Clips</span>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATION_PRESETS.map(d => {
              const cost = d * CREDIT_PER_SECOND;
              const canAfford = !credits || (credits.remaining ?? 0) >= cost;
              return (
                <button
                  key={d}
                  disabled={!canAfford}
                  onClick={() => setDuration(d)}
                  title={`${cost} credits`}
                  className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-label font-bold transition-all ${
                    duration === d
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : canAfford
                      ? 'bg-white/5 text-on-surface-variant/50 hover:text-primary border border-transparent hover:border-primary/20'
                      : 'bg-white/[0.02] text-on-surface-variant/20 border border-transparent cursor-not-allowed opacity-40'
                  }`}
                >
                  <span className="font-bold">{d}s</span>
                  <span className={`text-[7px] font-mono mt-0.5 ${duration === d ? 'text-primary/70' : 'text-on-surface-variant/30'}`}>
                    {cost} CR
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cost summary */}
        <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low border border-white/5">
          <span className="text-[9px] font-label text-on-surface-variant/40">
            Selected: <span className="text-on-surface/70 font-bold">{duration}s</span>
          </span>
          <span className="text-[9px] font-label">
            Cost: <span className="text-secondary font-bold">{duration * CREDIT_PER_SECOND} credits</span>
          </span>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {genError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[11px] font-body">
          <span className="material-symbols-outlined text-[14px] shrink-0">error</span>
          <span className="flex-1">{genError}</span>
        </div>
      )}

      <button
        disabled={!ready}
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary via-primary to-secondary bg-[length:200%] bg-left hover:bg-right transition-[background-position] duration-500 text-on-primary font-label font-bold py-3.5 rounded-xl shadow-xl shadow-secondary/20 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {generating ? (
          <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Generating Video…</>
        ) : (
          <><span className="material-symbols-outlined text-[18px]" style={FILL}>movie</span>Generate Video</>
        )}
      </button>

      <div className="flex items-center justify-between">
        {!src && (
          <span className="text-[9px] text-on-surface-variant/30 font-label">Select a source image to continue</span>
        )}
        {src && !generating && !hasVideo && (
          <span className="text-[9px] text-on-surface-variant/30 font-label">
            Cost: <span className="text-secondary font-bold">{duration * CREDIT_PER_SECOND} credits</span>
            <span className="ml-1 text-on-surface-variant/20">({duration}s × {CREDIT_PER_SECOND}/s)</span>
          </span>
        )}
        {credits !== null && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-white/5">
            <span className="material-symbols-outlined text-[10px] text-on-surface-variant/40" style={FILL}>credit_card</span>
            <span className="text-[8px] font-label font-bold text-on-surface/70">{credits.remaining ?? '—'} credits</span>
          </div>
        )}
      </div>
    </div>
  );
}

const KEYFRAMES = `
@keyframes fadeSlide { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
`;

export default function IntelligencePage() {
  const [src, setSrc]               = useState(null);
  const [prompt, setPrompt]         = useState('');
  const [engine, setEngine]         = useState('VEO');
  const [camera, setCamera]         = useState('Slow push in');
  const [motion, setMotion]         = useState('Cinematic');
  const [style, setStyle]           = useState('Ultra Realistic');
  const [duration, setDuration]     = useState(8);
  const [platform, setPlatform]     = useState('youtube');

  const [generating, setGenerating]   = useState(false);
  const [enhancing, setEnhancing]     = useState(false);
  const [genStep, setGenStep]         = useState(-1);
  const [genError, setGenError]       = useState(null);
  const [videoData, setVideoData]     = useState(null);
  const [historyImages, setHistoryImages] = useState([]);
  const [credits, setCredits]         = useState(null);

  useEffect(() => {
    fetch('/api/images?page=1&limit=20&type=user')
      .then(r => r.json())
      .then(d => { if (d.images) setHistoryImages(d.images); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/subscriptions?current=true')
      .then(r => r.json())
      .then(d => setCredits({ remaining: d.availableCredits ?? 40 }))
      .catch(() => {});
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setVideoData(null);
    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSrc({
        id: `upload_${Date.now()}`,
        img: url,
        base64: e.target.result,
        name: file.name.replace(/\.[^.]+$/, ''),
        tag: 'Upload',
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSelectImage = useCallback((img) => {
    setSrc(img);
    setVideoData(null);
  }, []);

  useEffect(() => {
    if (!src) return;
    setEnhancing(true);
    setGenError(null);

    const payload = src.base64 ? { imageUrl: src.base64 } : { imageUrl: src.img };

    fetch('/api/intelligence/gemini-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setPrompt(d.prompt); })
      .catch(() => {})
      .finally(() => setEnhancing(false));
  }, [src]);

  const handleEnhance = useCallback(async () => {
    if (!src) return;
    setEnhancing(true);
    try {
      const payload = src.base64 ? { imageUrl: src.base64 } : { imageUrl: src.img };
      const res = await fetch('/api/intelligence/gemini-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) setPrompt(d.prompt);
    } catch {}
    setEnhancing(false);
  }, [src]);

  const handleGenerate = useCallback(async () => {
    if (!src || !prompt.trim()) return;
    setGenerating(true);
    setVideoData(null);
    setGenError(null);
    setGenStep(0);

    try {
      const delays = PIPELINE_STEPS.map(s => s.ms);
      let elapsed = 0;
      for (let i = 0; i < delays.length - 1; i++) {
        await new Promise(r => setTimeout(r, delays[i]));
        elapsed += delays[i];
        setGenStep(i + 1);
      }

      const activePlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
      const res = await fetch('/api/intelligence/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sourceImageUrl: src.img,
          sourceImageName: src.name,
          engine,
          duration,
          motionStyle: motion,
          cameraStyle: camera,
          style,
          platform,
          aspectRatio: activePlatform.aspectRatio,
          resolution: activePlatform.resolution,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      let finalData = data;

      /* Veo returns 202 PROCESSING — poll until COMPLETED */
      if (res.status === 202 && data.status === 'PROCESSING') {
        const videoId = data.id;
        const POLL_DEADLINE = Date.now() + 5 * 60 * 1000; // 5 minutes
        let settled = false;

        while (Date.now() < POLL_DEADLINE) {
          await new Promise(r => setTimeout(r, 8_000));
          const pollRes = await fetch(`/api/intelligence/generate-video/status?id=${videoId}`);
          const pollData = await pollRes.json();

          if (pollData.status === 'COMPLETED') {
            finalData = pollData;
            settled = true;
            break;
          }
          if (pollData.status === 'FAILED') {
            throw new Error('Veo video generation failed');
          }
        }

        if (!settled) throw new Error('Video generation timed out after 5 minutes');
      }

      await new Promise(r => setTimeout(r, delays[delays.length - 1]));
      setGenStep(PIPELINE_STEPS.length);
      setVideoData(finalData);

      if (credits) {
        const cost = duration * CREDIT_PER_SECOND;
        setCredits(prev => ({ remaining: Math.max(0, (prev?.remaining ?? 0) - cost) }));
      }
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [src, prompt, engine, duration, motion, camera, style, platform, credits]);

  const handleDownload = useCallback(() => {
    if (!videoData?.videoUrl) return;
    const a = document.createElement('a');
    a.href = videoData.videoUrl;
    a.download = `${src?.name ?? 'video'}_seredityfy.mp4`;
    a.click();
  }, [videoData, src]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <main className="p-4 sm:p-6 lg:p-8">
        <header className="mb-7">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                Image-to-Video · Veo 3.1
              </span>
            </div>
            {videoData?.videoUrl && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30" style={{ animation: 'fadeSlide .4s ease' }}>
                <span className="material-symbols-outlined text-emerald-400 text-[14px]" style={FILL}>check_circle</span>
                <span className="text-[10px] font-label text-emerald-400 uppercase tracking-widest font-bold">
                  Generated · {videoData.duration}s · {videoData.aspectRatio || '16:9'} · {videoData.resolution || '720p'}
                </span>
              </div>
            )}
            {videoData?.watermarked && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/40 border border-amber-500/30" style={{ animation: 'fadeSlide .4s ease' }}>
                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={FILL}>workspace_premium</span>
                <span className="text-[10px] font-label text-amber-400 uppercase tracking-widest font-bold">Free · Watermarked</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Intelligence <span className="text-secondary italic font-light">&</span> Hub
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant/70 font-body max-w-2xl">
            Upload or select an image · Choose platform (YouTube, IG Story, TikTok, Facebook…) · Generate cinematic video with Veo 3.1 · 8 CR/s
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Left Column — Source + Preview */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <section className="bg-surface-container-low/60 backdrop-blur-[24px] border border-white/5 rounded-2xl p-5 lg:p-6">
              <SourcePanel src={src} historyImages={historyImages} onSelect={handleSelectImage} onFile={handleFile} />
            </section>
            <section className="flex-1 bg-surface-container-low/60 backdrop-blur-[24px] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col" style={{ minHeight: '360px' }}>
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40" style={FILL}>
                    {videoData?.videoUrl ? 'play_circle' : 'image'}
                  </span>
                  <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50 font-bold">
                    {videoData?.videoUrl ? 'Preview' : 'Canvas'}
                  </span>
                </div>
                {videoData?.videoUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-label font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-[11px]" style={FILL}>download</span>
                      Download
                    </button>
                  </div>
                )}
              </div>
              <PreviewPanel
                sourceImage={src}
                videoData={videoData}
                generating={generating}
                generationStep={genStep}
              />
            </section>
          </div>

          {/* Right Column — Config */}
          <section className="bg-surface-container-low/60 backdrop-blur-[24px] border border-white/5 rounded-2xl p-5 lg:p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[16px]" style={FILL}>tune</span>
              </div>
              <div>
                <h2 className="text-sm font-headline font-bold text-on-surface">Configuration</h2>
                <p className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40">
                  Engine · Prompt · Controls
                </p>
              </div>
            </div>
            <ConfigPanel
              prompt={prompt} setPrompt={setPrompt}
              engine={engine} setEngine={setEngine}
              camera={camera} setCamera={setCamera}
              motion={motion} setMotion={setMotion}
              style={style}   setStyle={setStyle}
              duration={duration} setDuration={setDuration}
              platform={platform} setPlatform={setPlatform}
              src={src}
              generating={generating}
              enhancing={enhancing}
              onGenerate={handleGenerate}
              onEnhance={handleEnhance}
              videoData={videoData}
              credits={credits}
              genError={genError}
            />
          </section>
        </div>
      </main>
    </>
  );
}
