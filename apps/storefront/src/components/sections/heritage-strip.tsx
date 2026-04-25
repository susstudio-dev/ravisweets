import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { Parallax } from '@/components/motion/parallax';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';

const PORTRAIT =
  'https://images.unsplash.com/photo-1606491048802-8342506d6471?w=1200&q=85&auto=format&fit=crop';

export function HeritageStrip() {
  return (
    <section
      aria-labelledby="heritage-heading"
      className="relative isolate overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, var(--theme-base) 0%, color-mix(in oklab, var(--theme-glow) 8%, var(--theme-base)) 100%)',
      }}
    >
      <div className="container-site grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
        {/* Portrait with parallax */}
        <Parallax offset={40} className="order-2 md:order-1">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.75rem] shadow-lifted ring-1 ring-[color:var(--color-border)]">
            <Image
              src={PORTRAIT}
              alt="Hands preparing traditional Telangana sweets in our Khammam kitchen"
              fill
              sizes="(min-width: 768px) 420px, 90vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 55%, transparent) 0%, transparent 50%)',
              }}
              aria-hidden="true"
            />
            <Grain />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
              <span>The kitchen, every morning</span>
              <span
                aria-hidden="true"
                className="rounded-full bg-black/50 px-2 py-0.5 backdrop-blur"
              >
                Dev only
              </span>
            </div>
          </div>
        </Parallax>

        {/* Copy */}
        <div className="order-1 md:order-2">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Our heritage
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              id="heritage-heading"
              className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
            >
              From a Khammam family kitchen,{' '}
              <span className="italic text-theme-accent">a sweetness that remembers.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-relaxed text-theme-ink/75">
              For generations our family has stirred rabri in copper, folded almond into sugar-lace,
              and slow-cooked apricots until they gave up their amber. Nothing rushed. Nothing
              substituted. The Telangana sweet tradition in every bite is not a marketing line —
              it is the only way we know how.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <figure className="mt-8 border-l-2 border-theme-accent/50 pl-6">
              <blockquote className="font-display text-xl italic leading-snug text-theme-ink md:text-2xl">
                &ldquo;If a sweet can be made faster, it can also be made less well. We chose the
                slower way, and kept choosing it.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm text-theme-ink/60">
                — Ravi, on the kitchen&rsquo;s first rule
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      {/* Floating paisley ornament */}
      <div
        className="pointer-events-none absolute right-6 top-10 text-theme-accent/25 md:right-16"
        aria-hidden="true"
      >
        <Paisley size="lg" rotate={35} />
      </div>
    </section>
  );
}
