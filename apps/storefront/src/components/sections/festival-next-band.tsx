'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { FestivalCountdown } from '@/components/festivals/festival-countdown';

/**
 * Festival next — a dusk-register band that always sells the urgent thing:
 * whichever festival is coming up soonest, with a live countdown under a
 * marigold garland. Dates mirror the calendar on /festivals; when that page
 * is rebuilt in phase 4b both will read one shared module.
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

/** Garland across the band's top edge — the scene's marigold atoms. */
const GARLAND = [2, 10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90, 97];

export function FestivalNextBand() {
  const next = useMemo(() => {
    const today = Date.now();
    return (
      FESTIVALS.find((f) => new Date(`${f.date}T23:59:59+05:30`).getTime() > today) ??
      FESTIVALS[FESTIVALS.length - 1]
    );
  }, []);

  if (!next) return null;

  return (
    <section
      aria-labelledby="festival-next-heading"
      data-register="dusk"
      className="bg-theme-base text-theme-ink relative overflow-hidden"
    >
      {/* marigold garland strung along the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-8">
        {GARLAND.map((left, i) => (
          <span
            key={left}
            className="ss-mg"
            style={{
              left: `${left}%`,
              top: `${i % 2 === 0 ? 10 : 42}%`,
              width: 'clamp(10px, 1.2vw, 16px)',
            }}
          />
        ))}
      </div>

      <div className="container-site relative flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
        <div>
          <Reveal>
            <p className="text-theme-accent flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.28em]">
              <span className="font-indic text-xl normal-case leading-none tracking-normal">
                {next.telugu}
              </span>
              Next at the counter
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              id="festival-next-heading"
              className="font-display text-display-md md:text-display-lg mt-3 leading-[1.02]"
            >
              {next.title} is coming.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <FestivalCountdown target={`${next.date}T00:00:00+05:30`} accentColor="var(--theme-accent)" />
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <Link
            href={`/festivals/${next.slug}`}
            className="bg-theme-accent ss-cta-glow inline-flex items-center gap-2 rounded-sm px-7 py-3.5 text-sm font-medium tracking-wide text-[color:var(--theme-base)] transition-[opacity,box-shadow] duration-300 hover:opacity-95"
          >
            Pre-order the {next.title} box
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
