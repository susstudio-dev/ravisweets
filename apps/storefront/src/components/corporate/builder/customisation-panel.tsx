'use client';

import { Clock3, Type } from 'lucide-react';
import {
  RIBBON_SWATCHES,
  BOX_FINISHES,
  type RibbonColor,
  type BoxFinish,
} from '@ravisweets/shared';
import { cn } from '@/lib/cn';

const MESSAGE_MAX = 240;

interface CustomisationPanelProps {
  ribbon: RibbonColor;
  box: BoxFinish;
  logoPrint: boolean;
  message: string;
  onRibbonChange: (v: RibbonColor) => void;
  onBoxChange: (v: BoxFinish) => void;
  onLogoToggle: (v: boolean) => void;
  onMessageChange: (v: string) => void;
}

export function CustomisationPanel({
  ribbon,
  box,
  logoPrint,
  message,
  onRibbonChange,
  onBoxChange,
  onLogoToggle,
  onMessageChange,
}: CustomisationPanelProps) {
  const overLimit = message.length > MESSAGE_MAX;

  return (
    <section
      aria-labelledby="custom-heading"
      className="flex flex-col gap-5 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
    >
      <h2
        id="custom-heading"
        className="font-display text-lg font-semibold text-theme-ink"
      >
        Customise
      </h2>

      {/* Ribbon */}
      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          Ribbon colour
        </legend>
        <div className="flex flex-wrap gap-2">
          {RIBBON_SWATCHES.map((r) => {
            const active = r.id === ribbon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onRibbonChange(r.id)}
                aria-pressed={active}
                aria-label={`Ribbon colour: ${r.label}`}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  active
                    ? 'border-theme-accent ring-2 ring-theme-accent/30'
                    : 'border-[color:var(--color-border)] hover:-translate-y-0.5',
                )}
                title={r.label}
              >
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: r.hex }} />
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Box finish */}
      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          Box finish
        </legend>
        <div className="flex flex-col gap-2">
          {BOX_FINISHES.map((f) => {
            const active = f.id === box;
            return (
              <label
                key={f.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                  active
                    ? 'border-theme-accent bg-theme-glow/10'
                    : 'border-[color:var(--color-border)] bg-surface hover:-translate-y-0.5 hover:border-theme-accent',
                )}
              >
                <input
                  type="radio"
                  name="box"
                  value={f.id}
                  checked={active}
                  onChange={() => onBoxChange(f.id)}
                  className="mt-1 h-4 w-4 text-theme-accent focus:ring-theme-accent"
                />
                <div>
                  <p className="text-sm font-semibold text-theme-ink">{f.label}</p>
                  <p className="text-xs text-theme-ink/60">{f.sub}</p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Logo print */}
      <div>
        <label className="flex items-start gap-2 text-sm text-theme-ink">
          <input
            type="checkbox"
            checked={logoPrint}
            onChange={(e) => onLogoToggle(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[color:var(--color-border)] text-theme-accent focus:ring-theme-accent"
          />
          <span>
            <span className="font-semibold">Logo printing</span>
            <span className="ml-1 text-xs text-theme-ink/60">— our design team prints your logo on the packaging</span>
          </span>
        </label>
        {logoPrint && (
          <p className="ml-6 mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-900">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            Adds 10 business days to lead time
          </p>
        )}
      </div>

      {/* Personalised message */}
      <div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
            <Type className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Personalised message (optional)
          </span>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value.slice(0, MESSAGE_MAX))}
            placeholder="A short message printed on the enclosed card."
            rows={3}
            className={cn(
              'rounded-xl border bg-surface px-3 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2',
              overLimit
                ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/30'
                : 'border-[color:var(--color-border)] focus-visible:border-theme-accent focus-visible:ring-theme-accent/30',
            )}
          />
          <span
            className={cn(
              'text-[11px] font-medium tabular-nums',
              overLimit ? 'text-red-700' : 'text-theme-ink/50',
            )}
          >
            {message.length}/{MESSAGE_MAX}
          </span>
        </label>
      </div>
    </section>
  );
}
