'use client';

import { getSupabase } from './client';

/**
 * site_content version history — read-only client for the snapshots the
 * `site_content_snapshot` trigger writes on every update (migration 0013).
 * Restore is NOT here on purpose: a restore flows through the caller's
 * validated saveSiteContent path, so it can never bypass what a direct
 * edit would reject (spec §6.7).
 */

export interface ContentVersion {
  id: number;
  key: string;
  data: unknown;
  created_at: string;
  created_by: string | null;
}

/** Newest first. Empty when Supabase is unconfigured or the query fails. */
export async function listVersions(key: string, limit?: number): Promise<ContentVersion[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('site_content_versions')
    .select('*')
    .eq('key', key)
    .order('created_at', { ascending: false })
    .limit(limit ?? 30);
  if (error || !data) return [];
  return data as ContentVersion[];
}
