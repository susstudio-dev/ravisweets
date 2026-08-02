import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

/**
 * The counters — the first section after the hero. Having walked to the door,
 * you're inside: the three category groups are presented as the shop's own
 * warm-lit glass display counters. Dusk register, lamplight glow on hover,
 * sweets drawn with the scene's own silhouette atoms (`.ss-sweet`).
 *
 * The three counters are curated super-groups over the catalogue's category
 * slugs (spec §4.2); the same grouping drives the /shop counters view later.
 */

const COUNTERS = [
  {
    href: '/category/sweets',
    telugu: 'తీపి',
    title: 'Sweets',
    blurb: 'Kaju katli, laddus, the Hyderabadi specials — the counter everyone points at first.',
    sweets: ['diamond', 'round', 'square', 'round'] as const,
  },
  {
    href: '/category/savouries',
    telugu: 'కారం',
    title: 'Savouries',
    blurb: 'Chai-time crunch: karapusa, mixtures, murukulu, podis and pickles.',
    sweets: ['square', 'round', 'square', 'diamond'] as const,
  },
  {
    href: '/category/gift-hampers',
    telugu: 'కానుక',
    title: 'Gifting',
    blurb: 'Hampers and boxes for festivals, weddings and the office Diwali run.',
    sweets: ['round', 'diamond', 'round', 'square'] as const,
  },
];

function SweetRow({ shapes }: { shapes: readonly ('diamond' | 'round' | 'square')[] }) {
  return (
    <div aria-hidden="true" className="relative h-6">
      {shapes.map((shape, i) => (
        <span
          key={i}
          className={
            shape === 'diamond'
              ? 'ss-sweet ss-sweet--diamond'
              : shape === 'round'
                ? 'ss-sweet ss-sweet--round'
                : 'ss-sweet'
          }
          style={{ left: `${10 + i * 22}%`, top: '22%', width: '5%' }}
        />
      ))}
      {/* the counter's brass rail */}
      <span className="bg-varak-rule absolute inset-x-0 bottom-0 h-px opacity-70" />
    </div>
  );
}

export function CounterShelf() {
  return (
    <section
      aria-labelledby="counters-heading"
      data-register="dusk"
      className="bg-theme-base text-theme-ink relative overflow-hidden"
    >
      <div className="container-site py-14 md:py-20">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-theme-accent text-xs font-semibold uppercase tracking-[0.28em]">
            Step inside
          </p>
          <h2
            id="counters-heading"
            className="font-display text-display-md mt-3 leading-[1.05]"
          >
            The counters, just like the shop.
          </h2>
        </Reveal>

        <Stagger gap={110} className="grid gap-5 md:grid-cols-3">
          {COUNTERS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group bg-surface-elevated relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[color:var(--color-border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_26px_-6px_color-mix(in_oklab,var(--theme-accent)_32%,transparent)]"
            >
              {/* lamplight tube along the top of the case */}
              <span
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, color-mix(in oklab, var(--theme-accent) 80%, white), transparent)',
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in oklab, var(--theme-accent) 28%, transparent), transparent 75%)',
                }}
              />

              <p className="font-indic text-theme-accent text-lg leading-none">{c.telugu}</p>
              <h3 className="font-display text-xl">{c.title}</h3>
              <SweetRow shapes={c.sweets} />
              <p className="text-text-muted text-sm leading-relaxed">{c.blurb}</p>
              <span className="text-theme-accent mt-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1">
                View the counter
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
