'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Reveal } from '@/components/motion/reveal';
import { MouseParallax } from '@/components/motion/mouse-parallax';
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
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=2000&q=92&auto=format&fit=crop';

const PICK_IMAGE =
  'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=600&q=85&auto=format&fit=crop';

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
  const pickY = useTransform(scrollYProgress, [0, 1], [0, -40]);
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

        {/* Visual column */}
        <div className="relative z-10">
          <motion.div
            style={reduced ? undefined : { y: imageY, scale: imageScale }}
            className="relative aspect-[4/5] md:aspect-[5/6]"
          >
            <MouseParallax strength={14} rotate={3.5} className="h-full w-full">
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] shadow-lifted ring-1 ring-[color:var(--color-border)]">
                <Image
                  src={HERO_IMAGE}
                  alt="Macro close-up of Qubani ka Meetha in saffron syrup, slivered almonds catching the directional light"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 520px, (min-width: 640px) 60vw, 90vw"
                  className="object-cover [transform:scale(1.04)]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 55%, transparent) 0%, transparent 40%), radial-gradient(ellipse at 40% 30%, transparent 55%, color-mix(in oklab, var(--theme-ink) 25%, transparent) 100%)',
                  }}
                  aria-hidden="true"
                />
                <Grain />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <p
                      className="font-display text-sm italic"
                      style={{ color: 'color-mix(in oklab, var(--theme-base) 90%, transparent)' }}
                    >
                      Pictured
                    </p>
                    <p
                      className="font-display text-lg font-semibold"
                      style={{ color: 'var(--theme-base)' }}
                    >
                      Qubani ka Meetha
                    </p>
                  </div>
                  <div
                    className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
                    aria-label="Placeholder image — dev only"
                  >
                    Dev only
                  </div>
                </div>
              </div>
            </MouseParallax>
          </motion.div>

          {/* Floating "pick of the season" card */}
          <motion.div
            style={reduced ? undefined : { y: pickY }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute -bottom-6 -left-4 hidden w-56 overflow-hidden rounded-2xl bg-surface-elevated shadow-lifted ring-1 ring-[color:var(--color-border)] md:flex"
          >
            <Link
              href="/product/badam-ki-jali"
              className="flex w-full items-center gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
              scroll={false}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={PICK_IMAGE}
                  alt="Badam ki Jali almond discs"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                  Pick of the season
                </p>
                <p className="truncate font-display text-sm font-semibold text-theme-ink">
                  Badam ki Jali
                </p>
                <p className="text-xs text-theme-ink/60">₹549 · 250 g</p>
              </div>
              <ArrowRight className="h-4 w-4 text-theme-ink/40" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Ornament: top-right */}
          <motion.div
            style={reduced ? undefined : { y: ornamentTopY }}
            className="pointer-events-none absolute -right-4 -top-8 hidden text-theme-accent opacity-75 md:block"
            aria-hidden="true"
          >
            <Paisley size="lg" rotate={20} />
          </motion.div>
          {/* Ornament: mid-right x-drifting */}
          <motion.div
            style={reduced ? undefined : { x: ornamentMidX, y: ornamentBottomY }}
            className="pointer-events-none absolute -right-6 top-1/2 hidden text-theme-glow opacity-50 lg:block"
            aria-hidden="true"
          >
            <Paisley size="md" rotate={200} />
          </motion.div>
          {/* Ornament: floating top-left on very large screens */}
          <motion.div
            style={reduced ? undefined : { y: ornamentTopY }}
            className="pointer-events-none absolute left-8 top-1/3 hidden text-theme-glow opacity-40 lg:block"
            aria-hidden="true"
          >
            <Paisley size="sm" rotate={70} />
          </motion.div>
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
