'use client';

import { useEffect } from 'react';
import { purgeDemoOrders } from '@/lib/orders/purge-demo';

/**
 * Mounts at the root layout, where `DemoSeed` used to. It is the exact
 * inverse: that component wrote five fabricated orders into every visitor's
 * browser, this one takes them back out. See lib/orders/purge-demo.ts for why
 * removing the seeder alone was not enough, and for when this can go.
 */
export function DemoPurge() {
  useEffect(() => {
    purgeDemoOrders();
  }, []);
  return null;
}
