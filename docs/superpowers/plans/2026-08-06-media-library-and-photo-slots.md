# Media Library + Owner-Editable Photo Slots — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every photo on the public site — home-page hero card, page imagery, and per-product images — becomes replaceable from `/admin` without a code change, modelled on furor-web (dancehyderabad.com) but re-expressed against Supabase under the static export.

**Architecture:** One `media` Storage bucket + `media_assets` table is the single source for owner imagery (spec D3/D4). A Zod-validated `page_media` row in `site_content` holds `{assetId, alt}` refs for page-level slots; `SiteContentProvider` (already Realtime-wired) loads it plus the assets table and a `products.images` overlay, so swapped photos reach live browsers in seconds with no rebuild (spec §6.4). Admin gets a **Media** library tab, a reusable **MediaField/MediaPickerDialog**, and a **Photos** tab whose sections are named after public pages (furor's IA lesson). Product image editing moves to the shared picker; a generated seed SQL makes those edits real once applied.

**Tech Stack:** Next.js 15 static export, Supabase (Postgres + Storage + Realtime, anon key only — no server), Zod, Vitest (node env), tsx (dev-only, seed generator).

## Global Constraints

- `output: 'export'` — no route handlers, no middleware, no server actions. All writes are browser → Supabase under RLS (spec §2.4, D1).
- Content references an **asset ID, never a URL** for `page_media` (spec D4). Exception, documented here: `products.images` keeps the established `ProductImage {url, alt, width, height}` shape (shared with the static CATALOGUE and the future build bake); the picker writes the media public URL into it, and usage-scan matches products by `storage_path` substring.
- Client-side downscale is mandatory before upload: max 2400px long edge, WebP quality 0.82; SVG passes through un-re-encoded (spec §5.3). Bucket backstop: 8 MB, MIME allowlist `image/webp,image/jpeg,image/png,image/avif,image/svg+xml`.
- A missing/invalid `page_media` row must render code defaults, never throw (spec §5.5) — every Zod branch has `.default()` and reads go through `safeParse`.
- Seeds must **never clobber** admin-edited rows: `on conflict do nothing` (furor's most-documented failure class).
- The working tree carries a parallel agent's uncommitted Batch-Card redesign. **No worktrees; work in the main tree.** Stage only files this plan names — never `git add -A`. Files owned by the other agent that this plan may touch minimally: `hero-batch.tsx` (comment-sanctioned photo swap), `brand/logo.tsx` (logo override), `layout.tsx` (none — provider extension happens inside existing provider files).
- No repo-wide formatting; format only touched files.
- `pnpm --filter @ravisweets/storefront typecheck` and `pnpm --filter @ravisweets/storefront test` must pass after every task (baseline: clean / 115 passing). `apps/backend` typecheck fails pre-existing — ignore it.
- Commit messages: conventional style, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## File Structure

```
supabase/migrations/0013_media_library.sql        NEW  bucket, media_assets, site_content_versions + trigger, RLS
supabase/migrations/0014_seed_products.sql        NEW  generated from CATALOGUE (never clobbers)
scripts/generate-product-seed.mjs                 NEW  tsx-powered generator emitting 0014
apps/storefront/public/_headers                   MOD  /admin noindex + no-store
apps/storefront/src/lib/content/page-media.ts     NEW  Zod schema, slot types, resolve helpers
apps/storefront/src/lib/content/page-media.test.ts NEW
apps/storefront/src/lib/media/public-url.ts       NEW  storage_path → public URL (pure)
apps/storefront/src/lib/media/public-url.test.ts  NEW
apps/storefront/src/lib/media/resize.ts           NEW  canvas downscale→WebP (browser-only)
apps/storefront/src/lib/media/assets.ts           NEW  list/upload/updateAlt/delete media_assets
apps/storefront/src/lib/media/usage.ts            NEW  pure usage scanner
apps/storefront/src/lib/media/usage.test.ts       NEW
apps/storefront/src/lib/supabase/site-content.ts  MOD  add 'page_media' key + PageMedia type
apps/storefront/src/lib/supabase/site-content-context.tsx MOD  load page_media + media_assets + product images overlay; new hooks
apps/storefront/src/lib/supabase/versions.ts      NEW  list/restore site_content_versions
apps/storefront/src/lib/supabase/products.ts      MOD  updateProductImages + zero-row honesty
apps/storefront/src/components/media/slot-image.tsx NEW  public slot renderer with fallback
apps/storefront/src/components/admin/media-picker.tsx NEW  MediaPickerDialog + MediaField
apps/storefront/src/components/admin/admin-media.tsx  NEW  library screen
apps/storefront/src/components/admin/admin-photos.tsx NEW  page-grouped slot editors + history
apps/storefront/src/components/admin/versions-panel.tsx NEW
apps/storefront/src/components/admin/admin-shell.tsx  MOD  NAV + mobile drawer entries (Media, Photos)
apps/storefront/src/app/(admin)/admin/media/page.tsx  NEW
apps/storefront/src/app/(admin)/admin/photos/page.tsx NEW
apps/storefront/src/components/admin/admin-login.tsx  MOD  remove SQL disclosure
apps/storefront/src/components/admin/admin-products.tsx MOD  picker swap + gallery editor
apps/storefront/src/components/admin/admin-products-new.tsx MOD  picker swap
apps/storefront/src/app/about/page.tsx            MOD  SlotImage x2
apps/storefront/src/app/stores/page.tsx           MOD  SlotImage x1
apps/storefront/src/app/corporate/page.tsx        MOD  SlotImage x3
apps/storefront/src/app/festivals/[slug]/page.tsx MOD  SlotImage x10
apps/storefront/src/components/brand/logo.tsx     MOD  owner-logo override
apps/storefront/src/components/hero/hero-batch.tsx MOD  chips render product photo when usable
apps/storefront/src/components/product/product-gallery.tsx MOD  overlay-aware
apps/storefront/src/components/product-card.tsx   MOD  overlay-aware (1-line hook)
DEPLOYMENT.md                                     MOD  apply table + new steps
```

---

### Task 1: Migration 0013 + admin security sweep

**Files:**
- Create: `supabase/migrations/0013_media_library.sql`
- Modify: `apps/storefront/public/_headers` (append block)
- Modify: `apps/storefront/src/components/admin/admin-login.tsx:129-149` (remove SQL disclosure)

**Interfaces:**
- Produces: table `public.media_assets` (columns exactly as below — Task 2's `MediaAsset` type mirrors it), bucket `media`, table `public.site_content_versions` (Task 5's versions lib reads it).

- [ ] **Step 1: Write the migration** — content:

```sql
-- ─── 0013 · Media library: one bucket + asset registry + content versions ──
-- Spec: docs/superpowers/specs/2026-08-06-admin-media-and-go-live-design.md §5, §6.7
-- Apply AFTER 0012. Idempotent: safe to re-run.
begin;

-- 1 · The single media bucket (spec §5.1). 8 MB cap is a backstop against a
--     bypassed client — the client downsizes to ≤2400px WebP before upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608,
        array['image/webp','image/jpeg','image/png','image/avif','image/svg+xml'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone reads media objects" on storage.objects;
create policy "anyone reads media objects" on storage.objects for select
  using (bucket_id = 'media');
drop policy if exists "admin inserts media objects" on storage.objects;
create policy "admin inserts media objects" on storage.objects for insert
  to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin updates media objects" on storage.objects;
create policy "admin updates media objects" on storage.objects for update
  to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin deletes media objects" on storage.objects;
create policy "admin deletes media objects" on storage.objects for delete
  to authenticated using (bucket_id = 'media' and public.is_admin());

-- 2 · Asset registry (spec §5.2) — a bucket listing cannot carry alt text,
--     search, or stable IDs.
create table if not exists public.media_assets (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null unique,
  alt           text not null default '',
  kind          text not null default 'general'
                  check (kind in ('product','hero','festival','store','category','og','general')),
  mime          text not null,
  bytes         integer not null,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null
);
create index if not exists media_assets_kind_idx on public.media_assets (kind);
create index if not exists media_assets_created_idx on public.media_assets (created_at desc);

alter table public.media_assets enable row level security;
drop policy if exists "anyone reads media assets" on public.media_assets;
create policy "anyone reads media assets" on public.media_assets for select using (true);
drop policy if exists "admin writes media assets" on public.media_assets;
create policy "admin writes media assets" on public.media_assets for all
  using (public.is_admin()) with check (public.is_admin());

-- 3 · site_content version snapshots (spec §6.7). The trigger snapshots the
--     PREVIOUS row on every update, keeping the latest 30 per key. Restore is
--     client-side via the ordinary validated saveSiteContent path — a restore
--     must not bypass what a direct edit would reject.
create table if not exists public.site_content_versions (
  id          bigserial primary key,
  key         text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id) on delete set null
);
create index if not exists site_content_versions_key_idx
  on public.site_content_versions (key, created_at desc);

alter table public.site_content_versions enable row level security;
drop policy if exists "admin reads content versions" on public.site_content_versions;
create policy "admin reads content versions" on public.site_content_versions for select
  using (public.is_admin());
-- No insert/update/delete policies: only the security-definer trigger writes here.

create or replace function public.snapshot_site_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_content_versions (key, data, created_by)
  values (old.key, old.data, old.updated_by);
  delete from public.site_content_versions
  where key = old.key
    and id not in (
      select id from public.site_content_versions
      where key = old.key
      order by created_at desc, id desc
      limit 30
    );
  return new;
end;
$$;

drop trigger if exists site_content_snapshot on public.site_content;
create trigger site_content_snapshot
  before update on public.site_content
  for each row execute function public.snapshot_site_content();

-- 4 · 'product-images' is superseded by 'media' for NEW uploads (spec §5.1).
--     Existing objects/policies are left in place so old URLs keep resolving.
comment on table public.media_assets is
  'Single owner-media registry. product-images bucket is legacy: new uploads go to media/.';

commit;
```

- [ ] **Step 2: Append to `apps/storefront/public/_headers`:**

```
/admin
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store

/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
```

- [ ] **Step 3: Remove the SQL disclosure** in `admin-login.tsx` (the block at ~129–149 that prints role-granting SQL to any visitor). Replace the whole hint block with a single muted paragraph: `Staff access is granted by the founder from Admin → Team.` Keep the surrounding card layout.

- [ ] **Step 4: Verify** — `pnpm --filter @ravisweets/storefront typecheck` passes; visually re-read the SQL for idempotency (every create has an if-not-exists or drop-guard).

- [ ] **Step 5: Commit** — `git add supabase/migrations/0013_media_library.sql apps/storefront/public/_headers apps/storefront/src/components/admin/admin-login.tsx` → `feat(media): media bucket, asset registry, content versions + admin header/disclosure hardening`

---

### Task 2: Content schema + media core libs + tests

**Files:**
- Create: `apps/storefront/src/lib/content/page-media.ts`, `page-media.test.ts`
- Create: `apps/storefront/src/lib/media/public-url.ts`, `public-url.test.ts`, `resize.ts`, `assets.ts`, `usage.ts`, `usage.test.ts`
- Modify: `apps/storefront/package.json` (add `zod: ^3.23.8` dependency — run `pnpm --filter @ravisweets/storefront add zod`)
- Modify: `apps/storefront/src/lib/supabase/site-content.ts` (add `'page_media'` to `SiteContentKey`, add `page_media: PageMedia` to `ContentByKey`, re-export type)

**Interfaces (produced — later tasks import these exactly):**

```ts
// lib/content/page-media.ts
export type ImageRef = { assetId: string; alt: string } | null;
export interface PageMedia {
  about: { portrait: ImageRef; kitchen: ImageRef };
  stores: { storefront: ImageRef };
  corporate: { essence: ImageRef; premium: ImageRef; grande: ImageRef };
  festivals: Record<string, ImageRef>;   // keyed by festival slug
  brand: { logo: ImageRef };
}
export const EMPTY_PAGE_MEDIA: PageMedia;
export function parsePageMedia(raw: unknown): PageMedia;      // safeParse → defaults, never throws
export type SlotPath =
  | 'about.portrait' | 'about.kitchen' | 'stores.storefront'
  | 'corporate.essence' | 'corporate.premium' | 'corporate.grande'
  | `festivals.${string}` | 'brand.logo';
export function getSlot(media: PageMedia, slot: SlotPath): ImageRef;
export function setSlot(media: PageMedia, slot: SlotPath, ref: ImageRef): PageMedia; // immutable
export const FESTIVAL_SLUGS: readonly string[]; // diwali, raksha-bandhan, eid, holi, pongal, sankranti, ugadi, onam, ganesh-chaturthi, christmas

// lib/media/public-url.ts  (pure, node-safe)
export function mediaPublicUrl(storagePath: string): string | null;
//   `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storagePath}` — null when env unset/blank.

// lib/media/assets.ts
export type MediaKind = 'product'|'hero'|'festival'|'store'|'category'|'og'|'general';
export interface MediaAsset { id: string; storage_path: string; alt: string; kind: MediaKind;
  mime: string; bytes: number; width: number | null; height: number | null;
  created_at: string; created_by: string | null; }
export async function listMediaAssets(): Promise<MediaAsset[]>;               // newest first
export async function uploadMediaAsset(file: File, kind: MediaKind): Promise<{ ok: true; asset: MediaAsset } | { ok: false; reason: string }>;
export async function updateAssetAlt(id: string, alt: string): Promise<boolean>;
export async function deleteMediaAsset(asset: MediaAsset): Promise<{ ok: boolean; reason?: string }>; // removes storage object then row

// lib/media/resize.ts (browser-only)
export async function prepareForUpload(file: File): Promise<{ blob: Blob; ext: string; mime: string; width: number|null; height: number|null }>;
//   raster: canvas downscale to ≤2400px long edge, re-encode image/webp q=0.82, measure dims.
//   SVG (image/svg+xml): passthrough blob, ext 'svg', dims null.
//   Rejects (throws Error with owner-readable message) on non-image MIME or >8MB post-encode.

// lib/media/usage.ts (pure)
export interface UsageHit { where: string }  // e.g. 'About page — portrait', 'Product — Kaju Katli'
export function scanAssetUsage(args: {
  assetId: string; storagePath: string;
  pageMedia: PageMedia;
  products: { title: string; images: { url: string }[] }[];
}): UsageHit[];
```

- [ ] **Step 1: Write failing tests** — `page-media.test.ts`: `parsePageMedia(undefined)` and `parsePageMedia({garbage:1})` return `EMPTY_PAGE_MEDIA`-shaped object (all slots null, `festivals` `{}`); a valid partial `{about:{portrait:{assetId:'a',alt:'x'}}}` round-trips with other slots defaulted; `setSlot` returns new object without mutating input; `getSlot('festivals.diwali')` reads the record. `public-url.test.ts`: joins env URL + path; strips trailing slash; returns null when env missing (stub via `vi.stubEnv`). `usage.test.ts`: assetId in `pageMedia` yields the owner-language `where` string; product whose `images[0].url` contains the storagePath yields `Product — <title>`; no matches → `[]`.
- [ ] **Step 2: Run tests, verify fail** — `pnpm --filter @ravisweets/storefront test` (new files fail to import).
- [ ] **Step 3: Implement** the four modules per the interface block. `parsePageMedia` = `Schema.catch(EMPTY_PAGE_MEDIA).parse(raw)` or `safeParse` with fallback; slot access via explicit switch on the two-segment path (`festivals.` prefix special-cased) — no `eval`-style deep paths. `assets.ts` uses `getSupabase()` (null → `{ok:false, reason:'supabase-not-configured'}`); upload path `${kind}/${crypto.randomUUID()}.${ext}` with `cacheControl: '31536000'`, `contentType` from `prepareForUpload`; row insert `{storage_path, alt:'', kind, mime, bytes, width, height, created_by: user?.id ?? null}` returning the row.
- [ ] **Step 4: Run tests + typecheck, verify pass.**
- [ ] **Step 5: Commit** — the created/modified files → `feat(media): zod page-media schema, asset registry client, upload pipeline, usage scan`

---

### Task 3: Runtime overlay — provider extension + hooks + SlotImage

**Files:**
- Modify: `apps/storefront/src/lib/supabase/site-content-context.tsx`
- Create: `apps/storefront/src/components/media/slot-image.tsx`

**Interfaces:**
- Consumes: `parsePageMedia`, `MediaAsset`, `listMediaAssets`, `mediaPublicUrl` (Task 2).
- Produces:

```ts
// added to site-content-context.tsx exports
export interface ResolvedSlotImage { url: string; alt: string; width: number|null; height: number|null }
export function usePageMediaImage(slot: SlotPath): ResolvedSlotImage | null;
export function useMediaAssets(): { assets: MediaAsset[]; byId: Map<string, MediaAsset>; refresh: () => void };
export function useProductImagesOverride(productId: string): ProductImage[] | null; // null = no DB row / overlay empty
// context value additionally carries: pageMedia: PageMedia
```

- [ ] **Step 1: Extend the provider.** On mount (alongside `loadAllSiteContent`): `parsePageMedia(all.page_media)` into state; `listMediaAssets()` into state; fetch `products` overlay via `getSupabase().from('products').select('id, images').eq('archived', false)` → `Record<string, ProductImage[]>` keeping only rows whose `images` is a non-empty array. Existing Realtime channel already refetches on any `site_content` change — extend the same handler to re-parse `page_media`. Add `media_assets` and `products` tables to the same postgres_changes subscription set (one channel, three listeners) and fold both fetches into the existing 60s poll. All fetches no-op silently when supabase is unconfigured (existing pattern).
- [ ] **Step 2: Resolution.** `usePageMediaImage`: `getSlot(pageMedia, slot)` → if null or assetId missing from `byId` map → null; else `{url: mediaPublicUrl(asset.storage_path), alt: ref.alt || asset.alt, width, height}` (null url → null).
- [ ] **Step 3: SlotImage** — `'use client'` component:

```tsx
export function SlotImage({ slot, fallbackUrl, fallbackAlt, className, sizes, priority }: {
  slot: SlotPath; fallbackUrl?: string; fallbackAlt?: string;
  className?: string; sizes?: string; priority?: boolean;
}) 
```

Resolution order: slot image → `fallbackUrl` if `isUsableImage(fallbackUrl)` → dashed-diamond placeholder (the exact `about/page.tsx` fallback markup: rotated bordered span in `--theme-accent`, centred in the frame). Renders `next/image` `fill` inside a relative wrapper `className`; `onError` drops to placeholder (furor's `Img` lesson). SSR renders the fallback (context defaults are empty), hydration swaps in the slot image — acceptable under §6.4 overlay-ahead-of-bake.
- [ ] **Step 4: Typecheck + tests pass; commit** → `feat(media): realtime page-media + product-image overlay and public SlotImage`

---

### Task 4: Admin Media library tab + reusable picker

**Files:**
- Create: `apps/storefront/src/components/admin/media-picker.tsx`, `admin-media.tsx`
- Create: `apps/storefront/src/app/(admin)/admin/media/page.tsx` (thin: `export default` renders `<AdminMedia />`)
- Modify: `apps/storefront/src/components/admin/admin-shell.tsx` — add `{ label: 'Media', href: '/admin/media', icon: Image }` to the NAV array (lucide `Image` icon; appears in both desktop list and mobile drawer automatically since both render `NAV`).

**Interfaces:**
- Consumes: Task 2 (`listMediaAssets`, `uploadMediaAsset`, `updateAssetAlt`, `deleteMediaAsset`, `scanAssetUsage`, `mediaPublicUrl`, `MediaKind`), Task 3 (`useMediaAssets`, context `pageMedia`).
- Produces (Task 5/6 import these):

```tsx
export function MediaPickerDialog(props: { open: boolean; kind?: MediaKind;
  onClose: () => void; onSelect: (asset: MediaAsset) => void }): JSX.Element | null;
export function MediaField(props: { label: string; hint?: string; kind?: MediaKind;
  value: ImageRef; onChange: (ref: ImageRef) => void;
  aspect?: 'square' | 'wide' | 'portrait' }): JSX.Element;
```

- [ ] **Step 1: MediaPickerDialog.** Modal (fixed inset overlay, existing admin drawer styling conventions): searchable grid of assets (thumb via `mediaPublicUrl`, filename tail, kind chip), search input filters `storage_path + alt` case-insensitively, kind filter select (All + 7 kinds, defaulting to `props.kind`), an **Upload** drop-zone/button at the top (multi-file; sequential `uploadMediaAsset`; per-file progress text; newly uploaded asset is auto-selected when single). Selecting a tile calls `onSelect(asset)` and closes.
- [ ] **Step 2: MediaField** — furor's ImageUploader shape, library-aware: grid `[160px preview | controls]`; aspect-correct preview of the resolved asset (via `useMediaAssets().byId`) with 'No image' empty state; buttons: **Choose from library** (opens dialog), **Replace** (same), **Clear** (sets `null`); alt-text input below (`Describes the photo for screen readers`), writing `{...value, alt}` and ALSO offering "save as library default" via `updateAssetAlt` when the asset's own alt is empty. Hint line under the label (default: `WebP/JPEG/PNG/AVIF · big photos are auto-shrunk on upload`).
- [ ] **Step 3: AdminMedia screen.** Header (furor orientation pattern): title **Media**, one sentence: `Every photo on the site lives here. Upload once, use it anywhere from the Photos tab or a product.` Toolbar: upload button + drop-zone, search, kind filter. Grid of asset cards: thumb, path tail, dimensions/size caption, inline alt editor (`updateAssetAlt` on blur), **Where is this used?** disclosure computing `scanAssetUsage` against context `pageMedia` + overlay products, **Delete** disabled with tooltip listing usages when in use (furor delete-guard lesson), `window.confirm` when unused. Empty state: friendly card `No photos yet — drop images here. Phone photos are fine; they're shrunk automatically.`
- [ ] **Step 4: Typecheck; manual smoke** (`pnpm --filter @ravisweets/storefront dev`, visit `/admin/media` — unconfigured Supabase shows the existing setup card, that's fine). Commit → `feat(admin): media library tab with picker dialog + reusable MediaField`

---

### Task 5: Admin Photos tab + version history

**Files:**
- Create: `apps/storefront/src/components/admin/admin-photos.tsx`, `versions-panel.tsx`
- Create: `apps/storefront/src/lib/supabase/versions.ts`
- Create: `apps/storefront/src/app/(admin)/admin/photos/page.tsx`
- Modify: `apps/storefront/src/components/admin/admin-shell.tsx` — add `{ label: 'Photos', href: '/admin/photos', icon: Camera }` directly before the Media entry.

**Interfaces:**
- Consumes: `MediaField` (Task 4), `parsePageMedia/getSlot/setSlot/FESTIVAL_SLUGS` (Task 2), `saveSiteContent('page_media', …)` (existing), context `pageMedia` (Task 3).
- Produces:

```ts
// lib/supabase/versions.ts
export interface ContentVersion { id: number; key: string; data: unknown; created_at: string; created_by: string | null }
export async function listVersions(key: string, limit?: number): Promise<ContentVersion[]>; // newest first, default 30
```

```tsx
export function VersionsPanel(props: { contentKey: 'page_media' | 'hero';
  onRestore: (data: unknown) => Promise<boolean> }): JSX.Element;
```

- [ ] **Step 1: versions lib** — `listVersions` selects from `site_content_versions` `.eq('key', key).order('created_at', {ascending:false}).limit(limit ?? 30)`; unconfigured → `[]`.
- [ ] **Step 2: VersionsPanel** — collapsed "History" disclosure listing versions (`local datetime · shortened author id`), each with **Restore** button guarded by `window.confirm('Restore this version? The current photos become a new history entry.')` → `onRestore(v.data)` → success message `Restored — live in a few seconds.` (restore flows through the caller's validated save, spec §6.7).
- [ ] **Step 3: AdminPhotos.** Local state = context `pageMedia` copied on first load (dirty-tracking boolean; furor SaveBar shape). Sections in owner language, each a bordered fieldset with one orientation sentence:
  - **Home — festival card**: no field; muted pointer `The three little photos on the home-page card come from your bestseller products — edit them under Products.`
  - **About page**: `about.portrait` (label `Founder portrait`, hint `Top docket on the About page`), `about.kitchen` (label `Kitchen photo`, hint `Second docket, beside the process story`).
  - **Stores page**: `stores.storefront` (label `Shop front photo`).
  - **Corporate hampers**: three `MediaField`s for `corporate.essence/premium/grande` (hint `Thumbnail on the corporate rate card`).
  - **Festival pages**: one `MediaField` per slug in `FESTIVAL_SLUGS` (label = slug title-cased, kind `festival`).
  - **Brand**: `brand.logo` (label `Logo`, hint `Header + hero seal. SVG or PNG with transparent background works best.`, kind `general`).
  Sticky bottom SaveBar: disabled `Saved` / enabled `Save changes` / `Saving…`; on save `saveSiteContent('page_media', media)` → `Saved ✓ — live on the site in a few seconds.`; error surfaces the reason inline. Below: `<VersionsPanel contentKey="page_media" onRestore={d => saveSiteContent('page_media', parsePageMedia(d)).then(r => r.ok)} />` — restores re-validate through the schema.
- [ ] **Step 4: Typecheck + tests; commit** → `feat(admin): Photos tab — every page image slot editable, with history + restore`

---

### Task 6: Product images through the shared picker (+ honesty fix)

**Files:**
- Modify: `apps/storefront/src/lib/supabase/products.ts`
- Modify: `apps/storefront/src/components/admin/admin-products.tsx` (drawer image section + ImageUpload removal)
- Modify: `apps/storefront/src/components/admin/admin-products-new.tsx` (same swap)

**Interfaces:**
- Consumes: `MediaField`/`MediaPickerDialog` (Task 4), `mediaPublicUrl`, `MediaAsset`.
- Produces:

```ts
// lib/supabase/products.ts additions
export async function updateProductImages(productId: string, images: ProductImage[]):
  Promise<{ ok: boolean; matched: boolean; reason?: string }>;
// .update({images}).eq('id', productId).select('id') — matched=false when 0 rows returned.
```

- [ ] **Step 1: `updateProductImages`** with `.select('id')` so a zero-row update is detectable (spec §2.3 "Saved ✓ theatre").
- [ ] **Step 2: Drawer gallery editor** replacing `ImageUpload` + paste-URL + alt inputs (admin-products.tsx:~589-616, component at ~957-1029): ordered list of the product's images — each row: 56px thumb, alt input, ↑/↓ arrows (furor's arrow-reorder), Remove; footer buttons **Add from library** (`MediaPickerDialog` kind `product`; on select append `{url: mediaPublicUrl(asset.storage_path)!, alt: asset.alt || product.title, width: asset.width ?? 1400, height: asset.height ?? 1400}`). Save persists via `updateProductImages`; when `matched === false` show amber notice: `Saved nothing — this product isn't in the database yet. Apply supabase/migrations/0014_seed_products.sql first (see DEPLOYMENT.md).` — never a false "Saved ✓".
- [ ] **Step 3: New-product page** — replace its inline uploader with `MediaField`-driven primary image (`value` mapped from local `ImageRef|null`; on create, resolve to `ProductImage` the same way). Remove the now-unused `uploadProductImage`/slug-folder path from the new-product flow (keep the function exported for backwards compat; mark `@deprecated new uploads go through lib/media/assets.ts`).
- [ ] **Step 4: Typecheck + tests; commit** → `feat(admin): product photos come from the shared media library, with seed-state honesty`

---

### Task 7: Public wiring — pages render owner photos

**Files:**
- Modify: `apps/storefront/src/app/about/page.tsx` (PORTRAIT/KITCHEN plates → `SlotImage slot="about.portrait|about.kitchen"` keeping existing docket wrappers/captions; keep old URLs as `fallbackUrl`)
- Modify: `apps/storefront/src/app/stores/page.tsx` (STORE_IMAGE plate → `SlotImage slot="stores.storefront"`)
- Modify: `apps/storefront/src/app/corporate/page.tsx` (3 tier thumbs → `SlotImage slot={'corporate.'+tier.id}` in the 44px thumb frame)
- Modify: `apps/storefront/src/app/festivals/[slug]/page.tsx` (hero plate → `SlotImage slot={'festivals.'+slug}` with `fallbackUrl={f.heroImage}`)
- Modify: `apps/storefront/src/components/brand/logo.tsx` (when `usePageMediaImage('brand.logo')` resolves, render `<img>` in the same box as the SVG lockup; SVG remains the fallback — file is client-safe, verify `'use client'`)
- Modify: `apps/storefront/src/components/hero/hero-batch.tsx` (chips: when `useProductImagesOverride(p.id)?.[0] ?? p.images[0]` passes `isUsableImage`, render `next/image` in the same aspect-square frame; else keep `SpecimenMark`. Bob + caption untouched — this is the exact swap the file's own comment at ~394-398 anticipates)
- Modify: `apps/storefront/src/components/product-card.tsx` + `apps/storefront/src/components/product/product-gallery.tsx` (overlay-aware: `const images = useProductImagesOverride(product.id) ?? product.images` — gallery gains a `productId` prop passed from `product/[slug]/page.tsx`)

**Interfaces:** Consumes Task 3 only (`SlotImage`, `usePageMediaImage`, `useProductImagesOverride`).

- [ ] **Step 1:** Wire the four pages. Server components keep their metadata/layout; the plates become the client `SlotImage` leaf. Delete the now-dead `PORTRAIT/KITCHEN/STORE_IMAGE` consts only if unreferenced after the swap (keep as fallbackUrl strings otherwise).
- [ ] **Step 2:** BrandLogo override + hero chips + product-card/gallery overlay. Keep every edit surgical — these files carry the parallel agent's WIP; do not reformat or restructure surrounding code.
- [ ] **Step 3:** `pnpm --filter @ravisweets/storefront typecheck && pnpm --filter @ravisweets/storefront test`; then `ALLOW_NONCANONICAL_BUILD=true pnpm --filter @ravisweets/storefront run build:cloudflare` must complete (static export honors the new client leaves).
- [ ] **Step 4: Commit** → `feat(storefront): page photo slots, owner logo override, hero-chip photos, product image overlay`

---

### Task 8: Product seed groundwork

**Files:**
- Create: `scripts/generate-product-seed.mjs`
- Create: `supabase/migrations/0014_seed_products.sql` (generated, committed)
- Modify: root `package.json` (devDependency `tsx@^4`, script `"generate:seed": "node --import tsx scripts/generate-product-seed.mjs"`)

**Interfaces:** Consumes `CATALOGUE` from `packages/shared/src/catalogue/products.ts` (via tsx import). Produces `0014_seed_products.sql` that Task 6's `matched` honesty check depends on operationally.

- [ ] **Step 1: Generator.** Imports `CATALOGUE`; emits one transaction: for each product an `insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url) values (…) on conflict (id) do nothing;` and per variant `insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available) values (…) on conflict (id) do nothing;` — `price_amount` copied verbatim from `variant.price.amount` (same unit, no conversion); `is_new` ← `product.new`; jsonb via `$json$…$json$` dollar-quoted `::jsonb` literals; all text escaped by doubling single quotes; header comment records generation command, SKU/variant counts, and the **do-nothing-on-conflict** rationale (seeds must never clobber admin edits).
- [ ] **Step 2: Run** `pnpm run generate:seed`; sanity-check output: product count matches `CATALOGUE.length`, file starts `begin;` ends `commit;`, spot-check one dollar-quoted images array parses as JSON.
- [ ] **Step 3: Guard test** — add `scripts/` note: re-running regenerates deterministically (stable ordering by product id) so diffs are reviewable. Verify `node --import tsx` run is idempotent (run twice, `git diff --stat` empty).
- [ ] **Step 4: Commit** → `feat(catalogue): generated product+variant seed (0014) — fills DB without clobbering edits`

---

### Task 9: Docs + apply instructions

**Files:**
- Modify: `DEPLOYMENT.md` — extend the §1.2 apply-order table with rows for `0011_batch_card_world.sql`, `0012_global_voice.sql`, `0013_media_library.sql`, `0014_seed_products.sql` (each: paste into the dashboard SQL editor, in order). Add a short **Media library** subsection: what the `media` bucket is, the 8 MB/MIME backstop, and that `/admin/photos` + `/admin/media` require 0013; product photo edits require 0014.
- Modify: `docs/superpowers/plans/2026-08-06-media-library-and-photo-slots.md` — tick completed checkboxes.

- [ ] **Step 1:** Write the doc changes. **Step 2:** Commit → `docs(deploy): media library + seed apply steps (0011–0014)`

---

### Task 10: Full verification

- [ ] `pnpm --filter @ravisweets/storefront typecheck` — clean.
- [ ] `pnpm --filter @ravisweets/storefront test` — 115 baseline + new media/schema tests green.
- [ ] `ALLOW_NONCANONICAL_BUILD=true pnpm --filter @ravisweets/storefront run build:cloudflare` — completes; `out/admin/media/index.html` and `out/admin/photos/index.html` exist; `out/_headers` contains the `/admin/*` block.
- [ ] Dev-server smoke: `/admin/media`, `/admin/photos` render (setup card acceptable if Supabase env absent locally); `/about`, `/stores`, `/corporate`, `/festivals/diwali` render fallbacks unchanged.
- [ ] Report honestly: what is live-verifiable locally vs what awaits the dashboard SQL paste (0013/0014) and owner uploads.

## Not in this plan (deferred, per spec sequence)

- Build-time bake + `listProducts()` read path + publish Edge Function (spec §6.2–6.3) — next plan, after 0013/0014 are applied.
- OG/social image + favicon wiring (build-time only under static export) — rides with the bake plan.
- Hero left-column recomposition (§4) — parallel agent's lane.
- Migrating legacy `product-images` objects into `media` — bucket is near-empty; new uploads simply go to `media`.
