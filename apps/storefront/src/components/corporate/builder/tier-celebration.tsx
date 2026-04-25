'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { TierId } from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface TierCelebrationProps {
  tierId: TierId;
  tierLabel: string;
  discount: number;
}

const CONFETTI_PIECES = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  x: -40 + i * 12,
  rot: -50 + i * 20,
  delay: 0.05 + (i % 3) * 0.04,
}));

/**
 * Watches `tierId` and emits a one-shot toast + paisley confetti when the tier
 * goes UP (essence → premium → grande). Skipped on reduced-motion (toast only).
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
          className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2"
        >
          <div className="pointer-events-auto relative flex items-center gap-3 rounded-full bg-theme-ink px-5 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-lifted">
            <Sparkles className="h-4 w-4 text-theme-glow" aria-hidden="true" />
            <span>
              {active.label} tier unlocked
              {active.discount > 0 && ` — ${Math.round(active.discount * 100)}% off per unit`}
            </span>
            {!reduced && (
              <span aria-hidden="true" className="absolute inset-0">
                {CONFETTI_PIECES.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.4 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: p.x,
                      y: -50 - Math.abs(p.x) * 0.5,
                      rotate: p.rot,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1.0,
                      delay: p.delay,
                      ease: [0.25, 0.45, 0.3, 1],
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-theme-glow"
                  >
                    <Paisley size="sm" />
                  </motion.span>
                ))}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
