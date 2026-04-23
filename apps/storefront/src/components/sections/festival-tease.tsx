import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Paisley } from '@/components/brand/paisley';

export function FestivalTease() {
  return (
    <section
      aria-labelledby="festival-heading"
      className="relative isolate overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 20% 30%, color-mix(in oklab, var(--theme-glow) 22%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, color-mix(in oklab, var(--theme-accent) 15%, transparent) 0%, transparent 60%), var(--theme-base)',
      }}
    >
      <div className="container-site relative flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-theme-accent">
            <Paisley size="sm" />
            Diwali 2026 · Opening soon
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            id="festival-heading"
            className="max-w-3xl font-display text-display-md leading-[1.02] text-theme-ink md:text-display-xl"
          >
            The festival of light,{' '}
            <span className="italic text-theme-accent">wrapped by hand in brass and silk.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-2xl text-theme-ink/70 md:text-lg">
            A curated Diwali lookbook — six hampers, three price bands, logo-ready for corporate
            runs. Priority list opens first to our earlier customers and corporate accounts.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href="/festivals/diwali"
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            Join the priority list
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>

      {/* Large decorative paisleys at corners */}
      <div
        className="pointer-events-none absolute -left-8 top-10 text-theme-accent/20"
        aria-hidden="true"
      >
        <Paisley size="lg" rotate={-20} />
      </div>
      <div
        className="pointer-events-none absolute -right-6 bottom-10 text-theme-accent/20"
        aria-hidden="true"
      >
        <Paisley size="lg" rotate={170} />
      </div>
    </section>
  );
}
