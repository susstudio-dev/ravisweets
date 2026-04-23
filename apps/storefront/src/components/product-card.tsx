'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { formatMoney, type Product } from '@ravisweets/shared';
import { HoverLift } from '@/components/motion/hover-lift';
import { CursorGlow } from '@/components/motion/cursor-glow';
import { Paisley } from '@/components/brand/paisley';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images[0];
  const primaryVariant = product.variants[0];
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (!primaryImage || !primaryVariant) return null;

  const { theme_palette } = product;
  // When the quick-view modal for THIS product is open, hide the card image
  // so Framer's shared-element layoutId reads the modal's hero as the continuation.
  const modalOpen = pathname === `/product/${product.slug}`;

  return (
    <HoverLift className="h-full">
      <CursorGlow
        className="group relative h-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated shadow-soft transition-shadow duration-300 hover:shadow-lifted"
        color={theme_palette.glow}
      >
        <Link
          href={`/product/${product.slug}`}
          className="flex h-full flex-col focus-visible:outline-none"
          aria-label={product.title}
          scroll={false}
        >
          <motion.div
            layoutId={reduced ? undefined : `product-image-${product.slug}`}
            className="relative aspect-square overflow-hidden"
            style={{ opacity: modalOpen ? 0 : 1 }}
          >
            {/* Flavour-tinted backdrop */}
            <div
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
              style={{ backgroundColor: theme_palette.base }}
              aria-hidden="true"
            />
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {/* Tag ribbons */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.bestseller && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                  style={{ backgroundColor: theme_palette.accent }}
                >
                  Bestseller
                </span>
              )}
              {product.new && (
                <span className="rounded-full bg-theme-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--theme-base)]">
                  New
                </span>
              )}
            </div>
            {/* Paisley corner accent (brand motif on hover/focus) */}
            <div
              className="pointer-events-none absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ color: theme_palette.accent }}
            >
              <Paisley size="sm" rotate={-12} />
            </div>
          </motion.div>
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="font-display text-lg font-semibold leading-snug text-theme-ink">
              {product.title}
            </h3>
            <p className="line-clamp-2 text-sm text-theme-ink/70">{product.description}</p>
            <div className="mt-auto flex items-baseline justify-between pt-3">
              <span
                className="font-display text-lg font-semibold"
                style={{ color: theme_palette.accent }}
              >
                {formatMoney(primaryVariant.price)}
              </span>
              <span className="text-xs text-theme-ink/60">{primaryVariant.title}</span>
            </div>
          </div>
          {/* Theme-glow ring on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1px ${theme_palette.glow}` }}
            aria-hidden="true"
          />
        </Link>
      </CursorGlow>
    </HoverLift>
  );
}
