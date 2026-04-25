'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface MagneticButtonProps {
  children: ReactNode;
  /** Activation radius in px around the button's centre. Default 120. */
  radius?: number;
  /** Max displacement in px from the button's centre. Default 6. */
  strength?: number;
  className?: string;
}

/**
 * Wraps a CTA so it gently pulls toward the cursor inside a radius.
 *
 * Composition rules (per spec):
 *  - At most ONE MagneticButton per viewport region (reviewer-enforced).
 *  - Do not compose with <CursorGlow> on the same element.
 *  - Gated off for touch-only (coarse pointer) and prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  radius = 120,
  strength = 6,
  className,
}: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    // Normalise by radius, then scale by `strength`. This yields displacement that
    // maxes at ±strength only at the very edge of the activation ring.
    const ratio = dist / radius;
    x.set((dx / radius) * strength * (1 - 0) * (ratio || 1));
    y.set((dy / radius) * strength * (1 - 0) * (ratio || 1));
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
    >
      <motion.div style={{ x: sx, y: sy, willChange: 'transform' }}>{children}</motion.div>
    </div>
  );
}
