'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Logo } from '@/src/assets/import';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

interface EmailjsConfig {
  serviceId:  string;
  templateId: string;
  publicKey:  string;
}

/**
 * Send the verification email directly from the browser via EmailJS.
 * The browser Origin header satisfies EmailJS allowed-origins validation —
 * no private key required. Config is supplied by the server response so
 * NEXT_PUBLIC_* build-time vars are not needed.
 */
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

  const origin     = typeof window !== 'undefined' ? window.location.origin : siteUrl;
  const base       = siteUrl || origin;
  const verifyLink = `${base}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     publicKey,
        template_params: {
          to_email:    email,
          to_name:     name || 'there',
          verify_link: verifyLink,
          site_name:   'Seredityfy',
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] EmailJS browser send ${res.status}:`, body);
    }
    return res.ok;
  } catch (err) {
    console.error('[email] EmailJS browser fetch failed:', err);
    return false;
  }
}

const SignUP = () => {
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                   = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [registered, setRegistered]         = useState(false);
  const [emailSent, setEmailSent]           = useState(false);
  const [resendStatus, setResendStatus]     = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage]   = useState('');

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
        // Server failed → try from browser using config returned by server
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Server sent email successfully
      if (data.emailSent) {
        setEmailSent(true);
        setRegistered(true);
        return;
      }

      // Server couldn't send — try from the browser (EmailJS public key, no 403)
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

      // Edge case: registered but no email mechanism configured
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

  /* ── Post-registration screen ────────────────────────────────────────── */
  if (registered) {
    return (
      <section className="bg-gradient-to-br bg-gradient-75 from-slate-950 via-indigo-950 to-blue-950">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-300">
            <img className="w-8 h-8 mr-2" src={Logo} alt="logo" />
            Serendityfy
          </a>

          <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
            <div className="p-8 space-y-5 text-center">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${emailSent ? 'bg-emerald-900/30 border border-emerald-700/40' : 'bg-yellow-900/30 border border-yellow-700/40'}`}>
                {emailSent ? (
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-100">
                {emailSent ? 'Check your email' : 'Account created'}
              </h1>

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

              <div className="pt-1 space-y-3">
                <a
                  href="/login"
                  className="block w-full py-2.5 rounded-lg text-sm font-medium text-white bg-violet-700 hover:bg-violet-600 text-center transition-colors"
                >
                  Go to Login
                </a>

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
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Registration form ───────────────────────────────────────────────── */
  return (
    <section className="bg-gradient-to-br bg-gradient-75 from-slate-950 via-indigo-950 to-blue-950">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-300">
          <img className="w-8 h-8 mr-2" src={Logo} alt="logo" />
          Serendityfy
        </a>

        <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-400 md:text-2xl">
              Create an account
            </h1>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-lg border border-red-800">
                {error}
              </div>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">Your name</label>
                <input type="text" name="name" id="name" placeholder="John Doe"
                  className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Your email</label>
                <input type="email" name="email" id="email" placeholder="name@company.com" required
                  className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••" required
                  className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-300">Confirm password</label>
                <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" required
                  className="bg-gray-300 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-violet-600 focus:border-violet-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="terms" type="checkbox" required
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                    I accept the <a className="font-medium text-violet-400 hover:underline" href="#">Terms and Conditions</a>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-center my-4">
                <div className="w-full h-px bg-gray-600" />
                <span className="px-4 text-sm text-gray-400">or</span>
                <div className="w-full h-px bg-gray-600" />
              </div>

              <button type="button" onClick={handleGoogleSignUp} disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isGoogleLoading ? 'Redirecting…' : 'Sign up with Google'}
              </button>

              <button type="submit" disabled={isLoading}
                className="w-full text-white bg-violet-700 hover:bg-violet-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isLoading ? 'Creating account…' : 'Create an account'}
              </button>

              <p className="text-sm font-light text-gray-500">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-violet-400 hover:underline">Login here</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUP;
