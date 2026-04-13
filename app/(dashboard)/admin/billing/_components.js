'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Static data ──────────────────────────────────────────────────────────────

export const chartBars = [
  { height: '40%', color: 'bg-surface-container-high', hover: true },
  { height: '60%', color: 'bg-surface-container-high', hover: true },
  { height: '85%', color: 'bg-primary', hover: false },
  { height: '55%', color: 'bg-surface-container-high', hover: false },
  { height: '30%', color: 'bg-surface-container-high', hover: false },
  { height: '95%', color: 'bg-secondary', hover: false },
  { height: '45%', color: 'bg-surface-container-high', hover: false },
  { height: '65%', color: 'bg-surface-container-high', hover: false },
  { height: '75%', color: 'bg-primary', hover: false },
  { height: '25%', color: 'bg-surface-container-high', hover: false },
  { height: '50%', color: 'bg-surface-container-high', hover: false },
  { height: '80%', color: 'bg-primary', hover: false },
  { height: '40%', color: 'bg-surface-container-high', hover: false },
  { height: '60%', color: 'bg-surface-container-high', hover: false },
  { height: '70%', color: 'bg-primary', hover: false },
  { height: '55%', color: 'bg-surface-container-high', hover: false },
  { height: '85%', color: 'bg-secondary', hover: false },
  { height: '45%', color: 'bg-surface-container-high', hover: false },
  { height: '30%', color: 'bg-surface-container-high', hover: false },
  { height: '90%', color: 'bg-primary', hover: false },
];

export const transactions = [
  {
    date: 'Oct 20, 2023',
    icon: 'database',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    name: 'Credits Purchase',
    ref: 'Ref: #TXN-98231-A',
    amount: '$500.00',
    status: 'Paid',
    statusStyle: 'bg-secondary-container/10 text-secondary border-secondary/20',
  },
  {
    date: 'Oct 18, 2023',
    icon: 'star',
    iconBg: 'bg-secondary/20',
    iconColor: 'text-secondary',
    name: 'Monthly Subscription',
    ref: 'Enterprise Tier - 50 Seats',
    amount: '$2,499.00',
    status: 'Paid',
    statusStyle: 'bg-secondary-container/10 text-secondary border-secondary/20',
  },
  {
    date: 'Oct 15, 2023',
    icon: 'settings_input_component',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    name: 'Compute Overages',
    ref: 'Period: Oct 01 - Oct 15',
    amount: '$142.50',
    status: 'Pending',
    statusStyle: 'bg-outline/10 text-outline border-outline/20',
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────

export const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const bentoContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const bentoCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const chartContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

export const chartBarVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const tableContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const tableRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const refundSectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ─── CreditCounter sub-component ─────────────────────────────────────────────

export function CreditCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-7xl font-headline font-extrabold text-on-surface tracking-tighter">
      {count.toLocaleString()}
    </span>
  );
}

// ─── ChartSection sub-component ──────────────────────────────────────────────

export function ChartSection() {
  return (
    <motion.div
      className="col-span-12 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-[2rem] p-8"
      variants={bentoCardVariants}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-10">
        <div>
          <h3 className="text-xl font-headline font-bold text-on-surface">Consumption Trends</h3>
          <p className="text-on-surface-variant text-sm">Daily credit usage for the last 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Model Training</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Inference API</span>
          </div>
        </div>
      </div>
      <motion.div
        className="h-64 flex items-end justify-between gap-2 px-4 mb-4"
        variants={chartContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {chartBars.map((bar, i) => (
          <motion.div
            key={i}
            className={`flex-1 ${bar.color} rounded-t-xl group relative`}
            style={{ height: bar.height, transformOrigin: 'bottom', willChange: 'transform' }}
            variants={chartBarVariants}
          >
            {bar.hover && (
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-30 rounded-t-xl transition-opacity" />
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className="flex justify-between px-4 text-[10px] font-label text-on-surface-variant uppercase tracking-[0.2em]">
        <span>Sep 25</span>
        <span>Oct 05</span>
        <span>Oct 15</span>
        <span>Today</span>
      </div>
    </motion.div>
  );
}

// ─── LedgerTable sub-component ───────────────────────────────────────────────

export function LedgerTable() {
  return (
    <motion.div
      className="col-span-12 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-[2rem] overflow-hidden"
      variants={bentoCardVariants}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-xl font-headline font-bold text-on-surface">Financial Ledger</h3>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
          </button>
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-white/5">
              <th className="px-8 py-5 font-bold">Date</th>
              <th className="px-8 py-5 font-bold">Description</th>
              <th className="px-8 py-5 font-bold text-right">Amount</th>
              <th className="px-8 py-5 font-bold text-center">Status</th>
              <th className="px-8 py-5 font-bold" />
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-white/5"
            variants={tableContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {transactions.map((tx, i) => (
              <motion.tr
                key={i}
                className="hover:bg-white/[0.02] transition-colors group"
                variants={tableRowVariants}
              >
                <td className="px-8 py-6 text-sm text-on-surface">{tx.date}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded ${tx.iconBg} flex items-center justify-center ${tx.iconColor}`}>
                      <span className="material-symbols-outlined text-sm">{tx.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{tx.name}</p>
                      <p className="text-xs text-on-surface-variant">{tx.ref}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right font-label font-bold text-on-surface">{tx.amount}</td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full ${tx.statusStyle} text-[10px] font-bold uppercase tracking-widest border`}>
                      {tx.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
      <div className="p-6 text-center">
        <button className="text-primary font-label text-sm font-bold hover:gap-4 transition-all flex items-center justify-center gap-2 mx-auto">
          View Complete Transaction History{' '}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
