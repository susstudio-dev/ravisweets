// ─── variants.mjs ────────────────────────────────────────────────────────────
// Emit the narrow rungs of each catalogue photograph's srcset.
//
//   node scripts/photography/variants.mjs [--force]
//
// WHY THIS EXISTS. `process.mjs` normalises the drop to 1400x1400 because that
// is the size the product page wants. Every OTHER surface wants far less: a
// two-column phone grid paints each tile at about 195 CSS px. Serving the
// master there sends 130 kB to fill a slot that can use 22 kB — roughly 68x the
// pixel data — and a 24-card viewport costs ~3.1 MB.
//
// The storefront is a static export, so there is no optimiser at request time;
// the browser receives exactly the bytes in this folder. The rungs are therefore
// built HERE, once, and committed alongside the masters — the same reasoning
// that made process.mjs commit its output.
//
// THREE RUNGS:
//
//     slot                     CSS px   @2x    serves from
//     cart / order thumb          80     160   200w   ~6 kB
//     phone grid, 2-col          195     390   400w   ~18 kB
//     tablet grid, 3-col         253     506   640w   ~37 kB
//     desktop grid, 4-col        300     600   640w   ~37 kB
//     product page hero          560    1120   the 1400 master
//
// 200w exists so the srcset does not LIE. Without it the loader answered a
// 200px request with the 400w file while next/image still labelled the entry
// `200w`, and a browser picks candidates by that label — it would have been
// choosing on a width no file actually had.
//
// A rung near 1000px is deliberately absent: it would only help the product
// page, which loads ONE image, at a cost of ~7 MB of repository to save ~35 kB
// on a single-image page. AVIF is left out for the same reason — another ~4 kB
// off an 18 kB thumbnail for twice the files and twice the encode. Both are
// cheap to add later if the numbers change.
//
// THE `w` SUFFIX IS LOAD-BEARING. Extra camera angles are already named
// `<slug>-2.webp`, so a bare `<slug>-400.webp` would be ambiguous with them.
// Files that already match /-\d+w\.webp$/ are skipped as inputs, which is what
// makes re-running this safe.
//
// The widths here and in apps/storefront/src/lib/image-loader.ts are one
// contract. Change them together, or the loader will point at files that do not
// exist.

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'apps', 'storefront', 'public', 'products');

/** Must stay in step with RUNGS in apps/storefront/src/lib/image-loader.ts. */
export const RUNGS = [200, 400, 640];
/** Same encode as the masters, so a rung is never visibly worse than a crop of one. */
const QUALITY = 78;

// sharp is a storefront dependency and pnpm does not hoist it to the root, so
// it is resolved out of the store rather than imported bare from scripts/.
const require = createRequire(import.meta.url);
let sharp;
for (const spec of ['sharp', path.join(ROOT, 'node_modules/.pnpm/sharp@0.34.5/node_modules/sharp')]) {
  try {
    sharp = require(spec);
    break;
  } catch {
    /* try the next resolution */
  }
}
if (!sharp) {
  console.error('[variants] sharp not resolvable — run pnpm install first.');
  process.exit(1);
}

const say = (m) => console.log(`[variants] ${m}`);

/** True for a file this script produced, so it is never used as an input. */
export const isRung = (file) => /-\d+w\.webp$/.test(file);

/**
 * Background-removed silhouettes, which this script must NOT touch.
 *
 * `scripts/photography/cutouts.py` writes a `<base>-cutout.webp` beside each
 * master for the Sweet Counter surfaces. They are excluded for two independent
 * reasons, either of which is sufficient:
 *
 *   1. They are not square. The masters are 1400x1400 and resize under
 *      `fit: 'cover'` without losing anything; a cutout is 760 x whatever the
 *      silhouette needs (760x658, 760x523, ...), and cover-cropping one to a
 *      square would cut the sweet in half.
 *   2. Nothing would ever request the result. `lib/cutouts.ts` returns null for
 *      any already-suffixed file, and `trending-shelf.tsx` renders a cutout
 *      through a plain <img> on purpose — an irregular alpha silhouette is
 *      outside the square cover-rung contract the loader serves.
 *
 * Serving cutouts responsively is a real and separate opportunity (760px is
 * still ~2.5x the shelf tile), but it needs an aspect-preserving pipeline
 * rather than this one. Do not "fix" it by deleting this guard.
 */
export const isCutout = (file) => /-cutout\.webp$/i.test(file);

/** `kaju-katli.webp` + 400 -> `kaju-katli-400w.webp` */
export const rungName = (file, width) => file.replace(/\.webp$/, `-${width}w.webp`);

/**
 * Build every missing rung in public/products/.
 * Exported so process.mjs can call it directly at the end of a drop.
 */
export async function buildVariants({ force = false } = {}) {
  const masters = readdirSync(OUT_DIR).filter(
    (f) => f.endsWith('.webp') && !isRung(f) && !isCutout(f),
  );
  if (masters.length === 0) {
    say('no master photographs in public/products/ — nothing to do.');
    return { built: 0, skipped: 0, masters: 0, bytes: 0 };
  }

  let built = 0;
  let skipped = 0;
  let bytes = 0;

  for (const master of masters) {
    const srcPath = path.join(OUT_DIR, master);
    const srcTime = statSync(srcPath).mtimeMs;

    for (const width of RUNGS) {
      const outPath = path.join(OUT_DIR, rungName(master, width));

      // Idempotent: a rung newer than its master is already correct. This is
      // what keeps a re-run cheap and a re-shot photograph honest.
      if (!force) {
        try {
          const out = statSync(outPath);
          if (out.mtimeMs >= srcTime) {
            skipped++;
            bytes += out.size;
            continue;
          }
        } catch {
          /* not built yet */
        }
      }

      await sharp(srcPath)
        .resize(width, width, { fit: 'cover' })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(outPath);
      built++;
      bytes += statSync(outPath).size;
    }
  }

  return { built, skipped, masters: masters.length, bytes };
}

// ─── run standalone ──────────────────────────────────────────────────────────
// `import.meta.main` is Node 24+; compare paths so this also works on Node 20.
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const force = process.argv.includes('--force');
  const started = Date.now();
  const { built, skipped, masters, bytes } = await buildVariants({ force });
  const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

  say(`${masters} masters -> ${RUNGS.map((w) => `${w}w`).join(', ')}`);
  say(`  ${built} encoded, ${skipped} already current, ${mb(bytes)} of rungs on disk`);
  say(`  took ${((Date.now() - started) / 1000).toFixed(1)}s`);
}
