import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Parallax } from '@/components/motion/parallax';
import { Grain } from '@/components/brand/grain';

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Ravi Sweets — a Khammam family kitchen, in the Telangana sweet tradition. Slow-cooked, for generations.',
};

const TIMELINE = [
  {
    year: 'Generations ago',
    title: 'A small kitchen in Khammam',
    body:
      'The first copper pan, the first recipe card, the first box with a paisley tag. A family ritual becomes a trade.',
  },
  {
    year: 'Since',
    title: 'The same slow way',
    body:
      'We still reduce rabri by hand. We still cut the katli in diamonds. We still roast almonds in small trays. The method is the brand.',
  },
  {
    year: 'Today',
    title: 'Delivered across India',
    body:
      'Hand-made, preservative-free, boxed fresh every morning. Global shipping, coming soon.',
  },
];

const PILLARS = [
  {
    title: 'Nothing rushed.',
    body:
      'Four hours for the qubani, not four minutes. The kitchen’s first rule is the slower way.',
  },
  {
    title: 'Nothing substituted.',
    body:
      'Ghee is ghee. Saffron is real. If we can’t find the ingredient we want, the sweet doesn’t leave the kitchen.',
  },
  {
    title: 'Nothing hidden.',
    body:
      'FSSAI number on every box. Shelf-life on every label. Ingredient list on every page.',
  },
];

// Real Ravi Sweets product photography — kept on a warm gradient backdrop in
// the hero/quote sections so the cutout PNGs read as editorial stills.
const PORTRAIT =
  'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png';

const KITCHEN =
  'https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png';

const PORTRAIT_BACKDROP =
  'radial-gradient(ellipse at 35% 35%, color-mix(in oklab, var(--theme-glow) 60%, var(--theme-base)) 0%, color-mix(in oklab, var(--theme-glow) 25%, var(--theme-base)) 50%, var(--theme-base) 90%)';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-[color:var(--color-border)]"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, color-mix(in oklab, var(--theme-glow) 35%, transparent) 0%, transparent 65%), var(--theme-base)',
        }}
      >
        <div className="container-site grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
          <div>
            <Reveal>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                <span style={{ fontFamily: 'var(--font-indic)' }}>మా కథ</span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span>Our story</span>
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-4 font-display text-display-lg font-semibold leading-[1.02] text-theme-ink md:text-display-xl">
                A family kitchen,{' '}
                <span className="italic text-theme-accent">still open.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-theme-ink/75">
                Ravi Sweets began in a single Khammam kitchen with a copper pan, a recipe
                card in someone&rsquo;s handwriting, and the promise that nothing would be
                hurried. That promise has outlived everything else we&rsquo;ve had to change.
              </p>
            </Reveal>
          </div>
          <Parallax offset={30}>
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[2rem] p-12 shadow-lifted ring-1 ring-[color:var(--color-border)]"
              style={{ background: PORTRAIT_BACKDROP }}
            >
              <Image
                src={PORTRAIT}
                alt="Premium Kaju Katli — slow-cooked in our Khammam kitchen"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 460px, 90vw"
                className="object-contain drop-shadow-[0_30px_40px_rgba(60,30,5,0.22)]"
              />
              <Grain />
              <div className="pointer-events-none absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
                Kaju Katli · Khammam kitchen
              </div>
            </div>
          </Parallax>
        </div>
      </section>

      <PaisleyDivider className="container-site" />

      {/* Timeline */}
      <section aria-labelledby="timeline-heading" className="container-site py-16">
        <Reveal className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            A short history
          </p>
          <h2
            id="timeline-heading"
            className="mt-2 font-display text-display-md text-theme-ink md:text-display-lg"
          >
            Three moments that still matter.
          </h2>
        </Reveal>
        <ol className="grid gap-8 md:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.08}>
              <li className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                  {t.year}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-theme-ink">
                  {t.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-theme-ink/75">{t.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Pull quote with parallax image */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, var(--theme-base) 0%, color-mix(in oklab, var(--theme-glow) 10%, var(--theme-base)) 100%)',
        }}
      >
        <div className="container-site grid gap-10 py-20 md:grid-cols-2 md:items-center">
          <Parallax offset={40}>
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] p-12 shadow-lifted ring-1 ring-[color:var(--color-border)]"
              style={{ background: PORTRAIT_BACKDROP }}
            >
              <Image
                src={KITCHEN}
                alt="Boondi Laddu — saffron pearls dropped one ladle at a time"
                fill
                sizes="(min-width: 768px) 420px, 90vw"
                className="object-contain drop-shadow-[0_24px_32px_rgba(60,30,5,0.2)]"
              />
              <Grain />
              <div className="pointer-events-none absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
                Boondi Laddu · made fresh each morning
              </div>
            </div>
          </Parallax>
          <div>
            <Reveal>
              <figure className="border-l-2 border-theme-accent/50 pl-6">
                <blockquote className="font-display text-2xl italic leading-snug text-theme-ink md:text-3xl">
                  &ldquo;If a sweet can be made faster, it can also be made less well. We chose
                  the slower way, and kept choosing it.&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-theme-ink/60">
                  — Ravi, on the kitchen&rsquo;s first rule
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section aria-labelledby="pillars-heading" className="container-site py-20">
        <Reveal>
          <h2
            id="pillars-heading"
            className="max-w-3xl font-display text-display-md text-theme-ink md:text-display-lg"
          >
            Three short promises,{' '}
            <span className="italic text-theme-accent">kept every day.</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="flex flex-col gap-3">
                <Paisley size="md" />
                <h3 className="font-display text-xl font-semibold text-theme-ink">{p.title}</h3>
                <p className="text-sm leading-relaxed text-theme-ink/75">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-site pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ backgroundColor: '#2a1505', color: '#fdf6ec' }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-16 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: '#e9ad4a' }}
            />
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md md:text-display-lg">
                  Come taste what we mean.
                </h2>
                <p className="mt-2 text-sm text-[#fdf6ec]/85 md:text-base">
                  Start with the Hyderabadi specials — Qubani ka Meetha and Badam ki Jali are
                  where most first-time customers begin.
                </p>
              </div>
              <Link
                href="/category/hyderabadi-specials"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#e9ad4a] px-6 py-3 text-sm font-semibold text-[#2a1505] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f2c66f]"
              >
                Shop Hyderabadi specials
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
