// ─── process.mjs ─────────────────────────────────────────────────────────────
// Crop, resize and encode the owner's photography drop into
// apps/storefront/public/products/.
//
//   node scripts/photography/process.mjs "<path to the drop folder>" [--drop <name>]
//
// `--drop` names which shot list the folder is checked against (see DROPS in
// shot-list.mjs); it defaults to the first, 2026-08-13 Khammam drop. Later
// drops are processed on their own and MERGED into manifest.json — the record
// of the first drop is not rewritten by the second.
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

import { BORROWED, DROPS, STILL_UNSHOT } from './shot-list.mjs';
import { buildVariants } from './variants.mjs';

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

const argv = process.argv.slice(2);
const dropFlag = argv.indexOf('--drop');
const DROP_NAME = dropFlag >= 0 ? argv[dropFlag + 1] : 'khammam';
const SRC = argv.find((a, i) => !a.startsWith('--') && (dropFlag < 0 || i !== dropFlag + 1));
if (!SRC || !existsSync(SRC)) {
  console.error(`[photography] Source folder not found: ${SRC ?? '(none given)'}`);
  console.error('  usage: node scripts/photography/process.mjs "<drop folder>" [--drop <name>]');
  process.exit(1);
}
const DROP = DROPS[DROP_NAME];
if (!DROP) {
  console.error(`[photography] Unknown drop "${DROP_NAME}" — known: ${Object.keys(DROPS).join(', ')}`);
  process.exit(1);
}
const SHOTS = DROP.shots;

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
  // A drop may declare files it deliberately leaves unencoded (a photograph
  // with no product spec yet); those may sit in the folder, but anything else
  // unlisted is still fatal.
  const listed = new Set(SHOTS.map((s) => s.file));
  const allowed = new Set(DROP.unmatched);
  const missing = [...listed].filter((f) => !present.has(f));
  const orphaned = [...present].filter((f) => !listed.has(f) && !allowed.has(f));
  const skipped = [...present].filter((f) => allowed.has(f));
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

  // ── guard: one primary per slug, within a drop ─────────────────────────
  // Across drops a later primary SUPERSEDES an earlier one (the namkeen drop
  // re-shot murukulu), so uniqueness is checked per drop and the borrow guard
  // below looks at the union.
  const primaries = new Map();
  for (const [name, d] of Object.entries(DROPS)) {
    const inThisDrop = new Map();
    for (const s of d.shots.filter((s) => s.role === 'primary' && !s.supersededBy)) {
      if (inThisDrop.has(s.slug)) {
        console.error(`[photography] two primaries for ${s.slug} in drop "${name}": ${inThisDrop.get(s.slug)} / ${s.file}`);
        process.exit(1);
      }
      inThisDrop.set(s.slug, s.file);
      primaries.set(s.slug, s.file);
    }
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
  // The previous manifest is read BEFORE encoding for two reasons: the merge
  // below keeps every record this drop does not rewrite, and secondary-angle
  // numbering must continue from what earlier drops already shipped — the
  // Khammam drop wrote `kaju-bites-2.webp`, so a later angle for kaju-bites
  // must become `-3`, not overwrite `-2`.
  const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { shots: [] };
  const seen = new Map();
  for (const m of previous.shots ?? []) {
    if (m.role !== 'secondary' || (m.drop ?? 'khammam') === DROP_NAME) continue;
    const n = Number(/-(\d+)\.webp$/.exec(m.file ?? '')?.[1] ?? 1);
    seen.set(m.slug, Math.max(seen.get(m.slug) ?? 1, n));
  }
  const manifest = [];
  let srcBytes = 0;
  let outBytes = 0;

  for (const shot of SHOTS) {
    // A shot a LATER drop re-took stays in the list (so the folder guard still
    // demands the file) but is never encoded again — otherwise re-running this
    // drop would quietly put the old photograph back under the new one's name.
    if (shot.supersededBy) {
      say(`${shot.file} -> ${shot.slug}: superseded by drop "${shot.supersededBy}", not encoded`);
      continue;
    }
    const srcFile = path.join(SRC, shot.file);
    const name = outputName(shot.slug, shot.role, seen);
    const outFile = path.join(OUT_DIR, name);
    await encode(srcFile, outFile);
    srcBytes += statSync(srcFile).size;
    outBytes += statSync(outFile).size;
    manifest.push({ source: shot.file, slug: shot.slug, role: shot.role, file: `/products/${name}`, drop: DROP_NAME });
  }
  if (skipped.length) {
    say(`${skipped.length} photo(s) listed as unmatched in drop "${DROP_NAME}" left unencoded:`);
    for (const f of skipped) say(`    ${f}`);
  }

  // ── manifest: merge, never rewrite another drop's record ───────────────
  // An output file is owned by whichever drop encoded it last, so an earlier
  // entry for the same file is dropped (murukulu.webp moved from the Khammam
  // drop's ragi shot to the namkeen drop's own). Everything else is kept.
  const rewritten = new Set(manifest.map((m) => m.file));
  const kept = (previous.shots ?? []).filter((m) => !rewritten.has(m.file));

  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        note: 'Generated by scripts/photography/process.mjs — the record of which delivered photograph became which catalogue image.',
        encoded: `${EDGE}x${EDGE} webp q${QUALITY}, smart-cropped`,
        shots: [...kept, ...manifest],
        borrowed: BORROWED,
        stillUnshot: STILL_UNSHOT,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  /*
   * THE RUNGS, IN THE SAME BREATH.
   *
   * A master without its narrow variants is worse than no master at all: the
   * image loader rewrites `/products/x.webp` to `/products/x-400w.webp` for a
   * phone-sized slot whether or not that file was ever encoded, so a drop
   * processed without this step 404s at the size most visitors are served
   * while looking perfectly healthy in the folder. Running it here means the
   * two can never drift apart by forgetting a command.
   */
  const rungs = await buildVariants();
  say(`Rungs: ${rungs.built} encoded, ${rungs.skipped} already current`);

  const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
  say(`Encoded ${manifest.length} photographs from drop "${DROP_NAME}" -> ${path.relative(ROOT, OUT_DIR)}`);
  say(`  ${mb(srcBytes)} of source becomes ${mb(outBytes)} shipped (${Math.round((1 - outBytes / srcBytes) * 100)}% smaller)`);
  say(`  ${primaries.size} products photographed, ${BORROWED.length} using a family stand-in, ${STILL_UNSHOT.length} still unshot`);
}

await main();
