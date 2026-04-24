'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { TEMPLATES, type TemplateId } from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface TemplatePickerProps {
  activeTemplateId: TemplateId;
  itemsDirty: boolean;
  onPick: (id: TemplateId) => void;
}

const ORDER: TemplateId[] = ['essence', 'premium', 'grande', 'blank'];

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
      <fieldset className="mt-8">
        <legend className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          Start from a template
        </legend>
        <div className="grid gap-3 md:grid-cols-4">
          {ORDER.map((id) => {
            const t = TEMPLATES[id];
            const active = id === activeTemplateId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleClick(id)}
                aria-pressed={active}
                className={cn(
                  'group relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  active
                    ? 'border-theme-accent bg-theme-glow/15 shadow-soft'
                    : 'border-[color:var(--color-border)] bg-surface-elevated hover:-translate-y-0.5 hover:border-theme-accent hover:shadow-soft',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold text-theme-ink">{t.title}</p>
                  <span className="rounded-full bg-theme-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
                    {t.tagline}
                  </span>
                </div>
                <p className="text-xs text-theme-ink/70">{t.description}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  {t.items.length} items · {t.startingUnits}+ units
                </p>
              </button>
            );
          })}
        </div>
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
