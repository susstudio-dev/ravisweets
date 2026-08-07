# Owner-editable media, real data, and the hero recomposition

**Date:** 2026-08-06
**Branch at time of writing:** `feat/storefront-anjeer-pista-foundation`
**Supersedes:** the `cms-content` spec in `openspec/changes/add-admin-auth-coupons-and-builder-depth/` (its build-webhook + `?preview=1` model was never implemented and is replaced here).

---

## 1 · Why

The owner asked for three things:

1. The home page hero's left column needs to be better.
2. Real production data everywhere — logo included — so the site can go live properly.
3. An admin where every photo on the site, from the hero down to individual product shots, can be changed easily. Explicitly modelled on `dancehyderabad.com` (the sibling repo `../furor-web`).

They are separate projects with one shared dependency: none of them work until images have somewhere to live and something to read them back.

---

## 2 · What is actually true today

Established by direct inspection, not assumption. File references are repo-relative.

### 2.1 There is not one photograph on the site

All 87 product image URLs are constructed by `ravi()` at `packages/shared/src/catalogue/products.ts:33-35`, pointing at `https://ravisweets.com/wp-content/uploads/…` — the retired WordPress library. Those URLs now return **HTTP 404** (verified 2026-08-05). `apps/storefront/src/lib/images.ts:24` lists `ravisweets.com` in `RETIRED_HOSTS`, so `isUsableImage()` returns `false` for all of them and `apps/storefront/src/components/product-card.tsx:75-87` renders a dashed rotated diamond instead.

`apps/storefront/public/` contains exactly three files: `.nojekyll`, `_headers`, `brand/paisley.svg`.

### 2.2 The logo was never in the repository

`git log --all --diff-filter=A` over all image extensions returns a single asset: `apps/storefront/public/brand/paisley.svg`. No logo *file* was ever committed — the real logo was always **hotlinked** from WordPress.

The exact URL is recoverable from history. Commit `652e4fd` (2026-08-02) removed this constant from `apps/storefront/src/components/header.tsx`:

```
RAVI_LOGO_URL =
  'https://ravisweets.com/wp-content/uploads/2025/09/
   cropped-WhatsApp_Image_2025-09-04_at_5.28.12_PM-removebg-preview-1-1.png'
```

and replaced it with the code-drawn katli lockup now in `brand/logo.tsx`. That commit's message states the reason: *"ravisweets.com (the old WordPress host every image hotlinks) now answers HTTP 402 — hosting suspended."*

The filename identifies the provenance: a WhatsApp image sent 2025-09-04 at 17:28, background-removed via remove.bg, then set as the WordPress Site Logo (hence the `cropped-` prefix). The master artwork is therefore most likely in the owner's WhatsApp history or photo library around that date.

**It is not recoverable from the Wayback Machine.** Only 42 assets from ravisweets.com are archived, all from 2020–2021; no 2025 upload was ever captured. What *is* archived is the earlier mark:
`https://web.archive.org/web/20211012135955if_/https://ravisweets.com/wp-content/uploads/2021/09/Logo-2-300x150.png`
— Surya's sun-chariot in gold/orange with a red script wordmark (apt: *Ravi* = sun), 300×150 raster. The other 41 assets are 2021-era product shots usable only as a last-resort fallback.

**Still the highest-value recovery path for photography:** HTTP 402 means suspended, not deleted, and the domain was repointed to Cloudflare rather than the WordPress files being removed. If the old hosting account or any backup export is recoverable, all 87 product images return together, collapsing most of §6.5.

### 2.2.1 The logo — RESOLVED 2026-08-07

The owner supplied vector artwork at `assets/logo/Ravi Sweets Logo.pdf`, which supersedes every recovery path above.

**Provenance is confirmed by content:** it depicts Surya's chariot — the sun god's *ratha* drawn by seven horses through cloudbanks against a rising sun, with the wordmark below. The same concept as the 2021 mark recovered from the Archive, considerably developed. The identity has been consistent throughout, so nothing about the earlier mark needs preserving.

**Technical facts, read from the file:**

| Property | Value |
|---|---|
| Format | PDF 1.4, single page, 613 KB |
| Page | 500 × 500 pt |
| Artwork bounds | 1.405 : 1 landscape — **not square**; the page carries ~9% slack above and ~20% below |
| Content | 3,977 path operations (2,886 Bézier curves), 0 raster image XObjects |
| Gradients | 5 shadings, 2 alpha masks |
| Type | one embedded subset, `FAALAJ+SamarkanNormal` |

**Exact palette, extracted from the content streams** (not eyedropped):

| Role | Value |
|---|---|
| Wordmark red | `#FF0000` |
| Sunburst ramp | `#FF0000` → `#FFD100` |
| Sun disc gold | `#D3AA00` |
| Chariot gold | `#CC7C0C` |
| Chariot / horses | `#000000` |
| Cloud greys | `#EDEDED`, `#DADADA` |

Three consequences, each requiring work in §6.5:

1. **The artwork has an opaque white background.** It is not transparent. Placed on the manila hero ground unmodified it shows a white rectangle. The background fill must be dropped during SVG conversion.
2. **It is illegible below roughly 100 px.** Rendered at the header's 32 px the seven horses collapse into a smear and the wordmark is unreadable; 64 px is little better. Verified by rendering at the exact sizes the site uses. A **two-tier logo system is required** — see §6.5.
3. **`#FF0000` cannot be `--color-brand`.** See §6.5.1.

The `SamarkanNormal` wordmark must be converted to outlines during SVG conversion, so the site carries no dependency on a font it does not ship.

`--color-brand: #A81B1B` is documented as a placeholder pending the logo file in **three** places — `apps/storefront/src/app/globals.css:51-57`, `apps/storefront/src/lib/theme/palette.ts:118-130`, `apps/storefront/src/app/layout.tsx:102-104` — and `apps/storefront/src/lib/theme/globals-sync.test.ts` pins two of them together. They must change in lockstep.

### 2.3 The admin writes to tables nothing reads

`apps/storefront/src/lib/supabase/products.ts` exports 18 functions and **every one is a write**. There is no `listProducts()` anywhere in the repo. The `products` and `variants` tables have never been seeded — no `insert into public.products` exists across `supabase/SETUP_ALL.sql` or any of the 13 migrations.

Every storefront page instead renders from the hardcoded `CATALOGUE` array (`packages/shared/src/catalogue/products.ts:67`, **24 SKUs** carrying 87 image URLs between them), consumed by the home page, `/shop`, `/category/[slug]`, `/product/[slug]` (`generateStaticParams`, :26-28), `/search`, and `sitemap.ts`.

Note: `PROPOSAL.md` §4 claims "80+ products" and the revenue-path spec repeats it. Both are stale — the array holds 24. Treat 24 as the seeding scope and the 80+ figure as an aspiration.

Consequence: a PostgREST `.update().eq()` against zero matching rows returns success, so `apps/storefront/src/components/admin/admin-products.tsx:492-494` displays "Saved ✓" for an edit that changed nothing. **The admin is currently theatre for products, pricing, stock and images.**

Only three admin surfaces actually alter the live site: theme palette, promo strip, and hero copy.

### 2.4 Deployment forbids server code

`apps/storefront/next.config.mjs:6-8,20-40` sets `output: 'export'`, `trailingSlash`, and `images.unoptimized: true` when `BUILD_TARGET` is set; `apps/storefront/scripts/build-cloudflare.mjs:17` sets it, and root `package.json:11` maps `pnpm run build` to that script. There are no route handlers, no `middleware.ts`, no server actions, and no `_worker.js`. `wrangler.jsonc:9-12` serves `apps/storefront/out` as static assets.

The only server-side execution available is Supabase Edge Functions. Three exist: `razorpay-order`, `send-order-email`, `team-management`. `supabase/functions/razorpay-order/index.ts:5-7` describes itself as "the only trusted execution context the project has."

`apps/storefront/src/lib/supabase/client.ts:26` returns `null` when `typeof window === 'undefined'`, so the browser client **cannot** participate in a build. A separate Node client is required for build-time reads.

### 2.5 Image upload exists, but only for products

`apps/storefront/src/lib/supabase/products.ts:109-115` uploads to the `product-images` bucket and returns a public URL. That bucket, with admin-only write RLS, was created in `supabase/migrations/0004_nutrition_festival_storage.sql:31-59`. A second bucket, `review-photos`, is hardened in `supabase/migrations/0010_security_hardening.sql:44-65` with per-user folders plus size and MIME caps.

No other image on the site — hero, categories, festivals, stores, about, OG — can be changed without a code edit.

### 2.6 Security defects found while mapping

- **Role mismatch.** `apps/storefront/src/lib/supabase/session-context.tsx:41,134-138` accepts `founder|admin|ops|marketing|accountant`. `supabase/migrations/0001_init.sql:9-18` defines `is_admin()` to accept only `'admin'`. Four staff roles therefore receive a fully rendered admin whose every write silently fails RLS.
- **Credential-adjacent disclosure.** `apps/storefront/src/components/admin/admin-login.tsx:144-146` prints the role-granting SQL to any visitor.
- **Admin is public static HTML.** The gate is a `useEffect` redirect (`apps/storefront/src/components/admin/admin-shell.tsx:90-105`). Under static export the admin route HTML and bundle are downloadable by anyone and indexable by crawlers. Actual protection is RLS alone. `next.config.mjs` `headers()` is ignored by static export, so headers must live in `apps/storefront/public/_headers`.

### 2.7 No schema validation anywhere

`zod` is not a dependency of any workspace package. `site_content.data` is untyped `jsonb`, cast with `as` in `apps/storefront/src/lib/supabase/site-content.ts`. This is tolerable while three fields are editable and becomes the primary failure mode once an owner can edit everything.

### 2.8 Unrun migration

`supabase/migrations/0012_global_voice.sql` has never been applied. Because of that, `apps/storefront/src/components/hero/hero-batch.tsx:53-55` carries a `quarantine()` regex that silently discards any DB string matching `/khammam|telangana|ఖమ్మం/i`, falling back to code defaults.

### 2.9 The reference project cannot be copied directly

`../furor-web` deploys to Cloudflare **Workers** via `@opennextjs/cloudflare`. Every page renders per request (`src/app/layout.tsx:74` calls `await connection()`; the build's `prerender-manifest.json` contains no dynamic routes and zero prerendered HTML pages). That runtime is what makes its `/api/admin/save`, `/api/admin/upload`, and `src/middleware.ts` JWT gate possible, and why edits appear in ~30s with no rebuild.

Under `output: 'export'` the Furor design does not degrade — it fails to build. `export const dynamic = 'force-dynamic'` (14 occurrences) is illegal in a static export, all 7 route handlers cease to exist, and `middleware.ts` is unsupported.

**What ports is the shape, not the code:** a single validated content schema, one storage seam every consumer goes through, server-side authorization of writes, version snapshots with restore, and an audit trail. Ravisweets already owns a server for all of this — Supabase — so the Furor pattern is re-expressed against Postgres + Storage + RLS rather than R2.

---

## 3 · Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Keep the static export. Bake at build, overlay at runtime.** | Preserves SEO-correct HTML and the current cheap deploy; additive, so the live site is never at risk. Rejected: migrating to OpenNext/Workers (real migration of a 39-route store with cart and checkout, against a live site); rejected: runtime-only fetching (crawlers see empty shells, LCP suffers, and search traffic is revenue here). |
| D2 | **Products move into Supabase.** | Forced by D1 — a build can only bake what the database holds. Also the only way the existing admin stops being theatre. |
| D3 | **A central media library with a picker at every image slot.** | Upload once, reuse anywhere, one screen showing every photo on the site. Rejected: Furor's per-field-only upload (no reuse, no overview); deferred: in-place editing on the live storefront. |
| D4 | **Content references an asset ID, never a URL.** | Baking absolute Storage URLs into rows makes any future storage migration a find-and-replace across the database. |
| D5 | **Adopt Zod for the content schema.** | §2.7. One composed schema, `.default()` on every branch, and one shared `imageRef` type used by *every* image field — Furor uses bare `z.string()` for images and its own report flags that as the thing not to copy. |
| D6 | **Version snapshots with one-click restore.** | Owner-confirmed. One table plus a trigger; cheap insurance for a non-technical owner editing a live store. |
| D7 | **Founding year is 1983.** | Owner-confirmed 2026-08-06. `PROPOSAL.md`, `GROWTH_PLAN.md` and `ADMIN_BLUEPRINT.md` say 1985 and are wrong. |
| D8 | **Publishing runs through a Supabase Edge Function.** | A static export has nowhere to hide a Cloudflare deploy-hook secret. Matches the existing three-function pattern. |
| D9 | **`--color-brand: #CC0000`; the logo artwork keeps `#FF0000`.** | Owner-decided 2026-08-07. Logos are exempt from contrast rules; UI text is not, and CI enforces it. §6.5.1. |
| D10 | **Two-tier logo: full lockup ≥160px, compact mark ≤64px.** | Forced by measurement — the full mark is illegible at the header's 32px (§2.2.1). |

---

## 4 · Section one — the hero left column

Target: `apps/storefront/src/components/hero/hero-batch.tsx:142-192`.

All four defects the owner identified are in scope: a flat wall of text, bad headline breaks, two competing red lines, and no proof or photograph.

### 4.1 Headline breaks on sense, not on width

The copy is DB-driven, so line breaks cannot be hardcoded. Split the headline on **sentence** boundaries and render each sentence as a block-level span; wrapping inside a sentence stays natural. "Made this morning." can then never be orphaned from what follows, and the behaviour holds for any copy the owner later types.

The existing per-word `.fb-word` stagger (`animationDelay: i * 0.06s`) is preserved *within* each sentence; the delay counter runs continuously across sentences so the sequence is unchanged.

### 4.2 Red regains its monopoly

Today the festival deadline (`:163-170`) and the trust row (`:189-191`) are both uppercase, tracked-out, `.fb-tick`-animated — identical treatment for urgency and trust, which reads as a matched pair and blunts the deadline.

- The **festival deadline** becomes a compact ruled stamp chip and moves down beside the CTAs, where urgency sits next to action. It keeps `var(--color-brand)`.
- The **trust row** loses `.fb-tick` and loses brand red, becoming the proof block below.

After this, exactly one red element remains in the left column.

### 4.3 A proof block, in the existing docket language

Replaces the single 12px ruled line with three ruled cells — numerals in `font-display`, labels in `.field-label`, rules in `var(--color-rule)`:

```
1983             NIL              SAME-DAY
family kitchen   preservatives    dispatch
```

Values are DB-driven through the same three-tier `site_content → theme preset → code default` chain the hero already uses, so they are owner-editable. This is the second focal point the column currently lacks.

### 4.4 Layout and motion

- Grid (`:140`) changes `items-center` → `items-start`. The left column is taller than the card at most widths, so centring floats the card in dead space.
- The proof block ticks in after the CTAs using the existing `.fb-tick` mechanism, extending the authored sequence rather than adding a new one.
- All motion remains transform/opacity and continues to die under `prefers-reduced-motion` via the existing global block in `globals.css`.

### 4.5 The photograph

The left column stays the word; the right column becomes the image. `FestivalCutout` (`:399-427`) currently renders inline SVG "specimen marks"; its own comment at `:394-398` anticipates the swap to real photography in the same frame, keeping the bob and caption. Those become real product photos sourced from the media library (§5).

Left column is deliberately kept photograph-free — the word/image split across the two columns is sound and the proof block is the left column's second focal point.

### 4.6 Cleanups carried by this section

- Apply `supabase/migrations/0012_global_voice.sql` and delete the `quarantine()` function at `:53-55` together with its call sites. These must happen in the same change; deleting the guard without applying the migration republishes copy the owner rejected twice.

### 4.7 Acceptance

- The headline never breaks mid-sentence at any viewport from 320px to 1920px.
- Exactly one element in the left column uses `var(--color-brand)`.
- The proof block renders three cells with DB-overridable values.
- No horizontal overflow at 390px (a prior regression, documented at `:224-227`).
- Lighthouse accessibility ≥ 0.95 and the existing colour-contrast audit still pass.

---

## 5 · Section two — the media manager

### 5.1 Storage

One bucket, `media`, public read and admin-only write, capped at the bucket level to 8 MB per object and the MIME set `image/webp, image/jpeg, image/png, image/avif, image/svg+xml` (following the pattern established for `review-photos` in `0010_security_hardening.sql:47-50`). The cap is deliberately well above the 2400px/WebP output of §5.3 — it is a backstop against a bypassed client, not the primary control. Objects are keyed `<kind>/<uuid>.<ext>`.

`product-images` is folded into `media` so there is genuinely one place; its existing policies are superseded. `review-photos` stays separate — it is customer-writable with per-user folders and must not share a bucket with admin-managed brand assets.

### 5.2 `media_assets`

A table is required because a bucket listing cannot carry alt text, search, or stable IDs.

```sql
create table public.media_assets (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null unique,
  alt           text not null default '',
  kind          text not null default 'general',
  mime          text not null,
  bytes         integer not null,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id)
);
```

`kind` is one of `product | hero | festival | store | category | og | general`, used only for filtering in the picker.

RLS: public `select`; `insert`/`update`/`delete` restricted to `public.is_admin()`.

### 5.3 Upload path

Browser → Supabase Storage directly (RLS-gated), then insert the `media_assets` row. No server is involved, so this works under static export.

**Images are resized and compressed in-browser before upload**, via canvas: maximum 2400px on the long edge, re-encoded to WebP at quality 82, with the original aspect ratio preserved. This is not optional: `images.unoptimized: true` (§2.4) means whatever is uploaded ships to every visitor at full size, and an owner uploading phone photos would otherwise put 8 MB images on the home page.

SVG is accepted but never re-encoded, and is stored only for `kind = 'og'` or brand assets; it is excluded from the canvas path because rasterising a logo defeats the purpose.

Dimensions are measured client-side and stored, so consumers can set explicit `width`/`height` and avoid layout shift.

### 5.4 The picker

A single `<MediaPicker value={assetId} onChange={…} kind={…} />` used at **every** image slot in the admin. It opens the library: grid, search by filename and alt text, filter by `kind`, drag-and-drop upload, inline alt-text editing, and a usage count.

Usage is computed on demand by scanning `site_content.data` and product image references for the asset ID — at this scale (order 100 assets) an on-demand query is correct and cannot go stale, unlike a maintained counter. The same check guards deletion: an asset in use cannot be deleted without first being replaced.

### 5.5 The content schema

Introduce `zod` and define the editable content tree as one composed schema with `.default()` on every branch, so a missing key never crashes a page. One shared `imageRef` type — `{ assetId, alt }` — is used by every image field without exception (D4, D5). The existing `ProductImage` shape at `packages/shared/src/types/product.ts:74` is the model for its resolved form.

Reads parse through the schema; writes validate before persisting.

### 5.6 Slots to wire

Every image on the public site becomes owner-editable: hero (including the festival-card photography from §4.5), home page sections, category tiles, festival banners, store photos, about-page imagery, product images and galleries, and the OG/social image. Product images move from the bespoke uploader in `admin-products.tsx:1012` and `admin-products-new.tsx:301` to the shared picker.

### 5.7 Acceptance

- Every image visible on the public site can be replaced from `/admin` without a code change.
- Uploading a 12 MP phone photo results in a stored asset within the configured bound.
- Deleting an in-use asset is refused, and the refusal names where it is used.
- A page whose content key is absent renders defaults rather than throwing.

---

## 6 · Section three — real data, build bake, publish

### 6.1 Products into the database

Seed the 24 `CATALOGUE` SKUs into `products` and `variants`, then add the missing read path (`listProducts()` and friends) to `apps/storefront/src/lib/supabase/products.ts`.

### 6.2 Build-time bake

A pre-build script fetches products, site content, and media from Supabase using a **Node** client with the service role (§2.4 — the browser client returns `null` outside the browser) and writes a generated JSON artifact.

`packages/shared/src/catalogue/products.ts` then exports `CATALOGUE` from that generated artifact when present, falling back to the current hardcoded array when it is absent or the fetch fails. **Every existing import of `CATALOGUE` keeps working unchanged** — home, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search` and `sitemap.ts` are untouched — and a database outage degrades the build to today's behaviour instead of breaking it.

### 6.3 Publish

A new Edge Function `publish-site` verifies the caller is an admin, then POSTs to the Cloudflare Pages deploy hook whose URL is held in function secrets. Repeat publishes within 5 minutes coalesce into a single rebuild — the window is carried over from the superseded `cms-content` spec, which specified the same figure. A publish requested during the window is not dropped: it extends the pending rebuild so the last edit is always included.

The admin's Publish control reports state honestly: saved, publishing, and live-at-time.

### 6.4 Runtime overlay

`SiteContentProvider` and the Realtime bridge (`apps/storefront/src/app/layout.tsx:224,229`) already update hero copy and theme within seconds. Extend the same mechanism to image references so a swapped photo appears for live visitors ahead of the rebuild that makes it canonical.

### 6.5 Brand and content sweep

**A two-tier logo system**, because the full lockup does not survive small sizes (§2.2.1):

- **Full lockup** — the chariot, sun and wordmark, converted from the PDF to SVG with the white background dropped and the `SamarkanNormal` wordmark reduced to outlines. Used at **≥160 px only**: hero seal, footer, about page, OG image.
- **Compact mark** — a deliberately simplified device for **≤64 px**: the header, the favicon, and the apple-touch-icon. Derived from the sun disc and a reduced chariot silhouette, keeping the sunburst ramp; the seven horses do not survive reduction and must not be attempted. Paired with the wordmark set in type rather than as artwork.

The existing code-drawn katli lockup in `brand/logo.tsx` is replaced by these two. The hero's placeholder dispatch seal (`hero-batch.tsx:239-261`, whose comment already anticipates this) takes the full lockup, since at ~104 px it sits near the legibility floor and should be sized up slightly.

#### 6.5.1 The brand red

The logo's wordmark is `#FF0000`. It **cannot** become `--color-brand`: at 3.30:1 on the manila hero ground and 4.00:1 on white it fails WCAG AA for text, and the repo already enforces Lighthouse accessibility ≥ 0.95 plus a `colour-audit` ratchet in CI.

Logos are exempt from contrast requirements, so **the artwork keeps `#FF0000` exactly**. The UI token is a darkened value on the same hue:

| Candidate | On manila | On white | |
|---|---|---|---|
| `#FF0000` — logo, as drawn | 3.30:1 | 4.00:1 | fails |
| `#D50000` — lightest passing | 4.53:1 | 5.48:1 | passes, no margin |
| **`#CC0000` — recommended** | **4.86:1** | **5.89:1** | passes with headroom |
| `#A81B1B` — current placeholder | 6.11:1 | 7.40:1 | passes, but a visibly different hue |

**Decided 2026-08-07: `--color-brand: #CC0000`.** Same hue as the mark, comfortably above the threshold rather than sitting on it. Changed in lockstep across the three locations in §2.2, with `globals-sync.test.ts` extended to pin all three rather than two.

The secondary brand colours — the `#FF0000` → `#FFD100` sunburst ramp and the two golds — are currently absent from the site palette entirely and are available for accents.
- Real photography ingested through the media library.
- Business facts corrected throughout: founding year 1983 (D7), addresses, phone, WhatsApp, FSSAI, GST, hours, social links, map.
- Policy copy, structured data, sitemap, robots and metadata reviewed against the live domain.

The exhaustive placeholder inventory produced during the audit is the working checklist; it is itemised per file and is not reproduced here.

### 6.6 Security fixes shipped with this work

Not deferred — the admin becomes materially more powerful in this change.

1. Reconcile the role model (§2.6) so client and RLS agree.
2. Remove the SQL disclosure at `admin-login.tsx:144-146`.
3. Add `X-Robots-Tag: noindex` and `Cache-Control: no-store` for `/admin/*` in `public/_headers`.
4. Apply MIME and size caps to the `media` bucket.

### 6.7 Version history

```sql
create table public.site_content_versions (
  id          bigserial primary key,
  key         text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);
```

A trigger snapshots the previous row on every `site_content` update, retaining the most recent 30 per key. Restore writes the snapshot back through the same validation and authorization path as an ordinary edit — a restore must not be able to reinstate content that a direct edit would reject.

### 6.8 Acceptance

- A product edited in `/admin` changes the public page after publish.
- No public page requests a `ravisweets.com/wp-content` URL.
- `is_admin()` and the client role list agree; a non-admin staff account cannot reach a write path that appears to succeed.
- `/admin` returns `noindex` and is not cached.
- Restoring a version produces the exact prior content and is itself auditable.

---

## 7 · Sequence

1. **Hero recomposition + logo integration** (§4, §6.5 brand half, §6.5.1) — merged, because the hero's dispatch seal *is* the logo roundel and the red-discipline work in §4.2 depends on the `--color-brand` change. Independent of everything else and immediately visible.
2. **Media foundation** (§5.1–5.5) — bucket, table, RLS, Zod schema, picker.
3. **Products into the database** (§6.1) — the largest single step.
4. **Wire every image slot** (§5.6) — needs 2 and 3.
5. **Build bake and publish** (§6.2–6.4).
6. **Content sweep and security fixes** (§6.5 content half, §6.6).
7. **Version history** (§6.7).

Step 1 delivers the visible brand change before the larger structural work begins, and needs neither photography nor the media library.

**On planning granularity:** this spec is deliberately one document because the parts share a dependency — the media foundation gates steps 3, 5 and 7, and D1 forces D2. The *implementation plans* should not be one document. Each numbered step above gets its own plan, written when its predecessors land, so that findings from step 4 can inform step 5 rather than being guessed at up front.

---

## 8 · Risks

| Risk | Handling |
|---|---|
| Seeding 84 SKUs mismatches the hardcoded shape and corrupts the catalogue | The generated artifact falls back to the hardcoded array (§6.2); seed is verified against `CATALOGUE` before the read path is switched on. |
| Owner uploads huge images and destroys LCP | Mandatory client-side downscale (§5.3) plus bucket-level size caps. |
| Deploy-hook secret leaks | Held in Edge Function secrets, never in the client bundle (D8). |
| Deleting `quarantine()` without applying 0012 republishes rejected copy | Both land in one change (§4.6). |
| Changing `--color-brand` in one of three places | `globals-sync.test.ts` already pins two; extend it to all three. |
| Repo is not Prettier-clean; a repo-wide format would rewrite ~250 files | Format only touched files. |
| CI is dead — it triggers on `main` while the repo's default branch is `master` | Out of scope here, but flagged: no lint, typecheck, test, size or Lighthouse gate is currently running. |

---

## 9 · Inputs still needed

1. **Product photography.** The supplied link (`photos.google.com/u/2/albums`) is an authenticated account index and cannot be reached programmatically. Needs a local folder path or an export. Filenames approximating product names reduce manual matching. Does not block any code work — the library is built so photos drop in without a code change.
2. ~~**Logo artwork.**~~ **Resolved 2026-08-07** — vector PDF supplied at `assets/logo/Ravi Sweets Logo.pdf`. See §2.2.1. One decision remains open: the `--color-brand` value (§6.5.1), recommended `#CC0000`.
3. **Business facts** for the content sweep: current store addresses, phone, WhatsApp, hours, FSSAI and GST numbers, social links.

---

## 10 · Out of scope

- Migrating to OpenNext / Cloudflare Workers (considered and rejected — D1).
- In-place editing on the live storefront (considered; deferred — D3).
- Deleting the vestigial `apps/backend` Medusa scaffold.
- Repairing CI's branch trigger.
- Customer-facing features: checkout, payments, the hamper builder.
- Test infrastructure beyond what this work touches. Current coverage is four Vitest files, all colour maths in `src/lib/theme/`; `vitest.config.ts` is `environment: 'node'` and includes only `*.test.ts`, so component tests would need new infrastructure.
