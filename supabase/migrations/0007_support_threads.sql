-- ─── 0007 — Unified support inbox ───────────────────────────────────
-- Threads + messages so the admin /inbox shows real conversations.
-- Channels initially supported: whatsapp | email | instagram | website.
-- The actual channel adapters (WhatsApp Business API, Gmail IMAP poll,
-- Instagram Graph) land later — until they do, anything inserted by
-- staff or the website contact-form populates this table directly.

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

create index if not exists idx_support_threads_status on public.support_threads (status, last_message_at desc);
create index if not exists idx_support_threads_channel on public.support_threads (channel);

alter table public.support_threads enable row level security;

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

create index if not exists idx_support_messages_thread on public.support_messages (thread_id, sent_at);

alter table public.support_messages enable row level security;

create policy "staff reads messages" on public.support_messages
  for select using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));
create policy "staff writes messages" on public.support_messages
  for all using (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'))
  with check (public.is_role('admin') or public.is_role('founder') or public.is_role('ops') or public.is_role('marketing'));

-- Bump thread.last_message_at + unread on inbound messages.
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
