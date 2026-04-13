import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';

export default function ImageDetailWithHistory() {
  return (
    <div className="bg-background text-on-surface font-body min-h-screen overflow-x-hidden">
      <Sidebar active="Gallery" />
      <TopBar searchPlaceholder="Search gallery or models..." />
      <main className="ml-64 p-10 min-h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low aspect-[4/5] lg:aspect-auto lg:h-[750px]">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Bioluminescent forest"
                src="https://placehold.co/1000x1250/1f0438/d5baff"
              />
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
                <span className="text-xs font-label font-bold text-white uppercase tracking-wider">Featured Masterpiece</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 sticky top-28 h-fit">
            <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                  <img alt="Creator Avatar" className="w-full h-full object-cover" src="https://placehold.co/112x112/1f0438/d5baff" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Astra Vance</h3>
                  <p className="font-label text-xs text-primary/60">Elite Alchemist</p>
                </div>
              </div>
              <button className="px-5 py-2 rounded-full border border-primary/30 text-primary text-sm font-bold font-label hover:bg-primary/10 transition-colors">
                Follow
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold font-headline text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-secondary/20 transition-all active:scale-95">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Remix This Art
              </button>
              <button className="py-4 rounded-2xl bg-surface-container-high text-on-surface font-bold font-label flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined">download</span>
                Download
              </button>
              <button className="py-4 rounded-2xl bg-surface-container-high text-on-surface font-bold font-label flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors group">
                <span className="material-symbols-outlined group-hover:text-secondary transition-colors">favorite</span>
                Like
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl border border-white/5 overflow-hidden">
              <div className="flex border-b border-white/5 bg-white/5">
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary border-b-2 border-primary">Details</button>
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">History</button>
                <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">Settings</button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-3">Master Prompt</h2>
                  <p className="font-body text-base leading-relaxed text-on-surface-variant italic">
                    &ldquo;An ethereal bioluminescent forest in the deep of seredityfy Prime, vibrant neon flora pulsing in rhythmic harmony, misty atmosphere with floating crystalline dust...&rdquo;
                  </p>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="font-label text-xs text-primary/40 uppercase tracking-widest mb-1">Model Engine</p>
                    <p className="font-headline font-bold text-on-surface">seredityfy v2.4</p>
                  </div>
                  <div>
                    <p className="font-label text-xs text-primary/40 uppercase tracking-widest mb-1">Aspect Ratio</p>
                    <p className="font-headline font-bold text-on-surface">4:5 Portrait</p>
                  </div>
                  <div>
                    <p className="font-label text-xs text-primary/40 uppercase tracking-widest mb-1">Seed Value</p>
                    <p className="font-headline font-bold text-on-surface tracking-tighter">849201135</p>
                  </div>
                  <div>
                    <p className="font-label text-xs text-primary/40 uppercase tracking-widest mb-1">Generated</p>
                    <p className="font-headline font-bold text-on-surface">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4 border-t border-white/5">
                <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Iteration History</h2>
                <div className="space-y-3">
                  {[
                    { v: 'Version 2.3', time: '3h 15m ago' },
                    { v: 'Version 2.2', time: '5h ago' },
                    { v: 'Version 2.1', time: 'Yesterday' },
                  ].map((it) => (
                    <div key={it.v} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high">
                        <img alt={it.v} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://placehold.co/128x128/280e40/d5baff" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface">{it.v}</p>
                        <p className="text-[10px] text-primary/40 font-label">{it.time}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
