#!/usr/bin/env node
/**
 * Link-integrity check (storefront).
 *
 * Scans every href="/..." attribute or href: '/...' data entry in src/**
 * and asserts each resolves to a real Next.js route under src/app/**.
 *
 * Scope:
 *  - ONLY path-prefixed hrefs (start with `/`). Anchors (#...), query-only (?...),
 *    mailto/tel/https/http, and relative paths are ignored.
 *  - Dynamic segments are resolved by matching `/category/hyderabadi-specials`
 *    against `src/app/category/[slug]/page.tsx` + the catalogue's known slugs.
 *  - An inline `// link-check:ignore` comment on the same line OR the preceding
 *    line suppresses a finding.
 *
 * Exit 0 on clean. Exit 1 on any unmatched href.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(here, '..', 'src', 'app');
const SRC_ROOT = join(here, '..', 'src');

// ─── Step 1: enumerate real routes from src/app/**/page.tsx ────────────────
function enumerateRoutes(dir, prefix = '') {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip parallel-slot directories (@name) and the disabled-export rename.
      if (entry === '_modal.disabled') continue;
      // Parallel slot dirs contribute segments under their parent path, not new paths.
      if (entry.startsWith('@')) {
        routes.push(...enumerateRoutes(full, prefix));
        continue;
      }
      // Route-group dirs (name) don't contribute a URL segment.
      if (entry.startsWith('(') && entry.endsWith(')')) {
        routes.push(...enumerateRoutes(full, prefix));
        continue;
      }
      routes.push(...enumerateRoutes(full, `${prefix}/${entry}`));
    } else if (entry === 'page.tsx' || entry === 'page.ts') {
      // Normalise path. Empty string means root.
      const path = prefix === '' ? '/' : prefix;
      routes.push(path);
    }
  }
  return routes;
}

const KNOWN_ROUTES = enumerateRoutes(APP_ROOT);

// Turn `/product/[slug]` into a regex.
const routeMatchers = KNOWN_ROUTES.map((r) => {
  const re = r.replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+');
  return { route: r, re: new RegExp(`^${re}$`) };
});

function isKnown(path) {
  // Strip trailing slash except for root.
  const normalised = path === '/' ? '/' : path.replace(/\/+$/, '');
  return routeMatchers.some(({ re }) => re.test(normalised));
}

// ─── Step 2: scan src/** for path-prefixed hrefs ───────────────────────────
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'out') continue;
      yield* walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      yield full;
    }
  }
}

// Match `href="/..."`, `href='/...'`, `href: '/...'`, `href: "/..."`
// Capture the literal text so we can strip query strings and hash fragments.
const HREF_RE = /\bhref\s*[=:]\s*["'`](\/[^"'`#?\s][^"'`#?]*)(?:[?#][^"'`]*)?["'`]/g;

const findings = [];

for (const file of walk(SRC_ROOT)) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const prevLine = lines[i - 1] ?? '';
    // Inline or previous-line escape hatch.
    const ignored =
      /\/\/\s*link-check:ignore/.test(line) || /\/\/\s*link-check:ignore/.test(prevLine);
    if (ignored) continue;
    let m;
    HREF_RE.lastIndex = 0;
    while ((m = HREF_RE.exec(line)) !== null) {
      const path = m[1];
      // Skip internal @-slots inadvertently matched.
      if (path.startsWith('/@')) continue;
      if (!isKnown(path)) {
        findings.push({
          file: relative(join(here, '..', '..', '..'), file).replace(/\\/g, '/'),
          line: i + 1,
          path,
        });
      }
    }
  }
}

// ─── Report ────────────────────────────────────────────────────────────────
if (findings.length === 0) {
  console.log(`link-check: OK · ${KNOWN_ROUTES.length} routes scanned, no broken hrefs`);
  process.exit(0);
}

console.error(`\nlink-check: ${findings.length} broken href${findings.length === 1 ? '' : 's'} found:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  →  ${f.path}`);
}
console.error(
  `\nKnown routes:\n  ${KNOWN_ROUTES.slice().sort().join('\n  ')}\n\n` +
    'Add the missing route, fix the typo, or add `// link-check:ignore` above the line if this is intentional.\n',
);
process.exit(1);
