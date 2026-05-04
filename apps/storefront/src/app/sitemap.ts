import type { MetadataRoute } from 'next';
import { CATALOGUE } from '@ravisweets/shared';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aakashraj-aidenai.github.io/V1.0-Ravisweets';

// Required when next.config has `output: 'export'` (the GH Pages build).
export const dynamic = 'force-static';

const STATIC_PATHS = [
  '',
  '/shop',
  '/about',
  '/stores',
  '/corporate',
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : p.startsWith('/festivals') ? 0.7 : 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const productEntries: MetadataRoute.Sitemap = CATALOGUE.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p.featured ? 0.9 : p.bestseller ? 0.85 : 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
