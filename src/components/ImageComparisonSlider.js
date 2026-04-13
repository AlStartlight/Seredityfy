'use client';
import { useState, useRef } from 'react';
import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';

export default function ImageComparisonSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen overflow-x-hidden">
      <Sidebar active="Gallery" />
      <TopBar searchPlaceholder="Search gallery or models..." />
      <main className="ml-64 p-10 min-h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low aspect-[4/5] lg:aspect-auto lg:h-[750px] select-none"
              onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
              onTouchMove={handleMove}
            >
              <img
                alt="Version 2.3"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://placehold.co/1000x1250/1f0438/d5baff"
              />
              <img
                alt="Version 2.2"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                src="https://placehold.co/1000x1250/280e40/ffabf3"
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20 shadow-[0_0_20px_rgba(213,186,255,0.8)]"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => {
                  const handler = (ev) => handleMove(ev);
                  const cleanup = () => {
                    window.removeEventListener('mousemove', handler);
                    window.removeEventListener('mouseup', cleanup);
                  };
                  window.addEventListener('mousemove', handler);
                  window.addEventListener('mouseup', cleanup);
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-[0_0_30px_rgba(213,186,255,0.6)] border-2 border-white/30">
                  <span className="material-symbols-outlined" style={{ transform: 'rotate(90deg)' }}>unfold_more</span>
                </div>
              </div>
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 z-30">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-xs font-label font-bold text-white uppercase tracking-wider">Version 2.3 (Current)</span>
              </div>
              <div className="absolute top-6 right-6 px-4 py-2 bg-surface-container-low/80 backdrop-blur-md rounded-full border border-primary/30 flex items-center gap-2 z-30">
                <span className="text-xs font-label font-bold text-primary uppercase tracking-wider">Version 2.2</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 sticky top-28 h-fit">
            <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                  <img alt="Creator" className="w-full h-full object-cover" src="https://placehold.co/112x112/1f0438/d5baff" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Astra Vance</h3>
                  <p className="font-label text-xs text-primary/60">Elite Alchemist</p>
                </div>
              </div>
              <button className="px-5 py-2 rounded-full border border-primary/30 text-primary text-sm font-bold font-label hover:bg-primary/10 transition-colors">Follow</button>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl border border-white/5 overflow-hidden">
              <div className="flex border-b border-white/5 bg-white/5">
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40">Details</button>
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary border-b-2 border-primary">History</button>
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40">Settings</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 border border-primary/20 backdrop-blur-xl shadow-lg shadow-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">difference</span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Compare Mode</p>
                      <p className="text-[10px] text-primary/40 font-label">Slider visualization active</p>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-primary rounded-full relative shadow-[0_0_10px_rgba(213,186,255,0.3)]">
                    <div className="absolute top-[2px] right-[2px] bg-white rounded-full h-5 w-5"></div>
                  </div>
                </div>
                <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mt-6 mb-4">Iteration History</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 border border-primary/30">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high">
                      <img alt="v2.3" className="w-full h-full object-cover" src="https://placehold.co/128x128/1f0438/d5baff" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">Version 2.3</p>
                      <p className="text-[10px] text-primary/40 font-label">3h 15m ago</p>
                    </div>
                    <div className="px-3 py-1 bg-primary text-on-primary text-[8px] font-bold rounded-full font-label uppercase">Base</div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/20 border border-primary/40">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high ring-2 ring-primary/40">
                      <img alt="v2.2" className="w-full h-full object-cover" src="https://placehold.co/128x128/280e40/ffabf3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">Version 2.2</p>
                      <p className="text-[10px] text-primary font-label">Comparing...</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">swipe_vertical</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
