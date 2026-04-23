'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface MouseParallaxProps {
  children: ReactNode;
  /** Maximum translate in px from centre at the mouse edge. Default 12. */
  strength?: number;
  /** Maximum rotation in deg. Default 3. */
  rotate?: number;
  className?: string;
}

/**
 * Subtle mouse-follow parallax for a single element.
 * - Translates and rotates slightly toward the cursor within the container.
 * - Disables on coarse pointer (touch) and prefers-reduced-motion.
 * - Springs damp the motion so it feels material, not jittery.
 */
export function MouseParallax({
  children,
  strength = 12,
  rotate = 3,
  className,
}: MouseParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 80, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 80, damping: 20, mass: 0.6 });

  const translateX = useTransform(sx, [-1, 1], [-strength, strength]);
  const translateY = useTransform(sy, [-1, 1], [-strength, strength]);
  const rotateY = useTransform(sx, [-1, 1], [-rotate, rotate]);
  const rotateX = useTransform(sy, [-1, 1], [rotate, -rotate]);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    x.set(nx);
    y.set(ny);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{
          x: translateX,
          y: translateY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
