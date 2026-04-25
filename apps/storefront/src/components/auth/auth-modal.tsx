'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Paisley } from '@/components/brand/paisley';
import { getSupabase, SUPABASE_CONFIGURED } from '@/lib/supabase/client';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const PHONE_OTP_ENABLED = process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === 'true';

type Tab = 'email-otp' | 'password' | 'phone';
type Stage = 'enter-id' | 'verify-otp' | 'success';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const reduced = useReducedMotion();
  // Default to Password — most returning users (including the brand owner)
  // sign in with email + password. Email OTP is for first-time / passwordless.
  const [tab, setTab] = useState<Tab>('password');
  const [stage, setStage] = useState<Stage>('enter-id');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStage('enter-id');
    setError(null);
    setOtp('');
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function sendEmailOtp() {
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) {
        throw new Error('Supabase not configured');
      }
      const { error: e } = await supa.auth.signInWithOtp({ email });
      if (e) throw e;
      setStage('verify-otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailOtp() {
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) throw new Error('Supabase not configured');
      const { error: e } = await supa.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (e) throw e;
      setStage('success');
      onSuccess?.();
      window.setTimeout(onClose, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  }

  async function passwordSignIn() {
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) throw new Error('Supabase not configured');
      const { error: e } = await supa.auth.signInWithPassword({ email, password });
      if (e) throw e;
      setStage('success');
      onSuccess?.();
      window.setTimeout(onClose, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  async function sendPhoneOtp() {
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) throw new Error('Supabase not configured');
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error: e } = await supa.auth.signInWithOtp({ phone: formatted });
      if (e) throw e;
      setStage('verify-otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function verifyPhoneOtp() {
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) throw new Error('Supabase not configured');
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error: e } = await supa.auth.verifyOtp({
        phone: formatted,
        token: otp,
        type: 'sms',
      });
      if (e) throw e;
      setStage('success');
      onSuccess?.();
      window.setTimeout(onClose, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  }

  const masked = phone.length > 2 ? `+91 XXXXXX${phone.slice(-2)}` : phone;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.base }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm focus-visible:outline-none"
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-surface-elevated shadow-lifted ring-1 ring-[color:var(--color-border)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-theme-glow/15 text-theme-ink/60 transition-colors hover:bg-theme-glow/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="p-6 md:p-8">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                Sign in or sign up
              </p>
              <h2 id="auth-title" className="mt-2 font-display text-2xl font-semibold text-theme-ink">
                {stage === 'verify-otp'
                  ? 'Check your email.'
                  : stage === 'success'
                  ? 'Welcome.'
                  : 'Pick up where you left off.'}
              </h2>
              <p className="mt-2 text-sm text-theme-ink/65">
                {stage === 'verify-otp'
                  ? `We sent a 6-digit code and a magic link to ${email}. Use either to sign in.`
                  : stage === 'success'
                  ? 'You’re signed in. Returning to the page …'
                  : 'New to Ravi Sweets? Use Email OTP — we’ll create your account on first sign-in.'}
              </p>

              {!SUPABASE_CONFIGURED && (
                <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-theme-ink">
                  <p className="font-semibold">Supabase not configured</p>
                  <p className="mt-1 text-theme-ink/70">
                    Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                    in <code>.env.local</code> to enable login. Until then this modal is a preview.
                  </p>
                </div>
              )}

              {/* Tabs */}
              {stage === 'enter-id' && (
                <>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-ink/55">
                    Choose how to sign in
                  </p>
                  <div
                    role="tablist"
                    aria-label="Sign-in method"
                    className="mt-2 flex gap-1 rounded-full border border-[color:var(--color-border)] bg-theme-glow/15 p-1 text-xs font-semibold"
                  >
                    <TabButton current={tab} value="password" onClick={() => setTab('password')}>
                      Email + password
                    </TabButton>
                    <TabButton current={tab} value="email-otp" onClick={() => setTab('email-otp')}>
                      Email OTP
                    </TabButton>
                    {PHONE_OTP_ENABLED && (
                      <TabButton current={tab} value="phone" onClick={() => setTab('phone')}>
                        Phone
                      </TabButton>
                    )}
                  </div>
                </>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (stage === 'enter-id') {
                    if (tab === 'email-otp') return sendEmailOtp();
                    if (tab === 'password') return passwordSignIn();
                    if (tab === 'phone') return sendPhoneOtp();
                  } else if (stage === 'verify-otp') {
                    if (tab === 'phone') return verifyPhoneOtp();
                    return verifyEmailOtp();
                  }
                }}
                className="mt-5 flex flex-col gap-4"
              >
                {stage === 'enter-id' && tab === 'email-otp' && (
                  <Field label="Email">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40" aria-hidden="true" />
                    <input
                      ref={firstFieldRef}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-10 py-3 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                    />
                  </Field>
                )}

                {stage === 'enter-id' && tab === 'password' && (
                  <>
                    <Field label="Email">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40" aria-hidden="true" />
                      <input
                        ref={firstFieldRef}
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-10 py-3 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                      />
                    </Field>
                    <Field label="Password">
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-4 py-3 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                      />
                    </Field>
                  </>
                )}

                {stage === 'enter-id' && tab === 'phone' && (
                  <Field label="Phone (Indian numbers — +91 prefix added automatically)">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40" aria-hidden="true" />
                    <input
                      ref={firstFieldRef}
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10,13}"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                      className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-10 py-3 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                    />
                  </Field>
                )}

                {stage === 'verify-otp' && (
                  <Field
                    label={
                      tab === 'phone'
                        ? `Enter the 6-digit code sent to ${masked}`
                        : `Enter the 6-digit code sent to ${email}`
                    }
                  >
                    <input
                      ref={firstFieldRef}
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-theme-ink placeholder:text-theme-ink/30 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                    />
                  </Field>
                )}

                {error && (
                  <p className="text-xs font-medium text-[#c0392b]" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || (stage === 'enter-id' && tab === 'email-otp' && !email) || (stage === 'verify-otp' && otp.length !== 6)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? 'Working…'
                    : stage === 'enter-id'
                    ? tab === 'password'
                      ? 'Sign in'
                      : 'Send code'
                    : 'Verify'}
                </button>

                {stage === 'verify-otp' && (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStage('enter-id')}
                      className="font-medium text-theme-ink/55 hover:text-theme-accent"
                    >
                      ← Use a different method
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (tab === 'phone') void sendPhoneOtp();
                        else void sendEmailOtp();
                      }}
                      className="font-semibold text-theme-accent hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </form>

              <p className="mt-6 text-[11px] text-theme-ink/55">
                By continuing, you agree to our{' '}
                <Link className="underline hover:text-theme-accent" href="/policies/terms">Terms</Link>{' '}
                and{' '}
                <Link className="underline hover:text-theme-accent" href="/policies/privacy">Privacy Policy</Link>.
                {' '}You must be 18 or older to create an account.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-[11px] text-theme-ink/65">
                <span>Brand-owner / staff?</span>
                <Link href="/admin/login" className="font-semibold text-theme-accent hover:underline">
                  Sign in to admin →
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  current,
  value,
  onClick,
  children,
}: {
  current: Tab;
  value: Tab;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
        active
          ? 'bg-[color:var(--theme-base)] text-theme-ink shadow-soft'
          : 'text-theme-ink/60 hover:text-theme-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label}
      </span>
      <span className="relative block">{children}</span>
    </label>
  );
}
