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
import { STILL_UNSHOT } from './shot-list.mjs';

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
const onDisk = readdirSync(PUBLIC_PRODUCTS).filter((f) => f.endsWith('.webp'));
for (const f of onDisk) {
  if (!referenced.has(f)) fail(`public/products/${f} is shipped but no product references it`);
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
console.log(`files: ${onDisk.length} webp in public/products/, ${referenced.size} referenced`);

if (problems.length) {
  console.error(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log('\nAll checks passed.');
