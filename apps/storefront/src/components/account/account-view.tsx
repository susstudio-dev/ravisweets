'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { formatMoney } from '@ravisweets/shared';
import { getOrders } from '@/lib/orders/store';
import type { Order } from '@/lib/orders/types';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AccountView() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  if (orders === null) {
    return (
      <section className="container-site py-20">
        <div className="h-10 w-40 animate-pulse rounded bg-theme-ink/10" />
      </section>
    );
  }

  return (
    <section className="container-site py-12 md:py-16">
      <Reveal>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Paisley size="sm" />
          Your account
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
          Orders
        </h1>
      </Reveal>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-10">
          <Package className="h-6 w-6 text-theme-accent" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-theme-ink">No orders yet.</p>
          <p className="max-w-lg text-sm text-theme-ink/70">
            When you place your first order, it&rsquo;ll appear here with its tracking status.
          </p>
          <Link
            href="/category/hyderabadi-specials"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Start shopping
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <Stagger gap={70} className="mt-10 grid gap-4">
          {orders.map((o) => {
            const firstLine = o.lines[0];
            return (
              <Link
                key={o.id}
                href={`/orders?id=${o.id}`}
                className="group grid gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                {firstLine?.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={firstLine.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-theme-glow/20 text-theme-accent">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
                      {o.number}
                    </span>
                    <span
                      className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-ink"
                      aria-label={`Status: ${o.status}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="font-display text-base font-semibold text-theme-ink">
                    {o.lines.length === 1
                      ? o.lines[0]!.productTitle
                      : `${o.lines[0]!.productTitle} +${o.lines.length - 1} more`}
                  </p>
                  <p className="text-xs text-theme-ink/60">Placed {formatDate(o.placedAt)}</p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="font-display text-lg font-semibold text-theme-accent tabular-nums">
                    {formatMoney(o.total)}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-theme-ink/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-theme-accent"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </Stagger>
      )}
    </section>
  );
}
