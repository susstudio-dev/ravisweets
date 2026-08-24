'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { FilterSheet } from '@/components/catalogue/filter-sheet';
import { ProductFilters, SortSelect } from '@/components/catalogue/product-filters';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { applyFilters, categoryCounts, sortProducts } from '@/lib/catalogue/filters';
import { useProductFilters } from '@/lib/catalogue/use-product-filters';
import { cn } from '@/lib/cn';

const CATEGORY_LABEL: Record<CategorySlug, string> = {
  sweets: 'Sweets',
  'sweet-bites': 'Sweet bites',
  'healthy-sweets': 'Healthy sweets',
  namkeens: 'Namkeens',
  savouries: 'Savouries',
  'dry-fruits': 'Dry fruits',
  pickles: 'Pickles',
  powders: 'Podis & powders',
  biscuits: 'Biscuits',
  combos: 'Combos',
  'gift-hampers': 'Gift hampers',
  'festival-specials': 'Festival',
};

const CATEGORY_ORDER: CategorySlug[] = [
  'sweets',
  'sweet-bites',
  'healthy-sweets',
  'namkeens',
  'savouries',
  'dry-fruits',
  'pickles',
  'powders',
  'biscuits',
  'combos',
  'gift-hampers',
  'festival-specials',
];

/**
 * THE CATALOGUE, in operate mode.
 *
 * This page used to offer category chips and a sort, and nothing else — while
 * /category offered dietary tags, in-stock and a sort. Two surfaces, two sets
 * of semantics, written twice. Both now read one model (lib/catalogue/filters)
 * and render one panel, so a filter added there appears on both.
 *
 * LAYOUT follows /category deliberately: a sticky 260px refine rail beside the
 * grid. On phones the rail collapses to the FilterSheet trigger, which stacks
 * above the products rather than burying them under a full-height panel.
 *
 * The category strip stays horizontal and stays in the grid column: it is the
 * catalogue's primary navigation, not one filter among six, and demoting it
 * into the rail would bury the move most shoppers make first.
 */
export function ShopView({ products }: { products: Product[] }) {
  const { state, setState } = useProductFilters();

  const shown = useMemo(
    () => sortProducts(applyFilters(products, state), state.sort),
    [products, state],
  );
  const catCounts = useMemo(() => categoryCounts(products, state), [products, state]);

  const chipClass = (active: boolean) =>
    cn(
      'focus-visible:ring-theme-accent min-h-[36px] rounded-md border px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
      active
        ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
        : 'bg-surface text-theme-ink/80 hover:border-theme-accent hover:text-theme-ink border-[color:var(--color-border)]',
    );

  /** Everything the non-category filters leave, whatever aisle you are in. */
  const totalAcrossCategories = useMemo(
    () => Array.from(catCounts.values()).reduce((a, b) => a + b, 0),
    [catCounts],
  );

  return (
    <>
      {/*
        THE PAGE HEAD LIVES IN app/shop/page.tsx.

        This component calls `useSearchParams`, so everything it renders sits
        behind a Suspense boundary and resolves to nothing during the static
        export — which is why /shop once shipped with no <h1> at all. The
        heading is a server concern; the filtering is a client one.
      */}
      <section
        aria-label="Browse the catalogue"
        className="container-site grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10"
      >
        {/*
          THE RAIL SCROLLS INSIDE ITSELF. Sticky alone was a trap: pinned 80px
          down an 800px viewport, a panel taller than the remaining space had no
          way to reveal its tail — the page scrolled, the pinned rail did not,
          and it carried no scrollbar of its own. `Sort by` was unreachable.

          `px-1 -mx-1` is not decoration. Setting overflow-y to anything but
          `visible` makes the computed overflow-x `auto` too, which clips the
          `focus-visible:ring-2` painted outside each chip; the padding gives the
          ring somewhere to land and the negative margin puts the column back
          where it was.
        */}
        <aside
          aria-label="Filters"
          className="rail-scroll lg:sticky lg:top-20 lg:-mx-1 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:px-1"
        >
          <FilterSheet products={products} state={state} onChange={setState} />
          <div className="hidden lg:block">
            <ProductFilters products={products} state={state} onChange={setState} />
          </div>
        </aside>

        <div>
          {/* ── CATEGORY STRIP ─────────────────────────────────────────── */}
          <div className="border-y border-[color:var(--color-rule)]">
            <h2 className="sr-only">Filter by category</h2>
            <div className="flex flex-wrap gap-2 py-3">
              <button
                type="button"
                onClick={() => setState({ ...state, cat: null })}
                aria-pressed={state.cat === null}
                className={chipClass(state.cat === null)}
              >
                All · {totalAcrossCategories}
              </button>
              {CATEGORY_ORDER.map((c) => {
                const count = catCounts.get(c) ?? 0;
                const active = state.cat === c;
                // Hidden at zero unless it is the aisle you are standing in —
                // removing the active chip would strand you with no way back.
                if (count === 0 && !active) return null;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setState({ ...state, cat: active ? null : c })}
                    aria-pressed={active}
                    className={chipClass(active)}
                  >
                    {CATEGORY_LABEL[c]} · {count}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] py-2.5">
              <p className="field-value text-theme-ink text-sm" aria-live="polite">
                SHOWING {shown.length} OF {products.length}
                {state.cat ? ` · ${CATEGORY_LABEL[state.cat].toUpperCase()}` : ''}
              </p>
              <label className="flex items-center gap-2">
                <span className="field-label">Sort</span>
                <SortSelect value={state.sort} onChange={(sort) => setState({ ...state, sort })} />
              </label>
            </div>
          </div>

          {/* ── THE GRID ───────────────────────────────────────────────── */}
          <div className="section-y-tight">
            {shown.length === 0 ? (
              <div className="docket flex flex-col items-start gap-3 p-8">
                <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
                <p className="font-display text-theme-ink text-lg">
                  No entries match those filters.
                </p>
                <p className="text-text-muted text-sm">
                  Try removing one — the counts beside each option show what it would leave.
                </p>
                <Link href="/shop" className="stamp stamp--ghost mt-1">
                  Reset filters
                </Link>
              </div>
            ) : (
              <Stagger
                gap={60}
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
              >
                {/* Four is the widest first row this grid ever has (xl). */}
                {shown.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} quickAdd />
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>

      {/* ── THE INDEX OF COLLECTIONS ──────────────────────────────────── */}
      <section aria-labelledby="browse-cats" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="browse-cats" className="font-display text-display-md text-theme-ink">
              Or jump straight into a collection.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_ORDER.map((c) => {
            // Unfiltered totals on purpose: this is a directory of the shop,
            // not a view of the current query.
            const count = products.filter((p) => p.category === c).length;
            if (count === 0) return null;
            return (
              <Link
                key={c}
                href={`/category/${c}`}
                className="docket group flex flex-col justify-between gap-3 p-5 transition-shadow duration-200 hover:shadow-lifted"
              >
                <div>
                  <h3 className="font-display text-theme-ink text-lg">{CATEGORY_LABEL[c]}</h3>
                  <p className="field-value text-text-muted mt-1 text-xs">
                    {count} {count === 1 ? 'PRODUCT' : 'PRODUCTS'}
                  </p>
                </div>
                <span className="field-label text-theme-accent group-hover:text-theme-ink inline-flex items-center gap-1 transition-colors">
                  Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
