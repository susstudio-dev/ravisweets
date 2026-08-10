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
