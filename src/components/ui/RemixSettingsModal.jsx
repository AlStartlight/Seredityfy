'use client';

import { useState } from 'react';

const STYLE_PRESETS = [
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'synthwave', label: 'Synthwave' },
  { id: 'ethereal', label: 'Ethereal' },
  { id: 'gothic', label: 'Gothic' },
  { id: 'oil-painting', label: 'Oil Painting' },
  { id: '3d-render', label: '3D Render' },
  { id: 'watercolor', label: 'Watercolor' },
];

function ModalToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors ${
        enabled ? 'bg-primary/20' : 'bg-surface-container-highest'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full transition-all ${
          enabled ? 'bg-primary translate-x-4' : 'bg-outline-variant'
        }`}
      />
    </button>
  );
}

function StylePresetTile({ preset, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(preset.id)}
      className={`flex-none w-28 group snap-start ${isSelected ? 'scale-105' : ''}`}
    >
      <div
        className={`aspect-square rounded-xl overflow-hidden mb-2 border-2 transition-all ${
          isSelected
            ? 'border-secondary shadow-[0_0_20px_rgba(255,171,243,0.5)]'
            : 'border-transparent hover:border-primary/50'
        }`}
      >
        <div
          className={`w-full h-full bg-surface-container-high rounded-xl ${
            isSelected ? '' : 'brightness-75 group-hover:brightness-100 transition-all'
          }`}
        />
      </div>
      <span
        className={`text-[10px] font-label uppercase tracking-wider text-center block ${
          isSelected
            ? 'text-secondary font-extrabold'
            : 'text-on-surface-variant group-hover:text-primary transition-colors'
        }`}
      >
        {preset.label}
      </span>
    </button>
  );
}

function PromptSection({ prompt, onPromptChange }) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="font-label text-xs uppercase tracking-widest text-primary/80">Prompt Refinement</label>
        <span className="text-[10px] font-label text-on-surface-variant">{prompt.length} / 500</span>
      </div>
      <div className="relative group">
        <textarea
          className="w-full bg-surface-container-high/50 border-none rounded-xl p-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 min-h-[100px] font-body text-sm leading-relaxed"
          placeholder="Describe the changes you want to see..."
          maxLength={500}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
        <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
        </div>
      </div>
    </section>
  );
}

function SlidersSection({ imageInfluence, variationScale, onImageInfluenceChange, onVariationScaleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-label text-xs uppercase tracking-widest text-primary/80">Image Influence</label>
          <span className="font-label text-sm text-secondary font-bold">{imageInfluence}%</span>
        </div>
        <input
          className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer neon-slider"
          type="range"
          min={0}
          max={100}
          value={imageInfluence}
          onChange={(e) => onImageInfluenceChange(Number(e.target.value))}
        />
        <p className="text-[10px] text-on-surface-variant font-body">Higher values keep more of the original composition and colors.</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-label text-xs uppercase tracking-widest text-primary/80">Variation Scale</label>
          <span className="font-label text-sm text-secondary font-bold">{variationScale}</span>
        </div>
        <input
          className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer neon-slider"
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={variationScale}
          onChange={(e) => onVariationScaleChange(Number(e.target.value))}
        />
        <p className="text-[10px] text-on-surface-variant font-body">Controls how much creative freedom the AI has during generation.</p>
      </div>
    </div>
  );
}

function TechnicalParameters({ keepSeed, enhanceDetails, onKeepSeedToggle, onEnhanceDetailsToggle }) {
  return (
    <section className="space-y-6 bg-surface-container-low/40 p-6 rounded-xl border border-outline-variant/10">
      <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Technical Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-label text-outline uppercase tracking-wider">Model Version</label>
          <div className="relative">
            <select className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 pl-4 pr-10 text-sm font-body text-on-surface appearance-none focus:ring-1 focus:ring-primary">
              <option>seredityfy-XL v2.4 (Latest)</option>
              <option>Neon-Diffusion 1.5</option>
              <option>Synth-Flow Turbo</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-on-surface/90">Keep Original Seed</span>
            <ModalToggle enabled={keepSeed} onToggle={onKeepSeedToggle} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-on-surface/90">Enhance Details</span>
            <ModalToggle enabled={enhanceDetails} onToggle={onEnhanceDetailsToggle} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RemixSettingsModal({ isOpen, onClose, onGenerate }) {
  const [prompt, setPrompt] = useState(
    'A cybernetic goddess with glowing violet circuit patterns, cinematic lighting, ultra-detailed synthwave aesthetic, intricate biological mechanical fusion, deep obsidian background with floating stardust.'
  );
  const [selectedPreset, setSelectedPreset] = useState('cyberpunk');
  const [imageInfluence, setImageInfluence] = useState(75);
  const [variationScale, setVariationScale] = useState(4.2);
  const [keepSeed, setKeepSeed] = useState(true);
  const [enhanceDetails, setEnhanceDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .neon-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #ffabf3;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 15px #ffabf3, 0 0 5px #fff;
          border: 2px solid white;
        }
        .neon-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #ffabf3;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 15px #ffabf3, 0 0 5px #fff;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(43, 18, 69, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b4356;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #978da3;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm">
        <div className="bg-[#1f0438]/70 backdrop-blur-[32px] w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(31,4,56,0.8)] border border-outline-variant/20 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              <h2 className="text-2xl font-headline font-extrabold tracking-tight text-on-surface">Remix Settings</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
            <PromptSection prompt={prompt} onPromptChange={setPrompt} />

            {/* Style Presets */}
            <section className="space-y-4">
              <label className="font-label text-xs uppercase tracking-widest text-primary/80 block">Style Presets</label>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {STYLE_PRESETS.map((preset) => (
                  <StylePresetTile
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset === preset.id}
                    onSelect={setSelectedPreset}
                  />
                ))}
              </div>
            </section>

            <SlidersSection
              imageInfluence={imageInfluence}
              variationScale={variationScale}
              onImageInfluenceChange={setImageInfluence}
              onVariationScaleChange={setVariationScale}
            />

            <TechnicalParameters
              keepSeed={keepSeed}
              enhanceDetails={enhanceDetails}
              onKeepSeedToggle={() => setKeepSeed(!keepSeed)}
              onEnhanceDetailsToggle={() => setEnhanceDetails(!enhanceDetails)}
            />
          </div>

          {/* Footer */}
          <div className="px-8 py-8 flex flex-col md:flex-row items-center gap-4 bg-surface-container-low/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:flex-1 py-4 rounded-xl bg-surface-container-highest hover:bg-surface-bright transition-all text-on-surface font-label text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onGenerate({ prompt, selectedPreset, imageInfluence, variationScale, keepSeed, enhanceDetails })}
              className="w-full md:flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary-container via-primary to-secondary text-on-primary font-label text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(128,0,255,0.4)] hover:shadow-[0_0_40px_rgba(128,0,255,0.6)] transition-all transform active:scale-[0.98]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Generate Remix
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
