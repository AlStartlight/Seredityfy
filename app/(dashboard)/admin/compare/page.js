import Link from 'next/link';

export default function CompareViewPage() {
  return (
    <main className="p-10 min-h-[calc(100vh-5rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low lg:h-[750px] grid grid-cols-2">
            <div className="relative">
              <img className="w-full h-full object-cover" alt="Current" src="/assets/card1.png" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-label text-white border border-white/10 uppercase tracking-widest">Current</div>
            </div>
            <div className="relative">
              <img className="w-full h-full object-cover" alt="History" src="/assets/card2.png" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 backdrop-blur rounded-lg text-[10px] font-label text-primary border border-primary/30 uppercase tracking-widest">Version 2.3</div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link href="/admin/compare/slider" className="px-6 py-3 rounded-full border border-primary/30 text-primary text-sm font-bold font-label hover:bg-primary/10 transition-colors inline-flex items-center gap-2">
              <span className="material-symbols-outlined">compare</span>
              Slider Compare Mode
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-white/5 overflow-hidden">
            <div className="flex border-b border-white/5 bg-white/5">
              <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">Details</button>
              <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary border-b-2 border-primary">History</button>
              <button className="flex-1 py-4 text-xs font-bold font-label uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">Settings</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 border border-primary/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">difference</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Compare Mode</p>
                    <p className="text-[10px] text-primary/40 font-label">Side-by-side analysis</p>
                  </div>
                </div>
              </div>
              <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mt-6 mb-4">Iteration History</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 border border-primary/30">
                  <div className="w-16 h-16 rounded-xl overflow-hidden"><img className="w-full h-full object-cover" alt="v2.3" src="/assets/card2.png" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">Version 2.3</p>
                    <p className="text-[10px] text-primary/40 font-label">3h 15m ago</p>
                  </div>
                  <div className="px-3 py-1 bg-primary text-on-primary text-[8px] font-bold rounded-full font-label uppercase">Selected</div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden"><img className="w-full h-full object-cover opacity-70" alt="v2.2" src="/assets/card3.png" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">Version 2.2</p>
                    <p className="text-[10px] text-primary/40 font-label">5h ago</p>
                  </div>
                  <span className="material-symbols-outlined text-primary/40">compare_arrows</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden"><img className="w-full h-full object-cover opacity-70" alt="v2.1" src="/assets/image_12.png" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">Version 2.1</p>
                    <p className="text-[10px] text-primary/40 font-label">Yesterday</p>
                  </div>
                  <span className="material-symbols-outlined text-primary/40">compare_arrows</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
