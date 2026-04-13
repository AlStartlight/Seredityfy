'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Confetti sparkle positions — 5 absolutely-positioned circles
const SPARKLES = [
  { left: '10%', color: 'rgba(213,186,255,0.8)', size: 8, delay: 0 },
  { left: '25%', color: 'rgba(255,171,243,0.8)', size: 6, delay: 0.2 },
  { left: '50%', color: 'rgba(213,186,255,0.6)', size: 10, delay: 0.1 },
  { left: '70%', color: 'rgba(255,171,243,0.7)', size: 7, delay: 0.3 },
  { left: '88%', color: 'rgba(213,186,255,0.9)', size: 5, delay: 0.15 },
];

// Variants
const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },
};

const glowPulseVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(255,171,243,0.2)',
      '0 0 60px rgba(255,171,243,0.5)',
      '0 0 20px rgba(255,171,243,0.2)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const headingContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const summaryCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.4 },
  },
};

const actionButtonsVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
};

const actionButtonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function SuccessPage() {
  return (
    <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[30%] bg-[radial-gradient(circle_at_50%_50%,rgba(213,186,255,0.1)_0%,rgba(31,4,56,0)_70%)]" />
      </div>

      {/* Floating sparkle confetti */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {SPARKLES.map((s, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: s.left,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
            }}
            animate={{
              y: [0, -300, -600],
              opacity: [0, 1, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full scale-150" />
          <motion.div
            className="relative w-32 h-32 flex items-center justify-center rounded-full bg-surface-container-high border border-white/10"
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            {...glowPulseVariants}
            style={{ willChange: 'transform' }}
          >
            <span
              className="material-symbols-outlined text-7xl text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </motion.div>
        </div>

        {/* Header */}
        <motion.div
          className="space-y-4 mb-12"
          variants={headingContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface"
            variants={fadeUpVariants}
          >
            Payment Successful
          </motion.h1>
          <motion.p
            className="text-on-surface-variant text-lg font-body max-w-md mx-auto"
            variants={fadeUpVariants}
          >
            Your account has been topped up. The creative void awaits your next prompt.
          </motion.p>
        </motion.div>

        {/* Transaction summary */}
        <motion.div
          className="w-full bg-[#2c1245]/70 backdrop-blur-[32px] rounded-xl p-8 mb-10 shadow-[0_40px_40px_-5px_rgba(213,186,255,0.06)] border border-white/5"
          variants={summaryCardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col gap-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">Order ID</span>
              <span className="font-label font-bold text-primary tracking-tight">#NOC-8829-XP</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">Amount Paid</span>
              <span className="font-headline font-bold text-on-surface text-xl">$49.00</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">Credits Added</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="font-headline font-bold text-secondary text-xl">2,500 CR</span>
              </div>
            </div>
          </div>

          {/* New balance row */}
          <div className="mt-8 pt-8 bg-surface-container-highest/30 -mx-8 px-8 rounded-b-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <p className="font-label text-xs text-on-surface-variant/60 leading-none mb-1">NEW TOTAL BALANCE</p>
                  <p className="font-headline font-bold text-on-surface">14,250 Credits</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          variants={actionButtonsVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={actionButtonVariants}>
            <Link href="/admin/generate">
              <button className="px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-label font-bold text-lg hover:shadow-[0_0_30px_rgba(213,186,255,0.4)] active:scale-95 transition-all duration-300">
                Start Creating
              </button>
            </Link>
          </motion.div>
          <motion.button
            className="px-10 py-4 bg-surface-container-high text-on-surface rounded-xl font-label font-medium text-lg hover:bg-surface-container-highest active:scale-95 transition-all duration-300"
            variants={actionButtonVariants}
          >
            View Invoice
          </motion.button>
        </motion.div>

        {/* Return link */}
        <div className="mt-12">
          <Link
            href="/admin/billing"
            className="font-label text-sm text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Billing
          </Link>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50 pointer-events-none" />
    </main>
  );
}
