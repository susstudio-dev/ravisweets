'use client';

import { motion, useInView, type Variants } from 'motion/react';
import { Children, useRef, type ReactNode } from 'react';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface StaggerProps {
  children: ReactNode;
  gap?: number;
  initialDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  amount?: number;
  className?: string;
  as?: 'div' | 'section' | 'ul' | 'ol';
}

export function Stagger({
  children,
  gap = 60,
  initialDelay = 0,
  direction = 'up',
  distance = 14,
  // 0 means "trigger as soon as ANY pixel of the container enters the viewport".
  // Critical for huge grids (e.g. /shop with 80+ cards) where a 0.15 amount means
  // ~1200 px of the container must be in view before children start animating —
  // which never happens above the fold and looks like a blank page.
  amount = 0,
  className,
  as = 'div',
}: StaggerProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: gap / 1000, delayChildren: initialDelay / 1000 },
    },
  };

  const offset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }[direction];

  const itemVariants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: DURATION.fast } },
      }
    : {
        hidden: { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: DURATION.slow, ease: EASE.emphasised },
        },
      };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}
