/**
 * Static-export build for Cloudflare Pages / Workers (and any host that runs
 * the repo's default `pnpm run build`).
 *
 * Why this exists: the repo root `build` script must NOT recurse into the
 * Medusa backend (`apps/backend`), whose `medusa build` fails in a static
 * hosting pipeline and isn't part of this deployment. This script builds only
 * the storefront, as a static export, with the intercept route disabled.
 *
 * It sets BUILD_TARGET internally so no cross-platform env-var syntax is
 * needed in package.json, and auto-fills NEXT_PUBLIC_SITE_URL from Cloudflare
 * Pages' CF_PAGES_URL when the dashboard hasn't set one.
 */
import { execSync } from 'node:child_process';

process.env.BUILD_TARGET = 'cloudflare';
if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.CF_PAGES_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = process.env.CF_PAGES_URL;
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });

// output:'export' cannot render the @modal intercept route — set it aside.
run('node scripts/prepare-export.mjs disable');
try {
  run('pnpm exec next build');
} finally {
  // Best-effort restore so a local run doesn't leave the tree modified. On a
  // throwaway CI/Cloudflare clone this is a harmless no-op; the export in out/
  // is already written and untouched by the restore.
  try {
    run('node scripts/prepare-export.mjs restore');
  } catch {
    /* ignore — nothing to restore, or a dev server holds the dir */
  }
}
