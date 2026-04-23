import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchView } from '@/components/search/search-view';
import { Paisley } from '@/components/brand/paisley';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the Ravi Sweets catalogue.',
};

function SearchFallback() {
  return (
    <section className="container-site py-12 md:py-16">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
        <Paisley size="sm" />
        Search
      </p>
      <div className="mt-3 h-12 w-80 max-w-full animate-pulse rounded bg-theme-ink/10" />
      <div className="mt-10 h-14 max-w-2xl animate-pulse rounded-full bg-theme-ink/10" />
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchView />
    </Suspense>
  );
}
