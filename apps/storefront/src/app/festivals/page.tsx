import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

export const metadata: Metadata = {
  title: 'Festival editions',
  description:
    'Curated boxes for every Indian festival — Diwali, Raksha Bandhan, Eid, Holi, Pongal, Sankranti, Ugadi, Onam, Ganesh Chaturthi, Christmas — slow-cooked in our Khammam kitchen.',
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
  { slug: 'pongal',          title: 'Pongal',          telugu: 'పొంగల్',     date: '2027-01-15', monthLabel: 'Jan',  blurb: 'The clay pot, the harvest, the first morning.',                  palette: { base: '#fbf3df', accent: '#9c5a14', ink: '#2a1a08' } },
  { slug: 'sankranti',       title: 'Sankranti',       telugu: 'సంక్రాంతి', date: '2027-01-14', monthLabel: 'Jan',  blurb: 'Til, gud, and a new year on the kitchen door.',                  palette: { base: '#fbf2dd', accent: '#a04a14', ink: '#2a1604' } },
  { slug: 'holi',            title: 'Holi',            telugu: 'హోలీ',      date: '2027-03-13', monthLabel: 'Mar',  blurb: 'A spread as bright as the colours.',                              palette: { base: '#fff0e8', accent: '#c83a6a', ink: '#3a0a1c' } },
  { slug: 'ugadi',           title: 'Ugadi',           telugu: 'ఉగాది',     date: '2027-03-19', monthLabel: 'Mar',  blurb: 'Six tastes for the Telugu new year.',                             palette: { base: '#fbf2dd', accent: '#7a5612', ink: '#2a1c08' } },
  { slug: 'eid',             title: 'Eid',             telugu: 'ఈద్',        date: '2026-03-30', monthLabel: 'Mar',  blurb: "A platter worth the long day — Hyderabadi classics, plated.",  palette: { base: '#fff4e3', accent: '#a56a0f', ink: '#2a1a04' } },
  { slug: 'raksha-bandhan',  title: 'Raksha Bandhan',  telugu: 'రక్షా బంధన్', date: '2026-08-28', monthLabel: 'Aug',  blurb: 'A hamper tied with a thread — done properly.',                   palette: { base: '#fdf3df', accent: '#c0592b', ink: '#3a1e0c' } },
  { slug: 'ganesh-chaturthi',title: 'Ganesh Chaturthi',telugu: 'వినాయక చవితి', date: '2027-09-15', monthLabel: 'Sep',  blurb: 'Modaks the slow way — and everything for the prasad table.',     palette: { base: '#fff5d4', accent: '#a85a08', ink: '#2a1404' } },
  { slug: 'onam',            title: 'Onam',            telugu: 'ഓണം',       date: '2027-09-04', monthLabel: 'Sep',  blurb: 'A sadya-sized box for the floor banana leaf.',                   palette: { base: '#f0fae0', accent: '#3a7a1c', ink: '#0a2a04' } },
  { slug: 'diwali',          title: 'Diwali',          telugu: 'దీపావళి',   date: '2026-11-08', monthLabel: 'Nov',  blurb: 'Wrapped in brass and silk.',                                      palette: { base: '#2a1505', accent: '#e9ad4a', ink: '#fdf6ec' } },
  { slug: 'christmas',       title: 'Christmas',       telugu: 'క్రిస్మస్',  date: '2026-12-25', monthLabel: 'Dec',  blurb: 'A South Indian table laid for a Christmas Eve.',                  palette: { base: '#fbf0e8', accent: '#a8222a', ink: '#2a0a0c' } },
];

function dayString(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
      {/* Hero */}
      <section className="container-site py-16 md:py-24">
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Festival editions
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 max-w-4xl font-display text-display-lg font-semibold leading-[1.02] text-theme-ink md:text-display-xl">
            A year of festivals,{' '}
            <span className="italic text-theme-accent">one kitchen.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-theme-ink/75">
            Ten festivals, ten boxes. From the Pongal clay pot in January to the Christmas Eve
            tin in December — every edition is curated, slow-cooked, and shipped from our
            Khammam kitchen.
          </p>
        </Reveal>
      </section>

      <PaisleyDivider className="container-site" />

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="container-site py-14">
          <Reveal className="mb-8 flex items-end justify-between gap-4">
            <h2 id="upcoming-heading" className="font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg">
              Upcoming editions
            </h2>
            <p className="hidden text-xs font-semibold uppercase tracking-wider text-theme-ink/55 md:block">
              Reserve early — priority list opens 6 weeks ahead
            </p>
          </Reveal>

          <Stagger gap={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((f) => (
              <FestivalCard key={f.slug} f={f} />
            ))}
          </Stagger>
        </section>
      )}

      {/* Past — kept for archive */}
      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="container-site py-14">
          <Reveal className="mb-8">
            <h2 id="past-heading" className="font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg">
              Recent editions
            </h2>
            <p className="mt-2 text-sm text-theme-ink/65">
              These pages remain live so corporate accounts can reorder from past festival
              hampers, or browse for next year.
            </p>
          </Reveal>

          <Stagger gap={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((f) => (
              <FestivalCard key={f.slug} f={f} />
            ))}
          </Stagger>
        </section>
      )}
    </>
  );
}

function FestivalCard({ f }: { f: FestivalRow }) {
  return (
    <Link
      href={`/festivals/${f.slug}`}
      className="group relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-2xl p-6 ring-1 ring-[color:var(--color-border)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
      style={{ backgroundColor: f.palette.base, color: f.palette.ink }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, ${f.palette.accent}33 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <p
          className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: f.palette.accent }}
        >
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {f.monthLabel} · {dayString(f.date)}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
          {f.title}
        </h3>
        <p
          className="mt-1 text-base"
          style={{ fontFamily: 'var(--font-indic)', color: f.palette.accent }}
        >
          {f.telugu}
        </p>
      </div>
      <div className="relative">
        <p className="text-sm leading-relaxed" style={{ color: f.palette.ink, opacity: 0.85 }}>
          {f.blurb}
        </p>
        <div
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: f.palette.accent }}
        >
          See the box
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
