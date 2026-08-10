import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * THE ONE PRODUCT GRID.
 *
 * The audit found the same ProductCard laid out on five different column
 * ramps — /shop went 1→2→3→4, the homepage 2→3→4, category 1→2→3 (never
 * reaching four), search 1→2→3, and related-products 1→2→4 (skipping three).
 * Gaps disagreed too. The worst of it was mobile: /shop, the dedicated browse
 * surface for the whole catalogue, showed ONE product per row while the
 * homepage showed two — roughly a screen-height of scrolling per SKU.
 *
 * Every grid of products on this site now comes from here. Two products per
 * row on the smallest screen is deliberate and not negotiable: products per
 * viewport is the strongest lever there is on browse-to-detail conversion,
 * and a food grid reads perfectly well two-up at 375px.
 */
export function ProductGrid({
  children,
  className,
  /** Dense is for surfaces whose job is scanning the catalogue: /shop, /search. */
  dense = false,
}: {
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid gap-3 sm:gap-4',
        dense
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
