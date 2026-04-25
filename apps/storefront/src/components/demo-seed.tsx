'use client';

import { useEffect } from 'react';
import { seedDemoOrders } from '@/lib/orders/demo-seed';

/**
 * Mounts at root layout. On first visit, seeds 5 demo orders into
 * localStorage so /account renders meaningfully out of the box. Subsequent
 * mounts are no-ops thanks to the seed sentinel.
 */
export function DemoSeed() {
  useEffect(() => {
    seedDemoOrders();
  }, []);
  return null;
}
