import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { CategorySlug } from '@ravisweets/shared';
import { SAMPLE_PRODUCTS } from '@/lib/sample-products';
import { ProductCard } from '@/components/product-card';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { CategoryFilters } from '@/components/category/category-filters';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CATEGORY_META: Record<
  CategorySlug,
  { title: string; eyebrow: string; body: string }
> = {
  'hyderabadi-specials': {
    title: 'Hyderabadi Specials',
    eyebrow: 'Nizami classics',
    body: 'Recipes from the royal kitchens of Hyderabad — Qubani ka Meetha, Double ka Meetha, Badam ki Jali. Slow-cooked, hand-finished, never hurried.',
  },
  sweets: {
    title: 'Sweets',
    eyebrow: 'Fresh daily',
    body: 'Kaju Katli, Soan Papdi, seasonal ladoos — made fresh in small batches with no preservatives.',
  },
  namkeens: {
    title: 'Namkeens',
    eyebrow: 'Chai-time favourites',
    body: 'Crunchy, spiced, and stubbornly moreish. Fried in small batches and sealed the same day.',
  },
  'dry-fruits': {
    title: 'Dry Fruits',
    eyebrow: 'From the pantry',
    body: 'A-grade almonds, pistachios, cashews — hand-picked, roasted gently, packed tight.',
  },
  combos: {
    title: 'Combos',
    eyebrow: 'A little of everything',
    body: 'Curated duos and trios — pick a combination that suits the palate or the occasion.',
  },
  'gift-hampers': {
    title: 'Gift Hampers',
    eyebrow: 'Festival-ready',
    body: 'Hand-packed celebration boxes, wrapped in silk and sealed with a paisley tag. Gift-ready.',
  },
  'festival-specials': {
    title: 'Festival Specials',
    eyebrow: 'By season',
    body: "Diwali, Raksha Bandhan, Eid, and more — curated runs that open when the festival does, and close when it's over.",
  },
};

const ALL_SLUGS: CategorySlug[] = [
  'hyderabadi-specials',
  'sweets',
  'namkeens',
  'dry-fruits',
  'combos',
  'gift-hampers',
  'festival-specials',
];

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) return { title: 'Category not found' };
  return {
    title: meta.title,
    description: meta.body,
  };
}

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(',').filter(Boolean);
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) notFound();

  const sp = await searchParams;

  const dietaryFilters = asArray(sp.diet);
  const sort = (typeof sp.sort === 'string' ? sp.sort : 'featured') as
    | 'featured'
    | 'price-asc'
    | 'price-desc'
    | 'newest';
  const inStockOnly = sp.stock === 'in';

  let products = SAMPLE_PRODUCTS.filter((p) => p.category === slug);
  if (dietaryFilters.length > 0) {
    products = products.filter((p) =>
      dietaryFilters.every((d) => p.dietary_tags.includes(d as (typeof p.dietary_tags)[number])),
    );
  }
  if (inStockOnly) {
    products = products.filter((p) => p.variants.some((v) => v.stock_available > 0));
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => (a.variants[0]?.price.amount ?? 0) - (b.variants[0]?.price.amount ?? 0));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.variants[0]?.price.amount ?? 0) - (a.variants[0]?.price.amount ?? 0));
  } else if (sort === 'newest') {
    products.sort((a, b) => Number(b.new) - Number(a.new));
  } else {
    products.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-site pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      {/* Category header */}
      <section
        aria-labelledby="cat-heading"
        className="container-site grid gap-6 py-10 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-10 md:py-14"
      >
        <div>
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              {meta.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1
              id="cat-heading"
              className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg"
            >
              {meta.title}
            </h1>
          </Reveal>
        </div>
        <Reveal delay={0.16}>
          <p className="text-theme-ink/70 md:text-lg">{meta.body}</p>
        </Reveal>
      </section>

      {/* Filters + grid */}
      <section className="container-site grid gap-8 pb-20 md:grid-cols-[220px_1fr] md:gap-10">
        <CategoryFilters
          categorySlug={slug as CategorySlug}
          activeDietary={dietaryFilters}
          activeSort={sort}
          inStockOnly={inStockOnly}
          total={products.length}
        />

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-theme-ink/60">
              Showing <span className="font-semibold text-theme-ink">{products.length}</span>{' '}
              {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-8">
              <Paisley size="md" />
              <p className="font-display text-lg font-semibold text-theme-ink">
                Nothing matches those filters.
              </p>
              <p className="text-sm text-theme-ink/70">Try removing a dietary tag, or browse all.</p>
              <Link
                href={`/category/${slug}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-theme-accent hover:underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <Stagger
              gap={75}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
