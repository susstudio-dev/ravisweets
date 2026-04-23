'use client';

import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface CursorGlowProps {
  children: ReactNode;
  className?: string;
  /** Glow colour (fallback: var(--theme-glow) via CSS). Pass a CSS color string. */
  color?: string;
  /** Max opacity of the glow. Default 0.18. */
  opacity?: number;
  /** Radius of the glow in px. Default 180. */
  radius?: number;
}

/**
 * Renders a radial gradient that follows the pointer inside its bounding box.
 * Disables on coarse-pointer (touch) and prefers-reduced-motion.
 * The gradient uses --theme-glow by default; colour prop overrides.
 */
export function CursorGlow({
  children,
  className,
  color = 'var(--theme-glow)',
  opacity = 0.18,
  radius = 180,
}: CursorGlowProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (reduced) {
    return (
      <div ref={ref} className={className} style={{ position: 'relative' }}>
        {children}
      </div>
    );
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--glow-y', `${e.clientY - r.top}px`);
    el.style.setProperty('--glow-visible', '1');
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-visible', '0');
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{
        position: 'relative',
        ['--glow-x' as string]: '50%',
        ['--glow-y' as string]: '50%',
        ['--glow-visible' as string]: '0',
      }}
    >
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: `calc(${opacity} * var(--glow-visible))`,
          background: `radial-gradient(${radius}px circle at var(--glow-x) var(--glow-y), ${color}, transparent 70%)`,
          transition: 'opacity 200ms ease-out',
          borderRadius: 'inherit',
        }}
      />
    </div>
  );
}
