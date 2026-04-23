import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Parallax } from '@/components/motion/parallax';
import { Paisley } from '@/components/brand/paisley';

const PERSONAS = [
  {
    slug: 'diwali',
    eyebrow: 'For festival',
    title: 'Diwali',
    body: 'Silk-wrapped hampers, brass tags, and a signature paisley seal. Priority list opens in September.',
    href: '/festivals/diwali',
    image:
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1200&q=85&auto=format&fit=crop',
    accent: '#e9ad4a',
  },
  {
    slug: 'weddings',
    eyebrow: 'For weddings',
    title: 'Weddings',
    body: 'Custom trousseau boxes, bulk sangeet favours, and personalised name-cards. Minimum 50 units.',
    href: '/weddings',
    image:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=85&auto=format&fit=crop',
    accent: '#c0592b',
  },
  {
    slug: 'corporate',
    eyebrow: 'For corporate',
    title: 'Corporate',
    body: 'Logo-printed packaging, multi-address CSV dispatch, GST-compliant invoices. One account manager per order.',
    href: '/corporate',
    image:
      'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=1200&q=85&auto=format&fit=crop',
    accent: '#8a6a2e',
  },
];

export function GiftingGuide() {
  return (
    <section aria-labelledby="gifting-heading" className="container-site py-20 md:py-24">
      <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Gifting, by occasion
          </p>
          <h2
            id="gifting-heading"
            className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg"
          >
            A box for every kind of day.
          </h2>
        </div>
        <p className="max-w-sm text-theme-ink/70">
          Every gift leaves the kitchen the morning it ships, sealed by hand with a paisley
          tag and a note in our own ink.
        </p>
      </Reveal>

      <Stagger gap={90} className="grid gap-5 md:grid-cols-3">
        {PERSONAS.map((p, i) => (
          <Link
            key={p.slug}
            href={p.href}
            className="group relative flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] text-white shadow-lifted ring-1 ring-[color:var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <Parallax offset={i === 1 ? 28 : 18} className="absolute inset-0">
              <div className="relative h-full w-full">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
            </Parallax>
            {/* Legibility gradient */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(15,10,5,0.1) 0%, rgba(15,10,5,0.55) 60%, rgba(15,10,5,0.8) 100%)',
              }}
              aria-hidden="true"
            />
            {/* Coloured tinted wash on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-60"
              style={{ backgroundColor: p.accent }}
              aria-hidden="true"
            />

            <div className="relative z-10 mt-auto flex flex-col gap-2 p-6">
              <p
                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: p.accent }}
              >
                <Paisley size="sm" color={p.accent} />
                {p.eyebrow}
              </p>
              <h3 className="font-display text-3xl font-semibold leading-tight">{p.title}</h3>
              <p className="max-w-sm text-sm leading-relaxed text-white/85">{p.body}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1">
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </div>

            {/* Dev watermark */}
            <div
              className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur"
              aria-label="Placeholder image — dev only"
            >
              Dev only
            </div>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}
