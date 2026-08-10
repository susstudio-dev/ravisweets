import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Grain } from '@/components/brand/grain';

/**
 * The story, back outside — the homepage's closing dusk beat. Night has
 * fully fallen since the hero: same sky language, more stars, and the
 * forty-year story told in three short beats. Spec §4.6.
 */

const STARS = [
  { left: '4%', top: '18%' },
  { left: '11%', top: '58%' },
  { left: '19%', top: '30%' },
  { left: '28%', top: '72%' },
  { left: '37%', top: '22%' },
  { left: '46%', top: '52%' },
  { left: '55%', top: '14%' },
  { left: '64%', top: '66%' },
  { left: '73%', top: '34%' },
  { left: '82%', top: '58%' },
  { left: '90%', top: '20%' },
  { left: '96%', top: '44%' },
];

const BEATS = [
  {
    year: '1983',
    title: 'One counter in Khammam',
    body: 'Srinivasa Rao opens a small shop and refuses, from the first batch, to hurry anything.',
  },
  {
    year: 'Today',
    title: 'The same kitchen, grown up',
    body: 'FSSAI-certified, still slow-cooking every batch by hand — rabri, ghee, silver leaf and all.',
  },
  {
    year: 'Tomorrow',
    title: 'Across India, overnight',
    body: 'Chilled-safe packaging carries the counter to any doorstep in the country.',
  },
];

export function StoryNightBand() {
  return (
    <section
      aria-labelledby="story-heading"
      data-register="dusk"
      className="text-theme-ink relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in oklab, var(--theme-base) 72%, black), var(--theme-base) 85%)',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={i % 3 === 0 ? 'ss-star ss-star--far' : 'ss-star'}
            style={{ left: s.left, top: s.top }}
          />
        ))}
      </div>

      <div className="container-site relative py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-theme-accent text-xs font-semibold uppercase tracking-[0.28em]">
            Back outside, the lights stay on
          </p>
          <h2
            id="story-heading"
            className="font-display text-display-md mt-3 leading-[1.05]"
          >
            Forty years of slow sweetness.
          </h2>
        </Reveal>

        <Stagger gap={120} className="mt-12 grid gap-10 md:grid-cols-3">
          {BEATS.map((b) => (
            <div key={b.year} className="flex flex-col gap-3">
              <p className="text-varak font-display flex items-center gap-3 text-lg">
                <span aria-hidden="true" className="bg-varak-rule h-1.5 w-1.5 rotate-45" />
                {b.year}
              </p>
              <h3 className="font-display text-xl">{b.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{b.body}</p>
            </div>
          ))}
        </Stagger>

        <Reveal delay={0.2} className="mt-12">
          <Link
            href="/about"
            className="text-theme-ink hover:text-theme-accent decoration-varak-rule inline-flex items-center gap-2 text-sm underline underline-offset-[6px] transition-colors duration-300"
          >
            Read the whole story
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <Grain />
    </section>
  );
}
