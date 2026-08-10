'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { getActivePromotion } from '@/lib/supabase/promotions';
import { cn } from '@/lib/cn';

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

/**
 * Overlay tint mixed out of the strip's OWN foreground rather than out of
 * white. `bg-white/15` silently assumed the strip was always dark; these
 * derive from `currentColor`, so they read correctly on the token ground, on
 * the dusk register, and on any campaign colour an admin picks.
 */
const TINT = 'bg-[color:color-mix(in_oklab,currentColor_16%,transparent)]';
const TINT_HOVER = 'hover:bg-[color:color-mix(in_oklab,currentColor_16%,transparent)]';
const HAIRLINE = 'border-[color:color-mix(in_oklab,currentColor_45%,transparent)]';

export interface ActivePromo {
  id: string;
  message: string;
  /** Coupon code or null. When present, the strip shows it as a copy-able pill. */
  code?: string;
  /** Where the CTA leads. */
  href: string;
  ctaLabel: string;
  /**
   * Optional campaign colours, set per-promo from /admin/promotions.
   *
   * Leave them off — as the evergreen promo below does — and the strip renders
   * flat on `--theme-accent`, so it follows the palette and the active register
   * instead of pinning site chrome to one campaign's colour. Supplying `bgFrom`
   * alone gives a flat campaign band; supplying `bgTo` as well restores the
   * two-stop gradient, which exists only for admin-authored campaigns.
   */
  bgFrom?: string;
  bgTo?: string;
  /** Foreground colour. Only meaningful alongside `bgFrom`. */
  fg?: string;
  /** Optional ISO timestamp; strip auto-hides past this. */
  expiresAt?: string;
}

/**
 * The always-on fallback. Deliberately carries no colour: it is site chrome,
 * not a campaign, so it should re-theme with everything else.
 */
const EVERGREEN: ActivePromo = {
  id: 'evergreen-shipping',
  message: 'Free shipping across India on orders above ₹999',
  href: '/shop',
  ctaLabel: 'Shop now',
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

/**
 * `promotions.bg_from`/`bg_to`/`fg` are NOT NULL, so a row always hands us a
 * string. Blank means "no campaign colour" — that is how a promo opts back
 * into the theme tokens once the column defaults stop being brand colours.
 */
function colour(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
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
        bgFrom: colour(row.bg_from),
        bgTo: colour(row.bg_to),
        fg: colour(row.fg),
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

  /*
   * Campaign colours win when an admin sets them; otherwise the strip is a
   * flat accent band on tokens. `color` is set once on the <aside> and every
   * child inherits it, which is what lets the tints and the hairline below be
   * pure `currentColor` mixes with no per-element style prop.
   *
   * Ground and foreground travel together — a campaign ground with no campaign
   * foreground is how you get an illegible strip, so that case falls back to
   * the tokens rather than half-applying.
   */
  const campaign = Boolean(promo.bgFrom && promo.fg);
  const campaignStyle = campaign
    ? {
        background: promo.bgTo
          ? `linear-gradient(90deg, ${promo.bgFrom} 0%, ${promo.bgTo} 100%)`
          : promo.bgFrom,
        color: promo.fg,
      }
    : undefined;

  return (
    <aside
      role="region"
      aria-label="Site-wide promotion"
      className={cn(
        'relative isolate overflow-hidden',
        /*
         * The default strip is ink-on-stock with a ruled edge, not a saturated
         * slab. A full-bleed band of the accent colour across the top of every
         * page made stamp blue read as a background rather than as the ink,
         * and it out-shouted the primary CTA directly beneath it. The accent
         * survives here only on the inline action.
         */
        !campaign &&
          'bg-surface-elevated text-theme-ink border-b border-[color:var(--color-rule)]',
      )}
      style={campaignStyle}
    >
      <div className="container-site flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium md:text-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p className="truncate">
          <span className="font-semibold">{promo.message}</span>
          {promo.code && (
            <>
              {' '}
              · use code{' '}
              <span
                className={cn(
                  'rounded-pill ml-1 inline-block px-2 py-0.5 font-mono text-[11px] font-bold',
                  TINT,
                )}
              >
                {promo.code}
              </span>
            </>
          )}
        </p>
        <Link
          href={promo.href}
          className={cn(
            'rounded-pill hidden shrink-0 border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors sm:inline-flex',
            HAIRLINE,
            TINT_HOVER,
          )}
        >
          {promo.ctaLabel} →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss promotion"
          className={cn('rounded-pill ml-1 shrink-0 p-1 transition-colors', TINT_HOVER)}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
