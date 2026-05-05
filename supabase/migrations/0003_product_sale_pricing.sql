-- ─── 0003 — Per-product sale pricing ──────────────────────────────────────
-- Lets the admin put a single product on sale with a strikethrough on the
-- storefront. Discount applies uniformly across all variants of the
-- product (if you need different sale prices per variant, model them as
-- separate products — keeps the data shape simple).
--
-- The storefront reads these via computeEffectivePrice() in
-- packages/shared/src/types/product.ts.

alter table public.products
  add column if not exists on_sale boolean not null default false,
  add column if not exists sale_price int,                  -- paise
  add column if not exists sale_percent_off smallint,       -- 1..99
  add column if not exists sale_ends_at timestamptz,
  add column if not exists sale_label text;

-- A row is "currently on sale" if on_sale=true AND (sale_ends_at IS NULL OR
-- sale_ends_at > now()). The storefront re-checks the timestamp client-side
-- too so the badge disappears the moment a sale ends without a refresh.
create index if not exists idx_products_on_sale
  on public.products (on_sale)
  where on_sale = true;

comment on column public.products.on_sale is
  'Master switch — when true, storefront renders the variant price strikethrough.';
comment on column public.products.sale_price is
  'Flat sale price in paise. Wins over sale_percent_off when both are set.';
comment on column public.products.sale_percent_off is
  'Whole-percent discount (e.g. 15 means 15% off). Used when sale_price is null.';
comment on column public.products.sale_ends_at is
  'Optional sale end timestamp. Storefront auto-hides past this without a write.';
comment on column public.products.sale_label is
  'Human-readable badge label e.g. "Diwali pre-order" or "Clearance".';
