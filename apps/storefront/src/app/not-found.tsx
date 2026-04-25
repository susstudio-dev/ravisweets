import Link from 'next/link';
import { ArrowRight, Search as SearchIcon, Home as HomeIcon } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[65vh] flex-col items-start justify-center gap-5 py-20">
      <Paisley size="lg" />
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-theme-accent">
        404 · Page not found
      </p>
      <h1 className="max-w-3xl font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
        That&rsquo;s not a page we have —{' '}
        <span className="italic text-theme-accent">but we have plenty of sweets.</span>
      </h1>
      <p className="max-w-xl text-theme-ink/70 md:text-lg">
        The link may be old, mistyped, or we moved something. Head back to the kitchen and start
        over, or search for what you&rsquo;re after.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
        >
          <HomeIcon className="h-4 w-4" aria-hidden="true" />
          Back to home
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-6 py-3 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-accent hover:text-theme-accent"
        >
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          Try searching
        </Link>
      </div>
    </section>
  );
}
