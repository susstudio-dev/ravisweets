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
      'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png',
    accent: '#e9ad4a',
    bg: 'linear-gradient(135deg, #2a1505 0%, #4a2a08 60%, #6a3a10 100%)',
  },
  {
    slug: 'weddings',
    eyebrow: 'For weddings',
    title: 'Weddings',
    body: 'Custom trousseau boxes, bulk sangeet favours, and personalised name-cards. Minimum 50 units.',
    href: '/corporate#enquiry',
    image:
      'https://ravisweets.com/wp-content/uploads/2025/09/badam_katli-removebg-preview.png',
    accent: '#c0592b',
    bg: 'linear-gradient(135deg, #1a0606 0%, #4a1a10 60%, #7a2c1e 100%)',
  },
  {
    slug: 'corporate',
    eyebrow: 'For corporate',
    title: 'Corporate',
    body: 'Logo-printed packaging, multi-address CSV dispatch, GST-compliant invoices. One account manager per order.',
    href: '/corporate',
    image:
      'https://ravisweets.com/wp-content/uploads/2025/09/cashew_mithai-removebg-preview.png',
    accent: '#d6c796',
    bg: 'linear-gradient(135deg, #1a1408 0%, #2c220e 60%, #4a3c20 100%)',
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
            style={{ background: p.bg }}
          >
            {/* Brass radial glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 70% 30%, ${p.accent}33 0%, transparent 60%)`,
              }}
              aria-hidden="true"
            />

            {/* Floating cutout PNG, top-right */}
            <Parallax offset={i === 1 ? 28 : 18} className="absolute -right-8 -top-8 h-56 w-56">
              <div className="relative h-full w-full">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-contain opacity-90 drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
            </Parallax>

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
          </Link>
        ))}
      </Stagger>
    </section>
  );
}
