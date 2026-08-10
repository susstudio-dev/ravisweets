'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Package, Sparkles, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatMoney } from '@ravisweets/shared';
import { getOrder } from '@/lib/orders/store';
import type { Order, OrderStatus } from '@/lib/orders/types';
import { Reveal } from '@/components/motion/reveal';
import { isUsableImage } from '@/lib/images';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * THE RECEIPT.
 *
 * The order confirmation is the torn-off copy of the docket: order number,
 * placed date, line items and totals as ruled rows on a `.docket--perf` — one
 * of the two surfaces the perf edge is reserved for (the other is the hero).
 */

const STATUS_STEPS: OrderStatus[] = ['placed', 'packed', 'shipped', 'delivered'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICON: Record<Exclude<OrderStatus, 'cancelled'>, typeof Check> = {
  placed: Check,
  packed: Package,
  shipped: Truck,
  delivered: Sparkles,
};

function formatPlacedDate(ts: number): string {
  return new Date(ts)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null | 'loading'>('loading');
  const reduced = useReducedMotion();

  useEffect(() => {
    const found = getOrder(orderId);
    setOrder(found ?? null);
  }, [orderId]);

  if (order === 'loading') {
    return (
      <section className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <motion.span
          className="border-theme-accent inline-block h-6 w-6 rounded-full border-2 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          aria-label="Loading order"
        />
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container-site flex min-h-[60vh] flex-col items-start gap-5 py-20">
        <span
          className="block h-10 w-10 rotate-45 border-2 border-dashed border-[color:var(--color-varak-rule)] opacity-50"
          aria-hidden="true"
        />
        <h1 className="font-display text-display-md text-theme-ink">Order not found.</h1>
        <p className="text-theme-ink/70 max-w-lg">
          This order isn&rsquo;t on this device. If you placed it elsewhere, sign in to see it.
        </p>
        <Link href="/account" className="stamp">
          Your orders
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <section className="container-site grid gap-10 py-12 md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-16">
      <div>
        {/* Confirmation strip */}
        <Reveal>
          <div className="docket flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
            <Check className="text-theme-accent h-4 w-4" aria-hidden="true" />
            <span className="text-theme-ink font-semibold">Order placed.</span>
            <span className="text-theme-ink/70">
              A confirmation is on its way to {order.address.email}.
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="font-display text-display-md text-theme-ink md:text-display-lg mt-8 leading-[1.02]">
            Thank you. We&rsquo;re on it.
          </h1>
        </Reveal>

        {/* Status record */}
        <ol className="mt-10 grid gap-2 sm:grid-cols-4">
          {STATUS_STEPS.map((s, i) => {
            const Icon = STATUS_ICON[s as keyof typeof STATUS_ICON];
            const reached = i <= currentIndex;
            return (
              <li
                key={s}
                className={cn(
                  'rounded-md border p-4 transition-colors',
                  reached
                    ? 'border-theme-accent bg-theme-glow/10'
                    : 'border-dashed border-[color:var(--color-border)] opacity-60',
                )}
              >
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: DURATION.slow,
                    ease: EASE.emphasised,
                    delay: i * 0.06,
                  }}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md',
                    reached
                      ? 'bg-theme-accent text-[color:var(--theme-base)]'
                      : 'bg-theme-ink/10 text-theme-ink/50',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </motion.div>
                <p className="field-label mt-2">{STATUS_LABEL[s]}</p>
              </li>
            );
          })}
        </ol>

        {/* THE RECEIPT — the perf edge belongs on order receipts (Perf-Edge Rule). */}
        <div className="docket docket--perf mt-10 p-5 md:p-7">
          <div className="docket-head">
            <h2 className="font-display text-theme-ink text-lg">Order receipt</h2>
            <span className="field-value text-xs">{order.number}</span>
          </div>
          <dl>
            <div className="field-row">
              <dt className="field-label">Order no.</dt>
              <dd className="field-value text-sm">{order.number}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Placed</dt>
              <dd className="field-value text-sm">{formatPlacedDate(order.placedAt)}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Status</dt>
              <dd className="field-value text-sm">{STATUS_LABEL[order.status].toUpperCase()}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Payment</dt>
              <dd className="field-value text-sm">
                {order.payment.method.toUpperCase()} · {order.payment.reference}
              </dd>
            </div>
          </dl>

          <h3 className="field-label mt-6">Items</h3>
          <ul className="mt-1">
            {order.lines.map((l) => (
              <li
                key={`${l.productId}-${l.variantId}`}
                className="field-row items-center text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <OrderLineThumb imageUrl={l.imageUrl} />
                  <div className="min-w-0">
                    <Link
                      href={`/product/${l.productSlug}`}
                      className="text-theme-ink hover:text-theme-accent font-medium transition-colors"
                    >
                      {l.productTitle}
                    </Link>
                    <p className="text-theme-ink/60 text-xs">
                      {l.variantTitle} · × {l.quantity}
                    </p>
                  </div>
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
              <dd className="field-value text-sm">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Shipping</dt>
              <dd className="field-value text-sm">{formatMoney(order.shipping)}</dd>
            </div>
            {(order.fees ?? []).map((f) => (
              <div key={f.label} className="field-row">
                <dt className="field-label">{f.label}</dt>
                <dd className="field-value text-sm">{formatMoney(f.amount)}</dd>
              </div>
            ))}
            {(order.discount?.amount ?? 0) > 0 && (
              <div className="field-row">
                <dt className="field-label">Discount</dt>
                <dd className="field-value text-sm text-[#1F6238]">
                  −{formatMoney(order.discount!)}
                </dd>
              </div>
            )}
            <div className="field-row">
              <dt className="field-label text-theme-ink">Total</dt>
              <dd className="field-value text-theme-ink text-lg font-bold">
                {formatMoney(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="stamp stamp--ghost">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/account" className="stamp">
            Your orders
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Right: dispatch address as ruled rows */}
      <aside aria-label="Order details">
        <div className="docket p-5">
          <div className="docket-head">
            <h3 className="font-display text-theme-ink text-base">Dispatch to</h3>
          </div>
          <dl>
            <div className="field-row">
              <dt className="field-label">Name</dt>
              <dd className="field-value text-right text-sm">{order.address.name}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Address</dt>
              <dd className="field-value text-right text-sm">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">City</dt>
              <dd className="field-value text-right text-sm">
                {order.address.city}, {order.address.state}
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Pincode</dt>
              <dd className="field-value text-right text-sm">{order.address.pincode}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Phone</dt>
              <dd className="field-value text-right text-sm">{order.address.phone}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </section>
  );
}

/**
 * Line-item plate on the receipt. Decided at render (lib/images.ts) so a dead
 * catalogue URL never becomes a request; the fallback is the dashed specimen
 * plate on a manila wash.
 */
function OrderLineThumb({ imageUrl }: { imageUrl?: string }) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed || !isUsableImage(imageUrl)) {
    return (
      <span
        className="bg-theme-glow/20 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color:var(--color-border)]"
        aria-hidden="true"
      >
        <span className="block h-5 w-5 rotate-45 border-2 border-dashed border-[color:var(--color-varak-rule)] opacity-50" />
      </span>
    );
  }

  return (
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[color:var(--color-border)]">
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="48px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
