'use client';

import { getSupabase } from './client';
import type { CategorySlug, DietaryTag, Product, ProductImage } from '@ravisweets/shared';
import { PRODUCT_PALETTES } from '@/lib/theme/palette';
import { wrote } from './write-result';

/* ─── reads ──────────────────────────────────────────────────────────────────
 *
 * Until this block existed, nothing in the app read a product back. Every
 * helper below writes a row to Postgres and then the screen re-renders from
 * the bundled CATALOGUE — so an owner who changed a price watched the old
 * price stay on screen and reasonably concluded the save had failed. It had
 * not: variant RS-QKM-250 sat at price_amount=1 in the database while every
 * surface, the admin included, kept showing the hardcoded 279.
 *
 * The shape of the fix is an OVERLAY, not a replacement. CATALOGUE stays the
 * source of truth for everything the admin cannot edit — slug, title,
 * ingredients, allergens, theme_palette, garnish, hsn_code — and the database
 * supplies only the columns it owns, only for the rows it actually has. A
 * product with no row keeps rendering exactly as it does today, which is what
 * makes this safe to drop in ahead of the 0014 seed being applied everywhere.
 */

/**
 * The product columns the admin can edit, as the database holds them.
 *
 * Column names are kept verbatim (`is_new`, not `new`) so a reader can tell at
 * a glance that this is the row and not a Product — mergeProductOverrides does
 * the renaming in exactly one place. `null` means "the database has no opinion"
 * for the nullable columns, and for the sale fields it means "no sale
 * configured", which is why the merge maps them to `undefined` rather than
 * falling back to the bundled value.
 */
export interface ProductOverride {
  description: string | null;
  category: CategorySlug | null;
  dietary_tags: DietaryTag[] | null;
  shelf_life_days: number | null;
  unit_mode: 'weight' | 'quantity' | null;
  images: ProductImage[] | null;
  featured: boolean | null;
  bestseller: boolean | null;
  is_new: boolean | null;
  archived: boolean | null;
  builder_eligible: boolean | null;
  on_sale: boolean | null;
  sale_price: number | null;
  sale_percent_off: number | null;
  sale_ends_at: string | null;
  sale_label: string | null;
  nutrition: Product['nutrition'] | null;
}

/** The variant columns the admin can edit. `price_amount` is in paise. */
export interface VariantOverride {
  title: string;
  price_amount: number;
  stock_available: number;
}

export interface CatalogueOverrides {
  /** Keyed by products.id. A missing key means "no row — use the bundle". */
  products: Map<string, ProductOverride>;
  /** Keyed by variants.id. */
  variants: Map<string, VariantOverride>;
  /**
   * Why the read produced nothing, when it produced nothing for a bad reason.
   * An empty map is ambiguous on its own — unseeded database, unconfigured
   * client and failed query all look identical — and callers that cannot tell
   * them apart end up showing bundled prices with a confident face. Null when
   * the read succeeded (including a legitimately empty catalogue).
   */
  error: string | null;
}

/** Safe to share: never mutated, only replaced. */
export const EMPTY_CATALOGUE_OVERRIDES: CatalogueOverrides = {
  products: new Map(),
  variants: new Map(),
  error: null,
};

// Explicit column lists rather than `*`: this is the contract of what the
// admin owns. Anything not named here is bundle-owned, and selecting it would
// only invite a future merge to overwrite hand-authored copy with seed data.
const PRODUCT_OVERRIDE_COLUMNS =
  'id, description, category, dietary_tags, shelf_life_days, unit_mode, images, featured, ' +
  'bestseller, is_new, archived, builder_eligible, on_sale, sale_price, sale_percent_off, ' +
  'sale_ends_at, sale_label, nutrition';

const VARIANT_OVERRIDE_COLUMNS = 'id, title, price_amount, stock_available';

type OverrideRow = ProductOverride & {
  id: string;
  variants: ({ id: string } & Partial<VariantOverride>)[] | null;
};

/**
 * Both tables in ONE round trip, via PostgREST resource embedding across the
 * variants.product_id foreign key. Two separate selects would double the
 * latency on a screen the owner opens constantly, and would also let the two
 * halves disagree if a write landed between them.
 *
 * Reads use the anon key and need no session: RLS grants "anyone reads
 * non-archived products" and "anyone reads variants". Archived rows come back
 * only for an admin, which is precisely who is looking at this.
 */
export async function listCatalogueOverrides(): Promise<CatalogueOverrides> {
  const supa = await getSupabase();
  if (!supa) return EMPTY_CATALOGUE_OVERRIDES;
  const { data, error } = await supa
    .from('products')
    .select(`${PRODUCT_OVERRIDE_COLUMNS}, variants(${VARIANT_OVERRIDE_COLUMNS})`);
  if (error || !data) {
    return {
      products: new Map(),
      variants: new Map(),
      // A missing column (42703) is the likeliest failure here and it takes the
      // whole select down with it, so name the message rather than swallowing
      // it — "run migration 0003" is only obvious once you can read the error.
      error: error?.message ?? 'The products query returned no data.',
    };
  }
  const products = new Map<string, ProductOverride>();
  const variants = new Map<string, VariantOverride>();
  for (const row of data as unknown as OverrideRow[]) {
    const { id, variants: rowVariants, ...override } = row;
    products.set(id, override);
    for (const v of rowVariants ?? []) {
      // A variant row always has a price; guard anyway so one malformed row
      // cannot poison the whole map with NaN prices.
      if (typeof v.price_amount !== 'number') continue;
      variants.set(v.id, {
        title: v.title ?? '',
        price_amount: v.price_amount,
        stock_available: v.stock_available ?? 0,
      });
    }
  }
  return { products, variants, error: null };
}

/**
 * Variant-only convenience for callers that price things and nothing else
 * (cart lines, stock badges). Delegates rather than issuing its own narrower
 * query — one query shape to keep working is enough.
 */
export async function listVariantOverrides(): Promise<Map<string, VariantOverride>> {
  return (await listCatalogueOverrides()).variants;
}

/**
 * Bundled product + whatever the database says about it. Returns the SAME
 * object when the database says nothing, so callers can rely on identity to
 * skip re-renders and change-detection.
 */
export function mergeProductOverrides(product: Product, overrides: CatalogueOverrides): Product {
  const variants = product.variants.map((v) => {
    const o = overrides.variants.get(v.id);
    if (!o) return v;
    return {
      ...v,
      title: o.title,
      price: { ...v.price, amount: o.price_amount },
      stock_available: o.stock_available,
    };
  });
  const variantsChanged = variants.some((v, i) => v !== product.variants[i]);
  const p = overrides.products.get(product.id);
  if (!p) return variantsChanged ? { ...product, variants } : product;
  return {
    ...product,
    variants,
    // `??` and not `||`: an empty description or a `false` flag is a real
    // admin decision, and `||` would quietly discard both.
    description: p.description ?? product.description,
    category: p.category ?? product.category,
    dietary_tags: p.dietary_tags ?? product.dietary_tags,
    shelf_life_days: p.shelf_life_days ?? product.shelf_life_days,
    unit_mode: p.unit_mode ?? product.unit_mode,
    images: p.images ?? product.images,
    featured: p.featured ?? product.featured,
    bestseller: p.bestseller ?? product.bestseller,
    new: p.is_new ?? product.new,
    builder_eligible: p.builder_eligible ?? product.builder_eligible,
    // Sale + nutrition live only in the database. A null column means the
    // admin cleared it, so it must NOT fall back to the bundled value.
    on_sale: p.on_sale ?? false,
    sale_price: p.sale_price ?? undefined,
    sale_percent_off: p.sale_percent_off ?? undefined,
    sale_ends_at: p.sale_ends_at ?? undefined,
    sale_label: p.sale_label ?? undefined,
    nutrition: p.nutrition ?? undefined,
  };
}

/* ─── writes ─────────────────────────────────────────────────────────────── */

export async function upsertVariantPrice(
  variantId: string,
  priceAmount: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('variants')
    .update({ price_amount: priceAmount })
    .eq('id', variantId)
    .select('id');
  return wrote(data, error, 'Variant price');
}

export async function upsertVariantStock(
  variantId: string,
  stockAvailable: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('variants')
    .update({
      stock_available: stockAvailable,
      last_restocked_at: new Date().toISOString(),
    })
    .eq('id', variantId)
    .select('id');
  return wrote(data, error, 'Variant stock');
}

export async function upsertVariantTitle(
  variantId: string,
  title: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('variants')
    .update({ title })
    .eq('id', variantId)
    .select('id');
  return wrote(data, error, 'Variant label');
}

export async function upsertProductUnitMode(
  productId: string,
  unitMode: 'weight' | 'quantity',
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  // unit_mode column may not exist on the products table yet — caller should
  // run migration 0002 first. Until then this returns ok:false with a clear reason.
  const { data, error } = await supa
    .from('products')
    .update({ unit_mode: unitMode })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Sold-by mode');
}

export async function upsertProductDescription(
  productId: string,
  description: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ description })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Description');
}

export async function upsertProductCategory(
  productId: string,
  category: CategorySlug,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ category })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Category');
}

export async function upsertProductDietaryTags(
  productId: string,
  tags: DietaryTag[],
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ dietary_tags: tags })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Dietary tags');
}

/**
 * Upload an image file to the `product-images` Supabase Storage bucket
 * and return its public URL. Filename is namespaced under the product id
 * so re-uploads for the same product land in the same folder.
 */
/** @deprecated new uploads go through lib/media/assets.ts — kept only for backwards compat. */
export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; reason: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const safeExt = /^(jpg|jpeg|png|webp|avif|svg)$/.test(ext) ? ext : 'jpg';
  const path = `${productId}/${Date.now()}.${safeExt}`;
  const { error: upErr } = await supa.storage.from('product-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || `image/${safeExt}`,
  });
  if (upErr) return { ok: false, reason: upErr.message };
  const { data } = supa.storage.from('product-images').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** @deprecated new uploads go through lib/media/assets.ts — kept only for backwards compat. */
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
  const existing =
    (prev?.images as Array<{ url: string; alt: string; width: number; height: number }>) ?? [];
  const next = [{ url, alt, width: 1400, height: 1400 }, ...existing.slice(1)];
  const { data, error } = await supa
    .from('products')
    .update({ images: next })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Primary image');
}

/**
 * Replace a product's full ordered image array in one write. Uses
 * `.select('id')` so a zero-row update is detectable: `matched: false` means
 * the product has no row in the DB yet (apply migration 0014_seed_products.sql)
 * and NOTHING was saved — callers must not show a "Saved ✓" in that case.
 *
 * Deliberately NOT switched to `wrote()` like its siblings: the caller wants
 * "the row is missing" as a distinct, non-fatal state it can explain in situ,
 * not as an error string it has to pattern-match.
 */
export async function updateProductImages(
  productId: string,
  images: ProductImage[],
): Promise<{ ok: boolean; matched: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, matched: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ images })
    .eq('id', productId)
    .select('id');
  if (error) return { ok: false, matched: false, reason: error.message };
  return { ok: true, matched: (data?.length ?? 0) > 0 };
}

export async function upsertProductBuilderEligible(
  productId: string,
  eligible: boolean,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ builder_eligible: eligible })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Builder eligibility');
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
  /** Intrinsic dimensions from the media-library asset; defaults to 1400. */
  primary_image_width?: number;
  primary_image_height?: number;
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
        width: input.primary_image_width ?? 1400,
        height: input.primary_image_height ?? 1400,
      },
    ],
    region_availability: ['in'],
    featured: false,
    bestseller: false,
    is_new: true,
    builder_eligible: input.builder_eligible,
    unit_mode: input.unit_mode,
    // Was a 27th orphan palette (the old brass-ghee literal), so every
    // admin-created product silently shipped the pre-redesign identity.
    theme_palette: PRODUCT_PALETTES.house,
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
  const { data, error } = await supa
    .from('products')
    .update({ nutrition: payload })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Nutrition');
}

export async function upsertProductSale(
  productId: string,
  sale: ProductSaleInput,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({
      on_sale: sale.on_sale,
      sale_price: sale.sale_price ?? null,
      sale_percent_off: sale.sale_percent_off ?? null,
      sale_ends_at: sale.sale_ends_at ?? null,
      sale_label: sale.sale_label ?? null,
    })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Sale pricing');
}

export async function upsertProductShelfLifeDays(
  productId: string,
  days: number,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .update({ shelf_life_days: days })
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Shelf life');
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
  const { data, error } = await supa
    .from('products')
    .update(update)
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Flags');
}
