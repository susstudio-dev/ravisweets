'use client';

import { usePageMediaImage } from '@/lib/supabase/site-content-context';

/**
 * The brand lockup — self-hosted, zero external dependencies.
 *
 * The old header hotlinked a PNG from the retired WordPress host, which now
 * answers HTTP 402 for every asset; the mark was a broken-image icon on
 * every page. This lockup is drawn in code: the katli diamond (the product's
 * own 45° cut, same mark as the cursor and bullets) beside a Young Serif
 * wordmark. It inherits the current register's ink, so it is cream over the
 * dusk hero and warm charcoal on light pages with no extra props.
 *
 * OWNER OVERRIDE: when the `brand.logo` slot is set from /admin/photos, the
 * uploaded logo renders in the same box instead — a plain <img>, not
 * next/image, because the owner file is a tiny arbitrary-aspect asset and
 * the static export ships images unoptimised anyway. The code-drawn lockup
 * stays the SSR/fallback rendering.
 */

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const ownerLogo = usePageMediaImage('brand.logo');

  if (ownerLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ownerLogo.url}
        alt="Ravi Sweets"
        className={compact ? 'h-7 w-auto shrink-0' : 'h-8 w-auto shrink-0'}
      />
    );
  }

  return (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={compact ? 'h-7 w-7 shrink-0' : 'h-8 w-8 shrink-0'}
      >
        <polygon
          points="16,2.5 29.5,16 16,29.5 2.5,16"
          fill="var(--theme-accent)"
          stroke="var(--color-varak)"
          strokeWidth="1.6"
          strokeLinejoin="miter"
        />
        <polygon
          points="16,9 23,16 16,23 9,16"
          fill="none"
          stroke="var(--theme-base)"
          strokeWidth="1.1"
          opacity="0.85"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-theme-ink text-lg tracking-[0.02em]">Ravi Sweets</span>
        {!compact && (
          <span className="text-theme-ink/55 mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.3em] sm:block">
            Est. 1983
          </span>
        )}
      </span>
    </span>
  );
}
