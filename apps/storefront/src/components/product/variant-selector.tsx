'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  computeEffectivePrice,
  formatMoney,
  type Product,
  type ProductVariant,
} from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { AddToCart } from './add-to-cart';

interface VariantSelectorProps {
  product: Product;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const [activeId, setActiveId] = useState<string>(product.variants[0]?.id ?? '');
  const reduced = useReducedMotion();

  const active: ProductVariant | undefined = useMemo(
    () => product.variants.find((v) => v.id === activeId) ?? product.variants[0],
    [activeId, product.variants],
  );

  if (!active) return null;

  const lowStock = active.stock_available > 0 && active.stock_available <= 10;
  const outOfStock = active.stock_available <= 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Price with crossfade — strikethrough + sale badge when on sale */}
      <div className="relative min-h-12" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={active.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: reduced ? DURATION.fast : DURATION.quick, ease: EASE.standard }}
            className="flex flex-wrap items-baseline gap-3"
          >
            {(() => {
              const eff = computeEffectivePrice(product, active);
              if (eff.salePrice !== null) {
                return (
                  <>
                    <span className="field-value text-theme-accent text-3xl font-bold">
                      {formatMoney({ amount: eff.salePrice, currency: 'INR' })}
                    </span>
                    <span className="field-value text-theme-ink/40 text-lg line-through">
                      {formatMoney(active.price)}
                    </span>
                    {/* Sale is live state — the one job ember has. */}
                    <span
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--theme-base)]"
                      style={{ backgroundColor: 'var(--color-ember)' }}
                    >
                      {eff.label ?? (eff.percentOff ? `${eff.percentOff}% off` : 'Sale')}
                    </span>
                  </>
                );
              }
              return (
                <span className="field-value text-theme-accent text-3xl font-bold">
                  {formatMoney(active.price)}
                </span>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* One variant: no chips, but the pack size must still be stated — the
          chips were the only place the page printed it, and a ₹249 with no
          "250 g" beside it is a price without a net quantity (Legal Metrology
          wants one on the listing; a shopper landing from search needs one to
          compare). Boxes and thalis with no unit_mode keep their old look. */}
      {product.variants.length === 1 && product.unit_mode && (
        <p className="field-label">
          {product.unit_mode === 'quantity' ? 'Pack' : 'Size'}
          <span className="text-theme-ink ml-2 normal-case tracking-normal">{active.title}</span>
        </p>
      )}

      {/* Variant chips (hidden if only one) — square-cut, filled when selected. */}
      {product.variants.length > 1 && (
        <div>
          <p className="field-label">{product.unit_mode === 'quantity' ? 'Pack' : 'Size'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const selected = v.id === active.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveId(v.id)}
                  aria-pressed={selected}
                  className={cn(
                    'focus-visible:ring-theme-accent inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    selected
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : 'bg-surface-elevated text-theme-ink hover:border-theme-accent hover:text-theme-accent border-[color:var(--color-border)]',
                  )}
                >
                  <span>{v.title}</span>
                  <span className={cn('field-value text-xs', selected ? 'opacity-80' : 'opacity-60')}>
                    {formatMoney(v.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock + delivery messaging */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {outOfStock ? (
          <span className="font-semibold text-red-700">Out of stock</span>
        ) : lowStock ? (
          <span className="font-semibold text-amber-800">Only {active.stock_available} left</span>
        ) : (
          /* Dispatch state is live state — the live mark's job. */
          <span className="live-mark">In stock · ships today</span>
        )}
        <span className="text-theme-ink/60">·</span>
        <span className="text-theme-ink/70">
          SKU <span className="field-value text-xs">{active.sku}</span>
        </span>
      </div>

      {/* Add to cart */}
      <AddToCart
        productId={product.id}
        variantId={active.id}
        disabled={outOfStock}
        maxQty={Math.max(1, active.stock_available)}
      />
    </div>
  );
}
