'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

/**
 * Festival next — a carbon-register band that always sells the urgent thing:
 * whichever festival is coming up soonest. Dates mirror the calendar on
 * /festivals; when that page is rebuilt in phase 4b both will read one shared
 * module.
 *
 * The live countdown was removed with the retired world. A ticking
 * seconds digit re-rendered this section once per second forever, and it is
 * flash-sale theatre: a kitchen records an order-by date, it does not run a
 * clock. The urgency now comes from the deadline itself.
 */

const FESTIVALS = [
  { slug: 'raksha-bandhan', title: 'Raksha Bandhan', telugu: 'రక్షా బంధన్', date: '2026-08-28' },
  { slug: 'diwali', title: 'Diwali', telugu: 'దీపావళి', date: '2026-11-08' },
  { slug: 'christmas', title: 'Christmas', telugu: 'క్రిస్మస్', date: '2026-12-25' },
  { slug: 'sankranti', title: 'Sankranti', telugu: 'సంక్రాంతి', date: '2027-01-14' },
  { slug: 'pongal', title: 'Pongal', telugu: 'పొంగల్', date: '2027-01-15' },
  { slug: 'holi', title: 'Holi', telugu: 'హోలీ', date: '2027-03-13' },
  { slug: 'ugadi', title: 'Ugadi', telugu: 'ఉగాది', date: '2027-03-19' },
] as const;

/** Dispatch needs three clear days before the festival for the fresh range. */
const ORDER_BY_LEAD_DAYS = 3;

function formatBandDate(iso: string): string {
  return new Date(`${iso}T00:00:00+05:30`)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export function FestivalNextBand() {
  const next = useMemo(() => {
    const today = Date.now();
    return (
      FESTIVALS.find((f) => new Date(`${f.date}T23:59:59+05:30`).getTime() > today) ??
      FESTIVALS[FESTIVALS.length - 1]
    );
  }, []);

  const orderBy = useMemo(() => {
    if (!next) return '';
    const d = new Date(`${next.date}T00:00:00+05:30`);
    d.setDate(d.getDate() - ORDER_BY_LEAD_DAYS);
    return d.toISOString().slice(0, 10);
  }, [next]);

  if (!next) return null;

  return (
    <section
      aria-labelledby="festival-next-heading"
      data-register="carbon"
      className="bg-theme-base text-theme-ink relative overflow-hidden"
    >
      {/*
        The marigold garland is gone. It was 13 spans of `ss-mg`, a class that
        belonged to the retired shop-at-dusk scene and no longer exists in any
        stylesheet — so it rendered as empty DOM. `ss-cta-glow` on the CTA was
        dead in the same way. Both are removed rather than restyled: a garland
        is festival decoration, and this world states the festival as a record.
      */}
      <div className="container-site relative flex flex-col gap-8 section-y md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal>
            <p className="flex items-baseline gap-3">
              <span className="font-indic text-theme-accent text-xl leading-none">
                {next.telugu}
              </span>
              <span className="field-label">Next at the counter</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 id="festival-next-heading" className="font-display text-display-md mt-3">
              {next.title} is coming.
            </h2>
          </Reveal>
          {/* The date as a field row — a kitchen records a deadline, it does
              not run a flash-sale clock. */}
          <Reveal delay={0.2}>
            <dl className="mt-5 max-w-sm">
              <div className="field-row">
                <dt className="field-label">Festival</dt>
                <dd className="field-value text-sm">{formatBandDate(next.date)}</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Order by</dt>
                <dd className="field-value text-sm font-bold">{formatBandDate(orderBy)}</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <Link href={`/festivals/${next.slug}`} className="stamp">
            Pre-order the {next.title} box
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
