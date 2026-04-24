#!/usr/bin/env node
/**
 * Static-export prep:
 * Next.js static export does not support App Router intercepted routes.
 * Before `next build` with BUILD_TARGET=github-pages, we temporarily move the
 * `@modal` parallel slot out of the routing tree. The quick-view modal falls
 * back to a full-page navigation on the static build — honest behaviour
 * documented in design.md decision 8.
 *
 * Usage:
 *   node scripts/prepare-export.mjs disable   # before build
 *   node scripts/prepare-export.mjs restore   # after build (local dev only)
 */

import { existsSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(here, '..', 'src', 'app');
const ACTIVE = join(APP_DIR, '@modal');
const DISABLED = join(APP_DIR, '_modal.disabled');

const action = process.argv[2];

if (action === 'disable') {
  if (existsSync(ACTIVE)) {
    renameSync(ACTIVE, DISABLED);
    console.log('[prepare-export] @modal → _modal.disabled');
  } else if (existsSync(DISABLED)) {
    console.log('[prepare-export] @modal already disabled, skipping');
  } else {
    console.warn('[prepare-export] no @modal directory found');
  }
} else if (action === 'restore') {
  if (existsSync(DISABLED)) {
    renameSync(DISABLED, ACTIVE);
    console.log('[prepare-export] _modal.disabled → @modal');
  } else {
    console.log('[prepare-export] nothing to restore');
  }
} else {
  console.error('Usage: node scripts/prepare-export.mjs <disable|restore>');
  process.exit(2);
}
