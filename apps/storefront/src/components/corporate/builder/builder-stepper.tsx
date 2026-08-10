'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

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

/**
 * Numbered docket-head strips: each step is a ruled section head on the form,
 * the current one underlined in the stamp accent. No pills, no floating card —
 * the stepper is part of the paperwork.
 */
export function BuilderStepper({ current, onJump, visited }: BuilderStepperProps) {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <nav aria-label="Builder steps" className="mt-8">
      <ol className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
        {STEP_ORDER.map((step, i) => {
          const meta = STEP_LABEL[step];
          const isCurrent = i === idx;
          const isDone = i < idx;
          const isVisited = visited.has(step);
          const enabled = isVisited || i <= idx;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => enabled && onJump(step)}
                disabled={!enabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-full items-baseline gap-2.5 border-b-2 px-1 pb-2.5 pt-2 text-left transition-colors duration-200',
                  isCurrent ? 'border-theme-accent' : 'border-[color:var(--color-rule)]',
                  enabled && !isCurrent && 'hover:border-theme-accent/60',
                  !enabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <span
                  className={cn(
                    'field-value text-sm',
                    isCurrent ? 'text-theme-accent font-bold' : 'text-text-muted',
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : meta.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('field-label block', isCurrent && 'text-theme-accent')}>
                    Step {meta.num}
                  </span>
                  <span className="font-display text-theme-ink block truncate text-sm">
                    {meta.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="text-text-muted mt-2 px-1 text-xs">{STEP_LABEL[current].sub}</p>
    </nav>
  );
}
