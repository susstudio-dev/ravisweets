'use client';

import type { Order } from './types';

const STORAGE_KEY = 'ravi.orders.v1';
const SEED_SENTINEL_KEY = 'ravi.demo.seeded.v1';

/**
 * ONE-TIME CLEANUP OF THE RETIRED DEMO ORDERS.
 *
 * Until 2026-08-11 the root layout mounted a `DemoSeed` component that wrote
 * five invented orders into every visitor's localStorage on first load — five
 * fabricated records ("RS2604-A1F2 · placed", "RS2603-E4A1 · delivered",
 * addressed to "You" at 12 Banjara Hills) shown to real customers on a live
 * shop taking real payments. It was scaffolding from before there was a
 * database, and the owner has had it removed.
 *
 * Deleting the seeder is not enough: every browser that has already visited
 * ravisweets.com is still holding those five orders, and localStorage outlives
 * a deploy. So this runs once per browser and takes them back out.
 *
 * SAFE BY CONSTRUCTION. Only ids beginning `ord_demo_` are dropped — the exact
 * literals the retired seeder wrote (ord_demo_1 … ord_demo_5). Every real
 * order id is a `crypto.randomUUID()` (see store.ts, where the format is load-
 * bearing because orders.id is a Postgres uuid column), so no genuine order
 * can match this prefix. A customer who placed a real order before this
 * deploy keeps it.
 *
 * This can be deleted once enough time has passed that no active browser
 * still holds the seed — any time after mid-2027 is safe.
 */
export function purgeDemoOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed)) {
        const real = parsed.filter((o) => !o?.id?.startsWith('ord_demo_'));
        // Only write when something actually changed, so the common case
        // (a browser that never held the seed) touches nothing.
        if (real.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(real));
        }
      }
    }
    // The sentinel goes regardless: it is the retired seeder's bookkeeping and
    // nothing reads it any more.
    localStorage.removeItem(SEED_SENTINEL_KEY);
  } catch {
    /* ignore — never let a storage quirk break the page */
  }
}
