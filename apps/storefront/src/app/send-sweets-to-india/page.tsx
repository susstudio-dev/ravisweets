import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import { ProductCard } from '@/components/product-card';
import { ProductGrid } from '@/components/product-grid';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

/*
 * /send-sweets-to-india — the diaspora dispatch page.
 *
 * The "sent from home" story lives here. An NRI buyer pays from abroad with
 * the card in their pocket; the box itself never leaves India — made in the
 * family kitchen the morning it ships, delivered to a doorstep at home. The
 * page states that arrangement the way this world states everything: as a
 * dispatch docket, ruled rows, recorded values. No countdowns, no invented
 * couriers, no guarantees the shipping policy does not already make.
 *
 * TRUTH BOUNDARIES (do not soften): international cards pay; DELIVERY IS
 * WITHIN INDIA ONLY. SLAs mirror /policies/shipping verbatim.
 */

export const metadata: Metadata = {
  // 71 characters before the layout suffix put this well past 60. The
  // diaspora search intent is carried by "Send Sweets to India from Abroad";
  // the rest was restating the description.
  title: 'Send Sweets to India from Abroad',
  description:
    'Order from the US, UK, UAE, Australia, Singapore or Canada — hand-made sweets delivered fresh to any address in India.',
  alternates: { canonical: '/send-sweets-to-india' },
};

/**
 * The two festivals the diaspora ships home for first. Dates mirror FESTIVALS
 * in sections/festival-next-band.tsx (which mirrors the /festivals calendar);
 * the 3-day order-by lead is the same constant that band uses.
 */
const FESTIVAL_HOOKS = [
  { slug: 'raksha-bandhan', title: 'Raksha Bandhan', telugu: 'రక్షా బంధన్', date: '2026-08-28' },
  { slug: 'diwali', title: 'Diwali', telugu: 'దీపావళి', date: '2026-11-08' },
] as const;

/** Dispatch needs three clear days before the festival for the fresh range. */
const ORDER_BY_LEAD_DAYS = 3;

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

function parseIso(iso: string): { y: number; m: number; d: number } {
  return {
    y: Number(iso.slice(0, 4)),
    m: Number(iso.slice(5, 7)),
    d: Number(iso.slice(8, 10)),
  };
}

/** "2026-08-28" → "28 AUG 2026". Deterministic — no runtime-timezone drift. */
function formatDocketDate(iso: string): string {
  const { y, m, d } = parseIso(iso);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1] ?? ''} ${y}`;
}

function formatOrderBy(iso: string): string {
  const { y, m, d } = parseIso(iso);
  const orderBy = new Date(Date.UTC(y, m - 1, d - ORDER_BY_LEAD_DAYS));
  return formatDocketDate(orderBy.toISOString().slice(0, 10));
}

const WHATSAPP_URL = 'https://wa.me/919398859978';

const STEPS: { no: string; title: string; body: string }[] = [
  {
    no: '01',
    title: 'Order from abroad, in INR',
    body:
      'Browse the catalogue from the US, UK, UAE, Australia, Singapore or Canada. Checkout is priced in INR and accepts cards issued outside India.',
  },
  {
    no: '02',
    title: 'Made the morning it ships',
    body:
      'Your order joins that morning’s batch in the family kitchen. No preservatives — shelf life is marked plainly on every product.',
  },
  {
    no: '03',
    title: 'Delivered at their doorstep',
    body:
      'Temperature-controlled dispatch to most pincodes across India, with order and delivery updates on WhatsApp along the way.',
  },
];

export default function SendSweetsToIndiaPage() {
  const bestsellers = CATALOGUE.filter((p) => p.bestseller).slice(0, 4);

  return (
    <>
      {/* ── THE DISPATCH DOCKET ─────────────────────────────────────── */}
      <section aria-labelledby="send-heading" className="container-site section-y">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <Reveal>
            <div>
              <h1 id="send-heading" className="font-display text-display-lg text-theme-ink">
                Send home the sweets you grew up on.
              </h1>
              <p className="text-theme-ink/80 mt-5 max-w-[52ch] leading-relaxed">
                Order from wherever you are, pay in INR with the card in your pocket, and a box
                is made fresh and dispatched from our family kitchen in Khammam, Telangana to
                any address in India. You send from abroad; the box travels at home.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/shop" className="stamp">
                  Send a box home
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stamp stamp--ghost"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="docket docket--perf p-5 md:p-7">
              <div className="docket-head">
                <p className="field-label">Dispatch docket</p>
                <p className="field-value text-theme-ink text-sm">EST. 1983</p>
              </div>
              <dl>
                <div className="field-row">
                  <dt className="field-label">From</dt>
                  <dd className="field-value text-theme-ink text-sm">ANYWHERE YOU ARE</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">To</dt>
                  <dd className="field-value text-theme-ink text-sm font-bold">
                    ANY ADDRESS IN INDIA
                  </dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Made</dt>
                  <dd className="field-value text-theme-ink text-sm">THE MORNING IT SHIPS</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Preservatives</dt>
                  <dd className="field-value text-theme-ink text-sm">NIL</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Currency</dt>
                  <dd className="field-value text-theme-ink text-sm">INR</dd>
                </div>
              </dl>
              <p className="text-text-muted mt-4 text-[13px] leading-relaxed">
                You pay from abroad. Delivery is within India only.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW A BOX GETS HOME ─────────────────────────────────────── */}
      <section aria-labelledby="how-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="how-heading" className="font-display text-display-md">
              How a box gets home
            </h2>
          </div>
        </Reveal>
        <Stagger gap={40}>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((step) => (
              <li key={step.no}>
                <div className="docket-head">
                  <h3 className="font-display text-heading text-theme-ink">{step.title}</h3>
                  <span className="field-value text-text-muted text-sm" aria-hidden="true">
                    {step.no}
                  </span>
                </div>
                <p className="text-text-muted max-w-[48ch] text-sm leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Stagger>
      </section>

      {/* ── FESTIVAL HOOKS ──────────────────────────────────────────── */}
      <section aria-labelledby="festival-hooks-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="festival-hooks-heading" className="font-display text-display-md">
              Reach them before the festival
            </h2>
            <Link
              href="/festivals"
              className="text-theme-ink hover:text-theme-accent inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors"
            >
              The full calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Stagger gap={40}>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {FESTIVAL_HOOKS.map((f) => (
              <Link
                key={f.slug}
                href={`/festivals/${f.slug}`}
                className="docket group flex flex-col p-5 transition-shadow duration-200 hover:shadow-lifted md:p-6"
              >
                <div className="docket-head">
                  <h3 className="font-display text-heading text-theme-ink">{f.title}</h3>
                  <span className="font-indic text-text-muted text-lg leading-none">
                    {f.telugu}
                  </span>
                </div>
                {/* A kitchen records a deadline; it does not run a clock. */}
                <dl>
                  <div className="field-row">
                    <dt className="field-label">Festival</dt>
                    <dd className="field-value text-theme-ink text-sm">
                      {formatDocketDate(f.date)}
                    </dd>
                  </div>
                  <div className="field-row">
                    <dt className="field-label">Order by</dt>
                    <dd className="field-value text-theme-ink text-sm font-bold">
                      {formatOrderBy(f.date)}
                    </dd>
                  </div>
                </dl>
                <span className="text-theme-ink group-hover:text-theme-accent mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors">
                  Pre-order the {f.title} box
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </Stagger>
      </section>

      {/* ── BESTSELLERS ─────────────────────────────────────────────── */}
      <section aria-labelledby="diaspora-bestsellers-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="diaspora-bestsellers-heading" className="font-display text-display-md">
              The boxes they&rsquo;ll recognise
            </h2>
            <Link
              href="/shop"
              className="text-theme-ink hover:text-theme-accent inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Shop the catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Stagger gap={40}>
          <ProductGrid>
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} quickAdd />
            ))}
          </ProductGrid>
        </Stagger>
      </section>

      {/* ── SENDING HOME, ANSWERED ──────────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="faq-heading" className="font-display text-display-md">
              Sending sweets home, answered
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-3xl">
            <details className="group border-b border-[color:var(--color-border)]">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-theme-ink text-[15px] font-semibold">
                  Can I pay with a card issued outside India?
                </span>
                <Plus
                  className="text-text-muted h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-text-muted max-w-[65ch] pb-4 text-sm leading-relaxed">
                Yes. Checkout is priced in INR and accepts international cards — order from the
                US, UK, UAE, Australia, Singapore, Canada or wherever your card was issued. The
                delivery address just needs to be in India.
              </p>
            </details>

            <details className="group border-b border-[color:var(--color-border)]">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-theme-ink text-[15px] font-semibold">
                  Where do you deliver?
                </span>
                <Plus
                  className="text-text-muted h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <div className="pb-4">
                <p className="text-text-muted max-w-[65ch] text-sm leading-relaxed">
                  Within India only — most pincodes, via our logistics partner. We don&rsquo;t
                  ship boxes outside India yet: today, the card pays from abroad and the box
                  travels at home.
                </p>
                <dl className="mt-3 max-w-md">
                  <div className="field-row">
                    <dt className="field-label">Khammam + Hyderabad</dt>
                    <dd className="field-value text-theme-ink text-sm">NEXT DAY</dd>
                  </div>
                  <div className="field-row">
                    <dt className="field-label">Telangana + Andhra Pradesh</dt>
                    <dd className="field-value text-theme-ink text-sm">1–2 BUSINESS DAYS</dd>
                  </div>
                  <div className="field-row">
                    <dt className="field-label">Rest of India</dt>
                    <dd className="field-value text-theme-ink text-sm">3–5 BUSINESS DAYS</dd>
                  </div>
                </dl>
                <p className="text-text-muted mt-3 text-[13px] leading-relaxed">
                  Full details are on the{' '}
                  <Link
                    href="/policies/shipping"
                    className="text-theme-ink hover:text-theme-accent underline underline-offset-2 transition-colors"
                  >
                    shipping policy
                  </Link>
                  .
                </p>
              </div>
            </details>

            <details className="group border-b border-[color:var(--color-border)]">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-theme-ink text-[15px] font-semibold">
                  Will it stay fresh in transit?
                </span>
                <Plus
                  className="text-text-muted h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-text-muted max-w-[65ch] pb-4 text-sm leading-relaxed">
                Every box is made the morning it ships and perishables travel in
                temperature-controlled packaging with gel packs. Shelf life is marked on every
                product: the fresh khoya range keeps 4–7 days, and the shipping range leans on
                the shelf-stable line — barfis, laddoos, mysore pak.
              </p>
            </details>

            <details className="group border-b border-[color:var(--color-border)]">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-theme-ink text-[15px] font-semibold">
                  Can I order over WhatsApp?
                </span>
                <Plus
                  className="text-text-muted h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-text-muted max-w-[65ch] pb-4 text-sm leading-relaxed">
                Yes —{' '}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-ink hover:text-theme-accent underline underline-offset-2 transition-colors"
                >
                  message us on WhatsApp
                </a>{' '}
                from any country, confirm the delivery address in India, and dispatch and
                delivery updates arrive on the same thread.
              </p>
            </details>
          </div>
        </Reveal>
      </section>

      {/* ── THE CLOSE ───────────────────────────────────────────────── */}
      <section className="container-site section-y">
        <Reveal direction="up" distance={16}>
          <div data-register="carbon" className="bg-theme-base text-theme-ink p-7 md:p-10">
            <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md">
                  The counter is open, wherever you are.
                </h2>
                <p className="text-text-muted mt-4 text-sm leading-relaxed md:text-base">
                  One kitchen, the same family, since 1983 — now taking orders from abroad.
                  Sending to a whole office instead of one doorstep? Corporate gifting covers
                  MOQ pricing and multi-address dispatch.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:shrink-0">
                <Link href="/shop" className="stamp">
                  Send a box home
                </Link>
                <Link
                  href="/corporate"
                  className="field-label hover:text-theme-accent inline-flex min-h-[44px] items-center transition-colors"
                >
                  Corporate gifting →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
