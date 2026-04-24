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
  | 'dry-fruits'
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
  /** ISO date when a human confirmed the primary image passes the imagery rubric. */
  rubric_passed_on: string;
  /** Where the image came from. Free-to-use licence (Unsplash / Pexels / public domain) or internal. */
  source_url: string;
}

export interface Money {
  amount: number;
  currency: CurrencyCode;
}
