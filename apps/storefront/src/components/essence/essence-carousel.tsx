'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpecimenMark, shapeForTitle, type SpecimenShape } from '@/components/brand/specimen-mark';
import { contrastRatio, mix } from '@/lib/theme/contrast';
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
 * and, today, not one photograph of these ten pieces — they do not exist
 * outside VAULT_10_PLAN.md. A perspective projection with rotateY and
 * translateZ is genuinely three-dimensional, costs nothing beyond `motion`
 * (already a dependency), and composites on the GPU.
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
 * dragged. The grid is the honest equivalent: same content, no illusion, and
 * no autoplay.
 *
 * KEYBOARD is first-class: the stage is a listbox-ish group with arrow-key
 * navigation, Home/End, and the numbered rail doubles as direct access. A
 * carousel you can only swipe is a carousel half the audience cannot use.
 *
 * ── THE 2026-08-24 RESHAPE (owner feedback, verbatim intent) ───────────────
 * "Lot of text in the top … no focus on the product; the cards can be
 * scrolled with mouse scroll; the cards should be there left and right
 * initially; in the right we can bring the details of it clearly." Hence:
 *
 *   - TWO COLUMNS at lg: the stage owns the left, and the reading panel is a
 *     ruled right-hand column instead of a strip under the stage — the words
 *     sit beside the deck at eye level, never below the fold.
 *   - STARTS IN THE MIDDLE of the drop, not at piece 01, so the fan opens
 *     with cards to BOTH sides. Order is unharmed — the rail still counts
 *     01–10 and Home/End still jump to the ends.
 *   - THE WHEEL DRIVES THE DECK. Scrolling over the stage steps the fan one
 *     card per beat; at either end the wheel falls through to the page, so
 *     this never becomes an unbounded scroll trap. deltaX is honoured too,
 *     so a trackpad's horizontal swipe does what it looks like it should.
 *     (A mount "deal" animation shipped with this reshape and was reverted
 *     the same day — see the initial={false} note on the cards.)
 *
 * ── AUTOPLAY, AND WHEN IT STOPS ────────────────────────────────────────────
 * Owner request 2026-08-13: the carousel should move on its own. It advances
 * every 4.5s and wraps 10 -> 01.
 *
 * It PAUSES while the pointer is over the stage, while focus is anywhere
 * inside, mid-drag, and whenever the tab is hidden — a carousel that keeps
 * cycling in a background tab is burning a phone battery to animate nothing.
 *
 * It STOPS, permanently, the moment the visitor makes a deliberate choice:
 * a card, a rail number, an arrow, an arrow key or a completed drag. Once
 * somebody has taken the wheel the page does not take it back.
 *
 * The explicit pause/play button is not decoration — WCAG 2.2.2 requires a
 * mechanism to stop motion that auto-updates and runs for more than five
 * seconds, and hover/focus pausing does not cover a touch visitor. It doubles
 * as the way back: once autoplay has stopped, it is the control that restarts
 * it.
 */

/** One beat. Long enough to read a name, short enough to feel alive. */
const AUTOPLAY_MS = 4500;

export function EssenceCarousel({
  pieces,
  price,
  cta,
}: {
  pieces: EssencePiece[];
  /** e.g. "₹2,400" — shown in the reading panel so the terms sit with the piece. */
  price?: string;
  /** The waitlist action, so a visitor never has to leave the fan to act. */
  cta?: { href: string; label: string };
}) {
  const reduced = useReducedMotion();
  // The fan opens mid-drop so cards spread to BOTH sides (2026-08-24).
  const [active, setActive] = useState(() => Math.floor((pieces.length - 1) / 2));
  const stageRef = useRef<HTMLDivElement>(null);

  // Autoplay is one intent (`playing`) gated by four transient conditions.
  // Keeping them apart matters: leaving the stage must resume only if the
  // visitor never took over, and taking over must survive a pointer leave.
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const count = pieces.length;

  /** Clamped: the arrows disable at the ends, so manual movement must not wrap. */
  const go = useCallback(
    (next: number) => setActive(Math.max(0, Math.min(count - 1, next))),
    [count],
  );

  /** Every deliberate move goes through here, and every deliberate move stops autoplay. */
  const take = useCallback(
    (next: number) => {
      setPlaying(false);
      go(next);
    },
    [go],
  );

  // Arrow keys only while the stage owns focus — a global listener would
  // hijack arrows from the page and from the numbered rail's own buttons.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    function onKey(e: KeyboardEvent) {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      setPlaying(false);
      if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setActive((i) => Math.min(count - 1, i + 1));
      else if (e.key === 'Home') setActive(0);
      else setActive(count - 1);
    }
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [count]);

  /*
   * THE WHEEL DRIVES THE DECK (owner, 2026-08-24: "the cards can be scrolled
   * with mouse scroll"). Attached natively with { passive: false } — React's
   * root-level wheel listeners are passive, so an onWheel prop could never
   * call preventDefault.
   *
   * WHAT IT CLAIMS, AND WHAT IT NEVER TOUCHES. Reviewed adversarially
   * 2026-08-24; every rule below answers a confirmed defect:
   *
   *   - ctrlKey wheels are ZOOM (trackpad pinch and Ctrl+wheel both arrive
   *     this way) and are never claimed — preventDefault on them is exactly
   *     the mechanism that suppresses browser zoom, and a low-vision visitor
   *     enlarging the page must win over a carousel every time.
   *   - deltaMode is normalised per mode: pixels pass through, lines scale so
   *     one Firefox notch (3 lines) is one step, and PAGE mode (deltaY ±1) is
   *     one step per notch outright — untreated it contributed ~1px toward
   *     the threshold while still being swallowed, a true scroll trap.
   *   - Past either end the event is DECLINED and the page scrolls — except
   *     inside a short grace window after the final step, because the same
   *     trackpad gesture that lands on the last card keeps emitting inertia
   *     deltas, and falling through mid-gesture flings the page the visitor
   *     never meant to scroll. A fresh gesture at a resting boundary scrolls
   *     normally.
   *   - Honesty note: mid-deck, wheel-over-stage IS captive by design (the
   *     owner asked for the wheel to drive the cards); the beat lock is short
   *     and both ends release, so the capture is bounded at a few seconds of
   *     deliberate traversal, and keyboard/rail/arrows remain untrapped.
   *
   * The accumulator + beat lock turn continuous deltas into discrete card
   * steps: 60px of intent per step, one step per 350ms, and the accumulator
   * resets when the direction flips so a wobble never banks credit toward
   * the wrong side. The active index is read through a ref — the listener
   * would otherwise close over a stale `active`.
   */
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const STEP = 60;
    const BEAT_MS = 350;
    const END_GRACE_MS = 300;
    let acc = 0;
    let lockUntil = 0;
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) return; // zoom gesture — never the deck's business
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (raw === 0) return;
      const delta =
        e.deltaMode === 2
          ? Math.sign(raw) * STEP // page mode: one notch, one step
          : raw * (e.deltaMode === 1 ? 30 : 1); // lines -> px (one 3-line notch ≈ one step)
      const now = performance.now();
      const next = activeRef.current + (delta > 0 ? 1 : -1);
      if (next < 0 || next >= pieces.length) {
        // Inertia from the gesture that just reached this end stays swallowed;
        // a fresh gesture at a resting boundary scrolls the page.
        if (now < lockUntil + END_GRACE_MS) e.preventDefault();
        acc = 0;
        return;
      }
      e.preventDefault();
      if (now < lockUntil) return;
      if (Math.sign(acc) !== Math.sign(delta)) acc = 0;
      acc += delta;
      if (Math.abs(acc) >= STEP) {
        acc = 0;
        lockUntil = now + BEAT_MS;
        setPlaying(false); // a hand on the wheel is a hand on the wheel
        setActive(next);
      }
    }
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [pieces.length]);

  // A hidden tab should not be animating. `visibilitychange` is read once on
  // mount too, in case the component hydrates in an already-background tab.
  useEffect(() => {
    const sync = () => setTabHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const running = playing && !hovering && !focused && !dragging && !tabHidden && !reduced;

  useEffect(() => {
    if (!running) return;
    // Wraps, unlike `go` — an autoplay that stopped dead at piece 10 would look
    // like a bug rather than a decision.
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [running, count]);

  const current = pieces[active]!;

  if (reduced) return <FlatGrid pieces={pieces} />;

  return (
    /*
     * The fan and its words, side by side (owner, 2026-08-24: "in the right
     * we can bring the details of it clearly"). Below lg the panel drops
     * under the rail, which is the same reading order linearised.
     */
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12">
      <div className="min-w-0">
        {/* ── THE STAGE ───────────────────────────────────────────────── */}
        <div
          ref={stageRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="The ten pieces"
          // `pointerType` guard: on a touch screen `pointerenter` fires on tap and
          // never gets its matching leave, which would pause autoplay for good on
          // exactly the devices that cannot hover.
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHovering(false)}
          // React's onFocus/onBlur map to focusin/focusout, so these are
          // focus-WITHIN semantics and cover the cards and the stage alike.
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Taller than the strip layout it replaced: the headline above gave
          // back a display step, and the stage is what the page is FOR.
          className="focus-visible:ring-theme-accent/60 relative h-[20rem] select-none overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 md:h-[26rem]"
          style={{ perspective: '1400px', perspectiveOrigin: '50% 45%' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragStart={() => setDragging(true)}
            onDragEnd={(_, info) => {
              setDragging(false);
              // Velocity as well as distance: a quick flick should advance even
              // when the finger barely travelled.
              if (info.offset.x < -60 || info.velocity.x < -450) take(active + 1);
              else if (info.offset.x > 60 || info.velocity.x > 450) take(active - 1);
              else setPlaying(false); // a drag that went nowhere is still a hand on the wheel
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
                  onClick={() => take(i)}
                  // Only the active card is a tab stop; the rail below is the
                  // keyboard route to the others, so Tab does not walk ten cards.
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`Piece ${piece.no}, ${piece.name}${isActive ? ' — showing' : ''}`}
                  aria-current={isActive}
                  className="absolute left-1/2 top-1/2 h-[15rem] w-[10.5rem] cursor-pointer rounded-lg md:h-[18rem] md:w-[13rem]"
                  /*
                   * initial={false} is LOAD-BEARING, twice over. (1) motion
                   * serialises the initial pose into the SSR HTML, so anything
                   * other than the animate pose here blanks the static
                   * export's stage until hydration. (2) Cards mount and
                   * unmount as the ±3 window slides, and there is no exit
                   * animation — a mount pose replays on every jump ≥2 (rail,
                   * Home/End, the autoplay wrap 10→01), which read as the fan
                   * blinking empty and re-dealing. A "deal" entrance was
                   * tried on 2026-08-24 and reverted for exactly these two
                   * failures — do not reintroduce one without an AnimatePresence
                   * exit story and an SSR-safe gate.
                   */
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
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <RailArrow
            label="Previous piece"
            onClick={() => take(active - 1)}
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
                  onClick={() => take(i)}
                  aria-label={`Show piece ${piece.no}, ${piece.name}`}
                  aria-current={on}
                  className={cn(
                    'field-value focus-visible:ring-theme-accent relative min-h-[34px] min-w-[34px] overflow-hidden rounded-md border px-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2',
                    on
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : 'text-theme-ink/60 hover:text-theme-ink border-[color:var(--color-border)]',
                  )}
                >
                  {piece.no}
                  {/*
                  The beat, made visible. Keyed on `active` so it restarts with
                  every advance, and unmounted whenever autoplay is not actually
                  running — a bar that kept filling while paused would be a lie
                  about what happens next.
                */}
                  {on && running && (
                    <motion.span
                      key={active}
                      aria-hidden="true"
                      className="bg-[color:var(--theme-base)]/70 absolute inset-x-0 bottom-0 h-[2px] origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <RailArrow
            label="Next piece"
            onClick={() => take(active + 1)}
            disabled={active === count - 1}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </RailArrow>

          {/* WCAG 2.2.2 — and the only way back once autoplay has been stopped. */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the carousel' : 'Play the carousel'}
            aria-pressed={playing}
            className="text-theme-ink/70 hover:text-theme-ink focus-visible:ring-theme-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[color:var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── THE READING PANEL — the right column ─────────────────────── */}
      {/* Outside the perspective container on purpose — see the header note on
          text in rotated planes. This is where the words stay crisp. A ruled
          left edge marks it as the fan's record.

          The live region wraps ONLY the crossfade. The price/CTA block below
          is a sibling on purpose: aria-atomic re-announces the whole region
          on every advance, and with the CTA inside it a screen reader heard
          "Join the waitlist · ₹2,400 · the box of ten" appended to every
          piece, every 4.5 seconds of autoplay.

          The min-height sits on the live wrapper and is sized for the
          TALLEST entry at each breakpoint (long names wrap to two lines, long
          `line`s to three on a phone) — undersize it and the CTA below pumps
          up and down on every beat, moving under a thumb mid-tap. */}
      <div className="lg:border-l lg:border-[color:var(--color-rule)] lg:pl-10">
        <div
          className="min-h-[19rem] sm:min-h-[17rem] lg:min-h-[18rem]"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.no}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
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
              <p className="text-theme-ink/70 mx-auto mt-3 max-w-xl leading-relaxed lg:mx-0">
                {current.line}
              </p>
              <dl className="mx-auto mt-5 grid max-w-md grid-cols-2 border-y border-[color:var(--color-rule)] lg:mx-0">
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

        {/*
          The drop's terms and the one action, WITH the details rather than a
          screen below them. Outside the crossfade so they never blink per
          piece, and outside the live region so they are announced once,
          not on every advance.
        */}
        {(price || cta) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start">
            {cta && (
              <a href={cta.href} target="_blank" rel="noreferrer" className="stamp">
                {cta.label}
              </a>
            )}
            {price && (
              <p className="field-value text-theme-ink text-sm font-bold">
                {price} · THE BOX OF TEN
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PIECES ─────────────────────────────────────────────────────────────── */

/*
 * THE PLATE AND THE RECORD.
 *
 * These ten sweets have no photographs and will not get any before the drop is
 * made, so the card carries the piece's FLAVOUR as a colour object instead —
 * owner decision 2026-08-13, taken over borrowing a shot of a different sweet.
 *
 * The structure is the house grammar, the same one ProductCard uses: the plate
 * on top, the record underneath. What changed on 2026-08-13 is the plate. It
 * used to be the ink at 18% and 6% alpha over the surface, which on the carbon
 * register is a tint you have to be told about — the owner read the whole
 * carousel as grey. It is now the ink at full strength, lit from the top left
 * and deepened at the bottom right, with a radial glow behind the figure and
 * the house grain over it to stop the gradient banding.
 *
 * Everything that must stay READABLE sits on the record below the plate, on the
 * carbon ground, in theme tokens. The only text on the colour itself is the
 * two-digit number, and that picks its own foreground by contrast ratio.
 */

/** Candidates for text sitting ON a flavour ink. Both are house values. */
const ON_INK_DARK = '#1A1714';
const ON_INK_LIGHT = '#F7F1E4';

/**
 * The readable foreground for a given ink, by WCAG contrast rather than by eye.
 *
 * Two of the ten inks are near-white (#EFE3C8 Living Rabri, #B9BCC4 Til Noir),
 * so a hardcoded light foreground would have set cream on cream. Measured
 * rather than assumed, because the ink list is meant to be edited — a future
 * drop can add a deep one and this keeps working.
 *
 * `contrast.ts` is dependency-free on purpose: it is imported into the client
 * bundle, and culori is design tooling, not a runtime dependency.
 */
function onInk(ink: string): string {
  return contrastRatio(ink, ON_INK_DARK) >= contrastRatio(ink, ON_INK_LIGHT)
    ? ON_INK_DARK
    : ON_INK_LIGHT;
}

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
  const fg = onInk(piece.ink);

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden rounded-lg border transition-shadow duration-300',
        active
          ? 'border-theme-accent/45 shadow-lifted'
          : 'shadow-soft border-[color:var(--color-border)]',
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        // The neighbours pull back so the centre card is unmistakably the
        // subject — the scale and opacity in the stage animation say "further
        // away", this says "not the one you are reading".
        filter: active ? undefined : 'saturate(0.72)',
      }}
    >
      {/* ── THE PLATE ── the piece's ink, as an object with a light on it. */}
      <div className="relative flex-[1.45] overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(152deg, ${mix(piece.ink, '#FFFFFF', 0.2)} 0%, ${piece.ink} 44%, ${mix(piece.ink, '#000000', 0.34)} 100%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(72% 58% at 50% 44%, ${mix(piece.ink, '#FFFFFF', 0.34)} 0%, transparent 70%)`,
          }}
        />
        {/* Tiled SVG turbulence, already in globals.css and already blend-mode
            corrected for the carbon register. Free material, no new asset. */}
        <span aria-hidden="true" className="grain-overlay" />

        <SpecimenMark
          shape={shape}
          color={fg}
          className="absolute left-1/2 top-1/2 h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 opacity-90 md:h-[5.5rem] md:w-[5.5rem]"
        />

        <span
          className="field-value absolute left-3 top-2.5 text-[11px] font-bold"
          style={{ color: fg }}
        >
          {piece.no}
        </span>
        {piece.fresh && (
          <span
            className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: fg, opacity: 0.8 }}
            aria-hidden="true"
          />
        )}

        {/* The lit edge. Reads as a physical tile rather than a CSS fill. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)' }}
        />
      </div>

      {/* ── THE RECORD ── on the carbon ground, in theme tokens, always legible. */}
      <div className="flex flex-1 items-center justify-center border-t border-[color:var(--color-border)] px-3 py-2.5">
        <p className="font-display text-theme-ink text-center text-[13px] font-semibold leading-snug md:text-sm">
          {piece.name}
        </p>
      </div>
    </div>
  );
}

/** Softens the stage edges so cards leave the frame instead of being cut.
 *  Narrower than the strip-era md:w-28: the stage now shares the row with the
 *  reading panel, and 7rem of fade a side on a half-width stage was eating the
 *  ±2 cards the two-column fan exists to show. */
function StageEdgeFade() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-[color:var(--theme-base)] to-transparent md:w-16"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-[color:var(--theme-base)] to-transparent md:w-16"
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
 * The reduced-motion equivalent: the same ten pieces, all readable at once, no
 * perspective, no transitions and no autoplay.
 *
 * NOT what the server renders — `useReducedMotion` returns false until its
 * effect runs, so the export contains the carousel and this appears only after
 * hydration on a machine that asked for less motion. The crawler's copy of the
 * ten is the ruled manifest in app/essence/page.tsx, which is server-rendered
 * for exactly that reason. (The previous version of this note claimed
 * otherwise; it was wrong.)
 *
 * It gets the same plate as the carousel. A visitor who has asked for less
 * motion has not asked for less colour.
 */
function FlatGrid({ pieces }: { pieces: EssencePiece[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {pieces.map((piece, i) => {
        const fg = onInk(piece.ink);
        return (
          <li key={piece.no}>
            <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              <div className="relative h-28">
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(152deg, ${mix(piece.ink, '#FFFFFF', 0.2)} 0%, ${piece.ink} 44%, ${mix(piece.ink, '#000000', 0.34)} 100%)`,
                  }}
                />
                <span aria-hidden="true" className="grain-overlay" />
                <SpecimenMark
                  shape={piece.shape ?? shapeForTitle(piece.name, i)}
                  color={fg}
                  className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 opacity-90"
                />
                <span
                  className="field-value absolute left-3 top-2.5 text-[11px] font-bold"
                  style={{ color: fg }}
                >
                  {piece.no}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="field-label">
                  {piece.fresh ? 'Fresh · Hyderabad' : 'Travels nationwide'}
                </span>
                <h3 className="font-display text-theme-ink mt-1.5 text-base leading-snug">
                  {piece.name}
                </h3>
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
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
