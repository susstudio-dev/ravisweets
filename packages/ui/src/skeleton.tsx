import type { HTMLAttributes } from 'react';
import { cn } from './cn';

/**
 * Skeleton placeholder — theme-glow tinted, pulses softly.
 * On `prefers-reduced-motion: reduce` the pulse is suppressed via the global CSS override.
 */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg bg-theme-ink/8',
        className,
      )}
      style={{ backgroundColor: 'color-mix(in oklab, var(--theme-ink) 8%, transparent)' }}
      {...rest}
    />
  );
}
