'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* ─── Animation variants ────────────────────────────────────────────────── */
const sectionVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const PLAN_META = {
  FREE:       { label: 'Free',       color: 'text-purple-300/60', bg: 'bg-white/5',        bar: 'from-purple-500 to-purple-400' },
  STARTER:    { label: 'Starter',    color: 'text-sky-400',       bg: 'bg-sky-400/10',     bar: 'from-sky-500 to-sky-400' },
  PRO:        { label: 'Pro',        color: 'text-primary',       bg: 'bg-primary/10',     bar: 'from-primary to-secondary' },
  ENTERPRISE: { label: 'Enterprise', color: 'text-emerald-400',   bg: 'bg-emerald-400/10', bar: 'from-emerald-500 to-emerald-400' },
};

/* ─── Shared UI ─────────────────────────────────────────────────────────── */
function ToggleSwitch({ enabled, onToggle, prefersReduced }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        enabled ? 'bg-primary/80' : 'bg-surface-container-highest'
      }`}
    >
      {prefersReduced ? (
        <div className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-all ${
          enabled ? 'right-1 bg-white' : 'left-1 bg-purple-400/40'
        }`} />
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

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-label font-semibold ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}
      >
        <span className="material-symbols-outlined text-base">
          {toast.type === 'success' ? 'check_circle' : 'error'}
        </span>
        {toast.message}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Profile Section ───────────────────────────────────────────────────── */
function ProfileSection({ session, showToast, prefersReduced }) {
  const [name, setName]     = useState('');
  const [bio, setBio]       = useState('');
  const [social, setSocial] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setBio(localStorage.getItem('settings_bio') || '');
      setSocial(localStorage.getItem('settings_social') || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      localStorage.setItem('settings_bio', bio);
      localStorage.setItem('settings_social', social);
      showToast('success', 'Profile saved successfully.');
    } catch {
      showToast('error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const userInitial = (session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase();

  return (
    <motion.section
      className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 border border-white/5"
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
          onClick={handleSave}
          disabled={saving}
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-label font-bold py-2 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-primary-container/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl border-4 border-surface-container-highest shadow-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{userInitial}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary-fixed p-2 rounded-lg shadow-xl hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>
          <span className="text-[10px] font-label text-purple-400/50 uppercase tracking-widest">Avatar</span>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Display Name</label>
            <input
              className="w-full bg-surface-container-high border-none rounded-lg p-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Bio</label>
            <textarea
              className="w-full bg-surface-container-high border-none rounded-lg p-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Portfolio / Social Link</label>
            <div className="flex-1 bg-surface-container-high rounded-lg flex items-center px-3 gap-2">
              <span className="material-symbols-outlined text-purple-400 text-sm">link</span>
              <input
                className="bg-transparent border-none w-full p-2 text-sm text-on-surface focus:ring-0"
                placeholder="https://"
                type="url"
                value={social}
                onChange={(e) => setSocial(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Subscription Sidebar ──────────────────────────────────────────────── */
function SubscriptionSidebar({ subscription, loading, prefersReduced }) {
  const router = useRouter();
  const plan    = subscription?.plan || 'FREE';
  const meta    = PLAN_META[plan] || PLAN_META.FREE;
  const avail   = subscription?.availableCredits ?? 0;
  const used    = subscription?.usedCredits ?? 0;
  const total   = avail + used || 1;
  const pct     = Math.min(100, (avail / total) * 100);

  const billingDate = subscription?.subscription?.validUntil
    ? new Date(subscription.subscription.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

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
          {loading ? (
            <div className="h-7 w-28 bg-surface-container-high rounded animate-pulse" />
          ) : (
            <h2 className={`text-2xl font-bold font-headline ${meta.color}`}>{meta.label} Plan</h2>
          )}
          <span className={`text-[10px] font-label px-2 py-1 rounded-full uppercase tracking-tighter ${meta.color} ${meta.bg}`}>
            Active
          </span>
        </div>

        <div className="space-y-5">
          {/* Credit balance */}
          <div>
            <span className="text-[10px] font-label text-purple-400/70 uppercase tracking-widest block mb-1">Available Credits</span>
            {loading ? (
              <div className="h-10 w-32 bg-surface-container-high rounded animate-pulse" />
            ) : (
              <div className="text-4xl font-headline font-bold text-on-surface">
                {avail.toLocaleString()}
                <span className="text-sm font-label text-purple-400/50 uppercase tracking-normal ml-2">CR</span>
              </div>
            )}
          </div>

          {/* Credit bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              {loading ? (
                <div className="h-full w-1/2 bg-surface-container animate-pulse rounded-full" />
              ) : (
                <motion.div
                  className={`h-full bg-gradient-to-r ${meta.bar} shadow-sm rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              )}
            </div>
            {!loading && (
              <p className="text-[10px] text-purple-400/40 font-label">
                {used} used · {avail} remaining
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/admin/billing')}
              className="w-full py-3 bg-surface-bright/20 border border-outline-variant/30 rounded-lg text-sm font-label text-on-surface hover:bg-surface-bright/40 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              Billing History
            </button>
            <button
              onClick={() => router.push('/admin/billing/credits')}
              className="w-full py-3 bg-primary-container text-white rounded-lg text-sm font-label hover:brightness-110 transition-all shadow-lg shadow-primary-container/30"
            >
              Top Up Credits
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/10">
        <p className="text-[10px] font-body text-purple-400/40 text-center italic">
          {loading ? 'Loading billing info...' : `Next billing date: ${billingDate}`}
        </p>
      </div>
    </motion.section>
  );
}

/* ─── Account Security ──────────────────────────────────────────────────── */
function AccountSecurity({ session, showToast, prefersReduced }) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft]     = useState('');
  const [showKey, setShowKey]           = useState(false);

  const email  = session?.user?.email || '';
  const userId = session?.user?.id    || '';
  const apiKey = userId ? `sk_${userId.slice(0, 8)}xxxxxxxxxxxx` : 'sk_xxxxxxxxxxxxxxxx';

  useEffect(() => { setEmailDraft(email); }, [email]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    showToast('success', 'API key copied to clipboard.');
  };

  return (
    <motion.section
      className="lg:col-span-6 bg-surface-container-low rounded-xl p-8 border border-white/5"
      id="account"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-xl font-bold font-headline text-primary mb-6">Account Security</h2>
      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Email Address</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface-container-high border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary disabled:opacity-60"
              type="email"
              value={editingEmail ? emailDraft : email}
              onChange={(e) => setEmailDraft(e.target.value)}
              disabled={!editingEmail}
            />
            {editingEmail ? (
              <button
                onClick={() => { showToast('success', 'Email change requires verification — coming soon.'); setEditingEmail(false); }}
                className="p-3 bg-primary/20 rounded-lg text-primary hover:bg-primary/30 transition-colors"
              >
                <span className="material-symbols-outlined">check</span>
              </button>
            ) : (
              <button
                onClick={() => setEditingEmail(true)}
                className="p-3 bg-surface-container-highest rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">Password</label>
          <button
            onClick={() => showToast('success', 'Password reset email sent.')}
            className="w-full p-3 bg-surface-container-high rounded-lg text-left text-on-surface-variant flex justify-between items-center group hover:bg-surface-container-highest transition-all"
          >
            <span className="font-mono tracking-widest text-sm">{'••••••••••••'}</span>
            <span className="text-[10px] font-label text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              Reset Password →
            </span>
          </button>
        </div>

        {/* API Key */}
        <div className="space-y-1">
          <label className="text-xs font-label text-purple-300/70 uppercase tracking-widest px-1">API Key</label>
          <div className="relative group">
            <input
              className="w-full bg-surface-container-high border-none rounded-lg p-3 font-mono text-xs text-purple-300/60 pr-20"
              readOnly
              type={showKey ? 'text' : 'password'}
              value={apiKey}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-purple-300/50 p-1.5 hover:bg-primary/10 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-sm">{showKey ? 'visibility_off' : 'visibility'}</span>
              </button>
              <button
                onClick={handleCopyKey}
                className="text-primary p-1.5 hover:bg-primary/10 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-purple-400/40 font-body">Never share your API key. It grants full access to your credit balance.</p>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Preferences ───────────────────────────────────────────────────────── */
function PreferencesSection({ showToast, prefersReduced }) {
  const [prefs, setPrefs] = useState({
    publicProfile:         true,
    emailNotifications:    true,
    generationAlerts:      false,
    experimentalFeatures:  false,
    autoSavePrompts:       true,
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('settings_prefs') || '{}');
      setPrefs(prev => ({ ...prev, ...saved }));
    } catch {}
  }, []);

  const toggle = (key) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('settings_prefs', JSON.stringify(next));
      return next;
    });
  };

  const TOGGLES = [
    { key: 'publicProfile',        label: 'Public Profile',         desc: 'Allow others to see your generated gallery.' },
    { key: 'emailNotifications',   label: 'Email Notifications',    desc: 'Receive updates on billing and account activity.' },
    { key: 'generationAlerts',     label: 'Generation Alerts',      desc: 'Notify when long-running generations complete.' },
    { key: 'experimentalFeatures', label: 'Experimental Features',  desc: 'Access beta AI models and UI layouts early.' },
    { key: 'autoSavePrompts',      label: 'Auto-save Prompts',      desc: 'Save every prompt to your history automatically.' },
  ];

  return (
    <motion.section
      className="lg:col-span-6 bg-surface-container-low rounded-xl p-8 border border-white/5"
      id="preferences"
      variants={prefersReduced ? undefined : sectionVariants}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-xl font-bold font-headline text-primary mb-6">User Preferences</h2>
      <div className="space-y-5">
        {TOGGLES.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-label text-on-surface font-bold">{label}</h4>
              <p className="text-xs text-on-surface-variant">{desc}</p>
            </div>
            <ToggleSwitch
              enabled={prefs[key]}
              onToggle={() => toggle(key)}
              prefersReduced={prefersReduced}
            />
          </div>
        ))}

        {/* Danger zone */}
        <div className="pt-6 mt-2 border-t border-outline-variant/10">
          <h4 className="text-[10px] font-label text-red-400/60 uppercase tracking-widest mb-4">Danger Zone</h4>
          <button
            onClick={() => showToast('error', 'Account deactivation requires confirmation via email.')}
            className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-label hover:bg-red-500/20 transition-all"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [subscription, setSubscription] = useState(null);
  const [loadingData,  setLoadingData]  = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/subscriptions?current=true')
      .then(r => r.json())
      .then(setSubscription)
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [status]);

  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  if (status === 'loading') {
    return (
      <main className="p-4 sm:p-6 lg:p-10 max-w-6xl">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-surface-container-high rounded animate-pulse" />
          <div className="h-5 w-72 bg-surface-container-high rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Toast toast={toast} />
      <main className="p-4 sm:p-6 lg:p-10 max-w-6xl">
        <motion.header
          className="mb-8 lg:mb-12"
          initial={prefersReduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Settings</h1>
          <p className="text-on-surface-variant font-body text-base lg:text-lg">
            Manage your creative workspace and account preferences.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSection      session={session}      showToast={showToast} prefersReduced={prefersReduced} />
          <SubscriptionSidebar subscription={subscription} loading={loadingData} prefersReduced={prefersReduced} />
          <AccountSecurity     session={session}      showToast={showToast} prefersReduced={prefersReduced} />
          <PreferencesSection  showToast={showToast} prefersReduced={prefersReduced} />
        </div>
      </main>
    </>
  );
}
