import { CUTOUT_BASES } from './cutouts.generated';
import { isUsableImage } from './images';

/**
 * THE CUTOUT OF A PLATED PHOTOGRAPH.
 *
 * scripts/photography/cutouts.py writes a background-removed `<base>-cutout.webp`
 * beside each master and records which bases exist in `cutouts.generated.ts`.
 * The Sweet Counter surfaces (hero plate, trending shelf, the home grid) stage
 * the sweet on the cream rather than in a photographic box, so they ask for the
 * cutout and only render one when it genuinely exists.
 *
 * KEYED BY IMAGE FILENAME, not product slug. A product that borrows a family
 * stand-in points its `images[0].url` at the stand-in's file; deriving the
 * cutout from that URL means the borrower gets the stand-in's cutout with no
 * per-product bookkeeping. Anything that is not a local `/products/*.webp`
 * master (a remote override, an already-suffixed rung) returns null and the
 * caller falls back to the boxed photo it already renders.
 */

const MASTER = /^\/products\/([a-z0-9-]+)\.webp$/i;
/** Rungs (`-400w`) and the cutouts themselves are never re-cut. */
const NOT_A_MASTER = /-(?:\d+w|cutout)$/i;

/**
 * CACHE REVISIONS for cutouts whose BYTES changed under an unchanged URL.
 *
 * public/_headers serves /products/* with `max-age=2592000` (30 days, no
 * revalidation — the security-audit caching policy). That is correct for
 * photographs that never change, and a trap for the one that does: when the
 * kaju katli cutout was despilled (2026-08-24), production served the new
 * bytes immediately but every returning browser kept its month-old red copy,
 * because nothing about the URL told it to look again.
 *
 * Bump (or add) a base here whenever scripts/photography regenerates a
 * cutout's pixels — the query string makes it a new cache entry everywhere
 * (browser and CDN) while the file keeps its stable name for the pipeline.
 */
const CUTOUT_REVISION: Record<string, number> = {
  'kaju-katli': 2, // despilled 2026-08-24 — the red-cloth bounce removed
};

/** The cutout URL for a primary image URL, or null when there is no cutout. */
export function cutoutFor(imageUrl: string | undefined | null): string | null {
  if (!imageUrl || !isUsableImage(imageUrl)) return null;
  const m = MASTER.exec(imageUrl);
  if (!m) return null;
  const base = m[1]!;
  if (NOT_A_MASTER.test(base)) return null;
  if (!CUTOUT_BASES.has(base)) return null;
  const rev = CUTOUT_REVISION[base];
  return `/products/${base}-cutout.webp${rev ? `?r=${rev}` : ''}`;
}
