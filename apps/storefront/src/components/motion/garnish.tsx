'use client';

import { motion, type Variants } from 'motion/react';
import { useMemo } from 'react';
import type { GarnishMark } from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { DURATION, EASE } from '@/lib/motion/constants';

interface GarnishProps {
  mark: GarnishMark;
  /** Number of marks scattered; default 10. */
  count?: number;
  /** Seed for stable layout between renders. */
  seed?: string;
  className?: string;
}

function seededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 16807) % 2147483647;
    return h / 2147483647;
  };
}

function Mark({ kind }: { kind: GarnishMark }) {
  switch (kind) {
    case 'paisley':
      return <Paisley size="sm" />;
    case 'saffron':
      return (
        <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true">
          <path
            d="M7 1 C 9 5, 11 9, 9 14 C 7.5 18, 7 20, 7 21 C 7 20, 6.5 18, 5 14 C 3 9, 5 5, 7 1 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'pistachio':
      return (
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
          <ellipse cx="7" cy="5" rx="6" ry="3.5" fill="currentColor" />
        </svg>
      );
    case 'silver':
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <polygon points="5,1 9,5 5,9 1,5" fill="currentColor" />
        </svg>
      );
    case 'rose':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="3" fill="currentColor" />
          <circle cx="7" cy="4" r="2" fill="currentColor" opacity="0.7" />
          <circle cx="10" cy="7" r="2" fill="currentColor" opacity="0.7" />
          <circle cx="7" cy="10" r="2" fill="currentColor" opacity="0.7" />
          <circle cx="4" cy="7" r="2" fill="currentColor" opacity="0.7" />
        </svg>
      );
  }
}

/**
 * One-shot stagger of small garnish marks scattered around the product hero.
 * Absolute-positioned layer — parent must be `position: relative` and the
 * marks will land within its bounds. Disables fully on reduced-motion.
 */
export function Garnish({ mark, count = 10, seed = 'garnish', className }: GarnishProps) {
  const reduced = useReducedMotion();

  const positions = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${4 + rand() * 92}%`,
      left: `${4 + rand() * 92}%`,
      rotate: Math.round(rand() * 360),
      opacity: 0.35 + rand() * 0.5,
      scale: 0.7 + rand() * 0.7,
      delay: rand() * 0.4,
    }));
  }, [count, seed]);

  if (reduced) return null;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: (custom: { opacity: number; scale: number; delay: number }) => ({
      opacity: custom.opacity,
      scale: custom.scale,
      transition: {
        duration: DURATION.slow,
        ease: EASE.emphasised,
        delay: custom.delay,
      },
    }),
  };

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        color: 'var(--theme-accent)',
      }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {positions.map((p) => (
        <motion.span
          key={p.id}
          variants={item}
          custom={{ opacity: p.opacity, scale: p.scale, delay: p.delay }}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate}deg)`,
            display: 'inline-block',
          }}
        >
          <Mark kind={mark} />
        </motion.span>
      ))}
    </motion.div>
  );
}
