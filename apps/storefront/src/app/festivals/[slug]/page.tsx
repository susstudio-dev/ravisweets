import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Gift, Handshake, Users } from 'lucide-react';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { SlotImage } from '@/components/media/slot-image';
import { ProductCard } from '@/components/product-card';
import { FlavourScope } from '@/lib/theme/theme-provider';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { pendingPhoto } from '@/lib/images';
import { seoDescription, shortenTitle } from '@/lib/seo/metadata';
import {
  HamperARPreview,
  SAMPLE_HAMPER_GLB,
  SAMPLE_HAMPER_USDZ,
} from '@/components/ar/hamper-ar-preview';

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
    body: 'Six hampers, three price bands, logo-ready for corporate runs. Priority list opens to earlier customers and corporate accounts first.',
    date: '2026-11-08T00:00:00+05:30',
    heroImage:
      pendingPhoto('2025/09/dry_fruit_chikki-removebg-preview.png'),
    // 2026-05-06: festival palettes retuned to harmonise with the site-wide
    // Rose & Cream direction. Bases stay in a continuous cream family so the
    // header / megamenu don't feel like a different website per festival.
    // Accents vary per festival to keep each page visually distinct.
    theme: {
      base: '#fbf2e0',
      accent: '#b8312c',
      glow: '#f0b865',
      ink: '#26121a',
      grainOpacity: 0.06,
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
    productSlugs: ['diwali-premium-hamper', 'kaju-katli', 'qubani-ka-meetha', 'badam-ki-jali'],
  },
  'raksha-bandhan': {
    title: 'Raksha Bandhan',
    telugu: 'రక్షా బంధన్',
    tagline: 'For the ones who remember the small promises.',
    eyebrow: 'Brothers & sisters · 2026',
    body: 'A hamper tied with a thread — the traditional signifier, done properly. Compact boxes for courier and weighted boxes for hand-delivery.',
    date: '2026-08-28T00:00:00+05:30',
    heroImage: pendingPhoto('2025/09/kaju_katli-removebg-preview.png'),
    theme: {
      base: '#f9eee2',
      accent: '#b54766',
      glow: '#e8b08a',
      ink: '#2a141e',
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
    body: 'The Deccan table shines brightest here. Double ka Meetha, Qubani, Badam ki Jali — Hyderabadi classics, plated the slow way.',
    date: '2026-03-30T00:00:00+05:30',
    heroImage:
      pendingPhoto('2025/09/badam_pista_kalakand-removebg-preview.png'),
    theme: {
      base: '#f1f4e3',
      accent: '#5b7a3c',
      glow: '#dbc56a',
      ink: '#1a2615',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'The full Hyderabadi spread in a single box — hand-shipped across India.',
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
    body: 'Gujiya-style boxes, jaggery-led laddus, and cooling mithai for the post-rang plate. Colour-coded gift sleeves so the box is a celebration before the lid even opens.',
    date: '2027-03-13T00:00:00+05:30',
    heroImage:
      pendingPhoto('2025/09/badam_pista_kalakand-removebg-preview.png'),
    theme: {
      base: '#fbeaef',
      accent: '#c83a6a',
      glow: '#e8b1c7',
      ink: '#2a0e1c',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For neighbours',
        body: 'Compact share-boxes — one per family, ten per society.',
        href: '/category/sweet-bites',
      },
      {
        icon: Users,
        title: 'For your team',
        body: 'Office-tray savouries that survive the gulal.',
        href: '/category/savouries',
      },
      {
        icon: Handshake,
        title: 'For elders',
        body: 'Sugar-light healthy laddus with millet and gondh.',
        href: '/category/healthy-sweets',
      },
    ],
    productSlugs: ['kaju-katli', 'motichoor-ladoo', 'cardamom-soan-papdi', 'badam-ki-jali'],
  },
  pongal: {
    title: 'Pongal',
    telugu: 'పొంగల్',
    tagline: 'The clay pot, the harvest, the first morning.',
    eyebrow: 'Harvest festival · 2027',
    body: 'Our Pongal Pot Set arrives with a hand-thrown clay pot, a sealed sachet of jaggery-rice-moong-ghee mix, and a sprig of dried banana leaf. Boil milk, tip it in — Pongal in fifteen minutes.',
    date: '2027-01-15T00:00:00+05:30',
    heroImage: pendingPhoto('2025/08/booster.webp'),
    theme: {
      base: '#f6efd8',
      accent: '#a06a18',
      glow: '#dab36c',
      ink: '#241a08',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For your family',
        body: 'The Pongal Pot Set — clay pot kept as a keepsake.',
        href: '/product/pongal-pot-set',
      },
      {
        icon: Users,
        title: 'For your team',
        body: 'Office Pongal trays with sweet & savoury Pongal.',
        href: '/category/combos',
      },
      {
        icon: Handshake,
        title: 'For elders',
        body: 'Nuvvula laddu and millet laddu, sweetened with jaggery.',
        href: '/category/healthy-sweets',
      },
    ],
    productSlugs: ['pongal-pot-set', 'motichoor-ladoo', 'cardamom-soan-papdi', 'kaju-katli'],
  },
  sankranti: {
    title: 'Sankranti',
    telugu: 'సంక్రాంతి',
    tagline: 'Til, gud, and a new year on the kitchen door.',
    eyebrow: 'Makar Sankranti · 2027',
    body: 'Sesame-and-jaggery laddus pressed by hand, plus the Telugu Sankranti spread — Ariselu, Bobbatlu, Sajja Burelu. Fly the kite, share the box.',
    date: '2027-01-14T00:00:00+05:30',
    heroImage: pendingPhoto('2025/08/11-2-400x400.jpg'),
    theme: {
      base: '#fbf0d8',
      accent: '#a85a14',
      glow: '#e8b94c',
      ink: '#26160a',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'Nuvvula laddu — the Sankranti laddu, til and jaggery.',
        href: '/product/nuvvula-laddu',
      },
      {
        icon: Users,
        title: 'For neighbours',
        body: 'Boxes of Bellam Sunnundalu and ariselu — share-sized.',
        href: '/category/sweets',
      },
      {
        icon: Handshake,
        title: 'For elders',
        body: 'Bone-strengthening sesame laddus, no refined sugar.',
        href: '/category/healthy-sweets',
      },
    ],
    productSlugs: ['cardamom-soan-papdi', 'motichoor-ladoo', 'kaju-katli', 'roasted-almonds'],
  },
  ugadi: {
    title: 'Ugadi',
    telugu: 'ఉగాది',
    tagline: 'A Telugu new year, on the right note.',
    eyebrow: 'Telugu new year · 2027',
    body: 'The first taste of the year sets the tone. Our Ugadi box pairs Bellam Gavvalu, Sajja Burelu, and a small jar of Mango Pickle — six tastes, one new year.',
    date: '2027-03-19T00:00:00+05:30',
    heroImage: pendingPhoto('2025/08/booster.webp'),
    theme: {
      base: '#f3efde',
      accent: '#76682c',
      glow: '#c4c47e',
      ink: '#1e1c0a',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'The Ugadi box — sweet, sour, salt, all in one tin.',
        href: '/category/festival-specials',
      },
      {
        icon: Users,
        title: 'For neighbours',
        body: 'Mango Pickle + Bellam Sunnundalu — Andhra Ugadi staples.',
        href: '/category/pickles',
      },
      {
        icon: Handshake,
        title: 'For elders',
        body: 'Healthy laddus + Karam podi — savoury, sweet, balanced.',
        href: '/category/healthy-sweets',
      },
    ],
    productSlugs: ['kaju-katli', 'motichoor-ladoo', 'badam-ki-jali', 'cardamom-soan-papdi'],
  },
  onam: {
    title: 'Onam',
    telugu: 'ഓണം',
    tagline: 'A sadya-sized box for the floor banana leaf.',
    eyebrow: 'Onam · 2027',
    body: 'Payasam-set kits, flaky Soan Papdi, and Kerala-style banana chips. Sized for the family seated cross-legged, served on the leaf.',
    date: '2027-09-04T00:00:00+05:30',
    heroImage:
      pendingPhoto('2025/09/badam_pista_kalakand-removebg-preview.png'),
    theme: {
      base: '#eef4dd',
      accent: '#3a7a3c',
      glow: '#a8c878',
      ink: '#0e2410',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'Payasam-set kit — vermicelli, jaggery, cardamom, ghee.',
        href: '/category/sweets',
      },
      {
        icon: Users,
        title: 'For neighbours',
        body: 'Compact mithai boxes for the apartment block.',
        href: '/category/sweet-bites',
      },
      {
        icon: Handshake,
        title: 'For elders',
        body: 'Healthy laddus + dry-fruit chikki — gentle on the palate.',
        href: '/category/healthy-sweets',
      },
    ],
    productSlugs: ['cardamom-soan-papdi', 'kaju-katli', 'motichoor-ladoo', 'badam-ki-jali'],
  },
  'ganesh-chaturthi': {
    title: 'Ganesh Chaturthi',
    telugu: 'వినాయక చవితి',
    tagline: 'Modaks the slow way — and everything else for the prasad table.',
    eyebrow: 'Vinayaka Chavithi · 2027',
    body: 'Steamed modak kits, Bellam Sunnundalu, Bobbatlu — the prasad-tier sweets the elders trust. Boxes sized for the modak count you need.',
    date: '2027-09-15T00:00:00+05:30',
    heroImage:
      pendingPhoto('2025/09/boondi_laddu-removebg-preview.png'),
    theme: {
      base: '#fbf0d6',
      accent: '#a85a08',
      glow: '#f0bd4a',
      ink: '#28150a',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For prasad',
        body: 'Modak boxes in counts of 11, 21, 51 — the auspicious numbers.',
        href: '/category/sweets',
      },
      {
        icon: Users,
        title: 'For pandals',
        body: 'Bulk laddu boxes — boondi, motichoor, dry-fruit.',
        href: '/category/sweets',
      },
      {
        icon: Handshake,
        title: 'For neighbours',
        body: 'Compact mithai boxes for the apartment-pandal share.',
        href: '/category/sweet-bites',
      },
    ],
    productSlugs: ['motichoor-ladoo', 'cardamom-soan-papdi', 'kaju-katli', 'badam-ki-jali'],
  },
  christmas: {
    title: 'Christmas',
    telugu: 'క్రిస్మస్',
    tagline: 'A South Indian table laid for a Christmas Eve.',
    eyebrow: 'Christmas · 2026',
    body: 'Soft-set kalakand, ghee-rich shortbread biscuits, and our Sweet Bites in twelve flavours — a Christmas Eve box that fits a Telangana table just as well.',
    date: '2026-12-25T00:00:00+05:30',
    heroImage: pendingPhoto('2025/08/STRAWBERRY-BITES.webp'),
    theme: {
      base: '#fbeae6',
      accent: '#9c2a3a',
      glow: '#e0a0a8',
      ink: '#280c10',
      grainOpacity: 0.05,
    },
    gifteeFor: [
      {
        icon: Gift,
        title: 'For family',
        body: 'Sweet Bites tin — twelve flavours under one lid.',
        href: '/category/sweet-bites',
      },
      {
        icon: Users,
        title: 'For your team',
        body: 'Office Christmas tray — biscuits, mithai, dry-fruits.',
        href: '/category/combos',
      },
      {
        icon: Handshake,
        title: 'For neighbours',
        body: 'Kalakand boxes — soft, set, easy to carry door-to-door.',
        href: '/category/sweets',
      },
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

  /*
   * `${title} — ${tagline}` ran to 96 characters before the layout appended
   * `| Ravi Sweets`, and every festival page was over Google's 60-character
   * and 561-pixel limits — the whole of that finding in the crawl. The
   * taglines are good editorial lines but they were written for the page, not
   * for a SERP. `shortenTitle` keeps the festival name whole and spends
   * whatever budget is left on the tagline, cut at a word boundary.
   */
  const title = shortenTitle(`${f.title} Sweets`, f.tagline);
  const description = seoDescription(
    f.body,
    'Made fresh and dispatched from our Khammam kitchen.',
    'Delivered across India.',
  );

  return {
    title,
    description,
    alternates: { canonical: `/festivals/${slug}` },
    openGraph: { type: 'website', title, description, url: `/festivals/${slug}` },
  };
}

/** Dispatch needs three clear days before the festival for the fresh range. */
const ORDER_BY_LEAD_DAYS = 3;

/*
 * Date maths pinned to the ISO day and formatted in UTC, so the static export
 * renders the same sheet regardless of the build machine's timezone. Festival
 * dates themselves are untouched.
 */
function orderByDay(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ORDER_BY_LEAD_DAYS);
  return d.toISOString().slice(0, 10);
}

function formatSheetDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`)
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = FESTIVALS[slug as FestivalSlug];
  if (!f) notFound();

  const curated = f.productSlugs
    .map((s) => SAMPLE_PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <FlavourScope palette={f.theme}>
      {/* SSR-seed the festival palette */}

      {/* ── THE DISPATCH SHEET ────────────────────────────────────────────
          The festival as the kitchen records it: the name, the script, and
          the two dates that matter. The retired gradient hero, its decor
          layer and the ticking countdown are replaced by the sheet itself —
          ORDER BY is the festival date minus three clear dispatch days. */}
      <section className="container-site section-y">
        <Reveal>
          <article className="docket overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            <div className="flex flex-col items-start gap-5 p-5 md:p-7">
              <p className="font-indic text-theme-accent text-2xl leading-none">{f.telugu}</p>

              <h1 className="font-display text-display-lg text-theme-ink max-w-2xl">
                {f.title} — {f.tagline}
              </h1>

              <dl className="w-full max-w-sm">
                <div className="field-row">
                  <dt className="field-label">Edition</dt>
                  <dd className="field-value text-sm">{f.eyebrow}</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Festival</dt>
                  <dd className="field-value text-sm">{formatSheetDate(f.date)}</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Order by</dt>
                  <dd className="field-value text-sm font-bold">
                    {formatSheetDate(orderByDay(f.date))}
                  </dd>
                </div>
              </dl>

              <p className="text-theme-ink/80 max-w-2xl leading-relaxed">{f.body}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="#hampers" className="stamp">
                  See the collection
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/corporate#enquiry" className="stamp stamp--ghost">
                  Corporate enquiry
                </Link>
                <HamperARPreview
                  glb={SAMPLE_HAMPER_GLB}
                  usdz={SAMPLE_HAMPER_USDZ}
                  caption={`${f.title} hamper`}
                  bg={f.theme.base}
                />
              </div>
            </div>

            {/* THE PLATE. A flavour-wash slot, owner-editable from
                /admin/photos; the catalogue URL is the fallback, and when it
                is dead the dashed specimen mark renders instead and no
                request or preload is ever emitted. The glow wash comes from
                the FlavourScope vars, so bg-theme-glow/20 matches the old
                inline `glow + 33` alpha. */}
            <SlotImage
              slot={`festivals.${slug}`}
              fallbackUrl={f.heroImage}
              fallbackAlt={`${f.title} box`}
              sizes="(min-width: 768px) 420px, 100vw"
              objectFit="contain"
              className="bg-theme-glow/20 min-h-[240px] border-t border-[color:var(--color-border)] md:border-l md:border-t-0"
            />
          </article>
        </Reveal>
      </section>

      {/* Gifting by audience — docket cells, not lifted cards. */}
      <section aria-labelledby="for-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="for-heading" className="font-display text-display-md">
              {/* Named per festival — 10 pages shared this <h2> verbatim. */}
              A {f.title} box for each kind of recipient.
            </h2>
          </div>
        </Reveal>

        <Stagger gap={80} className="grid gap-4 md:grid-cols-3">
          {f.gifteeFor.map((g) => (
            <Link
              key={g.title}
              href={g.href}
              className="docket group flex h-full flex-col gap-3 p-5 transition-shadow duration-200 hover:shadow-lifted"
            >
              <div className="flex items-center gap-2.5">
                <g.icon className="text-theme-accent h-4 w-4 shrink-0" aria-hidden="true" />
                <h3 className="font-display text-theme-ink text-lg leading-tight">{g.title}</h3>
              </div>
              <p className="text-theme-ink/75 text-sm leading-relaxed">{g.body}</p>
              <span className="text-theme-accent group-hover:text-theme-ink mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium transition-colors">
                Explore
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </Stagger>
      </section>

      {/* Curated products — the grid itself is untouched. */}
      <section aria-labelledby="hampers-heading" id="hampers" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="hampers-heading" className="font-display text-display-md">
              What our kitchen recommends for {f.title}.
            </h2>
          </div>
        </Reveal>

        <Stagger gap={80} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curated.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Stagger>
      </section>

      {/* Bottom CTA — the carbon register band, not an inline-ink slab. */}
      <section className="container-site section-y">
        <Reveal>
          <div data-register="carbon" className="bg-theme-base text-theme-ink p-7 md:p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md">Be first in line for {f.title}.</h2>
                <p className="text-text-muted mt-3 text-sm leading-relaxed md:text-base">
                  The {f.title} collection opens to our priority list before anyone else. Leave
                  your email and we&rsquo;ll ping you when it&rsquo;s live.
                </p>
              </div>
              <Link href="/corporate#enquiry" className="stamp shrink-0">
                Join the list
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </FlavourScope>
  );
}
