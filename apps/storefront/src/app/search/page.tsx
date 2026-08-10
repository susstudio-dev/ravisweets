import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchView } from '@/components/search/search-view';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Search the Ravi Sweets catalogue',
  description:
    'Search Ravi Sweets by name, ingredient or occasion — mithai, Hyderabadi specials, namkeens, pickles, podis and gift hampers.',
  /*
   * `?q=` produces an unbounded set of near-identical result pages, which is
   * the classic internal-search crawl trap. The canonical is the bare path and
   * the page is noindex — but `follow` stays true so the product links a
   * result page surfaces still pass equity onward.
   */
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true },
};

function SearchFallback() {
  return (
    <section className="container-site pb-20">
      <div className="bg-theme-ink/5 h-14 max-w-2xl animate-pulse rounded-lg" />
    </section>
  );
}

export default function SearchPage() {
  return (
    <>
      {/* Server-rendered so the page has an <h1> without waiting on `?q=`. */}
      <section className="container-site section-y pb-0">
        <Reveal>
          {/* No kicker above the heading — the docket-head carries itself. */}
          <div className="docket-head">
            <h1 className="font-display text-display-md md:text-display-lg text-theme-ink">
              Find the sweet you&rsquo;re after.
            </h1>
          </div>
        </Reveal>
      </section>

      <Suspense fallback={<SearchFallback />}>
        <SearchView />
      </Suspense>
    </>
  );
}
