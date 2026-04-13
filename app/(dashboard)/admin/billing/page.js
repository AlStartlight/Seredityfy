'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCounter,
  ChartSection,
  LedgerTable,
  headerVariants,
  bentoContainerVariants,
  bentoCardVariants,
  refundSectionVariants,
} from './_components';
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const [activeView, setActiveView] = useState('realtime');
 const router = useRouter(); 
  return (
    <main className="p-8 lg:p-12 max-w-[1600px]">
      {/* Header Section */}
      <motion.header
        className="mb-12 flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">
            Usage{' '}
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              &amp;
            </span>{' '}
            Billing
          </h1>
          <p className="text-on-surface-variant font-body max-w-md">
            Manage your Enterprise compute resources, monitor consumption
            patterns, and handle financial operations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container/40 backdrop-blur-2xl border border-primary/10 p-1 rounded-full flex gap-1">
            <button
              onClick={() => setActiveView('realtime')}
              className={`px-6 py-2 rounded-full font-label font-medium text-sm transition-colors ${
                activeView === 'realtime'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={`px-6 py-2 rounded-full font-label font-medium text-sm transition-colors ${
                activeView === 'monthly'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Monthly View
            </button>
          </div>
        </div>
      </motion.header>

      {/* Bento Grid Layout */}
      <motion.div
        className="grid grid-cols-12 gap-6"
        variants={bentoContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Credit Balance Card */}
        <motion.div
          className="col-span-12 lg:col-span-5 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group"
          variants={bentoCardVariants}
          style={{ willChange: 'transform' }}
        >
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Available Credits
              </span>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-2">
              <CreditCounter target={842500} />
              <span className="text-2xl font-label font-medium text-on-surface-variant">CR</span>
            </div>
            <p className="text-on-surface-variant mt-4 font-body text-sm">
              Equivalent to ~140.5 hours of high-performance GPU compute.
            </p>
          </div>
          <div className="mt-12 flex gap-4 relative z-10">
            <button onClick={() =>router.push("/admin/billing/credits")} className="flex-1 py-4 bg-primary rounded-2xl text-on-primary font-label font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(213,186,255,0.3)] transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
              Top Up Credits
            </button>
            <button className="p-4 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-2xl text-primary hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div
          className="col-span-12 lg:col-span-7 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group"
          variants={bentoCardVariants}
          style={{ willChange: 'transform' }}
        >
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary/20 text-secondary text-xs font-label font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Active Now
              </div>
              <h3 className="text-3xl font-headline font-bold text-on-surface">Enterprise Tier</h3>
              <p className="text-on-surface-variant mt-1 font-body">Full access to Aether-3 Ultra models</p>
            </div>
            <button className="text-primary font-label font-bold flex items-center gap-1 hover:underline">
              Change Plan{' '}
              <span className="material-symbols-outlined text-sm">north_east</span>
            </button>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-8 pt-8 relative z-10">
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold font-headline text-on-surface">$2,499.00</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Next Billing</p>
              <p className="text-2xl font-bold font-headline text-on-surface">Oct 24, 2023</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Seat Usage</p>
              <p className="text-2xl font-bold font-headline text-on-surface">42 / 50</p>
            </div>
          </div>
        </motion.div>

        {/* Consumption Trends Chart */}
        <ChartSection />

        {/* Financial Ledger Table */}
        <LedgerTable />
      </motion.div>

      {/* Refund Policy Section */}
      <motion.section
        className="mt-12 bg-surface-container/40 backdrop-blur-2xl border border-primary/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
        variants={refundSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">policy</span>
            </div>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Refund Policy</h2>
          </div>
          <div className="space-y-6 text-on-surface-variant font-body leading-relaxed max-w-4xl">
            <p>
              At Aether AI, we strive to provide the most efficient compute resources for your AI operations.
              Refunds for subscription plans are generally available within 14 days of the initial purchase or
              renewal date, provided that less than 5% of the allocated monthly credits have been consumed.
            </p>
            <p>
              Individual credit top-ups are non-refundable once any portion of the purchased credits has been
              utilized for inference, training, or other compute-intensive tasks. In cases of system downtime
              exceeding our SLA commitments, compensatory credits will be automatically issued to affected accounts.
            </p>
            <p>
              Enterprise Tier customers with custom invoicing agreements should refer to their specific Master
              Service Agreement (MSA) for tailored refund and cancellation terms. All refund requests must be
              submitted through the &apos;Support&apos; portal or by contacting your dedicated account manager.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Footer / Support Section */}
      <footer className="mt-20 border-t border-white/5 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div>
          <p className="text-on-surface font-headline font-bold mb-4">Aether AI Billing Support</p>
          <p className="text-on-surface-variant text-sm font-body">
            Our dedicated financial team is available 24/7 for Enterprise Tier customers.
            Reach out for custom invoicing or volume discounts.
          </p>
        </div>
        <div className="lg:col-span-2 flex justify-end gap-12">
          <div className="text-right">
            <p className="text-[10px] uppercase font-label tracking-widest text-primary mb-4">Resources</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Pricing API Documentation</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Tax &amp; Compliance Records</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Regional Data Policies</a></li>
            </ul>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-label tracking-widest text-primary mb-4">Action</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Add Payment Method</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Request Audit Log</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact Manager</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
