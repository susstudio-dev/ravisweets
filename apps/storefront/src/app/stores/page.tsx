import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SlotImage } from '@/components/media/slot-image';
import { Reveal } from '@/components/motion/reveal';
import { jsonLdHtml } from '@/lib/seo/json-ld';
import { pendingPhoto } from '@/lib/images';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravisweets.com';

/*
 * THIS is the page that carries local intent now.
 *
 * The homepage title moved off "Best Sweet Shop in Khammam" to national and
 * diaspora commerce intent; local search lands here instead, on the page that
 * can actually answer it — addresses, hours, and the LocalBusiness @graph
 * below. Locality is not weakened by the repositioning, it is relocated to
 * where it converts.
 *
 * `keywords` deleted for the same reason as in layout.tsx: no ranking value
 * since 2009.
 */
export const metadata: Metadata = {
  // The root layout appends "| Ravi Sweets", so the brand is not repeated here.
  title: 'Sweet Shop in Khammam & Hyderabad (Kondapur)',
  // Was 181 characters. The locality terms that carry the local-pack intent —
  // Khammam, Kondapur, Hyderabad — all survive inside the 155-char cut.
  description:
    'Visit Ravi Sweets — two counters in Khammam and one in Kondapur, Hyderabad. Telangana sweets and namkeens, made fresh daily since 1983.',
  alternates: {
    canonical: '/stores',
  },
  openGraph: {
    title: 'Ravi Sweets · Khammam since 1983 + Hyderabad branch',
    description:
      'Two Khammam stores plus a Kondapur (Hyderabad) branch. Authentic Telangana sweets, fresh daily since 1983.',
    locale: 'en_IN',
  },
};

interface Store {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  hours: { days: string; time: string }[];
  phone: string;
  mapsQuery: string;
  since?: number;
}

const STORES: Store[] = [
  {
    name: 'Ravi Sweets · Khammam Flagship',
    tagline: 'Where it began — same kitchen since 1983.',
    address: 'Door No 10-1-25, Near Mamillagudem, Beside Over Bridge',
    city: 'Khammam',
    state: 'Telangana',
    pincode: '507001',
    hours: [
      { days: 'Mon — Sat', time: '9:30 am — 9:30 pm' },
      { days: 'Sunday', time: '10:00 am — 9:00 pm' },
    ],
    phone: '+91 93988 59978',
    mapsQuery: 'Ravi+Sweets+Mamillagudem+Khammam',
    since: 1983,
  },
  /*
   * TODO(owner): second Khammam branch. The exact street address is still
   * unconfirmed (the shared Google Maps link returned empty when WebFetched),
   * and a customer-facing location docket must not read "address to be
   * confirmed" — so the entry is commented out rather than shown as a
   * placeholder. Reinstate once the street address lands.
   */
  // {
  //   name: 'Ravi Sweets · Khammam (Second branch)',
  //   tagline: 'Our second Khammam counter — same recipes, closer to you.',
  //   address: 'Khammam — second branch (address to be confirmed)',
  //   city: 'Khammam',
  //   state: 'Telangana',
  //   pincode: '507001',
  //   hours: [
  //     { days: 'Mon — Sat', time: '9:30 am — 9:30 pm' },
  //     { days: 'Sunday', time: '10:00 am — 9:00 pm' },
  //   ],
  //   phone: '+91 93988 59978',
  //   mapsQuery: 'Ravi+Sweets+Khammam',
  // },
  {
    name: 'Ravi Sweets · Kondapur',
    tagline: 'Our Hyderabad branch — closer to the city, same recipes.',
    address: 'Kondapur, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    hours: [
      { days: 'Mon — Sat', time: '7:00 am — 8:00 pm' },
      { days: 'Sunday', time: '8:00 am — 6:00 pm' },
    ],
    phone: '+91 93988 59978',
    mapsQuery: 'Ravi+Sweets+Kondapur+Hyderabad',
  },
];

/**
 * Schema.org LocalBusiness JSON-LD with three branches. This is the single
 * biggest lever for ranking on "sweet shop in Khammam" / "best sweets near
 * me" — Google reads this and surfaces the result in the local-pack /
 * Maps panel for branded + category queries within Khammam and Hyderabad.
 */
const LOCAL_BUSINESS_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BakeryShop',
      '@id': `${SITE_URL}/#brand`,
      name: 'Ravi Sweets',
      alternateName: ['Ravi Sweets Khammam', 'Ravi Sweets Hyderabad'],
      url: `${SITE_URL}/`,
      telephone: '+91-93988-59978',
      email: 'ravisweetshyd@gmail.com',
      foundingDate: '1983',
      sameAs: [
        'https://ravisweets.com',
        'https://ravisweets.in',
        'https://www.instagram.com/ravi__sweets/',
      ],
      areaServed: { '@type': 'Country', name: 'India' },
    },
    {
      '@type': 'BakeryShop',
      '@id': `${SITE_URL}/stores#khammam-flagship`,
      name: 'Ravi Sweets — Khammam Flagship',
      url: `${SITE_URL}/stores`,
      telephone: '+91-93988-59978',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Door No 10-1-25, Near Mamillagudem, Beside Over Bridge',
        addressLocality: 'Khammam',
        addressRegion: 'Telangana',
        postalCode: '507001',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:30',
          closes: '21:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '10:00',
          closes: '21:00',
        },
      ],
      priceRange: '₹₹',
    },
    {
      '@type': 'BakeryShop',
      '@id': `${SITE_URL}/stores#kondapur`,
      name: 'Ravi Sweets — Kondapur (Hyderabad)',
      url: `${SITE_URL}/stores`,
      telephone: '+91-93988-59978',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kondapur',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        postalCode: '500084',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '07:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '08:00',
          closes: '18:00',
        },
      ],
      priceRange: '₹₹',
    },
  ],
};

const CONTACT = [
  {
    icon: Phone,
    label: 'Call',
    value: '+91 93988 59978',
    href: 'tel:+919398859978',
    note: 'Mon – Sat · 9 am – 9 pm IST',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 93988 59978',
    href: 'https://wa.me/919398859978',
    note: 'Fastest way to reach us',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'ravisweetshyd@gmail.com',
    href: 'mailto:ravisweetshyd@gmail.com',
    note: 'Replies within a business day',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@ravi__sweets',
    href: 'https://www.instagram.com/ravi__sweets/',
    note: 'Kitchen stories and seasonal runs',
  },
];

/*
 * The FALLBACK for the owner-editable shop-front slot (SlotImage): the
 * admin-assigned photo renders first, then this catalogue URL — which still
 * points at the retired WordPress host, so SlotImage's render-time gate
 * (lib/images.ts) drops it to the dashed specimen plate without ever issuing
 * a request or a preload. When the shoot lands and the URL goes
 * root-relative, the photograph returns with no component change.
 */
const STORE_IMAGE =
  pendingPhoto('2025/09/dry_fruit_chikki-removebg-preview.png');

export default function StoresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(LOCAL_BUSINESS_JSONLD) }}
      />
      {/* Hero — the kitchen's own location sheet, not a lookbook spread. */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="container-site section-y grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <Reveal>
              <h1 className="font-display text-display-lg text-theme-ink md:text-display-xl leading-[1.02]">
                Come taste what we mean.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-theme-ink/75 mt-6 max-w-xl text-lg leading-relaxed">
                Three counters, one kitchen. The original Khammam shop has been near Mamillagudem
                since 1983, with a second Khammam branch nearby. The Hyderabad branch sits in
                Kondapur, stocked from the same kitchen each morning. Walk in, or call ahead to
                reserve a seasonal hamper.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="docket overflow-hidden">
              <SlotImage
                slot="stores.storefront"
                fallbackUrl={STORE_IMAGE}
                fallbackAlt="Hand-packed Diwali hamper assortment from the Khammam kitchen"
                sizes="(min-width: 768px) 460px, 90vw"
                objectFit="contain"
                className="bg-theme-glow/20 aspect-[4/3] border-b border-[color:var(--color-border)]"
              />
              <dl className="p-5">
                <div className="field-row">
                  <dt className="field-label">Kitchen</dt>
                  <dd className="field-value text-theme-ink text-sm">KHAMMAM · TELANGANA</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Est.</dt>
                  <dd className="field-value text-theme-ink text-sm font-bold">1983</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Counters</dt>
                  <dd className="field-value text-theme-ink text-sm">3</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stores — each counter as a location docket. */}
      <section aria-labelledby="stores-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2
              id="stores-heading"
              className="font-display text-display-md text-theme-ink"
            >
              Three counters, one kitchen.
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          {STORES.map((s) => (
            <Reveal key={s.name}>
              <article className="docket grid gap-8 p-5 md:grid-cols-[1fr_1.2fr] md:gap-12 md:p-7">
                <div>
                  <div className="docket-head">
                    <div>
                      <h3 className="font-display text-heading text-theme-ink">{s.name}</h3>
                      <p className="text-text-muted mt-1 text-sm">{s.tagline}</p>
                    </div>
                    {s.since && (
                      <p className="flex items-baseline gap-2">
                        <span className="field-label">Est.</span>
                        <span className="field-value text-theme-ink text-sm font-bold">
                          {s.since}
                        </span>
                      </p>
                    )}
                  </div>
                  <dl>
                    <div className="field-row">
                      <dt className="field-label">Address</dt>
                      <dd className="field-value text-theme-ink max-w-[32ch] text-right text-sm">
                        {s.address}
                        <br />
                        {s.city}, {s.state} {s.pincode}
                      </dd>
                    </div>
                    {s.hours.map((h) => (
                      <div key={h.days} className="field-row">
                        <dt className="field-label">{h.days}</dt>
                        <dd className="field-value text-theme-ink text-sm">{h.time}</dd>
                      </div>
                    ))}
                    <div className="field-row">
                      <dt className="field-label">Phone</dt>
                      <dd className="field-value text-sm">
                        <a
                          href={`tel:${s.phone.replace(/\s/g, '')}`}
                          className="text-theme-ink hover:text-theme-accent transition-colors"
                        >
                          {s.phone}
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${s.mapsQuery}`}
                      target="_blank"
                      rel="noreferrer"
                      className="stamp stamp--ghost"
                    >
                      Get directions
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a
                      href={`tel:${s.phone.replace(/\s/g, '')}`}
                      className="text-theme-ink hover:text-theme-accent inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium underline underline-offset-4 transition-colors"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Call the shop
                    </a>
                  </div>
                </div>

                {/* Map placeholder — an empty grid square on the sheet, not a live embed yet. */}
                <div
                  className="bg-theme-glow/10 relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[color:var(--color-border)]"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, color-mix(in oklab, var(--theme-accent) 20%, transparent) 0 2px, transparent 2px 18px), repeating-linear-gradient(-45deg, color-mix(in oklab, var(--theme-accent) 20%, transparent) 0 2px, transparent 2px 22px)',
                    }}
                  />
                  <MapPin className="text-theme-accent relative h-10 w-10" />
                  <p className="font-display text-theme-ink relative mt-2 text-lg">{s.city}</p>
                  <p className="text-text-muted relative mt-1 text-xs">
                    Interactive map coming soon
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2
              id="contact-heading"
              className="font-display text-display-md text-theme-ink"
            >
              Four ways to get in touch.
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT.map((c) => (
            <Reveal key={c.label} className="h-full">
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                className="docket flex h-full flex-col gap-3 p-5 transition-shadow duration-200 hover:shadow-lifted"
              >
                {/* Manila is a ground for ink — the glyph stays ink, never accent. */}
                <div className="bg-theme-glow/25 text-theme-ink flex h-10 w-10 items-center justify-center rounded-md">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="field-label">{c.label}</p>
                <p className="field-value text-theme-ink text-sm">{c.value}</p>
                <p className="text-text-muted text-xs">{c.note}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container-site section-y-tight">
        <Reveal>
          <div className="docket flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center md:p-8">
            <div>
              <h2 className="font-display text-display-md text-theme-ink">
                Seasonal items sell fast.
              </h2>
              <p className="text-theme-ink/70 mt-2 max-w-lg text-sm">
                Around Diwali, Raksha Bandhan, and Eid we recommend reserving a hamper ahead. A
                quick WhatsApp message does it.
              </p>
            </div>
            <a
              href="https://wa.me/919398859978"
              target="_blank"
              rel="noreferrer"
              className="stamp shrink-0"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Reserve via WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
