'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { formatMoney } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { useCoupons } from '@/lib/coupons/context';
import { Paisley } from '@/components/brand/paisley';
import { CouponInput } from '@/components/cart/coupon-input';
import { Reveal } from '@/components/motion/reveal';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

export function CartView() {
  const { lineViews, lineCount, subtotal, updateQty, remove, clear } = useCart();
  const { totalDiscount, freeShipping } = useCoupons();
  const reduced = useReducedMotion();

  const shippingEstimate = lineCount === 0 ? 0 : freeShipping ? 0 : 99;
  const grandTotal = {
    amount: Math.max(0, subtotal.amount - totalDiscount + shippingEstimate),
    currency: subtotal.currency,
  };

  if (lineCount === 0) {
    return (
      <section className="container-site flex min-h-[60vh] flex-col items-start gap-5 py-24">
        <Paisley size="lg" />
        <h1 className="font-display text-display-md text-theme-ink">Your cart is empty.</h1>
        <p className="max-w-lg text-theme-ink/70">
          Nothing in the box yet. Browse our Hyderabadi specials or a curated gift hamper — every
          sweet is fresh today.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/category/hyderabadi-specials"
            className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            Shop Hyderabadi specials
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-5 py-2.5 text-sm font-semibold text-theme-ink transition-colors duration-300 hover:border-theme-accent hover:text-theme-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-site grid gap-10 py-12 md:grid-cols-[1.5fr_1fr] md:gap-14 md:py-16">
      <div>
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Your cart
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
            {lineCount} {lineCount === 1 ? 'item' : 'items'}, ready to wrap.
          </h1>
        </Reveal>

        <ul className="mt-10 flex flex-col divide-y divide-[color:var(--color-border)]">
          <AnimatePresence initial={false}>
            {lineViews.map((l) => {
              const img = l.product.images[0];
              return (
                <motion.li
                  key={`${l.productId}-${l.variantId}`}
                  layout
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: DURATION.quick, ease: EASE.standard }}
                  className="flex gap-4 py-5"
                >
                  <Link
                    href={`/product/${l.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-[color:var(--color-border)]"
                    style={{ backgroundColor: l.product.theme_palette.base }}
                  >
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${l.product.slug}`}
                          className="font-display text-lg font-semibold text-theme-ink hover:text-theme-accent"
                        >
                          {l.product.title}
                        </Link>
                        <p className="text-xs text-theme-ink/60">
                          {l.variant.title} · SKU {l.variant.sku}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.productId, l.variantId)}
                        aria-label={`Remove ${l.product.title}`}
                        className="rounded-full p-1 text-theme-ink/50 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-surface-elevated">
                        <button
                          type="button"
                          onClick={() => updateQty(l.productId, l.variantId, l.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="rounded-full p-1.5 text-theme-ink/70 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span
                          className="min-w-8 text-center text-sm font-semibold tabular-nums text-theme-ink"
                          aria-live="polite"
                        >
                          {l.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(l.productId, l.variantId, l.quantity + 1)}
                          aria-label="Increase quantity"
                          className="rounded-full p-1.5 text-theme-ink/70 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-display text-lg font-semibold text-theme-accent tabular-nums">
                        {formatMoney(l.lineTotal)}
                      </span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-theme-ink/70 transition-colors hover:text-theme-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold uppercase tracking-wider text-theme-ink/55 transition-colors hover:text-red-700"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside
        aria-label="Order summary"
        className="md:sticky md:top-20 md:self-start"
      >
        <CouponInput />
        <div className="mt-4 rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-theme-ink">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">Subtotal</dt>
              <dd className="font-semibold tabular-nums text-theme-ink">
                {formatMoney(subtotal)}
              </dd>
            </div>
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-emerald-700">Coupon discount</dt>
                <dd className="font-semibold tabular-nums text-emerald-700">
                  − {formatMoney({ amount: totalDiscount, currency: subtotal.currency })}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">
                Shipping (estimate){freeShipping && ' · waived'}
              </dt>
              <dd className="tabular-nums text-theme-ink">
                {freeShipping
                  ? 'Free'
                  : formatMoney({ amount: shippingEstimate, currency: subtotal.currency })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-theme-ink/70">GST</dt>
              <dd className="tabular-nums text-theme-ink/60">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-3 text-base">
              <dt className="font-semibold text-theme-ink">Total</dt>
              <dd className="font-display text-2xl font-semibold text-theme-accent tabular-nums">
                {formatMoney(grandTotal)}
              </dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="group mt-6 flex items-center justify-center gap-2 rounded-full bg-theme-ink px-5 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          <p className="mt-4 text-center text-[11px] text-theme-ink/55">
            Checkout is coming — this flow is a placeholder until payments are wired.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--color-border)] p-5 text-sm text-theme-ink/70">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-theme-accent">
            <Paisley size="sm" />
            Fresh guarantee
          </p>
          <p className="mt-2">
            Every box leaves the kitchen the morning it ships. Chilled-safe packaging with gel packs
            for perishable items.
          </p>
        </div>
      </aside>
    </section>
  );
}
