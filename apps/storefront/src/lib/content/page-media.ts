import { z } from 'zod';

/**
 * Owner-editable page photo slots — the `page_media` row in site_content.
 *
 * Content references an ASSET ID, never a URL (spec D4): the public URL is
 * derived at render time from the media_assets registry, so moving or
 * re-uploading a photo never strands a stale link inside content JSON.
 *
 * A missing/invalid row must render code defaults, never throw (spec §5.5):
 * every branch below carries a `.default()`/`.catch()` and reads go through
 * `parsePageMedia`, which falls back to EMPTY_PAGE_MEDIA on any failure.
 */

export type ImageRef = { assetId: string; alt: string } | null;

export interface PageMedia {
  about: { portrait: ImageRef; kitchen: ImageRef };
  stores: { storefront: ImageRef };
  corporate: { essence: ImageRef; premium: ImageRef; grande: ImageRef };
  /** Keyed by festival slug (see FESTIVAL_SLUGS). */
  festivals: Record<string, ImageRef>;
  brand: { logo: ImageRef };
}

/** Festival pages that get an editable hero slot in /admin/photos. */
export const FESTIVAL_SLUGS: readonly string[] = [
  'diwali',
  'raksha-bandhan',
  'eid',
  'holi',
  'pongal',
  'sankranti',
  'ugadi',
  'onam',
  'ganesh-chaturthi',
  'christmas',
];

/** A slot degrades to null on any malformed value — one bad slot never sinks the row. */
const imageRefSchema = z
  .object({ assetId: z.string().min(1), alt: z.string().default('') })
  .nullable()
  .catch(null)
  .default(null);

const pageMediaSchema = z.object({
  about: z
    .object({ portrait: imageRefSchema, kitchen: imageRefSchema })
    .catch({ portrait: null, kitchen: null })
    .default({ portrait: null, kitchen: null }),
  stores: z
    .object({ storefront: imageRefSchema })
    .catch({ storefront: null })
    .default({ storefront: null }),
  corporate: z
    .object({ essence: imageRefSchema, premium: imageRefSchema, grande: imageRefSchema })
    .catch({ essence: null, premium: null, grande: null })
    .default({ essence: null, premium: null, grande: null }),
  festivals: z.record(imageRefSchema).catch({}).default({}),
  brand: z.object({ logo: imageRefSchema }).catch({ logo: null }).default({ logo: null }),
});

export const EMPTY_PAGE_MEDIA: PageMedia = {
  about: { portrait: null, kitchen: null },
  stores: { storefront: null },
  corporate: { essence: null, premium: null, grande: null },
  festivals: {},
  brand: { logo: null },
};

/** safeParse → defaults; never throws, whatever the row holds. */
export function parsePageMedia(raw: unknown): PageMedia {
  const parsed = pageMediaSchema.safeParse(raw);
  if (!parsed.success) return structuredClone(EMPTY_PAGE_MEDIA);
  return parsed.data;
}

export type SlotPath =
  | 'about.portrait'
  | 'about.kitchen'
  | 'stores.storefront'
  | 'corporate.essence'
  | 'corporate.premium'
  | 'corporate.grande'
  | `festivals.${string}`
  | 'brand.logo';

const FESTIVALS_PREFIX = 'festivals.';

/** Explicit two-segment lookup — no eval-style deep paths. */
export function getSlot(media: PageMedia, slot: SlotPath): ImageRef {
  if (slot.startsWith(FESTIVALS_PREFIX)) {
    return media.festivals[slot.slice(FESTIVALS_PREFIX.length)] ?? null;
  }
  switch (slot) {
    case 'about.portrait':
      return media.about.portrait;
    case 'about.kitchen':
      return media.about.kitchen;
    case 'stores.storefront':
      return media.stores.storefront;
    case 'corporate.essence':
      return media.corporate.essence;
    case 'corporate.premium':
      return media.corporate.premium;
    case 'corporate.grande':
      return media.corporate.grande;
    case 'brand.logo':
      return media.brand.logo;
    default:
      return null;
  }
}

/** Immutable write — returns a new PageMedia, never touches the input. */
export function setSlot(media: PageMedia, slot: SlotPath, ref: ImageRef): PageMedia {
  if (slot.startsWith(FESTIVALS_PREFIX)) {
    const key = slot.slice(FESTIVALS_PREFIX.length);
    return { ...media, festivals: { ...media.festivals, [key]: ref } };
  }
  switch (slot) {
    case 'about.portrait':
      return { ...media, about: { ...media.about, portrait: ref } };
    case 'about.kitchen':
      return { ...media, about: { ...media.about, kitchen: ref } };
    case 'stores.storefront':
      return { ...media, stores: { ...media.stores, storefront: ref } };
    case 'corporate.essence':
      return { ...media, corporate: { ...media.corporate, essence: ref } };
    case 'corporate.premium':
      return { ...media, corporate: { ...media.corporate, premium: ref } };
    case 'corporate.grande':
      return { ...media, corporate: { ...media.corporate, grande: ref } };
    case 'brand.logo':
      return { ...media, brand: { ...media.brand, logo: ref } };
    default:
      return media;
  }
}
