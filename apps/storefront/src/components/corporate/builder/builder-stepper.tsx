'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';

export type BuilderStep = 'template' | 'compose' | 'customise' | 'review';

export const STEP_ORDER: BuilderStep[] = ['template', 'compose', 'customise', 'review'];

export const STEP_LABEL: Record<BuilderStep, { num: string; title: string; sub: string }> = {
  template: { num: '1', title: 'Start', sub: 'Pick a template or start blank' },
  compose: { num: '2', title: 'Compose', sub: 'Choose what goes in the box' },
  customise: { num: '3', title: 'Customise', sub: 'Ribbon, finish, message, units' },
  review: { num: '4', title: 'Review', sub: 'Confirm and submit as enquiry' },
};

interface BuilderStepperProps {
  current: BuilderStep;
  onJump: (step: BuilderStep) => void;
  /** Steps the user has visited — used to enable jumping back without forward jumps. */
  visited: Set<BuilderStep>;
}

export function BuilderStepper({ current, onJump, visited }: BuilderStepperProps) {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <nav
      aria-label="Builder steps"
      className="mt-8 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-3"
    >
      <ol className="grid gap-2 md:grid-cols-4">
        {STEP_ORDER.map((step, i) => {
          const meta = STEP_LABEL[step];
          const isCurrent = i === idx;
          const isDone = i < idx;
          const isVisited = visited.has(step);
          const enabled = isVisited || i <= idx;
          return (
            <li key={step} className="relative">
              <button
                type="button"
                onClick={() => enabled && onJump(step)}
                disabled={!enabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                  isCurrent && 'bg-theme-accent text-[color:var(--theme-base)] shadow-soft',
                  !isCurrent && enabled && 'hover:bg-theme-glow/15',
                  !enabled && 'cursor-not-allowed opacity-55',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isCurrent && 'bg-[color:var(--theme-base)] text-theme-accent',
                    !isCurrent && isDone && 'bg-theme-accent text-[color:var(--theme-base)]',
                    !isCurrent && !isDone && 'border border-[color:var(--color-border)] bg-surface text-theme-ink/70',
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : meta.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[10px] font-semibold uppercase tracking-[0.18em]',
                      isCurrent ? 'text-[color:var(--theme-base)]/80' : 'text-theme-ink/55',
                    )}
                  >
                    Step {meta.num}
                  </span>
                  <span
                    className={cn(
                      'block truncate font-display text-sm font-semibold',
                      isCurrent ? 'text-[color:var(--theme-base)]' : 'text-theme-ink',
                    )}
                  >
                    {meta.title}
                  </span>
                </span>
                {isCurrent && (
                  <motion.span
                    layoutId="stepper-active"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl ring-2 ring-theme-accent"
                    transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 px-1 text-xs text-theme-ink/65">{STEP_LABEL[current].sub}</p>
    </nav>
  );
}
