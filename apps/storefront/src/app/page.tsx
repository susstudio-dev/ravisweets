import Link from 'next/link';
import { ArrowRight, Award, Leaf, Truck } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { HeroDusk } from '@/components/hero/hero-dusk';
import { CounterShelf } from '@/components/sections/counter-shelf';
import { FestivalNextBand } from '@/components/sections/festival-next-band';
import { StoryNightBand } from '@/components/sections/story-night-band';
import { Paisley } from '@/components/brand/paisley';

/*
 * The walk-in homepage (spec §4). One story, seven beats:
 * hero (approach the shop) → counters (step inside) → bestsellers (what
 * people take home) → festival next → trust signage → the story back
 * outside → corporate CTA. The previous composition's thirteen competing
 * sections (flavour-atlas, signature-moment, press marquee, editorial
 * bands including the "Inside the kitchen" horizontal scroll, heritage/
 * craft strips, gifting guide, festival tease, six-tile category grid)
 * are removed from the page, not from the repo — the counters and the
 * dusk bands do their jobs inside the single narrative.
 */

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
  const bestsellers = SAMPLE_PRODUCTS.filter((p) => p.bestseller).slice(0, 8);

  return (
    <>
      <HeroDusk />

      {/* Inside: the display counters */}
      <CounterShelf />

      {/* What people take home */}
      <section aria-labelledby="bestsellers-top-heading" className="container-site pt-14 md:pt-20">
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <Paisley size="sm" />
              What people take home
            </p>
            <h2
              id="bestsellers-top-heading"
              className="font-display text-display-md text-theme-ink md:text-display-lg mt-2 leading-[1.05]"
            >
              Today&rsquo;s bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            Shop all 80+ products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger gap={50} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} quickAdd />
          ))}
        </Stagger>
      </section>

      {/* Festival next — the urgent thing */}
      <div className="pt-14 md:pt-20">
        <FestivalNextBand />
      </div>

      {/* Trust signage */}
      <section aria-labelledby="trust-heading" className="container-site py-14 md:py-20">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <Paisley size="sm" />
              The kitchen rule
            </p>
            <h2
              id="trust-heading"
              className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.05]"
            >
              No preservatives, ever.
            </h2>
          </div>
          <Link
            href="/about"
            className="text-theme-ink hover:text-theme-accent hidden items-center gap-1 text-sm font-medium transition-colors sm:inline-flex"
          >
            Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger gap={70} className="grid gap-5 md:grid-cols-3">
          {TRUST.map((item) => (
            <div
              key={item.title}
              className="bg-surface-elevated flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] p-6"
            >
              <div className="bg-theme-accent flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--theme-base)]">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-theme-ink text-lg">{item.title}</h3>
              <p className="text-theme-ink/75 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Back outside — the story under the stars */}
      <StoryNightBand />

      {/* Corporate CTA */}
      <section className="container-site py-20">
        <Reveal direction="up" distance={20}>
          <div
            data-register="dusk"
            className="bg-theme-base text-theme-ink overflow-hidden rounded-3xl p-8 md:p-12"
          >
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
                  <Paisley size="sm" />
                  For HR &amp; Admin teams
                </p>
                <h2 className="font-display text-display-md md:text-display-lg mt-3">
                  Corporate gifting, done the Hyderabadi way.
                </h2>
                <p className="mt-3 text-sm opacity-85 md:text-base">
                  Build a custom hamper in two minutes, or start from one of our three templates.
                  MOQ-based pricing, logo-printed packaging, multi-address delivery, GST-compliant
                  invoices. One dedicated account manager for your Diwali run.
                </p>
              </div>
              <div className="flex flex-col gap-2 md:shrink-0">
                <Link
                  href="/corporate/builder?t=premium"
                  className="bg-theme-accent inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                >
                  Build a hamper
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/corporate#enquiry"
                  className="hover:text-theme-accent text-center text-xs font-semibold uppercase tracking-wider opacity-70 transition-all hover:opacity-100"
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
