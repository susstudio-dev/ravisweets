'use client';

import { getSupabase } from '../supabase/client';
import { prepareForUpload } from './resize';

/**
 * media_assets client — list/upload/annotate/delete against the single
 * `media` bucket + registry (migration 0013). All writes ride the admin
 * RLS policies; when Supabase isn't configured everything degrades to
 * empty/ok:false, never a throw.
 */

export type MediaKind = 'product' | 'hero' | 'festival' | 'store' | 'category' | 'og' | 'general';

/** Mirrors public.media_assets exactly (migration 0013). */
export interface MediaAsset {
  id: string;
  storage_path: string;
  alt: string;
  kind: MediaKind;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  created_by: string | null;
}

/** Newest first — the library grid and picker both want recency on top. */
export async function listMediaAssets(): Promise<MediaAsset[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as MediaAsset[];
}

/**
 * Downscale in the browser (resize.ts), upload to `media/<kind>/<uuid>.<ext>`,
 * then register the row. A failed row insert removes the orphaned object so
 * the bucket never collects untracked files.
 */
export async function uploadMediaAsset(
  file: File,
  kind: MediaKind,
): Promise<{ ok: true; asset: MediaAsset } | { ok: false; reason: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };

  let prepared: Awaited<ReturnType<typeof prepareForUpload>>;
  try {
    prepared = await prepareForUpload(file);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'could-not-prepare-image' };
  }

  const path = `${kind}/${crypto.randomUUID()}.${prepared.ext}`;
  const { error: upErr } = await supa.storage.from('media').upload(path, prepared.blob, {
    cacheControl: '31536000',
    upsert: false,
    contentType: prepared.mime,
  });
  if (upErr) return { ok: false, reason: upErr.message };

  const { data: { user } } = await supa.auth.getUser();
  const { data: row, error: rowErr } = await supa
    .from('media_assets')
    .insert({
      storage_path: path,
      alt: '',
      kind,
      mime: prepared.mime,
      bytes: prepared.blob.size,
      width: prepared.width,
      height: prepared.height,
      created_by: user?.id ?? null,
    })
    .select('*')
    .single();
  if (rowErr || !row) {
    await supa.storage.from('media').remove([path]);
    return { ok: false, reason: rowErr?.message ?? 'asset-row-insert-failed' };
  }
  return { ok: true, asset: row as MediaAsset };
}

export async function updateAssetAlt(id: string, alt: string): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa.from('media_assets').update({ alt }).eq('id', id);
  return !error;
}

/** Removes the storage object first, then the registry row. */
export async function deleteMediaAsset(
  asset: MediaAsset,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error: objErr } = await supa.storage.from('media').remove([asset.storage_path]);
  if (objErr) return { ok: false, reason: objErr.message };
  const { error } = await supa.from('media_assets').delete().eq('id', asset.id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
