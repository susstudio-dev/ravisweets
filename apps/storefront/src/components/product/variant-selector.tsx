'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { formatMoney, type Product, type ProductVariant } from '@ravisweets/shared';
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
      {/* Price with crossfade */}
      <div
        className="relative h-12 overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={active.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: reduced ? DURATION.fast : DURATION.quick, ease: EASE.standard }}
            className="inline-block font-display text-4xl font-semibold text-theme-accent"
          >
            {formatMoney(active.price)}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Variant chips (hidden if only one) */}
      {product.variants.length > 1 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
            {product.unit_mode === 'quantity' ? 'Pack' : 'Size'}
          </p>
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
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                    selected
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)] shadow-soft'
                      : 'border-[color:var(--color-border)] bg-surface-elevated text-theme-ink hover:-translate-y-0.5 hover:border-theme-accent',
                  )}
                >
                  <span>{v.title}</span>
                  <span className={cn('text-xs', selected ? 'opacity-80' : 'opacity-60')}>
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
          <span className="font-semibold text-amber-800">
            Only {active.stock_available} left
          </span>
        ) : (
          <span className="text-theme-ink/70">In stock · ships today</span>
        )}
        <span className="text-theme-ink/60">·</span>
        <span className="text-theme-ink/70">
          SKU <span className="font-mono text-xs">{active.sku}</span>
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
