'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { TierId } from '@ravisweets/shared';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface TierCelebrationProps {
  tierId: TierId;
  tierLabel: string;
  discount: number;
}

/**
 * Watches `tierId` and emits a one-shot stamped "TIER UNLOCKED" block when the
 * tier goes UP (essence → premium → grande). Pressed once like a rubber stamp,
 * resting at a hand-stamped angle — no confetti. Reduced motion gets a plain
 * fade.
 */
export function TierCelebration({ tierId, tierLabel, discount }: TierCelebrationProps) {
  const reduced = useReducedMotion();
  const previous = useRef<TierId>(tierId);
  const [active, setActive] = useState<{ label: string; discount: number } | null>(null);

  useEffect(() => {
    const order: TierId[] = ['moq-below', 'essence', 'premium', 'grande'];
    const prev = order.indexOf(previous.current);
    const next = order.indexOf(tierId);
    previous.current = tierId;
    if (next > prev && tierId !== 'moq-below') {
      setActive({ label: tierLabel, discount });
      const id = window.setTimeout(() => setActive(null), 2400);
      return () => window.clearTimeout(id);
    }
    return;
  }, [tierId, tierLabel, discount]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="tier-toast"
          role="status"
          aria-live="polite"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.2, rotate: -6 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: -2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
          className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2"
        >
          <div className="bg-surface-elevated shadow-lifted border-theme-accent rounded-md border-2 px-5 py-3 text-center">
            <p className="field-label text-theme-accent">Tier unlocked</p>
            <p className="font-display text-theme-ink mt-0.5 text-lg leading-tight">
              {active.label}
            </p>
            {active.discount > 0 && (
              <p className="field-value text-theme-ink/70 mt-0.5 text-xs">
                {Math.round(active.discount * 100)}% off per unit
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
