import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';

type Slug = 'privacy' | 'terms' | 'returns' | 'shipping' | 'cancellation';

interface Policy {
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  updated: string;
}

const POLICIES: Record<Slug, Policy> = {
  privacy: {
    title: 'Privacy',
    eyebrow: 'How we handle your information',
    intro:
      'We collect what we need to ship you a sweet box, and nothing we don’t. This page is the short version; the long version is written in plain language on request.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Name, phone, email, shipping and billing address — required to fulfil your order.',
          'Order history — retained so you can re-order and so we can offer warranty-style support if a box is damaged in transit.',
          'Analytics (page views, basic device info) via PostHog, with session replay sensitive inputs masked. We honour your cookie rejection.',
        ],
      },
      {
        heading: 'What we don’t',
        body: [
          'We never store card numbers, CVV, UPI PINs, or netbanking credentials. Payment is handled end-to-end by Razorpay (India) and Stripe (international).',
          'We don’t sell your data. We don’t share it with brands for retargeting. The only third parties that see order data are the payment gateway, the shipping courier, and our transactional email service.',
        ],
      },
      {
        heading: 'Your controls',
        body: [
          'Request a copy of your data at privacy@ravisweets.com.',
          'Ask us to delete your account and we anonymise your orders (we retain statutory records for the period required by Indian law).',
          'Reject analytics cookies via the banner — we stop loading PostHog and any marketing pixels for that session.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  terms: {
    title: 'Terms of service',
    eyebrow: 'The short version',
    intro:
      'Placing an order means you agree to these terms. They exist to protect both sides and are written to be read, not hidden.',
    sections: [
      {
        heading: 'Orders and fulfilment',
        body: [
          'All product prices are in INR and include GST. International pricing is shown separately in the relevant currency.',
          'We reserve the right to cancel an order if a product is mispriced, out of stock, or if we cannot verify the address — we will refund any payment in full within the gateway’s standard window.',
          'A box leaves our kitchen the day it ships. If the perishable is damaged by a courier delay, please reach out within 48 hours of delivery.',
        ],
      },
      {
        heading: 'Pricing and taxes',
        body: [
          'All prices include GST at the rate mandated for the relevant HSN. A GST-compliant invoice is issued for every order shipping within India.',
          'Shipping charges, if any, are shown at checkout.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'Our liability for any single order is limited to the amount paid for that order. We do not cover indirect loss.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  returns: {
    title: 'Returns & refunds',
    eyebrow: 'When things aren’t right',
    intro:
      'Sweets are perishable, so we can’t accept returns in the way a clothing store can. But we stand behind every box we ship.',
    sections: [
      {
        heading: 'If a box arrives damaged',
        body: [
          'Take a photograph within 48 hours of delivery and email it to support@ravisweets.com with your order number.',
          'We’ll either re-ship the product or refund the item’s value (your choice). No back-and-forth.',
        ],
      },
      {
        heading: 'If an order is wrong',
        body: [
          'Contact us within 7 days and we’ll make it right — free re-ship or refund.',
        ],
      },
      {
        heading: 'Refund timelines',
        body: [
          'Card / UPI / netbanking refunds land in 3–7 business days via the original payment method.',
          'COD refunds are issued via bank transfer once we receive your bank details. Typically 5–10 business days.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  shipping: {
    title: 'Shipping & delivery',
    eyebrow: 'How your box gets to you',
    intro:
      'We ship from our Khammam kitchen the morning after your order is placed. Perishable items ship in temperature-controlled packaging with gel packs.',
    sections: [
      {
        heading: 'Coverage',
        body: [
          'India — we ship to most pincodes via our logistics partner. Check delivery by entering your pincode on the product page.',
          'International — coming soon as part of the Phase 2 diaspora launch.',
        ],
      },
      {
        heading: 'Timelines',
        body: [
          'Khammam + Hyderabad: next-day.',
          'Telangana + Andhra Pradesh: 1–2 business days.',
          'Rest of India: 3–5 business days.',
          'Perishable items may have shorter cutoff windows during Indian summer.',
        ],
      },
      {
        heading: 'Packaging',
        body: [
          'Every box includes a paisley-tagged ribbon, a signed note, and shelf-life clearly marked on each product.',
          'Corporate and wedding orders ship in logo-printed boxes with personalised messages on request.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  cancellation: {
    title: 'Cancellation',
    eyebrow: 'Before your box leaves the kitchen',
    intro:
      'You can cancel an order up until it enters packing. After that, we’ve already committed the ingredients and a cancellation is treated as a return.',
    sections: [
      {
        heading: 'Before packing',
        body: [
          'Email support@ravisweets.com with your order number — we cancel and refund on the same payment method.',
        ],
      },
      {
        heading: 'After packing',
        body: [
          'The box is already made. We offer a pause-and-reship option (useful for gifting) instead of outright cancellation.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = POLICIES[slug as Slug];
  if (!p) return { title: 'Not found' };
  return { title: p.title, description: p.intro };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = POLICIES[slug as Slug];
  if (!p) notFound();

  return (
    <article className="container-site py-12 md:py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      <Reveal>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Paisley size="sm" />
          {p.eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="mt-3 max-w-3xl font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
          {p.title}
        </h1>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-theme-ink/80">{p.intro}</p>
      </Reveal>

      <div className="mt-12 grid gap-10">
        {p.sections.map((s, i) => (
          <Reveal key={s.heading} delay={0.05 + i * 0.06}>
            <section>
              <h2 className="font-display text-heading font-semibold text-theme-ink">
                {s.heading}
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-theme-ink/80">
                {s.body.map((b, j) => (
                  <li key={j} className="leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      <p className="mt-14 text-xs text-theme-ink/55">Last updated {p.updated}.</p>
    </article>
  );
}
