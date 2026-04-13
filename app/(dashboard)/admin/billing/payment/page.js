'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Variants
const leftPanelVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const rightPanelVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const formContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const formFieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const sslBadgeVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 18, delay: 0.5 },
  },
};

export default function PaymentPage() {
  const [sameAddress, setSameAddress] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [zip, setZip] = useState('');
  const [promoCode, setPromoCode] = useState('');

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Background accents */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary/10 blur-[100px] -z-10 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Progress indicator */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary font-bold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <div className="h-px w-24 bg-primary" />
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-bold font-label">2</div>
        </div>
        <p className="font-label text-sm uppercase tracking-widest text-primary">Step 2 of 2: Payment Details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Checkout Form */}
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
              {/* Card Number */}
              <motion.div className="space-y-2" variants={formFieldVariants}>
                <label className="font-label text-sm text-on-surface-variant flex justify-between">
                  <span>Card Number</span>
                  <span className="material-symbols-outlined text-lg opacity-50">credit_card</span>
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
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
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-sm text-on-surface-variant flex items-center gap-1">
                    CVV
                    <span className="material-symbols-outlined text-xs cursor-help" title="3-4 digits on back of card">info</span>
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="***"
                    className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                  />
                </div>
              </motion.div>

              {/* Zip */}
              <motion.div className="space-y-2" variants={formFieldVariants}>
                <label className="font-label text-sm text-on-surface-variant">Zip / Postal Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="90210"
                  className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline/50 transition-all font-label tracking-widest"
                />
              </motion.div>

              {/* Billing address */}
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
              Your transaction is encrypted with industry-standard AES-256 encryption. Payment data is processed via Stripe and never stored on seredityfy ai servers.
            </p>
          </div>
        </motion.div>

        {/* Right: Order Summary */}
        <motion.div
          className="lg:col-span-5"
          variants={rightPanelVariants}
          initial="hidden"
          animate="visible"
          style={{ willChange: 'transform' }}
        >
          <div className="bg-[#2c1245]/40 backdrop-blur-[24px] rounded-xl p-8 border border-outline-variant/10 sticky top-32">
            <h2 className="font-headline text-xl font-bold mb-6 text-purple-100">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-headline font-bold text-on-surface">Pro: 2,500 Credits</p>
                  <p className="text-sm text-on-surface-variant">Monthly package renewal</p>
                </div>
                <p className="font-label font-bold text-on-surface">$49.00</p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface">$49.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Platform Fee</span>
                <span className="text-on-surface">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Tax</span>
                <span className="text-on-surface">$0.00</span>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div className="flex justify-between items-center py-2">
                <span className="font-headline text-lg font-bold text-on-surface">Total</span>
                <span className="font-label text-2xl font-bold text-primary">$49.00</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 bg-surface-container-high border-0 rounded-lg py-3 px-4 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all"
                />
                <button className="px-4 py-2 font-label text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <Link href="/admin/billing/success">
              <motion.button
                className="w-full py-5 rounded-xl text-on-primary font-headline font-bold text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container transition-all"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(213,186,255,0.5)',
                }}
                whileTap={{ scale: 0.97 }}
                style={{ willChange: 'transform' }}
              >
                Complete Purchase
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </Link>

            <p className="text-center mt-6 text-xs text-on-surface-variant">
              By completing purchase, you agree to the{' '}
              <a href="#" className="underline hover:text-primary">Terms of Service</a> and{' '}
              <Link href="/admin/billing/refund" className="underline hover:text-primary">Refund Policy</Link>.
            </p>
          </div>

          {/* Decorative art placeholder */}
          
        </motion.div>
      </div>
    </main>
  );
}
