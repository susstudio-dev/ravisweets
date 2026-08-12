'use client';

import { useMemo } from 'react';
import type { Product } from '@ravisweets/shared';
import { FilterSheet } from '@/components/catalogue/filter-sheet';
import { ProductFilters } from '@/components/catalogue/product-filters';
import { useProductFilters } from '@/lib/catalogue/use-product-filters';

/**
 * The category page's refine rail.
 *
 * Self-sufficient: filter state lives in the URL and nowhere else, so this and
 * CategoryBrowser read it independently and no props thread between them. That
 * is what lets the page put this in the sticky title rail while the grid keeps
 * its own column (owner layout request, 2026-08-11).
 *
 * `products` is the category's UNFILTERED set, and it is required: the panel
 * measures every chip's count against it, so passing the filtered list would
 * make each count describe the view the shopper is already looking at.
 *
 * `cat` IS FORCED NULL. The page has already narrowed to one category by
 * route, so a `?cat=` left over from a copied /shop link would filter a second
 * time — /category/sweets?cat=pickles would render an empty grid with no chip
 * explaining why. Nulling it here also means the next write clears it from the
 * URL, so the bad link heals itself on first interaction.
 */
export function CategoryFilters({ products }: { products: Product[] }) {
  const { state: raw, setState } = useProductFilters();
  const state = useMemo(() => ({ ...raw, cat: null }), [raw]);

  return (
    <>
      <FilterSheet products={products} state={state} onChange={setState} />
      <div className="hidden lg:block">
        <ProductFilters products={products} state={state} onChange={setState} showSort />
      </div>
    </>
  );
}
