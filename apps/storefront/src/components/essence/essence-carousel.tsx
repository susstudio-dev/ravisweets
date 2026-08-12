'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpecimenMark, shapeForTitle, type SpecimenShape } from '@/components/brand/specimen-mark';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { cn } from '@/lib/cn';

export interface EssencePiece {
  no: string;
  name: string;
  line: string;
  technique: string;
  heritage: string;
  fresh: boolean;
  /** Flavour ink — must stay luminous, these sit on the carbon register. */
  ink: string;
  shape?: SpecimenShape;
}

/**
 * THE ESSENCE CAROUSEL — a real 3D coverflow, in CSS.
 *
 * WHY NOT three.js: ~600KB into a static export for a page with no 3D models
 * and, today, not one photograph — every image URL in the catalogue is still
 * empty. A perspective projection with rotateY and translateZ is genuinely
 * three-dimensional, costs nothing beyond `motion` (already a dependency), and
 * composites on the GPU. When photography lands it drops into the same frame.
 *
 * ── THE RULE THAT SHAPES THIS COMPONENT ────────────────────────────────────
 * NO BODY TEXT INSIDE A ROTATED PLANE. Text on a 3D-transformed element is
 * rasterised at its projected size and resampled, so it goes soft — the exact
 * "cheap carousel" tell. The cards therefore carry only a number, a figure and
 * a name; every word a visitor actually reads lives in the static panel below
 * the stage, which crossfades and is never transformed.
 *
 * WINDOWED: only |offset| <= 3 is mounted. Ten cards each with their own
 * transform, shadow and blur is real work on a mid-range phone, and the far
 * ones are invisible behind their neighbours anyway.
 *
 * REDUCED MOTION gets the flat grid — not a crippled carousel with the
 * animation switched off, which would leave a drag-only control that cannot be
 * dragged. The grid is the honest equivalent: same content, no illusion.
 *
 * KEYBOARD is first-class: the stage is a listbox-ish group with arrow-key
 * navigation, Home/End, and the numbered rail doubles as direct access. A
 * carousel you can only swipe is a carousel half the audience cannot use.
 */
export function EssenceCarousel({ pieces }: { pieces: EssencePiece[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const count = pieces.length;
  const go = useCallback(
    (next: number) => setActive(Math.max(0, Math.min(count - 1, next))),
    [count],
  );

  // Arrow keys only while the stage owns focus — a global listener would
  // hijack arrows from the page and from the numbered rail's own buttons.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((i) => Math.min(count - 1, i + 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActive(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActive(count - 1);
      }
    }
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [count]);

  const current = pieces[active]!;

  if (reduced) return <FlatGrid pieces={pieces} />;

  return (
    <div>
      {/* ── THE STAGE ───────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="The ten pieces"
        className="focus-visible:ring-theme-accent/60 relative h-[19rem] select-none overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 md:h-[23rem]"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 45%' }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragEnd={(_, info) => {
            // Velocity as well as distance: a quick flick should advance even
            // when the finger barely travelled.
            if (info.offset.x < -60 || info.velocity.x < -450) go(active + 1);
            else if (info.offset.x > 60 || info.velocity.x > 450) go(active - 1);
          }}
        >
          {pieces.map((piece, i) => {
            const offset = i - active;
            if (Math.abs(offset) > 3) return null;
            const abs = Math.abs(offset);
            const isActive = offset === 0;
            return (
              <motion.button
                key={piece.no}
                type="button"
                onClick={() => go(i)}
                // Only the active card is a tab stop; the rail below is the
                // keyboard route to the others, so Tab does not walk ten cards.
                tabIndex={isActive ? 0 : -1}
                aria-label={`Piece ${piece.no}, ${piece.name}${isActive ? ' — showing' : ''}`}
                aria-current={isActive}
                className="absolute left-1/2 top-1/2 h-[15rem] w-[10.5rem] cursor-pointer rounded-lg md:h-[18rem] md:w-[13rem]"
                initial={false}
                animate={{
                  x: `calc(-50% + ${offset * 58}%)`,
                  y: '-50%',
                  z: -abs * 130,
                  rotateY: offset * -34,
                  scale: isActive ? 1 : 0.88 - abs * 0.04,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.26,
                }}
                transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
                style={{ zIndex: 10 - abs, transformStyle: 'preserve-3d' }}
              >
                <PieceCard piece={piece} active={isActive} index={i} />
              </motion.button>
            );
          })}
        </motion.div>

        <StageEdgeFade />
      </div>

      {/* ── ARROWS + THE NUMBERED RAIL ──────────────────────────────── */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <RailArrow
          label="Previous piece"
          onClick={() => go(active - 1)}
          disabled={active === 0}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </RailArrow>

        {/* The rail IS the index — "eaten in order, 01 to 10" is the drop's
            own concept, so the control that selects a piece states its rank. */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {pieces.map((piece, i) => {
            const on = i === active;
            return (
              <button
                key={piece.no}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show piece ${piece.no}, ${piece.name}`}
                aria-current={on}
                className={cn(
                  'field-value focus-visible:ring-theme-accent min-h-[34px] min-w-[34px] rounded-md border px-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2',
                  on
                    ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                    : 'text-theme-ink/60 hover:text-theme-ink border-[color:var(--color-border)]',
                )}
              >
                {piece.no}
              </button>
            );
          })}
        </div>

        <RailArrow
          label="Next piece"
          onClick={() => go(active + 1)}
          disabled={active === count - 1}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </RailArrow>
      </div>

      {/* ── THE READING PANEL ───────────────────────────────────────── */}
      {/* Outside the perspective container on purpose — see the header note on
          text in rotated planes. This is where the words stay crisp. */}
      <div className="mt-8 min-h-[11rem]" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.no}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="field-label">
              {current.no} of {String(count).padStart(2, '0')}
              <span className="mx-2 opacity-40" aria-hidden="true">
                ·
              </span>
              {current.fresh ? 'Fresh · Hyderabad' : 'Travels nationwide'}
            </p>
            <h3 className="font-display text-theme-ink mt-2 text-2xl leading-tight md:text-3xl">
              {current.name}
            </h3>
            <p className="text-theme-ink/70 mx-auto mt-3 max-w-xl leading-relaxed">
              {current.line}
            </p>
            <dl className="mx-auto mt-5 grid max-w-md grid-cols-2 border-y border-[color:var(--color-rule)]">
              <div className="py-3">
                <dt className="field-label">Technique</dt>
                <dd className="field-value text-theme-ink mt-1 text-xs">{current.technique}</dd>
              </div>
              <div className="border-l border-[color:var(--color-rule)] py-3 pl-4">
                <dt className="field-label">Heritage</dt>
                <dd className="field-value text-theme-ink mt-1 text-xs">{current.heritage}</dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── PIECES ─────────────────────────────────────────────────────────────── */

function PieceCard({
  piece,
  active,
  index,
}: {
  piece: EssencePiece;
  active: boolean;
  index: number;
}) {
  const shape = piece.shape ?? shapeForTitle(piece.name, index);
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border p-4 transition-shadow duration-300',
        active
          ? 'border-theme-accent/45 shadow-lifted'
          : 'border-[color:var(--color-border)] shadow-soft',
      )}
      style={{
        // A vertical wash in the piece's own ink — the card reads as the
        // sweet's colour without pretending to be a photograph of it.
        background: `linear-gradient(160deg, ${piece.ink}2E 0%, ${piece.ink}0F 42%, transparent 78%), var(--color-surface)`,
      }}
    >
      <span
        className="field-value absolute left-3 top-3 text-[11px] font-bold"
        style={{ color: piece.ink }}
      >
        {piece.no}
      </span>
      {piece.fresh && (
        <span
          className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: piece.ink }}
          aria-hidden="true"
        />
      )}
      <SpecimenMark shape={shape} color={piece.ink} className="h-16 w-16 md:h-20 md:w-20" />
      <p className="font-display text-theme-ink px-1 text-center text-[13px] font-semibold leading-snug md:text-sm">
        {piece.name}
      </p>
    </div>
  );
}

/** Softens the stage edges so cards leave the frame instead of being cut. */
function StageEdgeFade() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[color:var(--theme-base)] to-transparent md:w-28"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[color:var(--theme-base)] to-transparent md:w-28"
      />
    </>
  );
}

function RailArrow({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-theme-ink/70 hover:text-theme-ink focus-visible:ring-theme-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[color:var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/**
 * The reduced-motion equivalent: the same ten pieces, all readable at once,
 * no perspective and no transitions. Also what the page renders on the server,
 * so the manifest is in the static HTML for a crawler either way.
 */
function FlatGrid({ pieces }: { pieces: EssencePiece[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {pieces.map((piece, i) => (
        <li key={piece.no}>
          <article
            className="flex h-full flex-col rounded-lg border border-[color:var(--color-border)] p-5"
            style={{
              background: `linear-gradient(160deg, ${piece.ink}24 0%, transparent 60%), var(--color-surface)`,
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="field-value text-lg font-bold" style={{ color: piece.ink }}>
                {piece.no}
              </span>
              <span className="field-label">
                {piece.fresh ? 'Fresh · Hyderabad' : 'Travels nationwide'}
              </span>
            </div>
            <SpecimenMark
              shape={piece.shape ?? shapeForTitle(piece.name, i)}
              color={piece.ink}
              className="mx-auto my-4 h-14 w-14"
            />
            <h3 className="font-display text-theme-ink text-base leading-snug">{piece.name}</h3>
            <p className="text-theme-ink/65 mt-2 text-[13px] leading-relaxed">{piece.line}</p>
            <dl className="mt-auto pt-4">
              <div className="field-row">
                <dt className="field-label">Technique</dt>
                <dd className="field-value text-right text-xs">{piece.technique}</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Heritage</dt>
                <dd className="field-value text-right text-xs">{piece.heritage}</dd>
              </div>
            </dl>
          </article>
        </li>
      ))}
    </ul>
  );
}
