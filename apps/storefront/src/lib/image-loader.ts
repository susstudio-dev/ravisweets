/**
 * THE IMAGE LOADER — how a static export gets a real srcset.
 *
 * THE PROBLEM THIS SOLVES. `next.config.mjs` carried `images.unoptimized: true`
 * with the note "static export cannot use Next's image optimiser". Half true:
 * it cannot use the BUILT-IN one, but `output: 'export'` does support a custom
 * loader. With `unoptimized`, next/image emits a bare <img src> and NO srcset —
 * which also quietly made the `sizes` attribute on all ~25 call sites dead
 * code. Every device was served the 1400x1400 master. A phone painting a 170
 * CSS px tile in a two-column grid downloaded 130 kB to use about 18 kB of it,
 * and a 24-card viewport cost ~3.1 MB.
 *
 * Doing it here rather than in a wrapper component is the whole point: every
 * existing call site keeps the `sizes` it already declares and starts getting a
 * srcset for free, with no component churn.
 *
 * WHAT IT DOES NOT TOUCH. Anything that is not a catalogue photograph is
 * returned unchanged — remote Supabase and Cloudinary overrides, the brand
 * logo, SVGs, and the rungs themselves. Returning `src` for every width makes
 * next/image emit a srcset of identical URLs, which is harmless: the browser
 * picks one and downloads it once.
 *
 * THE WIDTHS ARE A CONTRACT with scripts/photography/variants.mjs. That script
 * writes `<name>-400w.webp` and `<name>-640w.webp` beside each master; this maps
 * a requested width onto them. Change one and you must change the other, or
 * this will point at files that were never encoded. `photography:verify` fails
 * the build if a master is missing a rung.
 */

/** Ascending, and must equal RUNGS in scripts/photography/variants.mjs. */
const RUNGS = [200, 400, 640] as const;

/** Files this loader produces, so a rung is never re-suffixed into `-400w-640w`. */
const IS_RUNG = /-\d+w\.webp$/;

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function catalogueImageLoader({ src, width }: LoaderArgs): string {
  if (!src.startsWith('/products/') || !src.endsWith('.webp')) return src;
  if (IS_RUNG.test(src)) return src;

  const rung = RUNGS.find((w) => width <= w);
  // Above the largest rung, the 1400 master IS the right file — the product
  // page hero at 2x wants every pixel of it.
  if (rung === undefined) return src;

  return src.replace(/\.webp$/, `-${rung}w.webp`);
}
