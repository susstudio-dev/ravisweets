import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        accent: 'bg-theme-accent text-[color:var(--theme-base)]',
        glow: 'bg-theme-glow/30 text-theme-ink',
        neutral: 'bg-theme-ink/10 text-theme-ink',
        outline: 'border border-theme-accent/40 text-theme-accent',
        inverse: 'bg-theme-ink text-[color:var(--theme-base)]',
      },
    },
    defaultVariants: {
      variant: 'accent',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...rest }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...rest}>
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';
