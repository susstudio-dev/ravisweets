'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useMemo, useRef, useState, useTransition } from 'react';
import { formatMoney } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { useCoupons } from '@/lib/coupons/context';
import { useSession } from '@/lib/supabase/session-context';
import { getSupabase } from '@/lib/supabase/client';
import { commitOrderToSupabase, sendOrderEmail } from '@/lib/supabase/orders';
import { AuthModal } from '@/components/auth/auth-modal';
import { generateOrderId, generateOrderNumber, saveOrder } from '@/lib/orders/store';
import type { Order, OrderAddress, PaymentMethod } from '@/lib/orders/types';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * THE CHECKOUT DOCKET.
 *
 * Three numbered strips on one form: 01 ADDRESS / 02 DISPATCH / 03 PAYMENT.
 * The completed strips stay on the sheet with an Edit affordance; the active
 * strip holds the fields. Validation is inline ink-red text under the field —
 * no toasts.
 *
 * PAYMENT. The `razorpay-order` Supabase Edge Function is the trusted half:
 * `create` reads the amount from the order row server-side, `verify`
 * recomputes the HMAC before anything is marked paid. When the function is
 * not deployed (or keys are unset) the flow falls back to confirming the
 * order and collecting payment on delivery or by phone — stated honestly,
 * with no padlock and no rupee amount on the terminal button.
 */

type Step = 'address' | 'dispatch' | 'payment';

const STEP_ORDER: Step[] = ['address', 'dispatch', 'payment'];

const STEP_LABEL: Record<Step, string> = {
  address: 'Address',
  dispatch: 'Dispatch',
  payment: 'Payment',
};

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

/* ── Razorpay glue ─────────────────────────────────────────────────────── */

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

type RazorpayCtor = new (options: RazorpayOptions) => { open: () => void };

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Loads checkout.js on demand — never at render, never as a preload. */
function loadRazorpay(): Promise<RazorpayCtor | null> {
  return new Promise((resolve) => {
    const w = window as Window & { Razorpay?: RazorpayCtor };
    if (w.Razorpay) {
      resolve(w.Razorpay);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(w.Razorpay ?? null));
    script.addEventListener('error', () => resolve(null));
    if (!existing) {
      script.src = RAZORPAY_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

type PayAttempt =
  | { kind: 'paid'; paymentId: string }
  | { kind: 'unavailable' }
  | { kind: 'dismissed' }
  | { kind: 'verify-failed' };

/**
 * create → open checkout → verify. Success ONLY after the edge function has
 * verified the signature server-side; a forged browser callback marks nothing
 * paid. Any infrastructure failure (function not deployed, keys unset, script
 * blocked) resolves to 'unavailable' and the caller falls back honestly.
 */
async function attemptRazorpayPayment(order: Order): Promise<PayAttempt> {
  const supa = await getSupabase();
  if (!supa) return { kind: 'unavailable' };

  /*
   * Named rather than inlined: `data as typeof created` inside the try would
   * capture the NARROWED type of `created` (null at that point, since it was
   * initialised null), typing the variable null forever and making every
   * later property access `never`.
   */
  interface RazorpayCreateResponse {
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    error?: string;
  }
  let created: RazorpayCreateResponse | null = null;
  try {
    const { data, error } = await supa.functions.invoke('razorpay-order', {
      body: { action: 'create', orderId: order.id },
    });
    if (error) return { kind: 'unavailable' };
    created = data as RazorpayCreateResponse | null;
  } catch {
    return { kind: 'unavailable' };
  }
  if (!created || created.error || !created.razorpayOrderId || !created.keyId) {
    return { kind: 'unavailable' };
  }
  // Property reads (not destructuring) so the truthiness narrowing above holds.
  const razorpayOrderId = created.razorpayOrderId;
  const keyId = created.keyId;
  const amount = created.amount;
  const currency = created.currency;

  const Razorpay = await loadRazorpay();
  if (!Razorpay) return { kind: 'unavailable' };

  const response = await new Promise<RazorpaySuccess | 'dismissed' | 'failed'>((resolve) => {
    try {
      const rzp = new Razorpay({
        key: keyId,
        order_id: razorpayOrderId,
        amount,
        currency,
        name: 'Ravi Sweets',
        description: `Order ${order.number}`,
        prefill: {
          name: order.address.name,
          email: order.address.email,
          contact: order.address.phone,
        },
        handler: (res) => resolve(res),
        modal: { ondismiss: () => resolve('dismissed') },
      });
      rzp.open();
    } catch {
      resolve('failed');
    }
  });
  if (response === 'failed') return { kind: 'unavailable' };
  if (response === 'dismissed') return { kind: 'dismissed' };

  try {
    const { data, error } = await supa.functions.invoke('razorpay-order', {
      body: {
        action: 'verify',
        orderId: order.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      },
    });
    if (error) return { kind: 'verify-failed' };
    const verdict = data as { ok?: boolean } | null;
    if (verdict?.ok) return { kind: 'paid', paymentId: response.razorpay_payment_id };
    return { kind: 'verify-failed' };
  } catch {
    return { kind: 'verify-failed' };
  }
}

/* ── The flow ──────────────────────────────────────────────────────────── */

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
  const [payError, setPayError] = useState<string | null>(null);
  const [placing, startPlacing] = useTransition();
  const [authOpen, setAuthOpen] = useState(false);
  // One order per checkout session — a dismissed payment retries against the
  // SAME order id instead of minting a duplicate row.
  const pendingOrderRef = useRef<Order | null>(null);
  const committedRef = useRef(false);
  const busyRef = useRef(false);

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
      setStep('dispatch');
    } else if (step === 'dispatch') {
      setStep('payment');
    }
  }

  function goBack() {
    if (step === 'dispatch') setStep('address');
    else if (step === 'payment') setStep('dispatch');
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
      if (busyRef.current) return;
      busyRef.current = true;
      setPayError(null);
      try {
        // Reuse id/number across retries; refresh the mutable fields.
        const prev = pendingOrderRef.current;
        const number = prev?.number ?? generateOrderNumber();
        const order: Order = {
          id: prev?.id ?? generateOrderId(),
          number,
          placedAt: prev?.placedAt ?? Date.now(),
          status: 'placed',
          address,
          payment: { method: payment, reference: prev?.payment.reference ?? `sim_${number}` },
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
        pendingOrderRef.current = order;
        // Always mirror to localStorage (so /orders pages and /account work
        // immediately + survive Supabase outages). When Supabase is configured,
        // also commit the row server-side under the customer's auth.uid().
        saveOrder(order);
        if (authConfigured && !committedRef.current) {
          const result = await commitOrderToSupabase({
            order,
            discount: totalDiscount,
            primaryCouponCode: primaryCode,
            redeemedCouponCodes: appliedCoupons.map((a) => a.coupon.code),
          });
          if (!result.ok) {
            // Non-fatal: localStorage write succeeded; warn for debugging.

            console.warn('Supabase order commit failed:', result.reason);
          } else {
            committedRef.current = true;
            // Fire the order-confirmation email. No-ops silently if Resend
            // isn't yet wired up in Supabase secrets.
            void sendOrderEmail(order.id, 'placed');
          }
        }

        // Online payment. Only attempted when the order row exists server-side
        // (the edge function reads the amount from the DB, never the client)
        // and the buyer chose an online method. COD — and any build where the
        // function is not deployed — goes straight to confirmation.
        if (committedRef.current && payment !== 'cod') {
          const attempt = await attemptRazorpayPayment(order);
          if (attempt.kind === 'dismissed') {
            setPayError('Payment was not completed. Try again, or choose cash on delivery.');
            return;
          }
          if (attempt.kind === 'verify-failed') {
            setPayError(
              `We could not verify that payment. If an amount was debited, contact us quoting order ${order.number} before retrying.`,
            );
            return;
          }
          if (attempt.kind === 'paid') {
            const paid: Order = {
              ...order,
              payment: { ...order.payment, reference: attempt.paymentId },
            };
            pendingOrderRef.current = paid;
            saveOrder(paid);
          }
          /*
           * 'unavailable' used to fall through here and confirm the order, on
           * the reasoning that payment could be collected on delivery or by
           * phone. That is wrong when the buyer picked an ONLINE method: they
           * chose UPI/card/netbanking, were shown a confirmation, and were
           * never charged — while the shop gets an unpaid order and no signal
           * that anything failed. Nothing on the form promises phone
           * collection for an online method, so the fallback was silent, not
           * honest.
           *
           * `attemptRazorpayPayment` returns 'unavailable' for EVERY
           * infrastructure fault — function not deployed, keys unset, checkout
           * script blocked by an ad-blocker, create call rejected. All of them
           * are conditions the buyer can act on, so say so and let them retry
           * or switch to cash on delivery. The order row is already committed,
           * so retrying reuses the same id and number rather than duplicating.
           */
          if (attempt.kind === 'unavailable') {
            setPayError(
              `We could not open the payment window, so order ${order.number} has not been paid for. ` +
                'Try again, or choose cash on delivery. Nothing has been charged.',
            );
            return;
          }
        }

        clear();
        clearCoupons();
        router.push(`/orders?id=${order.id}`);
      } finally {
        busyRef.current = false;
      }
    });
  }

  if (lineCount === 0) {
    return (
      <section className="container-site flex min-h-[60vh] flex-col items-start gap-5 py-24">
        <span
          className="block h-10 w-10 rotate-45 border-2 border-dashed border-[color:var(--color-varak-rule)] opacity-50"
          aria-hidden="true"
        />
        <h1 className="font-display text-display-md text-theme-ink">Your cart is empty.</h1>
        <p className="text-theme-ink/70 max-w-lg">
          Add something before you check out — our Hyderabadi specials are a good place to start.
        </p>
        <Link href="/category/hyderabadi-specials" className="stamp">
          Shop now
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <section className="container-site grid gap-10 py-10 md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-14">
      {/* Left: header + the three numbered strips */}
      <div>
        <Reveal>
          <Link
            href="/cart"
            className="text-theme-ink/70 hover:text-theme-accent inline-flex items-center gap-1.5 text-sm underline underline-offset-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to cart
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-display-md text-theme-ink md:text-display-lg mt-6 leading-[1.02]">
            One more step, then it&rsquo;s wrapped.
          </h1>
        </Reveal>

        <ol className="mt-10 flex flex-col gap-4" aria-label="Checkout steps">
          {STEP_ORDER.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li key={s} aria-current={active ? 'step' : undefined}>
                <div className={cn('docket-head', !active && 'mb-0')}>
                  <h2
                    className={cn(
                      'font-display flex items-baseline gap-3 text-base font-semibold transition-colors',
                      active ? 'text-theme-ink' : done ? 'text-theme-ink/80' : 'text-theme-ink/45',
                    )}
                  >
                    <span className="field-value text-sm" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {STEP_LABEL[s]}
                  </h2>
                  {done && (
                    <button
                      type="button"
                      onClick={() => setStep(s)}
                      className="text-theme-accent hover:text-theme-ink inline-flex min-h-9 items-center gap-1 text-xs font-semibold underline underline-offset-4 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                  )}
                </div>

                {active && s === 'address' && (
                  <motion.div
                    key="panel-address"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
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

                {active && s === 'dispatch' && (
                  <motion.div
                    key="panel-dispatch"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.quick, ease: EASE.standard }}
                    className="flex flex-col gap-5"
                  >
                    <div className="docket p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="field-label">Dispatch to</h3>
                        <button
                          type="button"
                          onClick={() => setStep('address')}
                          className="text-theme-accent hover:text-theme-ink text-xs font-semibold underline underline-offset-4 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-theme-ink/80 mt-2 text-sm leading-relaxed">
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

                    <div className="docket p-5">
                      <h3 className="field-label">Items · {lineCount}</h3>
                      <ul className="mt-2">
                        {lineViews.map((l) => (
                          <li
                            key={`${l.productId}-${l.variantId}`}
                            className="field-row text-sm"
                          >
                            <span className="text-theme-ink/80 min-w-0">
                              {l.product.title}{' '}
                              <span className="text-theme-ink/50">
                                · {l.variant.title} × {l.quantity}
                              </span>
                            </span>
                            <span className="field-value text-theme-ink shrink-0 text-sm">
                              {formatMoney(l.lineTotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-3 border-t border-[color:var(--color-rule)] pt-1">
                        <div className="field-row">
                          <dt className="field-label">
                            Shipping{freeShipping ? ' · waived' : ' (estimate)'}
                          </dt>
                          <dd className="field-value text-sm">
                            {formatMoney({
                              amount: shippingEstimate,
                              currency: subtotal.currency,
                            })}
                          </dd>
                        </div>
                        <div className="field-row">
                          <dt className="field-label">Dispatch</dt>
                          <dd className="field-value text-sm">SAME DAY</dd>
                        </div>
                      </dl>
                    </div>
                  </motion.div>
                )}

                {active && s === 'payment' && (
                  <motion.div
                    key="panel-payment"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.quick, ease: EASE.standard }}
                    className="flex flex-col gap-3"
                  >
                    <ul className="grid gap-2">
                      {PAYMENT_METHODS.map((m) => {
                        const selected = payment === m.id;
                        return (
                          <li key={m.id}>
                            <label
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
                                selected
                                  ? 'border-theme-accent bg-theme-glow/10'
                                  : 'bg-surface-elevated hover:border-theme-accent border-[color:var(--color-border)]',
                              )}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={m.id}
                                checked={selected}
                                onChange={() => setPayment(m.id)}
                                className="text-theme-accent focus:ring-theme-accent mt-1 h-4 w-4"
                              />
                              <div>
                                <p className="font-display text-theme-ink text-base">{m.label}</p>
                                <p className="text-theme-ink/60 text-xs">{m.sub}</p>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-theme-ink/70 text-sm">
                      If online payment is unavailable right now, we&rsquo;ll confirm your order
                      and collect payment on delivery or by phone.
                    </p>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step !== 'address' ? (
            <button
              type="button"
              onClick={goBack}
              className="text-theme-ink/70 hover:text-theme-accent inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          {step !== 'payment' ? (
            <button type="button" onClick={goNext} className="stamp">
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className={cn('stamp', placing && 'cursor-wait opacity-70')}
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
                'Place order'
              )}
            </button>
          )}
        </div>
        {payError && (
          <p className="mt-3 text-right text-xs font-semibold text-red-700" role="alert">
            {payError}
          </p>
        )}
      </div>

      {/* Right: summary */}
      <aside aria-label="Order summary" className="md:sticky md:top-20 md:self-start">
        <div className="docket p-5 md:p-6">
          <div className="docket-head">
            <h2 className="font-display text-theme-ink text-lg">Order summary</h2>
            <span className="field-value text-xs">
              {lineCount === 1 ? '1 ITEM' : `${lineCount} ITEMS`}
            </span>
          </div>
          <ul className="max-h-60 overflow-y-auto pr-1">
            {lineViews.map((l) => (
              <li key={`${l.productId}-${l.variantId}`} className="field-row text-sm">
                <div className="min-w-0">
                  <p className="text-theme-ink/80 line-clamp-1">{l.product.title}</p>
                  <p className="text-theme-ink/50 text-xs">
                    {l.variant.title} · × {l.quantity}
                  </p>
                </div>
                <span className="field-value text-theme-ink shrink-0 text-sm">
                  {formatMoney(l.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 border-t border-[color:var(--color-rule)] pt-1">
            <div className="field-row">
              <dt className="field-label">Subtotal</dt>
              <dd className="field-value text-sm">{formatMoney(subtotal)}</dd>
            </div>
            {totalDiscount > 0 && (
              <div className="field-row">
                <dt className="field-label">
                  Discount{primaryCode ? ` · ${primaryCode}` : ''}
                </dt>
                <dd className="field-value text-sm text-[#1F6238]">
                  −{formatMoney({ amount: totalDiscount, currency: subtotal.currency })}
                </dd>
              </div>
            )}
            <div className="field-row">
              <dt className="field-label">Shipping{freeShipping ? ' · free' : ''}</dt>
              <dd className="field-value text-sm">
                {formatMoney({ amount: shippingEstimate, currency: subtotal.currency })}
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">GST</dt>
              <dd className="field-value text-text-muted text-sm">Included</dd>
            </div>
            <div className="field-row">
              <dt className="field-label text-theme-ink">Total</dt>
              <dd className="field-value text-theme-ink text-lg font-bold">
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
      <span className="field-label">{label}</span>
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
          'bg-surface text-theme-ink placeholder:text-theme-ink/40 rounded-md border px-3.5 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2',
          invalid
            ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/30'
            : 'focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 border-[color:var(--color-border)]',
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
