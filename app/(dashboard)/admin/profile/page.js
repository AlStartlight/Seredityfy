'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import FullscreenImageViewer from '@/src/components/FullscreenImageViewer';

const TABS = ['Creations', 'Collections', 'Likes', 'About'];

const PLAN_META = {
  FREE:       { color: 'text-purple-300/60',  bg: 'bg-white/5',          icon: 'person' },
  STARTER:    { color: 'text-sky-400',         bg: 'bg-sky-400/10',       icon: 'rocket_launch' },
  PRO:        { color: 'text-amber-400',       bg: 'bg-amber-400/10',     icon: 'workspace_premium' },
  ENTERPRISE: { color: 'text-emerald-400',     bg: 'bg-emerald-400/10',   icon: 'diamond' },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ─── Sub-components ────────────────────────────────────────────────────── */

function ImageSkeleton() {
  return <div className="aspect-[4/5] rounded-2xl bg-surface-container-high animate-pulse" />;
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-purple-300/20">{icon}</span>
      </div>
      <p className="font-headline font-bold text-lg text-on-surface/40">{title}</p>
      <p className="text-purple-300/30 text-sm max-w-xs text-center">{subtitle}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-surface-container-low rounded-2xl p-4 border border-white/5 text-center"
    >
      <div className="text-xl font-bold font-headline text-primary">{value}</div>
      <div className="text-[10px] font-label text-purple-300/40 uppercase tracking-widest mt-1">{label}</div>
    </motion.div>
  );
}

function CreationCard({ image, onOpen }) {
  const done = image.status === 'COMPLETED' && image.imageUrl;
  const failed = image.status === 'FAILED';

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => done && onOpen(image)}
      className={`group relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-high border border-white/5 ${done ? 'cursor-pointer' : ''}`}
    >
      {done ? (
        <>
          <img
            src={image.imageUrl}
            alt={image.prompt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[11px] text-white/80 line-clamp-2 mb-2 leading-snug">{image.prompt}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-purple-300/50 uppercase font-label tracking-wide">{image.model}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(image.imageUrl, '_blank'); }}
                  className="p-1.5 bg-white/15 hover:bg-white/30 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-white" style={{ fontSize: '14px' }}>download</span>
                </button>
              </div>
            </div>
          </div>
          {image.visibility === 'PRIVATE' && (
            <div className="absolute top-2 right-2 p-1 bg-black/60 rounded-full backdrop-blur-sm">
              <span className="material-symbols-outlined text-white/50" style={{ fontSize: '14px' }}>lock</span>
            </div>
          )}
        </>
      ) : failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-3xl text-red-400/30">error</span>
          <span className="text-[10px] text-red-400/30 uppercase tracking-widest font-label">Failed</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] text-purple-300/40 uppercase tracking-widest font-label">Processing</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Creations Tab ─────────────────────────────────────────────────────── */
function CreationsTab({ images, isLoading, onOpen, onNavigate }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <ImageSkeleton key={i} />)}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <EmptyState
          icon="image"
          title="No creations yet"
          subtitle="Head to the Generate page and create your first image."
        />
        <button
          onClick={() => onNavigate('/admin/generate')}
          className="flex items-center gap-2 px-7 py-3 bg-primary text-on-primary font-bold rounded-xl font-label text-sm transition-all hover:opacity-90 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          Start Generating
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {images.map(img => (
          <CreationCard key={img.id} image={img} onOpen={onOpen} />
        ))}
      </motion.div>
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => onNavigate('/admin/generate')}
          className="flex items-center gap-2 px-7 py-3 bg-surface-container-low border border-white/5 hover:border-primary/30 rounded-2xl font-label text-sm text-purple-200/50 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Generate New Image
        </button>
      </div>
    </>
  );
}

/* ─── Collections Tab ───────────────────────────────────────────────────── */
function CollectionsTab({ images, isLoading, onOpen }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ImageSkeleton key={i} />)}
      </div>
    );
  }

  const grouped = images.reduce((acc, img) => {
    const key = img.model || 'seredityfy-v2';
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});

  const entries = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="folder_open"
        title="No collections yet"
        subtitle="Your generated images will be grouped by model here."
      />
    );
  }

  return (
    <div className="space-y-12">
      {entries.map(([model, imgs]) => (
        <div key={model}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>auto_awesome</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-sm capitalize">{model}</h3>
              <p className="text-[10px] text-purple-300/40 font-label">{imgs.length} image{imgs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 h-px bg-white/5 ml-2" />
            <span className="text-[10px] text-purple-300/30 font-label shrink-0">
              {imgs.filter(i => i.status === 'COMPLETED').length} completed
            </span>
          </div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {imgs.map(img => (
              <CreationCard key={img.id} image={img} onOpen={onOpen} />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ─── Likes Tab ─────────────────────────────────────────────────────────── */
function LikesTab() {
  return (
    <EmptyState
      icon="favorite"
      title="No liked images yet"
      subtitle="Like images from the community gallery to save them here."
    />
  );
}

/* ─── About Tab ─────────────────────────────────────────────────────────── */
function AboutTab({ session, subscription, images }) {
  const plan = subscription?.plan || 'FREE';
  const availableCredits = subscription?.availableCredits ?? 0;
  const usedCredits = subscription?.usedCredits ?? 0;
  const totalCredits = availableCredits + usedCredits || 10;
  const creditPct = Math.min(100, (usedCredits / totalCredits) * 100);
  const completedCount = images.filter(i => i.status === 'COMPLETED').length;
  const failedCount = images.filter(i => i.status === 'FAILED').length;
  const pendingCount = images.filter(i => i.status === 'PENDING').length;

  const joinedDate = session?.user?.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'March 2024';

  const meta = PLAN_META[plan] || PLAN_META.FREE;

  return (
    <div className="max-w-xl space-y-5">
      {/* Identity */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-5">
        <h4 className="text-[10px] font-label uppercase tracking-widest text-purple-300/40">Identity</h4>
        {[
          { icon: 'person', label: 'Display Name', value: session?.user?.name || '—' },
          { icon: 'mail', label: 'Email', value: session?.user?.email || '—' },
          { icon: 'calendar_today', label: 'Member Since', value: joinedDate },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-purple-300/40" style={{ fontSize: '18px' }}>{row.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-purple-300/40 font-label uppercase tracking-wide">{row.label}</p>
              <p className="text-sm font-medium text-on-surface">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-label uppercase tracking-widest text-purple-300/40">Subscription</h4>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${meta.color} ${meta.bg}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{meta.icon}</span>
            {plan}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-purple-300/40 font-label">Credits used this cycle</span>
            <span className="text-on-surface font-mono font-semibold">{usedCredits} / {totalCredits}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-fuchsia-400 rounded-full transition-all duration-700"
              style={{ width: `${creditPct}%` }}
            />
          </div>
          <p className="text-[10px] text-purple-300/30 mt-1.5 font-label">{availableCredits} credits remaining</p>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
        <h4 className="text-[10px] font-label uppercase tracking-widest text-purple-300/40 mb-5">Activity</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-headline text-primary">{images.length}</p>
            <p className="text-[9px] font-label text-purple-300/40 uppercase mt-1 tracking-wide">Total</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-headline text-emerald-400">{completedCount}</p>
            <p className="text-[9px] font-label text-purple-300/40 uppercase mt-1 tracking-wide">Completed</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-headline text-amber-400">{pendingCount + failedCount}</p>
            <p className="text-[9px] font-label text-purple-300/40 uppercase mt-1 tracking-wide">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState('Creations');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [images, setImages] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/images?type=mine&limit=100').then(r => r.json()),
      fetch('/api/subscriptions?current=true').then(r => r.json()),
    ])
      .then(([imgData, subData]) => {
        setImages(imgData?.images || []);
        setSubscription(subData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [status]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-5 w-40 bg-surface-container-high rounded animate-pulse" />
          <div className="h-3 w-28 bg-surface-container-high rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const username = userEmail ? `@${userEmail.split('@')[0]}` : '@user';
  const plan = subscription?.plan || 'FREE';
  const planMeta = PLAN_META[plan] || PLAN_META.FREE;
  const completedImages = images.filter(i => i.status === 'COMPLETED');
  const coverImage = completedImages[0]?.imageUrl || null;

  const stats = [
    { value: images.length,                           label: 'Creations' },
    { value: completedImages.length,                  label: 'Completed' },
    { value: subscription?.availableCredits ?? '—',   label: 'Credits' },
    { value: plan,                                     label: 'Plan' },
  ];

  return (
    <>
      {selectedImage && (
        <FullscreenImageViewer
          imageUrl={selectedImage.imageUrl}
          prompt={selectedImage.prompt}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <main className="min-h-screen">
        {/* ── Cover ─────────────────────────────────────────────────────── */}
        <section className="relative">
          <div className="h-56 md:h-72 w-full overflow-hidden relative">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-container/30 via-surface-container to-secondary-container/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          {/* Profile row */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-12 lg:-mt-16 relative z-10">
            <motion.div
              className="flex flex-col sm:flex-row items-end gap-5"
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-32 w-32 rounded-full border-4 border-background overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{userInitial}</span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 h-4 w-4 bg-emerald-400 rounded-full border-[3px] border-background" />
              </div>

              {/* Name + actions */}
              <div className="flex-1 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h2 className="text-3xl font-extrabold font-headline text-primary tracking-tight">{userName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-purple-300/60 font-label">{username}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${planMeta.color} ${planMeta.bg}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{planMeta.icon}</span>
                        {plan}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-xl font-label text-sm transition-all hover:bg-red-500/20 disabled:opacity-50 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
              initial={prefersReduced ? false : 'hidden'}
              animate="visible"
            >
              {stats.map(s => <StatCard key={s.label} value={s.value} label={s.label} />)}
            </motion.div>
          </div>
        </section>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <section className="mt-10 sticky top-20 bg-background/80 backdrop-blur-md z-30 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-4 lg:gap-8 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 font-label font-medium text-sm transition-all ${
                  activeTab === tab ? 'text-primary font-bold' : 'text-purple-200/40 hover:text-on-surface'
                }`}
              >
                {tab}
                {activeTab === tab && !prefersReduced && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tab content ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Creations' && (
                <CreationsTab
                  images={images}
                  isLoading={isLoading}
                  onOpen={setSelectedImage}
                  onNavigate={router.push}
                />
              )}
              {activeTab === 'Collections' && (
                <CollectionsTab images={images} isLoading={isLoading} onOpen={setSelectedImage} />
              )}
              {activeTab === 'Likes' && <LikesTab />}
              {activeTab === 'About' && (
                <AboutTab session={session} subscription={subscription} images={images} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}
