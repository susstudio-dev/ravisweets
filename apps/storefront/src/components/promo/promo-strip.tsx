'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { getActivePromotion } from '@/lib/supabase/promotions';

/**
 * Top-of-page promo / flash-sale strip.
 *
 * Reads the active promo from Supabase (`promotions` table), with a
 * localStorage mirror at `ravi.active.promo.v1` for instant first paint
 * before the network resolves. Admin sets these from /admin/promotions.
 * Falls back to the evergreen "Free shipping above ₹999" pill when nothing
 * is active.
 */

const STORAGE_KEY = 'ravi.active.promo.v1';
const DISMISSED_KEY = 'ravi.active.promo.dismissed.v1';

export interface ActivePromo {
  id: string;
  message: string;
  /** Coupon code or null. When present, the strip shows it as a copy-able pill. */
  code?: string;
  /** Where the CTA leads. */
  href: string;
  ctaLabel: string;
  /** Hex pair for the gradient background. */
  bgFrom: string;
  bgTo: string;
  /** Foreground colour. */
  fg: string;
  /** Optional ISO timestamp; strip auto-hides past this. */
  expiresAt?: string;
}

const EVERGREEN: ActivePromo = {
  id: 'evergreen-shipping',
  message: 'Free shipping across India on orders above ₹999',
  href: '/shop',
  ctaLabel: 'Shop now',
  bgFrom: '#2a1505',
  bgTo: '#5a3010',
  fg: '#fdf6ec',
};

function readActivePromo(): ActivePromo {
  if (typeof window === 'undefined') return EVERGREEN;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EVERGREEN;
    const parsed = JSON.parse(raw) as ActivePromo;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
      return EVERGREEN;
    }
    return parsed;
  } catch {
    return EVERGREEN;
  }
}

function isDismissed(promoId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DISMISSED_KEY) === promoId;
  } catch {
    return false;
  }
}

export function PromoStrip() {
  // Mounted gate — same hydration guard pattern as the cart badge.
  const [mounted, setMounted] = useState(false);
  const [promo, setPromo] = useState<ActivePromo>(EVERGREEN);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // First paint: read whatever's mirrored locally so the strip is ready
    // before the Supabase round-trip resolves.
    const p = readActivePromo();
    setPromo(p);
    setDismissed(isDismissed(p.id));
    setMounted(true);

    // Then fetch the canonical row from Supabase. Replaces local mirror if
    // the live promo has changed since this device last saw one.
    void (async () => {
      const row = await getActivePromotion();
      if (!row) return;
      const live: ActivePromo = {
        id: row.id,
        message: row.message,
        code: row.code ?? undefined,
        href: row.href,
        ctaLabel: row.cta_label,
        bgFrom: row.bg_from,
        bgTo: row.bg_to,
        fg: row.fg,
        expiresAt: row.expires_at ?? undefined,
      };
      if (live.expiresAt && new Date(live.expiresAt).getTime() < Date.now()) return;
      setPromo(live);
      setDismissed(isDismissed(live.id));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(live));
      } catch {
        /* ignore */
      }
    })();

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        const next = readActivePromo();
        setPromo(next);
        setDismissed(isDismissed(next.id));
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, promo.id);
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  // Always render an empty placeholder on SSR so layout doesn't shift on hydrate.
  if (!mounted || dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Site-wide promotion"
      className="relative isolate overflow-hidden"
      style={{
        background: `linear-gradient(90deg, ${promo.bgFrom} 0%, ${promo.bgTo} 100%)`,
        color: promo.fg,
      }}
    >
      <div className="container-site flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium md:text-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" style={{ color: promo.fg }} />
        <p className="truncate">
          <span className="font-semibold">{promo.message}</span>
          {promo.code && (
            <>
              {' '}
              · use code{' '}
              <span
                className="ml-1 inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  color: promo.fg,
                }}
              >
                {promo.code}
              </span>
            </>
          )}
        </p>
        <Link
          href={promo.href}
          className="hidden shrink-0 rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-white/15 sm:inline-flex"
          style={{ borderColor: `${promo.fg}55`, color: promo.fg }}
        >
          {promo.ctaLabel} →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss promotion"
          className="ml-1 shrink-0 rounded-full p-1 transition-colors hover:bg-white/10"
          style={{ color: promo.fg }}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
