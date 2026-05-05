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

/**
 * Upload an image file to the `product-images` Supabase Storage bucket
 * and return its public URL. Filename is namespaced under the product id
 * so re-uploads for the same product land in the same folder.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; reason: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const safeExt = /^(jpg|jpeg|png|webp|avif|svg)$/.test(ext) ? ext : 'jpg';
  const path = `${productId}/${Date.now()}.${safeExt}`;
  const { error: upErr } = await supa.storage
    .from('product-images')
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || `image/${safeExt}`,
    });
  if (upErr) return { ok: false, reason: upErr.message };
  const { data } = supa.storage.from('product-images').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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

export interface CreateProductInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  dietary_tags: DietaryTag[];
  shelf_life_days: number;
  storage_instructions: string;
  builder_eligible: boolean;
  unit_mode: 'weight' | 'quantity';
  primary_image_url: string;
  primary_image_alt: string;
  /** First variant — admin can add more from the existing edit drawer afterwards. */
  variant: {
    id: string;
    title: string;
    weight_grams: number;
    price_amount: number; // paise
    sku: string;
    stock_available: number;
  };
}

export async function createProduct(
  input: CreateProductInput,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };

  // Insert product row
  const { error: prodErr } = await supa.from('products').insert({
    id: input.id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: input.category,
    dietary_tags: input.dietary_tags,
    storage_instructions: input.storage_instructions,
    shelf_life_days: input.shelf_life_days,
    images: [
      {
        url: input.primary_image_url,
        alt: input.primary_image_alt,
        width: 1400,
        height: 1400,
      },
    ],
    region_availability: ['in'],
    featured: false,
    bestseller: false,
    is_new: true,
    builder_eligible: input.builder_eligible,
    unit_mode: input.unit_mode,
    theme_palette: {
      base: '#fbf3df',
      accent: '#a8501f',
      glow: '#e9b249',
      ink: '#1f0c02',
      grainOpacity: 0.05,
    },
    garnish: 'paisley',
  });
  if (prodErr) return { ok: false, reason: prodErr.message };

  // Insert variant
  const { error: varErr } = await supa.from('variants').insert({
    id: input.variant.id,
    product_id: input.id,
    title: input.variant.title,
    weight_grams: input.variant.weight_grams,
    price_amount: input.variant.price_amount,
    price_currency: 'INR',
    sku: input.variant.sku,
    stock_available: input.variant.stock_available,
  });
  if (varErr) {
    // Best-effort cleanup so we don't leave a half-created product.
    await supa.from('products').delete().eq('id', input.id);
    return { ok: false, reason: varErr.message };
  }
  return { ok: true };
}

export interface ProductSaleInput {
  on_sale: boolean;
  sale_price?: number | null;
  sale_percent_off?: number | null;
  sale_ends_at?: string | null;
  sale_label?: string | null;
}

export interface ProductNutrition {
  calories?: number;
  protein_g?: number;
  fat_g?: number;
  sugar_g?: number;
  fibre_g?: number;
  carbs_g?: number;
  sodium_mg?: number;
}

export async function upsertProductNutrition(
  productId: string,
  nutrition: ProductNutrition,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(nutrition)) {
    if (typeof v === 'number' && Number.isFinite(v)) cleaned[k] = v;
  }
  const payload = Object.keys(cleaned).length > 0 ? cleaned : null;
  const { error } = await supa
    .from('products')
    .update({ nutrition: payload })
    .eq('id', productId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function upsertProductSale(
  productId: string,
  sale: ProductSaleInput,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa
    .from('products')
    .update({
      on_sale: sale.on_sale,
      sale_price: sale.sale_price ?? null,
      sale_percent_off: sale.sale_percent_off ?? null,
      sale_ends_at: sale.sale_ends_at ?? null,
      sale_label: sale.sale_label ?? null,
    })
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
