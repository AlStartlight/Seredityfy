'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: '500',
    price: '$29',
    featured: false,
    features: [
      { label: 'Standard GPU Priority', included: true },
      { label: '4K Image Exports', included: true },
      { label: 'Batch Processing', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: '2,500',
    price: '$99',
    featured: true,
    badge: 'Most Popular',
    features: [
      { label: 'Ultra-High GPU Priority', included: true, icon: 'bolt' },
      { label: '8K Video Rendering', included: true },
      { label: 'Full Commercial License', included: true },
      { label: 'Priority Support', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: '10,000',
    price: '$299',
    featured: false,
    features: [
      { label: 'Dedicated Compute Node', included: true },
      { label: 'Multi-user Collaboration', included: true },
      { label: 'Custom Model Training', included: true },
    ],
  },
];

// Variants
const progressVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const headingContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const headingLineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const proCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1.05,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const customTopUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function FeatureItem({ feature, featured }) {
  if (!feature.included) {
    return (
      <li className="flex items-center gap-3 text-on-surface-variant/50 font-body text-sm">
        <span className="material-symbols-outlined text-outline text-lg">cancel</span>
        {feature.label}
      </li>
    );
  }
  return (
    <li className={`flex items-center gap-3 font-body text-sm ${featured ? 'text-on-surface' : 'text-on-surface-variant'}`}>
      <span className={`material-symbols-outlined text-lg ${featured ? 'text-secondary' : 'text-primary'}`}>
        {feature.icon || 'check_circle'}
      </span>
      {feature.label}
    </li>
  );
}

export default function CreditsPage() {
  const [selected, setSelected] = useState('pro');
  const [customAmount, setCustomAmount] = useState('');
  return (
    <main className="pt-24 pb-12 min-h-screen relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        {/* Progress indicator */}
        <motion.div
          className="flex flex-col items-center mb-16"
          variants={progressVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary font-bold font-label shadow-[0_0_20px_rgba(213,186,255,0.4)]">1</div>
            <div className="h-1 w-24 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/2" />
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-outline font-bold font-label">2</div>
          </div>

          <motion.div
            className="flex flex-col items-center"
            variants={headingContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="font-label text-sm tracking-widest uppercase text-primary font-bold"
              variants={headingLineVariants}
            >
              Step 1: Select Credit Package
            </motion.p>
            <motion.h1
              className="text-4xl lg:text-6xl font-headline font-extrabold tracking-tighter text-on-surface mt-4 text-center"
              variants={headingLineVariants}
            >
              Power your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">creative engine</span>
            </motion.h1>
          </motion.div>
        </motion.div>

        {/* Pricing grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end"
          variants={cardGridVariants}
          initial="hidden"
          animate="visible"
        >
          {PACKAGES.map((pkg) =>
            pkg.featured ? (
              <motion.div
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className="group relative p-px rounded-xl bg-gradient-to-b from-primary via-secondary to-primary-container shadow-[0_0_60px_-15px_rgba(213,186,255,0.3)] z-20 cursor-pointer"
                variants={proCardVariants}
                whileTap={{ scale: 1.02 }}
                style={{ willChange: 'transform' }}
              >
                {/* Shimmer glow pulse on Pro card */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 20px -5px rgba(213,186,255,0.2)',
                      '0 0 50px -5px rgba(213,186,255,0.5)',
                      '0 0 20px -5px rgba(213,186,255,0.2)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="bg-surface-container backdrop-blur-3xl rounded-xl p-8 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                  <div className="mb-8">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-[10px] font-bold tracking-widest uppercase mb-4">
                      {pkg.badge}
                    </div>
                    <h3 className="font-label text-purple-200 uppercase tracking-[0.2em] text-xs font-bold mb-1">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-headline font-extrabold text-white">{pkg.credits}</span>
                      <span className="text-primary text-sm font-label uppercase tracking-widest">Credits</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {pkg.features.map((f) => <FeatureItem key={f.label} feature={f} featured />)}
                  </ul>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-purple-300 font-label text-sm">Price</span>
                      <span className="text-3xl font-headline font-bold text-white">{pkg.price}</span>
                    </div>
                    <Link href="/admin/billing/payment">
                      <button  className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold tracking-widest uppercase text-sm shadow-[0_10px_30px_-5px_rgba(128,0,255,0.5)] hover:brightness-110 active:scale-95 transition-all">
                        Select Pro
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className={`group relative p-px rounded-xl transition-all duration-500 cursor-pointer ${
                  selected === pkg.id
                    ? 'bg-gradient-to-b from-primary/40 to-transparent'
                    : 'bg-gradient-to-b from-white/10 to-transparent hover:from-primary/20'
                }`}
                variants={cardVariants}
                whileTap={{ scale: 0.97 }}
                style={{ willChange: 'transform' }}
              >
                <div className="bg-surface-container-low backdrop-blur-xl rounded-xl p-8 h-full flex flex-col">
                  <div className="mb-8">
                    <h3 className="font-label text-purple-300 uppercase tracking-[0.2em] text-xs font-bold mb-1">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-headline font-extrabold text-on-surface">{pkg.credits}</span>
                      <span className="text-outline text-sm font-label uppercase tracking-widest">Credits</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {pkg.features.map((f) => <FeatureItem key={f.label} feature={f} featured={false} />)}
                  </ul>
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-outline font-label text-sm">Price</span>
                      <span className="text-2xl font-headline font-bold text-on-surface">{pkg.price}</span>
                    </div>
                    <Link href="/admin/billing/payment">
                      <button  className="w-full py-4 rounded-lg font-label font-bold tracking-widest uppercase text-sm border border-outline-variant hover:bg-surface-container-highest transition-colors active:scale-95">
                        Select
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </motion.div>

        {/* Custom top-up */}
        <motion.div
          className="mt-16 bg-surface-container-lowest/40 backdrop-blur-md rounded-2xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
          variants={customTopUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div>
            <h4 className="font-headline font-bold text-xl text-on-surface">Need a custom amount?</h4>
            <p className="text-on-surface-variant font-body mt-1">Scale your production with a custom credit allocation tailored for high-volume workflows.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-surface-container-high rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-outline">edit</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-transparent border-none focus:ring-0 font-label text-on-surface w-28 p-0"
              />
            </div>
            <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-on-surface rounded-xl font-label font-bold transition-all">
              Quote
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
