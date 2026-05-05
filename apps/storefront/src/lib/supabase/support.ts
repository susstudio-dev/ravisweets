'use client';

import { getSupabase } from './client';

export type SupportChannel = 'whatsapp' | 'email' | 'instagram' | 'website';
export type SupportStatus = 'open' | 'pending' | 'resolved' | 'spam';
export type MessageDirection = 'inbound' | 'outbound';

export interface SupportThread {
  id: string;
  channel: SupportChannel;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_handle: string | null;
  subject: string | null;
  status: SupportStatus;
  last_message_at: string;
  unread: boolean;
  assigned_to: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  thread_id: string;
  direction: MessageDirection;
  body: string;
  author_name: string | null;
  author_id: string | null;
  attachments: unknown;
  sent_at: string;
}

export async function listSupportThreads(): Promise<SupportThread[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('support_threads')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error || !data) return [];
  return data as SupportThread[];
}

export async function listSupportMessages(threadId: string): Promise<SupportMessage[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('support_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('sent_at', { ascending: true });
  if (error || !data) return [];
  return data as SupportMessage[];
}

export async function markThreadRead(
  threadId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('support_threads')
    .update({ unread: false })
    .eq('id', threadId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function setThreadStatus(
  threadId: string,
  status: SupportStatus,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('support_threads')
    .update({ status })
    .eq('id', threadId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function sendReply(
  threadId: string,
  body: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa.from('support_messages').insert({
    thread_id: threadId,
    direction: 'outbound',
    body: body.trim(),
    author_id: user?.id ?? null,
    author_name: user?.email ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
