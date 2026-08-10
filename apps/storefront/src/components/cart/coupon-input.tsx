'use client';

import { useEffect, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useSession } from '@/lib/supabase/session-context';
import { findDemoCoupon, DEMO_COUPONS } from '@/lib/coupons/validate';
import { validateCoupon } from '@/lib/coupons/validate';
import { useCoupons } from '@/lib/coupons/context';
import { countMyRedemptions, fetchCouponByCode, listCoupons } from '@/lib/supabase/coupons';
import { listMyOrders } from '@/lib/supabase/orders';
import type { Coupon } from '@/lib/coupons/types';

const COUPONS_ENABLED = process.env.NEXT_PUBLIC_COUPONS_ENABLED !== 'false';

export function CouponInput() {
  const { subtotal, lineCount, lineViews } = useCart();
  const { configured, user } = useSession();
  const { applied, apply, remove } = useCoupons();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggestedChips, setSuggestedChips] = useState<Coupon[]>([]);

  const isLoggedIn = !!user;

  // Suggestion chips come from the live coupons table on a configured store
  // (RLS already filters to active, unexpired rows) — demo codes would be
  // rejected there since the demo fallback is gated off. Unconfigured stores
  // keep the bundled demo set.
  useEffect(() => {
    // Unconfigured (demo) stores can never have a session, so demo chips must
    // not sit behind the login check — they'd be unreachable.
    if (!configured) {
      setSuggestedChips(DEMO_COUPONS.filter((c) => c.active).slice(0, 3));
      return;
    }
    if (!isLoggedIn) {
      setSuggestedChips([]);
      return;
    }
    let cancelled = false;
    void listCoupons().then((live) => {
      // RLS hides dead rows from customers but NOT from admins browsing the
      // shop — filter client-side too so nobody is suggested an unusable code.
      const now = Date.now();
      const usable = live.filter(
        (c) => c.active && (!c.validTo || new Date(c.validTo).getTime() >= now),
      );
      if (!cancelled) setSuggestedChips(usable.slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, configured]);

  if (!COUPONS_ENABLED || lineCount === 0) return null;

  async function tryApply(raw: string) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      // The coupons table is authoritative on a configured store: RLS hides
      // inactive/expired rows, and falling back to the demo set there would
      // resurrect codes the admin deactivated. The bundled demo set only
      // serves stores with no Supabase at all.
      const dbCoupon = configured ? await fetchCouponByCode(raw) : null;
      const coupon = dbCoupon ?? (configured ? null : findDemoCoupon(raw));
      const perUserRedeemed = dbCoupon ? await countMyRedemptions(dbCoupon.code) : 0;
      // Only pay for the orders query when the coupon actually cares.
      const firstOrder =
        dbCoupon?.constraints.firstOrderOnly && user
          ? (await listMyOrders()).length === 0
          : true;
      const result = validateCoupon(
        coupon,
        {
          subtotal: subtotal.amount,
          customerId: user?.id ?? null,
          firstOrder,
          segments: [],
          region: 'IN',
          items: lineViews.map((l) => ({
            productId: l.product.id,
            collectionId: l.product.category,
            // gift-hampers + festival-specials are both "hamper"-target eligible
            isHamper:
              l.product.category === 'gift-hampers' ||
              l.product.category === 'festival-specials',
          })),
          appliedCodes: applied.map((a) => a.coupon.code),
          perUserRedeemed,
          globalRedeemed: 0,
          now: Date.now(),
        },
        applied.map((a) => a.coupon),
      );
      if (!result.ok || !coupon) {
        setError(result.message ?? 'Code not valid.');
        return;
      }
      apply({
        coupon,
        discount: result.discount ?? 0,
        message: result.message ?? 'Applied.',
      });
      setCode('');
    } catch {
      // Network/import failure — distinct from "code not valid" so a real
      // coupon isn't reported as bogus on a flaky connection.
      setError('Could not check that code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="docket p-4">
      <p className="field-label flex items-center gap-2">
        <Tag className="h-3.5 w-3.5" aria-hidden="true" />
        Coupon code
      </p>
      {suggestedChips.length > 0 && applied.length === 0 && (
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="text-theme-ink/55 text-[10px] font-medium">Try:</span>
          {suggestedChips.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => void tryApply(c.code)}
              className="field-value text-theme-ink/80 rounded-md border border-[color:var(--color-border)] bg-surface px-2.5 py-1 text-[11px] transition-colors hover:border-theme-accent hover:text-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
            >
              {c.code}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) void tryApply(code);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Enter code"
          aria-label="Coupon code"
          className="font-mono min-w-0 flex-1 rounded-md border border-[color:var(--color-border)] bg-surface px-3.5 py-2 text-sm uppercase text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
        <button
          type="submit"
          disabled={!code.trim() || busy}
          className="stamp disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Apply'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      {applied.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {applied.map((a) => (
            <li
              key={a.coupon.code}
              className="flex items-center justify-between gap-2 rounded-md border border-[#1F6238]/30 bg-[#1F6238]/5 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="field-value text-xs font-bold uppercase text-[#1F6238]">
                  {a.coupon.code}
                </span>
                <span className="text-theme-ink/65 text-[11px]">{a.message}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(a.coupon.code)}
                aria-label={`Remove ${a.coupon.code}`}
                className="text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
