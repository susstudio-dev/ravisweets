'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { SlotPath } from '@/lib/content/page-media';
import { isUsableImage } from '@/lib/images';
import { usePageMediaImage } from '@/lib/supabase/site-content-context';

/**
 * Public renderer for an owner-editable photo slot.
 *
 * Resolution order: admin-assigned slot image (live via SiteContentProvider)
 * → `fallbackUrl` when it can actually resolve (lib/images.ts gate) → the
 * dashed-diamond specimen placeholder the pages already use. SSR and
 * unconfigured builds render the fallback/placeholder — hydration swaps in
 * the slot image once the overlay loads (spec §6.4).
 *
 * `onError` drops the frame to the placeholder rather than leaving the
 * browser's broken-image glyph (furor's Img lesson); a subsequent slot swap
 * to a different URL retries naturally.
 */
export function SlotImage({
  slot,
  fallbackUrl,
  fallbackAlt,
  className,
  sizes,
  priority,
  objectFit = 'cover',
}: {
  slot: SlotPath;
  fallbackUrl?: string;
  fallbackAlt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** 'contain' matches the padded specimen-plate look (about-page plates). */
  objectFit?: 'cover' | 'contain';
}) {
  const slotImage = usePageMediaImage(slot);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const resolved = slotImage
    ? { url: slotImage.url, alt: slotImage.alt || fallbackAlt || '' }
    : isUsableImage(fallbackUrl)
      ? { url: fallbackUrl, alt: fallbackAlt ?? '' }
      : null;
  const showImage = resolved !== null && resolved.url !== failedUrl;

  return (
    <div className={className ? `relative ${className}` : 'relative'}>
      {showImage ? (
        <Image
          src={resolved.url}
          alt={resolved.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={objectFit === 'contain' ? 'object-contain p-10' : 'object-cover'}
          onError={() => setFailedUrl(resolved.url)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="border-theme-accent block h-12 w-12 rotate-45 border-2 border-dashed opacity-40" />
        </div>
      )}
    </div>
  );
}
