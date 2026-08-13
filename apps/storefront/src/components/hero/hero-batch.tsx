'use client';

import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { Fragment, useEffect, useState, useTransition } from 'react';
import { computeEffectivePrice, formatMoney, type Product } from '@ravisweets/shared';
import { signatureBestsellers } from '@/lib/signature';
import { Grain } from '@/components/brand/grain';
import { HeroAmbient } from '@/components/hero/hero-ambient';
import { Reveal } from '@/components/motion/reveal';
import { useCart } from '@/lib/cart/cart-context';
import { cn } from '@/lib/cn';
import { cutoutFor } from '@/lib/cutouts';
import { isUsableImage } from '@/lib/images';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';

/**
 * THE HALF HERO — the first viewport, product-first.
 *
 * The system frames, the product fills. The left column carries the voice
 * (eyebrow, headline, body, actions, the festival deadline chip, a compact
 * proof strip); the right column is TODAY'S No.1 PLATE — the top-ranked sweet
 * cut out of its photograph and set on a soft glow, plated on the cream rather
 * than boxed in a photo, with its own one-tap add. A visitor can order the
 * day's best sweet without scrolling at all, and the trending shelf's first
 * cards crest the fold beneath it.
 *
 * THE PIVOT (owner-directed 2026-08-13). This column used to hold an elaborate
 * festival CARD (line-work, three bobbing cutout chips, a live row). The owner
 * asked to (a) halve the hero, (b) fill the open side with product rather than
 * ornament, and (c) not let the page read as cluttered. So the festival card is
 * retired here; festival awareness survives as the deadline chip and the
 * "<festival> hampers" action, and the whole right column now does one job —
 * sell the No.1 sweet — instead of three.
 *
 * CALENDAR-AWARE, NEVER A CAROUSEL. The festival slot resolves from the date
 * (Rakhi window now, Diwali later); the deadline chip counts to it. Nothing
 * auto-rotates.
 *
 * MOTION THESIS (one authored sequence, then stillness):
 *   0–480ms  headline word-groups rise (.fb-word, staggered)
 *   ~600ms   typed values tick in (.fb-tick) — the form completing itself
 *   ~900ms   the red dispatch seal thunks (.fb-seal), rests at a stamped angle
 * Ambient loops only: HeroAmbient's glow drift and steam, the ember pulse.
 * Everything is transform/opacity and dies under prefers-reduced-motion via the
 * global block in globals.css.
 *
 * RED DISCIPLINE: kumkum red (--color-brand) is celebration/certification ink —
 * the deadline chip and the seal, and nowhere else here. Blue keeps the
 * interactive monopoly; ember stays live-state.
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
 * no town, so they kept the live row's values. Staleness is a property of the
 * ROW — that row is the retired copy set — so one retired string now
 * disqualifies every field in it and the hero speaks with one voice.
 *
 * "family kitchen" joined the pattern 2026-08-11; "mithai house" 2026-08-12;
 * "today's batch" 2026-08-12 (the owner retired BATCH along with the family
 * framing). NOTE the pattern is "today's batch" / "small batch", never a bare
 * /batch/ — the word appears in legitimate copy (the dispatch seal's own date
 * line), and a bare match would quarantine current hero rows and strand the
 * owner's edits with no visible cause.
 *
 * Delete each ring only after its migration has actually run — verify against
 * the database, not against the presence of the .sql file.
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
   * this, it is making the product unprofessional". The line is stronger as
   * the Telugu mark and the year: రవి స్వీట్స్ · EST 1983. `??` and NOT `||`:
   * an empty string from the database means the owner cleared the field and
   * must be honoured; undefined means "not set" and falls through.
   */
  const heroEyebrowEn = db?.eyebrowEn ?? preset?.eyebrow ?? '';
  const heroHeadline =
    db?.headline ?? preset?.headline ?? 'Made this morning. Nothing added to make it last.';
  /*
   * The names lead with the signature range (Kaju Katli is the brand mark
   * itself), not the Hyderabadi specials — keep in step with SIGNATURE_ORDER
   * in lib/signature.ts, which also picks the No.1 plate below.
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
   * SENTENCE BLOCKS, WORD STAGGER WITHIN. Each sentence is its own block, so a
   * sentence can never be split from the one after it; inside a sentence the
   * words wrap like normal prose. Derived from the string (the headline
   * resolves from Supabase), so whatever the owner types keeps this behaviour.
   * One span PER WORD with real text-node spaces between, so inline-block words
   * wrap without fusing. The stagger counter runs ACROSS sentences, so the
   * authored 0–480ms rise is unchanged.
   */
  let staggerIndex = 0;
  const headlineLines = (heroHeadline.match(/[^.!?]+[.!?]*/g) ?? [heroHeadline])
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) =>
      sentence.split(/\s+/).map((word) => ({ word, delay: staggerIndex++ * 0.06 })),
    );

  /*
   * THE PROOF STRIP. Three ruled cells; numerals carry it in the display face,
   * labels stay quiet. Not red: brand red appears exactly once in this column,
   * on the deadline chip.
   */
  const proof = [
    { value: FOUNDED, label: 'established' },
    { value: 'NIL', label: 'preservatives' },
    { value: 'Same-day', label: 'dispatch' },
  ];

  /*
   * TODAY'S No.1 — the same signature ranking the trending shelf uses, so the
   * hero spotlight and the shelf's first card agree on which sweet leads.
   */
  const heroProduct = signatureBestsellers()[0];

  return (
    <section
      aria-label="Hero"
      className="bg-theme-base text-theme-ink relative isolate -mt-16 overflow-hidden pt-16"
    >
      <HeroAmbient />
      {/*
        items-center, not stretch: the plate is a fixed round object, not a
        column that should grow to match the text. The grid is tightened from
        the retired card layout — a shorter hero so the shelf beneath peeks
        above the fold.
      */}
      {/*
        Explicit grid-cols-1 on mobile. Without it the implicit `auto` track
        sized to the headline's max-content and grew past the viewport, so the
        body copy and the plate's seal were clipped by this section's
        overflow-hidden. The lg tracks use minmax(0,…) which already cannot
        overflow, so only the mobile default needed pinning.
      */}
      <div className="container-site relative z-10 grid grid-cols-1 items-center gap-8 pb-6 pt-4 md:pb-8 md:pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        {/* ── THE WORD ─────────────────────────────────────────────────── */}
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="font-indic text-theme-accent text-lg leading-none">
              {heroEyebrowIndic}
            </span>
            {heroEyebrowEn.trim() && <span className="field-label">{heroEyebrowEn}</span>}
            <span className="field-label">· EST {FOUNDED}</span>
          </p>

          {/*
            Half-hero cap: the lg ceiling is lowered to 3.4rem (from 4rem) so
            the headline + body + actions + proof clear a 768px viewport with
            the shelf's first cards visible beneath. The no-orphan sentence
            blocks above still hold at this size.
          */}
          <h1
            key={heroHeadline}
            className="font-display text-display-xl mt-2 font-semibold lg:text-[clamp(2.4rem,1.6rem+2.4vw,3.4rem)] lg:leading-[1.06] lg:tracking-[-0.012em]"
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

          <p className="text-text-muted mt-3 max-w-[52ch] text-sm leading-relaxed md:text-base">
            {heroBody}
          </p>

          {/* CTAs before the proof — the actions must sit above the fold. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={primaryCtaHref} className="stamp">
              {primaryCtaLabel}
            </Link>
            <Link href={`/festivals/${fest.slug}`} className="stamp stamp--ghost">
              {fest.title} hampers
            </Link>
          </div>

          {/* THE DEADLINE CHIP — the one urgent thing, boxed like a stamp. */}
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

          {/* The proof strip — the docket's field rows, given room to count. */}
          <ul className="fb-tick mt-5 grid max-w-[27rem] grid-cols-3 border-y border-[color:var(--color-rule)]">
            {proof.map((item, i) => (
              <li
                key={item.label}
                className={cn('py-2.5', i > 0 && 'border-l border-[color:var(--color-rule)] pl-4')}
              >
                <span className="font-display block text-xl leading-none md:text-2xl">
                  {item.value}
                </span>
                <span className="field-label mt-1.5 block">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── TODAY'S No.1 PLATE ───────────────────────────────────────── */}
        {heroProduct && (
          <Reveal delay={0.1} direction="none">
            <NoOnePlate product={heroProduct} today={formatDocketDate(now)} />
          </Reveal>
        )}
      </div>

      <Grain />
    </section>
  );
}

/**
 * The day's top sweet, cut out of its photograph and plated on a soft glow.
 * The rank stamp names it No.1; the red dispatch seal (which becomes the logo
 * roundel when the mark's file lands) carries today's date; a buy tag gives the
 * one-tap order. Falls back to the boxed photo, then a specimen plate, so a
 * missing cutout never breaks the hero.
 */
function NoOnePlate({ product, today }: { product: Product; today: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [, startTransition] = useTransition();

  const variant = product.variants[0];
  const primaryImage = product.images[0];
  const cutout = cutoutFor(primaryImage?.url);
  const boxed = primaryImage && isUsableImage(primaryImage.url) ? primaryImage.url : null;
  const pal = product.theme_palette;
  const effective = variant ? computeEffectivePrice(product, variant) : null;
  const onSale = effective?.salePrice != null;

  return (
    // Narrower on phones so the corner seal and rank stamp keep clear of the
    // viewport edges; full size from sm up.
    <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[24rem]">
      <div className="relative aspect-square">
        {/* The plate — a soft round glow with a dashed rim, the counter dish. */}
        <div
          aria-hidden="true"
          className="absolute inset-[6%] rounded-full border border-dashed border-[color:var(--color-rule)]"
          style={{
            background: `radial-gradient(ellipse at 50% 46%, ${pal.glow}8C, ${pal.glow}2E 60%, ${pal.glow}00 74%)`,
          }}
        />

        {/* The rank stamp — the visible rendering of "today's No.1". */}
        <span className="font-mono text-theme-accent absolute left-1 top-3 z-20 -rotate-3 rounded-md border-[1.5px] border-current bg-[color:var(--theme-base)] px-2.5 py-1 text-xs font-bold">
          No.1 today
        </span>

        {/* The cutout sweet, plated. */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {cutout && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cutout}
              alt={primaryImage?.alt ?? product.title}
              // The hero image is the LCP candidate — load it eagerly.
              loading="eager"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ fetchpriority: 'high' } as any)}
              decoding="async"
              className="h-[78%] w-[78%] object-contain drop-shadow-[0_18px_14px_rgba(22,28,36,0.22)]"
              onError={() => setImgFailed(true)}
            />
          ) : boxed && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={boxed}
              alt={primaryImage?.alt ?? product.title}
              loading="eager"
              decoding="async"
              className="h-[68%] w-[68%] rounded-full object-cover shadow-lifted"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span
              aria-hidden="true"
              className="block h-16 w-16 rotate-45 border-2 border-dashed"
              style={{ borderColor: pal.accent, opacity: 0.45 }}
            />
          )}
        </div>

        {/*
          THE DISPATCH SEAL. Thunks in at ~900ms, rests at a stamped angle.
          Becomes the real logo roundel when the owner's logo file arrives —
          same position, same animation.
        */}
        <div
          className="fb-seal absolute right-0 top-2 z-20 flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-md border-2 bg-[color:var(--theme-base)]/85 text-center"
          style={{
            borderColor: 'var(--color-brand)',
            color: 'var(--color-brand)',
            boxShadow: 'inset 0 0 0 1.5px var(--theme-base), inset 0 0 0 2.5px var(--color-brand)',
          }}
        >
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em]">
            Ravi Sweets
          </span>
          <span className="field-label" style={{ color: 'var(--color-brand)' }}>
            Fresh today
          </span>
          <span className="field-value text-[10px] font-bold" suppressHydrationWarning>
            {today}
          </span>
        </div>
      </div>

      {/* THE BUY TAG — order the No.1 without scrolling. */}
      {variant && (
        <div className="shadow-lifted absolute inset-x-0 -bottom-3 z-20 mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] py-2 pl-4 pr-2">
          <Link href={`/product/${product.slug}`} className="min-w-0">
            <span className="font-display text-theme-ink block truncate text-sm font-semibold leading-none">
              {product.title}
            </span>
            <span className="mt-1 flex items-baseline gap-1.5">
              <span className="field-label">{variant.title}</span>
              <span className="font-display text-theme-ink text-sm font-bold">
                {formatMoney({
                  amount:
                    onSale && effective?.salePrice != null
                      ? effective.salePrice
                      : variant.price.amount,
                  currency: 'INR',
                })}
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={`Add ${product.title} to cart`}
            onClick={() => {
              if (added) return;
              startTransition(() => {
                add(product.id, variant.id, 1);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1800);
              });
            }}
            className={cn(
              'relative flex h-9 shrink-0 items-center justify-center gap-1 rounded-full text-[color:var(--theme-base)] transition-[width,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px',
              added ? 'w-[5rem] bg-[#1F6238]' : 'bg-theme-accent w-9',
            )}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Added</span>
              </>
            ) : (
              <Plus className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
