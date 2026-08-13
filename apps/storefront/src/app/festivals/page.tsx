import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { formatDocketDate, getFestival, type FestivalSlug } from '@/lib/festivals/calendar';
import { OrderByField } from '@/components/festivals/order-by-field';

export const metadata: Metadata = {
  title: 'Festival Sweet Boxes & Gift Hampers',
  description:
    'Curated boxes for Diwali, Raksha Bandhan, Eid, Holi, Pongal, Sankranti, Ugadi and Onam — made the morning they ship.',
  alternates: { canonical: '/festivals' },
};

interface FestivalRow {
  slug: FestivalSlug;
  title: string;
  telugu: string;
  monthLabel: string;
  blurb: string;
  palette: { base: string; accent: string; ink: string };
}

// Presentation only — dates and identity come from lib/festivals/calendar.
// This array carries what the index card shows on top of them: the month
// label, the one-line blurb, and the palette the Telugu mark is stamped in.
const FESTIVALS: FestivalRow[] = [
  {
    slug: 'pongal',
    title: 'Pongal',
    telugu: 'పొంగల్',
    monthLabel: 'Jan',
    blurb: 'The clay pot, the harvest, the first morning.',
    palette: { base: '#fbf3df', accent: '#9c5a14', ink: '#2a1a08' },
  },
  {
    slug: 'sankranti',
    title: 'Sankranti',
    telugu: 'సంక్రాంతి',
    monthLabel: 'Jan',
    blurb: 'Til, gud, and a new year on the kitchen door.',
    palette: { base: '#fbf2dd', accent: '#a04a14', ink: '#2a1604' },
  },
  {
    slug: 'holi',
    title: 'Holi',
    telugu: 'హోలీ',
    monthLabel: 'Mar',
    blurb: 'A spread as bright as the colours.',
    palette: { base: '#fff0e8', accent: '#c83a6a', ink: '#3a0a1c' },
  },
  {
    slug: 'ugadi',
    title: 'Ugadi',
    telugu: 'ఉగాది',
    monthLabel: 'Mar',
    blurb: 'Six tastes for the Telugu new year.',
    palette: { base: '#fbf2dd', accent: '#7a5612', ink: '#2a1c08' },
  },
  {
    slug: 'eid',
    title: 'Eid',
    telugu: 'ఈద్',
    monthLabel: 'Mar',
    blurb: 'A platter worth the long day — festive classics, plated.',
    palette: { base: '#fff4e3', accent: '#a56a0f', ink: '#2a1a04' },
  },
  {
    slug: 'independence-day',
    title: 'Independence Day',
    telugu: 'స్వాతంత్ర్య దినోత్సవం',
    monthLabel: 'Aug',
    blurb: 'Tricolour boxes for the office, the school, the society gate.',
    palette: { base: '#f4f9e8', accent: '#3a7a1c', ink: '#122a08' },
  },
  {
    slug: 'raksha-bandhan',
    title: 'Raksha Bandhan',
    telugu: 'రక్షా బంధన్',
    monthLabel: 'Aug',
    blurb: 'A hamper tied with a thread — done properly.',
    palette: { base: '#fdf3df', accent: '#c0592b', ink: '#3a1e0c' },
  },
  {
    slug: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    telugu: 'వినాయక చవితి',
    monthLabel: 'Sep',
    blurb: 'Modaks the slow way — and everything for the prasad table.',
    palette: { base: '#fff5d4', accent: '#a85a08', ink: '#2a1404' },
  },
  {
    slug: 'onam',
    title: 'Onam',
    telugu: 'ഓണം',
    monthLabel: 'Sep',
    blurb: 'A sadya-sized box for the floor banana leaf.',
    palette: { base: '#f0fae0', accent: '#3a7a1c', ink: '#0a2a04' },
  },
  {
    slug: 'diwali',
    title: 'Diwali',
    telugu: 'దీపావళి',
    monthLabel: 'Nov',
    blurb: 'Wrapped in brass and silk.',
    palette: { base: '#fff5dc', accent: '#a85a08', ink: '#2a1505' },
  },
  {
    slug: 'christmas',
    title: 'Christmas',
    telugu: 'క్రిస్మస్',
    monthLabel: 'Dec',
    blurb: 'A South Indian table laid for a Christmas Eve.',
    palette: { base: '#fbf0e8', accent: '#a8222a', ink: '#2a0a0c' },
  },
];

/**
 * Throws rather than returning a blank: this runs during the static export, so
 * a slug that has fallen off the calendar fails the BUILD instead of shipping
 * a card with an empty date where a deadline should be.
 */
function festivalDate(f: FestivalRow): string {
  const entry = getFestival(f.slug);
  if (!entry) throw new Error(`festival card references an unknown slug: ${f.slug}`);
  return entry.date;
}

export default function FestivalsIndexPage() {
  const sorted = [...FESTIVALS].sort((a, b) => festivalDate(a).localeCompare(festivalDate(b)));
  /*
   * Build-time split. The page is statically exported, so this line is
   * evaluated once at build; a festival that passes afterwards stays under
   * "Upcoming" until the next deploy. That is the pre-existing behaviour and
   * the ORDER BY row, which is client-resolved, is the one that self-corrects.
   */
  const now = Date.now();
  const upcoming = sorted.filter((f) => Date.parse(`${festivalDate(f)}T00:00:00+05:30`) > now);
  const past = sorted.filter((f) => Date.parse(`${festivalDate(f)}T00:00:00+05:30`) <= now);

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
 * ORDER BY is owner-set, and marks itself CLOSED once it has passed.
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
          <dd className="field-value text-sm">{formatDocketDate(festivalDate(f))}</dd>
        </div>
        <div className="field-row">
          <dt className="field-label">Order by</dt>
          <dd className="field-value text-sm font-bold">
            <OrderByField slug={f.slug} festivalDate={festivalDate(f)} />
          </dd>
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
