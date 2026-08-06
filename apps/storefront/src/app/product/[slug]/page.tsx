import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { FlavourScope } from '@/lib/theme/theme-provider';
import { jsonLdHtml } from '@/lib/seo/json-ld';
import { CompositionPanel } from '@/components/product/composition-panel';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductReviews } from '@/components/product/product-reviews';
import { VariantSelector } from '@/components/product/variant-selector';
import {
  HamperARPreview,
  SAMPLE_HAMPER_GLB,
  SAMPLE_HAMPER_USDZ,
} from '@/components/ar/hamper-ar-preview';
import { Reveal } from '@/components/motion/reveal';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { ProductCard } from '@/components/product-card';
import { ProductGrid } from '@/components/product-grid';

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
        v.stock_available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    })),
  };

  return (
    <FlavourScope palette={product.theme_palette}>
      {/* Breadcrumb / back */}
      <div className="container-site pt-6">
        <Link
          href="/"
          className="text-theme-ink/70 hover:text-theme-accent inline-flex min-h-11 items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      {/* Main product grid */}
      <section className="container-site section-y-tight grid gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} productId={product.id} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="field-label text-theme-accent">
                {product.category === 'hyderabadi-specials'
                  ? 'Hyderabadi Specials'
                  : product.category.replace(/-/g, ' ')}
              </p>
              {/* Freshness is the product claim, so it leads the record. */}
              {product.shelf_life_days <= 7 && <span className="live-mark">Made to order</span>}
            </div>
          </Reveal>

          <TextKinetic
            as="h1"
            text={product.title}
            split="word"
            gap={40}
            className="font-display text-display-md text-theme-ink md:text-display-lg leading-[1.05]"
          />

          <Reveal delay={0.1}>
            <p className="text-theme-ink/75 text-lg leading-relaxed">{product.description}</p>
          </Reveal>

          {primaryVariant && (
            <Reveal delay={0.18}>
              <VariantSelector product={product} />
            </Reveal>
          )}

          {/* AR pack-preview — only on hamper / festival SKUs where it makes
              sense to "see the box on your desk". Sweets / pickles / podis
              don't need 3D. */}
          {(product.category === 'gift-hampers' || product.category === 'festival-specials') && (
            <Reveal delay={0.22}>
              <HamperARPreview
                glb={SAMPLE_HAMPER_GLB}
                usdz={SAMPLE_HAMPER_USDZ}
                caption={product.title}
                bg={product.theme_palette.base}
              />
            </Reveal>
          )}

          {/*
            THE RECORD. Transparency is a conversion feature on this product
            (PRODUCT.md principle 2), so shelf life, storage and diet are set
            as the spec they are — ruled label/value rows, values in the typed
            face — rather than three icon columns squeezed 3-up on a phone.
          */}
          <Reveal delay={0.26}>
            <dl className="docket mt-2 px-4 py-1">
              <div className="field-row">
                <dt className="field-label">Shelf life</dt>
                <dd className="field-value text-theme-ink text-sm font-bold">
                  {product.shelf_life_days} DAYS
                </dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Preservatives</dt>
                <dd className="field-value text-theme-ink text-sm font-bold">NIL</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Storage</dt>
                <dd className="field-value text-right text-sm">
                  {product.storage_instructions.split('.')[0]}.
                </dd>
              </div>
              {product.dietary_tags.length > 0 && (
                <div className="field-row">
                  <dt className="field-label">Dietary</dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {product.dietary_tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="bg-theme-glow/30 text-theme-ink rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>

          {/* Pincode check stub */}
          <Reveal delay={0.34}>
            <form
              className="flex flex-col gap-2 rounded-lg border border-dashed border-[color:var(--color-border)] p-4 sm:flex-row sm:items-center"
              action="#"
            >
              <label htmlFor="pincode" className="field-label">
                Check delivery
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                placeholder="6-digit pincode"
                className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 min-w-0 flex-1 rounded-md border border-[color:var(--color-border)] px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
              <button type="submit" className="stamp stamp--ghost">
                Check
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Composition record — names every ingredient, declares allergens
          loudly, and states the pack facts (preservatives, shelf life,
          storage, licence, supply) as ruled field-rows. */}
      <CompositionPanel product={product} />

      {/* Reviews */}
      <ProductReviews productId={product.id} productTitle={product.title} />

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="container-site section-y-tight">
          <Reveal>
            <div className="docket-head">
              <h2
                id="related-heading"
                className="font-display text-display-md text-theme-ink leading-[1.05]"
              >
                More from the kitchen
              </h2>
            </div>
          </Reveal>
          <ProductGrid>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
    </FlavourScope>
  );
}
