'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CompareSliderPage() {
  const [pos, setPos] = useState(50);
  return (
    <main className="p-10 min-h-[calc(100vh-5rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low h-[750px] select-none">
            <img className="absolute inset-0 w-full h-full object-cover" alt="Current" src="/assets/card1.png" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
              <img className="absolute inset-0 w-full h-full object-cover" alt="Version 2.3" src="/assets/card2.png" style={{ width: `${100 / (pos / 100)}%`, maxWidth: 'none' }} />
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_20px_rgba(213,186,255,0.8)] cursor-ew-resize z-20" style={{ left: `${pos}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined">compare_arrows</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary/20 backdrop-blur rounded-lg text-[10px] font-label text-primary border border-primary/30 uppercase tracking-widest z-10">Version 2.3</div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-label text-white border border-white/10 uppercase tracking-widest z-10">Current</div>
          </div>
          <div className="flex justify-center">
            <Link href="/admin/compare" className="px-6 py-3 rounded-full border border-primary/30 text-primary text-sm font-bold font-label hover:bg-primary/10 transition-colors inline-flex items-center gap-2">
              <span className="material-symbols-outlined">grid_view</span>
              Side-by-side View
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
            <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Slider Position</h2>
            <p className="text-3xl font-headline font-black text-on-surface">{pos}%</p>
            <p className="text-sm text-on-surface-variant font-body">Drag the slider across the image to compare the current rendition with Version 2.3.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
