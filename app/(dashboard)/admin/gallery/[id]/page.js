import Link from 'next/link';

export default function ImageDetailPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Large Image Display */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low aspect-[4/5] lg:aspect-auto lg:h-[750px]">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Bioluminescent forest landscape"
              src="/assets/card1.png"
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-xs font-label font-bold text-white uppercase tracking-wider">Featured Masterpiece</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined">fullscreen</span>
                <span className="text-sm font-label">View Fullscreen</span>
              </button>
              <Link href="/admin/gallery/1/history" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined">history</span>
                <span className="text-sm font-label">Generation History</span>
              </Link>
            </div>
          </div>
          <div className="bg-surface-container-low/40 rounded-3xl p-8 backdrop-blur-xl border border-white/5 lg:hidden">
            <h2 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-primary/60 mb-4">Master Prompt</h2>
            <p className="text-xl font-body leading-relaxed text-on-surface">
              &quot;An ethereal bioluminescent forest in the deep of seredityfy Prime, vibrant neon flora pulsing in rhythmic harmony, misty atmosphere with floating crystalline dust, volumetric light shafts piercing through translucent purple canopy, hyper-detailed, 8k, cinematic.&quot;
            </p>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-4 space-y-8 sticky top-28 h-fit">
          {/* Creator Card */}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                <img alt="Creator Avatar" className="w-full h-full object-cover" src="/assets/zenai.jpg" />
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
          {/* Primary Action Hub */}
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
          {/* Technical Metadata */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-white/5 space-y-6">
            <div className="hidden lg:block">
              <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-3">Master Prompt</h2>
              <p className="font-body text-base leading-relaxed text-on-surface-variant italic">
                &quot;An ethereal bioluminescent forest in the deep of seredityfy Prime, vibrant neon flora pulsing in rhythmic harmony, misty atmosphere with floating crystalline dust...&quot;
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
          {/* Stats */}
          <div className="flex justify-around py-4">
            <div className="text-center">
              <p className="text-2xl font-headline font-extrabold text-on-surface">1.2k</p>
              <p className="text-[10px] font-label text-primary/40 uppercase">Remixes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-extrabold text-on-surface">542</p>
              <p className="text-[10px] font-label text-primary/40 uppercase">Favorites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-extrabold text-on-surface">8.9k</p>
              <p className="text-[10px] font-label text-primary/40 uppercase">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Masterpieces Section */}
      <section className="mt-24 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight">Related Masterpieces</h2>
            <p className="font-body text-primary/50 mt-2 text-lg">Curated echoes of this visual journey</p>
          </div>
          <Link href="/admin/gallery" className="text-primary font-label font-bold flex items-center gap-2 group">
            View Gallery <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {['/assets/card1.png', '/assets/card2.png', '/assets/card3.png', '/assets/dragons.png', '/assets/image_12.png'].map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden aspect-square relative group">
              <img className="w-full h-full object-cover" alt="Related" src={src} />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-2">
          <span className="text-sm font-label text-primary">© 2024 seredityfy ai Platform</span>
          <span className="text-xs text-primary/40">•</span>
          <span className="text-xs font-label uppercase tracking-widest text-primary/40">Terms of Generation</span>
        </div>
        <div className="flex gap-6">
          <a className="text-on-surface hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
          <a className="text-on-surface hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">flag</span></a>
          <a className="text-on-surface hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">info</span></a>
        </div>
      </footer>
    </main>
  );
}
