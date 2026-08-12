import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { EssenceCarousel, type EssencePiece } from '@/components/essence/essence-carousel';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'The Essence · Ten-piece Collector Drop',
  description:
    'Ten single-bite sweets that exist nowhere else — protein-led, no refined sugar, built on desi superfoods. A numbered drop of 500 boxes, rotated every season.',
  alternates: { canonical: '/essence' },
};

/**
 * THE ESSENCE — the Vault 10 (VAULT_10_PLAN.md) as a storefront page.
 *
 * Owner request 2026-08-11: "a section called essence in the header where
 * only ten exclusive items will be sold which will be changed rotationally."
 * That is the Vault 10 drop model: a serialised box of ten single-bite
 * pieces, 500 numbered boxes per drop, 2–3 pieces swapped each season.
 *
 * THIS PAGE IS THE ANNOUNCEMENT AND THE WAITLIST, NOT THE CHECKOUT. Selling
 * a numbered drop needs serial allocation, cold-chain pin-code gating and
 * prepaid-only enforcement (plan §7) — a separate workstream. Until that
 * ships, intent lands on WhatsApp, which is the brand's highest-intent
 * channel anyway (plan §8.4).
 *
 * ── THE ROOM IS DARK, AND THAT IS THE POINT (owner, 2026-08-12: "make it look
 * very premium"). The shop is cream; Essence is carbon. Walking from /shop to
 * /essence should feel like stepping out of the counter and into the vault.
 * This costs nothing to build: `data-register="carbon"` re-themes an entire
 * subtree through custom properties with no component changes (globals.css).
 * Do NOT hand-write dark colours inside it — use the theme tokens, which have
 * already been contrast-checked for this register.
 *
 * ROTATION: swap entries in PIECES and bump DROP for each new drop — the
 * page is rebuilt on admin Publish like the rest of the catalogue.
 *
 * COMPLIANCE (plan §2 — do not "improve" the copy past it):
 *   - No per-piece protein/sugar numbers until the NABL panels exist.
 *   - Piece 10 is a "cultured-milk sweet" — the word "probiotic" stays off
 *     the storefront until the FSSAI nutraceutical filing is done.
 *   - No liquid-nitrogen theatre anywhere, ever (FSSAI advisory 03-06-2024).
 */

const DROP = {
  number: '01',
  season: 'Diwali 2026',
  boxes: 500,
  price: '₹2,400',
};

const WA_TEXT = encodeURIComponent(
  `Hi Ravi Sweets — put me on The Essence waitlist for Drop ${DROP.number}.`,
);
const WA_HREF = `https://wa.me/919398859978?text=${WA_TEXT}`;

/*
 * `ink` is each piece's flavour colour and `shape` its specimen figure —
 * there are no photographs of these pieces (they do not exist yet outside the
 * plan), so the card carries the sweet's FORM in its own colour rather than a
 * grey box or, worse, a stock photo of somebody else's confectionery.
 *
 * Every ink is chosen to stay luminous on the carbon ground. If you add a
 * piece, pick a colour that reads against #2b2620, not against cream.
 */
const PIECES: EssencePiece[] = [
  {
    no: '01',
    name: 'Apricot-Almond Caviar',
    line: 'Hung-curd cream under pearls of apricot, gelatin-free.',
    technique: 'Reverse spherification',
    heritage: 'Nizami Qubani',
    fresh: true,
    ink: '#F2A65A',
    shape: 'scatter',
  },
  {
    no: '02',
    name: 'Smoked Sattu-Pista Barfi',
    line: 'Sattu and pista, jaggery only, charcoal-ghee smoke sealed in the pack.',
    technique: 'Dhungar smoke-trap',
    heritage: 'Hyderabadi dhungar',
    fresh: false,
    ink: '#9CBE5C',
    shape: 'diamond',
  },
  {
    no: '03',
    name: 'Saffron Rabri Bonbon',
    line: 'A liquid rabri centre under vegetarian 24-karat gold.',
    technique: 'Liquid-centre moulding',
    heritage: 'Shahi Tukda',
    fresh: true,
    ink: '#E8B33A',
    shape: 'round',
  },
  {
    no: '04',
    name: 'Til Noir',
    line: 'Black sesame and black chana, seamed with vegetarian silver.',
    technique: 'Kintsugi vark work',
    heritage: 'Sankranti til',
    fresh: false,
    ink: '#B9BCC4',
    shape: 'diamond',
  },
  {
    no: '05',
    name: 'Paan Cloud',
    line: 'An aerated after-meal paan, frozen and served still.',
    technique: 'Aeration + deep freeze',
    heritage: 'After-meal paan',
    fresh: true,
    ink: '#6FBF87',
    shape: 'round',
  },
  {
    no: '06',
    name: 'Filter-Coffee Mysore Pak Truffle',
    line: 'Besan Mysore Pak around a filter-coffee decoction, jaggery only.',
    technique: 'Decoction ganache',
    heritage: 'Filter kaapi × Mysore Pak',
    fresh: false,
    ink: '#C08552',
    shape: 'round',
  },
  {
    no: '07',
    name: 'Mango Glass',
    line: 'Clarified mango set to a transparent sheet over cultured shrikhand.',
    technique: 'Fruit-glass clarification',
    heritage: 'Aam papad',
    fresh: false,
    ink: '#F0B429',
    shape: 'diamond',
  },
  {
    no: '08',
    name: 'Gongura Dark Bonbon',
    line: 'Dark couverture, gongura and a measured heat of Guntur chilli.',
    technique: 'Tempered enrobing',
    heritage: 'Andhra gongura',
    fresh: false,
    ink: '#D2544F',
    shape: 'round',
  },
  {
    no: '09',
    name: 'Makhana-Millet Bidri Bar',
    line: 'Popped makhana, ragi and dates, printed with an edible Bidri motif.',
    technique: 'Edible-silver printing',
    heritage: 'Bidriware craft',
    fresh: false,
    ink: '#8FA9C6',
    shape: 'diamond',
  },
  {
    no: '10',
    name: 'Living Rabri',
    line: 'A cultured-milk rabri, set slow, finished with date fibre.',
    technique: 'Slow culturing',
    heritage: 'Rabri / shrikhand',
    fresh: true,
    ink: '#EFE3C8',
    shape: 'coil',
  },
];

export default function EssencePage() {
  return (
    <>
      {/* ── THE VAULT ───────────────────────────────────────────────── */}
      {/* One carbon subtree spans the claim AND the carousel, so the room does
          not change colour halfway down the experience. */}
      <div data-register="carbon" className="bg-theme-base text-theme-ink">
        <section className="container-site section-y">
          <Reveal>
            <p className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-indic text-theme-accent text-lg leading-none">ఎసెన్స్</span>
              <span className="field-label">The Essence · Drop {DROP.number}</span>
              <span className="field-label">· {DROP.season}</span>
            </p>
            <h1 className="font-display text-display-lg md:text-display-xl mt-3 max-w-4xl leading-[1.04]">
              Ten sweets that exist nowhere else. {DROP.boxes} numbered boxes. Then gone.
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-theme-ink/70 mt-5 max-w-2xl text-lg leading-relaxed">
              A collector box of ten single-bite pieces — protein-led, free of refined sugar,
              built on desi superfoods, each pairing a real technique with a Hyderabadi or
              Andhra heritage cue. Eaten in order, 01 to 10. Every season, two or three
              pieces rotate out and the drop is numbered again.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href={WA_HREF} target="_blank" rel="noreferrer" className="stamp">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Join the waitlist on WhatsApp
              </a>
              <p className="field-value text-theme-ink text-sm font-bold">
                {DROP.price} · THE BOX OF TEN
              </p>
            </div>
          </Reveal>

          {/* The drop's terms, as ruled proof cells — same grammar as the hero. */}
          <Reveal delay={0.18}>
            <ul className="mt-9 grid max-w-[36rem] grid-cols-3 border-y border-[color:var(--color-rule)]">
              {[
                { value: DROP.boxes, label: 'numbered boxes' },
                { value: '10', label: 'pieces, eaten in order' },
                { value: 'Quarterly', label: 'rotation' },
              ].map((item, i) => (
                <li
                  key={item.label}
                  className={i > 0 ? 'border-l border-[color:var(--color-rule)] py-3 pl-4' : 'py-3'}
                >
                  <span className="font-display block text-xl leading-none md:text-2xl">
                    {item.value}
                  </span>
                  <span className="field-label mt-1.5 block">{item.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* ── THE TEN, IN THE ROUND ─────────────────────────────────── */}
        <section aria-labelledby="pieces-heading" className="container-site pb-16 md:pb-20">
          <Reveal>
            <div className="docket-head">
              <h2 id="pieces-heading" className="font-display text-display-md">
                The collection, 01 → 10
              </h2>
              <p className="field-label">Drop {DROP.number} manifest</p>
            </div>
          </Reveal>

          <EssenceCarousel pieces={PIECES} />
        </section>
      </div>

      {/* ── THE HONEST LINE ─────────────────────────────────────────── */}
      {/*
        Plan §1: the fresh pieces are Hyderabad pickup / metro cold-chain; the
        box still ships nationwide with a claim card for the rest. It sits on
        the cream ground deliberately — logistics truth is counter business,
        not vault theatre, and burying it in the dark would look like hiding it.
      */}
      <section className="container-site section-y-tight">
        <Reveal>
          <p className="text-text-muted mx-auto max-w-3xl text-sm leading-relaxed">
            The seven shelf-stable pieces courier anywhere in India. The fresh pieces are
            made within 48 hours of dispatch and travel cold-chain to metro pin codes —
            everywhere else, the box carries a claim card for the fresh three at our
            Hyderabad counter.
          </p>
        </Reveal>
      </section>

      {/* ── THE MANIFEST, AS SERVER-RENDERED HTML ───────────────────── */}
      {/*
        The carousel shows one piece's description at a time, so only the
        active piece's copy would otherwise reach a crawler. Same remedy the
        catalogue and category pages already use: the full set as a plain
        ruled list, rendered on the server. It reads as the box's packing note,
        so it earns its place for a person as well as a robot.
      */}
      <section aria-labelledby="manifest-heading" className="container-site section-y-tight">
        <div className="docket-head">
          <h2 id="manifest-heading" className="font-display text-heading text-theme-ink">
            Drop {DROP.number}, piece by piece
          </h2>
          <p className="field-label">Packing note</p>
        </div>
        <ol className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {PIECES.map((piece) => (
            <li
              key={piece.no}
              className="flex gap-4 border-b border-[color:var(--color-border)] pb-4"
            >
              <span className="field-value text-theme-accent shrink-0 text-sm font-bold">
                {piece.no}
              </span>
              <div>
                <h3 className="font-display text-theme-ink text-base leading-snug">{piece.name}</h3>
                <p className="text-text-muted mt-1 text-[13px] leading-relaxed">{piece.line}</p>
                <p className="field-label mt-1.5">
                  {piece.technique}
                  <span className="mx-1.5 opacity-40" aria-hidden="true">
                    ·
                  </span>
                  {piece.heritage}
                  <span className="mx-1.5 opacity-40" aria-hidden="true">
                    ·
                  </span>
                  {piece.fresh ? 'Fresh · Hyderabad' : 'Travels nationwide'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── THE CLOSE ───────────────────────────────────────────────── */}
      <section className="container-site section-y">
        <Reveal direction="up" distance={16}>
          <div data-register="carbon" className="bg-theme-base text-theme-ink p-7 md:p-10">
            <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-md">
                  Drop {DROP.number} opens with {DROP.season}.
                </h2>
                <p className="text-text-muted mt-4 text-sm leading-relaxed md:text-base">
                  The waitlist gets 24 hours before anyone else, and the box number you&rsquo;re
                  allotted is yours — {DROP.boxes} exist, each laser-etched. When they&rsquo;re
                  gone, the next chance is next season&rsquo;s rotation.
                </p>
              </div>
              <a href={WA_HREF} target="_blank" rel="noreferrer" className="stamp md:shrink-0">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Reserve your number
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
