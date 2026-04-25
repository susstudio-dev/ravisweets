import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CATALOGUE } from '@ravisweets/shared';
import { ShopView } from '@/components/shop/shop-view';
import { Paisley } from '@/components/brand/paisley';

export const metadata: Metadata = {
  title: 'Shop — all sweets, namkeens, hampers',
  description:
    'Every product in the Ravi Sweets catalogue — filter by category, search, or browse by collection.',
};

function ShopFallback() {
  return (
    <section className="container-site py-12 md:py-16">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
        <Paisley size="sm" />
        Shop all
      </p>
      <div className="mt-3 h-12 w-72 max-w-full animate-pulse rounded bg-theme-ink/10" />
      <div className="mt-8 h-10 animate-pulse rounded-full bg-theme-ink/5" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-theme-ink/5" />
        ))}
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopView products={CATALOGUE} />
    </Suspense>
  );
}
