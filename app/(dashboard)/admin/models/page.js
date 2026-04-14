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
    <main className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="relative rounded-2xl overflow-hidden p-6 lg:p-10 flex flex-col justify-end min-h-[200px] lg:min-h-[280px] bg-surface-container-low">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
            <img className="w-full h-full object-cover opacity-40" alt="Models" src="/assets/image_12.png" />
          </div>
          <div className="relative z-20 space-y-2">
            <span className="font-label text-primary text-xs tracking-widest uppercase bg-primary/10 px-2 py-1 rounded-full">Core Infrastructure</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-white leading-tight">AI Model Engines</h2>
            <p className="text-purple-100/60 text-sm lg:text-base font-body max-w-xl">
              Precision-tuned neural architectures designed for specific creative pipelines.
            </p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 p-1 bg-surface-container-low rounded-xl">
            <button className="px-4 py-1.5 rounded-lg text-xs font-label font-bold bg-primary text-on-primary">All</button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-label text-purple-200/70 hover:bg-white/5">Photorealistic</button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-label text-purple-200/70 hover:bg-white/5">Artistic</button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-label text-purple-200/70 hover:bg-white/5">3D</button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-label text-purple-200/70 hover:bg-white/5">Experimental</button>
          </div>
          <select className="bg-transparent border-none text-xs font-label text-primary focus:ring-0 cursor-pointer">
            <option>Most Popular</option>
            <option>Newest</option>
          </select>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {models.map((m) => (
            <article
              key={m.name}
              className="group bg-surface-container-low rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-surface-container"
            >
              <div className="h-48 lg:h-56 overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={m.name} src={m.img} />
                {m.featured && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-secondary text-on-secondary font-label text-[10px] font-bold rounded-full">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4 lg:p-5 flex flex-col flex-1 space-y-3">
                <div>
                  <h3 className="text-base lg:text-lg font-bold font-headline text-on-surface">{m.name}</h3>
                  <p className="text-xs text-purple-300/60">{m.tagline}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/5">
                  <div>
                    <p className="text-[10px] font-label text-purple-400 uppercase">Steps</p>
                    <p className="text-xs font-bold font-label text-on-surface">{m.steps}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-label text-purple-400 uppercase">Weight</p>
                    <p className="text-xs font-bold font-label text-on-surface">{m.weight}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-white/5 hover:bg-primary hover:text-on-primary rounded-lg font-label text-xs font-bold transition-all">
                  Select Engine
                </button>
              </div>
            </article>
          ))}
          <article className="group border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl text-primary">add_link</span>
            </div>
            <h3 className="text-base font-bold font-headline text-on-surface mb-1">Connect External</h3>
            <p className="text-xs text-purple-300/60">Import fine-tuned models</p>
          </article>
        </section>
      </div>
    </main>
  );
}