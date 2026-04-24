'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import FullscreenImageViewer from '@/src/components/FullscreenImageViewer';

export default function ImageDetailPage({ params }) {
  const { id } = use(params);
  
  const [image, setImage] = useState(null);
  const [relatedImages, setRelatedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [imageRes, relatedRes] = await Promise.all([
        fetch(`/api/generate/${id}`),
        fetch('/api/community?limit=5'),
      ]);
      
      const imageData = await imageRes.json();
      const relatedData = await relatedRes.json();
      
      if (!imageRes.ok) {
        setError(imageData.error || `Server error: ${imageRes.status}`);
      } else if (imageData.error) {
        setError(imageData.error);
      } else {
        setImage(imageData);
      }
      
      if (relatedData.images) {
        setRelatedImages(relatedData.images);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load image. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = useCallback(() => {
    if (image?.imageUrl) {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `seredityfy-${image.id}.png`;
      link.target = '_blank';
      link.click();
    }
  }, [image]);

  const handleRemix = useCallback(() => {
    if (image?.prompt) {
      window.location.href = `/admin/generate?prompt=${encodeURIComponent(image.prompt)}`;
    }
  }, [image]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span className="text-purple-300/60 font-label">Loading masterpiece...</span>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
          <span className="material-symbols-outlined text-7xl text-purple-300/30 absolute inset-0 flex items-center justify-center">image_not_supported</span>
        </div>
        <h1 className="text-3xl font-headline font-black text-white mb-3">
          {error ? 'Oops!' : 'Image Not Found'}
        </h1>
        <p className="text-purple-300/60 mb-6 max-w-md">
          {error || 'The masterpiece you are looking for does not exist or may have been removed from our gallery.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/admin/gallery" className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-label text-sm font-bold transition-all hover:shadow-lg hover:shadow-secondary/30">
            <span className="material-symbols-outlined text-sm mr-2 align-middle">gallery_thumbnail_view</span>
            Browse Gallery
          </Link>
          <Link href="/admin/generate" className="px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest rounded-full text-purple-200 font-label text-sm font-bold transition-colors">
            <span className="material-symbols-outlined text-sm mr-2 align-middle">add</span>
            Create New
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {isFullscreen && (
        <FullscreenImageViewer
          imageUrl={image.imageUrl}
          prompt={image.prompt}
          onClose={() => setIsFullscreen(false)}
        />
      )}

      <main className="p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div 
              className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 bg-surface-container-low aspect-[4/5] lg:aspect-auto lg:max-h-[85vh]"
            >
              <img
                className="w-full h-full object-contain bg-black cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                alt={image.prompt}
                src={image.imageUrl || '/assets/card1.png'}
                onClick={() => setIsFullscreen(true)}
              />
              
              {image.visibility === 'PUBLIC' && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  <span className="text-xs font-label font-bold text-white uppercase tracking-wider">Featured</span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">fullscreen</span>
                  <span className="text-sm font-label">Fullscreen</span>
                </button>
                <Link 
                  href={`/admin/gallery/${id}/history`} 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
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

          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
                  <img 
                    alt={image.user?.name || 'Creator'} 
                    className="w-full h-full object-cover" 
                    src={image.user?.image || '/assets/zenai.jpg'} 
                  />
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
            
            <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
              <h2 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">Prompt</h2>
              <p className="text-sm font-body leading-relaxed text-on-surface italic">&quot;{image.enhancedPrompt || image.prompt}&quot;</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleRemix}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Remix
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen</span>
                  Full
                </button>
                <button 
                  onClick={handleDownload}
                  className="py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Save
                </button>
                <button className="py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors group">
                  <span className="material-symbols-outlined text-sm group-hover:text-secondary">favorite</span>
                  Like
                </button>
              </div>
            </div>
            
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
    </>
  );
}
