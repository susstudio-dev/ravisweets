import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const cardVariants = cva('transition-shadow duration-300', {
  variants: {
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8',
    },
    elevation: {
      flat: '',
      soft: 'shadow-soft',
      lifted: 'shadow-lifted',
    },
    radius: {
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
    },
    border: {
      solid: 'border border-[color:var(--color-border)]',
      dashed: 'border border-dashed border-[color:var(--color-border)]',
      none: '',
    },
    surface: {
      base: 'bg-surface',
      elevated: 'bg-surface-elevated',
      glow: 'bg-theme-glow/10',
      ink: 'bg-theme-ink text-[color:var(--theme-base)]',
    },
  },
  defaultVariants: {
    padding: 'md',
    elevation: 'soft',
    radius: 'lg',
    border: 'solid',
    surface: 'elevated',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, elevation, radius, border, surface, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ padding, elevation, radius, border, surface, className }),
      )}
      {...rest}
    />
  ),
);
Card.displayName = 'Card';
