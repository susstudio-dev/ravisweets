'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * Thin theme-accent scroll-progress bar — pinned to the bottom edge of the header.
 * Uses scroll progress with a spring for a smooth fill.
 * On reduced-motion, the bar is rendered but static (no spring).
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-theme-accent"
      style={reduced ? { scaleX: 1 } : { scaleX }}
    />
  );
}
