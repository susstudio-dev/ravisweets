'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/orders/store';
import type { Order } from '@/lib/orders/types';

/**
 * Reads orders from localStorage demo seed for now. Replace with a Supabase
 * RPC once backend lifts (Phase 2.5). Returns an empty array on first render
 * to keep SSR-safe; hydrates after mount.
 */
export function useDemoOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    setOrders(getOrders());
  }, []);
  return orders;
}
