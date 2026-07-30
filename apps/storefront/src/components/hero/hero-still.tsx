'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Reveal } from '@/components/motion/reveal';
import { Grain } from '@/components/brand/grain';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';

/**
 * Placeholder art. There is no production photography yet, so the slot is
 * designed to look deliberate while empty rather than broken: the frame states
 * its own shot brief. Today's asset is a matting artefact — the cutout ate the
 * silver leaf — so it is cropped into the plate rather than presented whole.
 * When the real frame lands, only this URL and the caption change.
 */
const HERO_IMAGE =
  'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png';

/** The katli cut: the 45-degree diamond kaju katli is actually cut into. */
const KATLI_CLIP = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

const FOUNDED = '1985';

const SHOT_BRIEF = 'Kaju katli, macro, raking light — silver leaf needs a specular highlight.';

export function HeroStill() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { hero } = useSiteContent();
  const { active: theme } = useActiveTheme();
  const heroEyebrowIndic =
    hero?.eyebrowIndic ?? theme?.hero.eyebrow?.split('·')[0]?.trim() ?? 'ఖమ్మం';
  const heroEyebrowEn = hero?.eyebrowEn ?? theme?.hero.eyebrow ?? 'Khammam · Telangana';
  const heroHeadline =
    hero?.headline ?? theme?.hero.headline ?? 'The sweetness of Telangana, slow-cooked in Khammam.';
  const heroBody =
    hero?.body ??
    theme?.hero.body ??
    'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.';
  const primaryCtaLabel =
    hero?.primaryCtaLabel ?? theme?.hero.ctaLabel ?? 'Shop Hyderabadi specials';
  const primaryCtaHref =
    hero?.primaryCtaHref ?? theme?.hero.ctaHref ?? '/category/hyderabadi-specials';
  const secondaryCtaLabel = hero?.secondaryCtaLabel ?? 'Corporate gifting';
  const secondaryCtaHref = hero?.secondaryCtaHref ?? '/corporate';

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // The only parallax rate in the hero. One plate, one speed, and nothing else
  // moves against it — layered rates were the tell that this was a template.
  const plateY = useTransform(scrollYProgress, [0, 1], [0, -72]);

  return (
    <section
      ref={ref}
      aria-label="Hero"
      // A 25% marigold wash over cream, not the saturated field: at full
      // strength #E8A13C fails AA for the muted body copy and accent link
      // this section carries. At /25 (measured wash ≈ #F6E0BE) text-muted
      // lands at 5.15:1 and the accent link at 4.93:1 — both clear AA while
      // the section still reads as marigold-warm.
      className="bg-field/25 text-theme-ink relative isolate overflow-hidden"
    >
      <div className="container-site relative pb-12 pt-14 md:pb-16 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
          {/* Copy column */}
          <div className="flex flex-col gap-7">
            <Reveal>
              <p className="text-theme-accent flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-indic text-xl leading-none">{heroEyebrowIndic}</span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className="text-[11px] uppercase tracking-[0.28em]">{heroEyebrowEn}</span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className="text-[11px] uppercase tracking-[0.28em]">{FOUNDED}</span>
              </p>
            </Reveal>

            <TextKinetic
              key={heroHeadline}
              as="h1"
              text={heroHeadline}
              split="word"
              gap={50}
              className="font-display text-display-xl text-theme-ink"
            />

            <Reveal delay={0.2}>
              <p className="text-text-muted max-w-[46ch] text-lg leading-relaxed">{heroBody}</p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-1">
                <Link
                  href={primaryCtaHref}
                  className="bg-theme-accent inline-flex items-center rounded-sm px-7 py-3.5 text-sm tracking-wide text-[color:var(--theme-base)] transition-opacity duration-300 hover:opacity-90"
                >
                  {primaryCtaLabel}
                </Link>
                <Link
                  href={secondaryCtaHref}
                  className="text-theme-ink hover:text-theme-accent decoration-varak-rule text-sm underline underline-offset-[6px] transition-colors duration-300"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Photo slot — a katli-cut plate, not a cutout on a gradient */}
          {/*
            The nudge sits on the <figure>, not on <Reveal>: Reveal is a motion
            element and its inline transform would win over a translate class.
          */}
          <Reveal delay={0.15}>
            <figure className="flex flex-col gap-5 md:translate-x-[5%] lg:translate-x-[8%]">
              <motion.div
                style={reduced ? undefined : { y: plateY }}
                className="relative mx-auto aspect-square w-[84%] max-w-[320px] md:w-full md:max-w-[520px]"
              >
                <div
                  className="bg-field-deep absolute inset-0 overflow-hidden"
                  style={{ clipPath: KATLI_CLIP }}
                >
                  <Image
                    src={HERO_IMAGE}
                    alt="Placeholder art direction: kaju katli cropped into a katli-cut plate, pending production photography"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 520px, (min-width: 768px) 45vw, 84vw"
                    className="origin-[32%_26%] scale-[1.4] object-cover"
                  />
                </div>
                {/* Brass hairline drawn on the cut, so the stroke stays 1px at any plate size. */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="text-varak-rule absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <polygon
                    points="50,0 100,50 50,100 0,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </motion.div>

              <figcaption className="mx-auto flex max-w-[38ch] flex-col gap-1.5 text-center">
                <span className="text-theme-accent text-[10px] uppercase tracking-[0.28em]">
                  Shot brief
                </span>
                <span className="text-text-muted text-xs leading-relaxed">{SHOT_BRIEF}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Brass hairline, closed by a single katli diamond. */}
        <div aria-hidden="true" className="mt-14 flex items-center gap-3 md:mt-20">
          <span className="bg-varak-rule h-px flex-1" />
          <span className="bg-varak-rule h-2 w-2 rotate-45" />
        </div>
      </div>

      <Grain />
    </section>
  );
}
