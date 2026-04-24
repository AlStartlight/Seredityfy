'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/* ─── Catalogue (matches credits/page.js exactly) ──────────────────────── */
const WEEKLY_PRICES = { FREE: 0, STARTER: 40, PRO: 60, ENTERPRISE: 400 };
const MONTHLY_PRICES = { FREE: 0, STARTER: 160, PRO: 240, ENTERPRISE: 1600 };

const PLAN_CATALOGUE = {
  FREE:       { name: 'Free',       creditsWeekly: 40,        creditsMonthly: 160,       description: '40 credits/week · 160 credits/month' },
  STARTER:    { name: 'Starter',    creditsWeekly: 200,       creditsMonthly: 800,       description: '200 credits/week · 800 credits/month' },
  PRO:        { name: 'Pro',        creditsWeekly: 500,       creditsMonthly: 2000,      description: '500 credits/week · 2,000 credits/month' },
  ENTERPRISE: { name: 'Enterprise', creditsWeekly: 'Unlimited', creditsMonthly: 'Unlimited', description: 'Unlimited credits' },
};

const PACKAGE_CATALOGUE = {
  credits_500:   { name: 'Starter Credits',    credits: 500,   priceNum: 29,  priceLabel: '$29',  description: '500 one-time credits' },
  credits_2500:  { name: 'Pro Credits',        credits: 2500,  priceNum: 99,  priceLabel: '$99',  description: '2,500 one-time credits' },
  credits_10000: { name: 'Enterprise Credits', credits: 10000, priceNum: 299, priceLabel: '$299', description: '10,000 one-time credits' },
};

const PROMO_CODES = {
  SEREDITY10: 0.10,
  LAUNCH20:   0.20,
};

/* ─── Animations ────────────────────────────────────────────────────────── */
const leftPanelVariants  = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const rightPanelVariants = { hidden: { opacity: 0, x: 60  }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const formContainerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const formFieldVariants  = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
const sslBadgeVariants   = { hidden: { scale: 0 }, visible: { scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18, delay: 0.5 } } };

/* ─── Card number formatter ─────────────────────────────────────────────── */
function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/* ─── No-plan fallback ──────────────────────────────────────────────────── */
function NoPlanSelected() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-5 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-purple-300/40">shopping_cart</span>
        </div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">No plan selected</h2>
        <p className="text-on-surface-variant text-sm">Go back and choose a plan or credit package to continue.</p>
        <Link href="/admin/billing/credits">
          <button className="mt-2 px-7 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all">
            Choose a Plan
          </button>
        </Link>
      </div>
    </main>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type'); // 'plan' | 'credits'
  const id   = searchParams.get('id');   // e.g. 'PRO' | 'credits_2500'
  const billingCycle = searchParams.get('billingCycle') || 'weekly'; // 'weekly' | 'monthly'

  /* Resolve selected item */
  const item = useMemo(() => {
    if (type === 'plan') {
      const base = PLAN_CATALOGUE[id];
      if (!base) return null;
      const priceNum = billingCycle === 'monthly' ? MONTHLY_PRICES[id] : WEEKLY_PRICES[id];
      const priceLabel = `$${priceNum.toLocaleString()}`;
      const period = billingCycle === 'monthly' ? '/month' : '/week';
      const credits = billingCycle === 'monthly' ? base.creditsMonthly : base.creditsWeekly;
      return { ...base, type: 'plan', id, priceNum, priceLabel, period, credits };
    }
    if (type === 'credits') return PACKAGE_CATALOGUE[id] ? { ...PACKAGE_CATALOGUE[id], type: 'credits', id } : null;
    return null;
  }, [type, id, billingCycle]);

  /* Form state */
  const [cardNumber,   setCardNumber]   = useState('');
  const [expiry,       setExpiry]       = useState('');
  const [cvv,          setCvv]          = useState('');
  const [zip,          setZip]          = useState('');
  const [sameAddress,  setSameAddress]  = useState(true);
  const [promoCode,    setPromoCode]    = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // discount fraction or null
  const [promoError,   setPromoError]   = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /* Pricing */
  const subtotal  = item?.priceNum ?? 0;
  const discount  = promoApplied ? Math.round(subtotal * promoApplied * 100) / 100 : 0;
  const total     = Math.max(0, subtotal - discount);

  const formValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3;

  function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoApplied(PROMO_CODES[code]);
      setPromoError('');
    } else {
      setPromoApplied(null);
      setPromoError('Invalid promo code.');
    }
  }

  async function handlePurchase() {
    if (!formValid || isProcessing) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    router.push('/admin/billing/success');
  }

  if (!item) return <NoPlanSelected />;

  const periodLabel = item.type === 'plan'
    ? `${item.name} plan · ${billingCycle === 'monthly' ? 'monthly' : 'weekly'}`
    : 'One-time credit purchase';

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Background accents */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary/10 blur-[100px] -z-10 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Step indicator */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary font-bold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <div className="h-px w-24 bg-primary" />
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-bold font-label">2</div>
        </div>
        <p className="font-label text-sm uppercase tracking-widest text-primary">Step 2 of 2 — Payment Details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* ── Left: Checkout form ─────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-7 space-y-8"
          variants={leftPanelVariants}
          initial="hidden"
          animate="visible"
          style={{ willChange: 'transform' }}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Secure Checkout</h1>
            <motion.div
              className="flex items-center gap-2 px-3 py-1 bg-secondary-container/20 border border-secondary/20 rounded-full"
              variants={sslBadgeVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-label text-xs font-bold text-secondary uppercase">SSL Secured</span>
            </motion.div>
          </div>

          <div className="bg-[#2c1245]/40 backdrop-blur-[24px] rounded-xl p-8 border border-outline-variant/10">
            <motion.form
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Card number */}
              <motion.div className="space-y-2" variants={formFieldVariants}>
                <label className="font-label text-sm text-on-surface-variant flex justify-between">
                  <span>Card Number</span>
                  <span className="material-symbols-outlined text-lg opacity-50">credit_card</span>
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                />
              </motion.div>

              {/* Expiry & CVV */}
              <motion.div className="grid grid-cols-2 gap-6" variants={formFieldVariants}>
                <div className="space-y-2">
                  <label className="font-label text-sm text-on-surface-variant">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-sm text-on-surface-variant flex items-center gap-1">
                    CVV
                    <span className="material-symbols-outlined text-xs cursor-help" title="3–4 digits on back of card">info</span>
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                  />
                </div>
              </motion.div>

              {/* ZIP */}
              <motion.div className="space-y-2" variants={formFieldVariants}>
                <label className="font-label text-sm text-on-surface-variant">Zip / Postal Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.slice(0, 10))}
                  placeholder="90210"
                  className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                />
              </motion.div>

              {/* Billing address checkbox */}
              <motion.div className="flex items-center gap-3 pt-4" variants={formFieldVariants}>
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label className="font-body text-sm text-on-surface-variant">Billing address is same as account address</label>
              </motion.div>
            </motion.form>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low/50">
            <span className="material-symbols-outlined text-primary mt-1">lock</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your transaction is encrypted with AES-256. Payment data is processed via Stripe and never stored on Seredityfy servers.
            </p>
          </div>
        </motion.div>

        {/* ── Right: Order summary ────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-5"
          variants={rightPanelVariants}
          initial="hidden"
          animate="visible"
          style={{ willChange: 'transform' }}
        >
          <div className="bg-[#2c1245]/40 backdrop-blur-[24px] rounded-xl p-8 border border-outline-variant/10 sticky top-32 space-y-6">
            <h2 className="font-headline text-xl font-bold text-purple-100">Order Summary</h2>

            {/* Selected plan card */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">
                    {item.type === 'plan' ? 'workspace_premium' : 'toll'}
                  </span>
                  <p className="font-headline font-bold text-on-surface">{item.name}</p>
                </div>
                <p className="text-sm text-on-surface-variant">{item.description}</p>
                <p className="text-[10px] text-purple-300/40 font-label uppercase tracking-wide">{periodLabel}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-label font-bold text-on-surface text-lg">{item.priceLabel}</p>
                {item.type === 'plan' && (
                  <p className="text-[10px] text-purple-300/40">{item.period}</p>
                )}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3">
              <div className="h-px bg-outline-variant/20" />
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">local_offer</span>
                    Promo ({Math.round(promoApplied * 100)}% off)
                  </span>
                  <span className="text-emerald-400">−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Platform Fee</span>
                <span className="text-on-surface">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Tax</span>
                <span className="text-on-surface">$0.00</span>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div className="flex justify-between items-center py-1">
                <span className="font-headline text-lg font-bold text-on-surface">Total</span>
                <span className="font-label text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoApplied(null); }}
                  placeholder="Promo code"
                  className="flex-1 bg-surface-container-high border-0 rounded-lg py-3 px-4 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 font-label text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-red-400">{promoError}</p>}
              {promoApplied && <p className="text-xs text-emerald-400">Promo applied — {Math.round(promoApplied * 100)}% discount</p>}
            </div>

            {/* CTA */}
            <motion.button
              onClick={handlePurchase}
              disabled={!formValid || isProcessing}
              className="w-full py-5 rounded-xl text-on-primary font-headline font-bold text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={formValid && !isProcessing ? { scale: 1.02, boxShadow: '0 0 30px rgba(213,186,255,0.5)' } : {}}
              whileTap={formValid && !isProcessing ? { scale: 0.97 } : {}}
              style={{ willChange: 'transform' }}
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Purchase — ${total.toFixed(2)}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </motion.button>

            {!formValid && (
              <p className="text-center text-xs text-purple-300/40">Fill in your card details above to continue.</p>
            )}

            <p className="text-center text-xs text-on-surface-variant">
              By completing purchase, you agree to the{' '}
              <a href="#" className="underline hover:text-primary">Terms of Service</a> and{' '}
              <Link href="/admin/billing/refund" className="underline hover:text-primary">Refund Policy</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-purple-300/50 font-label">Loading checkout...</p>
        </div>
      </main>
    }>
      <PaymentContent />
    </Suspense>
  );
}
