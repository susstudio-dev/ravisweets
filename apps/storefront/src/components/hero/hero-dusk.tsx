'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Reveal } from '@/components/motion/reveal';
import { Grain } from '@/components/brand/grain';
import { ShopScene } from '@/components/hero/shop-scene';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';

/**
 * The hero: a full-bleed Shop at Dusk scene with the headline overlaid.
 *
 * The section opts into the dusk register, so every token inside is the dark
 * palette — cream ink on plum sky, marigold CTAs — with zero component-level
 * colour. Scrolling scales the whole scene gently toward the door (the
 * "walk in"): one scroll-linked transform, desktop only, disabled under
 * reduced motion. The DB-driven text contract is identical to the previous
 * hero: 8 fields, same `??` precedence, headline re-animates on admin edit.
 */

const FOUNDED = '1985';

export function HeroDusk() {
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

  // The walk-in only runs where it can be smooth and wanted: pointer-fine
  // desktop, no reduced-motion. Mobile gets the simplified static composition.
  const [walkIn, setWalkIn] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const mql = window.matchMedia('(min-width: 768px) and (pointer: fine)');
    const update = () => setWalkIn(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [reduced]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // The only scroll-linked motion in the hero: the scene eases toward the
  // door as you scroll past — you step in, nothing else competes.
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 46]);

  return (
    <section
      ref={ref}
      aria-label="Hero"
      data-register="dusk"
      className="bg-theme-base text-theme-ink relative isolate overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={walkIn ? { scale: sceneScale, y: sceneY } : undefined}
      >
        <ShopScene />
      </motion.div>

      <div className="container-site relative z-10 flex min-h-[92svh] flex-col justify-center pb-[46svh] pt-16 md:pb-24 md:pt-24">
        <div className="max-w-[620px]">
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
            className="font-display text-display-xl text-theme-ink mt-6"
          />

          <Reveal delay={0.25}>
            <p className="text-text-muted mt-6 max-w-[46ch] text-lg leading-relaxed">{heroBody}</p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={primaryCtaHref}
                className="bg-theme-accent ss-cta-glow inline-flex items-center rounded-sm px-7 py-3.5 text-sm font-medium tracking-wide text-[color:var(--theme-base)] transition-[opacity,box-shadow] duration-300 hover:opacity-95"
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

        {/* Brass hairline, closed by a single katli diamond. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 bottom-6 flex items-center gap-3 sm:inset-x-6 lg:inset-x-8"
        >
          <span className="bg-varak-rule h-px flex-1 opacity-60" />
          <span className="bg-varak-rule h-2 w-2 rotate-45" />
        </div>
      </div>

      <Grain />
    </section>
  );
}
