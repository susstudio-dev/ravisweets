/**
 * Whether a catalogue image URL can actually resolve.
 *
 * THE PROBLEM THIS SOLVES. Every image in the catalogue points at
 * `https://ravisweets.com/wp-content/uploads/...` — the brand's retired
 * WordPress media library. The Next site now occupies that domain, so all 86
 * references 404. Components carried an `onError` fallback, which stopped a
 * broken-image glyph from painting but did nothing about the cost: the
 * homepage still issued ~10 image requests that every one of them failed,
 * and `priority` on the hero added a `<link rel="preload" as="image">` for a
 * URL that returns 404. On an Indian mobile connection that is ten empty
 * rectangles held for the duration of ten failed round-trips.
 *
 * Deciding at RENDER instead of on error means the request is never made and
 * the preload is never emitted.
 *
 * WHEN THE SHOOT LANDS: photography goes in `public/products/<slug>/`, the
 * catalogue URLs become root-relative, and this returns true for all of them
 * with no component changes. Delete the host list once no catalogue entry
 * references a remote host.
 */

/**
 * A photograph that has been art-directed but not yet shot.
 *
 * Returns an empty string, which `isUsableImage` rejects, so every consumer
 * falls through to the placeholder it already renders — identical behaviour to
 * the retired URL it replaces, minus the dead link.
 *
 * The point is the ARGUMENT. Each call site keeps the filename of the shot it
 * was matched to, so this reads as a shot list rather than as a hole. When the
 * production photography lands, change the body to
 * `` return `/products/${file}` `` (or a Cloudinary URL) and every hero,
 * strip, plate and specimen on the site fills in at once.
 *
 * The catalogue package carries its own copy of this helper for the same
 * reason; `@ravisweets/shared` cannot import from the storefront.
 */
// The unused argument IS the record — see the shot-list note above.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function pendingPhoto(_file: string): string {
  return '';
}

/** Hosts known to be dead. Not a general allowlist — a specific gravestone. */
const RETIRED_HOSTS = ['ravisweets.com'];

export function isUsableImage(url: string | undefined | null): url is string {
  if (!url) return false;
  // Root-relative assets ship with the build and always resolve.
  if (url.startsWith('/')) return true;
  try {
    const { hostname } = new URL(url);
    return !RETIRED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}
