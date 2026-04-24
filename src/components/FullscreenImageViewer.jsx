'use client';

import { useEffect, useCallback } from 'react';

export default function FullscreenImageViewer({ imageUrl, prompt, onClose }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `seredityfy-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  const handleRemix = () => {
    if (prompt) {
      window.location.href = `/admin/generate?prompt=${encodeURIComponent(prompt)}`;
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10 active:scale-95"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl z-10">
        <span className="material-symbols-outlined text-primary">auto_awesome</span>
        <span className="text-sm text-white/90 font-label max-w-lg truncate">{prompt || 'Image Preview'}</span>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); window.open(imageUrl, '_blank'); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <span className="material-symbols-outlined text-lg">open_in_new</span>
          <span className="text-sm font-label">Open Original</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-full text-white transition-all"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span className="text-sm font-label">Download</span>
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleRemix(); }}
        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-full text-white transition-all hover:shadow-lg hover:shadow-secondary/30"
      >
        <span className="material-symbols-outlined text-lg">auto_awesome</span>
        <span className="text-sm font-label font-bold">Remix</span>
      </button>

      <img
        src={imageUrl}
        alt={prompt || 'Fullscreen preview'}
        className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s ease-out' }}
      />
    </div>
  );
}
