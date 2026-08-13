'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { formatDocketDate, nextFestival } from '@/lib/festivals/calendar';
import { useOrderBy } from '@/lib/festivals/use-order-by';

/**
 * Festival next — a carbon-register band that always sells the urgent thing:
 * whichever festival is coming up soonest, taken from the shared calendar.
 *
 * This component used to hold its own eight-festival list and its own date
 * maths, and the maths was wrong: it built an IST-midnight Date and then read
 * `.toISOString()`, which shifts the instant back into the previous UTC day.
 * The band rendered 11 AUG against the festival page's 12 AUG in IST, and
 * 10 AUG in a UTC browser. The order-by date is now resolved by the same
 * function every other surface calls.
 *
 * The live countdown was removed with the retired world. A ticking seconds
 * digit re-rendered this section once per second forever, and it is flash-sale
 * theatre: a kitchen records an order-by date, it does not run a clock.
 */
export function FestivalNextBand() {
  /*
   * Seeded at render and re-read after mount: the static export bakes the
   * build-time choice into the HTML, and the browser corrects it. Same reason
   * hero-batch resolves its date client-side.
   */
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const next = nextFestival(nowMs);
  const orderBy = useOrderBy(next.slug, next.date);

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
                <dd className="field-value text-sm">{formatDocketDate(next.date)}</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Order by</dt>
                <dd className="field-value text-sm font-bold">
                  {orderBy.label}
                  {orderBy.closed && (
                    <span className="text-text-muted font-normal"> · CLOSED</span>
                  )}
                </dd>
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
