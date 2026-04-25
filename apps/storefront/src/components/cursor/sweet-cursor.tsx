'use client';

import { useEffect, useRef, useState } from 'react';
import { MousePointer2, X } from 'lucide-react';

/**
 * Sweet Cursor — turn your mouse pointer into a jalebi, laddoo, kaju katli,
 * halwa, or murukku. Floats bottom-right, persists choice to localStorage,
 * applies the cursor at the document-element level so user-agent cursors
 * (pointer on links, text on inputs) still win where they should.
 */

type SweetId = 'off' | 'jalebi' | 'laddoo' | 'katli' | 'halwa' | 'murukku';

interface SweetOption {
  id: Exclude<SweetId, 'off'>;
  label: string;
  /** Inline SVG body (32x32). Cursor hotspot defaults to 16,16. */
  svg: string;
}

const STORAGE_KEY = 'ravi.cursor.v1';

const SHADOW =
  '<filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="0.7" flood-color="#1a0a02" flood-opacity="0.45"/></filter>';

const SWEETS: SweetOption[] = [
  {
    id: 'jalebi',
    label: 'Jalebi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${SHADOW}<g filter="url(#s)" fill="none" stroke="#d76420" stroke-width="2.4" stroke-linecap="round"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="7"/><circle cx="16" cy="16" r="3.2"/></g></svg>`,
  },
  {
    id: 'laddoo',
    label: 'Laddoo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${SHADOW}<g filter="url(#s)"><circle cx="16" cy="16" r="11" fill="#e8a338"/><circle cx="12" cy="12" r="1.4" fill="#9a5e10"/><circle cx="19" cy="13" r="1.4" fill="#9a5e10"/><circle cx="14" cy="19" r="1.4" fill="#9a5e10"/><circle cx="20" cy="20" r="1.4" fill="#9a5e10"/><circle cx="17" cy="16" r="1.2" fill="#9a5e10"/><ellipse cx="12" cy="11" rx="3" ry="1.6" fill="#fff" opacity="0.32"/></g></svg>`,
  },
  {
    id: 'katli',
    label: 'Kaju Katli',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${SHADOW}<g filter="url(#s)"><polygon points="16,4 28,16 16,28 4,16" fill="#f4ebd0" stroke="#b9bcc1" stroke-width="1.8"/><polygon points="16,8 24,16 16,24 8,16" fill="none" stroke="#fff" stroke-width="0.7" opacity="0.65"/></g></svg>`,
  },
  {
    id: 'halwa',
    label: 'Halwa',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${SHADOW}<g filter="url(#s)"><path d="M6 16 Q 5 7, 14 5 Q 24 4, 27 13 Q 28 23, 19 27 Q 8 28, 6 19 Z" fill="#a83a1c"/><ellipse cx="12" cy="11" rx="3.2" ry="1.6" fill="#fff" opacity="0.42"/><circle cx="22" cy="20" r="1.2" fill="#fbe89c"/></g></svg>`,
  },
  {
    id: 'murukku',
    label: 'Murukku',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${SHADOW}<g filter="url(#s)" fill="none" stroke="#c79324" stroke-width="2" stroke-linecap="round"><path d="M16 6 Q 26 6, 26 16 Q 26 26, 16 26 Q 6 26, 6 16 Q 6 9, 13 9 Q 22 9, 22 16 Q 22 22, 16 22 Q 11 22, 11 16 Q 11 13, 16 13 Q 19 13, 19 16"/></g></svg>`,
  },
];

const HOTSPOT_X = 16;
const HOTSPOT_Y = 16;

function cursorValueFor(svg: string): string {
  // url-encode the SVG so it survives in a CSS data URI
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `url("data:image/svg+xml;utf8,${encoded}") ${HOTSPOT_X} ${HOTSPOT_Y}, auto`;
}

export function SweetCursor() {
  const [active, setActive] = useState<SweetId>('off');
  const [open, setOpen] = useState(false);
  const initialised = useRef(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SweetId | null;
      if (stored && (stored === 'off' || SWEETS.some((s) => s.id === stored))) {
        setActive(stored);
      }
    } catch {
      /* ignore */
    } finally {
      initialised.current = true;
    }
  }, []);

  // Apply cursor to document element. Only persist after the initial hydrate
  // so we don't overwrite stored value with the default 'off'.
  useEffect(() => {
    const el = document.documentElement;
    if (active === 'off') {
      el.style.cursor = '';
    } else {
      const sweet = SWEETS.find((s) => s.id === active);
      if (sweet) el.style.cursor = cursorValueFor(sweet.svg);
    }
    if (initialised.current) {
      try {
        localStorage.setItem(STORAGE_KEY, active);
      } catch {
        /* ignore */
      }
    }
    return () => {
      // Clean up on unmount so dev hot-reloads don't leave stale cursors.
      el.style.cursor = '';
    };
  }, [active]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label="Choose your sweet cursor"
          className="flex w-64 flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-4 shadow-lifted"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
              Pick your sweet
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close cursor picker"
              className="rounded-full p-1 text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-theme-ink/65">
            Turn your cursor into one of our sweets. Saved to this browser.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SWEETS.map((s) => {
              const selected = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  aria-pressed={selected}
                  aria-label={`Use ${s.label} cursor`}
                  className={
                    'group flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ' +
                    (selected
                      ? 'border-theme-accent bg-theme-glow/15 text-theme-accent shadow-soft'
                      : 'border-[color:var(--color-border)] bg-surface text-theme-ink/70 hover:-translate-y-0.5 hover:border-theme-accent hover:text-theme-accent')
                  }
                >
                  <span
                    aria-hidden="true"
                    className="block h-8 w-8"
                    dangerouslySetInnerHTML={{ __html: s.svg }}
                  />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setActive('off')}
            aria-pressed={active === 'off'}
            className={
              'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ' +
              (active === 'off'
                ? 'border-theme-ink bg-theme-ink text-[color:var(--theme-base)]'
                : 'border-theme-ink/25 text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent')
            }
          >
            Use default cursor
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close cursor picker' : 'Sweet cursor — pick a sweet'}
        title="Sweet cursor — make your pointer a sweet"
        className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#c0592b] to-[#8a3a10] pl-2 pr-4 text-[color:var(--theme-base)] shadow-lifted ring-2 ring-[#fff5d4]/40 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[#fff5d4]/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-glow"
      >
        {/* Soft pulsing halo so the button reads 'interactive' even on first paint */}
        {!open && active === 'off' && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-theme-glow/30"
            style={{ animationDuration: '2.6s' }}
          />
        )}
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#fff5d4]/95 text-[#3a1505] shadow-soft">
          {active !== 'off' ? (
            <span
              aria-hidden="true"
              className="block h-7 w-7"
              dangerouslySetInnerHTML={{
                __html: SWEETS.find((s) => s.id === active)?.svg ?? '',
              }}
            />
          ) : (
            <MousePointer2 className="h-5 w-5 -rotate-12" aria-hidden="true" />
          )}
        </span>
        <span className="relative font-display text-xs font-semibold uppercase tracking-[0.18em]">
          {active === 'off' ? 'Sweet cursor' : SWEETS.find((s) => s.id === active)?.label}
        </span>
      </button>
    </div>
  );
}
