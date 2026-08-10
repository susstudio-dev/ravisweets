'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
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
            <p className="text-text-muted text-sm">Try removing a dietary tag, or browse all.</p>
            <Link href={`/category/${categorySlug}`} className="stamp stamp--ghost mt-1">
              Clear filters
            </Link>
          </div>
        ) : (
          <Stagger gap={75} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
