import Link from 'next/link';
import { signatureBestsellers } from '@/lib/signature';
import { Reveal } from '@/components/motion/reveal';
import { HeroBatch } from '@/components/hero/hero-batch';
import type { Metadata } from 'next';
import { TrendingShelf } from '@/components/sections/trending-shelf';
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
 * The homepage, in the Sweet Counter world (warm pivot 2026-08-10; product-
 * first half-hero, owner-directed 2026-08-13). Six beats, product before word:
 * today's No.1 plate in the hero (order it without scrolling) → the ranked
 * trending shelf (the counter's front row, sweets cut out and plated) → every
 * aisle, one tap → the house rules (four badges, three seconds) → festival next
 * → what customers say (real reviews only, absent until they exist) → corporate.
 *
 * DECLUTTER PASS (owner: "make sure it doesn't look cluttered", 2026-08-13).
 * The old boxed "Today's bestsellers" grid was folded INTO the trending shelf —
 * one strong product section beside the hero instead of a grid AND a rail that
 * drew from the same ranking. Fewer sections, one product surface, more air.
 */

/**
 * How deep the ranked front row goes. The hero plate is No.1; the shelf shows
 * the next twelve (No.2–No.13), so this fetches thirteen distinct-photo
 * bestsellers and the hero and shelf split them without overlap.
 */
const RANKED_DEPTH = 13;

export default function HomePage() {
  /*
   * Signature-ranked, not catalogue-ordered: raw order led with whatever row
   * the DB inserted first (Qubani), which the owner flagged as the wrong face
   * for the shop (2026-08-11). See lib/signature.ts.
   *
   * De-duplicated by photograph: several SKUs borrow a family stand-in's photo
   * (spec: BORROWED), so an un-deduped top-12 can show the same cut-out sweet
   * twice under two names — which reads as clutter. Keep the first, ranked
   * higher, and skip any later SKU that would repeat its image.
   */
  const seenImages = new Set<string>();
  const ranked = signatureBestsellers()
    .filter((p) => {
      const url = p.images[0]?.url;
      if (!url || seenImages.has(url)) return false;
      seenImages.add(url);
      return true;
    })
    .slice(0, RANKED_DEPTH);

  // The hero renders No.1 itself (signatureBestsellers()[0]); the shelf carries
  // the rest, its stamps starting at No.2 so the two never show the same sweet.
  const shelf = ranked.slice(1);

  return (
    <>
      <HeroBatch />

      {/* ── THE COUNTER'S FRONT ROW ─────────────────────────────────── */}
      <TrendingShelf products={shelf} startRank={2} />

      {/* ── THE RAIL ────────────────────────────────────────────────── */}
      <CategoryRail />

      {/* ── THE HOUSE RULES ─────────────────────────────────────────── */}
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
