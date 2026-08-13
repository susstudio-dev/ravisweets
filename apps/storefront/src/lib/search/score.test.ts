import { describe, expect, it } from 'vitest';
import type { Product, ProductVariant } from '@ravisweets/shared';
import { scoreProduct } from './score';

/* ── FIXTURES ───────────────────────────────────────────────────────────── */
/* Mirrors apps/storefront/src/lib/catalogue/filters.test.ts. */

function variant(over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'v1',
    title: '250 g',
    weight_grams: 250,
    price: { amount: 300, currency: 'INR' },
    sku: 'SKU-1',
    stock_available: 5,
    ...over,
  };
}

function product(over: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    slug: 'p1',
    title: 'Mutton Pickle',
    description: 'A fiery Andhra-style mutton pickle.',
    category: 'pickles',
    dietary_tags: ['non-veg'],
    ingredients: [],
    allergens: [],
    storage_instructions: '',
    shelf_life_days: 14,
    images: [],
    variants: [variant()],
    region_availability: ['in'],
    featured: false,
    bestseller: false,
    new: false,
    theme_palette: { base: '#fff', accent: '#000', glow: '#eee', ink: '#111', grainOpacity: 0 },
    garnish: 'saffron',
    builder_eligible: false,
    rubric_passed_on: '2026-01-01',
    source_url: '',
    ...over,
  };
}

/* ── SEARCHING "veg" ────────────────────────────────────────────────────── */

describe('scoreProduct — "veg" must not surface non-veg products', () => {
  it('a non-veg product scores 0 for the query "veg" (title/desc carry no veg claim)', () => {
    expect(scoreProduct(product(), 'veg')).toBe(0);
  });

  it('a vegetarian product also scores 0 from tags alone — veg is the absence of a tag', () => {
    const vegPickle = product({ title: 'Mango Pickle', description: 'Tangy raw mango pickle.', dietary_tags: [] });
    expect(scoreProduct(vegPickle, 'veg')).toBe(0);
  });

  it('a product explicitly tagged "vegan" still matches "veg" (substring match is intact)', () => {
    const veganSweet = product({
      title: 'Kaju Katli',
      description: 'Cashew fudge.',
      category: 'sweets',
      dietary_tags: ['vegan'],
    });
    expect(scoreProduct(veganSweet, 'veg')).toBeGreaterThan(0);
  });

  it('the query "non-veg" no longer scores from the tag (traded off deliberately) — the product stays findable by name', () => {
    expect(scoreProduct(product(), 'non-veg')).toBe(0);
    expect(scoreProduct(product(), 'mutton')).toBeGreaterThan(0);
  });
});
