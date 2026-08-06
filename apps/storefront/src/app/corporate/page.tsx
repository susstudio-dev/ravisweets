import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { CorporateEnquiry } from '@/components/corporate/corporate-enquiry';
import { SlotImage } from '@/components/media/slot-image';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { Grain } from '@/components/brand/grain';

/*
 * CORPORATE, AS A TENDER DOCUMENT.
 *
 * The buyer here is an HR or admin team comparing vendors on capability and
 * compliance, so the page reads as the paperwork they would file: a carbon
 * capability sheet up top, a ruled rate card for the tiers, a numbered
 * process spec, and a square-cut enquiry form. Every claim below (MOQ, CSV
 * dispatch, GST/HSN/PO invoicing, printed proofs, 24-hour quotes) already
 * existed on this page — only the presentation changed.
 */

export const metadata: Metadata = {
  title: 'Corporate gifting',
  description:
    'Corporate Diwali runs, multi-address CSV delivery, GST-compliant invoices, logo printing — managed by a dedicated account manager.',
};

/** The capability sheet: what the corporate desk can be held to, as a record. */
const CAPABILITIES: { label: string; value: string }[] = [
  { label: 'MOQ', value: 'FROM 25 UNITS' },
  { label: 'Dispatch', value: 'CSV MULTI-ADDRESS' },
  { label: 'Tracking', value: 'PER-RECIPIENT' },
  { label: 'Invoicing', value: 'GST · HSN · PO NO.' },
  { label: 'Logo printing', value: 'PRINTED PROOF FIRST' },
  { label: 'Quote', value: 'WITHIN 24 HOURS' },
  { label: 'Account manager', value: 'DEDICATED' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enquire',
    body: 'Tell us quantity, budget, delivery window. Our team responds within 24 hours with options.',
  },
  {
    step: '02',
    title: 'Quote',
    body: 'A formal quote lands with MOQ, tiered pricing, and a PO-ready breakdown. No surprises later.',
  },
  {
    step: '03',
    title: 'Customise',
    body: 'Upload your logo, pick a ribbon colour, write a personalised message — we send a printed proof for approval.',
  },
  {
    step: '04',
    title: 'Approve',
    body: 'Sign-off in writing, we lock production. You receive a single GST-compliant invoice with your PO number.',
  },
  {
    step: '05',
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
    moq: '50 UNITS',
    contents: 'Kaju Katli · Badam ki Jali · Pistachios · Brass diya',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/cashew_mithai-removebg-preview.png',
  },
  {
    title: 'Premium',
    templateId: 'premium',
    tier: 'Bestseller',
    priceFrom: '₹1,499',
    moq: '50 UNITS',
    contents: 'Qubani ka Meetha · Kaju Katli · Badam ki Jali · Almonds · Pistachios · Brass diya',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
  },
  {
    title: 'Grande',
    templateId: 'grande',
    tier: 'Signature',
    priceFrom: '₹2,499',
    moq: '25 UNITS',
    contents: 'Full Hyderabadi spread · custom silk wrap · hand-painted brass box',
    image: 'https://ravisweets.com/wp-content/uploads/2025/09/anjjeer_katli-removebg-preview.png',
  },
  // `as const` narrows templateId to the literal union, so the owner-photo
  // slot path `corporate.${templateId}` typechecks against SlotPath.
] as const;

/** Contact facts for the enquiry column, as label/value rows with notes. */
const CONTACT_ROWS: { label: string; value: string; note: string }[] = [
  {
    label: 'Dedicated contact',
    value: 'corporate@ravisweets.com',
    note: '+91 98765 43210 (WhatsApp) — one account manager, one phone number.',
  },
  {
    label: 'Diwali cut-offs',
    value: '6–8 WEEKS OUT',
    note: 'Place orders by 6 weeks out for standard hampers, 8 weeks for bespoke.',
  },
  {
    label: 'Sample pack',
    value: 'ON REQUEST',
    note: 'Tick “request a sample” below and we send a small box your way.',
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
    a: 'Not yet. Payment is upfront via bank transfer, Razorpay link, or corporate card. Credit terms (net-15 / net-30) are on the roadmap for qualified accounts.',
  },
  {
    q: 'Can I taste before I commit?',
    a: 'Yes. Request a sample pack via the enquiry form and we ship one to your office — no charge above 10 units, small delivery fee beyond that.',
  },
];

export default function CorporatePage() {
  return (
    <>
      {/* ── THE CAPABILITY SHEET ─────────────────────────────────────────
          Carbon register: the corporate desk's carbon copy. Sells dispatch
          capability and GST compliance, nothing else. */}
      <section
        aria-labelledby="corporate-hero-heading"
        data-register="carbon"
        className="bg-theme-base text-theme-ink relative isolate overflow-hidden border-b border-[color:var(--color-border)]"
      >
        <div className="container-site section-y relative z-10">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div>
              <Reveal>
                <h1
                  id="corporate-hero-heading"
                  className="font-display text-display-lg text-balance"
                >
                  Two hundred addresses. One invoice.
                </h1>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="text-text-muted mt-5 max-w-[52ch] leading-relaxed md:text-lg">
                  Corporate gifting for HR and admin teams: MOQ-based pricing, logo-printed
                  packaging, multi-address delivery from a single CSV, GST-compliant invoices
                  carrying your PO number — and one account manager, one phone number, one box
                  arriving exactly when it should.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href="#enquiry" className="stamp">
                    Request a quote
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link href="/corporate/builder?t=premium" className="stamp stamp--ghost">
                    Build your own hamper
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div className="docket">
                <div className="border-b border-[color:var(--color-rule)] px-5 py-2.5">
                  <h2 className="field-label">Capability sheet</h2>
                </div>
                <dl className="px-5 pb-2 pt-1">
                  {CAPABILITIES.map((row) => (
                    <div key={row.label} className="field-row">
                      <dt className="field-label">{row.label}</dt>
                      <dd className="field-value text-sm">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
        <Grain />
      </section>

      {/* ── THE RATE CARD ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="catalogue-heading"
        id="catalogue"
        className="container-site section-y scroll-mt-24"
      >
        <Reveal>
          <div className="docket-head">
            <h2 id="catalogue-heading" className="font-display text-display-md">
              Three tiers, endlessly customisable.
            </h2>
            <Link
              href="/corporate/builder?t=premium"
              className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Open the hamper builder <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="docket overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left">
              <caption className="sr-only">
                Hamper tiers with starting price and minimum order quantity
              </caption>
              <thead>
                <tr className="border-b-2 border-[color:var(--color-rule)]">
                  <th scope="col" className="px-4 py-3">
                    <span className="field-label">Tier</span>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="field-label">Contents</span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="field-label">From</span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="field-label">MOQ</span>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Open in builder</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {HAMPERS.map((h) => (
                  <tr
                    key={h.templateId}
                    className="border-b border-[color:var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {/*
                          The tier thumb is an owner-editable slot. Fallback:
                          the catalogue URL, which still points at the retired
                          host — SlotImage decides at render so the dead URL
                          is never requested and the specimen mark stands in.
                          The [&_span] variant shrinks SlotImage's stock
                          placeholder diamond to fit the 44px frame.
                        */}
                        <SlotImage
                          slot={`corporate.${h.templateId}`}
                          fallbackUrl={h.image}
                          fallbackAlt=""
                          sizes="44px"
                          className="bg-theme-glow/20 h-11 w-11 shrink-0 overflow-hidden rounded-md [&_span]:h-6 [&_span]:w-6"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-base font-semibold">{h.title}</p>
                          <p className="field-label mt-0.5">{h.tier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted px-4 py-4 align-middle text-[13px] leading-relaxed">
                      {h.contents}
                    </td>
                    <td className="field-value whitespace-nowrap px-4 py-4 text-right align-middle text-sm font-bold">
                      {h.priceFrom}
                    </td>
                    <td className="field-value whitespace-nowrap px-4 py-4 text-right align-middle text-sm">
                      {h.moq}
                    </td>
                    <td className="px-4 py-4 text-right align-middle">
                      <Link
                        href={`/corporate/builder?t=${h.templateId}`}
                        className="field-label text-theme-accent hover:text-theme-ink whitespace-nowrap transition-colors"
                        aria-label={`Build from the ${h.title} template`}
                      >
                        Build →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-text-muted mt-6 max-w-2xl text-sm">
            These are starting points — every corporate order is built around your needs. Price
            drops at 100+ units, 500+ units, and 1000+ units. Email us with your scale and
            we&rsquo;ll quote within 24 hours.
          </p>
        </Reveal>
      </section>

      {/* ── THE PROCESS SPEC ───────────────────────────────────────────── */}
      <section aria-labelledby="how-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="how-heading" className="font-display text-display-md">
              Five steps from enquiry to delivery.
            </h2>
          </div>
        </Reveal>

        <Stagger gap={70} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="border-t border-[color:var(--color-rule)] pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-base font-semibold">{s.title}</h3>
                <span className="field-value text-text-muted text-xs">{s.step}</span>
              </div>
              <p className="text-text-muted mt-2 text-[13px] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ── THE ENQUIRY ────────────────────────────────────────────────── */}
      <section
        aria-labelledby="enquiry-heading"
        id="enquiry"
        className="container-site section-y scroll-mt-24"
      >
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-14">
          <div>
            <Reveal>
              <div className="docket-head">
                <h2 id="enquiry-heading" className="font-display text-display-md">
                  Tell us what you&rsquo;re planning.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-text-muted text-sm leading-relaxed md:text-base">
                Your account manager will respond within 24 hours (often sooner). Shorter lead
                times for established customers and existing POs.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <dl className="mt-6">
                {CONTACT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 border-b border-[color:var(--color-border)] py-3.5 last:border-b-0"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="field-label">{row.label}</dt>
                      <dd className="field-value text-sm">{row.value}</dd>
                    </div>
                    <p className="text-text-muted max-w-[46ch] text-[13px] leading-relaxed">
                      {row.note}
                    </p>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Suspense fallback={<div className="docket h-96 animate-pulse" />}>
            <CorporateEnquiry />
          </Suspense>
        </div>
      </section>

      {/* ── THE PRACTICAL STUFF ────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="container-site section-y">
        <Reveal>
          <div className="docket-head">
            <h2 id="faq-heading" className="font-display text-display-md">
              The practical stuff.
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="docket group p-5">
                <summary className="font-display text-theme-ink flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-theme-accent shrink-0 transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-text-muted mt-3 text-sm leading-relaxed">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE STAKEHOLDER COPY ───────────────────────────────────────── */}
      <section aria-labelledby="catalogue-cta-heading" className="container-site section-y">
        <Reveal direction="up" distance={16}>
          <div
            data-register="carbon"
            className="bg-theme-base text-theme-ink flex flex-col items-start justify-between gap-6 rounded-lg p-7 md:flex-row md:items-center md:p-10"
          >
            <div>
              <h2 id="catalogue-cta-heading" className="font-display text-display-md">
                Prefer to share with stakeholders?
              </h2>
              <p className="text-text-muted mt-3 max-w-lg text-sm leading-relaxed">
                A PDF catalogue with all hampers, customisation options, pricing tiers, and our
                kitchen process — five minutes of reading. Request it through the enquiry form.
              </p>
            </div>
            <a href="#enquiry" className="stamp md:shrink-0">
              Request the catalogue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
