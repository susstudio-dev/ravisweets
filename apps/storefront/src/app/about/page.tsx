import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FounderSection } from '@/components/about/founder-section';
import { SlotImage } from '@/components/media/slot-image';
import { Reveal } from '@/components/motion/reveal';
import { pendingPhoto } from '@/lib/images';

/*
 * KHAMMAM STAYS ON THIS PAGE. The owner removed the towns from the footer on
 * 2026-08-12, not from the brand's history — this is the story page, and where
 * the shop began is the story. What went is the COTTAGE framing: "family
 * kitchen", "a small kitchen", "one kitchen". Heritage, yes; smallness, no.
 */
export const metadata: Metadata = {
  title: 'Our story — the slow way, since 1983',
  description:
    'Ravi Sweets began in Khammam in 1983 and still works the same slow way — hand-cut katli, hand-rolled laddu, no preservatives.',
  alternates: { canonical: '/about' },
};

const TIMELINE = [
  {
    year: 'Generations ago',
    title: 'Where it began, in Khammam',
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
    body: 'Four hours for the qubani, not four minutes. Our first rule is the slower way.',
  },
  {
    title: 'Nothing substituted.',
    body: 'Ghee is ghee. Saffron is real. If we can’t find the ingredient we want, we don’t make the sweet.',
  },
  {
    title: 'Nothing hidden.',
    body: 'FSSAI number on every box. Shelf-life on every label. Ingredient list on every page.',
  },
];

/*
 * These are the FALLBACKS for the owner-editable photo slots (SlotImage):
 * the admin-assigned photo renders first, then these catalogue URLs — which
 * still point at the retired WordPress host, so SlotImage's render-time gate
 * (lib/images.ts) drops them to the dashed specimen plate without ever
 * issuing a request or a preload. When the shoot lands and the URLs go
 * root-relative, the photographs return with no component change.
 */
const PORTRAIT =
  pendingPhoto('2025/09/kaju_katli-removebg-preview.png');

const KITCHEN =
  pendingPhoto('2025/09/boondi_laddu-removebg-preview.png');

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="container-site section-y grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <Reveal>
              {/* A real strip heading, not a decorative kicker: the Telugu mark
                  carries the locality voice this page keeps at full strength. */}
              <p className="flex items-baseline gap-3">
                <span className="font-indic text-theme-accent text-xl leading-none">మా కథ</span>
                <span className="field-label">Our story</span>
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-display-lg text-theme-ink md:text-display-xl mt-4 leading-[1.02]">
                Still made the slow way.
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-theme-ink/75 mt-6 max-w-xl text-lg leading-relaxed">
                Ravi Sweets began in Khammam in 1983 with a copper pan, a recipe card in
                someone&rsquo;s handwriting, and the promise that nothing would be hurried. That
                promise has outlived everything else we&rsquo;ve had to change.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="docket overflow-hidden">
              <SlotImage
                slot="about.portrait"
                fallbackUrl={PORTRAIT}
                fallbackAlt="Premium Kaju Katli — hand-cut to the 1983 recipe"
                sizes="(min-width: 768px) 460px, 90vw"
                objectFit="contain"
                className="bg-theme-glow/20 aspect-[4/3] border-b border-[color:var(--color-border)]"
              />
              <dl className="p-5">
                <div className="field-row">
                  <dt className="field-label">Specimen</dt>
                  <dd className="field-value text-theme-ink text-sm">KAJU KATLI</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Origin</dt>
                  <dd className="field-value text-theme-ink text-sm">KHAMMAM</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        THE FOUNDER. Sits directly after the hero because he is the beginning
        of the story the timeline then carries forward. Renders NOTHING until
        the owner fills in a name or a story from /admin/content → Founder —
        so on a fresh install the page reads exactly as it did before.
      */}
      <FounderSection />

      {/* Timeline */}
      <section aria-labelledby="timeline-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2
              id="timeline-heading"
              className="font-display text-display-md text-theme-ink"
            >
              Three moments that still matter.
            </h2>
          </div>
        </Reveal>
        <ol className="grid gap-6 md:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <li key={t.year} className="h-full">
              <Reveal delay={i * 0.08} className="h-full">
                <div className="docket flex h-full flex-col p-6">
                  <p className="field-label">{t.year}</p>
                  <h3 className="font-display text-theme-ink mt-2 text-xl">{t.title}</h3>
                  <p className="text-theme-ink/75 mt-3 text-sm leading-relaxed">{t.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Pull quote with specimen sheet */}
      <section className="border-y border-[color:var(--color-border)]">
        <div className="container-site section-y grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="docket overflow-hidden">
              <SlotImage
                slot="about.kitchen"
                fallbackUrl={KITCHEN}
                fallbackAlt="Boondi Laddu — saffron pearls dropped one ladle at a time"
                sizes="(min-width: 768px) 420px, 90vw"
                objectFit="contain"
                className="bg-theme-glow/20 aspect-[4/3] border-b border-[color:var(--color-border)]"
              />
              <dl className="p-5">
                <div className="field-row">
                  <dt className="field-label">Specimen</dt>
                  <dd className="field-value text-theme-ink text-sm">BOONDI LADDU</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Made</dt>
                  <dd className="field-value text-theme-ink text-sm">FRESH EACH MORNING</dd>
                </div>
              </dl>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <figure className="border-l-2 border-[color:var(--color-rule)] pl-6">
                <blockquote className="font-display text-theme-ink text-2xl leading-snug md:text-3xl">
                  &ldquo;If a sweet can be made faster, it can also be made less well. We chose the
                  slower way, and kept choosing it.&rdquo;
                </blockquote>
                <figcaption className="text-text-muted mt-4 text-sm">
                  — Ravi, on the first rule
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section aria-labelledby="pillars-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2
              id="pillars-heading"
              className="font-display text-display-md text-theme-ink max-w-3xl"
            >
              Three short promises, kept every day.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="flex flex-col gap-3">
                <span className="bg-varak-rule inline-block h-2 w-2 rotate-45" aria-hidden="true" />
                <h3 className="font-display text-theme-ink text-xl">{p.title}</h3>
                <p className="text-theme-ink/75 text-sm leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/*
        Same carbon band as the corporate dispatch panel on the home page —
        slate ground, stock ink and inverted stamp all inherited from
        data-register="carbon" with zero component changes.
      */}
      <section className="container-site section-y-tight">
        <Reveal>
          <div data-register="carbon" className="bg-theme-base text-theme-ink p-7 md:p-10">
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md">Come taste what we mean.</h2>
                <p className="text-text-muted mt-2 text-sm md:text-base">
                  Start with today&rsquo;s bestsellers — Kaju Katli and Gulab Jamun are where most
                  first-time customers begin.
                </p>
              </div>
              <Link href="/shop" className="stamp shrink-0">
                Shop the catalogue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
