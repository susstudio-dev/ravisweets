'use client';

import Link from 'next/link';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { computeEffectivePrice, formatMoney, type Product } from '@ravisweets/shared';
import { useCart } from '@/lib/cart/cart-context';
import { cutoutFor } from '@/lib/cutouts';
import { isUsableImage } from '@/lib/images';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';

/**
 * TRENDING AT THE COUNTER — the ranked front row.
 *
 * The hero spotlights the day's No.1 plate; this is the rest of the shelf, a
 * horizontal rail of the signature-ranked bestsellers with the sweet cut out of
 * its photograph and set on the cream — the item on the counter, not a photo of
 * it. It replaces the old boxed "Today's bestsellers" grid: one strong product
 * section beside the hero rather than two, per the owner's "don't let it look
 * cluttered" (2026-08-13).
 *
 * WHY A RAIL, AND WHY USER-DRIVEN. The reference stores (Sweet Karam Coffee,
 * Almond House) all merchandise bestsellers as a horizontal rail; Baymard
 * endorses it when the cut-off card advertises the scroll and nothing
 * auto-rotates. So: snap points, the last card bled off the right edge, real
 * prev/next affordance via native scroll, and NO autoplay. Motion is hover and
 * the add-press only.
 *
 * WHY AN <ol>. The rank is information, not decoration — "No.2" must be read by
 * a screen reader as second, not inferred from left-to-right position. The list
 * is ordered markup; the stamp is the visible rendering of that order. Ranks
 * are the curated signature order (lib/signature.ts), never fabricated.
 *
 * WHY IT STARTS AT No.2. The hero already spotlights the day's No.1 plate; if
 * the shelf also led with No.1 the same cut-out sweet would sit twice in the
 * first two screens — the duplication the owner asked us to avoid. So the hero
 * is No.1 and the shelf is the rest of the ranking, its `<ol start>` and stamps
 * beginning where the hero leaves off. `startRank` keeps markup and stamp in
 * agreement.
 */
export function TrendingShelf({
  products,
  startRank = 1,
}: {
  products: Product[];
  startRank?: number;
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="trending-heading" className="section-y overflow-hidden">
      <div className="container-site">
        <Reveal>
          <div className="docket-head">
            <div>
              <h2 id="trending-heading" className="font-display text-display-md font-semibold">
                Trending at the counter
              </h2>
              <p className="field-label mt-2">Restocked every morning · ranked by what sells</p>
            </div>
            <Link
              href="/shop"
              className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Shop the catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/*
        The rail bleeds to the viewport edge on the right so the cut-off card
        signals "there is more, swipe" — the affordance Baymard requires. It is
        padded to the container on the left and scroll-padded so a snapped card
        never hides under that inset. `role="region"` + label makes the whole
        strip one landmark a keyboard user can tab into.
      */}
      <ol
        role="region"
        aria-label="Trending sweets, ranked"
        tabIndex={0}
        start={startRank}
        className="rail-scroll container-site flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-6 [scroll-padding-left:1rem] sm:[scroll-padding-left:1.5rem] lg:[scroll-padding-left:2rem]"
      >
        {products.map((product, i) => (
          <ShelfCard key={product.id} product={product} rank={startRank + i} eager={i < 3} />
        ))}
      </ol>
    </section>
  );
}

function ShelfCard({
  product,
  rank,
  eager,
}: {
  product: Product;
  rank: number;
  eager: boolean;
}) {
  const reduced = useReducedMotion();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [, startTransition] = useTransition();

  const variant = product.variants[0];
  const primaryImage = product.images[0];
  if (!variant) return null;

  const cutout = cutoutFor(primaryImage?.url);
  const boxed = primaryImage && isUsableImage(primaryImage.url) ? primaryImage.url : null;
  const effective = computeEffectivePrice(product, variant);
  const onSale = effective.salePrice !== null;
  const pal = product.theme_palette;

  return (
    <li className="w-[15rem] shrink-0 snap-start sm:w-[16.5rem]">
      <article className="docket group relative flex h-full flex-col transition-shadow duration-200 hover:shadow-lifted">
        {/* The rank stamp — the visible rendering of the <ol> order. */}
        <span
          aria-hidden="true"
          className="font-mono text-theme-accent absolute left-3 top-3 z-10 rounded-md border-[1.5px] border-current bg-[color:var(--theme-base)] px-2 py-0.5 text-xs font-bold -rotate-3"
        >
          No.{rank}
        </span>

        <Link
          href={`/product/${product.slug}`}
          className="flex h-full flex-col focus-visible:outline-none"
          aria-label={`No.${rank} — ${product.title}`}
          scroll={false}
        >
          {/* THE PLATE — the sweet cut out and set on a soft glow, not in a box. */}
          <div
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-[11px]"
            style={{
              background: `radial-gradient(ellipse 74% 56% at 50% 62%, ${pal.glow}66, ${pal.glow}00 72%)`,
            }}
          >
            {cutout && !imgFailed ? (
              // Plain <img>: a cutout is an irregular alpha silhouette, outside
              // the square cover-rung contract the custom next/image loader
              // serves — see lib/cutouts.ts.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cutout}
                alt={primaryImage?.alt ?? product.title}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className="h-[86%] w-[86%] object-contain drop-shadow-[0_12px_10px_rgba(22,28,36,0.20)] transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                onError={() => setImgFailed(true)}
              />
            ) : boxed && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={boxed}
                alt={primaryImage?.alt ?? product.title}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span
                aria-hidden="true"
                className="block h-12 w-12 rotate-45 border-2 border-dashed"
                style={{ borderColor: pal.accent, opacity: 0.4 }}
              />
            )}

            {onSale && (
              <span
                className="absolute left-0 top-0 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {effective.label ?? (effective.percentOff ? `${effective.percentOff}% off` : 'Sale')}
              </span>
            )}
          </div>

          {/* THE RECORD — the counter edge, then the two facts a buyer compares. */}
          <div className="flex flex-1 flex-col border-t border-[color:var(--color-border)] p-3.5">
            <h3 className="font-display text-theme-ink text-[15px] font-semibold leading-snug">
              {product.title}
            </h3>
            <div className="mt-auto flex items-end justify-between gap-2 pt-3">
              <div className="min-w-0">
                <p className="field-label truncate">{variant.title}</p>
                <p className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-display text-theme-ink text-base font-bold">
                    {formatMoney({
                      amount:
                        onSale && effective.salePrice !== null
                          ? effective.salePrice
                          : variant.price.amount,
                      currency: 'INR',
                    })}
                  </span>
                  {onSale && (
                    <span className="text-text-muted text-[11px] line-through">
                      {formatMoney(variant.price)}
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Add ${product.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (added) return;
                  startTransition(() => {
                    add(product.id, variant.id, 1);
                    setAdded(true);
                    window.setTimeout(() => setAdded(false), 1800);
                  });
                }}
                className={cn(
                  'relative flex h-8 shrink-0 items-center justify-center gap-1 rounded-full text-[color:var(--theme-base)] transition-[width,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px',
                  added ? 'w-[4.75rem] bg-[#1F6238]' : 'bg-theme-accent w-8',
                )}
              >
                {added ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Added</span>
                  </>
                ) : (
                  <Plus className={cn('h-4 w-4', reduced ? '' : 'transition-transform')} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </Link>
      </article>
    </li>
  );
}
