import type { CurrencyCode, RegionCode } from './region';

export type DietaryTag =
  | 'eggless'
  | 'sugar-free'
  | 'vegan'
  | 'gluten-free'
  | 'nuts'
  | 'dairy'
  | 'contains-ghee';

export type CategorySlug =
  | 'sweets'
  | 'namkeens'
  | 'savouries'
  | 'sweet-bites'
  | 'dry-fruits'
  | 'pickles'
  | 'powders'
  | 'biscuits'
  | 'healthy-sweets'
  | 'combos'
  | 'gift-hampers'
  | 'festival-specials'
  | 'hyderabadi-specials';

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  weight_grams: number;
  price: Money;
  sku: string;
  stock_available: number;
  hsn_code?: string;
}

export interface ThemePalette {
  base: string;
  accent: string;
  glow: string;
  ink: string;
  grainOpacity: number;
}

export type GarnishMark = 'saffron' | 'pistachio' | 'silver' | 'paisley' | 'rose';

/**
 * Whether a product's variants represent grams (250 g · 500 g · 1 kg) or
 * a fixed-pack count (Box of 6 · Box of 12 · Tray). Drives the variant-picker
 * label ("Size" vs "Pack"), the cart-line subtitle, and the corporate
 * builder's preview text. Configurable per product from the admin.
 */
export type UnitMode = 'weight' | 'quantity';

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  subcategory?: string;
  dietary_tags: DietaryTag[];
  ingredients: string[];
  allergens: string[];
  storage_instructions: string;
  shelf_life_days: number;
  images: ProductImage[];
  variants: ProductVariant[];
  region_availability: RegionCode[];
  featured: boolean;
  bestseller: boolean;
  new: boolean;
  /** Per-product flavour palette — swapped onto :root CSS vars when product is active. */
  theme_palette: ThemePalette;
  /** Which garnish mark the one-shot accent uses on product detail. */
  garnish: GarnishMark;
  /** Whether this product can be composed into a corporate hamper in the builder. */
  builder_eligible: boolean;
  /** How variants are displayed — by weight (default) or by pack count. */
  unit_mode?: UnitMode;
  /**
   * Sale state — admin-toggled. When true, the storefront renders the
   * variant's `price` as a strikethrough and shows `sale_price` (if set,
   * else applies `sale_percent_off` to derive). Both fields live on the
   * product (not per-variant) — the discount applies uniformly across
   * variants. If different variants need different sale prices, model
   * them as separate products instead.
   */
  on_sale?: boolean;
  /** Flat sale price in paise. Overrides sale_percent_off when both set. */
  sale_price?: number;
  /** Whole-percent discount (e.g. 15 means "15% off"). Used when sale_price is null. */
  sale_percent_off?: number;
  /** Optional ISO timestamp when the sale ends. Storefront auto-hides past this. */
  sale_ends_at?: string;
  /** Optional human-readable sale label e.g. "Diwali pre-order" or "Clearance". */
  sale_label?: string;
  /** ISO date when a human confirmed the primary image passes the imagery rubric. */
  rubric_passed_on: string;
  /** Where the image came from. Free-to-use licence (Unsplash / Pexels / public domain) or internal. */
  source_url: string;
}

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/**
 * Effective per-variant price after applying any active product-level sale.
 * Returns null in `salePrice` when the product is not on sale (or the sale
 * has expired) — caller should render the variant's regular price as-is.
 */
export interface EffectivePrice {
  /** The variant's regular price in paise. */
  regular: number;
  /** Sale price in paise — null when no active sale. */
  salePrice: number | null;
  /** Convenience: rounded percent off (0..100) when a sale is active, else null. */
  percentOff: number | null;
  /** Optional human-readable label e.g. "Diwali pre-order". */
  label?: string;
}

export function computeEffectivePrice(
  product: Pick<Product, 'on_sale' | 'sale_price' | 'sale_percent_off' | 'sale_ends_at' | 'sale_label'>,
  variant: Pick<ProductVariant, 'price'>,
): EffectivePrice {
  const regular = variant.price.amount;
  const isActive =
    product.on_sale === true &&
    (!product.sale_ends_at || Date.parse(product.sale_ends_at) > Date.now());
  if (!isActive) {
    return { regular, salePrice: null, percentOff: null };
  }
  let salePrice: number;
  if (typeof product.sale_price === 'number' && product.sale_price > 0) {
    salePrice = Math.min(product.sale_price, regular);
  } else if (typeof product.sale_percent_off === 'number' && product.sale_percent_off > 0) {
    const pct = Math.min(99, Math.max(1, product.sale_percent_off));
    salePrice = Math.round((regular * (100 - pct)) / 100);
  } else {
    // on_sale flag set but no price/percent configured — treat as no sale.
    return { regular, salePrice: null, percentOff: null };
  }
  const percentOff = Math.round(((regular - salePrice) * 100) / regular);
  return {
    regular,
    salePrice,
    percentOff,
    label: product.sale_label,
  };
}
