'use client';

import { useMemo, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useSession } from '@/lib/supabase/session-context';
import { findDemoCoupon, DEMO_COUPONS } from '@/lib/coupons/validate';
import { validateCoupon } from '@/lib/coupons/validate';
import { useCoupons } from '@/lib/coupons/context';

const COUPONS_ENABLED = process.env.NEXT_PUBLIC_COUPONS_ENABLED !== 'false';

export function CouponInput() {
  const { subtotal, lineCount, lineViews } = useCart();
  const { user } = useSession();
  const { applied, apply, remove } = useCoupons();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;
  const suggestedChips = useMemo(() => {
    if (!isLoggedIn) return [];
    return DEMO_COUPONS.filter((c) => c.active).slice(0, 3);
  }, [isLoggedIn]);

  if (!COUPONS_ENABLED || lineCount === 0) return null;

  function tryApply(raw: string) {
    setError(null);
    const coupon = findDemoCoupon(raw);
    const result = validateCoupon(
      coupon,
      {
        subtotal: subtotal.amount,
        customerId: user?.id ?? null,
        firstOrder: true, // demo: always treat as first order client-side
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
        perUserRedeemed: 0,
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
              onClick={() => tryApply(c.code)}
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
          if (code.trim()) tryApply(code);
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
          disabled={!code.trim()}
          className="stamp disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
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
