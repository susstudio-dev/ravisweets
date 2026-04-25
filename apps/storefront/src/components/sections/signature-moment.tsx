'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { MaskReveal } from '@/components/motion/mask-reveal';
import { Reveal } from '@/components/motion/reveal';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { SIGNATURE_MOMENT } from './signature-moment.meta';

/**
 * A full-bleed, single-image home moment — the frame that becomes the
 * screenshot when someone shares the site. Placed between FlavourAtlas
 * and Featured on the home page.
 *
 * Spec: openspec/changes/app-polish-and-motion-depth/specs/signature-home-moment
 */
export function SignatureMoment() {
  const m = SIGNATURE_MOMENT;
  return (
    <section
      aria-labelledby="signature-heading"
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: '#1a0e05' }}
    >
      <MaskReveal direction="left" className="absolute inset-0 -z-10">
        <Image
          src={m.image.url}
          alt={m.image.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </MaskReveal>

      {/* Gradient mask: opaque ink at bottom, transparent at ~55% */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(26,14,5,0.1) 0%, rgba(26,14,5,0.35) 45%, rgba(26,14,5,0.88) 100%)',
        }}
      />
      {/* Subtle left-side gradient for legibility on desktop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(26,14,5,0.55) 0%, rgba(26,14,5,0.15) 40%, transparent 65%)',
        }}
      />
      <Grain />

      {/* Content — left-aligned on desktop, centre on mobile */}
      <div className="container-site relative flex min-h-[75vh] flex-col items-start justify-end gap-4 py-28 md:min-h-[85vh] md:max-w-3xl md:justify-center md:py-36">
        <Reveal>
          <p className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f2c66f]">
            <Paisley size="sm" color="#f2c66f" />
            <span className="text-base font-normal normal-case tracking-normal" style={{ fontFamily: 'var(--font-indic)' }}>
              {m.copy.eyebrow_indic}
            </span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span>{m.copy.eyebrow_en}</span>
          </p>
        </Reveal>

        <h2
          id="signature-heading"
          className="font-display text-display-lg font-semibold leading-[1.02] text-[#fdf6ec] md:text-display-xl"
        >
          <TextKinetic as="span" text={m.copy.headline} split="word" gap={55} />{' '}
          <span className="block italic text-[#f2c66f]">
            <TextKinetic as="span" text={m.copy.headline_emphasis} split="word" gap={50} />
          </span>
        </h2>

        <Reveal delay={0.3}>
          <p className="max-w-xl text-[#fdf6ec]/85 md:text-lg">{m.copy.body}</p>
        </Reveal>

        <Reveal delay={0.4}>
          <Link
            href={m.copy.cta.href}
            className="group mt-2 inline-flex items-center gap-2 rounded-full border border-[#fdf6ec]/30 px-6 py-3 text-sm font-semibold text-[#fdf6ec] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f2c66f] hover:text-[#f2c66f]"
          >
            {m.copy.cta.label}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>

      {/* Paisley corner mark */}
      <div
        className="pointer-events-none absolute bottom-6 left-6 text-[#f2c66f]/70"
        aria-hidden="true"
      >
        <Paisley size="lg" rotate={-12} color="#f2c66f" />
      </div>

      {/* Dev-only watermark */}
      <div
        className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
        aria-label="Placeholder image — dev only"
      >
        Dev only
      </div>
    </section>
  );
}
