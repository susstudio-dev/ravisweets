'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { formatMoney, type Product } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { useCoupons } from '@/lib/coupons/context';
import { CouponInput } from '@/components/cart/coupon-input';
import { Reveal } from '@/components/motion/reveal';
import { isUsableImage } from '@/lib/images';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * THE ORDER FORM.
 *
 * The cart is the customer's half of the batch card: line items as ruled rows
 * (plate, name, weight, a square quantity stepper, a typed line total), and a
 * summary that reads as the subtotal block at the foot of a form. Every
 * recorded value — quantity, price, total — is set in the mono, tabular.
 */
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
        {/* An empty specimen plate — the same mark the product card falls back to. */}
        <span
          className="block h-10 w-10 rotate-45 border-2 border-dashed border-[color:var(--color-varak-rule)] opacity-50"
          aria-hidden="true"
        />
        <h1 className="font-display text-display-md text-theme-ink">Your cart is empty.</h1>
        <p className="text-theme-ink/70 max-w-lg">
          Nothing in the box yet. Browse our Hyderabadi specials or a curated gift hamper — every
          sweet is fresh today.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/category/hyderabadi-specials" className="stamp">
            Shop Hyderabadi specials
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className="stamp stamp--ghost">
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
          <h1 className="font-display text-display-md text-theme-ink md:text-display-lg leading-[1.02]">
            {lineCount} {lineCount === 1 ? 'item' : 'items'}, ready to wrap.
          </h1>
        </Reveal>

        <div className="docket-head mt-8">
          <p className="field-label">Order form</p>
          <span className="field-value text-xs">
            {lineCount === 1 ? '1 ITEM' : `${lineCount} ITEMS`}
          </span>
        </div>

        <ul className="flex flex-col divide-y divide-[color:var(--color-border)] border-b border-[color:var(--color-border)]">
          <AnimatePresence initial={false}>
            {lineViews.map((l) => (
              <motion.li
                key={`${l.productId}-${l.variantId}`}
                layout
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="flex gap-4 py-5"
              >
                <CartLineThumb product={l.product} />

                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${l.product.slug}`}
                        className="font-display text-theme-ink hover:text-theme-accent text-base font-semibold leading-snug transition-colors"
                      >
                        {l.product.title}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                        <span className="field-label">{l.variant.title}</span>
                        <span className="field-value text-text-muted text-xs">
                          SKU {l.variant.sku}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.productId, l.variantId)}
                      aria-label={`Remove ${l.product.title}`}
                      className="text-theme-ink/50 hover:text-theme-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors hover:border-[color:var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4">
                    {/* Square stepper — a counter on a form, not a pill. */}
                    <div className="bg-surface-elevated inline-flex items-stretch rounded-md border border-[color:var(--color-border)]">
                      <button
                        type="button"
                        onClick={() => updateQty(l.productId, l.variantId, l.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="text-theme-ink/70 hover:bg-theme-glow/20 hover:text-theme-ink flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span
                        className="field-value text-theme-ink flex min-w-[2.25rem] items-center justify-center border-x border-[color:var(--color-border)] px-1 text-sm"
                        aria-live="polite"
                      >
                        {l.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(l.productId, l.variantId, l.quantity + 1)}
                        aria-label="Increase quantity"
                        className="text-theme-ink/70 hover:bg-theme-glow/20 hover:text-theme-ink flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="field-value text-theme-ink text-base font-bold">
                      {formatMoney(l.lineTotal)}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-theme-ink/70 hover:text-theme-accent inline-flex items-center gap-1.5 text-sm underline underline-offset-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-theme-ink/60 text-sm underline underline-offset-4 transition-colors hover:text-red-700"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* Summary — the subtotal block at the foot of the form. */}
      <aside aria-label="Order summary" className="md:sticky md:top-20 md:self-start">
        <CouponInput />
        <div className="docket mt-4 p-5 md:p-6">
          <div className="docket-head">
            <h2 className="font-display text-theme-ink text-lg">Summary</h2>
          </div>
          <dl>
            <div className="field-row">
              <dt className="field-label">Subtotal</dt>
              <dd className="field-value text-sm">{formatMoney(subtotal)}</dd>
            </div>
            {totalDiscount > 0 && (
              <div className="field-row">
                <dt className="field-label">Coupon discount</dt>
                <dd className="field-value text-sm text-[#1F6238]">
                  − {formatMoney({ amount: totalDiscount, currency: subtotal.currency })}
                </dd>
              </div>
            )}
            <div className="field-row">
              <dt className="field-label">
                Shipping (estimate){freeShipping && ' · waived'}
              </dt>
              <dd className="field-value text-sm">
                {freeShipping
                  ? 'FREE'
                  : formatMoney({ amount: shippingEstimate, currency: subtotal.currency })}
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">GST</dt>
              <dd className="field-value text-text-muted text-xs">Calculated at checkout</dd>
            </div>
            <div className="field-row">
              <dt className="field-label text-theme-ink">Total</dt>
              <dd className="field-value text-theme-ink text-lg font-bold">
                {formatMoney(grandTotal)}
              </dd>
            </div>
          </dl>

          <Link href="/checkout" className="stamp group mt-6 flex w-full">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Proceed to checkout
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          {/*
            The line that used to sit here read "Checkout is coming — this flow
            is a placeholder until payments are wired", directly beneath the
            primary CTA. It told every motivated buyer to stop. Removed: the
            honest statement about payment belongs at the payment step, not
            under the button that starts the flow.
          */}
          <p className="field-label mt-3 text-center">
            Dispatched same day · Fresh guarantee
          </p>
        </div>

        <div className="text-theme-ink/70 mt-6 rounded-lg border border-dashed border-[color:var(--color-border)] p-5 text-sm">
          <p className="field-label flex items-center gap-2">
            <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
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

/**
 * The plate on a cart row. Decided at render (see lib/images.ts) so a dead
 * catalogue URL never becomes a request; falls back to the dashed specimen
 * plate on the product's flavour wash, same as the product card.
 */
function CartLineThumb({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const img = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={product.title}
      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[color:var(--color-border)]"
      style={{ backgroundColor: product.theme_palette.glow + '33' }}
    >
      {img && !failed && isUsableImage(img.url) ? (
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes="80px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span
            className="block h-8 w-8 rotate-45 border-2 border-dashed"
            style={{ borderColor: product.theme_palette.accent, opacity: 0.4 }}
          />
        </span>
      )}
    </Link>
  );
}
