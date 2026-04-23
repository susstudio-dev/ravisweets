'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface ParallaxProps {
  children: ReactNode;
  /** Max translate in px (distance the element travels over the scroll range). */
  offset?: number;
  className?: string;
}

/**
 * Transform-only parallax wrapper.
 * Uses translateY driven by scroll progress within the element's viewport window.
 * Disables entirely on prefers-reduced-motion.
 */
export function Parallax({ children, offset = 30, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y, willChange: 'transform' }} className={className}>
      {children}
    </motion.div>
  );
}
