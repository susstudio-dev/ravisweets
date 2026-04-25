'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
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

  return (
    <>
      {/* Header */}
      <section className="container-site py-12 md:py-16">
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Shop all
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
            Everything in the catalogue.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-theme-ink/70 md:text-lg">
            {products.length} products across {CATEGORY_ORDER.length} categories — filter by
            category below, or use search for something specific.
          </p>
        </Reveal>

        {/* Search shortcut */}
        <Reveal delay={0.15}>
          <Link
            href="/search"
            className="mt-8 inline-flex max-w-xl items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-5 py-3 text-sm text-theme-ink/60 transition-all hover:-translate-y-0.5 hover:border-theme-accent hover:text-theme-ink hover:shadow-soft"
          >
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
            Search by name, ingredient, or occasion …
            <ArrowRight className="ml-auto h-4 w-4 text-theme-ink/40" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      {/* Category chips */}
      <section aria-labelledby="cat-chips" className="container-site pb-4">
        <h2 id="cat-chips" className="sr-only">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam('cat', undefined)}
            aria-pressed={activeCategory === null}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
              activeCategory === null
                ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)] shadow-soft'
                : 'border-[color:var(--color-border)] bg-surface text-theme-ink/80 hover:-translate-y-0.5 hover:border-theme-accent',
            )}
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
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  active
                    ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)] shadow-soft'
                    : 'border-[color:var(--color-border)] bg-surface text-theme-ink/80 hover:-translate-y-0.5 hover:border-theme-accent',
                )}
              >
                {CATEGORY_LABEL[c]} · {count}
              </button>
            );
          })}
        </div>

        {/* Result count + sort */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-theme-ink/60" aria-live="polite">
            Showing <span className="font-semibold text-theme-ink">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'product' : 'products'}
            {activeCategory && (
              <span> in {CATEGORY_LABEL[activeCategory]}</span>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) =>
                updateParam('sort', e.target.value === 'featured' ? undefined : e.target.value)
              }
              className="rounded-full border border-[color:var(--color-border)] bg-surface px-3 py-1 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price · low → high</option>
              <option value="price-desc">Price · high → low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </section>

      {/* Grid */}
      <section className="container-site pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-10">
            <Paisley size="md" />
            <p className="font-display text-lg font-semibold text-theme-ink">
              No products match that filter.
            </p>
            <Link href="/shop" className="text-sm font-semibold text-theme-accent hover:underline">
              Clear filters →
            </Link>
          </div>
        ) : (
          <Stagger gap={60} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        )}
      </section>

      <PaisleyDivider className="container-site" />

      {/* Browse by category cards */}
      <section aria-labelledby="browse-cats" className="container-site py-16">
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Or browse by collection
          </p>
          <h2 id="browse-cats" className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg">
            Jump straight in.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_ORDER.map((c) => {
            const count = totalByCategory.get(c) ?? 0;
            if (count === 0) return null;
            return (
              <Link
                key={c}
                href={`/category/${c}`}
                className="group flex flex-col justify-between gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-theme-ink">
                    {CATEGORY_LABEL[c]}
                  </h3>
                  <p className="mt-1 text-xs text-theme-ink/60">
                    {count} {count === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-theme-accent transition-transform duration-300 group-hover:translate-x-1">
                  Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
