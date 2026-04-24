'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const INGREDIENTS = [
  'Saffron',
  'Almond',
  'Pistachio',
  'Cardamom',
  'Ghee',
  'Silver leaf',
  'Rose',
  'Cashew',
  'Apricot',
  'Milk',
];

const MACRO =
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&q=90&auto=format&fit=crop';

/**
 * A foreground product macro with a slow-moving horizontal marquee of ingredient
 * names in large, low-opacity display type running behind it. Different scroll
 * rates on foreground and marquee create depth. Reduced-motion halts both.
 */
export function IngredientMarquee() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Foreground macro drifts gently up as you scroll through the section.
  const macroY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  // Background marquee translates horizontally at twice the foreground rate.
  const marqueeX = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  // Secondary row drifts in the opposite direction for parallax texture.
  const marqueeXReverse = useTransform(scrollYProgress, [0, 1], ['-20%', '15%']);

  return (
    <section
      ref={ref}
      aria-labelledby="ingredient-heading"
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--theme-base) 0%, color-mix(in oklab, var(--theme-glow) 12%, var(--theme-base)) 50%, var(--theme-base) 100%)',
      }}
    >
      {/* Background marquee layers (decorative, aria-hidden) */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4" aria-hidden="true">
        <motion.div
          className="flex shrink-0 whitespace-nowrap font-display text-[18vw] font-semibold italic leading-[0.95] text-theme-accent/10 md:text-[14vw]"
          style={reduced ? undefined : { x: marqueeX }}
        >
          {/* Doubled so the track wraps seamlessly */}
          <span className="pr-16">{INGREDIENTS.join(' · ')}</span>
          <span className="pr-16">{INGREDIENTS.join(' · ')}</span>
        </motion.div>
        <motion.div
          className="flex shrink-0 whitespace-nowrap font-display text-[12vw] font-normal leading-[0.9] text-theme-ink/8 md:text-[9vw]"
          style={reduced ? undefined : { x: marqueeXReverse }}
        >
          <span className="pr-16">{INGREDIENTS.slice().reverse().join(' · ')}</span>
          <span className="pr-16">{INGREDIENTS.slice().reverse().join(' · ')}</span>
        </motion.div>
      </div>

      {/* Foreground content */}
      <div className="container-site relative grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16">
        <div className="flex flex-col gap-4 md:max-w-md">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Ingredient list, unedited
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              id="ingredient-heading"
              className="font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg"
            >
              What you read is what&rsquo;s in the bowl.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-theme-ink/75 md:text-lg">
              No thickeners, no preservatives, no flavour substitutes. Our ingredient panels are
              short because our kitchen is honest — and the short list is what makes everything
              taste of itself.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-theme-ink/25 px-5 py-2.5 text-sm font-semibold text-theme-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-theme-accent hover:text-theme-accent"
            >
              Read the kitchen rules
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        <motion.div
          style={reduced ? undefined : { y: macroY }}
          className="relative aspect-[5/6] w-full max-w-lg justify-self-center overflow-hidden rounded-[2rem] shadow-lifted ring-1 ring-[color:var(--color-border)]"
        >
          <Image
            src={MACRO}
            alt="Saffron strands in a small dish beside an almond in shell"
            fill
            sizes="(min-width: 768px) 520px, 90vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 45%, transparent) 0%, transparent 50%)',
            }}
            aria-hidden="true"
          />
          <Grain />
          <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            Dev only
          </div>
        </motion.div>
      </div>
    </section>
  );
}
