'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function ToggleSwitch({ enabled, onToggle, prefersReduced }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        enabled ? 'bg-primary-container' : 'bg-surface-container-highest'
      }`}
    >
      {prefersReduced ? (
        <div
          className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-all ${
            enabled ? 'right-1 bg-white' : 'left-1 bg-purple-400/40'
          }`}
        />
      ) : (
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full shadow-md bg-white"
          animate={{ x: enabled ? 24 : 0 }}
          style={{ left: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      )}
    </button>
  );
}

function ProfileSection({ prefersReduced }) {
  return (
    <motion.section
      className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 shadow-sm"
      id="profile"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary mb-1">Profile</h2>
          <p className="text-on-surface-variant text-sm font-body">Update your public persona and avatar.</p>
        </div>
        <motion.button
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-label font-bold py-2 px-6 rounded-lg transition-transform active:scale-95 shadow-lg shadow-primary-container/20"
        >
          Save Changes
        </motion.button>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-surface-container-high border-4 border-surface-container-highest shadow-2xl" />
            <button className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary-fixed p-2 rounded-lg shadow-xl hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
          <span className="text-[10px] font-label text-purple-400/50 uppercase tracking-widest">Avatar (400x400)</span>
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Display Name</label>
            <input
              className="w-full bg-surface-container-high border-none rounded-lg p-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface"
              type="text"
              defaultValue="Aether Designer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Bio</label>
            <textarea
              className="w-full bg-surface-container-high border-none rounded-lg p-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface resize-none"
              rows={3}
              defaultValue="Digital dreamweaver exploring the boundaries between AI and neo-noir aesthetics."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Social Links (X / Portfolio)</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-surface-container-high rounded-lg flex items-center px-3 gap-2">
                <span className="material-symbols-outlined text-purple-400 text-sm">link</span>
                <input
                  className="bg-transparent border-none w-full p-2 text-sm text-on-surface focus:ring-0"
                  placeholder="https://"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SubscriptionSidebar({ prefersReduced }) {
  return (
    <motion.section
      className="lg:col-span-4 bg-gradient-to-br from-surface-container-low to-surface-container p-8 rounded-xl flex flex-col justify-between border border-primary/5"
      id="subscription"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-headline text-secondary">Pro Plan</h2>
          <span className="bg-secondary-container/20 text-secondary text-[10px] font-label px-2 py-1 rounded-full uppercase tracking-tighter">Active</span>
        </div>
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-label text-purple-400/70 uppercase tracking-widest block mb-1">Credit Balance</span>
            <div className="text-4xl font-headline font-bold text-on-surface">
              1,240 <span className="text-sm font-label text-purple-400/50 uppercase tracking-normal">Credits</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-secondary to-primary w-3/4 shadow-[0_0_12px_rgba(255,171,243,0.5)]" />
          </div>
          <div className="space-y-3">
            <button className="w-full py-3 bg-surface-bright/20 border border-outline-variant/30 rounded-lg text-sm font-label text-on-surface hover:bg-surface-bright/40 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">history</span> Billing History
            </button>
            <button className="w-full py-3 bg-primary-container text-white rounded-lg text-sm font-label hover:brightness-110 transition-all shadow-lg shadow-primary-container/30">
              Top Up Credits
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-outline-variant/10">
        <p className="text-[10px] font-body text-purple-400/40 text-center italic">Next billing date: Oct 24, 2023</p>
      </div>
    </motion.section>
  );
}

function AccountSecurity({ prefersReduced }) {
  return (
    <motion.section
      className="lg:col-span-6 bg-surface-container-low rounded-xl p-8"
      id="account"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-xl font-bold font-headline text-primary mb-6">Account Security</h2>
      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Email Address</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface-container-high border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary"
              type="email"
              defaultValue="aether@seredityfy.ai"
            />
            <button className="p-3 bg-surface-container-highest rounded-lg text-primary">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Password</label>
          <button className="w-full p-3 bg-surface-container-high rounded-lg text-left text-on-surface-variant flex justify-between items-center group hover:bg-surface-container-highest transition-all">
            <span>{'••••••••••••'}</span>
            <span className="text-[10px] font-label text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">Reset Password</span>
          </button>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">API Secret Key</label>
          <div className="relative group">
            <input
              className="w-full bg-surface-container-high border-none rounded-lg p-3 font-mono text-xs text-purple-300/60"
              readOnly
              type="password"
              defaultValue="nt_sk_9482759842759287452"
            />
            <button className="absolute right-3 top-2.5 text-primary p-1 hover:bg-primary/10 rounded">
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
          <p className="text-[10px] text-purple-400/50 mt-2 font-body">Never share your API key. It grants full access to your credit balance.</p>
        </div>
      </div>
    </motion.section>
  );
}

function PreferencesSection({ prefersReduced }) {
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  return (
    <motion.section
      className="lg:col-span-6 bg-surface-container-low rounded-xl p-8"
      id="preferences"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-xl font-bold font-headline text-primary mb-6">User Preferences</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between group">
          <div>
            <h4 className="text-sm font-label text-on-surface font-bold uppercase tracking-tight">Public Profile</h4>
            <p className="text-xs text-on-surface-variant">Allow others to see your generated gallery.</p>
          </div>
          <ToggleSwitch enabled={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} prefersReduced={prefersReduced} />
        </div>
        <div className="flex items-center justify-between group">
          <div>
            <h4 className="text-sm font-label text-on-surface font-bold uppercase tracking-tight">Email Notifications</h4>
            <p className="text-xs text-on-surface-variant">Receive updates on generation status and billing.</p>
          </div>
          <ToggleSwitch enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} prefersReduced={prefersReduced} />
        </div>
        <div className="flex items-center justify-between group">
          <div>
            <h4 className="text-sm font-label text-on-surface font-bold uppercase tracking-tight">Experimental Features</h4>
            <p className="text-xs text-on-surface-variant">Access beta AI models and UI layouts early.</p>
          </div>
          <ToggleSwitch enabled={experimentalFeatures} onToggle={() => setExperimentalFeatures(!experimentalFeatures)} prefersReduced={prefersReduced} />
        </div>
        <div className="mt-10 pt-6 border-t border-outline-variant/10">
          <h4 className="text-[10px] font-label text-error uppercase tracking-widest mb-4">Danger Zone</h4>
          <button className="w-full py-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm font-label hover:bg-error/20 transition-all">
            Deactivate Account
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export default function SettingsPage() {
  const prefersReduced = useReducedMotion();

  return (
    <main className="p-10 max-w-6xl">
      <motion.header
        className="mb-12"
        initial={prefersReduced ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant font-body text-lg">Manage your creative workspace and account preferences.</p>
      </motion.header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ProfileSection prefersReduced={prefersReduced} />
        <SubscriptionSidebar prefersReduced={prefersReduced} />
        <AccountSecurity prefersReduced={prefersReduced} />
        <PreferencesSection prefersReduced={prefersReduced} />
      </div>
    </main>
  );
}
