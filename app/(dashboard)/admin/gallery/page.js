import Link from 'next/link';

const cards = [
  { id: '1', title: 'Neon Pulse Cathedral', prompt: 'Hyper-realistic gothic architecture fused with fiber-optic veins, bioluminescent moss, cinematic lighting, 8k resolution', author: '@astra_gen', avatar: '/assets/zenai.jpg', img: '/assets/card1.png', liked: true },
  { id: '2', title: 'Celestial Resonance', prompt: 'A portrait of a star-born entity, cosmic dust swirling in eyes, deep space aesthetic, neon glow accents', author: '@nova_void', avatar: '/assets/zenai.jpg', img: '/assets/card2.png' },
  { id: '3', title: 'Liquid Midnight', prompt: '3D abstract flow, metallic textures, electric purple currents, high gloss finish, raytracing', author: '@flux_flow', avatar: '/assets/zenai.jpg', img: '/assets/card3.png' },
  { id: '4', title: 'Silicon Predator', prompt: 'Glass predator, neural network veins, internal blue fire, synthwave lighting, macro shot', author: '@cyber_soul', avatar: '/assets/zenai.jpg', img: '/assets/dragons.png', liked: true },
  { id: '5', title: "Escher's seredityfy", prompt: 'Impossible geometry, infinite loops, obsidian surfaces, electric violet highlights, brutalist style', author: '@vector_mind', avatar: '/assets/zenai.jpg', img: '/assets/image_12.png' },
  { id: '6', title: 'Cyber-Hero Core', prompt: 'Pop culture reimagined, mechanical fusion, energy core glow, hyper-detailed textures, unreal engine 5 render', author: '@fanart_ai', avatar: '/assets/zenai.jpg', img: '/assets/image2.png' },
];

export default function GalleryPage() {
  return (
    <main className="p-8">
      {/* Hero Title Section */}
      <section className="mb-12">
        <h2 className="text-5xl font-black font-headline text-on-surface tracking-tighter mb-4">
          Community{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Masterpieces</span>
        </h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          Explore the latest creations from our global community of digital alchemists. remix, like, and get inspired by the electric frontiers of AI art.
        </p>
      </section>

      {/* Search & Filter Bar (Glassmorphic) */}
      <section className="mb-10 glass-panel bg-[#1f0438]/70 backdrop-blur-2xl p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-outline-variant/10">
        <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl">
          <button className="px-6 py-2 bg-primary-container text-on-primary-container rounded-lg font-label text-xs font-bold transition-all">Latest</button>
          <button className="px-6 py-2 text-on-surface-variant hover:text-primary rounded-lg font-label text-xs font-medium transition-all">Top Rated</button>
          <button className="px-6 py-2 text-on-surface-variant hover:text-primary rounded-lg font-label text-xs font-medium transition-all">Featured</button>
        </div>
        <div className="h-8 w-px bg-outline-variant/20 hidden md:block"></div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f0438]/70 backdrop-blur-2xl border border-outline-variant/20 rounded-xl text-on-surface-variant font-label text-xs hover:bg-white/5 transition-all">
            Category: <span className="text-primary font-bold">Surrealism</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f0438]/70 backdrop-blur-2xl border border-outline-variant/20 rounded-xl text-on-surface-variant font-label text-xs hover:bg-white/5 transition-all">
            Ratio: <span className="text-primary font-bold">16:9</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-label text-outline uppercase tracking-widest">Showing 1,240 Results</span>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </section>

      {/* Masonry Gallery Grid */}
      <section className="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-6">
        {cards.map((c) => (
          <Link
            key={c.id}
            href={`/admin/gallery/${c.id}`}
            className="mb-6 block group relative rounded-2xl overflow-hidden border border-outline-variant/5 bg-surface-container-low transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(31,0,72,0.6)]"
          >
            <img className="w-full h-auto object-cover" alt={c.title} src={c.img} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <div className="mb-4">
                <p className="text-xs font-label text-secondary font-bold mb-1 uppercase tracking-tighter">&quot;{c.title}&quot;</p>
                <p className="text-[10px] font-body text-white/70 line-clamp-2 italic">{c.prompt}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6 rounded-full" alt="avatar" src={c.avatar} />
                  <span className="text-xs font-label text-on-primary-container font-medium">{c.author}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/10 hover:bg-secondary/20 rounded-full text-secondary transition-all">
                    <span className="material-symbols-outlined text-lg" style={c.liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                  </button>
                  <span className="flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full font-label text-[10px] font-bold">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Remix
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Pagination / Footer Loading */}
      <div className="mt-16 flex flex-col items-center gap-6">
        <button className="px-8 py-4 bg-[#1f0438]/70 backdrop-blur-2xl border border-primary/30 rounded-full text-primary font-label font-bold text-sm hover:bg-primary hover:text-on-primary transition-all group">
          Load More Masterpieces
          <span className="material-symbols-outlined ml-2 align-middle group-hover:rotate-180 transition-transform">refresh</span>
        </button>
        <div className="flex items-center gap-4 text-outline font-label text-xs">
          <span>Page 1 of 124</span>
          <div className="flex gap-1">
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <div className="w-4 h-1 bg-outline-variant/30 rounded-full"></div>
            <div className="w-4 h-1 bg-outline-variant/30 rounded-full"></div>
            <div className="w-4 h-1 bg-outline-variant/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
