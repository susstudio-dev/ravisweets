import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Gift, Handshake, Users } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { ThemeVars } from '@/lib/theme/theme-provider';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Parallax } from '@/components/motion/parallax';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { Grain } from '@/components/brand/grain';
import { FestivalCountdown } from '@/components/festivals/festival-countdown';

export type FestivalSlug =
  | 'diwali'
  | 'raksha-bandhan'
  | 'eid'
  | 'holi'
  | 'pongal'
  | 'sankranti'
  | 'ugadi'
  | 'onam'
  | 'ganesh-chaturthi'
  | 'christmas';

interface Festival {
  title: string;
  telugu: string;
  tagline: string;
  eyebrow: string;
  body: string;
  date: string; // ISO
  heroImage: string;
  theme: { base: string; accent: string; glow: string; ink: string; grainOpacity: number };
  gifteeFor: { icon: typeof Gift; title: string; body: string; href: string }[];
  productSlugs: string[];
}

const FESTIVALS: Record<FestivalSlug, Festival> = {
  diwali: {
    title: 'Diwali',
    telugu: 'దీపావళి',
    tagline: 'Wrapped in brass and silk.',
    eyebrow: 'Festival of light · 2026',
    body:
      'Six hampers, three price bands, logo-ready for corporate runs. Priority list opens to earlier customers and corporate accounts first.',
    date: '2026-11-08T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png',
    // Diwali used to set base to #2a1505 (deep brown) which made the WHOLE
    // route render dark — header, megamenu, everything. Now we keep the cream
    // base shared with the rest of the site and let the brass accent +
    // saffron glow carry the festival mood.
    theme: {
      base: '#fff5dc',
      accent: '#a85a08',
      glow: '#f0bd4a',
      ink: '#2a1505',
      grainOpacity: 0.07,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'Hand-packed hampers with Qubani, Kaju Katli, and a brass diya.',
        href: '/category/gift-hampers',
      },
      {
        icon: Users,
        title: 'For your team',
        body: '50+ unit corporate runs with logo-printed packaging and CSV delivery.',
        href: '/corporate#enquiry',
      },
      {
        icon: Handshake,
        title: 'For clients',
        body: 'Signature Grande hamper with personalised card, in a hand-painted brass box.',
        href: '/corporate#catalogue',
      },
    ],
    productSlugs: [
      'diwali-premium-hamper',
      'kaju-katli',
      'qubani-ka-meetha',
      'badam-ki-jali',
    ],
  },
  'raksha-bandhan': {
    title: 'Raksha Bandhan',
    telugu: 'రక్షా బంధన్',
    tagline: 'For the ones who remember the small promises.',
    eyebrow: 'Brothers &amp; sisters · 2026',
    body:
      'A hamper tied with a thread — the traditional signifier, done properly. Compact boxes for courier and weighted boxes for hand-delivery.',
    date: '2026-08-28T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
    theme: {
      base: '#fdf3df',
      accent: '#c0592b',
      glow: '#f29f5a',
      ink: '#3a1e0c',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For your sibling',
        body: 'A compact tin with Kaju Katli, Badam ki Jali, and a rakhi.',
        href: '/category/gift-hampers',
      },
      {
        icon: Handshake,
        title: 'For extended family',
        body: 'Send to multiple addresses — upload a CSV, one consolidated invoice.',
        href: '/corporate#enquiry',
      },
      {
        icon: Users,
        title: 'For office runs',
        body: 'HR teams sending to sibling employees — small boxes, large quantities.',
        href: '/corporate',
      },
    ],
    productSlugs: ['kaju-katli', 'badam-ki-jali', 'qubani-ka-meetha', 'double-ka-meetha'],
  },
  eid: {
    title: 'Eid',
    telugu: 'ఈద్',
    tagline: 'A platter worth the long day.',
    eyebrow: 'Eid al-Fitr · 2026',
    body:
      "The Deccan table shines brightest here. Double ka Meetha, Qubani, Badam ki Jali — Hyderabadi classics, plated the slow way in our Khammam kitchen.",
    date: '2026-03-30T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png',
    theme: {
      base: '#fff4e3',
      accent: '#a56a0f',
      glow: '#e9ad4a',
      ink: '#2a1a04',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'The full Hyderabadi spread in a single box — hand-shipped across Telangana.',
        href: '/category/hyderabadi-specials',
      },
      {
        icon: Handshake,
        title: 'For your neighbours',
        body: 'Smaller boxes that travel well — Badam ki Jali keeps 21 days.',
        href: '/category/gift-hampers',
      },
      {
        icon: Users,
        title: 'For corporate iftars',
        body: 'Large-format trays and individual portions for office gatherings.',
        href: '/corporate',
      },
    ],
    productSlugs: ['double-ka-meetha', 'qubani-ka-meetha', 'badam-ki-jali', 'kaju-katli'],
  },
  holi: {
    title: 'Holi',
    telugu: 'హోలీ',
    tagline: 'A spread as bright as the colours.',
    eyebrow: 'Festival of colours · 2027',
    body:
      'Gujiya-style boxes, jaggery-led laddus, and cooling mithai for the post-rang plate. Colour-coded gift sleeves so the box is a celebration before the lid even opens.',
    date: '2027-03-13T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png',
    theme: {
      base: '#fff0e8',
      accent: '#c83a6a',
      glow: '#f29ab2',
      ink: '#3a0a1c',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      { icon: Gift, title: 'For neighbours', body: 'Compact share-boxes — one per family, ten per society.', href: '/category/sweet-bites' },
      { icon: Users, title: 'For your team', body: 'Office-tray savouries that survive the gulal.', href: '/category/savouries' },
      { icon: Handshake, title: 'For elders', body: 'Sugar-light healthy laddus with millet and gondh.', href: '/category/healthy-sweets' },
    ],
    productSlugs: ['kaju-katli', 'motichoor-ladoo', 'cardamom-soan-papdi', 'badam-ki-jali'],
  },
  pongal: {
    title: 'Pongal',
    telugu: 'పొంగల్',
    tagline: 'The clay pot, the harvest, the first morning.',
    eyebrow: 'Harvest festival · 2027',
    body:
      'Our Pongal Pot Set arrives with a hand-thrown clay pot, a sealed sachet of jaggery-rice-moong-ghee mix, and a sprig of dried banana leaf. Boil milk, tip it in — Pongal in fifteen minutes.',
    date: '2027-01-15T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/08/booster.webp',
    theme: {
      base: '#fbf3df',
      accent: '#9c5a14',
      glow: '#d6a74c',
      ink: '#2a1a08',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      { icon: Gift, title: 'For your family', body: 'The Pongal Pot Set — clay pot kept as a keepsake.', href: '/product/pongal-pot-set' },
      { icon: Users, title: 'For your team', body: 'Office Pongal trays with sweet & savoury Pongal.', href: '/category/combos' },
      { icon: Handshake, title: 'For elders', body: 'Nuvvula laddu and millet laddu, sweetened with jaggery.', href: '/category/healthy-sweets' },
    ],
    productSlugs: ['pongal-pot-set', 'motichoor-ladoo', 'cardamom-soan-papdi', 'kaju-katli'],
  },
  sankranti: {
    title: 'Sankranti',
    telugu: 'సంక్రాంతి',
    tagline: 'Til, gud, and a new year on the kitchen door.',
    eyebrow: 'Makar Sankranti · 2027',
    body:
      'Sesame-and-jaggery laddus pressed by hand, plus the Telugu Sankranti spread — Ariselu, Bobbatlu, Sajja Burelu. Fly the kite, share the box.',
    date: '2027-01-14T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/08/11-2-400x400.jpg',
    theme: {
      base: '#fbf2dd',
      accent: '#a04a14',
      glow: '#e8a93c',
      ink: '#2a1604',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      { icon: Gift, title: 'For family', body: 'Nuvvula laddu — the Sankranti laddu, til and jaggery.', href: '/product/nuvvula-laddu' },
      { icon: Users, title: 'For neighbours', body: 'Boxes of Bellam Sunnundalu and ariselu — share-sized.', href: '/category/sweets' },
      { icon: Handshake, title: 'For elders', body: 'Bone-strengthening sesame laddus, no refined sugar.', href: '/category/healthy-sweets' },
    ],
    productSlugs: ['cardamom-soan-papdi', 'motichoor-ladoo', 'kaju-katli', 'roasted-almonds'],
  },
  ugadi: {
    title: 'Ugadi',
    telugu: 'ఉగాది',
    tagline: 'A Telugu new year, on the right note.',
    eyebrow: 'Telugu new year · 2027',
    body:
      'The first taste of the year sets the tone. Our Ugadi box pairs Bellam Gavvalu, Sajja Burelu, and a small jar of Mango Pickle — six tastes, one new year.',
    date: '2027-03-19T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/08/booster.webp',
    theme: {
      base: '#fbf2dd',
      accent: '#7a5612',
      glow: '#dbb964',
      ink: '#2a1c08',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      { icon: Gift, title: 'For family', body: 'The Ugadi box — sweet, sour, salt, all in one tin.', href: '/category/festival-specials' },
      { icon: Users, title: 'For neighbours', body: 'Mango Pickle + Bellam Sunnundalu — Andhra Ugadi staples.', href: '/category/pickles' },
      { icon: Handshake, title: 'For elders', body: 'Healthy laddus + Karam podi — savoury, sweet, balanced.', href: '/category/healthy-sweets' },
    ],
    productSlugs: ['kaju-katli', 'motichoor-ladoo', 'badam-ki-jali', 'cardamom-soan-papdi'],
  },
  onam: {
    title: 'Onam',
    telugu: 'ഓണം',
    tagline: 'A sadya-sized box for the floor banana leaf.',
    eyebrow: 'Onam · 2027',
    body:
      'Payasam-set kits, flaky Soan Papdi, and Kerala-style banana chips. Sized for the family seated cross-legged, served on the leaf.',
    date: '2027-09-04T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png',
    theme: {
      base: '#f0fae0',
      accent: '#3a7a1c',
      glow: '#9cd058',
      ink: '#0a2a04',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      { icon: Gift, title: 'For family', body: 'Payasam-set kit — vermicelli, jaggery, cardamom, ghee.', href: '/category/sweets' },
      { icon: Users, title: 'For neighbours', body: 'Compact mithai boxes for the apartment block.', href: '/category/sweet-bites' },
      { icon: Handshake, title: 'For elders', body: 'Healthy laddus + dry-fruit chikki — gentle on the palate.', href: '/category/healthy-sweets' },
    ],
    productSlugs: ['cardamom-soan-papdi', 'kaju-katli', 'motichoor-ladoo', 'badam-ki-jali'],
  },
  'ganesh-chaturthi': {
    title: 'Ganesh Chaturthi',
    telugu: 'వినాయక చవితి',
    tagline: 'Modaks the slow way — and everything else for the prasad table.',
    eyebrow: 'Vinayaka Chavithi · 2027',
    body:
      'Steamed modak kits, Bellam Sunnundalu, Bobbatlu — the prasad-tier sweets the elders trust. Boxes sized for the modak count you need.',
    date: '2027-09-15T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png',
    theme: {
      base: '#fff5d4',
      accent: '#a85a08',
      glow: '#f0bd4a',
      ink: '#2a1404',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      { icon: Gift, title: 'For prasad', body: 'Modak boxes in counts of 11, 21, 51 — the auspicious numbers.', href: '/category/sweets' },
      { icon: Users, title: 'For pandals', body: 'Bulk laddu boxes — boondi, motichoor, dry-fruit.', href: '/category/sweets' },
      { icon: Handshake, title: 'For neighbours', body: 'Compact mithai boxes for the apartment-pandal share.', href: '/category/sweet-bites' },
    ],
    productSlugs: ['motichoor-ladoo', 'cardamom-soan-papdi', 'kaju-katli', 'badam-ki-jali'],
  },
  christmas: {
    title: 'Christmas',
    telugu: 'క్రిస్మస్',
    tagline: 'A South Indian table laid for a Christmas Eve.',
    eyebrow: 'Christmas · 2026',
    body:
      'Soft-set kalakand, ghee-rich shortbread biscuits, and our Sweet Bites in twelve flavours — a Christmas Eve box that fits a Telangana table just as well.',
    date: '2026-12-25T00:00:00+05:30',
    heroImage:
      'https://ravisweets.com/wp-content/uploads/2025/08/STRAWBERRY-BITES.webp',
    theme: {
      base: '#fbf0e8',
      accent: '#a8222a',
      glow: '#e58c8a',
      ink: '#2a0a0c',
      grainOpacity: 0.06,
    },
    gifteeFor: [
      { icon: Gift, title: 'For family', body: 'Sweet Bites tin — twelve flavours under one lid.', href: '/category/sweet-bites' },
      { icon: Users, title: 'For your team', body: 'Office Christmas tray — biscuits, mithai, dry-fruits.', href: '/category/combos' },
      { icon: Handshake, title: 'For neighbours', body: 'Kalakand boxes — soft, set, easy to carry door-to-door.', href: '/category/sweets' },
    ],
    productSlugs: ['kaju-katli', 'cardamom-soan-papdi', 'motichoor-ladoo', 'badam-ki-jali'],
  },
};

const SLUGS = Object.keys(FESTIVALS) as FestivalSlug[];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = FESTIVALS[slug as FestivalSlug];
  if (!f) return { title: 'Festival not found' };
  return { title: `${f.title} — ${f.tagline}`, description: f.body };
}

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = FESTIVALS[slug as FestivalSlug];
  if (!f) notFound();

  const curated = f.productSlugs
    .map((s) => SAMPLE_PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      {/* SSR-seed the festival palette */}
      <ThemeVars palette={f.theme} />

      {/* Hero — full-bleed */}
      <section
        className="relative isolate overflow-hidden border-b border-[color:var(--color-border)]"
        style={{ backgroundColor: f.theme.base, color: f.theme.ink }}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <Parallax offset={50} className="h-full w-full">
            <Image
              src={f.heroImage}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover opacity-60"
            />
          </Parallax>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${f.theme.base} 0%, transparent 35%, ${f.theme.base}cc 90%)`,
            }}
          />
          <Grain />
        </div>

        <div className="container-site relative flex flex-col items-start gap-6 py-24 md:py-36">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: f.theme.accent }}>
              <Paisley size="sm" color={f.theme.accent} />
              <span style={{ fontFamily: 'var(--font-indic)' }}>{f.telugu}</span>
              <span aria-hidden="true" className="opacity-60">·</span>
              <span dangerouslySetInnerHTML={{ __html: f.eyebrow }} />
            </p>
          </Reveal>

          <TextKinetic
            as="h1"
            text={`${f.title} — ${f.tagline}`}
            split="word"
            gap={60}
            className="max-w-4xl font-display text-display-lg font-semibold leading-[1.02] md:text-display-xl"
          />

          <Reveal delay={0.2}>
            <p className="max-w-2xl text-lg leading-relaxed opacity-90">{f.body}</p>
          </Reveal>

          <FestivalCountdown target={f.date} accentColor={f.theme.accent} />

          <Reveal delay={0.4}>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#hampers"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: f.theme.accent, color: f.theme.base }}
              >
                See the collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/corporate#enquiry"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors duration-300"
                style={{ borderColor: `${f.theme.ink}40`, color: f.theme.ink }}
              >
                Corporate enquiry
              </Link>
            </div>
          </Reveal>

          <div className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            Dev only
          </div>
        </div>
      </section>

      <PaisleyDivider className="container-site" />

      {/* Gifting by audience */}
      <section aria-labelledby="for-heading" className="container-site py-20">
        <Reveal className="mb-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Who are you gifting?
          </p>
          <h2 id="for-heading" className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg">
            A box for each kind of recipient.
          </h2>
        </Reveal>

        <Stagger gap={80} className="grid gap-5 md:grid-cols-3">
          {f.gifteeFor.map((g) => (
            <Link
              key={g.title}
              href={g.href}
              className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-glow/25 text-theme-accent">
                <g.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-theme-ink">{g.title}</h3>
              <p className="text-sm leading-relaxed text-theme-ink/75">{g.body}</p>
              <div className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold uppercase tracking-wider text-theme-accent transition-transform duration-300 group-hover:translate-x-1">
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      {/* Curated products */}
      <section aria-labelledby="hampers-heading" id="hampers" className="container-site py-20">
        <Reveal className="mb-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            The {f.title} edit
          </p>
          <h2 id="hampers-heading" className="mt-3 font-display text-display-md leading-[1.05] text-theme-ink md:text-display-lg">
            What our kitchen recommends this year.
          </h2>
        </Reveal>

        <Stagger gap={80} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curated.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Stagger>
      </section>

      {/* Bottom CTA */}
      <section className="container-site pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ backgroundColor: f.theme.ink, color: f.theme.base }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-16 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: f.theme.glow }}
            />
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: f.theme.glow }}>
                  Priority list
                </p>
                <h2 className="mt-2 font-display text-display-md md:text-display-lg">
                  Be first in line.
                </h2>
                <p className="mt-2 text-sm opacity-85 md:text-base">
                  The {f.title} collection opens to our priority list before anyone else. Leave
                  your email and we&rsquo;ll ping you when it&rsquo;s live.
                </p>
              </div>
              <Link
                href="/corporate#enquiry"
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: f.theme.glow, color: f.theme.ink }}
              >
                Join the list
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
