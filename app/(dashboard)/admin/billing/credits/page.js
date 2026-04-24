'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CREDIT_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    creditsWeekly: 40,
    creditsMonthly: 160,
    description: 'Perfect for trying out the platform',
    features: [
      { label: '40 credits/week · 160 credits/month', included: true },
      { label: 'Standard resolution (720p)', included: true },
      { label: 'Community gallery access', included: true },
      { label: 'Basic models', included: true },
    ],
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'STARTER',
    name: 'Starter',
    creditsWeekly: 200,
    creditsMonthly: 800,
    description: 'For casual creators',
    features: [
      { label: '200 credits/week · 800 credits/month', included: true },
      { label: 'HD resolution (1024p)', included: true },
      { label: 'Share to community', included: true },
      { label: 'No watermarks', included: true },
      { label: 'All basic models', included: true },
    ],
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'PRO',
    name: 'Pro',
    creditsWeekly: 500,
    creditsMonthly: 2000,
    description: 'For serious artists',
    badge: 'Most Popular',
    features: [
      { label: '500 credits/week · 2000 credits/month', included: true },
      { label: 'Full HD (1280p)', included: true },
      { label: 'Batch generation', included: true },
      { label: 'Priority support', included: true },
      { label: 'Commercial license', included: true },
      { label: 'Advanced models', included: true },
    ],
    color: 'from-primary to-secondary',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    creditsWeekly: 'Unlimited',
    creditsMonthly: 'Unlimited',
    description: 'For teams & business',
    features: [
      { label: 'Unlimited credits', included: true },
      { label: 'Full HD (1280p)', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Multi-user access', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'API access', included: true },
    ],
    color: 'from-purple-500 to-pink-600',
  },
];

const WEEKLY = {
  FREE:       '$0',
  STARTER:    '$40',
  PRO:        '$60',
  ENTERPRISE: '$400',
};

const MONTHLY = {
  FREE:       '$0',
  STARTER:    '$160',
  PRO:        '$240',
  ENTERPRISE: '$1,600',
};

const CREDIT_PACKAGES = [
  {
    id: 'credits_500',
    name: 'Starter',
    credits: 500,
    price: '$29',
    features: ['500 one-time credits', 'Standard GPU'],
    featured: false,
  },
  {
    id: 'credits_2500',
    name: 'Pro',
    credits: 2500,
    price: '$99',
    features: ['2500 one-time credits', 'High priority GPU'],
    featured: true,
  },
  {
    id: 'credits_10000',
    name: 'Enterprise',
    credits: 10000,
    price: '$299',
    features: ['10000 one-time credits', 'Dedicated node'],
    featured: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function PlanCard({ plan, selected, onSelect, billingCycle }) {
  const isSelected = selected === plan.id;
  const gradient = `bg-gradient-to-r ${plan.color}`;
  const price = billingCycle === 'monthly' ? MONTHLY[plan.id] : WEEKLY[plan.id];
  const period = billingCycle === 'monthly' ? '/month' : '/week';
  
  return (
    <motion.div
      variants={cardVariants}
      className={`relative rounded-2xl overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {plan.badge && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
            {plan.badge}
          </span>
        </div>
      )}
      <div className="bg-surface-container-low p-6">
        <div className={`w-full h-1 ${gradient} mb-4 rounded-full`} />
        <h3 className="text-xl font-headline font-bold text-on-surface mb-1">{plan.name}</h3>
        <p className="text-sm text-on-surface-variant mb-4">{plan.description}</p>
        
        <div className="mb-2">
          <span className="text-3xl font-headline font-bold text-on-surface">{price}</span>
          <span className="text-sm text-on-surface-variant">{period}</span>
        </div>

        <div className="mb-5 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-label uppercase tracking-wider">Credits</span>
            <span className="material-symbols-outlined text-[14px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>autorenew</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-on-surface">
              {billingCycle === 'monthly' ? plan.creditsMonthly : plan.creditsWeekly}
            </span>
            <span className="text-xs text-on-surface-variant">
              auto-renews every {billingCycle === 'monthly' ? 'month' : 'week'}
            </span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-6">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className={`material-symbols-outlined text-sm ${f.included ? 'text-green-400' : 'text-gray-600'}`}>
                {f.included ? 'check_circle' : 'cancel'}
              </span>
              {f.label}
            </li>
          ))}
        </ul>
        
        <button
          onClick={() => onSelect(plan.id)}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            isSelected 
              ? 'bg-primary text-white' 
              : 'bg-surface-container-high text-on-surface hover:bg-primary/20'
          }`}
        >
          {isSelected ? 'Current Plan' : 'Select Plan'}
        </button>
      </div>
    </motion.div>
  );
}

function CreditPackageCard({ pkg, selected, onSelect }) {
  const isSelected = selected === pkg.id;
  
  return (
    <motion.div
      variants={cardVariants}
      onClick={() => onSelect(pkg.id)}
      className={`relative rounded-xl p-6 cursor-pointer transition-all ${
        isSelected ? 'bg-primary/20 ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'
      }`}
    >
      {pkg.featured && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full">
          Popular
        </span>
      )}
      <h4 className="font-headline font-bold text-lg text-on-surface mb-2">{pkg.name}</h4>
      <div className="mb-4">
        <span className="text-3xl font-headline font-bold">{pkg.credits}</span>
        <span className="text-sm text-on-surface-variant ml-1">credits</span>
      </div>
      <p className="text-xl font-bold text-on-surface mb-4">{pkg.price}</p>
      <ul className="space-y-2 text-sm text-on-surface-variant">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">check</span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function CreditsPage() {
  const [selectedPlan, setSelectedPlan] = useState('FREE');
  const [selectedPackage, setSelectedPackage] = useState('credits_2500');
  const [view, setView] = useState('plans');
  const [billingCycle, setBillingCycle] = useState('weekly');
  const router = useRouter();

  const handlePlanSelect = async (planId) => {
    try {
      const response = await fetch('/api/subscriptions?current=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      
      if (response.ok) {
        router.push('/admin/billing?upgraded=true');
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const currentPlan = CREDIT_PLANS.find(p => p.id === selectedPlan);

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <motion.header className="mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">
          Choose Your <span className="text-primary">Plan</span>
        </h1>
        <p className="text-on-surface-variant">
          Select the perfect plan for your creative needs
        </p>
      </motion.header>

      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setView('plans')}
            className={`px-4 py-2 rounded-xl font-bold text-sm ${
              view === 'plans' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setView('credits')}
            className={`px-4 py-2 rounded-xl font-bold text-sm ${
              view === 'credits' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
            }`}
          >
            Buy Credits
          </button>
        </div>

        {view === 'plans' && (
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5">
            <button
              onClick={() => setBillingCycle('weekly')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'weekly'
                  ? 'bg-primary text-white shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly
            </button>
          </div>
        )}
      </div>

      {view === 'plans' ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          {CREDIT_PLANS.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              selected={selectedPlan}
              onSelect={setSelectedPlan} 
              billingCycle={billingCycle}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          {CREDIT_PACKAGES.map((pkg) => (
            <CreditPackageCard 
              key={pkg.id} 
              pkg={pkg} 
              selected={selectedPackage}
              onSelect={setSelectedPackage} 
            />
          ))}
        </motion.div>
      )}

      <motion.div 
        className="mt-12 p-6 bg-surface-container-low rounded-2xl"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <h3 className="font-headline font-bold text-lg mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-on-surface">{currentPlan?.name}</span>
            <span className="text-on-surface-variant ml-2">- {billingCycle === 'monthly' ? currentPlan?.creditsMonthly : currentPlan?.creditsWeekly} credits/{billingCycle === 'monthly' ? 'month' : 'week'}</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-on-surface">
              {billingCycle === 'monthly' ? MONTHLY[currentPlan?.id] : WEEKLY[currentPlan?.id]}
            </span>
            <span className="text-sm text-on-surface-variant">/{billingCycle === 'monthly' ? 'month' : 'week'}</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex justify-between">
        <Link href="/admin/billing">
          <button className="px-6 py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container">
            Back to Billing
          </button>
        </Link>
        <Link
          href={
              view === 'plans'
              ? `/admin/billing/payment?type=plan&id=${selectedPlan}&billingCycle=${billingCycle}`
              : `/admin/billing/payment?type=credits&id=${selectedPackage}`
          }
        >
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:brightness-110">
            Continue to Payment
          </button>
        </Link>
      </div>
    </main>
  );
}