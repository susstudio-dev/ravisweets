'use client';

import { motion, useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type Direction = 'left' | 'right' | 'up' | 'down' | 'center';

interface MaskRevealProps {
  children: ReactNode;
  direction?: Direction;
  /** Duration in seconds. Default 0.65 — signature-moment wipe feel. */
  duration?: number;
  /** Entry threshold (0..1). Default 0.25. */
  amount?: number;
  className?: string;
  as?: 'div' | 'section' | 'figure';
}

/**
 * Clip-path image/content wipe on viewport entry. Transform-free (only
 * `clip-path` animates) and GPU-composited when the target is an image or a
 * bordered frame. Reduced-motion renders fully-revealed immediately.
 */
export function MaskReveal({
  children,
  direction = 'left',
  duration = DURATION.cinematic,
  amount = 0.25,
  className,
  as: Tag = 'div',
}: MaskRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  const hidden: Record<Direction, string> = {
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
    up: 'inset(0 0 100% 0)',
    down: 'inset(100% 0 0 0)',
    center: 'inset(50% 50% 50% 50%)',
  };

  const MotionTag = motion[Tag] as typeof motion.div;

  // If reduced-motion, skip animation entirely — render fully revealed at first paint.
  if (reduced) {
    return (
      <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      initial={{ clipPath: hidden[direction] }}
      animate={{ clipPath: inView ? 'inset(0 0 0 0)' : hidden[direction] }}
      transition={{ duration, ease: EASE.emphasised }}
      style={{ willChange: 'clip-path' }}
    >
      {children}
    </MotionTag>
  );
}
