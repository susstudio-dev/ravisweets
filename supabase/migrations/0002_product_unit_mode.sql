-- ─── 0002 — Product unit_mode + variant title editability ──────────────────
-- Lets the admin choose whether a product is sold by weight (250 g · 1 kg) or
-- by pack count (Box of 12 · Box of 48). Drives the variant-picker label on
-- the storefront ("Size" vs "Pack").

create type product_unit_mode as enum ('weight', 'quantity');

alter table public.products
  add column if not exists unit_mode product_unit_mode not null default 'weight';

-- Variant title is already editable; this is a comment-only migration confirming
-- that admin write policies cover updates to the `title` column too.
-- (No DDL needed — RLS already grants admins full update access.)
comment on column public.variants.title is
  'Free-form variant label. Use grams ("250 g") when product.unit_mode=weight, or pack-count ("Box of 12") when product.unit_mode=quantity.';
