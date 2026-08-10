-- ─── 0015 · Publish state: one row that coalesces rebuild requests ─────────
-- Spec: docs/superpowers/specs/2026-08-06-admin-media-and-go-live-design.md §6.3
-- Apply AFTER 0014. Idempotent: safe to re-run.
--
-- Required by the `publish-site` edge function. Without this table that
-- function returns a 500 telling you to apply this file.
begin;

-- 1 · The singleton (spec §6.3).
--
--     WHY A TABLE AND NOT MEMORY: `publish-site` runs in short-lived isolates
--     that are spawned independently and share nothing. Two clicks ten seconds
--     apart can easily land in two different isolates, so an in-memory "last
--     published at" would coalesce nothing. Postgres is the only state both
--     isolates can see.
--
--     WHY EXACTLY ONE ROW: there is one site and one Cloudflare Pages project.
--     The claim in the function is a conditional UPDATE of this row, so a
--     second row would quietly hand out a second rebuild window. The
--     `check (id = 'site')` makes that unrepresentable. Same singleton shape
--     as `site_content` keys — a text primary key, no surrogate id.
create table if not exists public.publish_state (
  id                 text primary key default 'site' check (id = 'site'),

  -- When the deploy hook was last POSTed. The 5-minute window is measured from
  -- HERE, not from the last content edit: what is being rate-limited is
  -- Cloudflare builds, not the owner's typing.
  last_triggered_at  timestamptz,
  last_triggered_by  uuid references auth.users(id) on delete set null,

  -- The id Cloudflare returns for the hook run, kept so a mystery build can be
  -- traced back to the click that started it.
  last_deploy_id     text,

  -- Non-null means: edits exist that no build has picked up, because a publish
  -- was asked for inside the window. Cleared when a build is claimed. This
  -- column is the whole reason a coalesced publish is not a dropped publish —
  -- it records that the site is behind the database, and who noticed first.
  pending_since      timestamptz,
  pending_by         uuid references auth.users(id) on delete set null,

  updated_at         timestamptz not null default now()
);

-- Seed the singleton so the function only ever UPDATEs. Making it upsert
-- instead would put the very first publish — the path least likely to be
-- exercised before launch — on its own untested code path.
insert into public.publish_state (id) values ('site')
on conflict (id) do nothing;

drop trigger if exists publish_state_touch on public.publish_state;
create trigger publish_state_touch before update on public.publish_state
  for each row execute function public.touch_updated_at();

-- 2 · RLS.
alter table public.publish_state enable row level security;

-- Admin-only read: the Publish control shows "last published at" and whether
-- changes are still waiting, and rendering that should not cost an edge
-- function invocation. `public.is_admin()` tests
-- app_metadata.role = 'admin' (0001_init.sql:9) — the exact claim the edge
-- function checks on its caller, so the two gates cannot drift apart.
drop policy if exists "admin reads publish state" on public.publish_state;
create policy "admin reads publish state" on public.publish_state for select
  using (public.is_admin());

-- No insert/update/delete policies, deliberately: every write comes from the
-- `publish-site` function using the service-role key, which bypasses RLS. A
-- browser that could write `last_triggered_at` could reset the window at will
-- and turn the Publish button into an open tap on the account's build minutes.

comment on table public.publish_state is
  'Singleton. Rebuild-coalescing state for the publish-site edge function; written only by that function via service_role.';

commit;
