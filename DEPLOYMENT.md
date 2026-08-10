# Deployment runbook — Cloudflare Pages + Supabase

The storefront is a **fully static Next.js export** (no API routes, no middleware, no server). Cloudflare Pages serves the files; everything dynamic — auth, orders, coupons, reviews, admin — talks to **Supabase directly from the browser** using the anon key, with Row-Level Security enforcing access. The Medusa app in `apps/backend` is not part of this deployment.

```
Browser ──► Cloudflare Pages (static HTML/JS/CSS)
   │
   └──────► Supabase (Postgres + Auth + Storage + Edge Functions)
```

> **Note:** the original Supabase project (`soriromiepeoacibhpex`) was **deleted**. Part 1 provisions a replacement from scratch.

---

## Part 1 — Supabase (fresh project)

### 1.1 Create the project

1. https://supabase.com/dashboard → **New project**.
2. Region: **Mumbai (ap-south-1)** — closest to the customer base.
3. Save the database password somewhere safe (only needed for `psql`/CLI, never in code).

### 1.2 Run the schema SQL — order matters

`SETUP_ALL.sql` is **not** a full setup: it only consolidates migrations 0005–0009 and assumes 0001–0004 are already applied. In the dashboard **SQL Editor**, paste and run the *contents* of each file (not the path) in exactly this order:

| # | File | Notes |
|---|------|-------|
| 1 | `supabase/migrations/0001_init.sql` | Core schema, RLS helpers, default theme seed |
| 2 | `supabase/migrations/0002_content_reviews_festivals.sql` | Run **before** the other 0002 |
| 3 | `supabase/migrations/0002_product_unit_mode.sql` | One-shot: its `create type` errors on re-run |
| 4 | `supabase/migrations/0003_product_sale_pricing.sql` | |
| 5 | `supabase/migrations/0004_nutrition_festival_storage.sql` | One-shot: storage policies lack drop-guards. Creates the `product-images` bucket |
| 6 | `supabase/SETUP_ALL.sql` | Consolidates 0005–0009; idempotent, safe to re-run. Creates the `review-photos` bucket |
| 7 | `supabase/migrations/0010_security_hardening.sql` | Security-audit follow-up: pins review inserts to `pending`, scopes promotions/enquiry writes, constrains the review-photos bucket. Idempotent |
| 8 | `supabase/migrations/0011_batch_card_world.sql` | Activates the `batch-card` theme preset and blanks dead `ravisweets.com` hero image URLs. Idempotent |
| 9 | `supabase/migrations/0012_global_voice.sql` | Hero copy rewrite in `site_content` + `theme_presets` (removes Khammam-era voice). Idempotent |
| 10 | `supabase/migrations/0013_media_library.sql` | **Media library**: creates the `media` bucket, `media_assets` registry, and `site_content_versions` + snapshot trigger. `/admin/photos` and `/admin/media` need this. Idempotent |
| 11 | `supabase/migrations/0014_seed_products.sql` | Seeds 83 products + 165 variants from the bundled catalogue. Every insert is `on conflict do nothing`, so re-running never overwrites admin edits. Product photo edits in `/admin/products` need this |
| 12 | `supabase/migrations/0015_publish_state.sql` | **Publishing**: creates the single-row `publish_state` table the `publish-site` edge function uses to coalesce rebuild requests. Admin-read only; written solely by that function. Idempotent |

Verify in **Table Editor**: you should see `customers`, `products`, `variants`, `orders`, `coupons`, `theme_presets`, `store_settings`, `reviews`, `support_threads`, `promotions`, `team_invitations`, `media_assets`, `site_content_versions`, `publish_state`, and friends (26 tables total).

#### The media library (0013 + 0014)

One public bucket, `media`, holds every owner-managed photo (8 MB / image-MIME caps are a server-side backstop — the admin client downsizes uploads to ≤2400px WebP before they leave the browser). The `media_assets` table carries alt text, kind, and dimensions; `site_content.page_media` references assets **by id**. In the admin:

- **Photos** tab → assign a photo to any page slot (About, Stores, Corporate tiers, each Festival, Brand logo). Saves are live on the public site within seconds via Realtime — no rebuild. History + one-click restore included.
- **Media** tab → upload/search/manage the library itself (alt text, usage, guarded delete).
- **Products** → each product's image gallery pulls from the same library. These edits only take effect once `0014_seed_products.sql` has been applied (the admin tells you honestly when a product isn't in the database yet).

The legacy `product-images` bucket is superseded: new uploads all go to `media/`.

### 1.3 Auth settings (dashboard → Authentication)

| Setting | Value | Why |
|---------|-------|-----|
| **Email provider** | ON (default) | Customer sign-in uses both email OTP (`signInWithOtp`) and password |
| **Anonymous sign-ins** | **ON** ⚠ (Settings → Allow anonymous sign-ins) | The storefront calls `signInAnonymously()` on load to give guests an RLS identity — without this, guest checkout writes fail |
| Custom SMTP | Recommended before launch | Supabase's built-in email service is rate-limited (~a few OTPs/hour) |
| Phone provider | OFF for now | MSG91 setup is gated on DLT approval — see `SUPABASE-SETUP.md` §3. Flip `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` when ready |

### 1.4 Create the admin user

1. **Authentication → Users → Add user → Create new user**
2. Your email + a strong password, check **Auto Confirm User**.
3. Open the created user → edit **App Metadata** to:
   ```json
   { "role": "admin" }
   ```
   Recognized staff roles: `founder`, `admin`, `ops`, `marketing`, `accountant` (founder/admin get every permission). Further staff are invited from `/admin/team` once the `team-management` edge function is deployed.

There is no MFA step — the "MFA on first login" line in the old runbook was never implemented.

### 1.5 Point the app at the new project

**Project Settings → API** → copy the **Project URL** and the **anon / publishable key** into [apps/storefront/.env.production](apps/storefront/.env.production) (currently holding `YOUR_PROJECT_REF` placeholders). These two values are public by design — RLS is the security boundary; never commit the `service_role` key.

Commit the change — the deploy builds read this file.

### 1.6 Edge functions (optional — site launches fine without them)

| Function | Enables | Without it |
|----------|---------|-----------|
| `send-order-email` | Transactional order-status emails via [Resend](https://resend.com) | Emails silently skip (calls are fire-and-forget) |
| `team-management` | Staff invites / role changes on `/admin/team` | That admin page is non-functional |
| `publish-site` | The admin's **Publish** button — asks Cloudflare Pages to rebuild so build-time content (the baked catalogue and page content) goes live | Admin edits still save and Realtime-driven copy still updates live, but anything baked at build time waits for the next git push or a manual Cloudflare deploy |

Deploy with the Supabase CLI:

```bash
supabase login
supabase link --project-ref <NEW_PROJECT_REF>
supabase functions deploy send-order-email
supabase functions deploy team-management
supabase functions deploy publish-site
supabase secrets set RESEND_API_KEY=re_xxx           # required by send-order-email
supabase secrets set "ORDER_FROM_EMAIL=Ravi Sweets <orders@yourdomain.com>"  # optional
supabase secrets set CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx  # required by publish-site
```

`team-management` needs no extra secrets (it uses the auto-injected service-role key).

#### Publishing (`publish-site` + 0015)

Get the hook from the Pages project → **Settings → Builds & deployments → Deploy hooks → Add deploy hook** (branch: the production branch). That URL **is** the credential — it accepts an unauthenticated POST, so anyone holding it can spend the account's build minutes. It belongs in Supabase function secrets only; a static export has no server to hide it in, and a `NEXT_PUBLIC_*` name would publish it in the browser bundle.

Behaviour, all enforced server-side:

- **Admin only.** The caller's JWT is verified against the Auth server and must carry `app_metadata.role = 'admin'` — the same claim `is_admin()` checks. `verify_jwt` alone is not enough, because anonymous sign-ins are on and every guest holds a valid token.
- **Repeat publishes inside 5 minutes coalesce into one build.** The window lives in `publish_state` (migration **0015** — without it the function returns a 500 saying so), because edge isolates share no memory.
- **A coalesced publish is not dropped.** It stamps `pending_since` on the row and the response returns `nextEligibleAt` / `retryAfterSeconds`; the next build that runs clears the marker and reports the pending edits it swept up. Responses are `{ triggered, coalesced, expectedLiveAt, … }` — a coalesced request is a 200, not an error.

---

## Part 2 — Cloudflare Pages (the only deploy path)

Cloudflare builds and deploys the site itself, straight from GitHub — no GitHub
Actions and no GitHub secrets. The old GitHub Pages workflow and the
GitHub-Actions Cloudflare workflow have been **removed**; the only workflow left
is `ci.yml`, which runs lint/test/build checks and never deploys.

**Workers & Pages → Create → Pages → Connect to Git**, pick the repo, then:

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `pnpm run build` (the default — see note) |
| Build output directory | `apps/storefront/out` |
| Root directory | `/` (repo root — pnpm workspace) |
| Deploy command (Workers projects only) | `npx wrangler deploy` (uses `wrangler.jsonc`) |

> **The default `pnpm run build` now works out of the box.** The repo-root
> `build` script builds only the storefront as a static export (via
> `apps/storefront/scripts/build-cloudflare.mjs`) — it sets `BUILD_TARGET`
> itself, disables the `@modal` intercept route, and skips the Medusa backend
> (whose `medusa build` would otherwise fail the run). So you do **not** need to
> customise the build command or set `BUILD_TARGET` — just point the output
> directory at `apps/storefront/out`.

Environment variables (Production) — all optional:

| Name | Value | Effect if unset |
|------|-------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.pages.dev` or custom domain | On Pages, auto-filled from `CF_PAGES_URL`; otherwise falls back to the GitHub Pages URL |
| `NEXT_PUBLIC_INDEXING_ENABLED` | `true` only at launch | robots.txt stays `Disallow: /` |

pnpm 9.15.9 is picked up automatically from the `packageManager` field in the root `package.json`. Do **not** set `PAGES_BASE_PATH` — Cloudflare serves at the domain root.

### 2.1 Why `prepare-export:disable`

Next's static export doesn't support the `@modal` intercepted route (product quick-view). The script renames it aside before building; on the static site a product-card click does a full-page navigation instead. This is intentional and matches the GH Pages build.

### 2.2 Custom domain

Pages project → **Custom domains** → add `ravisweets.com` (or subdomain). Then update the `NEXT_PUBLIC_SITE_URL` variable and redeploy so canonicals, sitemap, and the stores-page JSON-LD all point at the real domain.

### 2.3 SEO gate

`robots.txt` is generated by [robots.ts](apps/storefront/src/app/robots.ts) and serves **`Disallow: /`** until `NEXT_PUBLIC_INDEXING_ENABLED=true` is set at build time — the photography-gating rule from the visual spec. Flip it (plus custom domain) at launch and redeploy. The conflicting static `public/robots.txt` was removed; `robots.ts` is the single source of truth.

---

## Part 2.5 — Where credentials live (and what's safe in git)

The site is static + Supabase-from-the-browser, so there are only two kinds of
value, and the rule is simple: **public config can live in git; every real
secret lives outside git — and outside Cloudflare too.**

### Safe to commit (already in `apps/storefront/.env.production`)

- `NEXT_PUBLIC_SUPABASE_URL` — the project URL. Public.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the **anon / publishable** key. Public by
  design: it ships in the browser bundle no matter what, and it cannot bypass
  Row-Level Security. RLS is the security boundary, not this key.
- `NEXT_PUBLIC_*` feature flags and `NEXT_PUBLIC_SITE_URL`. Public.

Anything named `NEXT_PUBLIC_` is **baked into the public JavaScript at build
time**, so never put a secret behind that prefix — and never expect a secret to
be "hidden" in a Cloudflare build variable. A static export has no server on
Cloudflare, so there is nowhere on Cloudflare for a secret to hide.

### Never in git, never in `.env.production`, never in Cloudflare

| Secret | Where it belongs |
|--------|------------------|
| **Database password** / `postgresql://…` connection string | Your password manager only. For migrations, pass it via an env var at run time (`PGPASSWORD=…`) or use the Supabase CLI — never write it to a tracked file. |
| **`service_role` key** (bypasses RLS) | Supabase only — Edge Functions read it via `supabase secrets set`. Never in the client or the repo. |
| **Resend / MSG91 / (later) Razorpay·Stripe secret keys** | Supabase Edge Function secrets, or the payment provider's server side. Never in the static site. |
| **Cloudflare Pages deploy-hook URL** (`CLOUDFLARE_DEPLOY_HOOK_URL`) | Supabase Edge Function secrets only — `publish-site` reads it. The URL is the whole credential: it takes an unauthenticated POST, so anyone with it can trigger builds. Rotate by deleting the hook in the Pages project and creating a new one. |

`.env.local` (your local dev copy) is gitignored and also holds only the public
anon key — keep it that way.

> The database password was shared in chat during setup — **rotate it** in
> Supabase → **Settings → Database → Reset database password**, and pick one
> without a `"` character (it breaks connection-string quoting).

---

## Part 3 — Verify the deploy

1. `https://<site>/` renders; product card click → `/product/<slug>/` full page.
2. `https://<site>/robots.txt` → `Disallow: /` (until the launch flip).
3. A garbage URL (`/no-such-page`) renders the custom 404.
4. With Supabase wired: sign in with email OTP from the account menu; place a test order; confirm the row in **Table Editor → orders**; `/admin/login` accepts the admin user.
5. If placeholders are still in `.env.production`, the site runs in localStorage-only demo mode and `/admin` shows the "Connect Supabase" screen — that's the graceful fallback, not a bug.

---

## Known gaps / launch checklist

- [ ] **`products` / `variants` tables are never seeded.** The storefront renders the static catalogue from `packages/shared`, but admin product edits (price, stock, sale pricing, images) update DB rows *by catalogue ID* and silently no-op while those rows don't exist; reviews and stock tracking FK onto them. A one-time catalogue → DB import script is still needed (not in the repo yet).
- [ ] Custom SMTP in Supabase before real OTP volume.
- [ ] MSG91 + DLT → enable phone provider → `NEXT_PUBLIC_PHONE_OTP_ENABLED=true`.
- [ ] Launch flip: custom domain + `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_INDEXING_ENABLED=true`.
- [x] GitHub Pages + GitHub-Actions Cloudflare workflows removed — Cloudflare Git integration is the only deploy path.
- [ ] In GitHub → **Settings → Pages**, set Source to **None** (or leave it; the last GH Pages build stays crawl-blocked and goes stale). Optionally disconnect the stale **Vercel** integration in the Vercel dashboard.
