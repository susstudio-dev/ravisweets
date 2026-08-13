// ─── process.mjs ─────────────────────────────────────────────────────────────
// Crop, resize and encode the owner's photography drop into
// apps/storefront/public/products/.
//
//   node scripts/photography/process.mjs "<path to the drop folder>"
//
// WHY THE OUTPUT IS COMMITTED. The storefront is a static export served by
// Cloudflare Pages (`output: 'export'`, `images.unoptimized`). There is no
// image optimiser at request time and no server to resize on the fly, so the
// bytes the browser receives are exactly the bytes in this folder. A 21 MB
// phone JPEG committed as-is would be shipped, in full, to a shopper on an
// Indian mobile connection. Everything is therefore normalised HERE, once.
//
// SQUARE, BY SMART CROP. The catalogue declares every image 1400×1400 and the
// grid renders square tiles, but the drop is 47 different aspect ratios from
// 0.56 to 2.17. A centre crop would slice the product out of the frame on the
// wide plates, so the crop uses libvips' attention strategy, which keeps the
// region with the most detail/saturation — for a plate of sweets on a
// worktop, that is the sweets.
//
// IDEMPOTENT. Same drop in, same files out; re-running overwrites in place.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { ALL_SHOTS, BORROWED, STILL_UNSHOT } from './shot-list.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'apps', 'storefront', 'public', 'products');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

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
  console.error('[photography] sharp not resolvable — run pnpm install first.');
  process.exit(1);
}

const say = (m) => console.log(`[photography] ${m}`);

const SRC = process.argv[2];
if (!SRC || !existsSync(SRC)) {
  console.error(`[photography] Source folder not found: ${SRC ?? '(none given)'}`);
  console.error('  usage: node scripts/photography/process.mjs "<drop folder>"');
  process.exit(1);
}

// ─── the encode ──────────────────────────────────────────────────────────────
// 1400px square matches the width/height the catalogue already declares, so
// the reserved layout box is honest and nothing shifts as images land.
const EDGE = 1400;
// q78 webp sits below the point where a sugar-crystal highlight starts to
// smear, and lands the whole 83-shot set at a fraction of the source bytes.
const QUALITY = 78;

async function encode(srcFile, outFile) {
  await sharp(srcFile)
    .rotate() // honour EXIF orientation before cropping, or portraits crop sideways
    .resize(EDGE, EDGE, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(outFile);
}

/** Output name: <slug>.webp for a primary, <slug>-2.webp… for each extra angle. */
function outputName(slug, role, seen) {
  if (role === 'primary') return `${slug}.webp`;
  const n = (seen.get(slug) ?? 1) + 1;
  seen.set(slug, n);
  return `${slug}-${n}.webp`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const present = new Set(
    readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)),
  );

  // ── guard: the shot list and the folder must agree ─────────────────────
  // A typo in a filename would otherwise silently produce a product with no
  // photograph, which is exactly the failure this whole change is fixing.
  const listed = new Set(ALL_SHOTS.map((s) => s.file));
  const missing = [...listed].filter((f) => !present.has(f));
  const orphaned = [...present].filter((f) => !listed.has(f));
  if (missing.length) {
    console.error(`[photography] ${missing.length} shot-list file(s) not in the drop:`);
    for (const f of missing) console.error(`    ${f}`);
    process.exit(1);
  }
  if (orphaned.length) {
    console.error(`[photography] ${orphaned.length} photo(s) in the drop with no shot-list entry:`);
    for (const f of orphaned) console.error(`    ${f}`);
    console.error('  Add them to scripts/photography/shot-list.mjs, or they ship to nobody.');
    process.exit(1);
  }

  // ── guard: one primary per slug ────────────────────────────────────────
  const primaries = new Map();
  for (const s of ALL_SHOTS.filter((s) => s.role === 'primary')) {
    if (primaries.has(s.slug)) {
      console.error(`[photography] two primaries for ${s.slug}: ${primaries.get(s.slug)} / ${s.file}`);
      process.exit(1);
    }
    primaries.set(s.slug, s.file);
  }
  for (const b of BORROWED) {
    if (!primaries.has(b.borrows)) {
      console.error(`[photography] ${b.slug} borrows ${b.borrows}, which has no primary photo.`);
      process.exit(1);
    }
    if (primaries.has(b.slug)) {
      console.error(`[photography] ${b.slug} has its own photo — remove it from BORROWED.`);
      process.exit(1);
    }
  }

  // ── encode ─────────────────────────────────────────────────────────────
  const seen = new Map();
  const manifest = [];
  let srcBytes = 0;
  let outBytes = 0;

  for (const shot of ALL_SHOTS) {
    const srcFile = path.join(SRC, shot.file);
    const name = outputName(shot.slug, shot.role, seen);
    const outFile = path.join(OUT_DIR, name);
    await encode(srcFile, outFile);
    srcBytes += statSync(srcFile).size;
    outBytes += statSync(outFile).size;
    manifest.push({ source: shot.file, slug: shot.slug, role: shot.role, file: `/products/${name}` });
  }

  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        note: 'Generated by scripts/photography/process.mjs — the record of which delivered photograph became which catalogue image.',
        encoded: `${EDGE}x${EDGE} webp q${QUALITY}, smart-cropped`,
        shots: manifest,
        borrowed: BORROWED,
        stillUnshot: STILL_UNSHOT,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
  say(`Encoded ${manifest.length} photographs -> ${path.relative(ROOT, OUT_DIR)}`);
  say(`  ${mb(srcBytes)} of source becomes ${mb(outBytes)} shipped (${Math.round((1 - outBytes / srcBytes) * 100)}% smaller)`);
  say(`  ${primaries.size} products photographed, ${BORROWED.length} using a family stand-in, ${STILL_UNSHOT.length} still unshot`);
}

await main();
