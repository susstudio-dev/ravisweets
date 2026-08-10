'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Coupon } from './types';
import { useSession } from '@/lib/supabase/session-context';
import { fetchCouponByCode } from '@/lib/supabase/coupons';

const STORAGE_KEY = 'ravi.cart.coupons.v1';

export interface AppliedCoupon {
  coupon: Coupon;
  discount: number;
  message: string;
}

interface CouponsContextValue {
  applied: AppliedCoupon[];
  totalDiscount: number;
  freeShipping: boolean;
  /** Primary code to record on the order row (highest-priority non-shipping). */
  primaryCode: string | null;
  apply: (entry: AppliedCoupon) => void;
  remove: (code: string) => void;
  clear: () => void;
}

const CouponsCtx = createContext<CouponsContextValue | null>(null);

function readInitial(): AppliedCoupon[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppliedCoupon[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [applied, setApplied] = useState<AppliedCoupon[]>(readInitial);
  const isFirstRender = useRef(true);
  const { configured } = useSession();
  const revalidated = useRef(false);

  // Applied coupons rehydrate from localStorage with their discounts baked
  // in, and checkout commits them without asking again — so a coupon the
  // admin deactivated yesterday would ride a stale cart into a real order.
  // On a configured store, re-check each persisted code against the coupons
  // table once per session and drop the ones with no active row (RLS hides
  // inactive/expired rows, so a miss IS the answer). A dropped code costs
  // the customer a re-apply; the reverse costs the business real money.
  useEffect(() => {
    if (!configured || revalidated.current || applied.length === 0) return;
    void Promise.all(
      applied.map(async (a) => {
        try {
          // Throws on query failure; only a CONFIRMED absence counts as dead —
          // a network blip must not strip a coupon the customer validly holds.
          return { code: a.coupon.code, dead: (await fetchCouponByCode(a.coupon.code)) === null };
        } catch {
          return { code: a.coupon.code, dead: false, errored: true };
        }
      }),
    ).then((checks) => {
      // Only stop retrying once every code got a definitive answer; errored
      // checks leave the flag unset so a later render tries again.
      if (checks.every((c) => !c.errored)) revalidated.current = true;
      const dead = new Set(checks.filter((c) => c.dead).map((c) => c.code));
      if (dead.size > 0) {
        setApplied((prev) => prev.filter((a) => !dead.has(a.coupon.code)));
      }
    });
  }, [configured, applied]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applied));
    } catch {
      /* ignore */
    }
  }, [applied]);

  const apply = useCallback((entry: AppliedCoupon) => {
    setApplied((prev) => [
      ...prev.filter((a) => a.coupon.code !== entry.coupon.code),
      entry,
    ]);
  }, []);

  const remove = useCallback((code: string) => {
    setApplied((prev) => prev.filter((a) => a.coupon.code !== code));
  }, []);

  const clear = useCallback(() => setApplied([]), []);

  const value = useMemo<CouponsContextValue>(() => {
    const totalDiscount = applied.reduce((sum, a) => sum + a.discount, 0);
    const freeShipping = applied.some((a) => a.coupon.type === 'free_shipping');
    const primary = applied
      .filter((a) => a.coupon.type !== 'free_shipping')
      .sort((a, b) => b.coupon.priority - a.coupon.priority)[0];
    return {
      applied,
      totalDiscount,
      freeShipping,
      primaryCode: primary?.coupon.code ?? applied[0]?.coupon.code ?? null,
      apply,
      remove,
      clear,
    };
  }, [applied, apply, remove, clear]);

  return <CouponsCtx.Provider value={value}>{children}</CouponsCtx.Provider>;
}

export function useCoupons(): CouponsContextValue {
  const ctx = useContext(CouponsCtx);
  if (!ctx) throw new Error('useCoupons() must be called inside <CouponsProvider>');
  return ctx;
}
