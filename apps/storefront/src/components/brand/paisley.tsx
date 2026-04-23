import { cn } from '@/lib/cn';

interface PaisleyProps {
  size?: 'sm' | 'md' | 'lg';
  rotate?: number;
  className?: string;
  /** Color source (defaults to theme accent via currentColor). Accepts any valid CSS color. */
  color?: string;
  'aria-hidden'?: boolean;
}

const SIZES = { sm: 20, md: 32, lg: 48 };

/**
 * Inline paisley motif — single brand-primitive mark.
 * - Stroke/fill via currentColor; wrap in a colored container or set `color`.
 * - Spec-limited: max 4 distinct surfaces per page.
 */
export function Paisley({
  size = 'md',
  rotate = 0,
  className,
  color,
  'aria-hidden': ariaHidden = true,
}: PaisleyProps) {
  const px = SIZES[size];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={cn('inline-block shrink-0', className)}
      style={{
        color: color ?? 'var(--theme-accent)',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <path d="M18 44c-1-8 2-16 8-22 5-5 12-6 17-3 4 2 6 6 5 11-1 5-5 8-9 9-3 1-6 0-8-2-1-1-2-3-2-5 0-3 2-5 4-5 2 0 3 2 3 3" />
      <path d="M20 48c2 2 5 3 8 3 6 0 12-3 15-8" />
      <circle cx="38" cy="30" r="2" fill="currentColor" stroke="none" opacity="0.7" />
      <path d="M12 52c2-3 4-5 7-6" opacity="0.6" />
    </svg>
  );
}

/**
 * Horizontal paisley divider — a paisley flanked by hairlines.
 * Used between major page sections.
 */
export function PaisleyDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center gap-4 py-8 text-theme-accent',
        className,
      )}
      aria-hidden="true"
    >
      <span className="h-px w-full max-w-[12rem] bg-[color:var(--theme-accent)] opacity-25" />
      <Paisley size="md" />
      <span className="h-px w-full max-w-[12rem] bg-[color:var(--theme-accent)] opacity-25" />
    </div>
  );
}
