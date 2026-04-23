import Link from 'next/link';
import { ArrowRight, Award, Leaf, Truck } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { SAMPLE_PRODUCTS } from '@/lib/sample-products';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { HeroStill } from '@/components/hero/hero-still';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { FlavourAtlas } from '@/components/sections/flavour-atlas';
import { HeritageStrip } from '@/components/sections/heritage-strip';
import { CraftStrip } from '@/components/sections/craft-strip';
import { PressMarquee } from '@/components/sections/press-marquee';
import { FestivalTease } from '@/components/sections/festival-tease';
import { EditorialBand } from '@/components/sections/editorial-band';
import { GiftingGuide } from '@/components/sections/gifting-guide';

const CATEGORIES = [
  {
    slug: 'hyderabadi-specials',
    title: 'Hyderabadi Specials',
    blurb: 'Nizami classics',
    accent: '#c0592b',
  },
  { slug: 'sweets', title: 'Sweets', blurb: 'Fresh daily', accent: '#a56a0f' },
  { slug: 'namkeens', title: 'Namkeens', blurb: 'Chai-time favourites', accent: '#8b3a1f' },
  { slug: 'gift-hampers', title: 'Gift Hampers', blurb: 'Festival-ready', accent: '#7a4e0a' },
];

const TRUST = [
  {
    icon: Leaf,
    title: 'No preservatives',
    body: 'Small-batch, slow-cooked, and made fresh every day in our FSSAI-certified kitchen.',
  },
  {
    icon: Truck,
    title: 'Delivered across India',
    body: 'Temperature-controlled dispatch with chilled-safe packaging. Global shipping — coming soon.',
  },
  {
    icon: Award,
    title: 'Hyderabad heritage',
    body: 'Recipes from the Nizami and Deccan kitchens, kept close to the original.',
  },
];

export default function HomePage() {
  const featured = SAMPLE_PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const bestsellers = SAMPLE_PRODUCTS.filter((p) => p.bestseller).slice(0, 4);

  return (
    <>
      <HeroStill />

      <FlavourAtlas />

      <PaisleyDivider className="container-site" />

      {/* Categories */}
      <section aria-labelledby="categories-heading" className="container-site pb-12">
        <h2 id="categories-heading" className="sr-only">
          Browse categories
        </h2>
        <Stagger gap={70} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div
                className="absolute inset-x-0 -bottom-12 h-24 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ backgroundColor: cat.accent }}
                aria-hidden="true"
              />
              <div className="relative">
                <h3 className="font-display text-lg font-semibold text-theme-ink">{cat.title}</h3>
                <p className="mt-1 text-xs text-theme-ink/60">{cat.blurb}</p>
              </div>
              <div
                className="relative flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: cat.accent }}
              >
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      <PressMarquee />

      {/* Featured */}
      <section aria-labelledby="featured-heading" className="container-site py-20">
        <Reveal className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Handpicked
            </p>
            <h2
              id="featured-heading"
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              This season&rsquo;s featured
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-theme-ink transition-colors hover:text-theme-accent sm:inline-flex"
          >
            Shop all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger gap={80} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Stagger>
      </section>

      {/* Full-bleed editorial band — heritage */}
      <EditorialBand
        eyebrow="The house rule"
        headline="If a sweet can be made faster, it can also be made less well."
        body="A simple promise we keep. Slow-cooked rabri, hand-cut diamonds, silver leaf laid by hand — every box leaves the kitchen checked by two pairs of eyes."
        cta={{ label: 'Read our story', href: '/about' }}
        image="https://images.unsplash.com/photo-1606491048802-8342506d6471?w=1800&q=90&auto=format&fit=crop"
        imageAlt=""
        align="center"
      />

      <HeritageStrip />

      {/* Gifting guide — three personas */}
      <GiftingGuide />

      {/* Trust strip */}
      <section
        aria-labelledby="trust-heading"
        className="border-y border-[color:var(--color-border)] bg-[color:var(--theme-ink)]/[0.03]"
      >
        <div className="container-site grid gap-8 py-14 md:grid-cols-3">
          <h2 id="trust-heading" className="sr-only">
            Why Ravi Sweets
          </h2>
          <Stagger gap={90} className="contents">
            {TRUST.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[color:var(--theme-base)]"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-theme-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-theme-ink/70">{item.body}</p>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Bestsellers */}
      <section aria-labelledby="bestsellers-heading" className="container-site py-20">
        <Reveal className="mb-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Loved by Hyderabad
          </p>
          <h2
            id="bestsellers-heading"
            className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
          >
            Bestsellers
          </h2>
        </Reveal>
        <Stagger gap={80} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Stagger>
      </section>

      <CraftStrip />

      {/* Full-bleed editorial band — festival */}
      <EditorialBand
        eyebrow="Diwali 2026"
        headline="Wrapped by hand, in brass and silk."
        body="Six hampers, three price bands, logo-ready for corporate runs. Priority list opens first to our earlier customers and corporate accounts."
        cta={{ label: 'Join the priority list', href: '/festivals/diwali' }}
        image="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1800&q=90&auto=format&fit=crop"
        imageAlt=""
        align="left"
      />

      <FestivalTease />

      {/* Corporate CTA — dark scene */}
      <section className="container-site py-20">
        <Reveal direction="up" distance={20}>
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ backgroundColor: '#2a1505', color: '#fdf6ec' }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: '#e9ad4a' }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: '#f2c66f' }}
            />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: '#f2c66f' }}
                >
                  <Paisley size="sm" color="#f2c66f" />
                  For HR &amp; Admin teams
                </p>
                <h2 className="mt-3 font-display text-display-md md:text-display-lg">
                  Corporate gifting, done the Hyderabadi way.
                </h2>
                <p className="mt-3 text-sm text-[#fdf6ec]/85 md:text-base">
                  MOQ-based pricing, logo-printed packaging, multi-address delivery via CSV, and
                  GST-compliant invoices. One dedicated account manager for your Diwali run.
                </p>
              </div>
              <Link
                href="/corporate"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#e9ad4a] px-6 py-3 text-sm font-semibold text-[#2a1505] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f2c66f]"
              >
                Request a quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
