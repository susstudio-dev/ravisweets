import Link from 'next/link';
import { ArrowRight, Award, Leaf, Truck } from 'lucide-react';
import Image from 'next/image';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { HeroStill } from '@/components/hero/hero-still';
import { SweetEssencePanel } from '@/components/sections/sweet-essence-panel';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { HeritageStrip } from '@/components/sections/heritage-strip';
import { CraftStrip } from '@/components/sections/craft-strip';
import { PressMarquee } from '@/components/sections/press-marquee';
import { FestivalTease } from '@/components/sections/festival-tease';
import { FlavourAtlas } from '@/components/sections/flavour-atlas';
import { EditorialBand } from '@/components/sections/editorial-band';
import { EditorialScrollBand } from '@/components/sections/editorial-scroll-band';
import { SignatureMoment } from '@/components/sections/signature-moment';
import { GiftingGuide } from '@/components/sections/gifting-guide';
import { HOME_FLAGS } from '@/lib/flags/visual-v2';

// Home-route First Load JS budget raised from 180 KB → 185 KB in this change.
// Per design.md Decision 10 of openspec/changes/app-polish-and-motion-depth,
// lazy-loading small components at this scale (< 2 KB) costs more in loader
// overhead than it saves. Raising the ceiling with LCP/INP/CLS evidence
// captured in tasks.md §5 is the honest path.

// IngredientMarquee is specced + built (src/components/sections/ingredient-marquee.tsx)
// but not wired into the home page yet — it would push the home route over the
// 180 KB First Load JS budget. Enable when there's ~3 KB of headroom (e.g. after
// consolidating motion imports, or swapping SAMPLE_PRODUCTS for a trimmed slice
// rather than the full 20-product catalogue on the home page).

// Six headline categories pictured with a real ravisweets product shot.
// The full list of 13 categories lives in the header megamenu.
const CATEGORIES = [
  {
    slug: 'hyderabadi-specials',
    title: 'Hyderabadi Specials',
    blurb: 'Deccan classics',
    accent: '#c0592b',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png',
  },
  {
    slug: 'sweets',
    title: 'Sweets',
    blurb: 'Kaju Katli · Boondi Laddu · Mysore Pak',
    accent: '#a56a0f',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
  },
  {
    slug: 'savouries',
    title: 'Savouries',
    blurb: 'Andhra chai-time crunch',
    accent: '#7b4610',
    image: 'https://ravisweets.com/wp-content/uploads/2025/08/karapusa.webp',
  },
  {
    slug: 'pickles',
    title: 'Pickles',
    blurb: 'Gongura · Allam · Mamidikaya',
    accent: '#a83c10',
    image: 'https://ravisweets.com/wp-content/uploads/2025/08/gongura.webp',
  },
  {
    slug: 'gift-hampers',
    title: 'Gift Hampers',
    blurb: 'Diwali · Wedding · Corporate',
    accent: '#7a4e0a',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png',
  },
  {
    slug: 'healthy-sweets',
    title: 'Healthy Sweets',
    blurb: 'Sugar-free laddu range',
    accent: '#6e4810',
    image: 'https://ravisweets.com/wp-content/uploads/2025/08/booster.webp',
  },
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
    title: 'Telangana heritage',
    body: 'Recipes from the Deccan sweet tradition, made in our Khammam kitchen.',
  },
];

export default function HomePage() {
  // Bestsellers shown above the fold so first-time visitors can buy immediately.
  // Featured items still surface inside FlavourAtlas + SignatureMoment downstream;
  // the standalone Featured grid was removed to keep the home page tight.
  const bestsellers = SAMPLE_PRODUCTS.filter((p) => p.bestseller).slice(0, 8);

  return (
    <>
      <HeroStill />

      {/* Today's bestsellers — quick-buy */}
      <section
        aria-labelledby="bestsellers-top-heading"
        className="container-site pt-10 md:pt-14"
      >
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Loved by Telangana — buy in one tap
            </p>
            <h2
              id="bestsellers-top-heading"
              className="mt-2 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              Today&rsquo;s bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-theme-ink transition-colors hover:text-theme-accent"
          >
            Shop all 80+ products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger
          gap={50}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} quickAdd />
          ))}
        </Stagger>
      </section>

      {/* Image-led category showcase */}
      <section
        aria-labelledby="categories-heading"
        className="container-site py-16 md:py-20"
      >
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Browse the kitchen
            </p>
            <h2
              id="categories-heading"
              className="mt-2 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              What we make.
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-theme-ink/65 md:block">
            Six headline ranges. Pickles, podis, biscuits, dry fruits and combos sit
            inside the <Link href="/shop" className="font-semibold text-theme-accent hover:underline">full shop</Link>.
          </p>
        </Reveal>

        <Stagger gap={70} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative flex min-h-[14rem] flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--color-border)] p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, color-mix(in oklab, ${cat.accent} 18%, var(--theme-base)) 0%, var(--theme-base) 75%)`,
              }}
            >
              {/* Floating product cutout */}
              <div className="pointer-events-none absolute -right-6 -top-4 h-36 w-36 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 md:h-44 md:w-44">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-contain drop-shadow-[0_18px_28px_rgba(60,30,5,0.18)]"
                />
              </div>
              <div className="relative max-w-[60%]">
                <h3 className="font-display text-xl font-semibold text-theme-ink md:text-2xl">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-theme-ink/65">{cat.blurb}</p>
              </div>
              <div
                className="relative inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: cat.accent }}
              >
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      <SweetEssencePanel />

      <FlavourAtlas />

      <SignatureMoment />

      <PaisleyDivider className="container-site" />

      <PressMarquee />

      {/* Spacer where Featured used to be — kept as a brand-quote band */}
      <section className="container-site py-14 md:py-20">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              The kitchen rule
            </p>
            <h2
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              No preservatives, ever.
            </h2>
          </div>
          <Link
            href="/about"
            className="hidden items-center gap-1 text-sm font-medium text-theme-ink transition-colors hover:text-theme-accent sm:inline-flex"
          >
            Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger gap={70} className="grid gap-5 md:grid-cols-3">
          {TRUST.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--theme-base)]"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-theme-ink">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-theme-ink/75">{item.body}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* NEW cinematic moment — horizontal editorial scroll band */}
      {HOME_FLAGS.editorialBand && <EditorialScrollBand />}

      {/* Full-bleed editorial band — heritage */}
      <EditorialBand
        eyebrow="The house rule"
        headline="If a sweet can be made faster, it can also be made less well."
        body="A simple promise we keep. Slow-cooked rabri, hand-cut diamonds, silver leaf laid by hand — every box leaves the kitchen checked by two pairs of eyes."
        cta={{ label: 'Read our story', href: '/about' }}
        image="https://ravisweets.com/wp-content/uploads/2025/09/cashew_mithai-removebg-preview.png"
        imageAlt="Cashew mithai stacked on a brass plate"
        align="center"
      />

      <HeritageStrip />

      {/* NEW cinematic moment — ingredient marquee behind product macro */}
      {/* IngredientMarquee temporarily unwired — see comment at the imports for why. */}

      <GiftingGuide />

      <CraftStrip />

      {/* Full-bleed editorial band — festival */}
      <EditorialBand
        eyebrow="Diwali 2026"
        headline="Wrapped by hand, in brass and silk."
        body="Six hampers, three price bands, logo-ready for corporate runs. Priority list opens first to our earlier customers and corporate accounts."
        cta={{ label: 'Join the priority list', href: '/festivals/diwali' }}
        image="https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png"
        imageAlt="Diwali hamper assortment — kaju, anjeer, dry-fruit chikki"
        align="left"
      />

      <FestivalTease />

      {/* Corporate CTA — now links to the builder */}
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
                  Build a custom hamper in two minutes, or start from one of our three templates.
                  MOQ-based pricing, logo-printed packaging, multi-address delivery, GST-compliant
                  invoices. One dedicated account manager for your Diwali run.
                </p>
              </div>
              <div className="flex flex-col gap-2 md:shrink-0">
                <Link
                  href="/corporate/builder?t=premium"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e9ad4a] px-6 py-3 text-sm font-semibold text-[#2a1505] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f2c66f]"
                >
                  Build a hamper
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/corporate#enquiry"
                  className="text-center text-xs font-semibold uppercase tracking-wider text-[#fdf6ec]/70 hover:text-[#f2c66f]"
                >
                  Or request a quote directly
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
