'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * Hero still — Premium Kaju Katli, photographed at the Khammam kitchen
 * (PNG cutout from ravisweets.com, hot-linked via next.config remote
 * patterns). Sat on a warm radial gradient with a subtle drop shadow so
 * it reads as an editorial still-life rather than a product cutout.
 */
const ESSENCE_IMAGE =
  'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png';
const ESSENCE_BACKDROP =
  'radial-gradient(ellipse at 35% 40%, color-mix(in oklab, var(--theme-glow) 65%, var(--theme-base)) 0%, color-mix(in oklab, var(--theme-glow) 28%, var(--theme-base)) 50%, var(--theme-base) 85%)';

const STRANDS = [
  { top: '14%', left: '8%', rotate: -22, scale: 0.9, opacity: 0.55 },
  { top: '32%', left: '82%', rotate: 18, scale: 1.05, opacity: 0.45 },
  { top: '58%', left: '12%', rotate: -10, scale: 0.7, opacity: 0.5 },
  { top: '72%', left: '74%', rotate: 28, scale: 0.85, opacity: 0.4 },
  { top: '20%', left: '50%', rotate: 6, scale: 0.6, opacity: 0.35 },
  { top: '86%', left: '40%', rotate: -32, scale: 0.95, opacity: 0.45 },
];

export function SweetEssencePanel() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Three independent rates: image (slow), strands (fast), text (slowest+).
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -100]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const strandsY = useTransform(scrollYProgress, [0, 1], [120, -200]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -30]);

  return (
    <section
      ref={ref}
      aria-labelledby="essence-heading"
      className="relative isolate overflow-hidden border-y border-[color:var(--color-border)]"
      style={{
        background:
          'radial-gradient(ellipse at 30% 70%, color-mix(in oklab, var(--theme-glow) 28%, transparent) 0%, transparent 60%), var(--theme-base)',
      }}
    >
      <div className="container-site relative grid gap-10 py-16 md:grid-cols-[1fr_1.1fr] md:items-center md:py-20">
        {/* Image column with multi-rate parallax — smaller / lighter than before */}
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] p-8 shadow-lifted ring-1 ring-[color:var(--color-border)] md:aspect-[4/5]"
          style={
            reduced
              ? { background: ESSENCE_BACKDROP }
              : { y: imageY, scale: imageScale, background: ESSENCE_BACKDROP }
          }
        >
          <Image
            src={ESSENCE_IMAGE}
            alt="Premium Kaju Katli diamonds finished with edible silver leaf, photographed at our Khammam kitchen"
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-contain drop-shadow-[0_40px_50px_rgba(60,30,5,0.25)]"
          />
          <Grain />

          {/* Saffron strand overlay layer — fastest parallax rate */}
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{ y: strandsY }}
            >
              {STRANDS.map((s, i) => (
                <span
                  key={i}
                  className="absolute text-theme-glow"
                  style={{
                    top: s.top,
                    left: s.left,
                    opacity: s.opacity,
                    transform: `rotate(${s.rotate}deg) scale(${s.scale})`,
                  }}
                >
                  <svg width="22" height="34" viewBox="0 0 14 22">
                    <path
                      d="M7 1 C 9 5, 11 9, 9 14 C 7.5 18, 7 20, 7 21 C 7 20, 6.5 18, 5 14 C 3 9, 5 5, 7 1 Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              ))}
            </motion.div>
          )}

          <div
            className="pointer-events-none absolute bottom-4 left-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55"
          >
            Kaju Katli · Khammam kitchen
          </div>
        </motion.div>

        {/* Copy column — slowest rate */}
        <motion.div
          className="relative z-10 flex flex-col gap-5"
          style={reduced ? undefined : { y: textY }}
        >
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              <span
                className="text-base font-normal normal-case tracking-normal"
                style={{ fontFamily: 'var(--font-indic)' }}
              >
                మాధుర్యం
              </span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>The essence</span>
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              id="essence-heading"
              className="font-display text-display-md font-semibold leading-[1.05] text-theme-ink md:text-display-lg"
            >
              Saffron, slowly. Cardamom, gently. Time, generously.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-theme-ink/75">
              Three ingredients, one rule — the slow way is the only way. Every box
              that leaves our Khammam kitchen carries that patience inside it.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <Link
              href="/about"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-theme-ink/25 px-6 py-3 text-sm font-semibold text-theme-ink transition-colors duration-300 hover:border-theme-accent hover:text-theme-accent"
            >
              See how we make it
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
