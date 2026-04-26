'use client';

import { useState, useEffect } from 'react';
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

const CREDIT_PLANS = [
  { id: 'FREE',       name: 'Free',       credits: 40,          priceWeekly: '$0',    priceMonthly: '$0'      },
  { id: 'STARTER',    name: 'Starter',    credits: 200,         priceWeekly: '$40',   priceMonthly: '$160'    },
  { id: 'PRO',        name: 'Pro',        credits: 500,         priceWeekly: '$60',   priceMonthly: '$240'    },
  { id: 'ENTERPRISE', name: 'Enterprise', credits: 'Unlimited', priceWeekly: '$400',  priceMonthly: '$1,600'  },
];

export default function BillingPage() {
  const [activeView, setActiveView] = useState('realtime');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch('/api/subscriptions?current=true');
        const data = await res.json();
        setSubscription(data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, []);

  const currentPlan = CREDIT_PLANS.find(p => p.id === (subscription?.plan || 'FREE')) || CREDIT_PLANS[0];
  const availableCredits = subscription?.availableCredits || currentPlan.credits;
  const usedCredits = subscription?.usedCredits || 0;
  return (
    <main className="p-4 sm:p-6 lg:p-12 max-w-[1600px]">
      {/* Header Section */}
      <motion.header
        className="mb-8 lg:mb-12 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-on-surface">
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
                {loading ? 'Loading...' : 'Available Credits'}
              </span>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <span className="text-7xl font-headline font-extrabold text-on-surface">---</span>
              ) : (
                <>
                  <CreditCounter target={availableCredits === Infinity ? 999999 : availableCredits} />
                  <span className="text-2xl font-label font-medium text-on-surface-variant">CR</span>
                </>
              )}
            </div>
            <p className="text-on-surface-variant mt-4 font-body text-sm">
              {loading ? '...' : `Used: ${usedCredits} credits this billing period`}
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
                Active Plan
              </div>
              <h3 className="text-3xl font-headline font-bold text-on-surface">
                {loading ? 'Loading...' : currentPlan.name} Tier
              </h3>
              <p className="text-on-surface-variant mt-1 font-body">
                {loading ? '...' : `${currentPlan.credits === 'Unlimited' ? 'Unlimited' : currentPlan.credits} credits/week · ${currentPlan.priceWeekly}/week`}
              </p>
            </div>
            <button onClick={() => router.push('/admin/billing/credits')} className="text-primary font-label font-bold flex items-center gap-1 hover:underline">
              Change Plan{' '}
              <span className="material-symbols-outlined text-sm">north_east</span>
            </button>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-4 lg:gap-8 pt-6 lg:pt-8 relative z-10">
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Weekly Cost</p>
              <p className="text-2xl font-bold font-headline text-on-surface">
                {loading ? '---' : currentPlan.priceWeekly}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 font-label mt-0.5">
                {loading ? '' : `${currentPlan.priceMonthly} /month`}
              </p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Credits</p>
              <p className="text-2xl font-bold font-headline text-on-surface">
                {loading ? '---' : `${usedCredits} / ${availableCredits === Infinity ? '∞' : availableCredits}`}
              </p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase font-label tracking-widest mb-1">Status</p>
              <p className="text-2xl font-bold font-headline text-on-surface">Active</p>
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
      <footer className="mt-12 lg:mt-20 border-t border-white/5 pt-8 lg:pt-12 pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div>
          <p className="text-on-surface font-headline font-bold mb-4">Aether AI Billing Support</p>
          <p className="text-on-surface-variant text-sm font-body">
            Our dedicated financial team is available 24/7 for Enterprise Tier customers.
            Reach out for custom invoicing or volume discounts.
          </p>
        </div>
        <div className="lg:col-span-2 flex flex-col sm:flex-row sm:justify-end gap-8 lg:gap-12">
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
