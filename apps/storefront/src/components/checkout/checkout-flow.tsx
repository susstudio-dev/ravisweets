'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Lock, ShoppingBag } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import { formatMoney } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { useCoupons } from '@/lib/coupons/context';
import { useSession } from '@/lib/supabase/session-context';
import { commitOrderToSupabase } from '@/lib/supabase/orders';
import { AuthModal } from '@/components/auth/auth-modal';
import { generateOrderId, generateOrderNumber, saveOrder } from '@/lib/orders/store';
import type { Order, OrderAddress, PaymentMethod } from '@/lib/orders/types';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type Step = 'address' | 'payment' | 'review';

const STEP_ORDER: Step[] = ['address', 'payment', 'review'];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: 'upi', label: 'UPI', sub: 'GPay · PhonePe · Paytm · BHIM' },
  { id: 'card', label: 'Card', sub: 'Visa · Mastercard · RuPay · Amex' },
  { id: 'netbanking', label: 'Netbanking', sub: 'All major banks' },
  { id: 'cod', label: 'Cash on delivery', sub: 'Select pincodes only · phone verification' },
];

function emptyAddress(): OrderAddress {
  return {
    name: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  };
}

export function CheckoutFlow() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { lineViews, lineCount, subtotal, clear } = useCart();
  const {
    applied: appliedCoupons,
    totalDiscount,
    freeShipping,
    primaryCode,
    clear: clearCoupons,
  } = useCoupons();
  const { configured: authConfigured, user, isAnonymous } = useSession();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<OrderAddress>(emptyAddress());
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [errors, setErrors] = useState<Partial<Record<keyof OrderAddress, string>>>({});
  const [placing, startPlacing] = useTransition();
  const [authOpen, setAuthOpen] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(step);
  const shippingEstimate = lineCount === 0 ? 0 : freeShipping ? 0 : 99;
  const grandTotal = useMemo(
    () => ({
      amount: Math.max(0, subtotal.amount - totalDiscount + shippingEstimate),
      currency: subtotal.currency,
    }),
    [subtotal, shippingEstimate, totalDiscount],
  );

  function validateAddress(): boolean {
    const next: Partial<Record<keyof OrderAddress, string>> = {};
    if (!address.name.trim()) next.name = 'Required';
    if (!/^\+?\d[\d\s-]{8,14}\d$/.test(address.phone)) next.phone = 'Enter a valid phone';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address.email)) next.email = 'Enter a valid email';
    if (!address.line1.trim()) next.line1 = 'Required';
    if (!address.city.trim()) next.city = 'Required';
    if (!address.state.trim()) next.state = 'Required';
    if (!/^\d{6}$/.test(address.pincode)) next.pincode = '6-digit pincode';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (step === 'address') {
      if (!validateAddress()) return;
      setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    }
  }

  function goBack() {
    if (step === 'payment') setStep('address');
    else if (step === 'review') setStep('payment');
  }

  function placeOrder() {
    // Anonymous-then-claim: when Supabase is configured, require a real
    // identity (phone OTP, email OTP, or password) before order commit.
    // When not configured, the storefront falls back to localStorage-only
    // and orders are written under the demo identity.
    if (authConfigured && (!user || isAnonymous)) {
      setAuthOpen(true);
      return;
    }
    startPlacing(async () => {
      // Simulated payment latency — real Razorpay/Stripe flow replaces this.
      await new Promise((r) => setTimeout(r, 900));
      const id = generateOrderId();
      const number = generateOrderNumber();
      const order: Order = {
        id,
        number,
        placedAt: Date.now(),
        status: 'placed',
        address,
        payment: { method: payment, reference: `sim_${number}` },
        lines: lineViews.map((l) => ({
          productId: l.productId,
          productSlug: l.product.slug,
          productTitle: l.product.title,
          variantId: l.variantId,
          variantTitle: l.variant.title,
          quantity: l.quantity,
          unitPrice: l.variant.price,
          lineTotal: l.lineTotal,
          imageUrl: l.product.images[0]?.url,
        })),
        subtotal,
        shipping: { amount: shippingEstimate, currency: subtotal.currency },
        total: grandTotal,
      };
      // Always mirror to localStorage (so /orders pages and /account work
      // immediately + survive Supabase outages). When Supabase is configured,
      // also commit the row server-side under the customer's auth.uid().
      saveOrder(order);
      if (authConfigured) {
        const result = await commitOrderToSupabase({
          order,
          discount: totalDiscount,
          primaryCouponCode: primaryCode,
          redeemedCouponCodes: appliedCoupons.map((a) => a.coupon.code),
        });
        if (!result.ok) {
          // Non-fatal: localStorage write succeeded; warn for debugging.

          console.warn('Supabase order commit failed:', result.reason);
        }
      }
      clear();
      clearCoupons();
      router.push(`/orders?id=${id}`);
    });
  }

  if (lineCount === 0) {
    return (
      <section className="container-site flex min-h-[60vh] flex-col items-start gap-5 py-24">
        <Paisley size="lg" />
        <h1 className="font-display text-display-md text-theme-ink">Your cart is empty.</h1>
        <p className="max-w-lg text-theme-ink/70">
          Add something before you check out — our Hyderabadi specials are a good place to start.
        </p>
        <Link
          href="/category/hyderabadi-specials"
          className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)]"
        >
          Shop now
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <section className="container-site grid gap-10 py-10 md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-14">
      {/* Left: header + stepper + current step panel */}
      <div>
        <Reveal>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to cart
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Checkout
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-2 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
            One more step, then it&rsquo;s wrapped.
          </h1>
        </Reveal>

        {/* Stepper */}
        <ol className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          {STEP_ORDER.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors',
                    done
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : active
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-[color:var(--color-border)] text-theme-ink/40',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'transition-colors',
                    active ? 'text-theme-ink' : done ? 'text-theme-ink/80' : 'text-theme-ink/45',
                  )}
                >
                  {s === 'address' ? 'Address' : s === 'payment' ? 'Payment' : 'Review'}
                </span>
                {i < STEP_ORDER.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-[color:var(--color-border)]" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>

        {/* Step panels */}
        <div className="relative mt-10 min-h-[24rem]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'address' && (
              <motion.div
                key="address"
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="grid gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    name="name"
                    value={address.name}
                    onChange={(v) => setAddress({ ...address, name: v })}
                    error={errors.name}
                    autoComplete="name"
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    value={address.phone}
                    onChange={(v) => setAddress({ ...address, phone: v })}
                    error={errors.phone}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <Field
                  label="Email"
                  name="email"
                  value={address.email}
                  onChange={(v) => setAddress({ ...address, email: v })}
                  error={errors.email}
                  type="email"
                  autoComplete="email"
                />
                <Field
                  label="Address line 1"
                  name="line1"
                  value={address.line1}
                  onChange={(v) => setAddress({ ...address, line1: v })}
                  error={errors.line1}
                  autoComplete="address-line1"
                />
                <Field
                  label="Address line 2 (optional)"
                  name="line2"
                  value={address.line2 ?? ''}
                  onChange={(v) => setAddress({ ...address, line2: v })}
                  autoComplete="address-line2"
                />
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                  <Field
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={(v) => setAddress({ ...address, city: v })}
                    error={errors.city}
                    autoComplete="address-level2"
                  />
                  <Field
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={(v) => setAddress({ ...address, state: v })}
                    error={errors.state}
                    autoComplete="address-level1"
                  />
                  <Field
                    label="Pincode"
                    name="pincode"
                    value={address.pincode}
                    onChange={(v) => setAddress({ ...address, pincode: v })}
                    error={errors.pincode}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className="sm:w-32"
                  />
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="flex flex-col gap-3"
              >
                <p className="text-sm text-theme-ink/70">
                  We&rsquo;ll simulate the payment in this demo — nothing is charged.
                </p>
                <ul className="grid gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const selected = payment === m.id;
                    return (
                      <li key={m.id}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all',
                            selected
                              ? 'border-theme-accent bg-theme-glow/10 shadow-soft'
                              : 'border-[color:var(--color-border)] bg-surface-elevated hover:-translate-y-0.5 hover:border-theme-accent',
                          )}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={m.id}
                            checked={selected}
                            onChange={() => setPayment(m.id)}
                            className="mt-1 h-4 w-4 text-theme-accent focus:ring-theme-accent"
                          />
                          <div>
                            <p className="font-display text-base font-semibold text-theme-ink">
                              {m.label}
                            </p>
                            <p className="text-xs text-theme-ink/60">{m.sub}</p>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div
                key="review"
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="flex flex-col gap-5"
              >
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-theme-ink">
                      Shipping to
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep('address')}
                      className="text-xs font-semibold text-theme-accent hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-theme-ink/80">
                    {address.name}
                    <br />
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                    <br />
                    {address.city}, {address.state} {address.pincode}
                    <br />
                    {address.phone} · {address.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-theme-ink">
                      Paying with
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep('payment')}
                      className="text-xs font-semibold text-theme-accent hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-theme-ink/80">
                    {PAYMENT_METHODS.find((m) => m.id === payment)?.label}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
                  <h3 className="font-display text-base font-semibold text-theme-ink">
                    Items · {lineCount}
                  </h3>
                  <ul className="mt-3 flex flex-col divide-y divide-[color:var(--color-border)]">
                    {lineViews.map((l) => (
                      <li key={`${l.productId}-${l.variantId}`} className="flex justify-between gap-4 py-2 text-sm">
                        <span className="text-theme-ink/80">
                          {l.product.title}{' '}
                          <span className="text-theme-ink/50">· {l.variant.title} × {l.quantity}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-theme-ink">
                          {formatMoney(l.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div className="mt-10 flex items-center justify-between gap-3">
          {step !== 'address' ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-theme-ink/70 transition-colors hover:text-theme-accent"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          {step !== 'review' ? (
            <button
              type="button"
              onClick={goNext}
              className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              Continue
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full bg-theme-ink px-7 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300',
                placing ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-lifted',
              )}
            >
              {placing ? (
                <>
                  <motion.span
                    className="inline-block h-4 w-4 rounded-full border-2 border-[color:var(--theme-base)] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    aria-hidden="true"
                  />
                  Placing order…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Place order · {formatMoney(grandTotal)}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right: summary */}
      <aside aria-label="Order summary" className="md:sticky md:top-20 md:self-start">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-theme-accent" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-theme-ink">Order summary</h2>
          </div>
          <ul className="mt-4 flex max-h-60 flex-col gap-3 overflow-y-auto pr-1 text-sm">
            {lineViews.map((l) => (
              <li key={`${l.productId}-${l.variantId}`} className="flex justify-between gap-4">
                <span className="text-theme-ink/80">
                  <span className="line-clamp-1">{l.product.title}</span>
                  <span className="text-xs text-theme-ink/50">
                    {l.variant.title} · × {l.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-theme-ink">
                  {formatMoney(l.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-[color:var(--color-border)] pt-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">Subtotal</dt>
              <dd className="tabular-nums text-theme-ink">{formatMoney(subtotal)}</dd>
            </div>
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-theme-ink/70">
                  Discount{primaryCode ? ` · ${primaryCode}` : ''}
                </dt>
                <dd className="tabular-nums text-emerald-700">
                  −{formatMoney({ amount: totalDiscount, currency: subtotal.currency })}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">Shipping{freeShipping ? ' · free' : ''}</dt>
              <dd className="tabular-nums text-theme-ink">
                {formatMoney({ amount: shippingEstimate, currency: subtotal.currency })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">GST</dt>
              <dd className="tabular-nums text-theme-ink/60">Included</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
              <dt className="font-semibold text-theme-ink">Total</dt>
              <dd className="font-display text-2xl font-semibold text-theme-accent tabular-nums">
                {formatMoney(grandTotal)}
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          // Re-trigger placeOrder once the new identity is in session.
          window.setTimeout(placeOrder, 200);
        }}
      />
    </section>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  className,
}: FieldProps) {
  const invalid = Boolean(error);
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
        {label}
      </span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-err` : undefined}
        className={cn(
          'rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-theme-ink placeholder:text-theme-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2',
          invalid
            ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/30'
            : 'border-[color:var(--color-border)] focus-visible:border-theme-accent focus-visible:ring-theme-accent/30',
        )}
      />
      {invalid && (
        <span id={`${name}-err`} className="text-[11px] font-semibold text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
