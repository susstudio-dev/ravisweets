import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CATALOGUE, type CategorySlug } from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { CategoryBrowser } from '@/components/category/category-browser';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_META: Record<
  CategorySlug,
  { title: string; eyebrow: string; body: string }
> = {
  'hyderabadi-specials': {
    title: 'Hyderabadi Specials',
    eyebrow: 'Deccan classics',
    body: 'Hyderabadi sweets — Qubani ka Meetha, Double ka Meetha, Badam ki Jali — slow-cooked the old way in our Khammam kitchen.',
  },
  sweets: {
    title: 'Sweets',
    eyebrow: 'Fresh daily',
    body: 'Kaju Katli, Gulab Jamun, seasonal ladoos — made fresh in small batches with no preservatives.',
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) notFound();

  const products = CATALOGUE.filter((p) => p.category === slug);

  return (
    <>
      <div className="container-site pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </div>

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

      <Suspense fallback={<div className="container-site pb-20" />}>
        <CategoryBrowser categorySlug={slug as CategorySlug} products={products} />
      </Suspense>
    </>
  );
}
