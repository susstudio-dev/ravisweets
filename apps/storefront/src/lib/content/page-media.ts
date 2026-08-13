import { z } from 'zod';
import { FESTIVAL_SLUG_LIST } from '../festivals/calendar';

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
  /**
   * `founder` is the grandfather's photograph (added 2026-08-12). It is
   * separate from `portrait` on purpose: portrait is the About hero plate,
   * which today holds a product specimen, while this one is a person. The
   * About page renders the founder section ONLY when this slot or the
   * `about_founder` copy is filled, so an empty slot ships nothing rather
   * than a dashed placeholder where a face should be.
   */
  about: { portrait: ImageRef; kitchen: ImageRef; founder: ImageRef };
  stores: { storefront: ImageRef };
  corporate: { essence: ImageRef; premium: ImageRef; grande: ImageRef };
  /** Keyed by festival slug (see FESTIVAL_SLUGS). */
  festivals: Record<string, ImageRef>;
  brand: { logo: ImageRef };
}

/**
 * Festival pages that get an editable hero slot in /admin/photos.
 *
 * Derived, because the hand-maintained copy of this list had drifted: it held
 * ten slugs and the one it omitted was `independence-day`, so that festival's
 * page had no hero slot in the admin at all. `festivals` below is an open
 * z.record, so adding the eleventh is purely additive — existing rows parse
 * unchanged and media/usage.ts already tolerates extra keys.
 */
export const FESTIVAL_SLUGS: readonly string[] = FESTIVAL_SLUG_LIST;

/** A slot degrades to null on any malformed value — one bad slot never sinks the row. */
const imageRefSchema = z
  .object({ assetId: z.string().min(1), alt: z.string().default('') })
  .nullable()
  .catch(null)
  .default(null);

const pageMediaSchema = z.object({
  about: z
    .object({ portrait: imageRefSchema, kitchen: imageRefSchema, founder: imageRefSchema })
    .catch({ portrait: null, kitchen: null, founder: null })
    .default({ portrait: null, kitchen: null, founder: null }),
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
  about: { portrait: null, kitchen: null, founder: null },
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
  | 'about.founder'
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
    case 'about.founder':
      return media.about.founder;
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
    case 'about.founder':
      return { ...media, about: { ...media.about, founder: ref } };
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
