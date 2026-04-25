'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Reveal } from '@/components/motion/reveal';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

// Macro close-up — Qubani ka Meetha in saffron syrup, pictured against the dark
// directional lighting from the La Maison du Chocolat / MFK references in
// research/benchmark.md §5.1. The hero now layers three independent parallax
// rates: image (slow), saffron-strand overlay (fast), and content (mid),
// so scroll feels cinematic rather than flat. Replace when production
// photography lands per the photography-gating requirement.
const HERO_IMAGE =
  'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png';

const HERO_BACKDROP =
  'radial-gradient(ellipse at 40% 35%, color-mix(in oklab, var(--theme-glow) 70%, var(--theme-base)) 0%, color-mix(in oklab, var(--theme-glow) 30%, var(--theme-base)) 50%, var(--theme-base) 90%)';

// 8 saffron strands scattered with deterministic positions for SSR-stable layout
const SAFFRON_STRANDS = [
  { top: '8%', left: '12%', rotate: -18, scale: 0.9, opacity: 0.55 },
  { top: '22%', left: '78%', rotate: 24, scale: 1.1, opacity: 0.4 },
  { top: '38%', left: '6%', rotate: -34, scale: 0.7, opacity: 0.5 },
  { top: '52%', left: '88%', rotate: 12, scale: 0.85, opacity: 0.45 },
  { top: '68%', left: '20%', rotate: -8, scale: 1, opacity: 0.5 },
  { top: '78%', left: '70%', rotate: 32, scale: 0.7, opacity: 0.4 },
  { top: '14%', left: '52%', rotate: 4, scale: 0.6, opacity: 0.35 },
  { top: '88%', left: '40%', rotate: -22, scale: 0.9, opacity: 0.45 },
];

export function HeroStill() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Three distinct parallax rates layered in z-order:
  //   image  — slowest (-110 px) so the foreground sits like a still frame
  //   strands — fastest (-220 px) so saffron drifts past the viewer
  //   content — mid (40 px down + opacity fade) so headline trails behind the image
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const strandsY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const ornamentTopY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const ornamentBottomY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const ornamentMidX = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section
      ref={ref}
      aria-label="Hero"
      className="relative isolate overflow-hidden border-b border-[color:var(--color-border)]"
      style={{
        background:
          'radial-gradient(ellipse at 72% 38%, color-mix(in oklab, var(--theme-glow) 42%, transparent) 0%, transparent 65%), radial-gradient(ellipse at 10% 90%, color-mix(in oklab, var(--theme-accent) 12%, transparent) 0%, transparent 55%), var(--theme-base)',
      }}
    >
      {/* Vertical side ribbon */}
      <div
        className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 -rotate-90 origin-left font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-theme-ink/40 md:block"
        aria-hidden="true"
      >
        Est. Khammam · Since generations
      </div>

      {/* Saffron-strand parallax overlay — fastest layer */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 hidden md:block"
          style={{ y: strandsY }}
        >
          {SAFFRON_STRANDS.map((s, i) => (
            <span
              key={i}
              className="absolute text-theme-accent"
              style={{
                top: s.top,
                left: s.left,
                opacity: s.opacity,
                transform: `rotate(${s.rotate}deg) scale(${s.scale})`,
              }}
            >
              <svg width="18" height="28" viewBox="0 0 14 22">
                <path
                  d="M7 1 C 9 5, 11 9, 9 14 C 7.5 18, 7 20, 7 21 C 7 20, 6.5 18, 5 14 C 3 9, 5 5, 7 1 Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          ))}
        </motion.div>
      )}

      <motion.div
        className="container-site relative grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24 lg:py-28"
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
      >
        {/* Copy column */}
        <div className="relative z-10 flex flex-col gap-6">
          <Reveal delay={0.05}>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              <span
                className="text-base font-normal normal-case tracking-normal"
                style={{ fontFamily: 'var(--font-indic)' }}
              >
                ఖమ్మం
              </span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>Khammam · Telangana</span>
            </p>
          </Reveal>

          <TextKinetic
            as="h1"
            text="The sweetness of Telangana, slow-cooked in Khammam."
            split="word"
            gap={55}
            className="font-display text-display-lg font-semibold leading-[1.02] text-theme-ink md:text-display-xl"
          />

          <Reveal delay={0.25}>
            <p className="max-w-xl text-lg leading-relaxed text-theme-ink/75">
              Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets,
              namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/category/hyderabadi-specials"
                className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                Shop Hyderabadi specials
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-6 py-3 text-sm font-semibold text-theme-ink transition-colors duration-300 hover:border-theme-accent hover:text-theme-accent"
              >
                Corporate gifting
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <dl className="mt-3 flex gap-8 text-xs text-theme-ink/60">
              <div>
                <dt className="font-semibold uppercase tracking-wider text-theme-ink/80">
                  FSSAI certified
                </dt>
                <dd className="mt-1">Kitchen &amp; pack</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wider text-theme-ink/80">
                  No preservatives
                </dt>
                <dd className="mt-1">Ever</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wider text-theme-ink/80">
                  Fresh daily
                </dt>
                <dd className="mt-1">Same-day dispatch</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        {/* Visual column — premium showcase + quick browse strip + trust pill */}
        <div className="relative z-10 flex flex-col gap-5">
          <motion.div
            style={reduced ? undefined : { y: imageY, scale: imageScale }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            {/*
              Gold-foil gradient ring. The aspect-ratio sits on THIS div so the
              inner card fills h-full w-full predictably. MouseParallax is dropped
              — it was wrapping the inner card without forwarding height, which
              caused the inner card to collapse and the gold ring to dominate.
            */}
            <div
              className="relative aspect-square rounded-[2rem] p-[3px] shadow-lifted"
              style={{
                background:
                  'linear-gradient(135deg, #f2c66f 0%, #c08a18 35%, #fff5d4 60%, #c08a18 80%, #8a5a10 100%)',
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-[1.85rem]"
                style={{ background: HERO_BACKDROP }}
              >
                {/* Premium stamp — top-left */}
                <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-theme-ink/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--theme-base)] backdrop-blur">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: '#f2c66f' }}
                  />
                  Limited batch
                </span>
                {/* Italic eyebrow — top-right */}
                <span
                  className="absolute right-6 top-5 z-10 font-display text-sm italic"
                  style={{ color: '#8a5a10' }}
                >
                  Today&rsquo;s pick
                </span>

                {/* Image fills the card centre (object-contain keeps the cutout intact) */}
                <Image
                  src={HERO_IMAGE}
                  alt="Premium Kaju Katli — silver-leaf cashew diamonds from our Khammam kitchen"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 90vw"
                  className="object-contain p-12 drop-shadow-[0_30px_50px_rgba(60,30,5,0.28)] md:p-16"
                />
                <Grain />

                {/* Caption + CTA — anchored to the bottom */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#fdf6ec] via-[#fdf6ec]/85 to-transparent px-6 pb-5 pt-10">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-theme-ink md:text-xl">
                        Premium Kaju Katli
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-theme-ink/55">
                        250 g · silver leaf · cardamom
                      </p>
                    </div>
                    <Link
                      href="/product/kaju-katli"
                      className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-theme-ink px-4 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5"
                    >
                      ₹449
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Single subtle ornament — anchors the visual without crowding. */}
          <motion.div
            style={reduced ? undefined : { y: ornamentTopY, x: ornamentMidX }}
            className="pointer-events-none absolute -right-2 -top-6 hidden text-theme-accent/40 md:block"
            aria-hidden="true"
          >
            <Paisley size="lg" rotate={20} />
          </motion.div>
          <motion.div
            style={reduced ? undefined : { y: ornamentBottomY }}
            className="pointer-events-none absolute -bottom-4 -left-2 hidden text-theme-glow/45 md:block"
            aria-hidden="true"
          >
            <Paisley size="md" rotate={200} />
          </motion.div>

          {/* Quick browse strip — fills the space below the showcase card with
              three one-tap entry points into the most-loved categories. */}
          <Reveal delay={0.55}>
            <ul className="mx-auto grid w-full max-w-[460px] grid-cols-3 gap-2 md:gap-3">
              {[
                { slug: 'sweets', label: 'Sweets', sub: 'Bestsellers' },
                { slug: 'gift-hampers', label: 'Hampers', sub: 'Festival-ready' },
                { slug: 'savouries', label: 'Savoury', sub: 'Chai-time' },
              ].map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="group flex h-full flex-col items-start justify-between gap-1 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated/85 p-3 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-theme-accent hover:shadow-soft"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                      {c.sub}
                    </span>
                    <span className="flex w-full items-center justify-between gap-1.5">
                      <span className="font-display text-sm font-semibold text-theme-ink">
                        {c.label}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-theme-ink/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-theme-accent"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Trust + delivery pill — closes the right column with confidence */}
          <Reveal delay={0.7}>
            <div className="mx-auto flex w-full max-w-[460px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated/70 px-5 py-3 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#f2c66f' }}
                >
                  <Paisley size="sm" color="#3a1505" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                    Made fresh in Khammam
                  </p>
                  <p className="text-xs text-theme-ink/65">
                    Free shipping above ₹999 · ships across India
                  </p>
                </div>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-theme-ink/75 hover:text-theme-accent"
              >
                Shop all
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </motion.div>

      {/* Ambient bottom fade into page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background: 'linear-gradient(to top, var(--theme-base), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Scroll cue */}
      <Reveal delay={0.9} className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div
          className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-theme-ink/50"
          aria-hidden="true"
        >
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-theme-ink/25" />
        </div>
      </Reveal>
    </section>
  );
}
