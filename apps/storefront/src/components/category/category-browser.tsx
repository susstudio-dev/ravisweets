'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Stagger } from '@/components/motion/stagger';
import { applyFilters, sortProducts } from '@/lib/catalogue/filters';
import { useProductFilters } from '@/lib/catalogue/use-product-filters';

/**
 * Grid column ONLY — the filters live in the page's title rail
 * (CategoryFilters). Both read the same URL params, so they stay in step with
 * no shared state and no props between them.
 *
 * `cat` is forced null for the same reason as in CategoryFilters: the route
 * has already selected the category, and honouring a stray `?cat=` would
 * filter twice.
 */
export function CategoryBrowser({
  categorySlug,
  products,
}: {
  categorySlug: CategorySlug;
  products: Product[];
}) {
  const { state: raw } = useProductFilters();
  const state = useMemo(() => ({ ...raw, cat: null }), [raw]);

  const shown = useMemo(
    () => sortProducts(applyFilters(products, state), state.sort),
    [products, state],
  );

  return (
    <div>
      {/* The result count, typed into the record on its own ruled line. */}
      <div className="mb-6 border-b border-[color:var(--color-rule)] pb-2.5">
        <p className="field-value text-theme-ink text-sm" aria-live="polite">
          SHOWING {shown.length} OF {products.length}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="docket flex flex-col items-start gap-3 p-8">
          <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
          <p className="font-display text-theme-ink text-lg">Nothing matches those filters.</p>
          <p className="text-text-muted text-sm">
            Try removing one — the count beside each option shows what it would leave.
          </p>
          <Link href={`/category/${categorySlug}`} className="stamp stamp--ghost mt-1">
            Clear filters
          </Link>
        </div>
      ) : (
        <Stagger gap={75} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {/* Four is the widest first row this grid ever has (xl). */}
          {shown.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </Stagger>
      )}
    </div>
  );
}
