'use client';

import { getSupabase } from './client';
import { saveSiteContent, type SiteContentKey } from './site-content';

/**
 * Scheduled site changes.
 *
 * The admin queues a future change (theme swap / banner / festival /
 * promo). The `effective_at` timestamp drives a publish step:
 *  - Manual: admin clicks "Publish due" on /admin/schedule
 *  - Automatic (Phase D): a Supabase cron / Edge Function runs every
 *    10 minutes and publishes any rows where applied_at IS NULL AND
 *    effective_at <= now().
 *
 * For now the manual button is enough — the brand owner wakes up at 6 AM
 * for Diwali, taps Publish due once, and everything goes live.
 */

export type ScheduledKind = 'theme' | 'banner' | 'active_festival' | 'promo';

export interface ScheduledChange {
  id: string;
  kind: ScheduledKind;
  payload: unknown;
  effective_at: string;
  applied_at: string | null;
  created_at: string;
}

export async function listScheduledChanges(): Promise<ScheduledChange[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('scheduled_changes')
    .select('*')
    .order('effective_at', { ascending: true });
  if (error || !data) return [];
  return data as ScheduledChange[];
}

export async function scheduleChange(
  kind: ScheduledKind,
  payload: unknown,
  effectiveAt: Date,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa.from('scheduled_changes').insert({
    kind,
    payload,
    effective_at: effectiveAt.toISOString(),
    created_by: user?.id ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteScheduledChange(
  id: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('scheduled_changes').delete().eq('id', id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/**
 * Publish every change whose effective_at <= now() and not yet applied.
 * Maps each kind to the correct site_content key + saves it. Returns the
 * count of rows applied.
 */
export async function publishDueChanges(): Promise<{
  ok: boolean;
  applied: number;
  reason?: string;
}> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, applied: 0, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('scheduled_changes')
    .select('*')
    .is('applied_at', null)
    .lte('effective_at', new Date().toISOString());
  if (error || !data) return { ok: false, applied: 0, reason: error?.message };

  let applied = 0;
  for (const row of data as ScheduledChange[]) {
    const key = scheduledKindToKey(row.kind);
    if (!key) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await saveSiteContent(key, row.payload as any);
    if (r.ok) {
      await supa
        .from('scheduled_changes')
        .update({ applied_at: new Date().toISOString() })
        .eq('id', row.id);
      applied++;
    }
  }
  return { ok: true, applied };
}

function scheduledKindToKey(kind: ScheduledKind): SiteContentKey | null {
  switch (kind) {
    case 'theme':
      return null; // themes flow through admin-themes (different table); Phase D
    case 'banner':
      return 'hero'; // banner copy lives on hero today; widen in Phase D
    case 'active_festival':
      return 'active_festival';
    case 'promo':
      return null; // promos live in localStorage today; Phase D moves to site_content
  }
}
