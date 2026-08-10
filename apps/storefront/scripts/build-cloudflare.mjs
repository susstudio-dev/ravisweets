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
import { rmSync } from 'node:fs';

process.env.BUILD_TARGET = 'cloudflare';

/*
 * Clear the dev build dir before typechecking.
 *
 * tsconfig.json includes `.next-dev/types/**`, and `next dev` generates route
 * types there while the `@modal` intercept slot is still in the tree. This
 * build disables that slot (export cannot render intercepted routes), so any
 * leftover dev types still referencing `src/app/@modal/...` fail the build
 * with "Cannot find module '../../src/app/@modal/(.)product/[slug]/page.js'".
 *
 * CI never sees this because a fresh clone has no `.next-dev` — it only bites
 * a developer who ran the dev server before building, which makes it exactly
 * the kind of failure that wastes an afternoon.
 */
rmSync(new URL('../.next-dev', import.meta.url), { recursive: true, force: true });
/*
 * THE CANONICAL HOST IS A CONSTANT, NOT AN INHERITED GUESS.
 *
 * This used to fall back to Cloudflare's `CF_PAGES_URL`, which is the
 * *deployment* URL — for a preview branch that is a random
 * `<hash>.ravisweets.pages.dev`. Inheriting it meant a build could stamp a
 * throwaway preview host into every canonical, every OG url and all 112
 * sitemap entries and still pass the guard below, because a pages.dev URL is
 * https and is not on the bad-host list.
 *
 * A production canonical is a property of the brand, not of the machine that
 * happened to run the build, so it is hard-coded here. An explicit
 * NEXT_PUBLIC_SITE_URL still wins (that is how a staging host overrides it),
 * but the absence of one now means "production", not "whatever CI is called".
 *
 * This is not a hypothetical. The build that is live at the time of writing
 * shipped canonicals and a full sitemap pointing at
 * https://susstudio-dev.github.io/ravisweets — a retired GitHub Pages host —
 * so Google was told, on every page, that the real domain was not the one to
 * index. `.env.production` carries the same value for any non-Cloudflare path.
 */
const PRODUCTION_SITE_URL = 'https://ravisweets.com';
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
}

/*
 * FAIL LOUDLY ON A WRONG CANONICAL DOMAIN.
 *
 * NEXT_PUBLIC_SITE_URL decides every canonical, every OG url, the
 * LocalBusiness @id, and all 112 sitemap entries. When it is wrong, nothing
 * looks broken — the site renders perfectly and is quietly uncrawlable.
 *
 * That is not hypothetical. The production build shipped with this variable
 * unset, so it fell back to a retired GitHub Pages URL, and every single
 * sitemap entry pointed at a host returning 404. A silent wrong value is
 * worse than a crash, so this makes it a crash.
 *
 * `.env.local` sets localhost for the dev server and Next loads it during any
 * local build too, which is the other way a bad value reaches production.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const badHost =
  !siteUrl ||
  /localhost|127\.0\.0\.1|susstudio-dev\.github\.io|\.pages\.dev/i.test(siteUrl) ||
  !/^https:\/\//i.test(siteUrl);

if (badHost && process.env.ALLOW_NONCANONICAL_BUILD !== 'true') {
  console.error(
    [
      '',
      '  BUILD REFUSED — NEXT_PUBLIC_SITE_URL is not a production URL.',
      `  got: ${siteUrl || '(unset)'}`,
      '',
      '  This value becomes every canonical tag, the OG urls, the',
      '  LocalBusiness @id and all sitemap entries. Shipping it wrong makes',
      '  the site invisible to search without any visible symptom.',
      '',
      '  Set it in the Cloudflare Pages build environment:',
      '    NEXT_PUBLIC_SITE_URL=https://ravisweets.com',
      '',
      '  To build anyway (local preview only, never deploy the output):',
      '    ALLOW_NONCANONICAL_BUILD=true pnpm run build:cloudflare',
      '',
    ].join('\n'),
  );
  process.exit(1);
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
