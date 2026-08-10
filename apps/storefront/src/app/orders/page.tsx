import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderDetail } from '@/components/orders/order-detail';

export const metadata: Metadata = {
  title: 'Order details and tracking',
  description:
    'Track a Ravi Sweets order — dispatch status, delivery estimate and the full contents of your box.',
  // The `?id=` parameter identifies one customer's order and must never become
  // its own indexable URL, so the canonical is the bare path.
  alternates: { canonical: '/orders' },
  robots: { index: false, follow: true },
};

function OrderFallback() {
  return (
    <section className="container-site py-20">
      <div className="h-8 w-64 animate-pulse rounded-md bg-theme-ink/10" />
      <div className="mt-6 h-48 animate-pulse rounded-lg bg-theme-ink/5" />
    </section>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrderFallback />}>
      <OrderDetailWrapper />
    </Suspense>
  );
}

// The wrapper calls useSearchParams (client-side) and passes the id through.
// Kept separate so the Suspense boundary surrounds it correctly.
import { OrderRouteReader } from '@/components/orders/order-route-reader';

function OrderDetailWrapper() {
  return <OrderRouteReader />;
}
