'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  /**
   * Where the modal was raised from. 'checkout' retunes everything for the
   * first-time buyer who was interrupted mid-payment: OTP-first (the code
   * both signs in AND creates the account), copy that says WHY the email
   * prompt appeared, and no "pick up where you left off" framing — a person
   * placing their first order never left off anywhere. Owner feedback
   * 2026-08-11: the prompt read as if an existing account was expected.
   */
  intent?: 'general' | 'checkout';
  /** Pre-fill for the email field — checkout already collected it. */
  defaultEmail?: string;
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  intent = 'general',
  defaultEmail,
}: AuthModalProps) {
  const reduced = useReducedMotion();
  const isCheckout = intent === 'checkout';
  // General surfaces default to Password — most returning users (including
  // the brand owner) sign in that way. Checkout defaults to the email code:
  // its audience is dominated by first-time buyers, and the code path is the
  // one that works for BOTH new and returning customers.
  const [tab, setTab] = useState<Tab>(isCheckout ? 'email-otp' : 'password');
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
    /*
     * Reset the method too. The modal is never unmounted, so a buyer who
     * tried "I have a password", failed, and dismissed would be returned to
     * the password form on their next attempt — the precise view that reads
     * as "you were supposed to have an account". Each open starts from the
     * method that suits the surface. The password box is cleared with it
     * rather than left sitting in state behind a closed dialog.
     */
    setTab(isCheckout ? 'email-otp' : 'password');
    setPassword('');
    /*
     * The address form already asked for the email — asking again with an
     * empty box severs the connection between the two. Pre-filled, the modal
     * reads as "confirm the email you just gave us", which is what it is.
     *
     * `defaultEmail` WINS on every open when the caller supplies one. It was
     * written as `current || defaultEmail` — fill-only-if-empty — but this
     * modal is never unmounted between opens, so once any address was in
     * state a corrected one could never replace it: buyer opens the modal,
     * dismisses it, goes back and fixes a typo in their email, places the
     * order again, and the code is sent to the address they just corrected
     * away from. The caller's value is the newer fact; keep `current` only
     * where there is no caller value to prefer (the general sign-in modal).
     */
    setEmail((current) => defaultEmail || current || '');
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open, defaultEmail, isCheckout]);

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
            className="bg-theme-ink/50 absolute inset-0 focus-visible:outline-none"
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
            transition={{
              duration: reduced ? DURATION.fast : DURATION.slow,
              ease: EASE.emphasised,
            }}
            className="docket shadow-lifted relative z-10 w-full max-w-md overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-theme-ink/60 hover:text-theme-ink focus-visible:ring-theme-accent absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="p-6 md:p-8">
              {/*
                CHECKOUT SPEAKS TO A BUYER, NOT A RETURNING USER.
                "Pick up where you left off" and a password box read as "you
                are expected to already have an account" to someone placing
                their first order — owner feedback 2026-08-11. At checkout the
                modal says what it is for, in the buyer's terms: confirm the
                email, and the code makes the account if there isn't one.
              */}
              <h2 id="auth-title" className="font-display text-theme-ink pr-10 text-2xl">
                {stage === 'verify-otp'
                  ? 'Check your email.'
                  : stage === 'success'
                    ? isCheckout
                      ? 'Email confirmed.'
                      : 'Welcome.'
                    : isCheckout
                      ? 'One step before payment.'
                      : 'Pick up where you left off.'}
              </h2>
              <p className="text-theme-ink/65 mt-2 text-sm">
                {/*
                  THE CODE ONLY — never "and a sign-in link".
                  signInWithOtp is called with no emailRedirectTo and there is
                  no /auth/callback route, so a link tapped from the email
                  lands on the site root and abandons the checkout the buyer
                  was in. Telling them to use "either one" invites exactly the
                  lost order this change exists to prevent.
                */}
                {stage === 'verify-otp'
                  ? `We’ve emailed a 6-digit code to ${email}. Enter it below${
                      isCheckout ? ' to confirm your order.' : ' to sign in.'
                    }`
                  : stage === 'success'
                    ? isCheckout
                      ? // NOT "placing your order": for UPI, card and netbanking
                        // the payment window opens next, and the order is not
                        // placed until that clears.
                        'Taking you back to your order …'
                      : 'You’re signed in. Returning to the page …'
                    : isCheckout
                      ? 'We confirm every order against a real email address, so your confirmation, invoice and tracking actually reach you.'
                      : 'New to Ravi Sweets? Use the email code — we’ll create your account on first sign-in.'}
              </p>

              {!SUPABASE_CONFIGURED && (
                <div className="text-theme-ink mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                  <p className="font-semibold">Supabase not configured</p>
                  <p className="text-theme-ink/70 mt-1">
                    Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                    <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to enable
                    login. Until then this modal is a preview.
                  </p>
                </div>
              )}

              {/* Tabs */}
              {stage === 'enter-id' && (
                <>
                  <p className="field-label mt-5">
                    {isCheckout ? 'How would you like to confirm?' : 'Choose how to sign in'}
                  </p>
                  <div
                    role="tablist"
                    aria-label={isCheckout ? 'Confirmation method' : 'Sign-in method'}
                    className="mt-2 flex border-b border-[color:var(--color-rule)]"
                  >
                    {/*
                      Checkout leads with the code tab — it is the one path
                      that works whether or not the buyer already has an
                      account, so it must be the first thing they see and the
                      default. Everywhere else the password tab leads, for
                      returning customers and staff. "OTP" is retired from the
                      checkout labels: it is telecom jargon, and the buyer only
                      needs to know an email is coming.
                    */}
                    {(isCheckout
                      ? (['email-otp', 'password'] as const)
                      : (['password', 'email-otp'] as const)
                    ).map((value) => (
                      <TabButton
                        key={value}
                        current={tab}
                        value={value}
                        onClick={() => setTab(value)}
                      >
                        {value === 'email-otp'
                          ? isCheckout
                            ? 'Email me a code'
                            : 'Email OTP'
                          : isCheckout
                            ? 'I have a password'
                            : 'Email + password'}
                      </TabButton>
                    ))}
                    {PHONE_OTP_ENABLED && (
                      <TabButton current={tab} value="phone" onClick={() => setTab('phone')}>
                        Phone
                      </TabButton>
                    )}
                  </div>

                  {/*
                    THE ANSWER TO "DO I ALREADY NEED AN ACCOUNT?" — stated
                    where the question is asked, not in a policy page.
                  */}
                  {isCheckout && tab === 'email-otp' && (
                    <div className="bg-surface mt-4 rounded-lg border border-[color:var(--color-border)] p-3">
                      <p className="field-label">First time ordering?</p>
                      <p className="text-theme-ink/70 mt-1.5 text-xs leading-relaxed">
                        You don’t need an account already. Entering the code we email you creates
                        one — there is no password to choose — and it is what lets you track this
                        order and reorder later.
                      </p>
                    </div>
                  )}
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
                    <Mail
                      className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      ref={firstFieldRef}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-10 py-3 text-sm focus-visible:outline-none focus-visible:ring-2"
                    />
                  </Field>
                )}

                {stage === 'enter-id' && tab === 'password' && (
                  <>
                    <Field label="Email">
                      <Mail
                        className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        ref={firstFieldRef}
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-10 py-3 text-sm focus-visible:outline-none focus-visible:ring-2"
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
                        className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2"
                      />
                    </Field>
                  </>
                )}

                {stage === 'enter-id' && tab === 'phone' && (
                  <Field label="Phone (Indian numbers — +91 prefix added automatically)">
                    <Phone
                      className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
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
                      className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-10 py-3 text-sm focus-visible:outline-none focus-visible:ring-2"
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
                      className="bg-surface text-theme-ink placeholder:text-theme-ink/30 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-4 py-3 text-center font-mono text-lg tracking-[0.35em] focus-visible:outline-none focus-visible:ring-2"
                    />
                  </Field>
                )}

                {error && (
                  <p className="text-xs font-semibold text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    busy ||
                    (stage === 'enter-id' && tab === 'email-otp' && !email) ||
                    (stage === 'verify-otp' && otp.length !== 6)
                  }
                  className="stamp w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? 'Working…'
                    : stage === 'enter-id'
                      ? tab === 'password'
                        ? 'Sign in'
                        : isCheckout
                          ? 'Email me the code'
                          : 'Send code'
                      : isCheckout
                        ? 'Verify and continue'
                        : 'Verify'}
                </button>

                {stage === 'verify-otp' && (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStage('enter-id')}
                      className="text-theme-ink/55 hover:text-theme-accent font-medium"
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
                      className="text-theme-accent font-semibold hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </form>

              <p className="text-theme-ink/55 mt-6 text-[11px]">
                By continuing, you agree to our{' '}
                <Link className="hover:text-theme-accent underline" href="/policies/terms">
                  Terms
                </Link>{' '}
                and{' '}
                <Link className="hover:text-theme-accent underline" href="/policies/privacy">
                  Privacy Policy
                </Link>
                . You must be 18 or older to create an account.
              </p>
              {/*
                Hidden at checkout. A buyer mid-payment has no use for the
                staff door, and an "admin" link at the moment of purchase is
                one more reason to wonder whether you are in the right place.
              */}
              {!isCheckout && (
                <div className="bg-surface text-theme-ink/65 mt-4 flex items-center justify-between rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-[11px]">
                  <span>Brand-owner / staff?</span>
                  <Link
                    href="/admin/login"
                    className="text-theme-accent font-semibold hover:underline"
                  >
                    Sign in to admin →
                  </Link>
                </div>
              )}
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
      className={`field-label -mb-px flex-1 border-b-2 px-2 py-3 text-center transition-colors ${
        active
          ? 'border-theme-accent text-theme-accent'
          : 'border-transparent text-theme-ink/60 hover:text-theme-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="field-label">{label}</span>
      <span className="relative block">{children}</span>
    </label>
  );
}
