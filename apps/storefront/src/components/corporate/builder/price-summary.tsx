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

/** The running total, as a ruled column of recorded values. */
export function PriceSummary({ price, totalUnits, onChangeUnits }: PriceSummaryProps) {
  const reduced = useReducedMotion();
  const tier = price.tier;
  const discounted = tier.discount > 0;

  return (
    <section aria-labelledby="summary-heading" className="docket flex flex-col gap-4 p-5">
      <div className="docket-head mb-0">
        <h2 id="summary-heading" className="font-display text-theme-ink text-lg">
          Summary
        </h2>
        <span
          className={cn(
            'rounded-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
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
        <label htmlFor="units-input" className="field-label">
          Units
        </label>
        <div className="bg-surface mt-2 inline-flex items-center gap-1 rounded-md border border-[color:var(--color-border)] p-1">
          <button
            type="button"
            onClick={() => onChangeUnits(Math.max(1, totalUnits - 10))}
            aria-label="Decrease by 10 units"
            className="text-theme-ink/70 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2"
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
            className="field-value text-theme-ink w-20 bg-transparent text-center text-lg focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={() => onChangeUnits(Math.min(10000, totalUnits + 10))}
            aria-label="Increase by 10 units"
            className="text-theme-ink/70 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The running total — ruled label/value rows */}
      <dl className="border-t-2 border-[color:var(--color-rule)]">
        <div className="field-row">
          <dt className="field-label">Per unit</dt>
          <dd className="field-value text-theme-ink text-sm font-bold">
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
              <span className="text-theme-ink/50 ml-2 text-xs font-normal line-through">
                {formatMoney({ amount: price.perUnitUndiscounted, currency: 'INR' })}
              </span>
            )}
          </dd>
        </div>
        <div className="field-row">
          <dt className="field-label">× units</dt>
          <dd className="field-value text-theme-ink text-sm">{totalUnits}</dd>
        </div>
        <div className="field-row">
          <dt className="field-label text-theme-ink">Total</dt>
          <dd className="field-value text-theme-ink text-xl font-bold">
            {formatMoney({ amount: price.total, currency: 'INR' })}
          </dd>
        </div>
      </dl>

      {/* Tier blurb */}
      <p className="text-theme-ink/70 text-xs leading-relaxed">{tier.blurb}</p>
      {tier.nextUnlockLabel && (
        <p className="bg-theme-glow/20 text-theme-ink inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-semibold">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          {tier.nextUnlockLabel}
        </p>
      )}
    </section>
  );
}
