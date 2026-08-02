'use client';

/**
 * The Shop at Dusk — the hero's backdrop and the brand's organising image.
 *
 * An illustrated Khammam storefront at golden hour: plum dusk sky, stars
 * coming out, a rose-striped awning, marigold garland, three display windows
 * blooming with lamplight one after another, and steam rising from the
 * kitchen side. Pure CSS/SVG-free markup — every colour derives from the dusk
 * register's tokens (see the `.ss-*` block in globals.css), so the scene
 * re-themes with admin presets and adds zero hex to the colour ratchet.
 *
 * Choreography lives entirely in CSS: an entrance sequence on mount (shop
 * rises → awning unrolls → sign settles → windows light one-by-one → garland
 * drops), then slow desynchronised ambient loops (twinkle, sway, breathe,
 * steam, fireflies, drifting petals). The global prefers-reduced-motion rule
 * freezes all of it to a still illustration — which is the deliberate
 * fallback, not an afterthought.
 *
 * Spec: docs/superpowers/specs/2026-07-31-shop-at-dusk-redesign-design.md §3.
 */

/** Garland dots hang on a shallow catenary; offsets are % of the strip. */
const GARLAND_DOTS = [
  { left: '1%', top: '0%' },
  { left: '12%', top: '38%' },
  { left: '23%', top: '66%' },
  { left: '34%', top: '84%' },
  { left: '45.5%', top: '92%' },
  { left: '57%', top: '84%' },
  { left: '68%', top: '66%' },
  { left: '79%', top: '38%' },
  { left: '90%', top: '0%' },
] as const;

/** Star field: hand-placed so the constellation clears the headline zone. */
const STARS: ReadonlyArray<{ left: string; top: string; far?: boolean }> = [
  { left: '6%', top: '9%' },
  { left: '14%', top: '22%', far: true },
  { left: '24%', top: '7%' },
  { left: '38%', top: '16%', far: true },
  { left: '52%', top: '6%' },
  { left: '63%', top: '19%' },
  { left: '74%', top: '9%', far: true },
  { left: '85%', top: '15%' },
  { left: '93%', top: '26%', far: true },
];

/** Tiny sweets on the window shelves — shape says mithai, not detail. */
function WindowPane({ variant }: { variant: 0 | 1 | 2 }) {
  return (
    <div className="ss-win">
      <div className="ss-shelf" style={{ top: '30%' }} />
      <div className="ss-shelf" style={{ top: '62%' }} />
      {variant === 0 && (
        <>
          <div className="ss-sweet ss-sweet--diamond" style={{ left: '14%', top: '12%' }} />
          <div className="ss-sweet ss-sweet--round" style={{ left: '56%', top: '14%' }} />
          <div className="ss-sweet" style={{ left: '30%', top: '44%' }} />
          <div className="ss-sweet ss-sweet--round" style={{ left: '62%', top: '46%' }} />
        </>
      )}
      {variant === 1 && (
        <>
          <div className="ss-sweet ss-sweet--round" style={{ left: '18%', top: '13%' }} />
          <div className="ss-sweet" style={{ left: '58%', top: '12%' }} />
          <div className="ss-sweet ss-sweet--diamond" style={{ left: '24%', top: '45%' }} />
          <div className="ss-sweet" style={{ left: '60%', top: '47%' }} />
        </>
      )}
      {variant === 2 && (
        <>
          <div className="ss-sweet" style={{ left: '16%', top: '14%' }} />
          <div className="ss-sweet ss-sweet--diamond" style={{ left: '56%', top: '13%' }} />
          <div className="ss-sweet ss-sweet--round" style={{ left: '28%', top: '46%' }} />
          <div className="ss-sweet ss-sweet--diamond" style={{ left: '64%', top: '44%' }} />
        </>
      )}
    </div>
  );
}

export function ShopScene() {
  return (
    <div className="ss-stage" aria-hidden="true">
      <div className="ss-sky" />
      <div className="ss-moon" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className={s.far ? 'ss-star ss-star--far' : 'ss-star'}
          style={{ left: s.left, top: s.top }}
        />
      ))}
      <div className="ss-horizon" />

      <div className="ss-shop">
        <div className="ss-sign">
          <span className="font-display text-theme-ink block text-[clamp(0.8rem,1.1vw,1rem)] leading-tight tracking-[0.08em]">
            RAVI SWEETS
          </span>
          <span className="font-indic text-theme-accent block text-[clamp(0.5rem,0.65vw,0.65rem)] tracking-[0.28em]">
            ఖమ్మం · SINCE 1985
          </span>
        </div>

        <div className="ss-body">
          <div className="ss-awning" />
          <div className="ss-garland">
            {GARLAND_DOTS.map((d, i) => (
              <span key={i} className="ss-mg" style={{ left: d.left, top: d.top }} />
            ))}
          </div>
          <div className="ss-windows">
            <WindowPane variant={0} />
            <WindowPane variant={1} />
            <WindowPane variant={2} />
          </div>
          <div className="ss-door" />
        </div>
        <div className="ss-doorglow" />

        {/* steam curls off the kitchen side of the roofline */}
        <div className="absolute -top-2 left-[12%]">
          <span className="ss-steam" />
          <span className="ss-steam" style={{ left: 10 }} />
          <span className="ss-steam" style={{ left: -8 }} />
        </div>
      </div>

      <span className="ss-firefly" style={{ left: '22%', bottom: '22%' }} />
      <span className="ss-firefly" style={{ left: '68%', bottom: '30%' }} />
      <span className="ss-petal" style={{ left: '30%', top: '0' }} />
      <span className="ss-petal" style={{ left: '74%', top: '0' }} />

      <div className="ss-ground" />
    </div>
  );
}
