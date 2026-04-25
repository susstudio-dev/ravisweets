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
