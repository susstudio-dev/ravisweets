'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useMemo } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * Page-wide drift garnish — mounts ONCE at the layout level. A fixed-position
 * overlay sits behind page content; SVG marks drift vertically as the user
 * scrolls the document. Adds the cinematic "premium" feel across every route
 * without each section having to opt in.
 *
 * Performance:
 *   - 5 marks default (4 desktop, 2 mobile, 0 reduced-motion).
 *   - All transforms GPU-composited.
 *   - z-index 5 — above page background, well below header (z-30) / modals (z-50).
 *
 * Customers can never click through to it (`pointer-events: none`).
 */

const STYLES: { mark: 'saffron' | 'almond' | 'paisley'; tint: string }[] = [
  { mark: 'saffron', tint: 'var(--theme-accent)' },
  { mark: 'almond', tint: 'color-mix(in oklab, var(--theme-glow) 80%, var(--theme-base))' },
  { mark: 'paisley', tint: 'color-mix(in oklab, var(--theme-accent) 70%, var(--theme-glow))' },
  { mark: 'saffron', tint: 'var(--theme-glow)' },
  { mark: 'almond', tint: 'var(--theme-accent)' },
];

const POSITIONS = [
  { top: '12%', left: '6%', driftRate: 0.35, sway: 18, duration: 11, scale: 0.9 },
  { top: '38%', left: '88%', driftRate: 0.25, sway: 12, duration: 9, scale: 1.05 },
  { top: '62%', left: '4%', driftRate: 0.45, sway: 16, duration: 13, scale: 0.7 },
  { top: '78%', left: '78%', driftRate: 0.3, sway: 10, duration: 8, scale: 0.85 },
  { top: '24%', left: '50%', driftRate: 0.5, sway: 22, duration: 14, scale: 0.6 },
];

export function PageDriftGarnish() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const transforms = useMemo(
    () =>
      POSITIONS.map((p) =>
        // Each particle gets its own translate range based on its drift rate.
        // Larger value = faster apparent scroll. The transforms are computed
        // in render so motion can wire them once and reuse.
        p,
      ),
    [],
  );

  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
      >
        {POSITIONS.slice(0, 3).map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              transform: `scale(${p.scale * 0.8})`,
              opacity: 0.18,
              color: STYLES[i % STYLES.length]!.tint,
            }}
          >
            <Mark variant={STYLES[i % STYLES.length]!.mark} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden md:block"
    >
      {transforms.map((p, i) => (
        <Particle key={i} pos={p} style={STYLES[i % STYLES.length]!} scrollY={scrollY} />
      ))}
    </div>
  );
}

interface ParticleProps {
  pos: (typeof POSITIONS)[number];
  style: { mark: 'saffron' | 'almond' | 'paisley'; tint: string };
  scrollY: ReturnType<typeof useScroll>['scrollY'];
}

function Particle({ pos, style, scrollY }: ParticleProps) {
  // Negative drift = particle floats UP as user scrolls DOWN. Faster than scroll
  // for parallax-foreground feel.
  const y = useTransform(scrollY, (v) => -v * pos.driftRate);

  return (
    <motion.span
      className="absolute"
      style={{
        top: pos.top,
        left: pos.left,
        color: style.tint,
        opacity: 0.32,
        y,
        scale: pos.scale,
      }}
      animate={{ x: [0, pos.sway, -pos.sway, 0], rotate: [0, 6, -6, 0] }}
      transition={{ duration: pos.duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Mark variant={style.mark} />
    </motion.span>
  );
}

function Mark({ variant }: { variant: 'saffron' | 'almond' | 'paisley' }) {
  switch (variant) {
    case 'saffron':
      return (
        <svg width="22" height="34" viewBox="0 0 14 22" fill="currentColor">
          <path d="M7 1 C 9 5, 11 9, 9 14 C 7.5 18, 7 20, 7 21 C 7 20, 6.5 18, 5 14 C 3 9, 5 5, 7 1 Z" />
        </svg>
      );
    case 'almond':
      return (
        <svg width="26" height="16" viewBox="0 0 22 14" fill="currentColor">
          <path d="M0 7 Q11 0 22 7 Q11 14 0 7 Z" />
        </svg>
      );
    case 'paisley':
      return (
        <svg width="36" height="36" viewBox="0 0 32 32" fill="currentColor">
          <path d="M2 14 Q14 -2 26 8 Q31 18 18 26 Q6 28 2 18 Q-1 16 2 14 Z" />
        </svg>
      );
  }
}
