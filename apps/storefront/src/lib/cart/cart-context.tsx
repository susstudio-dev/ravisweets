'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Money, Product, ProductVariant } from '@ravisweets/shared';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';

const STORAGE_KEY = 'ravi.cart.v1';

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
  /** When the line was added — for list ordering. */
  addedAt: number;
}

export interface CartLineView extends CartLine {
  product: Product;
  variant: ProductVariant;
  lineTotal: Money;
}

interface CartState {
  lines: CartLine[];
}

interface CartContextValue {
  state: CartState;
  lineCount: number;
  subtotal: Money;
  lineViews: CartLineView[];
  add: (productId: string, variantId: string, qty?: number) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  remove: (productId: string, variantId: string) => void;
  clear: () => void;
}

const CartCtx = createContext<CartContextValue | null>(null);

function resolveLine(line: CartLine): CartLineView | null {
  const product = SAMPLE_PRODUCTS.find((p) => p.id === line.productId);
  if (!product) return null;
  const variant = product.variants.find((v) => v.id === line.variantId);
  if (!variant) return null;
  return {
    ...line,
    product,
    variant,
    lineTotal: { amount: variant.price.amount * line.quantity, currency: variant.price.currency },
  };
}

/**
 * Lazy initialiser — runs once at the FIRST client render, synchronously.
 * This eliminates the prior hydration race where a click between mount and
 * the load effect could be overwritten when the load fired.
 *
 * SSR-safe: returns empty cart on the server; the client picks up on first
 * render and corrects the state before any interaction is possible.
 */
function readInitialCart(): CartState {
  if (typeof window === 'undefined') return { lines: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as CartState;
    return parsed && Array.isArray(parsed.lines) ? parsed : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(readInitialCart);
  // Skip the very first persistence effect — initial state is already what
  // localStorage held, so writing it back would be a needless round-trip.
  const isFirstRender = useRef(true);

  // Persist on subsequent state changes (after first render).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const add = useCallback((productId: string, variantId: string, qty = 1) => {
    setState((prev) => {
      const existing = prev.lines.find(
        (l) => l.productId === productId && l.variantId === variantId,
      );
      if (existing) {
        return {
          lines: prev.lines.map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, quantity: l.quantity + qty }
              : l,
          ),
        };
      }
      return {
        lines: [...prev.lines, { productId, variantId, quantity: qty, addedAt: Date.now() }],
      };
    });
  }, []);

  const updateQty = useCallback((productId: string, variantId: string, qty: number) => {
    setState((prev) => {
      if (qty <= 0) {
        return {
          lines: prev.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
        };
      }
      return {
        lines: prev.lines.map((l) =>
          l.productId === productId && l.variantId === variantId ? { ...l, quantity: qty } : l,
        ),
      };
    });
  }, []);

  const remove = useCallback((productId: string, variantId: string) => {
    setState((prev) => ({
      lines: prev.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
    }));
  }, []);

  const clear = useCallback(() => setState({ lines: [] }), []);

  const value = useMemo<CartContextValue>(() => {
    const lineViews = state.lines
      .map(resolveLine)
      .filter((v): v is CartLineView => v !== null)
      .sort((a, b) => b.addedAt - a.addedAt);
    const lineCount = lineViews.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal: Money = {
      amount: lineViews.reduce((sum, l) => sum + l.lineTotal.amount, 0),
      currency: lineViews[0]?.lineTotal.currency ?? 'INR',
    };
    return { state, lineCount, subtotal, lineViews, add, updateQty, remove, clear };
  }, [state, add, updateQty, remove, clear]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
