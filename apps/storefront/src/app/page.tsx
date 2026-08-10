import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { ProductGrid } from '@/components/product-grid';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { HeroBatch } from '@/components/hero/hero-batch';
import type { Metadata } from 'next';
import { FestivalNextBand } from '@/components/sections/festival-next-band';

/*
 * Title and description are inherited from the root layout — this IS the page
 * that layout's `title.default` was written for. Only the canonical is stated
 * here: putting `alternates` in the layout instead would make every page that
 * did not override it canonicalise to the homepage, which is worse than the
 * missing-canonical finding it would be trying to fix.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/*
 * The homepage, in the Batch Card world. One story, five beats:
 * the card (what was made today) → the counter (what people take home) →
 * the kitchen rule (why it keeps for four days and not four months) →
 * festival next → corporate dispatch.
 *
 * The retired composition's decorative bands (counter-shelf, story-night,
 * the paisley eyebrows, the three icon-circle trust cards) are removed from
 * the page, not from the repo. The trust claims they carried are now stated
 * as what they actually are: a specification.
 */

/**
 * The kitchen rule, as a spec table rather than three cards with icon circles.
 * Every one of these is a claim PRODUCT.md can substantiate.
 */
const SPEC: { label: string; value: string; note: string }[] = [
  {
    label: 'Preservatives',
    value: 'NIL',
    note: 'Nothing added to extend shelf life. The short window is the proof, not a limitation.',
  },
  {
    label: 'Shelf life',
    value: '4–7 DAYS',
    note: 'Fresh khoya and mawa sweets. The shipping range is the shelf-stable line — barfis, laddoos, mysore pak.',
  },
  {
    label: 'Kitchen',
    value: 'KHAMMAM',
    note: 'One kitchen, the same family, since 1983. Three counters you can walk into.',
  },
  {
    label: 'Dispatch',
    value: 'SAME DAY',
    note: 'Made in the morning, dispatched the same day, temperature-controlled across India.',
  },
];

export default function HomePage() {
  const bestsellers = SAMPLE_PRODUCTS.filter((p) => p.bestseller).slice(0, 8);

  return (
    <>
      <HeroBatch />

      {/* ── THE COUNTER ─────────────────────────────────────────────── */}
      <section aria-labelledby="bestsellers-heading" className="container-site section-y">
        <Reveal>
          {/*
            No eyebrow above the heading. `.field-label` earns its place when
            it is the printed caption of a real label:value pair — BATCH NO. /
            KH-0208-026. Used as a kicker over a heading it is the category's
            decorative eyebrow wearing this world's costume, and the heading
            carries itself without one.
          */}
          <div className="docket-head">
            <div>
              <h2 id="bestsellers-heading" className="font-display text-display-md">
                Today&rsquo;s bestsellers
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Shop the catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Stagger gap={40}>
          <ProductGrid>
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} quickAdd />
            ))}
          </ProductGrid>
        </Stagger>
      </section>

      {/* ── THE KITCHEN RULE ────────────────────────────────────────── */}
      <section aria-labelledby="spec-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <div>
              <h2 id="spec-heading" className="font-display text-display-md">
                No preservatives, ever.
              </h2>
            </div>
            <Link
              href="/about"
              className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Stagger gap={60}>
          <dl className="grid gap-x-10 md:grid-cols-2">
            {SPEC.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-[color:var(--color-border)] py-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="field-label">{row.label}</dt>
                  <dd className="field-value text-theme-ink text-sm font-bold">{row.value}</dd>
                </div>
                <p className="text-text-muted max-w-[52ch] text-[13px] leading-relaxed">
                  {row.note}
                </p>
              </div>
            ))}
          </dl>
        </Stagger>
      </section>

      {/* ── FESTIVAL NEXT ───────────────────────────────────────────── */}
      <FestivalNextBand />

      {/* ── CORPORATE DISPATCH ──────────────────────────────────────── */}
      <section className="container-site section-y">
        <Reveal direction="up" distance={16}>
          <div data-register="carbon" className="bg-theme-base text-theme-ink p-7 md:p-10">
            <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md">
                  Corporate gifting, dispatched to every address on your list.
                </h2>
                <p className="text-text-muted mt-4 text-sm leading-relaxed md:text-base">
                  Build a hamper in two minutes or start from a template. MOQ pricing,
                  logo-printed packaging, multi-address dispatch, GST-compliant invoices, and one
                  account manager for your Diwali run.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:shrink-0">
                <Link href="/corporate/builder?t=premium" className="stamp">
                  Build a hamper
                </Link>
                <Link
                  href="/corporate#enquiry"
                  className="field-label hover:text-theme-accent transition-colors"
                >
                  Or request a quote →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
