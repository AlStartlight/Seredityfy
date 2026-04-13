const models = [
  {
    name: 'Seredityfy v2',
    tagline: 'Deep Atmosphere & High Contrast',
    steps: '850k+',
    weight: '0.92',
    img: '/assets/card1.png',
    featured: true,
  },
  {
    name: 'Cinematic XL',
    tagline: 'Wide-angle Epic Photography',
    steps: '1.2M',
    weight: '1.00',
    img: '/assets/card2.png',
  },
  {
    name: 'Surrealist Flux',
    tagline: 'Dream Logic & Abstract Textures',
    steps: '620k',
    weight: '0.85',
    img: '/assets/card3.png',
  },
  {
    name: 'Digital Synth',
    tagline: 'Retro-digital & Pixel Perfect',
    steps: '430k',
    weight: '0.78',
    img: '/assets/image2.png',
  },
  {
    name: 'Primal Noir',
    tagline: 'Monochrome High-Key Lighting',
    steps: '910k',
    weight: '1.10',
    img: '/assets/image6.png',
  },
];

export default function ModelsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Page Content */}
      <div className="p-10 space-y-12 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <section className="relative rounded-[2rem] overflow-hidden p-12 flex flex-col justify-end min-h-[300px] bg-surface-container-low">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
            <img className="w-full h-full object-cover opacity-60" alt="Abstract fluid waves" src="/assets/image_12.png" />
          </div>
          <div className="relative z-20 space-y-4">
            <span className="font-label text-primary text-xs tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">Core Infrastructure</span>
            <h2 className="text-6xl font-extrabold font-headline text-white leading-tight">AI Model Engines</h2>
            <p className="text-purple-100/60 max-w-xl font-body leading-relaxed">
              Precision-tuned neural architectures designed for specific creative pipelines. Select an engine to begin your generation journey.
            </p>
          </div>
        </section>
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface-container-low rounded-2xl">
            <button className="px-6 py-2 rounded-xl text-sm font-label font-bold bg-primary text-on-primary transition-all">All</button>
            <button className="px-6 py-2 rounded-xl text-sm font-label text-purple-200/70 hover:bg-white/5 transition-all">Photorealistic</button>
            <button className="px-6 py-2 rounded-xl text-sm font-label text-purple-200/70 hover:bg-white/5 transition-all">Artistic</button>
            <button className="px-6 py-2 rounded-xl text-sm font-label text-purple-200/70 hover:bg-white/5 transition-all">3D</button>
            <button className="px-6 py-2 rounded-xl text-sm font-label text-purple-200/70 hover:bg-white/5 transition-all">Experimental</button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-label text-purple-400/60 uppercase tracking-tighter">Sort by:</span>
            <select className="bg-transparent border-none text-sm font-label text-primary focus:ring-0 cursor-pointer">
              <option>Most Popular</option>
              <option>Newest Release</option>
              <option>Performance</option>
            </select>
          </div>
        </div>
        {/* Models Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((m) => (
            <article
              key={m.name}
              className="group bg-surface-container-low rounded-[1.5rem] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:bg-surface-container"
            >
              <div className="h-64 overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={m.name} src={m.img} />
                {m.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-secondary text-on-secondary font-label text-[10px] font-bold rounded-full uppercase">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold font-headline text-on-surface">{m.name}</h3>
                    <p className="text-sm text-purple-300/60 font-body">{m.tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div>
                    <p className="text-[10px] font-label text-purple-400 uppercase tracking-widest">Training Steps</p>
                    <p className="text-sm font-bold font-label text-on-surface">{m.steps}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-label text-purple-400 uppercase tracking-widest">Style Weight</p>
                    <p className="text-sm font-bold font-label text-on-surface">{m.weight}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <button className="w-full py-3 bg-white/5 hover:bg-primary hover:text-on-primary transition-all duration-300 rounded-xl font-label font-bold text-sm">
                    Select Engine
                  </button>
                </div>
              </div>
            </article>
          ))}
          {/* Add Custom Model CTA */}
          <article className="group border-2 border-dashed border-outline-variant/30 rounded-[1.5rem] flex flex-col items-center justify-center p-12 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl text-primary">add_link</span>
            </div>
            <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Connect External</h3>
            <p className="text-sm text-purple-300/60 font-body max-w-[200px]">Import fine-tuned models via HuggingFace or custom API</p>
          </article>
        </section>
      </div>
      {/* Footer */}
      <footer className="mt-auto px-8 py-12 border-t border-white/5 bg-surface-container-lowest/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="font-headline font-black text-primary">seredityfy</span>
            <span className="text-xs font-label text-purple-400/40">© 2024 Electric Precision Labs</span>
          </div>
          <div className="flex gap-8">
            <a className="text-xs font-label text-purple-300/60 hover:text-primary transition-colors" href="#">Documentation</a>
            <a className="text-xs font-label text-purple-300/60 hover:text-primary transition-colors" href="#">Security</a>
            <a className="text-xs font-label text-purple-300/60 hover:text-primary transition-colors" href="#">Terms of Flow</a>
            <a className="text-xs font-label text-purple-300/60 hover:text-primary transition-colors" href="#">Status</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
