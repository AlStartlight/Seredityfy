'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 180, damping: 20, duration: 0.5 },
  },
};

const paragraphContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const keyTermsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const keyTermVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const KEY_TERMS = [
  { icon: 'calendar_today', label: '14-Day Window', sub: 'For subscription plans' },
  { icon: 'account_balance_wallet', label: '5% Threshold', sub: 'Credits consumed limit' },
  { icon: 'support_agent', label: 'MSA Terms', sub: 'Enterprise accounts' },
];

export default function RefundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        className="bg-[#2c1245]/40 backdrop-blur-[32px] max-w-2xl w-full rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-outline-variant/10"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        style={{ willChange: 'transform' }}
      >
        {/* Decorative glow inside card */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">policy</span>
            </div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Refund Policy</h1>
          </div>

          {/* Policy content */}
          <motion.div
            className="space-y-6 text-on-surface-variant font-body leading-relaxed"
            variants={paragraphContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={paragraphVariants}>
              At Aether AI, we strive to provide the most efficient compute resources for your AI operations.
              Refunds for subscription plans are generally available within 14 days of the initial purchase or
              renewal date, provided that less than 5% of the allocated monthly credits have been consumed.
            </motion.p>
            <motion.p variants={paragraphVariants}>
              Individual credit top-ups are non-refundable once any portion of the purchased credits has been
              utilized for inference, training, or other compute-intensive tasks. In cases of system downtime
              exceeding our SLA commitments, compensatory credits will be automatically issued to affected accounts.
            </motion.p>
            <motion.p variants={paragraphVariants}>
              Enterprise Tier customers with custom invoicing agreements should refer to their specific Master
              Service Agreement (MSA) for tailored refund and cancellation terms. All refund requests must be
              submitted through the &apos;Support&apos; portal or by contacting your dedicated account manager.
            </motion.p>
          </motion.div>

          {/* Key terms */}
          <motion.div
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={keyTermsContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {KEY_TERMS.map((item) => (
              <motion.div
                key={item.label}
                className="bg-surface-container-high/50 rounded-xl p-4 flex flex-col items-center text-center gap-2"
                variants={keyTermVariants}
              >
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                <p className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">{item.label}</p>
                <p className="text-[10px] text-on-surface-variant">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
            <Link href="/admin/billing">
              <button className="px-6 py-3 bg-surface-container-highest hover:bg-surface-bright transition-colors rounded-xl font-label text-sm font-bold text-on-surface">
                Back to Billing
              </button>
            </Link>
            <motion.button
              className="px-8 py-4 bg-primary rounded-2xl text-on-primary font-label font-bold hover:shadow-[0_0_30px_rgba(213,186,255,0.3)] transition-all active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              Close Policy
            </motion.button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
