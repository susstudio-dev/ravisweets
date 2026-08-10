import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HamperBuilder } from '@/components/corporate/builder/hamper-builder';

export const metadata: Metadata = {
  title: 'Build your corporate hamper',
  description:
    'Compose a corporate hamper from templates or from scratch — tier-aware pricing, logo printing, shareable by URL.',
  /*
   * The builder is reached as `/corporate/builder?t=premium|essence|grande`,
   * which was the entirety of the crawl's "URL: Parameters" finding. The
   * template is a starting state, not a distinct page, so all three collapse
   * onto one parameter-free canonical.
   */
  alternates: { canonical: '/corporate/builder' },
  robots: { index: false, follow: true },
};

function BuilderFallback() {
  return (
    <section className="container-site section-y-tight">
      <p className="field-label">Hamper builder</p>
      <div className="bg-theme-ink/10 mt-3 h-12 w-96 max-w-full animate-pulse rounded-lg" />
      <div className="bg-theme-ink/5 mt-10 h-64 animate-pulse rounded-lg" />
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
