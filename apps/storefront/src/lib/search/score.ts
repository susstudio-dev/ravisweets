import type { Product } from '@ravisweets/shared';

/**
 * Cheap, deterministic fuzzy scoring for v1 — no external dependency.
 * Returns a score; higher is better. Returns 0 for non-matches.
 * Replace with Meilisearch in Section 3.6 of build-ravisweets-storefront.
 */
export function scoreProduct(product: Product, query: string): number {
  if (!query.trim()) return 0;
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  const title = product.title.toLowerCase();
  const desc = product.description.toLowerCase();
  const category = product.category.replace(/-/g, ' ').toLowerCase();
  const tags = product.dietary_tags.join(' ').toLowerCase();
  const ingredients = product.ingredients.join(' ').toLowerCase();

  let score = 0;

  // Exact phrase in title — dominant signal
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 50;
  if (title.includes(q)) score += 30;

  // Token-level hits
  for (const t of tokens) {
    if (t.length < 2) continue;
    if (title.includes(t)) score += 15;
    if (category.includes(t)) score += 10;
    if (tags.includes(t)) score += 8;
    if (ingredients.includes(t)) score += 5;
    if (desc.includes(t)) score += 3;
  }

  // Bestseller / featured lift for ties
  if (score > 0) {
    if (product.bestseller) score += 2;
    if (product.featured) score += 1;
  }

  return score;
}

export function searchProducts(products: Product[], query: string): Product[] {
  return products
    .map((p) => ({ p, s: scoreProduct(p, query) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ p }) => p);
}
