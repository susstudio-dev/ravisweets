// ─── bake-catalogue-from-source.mjs ─────────────────────────────────────────
// Emits packages/shared/src/catalogue/products.generated.ts from
// HARDCODED_CATALOGUE instead of from Supabase.
//
// Run from the repo root:   pnpm run bake:catalogue
//
// WHY THIS EXISTS ALONGSIDE generate-catalogue.mjs. The site renders
// `CATALOGUE`, which is `GENERATED_CATALOGUE` whenever that array is non-empty
// — i.e. the committed database snapshot wins over the hand-written source.
// That is the right default: /admin edits are the freshest truth, and the
// static export has no other way to see them.
//
// But it means a change made in products.ts is INVISIBLE until something
// regenerates the snapshot, and the only tool that could was one that requires
// live Supabase credentials. So a catalogue change authored in the repo could
// not be shipped from the repo. That is the gap this closes.
//
// WHICH ONE TO RUN. If the database is the authority (an admin edited prices,
// stock, copy), run `pnpm run generate:catalogue` — it reads the real rows and
// this script would overwrite them with stale source. If the REPO is the
// authority (new products authored in products.ts, as with the 2026-08-13
// photography drop), run this, then apply the matching seed migration so the
// database catches up and the two agree again.
//
// The emitter is shared, so the output format is identical either way and the
// diff between a source bake and a later database bake is only the data.

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderModule } from './lib/catalogue-emitter.mjs';
// HARDCODED_CATALOGUE, not CATALOGUE: CATALOGUE resolves to the file we are
// about to overwrite, so importing it would bake the previous bake.
import { HARDCODED_CATALOGUE } from '../packages/shared/src/catalogue/products.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'packages', 'shared', 'src', 'catalogue', 'products.generated.ts');

const say = (msg) => console.log(`[bake:catalogue] ${msg}`);

if (!HARDCODED_CATALOGUE.length) {
  console.error('[bake:catalogue] HARDCODED_CATALOGUE is empty — refusing to blank the shop.');
  process.exit(1);
}

// The emitted module is plain data with a single type-only import, so anything
// non-serialisable in the source (a function, a Date, undefined) has to fail
// here rather than produce a file that will not compile.
const output = renderModule(
  HARDCODED_CATALOGUE,
  'packages/shared/src/catalogue/products.ts (HARDCODED_CATALOGUE), baked without a database.',
);

writeFileSync(OUT_FILE, output, 'utf8');
const variantCount = HARDCODED_CATALOGUE.reduce((n, p) => n + p.variants.length, 0);
say(
  `Wrote ${path.relative(ROOT, OUT_FILE)} — ${HARDCODED_CATALOGUE.length} products, ${variantCount} variants.`,
);
say('Now run `pnpm run generate:seed` and apply the migration so the database agrees.');
