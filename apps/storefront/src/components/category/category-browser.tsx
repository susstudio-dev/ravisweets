'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { isNonVeg, type CategorySlug, type Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Stagger } from '@/components/motion/stagger';
import { applyFilters, mixesVtype, sortProducts } from '@/lib/catalogue/filters';
import { useProductFilters } from '@/lib/catalogue/use-product-filters';
import { cn } from '@/lib/cn';

/**
 * The product grid, plus — where the shelf is mixed — the All·Veg·Non-veg
 * tab strip; the rest of the filters live in the page's title rail
 * (CategoryFilters). Both surfaces read the same URL params independently,
 * so they stay in step with no shared state and no props between them.
 *
 * `cat` is forced null for the same reason as in CategoryFilters: the route
 * has already selected the category, and honouring a stray `?cat=` would
 * filter twice.
 *
 * The All·Veg·Non-veg strip appears only when the category's UNFILTERED set
 * actually mixes both types — data-driven, so today that is Pickles alone and
 * any future mixed shelf gets it for free. The refine panel's Veg/Non-veg
 * group calls the very same `mixesVtype(products)` (see filters.ts) to
 * decide whether IT renders, so the two controls appear and disappear
 * together — not just "the same signal" recomputed twice and liable to
 * drift, but one shared function. Both also write the same `?type=` param,
 * so the STATE they report can never disagree either; ticking both chips
 * reads back here as All (OR-bucket semantics). Note the strip can still
 * show a tab at 0 (e.g. "Non-veg 0" when another active filter, say
 * Eggless, excludes every non-veg product) — that is left as-is: it is
 * informative rather than confusing once the empty grid it produces offers
 * "Clear filters", and collapsing it here would just re-introduce the
 * disagreement in reverse.
 */
export function CategoryBrowser({
  categorySlug,
  products,
}: {
  categorySlug: CategorySlug;
  products: Product[];
}) {
  const { state: raw, setState } = useProductFilters();
  const state = useMemo(() => ({ ...raw, cat: null }), [raw]);

  const shown = useMemo(
    () => sortProducts(applyFilters(products, state), state.sort),
    [products, state],
  );

  const mixed = useMemo(() => mixesVtype(products), [products]);

  // Counts honour every OTHER active filter — the same promise a facet count
  // makes: the number on the tab is what clicking it leaves.
  const tabBase = useMemo(
    () => applyFilters(products, { ...state, vtype: [] }),
    [products, state],
  );
  const nonvegCount = tabBase.filter((p) => isNonVeg(p)).length;
  const tabs = [
    { value: 'all', label: 'All', count: tabBase.length },
    { value: 'veg', label: 'Veg', count: tabBase.length - nonvegCount },
    { value: 'nonveg', label: 'Non-veg', count: nonvegCount },
  ] as const;
  const activeTab = state.vtype.length === 1 ? state.vtype[0] : 'all';

  return (
    <div>
      {mixed && (
        <div
          role="group"
          aria-label="Veg or non-veg"
          className="mb-4 flex border-b border-[color:var(--color-rule)]"
        >
          {tabs.map((t) => {
            const on = activeTab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setState({ ...state, vtype: t.value === 'all' ? [] : [t.value] })
                }
                className={cn(
                  'field-label -mb-px flex min-h-[44px] items-center gap-1.5 border-b-2 px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  on
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-ink/60 hover:text-theme-ink',
                )}
              >
                {t.label}
                <span className={cn('field-value text-[10px]', on ? 'opacity-80' : 'opacity-55')}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

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
            <ProductCard key={product.id} product={product} priority={i < 4} quickAdd />
          ))}
        </Stagger>
      )}
    </div>
  );
}
