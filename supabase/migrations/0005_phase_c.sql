-- ─── 0005 — Phase C bundle ─────────────────────────────────────────────
-- Multi-location stock, batch/expiry tracking, scheduled site changes,
-- staff roles, and review photos. All additive — no breaking changes.
--
-- This file is fully idempotent: every CREATE is guarded so partial
-- replays after an SQL editor error don't fail. Postgres has no
-- "create type if not exists" so enums are wrapped in DO blocks that
-- swallow duplicate_object errors.

-- ────────────────────────────────────────────────────────────────────────
-- 1. Multi-location stock
-- ────────────────────────────────────────────────────────────────────────

do $$ begin
  create type store_location as enum ('khammam-flagship', 'khammam-second', 'kondapur');
exception when duplicate_object then null;
end $$;

create table if not exists public.variant_location_stock (
  variant_id  text not null references public.variants(id) on delete cascade,
  location    store_location not null,
  on_hand     int not null default 0 check (on_hand >= 0),
  reorder_at  int not null default 0,
  updated_at  timestamptz default now(),
  primary key (variant_id, location)
);

alter table public.variant_location_stock enable row level security;

drop policy if exists "anyone reads location stock" on public.variant_location_stock;
drop policy if exists "admin writes location stock" on public.variant_location_stock;
create policy "anyone reads location stock" on public.variant_location_stock
  for select using (true);
create policy "admin writes location stock" on public.variant_location_stock
  for all using (public.is_admin()) with check (public.is_admin());

do $$ begin
  create type stock_adjustment_reason as enum (
    'sale', 'return', 'transfer-in', 'transfer-out',
    'damaged', 'expired', 'restock', 'audit-correction'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.stock_adjustments (
  id          uuid primary key default gen_random_uuid(),
  variant_id  text not null references public.variants(id) on delete cascade,
  location    store_location not null,
  delta       int not null,
  reason      stock_adjustment_reason not null,
  notes       text,
  actor_id    uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.stock_adjustments enable row level security;

drop policy if exists "admin reads adjustments" on public.stock_adjustments;
drop policy if exists "admin writes adjustments" on public.stock_adjustments;
create policy "admin reads adjustments" on public.stock_adjustments
  for select using (public.is_admin());
create policy "admin writes adjustments" on public.stock_adjustments
  for insert with check (public.is_admin());

-- ────────────────────────────────────────────────────────────────────────
-- 2. Batch / expiry tracking — FSSAI-grade FIFO
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.product_batches (
  id           uuid primary key default gen_random_uuid(),
  variant_id   text not null references public.variants(id) on delete cascade,
  lot_number   text not null,
  made_on      date not null,
  expires_on   date not null,
  quantity     int not null check (quantity >= 0),
  consumed     int not null default 0 check (consumed >= 0),
  location     store_location not null,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (variant_id, lot_number)
);

create index if not exists idx_batches_expiry
  on public.product_batches (variant_id, expires_on);

alter table public.product_batches enable row level security;

drop policy if exists "admin reads batches" on public.product_batches;
drop policy if exists "admin writes batches" on public.product_batches;
create policy "admin reads batches" on public.product_batches
  for select using (public.is_admin());
create policy "admin writes batches" on public.product_batches
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists product_batches_touch on public.product_batches;
create trigger product_batches_touch before update on public.product_batches
  for each row execute function public.touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────
-- 3. Scheduled site changes
-- ────────────────────────────────────────────────────────────────────────

do $$ begin
  create type scheduled_kind as enum ('theme', 'banner', 'active_festival', 'promo');
exception when duplicate_object then null;
end $$;

create table if not exists public.scheduled_changes (
  id            uuid primary key default gen_random_uuid(),
  kind          scheduled_kind not null,
  payload       jsonb not null,
  effective_at  timestamptz not null,
  applied_at    timestamptz,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);

create index if not exists idx_scheduled_changes_pending
  on public.scheduled_changes (effective_at)
  where applied_at is null;

alter table public.scheduled_changes enable row level security;

drop policy if exists "admin reads scheduled" on public.scheduled_changes;
drop policy if exists "admin writes scheduled" on public.scheduled_changes;
create policy "admin reads scheduled" on public.scheduled_changes
  for select using (public.is_admin());
create policy "admin writes scheduled" on public.scheduled_changes
  for all using (public.is_admin()) with check (public.is_admin());

-- ────────────────────────────────────────────────────────────────────────
-- 4. Staff roles
-- ────────────────────────────────────────────────────────────────────────

create or replace function public.is_role(target text)
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = target,
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in
      ('admin', 'founder', 'ops', 'marketing', 'accountant'),
    false
  );
$$;

-- ────────────────────────────────────────────────────────────────────────
-- 5. Review photos
-- ────────────────────────────────────────────────────────────────────────

alter table public.reviews
  add column if not exists photos jsonb default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

drop policy if exists "any signed-in user uploads review photo" on storage.objects;
drop policy if exists "anyone reads review photos" on storage.objects;
create policy "any signed-in user uploads review photo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'review-photos');

create policy "anyone reads review photos"
  on storage.objects for select
  to public
  using (bucket_id = 'review-photos');
