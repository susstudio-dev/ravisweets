-- ─── 0009 — Promotions table ────────────────────────────────────────
-- Replaces localStorage-only promo storage with a real Supabase row so
-- /admin/promotions persists across devices and the storefront's
-- <PromoStrip> can read the live promo without a per-device admin push.
--
-- Only one promotion is active at a time — enforced by a partial unique
-- index on `active = true`. Admin "publish" toggles active off the
-- previous row first via the API helper.

create table if not exists public.promotions (
  id           text primary key,
  message      text not null,
  code         text,
  href         text not null default '/shop',
  cta_label    text not null default 'Shop now',
  bg_from      text not null default '#2a1505',
  bg_to        text not null default '#5a3010',
  fg           text not null default '#fdf6ec',
  expires_at   timestamptz,
  active       boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create unique index if not exists promotions_one_active
  on public.promotions (active) where active;

drop trigger if exists promotions_touch on public.promotions;
create trigger promotions_touch before update on public.promotions
  for each row execute function public.touch_updated_at();

alter table public.promotions enable row level security;

drop policy if exists "anyone reads active promotion" on public.promotions;
drop policy if exists "anyone reads promotions" on public.promotions;
drop policy if exists "admin writes promotions" on public.promotions;
create policy "anyone reads promotions" on public.promotions
  for select using (true);
create policy "admin writes promotions" on public.promotions
  for all using (public.is_admin()) with check (public.is_admin());
