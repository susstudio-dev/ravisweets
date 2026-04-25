'use client';

import { getSupabase } from './client';

export async function upsertVariantPrice(
  variantId: string,
  priceAmount: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('variants')
    .update({ price_amount: priceAmount })
    .eq('id', variantId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertVariantStock(
  variantId: string,
  stockAvailable: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('variants')
    .update({
      stock_available: stockAvailable,
      last_restocked_at: new Date().toISOString(),
    })
    .eq('id', variantId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertVariantTitle(
  variantId: string,
  title: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('variants').update({ title }).eq('id', variantId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductUnitMode(
  productId: string,
  unitMode: 'weight' | 'quantity',
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  // unit_mode column may not exist on the products table yet — caller should
  // run migration 0002 first. Until then this returns ok:false with a clear reason.
  const { error } = await supa.from('products').update({ unit_mode: unitMode }).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductFlags(
  productId: string,
  flags: { featured?: boolean; bestseller?: boolean; new?: boolean; archived?: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const update: Record<string, boolean> = {};
  if (flags.featured !== undefined) update.featured = flags.featured;
  if (flags.bestseller !== undefined) update.bestseller = flags.bestseller;
  if (flags.new !== undefined) update.is_new = flags.new;
  if (flags.archived !== undefined) update.archived = flags.archived;
  const { error } = await supa.from('products').update(update).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
