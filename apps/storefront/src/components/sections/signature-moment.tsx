'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Grain } from '@/components/brand/grain';
import { MaskReveal } from '@/components/motion/mask-reveal';
import { Reveal } from '@/components/motion/reveal';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { SIGNATURE_MOMENT } from './signature-moment.meta';

/**
 * A scrim stop expressed as a share of the register's OWN ground colour, so the
 * mask follows the palette instead of a baked cocoa. Inside the dusk subtree
 * `--theme-base` is plum; if the register ever changes, the scrim does too.
 */
function scrim(percent: number): string {
  return `color-mix(in oklab, var(--theme-base) ${percent}%, transparent)`;
}

/**
 * A full-bleed, single-image home moment — the frame that becomes the
 * screenshot when someone shares the site. Placed between FlavourAtlas
 * and Featured on the home page.
 *
 * Renders in the dusk register: the whole subtree re-themes to plum +
 * cream + marigold from the one `data-register` attribute, so this file carries
 * no colour of its own.
 *
 * Spec: openspec/changes/app-polish-and-motion-depth/specs/signature-home-moment
 */
export function SignatureMoment() {
  const m = SIGNATURE_MOMENT;
  return (
    <section
      data-register="dusk"
      aria-labelledby="signature-heading"
      className="bg-theme-base relative isolate overflow-hidden"
    >
      <MaskReveal direction="left" className="absolute inset-0 -z-10">
        <Image src={m.image.url} alt={m.image.alt} fill sizes="100vw" className="object-cover" />
      </MaskReveal>

      {/* Vertical scrim: near-opaque ground at the bottom, clear at the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, ${scrim(10)} 0%, ${scrim(40)} 45%, ${scrim(92)} 100%)`,
        }}
      />
      {/* Left-side scrim for legibility of the desktop text column */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        style={{
          background: `linear-gradient(90deg, ${scrim(60)} 0%, ${scrim(18)} 40%, transparent 65%)`,
        }}
      />
      <Grain />

      {/* Content — left-aligned on desktop, centre on mobile */}
      <div className="container-site relative flex min-h-[75vh] flex-col items-start justify-end gap-4 py-28 md:min-h-[85vh] md:max-w-3xl md:justify-center md:py-36">
        <Reveal>
          <p className="text-theme-accent flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
            {/* Katli cut — the 45° diamond the sweet is actually cut into */}
            <span
              aria-hidden="true"
              className="bg-theme-accent inline-block h-1.5 w-1.5 rotate-45"
            />
            <span className="font-indic text-base font-normal normal-case tracking-normal">
              {m.copy.eyebrow_indic}
            </span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span>{m.copy.eyebrow_en}</span>
          </p>
        </Reveal>

        <h2
          id="signature-heading"
          className="font-display text-display-lg md:text-display-xl text-theme-ink leading-[1.02]"
        >
          <TextKinetic as="span" text={m.copy.headline} split="word" gap={55} />{' '}
          {/* Emphasis carried by colour, not italic: Young Serif ships one
              upright cut and font-synthesis is off, so `italic` renders nothing. */}
          <span className="text-theme-accent block">
            <TextKinetic as="span" text={m.copy.headline_emphasis} split="word" gap={50} />
          </span>
        </h2>

        <Reveal delay={0.3}>
          <p className="text-text-muted max-w-xl md:text-lg">{m.copy.body}</p>
        </Reveal>

        <Reveal delay={0.4}>
          <Link
            href={m.copy.cta.href}
            className="bg-theme-accent hover:bg-theme-ink group mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5"
          >
            {m.copy.cta.label}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>

      {/* Corner mark — silver hairline closed by a single katli diamond */}
      <div
        className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-3"
        aria-hidden="true"
      >
        <span className="bg-varak h-px w-14" />
        <span className="bg-varak h-2 w-2 rotate-45" />
      </div>

    </section>
  );
}
