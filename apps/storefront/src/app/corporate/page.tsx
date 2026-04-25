import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Handshake,
  Mail,
  Package,
  PaintBucket,
  Truck,
  Users,
} from 'lucide-react';
import { CorporateEnquiry } from '@/components/corporate/corporate-enquiry';
import { Paisley, PaisleyDivider } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Parallax } from '@/components/motion/parallax';
import { Grain } from '@/components/brand/grain';

export const metadata: Metadata = {
  title: 'Corporate gifting',
  description:
    'Corporate Diwali runs, multi-address CSV delivery, GST-compliant invoices, logo printing — managed by a dedicated account manager.',
};

const HERO_IMAGE =
  'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png';

const TRUST_BADGES = [
  { icon: FileText, label: 'GST invoicing' },
  { icon: PaintBucket, label: 'Logo printing' },
  { icon: Truck, label: 'Multi-address via CSV' },
  { icon: Handshake, label: 'Dedicated account manager' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Mail,
    title: 'Enquire',
    body: 'Tell us quantity, budget, delivery window. Our team responds within 24 hours with options.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Quote',
    body: 'A formal quote lands with MOQ, tiered pricing, and a PO-ready breakdown. No surprises later.',
  },
  {
    step: '03',
    icon: PaintBucket,
    title: 'Customise',
    body: 'Upload your logo, pick a ribbon colour, write a personalised message — we send a printed proof for approval.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Approve',
    body: 'Sign-off in writing, we lock production. You receive a single GST-compliant invoice with your PO number.',
  },
  {
    step: '05',
    icon: Truck,
    title: 'Deliver',
    body: 'One address or two hundred — a single CSV upload covers the lot. Per-recipient tracking links included.',
  },
];

const HAMPERS = [
  {
    title: 'Essence',
    templateId: 'essence',
    tier: 'Starter',
    priceFrom: '₹899',
    moq: '50 units',
    contents: 'Kaju Katli · Badam ki Jali · Pistachios · Brass diya',
    image:
      'https://ravisweets.com/wp-content/uploads/2025/09/cashew_mithai-removebg-preview.png',
  },
  {
    title: 'Premium',
    templateId: 'premium',
    tier: 'Bestseller',
    priceFrom: '₹1,499',
    moq: '50 units',
    contents: 'Qubani ka Meetha · Kaju Katli · Badam ki Jali · Almonds · Pistachios · Brass diya',
    image:
      'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
  },
  {
    title: 'Grande',
    templateId: 'grande',
    tier: 'Signature',
    priceFrom: '₹2,499',
    moq: '25 units',
    contents: 'Full Hyderabadi spread · custom silk wrap · hand-painted brass box',
    image:
      'https://ravisweets.com/wp-content/uploads/2025/09/anjjeer_katli-removebg-preview.png',
  },
];

const FAQS = [
  {
    q: 'What is the minimum order quantity?',
    a: 'Most hampers start at 50 units. The Grande tier starts at 25. For pilot runs or single-team gifts, email us — we make exceptions for good reason.',
  },
  {
    q: 'How much lead time do I need?',
    a: 'Stock hampers: 5 business days from quote approval. Logo-printed or bespoke packaging: 10 business days. Diwali cut-offs are announced 6 weeks in advance.',
  },
  {
    q: 'Can you deliver to 200+ different addresses?',
    a: 'Yes — upload a CSV with the recipient list and we consolidate into one invoice with per-recipient tracking links returned to you.',
  },
  {
    q: 'What does the invoice look like?',
    a: 'GST-compliant with CGST/SGST or IGST split, HSN codes, your PO number in the header and filename. Ready for Tally / Zoho / QuickBooks import.',
  },
  {
    q: 'Do you offer credit terms?',
    a: 'Not in v1. Payment is upfront via bank transfer, Razorpay link, or corporate card. Credit terms (net-15 / net-30) are on the Phase 2 roadmap for qualified accounts.',
  },
  {
    q: 'Can I taste before I commit?',
    a: 'Yes. Request a sample pack via the enquiry form and we ship one to your office — no charge above 10 units, small delivery fee beyond that.',
  },
];

export default function CorporatePage() {
  return (
    <>
      {/* Hero — warm cream with brass accents */}
      <section
        className="relative isolate overflow-hidden border-b border-[color:var(--color-border)]"
        style={{
          background:
            'radial-gradient(ellipse at 75% 35%, color-mix(in oklab, var(--theme-glow) 32%, transparent) 0%, transparent 65%), radial-gradient(ellipse at 8% 92%, color-mix(in oklab, var(--theme-accent) 10%, transparent) 0%, transparent 55%), var(--theme-base)',
        }}
      >
        <div className="container-site relative grid gap-10 py-20 md:grid-cols-[1.1fr_1fr] md:items-center md:py-28">
          <div>
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                For HR &amp; Admin teams
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-4 font-display text-display-lg font-semibold leading-[1.02] text-theme-ink md:text-display-xl">
                Corporate gifting,{' '}
                <span className="italic text-theme-accent">done the Hyderabadi way.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-theme-ink/75">
                MOQ-based pricing. Logo-printed packaging. Multi-address CSV delivery.
                GST-compliant invoices. One account manager, one phone number, one box arriving
                exactly when it should.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#enquiry"
                  className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
                >
                  Request a quote
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
                <Link
                  href="/corporate/builder?t=premium"
                  className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-6 py-3 text-sm font-semibold text-theme-ink transition-colors duration-300 hover:border-theme-accent hover:text-theme-accent"
                >
                  Build your own hamper
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-theme-ink/65">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <b.icon className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
                    <span className="font-semibold uppercase tracking-wider">{b.label}</span>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Parallax offset={30}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lifted ring-1 ring-[color:var(--color-border)]">
              <Image
                src={HERO_IMAGE}
                alt="A premium Diwali hamper wrapped in silk with brass accents"
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
                    'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 45%, transparent) 0%, transparent 55%)',
                }}
                aria-hidden="true"
              />
              <Grain />
              <div className="absolute bottom-4 left-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-glow">
                  Pictured
                </p>
                <p className="font-display text-lg font-semibold" style={{ color: 'var(--theme-base)' }}>
                  Premium hamper, 2024 Diwali run
                </p>
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                Dev only
              </div>
            </div>
          </Parallax>
        </div>
      </section>

      {/* Hampers catalogue */}
      <section aria-labelledby="catalogue-heading" id="catalogue" className="container-site py-20">
        <Reveal className="mb-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Curated hampers
          </p>
          <h2
            id="catalogue-heading"
            className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg"
          >
            Three tiers, endlessly customisable.
          </h2>
        </Reveal>

        <Stagger gap={85} className="grid gap-5 md:grid-cols-3">
          {HAMPERS.map((h) => (
            <Link
              key={h.title}
              href={`/corporate/builder?t=${h.templateId}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={h.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 55%, transparent) 0%, transparent 50%)',
                  }}
                  aria-hidden="true"
                />
                <div className="absolute left-3 top-3 rounded-full bg-theme-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {h.tier}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-xl font-semibold text-theme-ink">{h.title}</h3>
                <p className="text-sm text-theme-ink/70">{h.contents}</p>
                <div className="mt-auto flex items-end justify-between pt-4 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                      From
                    </p>
                    <p className="font-display text-2xl font-semibold text-theme-accent">
                      {h.priceFrom}
                    </p>
                  </div>
                  <p className="text-theme-ink/60">MOQ · {h.moq}</p>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-theme-accent transition-transform duration-300 group-hover:translate-x-1">
                  Build from this template
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-sm text-theme-ink/70">
            These are starting points — every corporate order is built around your needs. Price
            drops at 100+ units, 500+ units, and 1000+ units. Email us with your scale and
            we&rsquo;ll quote within 24 hours.
          </p>
        </Reveal>
      </section>

      <PaisleyDivider className="container-site" />

      {/* How it works */}
      <section aria-labelledby="how-heading" className="container-site py-20">
        <Reveal className="mb-12">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            How it works
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg"
          >
            Five steps from enquiry to delivery.
          </h2>
        </Reveal>

        <Stagger gap={80} className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-semibold tracking-[0.22em] text-theme-accent">
                  {s.step}
                </span>
                <s.icon className="h-4 w-4 text-theme-accent" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-theme-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-theme-ink/70">{s.body}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Enquiry */}
      <section
        aria-labelledby="enquiry-heading"
        id="enquiry"
        className="container-site grid gap-10 py-20 md:grid-cols-[1fr_1.2fr] md:gap-14"
      >
        <div>
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Request a quote
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              id="enquiry-heading"
              className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg"
            >
              Tell us what you&rsquo;re planning.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-theme-ink/70 md:text-lg">
              Your account manager will respond within 24 hours (often sooner). Shorter lead
              times for established customers and existing POs.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <dl className="mt-8 flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-theme-ink">Your dedicated contact</dt>
                  <dd className="text-theme-ink/70">
                    corporate@ravisweets.com · +91 98765 43210 (WhatsApp)
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-theme-ink">Diwali cut-offs</dt>
                  <dd className="text-theme-ink/70">
                    Place orders by 6 weeks out for standard hampers, 8 weeks for bespoke.
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-theme-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-theme-ink">Sample pack</dt>
                  <dd className="text-theme-ink/70">
                    Tick &ldquo;request a sample&rdquo; below and we send a small box your way.
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-theme-ink/5" />}>
          <CorporateEnquiry />
        </Suspense>
      </section>

      <PaisleyDivider className="container-site" />

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="container-site py-20">
        <Reveal className="mb-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Frequently asked
          </p>
          <h2
            id="faq-heading"
            className="mt-3 font-display text-display-md text-theme-ink md:text-display-lg"
          >
            The practical stuff.
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="group rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 open:shadow-soft">
                <summary className="flex cursor-pointer items-start justify-between gap-4 font-display text-base font-semibold text-theme-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-theme-accent transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-theme-ink/75">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container-site pb-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-8 md:flex-row md:items-center md:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                Download our catalogue
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-theme-ink md:text-3xl">
                Prefer to share with stakeholders?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-theme-ink/70">
                A PDF catalogue with all hampers, customisation options, pricing tiers, and our
                kitchen process — five minutes of reading.
              </p>
            </div>
            <Link
              href="#enquiry"
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Request the catalogue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
