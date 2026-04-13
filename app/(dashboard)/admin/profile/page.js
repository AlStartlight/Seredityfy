'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const TABS = ['Creations', 'Collections', 'Likes', 'About'];

const IMAGE_CARDS = [
  {
    id: 1,
    span: 'md:col-span-2 md:row-span-2',
    aspect: 'aspect-[4/5]',
    gradient: 'from-primary-container/40 via-surface-container to-secondary-container/20',
    label: 'The Ethereal Pulse',
    badge: 'Featured Art',
    sub: 'Model: seredityfy-v3-Turbo',
    featured: true,
  },
  {
    id: 2,
    span: '',
    aspect: 'aspect-[4/5]',
    gradient: 'from-secondary-container/30 via-surface-container-high to-surface-container',
    label: 'Neon Circuit',
    icon: 'bolt',
  },
  {
    id: 3,
    span: '',
    aspect: 'aspect-square',
    gradient: 'from-surface-container-highest via-surface-container to-surface-container-low',
    label: 'Void Matter',
  },
  {
    id: 4,
    span: '',
    aspect: 'aspect-square',
    gradient: 'from-tertiary-container/30 via-surface-container-high to-surface-container',
    label: 'Static Dream',
  },
  {
    id: 5,
    span: '',
    aspect: 'aspect-[4/5]',
    gradient: 'from-primary-container/20 via-surface-container to-secondary-container/30',
    label: 'Digital Horizon',
  },
  {
    id: 6,
    span: '',
    aspect: 'aspect-square',
    gradient: 'from-surface-container-high via-tertiary-container/20 to-surface-container-highest',
    label: 'Bio Core',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const imageCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

function StatCard({ value, label }) {
  return (
    <motion.div variants={itemVariants} className="bg-[#2c1245]/40 backdrop-blur-[24px] rounded-2xl p-4 text-center">
      <div className="text-2xl font-bold font-headline text-primary">{value}</div>
      <div className="text-xs font-label text-purple-300/50 uppercase tracking-tighter mt-1">{label}</div>
    </motion.div>
  );
}

function ImageCard({ card }) {
  if (card.featured) {
    return (
      <motion.div
        variants={imageCardVariants}
        className={`${card.span} ${card.aspect} group relative rounded-3xl overflow-hidden bg-[#2c1245]/40 backdrop-blur-[24px] transition-all duration-500 hover:scale-[1.01]`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-xs font-label mb-2 backdrop-blur-md border border-secondary/20">
                {card.badge}
              </span>
              <h3 className="text-2xl font-bold font-headline text-on-surface">{card.label}</h3>
              <p className="text-purple-200/60 font-body text-sm">{card.sub}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
              <button className="p-3 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-white">download</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={imageCardVariants}
      className={`${card.span} ${card.aspect} group relative rounded-3xl overflow-hidden bg-[#2c1245]/40 backdrop-blur-[24px] transition-all duration-500 hover:scale-[1.01]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-60" />
      <div className="absolute bottom-4 left-6 flex items-center gap-2">
        {card.icon && <span className="material-symbols-outlined text-primary text-sm">{card.icon}</span>}
        <span className="text-xs font-label font-bold text-white uppercase tracking-widest">{card.label}</span>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Creations');
  const prefersReduced = useReducedMotion();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const username = userEmail ? `@${userEmail.split('@')[0]}` : '@user';

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-40 w-40 rounded-full bg-surface-container-high" />
          <div className="h-8 w-48 bg-surface-container-high rounded" />
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Profile Hero */}
      <section className="relative">
        {/* Cover image placeholder */}
        <motion.div
          className="h-64 md:h-80 w-full bg-gradient-to-br from-primary-container/30 via-surface-container to-secondary-container/20 overflow-hidden"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="absolute top-0 inset-x-0 h-64 md:h-80 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Profile info overlay */}
        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-10">
          <motion.div
            className="flex flex-col md:flex-row items-end gap-6"
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="h-40 w-40 rounded-full border-4 border-background bg-surface-container-high overflow-hidden shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">{userInitial}</span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 h-6 w-6 bg-secondary rounded-full border-4 border-background" />
            </div>

            {/* Name & Actions */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-extrabold font-headline text-primary tracking-tight">{userName}</h2>
                  <p className="text-purple-300/70 font-label flex items-center gap-2 mt-1">
                    {username}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container text-white">
                      Elite Alchemist
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl font-label transition-transform active:scale-95 hover:opacity-90">
                    Follow
                  </button>
                  <button className="p-2.5 bg-surface-container-high rounded-xl text-primary hover:bg-surface-container-highest transition-all">
                    <span className="material-symbols-outlined">mail</span>
                  </button>
                  <button className="p-2.5 bg-surface-container-high rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-6 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl font-label transition-all hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio & Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="md:col-span-2 space-y-4"
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
            >
              <p className="text-xl font-body text-on-surface leading-relaxed max-w-2xl">
                Crafting digital dreams at the intersection of light and code. 🌌
              </p>
              <div className="flex flex-wrap items-center gap-6 font-label text-sm text-purple-300/60">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">mail</span>
                  {userEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  Joined March 2024
                </span>
                <div className="flex items-center gap-4 ml-2">
                  <a href="#" className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">public</span></a>
                  <a href="#" className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">chat</span></a>
                  <a href="#" className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">share</span></a>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="flex md:justify-end">
              <motion.div
                className="grid grid-cols-2 gap-4 w-full max-w-xs"
                variants={prefersReduced ? undefined : containerVariants}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
              >
                <StatCard value="1.4k" label="Creations" />
                <StatCard value="2.8k" label="Followers" />
                <StatCard value="512" label="Following" />
                <StatCard value="8.9k" label="Remixes" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-12 sticky top-20 bg-background/80 backdrop-blur-md z-30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-8 relative">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-4 font-label font-medium transition-all ${
                activeTab === tab
                  ? 'text-primary font-bold'
                  : 'text-purple-200/50 hover:text-on-surface'
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

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-8 py-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={prefersReduced ? undefined : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
        >
          {IMAGE_CARDS.map((card) => (
            <ImageCard key={card.id} card={card} />
          ))}
        </motion.div>

        {/* Load More */}
        <div className="mt-16 flex justify-center">
          <button className="group flex items-center gap-3 px-8 py-4 bg-[#2c1245]/40 backdrop-blur-[24px] border border-white/5 rounded-2xl font-label text-primary hover:border-primary/50 transition-all duration-300">
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">sync</span>
            Explore More Creations
          </button>
        </div>
      </section>
    </main>
  );
}
