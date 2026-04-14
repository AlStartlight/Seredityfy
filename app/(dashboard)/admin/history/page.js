'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

function getRatioLabel(width, height) {
  if (!width || !height) return null;
  const ratio = width / height;
  if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
  if (Math.abs(ratio - 1) < 0.1) return '1:1';
  if (Math.abs(ratio - 2/3) < 0.1) return '2:3';
  if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
  if (Math.abs(ratio - 4/5) < 0.1) return '4:5';
  return `${width}x${height}`;
}

function HistoryCard({ item, prefersReduced }) {
  const motionProps = prefersReduced ? {} : { variants: itemVariants };

  if (item.status === 'PENDING' || item.status === 'PROCESSING') {
    return (
      <motion.div {...motionProps} className="relative flex flex-col bg-surface-container-low/30 rounded-3xl overflow-hidden border border-white/5 animate-pulse">
        <div className="aspect-[4/5] bg-surface-container-high relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="mt-4 text-[10px] font-label uppercase tracking-widest text-primary">Generating...</p>
          </div>
        </div>
        <div className="p-6">
          <div className="h-2 w-24 bg-surface-container-highest rounded mb-4" />
          <div className="h-3 w-full bg-surface-container-highest rounded mb-2" />
          <div className="h-3 w-4/5 bg-surface-container-highest rounded" />
        </div>
      </motion.div>
    );
  }

  if (item.status === 'FAILED' || item.status === 'ERROR') {
    return (
      <motion.div {...motionProps} className="group relative flex flex-col bg-[#2c1245]/40 backdrop-blur-[24px] rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(31,4,56,0.8)] border border-white/5">
        <div className="aspect-[4/5] relative flex items-center justify-center bg-surface-container-highest">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <span className="material-symbols-outlined text-5xl text-error animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
            <p className="font-label text-xs uppercase tracking-widest text-error">Generation Failed</p>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-error-container/80 backdrop-blur-md text-on-error-container text-[10px] font-label font-bold rounded-full uppercase tracking-tighter">Error</span>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col opacity-60">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Model: {item.model || 'seredityfy-v2'}</span>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{formatTimeAgo(item.createdAt)}</span>
          </div>
          <p className="text-sm font-body text-on-surface line-clamp-2 leading-relaxed mb-4 italic">{item.prompt}</p>
          <button className="mt-auto text-primary text-xs font-label uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">refresh</span> Retry Now
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <Link href={`/admin/gallery/${item.id}`}>
      <motion.div {...motionProps} className="group relative flex flex-col bg-[#2c1245]/40 backdrop-blur-[24px] rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(31,4,56,0.8)] border border-white/5 cursor-pointer">
        <div className="aspect-[4/5] relative overflow-hidden">
          {item.imageUrl ? (
            <img src={item.thumbnailUrl || item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/30 via-surface-container-high to-surface-container" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-primary/40 transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-primary/40 transition-colors">
            <span className="material-symbols-outlined text-sm">more_vert</span>
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-secondary-container/80 backdrop-blur-md text-on-secondary-container text-[10px] font-label font-bold rounded-full uppercase tracking-tighter">Completed</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-label text-primary uppercase tracking-widest">Model: {item.model || 'seredityfy-v2'}</span>
          <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{formatTimeAgo(item.createdAt)}</span>
        </div>
        <p className="text-sm font-body text-on-surface line-clamp-2 leading-relaxed mb-4 italic group-hover:text-primary transition-colors">{item.prompt}</p>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">image_aspect_ratio</span>
          <span className="text-[10px] font-label text-on-surface-variant">{getRatioLabel(item.width, item.height)}</span>
          <div className="ml-auto flex -space-x-2">
            <div className="w-5 h-5 rounded-full border border-background bg-primary-container" />
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFab, setShowFab] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const prefersReduced = useReducedMotion();
  const { data: session } = useSession();

  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/images?page=${currentPage}&limit=${itemsPerPage}&type=user`);
        const data = await res.json();
        
        if (data.images) {
          setHistory(data.images);
          setTotalImages(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session, currentPage]);

  useEffect(() => {
    const handleScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredHistory = activeFilter === 'All' 
    ? history 
    : activeFilter === 'Completed' 
      ? history.filter(h => h.status === 'COMPLETED')
      : history.filter(h => h.status !== 'COMPLETED');

  const totalPages = Math.ceil(totalImages / itemsPerPage);

  return (
    <main className="p-4 lg:p-6 min-h-[calc(100vh-5rem)]">
      <motion.section
        className="mb-6"
        initial={prefersReduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl lg:text-4xl font-headline font-extrabold text-on-surface mb-2">Generation History</h2>
        <p className="text-on-surface-variant text-sm">
          Your archive of digital dreams. {totalImages} generations total.
        </p>
      </motion.section>

      <motion.section
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          {['All', 'Completed', 'Failed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-label uppercase tracking-widest transition-colors ${
                activeFilter === filter
                  ? 'bg-primary/20 backdrop-blur-md text-primary font-bold border border-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: viewMode === 'grid' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </motion.section>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-surface-container-low rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">history</span>
          <p className="mt-4 text-on-surface-variant">No generation history yet</p>
          <a href="/admin/generate" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
            Create Your First Image
          </a>
        </div>
      ) : (
        <motion.section
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
        >
          {filteredHistory.map((item) => (
            <HistoryCard key={item.id} item={item} prefersReduced={prefersReduced} />
          ))}
        </motion.section>
      )}

      {totalPages > 1 && (
        <section className="mt-8 flex items-center justify-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg font-label text-xs transition-colors ${
                currentPage === i + 1
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </section>
      )}

      <AnimatePresence>
        {showFab && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={prefersReduced ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 bg-surface-container-highest/60 backdrop-blur-xl border border-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}