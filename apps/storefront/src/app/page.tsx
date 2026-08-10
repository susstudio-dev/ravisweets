import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { ProductGrid } from '@/components/product-grid';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { HeroBatch } from '@/components/hero/hero-batch';
import type { Metadata } from 'next';
import { CategoryRail } from '@/components/sections/category-rail';
import { FestivalNextBand } from '@/components/sections/festival-next-band';
import { ReviewsBand } from '@/components/sections/reviews-band';
import { TrustStrip } from '@/components/sections/trust-strip';

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
 * The homepage, in the Sweet Counter world (warm pivot, owner-directed
 * 2026-08-10). One story, seven beats, product-first:
 * the card (what was made today) → the rail (every aisle, one tap) →
 * the counter (what people take home) → the kitchen rule (four badges,
 * three seconds) → festival next → what customers say (real reviews only,
 * absent until they exist) → corporate dispatch.
 *
 * The verbose spec <dl> that carried the kitchen rule moved into
 * sections/trust-strip.tsx, compressed to the same claims at a glance —
 * "lots to see, little to read" is the pivot's page rule.
 */

export default function HomePage() {
  const bestsellers = SAMPLE_PRODUCTS.filter((p) => p.bestseller).slice(0, 8);

  return (
    <>
      <HeroBatch />

      {/* ── THE RAIL ────────────────────────────────────────────────── */}
      <CategoryRail />

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
      <TrustStrip />

      {/* ── FESTIVAL NEXT ───────────────────────────────────────────── */}
      <FestivalNextBand />

      {/* ── WHAT CUSTOMERS SAY (absent until real reviews exist) ────── */}
      <ReviewsBand />

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
