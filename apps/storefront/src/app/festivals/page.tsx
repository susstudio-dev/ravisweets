import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

export const metadata: Metadata = {
  title: 'Festival Sweet Boxes & Gift Hampers',
  description:
    'Curated boxes for Diwali, Raksha Bandhan, Eid, Holi, Pongal, Sankranti, Ugadi and Onam — made the morning they ship.',
  alternates: { canonical: '/festivals' },
};

interface FestivalRow {
  slug: string;
  title: string;
  telugu: string;
  date: string;
  monthLabel: string;
  blurb: string;
  palette: { base: string; accent: string; ink: string };
}

// Mirrors the FESTIVALS map in [slug]/page.tsx — kept short so the index can
// list each one with the right palette + tagline. When you add a new festival
// in the slug page, add it here too.
const FESTIVALS: FestivalRow[] = [
  {
    slug: 'pongal',
    title: 'Pongal',
    telugu: 'పొంగల్',
    date: '2027-01-15',
    monthLabel: 'Jan',
    blurb: 'The clay pot, the harvest, the first morning.',
    palette: { base: '#fbf3df', accent: '#9c5a14', ink: '#2a1a08' },
  },
  {
    slug: 'sankranti',
    title: 'Sankranti',
    telugu: 'సంక్రాంతి',
    date: '2027-01-14',
    monthLabel: 'Jan',
    blurb: 'Til, gud, and a new year on the kitchen door.',
    palette: { base: '#fbf2dd', accent: '#a04a14', ink: '#2a1604' },
  },
  {
    slug: 'holi',
    title: 'Holi',
    telugu: 'హోలీ',
    date: '2027-03-13',
    monthLabel: 'Mar',
    blurb: 'A spread as bright as the colours.',
    palette: { base: '#fff0e8', accent: '#c83a6a', ink: '#3a0a1c' },
  },
  {
    slug: 'ugadi',
    title: 'Ugadi',
    telugu: 'ఉగాది',
    date: '2027-03-19',
    monthLabel: 'Mar',
    blurb: 'Six tastes for the Telugu new year.',
    palette: { base: '#fbf2dd', accent: '#7a5612', ink: '#2a1c08' },
  },
  {
    slug: 'eid',
    title: 'Eid',
    telugu: 'ఈద్',
    date: '2026-03-30',
    monthLabel: 'Mar',
    blurb: 'A platter worth the long day — Hyderabadi classics, plated.',
    palette: { base: '#fff4e3', accent: '#a56a0f', ink: '#2a1a04' },
  },
  {
    slug: 'independence-day',
    title: 'Independence Day',
    telugu: 'స్వాతంత్ర్య దినోత్సవం',
    date: '2026-08-15',
    monthLabel: 'Aug',
    blurb: 'Tricolour boxes for the office, the school, the society gate.',
    palette: { base: '#f4f9e8', accent: '#3a7a1c', ink: '#122a08' },
  },
  {
    slug: 'raksha-bandhan',
    title: 'Raksha Bandhan',
    telugu: 'రక్షా బంధన్',
    date: '2026-08-28',
    monthLabel: 'Aug',
    blurb: 'A hamper tied with a thread — done properly.',
    palette: { base: '#fdf3df', accent: '#c0592b', ink: '#3a1e0c' },
  },
  {
    slug: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    telugu: 'వినాయక చవితి',
    date: '2027-09-15',
    monthLabel: 'Sep',
    blurb: 'Modaks the slow way — and everything for the prasad table.',
    palette: { base: '#fff5d4', accent: '#a85a08', ink: '#2a1404' },
  },
  {
    slug: 'onam',
    title: 'Onam',
    telugu: 'ഓണം',
    date: '2027-09-04',
    monthLabel: 'Sep',
    blurb: 'A sadya-sized box for the floor banana leaf.',
    palette: { base: '#f0fae0', accent: '#3a7a1c', ink: '#0a2a04' },
  },
  {
    slug: 'diwali',
    title: 'Diwali',
    telugu: 'దీపావళి',
    date: '2026-11-08',
    monthLabel: 'Nov',
    blurb: 'Wrapped in brass and silk.',
    palette: { base: '#fff5dc', accent: '#a85a08', ink: '#2a1505' },
  },
  {
    slug: 'christmas',
    title: 'Christmas',
    telugu: 'క్రిస్మస్',
    date: '2026-12-25',
    monthLabel: 'Dec',
    blurb: 'A South Indian table laid for a Christmas Eve.',
    palette: { base: '#fbf0e8', accent: '#a8222a', ink: '#2a0a0c' },
  },
];

/** Dispatch needs three clear days before the festival for the fresh range. */
const ORDER_BY_LEAD_DAYS = 3;

/*
 * Date maths pinned to the ISO day and formatted in UTC, so the static export
 * renders the same sheet regardless of the build machine's timezone.
 */
function orderByDay(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ORDER_BY_LEAD_DAYS);
  return d.toISOString().slice(0, 10);
}

function formatSheetDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`)
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

function compareDate(a: FestivalRow, b: FestivalRow): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

export default function FestivalsIndexPage() {
  const sorted = [...FESTIVALS].sort(compareDate);
  const now = Date.now();
  const upcoming = sorted.filter((f) => new Date(f.date).getTime() > now);
  const past = sorted.filter((f) => new Date(f.date).getTime() <= now);

  return (
    <>
      {/* Hero — no kicker, no paisley: the heading carries itself. */}
      <section className="container-site section-y">
        <Reveal>
          <h1 className="font-display text-display-lg md:text-display-xl text-theme-ink max-w-4xl">
            A year of festivals, one kitchen.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-theme-ink/75 mt-6 max-w-2xl text-lg leading-relaxed">
            From the Pongal clay pot in January to the Christmas Eve tin in December — every
            edition is curated, slow-cooked, and dispatched the morning it ships.
          </p>
        </Reveal>
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="container-site section-y-tight">
          <Reveal>
            <div className="docket-head">
              <h2 id="upcoming-heading" className="font-display text-display-md">
                Upcoming editions
              </h2>
              <p className="text-text-muted text-[13px]">
                Reserve early — priority list opens 6 weeks ahead
              </p>
            </div>
          </Reveal>

          <Stagger gap={70} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((f) => (
              <FestivalCard key={f.slug} f={f} />
            ))}
          </Stagger>
        </section>
      )}

      {/* Past — kept for archive */}
      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="container-site section-y-tight">
          <Reveal>
            <div className="docket-head">
              <div>
                <h2 id="past-heading" className="font-display text-display-md">
                  Recent editions
                </h2>
                <p className="text-text-muted mt-2 max-w-2xl text-sm">
                  These pages remain live so corporate accounts can reorder from past festival
                  hampers, or browse for next year.
                </p>
              </div>
            </div>
          </Reveal>

          <Stagger gap={70} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((f) => (
              <FestivalCard key={f.slug} f={f} />
            ))}
          </Stagger>
        </section>
      )}
    </>
  );
}

/**
 * A festival as a small dispatch sheet: name, script, the two dates that
 * matter, and the blurb. The ground never moves — the festival's ink shows
 * only in the stamped Telugu mark, the same docket filed in a different ink.
 * ORDER BY is the festival date minus three clear dispatch days.
 */
function FestivalCard({ f }: { f: FestivalRow }) {
  return (
    <Link
      href={`/festivals/${f.slug}`}
      className="docket group flex h-full flex-col p-5 transition-shadow duration-200 hover:shadow-lifted"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-theme-ink text-xl leading-tight">{f.title}</h3>
        <span className="font-indic text-base leading-none" style={{ color: f.palette.accent }}>
          {f.telugu}
        </span>
      </div>

      <dl className="mt-4">
        <div className="field-row">
          <dt className="field-label">Festival</dt>
          <dd className="field-value text-sm">{formatSheetDate(f.date)}</dd>
        </div>
        <div className="field-row">
          <dt className="field-label">Order by</dt>
          <dd className="field-value text-sm font-bold">{formatSheetDate(orderByDay(f.date))}</dd>
        </div>
      </dl>

      <p className="text-text-muted mt-3 text-[13px] leading-relaxed">{f.blurb}</p>

      <span className="text-theme-accent group-hover:text-theme-ink mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium transition-colors">
        See the box
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
