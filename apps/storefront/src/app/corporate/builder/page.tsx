import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HamperBuilder } from '@/components/corporate/builder/hamper-builder';
import { Paisley } from '@/components/brand/paisley';

export const metadata: Metadata = {
  title: 'Build your hamper',
  description:
    'Compose a corporate hamper from templates or scratch. Tier-aware pricing, logo-print option, share via URL, hand off to enquiry.',
  robots: { index: false, follow: false },
};

function BuilderFallback() {
  return (
    <section className="container-site py-12 md:py-16">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
        <Paisley size="sm" />
        Hamper builder
      </p>
      <div className="mt-3 h-12 w-96 max-w-full animate-pulse rounded bg-theme-ink/10" />
      <div className="mt-10 h-64 animate-pulse rounded-2xl bg-theme-ink/5" />
    </section>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <HamperBuilder />
    </Suspense>
  );
}
