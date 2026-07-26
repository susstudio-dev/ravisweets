/**
 * Removes font-weight utilities from elements that also carry font-display.
 *
 * Young Serif has one weight, and globals.css sets font-synthesis:none, so
 * font-semibold / font-bold / font-medium on display text are dead classes.
 * 197 of 255 font-display occurrences across 68 files had one.
 *
 * Conservative by design: only rewrites a className string when BOTH
 * font-display and a weight utility appear inside the SAME quoted literal.
 * Run with --check to report without writing (exit 1 if anything would change).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
// NOTE: do not import globSync from node:fs — it does not exist on Node 20,
// which is what package.json engines and CI both pin. File discovery uses
// `git ls-files` below, which also skips node_modules and untracked files.
// execFileSync (not execSync) so no shell is involved and the glob is passed
// to git as a literal argument rather than interpolated into a command string.

const check = process.argv.includes('--check');

const files = execFileSync('git', ['ls-files', '*.tsx'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && (f.startsWith('apps/storefront/src/') || f.startsWith('packages/ui/src/')));

const WEIGHTS = /\s*\bfont-(?:semibold|bold|medium)\b/g;
let changed = 0;
const touched = [];

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  // Rewrite each quoted string that mentions font-display.
  const after = before.replace(/(["'`])([^"'`]*\bfont-display\b[^"'`]*)\1/g, (m, q, body) => {
    const next = body
      .replace(WEIGHTS, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return next === body.trim() ? m : `${q}${next}${q}`;
  });
  if (after !== before) {
    changed += 1;
    touched.push(file);
    if (!check) writeFileSync(file, after);
  }
}

console.log(`${check ? 'would change' : 'changed'} ${changed} file(s)`);
for (const f of touched) console.log(`  ${f}`);
if (check && changed > 0) process.exit(1);
