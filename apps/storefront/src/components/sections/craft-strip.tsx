import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { Parallax } from '@/components/motion/parallax';
import { Paisley } from '@/components/brand/paisley';

const CRAFT_BACKDROP =
  'radial-gradient(ellipse at 35% 35%, color-mix(in oklab, var(--theme-glow) 60%, var(--theme-base)) 0%, color-mix(in oklab, var(--theme-glow) 22%, var(--theme-base)) 50%, var(--theme-base) 90%)';

const CRAFTS = [
  {
    key: 'roast',
    title: 'Roast',
    step: '01',
    caption:
      'Almonds and pistachios roasted in small trays over low heat — the difference between "good" and "oil-slick" is five seconds of patience.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/badam_katli-removebg-preview.png',
  },
  {
    key: 'slow-cook',
    title: 'Slow-cook',
    step: '02',
    caption:
      'Kova reduced over four hours in a copper pan, with nothing added but full-fat milk and the slow caramel that comes with patience.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/chitti_kova-removebg-preview.png',
  },
  {
    key: 'finish',
    title: 'Finish',
    step: '03',
    caption:
      'Hand-cut diamonds, silver leaf laid by hand, ribbon tied last. Every box leaves the kitchen checked by two pairs of eyes.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
  },
];

export function CraftStrip() {
  return (
    <section aria-labelledby="craft-heading" className="container-site py-20 md:py-24">
      <Reveal className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <Paisley size="sm" />
            The making
          </p>
          <h2
            id="craft-heading"
            className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.05]"
          >
            Three small acts, repeated every day.
          </h2>
        </div>
        <p className="text-theme-ink/70 max-w-sm">
          No automation. No short-cuts. Just a kitchen that has been doing the same things, a little
          better each year, for a very long time.
        </p>
      </Reveal>

      <ol className="grid gap-8 md:grid-cols-3">
        {CRAFTS.map((c, i) => (
          <li key={c.key} className="group relative">
            <Parallax offset={i === 1 ? 22 : 14}>
              <div
                className="shadow-soft relative aspect-[4/5] overflow-hidden rounded-2xl p-10 ring-1 ring-[color:var(--color-border)]"
                style={{ background: CRAFT_BACKDROP }}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 90vw"
                  className="object-contain drop-shadow-[0_24px_32px_rgba(60,30,5,0.2)] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-theme-ink/45 text-xs tracking-[0.3em]">
                      {c.step}
                    </p>
                    <h3 className="font-display text-theme-ink text-2xl">{c.title}</h3>
                  </div>
                </div>
              </div>
            </Parallax>
            <p className="text-theme-ink/75 mt-5 text-sm leading-relaxed">{c.caption}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
