import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';

export default function ProductNotFound() {
  return (
    <section className="container-site flex flex-col items-start gap-5 py-24">
      <Paisley size="lg" />
      <h1 className="font-display text-display-md text-theme-ink">
        We could&rsquo;t find that sweet.
      </h1>
      <p className="max-w-lg text-theme-ink/70">
        The product you&rsquo;re looking for may have sold out or been renamed. Our full line-up
        is one click away.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </section>
  );
}
