import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

/**
 * Canonical Button — consumes theme tokens (--theme-accent, --theme-base, --theme-ink).
 * Never hard-codes colours. Always round-pill shape to match brand.
 */
const buttonVariants = cva(
  'group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-theme-accent text-[color:var(--theme-base)] shadow-soft hover:-translate-y-0.5 hover:shadow-lifted focus-visible:ring-theme-accent',
        secondary:
          'border border-theme-ink/25 text-theme-ink hover:border-theme-accent hover:text-theme-accent focus-visible:ring-theme-accent',
        ghost:
          'text-theme-ink/80 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent',
        dark:
          'bg-theme-ink text-[color:var(--theme-base)] hover:-translate-y-0.5 hover:shadow-lifted focus-visible:ring-theme-accent',
        danger:
          'bg-red-700 text-white hover:-translate-y-0.5 hover:bg-red-800 focus-visible:ring-red-700',
      },
      size: {
        sm: 'px-3.5 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
