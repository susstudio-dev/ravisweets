'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CheckCircle2, Gift, Package, Sparkles, Star } from 'lucide-react';
import { TEMPLATES, type TemplateId } from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

interface TemplatePickerProps {
  activeTemplateId: TemplateId;
  itemsDirty: boolean;
  onPick: (id: TemplateId) => void;
}

const ORDER: TemplateId[] = ['essence', 'premium', 'grande', 'blank'];

const TEMPLATE_VISUAL: Record<
  TemplateId,
  {
    icon: typeof Gift;
    accent: string;
    glow: string;
    pattern: 'minimal' | 'rich' | 'signature' | 'blank';
    badge: string;
  }
> = {
  essence: {
    icon: Package,
    accent: '#7a9a5e',
    glow: '#cfe1b8',
    pattern: 'minimal',
    badge: 'STARTER',
  },
  premium: {
    icon: Gift,
    accent: '#b8312c',
    glow: '#f2b96a',
    pattern: 'rich',
    badge: 'BESTSELLER',
  },
  grande: {
    icon: Star,
    accent: '#7a3a82',
    glow: '#e3b6e5',
    pattern: 'signature',
    badge: 'SIGNATURE',
  },
  blank: {
    icon: Sparkles,
    accent: '#3a4a5a',
    glow: '#d6dee6',
    pattern: 'blank',
    badge: 'BUILD FROM SCRATCH',
  },
};

export function TemplatePicker({ activeTemplateId, itemsDirty, onPick }: TemplatePickerProps) {
  const [pending, setPending] = useState<TemplateId | null>(null);
  const reduced = useReducedMotion();

  function handleClick(id: TemplateId) {
    if (id === activeTemplateId) return;
    if (itemsDirty) {
      setPending(id);
    } else {
      onPick(id);
    }
  }

  function confirm() {
    if (pending) onPick(pending);
    setPending(null);
  }

  return (
    <>
      {/* Animated hero strip — floating sweets + paisley accents above the cards */}
      <BuilderHero />

      <fieldset className="mt-8">
        <legend className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          <Sparkles className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
          Start from a template
        </legend>
        <Stagger gap={70} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((id) => {
            const t = TEMPLATES[id];
            const visual = TEMPLATE_VISUAL[id];
            const active = id === activeTemplateId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleClick(id)}
                aria-pressed={active}
                className={cn(
                  'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  active
                    ? 'border-theme-accent bg-theme-glow/15 shadow-soft'
                    : 'border-[color:var(--color-border)] bg-surface-elevated hover:-translate-y-1 hover:border-theme-accent hover:shadow-lifted',
                )}
              >
                <div className="absolute right-3 top-3 z-10">
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-soft"
                    style={{ backgroundColor: visual.accent }}
                  >
                    {visual.badge}
                  </span>
                </div>

                {active && (
                  <span className="absolute right-3 top-9 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-theme-accent text-[color:var(--theme-base)] shadow-soft">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}

                {/* Per-template visual illustration */}
                <TemplateVisual
                  pattern={visual.pattern}
                  accent={visual.accent}
                  glow={visual.glow}
                />

                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${visual.accent}18`, color: visual.accent }}
                  >
                    <visual.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-display text-xl font-semibold text-theme-ink">{t.title}</p>
                </div>

                <p className="text-xs leading-relaxed text-theme-ink/70">{t.description}</p>

                <p className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  <span className="font-display text-base text-theme-ink">{t.items.length}</span>
                  items
                  <span aria-hidden="true">·</span>
                  <span className="font-display text-base text-theme-ink">{t.startingUnits}+</span>
                  units
                </p>
              </button>
            );
          })}
        </Stagger>
      </fieldset>

      <AnimatePresence>
        {pending && (
          <motion.div
            key="confirm"
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tpl-confirm-title"
          >
            <button
              type="button"
              aria-label="Cancel"
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setPending(null)}
            />
            <motion.div
              className="relative z-10 max-w-md rounded-3xl border border-[color:var(--color-border)] bg-surface p-6 shadow-lifted"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
            >
              <h2 id="tpl-confirm-title" className="font-display text-xl font-semibold text-theme-ink">
                Replace current hamper?
              </h2>
              <p className="mt-3 text-sm text-theme-ink/75">
                You have items in your hamper. Switching to the{' '}
                <span className="font-semibold text-theme-ink">{TEMPLATES[pending].title}</span>{' '}
                template will replace them.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="rounded-full border border-theme-ink/25 px-4 py-2 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-accent hover:text-theme-accent"
                >
                  Keep current
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  className="rounded-full bg-theme-accent px-4 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
                >
                  Replace
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Decorative animated strip above the template grid — floating motifs. */
function BuilderHero() {
  const reduced = useReducedMotion();
  return (
    <Reveal>
      <div className="relative h-32 overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-gradient-to-br from-theme-glow/25 via-surface-elevated to-theme-accent/10 md:h-40">
        {/* Floating motif row */}
        <div className="absolute inset-0 flex items-center justify-around px-6">
          {['◉', '✦', '❋', '◇', '✦', '◉', '❋'].map((motif, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="font-display text-3xl text-theme-accent/35 md:text-4xl"
              initial={reduced ? { opacity: 0.6 } : { y: 0, opacity: 0.4 }}
              animate={
                reduced
                  ? { opacity: 0.6 }
                  : {
                      y: [0, -8, 0, -4, 0],
                      opacity: [0.35, 0.7, 0.35, 0.55, 0.35],
                    }
              }
              transition={
                reduced
                  ? {}
                  : {
                      duration: 4 + i * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.25,
                    }
              }
            >
              {motif}
            </motion.span>
          ))}
        </div>

        {/* Gradient sheen pass — slow shimmer */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
          initial={{ x: 0 }}
          animate={reduced ? {} : { x: ['0%', '300%'] }}
          transition={
            reduced ? {} : { duration: 6, repeat: Infinity, ease: 'linear', delay: 1 }
          }
          style={{ filter: 'blur(20px)' }}
        />

        <div className="relative z-10 flex h-full items-center justify-between px-6 md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
              Step 1
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-theme-ink md:text-xl">
              Pick the box that fits your story.
            </p>
          </div>
          <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-theme-accent text-[color:var(--theme-base)] shadow-lifted md:flex">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/** Per-template inline SVG illustration of the hamper box. */
function TemplateVisual({
  pattern,
  accent,
  glow,
}: {
  pattern: 'minimal' | 'rich' | 'signature' | 'blank';
  accent: string;
  glow: string;
}) {
  return (
    <div
      className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl"
      style={{ background: `linear-gradient(135deg, ${glow}55 0%, ${accent}10 100%)` }}
    >
      <svg
        viewBox="0 0 160 100"
        className="h-full w-auto motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Box body */}
        <rect x="30" y="40" width="100" height="48" rx="3" fill={accent} />
        <rect x="30" y="40" width="100" height="48" rx="3" fill="url(#bodyShade)" opacity="0.4" />
        {/* Lid */}
        <rect x="26" y="32" width="108" height="14" rx="2" fill={accent} />
        <rect x="26" y="32" width="108" height="14" rx="2" fill="url(#lidShade)" opacity="0.5" />
        {/* Vertical ribbon */}
        <rect x="74" y="32" width="12" height="56" fill={glow} />
        <rect x="74" y="32" width="12" height="56" fill="url(#ribbonShade)" opacity="0.55" />
        {/* Pattern overlays */}
        {pattern === 'rich' && (
          <>
            <circle cx="50" cy="62" r="3" fill={glow} opacity="0.6" />
            <circle cx="60" cy="70" r="2" fill={glow} opacity="0.6" />
            <circle cx="105" cy="60" r="3" fill={glow} opacity="0.6" />
            <circle cx="115" cy="72" r="2" fill={glow} opacity="0.6" />
          </>
        )}
        {pattern === 'signature' && (
          <>
            <path
              d="M 45 60 q 8 -8 16 0 q 8 8 16 0"
              stroke={glow}
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 95 70 q 8 -6 16 0 q 8 6 16 0"
              stroke={glow}
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            {/* Star on top */}
            <path
              d="M 80 24 l 2 4 l 4 1 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 -1 z"
              fill={glow}
              opacity="0.95"
            />
          </>
        )}
        {pattern === 'minimal' && (
          <line
            x1="36"
            y1="64"
            x2="124"
            y2="64"
            stroke={glow}
            strokeWidth="0.6"
            opacity="0.5"
            strokeDasharray="2 3"
          />
        )}
        {pattern === 'blank' && (
          <>
            <line x1="44" y1="58" x2="116" y2="58" stroke={glow} strokeWidth="0.6" opacity="0.4" strokeDasharray="3 4" />
            <line x1="44" y1="68" x2="116" y2="68" stroke={glow} strokeWidth="0.6" opacity="0.4" strokeDasharray="3 4" />
            <line x1="44" y1="78" x2="116" y2="78" stroke={glow} strokeWidth="0.6" opacity="0.4" strokeDasharray="3 4" />
          </>
        )}
        {/* Bow */}
        <path d="M 65 28 q 15 -10 30 0 q -8 6 -15 6 q -7 0 -15 -6 z" fill={glow} />
        <ellipse cx="80" cy="32" rx="3" ry="4" fill={accent} opacity="0.6" />

        <defs>
          <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="lidShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#000" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="ribbonShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
