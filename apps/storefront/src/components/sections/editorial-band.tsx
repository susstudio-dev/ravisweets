'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Grain } from '@/components/brand/grain';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface EditorialBandProps {
  /** Large headline (word-split for kinetic entrance). */
  headline: string;
  /** Secondary supporting copy. */
  body: string;
  /** Eyebrow label above the headline. */
  eyebrow: string;
  /** Call-to-action label and destination. */
  cta: { label: string; href: string };
  /** Full-bleed background image URL. */
  image: string;
  /** Alt text for the background image (empty string if purely decorative + text overlaid). */
  imageAlt: string;
  /** Content horizontal alignment — default centre. */
  align?: 'left' | 'center' | 'right';
}

/**
 * Full-bleed editorial band — flat Bidri ground, large type, scroll-linked
 * background drift (parallax) and scale. Text stays stationary; image moves.
 * Reduced-motion collapses to a static full-bleed.
 *
 * The ground is a single flat colour block from the Bidri register, not a
 * gradient: `data-register="dusk"` re-themes the whole subtree, so every
 * colour below is a token and the band follows the palette.
 */
export function EditorialBand({
  headline,
  body,
  eyebrow,
  cta,
  image,
  imageAlt,
  align = 'center',
}: EditorialBandProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Strong scroll-linked drift — image moves ~120px top-to-bottom across the viewport window.
  const bgY = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const alignCls =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';

  return (
    <section
      ref={ref}
      data-register="dusk"
      aria-label={headline}
      className="bg-theme-base relative isolate overflow-hidden"
    >
      {/* Background product accent — a cutout PNG contained on the right. Held
          below full opacity so the foreground type wins. No blend mode and no
          glow: on the matte Bidri ground the still carries itself. */}
      <motion.div
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
        className="pointer-events-none absolute -right-10 top-1/2 hidden h-[110%] w-[55%] -translate-y-1/2 md:block"
      >
        <Image src={image} alt={imageAlt} fill sizes="55vw" className="object-contain opacity-80" />
      </motion.div>
      <Grain />

      {/* Foreground content */}
      <motion.div
        style={reduced ? undefined : { y: textY }}
        className={`container-site relative z-10 flex min-h-[60vh] flex-col justify-center gap-5 py-24 md:min-h-[70vh] md:py-32 ${alignCls}`}
      >
        <div
          className={`text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${align !== 'center' ? '' : 'justify-center'}`}
        >
          {/* Katli cut — the 45° diamond the sweet is actually cut into */}
          <span aria-hidden="true" className="bg-theme-accent inline-block h-1.5 w-1.5 rotate-45" />
          <span>{eyebrow}</span>
        </div>
        <TextKinetic
          as="h2"
          text={headline}
          split="word"
          gap={60}
          className="font-display text-display-lg md:text-display-xl text-theme-ink max-w-3xl leading-[1.02]"
        />
        <p className="text-text-muted max-w-2xl md:text-lg">{body}</p>
        <Link
          href={cta.href}
          className={`bg-theme-accent hover:bg-theme-ink group mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 ${align === 'right' ? 'self-end' : align === 'left' ? 'self-start' : ''}`}
          scroll={false}
        >
          {cta.label}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </motion.div>
    </section>
  );
}
