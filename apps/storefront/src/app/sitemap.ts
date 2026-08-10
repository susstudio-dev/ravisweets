import type { MetadataRoute } from 'next';
import { CATALOGUE } from '@ravisweets/shared';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravisweets.com';

// Required when next.config has `output: 'export'` (the GH Pages build).
export const dynamic = 'force-static';

const STATIC_PATHS = [
  '',
  '/shop',
  '/about',
  '/stores',
  '/corporate',
  '/send-sweets-to-india',
  '/festivals',
  '/festivals/diwali',
  '/festivals/raksha-bandhan',
  '/festivals/eid',
  '/festivals/holi',
  '/festivals/pongal',
  '/festivals/sankranti',
  '/festivals/ugadi',
  '/festivals/onam',
  '/festivals/ganesh-chaturthi',
  '/festivals/christmas',
  // Indexable and linked from the footer on every page, but absent from the
  // sitemap until now. /cart, /checkout, /account, /orders and /search stay
  // out deliberately — they are noindex, and a sitemap entry for a noindex URL
  // is a contradictory signal.
  '/policies/shipping',
  '/policies/returns',
  '/policies/cancellation',
  '/policies/terms',
  '/policies/privacy',
];

const CATEGORY_SLUGS = [
  'hyderabadi-specials',
  'sweets',
  'sweet-bites',
  'healthy-sweets',
  'namkeens',
  'savouries',
  'dry-fruits',
  'pickles',
  'powders',
  'biscuits',
  'combos',
  'gift-hampers',
  'festival-specials',
];

/**
 * A sitemap URL must be the URL Google should index — not one that redirects
 * to it.
 *
 * next.config sets `trailingSlash: true`, so the export writes `/shop/` and
 * every page's own canonical tag says `/shop/`. This file was emitting
 * `/shop`, which Cloudflare answers with a 301. Every entry in the sitemap was
 * therefore a redirect that disagreed with the canonical it led to — the two
 * strongest signals a site sends about its own URLs, pointing at two different
 * strings. This normalises them onto the canonical form.
 */
function loc(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: loc(p),
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : p.startsWith('/festivals') ? 0.7 : 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: loc(`/category/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const productEntries: MetadataRoute.Sitemap = CATALOGUE.map((p) => ({
    url: loc(`/product/${p.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p.featured ? 0.9 : p.bestseller ? 0.85 : 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
