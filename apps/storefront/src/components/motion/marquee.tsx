import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MarqueeProps {
  children: ReactNode;
  /** Pixels per second for the scroll. Default 40. */
  speed?: number;
  /** Flip direction — right-to-left by default; set `reverse` for left-to-right. */
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite horizontal marquee — CSS-only (zero JS).
 * Content is duplicated so the loop is seamless.
 * Respects prefers-reduced-motion via the global CSS override in globals.css
 * (animation-duration collapses to 0.01ms, so the track rests static).
 */
export function Marquee({ children, speed = 40, reverse = false, className }: MarqueeProps) {
  // Target distance: ~100% of duplicated track; duration = distance / speed.
  const duration = `${Math.max(15, 600 / speed)}s`;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-gradient-to-r before:from-[color:var(--theme-base)] before:to-transparent",
        "after:pointer-events-none after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-gradient-to-l after:from-[color:var(--theme-base)] after:to-transparent",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn('flex w-max gap-12 will-change-transform')}
        style={{
          animation: `rs-marquee ${duration} linear infinite ${reverse ? 'reverse' : 'normal'}`,
        }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12">{children}</div>
      </div>
      <style>{`@keyframes rs-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
