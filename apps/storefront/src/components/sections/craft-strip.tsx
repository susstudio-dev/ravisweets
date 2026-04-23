import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { Parallax } from '@/components/motion/parallax';
import { Paisley } from '@/components/brand/paisley';

const CRAFTS = [
  {
    key: 'roast',
    title: 'Roast',
    step: '01',
    caption:
      'Almonds and pistachios roasted in small trays over low heat — the difference between "good" and "oil-slick" is five seconds of patience.',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&q=85&auto=format&fit=crop',
  },
  {
    key: 'slow-cook',
    title: 'Slow-cook',
    step: '02',
    caption:
      'Qubani reduced over four hours in a copper pan, with nothing added but sugar and the apricot’s own amber.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&q=85&auto=format&fit=crop',
  },
  {
    key: 'finish',
    title: 'Finish',
    step: '03',
    caption:
      'Hand-cut diamonds, silver leaf laid by hand, ribbon tied last. Every box leaves the kitchen checked by two pairs of eyes.',
    image: 'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=900&q=85&auto=format&fit=crop',
  },
];

export function CraftStrip() {
  return (
    <section aria-labelledby="craft-heading" className="container-site py-20 md:py-24">
      <Reveal className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            The making
          </p>
          <h2
            id="craft-heading"
            className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
          >
            Three small acts, repeated every day.
          </h2>
        </div>
        <p className="max-w-sm text-theme-ink/70">
          No automation. No short-cuts. Just a kitchen that has been doing the same things, a
          little better each year, for a very long time.
        </p>
      </Reveal>

      <ol className="grid gap-8 md:grid-cols-3">
        {CRAFTS.map((c, i) => (
          <li key={c.key} className="group relative">
            <Parallax offset={i === 1 ? 22 : 14}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft ring-1 ring-[color:var(--color-border)]">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 65%, transparent) 0%, transparent 45%)',
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                  <div>
                    <p
                      className="font-display text-xs tracking-[0.3em] opacity-70"
                      style={{ color: 'var(--theme-base)' }}
                    >
                      {c.step}
                    </p>
                    <h3
                      className="font-display text-2xl font-semibold"
                      style={{ color: 'var(--theme-base)' }}
                    >
                      {c.title}
                    </h3>
                  </div>
                </div>
              </div>
            </Parallax>
            <p className="mt-5 text-sm leading-relaxed text-theme-ink/75">{c.caption}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
