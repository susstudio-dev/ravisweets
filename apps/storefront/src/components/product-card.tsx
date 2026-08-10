'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { computeEffectivePrice, formatMoney, type Product } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { isUsableImage } from '@/lib/images';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useProductImagesOverride } from '@/lib/supabase/site-content-context';
import { cn } from '@/lib/cn';

interface ProductCardProps {
  product: Product;
  /** Show a quick-add stamp on the card (e.g. on home / shop / category grids). */
  quickAdd?: boolean;
}

/**
 * A SHEET ON THE COUNTER.
 *
 * Every product is a small docket: the plate on top, the record underneath.
 * Title, then a ruled line carrying weight and price — the two facts a buyer
 * compares across a grid — with price set in Courier Prime and tabular so a
 * column of them actually aligns.
 *
 * FLAVOUR ATLAS (a binding brand commitment) survives the world change: the
 * product's palette retunes the plate wash and the state stamp, so each sweet
 * is the same docket filed in a different ink.
 *
 * WHAT THE ATLAS MAY NOT TOUCH: the price and the add button.
 * Colouring those per product produced a grid of crimson, green, blue and
 * olive buttons — a visitor could never learn "blue is the button" — and
 * crimson on a price reads as a markdown that is not there. Worse, the
 * "added" confirmation was hardcoded #1F6238, which is exactly BADAM.accent,
 * so on every kaju/badam product the confirmation colour equalled the idle
 * colour and the only feedback was a 16px glyph swap. Action colour is fixed;
 * only identity varies.
 */
export function ProductCard({ product, quickAdd }: ProductCardProps) {
  // Owner-edited DB images overlay the static catalogue set (spec §6.4).
  const images = useProductImagesOverride(product.id) ?? product.images;
  const primaryImage = images[0];
  const primaryVariant = product.variants[0];
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [, startTransition] = useTransition();

  if (!primaryImage || !primaryVariant) return null;

  const { theme_palette } = product;
  const effective = computeEffectivePrice(product, primaryVariant);
  const onSale = effective.salePrice !== null;
  // When the quick-view modal for THIS product is open, hide the card image
  // so Framer's shared-element layoutId reads the modal's hero as the continuation.
  const modalOpen = pathname === `/product/${product.slug}`;

  return (
    <article className="docket group relative flex h-full flex-col transition-shadow duration-200 hover:shadow-lifted">
      <Link
        href={`/product/${product.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
        aria-label={product.title}
        scroll={false}
      >
        {/* ── THE PLATE ── */}
        <motion.div
          layoutId={reduced ? undefined : `product-image-${product.slug}`}
          className="relative aspect-square overflow-hidden border-b border-[color:var(--color-border)]"
          style={{ opacity: modalOpen ? 0 : 1, backgroundColor: theme_palette.glow + '33' }}
        >
          {imgFailed || !isUsableImage(primaryImage.url) ? (
            /*
             * The catalogue still points at the retired WordPress host, which
             * 404s on every file. Resolved at render (see lib/images.ts) so a
             * grid of 24 cards does not fire 24 doomed requests before falling
             * back; `imgFailed` remains as the runtime safety net.
             */
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span
                className="block h-12 w-12 rotate-45 border-2 border-dashed"
                style={{ borderColor: theme_palette.accent, opacity: 0.4 }}
              />
            </div>
          ) : (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              onError={() => setImgFailed(true)}
            />
          )}

          {/* State marks. Sale first — a discount outranks a bestseller badge.
              Sale wears the kumkum brand red (celebration/offer ink); ember is
              live state only and never marks a discount. */}
          <div className="absolute left-0 top-0 flex flex-col items-start">
            {onSale && (
              <span
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {effective.label ?? (effective.percentOff ? `${effective.percentOff}% off` : 'Sale')}
              </span>
            )}
            {product.bestseller && !onSale && (
              <span
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{ backgroundColor: theme_palette.accent, color: theme_palette.base }}
              >
                Bestseller
              </span>
            )}
            {product.new && !onSale && !product.bestseller && (
              <span className="bg-theme-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--theme-base)]">
                New
              </span>
            )}
          </div>
        </motion.div>

        {/* ── THE RECORD ── */}
        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="font-display text-theme-ink text-[15px] font-semibold leading-snug">
            {product.title}
          </h3>
          <p className="text-text-muted mt-1 line-clamp-2 text-[13px] leading-snug">
            {product.description}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="min-w-0">
              <p className="field-label truncate">{primaryVariant.title}</p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="field-value text-theme-ink text-[15px] font-bold">
                  {formatMoney({
                    amount: onSale && effective.salePrice !== null
                      ? effective.salePrice
                      : primaryVariant.price.amount,
                    currency: 'INR',
                  })}
                </span>
                {onSale && (
                  <span className="field-value text-text-muted text-[11px] line-through">
                    {formatMoney(primaryVariant.price)}
                  </span>
                )}
              </p>
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
                className={cn(
                  'relative flex h-8 shrink-0 items-center justify-center gap-1 rounded-md text-[color:var(--theme-base)] transition-[width,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px',
                  // Confirmation changes SHAPE as well as colour, so it survives
                  // any product palette and does not rely on hue alone.
                  // Green, not ember: the shape change already carries the
                  // signal, so the hue is free — and ember is spoken for.
                  added ? 'w-[4.75rem] bg-[#1F6238]' : 'bg-theme-accent w-8',
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={added ? 'added' : 'add'}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    {added ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
                          Added
                        </span>
                      </>
                    ) : (
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
