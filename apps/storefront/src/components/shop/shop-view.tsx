'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { cn } from '@/lib/cn';

const CATEGORY_LABEL: Record<CategorySlug, string> = {
  'hyderabadi-specials': 'Hyderabadi',
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
  'hyderabadi-specials',
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

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest';

/**
 * THE CATALOGUE, in operate mode. The browse surface is a working document:
 * a docket-head for the page title, then a ruled CONTROL STRIP — square-cut
 * category chips, a square sort select, and the result count typed into the
 * record ("SHOWING 24 OF 83") — then the one product grid.
 */
export function ShopView({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = params.get('cat') as CategorySlug | null;
  const sort = (params.get('sort') ?? 'featured') as Sort;

  const filtered = useMemo(() => {
    let out = activeCategory ? products.filter((p) => p.category === activeCategory) : products;
    out = [...out]; // copy before sorting
    if (sort === 'price-asc') {
      out.sort((a, b) => (a.variants[0]?.price.amount ?? 0) - (b.variants[0]?.price.amount ?? 0));
    } else if (sort === 'price-desc') {
      out.sort((a, b) => (b.variants[0]?.price.amount ?? 0) - (a.variants[0]?.price.amount ?? 0));
    } else if (sort === 'newest') {
      out.sort((a, b) => Number(b.new) - Number(a.new));
    } else {
      out.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return out;
  }, [products, activeCategory, sort]);

  function updateParam(name: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value === undefined || value === '') next.delete(name);
    else next.set(name, value);
    startTransition(() => {
      router.replace(`/shop${next.toString() ? `?${next.toString()}` : ''}`, { scroll: false });
    });
  }

  const totalByCategory = useMemo(() => {
    const counts = new Map<CategorySlug, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
  }, [products]);

  const chipClass = (active: boolean) =>
    cn(
      'focus-visible:ring-theme-accent min-h-[36px] rounded-md border px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
      active
        ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
        : 'bg-surface text-theme-ink/80 hover:border-theme-accent hover:text-theme-ink border-[color:var(--color-border)]',
    );

  return (
    <>
      {/*
        THE PAGE HEAD HAS MOVED TO app/shop/page.tsx.

        This component calls `useSearchParams`, so everything it renders sits
        behind a Suspense boundary and resolves to nothing during the static
        export — which is why /shop shipped with no <h1> at all in the crawl.
        The heading is a server concern; the filtering is a client one.
      */}

      {/* ── THE CONTROL STRIP ─────────────────────────────────────────── */}
      <section aria-labelledby="cat-chips" className="container-site">
        <h2 id="cat-chips" className="sr-only">
          Filter and sort
        </h2>
        <div className="border-y border-[color:var(--color-rule)]">
          <div className="flex flex-wrap gap-2 py-3">
            <button
              type="button"
              onClick={() => updateParam('cat', undefined)}
              aria-pressed={activeCategory === null}
              className={chipClass(activeCategory === null)}
            >
              All · {products.length}
            </button>
            {CATEGORY_ORDER.map((c) => {
              const count = totalByCategory.get(c) ?? 0;
              if (count === 0) return null;
              const active = activeCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateParam('cat', active ? undefined : c)}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {CATEGORY_LABEL[c]} · {count}
                </button>
              );
            })}
          </div>

          {/* Result count + sort, on their own ruled line of the strip. */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] py-2.5">
            <p className="field-value text-theme-ink text-sm" aria-live="polite">
              SHOWING {filtered.length} OF {products.length}
              {activeCategory ? ` · ${CATEGORY_LABEL[activeCategory].toUpperCase()}` : ''}
            </p>
            <label className="flex items-center gap-2">
              <span className="field-label">Sort</span>
              <select
                value={sort}
                onChange={(e) =>
                  updateParam('sort', e.target.value === 'featured' ? undefined : e.target.value)
                }
                className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price · low → high</option>
                <option value="price-desc">Price · high → low</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* ── THE GRID ──────────────────────────────────────────────────── */}
      <section aria-label="Products" className="container-site section-y-tight">
        {filtered.length === 0 ? (
          <div className="docket flex flex-col items-start gap-3 p-8">
            <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
            <p className="font-display text-theme-ink text-lg">No entries match this filter.</p>
            <Link href="/shop" className="stamp stamp--ghost mt-1">
              Reset filters
            </Link>
          </div>
        ) : (
          <Stagger
            gap={60}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        )}
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
            const count = totalByCategory.get(c) ?? 0;
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
