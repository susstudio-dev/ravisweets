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

Verify in **Table Editor**: you should see `customers`, `products`, `variants`, `orders`, `coupons`, `theme_presets`, `store_settings`, `reviews`, `support_threads`, `promotions`, `team_invitations`, and friends (23 tables total).

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

Deploy with the Supabase CLI:

```bash
supabase login
supabase link --project-ref <NEW_PROJECT_REF>
supabase functions deploy send-order-email
supabase functions deploy team-management
supabase secrets set RESEND_API_KEY=re_xxx           # required by send-order-email
supabase secrets set "ORDER_FROM_EMAIL=Ravi Sweets <orders@yourdomain.com>"  # optional
```

`team-management` needs no extra secrets (it uses the auto-injected service-role key).

---

## Part 2 — Cloudflare Pages

Two ways to deploy; **Option A is recommended** (mirrors the existing GH Pages workflow, keeps CI in one place).

### Option A — GitHub Actions (workflow already in repo)

[.github/workflows/deploy-cloudflare.yml](.github/workflows/deploy-cloudflare.yml) builds the static export and pushes it with wrangler on every push to `master`/`main`.

**One-time setup:**

1. **Create the Pages project** (either):
   - Dashboard: **Workers & Pages → Create → Pages → Upload assets**, name it `ravisweets` (you can cancel after the project exists), or
   - CLI: `npx wrangler pages project create ravisweets --production-branch=master`
2. **API token**: Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom token** with permission **Account · Cloudflare Pages · Edit**.
3. **Account ID**: shown on the dashboard's Workers & Pages overview (right sidebar).
4. GitHub repo → **Settings → Secrets and variables → Actions**:

| Kind | Name | Value |
|------|------|-------|
| Secret | `CLOUDFLARE_API_TOKEN` | token from step 2 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | account ID from step 3 |
| Variable (optional) | `CLOUDFLARE_PAGES_PROJECT` | defaults to `ravisweets` |
| Variable (optional) | `NEXT_PUBLIC_SITE_URL` | defaults to `https://ravisweets.pages.dev`; set to the custom domain when you add one |
| Variable (later) | `NEXT_PUBLIC_INDEXING_ENABLED` | leave unset until launch (see §2.3) |

5. Push to `master` (or run the workflow manually from the Actions tab).

> The old GitHub Pages workflow (`deploy.yml`) still fires on the same pushes. Keep it during the transition if you want, then delete it once Cloudflare is canonical.

### Option B — Cloudflare Git integration (build runs on Cloudflare)

**Workers & Pages → Create → Pages → Connect to Git**, pick the repo, then:

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `pnpm --filter @ravisweets/storefront prepare-export:disable && pnpm --filter @ravisweets/storefront build` |
| Build output directory | `apps/storefront/out` |
| Root directory | `/` (repo root — pnpm workspace) |

Environment variables (Production):

| Name | Value |
|------|-------|
| `BUILD_TARGET` | `cloudflare` |
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.pages.dev` or the custom domain |
| `NODE_VERSION` | `20` |
| `NEXT_PUBLIC_INDEXING_ENABLED` | set to `true` only at launch |

pnpm 9.15.9 is picked up automatically from the `packageManager` field in the root `package.json`. Do **not** set `PAGES_BASE_PATH` — Cloudflare serves at the domain root.

### 2.1 Why `prepare-export:disable`

Next's static export doesn't support the `@modal` intercepted route (product quick-view). The script renames it aside before building; on the static site a product-card click does a full-page navigation instead. This is intentional and matches the GH Pages build.

### 2.2 Custom domain

Pages project → **Custom domains** → add `ravisweets.com` (or subdomain). Then update the `NEXT_PUBLIC_SITE_URL` variable and redeploy so canonicals, sitemap, and the stores-page JSON-LD all point at the real domain.

### 2.3 SEO gate

`robots.txt` is generated by [robots.ts](apps/storefront/src/app/robots.ts) and serves **`Disallow: /`** until `NEXT_PUBLIC_INDEXING_ENABLED=true` is set at build time — the photography-gating rule from the visual spec. Flip it (plus custom domain) at launch and redeploy. The conflicting static `public/robots.txt` was removed; `robots.ts` is the single source of truth.

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
- [ ] Retire `.github/workflows/deploy.yml` (GH Pages) once Cloudflare is canonical.
