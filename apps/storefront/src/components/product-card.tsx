'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { computeEffectivePrice, formatMoney, type Product } from '@ravisweets/shared';
import { HoverLift } from '@/components/motion/hover-lift';
import { CursorGlow } from '@/components/motion/cursor-glow';
import { Paisley } from '@/components/brand/paisley';
import { useCart } from '@/lib/cart/cart-context';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface ProductCardProps {
  product: Product;
  /** Show a quick-add button on the card (e.g. on home / shop / category grids). */
  quickAdd?: boolean;
}

export function ProductCard({ product, quickAdd }: ProductCardProps) {
  const primaryImage = product.images[0];
  const primaryVariant = product.variants[0];
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [, startTransition] = useTransition();

  if (!primaryImage || !primaryVariant) return null;

  const { theme_palette } = product;
  const effective = computeEffectivePrice(product, primaryVariant);
  const onSale = effective.salePrice !== null;
  // When the quick-view modal for THIS product is open, hide the card image
  // so Framer's shared-element layoutId reads the modal's hero as the continuation.
  const modalOpen = pathname === `/product/${product.slug}`;

  return (
    <HoverLift className="h-full">
      <CursorGlow
        className="group relative h-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated shadow-soft transition-shadow duration-300 hover:shadow-lifted"
        color={theme_palette.glow}
      >
        <Link
          href={`/product/${product.slug}`}
          className="flex h-full flex-col focus-visible:outline-none"
          aria-label={product.title}
          scroll={false}
        >
          <motion.div
            layoutId={reduced ? undefined : `product-image-${product.slug}`}
            className="relative aspect-square overflow-hidden"
            style={{ opacity: modalOpen ? 0 : 1 }}
          >
            {/* Flavour-tinted backdrop */}
            <div
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
              style={{ backgroundColor: theme_palette.base }}
              aria-hidden="true"
            />
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {/* Tag ribbons. Sale takes priority on the LEFT column when active —
                a "20% OFF" pill is the most-attention-grabbing badge a user
                can see, so it belongs above bestseller / new. */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {onSale && (
                <span className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-soft">
                  {effective.label
                    ? effective.label
                    : effective.percentOff
                      ? `${effective.percentOff}% off`
                      : 'Sale'}
                </span>
              )}
              {product.bestseller && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                  style={{ backgroundColor: theme_palette.accent }}
                >
                  Bestseller
                </span>
              )}
              {product.new && (
                <span className="rounded-full bg-theme-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--theme-base)]">
                  New
                </span>
              )}
            </div>
            {/* Paisley corner accent (brand motif on hover/focus) */}
            <div
              className="pointer-events-none absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ color: theme_palette.accent }}
            >
              <Paisley size="sm" rotate={-12} />
            </div>
          </motion.div>
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="font-display text-lg font-semibold leading-snug text-theme-ink">
              {product.title}
            </h3>
            <p className="line-clamp-2 text-sm text-theme-ink/70">{product.description}</p>
            <div className="mt-auto flex items-end justify-between gap-2 pt-3">
              <div className="flex flex-col">
                {onSale && effective.salePrice !== null ? (
                  <span className="flex items-baseline gap-1.5">
                    <span
                      className="font-display text-lg font-semibold"
                      style={{ color: theme_palette.accent }}
                    >
                      {formatMoney({ amount: effective.salePrice, currency: 'INR' })}
                    </span>
                    <span className="text-xs text-theme-ink/45 line-through">
                      {formatMoney(primaryVariant.price)}
                    </span>
                  </span>
                ) : (
                  <span
                    className="font-display text-lg font-semibold"
                    style={{ color: theme_palette.accent }}
                  >
                    {formatMoney(primaryVariant.price)}
                  </span>
                )}
                <span className="text-xs text-theme-ink/60">{primaryVariant.title}</span>
              </div>
              {quickAdd && (
                <button
                  type="button"
                  aria-label={`Add ${product.title} to cart`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (added) return;
                    startTransition(() => {
                      add(product.id, primaryVariant.id, 1);
                      setAdded(true);
                      window.setTimeout(() => setAdded(false), 1800);
                    });
                  }}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: added ? '#15803d' : theme_palette.accent,
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={added ? 'added' : 'add'}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.18 }}
                      className="flex"
                    >
                      {added ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              )}
            </div>
          </div>
          {/* Theme-glow ring on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1px ${theme_palette.glow}` }}
            aria-hidden="true"
          />
        </Link>
      </CursorGlow>
    </HoverLift>
  );
}
