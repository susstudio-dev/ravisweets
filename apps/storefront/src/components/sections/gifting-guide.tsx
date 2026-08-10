import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Parallax } from '@/components/motion/parallax';
import { cn } from '@/lib/cn';
import { pendingPhoto } from '@/lib/images';

/**
 * The katli cut — a 45-degree diamond, the shape kaju katli is actually cut
 * into. Replaces the paisley as this section's bullet mark. It draws itself
 * from `currentColor`, so it re-themes with whatever register it lands in and
 * never needs a colour prop (which is how the old paisley leaked hex).
 */
function Katli({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-current', className)}
    />
  );
}

interface Persona {
  slug: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  image: string;
  /**
   * Opts this card's whole subtree into the dark dusk register. Every token
   * class inside then resolves to plum ground / cream ink / marigold accent
   * on its own — which is why no card below carries a colour value.
   */
  register?: 'dusk';
  /** Flat panel ground. Colour blocks only; no gradients on brand surfaces. */
  panel: string;
  /** Eyebrow tone, chosen per card so it stays legible on that card's ground. */
  eyebrowTone: string;
  /**
   * Body-copy tone, chosen per card for the same reason. Most cards use the
   * derived `text-text-muted`, which `applyPalette` guarantees passes AA
   * against `--color-surface` — but the diwali card's ground is `bg-field`,
   * the saturated marigold panel, not a derived surface, so muted text on it
   * measures 3.02:1 and fails. That card overrides to full-strength ink.
   */
  bodyTone: string;
}

/**
 * Three flat panels, differentiated by register and token rather than by baked
 * colour: the marigold field, the dusk register, and the elevated surface.
 * Each one re-themes with the palette; none of them can drift from it.
 */
const PERSONAS: Persona[] = [
  {
    slug: 'diwali',
    eyebrow: 'For festival',
    title: 'Diwali',
    body: 'Silk-wrapped hampers, silver-leaf tags, and a signature katli seal. Priority list opens in September.',
    href: '/festivals/diwali',
    image:
      pendingPhoto('2025/09/dry_fruit_chikki-removebg-preview.png'),
    panel: 'bg-field',
    // Ink on the marigold field — 7.12:1. field-deep measured 4.40:1 here,
    // just under AA, so this card can't use the deep-rose text the others do.
    eyebrowTone: 'text-theme-ink',
    bodyTone: 'text-theme-ink',
  },
  {
    slug: 'weddings',
    eyebrow: 'For weddings',
    title: 'Weddings',
    body: 'Custom trousseau boxes, bulk sangeet favours, and personalised name-cards. Minimum 50 units.',
    href: '/corporate#enquiry',
    image: pendingPhoto('2025/09/badam_katli-removebg-preview.png'),
    register: 'dusk',
    panel: 'bg-surface',
    // Inside dusk this is marigold on plum.
    eyebrowTone: 'text-theme-accent',
    bodyTone: 'text-text-muted',
  },
  {
    slug: 'corporate',
    eyebrow: 'For corporate',
    title: 'Corporate',
    body: 'Logo-printed packaging, multi-address CSV dispatch, GST-compliant invoices. One account manager per order.',
    href: '/corporate',
    image: pendingPhoto('2025/09/cashew_mithai-removebg-preview.png'),
    panel: 'bg-surface-elevated',
    eyebrowTone: 'text-theme-accent',
    bodyTone: 'text-text-muted',
  },
];

export function GiftingGuide() {
  return (
    <section aria-labelledby="gifting-heading" className="container-site py-20 md:py-24">
      <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <Katli />
            Gifting, by occasion
          </p>
          <h2
            id="gifting-heading"
            className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.05]"
          >
            A box for every kind of day.
          </h2>
        </div>
        {/*
          `text-text-muted`, not `text-theme-ink/70`: Tailwind 3 emits NO rule
          at all for an opacity modifier on a colour defined as a bare
          `var(--x)`, so the /70 was silently a no-op. The muted token is a real
          declared colour and swaps per register.
        */}
        <p className="text-text-muted max-w-sm">
          Every gift leaves the kitchen the morning it ships, sealed by hand with a katli-cut tag
          and a note in our own ink.
        </p>
      </Reveal>

      <Stagger gap={90} className="grid gap-5 md:grid-cols-3">
        {PERSONAS.map((p, i) => (
          <Link
            key={p.slug}
            href={p.href}
            data-register={p.register}
            className={cn(
              'shadow-soft focus-visible:ring-theme-accent text-theme-ink hover:shadow-lifted group relative flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] ring-1 ring-[color:var(--color-border)] transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2',
              p.panel,
            )}
          >
            {/* Floating cutout PNG, top-right */}
            <Parallax
              offset={i === 1 ? 28 : 18}
              className="pointer-events-none absolute -right-8 -top-8 h-56 w-56"
            >
              <div className="relative h-full w-full">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="240px"
                  className="ease-emphasised object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.22)] transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110"
                />
              </div>
            </Parallax>

            <div className="relative z-10 mt-auto flex flex-col gap-2 p-6">
              <p
                className={cn(
                  'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]',
                  p.eyebrowTone,
                )}
              >
                <Katli />
                {p.eyebrow}
              </p>
              <h3 className="font-display text-display-md">{p.title}</h3>
              <p className={cn('max-w-sm text-sm leading-relaxed', p.bodyTone)}>{p.body}</p>
              {/*
               * Accent chip. `--theme-base` is always the ground `--theme-accent`
               * was picked to sit on, in either register — cream on rose here,
               * marigold on plum inside the dusk card — so one class pair is
               * contrast-correct on all three panels.
               */}
              <span className="bg-theme-accent ease-standard rounded-pill mt-4 inline-flex w-fit items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] transition-transform duration-300 group-hover:translate-x-1">
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}
