'use client';

import { getSupabase } from './client';
import type { CategorySlug, DietaryTag, Product, ProductImage } from '@ravisweets/shared';
import { PRODUCT_PALETTES } from '@/lib/theme/palette';
import { wrote, type WriteResult } from './write-result';

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
  /**
   * IDENTITY, not an editable column. Selected so that a row with no bundled
   * counterpart — created in /admin, or archived and therefore already dropped
   * out of the last bake — can still be named on screen. `mergeProductOverrides`
   * deliberately does NOT merge these onto a bundled Product: slug and title are
   * hand-authored in the catalogue, and letting seed data win would rewrite copy
   * nobody asked to change.
   */
  slug: string;
  title: string;
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

/**
 * The variant columns the admin can edit, plus enough identity to rebuild a
 * variant for a product the bundle has never heard of.
 *
 * `price_amount` IS RUPEES. The column name invites a paise assumption and the
 * comment here used to repeat it, but scripts/generate-catalogue.mjs:281-306
 * documents the check against the three things that actually touch the column:
 * generate-product-seed.mjs copies `variant.price.amount` in verbatim, the
 * admin's inline editor round-trips it with no scaling, and the seeded rows
 * read 279 and 3300 rather than 27900 and 330000. Do not "fix" it with a ÷100.
 */
export interface VariantOverride {
  /** Duplicated from the `variants` map key so `variantsByProduct` stands alone. */
  id: string;
  title: string;
  price_amount: number;
  stock_available: number;
  product_id: string;
  weight_grams: number;
  sku: string;
  price_currency: Product['variants'][number]['price']['currency'];
}

export interface CatalogueOverrides {
  /** Keyed by products.id. A missing key means "no row — use the bundle". */
  products: Map<string, ProductOverride>;
  /** Keyed by variants.id. */
  variants: Map<string, VariantOverride>;
  /**
   * Keyed by products.id, each array pre-sorted the way the catalogue bake
   * orders variants (weight, then price, then id). `variants` above is keyed
   * the wrong way round for anyone asking "what SKUs does this product have?",
   * which is exactly what rebuilding an unbundled product needs.
   */
  variantsByProduct: Map<string, VariantOverride[]>;
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
  variantsByProduct: new Map(),
  error: null,
};

// Explicit column lists rather than `*`: this is the contract of what the
// admin owns. Anything not named here is bundle-owned, and selecting it would
// only invite a future merge to overwrite hand-authored copy with seed data.
//
// `slug` and `title` are the exception that proves the rule — they are selected
// for IDENTIFICATION, not for editing, so that a row the bundle does not
// contain can still be listed. See ProductOverride: the merge skips them.
const PRODUCT_OVERRIDE_COLUMNS =
  'id, slug, title, description, category, dietary_tags, shelf_life_days, unit_mode, images, ' +
  'featured, bestseller, is_new, archived, builder_eligible, on_sale, sale_price, ' +
  'sale_percent_off, sale_ends_at, sale_label, nutrition';

// Same reasoning: product_id/weight_grams/sku/price_currency are not editable
// here, but without them an unbundled product's variants cannot be rebuilt.
const VARIANT_OVERRIDE_COLUMNS =
  'id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available';

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
      variantsByProduct: new Map(),
      // A missing column (42703) is the likeliest failure here and it takes the
      // whole select down with it, so name the message rather than swallowing
      // it — "run migration 0003" is only obvious once you can read the error.
      error: error?.message ?? 'The products query returned no data.',
    };
  }
  const products = new Map<string, ProductOverride>();
  const variants = new Map<string, VariantOverride>();
  const variantsByProduct = new Map<string, VariantOverride[]>();
  for (const row of data as unknown as OverrideRow[]) {
    const { id, variants: rowVariants, ...override } = row;
    products.set(id, override);
    for (const v of rowVariants ?? []) {
      // A variant row always has a price; guard anyway so one malformed row
      // cannot poison the whole map with NaN prices.
      if (typeof v.price_amount !== 'number') continue;
      const entry: VariantOverride = {
        id: v.id,
        title: v.title ?? '',
        price_amount: v.price_amount,
        stock_available: v.stock_available ?? 0,
        // `product_id` is embedded per row, but fall back to the parent's id:
        // the embed guarantees the relationship even if the column were ever
        // dropped from the select.
        product_id: v.product_id ?? id,
        weight_grams: v.weight_grams ?? 0,
        sku: v.sku ?? '',
        price_currency: v.price_currency ?? 'INR',
      };
      variants.set(v.id, entry);
      const bucket = variantsByProduct.get(entry.product_id);
      if (bucket) bucket.push(entry);
      else variantsByProduct.set(entry.product_id, [entry]);
    }
  }
  // Same order the catalogue bake uses (weight, then price, then id), so a
  // product rebuilt from the database lists its SKUs the way the shop would.
  for (const bucket of variantsByProduct.values()) {
    bucket.sort(
      (a, b) =>
        a.weight_grams - b.weight_grams ||
        a.price_amount - b.price_amount ||
        // Tie-break on id, matching the bake. `sku` is nullable in the schema,
        // so two blank skus would compare equal and leave the order undefined.
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  }
  return { products, variants, variantsByProduct, error: null };
}

/**
 * Variant-only convenience for callers that price things and nothing else.
 * Delegates rather than issuing its own narrower query — one query shape to
 * keep working is enough.
 *
 * NOTE: currently has NO callers. The cart-line and stock-badge consumers this
 * was written for read the bundled catalogue instead. Kept as intended API;
 * do not go looking for the consumer, there isn't one.
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

/**
 * A `products` row the bundled catalogue has never heard of, rendered as a
 * Product so the admin list can show it like any other.
 *
 * TWO KINDS OF ROW END UP HERE, and the admin is unusable without both:
 *
 *   1. Created in /admin/products/new. It exists only in the database until the
 *      next Publish bakes it, so before this function the owner added a product
 *      and it did not appear in the list they were looking at.
 *   2. Archived. The catalogue bake reads with the ANON key and RLS hides
 *      archived rows from anon, so an archived product drops out of
 *      GENERATED_CATALOGUE at the next Publish — and out of a list built from
 *      CATALOGUE with it. Without this, archiving is a ONE-WAY DOOR: nothing in
 *      the UI could ever find the product again to un-archive it.
 *
 * A row with NO VARIANTS still comes back, with an empty `variants` array.
 * The catalogue bake drops such a row (nothing on the site could price it) and
 * this used to as well — but the bake at least prints a warning, whereas the
 * admin is the only screen that could repair it. Dropping it here made it
 * unreachable: no row, no drawer, no archive, no delete, while it kept holding
 * its id and its unique slug, so re-creating the product with the same slug
 * failed with a raw Postgres unique violation and nothing to act on. That is
 * the same one-way door this function exists to close. It is reachable in
 * practice: createProduct inserts the product first and its rollback delete is
 * best-effort, so a connection dropped between the two leaves exactly this.
 *
 * `archived` is deliberately absent from the result: the shared Product type has
 * no such field, and a baked catalogue can never contain an archived row. Read
 * it from `overrides.products.get(id)?.archived` instead.
 *
 * Everything the admin cannot edit falls back to the same defaults createProduct
 * inserts, so a row made here and a row made there render identically.
 */
export function productFromOverride(
  id: string,
  o: ProductOverride,
  overrides: CatalogueOverrides,
): Product {
  const rows = overrides.variantsByProduct.get(id) ?? [];
  return {
    id,
    slug: o.slug,
    title: o.title,
    description: o.description ?? '',
    category: o.category ?? 'sweets',
    dietary_tags: o.dietary_tags ?? [],
    ingredients: [],
    allergens: [],
    storage_instructions: '',
    shelf_life_days: o.shelf_life_days ?? 0,
    images: o.images ?? [],
    variants: rows.map((v) => ({
      id: v.id,
      title: v.title,
      weight_grams: v.weight_grams,
      price: { amount: v.price_amount, currency: v.price_currency },
      sku: v.sku,
      stock_available: v.stock_available,
    })),
    region_availability: ['in'],
    featured: o.featured ?? false,
    bestseller: o.bestseller ?? false,
    new: o.is_new ?? false,
    theme_palette: PRODUCT_PALETTES.house,
    garnish: 'paisley',
    builder_eligible: o.builder_eligible ?? false,
    rubric_passed_on: '',
    source_url: '',
    unit_mode: o.unit_mode ?? 'weight',
    on_sale: o.on_sale ?? false,
    sale_price: o.sale_price ?? undefined,
    sale_percent_off: o.sale_percent_off ?? undefined,
    sale_ends_at: o.sale_ends_at ?? undefined,
    sale_label: o.sale_label ?? undefined,
    nutrition: o.nutrition ?? undefined,
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

/* ─── removal ────────────────────────────────────────────────────────────────
 *
 * Two operations, and the difference between them is the whole point.
 *
 * ARCHIVE is `upsertProductFlags(id, { archived: true })` — no helper needed,
 * it already exists and already reports honestly. RLS hides the row from anon,
 * so the next catalogue bake drops it and the product leaves the shop. It is
 * reversible from the same screen, and nothing is destroyed.
 *
 * DELETE is below, and it is not reversible by anything. `products` is the
 * parent of four cascades — variants, reviews (and review_helpful_votes behind
 * them), and through variants the FSSAI batch and stock-adjustment ledgers.
 * Referential actions bypass RLS, so the append-only stock ledger is destroyed
 * even though its policy grants insert and nothing else. Hence the pre-flight.
 */

/**
 * What a permanent delete is about to take with it.
 *
 * `error` is not decoration. A probe that fails must NOT read as "nothing
 * there" — that is the difference between "this product has no FSSAI batches"
 * and "I could not find out whether it does", and only one of them is safe to
 * delete over.
 */
export interface ProductRemovalReport {
  /** Customer-written, read live on the storefront, gone on the next page load. */
  reviews: number;
  /** FSSAI lot / made-on / expires-on records. BLOCKS the delete. */
  batches: number;
  /** Append-only stock ledger. BLOCKS the delete. */
  stockAdjustments: number;
  locationStock: number;
  ordersTotal: number;
  /**
   * Orders still at status `placed` — i.e. NOT YET PACKED. Deliberately not
   * called "unpaid": order_status is
   * ('placed','packed','shipped','delivered','cancelled') with no paid state,
   * and `orders.payment` is opaque jsonb, so payment is not queryable here.
   * Many of these are fully paid. BLOCKS a delete — the owner still has to
   * pack and invoice them.
   */
  ordersOpen: number;
  /**
   * The variant ids the counts were actually taken over, read fresh by this
   * probe rather than supplied by the caller. A caller's list is as old as its
   * last refresh, and a variant created since is exactly what the re-probe
   * before a delete exists to notice.
   */
  variantIds: string[];
  error: string | null;
}

export const EMPTY_REMOVAL_REPORT: ProductRemovalReport = {
  reviews: 0,
  batches: 0,
  stockAdjustments: 0,
  locationStock: 0,
  ordersTotal: 0,
  ordersOpen: 0,
  variantIds: [],
  error: null,
};

/**
 * Count what the cascade would destroy, BEFORE destroying it.
 *
 * Call this twice: once when the drawer opens (so the button can arm or refuse
 * with a reason on screen), and again immediately before the delete. The first
 * result is stale by then — a variant added in between is invisible to it, and
 * with it every batch and ledger row hanging off that variant.
 *
 * Every table here is admin-readable. `head: true` keeps it to six counts
 * rather than six payloads.
 */
export async function inspectProductRemoval(productId: string): Promise<ProductRemovalReport> {
  const supa = await getSupabase();
  if (!supa) return { ...EMPTY_REMOVAL_REPORT, error: 'supabase-not-configured' };

  // Read the variant ids HERE rather than trusting the caller's. A drawer that
  // opened five minutes ago holds the variant list from its last refresh, and
  // the whole point of re-probing before a delete is to catch a SKU added
  // since — along with every batch and ledger row hanging off it.
  const { data: variantRows, error: variantErr } = await supa
    .from('variants')
    .select('id')
    .eq('product_id', productId);
  if (variantErr) {
    return { ...EMPTY_REMOVAL_REPORT, error: variantErr.message };
  }
  const variantIds = (variantRows ?? []).map((v) => v.id as string);

  const count = async (
    run: () => PromiseLike<{ count: number | null; error: { message: string } | null }>,
  ): Promise<{ n: number; error: string | null }> => {
    try {
      const { count: n, error } = await run();
      if (error) return { n: 0, error: error.message };
      return { n: n ?? 0, error: null };
    } catch (err) {
      return { n: 0, error: err instanceof Error ? err.message : String(err) };
    }
  };

  // No variants means nothing can hang off them — skip those three probes
  // rather than issuing `.in('variant_id', [])`, which matches everything in
  // some PostgREST versions and nothing in others.
  const hasVariants = variantIds.length > 0;
  const zero = Promise.resolve({ n: 0, error: null });

  const [reviews, batches, adjustments, locations, orders, unpaid] = await Promise.all([
    count(() => supa.from('reviews').select('id', { count: 'exact', head: true }).eq('product_id', productId)),
    hasVariants
      ? count(() => supa.from('product_batches').select('id', { count: 'exact', head: true }).in('variant_id', variantIds))
      : zero,
    hasVariants
      ? count(() => supa.from('stock_adjustments').select('id', { count: 'exact', head: true }).in('variant_id', variantIds))
      : zero,
    hasVariants
      ? // `variant_id`, not `id`: variant_location_stock is keyed on
        // (variant_id, location) and has no id column at all.
        count(() => supa.from('variant_location_stock').select('variant_id', { count: 'exact', head: true }).in('variant_id', variantIds))
      : zero,
    // NOTE: `.eq('status','placed')` means NOT YET PACKED, not "unpaid" —
    // order_status has no paid state and `payment` is opaque jsonb. Callers
    // must word the message accordingly.
    count(() => supa.from('orders').select('id', { count: 'exact', head: true }).contains('lines', [{ productId }])),
    count(() =>
      supa
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'placed')
        .contains('lines', [{ productId }]),
    ),
  ]);

  // ANY failed probe poisons the whole report. Reporting five clean counts and
  // one silent failure as "clean" is exactly the shape of mistake that gets an
  // FSSAI ledger deleted.
  const firstError =
    reviews.error ??
    batches.error ??
    adjustments.error ??
    locations.error ??
    orders.error ??
    unpaid.error ??
    null;

  return {
    reviews: reviews.n,
    batches: batches.n,
    stockAdjustments: adjustments.n,
    locationStock: locations.n,
    ordersTotal: orders.n,
    ordersOpen: unpaid.n,
    variantIds,
    error: firstError,
  };
}

/**
 * Permanently delete a product and everything the database cascades from it.
 *
 * Callers must have checked `inspectProductRemoval` and the seed-product rule
 * first — neither is enforced here, and no migration is required to reach this
 * (0001_init.sql's "admin writes products" policy is `for all`, which covers
 * DELETE).
 *
 * `.select('id')` is load-bearing, not habit. PostgREST answers a DELETE that
 * matched zero rows with 204 and `error: null`, which under RLS is
 * indistinguishable from success — see write-result.ts. Without it, an account
 * whose JWT lost its admin role gets "Deleted ✓" over an untouched database and
 * the product reappears on the next refresh looking like a bug somewhere else.
 */
export async function deleteProduct(productId: string): Promise<WriteResult> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data, error } = await supa
    .from('products')
    .delete()
    .eq('id', productId)
    .select('id');
  return wrote(data, error, 'Product delete');
}
