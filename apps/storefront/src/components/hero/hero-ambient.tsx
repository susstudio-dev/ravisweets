import type { CSSProperties } from 'react';

/**
 * THE AMBIENT LAYER — continuous quiet motion behind the hero content.
 *
 * Owner request 2026-08-11: "use gsap or something to have some moving
 * animation element" in the hero. No gsap — the site already carries a motion
 * stack and these are three CSS loops (keyframes in globals.css, `ra-*`), all
 * transform/opacity, all killed by the global reduced-motion block:
 *
 *   1. Two warm GLOW FIELDS drifting like shop light through a window —
 *      radial gradients, not filter:blur, so nothing repaints per frame.
 *   2. Three SPECIMEN MARKS floating up the sheet at sub-0.1 opacity — the
 *      spec-figure grammar from the cutout chips, loosed from its frames.
 *   3. STEAM rising where the festival card sits — the batch is fresh, the
 *      hero says so in motion as well as in the live-row's words.
 *
 * The marks and steam mount at lg only: below lg the hero stacks to one
 * column and their fixed positions would sit on the headline. Decorative
 * throughout — aria-hidden, pointer-events-none, z-0 under the grid's z-10.
 */

function dur(seconds: number): CSSProperties {
  return { '--ra-dur': `${seconds}s` } as CSSProperties;
}

const GLOW =
  'radial-gradient(closest-side, color-mix(in oklab, var(--theme-glow) 55%, transparent), transparent 72%)';

/** Thin outline stroke for the floating marks — kumkum ink, nearly dry. */
const MARK_STROKE = {
  stroke: 'var(--color-brand)',
  strokeWidth: 2,
  fill: 'none',
} as const;

export function HeroAmbient() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Glow fields */}
      <div
        className="ra-drift absolute -left-24 top-[-22%] h-[26rem] w-[26rem] rounded-full opacity-60"
        style={{ background: GLOW, ...dur(34) }}
      />
      <div
        className="ra-drift absolute bottom-[-34%] right-[-8%] h-[30rem] w-[30rem] rounded-full opacity-50"
        style={{ background: GLOW, animationDirection: 'alternate-reverse', ...dur(26) }}
      />

      {/* Floating specimen marks — lg+ only */}
      <svg
        viewBox="0 0 48 48"
        className="ra-float absolute left-[44%] top-[16%] hidden h-9 w-9 opacity-[0.08] lg:block"
        style={dur(21)}
      >
        <rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" {...MARK_STROKE} />
      </svg>
      <svg
        viewBox="0 0 48 48"
        className="ra-float absolute bottom-[14%] left-[6%] hidden h-7 w-7 opacity-[0.07] lg:block"
        style={{ animationDirection: 'alternate-reverse', ...dur(17) }}
      >
        <circle cx="24" cy="24" r="14" {...MARK_STROKE} />
        <circle cx="24" cy="24" r="6" {...MARK_STROKE} strokeWidth={1.2} />
      </svg>
      <svg
        viewBox="0 0 48 48"
        className="ra-float absolute right-[4%] top-[58%] hidden h-8 w-8 opacity-[0.07] lg:block"
        style={dur(24)}
      >
        <path
          d="M24 24 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0"
          strokeLinecap="round"
          {...MARK_STROKE}
        />
      </svg>

      {/* Steam over the festival card — lg+ only, staggered wisps */}
      <div className="absolute right-[16%] top-[4%] hidden lg:block">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 64"
            className="ra-steam absolute h-16 w-6"
            style={{
              left: `${i * 26}px`,
              animationDelay: `${i * 2.3}s`,
              ...dur(6.5 + i),
            }}
          >
            <path
              d="M12 58 C 6 48, 18 40, 12 30 C 7 22, 16 14, 12 6"
              stroke="var(--theme-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}
