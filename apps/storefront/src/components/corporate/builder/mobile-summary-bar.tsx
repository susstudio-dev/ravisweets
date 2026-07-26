'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
 * the palette or canvas above.
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
      className="bg-[color:var(--theme-base)]/95 shadow-lifted fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-full border border-[color:var(--color-border)] px-4 py-2.5 backdrop-blur lg:hidden"
    >
      <div className="flex flex-col">
        <span className="text-theme-ink/60 text-[10px] font-semibold uppercase tracking-wider">
          {itemCount} items · {totalUnits} units · {price.tier.label}
        </span>
        <span className="font-display text-theme-accent text-lg tabular-nums">
          {formatMoney({ amount: price.total, currency: 'INR' })}
        </span>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          'bg-theme-ink inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-[color:var(--theme-base)] transition-all duration-300',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lifted hover:-translate-y-0.5',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Submit
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
