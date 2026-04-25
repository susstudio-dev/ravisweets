-- ─── Ravi Sweets — initial Supabase schema ────────────────────────────────
-- Run order: customers → addresses → products/variants → orders → enquiries
--            → coupons → coupon_redemptions → theme_presets → audit_log
-- All tables use RLS. Admin role is gated via JWT custom claim `role: 'admin'`.

-- ─── helpers ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── customers ────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text unique
                  check (phone is null or phone ~ '^\+?[1-9]\d{1,14}$'),
  email         text unique,
  dietary_prefs text[] default '{}',
  gstin         text
                  check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  business_name text,
  is_b2b        boolean default false,
  marketing_consent boolean default false,
  date_of_birth date
                  check (date_of_birth is null or date_of_birth <= current_date - interval '18 years'),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

alter table public.customers enable row level security;

create policy "customer reads self" on public.customers for select
  using (auth.uid() = id);
create policy "customer updates self" on public.customers for update
  using (auth.uid() = id);
create policy "customer inserts self" on public.customers for insert
  with check (auth.uid() = id);
create policy "admin reads all customers" on public.customers for select
  using (public.is_admin());
create policy "admin updates all customers" on public.customers for update
  using (public.is_admin());

-- ─── addresses ────────────────────────────────────────────────────────────
create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  label         text,
  line1         text not null,
  line2         text,
  city          text not null,
  state         text not null,
  pincode       text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  country       text not null default 'India',
  is_default    boolean default false,
  created_at    timestamptz default now()
);

create unique index if not exists addresses_one_default_per_customer
  on public.addresses (customer_id) where is_default;

alter table public.addresses enable row level security;

create policy "customer reads own addresses" on public.addresses for select
  using (auth.uid() = customer_id);
create policy "customer manages own addresses" on public.addresses for all
  using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "admin reads all addresses" on public.addresses for select
  using (public.is_admin());

-- ─── products + variants ──────────────────────────────────────────────────
-- Mirrors packages/shared/src/types/product.ts. The storefront still imports
-- from packages/shared at v1; a build script in Phase 3 will regenerate the
-- typed module from these tables.
create table if not exists public.products (
  id            text primary key,
  slug          text unique not null,
  title         text not null,
  description   text not null,
  category      text not null,
  subcategory   text,
  dietary_tags  text[] default '{}',
  ingredients   text[] default '{}',
  allergens     text[] default '{}',
  storage_instructions text,
  shelf_life_days int,
  images        jsonb default '[]'::jsonb,
  region_availability text[] default '{in}',
  featured      boolean default false,
  bestseller    boolean default false,
  is_new        boolean default false,
  theme_palette jsonb,
  garnish       text,
  builder_eligible boolean default false,
  rubric_passed_on date,
  source_url    text,
  archived      boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

create table if not exists public.variants (
  id            text primary key,
  product_id    text not null references public.products(id) on delete cascade,
  title         text not null,
  weight_grams  int,
  price_amount  int not null,
  price_currency text not null default 'INR',
  sku           text unique,
  stock_available int default 0,
  reorder_threshold int default 0,
  hsn_code      text,
  last_restocked_at timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger variants_touch before update on public.variants
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
alter table public.variants enable row level security;

-- Products and variants are PUBLIC read (anyone can view the catalogue),
-- admin write only.
create policy "anyone reads non-archived products" on public.products for select
  using (not archived or public.is_admin());
create policy "admin writes products" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "anyone reads variants" on public.variants for select using (true);
create policy "admin writes variants" on public.variants for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── orders ───────────────────────────────────────────────────────────────
create type order_status as enum ('placed', 'packed', 'shipped', 'delivered', 'cancelled');

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  number        text unique not null,
  customer_id   uuid references public.customers(id) on delete set null,
  status        order_status not null default 'placed',
  address_snapshot jsonb not null,
  payment       jsonb not null,
  lines         jsonb not null,
  subtotal      int not null,
  shipping      int not null default 0,
  discount      int not null default 0,
  total         int not null,
  currency      text not null default 'INR',
  coupon_code   text,
  placed_at     timestamptz default now(),
  packed_at     timestamptz,
  shipped_at    timestamptz,
  delivered_at  timestamptz,
  cancelled_at  timestamptz,
  pii_redacted_at timestamptz,
  created_at    timestamptz default now()
);

alter table public.orders enable row level security;

create policy "customer reads own orders" on public.orders for select
  using (auth.uid() = customer_id);
create policy "customer creates own orders" on public.orders for insert
  with check (auth.uid() = customer_id);
create policy "admin reads all orders" on public.orders for select
  using (public.is_admin());
create policy "admin updates all orders" on public.orders for update
  using (public.is_admin());

-- ─── enquiries (corporate enquiry form) ───────────────────────────────────
create type enquiry_status as enum ('new', 'responded', 'quoted', 'closed');

create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  ref_code      text unique not null,
  customer_id   uuid references public.customers(id) on delete set null,
  data          jsonb not null,           -- full form payload
  status        enquiry_status not null default 'new',
  builder_state text,                     -- serialised builder URL for "from builder" deep links
  responded_at  timestamptz,
  closed_at     timestamptz,
  created_at    timestamptz default now()
);

alter table public.enquiries enable row level security;

create policy "anyone creates enquiry" on public.enquiries for insert
  with check (true);
create policy "customer reads own enquiries" on public.enquiries for select
  using (auth.uid() = customer_id);
create policy "admin reads all enquiries" on public.enquiries for select
  using (public.is_admin());
create policy "admin updates all enquiries" on public.enquiries for update
  using (public.is_admin());

-- ─── coupons ──────────────────────────────────────────────────────────────
create type coupon_type as enum ('percent', 'flat', 'free_shipping', 'bogo');
create type coupon_target as enum ('cart', 'collection', 'product', 'hamper');

create table if not exists public.coupons (
  code          text primary key,         -- case-insensitive: store uppercase
  type          coupon_type not null,
  value         int not null,             -- percent (1-100) or paise (flat)
  max_discount_cap int,
  target_scope  coupon_target not null default 'cart',
  target_ids    text[],
  constraints   jsonb default '{}'::jsonb,
  valid_from    timestamptz default now(),
  valid_to      timestamptz,
  usage_limit   int,
  per_user_limit int default 1,
  stackable     boolean default false,
  priority      int default 0,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();

alter table public.coupons enable row level security;

create policy "anyone reads active coupons" on public.coupons for select
  using (active and (valid_to is null or valid_to >= now()));
create policy "admin writes coupons" on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── coupon redemptions ───────────────────────────────────────────────────
create table if not exists public.coupon_redemptions (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  coupon_code   text not null references public.coupons(code) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  discount_amount int not null,
  redeemed_at   timestamptz default now(),
  reversed_at   timestamptz,
  unique (customer_id, coupon_code, order_id)
);

alter table public.coupon_redemptions enable row level security;

create policy "customer reads own redemptions" on public.coupon_redemptions for select
  using (auth.uid() = customer_id);
create policy "admin reads all redemptions" on public.coupon_redemptions for select
  using (public.is_admin());

-- ─── theme presets ────────────────────────────────────────────────────────
create table if not exists public.theme_presets (
  id            text primary key,         -- 'default', 'diwali', 'eid', 'holi', 'rakhi', 'custom-1'
  name          text not null,
  active        boolean default false,
  palette       jsonb not null,           -- { base, accent, glow, ink, grainOpacity }
  hero          jsonb not null,           -- { eyebrow, headline, body, ctaLabel, ctaHref, imageUrl }
  banner_text   text,
  editorial_band_copy jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists theme_presets_one_active
  on public.theme_presets (active) where active;

create trigger theme_presets_touch before update on public.theme_presets
  for each row execute function public.touch_updated_at();

alter table public.theme_presets enable row level security;

create policy "anyone reads active theme" on public.theme_presets for select
  using (active or public.is_admin());
create policy "admin writes themes" on public.theme_presets for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── store settings (hours, delivery zones, owner profile) ────────────────
create table if not exists public.store_settings (
  id            text primary key default 'singleton',
  store_hours   jsonb default '[]'::jsonb,
  delivery_zones jsonb default '[]'::jsonb,
  owner_profile jsonb default '{}'::jsonb,
  filter_taxonomy jsonb default '{}'::jsonb,
  updated_at    timestamptz default now()
);

create trigger store_settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

alter table public.store_settings enable row level security;

create policy "anyone reads store settings" on public.store_settings for select
  using (true);
create policy "admin writes store settings" on public.store_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed singleton row.
insert into public.store_settings (id) values ('singleton') on conflict do nothing;

-- ─── audit log ────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action        text not null,
  entity_type   text not null,
  entity_id     text,
  before_data   jsonb,
  after_data    jsonb,
  created_at    timestamptz default now()
);

alter table public.audit_log enable row level security;

create policy "admin reads audit log" on public.audit_log for select
  using (public.is_admin());
create policy "admin appends audit log" on public.audit_log for insert
  with check (public.is_admin());

-- ─── seed: default theme preset (active) ──────────────────────────────────
insert into public.theme_presets (id, name, active, palette, hero, banner_text)
values (
  'default',
  'Default — Khammam warm cream',
  true,
  '{"base":"#fdf6ec","accent":"#8a5a10","glow":"#d4a96b","ink":"#2a1a04","grainOpacity":0.05}'::jsonb,
  jsonb_build_object(
    'eyebrow', 'Khammam · Telangana',
    'headline', 'The sweetness of Telangana, slow-cooked in Khammam.',
    'body', 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers.',
    'ctaLabel', 'Shop Hyderabadi specials',
    'ctaHref', '/category/hyderabadi-specials',
    'imageUrl', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=2000&q=92&auto=format&fit=crop'
  ),
  null
) on conflict do nothing;

-- ─── done ─────────────────────────────────────────────────────────────────
