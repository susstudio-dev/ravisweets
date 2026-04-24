'use client';

import { motion, useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface SectionEntryProps {
  children: ReactNode;
  className?: string;
  /** IntersectionObserver threshold (0..1). Default 0.3. */
  amount?: number;
  /** Tag for the section wrapper. Default `section`. */
  as?: 'section' | 'div';
  'aria-labelledby'?: string;
  'aria-label'?: string;
}

/**
 * A thin section wrapper that plays a one-shot ambient `--theme-glow` wash
 * when the section enters the viewport. The wash is an absolutely-positioned
 * radial gradient at ≤ 12% opacity that fades in over ~120ms and out over ~400ms.
 *
 * Reduced-motion: the wash is inert (rendered at 0 opacity, no animation).
 * Transform/opacity only — safe for scroll performance.
 */
export function SectionEntry({
  children,
  className,
  amount = 0.3,
  as: Tag = 'section',
  ...ariaProps
}: SectionEntryProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  const MotionTag = motion[Tag] as typeof motion.section;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{ position: 'relative' }}
      {...ariaProps}
    >
      {/* Ambient wash layer — skipped entirely under reduced-motion */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? [0, 0.12, 0] : 0 }}
          transition={{
            duration: 0.52,
            times: [0, 0.23, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, var(--theme-glow) 0%, transparent 65%)',
          }}
        />
      )}
      {children}
    </MotionTag>
  );
}
