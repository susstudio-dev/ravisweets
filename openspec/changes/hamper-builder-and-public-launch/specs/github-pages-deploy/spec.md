## ADDED Requirements

### Requirement: Next.js static export mode
The storefront SHALL support static export via `output: 'export'` in `next.config.mjs`, conditional on an env var `BUILD_TARGET=github-pages`. The dev workflow and the existing `ci.yml` build step MUST continue to build in standard mode (no static export); only the deploy pipeline opts into the export.

#### Scenario: Dev mode unchanged
- **WHEN** a developer runs `pnpm --filter @ravisweets/storefront dev`
- **THEN** the dev server starts normally and all routes (including dynamic) render as they do today

#### Scenario: Export mode when building for Pages
- **WHEN** `BUILD_TARGET=github-pages pnpm --filter @ravisweets/storefront build` runs
- **THEN** Next.js performs a static export to `out/`, and every previously-prerendered route emits a static HTML file

### Requirement: Graceful degradation of dynamic routes
Under static export, dynamic routes SHALL degrade as follows:
- **`/(.)product/[slug]` quick-view intercept** — intercept does not fire; card click falls through to the full `/product/[slug]` page navigation (client-side router handles the transition smoothly).
- **`/orders/[id]`** — a single static shell page is exported; client-side code reads `params.id` + localStorage on mount. If no local order matches, a themed "not found" fallback renders.
- Every route that does not require a server runtime MUST continue to work identically under static export.

#### Scenario: Quick-view becomes navigation
- **WHEN** a user on the static-exported site clicks a product card
- **THEN** the browser navigates to `/product/[slug]` with the existing client-side transition; no modal appears

#### Scenario: Orders page resolves from localStorage
- **WHEN** a user on the static-exported site visits `/orders/[id]` for an order they placed on this device
- **THEN** the client-side order detail renders from localStorage; if the ID isn't local, the existing not-found fallback renders

### Requirement: GitHub Actions deploy workflow
A workflow at `.github/workflows/deploy.yml` SHALL run on push to `main` and:
1. Check out the repo.
2. Install pnpm (cache restored).
3. Build the storefront with `BUILD_TARGET=github-pages`.
4. Upload the `apps/storefront/out/` directory as a GitHub Pages artefact.
5. Deploy via `actions/deploy-pages@v4` using GitHub's `github-pages` environment.

The workflow MUST reuse the `pnpm-lock.yaml` cache strategy from `ci.yml` and MUST have `permissions: pages: write, id-token: write`.

#### Scenario: Push to main triggers deploy
- **WHEN** a commit is pushed to `main`
- **THEN** the `deploy` workflow runs, builds, and publishes to the `github-pages` environment, and a deployment URL is posted to the commit

#### Scenario: PR does not deploy
- **WHEN** a PR is opened
- **THEN** the deploy workflow does NOT run; only `ci.yml` runs

### Requirement: Static-asset path correctness
The deploy configuration MUST ensure `_next/static/*` and image assets resolve correctly under the GitHub Pages hosting path (which may be `https://{user}.github.io/{repo}/` for a project Pages site or `https://{user}.github.io/` for a user Pages site). A `basePath` + `assetPrefix` SHALL be set in `next.config.mjs` when `BUILD_TARGET=github-pages` if the host requires a repo-scoped subpath.

#### Scenario: Asset paths resolve
- **WHEN** the deployed site is loaded
- **THEN** every `_next/static/*` URL returns HTTP 200 and images render without 404s

### Requirement: `.nojekyll` and `CNAME`
The static output MUST include a `.nojekyll` file at its root to prevent GitHub Pages' Jekyll processing from eating `_next` asset folders. A `CNAME` file MUST be present only if a custom domain is configured.

#### Scenario: .nojekyll present in artefact
- **WHEN** the deploy artefact is inspected
- **THEN** a `.nojekyll` file exists at the artefact root

#### Scenario: No CNAME by default
- **WHEN** the repo is cloned freshly and no custom domain is configured
- **THEN** no `CNAME` file is present in the output

### Requirement: Staging-first domain rollout
The recommended first deploy target SHALL be GitHub's default Pages URL (`https://{user}.github.io/{repo}/`) OR a staging subdomain (e.g., `preview.ravisweets.com`). The apex `ravisweets.com` SHALL NOT be pointed at GitHub Pages until the production photography shoot has landed per the elevate-storefront-visual-experience photography-gating requirement.

#### Scenario: Apex domain gated
- **WHEN** a contributor proposes changing the CNAME to `ravisweets.com`
- **THEN** the PR description must confirm that production photography has landed, and the reviewer verifies no "Dev only" watermarks remain on hero imagery

### Requirement: Search-engine indexing control
While staging, the site SHALL be disallowed from crawling via a `robots.txt` at the site root that contains `User-agent: * / Disallow: /`, AND every page SHALL include a `noindex, nofollow` meta tag. Both gates SHALL lift only when the production photography lands and the apex domain is flipped.

#### Scenario: Staging robots disallow
- **WHEN** `https://{staging-host}/robots.txt` is fetched
- **THEN** the response contains `User-agent: * ` followed by `Disallow: /`

#### Scenario: Noindex meta on every page
- **WHEN** the HTML of any deployed page is inspected
- **THEN** `<meta name="robots" content="noindex, nofollow">` is present in the head

### Requirement: Deploy runbook
A deploy runbook SHALL live at `docs/deploy.md` (or `apps/storefront/README.md`'s "Deploy" section — decided during implementation) covering: how to run the static export locally, how to trigger a manual deploy, how to roll back by reverting the commit, how to configure a custom domain, and how to toggle the index-gating once photography lands.

#### Scenario: Runbook exists
- **WHEN** a new contributor asks how to deploy
- **THEN** the runbook answers every operational question above in a single document
