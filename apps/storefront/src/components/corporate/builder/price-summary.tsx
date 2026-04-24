'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, TrendingUp } from 'lucide-react';
import { formatMoney, type PriceBreakdown } from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface PriceSummaryProps {
  price: PriceBreakdown;
  totalUnits: number;
  onChangeUnits: (units: number) => void;
}

export function PriceSummary({ price, totalUnits, onChangeUnits }: PriceSummaryProps) {
  const reduced = useReducedMotion();
  const tier = price.tier;
  const discounted = tier.discount > 0;

  return (
    <section
      aria-labelledby="summary-heading"
      className="flex flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h2 id="summary-heading" className="font-display text-lg font-semibold text-theme-ink">
          Summary
        </h2>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            tier.id === 'moq-below'
              ? 'bg-red-700/15 text-red-700'
              : tier.id === 'essence'
              ? 'bg-theme-ink/10 text-theme-ink'
              : tier.id === 'premium'
              ? 'bg-theme-accent/20 text-theme-accent'
              : 'bg-theme-accent text-[color:var(--theme-base)]',
          )}
        >
          {tier.label}
        </span>
      </div>

      {/* Units */}
      <div>
        <label htmlFor="units-input" className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          Units
        </label>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-surface p-1">
          <button
            type="button"
            onClick={() => onChangeUnits(Math.max(1, totalUnits - 10))}
            aria-label="Decrease by 10 units"
            className="rounded-full p-1.5 text-theme-ink/70 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <input
            id="units-input"
            type="number"
            min={1}
            max={10000}
            value={totalUnits}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChangeUnits(Math.max(1, Math.min(10000, Math.round(n))));
            }}
            className="w-20 bg-transparent text-center font-display text-lg font-semibold tabular-nums text-theme-ink focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={() => onChangeUnits(Math.min(10000, totalUnits + 10))}
            aria-label="Increase by 10 units"
            className="rounded-full p-1.5 text-theme-ink/70 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Prices */}
      <dl className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-theme-ink/70">Per unit</dt>
          <dd className="font-semibold tabular-nums text-theme-ink">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={price.perUnit}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="inline-block"
              >
                {formatMoney({ amount: price.perUnit, currency: 'INR' })}
              </motion.span>
            </AnimatePresence>
            {discounted && (
              <span className="ml-2 text-xs font-normal text-theme-ink/50 line-through">
                {formatMoney({ amount: price.perUnitUndiscounted, currency: 'INR' })}
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-theme-ink/70">× units</dt>
          <dd className="tabular-nums text-theme-ink">{totalUnits}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-3 text-base">
          <dt className="font-semibold text-theme-ink">Total</dt>
          <dd className="font-display text-2xl font-semibold text-theme-accent tabular-nums">
            {formatMoney({ amount: price.total, currency: 'INR' })}
          </dd>
        </div>
      </dl>

      {/* Tier blurb */}
      <p className="text-xs leading-relaxed text-theme-ink/70">{tier.blurb}</p>
      {tier.nextUnlockLabel && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-theme-glow/15 px-3 py-1 text-[11px] font-semibold text-theme-accent">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          {tier.nextUnlockLabel}
        </p>
      )}
    </section>
  );
}
