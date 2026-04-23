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
    >
      {/* Background image with parallax */}
      <motion.div
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      {/* Dark gradient overlay for legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,10,5,0.35) 0%, rgba(15,10,5,0.65) 60%, rgba(15,10,5,0.85) 100%)',
        }}
        aria-hidden="true"
      />
      <Grain />

      {/* Dev-only watermark */}
      <div
        className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
        aria-label="Placeholder image — dev only"
      >
        Dev only
      </div>

      {/* Foreground content */}
      <motion.div
        style={reduced ? undefined : { y: textY }}
        className={`container-site relative z-10 flex min-h-[70vh] flex-col justify-center gap-5 py-28 md:min-h-[80vh] md:py-36 ${alignCls}`}
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
          className="max-w-4xl font-display text-display-lg font-semibold leading-[1.02] text-[#fdf6ec] md:text-display-xl"
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
