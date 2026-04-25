'use client';

import { getSupabase } from './client';

export interface ThemePreset {
  id: string;
  name: string;
  active: boolean;
  palette: { base: string; accent: string; glow: string; ink: string; grainOpacity?: number };
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    imageUrl: string;
  };
  bannerText: string | null;
}

interface ThemeRow {
  id: string;
  name: string;
  active: boolean;
  palette: ThemePreset['palette'];
  hero: ThemePreset['hero'];
  banner_text: string | null;
}

function fromRow(r: ThemeRow): ThemePreset {
  return {
    id: r.id,
    name: r.name,
    active: r.active,
    palette: r.palette,
    hero: r.hero,
    bannerText: r.banner_text,
  };
}

export async function listThemes(): Promise<ThemePreset[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa.from('theme_presets').select('*').order('id');
  if (error || !data) return [];
  return (data as ThemeRow[]).map(fromRow);
}

export async function activateTheme(id: string): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  // Disable all, then activate one. The unique partial index blocks
  // double-active states atomically once postgres commits the transaction.
  const { error: e1 } = await supa
    .from('theme_presets')
    .update({ active: false })
    .neq('id', id);
  if (e1) return { ok: false, reason: e1.message };
  const { error: e2 } = await supa.from('theme_presets').update({ active: true }).eq('id', id);
  if (e2) return { ok: false, reason: e2.message };
  return { ok: true };
}

export async function upsertTheme(t: ThemePreset): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const row: ThemeRow = {
    id: t.id,
    name: t.name,
    active: t.active,
    palette: t.palette,
    hero: t.hero,
    banner_text: t.bannerText,
  };
  const { error } = await supa.from('theme_presets').upsert(row);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
