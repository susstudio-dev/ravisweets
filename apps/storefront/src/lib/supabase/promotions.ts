'use client';

import { getSupabase } from './client';

export interface PromotionRow {
  id: string;
  message: string;
  code: string | null;
  href: string;
  cta_label: string;
  bg_from: string;
  bg_to: string;
  fg: string;
  expires_at: string | null;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PromotionInput {
  id: string;
  message: string;
  code?: string | null;
  href: string;
  ctaLabel: string;
  bgFrom: string;
  bgTo: string;
  fg: string;
  expiresAt?: string | null;
}

/** Returns the single active promotion (if any). Public-readable. */
export async function getActivePromotion(): Promise<PromotionRow | null> {
  const supa = await getSupabase();
  if (!supa) return null;
  const { data, error } = await supa
    .from('promotions')
    .select('*')
    .eq('active', true)
    .maybeSingle();
  if (error || !data) return null;
  return data as PromotionRow;
}

/** Activates `input` as the single active promotion (deactivates anything else first). */
export async function publishPromotion(
  input: PromotionInput,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };

  const off = await supa
    .from('promotions')
    .update({ active: false })
    .eq('active', true);
  if (off.error) return { ok: false, reason: off.error.message };

  const row = {
    id: input.id,
    message: input.message,
    code: input.code ?? null,
    href: input.href,
    cta_label: input.ctaLabel,
    bg_from: input.bgFrom,
    bg_to: input.bgTo,
    fg: input.fg,
    expires_at: input.expiresAt ?? null,
    active: true,
  };
  const up = await supa.from('promotions').upsert(row);
  if (up.error) return { ok: false, reason: up.error.message };
  return { ok: true };
}

export async function clearActivePromotion(): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('promotions')
    .update({ active: false })
    .eq('active', true);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
