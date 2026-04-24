'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface Frame {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
}

const FRAMES: Frame[] = [
  {
    key: 'copper',
    eyebrow: '01 · Copper',
    title: 'We still reduce rabri by hand.',
    body: 'Four hours over a low flame, stirred clockwise so the milk catches at the sides and gives up its caramel.',
    image:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1600&q=85&auto=format&fit=crop',
    alt: 'Hands stirring a reduction in a copper pan',
  },
  {
    key: 'apricots',
    eyebrow: '02 · Apricots',
    title: 'Qubani gets its own time.',
    body: 'We soak the dried apricots overnight before reducing them in their own syrup — no added water, no shortcuts.',
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&q=85&auto=format&fit=crop',
    alt: 'Dried apricots in a bowl, waiting to be cooked',
  },
  {
    key: 'silver',
    eyebrow: '03 · Silver leaf',
    title: 'Laid on, one diamond at a time.',
    body: 'Edible silver leaf is the last touch. It lifts on a breath. Two people, two pairs of tweezers, a quiet hour.',
    image:
      'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=1600&q=85&auto=format&fit=crop',
    alt: 'Silver leaf being placed on Kaju Katli diamonds',
  },
  {
    key: 'almonds',
    eyebrow: '04 · Almonds',
    title: 'Roasted in trays, never machines.',
    body: 'A small tray, a low oven, and a minute’s flip. Industrial roasters scorch one side; ours come out even.',
    image:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1600&q=85&auto=format&fit=crop',
    alt: 'Almonds spread across a roasting tray',
  },
  {
    key: 'pack',
    eyebrow: '05 · Pack',
    title: 'Boxed the morning they ship.',
    body: 'Every hamper leaves with a date stamp and a paisley tag, sealed by hand. Two pairs of eyes before the lid closes.',
    image:
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1600&q=85&auto=format&fit=crop',
    alt: 'A wrapped gift hamper on the packing table',
  },
];

export function EditorialScrollBand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Scroll-linked X translation across the sticky band.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Move from 0 → 100 - (100 / N) so the last frame lands aligned, not past.
  const lastPercent = -(100 - 100 / FRAMES.length);
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${lastPercent}%`]);

  // Parent vertical length: one viewport per frame minus one, so the strip completes naturally.
  const bandHeight = `${FRAMES.length * 100}vh`;

  return (
    <section ref={ref} aria-labelledby="eband-heading" className="relative">
      {/* Reduced-motion & touch fallback: plain vertical stack with snap-scroll */}
      <div className="lg:hidden">
        <div className="container-site pt-16 pb-8">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Inside the kitchen
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id="eband-heading-mobile"
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink"
            >
              Five small acts, every morning.
            </h2>
          </Reveal>
        </div>
        <div className="flex snap-x snap-mandatory overflow-x-auto">
          {FRAMES.map((f) => (
            <article
              key={f.key}
              className="flex w-[88vw] shrink-0 snap-center flex-col gap-3 px-4"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft ring-1 ring-[color:var(--color-border)]">
                <Image
                  src={f.image}
                  alt={f.alt}
                  fill
                  sizes="88vw"
                  className="object-cover"
                />
                <Grain />
                <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Dev only
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                {f.eyebrow}
              </p>
              <h3 className="font-display text-xl font-semibold text-theme-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-theme-ink/75">{f.body}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop scroll-linked horizontal band */}
      <div
        className="relative hidden lg:block"
        style={{ height: reduced ? 'auto' : bandHeight }}
      >
        <div
          className={
            reduced
              ? 'relative'
              : 'sticky top-0 flex h-screen flex-col overflow-hidden'
          }
        >
          {/* Header */}
          <div className="container-site pt-16">
            <Reveal>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                Inside the kitchen
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                id="eband-heading"
                className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg"
              >
                Five small acts, every morning.
              </h2>
            </Reveal>
          </div>

          {/* Horizontal band */}
          {reduced ? (
            <div className="container-site mt-10 grid grid-cols-1 gap-8 pb-16">
              {FRAMES.map((f) => (
                <article key={f.key} className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
                    <Image src={f.image} alt={f.alt} fill sizes="50vw" className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                      {f.eyebrow}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-theme-ink">
                      {f.title}
                    </h3>
                    <p className="leading-relaxed text-theme-ink/75">{f.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="relative mt-auto flex-1">
              <motion.div
                className="flex h-full gap-8 pl-[max(1rem,calc((100vw-1200px)/2))] pr-8"
                style={{ x, width: `${FRAMES.length * 100}%` }}
              >
                {FRAMES.map((f) => (
                  <article
                    key={f.key}
                    className="flex h-full w-full max-w-[92vw] shrink-0 items-center gap-10"
                    style={{ flex: `0 0 ${100 / FRAMES.length}%` }}
                  >
                    <div className="relative aspect-[4/5] w-[36vw] max-w-[560px] shrink-0 overflow-hidden rounded-[1.75rem] shadow-lifted ring-1 ring-[color:var(--color-border)]">
                      <Image
                        src={f.image}
                        alt={f.alt}
                        fill
                        sizes="560px"
                        className="object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 40%, transparent) 0%, transparent 50%)',
                        }}
                        aria-hidden="true"
                      />
                      <Grain />
                      <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                        Dev only
                      </div>
                    </div>
                    <div className="flex max-w-lg flex-col gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                        {f.eyebrow}
                      </p>
                      <h3 className="font-display text-display-md font-semibold leading-[1.05] text-theme-ink">
                        {f.title}
                      </h3>
                      <p className="text-lg leading-relaxed text-theme-ink/75">{f.body}</p>
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
          )}

          {/* Progress indicator (desktop only) */}
          {!reduced && (
            <div className="container-site pb-10">
              <div className="relative h-px w-full bg-theme-ink/10">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-theme-accent"
                  style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
