'use client';

import { useEffect, useState } from 'react';
import { Box as BoxIcon, RotateCw, Smartphone, X } from 'lucide-react';

/**
 * 3D pack-preview for gift / festival hampers.
 *
 * Earlier iteration loaded Google's `<model-viewer>` with a sample
 * Astronaut.glb — that was misleading. Until the brand commissions a real
 * hamper GLB (Shapr3D / Reality Composer Pro), we render a CSS-3D
 * brass-and-silk gift box illustration so the experience reads as
 * "preview of your hamper", not "random astronaut".
 *
 * Once the hamper.glb + hamper.usdz files exist, swap this for a
 * `<model-viewer>` mount and pass them in via the `glb` / `usdz` props.
 */

interface HamperARPreviewProps {
  /** GLB URL — Android + desktop. Optional placeholder while real model is in production. */
  glb?: string;
  /** USDZ URL — iOS Quick Look. Optional. */
  usdz?: string;
  /** Caption rendered under the viewer. */
  caption: string;
  /** Hex backdrop for the viewer. */
  bg?: string;
  /** Brass/accent colour for the box wrap. Falls back to the brand brass. */
  accent?: string;
  /** Glow / ribbon highlight colour. */
  glow?: string;
}

export function HamperARPreview({
  caption,
  bg = '#fbf3df',
  accent = '#a8501f',
  glow = '#e9b249',
}: HamperARPreviewProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border-2 border-theme-accent bg-theme-glow/15 px-4 py-2 text-sm font-semibold text-theme-accent transition-all hover:-translate-y-0.5 hover:bg-theme-glow/30 hover:shadow-soft"
      >
        <BoxIcon className="h-4 w-4" aria-hidden="true" />
        Preview the hamper in 3D
        <RotateCw className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-90" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close 3D preview"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#1a0a02]/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="3D product preview"
            className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface-elevated shadow-lifted"
          >
            <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                  Hamper · 3D preview
                </p>
                <p className="font-display text-base font-semibold text-theme-ink">
                  {caption}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-theme-glow/20 text-theme-ink/65 hover:bg-theme-glow/35"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div
              className="relative aspect-[4/3] w-full overflow-hidden"
              style={{ background: `radial-gradient(ellipse at 50% 30%, ${glow}40 0%, ${bg} 70%)` }}
            >
              <CssGiftBox accent={accent} glow={glow} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[15%] left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-full"
                style={{
                  background: `radial-gradient(ellipse, ${accent}55 0%, transparent 70%)`,
                  filter: 'blur(8px)',
                }}
              />
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--color-border)] bg-theme-glow/10 px-5 py-3 text-[11px] text-theme-ink/65">
              <span>
                <Smartphone className="mr-1 inline h-3 w-3" aria-hidden="true" />
                AR placement unlocks once the brand&rsquo;s real hamper model is shot.
              </span>
              <span className="font-semibold text-theme-accent">
                CSS · WebGL-free · Reduced-motion safe
              </span>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function CssGiftBox({ accent, glow }: { accent: string; glow: string }) {
  const SIZE = 220;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: '1100px' }}
    >
      <div
        className="relative motion-safe:animate-[spinY_18s_linear_infinite]"
        style={{
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-18deg) rotateY(-25deg)',
        }}
      >
        <Face accent={accent} glow={glow} transform={`translateZ(${SIZE / 2}px)`} />
        <Face accent={accent} glow={glow} transform={`rotateY(180deg) translateZ(${SIZE / 2}px)`} />
        <Face accent={accent} glow={glow} transform={`rotateY(90deg) translateZ(${SIZE / 2}px)`} side />
        <Face accent={accent} glow={glow} transform={`rotateY(-90deg) translateZ(${SIZE / 2}px)`} side />
        <Face accent={accent} glow={glow} transform={`rotateX(90deg) translateZ(${SIZE / 2}px)`} top />
        <Face accent={accent} glow={glow} transform={`rotateX(-90deg) translateZ(${SIZE / 2}px)`} bottom />

        <Ribbon orientation="vertical" size={SIZE} glow={glow} />
        <Ribbon orientation="horizontal" size={SIZE} glow={glow} />

        <Bow size={SIZE} glow={glow} accent={accent} />
      </div>

      <style>{`
        @keyframes spinY {
          from { transform: rotateX(-18deg) rotateY(-25deg); }
          to   { transform: rotateX(-18deg) rotateY(335deg); }
        }
      `}</style>
    </div>
  );
}

function Face({
  accent,
  glow,
  transform,
  top,
  bottom,
  side,
}: {
  accent: string;
  glow: string;
  transform: string;
  top?: boolean;
  bottom?: boolean;
  side?: boolean;
}) {
  const gradient = top
    ? `linear-gradient(135deg, ${shade(accent, 18)} 0%, ${accent} 60%, ${shade(accent, -10)} 100%)`
    : bottom
    ? `linear-gradient(135deg, ${shade(accent, -25)} 0%, ${shade(accent, -15)} 100%)`
    : side
    ? `linear-gradient(180deg, ${shade(accent, 5)} 0%, ${shade(accent, -10)} 100%)`
    : `linear-gradient(180deg, ${shade(accent, 12)} 0%, ${accent} 60%, ${shade(accent, -8)} 100%)`;

  return (
    <div
      className="absolute inset-0 rounded-md"
      style={{
        background: gradient,
        transform,
        boxShadow: `inset 0 0 30px ${shade(accent, -25)}88, inset 0 2px 0 ${glow}33`,
        backfaceVisibility: 'hidden',
      }}
    />
  );
}

function Ribbon({
  orientation,
  size,
  glow,
}: {
  orientation: 'vertical' | 'horizontal';
  size: number;
  glow: string;
}) {
  const RIBBON_W = 28;
  const halfSize = size / 2;
  const isVertical = orientation === 'vertical';

  return (
    <>
      {[0, 90, 180, 270].map((deg) => (
        <div
          key={`${orientation}-${deg}`}
          className="absolute"
          style={{
            top: isVertical ? 0 : `calc(50% - ${RIBBON_W / 2}px)`,
            left: isVertical ? `calc(50% - ${RIBBON_W / 2}px)` : 0,
            width: isVertical ? `${RIBBON_W}px` : `${size}px`,
            height: isVertical ? `${size}px` : `${RIBBON_W}px`,
            background: `linear-gradient(${isVertical ? '90deg' : '180deg'}, ${shade(
              glow,
              -8,
            )} 0%, ${glow} 50%, ${shade(glow, -10)} 100%)`,
            transform: isVertical
              ? `rotateY(${deg}deg) translateZ(${halfSize + 0.5}px)`
              : `rotateX(${deg}deg) translateZ(${halfSize + 0.5}px)`,
            boxShadow: `0 0 8px ${shade(glow, -5)}66`,
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </>
  );
}

function Bow({ size, glow, accent }: { size: number; glow: string; accent: string }) {
  const halfSize = size / 2;
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: '74px',
        height: '52px',
        transform: `translate(-50%, -50%) translateY(-${halfSize - 4}px) rotateX(90deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {[-1, 1].map((s) => (
        <div
          key={s}
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: s < 0 ? '0' : 'auto',
            right: s > 0 ? '0' : 'auto',
            width: '34px',
            height: '34px',
            borderRadius: '50% 50% 50% 0',
            background: `linear-gradient(135deg, ${glow} 0%, ${shade(glow, -12)} 100%)`,
            transform: `rotate(${s < 0 ? -25 : 25}deg) skewX(${s < 0 ? -10 : 10}deg)`,
            boxShadow: `inset 0 0 6px ${shade(accent, -25)}55`,
          }}
        />
      ))}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '14px',
          height: '20px',
          borderRadius: '4px',
          background: `linear-gradient(180deg, ${glow}, ${shade(glow, -18)})`,
          boxShadow: `inset 0 0 4px ${shade(accent, -30)}66`,
        }}
      />
    </div>
  );
}

function shade(hex: string, amt: number): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return hex;
  const r = parseInt(m[0]!, 16);
  const g = parseInt(m[1]!, 16);
  const b = parseInt(m[2]!, 16);
  const adjust = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amt / 100) * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
}

// Back-compat exports — kept (now empty) so existing call sites compile.
// When a real GLB ships, fill these in and switch the modal back to <model-viewer>.
export const SAMPLE_HAMPER_GLB = '';
export const SAMPLE_HAMPER_USDZ = '';
