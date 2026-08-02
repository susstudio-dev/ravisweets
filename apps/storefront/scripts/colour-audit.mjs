/**
 * Ratchet on hardcoded colour, so the redesign cannot silently regress.
 *
 * The spec's target is <=20 distinct hex literals outside the palette module,
 * covering only third-party brand colours. We start from wherever the tree is
 * now and tighten as Plans 2 and 3 land — the build fails if the number goes UP.
 *
 * Update the MAX_* values only DOWNWARD, and say why in the commit message.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

/** Tighten these as Plan 2 and Plan 3 land. Never raise them. */
const MAX_DISTINCT_HEX = 145;
const MAX_PAISLEY = 148;
const MAX_NON_TOKEN_COLOUR_CLASSES = 217;

/** Third-party brand colours we do not own and cannot tokenise. */
const ALLOWED = new Set([
  '#25d366', // WhatsApp
  '#f58529', // Instagram gradient
  '#dd2a7b',
  '#8134af',
  '#1a73e8', // Gmail
]);

/** The authoring files — hex here is the point. */
const EXEMPT = ['src/lib/theme/palette.ts', 'src/lib/theme/contrast.ts'];

/*
 * `git ls-files apps/storefront/src` is a pathspec relative to the process
 * cwd, not the repo. Resolve the repo root explicitly so this works whether
 * invoked from the repo root (CI, `node apps/storefront/scripts/…`) or from
 * this package's own directory (`pnpm --filter … colour-audit`, which pnpm
 * runs with cwd = apps/storefront) — without this, the pathspec silently
 * resolves to a non-existent path from the latter and the ratchet no-ops.
 */
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const files = execFileSync('git', ['ls-files', 'apps/storefront/src'], {
  encoding: 'utf8',
  cwd: repoRoot,
})
  .split('\n')
  .filter((f) => /\.(ts|tsx|css)$/.test(f))
  .filter((f) => !EXEMPT.some((e) => f.endsWith(e)))
  .filter((f) => !f.endsWith('.test.ts'));

const hex = new Set();
let paisley = 0;
let classes = 0;

for (const file of files) {
  // `git ls-files` lists tracked paths even when deleted from the working
  // tree (deleted-but-unstaged); scan what actually exists on disk.
  const abs = join(repoRoot, file);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, 'utf8');
  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const v = m[0].toLowerCase();
    if (!ALLOWED.has(v)) hex.add(v);
  }
  paisley += (src.match(/Paisley/g) ?? []).length;
  classes += (
    src.match(
      /\b(?:bg|text|border|ring|from|via|to)-(?:red|emerald|amber|green|blue|slate|gray|zinc|stone)-\d{2,3}\b/g,
    ) ?? []
  ).length;
}

const results = [
  ['distinct hex literals', hex.size, MAX_DISTINCT_HEX],
  ['Paisley references', paisley, MAX_PAISLEY],
  ['non-token colour classes', classes, MAX_NON_TOKEN_COLOUR_CLASSES],
];

let failed = false;
for (const [label, actual, max] of results) {
  const ok = actual <= max;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}: ${actual} (max ${max})`);
}

if (failed) {
  console.error('\nColour ratchet exceeded. Use theme tokens instead of literals.');
  process.exit(1);
}

console.log('\nRatchet headroom — tighten these maxima as Plans 2 and 3 land.');
