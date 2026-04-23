'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Package, Sparkles, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatMoney } from '@ravisweets/shared';
import { getOrder } from '@/lib/orders/store';
import type { Order, OrderStatus } from '@/lib/orders/types';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

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
          className="inline-block h-6 w-6 rounded-full border-2 border-theme-accent border-t-transparent"
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
        <Paisley size="lg" />
        <h1 className="font-display text-display-md text-theme-ink">Order not found.</h1>
        <p className="max-w-lg text-theme-ink/70">
          This order isn&rsquo;t on this device. If you placed it elsewhere, sign in to see it.
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)]"
        >
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
        {/* Success banner */}
        <Reveal>
          <div className="flex items-center gap-3 rounded-full bg-theme-glow/20 px-4 py-2 text-sm text-theme-ink">
            <Check className="h-4 w-4 text-theme-accent" aria-hidden="true" />
            <span className="font-semibold">Order placed.</span>
            <span className="text-theme-ink/70">
              A confirmation is on its way to {order.address.email}.
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Order {order.number}
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <h1 className="mt-2 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
            Thank you. We&rsquo;re on it.
          </h1>
        </Reveal>

        {/* Status timeline */}
        <ol className="mt-10 grid gap-4 sm:grid-cols-4">
          {STATUS_STEPS.map((s, i) => {
            const Icon = STATUS_ICON[s as keyof typeof STATUS_ICON];
            const reached = i <= currentIndex;
            return (
              <li
                key={s}
                className={cn(
                  'rounded-2xl border p-4 transition-colors',
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
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    reached
                      ? 'bg-theme-accent text-[color:var(--theme-base)]'
                      : 'bg-[color:var(--color-border)]/40 text-theme-ink/50',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </motion.div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-theme-ink/80">
                  {STATUS_LABEL[s]}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Line items */}
        <div className="mt-10 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-theme-ink">Items</h2>
          <ul className="mt-4 flex flex-col divide-y divide-[color:var(--color-border)]">
            {order.lines.map((l) => (
              <li key={`${l.productId}-${l.variantId}`} className="flex gap-4 py-4">
                {l.imageUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image src={l.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${l.productSlug}`}
                      className="font-display text-base font-semibold text-theme-ink hover:text-theme-accent"
                    >
                      {l.productTitle}
                    </Link>
                    <p className="text-xs text-theme-ink/60">
                      {l.variantTitle} · × {l.quantity}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-theme-ink">
                    {formatMoney(l.lineTotal)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-5 py-2.5 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-accent hover:text-theme-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            Your orders
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Right: address + payment + total */}
      <aside aria-label="Order details">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
              Shipping to
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-theme-ink/85">
              {order.address.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ''}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
              Payment
            </h3>
            <p className="mt-2 text-sm text-theme-ink/85">
              {order.payment.method.toUpperCase()} · ref{' '}
              <span className="font-mono text-xs">{order.payment.reference}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
              Totals
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-theme-ink/70">Subtotal</dt>
                <dd className="tabular-nums text-theme-ink">{formatMoney(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-theme-ink/70">Shipping</dt>
                <dd className="tabular-nums text-theme-ink">{formatMoney(order.shipping)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-2">
                <dt className="font-semibold text-theme-ink">Total</dt>
                <dd className="font-display text-xl font-semibold text-theme-accent tabular-nums">
                  {formatMoney(order.total)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </aside>
    </section>
  );
}
