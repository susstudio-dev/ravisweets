-- ════════════════════════════════════════════════════════════════════════
-- Ravi Sweets — consolidated setup script (migrations 0005 → 0008)
-- ════════════════════════════════════════════════════════════════════════
--
-- Paste-and-run in the Supabase SQL editor. Fully idempotent — safe to
-- re-run after partial failures. Assumes 0001–0004 are already applied
-- (they create the core schema: products, variants, orders, coupons,
-- theme_presets, audit_log, content, reviews, festivals, nutrition, etc).
--
-- What this delivers:
--   1. Multi-location stock + adjustments + batches + scheduled changes
--      (Phase C ops)
--   2. Staff roles helper functions: is_role(text), is_admin()
--   3. Review photos column + storage bucket
--   4. Team management (invitations + per-user permissions, founder-gated)
--   5. Unified support inbox (threads + messages + auto-bump trigger)
--   6. Four palette presets seeded into theme_presets so /admin/themes
--      can swap between them
--
-- ════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
-- 0. Helper functions (must come first — every policy below references them)
-- ───────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────
-- 1. Multi-location stock (from 0005)
-- ───────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────
-- 2. Batch / expiry tracking
-- ───────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────
-- 3. Scheduled site changes
-- ───────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────
-- 4. Review photos
-- ───────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────
-- 5. Team management (from 0006)
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.team_invitations (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  role          text not null check (role in ('founder', 'admin', 'ops', 'marketing', 'accountant')),
  permissions   jsonb default '{}'::jsonb,
  invited_by    uuid references auth.users(id) on delete set null,
  invited_at    timestamptz default now(),
  accepted_at   timestamptz,
  revoked_at    timestamptz,
  notes         text
);

alter table public.team_invitations enable row level security;

drop policy if exists "founder reads invitations" on public.team_invitations;
drop policy if exists "founder writes invitations" on public.team_invitations;
create policy "founder reads invitations" on public.team_invitations
  for select using (public.is_role('founder') or public.is_role('admin'));
create policy "founder writes invitations" on public.team_invitations
  for all using (public.is_role('founder') or public.is_role('admin'))
  with check (public.is_role('founder') or public.is_role('admin'));

create table if not exists public.staff_permissions (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  notes       text,
  updated_at  timestamptz default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

alter table public.staff_permissions enable row level security;

drop policy if exists "staff reads own permissions" on public.staff_permissions;
drop policy if exists "founder writes permissions" on public.staff_permissions;
create policy "staff reads own permissions" on public.staff_permissions
  for select using (auth.uid() = user_id or public.is_role('founder') or public.is_role('admin'));
create policy "founder writes permissions" on public.staff_permissions
  for all using (public.is_role('founder') or public.is_role('admin'))
  with check (public.is_role('founder') or public.is_role('admin'));

-- ───────────────────────────────────────────────────────────────────────
-- 6. Unified support inbox (from 0007)
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.support_threads (
  id              uuid primary key default gen_random_uuid(),
  channel         text not null check (channel in ('whatsapp', 'email', 'instagram', 'website')),
  customer_name   text,
  customer_email  text,
  customer_phone  text,
  customer_handle text,
  subject         text,
  status          text not null default 'open' check (status in ('open', 'pending', 'resolved', 'spam')),
  last_message_at timestamptz default now(),
  unread          boolean not null default true,
  assigned_to     uuid references auth.users(id) on delete set null,
  tags            text[] default '{}',
  created_at      timestamptz default now()
);

create index if not exists idx_support_threads_status
  on public.support_threads (status, last_message_at desc);
create index if not exists idx_support_threads_channel
  on public.support_threads (channel);

alter table public.support_threads enable row level security;

drop policy if exists "staff reads threads" on public.support_threads;
drop policy if exists "staff writes threads" on public.support_threads;
create policy "staff reads threads" on public.support_threads
  for select using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));
create policy "staff writes threads" on public.support_threads
  for all using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'))
  with check (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));

create table if not exists public.support_messages (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid not null references public.support_threads(id) on delete cascade,
  direction    text not null check (direction in ('inbound', 'outbound')),
  body         text not null,
  author_name  text,
  author_id    uuid references auth.users(id) on delete set null,
  attachments  jsonb default '[]'::jsonb,
  sent_at      timestamptz default now()
);

create index if not exists idx_support_messages_thread
  on public.support_messages (thread_id, sent_at);

alter table public.support_messages enable row level security;

drop policy if exists "staff reads messages" on public.support_messages;
drop policy if exists "staff writes messages" on public.support_messages;
create policy "staff reads messages" on public.support_messages
  for select using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));
create policy "staff writes messages" on public.support_messages
  for all using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'))
  with check (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));

create or replace function public.bump_thread_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_threads
     set last_message_at = new.sent_at,
         unread = case when new.direction = 'inbound' then true else unread end
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists trg_support_messages_bump_thread on public.support_messages;
create trigger trg_support_messages_bump_thread
  after insert on public.support_messages
  for each row
  execute function public.bump_thread_on_message();

-- ───────────────────────────────────────────────────────────────────────
-- 7. Palette presets (from 0008)
-- ───────────────────────────────────────────────────────────────────────

update public.theme_presets set active = false where active;

insert into public.theme_presets (id, name, active, palette, hero, banner_text)
values
  (
    'pista-rose',
    'Pista & Rose — kalakand cream',
    true,
    jsonb_build_object('base','#f4efde','accent','#a8345d','glow','#c9d99c','ink','#1f1820','grainOpacity',0.05),
    jsonb_build_object(
      'eyebrow','Khammam · est. 1985',
      'headline','Slow-cooked sweets, packed with rose and pistachio.',
      'body','Kalakand, Badam ki Jali, Qubani ka Meetha — the Hyderabadi sweet shop, plated the slow way.',
      'ctaLabel','Shop the kitchen',
      'ctaHref','/shop',
      'imageUrl','https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png'
    ),
    null
  ),
  (
    'saffron-cardamom',
    'Saffron & Cardamom — festival crimson',
    false,
    jsonb_build_object('base','#fbf2e6','accent','#b8312c','glow','#f2b96a','ink','#221008','grainOpacity',0.05),
    jsonb_build_object(
      'eyebrow','Festival ready',
      'headline','A box for every occasion — from rakhi to christmas.',
      'body','Festival hampers, corporate runs, and pre-order drops timed to every Indian calendar.',
      'ctaLabel','Shop festival hampers',
      'ctaHref','/category/festival-specials',
      'imageUrl','https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png'
    ),
    'Free festival shipping above ₹1499'
  ),
  (
    'brass-ghee',
    'Brass & Ghee — heritage warm',
    false,
    jsonb_build_object('base','#fbf3df','accent','#a8501f','glow','#e9b249','ink','#1f0c02','grainOpacity',0.05),
    jsonb_build_object(
      'eyebrow','Heritage line',
      'headline','Forty years of slow sweetness, in a brass tin.',
      'body','The recipes our founder Srinivasa Rao started with in 1985 — unchanged, hand-pressed, hand-packed.',
      'ctaLabel','Shop signature box',
      'ctaHref','/category/hyderabadi-specials',
      'imageUrl','https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png'
    ),
    null
  ),
  (
    'midnight-saffron',
    'Midnight Saffron — late-festival',
    false,
    jsonb_build_object('base','#1a1208','accent','#f2b96a','glow','#e9b249','ink','#fdf6ec','grainOpacity',0.07),
    jsonb_build_object(
      'eyebrow','Late festival drops',
      'headline','Sweets for the night before the morning prasad.',
      'body','Saffron-amber boxes for last-mile festival pickups — Khammam + Hyderabad same-day.',
      'ctaLabel','Shop tonight',
      'ctaHref','/category/sweets',
      'imageUrl','https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png'
    ),
    'Same-day pickup · Khammam + Hyderabad'
  )
on conflict (id) do update
  set name = excluded.name,
      palette = excluded.palette,
      hero = excluded.hero,
      banner_text = excluded.banner_text;

-- ════════════════════════════════════════════════════════════════════════
-- DONE. Everything above is idempotent — re-run any time.
-- ════════════════════════════════════════════════════════════════════════
