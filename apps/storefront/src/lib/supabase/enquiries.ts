'use client';

import { getSupabase } from './client';

export interface EnquirySubmission {
  refCode: string;
  data: Record<string, unknown>;
  builderState?: string;
}

export async function submitEnquiry(payload: EnquirySubmission): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa.from('enquiries').insert({
    ref_code: payload.refCode,
    customer_id: user?.id ?? null,
    data: payload.data,
    builder_state: payload.builderState ?? null,
    status: 'new',
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export interface EnquiryRow {
  id: string;
  ref_code: string;
  customer_id: string | null;
  data: Record<string, unknown>;
  status: 'new' | 'responded' | 'quoted' | 'closed';
  builder_state: string | null;
  created_at: string;
}

export async function listEnquiries(): Promise<EnquiryRow[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data as EnquiryRow[];
}

export async function transitionEnquiryStatus(
  id: string,
  next: 'new' | 'responded' | 'quoted' | 'closed',
): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const stamp =
    next === 'responded'
      ? { responded_at: new Date().toISOString() }
      : next === 'closed'
      ? { closed_at: new Date().toISOString() }
      : {};
  const { error } = await supa.from('enquiries').update({ status: next, ...stamp }).eq('id', id);
  return !error;
}
