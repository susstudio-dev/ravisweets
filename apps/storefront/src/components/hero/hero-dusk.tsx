'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/components/motion/reveal';
import { Grain } from '@/components/brand/grain';
import { ShopScene } from '@/components/hero/shop-scene';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';

/**
 * The hero: a full-viewport Shop at Dusk scene with the headline overlaid.
 *
 * The section opts into the dusk register, so every token inside is the dark
 * palette — cream ink on plum sky, marigold CTAs — with zero component-level
 * colour. It pulls up under the transparent header (negative top margin), so
 * the scene owns the whole first viewport. Scrolling scales the scene gently
 * toward the door (the "walk in"): one scroll-linked transform, pointer-fine
 * desktop only, gated at render time on reduced motion. The headline's
 * word-stagger is pure CSS (`.ss-word`), so the LCP element paints before
 * hydration. The DB-driven text contract is identical to the previous hero:
 * 8 fields, same `??` precedence, headline re-animates on admin edit via key.
 */

const FOUNDED = '1983';

export function HeroDusk() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { hero } = useSiteContent();
  const { active: theme } = useActiveTheme();

  /*
   * NOT MOUNTED ANYWHERE (checked 2026-08-12 — nothing imports HeroDusk;
   * app/page.tsx renders HeroBatch). Same reasoning as hero-still.tsx: the
   * defaults are kept current because a dead file is where retired copy comes
   * back from. This one held the most of it — a Telugu eyebrow naming the town,
   * the locality headline, and the Hyderabadi CTA. If neither dusk hero is
   * coming back, delete both files and shop-scene.tsx with them.
   */
  /* `||` not `??` on the Indic mark: the preset's `eyebrow` is now normally
     BLANK, and `??` would pass that empty string through and drop the Telugu.
     See the fuller note in hero-batch.tsx. */
  const heroEyebrowIndic =
    hero?.eyebrowIndic || theme?.hero.eyebrow?.split('·')[0]?.trim() || 'రవి స్వీట్స్';
  /* No English descriptor — owner, 2026-08-12. */
  const heroEyebrowEn = hero?.eyebrowEn ?? theme?.hero.eyebrow ?? '';
  const heroHeadline =
    hero?.headline ?? theme?.hero.headline ?? 'Made this morning. Nothing added to make it last.';
  const heroBody =
    hero?.body ??
    theme?.hero.body ??
    'Kaju Katli, Gulab Jamun, Motichoor Ladoo — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.';
  const primaryCtaLabel = hero?.primaryCtaLabel ?? theme?.hero.ctaLabel ?? "Shop today's sweets";
  const primaryCtaHref = hero?.primaryCtaHref ?? theme?.hero.ctaHref ?? '/shop';
  const secondaryCtaLabel = hero?.secondaryCtaLabel ?? 'Corporate gifting';
  const secondaryCtaHref = hero?.secondaryCtaHref ?? '/corporate';

  // Walk-in eligibility: pointer-fine desktop. The reduced-motion gate is
  // applied at render time below (never latched in state), so an OS toggle
  // mid-session takes effect immediately.
  const [walkIn, setWalkIn] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px) and (pointer: fine)');
    const update = () => setWalkIn(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // The only scroll-linked motion in the hero: the scene eases toward the
  // door as you scroll past — you step in, nothing else competes.
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 46]);

  const words = heroHeadline.split(/(\s+)/);

  return (
    <section
      ref={ref}
      aria-label="Hero"
      data-register="dusk"
      className="bg-theme-base text-theme-ink relative isolate -mt-16 h-[100svh] min-h-[600px] overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        className="ss-soft pointer-events-none absolute inset-0"
        style={
          walkIn && !reduced
            ? { scale: sceneScale, y: sceneY, willChange: 'transform' }
            : undefined
        }
      >
        <ShopScene />
      </motion.div>

      <div className="container-site relative z-10 flex h-full flex-col justify-center pb-[42svh] pt-24 md:pb-24 md:pt-28">
        <div className="max-w-[620px] md:max-w-[min(620px,52%)]">
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

          {/* CSS word-stagger, not JS: the headline is the LCP element and
              must paint (and start rising) before hydration. Keyed on the
              headline so admin edits re-run the entrance. */}
          <h1
            key={heroHeadline}
            aria-label={heroHeadline}
            className="font-display text-display-lg text-theme-ink mt-6"
          >
            {words.map((u, i) =>
              /^\s+$/.test(u) ? (
                <span key={i}>{u}</span>
              ) : (
                <span
                  key={i}
                  aria-hidden="true"
                  className="ss-word"
                  style={{ animationDelay: `${0.2 + i * 0.045}s` }}
                >
                  {u}
                </span>
              ),
            )}
          </h1>

          <Reveal delay={0.25}>
            <p className="text-text-muted mt-5 max-w-[46ch] text-base leading-relaxed md:text-lg">
              {heroBody}
            </p>
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
