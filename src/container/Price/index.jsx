'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const WEEKLY = {
  FREE:       { price: '$0',   period: '/week' },
  STARTER:    { price: '$40',  period: '/week' },
  PRO:        { price: '$60',  period: '/week' },
  ENTERPRISE: { price: '$400', period: '/week' },
};

const MONTHLY = {
  FREE:       { price: '$0',   period: '/month' },
  STARTER:    { price: '$160', period: '/month' },
  PRO:        { price: '$240', period: '/month' },
  ENTERPRISE: { price: '$1600', period: '/month' },
};

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    creditsWeekly: 40,
    creditsMonthly: 160,
    description: 'Perfect for trying out the platform',
    accent: 'from-gray-400 to-gray-500',
    ring: 'hover:ring-gray-400/40',
    badge: null,
    features: [
      { label: '40 credits/week · 160 credits/month', ok: true },
      { label: 'Standard resolution (720p)', ok: true },
      { label: 'Community gallery access', ok: true },
      { label: 'Basic models', ok: true },
      { label: 'No watermarks', ok: false },
      { label: 'Commercial license', ok: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'bg-white/10 hover:bg-white/20 text-white',
    href: '/register',
  },
  {
    id: 'STARTER',
    name: 'Starter',
    creditsWeekly: 200,
    creditsMonthly: 800,
    description: 'For casual creators',
    accent: 'from-emerald-400 to-green-500',
    ring: 'hover:ring-emerald-400/40',
    badge: null,
    features: [
      { label: '200 credits/week · 800 credits/month', ok: true },
      { label: 'HD resolution (1024p)', ok: true },
      { label: 'Share to community', ok: true },
      { label: 'No watermarks', ok: true },
      { label: 'All basic models', ok: true },
      { label: 'Commercial license', ok: false },
    ],
    cta: 'Get Starter',
    ctaStyle: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    href: '/register',
  },
  {
    id: 'PRO',
    name: 'Pro',
    creditsWeekly: 500,
    creditsMonthly: 2000,
    description: 'For serious artists',
    accent: 'from-violet-500 to-fuchsia-500',
    ring: 'ring-2 ring-violet-500/60',
    badge: 'Most Popular',
    features: [
      { label: '500 credits/week · 2000 credits/month', ok: true },
      { label: 'Full HD resolution (1280p)', ok: true },
      { label: 'Batch generation', ok: true },
      { label: 'Priority support', ok: true },
      { label: 'Commercial license', ok: true },
      { label: 'Advanced models', ok: true },
    ],
    cta: 'Go Pro',
    ctaStyle: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 text-white shadow-lg shadow-violet-500/30',
    href: '/register',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    creditsWeekly: 'Unlimited',
    creditsMonthly: 'Unlimited',
    description: 'For teams & businesses',
    accent: 'from-purple-500 to-pink-500',
    ring: 'hover:ring-purple-400/40',
    badge: null,
    features: [
      { label: 'Unlimited credits', ok: true },
      { label: 'Full HD resolution (1280p)', ok: true },
      { label: 'Dedicated support', ok: true },
      { label: 'Multi-user access', ok: true },
      { label: 'Custom integrations', ok: true },
      { label: 'API access', ok: true },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    href: '/contact',
  },
];

function CheckIcon({ ok }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 ${ok ? 'text-emerald-400' : 'text-white/20'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      {ok ? (
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      ) : (
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      )}
    </svg>
  );
}

export const PriceApp = () => {
  const [billingCycle, setBillingCycle] = useState('weekly');

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <span className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-bold uppercase tracking-widest bg-violet-500/15 text-violet-300 border border-violet-500/20">
          Pricing
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
          Simple,{' '}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            transparent
          </span>{' '}
          pricing
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          Start free and scale as you create. Every plan includes access to
          the community gallery and our AI generation engine.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('weekly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingCycle === 'weekly'
                ? 'bg-violet-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-violet-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 ${plan.ring}`}
          >
            {/* Top accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${plan.accent}`} />

            {/* Badge */}
            {plan.badge && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-violet-500/30">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="flex flex-col flex-1 p-6">
              {/* Plan name & description */}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">
                  {(billingCycle === 'monthly' ? MONTHLY : WEEKLY)[plan.id].price}
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  {(billingCycle === 'monthly' ? MONTHLY : WEEKLY)[plan.id].period}
                </span>
              </div>

              {/* Credits callout */}
              <div className={`mb-6 px-4 py-2 rounded-xl bg-gradient-to-r ${plan.accent} bg-opacity-10`}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Credits</span>
                  <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                </div>
                <p className="text-lg font-extrabold text-white">{billingCycle === 'monthly' ? plan.creditsMonthly : plan.creditsWeekly}<span className="text-sm font-normal text-gray-400"> {billingCycle === 'monthly' ? '/ month' : '/ week'}</span></p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-label uppercase tracking-wider">Auto-renews {billingCycle === 'monthly' ? 'monthly' : 'weekly'}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckIcon ok={f.ok} />
                    <span className={`text-sm ${f.ok ? 'text-gray-300' : 'text-gray-600'}`}>{f.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.href}>
                <button
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center text-gray-500 text-sm mt-12">
        All plans include a{' '}
        <span className="text-gray-300 font-medium">7-day free trial</span>. No credit card required to start.
      </p>
    </section>
  );
};
