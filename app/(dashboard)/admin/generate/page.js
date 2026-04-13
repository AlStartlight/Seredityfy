'use client';

export default function GeneratorPage() {
  return (
    <main className="p-8 flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex gap-8 h-full">
        {/* Generation Canvas */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Prompt Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative bg-surface-container-low rounded-2xl p-6 transition-all">
              <label className="block text-[10px] font-label uppercase tracking-widest text-purple-300/50 mb-3 ml-1">Describe your masterpiece</label>
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-headline font-medium placeholder:text-purple-300/20 text-on-surface leading-relaxed resize-none h-40 no-scrollbar"
                placeholder="An ethereal cityscape submerged in neon violet water, floating bioluminescent jellyfish, cinematic hyper-realistic photography, 8k..."
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-label text-purple-200/80 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    Surprise Me
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-label text-purple-200/80 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined text-sm">attach_file</span>
                    Init Image
                  </button>
                </div>
                <button className="bg-gradient-to-r from-primary to-[#ffabf3] text-on-primary font-headline font-extrabold px-10 py-3 rounded-xl shadow-[0_0_30px_rgba(213,186,255,0.3)] active:scale-95 transition-all duration-300 neon-glow">
                  GENERATE
                </button>
              </div>
            </div>
          </div>
          {/* Results Grid (Editorial Bento) */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            <div className="grid grid-cols-12 grid-rows-2 gap-6 h-full min-h-[400px]">
              {/* Main Preview (Waiting State) */}
              <div className="col-span-8 row-span-2 bg-surface-container-low rounded-[2rem] flex flex-col items-center justify-center text-center p-12 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 mb-6 mx-auto relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full"></div>
                    <span className="material-symbols-outlined text-6xl text-primary font-thin" style={{ fontVariationSettings: "'wght' 200" }}>electric_bolt</span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-on-surface mb-2 tracking-tight">Waiting for your electric imagination...</h3>
                  <p className="text-purple-300/40 font-body max-w-sm mx-auto">Input your prompt and click generate to breathe life into the digital void.</p>
                </div>
              </div>
              {/* Recent Result 1 */}
              <div className="col-span-4 row-span-1 group relative rounded-3xl overflow-hidden cursor-pointer">
                <img
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                  alt="Phoenix nebula"
                  src="/assets/card1.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-label text-secondary uppercase tracking-widest mb-1">Cinematic XL</span>
                  <p className="text-xs text-white/80 line-clamp-2">Ethereal phoenix rising from cosmic stardust...</p>
                </div>
              </div>
              {/* Recent Result 2 */}
              <div className="col-span-4 row-span-1 group relative rounded-3xl overflow-hidden cursor-pointer">
                <img
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                  alt="Liquid glass render"
                  src="/assets/card2.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-label text-secondary uppercase tracking-widest mb-1">seredityfy v2</span>
                  <p className="text-xs text-white/80 line-clamp-2">Fluid lavender chrome structures...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Controls Sidebar (Editorial Panel) */}
        <aside className="w-80 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
          {/* Model Selection */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40 mb-6">Model Engine</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <div className="text-left">
                  <div className="text-sm font-headline font-bold">seredityfy v2</div>
                  <div className="text-[10px] text-primary/60 font-label">Precision &amp; Realism</div>
                </div>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 text-purple-200/60 transition-all">
                <div className="text-left">
                  <div className="text-sm font-headline font-bold">Cinematic XL</div>
                  <div className="text-[10px] text-purple-400 font-label">High-Impact Drama</div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 text-purple-200/60 transition-all">
                <div className="text-left">
                  <div className="text-sm font-headline font-bold">Surrealist Flux</div>
                  <div className="text-[10px] text-purple-400 font-label">Artistic Liberty</div>
                </div>
              </button>
            </div>
          </section>
          {/* Aspect Ratio */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40 mb-6">Canvas Aspect</h4>
            <div className="grid grid-cols-3 gap-3">
              <button className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 border border-transparent hover:bg-white/10 transition-all group">
                <div className="w-4 h-6 border-2 border-purple-300/40 rounded-sm group-hover:border-primary/60 transition-colors"></div>
                <span className="text-[10px] font-label text-purple-300/60">2:3</span>
              </button>
              <button className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-all">
                <div className="w-5 h-5 border-2 border-primary rounded-sm"></div>
                <span className="text-[10px] font-label">1:1</span>
              </button>
              <button className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 border border-transparent hover:bg-white/10 transition-all group">
                <div className="w-7 h-4 border-2 border-purple-300/40 rounded-sm group-hover:border-primary/60 transition-colors"></div>
                <span className="text-[10px] font-label text-purple-300/60">16:9</span>
              </button>
            </div>
          </section>
          {/* Guidance Scale */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40">Creative Freedom</h4>
              <span className="text-xs font-label text-primary">8.5</span>
            </div>
            <div className="relative w-full h-1 bg-white/5 rounded-full mb-2">
              <div className="absolute left-0 top-0 h-full w-[85%] bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-4 h-4 bg-on-primary rounded-full shadow-lg border-2 border-primary cursor-pointer transition-transform hover:scale-125"></div>
            </div>
            <div className="flex justify-between text-[10px] font-label text-purple-300/30 uppercase">
              <span>Literal</span>
              <span>Abstract</span>
            </div>
          </section>
          {/* Advanced Toggles */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-label text-purple-200/80">Negative Prompt</span>
              <div className="w-10 h-5 bg-white/10 rounded-full relative p-1 cursor-pointer">
                <div className="w-3 h-3 bg-purple-300/40 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-label text-purple-200/80">Seed Fix</span>
              <div className="w-10 h-5 bg-primary/20 rounded-full relative p-1 cursor-pointer">
                <div className="w-3 h-3 bg-primary rounded-full absolute right-1"></div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
