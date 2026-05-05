-- ─── 0004 — Nutrition + active festival + product-image storage ──────────
-- Three bundled changes for Phase B:
--   1. products.nutrition JSONB — calories / protein / fat / sugar / fibre
--      per 100 g, per product. Surfaces below the ingredients block on the
--      product detail page. DPDP-compliant disclosure for serious gifting.
--   2. site_content gains an `active_festival` row — the festival "go live"
--      manager writes here; the storefront reads it via SiteContentProvider
--      and overlays the festival theme + banner + curated products.
--   3. Storage bucket `product-images` for admin uploads with admin-only
--      write access + public read.

alter table public.products
  add column if not exists nutrition jsonb;

comment on column public.products.nutrition is
  'Per-100g nutrition: { calories, protein_g, fat_g, sugar_g, fibre_g, carbs_g, sodium_mg }. All fields optional; admin fills what they have on the FSSAI nutrition fact sheet.';

-- The site_content table uses (key, data) — the festival manager upserts
-- the row keyed 'active_festival' with a JSONB body shaped
--   { slug, banner_text, ends_at, curated_product_ids[], auto_apply_theme }.
-- Storefront SiteContentProvider reloads on changes via realtime + a 60s
-- poll, so the site reflects the change within a few seconds without a
-- redeploy.
insert into public.site_content (key, data)
values (
  'active_festival',
  '{"slug": null, "banner_text": null, "ends_at": null, "curated_product_ids": [], "auto_apply_theme": true}'::jsonb
)
on conflict (key) do nothing;

-- Storage bucket for admin-uploaded product images. Public read so <img>
-- tags work without signed URLs; insert/update/delete gated to admins.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "admin uploads product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "admin updates product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin deletes product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "anyone reads product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');
