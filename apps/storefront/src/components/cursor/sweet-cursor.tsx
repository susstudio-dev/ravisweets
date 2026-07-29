'use client';

import { useEffect, useRef, useState } from 'react';
import { MousePointer2 } from 'lucide-react';

import { ANJEER_PISTA } from '@/lib/theme/palette';

/**
 * Katli Cursor — turn your mouse pointer into the signature katli cut.
 *
 * Was five per-context sweets (jalebi, laddoo, katli, halwa, murukku), each a
 * data: URI with brass hex baked into it. A data URI cannot read a CSS custom
 * property, so those marks could never follow the theme — they were a second,
 * frozen brand living inside a string. Now there is one mark, the 45-degree
 * katli diamond, and its colours are composed at module scope from the palette
 * module, so the cursor changes when the brand does rather than in spite of it.
 *
 * Floats bottom-right, persists the on/off choice to localStorage, and applies
 * the cursor at the document-element level so user-agent cursors (pointer on
 * links, text on inputs) still win where they should.
 */

const STORAGE_KEY = 'ravi.cursor.v1';

/**
 * The katli mark, built from the light register's authored tokens.
 *
 * Pista field with a varak edge and a varak-rule score line: the same three
 * colours the katli device uses everywhere else in the system. The light
 * register is the source here because a cursor is a single bitmap for the whole
 * document — it cannot re-render per section — and this combination stays
 * legible over both the cream ground and the bidri gunmetal one.
 */
const KATLI_FIELD = ANJEER_PISTA.field;
const KATLI_EDGE = ANJEER_PISTA.varak;
const KATLI_SCORE = ANJEER_PISTA.varakRule;
const KATLI_SHADOW = ANJEER_PISTA.ink;

/** The cut itself, single-sourced so the cursor and the on-screen mark agree. */
const KATLI_EDGE_POINTS = '16,3.5 28.5,16 16,28.5 3.5,16';
const KATLI_SCORE_POINTS = '16,9 23,16 16,23 9,16';

/** 32x32 so it stays crisp at the 2x cursor sizes browsers ask for. */
const KATLI_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">',
  '<filter id="katliShadow" x="-50%" y="-50%" width="200%" height="200%">',
  `<feDropShadow dx="0" dy="1" stdDeviation="0.7" flood-color="${KATLI_SHADOW}" flood-opacity="0.45"/>`,
  '</filter>',
  '<g filter="url(#katliShadow)">',
  `<polygon points="${KATLI_EDGE_POINTS}" fill="${KATLI_FIELD}" stroke="${KATLI_EDGE}" stroke-width="1.8" stroke-linejoin="miter"/>`,
  `<polygon points="${KATLI_SCORE_POINTS}" fill="none" stroke="${KATLI_SCORE}" stroke-width="0.8" opacity="0.7"/>`,
  '</g>',
  '</svg>',
].join('');

/**
 * The same mark as React nodes, for the button face. Drawn rather than injected
 * so nothing on this page needs dangerouslySetInnerHTML; it skips the drop
 * shadow because it sits on a known flat ground.
 */
function KatliMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <polygon
        points={KATLI_EDGE_POINTS}
        fill={KATLI_FIELD}
        stroke={KATLI_EDGE}
        strokeWidth="1.8"
        strokeLinejoin="miter"
      />
      <polygon
        points={KATLI_SCORE_POINTS}
        fill="none"
        stroke={KATLI_SCORE}
        strokeWidth="0.8"
        opacity="0.7"
      />
    </svg>
  );
}

const HOTSPOT_X = 16;
const HOTSPOT_Y = 16;

/** url-encode the SVG so it survives in a CSS data URI (this escapes `#` too). */
const KATLI_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent(KATLI_SVG)
  .replace(/'/g, '%27')
  .replace(/"/g, '%22')}") ${HOTSPOT_X} ${HOTSPOT_Y}, auto`;

export function SweetCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const initialised = useRef(false);

  // Detect touch / coarse-pointer devices — custom CSS cursors don't apply
  // there, so the toggle is just noise on mobile.
  useEffect(() => {
    const mql = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsTouch(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Hydrate from localStorage on mount. Anything other than 'off' counts as on,
  // so a browser holding a retired sweet id ('jalebi', 'halwa', …) keeps its
  // custom cursor and simply gets the katli mark instead.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEnabled(stored !== 'off');
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
    el.style.cursor = enabled ? KATLI_CURSOR : '';
    if (initialised.current) {
      try {
        localStorage.setItem(STORAGE_KEY, enabled ? 'katli' : 'off');
      } catch {
        /* ignore */
      }
    }
    return () => {
      // Clean up on unmount so dev hot-reloads don't leave stale cursors.
      el.style.cursor = '';
    };
  }, [enabled]);

  if (isTouch) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 print:hidden">
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        aria-label={
          enabled ? 'Turn off the katli cursor' : 'Turn your pointer into a kaju katli'
        }
        title="Katli cursor — make your pointer a kaju katli"
        className="shadow-lifted focus-visible:ring-varak group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-theme-accent pl-2 pr-4 text-[color:var(--theme-base)] ring-2 ring-varak/40 transition-all duration-300 hover:-translate-y-0.5 hover:ring-varak/80 focus-visible:outline-none focus-visible:ring-4"
      >
        {/* Soft pulsing halo so the button reads 'interactive' even on first paint */}
        {!enabled && (
          <span
            aria-hidden="true"
            className="bg-field/30 absolute inset-0 animate-ping rounded-full"
            style={{ animationDuration: '2.6s' }}
          />
        )}
        <span className="shadow-soft bg-theme-base text-theme-accent relative flex h-10 w-10 items-center justify-center rounded-full">
          {enabled ? (
            <KatliMark className="block h-7 w-7" />
          ) : (
            <MousePointer2 className="h-5 w-5 -rotate-12" aria-hidden="true" />
          )}
        </span>
        <span className="font-display relative text-xs uppercase tracking-[0.18em]">
          Katli cursor
        </span>
      </button>
    </div>
  );
}
