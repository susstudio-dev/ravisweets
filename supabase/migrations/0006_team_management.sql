-- ─── 0006 — Team management ──────────────────────────────────────────
-- Founder can invite staff with a specific role from /admin/team. The
-- table tracks pending invitations (sent but not yet accepted) plus a
-- per-staff permissions JSON so the same role can be scoped further
-- (e.g. "ops, but no refunds").

-- Make the migration self-sufficient: if 0005 hasn't been run on this
-- project, define is_role here so the policies below resolve. Same shape
-- as 0005 so applying 0005 later is a no-op.
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

-- Scoped permissions per staff user. Admin team page reads/writes here.
-- Cleared when a staff user is revoked. Shape:
--   { "orders.refund": false, "promotions.publish": true, "products.create": true }
-- Empty/missing = role default.
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
