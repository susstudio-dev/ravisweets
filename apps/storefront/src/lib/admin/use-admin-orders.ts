'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/orders/store';
import { listAllOrders } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';
import type { Order } from '@/lib/orders/types';

/**
 * Reads orders for the admin views. Supabase first (when configured + signed
 * in as admin), localStorage demo seed second. Returns null while loading
 * so callers can show skeletons.
 */
export function useAdminOrders(): Order[] | null {
  const { configured, user, role } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (configured && user && role === 'admin') {
        const live = await listAllOrders();
        if (cancelled) return;
        // Merge live + local so localStorage-seeded demo orders still appear.
        const local = getOrders();
        const ids = new Set(live.map((o) => o.id));
        const merged = [...live, ...local.filter((o) => !ids.has(o.id))].sort(
          (a, b) => b.placedAt - a.placedAt,
        );
        setOrders(merged);
      } else {
        setOrders(getOrders());
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [configured, user, role]);

  return orders;
}
