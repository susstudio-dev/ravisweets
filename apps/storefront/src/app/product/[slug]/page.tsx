import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS, isNonVeg } from '@ravisweets/shared';
import { FlavourScope } from '@/lib/theme/theme-provider';
import { jsonLdHtml } from '@/lib/seo/json-ld';
import { seoDescription, seoTitle } from '@/lib/seo/metadata';
import { isUsableImage } from '@/lib/images';
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
import { VegMark } from '@/components/veg-mark';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SAMPLE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * What each category IS, in the words a buyer would search.
 *
 * A product title alone ("Kaju Katli", "Cranberry") is 9–24 characters and
 * lands under Google's 30-character floor once `| Ravi Sweets` is appended —
 * 16 of the crawl's short titles were product pages. This gives every title a
 * second, category-true clause to spend the remaining budget on, and it is a
 * clause a person actually types into a search box.
 */
const CATEGORY_TITLE_HOOK: Record<string, string> = {
  sweets: 'Fresh Indian Mithai',
  'sweet-bites': 'Bite-size Mithai Tin',
  'healthy-sweets': 'Sugar-free Laddu',
  namkeens: 'Crisp Namkeen',
  savouries: 'Andhra Savoury Snack',
  'dry-fruits': 'Premium Dry Fruit',
  pickles: 'Andhra Pickle',
  powders: 'Telugu Podi',
  biscuits: 'Bakery Biscuit',
  combos: 'Snack Combo Box',
  'gift-hampers': 'Indian Sweets Gift Hamper',
  'festival-specials': 'Festival Gift Box',
};

/** Reads after the word "More" in the related-products heading. */
const CATEGORY_H2_LABEL: Record<string, string> = {
  sweets: 'sweets from the counter',
  'sweet-bites': 'Sweet Bites flavours',
  'healthy-sweets': 'healthy laddus',
  namkeens: 'namkeens',
  savouries: 'savouries',
  'dry-fruits': 'dry fruits',
  pickles: 'pickles',
  powders: 'podis and powders',
  biscuits: 'biscuits',
  combos: 'combo boxes',
  'gift-hampers': 'gift hampers',
  'festival-specials': 'festival specials',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: 'Not found' };

  /*
   * Many catalogue titles are already `Name — Descriptor` ("Chekkalu — Crunchy
   * Rice Crackers"). Splitting on that dash lets the descriptor be treated as
   * the enrichment, so an over-long one is trimmed while the product NAME is
   * never touched — "Nuvvula Laddu — Bone-Strengthening Sesame Laddu" is 47
   * characters on its own and was the last title over 60 after the suffix.
   * Products with a bare name fall through to the category hook instead.
   */
  const [name = product.title, ...rest] = product.title.split(' — ');
  const descriptor = rest.join(' — ');
  const title = seoTitle(name, descriptor || CATEGORY_TITLE_HOOK[product.category] || '');
  const description = seoDescription(
    product.description,
    'Made fresh to order, without preservatives.',
    'Delivered across India.',
  );
  // Only a photo that resolves may become an og:image — a 404 there produces a
  // blank card on every share, which is worse than no card at all.
  const ogImage = product.images.find((i) => isUsableImage(i.url))?.url;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/product/${product.slug}`,
      images: ogImage ? [ogImage] : undefined,
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

  /*
   * `image` previously serialised every catalogue URL unconditionally, and
   * every one of those pointed at the retired WordPress library. Structured
   * data claiming images that 404 is a Rich Results error, not a cosmetic one:
   * Google drops the product snippet rather than showing it without a photo.
   * An OMITTED image property degrades gracefully; a broken one does not.
   */
  const images = product.images.map((i) => i.url).filter(isUsableImage);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    ...(images.length ? { image: images } : {}),
    category: product.category,
    brand: { '@type': 'Brand', name: 'Ravi Sweets' },
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
              <div className="flex items-center gap-2">
                <VegMark nonVeg={isNonVeg(product)} size="md" />
                <p className="field-label text-theme-accent">
                  {product.category.replace(/-/g, ' ')}
                </p>
              </div>
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
              {/*
                Third and last of the duplicated product H2s. Naming BOTH the
                product and the category is what makes it unique per page —
                scoping it to the category alone still left 15 savoury pages
                sharing one heading. It also gives the block honest
                internal-link context: a crawler reads what the four links
                beneath it lead to, and why they are related to this page.
              */}
              <h2
                id="related-heading"
                className="font-display text-display-md text-theme-ink leading-[1.05]"
              >
                More {CATEGORY_H2_LABEL[product.category] ?? 'from the counter'}, like{' '}
                {product.title}
              </h2>
            </div>
          </Reveal>
          <ProductGrid>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} quickAdd />
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
