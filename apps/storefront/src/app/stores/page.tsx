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
  title: 'Visit us',
  description: 'Our Khammam flagship store, plus how to reach us by phone, email, or WhatsApp.',
};

interface Store {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  hours: { days: string; time: string }[];
  phone: string;
  mapsQuery: string;
}

const STORES: Store[] = [
  {
    name: 'Ravi Sweets · Flagship',
    address: 'Wyra Road, opp. Bus Station',
    city: 'Khammam',
    state: 'Telangana',
    pincode: '507001',
    hours: [
      { days: 'Mon — Sat', time: '9:00 am — 9:30 pm' },
      { days: 'Sunday', time: '10:00 am — 9:00 pm' },
    ],
    phone: '+91 98765 43210',
    mapsQuery: 'Ravi+Sweets+Khammam',
  },
];

const CONTACT = [
  {
    icon: Phone,
    label: 'Call',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
    note: 'Mon – Sat · 9 am – 9 pm IST',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
    note: 'Fastest way to reach us',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@ravisweets.com',
    href: 'mailto:hello@ravisweets.com',
    note: 'Replies within a business day',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@ravisweets',
    href: 'https://instagram.com/ravisweets',
    note: 'Kitchen stories and seasonal runs',
  },
];

const STORE_IMAGE =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1800&q=90&auto=format&fit=crop';

export default function StoresPage() {
  return (
    <>
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
                Our kitchen and flagship store sits in Khammam, in the heart of Telangana.
                Walk in, or call ahead to reserve a seasonal hamper — especially around Diwali.
              </p>
            </Reveal>
          </div>
          <Parallax offset={30}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lifted ring-1 ring-[color:var(--color-border)]">
              <Image
                src={STORE_IMAGE}
                alt="Khammam sweet-shop counter with assorted boxes and a copper scale"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 460px, 90vw"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 50%, transparent) 0%, transparent 50%)',
                }}
                aria-hidden="true"
              />
              <Grain />
              <div className="absolute bottom-4 left-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                Khammam · Telangana
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                Dev only
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
            Our flagship.
          </h2>
        </Reveal>

        {STORES.map((s) => (
          <Reveal key={s.name}>
            <article className="grid gap-8 rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft md:grid-cols-[1fr_1.2fr] md:gap-12 md:p-10">
              <div>
                <h3 className="font-display text-2xl font-semibold text-theme-ink md:text-3xl">
                  {s.name}
                </h3>
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
              href="https://wa.me/919876543210"
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
