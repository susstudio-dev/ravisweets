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
  const { subtotal, lineCount } = useCart();
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
        items: [],
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
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
        <Tag className="h-3.5 w-3.5" aria-hidden="true" />
        Coupon code
      </div>
      {suggestedChips.length > 0 && applied.length === 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-medium text-theme-ink/55">Try:</span>
          {suggestedChips.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => tryApply(c.code)}
              className="rounded-full border border-[color:var(--color-border)] bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-theme-ink/80 hover:border-theme-accent hover:text-theme-accent"
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
          className="flex-1 rounded-full border border-[color:var(--color-border)] bg-surface px-4 py-2 font-mono text-sm uppercase text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="rounded-full bg-theme-accent px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-medium text-[#c0392b]">{error}</p>}

      {applied.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {applied.map((a) => (
            <li
              key={a.coupon.code}
              className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {a.coupon.code}
                </span>
                <span className="text-[11px] text-theme-ink/65">{a.message}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(a.coupon.code)}
                aria-label={`Remove ${a.coupon.code}`}
                className="rounded-full p-1 text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink"
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
