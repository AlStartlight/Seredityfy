'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Logo } from '@/src/assets/import';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

interface EmailjsConfig {
  serviceId:  string;
  templateId: string;
  publicKey:  string;
}

async function sendEmailFromBrowser({
  email,
  name,
  token,
  siteUrl,
  emailjsConfig,
}: {
  email: string;
  name: string;
  token: string;
  siteUrl: string;
  emailjsConfig?: EmailjsConfig;
}) {
  const serviceId  = emailjsConfig?.serviceId?.trim();
  const templateId = emailjsConfig?.templateId?.trim();
  const publicKey  = emailjsConfig?.publicKey?.trim();

  if (!serviceId || !templateId || !publicKey) {
    console.error('[email] EmailJS config missing from server response', { serviceId, templateId, publicKey });
    return false;
  }

  const cleanEmail = email.trim();
  const origin     = typeof window !== 'undefined' ? window.location.origin : siteUrl;
  const base       = siteUrl || origin;
  const verifyLink = `${base}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

  if (!cleanEmail) {
    console.error('[email] sendEmailFromBrowser called with empty email');
    return false;
  }

  const templateParams = {
    to_email:    cleanEmail,
    email:       cleanEmail,
    to:          cleanEmail,
    user_email:  cleanEmail,
    reply_to:    cleanEmail,
    to_name:     (name || 'there').trim(),
    from_name:   'Seredityfy',
    verify_link: verifyLink,
    site_name:   'Seredityfy',
    message:     `Click the link to verify your Seredityfy account: ${verifyLink}`,
  };

  console.log('[email] Sending via browser to:', cleanEmail, '| service:', serviceId);

  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      serviceId,
        template_id:     templateId,
        user_id:         publicKey,
        template_params: templateParams,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] EmailJS ${res.status}: ${body}`);
      if (res.status === 422) {
        console.error(
          '[email] 422 fix: open EmailJS dashboard → Templates → template_5mt2cl8' +
          ' → set "To Email" field to {{to_email}} and save.'
        );
      }
    }
    return res.ok;
  } catch (err) {
    console.error('[email] EmailJS browser fetch failed:', err);
    return false;
  }
}

// ── Animation variants ────────────────────────────────────────────────────────
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN   = [0.4, 0, 1, 1]   as const;

const cardV = {
  hidden:    { opacity: 0, y: 28, scale: 0.97 },
  visible:   {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE_EXPO, staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exitLeft:  { opacity: 0, x: -56, scale: 0.96, transition: { duration: 0.28, ease: EASE_IN } },
  exitRight: { opacity: 0, x:  56, scale: 0.96, transition: { duration: 0.28, ease: EASE_IN } },
};

const logoV = {
  hidden:    { opacity: 0, y: -16 },
  visible:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_EXPO } },
  exitLeft:  { opacity: 0, y: -10, transition: { duration: 0.2 } },
  exitRight: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const fieldV = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const panelV = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.28, ease: EASE_EXPO } },
};

const iconV = {
  hidden:  { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 240, damping: 18, delay: 0.42 },
  },
};

const alertV = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.28, ease: 'easeOut' as const } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.2 } },
};

type AnimState = 'hidden' | 'visible' | 'exitLeft' | 'exitRight';

const SignUP = () => {
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [registered, setRegistered]           = useState(false);
  const [emailSent, setEmailSent]             = useState(false);
  const [resendStatus, setResendStatus]       = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage]     = useState('');
  const [animState, setAnimState]             = useState<AnimState>('hidden');
  const router = useRouter();

  useEffect(() => { setAnimState('visible'); }, []);

  const navigateTo = (href: string, dir: 'left' | 'right') => {
    setAnimState(dir === 'left' ? 'exitLeft' : 'exitRight');
    setTimeout(() => router.push(href), 300);
  };

  /* ── Resend verification ─────────────────────────────────────────────── */
  const handleResend = async () => {
    setResendStatus('sending');
    setResendMessage('');
    try {
      const res  = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.clientEmailNeeded) {
        const sent = await sendEmailFromBrowser({
          email,
          name,
          token:         data.verifyToken,
          siteUrl:       data.siteUrl || window.location.origin,
          emailjsConfig: data.emailjsConfig,
        });
        setResendStatus(sent ? 'sent' : 'error');
        setResendMessage(sent ? 'Verification email resent!' : 'Failed to resend. Check your spam or contact support.');
        return;
      }

      if (res.ok) {
        setResendStatus('sent');
        setResendMessage('Verification email resent!');
      } else {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to resend. Please try again.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('An error occurred. Please try again.');
    }
  };

  /* ── Registration submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8)          { setError('Password must be at least 8 characters'); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();

      if (!response.ok) { setError(data.error || 'Registration failed'); return; }

      if (data.emailSent) { setEmailSent(true); setRegistered(true); return; }

      if (data.clientEmailNeeded) {
        const sent = await sendEmailFromBrowser({
          email,
          name,
          token:         data.verifyToken,
          siteUrl:       data.siteUrl || window.location.origin,
          emailjsConfig: data.emailjsConfig,
        });
        setEmailSent(sent);
        setRegistered(true);
        return;
      }

      setEmailSent(false);
      setRegistered(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Google sign-up ──────────────────────────────────────────────────── */
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/admin' });
    } catch {
      setError('Failed to sign up with Google');
      setIsGoogleLoading(false);
    }
  };

  /* ── Post-registration success screen ───────────────────────────────── */
  if (registered) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 flex flex-col items-center justify-center px-4 py-10">
        <motion.a
          href="/"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_EXPO }}
          className="flex items-center mb-6 text-2xl font-semibold text-gray-300"
        >
          <img className="w-8 h-8 mr-2" src={Logo} alt="logo" />
          Serendityfy
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
          className="w-full max-w-sm rounded-xl shadow-xl border border-gray-700 bg-gray-800 overflow-hidden"
        >
          <div className="p-8 space-y-5 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.25 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                emailSent
                  ? 'bg-emerald-900/30 border border-emerald-700/40'
                  : 'bg-yellow-900/30 border border-yellow-700/40'
              }`}
            >
              {emailSent ? (
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 }}
              className="text-xl font-bold text-gray-100"
            >
              {emailSent ? 'Check your email' : 'Account created'}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.45 }}
            >
              {emailSent ? (
                <p className="text-sm text-gray-400 leading-relaxed">
                  We sent a verification link to{' '}
                  <strong className="text-gray-300">{email}</strong>.{' '}
                  Click the link to activate your account.
                </p>
              ) : (
                <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                  <p>Your account was created but we couldn&apos;t send the verification email automatically.</p>
                  <p className="text-yellow-400/90">Use the <strong>Resend</strong> button below to send it now.</p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.5 }}
              className="pt-1 space-y-3"
            >
              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="block w-full py-2.5 rounded-lg text-sm font-medium text-white bg-violet-700 hover:bg-violet-600 text-center transition-colors"
              >
                Go to Login
              </motion.a>

              <div className="text-xs text-gray-500">
                {emailSent
                  ? "Didn't get the email? Check your spam folder or "
                  : 'Send the verification email: '
                }
                <button
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                  className="text-violet-400 hover:underline bg-transparent border-none p-0 cursor-pointer inline font-inherit text-xs disabled:opacity-50"
                >
                  {resendStatus === 'sending' ? 'Sending…' : 'resend verification'}
                </button>
                {resendMessage && (
                  <span className={`block mt-1.5 ${resendStatus === 'sent' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {resendMessage}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    );
  }

  /* ── Registration form ───────────────────────────────────────────────── */
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 flex flex-col items-center justify-center px-4 py-10">
      <motion.a
        href="/"
        variants={logoV}
        initial="hidden"
        animate={animState}
        className="flex items-center mb-6 text-2xl font-semibold text-gray-300"
      >
        <img className="w-8 h-8 mr-2" src={Logo} alt="logo" />
        Serendityfy
      </motion.a>

      <motion.div
        className="w-full max-w-3xl rounded-xl shadow-xl border border-gray-700 bg-gray-800 overflow-hidden grid md:grid-cols-2"
        variants={cardV}
        initial="hidden"
        animate={animState}
      >
        {/* ── Left: form ── */}
        <div className="p-6 sm:p-8">
          <motion.h1
            variants={fieldV}
            className="text-xl font-bold leading-tight tracking-tight text-gray-200 md:text-2xl mb-4"
          >
            Create an account
          </motion.h1>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                variants={alertV}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-3 p-3 text-sm text-red-400 bg-red-900/20 rounded-lg border border-red-800 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <motion.div variants={fieldV}>
              <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-gray-300">Your name</label>
              <input type="text" name="name" id="name" placeholder="John Doe"
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 placeholder-gray-400 transition-colors"
                value={name} onChange={e => setName(e.target.value)} />
            </motion.div>

            <motion.div variants={fieldV}>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-300">Your email</label>
              <input type="email" name="email" id="email" placeholder="name@company.com" required
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 placeholder-gray-400 transition-colors"
                value={email} onChange={e => setEmail(e.target.value)} />
            </motion.div>

            <motion.div variants={fieldV}>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-300">Password</label>
              <input type="password" name="password" id="password" placeholder="••••••••" required
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 placeholder-gray-400 transition-colors"
                value={password} onChange={e => setPassword(e.target.value)} />
            </motion.div>

            <motion.div variants={fieldV}>
              <label htmlFor="confirm-password" className="block mb-1.5 text-sm font-medium text-gray-300">Confirm password</label>
              <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" required
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 placeholder-gray-400 transition-colors"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </motion.div>

            <motion.div variants={fieldV} className="flex items-start">
              <input id="terms" type="checkbox" required
                className="w-4 h-4 mt-0.5 border border-gray-600 rounded bg-gray-700" />
              <label htmlFor="terms" className="ml-2 text-sm font-light text-gray-400">
                I accept the <a className="font-medium text-violet-400 hover:underline" href="#">Terms and Conditions</a>
              </label>
            </motion.div>

            <motion.button
              variants={fieldV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit" disabled={isLoading}
              className="w-full text-white bg-violet-700 hover:bg-violet-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account…' : 'Create an account'}
            </motion.button>

            <motion.div variants={fieldV} className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-600" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-600" />
            </motion.div>

            <motion.button
              variants={fieldV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button" onClick={handleGoogleSignUp} disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isGoogleLoading ? 'Redirecting…' : 'Sign up with Google'}
            </motion.button>
          </form>
        </div>

        {/* ── Right: already have an account? ── */}
        <motion.div
          variants={panelV}
          className="hidden md:flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border-l border-gray-700 text-center"
        >
          <motion.div
            variants={iconV}
            className="w-16 h-16 rounded-full bg-violet-800/40 border border-violet-600/40 flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </motion.div>

          <motion.div variants={fieldV}>
            <h2 className="text-lg font-bold text-gray-100 mb-2">Already have an account?</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sign in to continue generating stunning AI images and art.
            </p>
          </motion.div>

          <motion.button
            variants={fieldV}
            whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(139, 92, 246, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo('/login', 'left')}
            className="w-full max-w-xs py-2.5 px-6 rounded-lg text-sm font-semibold text-white border-2 border-violet-500 hover:bg-violet-700 transition-colors"
          >
            Sign In
          </motion.button>
        </motion.div>

        {/* Mobile: sign-in link */}
        <motion.p variants={fieldV} className="md:hidden text-sm text-gray-400 text-center pb-6">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('/login', 'left')}
            className="font-medium text-violet-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Sign In
          </button>
        </motion.p>
      </motion.div>
    </section>
  );
};

export default SignUP;
