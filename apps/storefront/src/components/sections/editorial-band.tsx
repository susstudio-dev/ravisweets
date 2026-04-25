'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Paisley } from '@/components/brand/paisley';
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
 * Full-bleed editorial band — dark overlay, large type, scroll-linked
 * background drift (parallax) and scale. Text stays stationary; image moves.
 * Reduced-motion collapses to a static full-bleed.
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
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

  return (
    <section
      ref={ref}
      aria-label={headline}
      className="relative isolate overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 80% 30%, #5a3010 0%, #2a1505 55%, #150a02 100%)',
      }}
    >
      {/* Background product accent — a brand-tinted PNG contained on the right.
          Dropped to opacity-70 + blur so the foreground type wins, but the warm
          glow of the sweet still anchors the panel. */}
      <motion.div
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
        className="pointer-events-none absolute -right-10 top-1/2 hidden h-[110%] w-[55%] -translate-y-1/2 md:block"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="55vw"
          className="object-contain opacity-70 mix-blend-screen drop-shadow-[0_40px_60px_rgba(242,198,111,0.25)]"
        />
      </motion.div>
      {/* Soft brass radial glow behind the product */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
        style={{
          background:
            'radial-gradient(ellipse at 70% 50%, rgba(242,198,111,0.18) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <Grain />

      {/* Foreground content */}
      <motion.div
        style={reduced ? undefined : { y: textY }}
        className={`container-site relative z-10 flex min-h-[60vh] flex-col justify-center gap-5 py-24 md:min-h-[70vh] md:py-32 ${alignCls}`}
      >
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${align !== 'center' ? '' : 'justify-center'}`}>
          <Paisley size="sm" color="#f2c66f" />
          <span className="text-[#f2c66f]">{eyebrow}</span>
        </div>
        <TextKinetic
          as="h2"
          text={headline}
          split="word"
          gap={60}
          className="max-w-3xl font-display text-display-lg font-semibold leading-[1.02] text-[#fdf6ec] md:text-display-xl"
        />
        <p className="max-w-2xl text-[#fdf6ec]/85 md:text-lg">{body}</p>
        <Link
          href={cta.href}
          className={`group mt-2 inline-flex items-center gap-2 rounded-full bg-[#f2c66f] px-6 py-3 text-sm font-semibold text-[#2a1505] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fdf6ec] ${align === 'right' ? 'self-end' : align === 'left' ? 'self-start' : ''}`}
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
