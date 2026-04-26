'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useMemo, useRef } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * Per-section drift overlay. Mount inside any `<section>` to scatter a few
 * decorative SVG marks that drift as the user scrolls THROUGH that section
 * (scoped via `useScroll({ target })` so multiple instances on the page
 * don't fight for the same scroll value).
 *
 * Performance:
 *   - SVG-only (no canvas, no rAF). Cheap.
 *   - GPU-composited transforms only (no layout/paint).
 *   - Particles unmount when their parent section leaves the DOM.
 *   - count clamped to 12; defaults: 6 desktop, 3 mobile, 0 on reduced-motion.
 *
 * Accessibility: aria-hidden, pointer-events: none.
 */

type Variant = 'saffron' | 'almond' | 'pistachio' | 'paisley';
type Speed = 'slow' | 'mid' | 'fast';

export interface SectionGarnishProps {
  variant?: Variant;
  count?: number;
  speed?: Speed;
  sway?: boolean;
  className?: string;
  /** Deterministic scatter — pass a stable string per usage so SSR matches client. */
  seed?: string;
  /** Override z-index; default 20 (above content z-0..z-10, below header z-30+). */
  zIndex?: number;
  /** Tint colour token. Defaults vary per variant. */
  color?: string;
}

const SPEED_PX: Record<Speed, number> = { slow: 60, mid: 140, fast: 240 };

export function SectionGarnish({
  variant = 'saffron',
  count,
  speed = 'mid',
  sway = true,
  className,
  seed = 'garnish',
  zIndex = 20,
  color,
}: SectionGarnishProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const isMobile = useIsMobile();
  const baseCount = count ?? (isMobile ? 3 : 6);
  const finalCount = Math.min(12, Math.max(0, baseCount));
  const driftPx = SPEED_PX[speed] * (isMobile ? 0.5 : 1);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Opacity peaks at section midpoint, fades at entry / exit.
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.5, 0.85, 1], [0, 0.6, 0.85, 0.6, 0]);
  // Vertical drift — scales with `speed`.
  const y = useTransform(scrollYProgress, [0, 1], [driftPx, -driftPx]);

  const positions = useMemo(() => seededScatter(seed, finalCount, variant), [seed, finalCount, variant]);

  if (finalCount === 0) return null;

  const tint = color ?? DEFAULT_TINT[variant];
  const swayAmp = sway && !isMobile ? 14 : 0;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex,
      }}
    >
      <motion.div
        style={
          reduced
            ? { width: '100%', height: '100%', opacity: 0.25 }
            : { width: '100%', height: '100%', opacity, y }
        }
      >
        {positions.map((p, i) => (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
              color: tint,
              opacity: p.localOpacity,
            }}
            // sway as a CSS animation per-particle so it's GPU-only and not driven by JS frame loop
            animate={
              reduced || swayAmp === 0
                ? undefined
                : { x: [0, swayAmp, -swayAmp, 0] }
            }
            transition={
              reduced || swayAmp === 0
                ? undefined
                : { duration: 6 + (i % 4), repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Mark variant={variant} />
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function Mark({ variant }: { variant: Variant }) {
  switch (variant) {
    case 'saffron':
      return (
        <svg width="18" height="28" viewBox="0 0 14 22" fill="currentColor">
          <path d="M7 1 C 9 5, 11 9, 9 14 C 7.5 18, 7 20, 7 21 C 7 20, 6.5 18, 5 14 C 3 9, 5 5, 7 1 Z" />
        </svg>
      );
    case 'almond':
      return (
        <svg width="22" height="14" viewBox="0 0 22 14" fill="currentColor">
          <path d="M0 7 Q11 0 22 7 Q11 14 0 7 Z" />
        </svg>
      );
    case 'pistachio':
      return (
        <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
          <path d="M0 5 Q3 0 7 4 Q11 8 7 13 Q3 18 0 13 Q-2 9 0 5 Z" />
        </svg>
      );
    case 'paisley':
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
          <path d="M2 14 Q14 -2 26 8 Q31 18 18 26 Q6 28 2 18 Q-1 16 2 14 Z" />
        </svg>
      );
  }
}

const DEFAULT_TINT: Record<Variant, string> = {
  saffron: 'var(--theme-accent)',
  almond: 'color-mix(in oklab, var(--theme-glow) 75%, var(--theme-base))',
  pistachio: '#7a8e3f',
  paisley: 'color-mix(in oklab, var(--theme-accent) 80%, var(--theme-glow))',
};

function seededScatter(seed: string, count: number, variant: Variant) {
  const baseRand = mulberry32(hash(seed + variant));
  return Array.from({ length: count }).map((_, i) => {
    const rand = mulberry32(hash(seed + variant + ':' + i));
    return {
      top: `${4 + baseRand() * 90}%`,
      left: `${4 + rand() * 90}%`,
      rotate: Math.round(rand() * 360),
      scale: 0.7 + rand() * 0.7,
      localOpacity: 0.45 + rand() * 0.45,
    };
  });
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useIsMobile(): boolean {
  // SSR-safe; static export bundles this as a client component so window
  // exists by the time `useScroll` reads it. Conservative default = false
  // so SSR HTML matches the desktop scatter and hydration doesn't shift.
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}
