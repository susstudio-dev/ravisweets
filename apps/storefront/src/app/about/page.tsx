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
    body: 'The first copper pan, the first recipe card, the first box with a paisley tag. A family ritual becomes a trade.',
  },
  {
    year: 'Since',
    title: 'The same slow way',
    body: 'We still reduce rabri by hand. We still cut the katli in diamonds. We still roast almonds in small trays. The method is the brand.',
  },
  {
    year: 'Today',
    title: 'Delivered across India',
    body: 'Hand-made, preservative-free, boxed fresh every morning. Global shipping, coming soon.',
  },
];

const PILLARS = [
  {
    title: 'Nothing rushed.',
    body: 'Four hours for the qubani, not four minutes. The kitchen’s first rule is the slower way.',
  },
  {
    title: 'Nothing substituted.',
    body: 'Ghee is ghee. Saffron is real. If we can’t find the ingredient we want, the sweet doesn’t leave the kitchen.',
  },
  {
    title: 'Nothing hidden.',
    body: 'FSSAI number on every box. Shelf-life on every label. Ingredient list on every page.',
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
              <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
                <Paisley size="sm" />
                <span style={{ fontFamily: 'var(--font-indic)' }}>మా కథ</span>
                <span aria-hidden="true" className="opacity-50">
                  ·
                </span>
                <span>Our story</span>
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-display-lg text-theme-ink md:text-display-xl mt-4 leading-[1.02]">
                A family kitchen, <span className="text-theme-accent italic">still open.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-theme-ink/75 mt-6 max-w-xl text-lg leading-relaxed">
                Ravi Sweets began in a single Khammam kitchen with a copper pan, a recipe card in
                someone&rsquo;s handwriting, and the promise that nothing would be hurried. That
                promise has outlived everything else we&rsquo;ve had to change.
              </p>
            </Reveal>
          </div>
          <Parallax offset={30}>
            <div
              className="shadow-lifted relative aspect-[4/5] overflow-hidden rounded-[2rem] p-12 ring-1 ring-[color:var(--color-border)]"
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
              <div className="text-theme-ink/55 pointer-events-none absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.22em]">
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
          <p className="text-theme-accent text-xs font-semibold uppercase tracking-[0.22em]">
            A short history
          </p>
          <h2
            id="timeline-heading"
            className="font-display text-display-md text-theme-ink md:text-display-lg mt-2"
          >
            Three moments that still matter.
          </h2>
        </Reveal>
        <ol className="grid gap-8 md:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.08}>
              <li className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-6">
                <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.22em]">
                  {t.year}
                </p>
                <h3 className="font-display text-theme-ink mt-2 text-xl">{t.title}</h3>
                <p className="text-theme-ink/75 mt-3 text-sm leading-relaxed">{t.body}</p>
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
              className="shadow-lifted relative aspect-[4/5] overflow-hidden rounded-[1.75rem] p-12 ring-1 ring-[color:var(--color-border)]"
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
              <div className="text-theme-ink/55 pointer-events-none absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.22em]">
                Boondi Laddu · made fresh each morning
              </div>
            </div>
          </Parallax>
          <div>
            <Reveal>
              <figure className="border-theme-accent/50 border-l-2 pl-6">
                <blockquote className="font-display text-theme-ink text-2xl italic leading-snug md:text-3xl">
                  &ldquo;If a sweet can be made faster, it can also be made less well. We chose the
                  slower way, and kept choosing it.&rdquo;
                </blockquote>
                <figcaption className="text-theme-ink/60 mt-4 text-sm">
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
            className="font-display text-display-md text-theme-ink md:text-display-lg max-w-3xl"
          >
            Three short promises, <span className="text-theme-accent italic">kept every day.</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="flex flex-col gap-3">
                <Paisley size="md" />
                <h3 className="font-display text-theme-ink text-xl">{p.title}</h3>
                <p className="text-theme-ink/75 text-sm leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/*
        Same dusk panel as the corporate CTA on the home page — dark ground,
        cream ink and pista accent all inherited from data-register, with the
        gold blur orb deleted.
      */}
      <section className="container-site pb-20">
        <Reveal>
          <div
            data-register="dusk"
            className="bg-theme-base text-theme-ink overflow-hidden rounded-3xl p-8 md:p-12"
          >
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md md:text-display-lg">
                  Come taste what we mean.
                </h2>
                <p className="mt-2 text-sm opacity-85 md:text-base">
                  Start with the Hyderabadi specials — Qubani ka Meetha and Badam ki Jali are where
                  most first-time customers begin.
                </p>
              </div>
              <Link
                href="/category/hyderabadi-specials"
                className="bg-theme-accent inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
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
