'use client';

import { useEffect, useRef, useState } from 'react';
import type { ThemePalette } from '@ravisweets/shared';
import { defaultFlavour } from '@/lib/theme/tokens';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * FlavourAtlas chips swap ONLY the accent + glow CSS variables on hover —
 * never `--theme-base` or `--theme-ink`. This is structurally enforced via
 * the `Pick<ThemePalette, 'accent' | 'glow'>` type so a future contributor
 * can't reintroduce the dark-base hover bug (where, on the Diwali palette,
 * cream `--theme-ink` text landed on still-white card backgrounds and went
 * invisible). Full-palette swaps remain valid on product detail pages where
 * `<ThemeVars>` SSR-seeds every surface coherently.
 */
type HoverPalette = Pick<ThemePalette, 'accent' | 'glow'>;

interface Flavour {
  id: string;
  name: string;
  telugu: string;
  note: string;
  palette: HoverPalette;
}

const FLAVOURS: Flavour[] = [
  { id: 'qubani', name: 'Qubani ka Meetha', telugu: 'ఖుబానీ', note: 'Saffron · Apricot · Malai', palette: { accent: '#c0592b', glow: '#f29f5a' } },
  { id: 'kaju', name: 'Kaju Katli', telugu: 'కాజు', note: 'Cashew · Silver leaf · Cardamom', palette: { accent: '#8a6a2e', glow: '#d6c796' } },
  { id: 'double', name: 'Double ka Meetha', telugu: 'డబుల్', note: 'Pistachio · Rabri · Saffron', palette: { accent: '#8a5a10', glow: '#d4b36a' } },
  { id: 'badam', name: 'Badam ki Jali', telugu: 'బాదాం', note: 'Almond · Ghee · Cardamom', palette: { accent: '#a07024', glow: '#e4c17a' } },
  { id: 'diwali', name: 'Diwali Hamper', telugu: 'దీపావళి', note: 'Saffron · Brass · Gold-leaf', palette: { accent: '#c08a18', glow: '#f2c66f' } },
  { id: 'mixture', name: 'Hyderabadi Mixture', telugu: 'మిక్చర్', note: 'Peanut · Curry leaf · Chilli', palette: { accent: '#8b3a1f', glow: '#d68854' } },
];

function applyHoverPalette(p: HoverPalette) {
  const root = document.documentElement;
  root.style.setProperty('--theme-accent', p.accent);
  root.style.setProperty('--theme-glow', p.glow);
}

function revertHoverPalette() {
  const root = document.documentElement;
  root.style.setProperty('--theme-accent', defaultFlavour.accent);
  root.style.setProperty('--theme-glow', defaultFlavour.glow);
}

export function FlavourAtlas() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  // Revert guard — ensure we always restore defaults on unmount or leave.
  const revertTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (revertTimer.current) window.clearTimeout(revertTimer.current);
      revertHoverPalette();
    };
  }, []);

  function onEnter(f: Flavour) {
    if (revertTimer.current) window.clearTimeout(revertTimer.current);
    setActiveId(f.id);
    applyHoverPalette(f.palette);
  }

  function onLeaveAll() {
    // Small debounce so moving between chips doesn't flicker
    if (revertTimer.current) window.clearTimeout(revertTimer.current);
    revertTimer.current = window.setTimeout(() => {
      setActiveId(null);
      revertHoverPalette();
    }, 120);
  }

  return (
    <section aria-labelledby="atlas-heading" className="container-site py-20 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
        <Reveal>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Flavour atlas
            </p>
            <h2
              id="atlas-heading"
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              Hover a sweet.{' '}
              <span className="italic text-theme-accent">Watch our accents take on its flavour.</span>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-theme-ink/70 md:text-lg">
            {reduced
              ? 'Each sweet carries its own palette — saffron amber for Qubani, pistachio green for Double ka Meetha, brass-gold for a Diwali hamper. (Motion reduced for you.)'
              : 'Each sweet carries its own palette — saffron amber for Qubani, pistachio green for Double ka Meetha, brass-gold for a Diwali hamper. Hover one and the accent colour, paisleys, and call-to-actions retune around it. Move away to return to the house tone.'}
          </p>
        </Reveal>
      </div>

      <div
        className="mt-12 flex flex-wrap gap-3"
        onPointerLeave={onLeaveAll}
        onBlur={onLeaveAll}
      >
        {FLAVOURS.map((f) => {
          const isActive = activeId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onPointerEnter={() => onEnter(f)}
              onFocus={() => onEnter(f)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full border-2 px-5 py-3 text-sm font-medium text-theme-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
              style={{
                borderColor: isActive ? f.palette.accent : 'var(--color-border)',
                background: isActive
                  ? `linear-gradient(135deg, color-mix(in oklab, ${f.palette.glow} 18%, var(--surface-elevated)), var(--surface-elevated))`
                  : 'var(--surface-elevated)',
                boxShadow: isActive ? `0 8px 28px -10px ${f.palette.accent}66` : undefined,
              }}
              aria-pressed={isActive}
            >
              <span
                className="h-3 w-3 rounded-full ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-125"
                style={{
                  background: `linear-gradient(135deg, ${f.palette.accent}, ${f.palette.glow})`,
                }}
                aria-hidden="true"
              />
              <span className="font-display text-base">{f.name}</span>
              <span
                className="hidden text-sm font-normal text-theme-ink/60 md:inline"
                style={{ fontFamily: 'var(--font-indic)' }}
              >
                {f.telugu}
              </span>
              <span className="hidden text-[11px] uppercase tracking-wider text-theme-ink/50 lg:inline">
                {f.note}
              </span>
            </button>
          );
        })}
      </div>

      <Reveal delay={0.2}>
        <p className="mt-8 text-xs text-theme-ink/50">
          Move your cursor away to return to the house tone. Every product page is tuned the same
          way.
        </p>
      </Reveal>
    </section>
  );
}
