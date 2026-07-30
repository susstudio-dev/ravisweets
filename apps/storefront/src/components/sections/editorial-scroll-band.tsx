'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
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
  /** Where this frame's CTA points — usually the matching product detail page. */
  shopHref: string;
  shopLabel: string;
}

/**
 * Five frames, all real Ravi Sweets product photography. Hot-linked from
 * ravisweets.com (allowed in next.config remotePatterns). The PNGs are
 * background-removed product cutouts; we present them on a FLAT token panel
 * inside each frame so they read as still-life mithai stills, not catalogue
 * thumbnails. No gradients — a radial behind a product reads as a missing
 * background.
 */
const FRAMES: Frame[] = [
  {
    key: 'pan',
    eyebrow: '01 · The pan',
    title: 'Kova, reduced for hours.',
    body: 'Full-fat milk over a low flame, stirred clockwise until it gives up its caramel. The Chitti Kova in our gift boxes still starts here — never a shortcut, never a thickener.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/chitti_kova-removebg-preview.png',
    alt: 'Slabs of fresh Chitti Kova still warm from the pan',
    shopHref: '/category/sweets',
    shopLabel: 'Shop sweets',
  },
  {
    key: 'soak',
    eyebrow: '02 · The soak',
    title: 'Some things take overnight.',
    body: 'Anjeer, badam, kaju — laid down in their own bowls the evening before, so the Anjeer Katli the next morning slices clean and the cashew gives up its sweetness.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/anjjeer_katli-removebg-preview.png',
    alt: 'Anjeer Katli pieces with whole figs and almonds visible at the edge',
    shopHref: '/category/dry-fruits',
    shopLabel: 'Shop dry-fruit sweets',
  },
  {
    key: 'finish',
    eyebrow: '03 · The finish',
    title: 'Silver leaf, placed by breath.',
    body: 'The last act on a tray of Kaju Katli is varak — edible silver leaf, lifted with two pairs of tweezers in a quiet hour. It catches the light differently every box.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
    alt: 'Premium Kaju Katli diamonds finished with edible silver leaf',
    shopHref: '/product/kaju-katli',
    shopLabel: 'Shop Kaju Katli',
  },
  {
    key: 'fry',
    eyebrow: '04 · The fry',
    title: 'Boondi, one bowl at a time.',
    body: 'Saffron pearls dropped through a brass jhara into hot ghee — a single ladleful, never a vat. The Boondi Laddu we tie up in the afternoon starts as 200,000 of these.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png',
    alt: 'Boondi Laddu spheres, saffron pearls visible across the surface',
    shopHref: '/product/motichoor-ladoo',
    shopLabel: 'Shop ladoos',
  },
  {
    key: 'pack',
    eyebrow: '05 · The pack',
    title: 'Boxed the morning they ship.',
    body: 'From the Khammam counter or the Kondapur branch, every hamper leaves with a date stamp and a katli-cut tag — sealed by hand, two pairs of eyes before the lid closes.',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/besan_laddu-removebg-preview.png',
    alt: 'Soft Besan Laddu rounds laid out for the gift box',
    shopHref: '/category/gift-hampers',
    shopLabel: 'Shop gift hampers',
  },
];

/**
 * Flat panel per frame, alternating the anjeer field with the raised plum
 * of the dusk register. Both are dark grounds, so one cream ink stays legible
 * on every frame and the strip still has rhythm without a single gradient.
 */
function panelSurface(i: number): string {
  return i % 2 === 0 ? 'bg-field' : 'bg-surface-elevated';
}

/** Katli cut — the 45° diamond the sweet is actually cut into. */
function KatliBullet() {
  return <span aria-hidden="true" className="bg-theme-accent inline-block h-1.5 w-1.5 rotate-45" />;
}

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
    <section
      ref={ref}
      data-register="dusk"
      aria-labelledby="eband-heading"
      className="bg-theme-base relative"
    >
      {/* Reduced-motion & touch fallback: plain vertical stack with snap-scroll */}
      <div className="lg:hidden">
        <div className="container-site pb-8 pt-16">
          <Reveal>
            <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <KatliBullet />
              Inside the kitchen
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id="eband-heading-mobile"
              className="font-display text-display-md text-theme-ink mt-3 leading-[1.05]"
            >
              Five small acts, every morning.
            </h2>
          </Reveal>
        </div>
        <div className="flex snap-x snap-mandatory overflow-x-auto">
          {FRAMES.map((f, i) => (
            <article key={f.key} className="flex w-[88vw] shrink-0 snap-center flex-col gap-3 px-4">
              <div
                className={`shadow-soft relative aspect-[4/5] overflow-hidden rounded-2xl p-6 ring-1 ring-[color:var(--color-border)] ${panelSurface(i)}`}
              >
                <Image src={f.image} alt={f.alt} fill sizes="88vw" className="object-contain p-4" />
                <Grain />
              </div>
              <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.22em]">
                {f.eyebrow}
              </p>
              <h3 className="font-display text-theme-ink text-xl">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.body}</p>
              <a
                href={f.shopHref}
                className="text-theme-accent mt-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:underline"
              >
                {f.shopLabel} →
              </a>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop scroll-linked horizontal band */}
      <div className="relative hidden lg:block" style={{ height: reduced ? 'auto' : bandHeight }}>
        <div
          className={reduced ? 'relative' : 'sticky top-0 flex h-screen flex-col overflow-hidden'}
        >
          {/* Header */}
          <div className="container-site pt-16">
            <Reveal>
              <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
                <KatliBullet />
                Inside the kitchen
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                id="eband-heading"
                className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.02]"
              >
                Five small acts, every morning.
              </h2>
            </Reveal>
          </div>

          {/* Horizontal band */}
          {reduced ? (
            <div className="container-site mt-10 grid grid-cols-1 gap-8 pb-16">
              {FRAMES.map((f, i) => (
                <article key={f.key} className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                  <div
                    className={`shadow-soft relative aspect-[4/5] overflow-hidden rounded-2xl p-8 ring-1 ring-[color:var(--color-border)] ${panelSurface(i)}`}
                  >
                    <Image src={f.image} alt={f.alt} fill sizes="50vw" className="object-contain" />
                    <Grain />
                  </div>
                  <div className="flex flex-col justify-center gap-3">
                    <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.22em]">
                      {f.eyebrow}
                    </p>
                    <h3 className="font-display text-theme-ink text-2xl">{f.title}</h3>
                    <p className="text-text-muted leading-relaxed">{f.body}</p>
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
                {FRAMES.map((f, i) => (
                  <article
                    key={f.key}
                    className="flex h-full w-full max-w-[92vw] shrink-0 items-center gap-12"
                    style={{ flex: `0 0 ${100 / FRAMES.length}%` }}
                  >
                    <div
                      className={`shadow-lifted relative aspect-[4/5] w-[32vw] max-w-[480px] shrink-0 overflow-hidden rounded-[1.75rem] p-10 ring-1 ring-[color:var(--color-border)] ${panelSurface(i)}`}
                    >
                      <Image
                        src={f.image}
                        alt={f.alt}
                        fill
                        sizes="480px"
                        className="object-contain"
                      />
                      <Grain />
                      {/* Big step numeral, bottom-right of the still — anchors the eye */}
                      <span
                        className="font-display text-theme-ink pointer-events-none absolute -bottom-3 -right-1 select-none text-[14rem] leading-none opacity-[0.08]"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="text-text-muted pointer-events-none absolute bottom-4 left-5 text-[10px] font-semibold uppercase tracking-[0.22em]">
                        Photographed at our Khammam kitchen
                      </div>
                    </div>
                    <div className="flex max-w-xl flex-col gap-4">
                      <p className="text-theme-accent flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]">
                        {/* Katli-cut badge: the numeral sits inside the diamond */}
                        <span className="bg-theme-accent flex h-7 w-7 rotate-45 items-center justify-center">
                          <span className="-rotate-45 font-mono text-[10px] text-[color:var(--theme-base)]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </span>
                        {f.eyebrow.split('·')[1]?.trim() ?? f.eyebrow}
                      </p>
                      <h3 className="font-display text-display-md text-theme-ink leading-[1.05]">
                        {f.title}
                      </h3>
                      <p className="text-text-muted text-lg leading-relaxed">{f.body}</p>
                      <a
                        href={f.shopHref}
                        className="bg-theme-accent shadow-soft hover:shadow-lifted group mt-2 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5"
                      >
                        {f.shopLabel}
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </a>
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
          )}

          {/* Progress indicator (desktop only) */}
          {!reduced && (
            <div className="container-site pb-10">
              <div className="relative h-px w-full bg-[color:var(--color-border)]">
                <motion.div
                  className="bg-theme-accent absolute left-0 top-0 h-full"
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
