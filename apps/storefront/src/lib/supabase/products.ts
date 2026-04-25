'use client';

import { getSupabase } from './client';
import type { CategorySlug, DietaryTag } from '@ravisweets/shared';

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

export async function upsertProductDescription(
  productId: string,
  description: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('products').update({ description }).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductCategory(
  productId: string,
  category: CategorySlug,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('products').update({ category }).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductDietaryTags(
  productId: string,
  tags: DietaryTag[],
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('products').update({ dietary_tags: tags }).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductPrimaryImage(
  productId: string,
  url: string,
  alt: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  // Replaces just the primary image at index 0; preserves any additional
  // gallery entries by reading-then-writing the full jsonb array.
  const { data: prev, error: readErr } = await supa
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();
  if (readErr) return { ok: false, reason: readErr.message };
  const existing = (prev?.images as Array<{ url: string; alt: string; width: number; height: number }>) ?? [];
  const next = [{ url, alt, width: 1400, height: 1400 }, ...existing.slice(1)];
  const { error } = await supa.from('products').update({ images: next }).eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductBuilderEligible(
  productId: string,
  eligible: boolean,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('products')
    .update({ builder_eligible: eligible })
    .eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductShelfLifeDays(
  productId: string,
  days: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('products')
    .update({ shelf_life_days: days })
    .eq('id', productId);
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
