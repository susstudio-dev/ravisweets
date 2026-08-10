'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { formatMoney, type PriceBreakdown } from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface MobileSummaryBarProps {
  price: PriceBreakdown;
  totalUnits: number;
  itemCount: number;
  disabled: boolean;
  onSubmit: () => void;
}

/**
 * Fixed bottom bar shown only on narrow viewports (< lg). Keeps the live
 * tier-aware total + primary CTA in reach while the user scrolls through
 * the palette or canvas above. A square-cut docket strip, not a floating pill.
 */
export function MobileSummaryBar({
  price,
  totalUnits,
  itemCount,
  disabled,
  onSubmit,
}: MobileSummaryBarProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="region"
      aria-label="Hamper summary"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE.emphasised, delay: 0.3 }}
      className="docket shadow-lifted fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 px-4 py-2.5 lg:hidden"
    >
      <div className="flex flex-col">
        <span className="field-label">
          {itemCount} items · {totalUnits} units · {price.tier.label}
        </span>
        <span className="field-value text-theme-ink text-lg font-bold">
          {formatMoney({ amount: price.total, currency: 'INR' })}
        </span>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          'stamp shrink-0 px-4 py-2.5',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        Submit
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
