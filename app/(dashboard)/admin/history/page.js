'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const HISTORY_ITEMS = [
  {
    id: 1,
    status: 'completed',
    model: 'seredityfy-v3',
    time: '2m ago',
    prompt: '"Cyberpunk cathedral with stained glass windows depicting neural networks, 8k resolution, cinematic lighting..."',
    ratio: '16:9',
    gradient: 'from-primary-container/30 via-surface-container-high to-surface-container',
    accent: 'primary',
  },
  {
    id: 2,
    status: 'completed',
    model: 'Dreamweaver-1',
    time: '1h ago',
    prompt: '"Surreal desert landscape with floating crystalline monoliths and dual purple moons, hyper-realistic texture..."',
    ratio: '1:1',
    gradient: 'from-secondary-container/20 via-surface-container to-surface-container-high',
    accent: 'secondary',
  },
  {
    id: 3,
    status: 'error',
    model: 'seredityfy-v3',
    time: '3h ago',
    prompt: '"Macro shot of a mechanical butterfly with translucent wings made of fiber optics..."',
    ratio: null,
  },
  {
    id: 4,
    status: 'completed',
    model: 'Vector-Flow',
    time: 'Yesterday',
    prompt: '"Anatomical heart made of clockwork gears and luminous circuits, black background..."',
    ratio: '9:16',
    gradient: 'from-tertiary-container/30 via-surface-container-high to-surface-container',
    accent: 'tertiary',
  },
  {
    id: 5,
    status: 'completed',
    model: 'seredityfy-v3',
    time: '2 days ago',
    prompt: '"80s vaporwave city street at night, rain reflections, nostalgic neon signs, low-poly style..."',
    ratio: '4:5',
    gradient: 'from-primary-container/20 via-surface-container to-secondary-container/20',
    accent: 'primary',
  },
  {
    id: 6,
    status: 'loading',
  },
];

const PAGES = [1, 2, 3, '...', 12];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function HistoryCard({ item, prefersReduced }) {
  const motionProps = prefersReduced
    ? {}
    : { variants: itemVariants };

  if (item.status === 'loading') {
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

  if (item.status === 'error') {
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
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Model: {item.model}</span>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{item.time}</span>
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
    <motion.div {...motionProps} className="group relative flex flex-col bg-[#2c1245]/40 backdrop-blur-[24px] rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(31,4,56,0.8)] border border-white/5">
      <div className="aspect-[4/5] relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
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
          <span className="text-[10px] font-label text-primary uppercase tracking-widest">Model: {item.model}</span>
          <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{item.time}</span>
        </div>
        <p className="text-sm font-body text-on-surface line-clamp-2 leading-relaxed mb-4 italic group-hover:text-primary transition-colors">{item.prompt}</p>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">image_aspect_ratio</span>
          <span className="text-[10px] font-label text-on-surface-variant">{item.ratio}</span>
          <div className="ml-auto flex -space-x-2">
            <div className="w-5 h-5 rounded-full border border-background bg-primary-container" />
            <div className="w-5 h-5 rounded-full border border-background bg-secondary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All Models');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFab, setShowFab] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="pt-24 px-10 pb-20 min-h-screen">
      {/* Page Header */}
      <motion.section
        className="mb-12"
        initial={prefersReduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h2 className="font-headline text-5xl font-extrabold tracking-tighter text-on-background mb-2">Generation History</h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          Your archive of digital dreams. Manage, revisit, and upscale your past neural explorations.
        </p>
      </motion.section>

      {/* Filters & Tools */}
      <motion.section
        className="flex flex-wrap items-center justify-between gap-6 mb-10"
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="flex items-center gap-3 relative">
          {['All Models', 'Completed', 'Drafts'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`relative px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-widest transition-colors ${
                activeFilter === filter
                  ? 'bg-[#2c1245]/40 backdrop-blur-[24px] text-primary font-bold border border-primary/10'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              {activeFilter === filter && !prefersReduced && (
                <motion.span
                  layoutId="filter-highlight"
                  className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{filter}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-label text-on-surface-variant">
            <span>SORT BY:</span>
            <select className="bg-transparent border-none p-0 text-primary font-bold focus:ring-0 text-xs">
              <option>NEWEST FIRST</option>
              <option>OLDEST FIRST</option>
              <option>A-Z</option>
            </select>
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
        </div>
      </motion.section>

      {/* History Grid */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        variants={prefersReduced ? undefined : containerVariants}
        initial={prefersReduced ? false : 'hidden'}
        animate="visible"
      >
        {HISTORY_ITEMS.map((item) => (
          <HistoryCard key={item.id} item={item} prefersReduced={prefersReduced} />
        ))}
      </motion.section>

      {/* Pagination */}
      <section className="mt-16 flex items-center justify-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2c1245]/40 backdrop-blur-[24px] text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex items-center gap-2">
          {PAGES.map((page, i) =>
            page === '...' ? (
              <span key={`i-${i}`} className="text-on-surface-variant px-2">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-label transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-[#2c1245]/40 backdrop-blur-[24px] text-on-surface-variant hover:text-primary'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2c1245]/40 backdrop-blur-[24px] text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </section>

      {/* Scroll to top FAB */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={prefersReduced ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-14 h-14 bg-surface-container-highest/60 backdrop-blur-xl border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
