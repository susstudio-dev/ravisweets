'use client';

import { usePageMediaImage } from '@/lib/supabase/site-content-context';

/**
 * The brand lockup — self-hosted, zero external dependencies.
 *
 * THE REAL MARK, since 2026-08-10. The owner's logo is the mandir crest:
 * Surya's chariot drawn by seven horses under a temple arch, over the
 * wordmark on a red band. It replaces the code-drawn katli diamond that
 * stood in after the retired WordPress host stopped serving the hotlinked
 * original (HTTP 402), which had left a broken-image icon on every page.
 *
 * WHY THE BADGE IS PAIRED WITH TYPE rather than used alone. The crest carries
 * its own wordmark, but it is portrait (527x569) and dense — measured at the
 * sizes this site uses, "Ravi Sweets" inside it only resolves from about
 * 48px, and the SINCE 1983 and tagline lines never do at header scale. Alone
 * in a 64px header it would read as an unnamed seal. So the crest acts as the
 * mark and the type carries the name, which is how a detailed badge normally
 * behaves at small sizes. The "Est. 1983" line the old lockup carried is
 * dropped: the crest already says SINCE 1983, and repeating it beside an
 * illegible copy of itself is noise.
 *
 * WEBP, deliberately. The source is a JPEG on an opaque white field, which
 * would show as a white rectangle on the manila ground; the shipped asset has
 * its surround flood-filled to transparency. As PNG it was 183 KB because the
 * arch gradients quantise badly — as WebP at q0.92 it is 30 KB for the same
 * 400x432 pixels, and `images.unoptimized` means whatever is shipped is what
 * every visitor downloads. Master files live in assets/logo/.
 *
 * OWNER OVERRIDE: when the `brand.logo` slot is set from /admin/photos, the
 * uploaded logo renders in the same box instead — a plain <img>, not
 * next/image, because the owner file is an arbitrary-aspect asset and the
 * static export ships images unoptimised anyway.
 */

/** Intrinsic size of public/brand/ravi-sweets-logo.webp — set to avoid CLS. */
const LOGO_W = 400;
const LOGO_H = 432;

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const ownerLogo = usePageMediaImage('brand.logo');
  const box = compact ? 'h-9 w-auto shrink-0' : 'h-10 w-auto shrink-0';

  if (ownerLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ownerLogo.url} alt="Ravi Sweets" className={box} />
    );
  }

  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/ravi-sweets-logo.webp"
        alt=""
        aria-hidden="true"
        width={LOGO_W}
        height={LOGO_H}
        className={box}
        decoding="async"
      />
      <span className="font-display text-theme-ink text-lg leading-none tracking-[0.02em]">
        Ravi Sweets
      </span>
    </span>
  );
}
