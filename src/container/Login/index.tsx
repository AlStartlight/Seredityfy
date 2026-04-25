'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/src/assets/import';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const cardV = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE_EXPO, staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exitLeft: { opacity: 0, x: -56, scale: 0.96, transition: { duration: 0.28, ease: EASE_IN } },
  exitRight: { opacity: 0, x: 56, scale: 0.96, transition: { duration: 0.28, ease: EASE_IN } },
};

const logoV = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_EXPO } },
  exitLeft: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  exitRight: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const fieldV = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const panelV = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.28, ease: EASE_EXPO } },
};

const iconV = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 240, damping: 18, delay: 0.42 },
  },
};

const alertV = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.28, ease: 'easeOut' as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

type AnimState = 'hidden' | 'visible' | 'exitLeft' | 'exitRight';

const Login = () => {
  const [animState, setAnimState] = useState<AnimState>('hidden');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();

  useEffect(() => { setAnimState('visible'); }, []);

  const navigateTo = (href: string, dir: 'left' | 'right') => {
    setAnimState(dir === 'left' ? 'exitLeft' : 'exitRight');
    setTimeout(() => router.push(href), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResent(false);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const check = await fetch(`/api/auth/check-verification?email=${encodeURIComponent(email)}`);
        const data = await check.json();
        if (data.needsVerification) {
          setNeedsVerification(true);
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
        } else {
          setError('Invalid email or password');
        }
      } else {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResent(false);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResent(true);
        setError('');
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/admin' });
    } catch (err) {
      setError('Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

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
        <div className="p-6 sm:p-8 space-y-4">
          <motion.h1 variants={fieldV} className="text-xl font-bold leading-tight tracking-tight text-gray-200 md:text-2xl">
            Sign in to your account
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

          <AnimatePresence mode="wait">
            {resent && (
              <motion.div
                key="resent"
                variants={alertV}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-3 p-3 text-sm text-green-400 bg-green-900/20 rounded-lg border border-green-800 overflow-hidden"
              >
                Verification email resent! Please check your inbox.
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {needsVerification && (
              <motion.button
                key="verify"
                variants={alertV}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleResendVerification}
                disabled={resending}
                className="mb-3 w-full py-2.5 text-sm font-medium text-purple-300 bg-purple-900/20 border border-purple-700/40 rounded-lg hover:bg-purple-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </motion.button>
            )}
          </AnimatePresence>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <motion.div variants={fieldV}>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-300">Your email</label>
              <input
                type="email" name="email" id="email" placeholder="name@company.com" required
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 placeholder-gray-400"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div variants={fieldV}>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-300">Password</label>
              <input
                type="password" name="password" id="password" placeholder="••••••••" required
                className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 placeholder-gray-400"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            <motion.div variants={fieldV} className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input id="remember" type="checkbox" className="w-4 h-4 border border-gray-600 rounded bg-gray-700" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-violet-400 hover:underline">Forgot password?</a>
            </motion.div>

            <motion.button
              variants={fieldV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit" disabled={isLoading}
              className="w-full text-white bg-violet-700 hover:bg-violet-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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
              type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isGoogleLoading ? 'Redirecting...' : 'Sign in with Google'}
            </motion.button>
          </form>
        </div>

        <motion.div
          variants={panelV}
          className="hidden md:flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border-l border-gray-700 text-center"
        >
          <motion.div variants={iconV} className="w-16 h-16 rounded-full bg-violet-800/40 border border-violet-600/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </motion.div>

          <motion.div variants={fieldV}>
            <h2 className="text-lg font-bold text-gray-100 mb-2">New here?</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Create a free account and start generating stunning AI images and art today.
            </p>
          </motion.div>

          <motion.button
            variants={fieldV}
            whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(139, 92, 246, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo('/register', 'right')}
            className="w-full max-w-xs py-2.5 px-6 rounded-lg text-sm font-semibold text-white border-2 border-violet-500 hover:bg-violet-700 transition-colors"
          >
            Sign Up
          </motion.button>
        </motion.div>

        <motion.p variants={fieldV} className="md:hidden text-sm text-gray-400 text-center pb-6">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => navigateTo('/register', 'right')}
            className="font-medium text-violet-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Sign Up
          </button>
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Login;