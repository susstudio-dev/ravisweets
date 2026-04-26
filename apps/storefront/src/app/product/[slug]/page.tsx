import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Leaf, Package, Snowflake } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ThemeVars } from '@/lib/theme/theme-provider';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductReviews } from '@/components/product/product-reviews';
import { VariantSelector } from '@/components/product/variant-selector';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { ProductCard } from '@/components/product-card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SAMPLE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: 'Not found' };
  const primaryImage = product.images[0];
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const primaryVariant = product.variants[0];
  const related = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.bestseller),
  ).slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    category: product.category,
    offers: product.variants.map((v) => ({
      '@type': 'Offer',
      sku: v.sku,
      priceCurrency: v.price.currency,
      price: v.price.amount,
      availability:
        v.stock_available > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    })),
  };

  return (
    <>
      {/* SSR-seeded flavour palette — zero flash */}
      <ThemeVars palette={product.theme_palette} />

      {/* Breadcrumb / back */}
      <div className="container-site pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      {/* Main product grid */}
      <section className="container-site grid gap-10 py-10 md:grid-cols-2 md:gap-14 md:py-14">
        {/* Gallery */}
        <ProductGallery
          images={product.images}
          title={product.title}
          garnish={product.garnish}
          seed={product.id}
        />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              {product.category === 'hyderabadi-specials'
                ? 'Hyderabadi Specials'
                : product.category.replace(/-/g, ' ')}
            </p>
          </Reveal>

          <TextKinetic
            as="h1"
            text={product.title}
            split="word"
            gap={40}
            className="font-display text-display-md font-semibold leading-[1.05] text-theme-ink md:text-display-lg"
          />

          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-theme-ink/75">{product.description}</p>
          </Reveal>

          {primaryVariant && (
            <Reveal delay={0.18}>
              <VariantSelector product={product} />
            </Reveal>
          )}

          {/* Quick facts */}
          <Reveal delay={0.26}>
            <dl className="mt-2 grid grid-cols-3 gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  Shelf life
                </dt>
                <dd className="mt-1 font-display text-base font-semibold text-theme-ink">
                  {product.shelf_life_days} days
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
                  Storage
                </dt>
                <dd className="mt-1 text-sm font-medium text-theme-ink">
                  {product.storage_instructions.split('.')[0]}.
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                  Dietary
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {product.dietary_tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-theme-glow/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-ink"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* Pincode check stub */}
          <Reveal delay={0.34}>
            <form
              className="flex flex-col gap-2 rounded-2xl border border-dashed border-[color:var(--color-border)] p-4 sm:flex-row sm:items-center"
              action="#"
            >
              <label
                htmlFor="pincode"
                className="text-sm font-medium text-theme-ink/80"
              >
                Check delivery
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                placeholder="6-digit pincode"
                className="min-w-0 flex-1 rounded-full border border-[color:var(--color-border)] bg-surface px-4 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
              <button
                type="submit"
                className="rounded-full border border-theme-ink/25 px-5 py-2 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-accent hover:text-theme-accent"
              >
                Check
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Ingredients & Allergens */}
      <section className="container-site grid gap-8 py-10 md:grid-cols-2 md:gap-14">
        <Reveal>
          <h2 className="font-display text-heading font-semibold text-theme-ink">
            Ingredients
          </h2>
          <p className="mt-3 text-theme-ink/75">{product.ingredients.join(' · ')}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
            Allergens
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.allergens.map((a) => (
              <span
                key={a}
                className="rounded-full border border-theme-accent/40 px-3 py-1 text-xs font-medium text-theme-accent"
              >
                {a}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="font-display text-heading font-semibold text-theme-ink">
            Storage &amp; freshness
          </h2>
          <p className="mt-3 text-theme-ink/75">{product.storage_instructions}</p>
          <p className="mt-4 text-sm text-theme-ink/60">
            Every box leaves our kitchen the day it&rsquo;s packed. We ship in chilled-safe
            packaging with gel packs for perishable items, temperature-controlled for long hauls.
          </p>
        </Reveal>
      </section>

      <PaisleyDivider className="container-site" />

      {/* Reviews */}
      <ProductReviews productId={product.id} productTitle={product.title} />

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="container-site py-12">
          <Reveal className="mb-8">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              You may also love
            </p>
            <h2
              id="related-heading"
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink"
            >
              More from the kitchen
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
