import Link from 'next/link';
import prisma from '@/src/lib/prisma';

export default async function ImageDetailPage({ params }) {
  const { id } = await params;
  
  const image = await prisma.generatedImage.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const relatedImages = await prisma.generatedImage.findMany({
    where: {
      id: { not: id },
      imageUrl: { not: null },
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      prompt: true,
      imageUrl: true,
      thumbnailUrl: true,
    },
  });

  if (!image) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Image not found</h1>
        <Link href="/admin/gallery" className="text-primary hover:underline mt-4 inline-block">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <main className="p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Large Image Display */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low aspect-[4/5] lg:aspect-auto lg:max-h-[85vh]">
            <img
              className="w-full h-full object-contain bg-black"
              alt={image.prompt}
              src={image.imageUrl || '/assets/card1.png'}
            />
            {image.visibility === 'PUBLIC' && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="text-xs font-label font-bold text-white uppercase tracking-wider">Featured</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined">fullscreen</span>
                <span className="text-sm font-label">Fullscreen</span>
              </button>
              <Link href={`/admin/gallery/${id}/history`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined">history</span>
                <span className="text-sm font-label">History</span>
              </Link>
            </div>
          </div>
          <div className="bg-surface-container-low/40 rounded-2xl p-4 backdrop-blur-xl border border-white/5 lg:hidden">
            <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">Master Prompt</h2>
            <p className="text-sm font-body leading-relaxed text-on-surface">&quot;{image.prompt}&quot;</p>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 h-fit">
          {/* Creator Card */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
                <img alt="Creator" className="w-full h-full object-cover" src={image.user?.image || '/assets/zenai.jpg'} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface">{image.user?.name || 'Anonymous'}</h3>
                <p className="font-label text-xs text-primary/60">{image.visibility === 'PUBLIC' ? 'Featured' : 'Private'}</p>
              </div>
            </div>
            <button className="px-4 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-bold font-label hover:bg-primary/10 transition-colors">
              Follow
            </button>
          </div>
          
          {/* Prompt */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
            <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">Prompt</h2>
            <p className="text-sm font-body leading-relaxed text-on-surface italic">&quot;{image.enhancedPrompt || image.prompt}&quot;</p>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="col-span-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Remix
            </button>
            <button className="py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Download
            </button>
            <button className="py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors group">
              <span className="material-symbols-outlined text-sm group-hover:text-secondary">favorite</span>
              Like
            </button>
          </div>
          
          {/* Metadata */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-label text-[10px] text-primary/40 uppercase tracking-widest mb-0.5">Model</p>
                <p className="font-label text-xs font-bold text-on-surface">{image.model || 'seredityfy-v2'}</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-primary/40 uppercase tracking-widest mb-0.5">Size</p>
                <p className="font-label text-xs font-bold text-on-surface">{image.width || '?'}x{image.height || '?'}</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-primary/40 uppercase tracking-widest mb-0.5">Status</p>
                <p className="font-label text-xs font-bold text-on-surface">{image.status}</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-primary/40 uppercase tracking-widest mb-0.5">Created</p>
                <p className="font-label text-xs font-bold text-on-surface">{new Date(image.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Masterpieces */}
      {relatedImages.length > 0 && (
        <section className="mt-12 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-headline font-black text-on-surface tracking-tight">Related Masterpieces</h2>
              <p className="font-body text-primary/50 text-sm">More from community</p>
            </div>
            <Link href="/admin/gallery" className="text-primary font-label text-sm font-bold flex items-center gap-1 group">
              View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {relatedImages.map((img) => (
              <Link key={img.id} href={`/admin/gallery/${img.id}`} className="rounded-xl overflow-hidden aspect-square relative group bg-surface-container-low">
                <img 
                  className="w-full h-full object-cover" 
                  alt={img.prompt} 
                  src={img.thumbnailUrl || img.imageUrl || '/assets/placeholder.png'} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[10px] text-white line-clamp-2">{img.prompt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
