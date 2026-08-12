import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import { ShopView } from '@/components/shop/shop-view';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Shop All Sweets, Namkeens & Hampers',
  description:
    'The whole Ravi Sweets catalogue — mithai, sweet bites, namkeens, pickles, podis and gift hampers. Filter by category or search.',
  alternates: { canonical: '/shop' },
};

function ShopFallback() {
  return (
    <section className="container-site section-y-tight">
      <div className="bg-theme-ink/5 h-10 animate-pulse rounded-md" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-theme-ink/5 aspect-square animate-pulse rounded-lg" />
        ))}
      </div>
    </section>
  );
}

/** Display order and labels for the index — mirrors the client grid's chips. */
const CATEGORY_LABEL: Record<string, string> = {
  'hyderabadi-specials': 'Hyderabadi specials',
  sweets: 'Sweets',
  'sweet-bites': 'Sweet Bites',
  'healthy-sweets': 'Healthy sweets',
  namkeens: 'Namkeens',
  savouries: 'Savouries',
  'dry-fruits': 'Dry fruits',
  pickles: 'Pickles',
  powders: 'Podis & powders',
  biscuits: 'Biscuits',
  combos: 'Combos',
  'gift-hampers': 'Gift hampers',
  'festival-specials': 'Festival specials',
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL);

const BY_CATEGORY = CATALOGUE.reduce((acc, p) => {
  const list = acc.get(p.category) ?? [];
  list.push(p);
  acc.set(p.category, list);
  return acc;
}, new Map<string, typeof CATALOGUE>());

/** Distinct categories actually represented in the catalogue. */
const CATEGORY_COUNT = BY_CATEGORY.size;

export default function ShopPage() {
  return (
    <>
      {/*
        THE PAGE HEAD, RENDERED ON THE SERVER.

        It used to live inside `ShopView`, which is a client component gated on
        `useSearchParams` — so the entire head, <h1> included, was inside a
        Suspense boundary that resolves to the fallback during a static export.
        The crawl found /shop with no <h1>. Nothing here needs the URL state,
        so nothing here belongs behind that boundary.
      */}
      <section className="container-site section-y-tight">
        <Reveal>
          {/* No kicker above the heading — the docket-head carries itself. */}
          <div className="docket-head">
            <h1 className="font-display text-display-md md:text-display-lg text-theme-ink">
              Everything in the catalogue.
            </h1>
            <Link
              href="/search"
              className="text-theme-ink hover:text-theme-accent inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <SearchIcon className="h-4 w-4" aria-hidden="true" />
              Search by name or ingredient
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-text-muted max-w-2xl md:text-lg">
            {CATALOGUE.length} products across {CATEGORY_COUNT} categories — filter by category
            below, or use search for something specific.
          </p>
        </Reveal>
      </section>

      <Suspense fallback={<ShopFallback />}>
        <ShopView products={CATALOGUE} />
      </Suspense>

      {/*
        THE CATALOGUE AS A SERVER-RENDERED INDEX.

        Same reasoning as the category pages: the grid above is client-only, so
        the built /shop page contained 23 words and not one product link. This
        is the whole catalogue as plain anchors grouped by category — a text
        index of the shop, which is genuinely the fastest way to find a named
        product, and the only version of this page a crawler can read without
        executing JavaScript.
      */}
      <section aria-labelledby="index-heading" className="container-site section-y-tight">
        <div className="docket-head">
          <h2 id="index-heading" className="font-display text-heading text-theme-ink">
            The full catalogue, by category
          </h2>
          <p className="field-label">Index</p>
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_ORDER.filter((c) => BY_CATEGORY.has(c)).map((slug) => (
            <div key={slug}>
              <h3 className="field-label">
                <Link href={`/category/${slug}`} className="hover:text-theme-accent">
                  {CATEGORY_LABEL[slug]}
                </Link>
              </h3>
              <ul className="mt-2 space-y-1.5">
                {BY_CATEGORY.get(slug)!.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      className="text-theme-ink/80 hover:text-theme-accent text-sm transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
