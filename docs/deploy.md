# Deploy runbook — Ravi Sweets storefront

The storefront deploys to **GitHub Pages** as a static export via a GitHub Actions workflow at `.github/workflows/deploy.yml`. Every push to `main` rebuilds and publishes. This document is the single source of truth for how that works and how to change it.

> **Current rollout stance**: staging-only. Search engines are disallowed (`robots.txt` + `noindex` meta on every page). The apex `ravisweets.com` is gated on production photography landing — see §"Going public" below.

---

## TL;DR

```bash
# Dev server (unchanged, full features incl. quick-view intercept)
pnpm --filter @ravisweets/storefront dev

# Static export locally (matches what CI builds)
pnpm --filter @ravisweets/storefront prepare-export:disable
BUILD_TARGET=github-pages pnpm --filter @ravisweets/storefront build
pnpm --filter @ravisweets/storefront prepare-export:restore
# Output lives at apps/storefront/out/

# Deploy (automatic on push to main); manual trigger:
gh workflow run deploy.yml
```

---

## How the pipeline works

`deploy.yml` runs two sequential jobs:

### 1. `build`

1. Checks out the repo.
2. Restores the pnpm cache + installs dependencies (`pnpm install --frozen-lockfile`).
3. Calls `actions/configure-pages@v5` to resolve the final deploy URL.
4. Runs `prepare-export:disable` — this script (at `apps/storefront/scripts/prepare-export.mjs`) temporarily renames `src/app/@modal` to `src/app/_modal.disabled`. Next.js 15 static export doesn't support App Router intercepted routes; on the static build the quick-view modal simply doesn't exist, and clicking a card navigates to the full `/product/[slug]` page instead. This is the expected, documented behaviour (see `openspec/changes/hamper-builder-and-public-launch/design.md` Decision 8).
5. Runs `BUILD_TARGET=github-pages pnpm build` with `PAGES_BASE_PATH` threaded through. Next.js emits `out/` with all pages as static HTML.
6. Sanity-checks that `apps/storefront/out/index.html` exists; fails the job if not.
7. Uploads `apps/storefront/out/` as a Pages artefact.

### 2. `deploy`

Calls `actions/deploy-pages@v4`, which publishes the artefact to the `github-pages` environment and returns a URL.

### Concurrency

One deploy at a time. If a second commit lands mid-deploy, it queues (does not cancel the in-progress one).

---

## Configuration

### Repo settings you must do once (stakeholder / admin)

In the repo on GitHub:

1. **Settings → Pages → Source**: pick "GitHub Actions" (not "Deploy from a branch").
2. The first workflow run will create the `github-pages` environment automatically. No secrets required.

### Environment variables used by the build

| Var | Where | Purpose |
|---|---|---|
| `BUILD_TARGET` | workflow | `github-pages` triggers `output: 'export'` in `next.config.mjs`. |
| `PAGES_BASE_PATH` | workflow | If deploying to `{user}.github.io/{repo}/`, set this to `/{repo}` so `_next/static` URLs resolve. Leave empty for user/org Pages or custom domain. |
| `NEXT_PUBLIC_SITE_URL` | workflow | Passed to the build so canonical / OG URLs are correct. |
| `NEXT_PUBLIC_*` feature flags | optional | See `.env.example`. Any flag left unset = default ON. Set to `off` / `false` / `0` to kill the moment. |

### `basePath` decision tree

- **Project Pages** (`https://{user}.github.io/ravisweets/`): set `PAGES_BASE_PATH=/ravisweets` in `deploy.yml`.
- **User/org Pages** (`https://{user}.github.io/`): leave `PAGES_BASE_PATH` empty.
- **Custom subdomain** (`https://preview.ravisweets.com`): leave empty; see §"Custom domain" below.
- **Apex domain** (`https://ravisweets.com`): leave empty; see §"Going public".

---

## Running the static export locally

Use this to replicate what CI builds before you push:

```bash
cd apps/storefront
node scripts/prepare-export.mjs disable       # temporarily removes @modal
BUILD_TARGET=github-pages pnpm build          # writes to ./out
npx serve out                                 # http://localhost:3000
node scripts/prepare-export.mjs restore       # restores @modal for dev
```

**Always run `restore` after** — otherwise your dev server will 404 on quick-view intercepts.

---

## Rollback

A bad deploy rolls back with a plain commit revert:

```bash
git revert HEAD
git push origin main
```

The deploy workflow will rebuild from the reverted state and republish within ~3–5 minutes.

For a faster rollback without touching history (e.g. to pin to a known-good commit):

```bash
gh workflow run deploy.yml --ref <good-sha>
```

---

## Custom domain

### Staging subdomain (recommended next step)

1. In DNS, add `CNAME preview → <user>.github.io` (or `<org>.github.io`).
2. Add `apps/storefront/public/CNAME` containing exactly one line:

   ```
   preview.ravisweets.com
   ```

3. Commit and push. GitHub issues a Let's Encrypt certificate automatically (can take ~15 min).
4. Verify HTTPS at `https://preview.ravisweets.com`.

### Apex domain

**Not yet approved.** Gated on the production photography shoot landing per the `elevate-storefront-visual-experience` photography-gating requirement. Do not flip until:

- Every hero / product / hamper / editorial image is real photography, not Unsplash.
- The "Dev only" watermark has been removed from all surfaces.
- A design reviewer has signed off on the imagery pass.

Once those are done, see §"Going public" below.

---

## Going public (SEO / indexing lift)

When photography is in and the brand is ready for search traffic:

1. Edit `apps/storefront/public/robots.txt` — replace `Disallow: /` with:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://ravisweets.com/sitemap.xml
   ```
2. Edit `apps/storefront/src/app/layout.tsx` — change `robots: { index: false, follow: false }` to `robots: { index: true, follow: true }` (or remove the key; Next's default is allow-indexing).
3. (Optional) Generate a real sitemap via `app/sitemap.ts` — currently we ship no sitemap, which is fine while disallowed.
4. Push. Deploy runs.
5. Verify in a new tab: fetch `/robots.txt` and confirm it no longer disallows, and view-source on a page to confirm the `<meta name="robots" content="noindex, nofollow">` tag is gone.
6. Submit the sitemap (if built) in Google Search Console.

---

## Things the pipeline does NOT do

- No preview deploys on PRs. (We could add one in the future — the existing `ci.yml` already runs `lint`/`build`/`size-limit`/`lighthouse` on PRs.)
- No automated rollback on failed Lighthouse budgets — `ci.yml` gates the PR, but once merged, a regression still deploys. Manual intervention (revert) is required.
- No backend deploy. The Medusa scaffold at `apps/backend/` has its own bring-up path (`docker compose up -d` locally; not yet deployed anywhere).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Deploy job fails at "Sanity-check output" | Build succeeded but no `index.html` emitted | Check the build logs — usually an exception in a page; the build shows which one. |
| 404s on `_next/static/*` after deploy | `basePath` mismatch | Set or unset `PAGES_BASE_PATH` in `deploy.yml` per the decision tree above. |
| Intercept routes broke dev after local export | Someone forgot `prepare-export:restore` | Run `pnpm --filter @ravisweets/storefront prepare-export:restore`. |
| First load of `/orders?id=...` shows empty | Order only exists in a different browser's localStorage | Expected — the order detail falls back to "not found" cleanly. |
| "Lighthouse CI failed" in `ci.yml` | Budget regression on a PR | Profile locally with `npx lhci autorun` in `apps/storefront`; shave JS or bail the PR. |
| Photography-gating reviewer flags a hero | Placeholder image slipped into a committed path | Revert the image; real photography is blocked on Task 7.2 of `elevate-storefront-visual-experience`. |
