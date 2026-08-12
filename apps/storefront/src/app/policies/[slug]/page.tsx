import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { seoDescription, seoTitle } from '@/lib/seo/metadata';

type Slug = 'privacy' | 'terms' | 'returns' | 'shipping' | 'cancellation';

interface PolicySection {
  heading: string;
  /** Recorded label/value pairs (e.g. shipping SLAs) — rendered as ruled field-rows. */
  rows?: { label: string; value: string }[];
  body: string[];
}

interface Policy {
  title: string;
  eyebrow: string;
  intro: string;
  sections: PolicySection[];
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
          'Only essential, first-party cookies needed to keep you signed in and hold your cart. We do not run third-party analytics or advertising trackers; if that ever changes, we will ask for your consent first.',
        ],
      },
      {
        heading: 'What we don’t',
        body: [
          'We never store card numbers, CVV, UPI PINs, or netbanking credentials. When online payments go live, they will be processed by a PCI-DSS-compliant payment gateway and card data will never touch our servers.',
          'We don’t sell your data. We don’t share it with brands for retargeting. The only third parties that see order data are the payment gateway, the shipping courier, and our transactional email service.',
        ],
      },
      {
        heading: 'Your controls',
        body: [
          'Request a copy of your data at privacy@ravisweets.com.',
          'Ask us to delete your account and we anonymise your orders (we retain statutory records for the period required by Indian law).',
          'Because we run no non-essential trackers, there is nothing extra to opt out of today. If we introduce analytics, you will be able to reject it before it loads.',
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
          'A box leaves us the day it ships. If the perishable is damaged by a courier delay, please reach out within 48 hours of delivery.',
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
      {
        heading: 'Food information and allergens',
        body: [
          'Every product page names its full ingredient list and declares its allergens. Our kitchen handles nuts, dairy, wheat and sesame throughout, so we cannot guarantee that any item is free from traces of them even where the recipe excludes them — if an allergy is severe, please treat that as the operative statement rather than the individual ingredient list.',
          'Shelf life is printed on each pack and stated on each product page. Because nothing carries a preservative, those windows are shorter than the equivalent packaged product and they are real dates rather than conservative estimates.',
        ],
      },
      {
        heading: 'Your account',
        body: [
          'You are responsible for keeping your sign-in details to yourself, and for the accuracy of the delivery address you give us. A courier cannot deliver to an address that does not resolve, and a re-delivery to a corrected address may be chargeable.',
          'We may suspend an account we believe is being used fraudulently. If that happens to you in error, one email to support@ravisweets.com reaches a person who can look at it.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by Indian law, and the courts at Khammam, Telangana have jurisdiction over any dispute arising from them.',
          'If we change these terms, the revision date at the top of this page changes with them. Orders are governed by the terms in force on the day they were placed.',
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
        body: ['Contact us within 7 days and we’ll make it right — free re-ship or refund.'],
      },
      {
        heading: 'Refund timelines',
        body: [
          'Card / UPI / netbanking refunds land in 3–7 business days via the original payment method.',
          'COD refunds are issued via bank transfer once we receive your bank details. Typically 5–10 business days.',
        ],
      },
      {
        heading: 'Why we cannot take food back',
        body: [
          'Once a box of sweets has left our control we have no way to verify how it was stored, and nothing we make contains a preservative to make that guess safe. Reselling returned food would be the one thing genuinely incompatible with how we work, so we refund or re-ship instead of asking you to send anything back.',
          'In practice this is the better deal for you: there is no return shipment to arrange, no packaging to keep, and no wait for us to receive the box before the refund is raised.',
        ],
      },
      {
        heading: 'What counts as damaged',
        body: [
          'A box crushed in transit, a jar that has leaked, seals that have opened, or a perishable item that arrived warm when it shipped with gel packs — all of these we treat as damaged, no argument.',
          'Sweets soften, sugar bloom appears on chocolate-coated pieces in the heat, and hand-cut items vary in size. These are properties of hand-made food rather than faults, and we would rather say so plainly here than dispute it with you later.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  shipping: {
    title: 'Shipping & delivery',
    eyebrow: 'How your box gets to you',
    intro:
      'We ship the morning after your order is placed. Perishable items ship in temperature-controlled packaging with gel packs.',
    sections: [
      {
        heading: 'Coverage',
        body: [
          'India — we ship to most pincodes via our logistics partner. Check delivery by entering your pincode on the product page.',
          'International — coming soon as part of the Phase 2 diaspora launch.',
        ],
      },
      {
        // The SLA is a recorded value, so it reads as one: destination as the
        // pre-printed label, transit window as the typed value on a ruled row.
        heading: 'Timelines',
        rows: [
          { label: 'Khammam + Hyderabad', value: 'NEXT DAY' },
          { label: 'Telangana + Andhra Pradesh', value: '1–2 BUSINESS DAYS' },
          { label: 'Rest of India', value: '3–5 BUSINESS DAYS' },
        ],
        body: ['Perishable items may have shorter cutoff windows during Indian summer.'],
      },
      {
        heading: 'Packaging',
        body: [
          'Every box includes a paisley-tagged ribbon, a signed note, and shelf-life clearly marked on each product.',
          'Corporate and wedding orders ship in logo-printed boxes with personalised messages on request.',
        ],
      },
      {
        heading: 'How perishables travel',
        body: [
          'The milk- and cream-led sweets — the Hyderabadi range in particular — ship in insulated packaging with gel packs, and we hold them back rather than dispatch them into a delivery window they will not survive. If your pincode falls outside the transit time a perishable needs, the product page will say so before you order rather than after.',
          'The shelf-stable range — barfis, laddoos, mysore pak, namkeens, podis and pickles — travels anywhere in India without special handling, which is why it is the range we recommend for gifting to an address you cannot verify will be occupied.',
        ],
      },
      {
        heading: 'Tracking and delivery attempts',
        body: [
          'A tracking link goes out by email and SMS when the box is dispatched. Corporate orders shipping to many addresses get per-recipient tracking rather than a single consignment number.',
          'Couriers make up to three delivery attempts. Because these are perishables, an undelivered box cannot be re-dispatched after it is returned to us — so please make sure someone can receive it, particularly for a gift going to an office.',
        ],
      },
      {
        heading: 'Ordering ahead of a festival',
        body: [
          'Allow at least three clear days before a festival for the fresh range, on top of the transit time to your pincode. Each festival page shows the order-by date we calculate from that occasion.',
          'Nothing here is made in advance and held, so the lead time is a production constraint rather than a scheduling preference. Ordering early genuinely helps; ordering late cannot always be honoured.',
        ],
      },
    ],
    updated: '2026-04-22',
  },
  cancellation: {
    title: 'Cancellation',
    eyebrow: 'Before your box is dispatched',
    intro:
      'You can cancel an order up until it enters packing. After that, we’ve already committed the ingredients and a cancellation is treated as a return.',
    sections: [
      {
        heading: 'Before packing',
        body: [
          'Email support@ravisweets.com with your order number — we cancel and refund on the same payment method.',
          'Packing usually begins the morning after an order is placed, so a cancellation sent the same evening will almost always reach us in time. There is no cancellation fee and no reason required.',
        ],
      },
      {
        heading: 'After packing',
        body: [
          'The box is already made. We offer a pause-and-reship option (useful for gifting) instead of outright cancellation.',
          'This is not a policy written to be awkward. Nothing we make carries a preservative, so a box is produced against your specific order rather than pulled from stock — once the ingredients are committed and the sweets are made, they cannot go back into inventory and be sold to somebody else.',
        ],
      },
      {
        heading: 'Festival and corporate orders',
        body: [
          'Festival runs are produced in a fixed quantity against a calendar date, and the ingredients for a run are committed in advance. Cancellations on a festival order are accepted up to the order-by date shown on that festival’s page; after it, the pause-and-reship option applies instead.',
          'Corporate orders with logo printing are committed once you approve the printed proof, because the packaging is produced specifically for you. Your account manager will confirm the exact cut-off in writing before anything goes to print.',
        ],
      },
      {
        heading: 'How the refund reaches you',
        body: [
          'Refunds go back to the original payment method — card, UPI or netbanking — and typically land within 3–7 business days once we have raised them. For COD orders we transfer to a bank account you nominate, usually within 5–10 business days.',
          'You will get an email confirming the cancellation before the refund is raised, so there is never a silent period where you are unsure whether it went through.',
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

  // Bare policy titles ("Privacy", "Cancellation") sat under the 30-character
  // floor once the layout suffix landed; the eyebrow already written for each
  // page is the natural second clause.
  const title = seoTitle(p.title, p.eyebrow);
  const description = seoDescription(
    p.intro,
    'Ravi Sweets, Khammam — hand-made sweets delivered across India.',
  );

  return {
    title,
    description,
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POLICIES[slug as Slug];
  if (!p) notFound();

  return (
    <article className="container-site section-y">
      <div className="mb-8">
        <Link
          href="/"
          className="text-theme-ink/70 hover:text-theme-accent inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      <Reveal>
        <div className="docket-head">
          <div>
            <h1 className="font-display text-display-md text-theme-ink md:text-display-lg leading-[1.02]">
              {p.title}
            </h1>
            <p className="text-text-muted mt-2 text-sm">{p.eyebrow}</p>
          </div>
          <p className="flex items-baseline gap-2">
            <span className="field-label">Last updated</span>
            <span className="field-value text-theme-ink text-sm">{p.updated}</span>
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="text-theme-ink/80 max-w-3xl text-lg leading-relaxed">{p.intro}</p>
      </Reveal>

      <div className="mt-12 grid gap-10">
        {p.sections.map((s, i) => (
          <Reveal key={s.heading} delay={0.05 + i * 0.06}>
            <section>
              <h2 className="font-display text-heading text-theme-ink">{s.heading}</h2>
              {s.rows && (
                <dl className="mt-3 max-w-xl">
                  {s.rows.map((r) => (
                    <div key={r.label} className="field-row">
                      <dt className="field-label">{r.label}</dt>
                      <dd className="field-value text-theme-ink text-sm font-bold">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {s.body.length > 0 && (
                <ul className="text-theme-ink/80 mt-3 flex flex-col gap-2">
                  {s.body.map((b, j) => (
                    <li key={j} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
