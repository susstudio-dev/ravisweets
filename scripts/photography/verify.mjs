// ─── verify.mjs ──────────────────────────────────────────────────────────────
// Checks the catalogue against the files actually on disk.
//
//   node --import tsx scripts/photography/verify.mjs
//
// Catches the failure this whole change exists to prevent: a catalogue that
// CLAIMS a photograph the build does not ship. `isUsableImage` trusts any
// root-relative URL unconditionally (it ships with the build, so it always
// resolves) — which is true only for as long as something checks that the file
// is really there. This is that something.

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HARDCODED_CATALOGUE } from '../../packages/shared/src/catalogue/products.ts';
import { CUTOUT_BASES } from '../../apps/storefront/src/lib/cutouts.generated.ts';
import { STILL_UNSHOT } from './shot-list.mjs';
import { isCutout, isRung, rungName, RUNGS } from './variants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC_PRODUCTS = path.join(ROOT, 'apps', 'storefront', 'public', 'products');

const problems = [];
const fail = (m) => problems.push(m);

// ── uniqueness ────────────────────────────────────────────────────────────
const seenSlug = new Map();
const seenId = new Map();
const seenSku = new Map();
for (const p of HARDCODED_CATALOGUE) {
  if (seenSlug.has(p.slug)) fail(`duplicate slug '${p.slug}' (${seenSlug.get(p.slug)} and ${p.id})`);
  seenSlug.set(p.slug, p.id);
  if (seenId.has(p.id)) fail(`duplicate id '${p.id}'`);
  seenId.set(p.id, p.slug);
  for (const v of p.variants) {
    if (seenSku.has(v.sku)) fail(`duplicate SKU '${v.sku}' (${seenSku.get(v.sku)} and ${p.slug})`);
    seenSku.set(v.sku, p.slug);
  }
}

// ── every referenced image must exist ─────────────────────────────────────
const referenced = new Set();
let withPhoto = 0;
for (const p of HARDCODED_CATALOGUE) {
  const usable = p.images.filter((i) => i.url);
  if (usable.length) withPhoto++;
  for (const img of p.images) {
    if (!img.url) continue;
    if (!img.url.startsWith('/products/')) {
      fail(`${p.slug}: image url is not a shipped asset — ${img.url}`);
      continue;
    }
    referenced.add(path.basename(img.url));
    if (!existsSync(path.join(PUBLIC_PRODUCTS, path.basename(img.url)))) {
      fail(`${p.slug}: references ${img.url}, which is not in public/products/`);
    }
    if (!img.alt?.trim()) fail(`${p.slug}: image has no alt text`);
    if (img.width !== 1400 || img.height !== 1400) {
      fail(`${p.slug}: declares ${img.width}x${img.height}, but the encoder emits 1400x1400`);
    }
  }
}

// ── every shipped file must be referenced ─────────────────────────────────
// An orphan is 150 kB of repo and bandwidth that reaches no page.
//
// THREE KINDS OF FILE LIVE IN THIS FOLDER, and only one is named by a product:
//
//   masters   kaju-katli.webp        the catalogue's images[].url
//   rungs     kaju-katli-400w.webp   derived at render by lib/image-loader.ts
//   cutouts   kaju-katli-cutout.webp derived at render by lib/cutouts.ts
//
// Neither derived kind is ever written into the catalogue, so both would trip
// the orphan rule. Each therefore gets its own check below, against the thing
// that actually decides whether it is reachable.
const allWebp = readdirSync(PUBLIC_PRODUCTS).filter((f) => f.endsWith('.webp'));
const onDisk = allWebp.filter((f) => !isRung(f) && !isCutout(f));
const rungsOnDisk = new Set(allWebp.filter(isRung));
const cutoutsOnDisk = allWebp.filter(isCutout);
for (const f of onDisk) {
  if (!referenced.has(f)) fail(`public/products/${f} is shipped but no product references it`);
}

// ── every master must carry every rung ────────────────────────────────────
// THE FAILURE THIS PREVENTS. The loader rewrites `/products/x.webp` to
// `/products/x-400w.webp` unconditionally for a 400px slot — it cannot know
// whether that file was encoded. A master added without running
// `pnpm photography:variants` therefore does not fall back to the full-size
// image; it 404s at the size most visitors are served, and the catalogue looks
// fine in every check that only asks whether the master exists.
for (const f of onDisk) {
  for (const w of RUNGS) {
    const rung = rungName(f, w);
    if (!rungsOnDisk.has(rung)) {
      fail(`public/products/${rung} is missing — run \`pnpm photography:variants\``);
    }
    rungsOnDisk.delete(rung);
  }
}
// Whatever is left belongs to no master — a rename or a deleted photograph.
// Cutouts deliberately have NO rungs (see the note in variants.mjs), so a
// `*-cutout-400w.webp` turning up here means someone removed that guard.
for (const f of rungsOnDisk) {
  fail(`public/products/${f} is a rung of a master that no longer exists`);
}

// ── every cutout must be a cutout OF something, and be registered ─────────
// `cutoutFor` consults CUTOUT_BASES rather than the filesystem, so the two can
// disagree in both directions: a file the registry has never heard of is dead
// weight, and a registry entry with no file renders a broken silhouette on the
// home shelf. cutouts.py writes both; this is what catches it writing one.
for (const f of cutoutsOnDisk) {
  const base = f.replace(/-cutout\.webp$/i, '');
  if (!CUTOUT_BASES.has(base)) {
    fail(`public/products/${f} is not in CUTOUT_BASES — re-run scripts/photography/cutouts.py`);
  }
  if (!referenced.has(`${base}.webp`)) {
    fail(`public/products/${f} is a cutout of ${base}.webp, which no product references`);
  }
}
for (const base of CUTOUT_BASES) {
  if (!cutoutsOnDisk.includes(`${base}-cutout.webp`)) {
    fail(`CUTOUT_BASES lists '${base}', but ${base}-cutout.webp is not on disk`);
  }
}

// ── the unshot list must still be unshot ──────────────────────────────────
for (const slug of STILL_UNSHOT) {
  const p = HARDCODED_CATALOGUE.find((x) => x.slug === slug);
  if (!p) fail(`STILL_UNSHOT lists '${slug}', which is not in the catalogue`);
  else if (p.images.some((i) => i.url)) {
    fail(`'${slug}' is on STILL_UNSHOT but now has a photo — remove it from the list`);
  }
}

// ── prices ────────────────────────────────────────────────────────────────
for (const p of HARDCODED_CATALOGUE) {
  for (const v of p.variants) {
    if (!Number.isInteger(v.price.amount) || v.price.amount <= 0) {
      fail(`${p.slug}/${v.sku}: price ${v.price.amount} is not a positive integer rupee amount`);
    }
    if (v.price.amount > 20000) fail(`${p.slug}/${v.sku}: ₹${v.price.amount} looks like a paise/rupee slip`);
  }
}

// ── report ────────────────────────────────────────────────────────────────
console.log(`catalogue: ${HARDCODED_CATALOGUE.length} products, ${seenSku.size} SKUs`);
console.log(`photographed: ${withPhoto}   placeholder: ${HARDCODED_CATALOGUE.length - withPhoto}`);
console.log(
  `files: ${onDisk.length} masters in public/products/, ${referenced.size} referenced, ` +
    `${allWebp.length - onDisk.length - cutoutsOnDisk.length} rungs ` +
    `(${RUNGS.map((w) => `${w}w`).join('/')}), ${cutoutsOnDisk.length} cutouts`,
);

if (problems.length) {
  console.error(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log('\nAll checks passed.');
