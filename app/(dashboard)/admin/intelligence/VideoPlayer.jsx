'use client';

import { useRef, useState } from 'react';

export default function VideoPlayer({ src, poster, onDownload }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const toggle = () => {
    if (!ref.current) return;
    if (ref.current.paused) {
      ref.current.play();
      setPlaying(true);
    } else {
      ref.current.pause();
      setPlaying(false);
    }
  };

  const handleEnded = () => setPlaying(false);
  const handleError = () => setError(true);

  if (!src) return null;

  if (error) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-container-low rounded-xl">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
        <span className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-widest">Video unavailable</span>
        {poster && (
          <img src={poster} alt="fallback" className="absolute inset-0 w-full h-full object-contain opacity-30" />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <video
        ref={ref}
        src={src}
        poster={poster}
        onEnded={handleEnded}
        onError={handleError}
        className="w-full h-full object-contain rounded-xl"
        playsInline
        loop
      />

      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
      >
        {!playing && (
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl shadow-primary/30 transition-transform hover:scale-105">
            <span className="material-symbols-outlined text-3xl text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </div>
        )}
      </button>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button onClick={toggle}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : 'play_arrow'}</span>
          </button>
        </div>
        {onDownload && (
          <button onClick={onDownload}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">download</span>
          </button>
        )}
      </div>
    </div>
  );
}
