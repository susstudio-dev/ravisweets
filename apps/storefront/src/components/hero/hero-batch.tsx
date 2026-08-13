'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { type Product } from '@ravisweets/shared';
import { signatureBestsellers } from '@/lib/signature';
import { Grain } from '@/components/brand/grain';
import { shapeForTitle, SpecimenMark } from '@/components/brand/specimen-mark';
import { HeroAmbient } from '@/components/hero/hero-ambient';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';
import { isUsableImage } from '@/lib/images';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';

/**
 * THE FESTIVAL BATCH — the first viewport.
 *
 * The system frames, the festival fills. On the docket ground, the hero is a
 * warm festival card being stamped for dispatch — an invitation, not an
 * invoice. The docket system survives as the stationery: ruled fields, typed
 * values, square-cut edges. The full ledger the owner rejected twice is
 * compressed into three artifacts: the proof block, the red dispatch seal
 * (which carries today's date), and one ember live-row.
 *
 * LEFT COLUMN ORDER, and why. Eyebrow, headline, body, actions, deadline
 * chip, proof block. It previously ran eyebrow, headline, DEADLINE, body,
 * actions, PROOF ROW — six full-width text blocks on one margin rhythm, with
 * the deadline and the proof row set identically (caps, tracking, .fb-tick)
 * despite doing opposite jobs. Nothing after the headline held the eye. Now
 * each element has one job and one form: the deadline is a boxed stamp beside
 * the actions it should drive, and trust is a ruled three-cell block whose
 * numerals give the column its second stop.
 *
 * CALENDAR-AWARE, NEVER A CAROUSEL. The festival slot resolves from the date
 * (Rakhi window now, Diwali later) — the hero knows what week it is without
 * auto-rotating anything.
 *
 * MOTION THESIS (one authored sequence, then stillness):
 *   0–480ms  headline word-groups rise (.fb-word, staggered)
 *   ~600ms   typed values tick in (.fb-tick) — the form completing itself
 *   ~900ms   the red seal thunks (.fb-seal), rests at a hand-stamped angle
 * Bounded loops only: the dispatch ticker (≥38s linear), two bobbing cutouts,
 * the ember pulse. Everything is transform/opacity and dies under
 * prefers-reduced-motion via the global block in globals.css.
 *
 * RED DISCIPLINE: kumkum red (--color-brand, #CC0000 — the logo's own red
 * darkened until it passes AA as ink) is celebration/certification ink. It
 * appears EXACTLY ONCE in the left column, on the deadline chip, plus the
 * seal on the card. Blue keeps the interactive monopoly. Ember stays
 * live-state. If you are about to add a third red thing here, don't.
 *
 * The DB-driven text contract is preserved: same eight fields, same `??`
 * precedence (site_content → theme preset → code default).
 */

/** Owner correction, 2026-08-03: founded 1983, not 1985. */
const FOUNDED = '1983';

/**
 * STALE-COPY QUARANTINE. The hero strings resolve from Supabase first, and
 * the live rows still carry the retired locality-led copy ("Khammam ·
 * Telangana", "The sweetness of Telangana…") until migration
 * 0012_global_voice.sql is run. The owner has explicitly rejected that copy
 * twice, so it falls through to the new defaults rather than overriding them.
 * Delete this whole block once 0012 has run.
 *
 * QUARANTINE THE ROW, NOT THE FIELD. This was a per-string test, which let a
 * half-retired hero through: `headline` and the eyebrows matched and fell back
 * to the global-voice defaults, but `primaryCtaLabel` / `primaryCtaHref` named
 * no town, so they kept the live row's values. The hero then rendered the new
 * headline above the old locality-led call to action — verified against the
 * database, where the hero row still holds:
 *
 *     headline        "The sweetness of Telangana, slow-cooked in Khammam."
 *     primaryCtaLabel "Shop Hyderabadi specials"
 *     primaryCtaHref  "/category/hyderabadi-specials"
 *
 * Staleness is a property of the ROW — that row is the retired copy set — so
 * one retired string now disqualifies every field in it and the hero speaks
 * with one voice. Note the CTA target is a real category with five products
 * and is NOT itself retired copy; it is dropped only because it belongs to a
 * retired row, which is also why the pattern is deliberately not widened to
 * "hyderabad" and must never be.
 *
 * "family kitchen" joined the pattern 2026-08-11: the owner retired the
 * small-kitchen positioning ("we are a global brand, we have a very huge
 * kitchen"), and the live site_content row — written by 0012 — carries
 * 'Family kitchen' as the eyebrow, so it must fall through to the new
 * defaults. Same quarantine, next ring.
 *
 * "mithai house" joined it 2026-08-12 as well: the owner retired the phrase
 * that replaced "family kitchen" only a day earlier ("it is making the product
 * unprofessional"), so the eyebrow now resolves to NO English descriptor at
 * all. The ring matters because 0019 — should anyone paste it despite its
 * superseded header — writes 'Mithai house' into exactly this field.
 *
 * "today's batch" joined it 2026-08-12: the owner retired BATCH along with the
 * family framing, and the live rows carry 'Shop today''s batch' as the CTA
 * label — site_content from 0012 and theme_presets from 0017. Both are now
 * fixed by 0020_global_kitchen_voice.sql.
 *
 * NOTE the pattern is deliberately "today's batch" and "small batch", never a
 * bare /batch/. This regex disqualifies an ENTIRE ROW on one match, and the
 * word appears in legitimate copy the owner has not retired — the dispatch
 * seal's own date line among it. A bare match would quarantine hero rows that
 * are perfectly current and strand the owner's edits with no visible cause.
 *
 * Delete each ring only after its migration has actually run — verify against
 * the database, not against the presence of the .sql file. 0019 sat unapplied
 * in this repo for a month while its ring looked safe to remove.
 */
const RETIRED_COPY =
  /khammam|telangana|ఖమ్మం|family kitchen|mithai house|today['’]s batch|small batch/i;

function live<T>(row: T | null | undefined): T | undefined {
  if (row == null) return undefined;
  return RETIRED_COPY.test(JSON.stringify(row)) ? undefined : row;
}

/** Blank and whitespace-only are ABSENT, not values — see heroEyebrowIndic. */
function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Mirrors the calendar in festival-next-band.tsx (shared module is phase 4b). */
const FESTIVALS = [
  {
    slug: 'independence-day',
    title: 'Independence Day',
    telugu: 'స్వాతంత్ర్య దినోత్సవం',
    date: '2026-08-15',
  },
  { slug: 'raksha-bandhan', title: 'Raksha Bandhan', telugu: 'రక్షా బంధన్', date: '2026-08-28' },
  { slug: 'diwali', title: 'Diwali', telugu: 'దీపావళి', date: '2026-11-08' },
  { slug: 'christmas', title: 'Christmas', telugu: 'క్రిస్మస్', date: '2026-12-25' },
  { slug: 'sankranti', title: 'Sankranti', telugu: 'సంక్రాంతి', date: '2027-01-14' },
  { slug: 'holi', title: 'Holi', telugu: 'హోలీ', date: '2027-03-13' },
  { slug: 'ugadi', title: 'Ugadi', telugu: 'ఉగాది', date: '2027-03-19' },
] as const;

/** Dispatch needs three clear days before the festival for the fresh range. */
const ORDER_BY_LEAD_DAYS = 3;

function formatDocketDate(d: Date): string {
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function nextFestival(now: Date) {
  const t = now.getTime();
  return (
    FESTIVALS.find((f) => new Date(`${f.date}T23:59:59+05:30`).getTime() > t) ??
    FESTIVALS[FESTIVALS.length - 1]!
  );
}

export function HeroBatch() {
  const { hero } = useSiteContent();
  const { active: theme } = useActiveTheme();

  /*
   * Client-resolved date: the static export's prerendered date goes stale the
   * next morning; the build date paints first (no LCP flash), the real date
   * corrects it within a frame.
   */
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
  }, []);

  const fest = nextFestival(now);
  const orderBy = new Date(`${fest.date}T00:00:00+05:30`);
  orderBy.setDate(orderBy.getDate() - ORDER_BY_LEAD_DAYS);

  /*
   * Each source is admitted or rejected WHOLE, so the two never interleave
   * into a hero that half-quotes a retired row. Precedence is unchanged:
   * site_content -> theme preset -> code default.
   */
  const db = live(hero);
  const preset = live(theme?.hero);

  /*
   * `??` is not enough on the Indic mark. The theme preset's `eyebrow` is ONE
   * string that this line splits for the Telugu and reads whole for the
   * English, so the moment that field is blank — which is now its resting
   * state — `''.split('·')[0].trim()` yields '' and `??` passes it straight
   * through, taking the Telugu brand mark off the hero with it. Empty must be
   * treated as ABSENT here, not as a value.
   */
  const heroEyebrowIndic =
    nonEmpty(db?.eyebrowIndic) ?? nonEmpty(preset?.eyebrow?.split('·')[0]) ?? 'రవి స్వీట్స్';
  /*
   * NO ENGLISH DESCRIPTOR AT ALL — owner, 2026-08-12: "we don't have to say
   * this, it is making the product unprofessional". This slot has now been
   * "Khammam · Telangana" (too local), "Family kitchen" (too small) and
   * "Mithai house" (too twee); the through-line is that a self-applied label
   * reads as a brand explaining itself. The line is stronger as the Telugu
   * mark and the year: రవి స్వీట్స్ · EST 1983.
   *
   * `??` and NOT `||`, deliberately: an empty string from the database means
   * the owner cleared the field and must be honoured, while undefined means
   * "not set" and falls through. The render below drops the span when blank,
   * so no stray separator is left behind.
   */
  const heroEyebrowEn = db?.eyebrowEn ?? preset?.eyebrow ?? '';
  const heroHeadline =
    db?.headline ?? preset?.headline ?? 'Made this morning. Nothing added to make it last.';
  /*
   * The three names lead with the signature range (Kaju Katli is the brand
   * mark itself), not the Hyderabadi specials — Qubani fronted this line by
   * inheritance from the old locality-led positioning, and the owner flagged
   * it (2026-08-11). Keep these three in step with SIGNATURE_ORDER in
   * lib/signature.ts, which picks the festival-card cutouts below.
   */
  const heroBody =
    db?.body ??
    preset?.body ??
    `Kaju Katli, Gulab Jamun, Motichoor Ladoo — sweets, namkeens and gift hampers made fresh every morning since ${FOUNDED}. Order from anywhere; delivered fresh to any address in India.`;
  const primaryCtaLabel = db?.primaryCtaLabel ?? preset?.ctaLabel ?? "Shop today's sweets";
  /*
   * Resolved from the SAME admitted source as the label above. Read
   * independently these can desynchronise — one source's wording pointing at
   * another's URL, which is worse than either on its own.
   */
  const primaryCtaHref = db?.primaryCtaHref ?? preset?.ctaHref ?? '/shop';

  /*
   * SENTENCE BLOCKS, WORD STAGGER WITHIN.
   *
   * The headline is two sentences, and the previous cut let them wrap as one
   * run of words — so at the container's measure it broke as "Made this /
   * morning." and orphaned half a sentence onto its own line. Each sentence
   * is now its own block, so a sentence can never be split from the one after
   * it; inside a sentence the words still wrap like normal prose.
   *
   * Deliberately derived from the string rather than hardcoded, because the
   * headline resolves from Supabase — whatever the owner types keeps this
   * behaviour, including a single-sentence headline (one block, unchanged).
   *
   * One span PER WORD, with the spaces as plain text nodes BETWEEN the spans.
   * An earlier cut grouped words in twos and put the space inside each span;
   * inline-block trims its own trailing whitespace, which fused adjacent
   * groups on the same line ("make itlast"), and a multi-word inline-block
   * cannot wrap internally, which overflowed the whole page at 390px. Words
   * separated by real text-node spaces wrap like normal prose.
   *
   * The stagger counter runs ACROSS sentences, so the authored 0-480ms rise
   * is unchanged — the blocks are a wrapping fix, not a new motion beat.
   */
  let staggerIndex = 0;
  const headlineLines = (heroHeadline.match(/[^.!?]+[.!?]*/g) ?? [heroHeadline])
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) =>
      sentence.split(/\s+/).map((word) => ({ word, delay: staggerIndex++ * 0.06 })),
    );

  /*
   * THE PROOF BLOCK. Three ruled cells replacing the single tracked-out line
   * that used to close this column — it was typographically identical to the
   * festival deadline above it (same caps, same tracking, same .fb-tick), so
   * the two read as a matched pair and each blunted the other.
   *
   * Numerals carry it, in the display face; the labels stay quiet. Not red:
   * after this change the brand red appears exactly ONCE in the left column,
   * on the deadline chip, which is the only thing here that is urgent.
   */
  const proof = [
    { value: FOUNDED, label: 'established' },
    { value: 'NIL', label: 'preservatives' },
    { value: 'Same-day', label: 'dispatch' },
  ];

  const cutouts = signatureBestsellers().slice(0, 3);

  return (
    <section
      aria-label="Hero"
      className="bg-theme-base text-theme-ink relative isolate -mt-16 overflow-hidden pt-16"
    >
      {/*
        The scrolling red ticker that ran here was cut on owner feedback
        ("a little disturbing"). Red now enters the hero only as the seal and
        the festival line — ink, not a moving band.
      */}
      <HeroAmbient />
      {/*
        Default STRETCH, not items-start: top-alignment left the festival card
        ending mid-column with dead cream below it at every width above lg —
        the owner's screenshot called it out. The card column now stretches to
        the left column's height and the card itself spreads its rows
        (flex-col, cutouts centred in the growing middle), so the two columns
        end together. The shared baseline at the eyebrow is unchanged.
      */}
      <div className="container-site relative z-10 grid gap-8 pb-8 pt-4 md:pb-10 md:pt-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-14">
        {/* ── THE WORD ─────────────────────────────────────────────────── */}
        <div>
          {/* The English descriptor is optional and normally absent — the mark
              and the year carry this line. `· EST` keeps its leading separator
              only when something precedes it. */}
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="font-indic text-theme-accent text-lg leading-none">
              {heroEyebrowIndic}
            </span>
            {heroEyebrowEn.trim() && <span className="field-label">{heroEyebrowEn}</span>}
            <span className="field-label">· EST {FOUNDED}</span>
          </p>

          {/*
            The lg cap lowers text-display-xl's ceiling from 5rem to 4rem in
            THIS column only. The 4.4rem cut (which itself fixed the "Made
            this / morning." orphan — first sentence 634px in a 650px column)
            still pushed the proof row below the fold on the owner's ~774px
            effective viewport, screenshot 2026-08-11. At 4rem the first
            sentence needs ~576px, so the no-orphan property holds with more
            slack, and the whole column — eyebrow to proof — fits a 768px
            viewport with the header above it. The clamp's lower half is
            untouched; the token itself is left alone (seven other headings
            use text-display-xl at max-w-3xl/4xl, where it is not too big).

            The second sentence still wraps to two lines by design — fitting it
            on one would need 46px type, which is not a hero.
          */}
          <h1
            key={heroHeadline}
            className="font-display text-display-xl mt-2 font-semibold lg:text-[clamp(2.75rem,1.9rem+2.9vw,4rem)] lg:leading-[1.05] lg:tracking-[-0.012em]"
          >
            {headlineLines.map((line, li) => (
              <span key={li} className="block text-balance">
                {line.map(({ word, delay }, wi) => (
                  <Fragment key={wi}>
                    {wi > 0 ? ' ' : null}
                    <span className="fb-word" style={{ animationDelay: `${delay}s` }}>
                      {word}
                    </span>
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-text-muted mt-3 max-w-[52ch] leading-relaxed">{heroBody}</p>

          {/*
            CTAs come BEFORE the proof — owner feedback: the actions were
            landing below the fold.
          */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={primaryCtaHref} className="stamp">
              {primaryCtaLabel}
            </Link>
            <Link href={`/festivals/${fest.slug}`} className="stamp stamp--ghost">
              {fest.title} hampers
            </Link>
          </div>

          {/*
            THE DEADLINE CHIP. This ran full-width directly under the headline,
            set in the same caps/tracking/.fb-tick as the proof row below it —
            two lines doing opposite jobs (urgency, trust) in one typographic
            register, so each blunted the other. It is the only urgent thing in
            this column, so it now sits WITH the actions and is boxed like a
            stamp rather than set like a caption. `border-current` keeps ink and
            rule on a single declaration.

            "Delivered across India" moved out: it is reach, not a deadline,
            and the body copy above already says it.
          */}
          <div className="mt-3">
            <p
              className="fb-tick field-value inline-flex flex-wrap items-baseline gap-x-2 border border-current px-2.5 py-1.5 text-[11px] font-bold tracking-[0.08em]"
              style={{ color: 'var(--color-brand)' }}
              suppressHydrationWarning
            >
              <span>{fest.title.toUpperCase()}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span>ORDER BY {formatDocketDate(orderBy)}</span>
            </p>
          </div>

          {/* The proof block — the docket's field rows, given room to count. */}
          <ul className="fb-tick mt-5 grid max-w-[27rem] grid-cols-3 border-y border-[color:var(--color-rule)]">
            {proof.map((item, i) => (
              <li
                key={item.label}
                className={cn(
                  'py-2.5',
                  i > 0 && 'border-l border-[color:var(--color-rule)] pl-4',
                )}
              >
                <span className="font-display block text-xl leading-none md:text-2xl">
                  {item.value}
                </span>
                <span className="field-label mt-1.5 block">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── THE FESTIVAL CARD ────────────────────────────────────────── */}
        <Reveal delay={0.1} className="h-full">
          <div
            className="relative flex h-full flex-col rounded-xl border border-[color:var(--color-border)] p-6 pb-5 pt-10 shadow-soft"
            style={{ backgroundColor: 'var(--theme-glow)' }}
          >
            {/* Tape corners — the card is pinned up in the kitchen. */}
            <span
              aria-hidden="true"
              className="absolute -top-2.5 left-8 h-5 w-16 -rotate-3 border border-white/40 bg-white/45"
            />
            <span
              aria-hidden="true"
              className="absolute -top-2.5 right-16 h-5 w-16 rotate-2 border border-white/40 bg-white/45"
            />

            {/* Festival line-work in kumkum ink. */}
            <FestivalLinework slug={fest.slug} />

            <p className="field-label mt-3 text-center" style={{ color: 'var(--color-brand)' }}>
              <span className="font-indic text-base normal-case tracking-normal">
                {fest.telugu}
              </span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {fest.title} {new Date(fest.date).getFullYear()}
            </p>

            {/* The cutouts — bobbing chips: product photos when usable,
                specimen marks until then. flex-1 centres them in whatever
                height the stretched card gains, so a tall left column reads
                as a taller card rather than as dead cream below a short one. */}
            {/* gap-3 + w-20 on phones: three 96px chips overflowed a 390px
                viewport, forced the hero's single column wider than the
                screen, and the section's overflow-hidden clipped every line
                on the page at the right edge. */}
            <div className="mt-5 flex flex-1 flex-wrap content-center items-center justify-center gap-3 md:gap-4">
              {cutouts.map((p, i) => (
                <FestivalCutout key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* The live row — ember means exactly this. */}
            <p className="mt-5 flex justify-center">
              <span className="live-mark">Made fresh this morning</span>
            </p>

            {/*
              THE DISPATCH SEAL. Thunks in at ~900ms, rests at a stamped angle.
              This block becomes the real logo roundel when the owner's logo
              file arrives — same position, same animation.
            */}
            <div
              className="fb-seal absolute -right-3 -top-5 flex h-[6.5rem] w-[6.5rem] flex-col items-center justify-center gap-0.5 rounded-md border-2 bg-[color:var(--theme-base)]/80 text-center"
              style={{
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)',
                boxShadow: 'inset 0 0 0 1.5px var(--theme-base), inset 0 0 0 2.5px var(--color-brand)',
              }}
            >
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.1em]">
                Ravi Sweets
              </span>
              <span className="field-label" style={{ color: 'var(--color-brand)' }}>
                Fresh today
              </span>
              <span className="field-value text-[11px] font-bold" suppressHydrationWarning>
                {formatDocketDate(now)}
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      <Grain />
    </section>
  );
}

/* ── FESTIVAL PIECES ───────────────────────────────────────────────────── */

/**
 * Thin celebration line-work in kumkum ink, per occasion: the rakhi thread
 * with its knot, diya flames for Diwali, a plain double rule otherwise.
 * Decorative, aria-hidden, 4.58:1 on the manila ground.
 */
function FestivalLinework({ slug }: { slug: string }) {
  const stroke = {
    stroke: 'var(--color-brand)',
    strokeWidth: 1.75,
    fill: 'none',
  } as const;
  return (
    <svg viewBox="0 0 320 28" className="mx-auto block h-7 w-full max-w-[320px]" aria-hidden="true">
      {slug === 'raksha-bandhan' ? (
        <>
          {/* The thread */}
          <path d="M0 14 C 60 8, 110 20, 148 14" {...stroke} strokeLinecap="round" />
          <path d="M172 14 C 210 8, 260 20, 320 14" {...stroke} strokeLinecap="round" />
          {/* The knot */}
          <circle cx="160" cy="14" r="8" {...stroke} />
          <circle cx="160" cy="14" r="3" fill="var(--color-brand)" />
          <path d="M152 22 l-4 4 M168 22 l4 4" {...stroke} strokeLinecap="round" />
        </>
      ) : slug === 'diwali' ? (
        <>
          <path d="M0 18 H 120 M200 18 H 320" {...stroke} strokeLinecap="round" />
          {/* Three diya flames */}
          {[140, 160, 180].map((x) => (
            <g key={x}>
              <path d={`M${x - 7} 18 Q ${x} 24 ${x + 7} 18 Z`} fill="var(--color-brand)" />
              <path d={`M${x} 15 Q ${x - 3} 10 ${x} 6 Q ${x + 3} 10 ${x} 15`} {...stroke} />
            </g>
          ))}
        </>
      ) : slug === 'independence-day' ? (
        <>
          {/* The chakra between two rules — one ink, so the wheel carries it. */}
          <path d="M0 14 H 138" {...stroke} strokeLinecap="round" />
          <path d="M182 14 H 320" {...stroke} strokeLinecap="round" />
          <circle cx="160" cy="14" r="11" {...stroke} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={160 + 3 * Math.cos(a)}
                y1={14 + 3 * Math.sin(a)}
                x2={160 + 9.5 * Math.cos(a)}
                y2={14 + 9.5 * Math.sin(a)}
                stroke="var(--color-brand)"
                strokeWidth="1"
              />
            );
          })}
        </>
      ) : (
        <>
          <path d="M0 11 H 320" {...stroke} strokeLinecap="round" />
          <path d="M0 17 H 320" {...stroke} strokeLinecap="round" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

/**
 * A cutout pinned to the festival card: a small docket chip, gently bobbing.
 * When the product has a usable photo (owner-edited DB overlay first, then
 * the static catalogue) it renders in the frame; otherwise the sweet's
 * specimen figure stands in. The bob and caption stay either way.
 */
function FestivalCutout({ product, index }: { product: Product; index: number }) {
  const { productImages } = useSiteContent();
  const [imgFailed, setImgFailed] = useState(false);
  const shape = shapeForTitle(product.title, index);
  const pal = product.theme_palette;
  const tilt = [-2.5, 1.5, 3][index % 3];

  const primary = (productImages[product.id] ?? product.images)[0];
  const photo = primary && !imgFailed && isUsableImage(primary.url) ? primary : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'fb-bob group bg-surface-elevated block w-20 rounded-lg border border-[color:var(--color-border)] p-2 pb-1.5 shadow-soft transition-shadow hover:shadow-lifted md:w-32',
      )}
      style={{
        rotate: `${tilt}deg`,
        animationDelay: `${index * 1.7}s`,
        animationDuration: `${5.5 + index}s`,
      }}
    >
      <span
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md"
        style={{ backgroundColor: `${pal.glow}4D` }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt=""
            fill
            sizes="(min-width: 768px) 128px, 80px"
            className="object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <SpecimenMark shape={shape} color={pal.accent} className="h-10 w-10 md:h-14 md:w-14" />
        )}
      </span>
      <span className="group-hover:text-theme-accent mt-1.5 block truncate text-center text-[11px] font-semibold transition-colors">
        {product.title}
      </span>
    </Link>
  );
}
