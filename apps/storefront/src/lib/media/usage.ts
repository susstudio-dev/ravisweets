import { getSlot, FESTIVAL_SLUGS } from '../content/page-media';
import type { PageMedia, SlotPath } from '../content/page-media';

/**
 * Pure usage scanner — answers "where is this photo used?" in owner
 * language before a delete. Page slots match by asset ID; products match
 * by storage-path substring because `products.images` keeps URL shape
 * (the documented D4 exception).
 */

export interface UsageHit {
  where: string;
}

/** Fixed page slots with their owner-facing names, in page order. */
const SLOT_LABELS: ReadonlyArray<[SlotPath, string]> = [
  ['about.portrait', 'About page — portrait'],
  ['about.kitchen', 'About page — kitchen'],
  ['about.founder', 'About page — founder photo'],
  ['stores.storefront', 'Stores page — shop front'],
  ['corporate.essence', 'Corporate page — Essence hamper'],
  ['corporate.premium', 'Corporate page — Premium hamper'],
  ['corporate.grande', 'Corporate page — Grande hamper'],
  ['brand.logo', 'Brand — logo'],
];

function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function scanAssetUsage(args: {
  assetId: string;
  storagePath: string;
  pageMedia: PageMedia;
  products: { title: string; images: { url: string }[] }[];
}): UsageHit[] {
  const { assetId, storagePath, pageMedia, products } = args;
  const hits: UsageHit[] = [];

  for (const [slot, label] of SLOT_LABELS) {
    if (getSlot(pageMedia, slot)?.assetId === assetId) hits.push({ where: label });
  }

  // Known festival pages first (stable order), then any extra keys the row carries.
  const festivalSlugs = [
    ...FESTIVAL_SLUGS,
    ...Object.keys(pageMedia.festivals).filter((s) => !FESTIVAL_SLUGS.includes(s)),
  ];
  for (const slug of festivalSlugs) {
    if (pageMedia.festivals[slug]?.assetId === assetId) {
      hits.push({ where: `Festival page — ${titleCaseSlug(slug)}` });
    }
  }

  // Guard the substring match: a blank path would "match" every product.
  if (storagePath) {
    for (const product of products) {
      if (product.images.some((image) => image.url.includes(storagePath))) {
        hits.push({ where: `Product — ${product.title}` });
      }
    }
  }

  return hits;
}
