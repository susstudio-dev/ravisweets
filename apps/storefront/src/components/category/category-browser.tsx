'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Paisley } from '@/components/brand/paisley';
import { Stagger } from '@/components/motion/stagger';
import { CategoryFilters } from './category-filters';

function asArray(v: string | null): string[] {
  if (!v) return [];
  return v.split(',').filter(Boolean);
}

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export function CategoryBrowser({
  categorySlug,
  products,
}: {
  categorySlug: CategorySlug;
  products: Product[];
}) {
  const params = useSearchParams();

  const dietary = asArray(params.get('diet'));
  const sort = (params.get('sort') ?? 'featured') as Sort;
  const inStockOnly = params.get('stock') === 'in';

  const shown = useMemo(() => {
    let out = [...products];
    if (dietary.length > 0) {
      out = out.filter((p) =>
        dietary.every((d) => p.dietary_tags.includes(d as (typeof p.dietary_tags)[number])),
      );
    }
    if (inStockOnly) {
      out = out.filter((p) => p.variants.some((v) => v.stock_available > 0));
    }
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
  }, [products, dietary, inStockOnly, sort]);

  return (
    <section className="container-site grid gap-8 pb-20 md:grid-cols-[220px_1fr] md:gap-10">
      <CategoryFilters
        categorySlug={categorySlug}
        activeDietary={dietary}
        activeSort={sort}
        inStockOnly={inStockOnly}
        total={shown.length}
      />

      <div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-theme-ink/60">
            Showing <span className="font-semibold text-theme-ink">{shown.length}</span>{' '}
            {shown.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-8">
            <Paisley size="md" />
            <p className="font-display text-lg font-semibold text-theme-ink">
              Nothing matches those filters.
            </p>
            <p className="text-sm text-theme-ink/70">Try removing a dietary tag, or browse all.</p>
            <Link
              href={`/category/${categorySlug}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-theme-accent hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <Stagger gap={75} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
