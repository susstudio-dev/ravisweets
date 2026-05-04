import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Parallax } from '@/components/motion/parallax';
import { Grain } from '@/components/brand/grain';

export const metadata: Metadata = {
  title: 'Visit us · Sweet shop in Khammam & Hyderabad',
  description:
    'Best sweet shop in Khammam since 1985. Visit our two Khammam stores or our Hyderabad (Kondapur) branch. Authentic Telangana sweets, Hyderabadi specials, namkeens, and gift hampers. Same-day fresh, FSSAI certified.',
  keywords: [
    'sweet shop Khammam',
    'best sweets Khammam',
    'sweet shop near me Khammam',
    'mithai Khammam',
    'Ravi Sweets Khammam',
    'sweet shop Kondapur',
    'sweet shop Hyderabad',
    'Telangana sweets',
    'Hyderabadi sweets online',
    'Andhra sweets online',
  ],
  alternates: {
    canonical: '/stores',
  },
  openGraph: {
    title: 'Ravi Sweets · Khammam since 1985 + Hyderabad branch',
    description:
      'Two Khammam stores plus a Kondapur (Hyderabad) branch. Authentic Telangana sweets, fresh daily, FSSAI certified.',
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
    tagline: 'Where it began — same kitchen since 1985.',
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
    since: 1985,
  },
  {
    name: 'Ravi Sweets · Khammam (Second branch)',
    tagline: 'Our second Khammam counter — same recipes, closer to you.',
    // NOTE: address pending confirmation from owner — share Google Maps link
    // returned empty when WebFetched; placeholder until you update with the
    // exact street address.
    address: 'Khammam — second branch (address to be confirmed)',
    city: 'Khammam',
    state: 'Telangana',
    pincode: '507001',
    hours: [
      { days: 'Mon — Sat', time: '9:30 am — 9:30 pm' },
      { days: 'Sunday', time: '10:00 am — 9:00 pm' },
    ],
    phone: '+91 93988 59978',
    mapsQuery: 'Ravi+Sweets+Khammam',
  },
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
      '@id': 'https://susstudio-dev.github.io/ravisweets/#brand',
      name: 'Ravi Sweets',
      alternateName: ['Ravi Sweets Khammam', 'Ravi Sweets Hyderabad'],
      url: 'https://susstudio-dev.github.io/ravisweets/',
      telephone: '+91-93988-59978',
      email: 'ravisweetshyd@gmail.com',
      foundingDate: '1985',
      sameAs: [
        'https://ravisweets.com',
        'https://ravisweets.in',
        'https://instagram.com/ravi__sweets',
      ],
      areaServed: { '@type': 'Country', name: 'India' },
    },
    {
      '@type': 'BakeryShop',
      '@id': 'https://susstudio-dev.github.io/ravisweets/stores#khammam-flagship',
      name: 'Ravi Sweets — Khammam Flagship',
      url: 'https://susstudio-dev.github.io/ravisweets/stores',
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
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:30', closes: '21:30' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '10:00', closes: '21:00' },
      ],
      priceRange: '₹₹',
    },
    {
      '@type': 'BakeryShop',
      '@id': 'https://susstudio-dev.github.io/ravisweets/stores#kondapur',
      name: 'Ravi Sweets — Kondapur (Hyderabad)',
      url: 'https://susstudio-dev.github.io/ravisweets/stores',
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
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:00', closes: '20:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '08:00', closes: '18:00' },
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
    href: 'https://instagram.com/ravi__sweets',
    note: 'Kitchen stories and seasonal runs',
  },
];

const STORE_IMAGE =
  'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png';
const STORE_BACKDROP =
  'radial-gradient(ellipse at 35% 35%, color-mix(in oklab, var(--theme-glow) 65%, var(--theme-base)) 0%, color-mix(in oklab, var(--theme-glow) 28%, var(--theme-base)) 50%, var(--theme-base) 90%)';

export default function StoresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
      />
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-[color:var(--color-border)]"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, color-mix(in oklab, var(--theme-glow) 30%, transparent) 0%, transparent 65%), var(--theme-base)',
        }}
      >
        <div className="container-site grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
          <div>
            <Reveal>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                Visit us
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-4 font-display text-display-lg font-semibold leading-[1.02] text-theme-ink md:text-display-xl">
                Come taste what we mean.
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-theme-ink/75">
                Three counters, one kitchen. The original Khammam shop has been near
                Mamillagudem since 1985, with a second Khammam branch nearby. The Hyderabad
                branch sits in Kondapur, stocked from the same kitchen each morning. Walk in,
                or call ahead to reserve a seasonal hamper.
              </p>
            </Reveal>
          </div>
          <Parallax offset={30}>
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[2rem] p-12 shadow-lifted ring-1 ring-[color:var(--color-border)]"
              style={{ background: STORE_BACKDROP }}
            >
              <Image
                src={STORE_IMAGE}
                alt="Hand-packed Diwali hamper assortment from the Khammam kitchen"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 460px, 90vw"
                className="object-contain drop-shadow-[0_30px_40px_rgba(60,30,5,0.22)]"
              />
              <Grain />
              <div className="pointer-events-none absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
                Khammam · Telangana · Since 1985
              </div>
            </div>
          </Parallax>
        </div>
      </section>

      <PaisleyDivider className="container-site" />

      {/* Stores */}
      <section aria-labelledby="stores-heading" className="container-site py-16">
        <Reveal className="mb-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Where to find us
          </p>
          <h2 id="stores-heading" className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg">
            Three counters, one kitchen.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-6">
        {STORES.map((s) => (
          <Reveal key={s.name}>
            <article className="grid gap-8 rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft md:grid-cols-[1fr_1.2fr] md:gap-12 md:p-10">
              <div>
                <h3 className="font-display text-2xl font-semibold text-theme-ink md:text-3xl">
                  {s.name}
                </h3>
                <p className="mt-2 text-sm italic text-theme-ink/65">{s.tagline}</p>
                {s.since && (
                  <p className="mt-2 inline-block rounded-full border border-theme-accent/30 bg-theme-glow/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                    Since {s.since}
                  </p>
                )}
                <dl className="mt-6 flex flex-col gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Address</dt>
                      <dd className="text-theme-ink/85">
                        {s.address}
                        <br />
                        {s.city}, {s.state} {s.pincode}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Hours</dt>
                      <dd>
                        <ul className="space-y-1 text-theme-ink/85">
                          {s.hours.map((h) => (
                            <li key={h.days} className="flex gap-4">
                              <span className="w-24 text-theme-ink/60">{h.days}</span>
                              <span>{h.time}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Phone</dt>
                      <dd>
                        <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="text-theme-ink/85 hover:text-theme-accent">
                          {s.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${s.mapsQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
                  >
                    Open in Maps
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  <a
                    href={`tel:${s.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-5 py-2.5 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-accent hover:text-theme-accent"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call the shop
                  </a>
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--theme-glow)]/10"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, color-mix(in oklab, var(--theme-accent) 20%, transparent) 0 2px, transparent 2px 18px), repeating-linear-gradient(-45deg, color-mix(in oklab, var(--theme-accent) 20%, transparent) 0 2px, transparent 2px 22px)',
                  }}
                />
                <MapPin className="relative h-10 w-10 text-theme-accent" />
                <p className="relative mt-2 font-display text-lg font-semibold text-theme-ink">
                  {s.city}
                </p>
                <p className="relative text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
                  Interactive map coming soon
                </p>
              </div>
            </article>
          </Reveal>
        ))}
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact-heading" className="container-site py-16">
        <Reveal className="mb-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Reach out
          </p>
          <h2 id="contact-heading" className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg">
            Four ways to get in touch.
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT.map((c) => (
            <Reveal key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-glow/25 text-theme-accent">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  {c.label}
                </p>
                <p className="font-display text-base font-semibold text-theme-ink">{c.value}</p>
                <p className="text-xs text-theme-ink/60">{c.note}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container-site pb-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-8 md:flex-row md:items-center md:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                Before you visit
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-theme-ink md:text-3xl">
                Seasonal items sell fast.
              </h2>
              <p className="mt-2 max-w-lg text-sm text-theme-ink/70">
                Around Diwali, Raksha Bandhan, and Eid we recommend reserving a hamper ahead. A
                quick WhatsApp message does it.
              </p>
            </div>
            <a
              href="https://wa.me/919398859978"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Reserve via WhatsApp
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
