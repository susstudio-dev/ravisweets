'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { CATALOGUE, type Product } from '@ravisweets/shared';
import { Grain } from '@/components/brand/grain';
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
 * invoice. The docket system survives as the stationery: ruled proof row,
 * typed values, square-cut edges. The full ledger the owner rejected twice is
 * compressed into three artifacts: the proof row, the red dispatch seal
 * (which carries today's date), and one ember live-row.
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
 * RED DISCIPLINE: kumkum red (--color-brand) is celebration/certification ink
 * — the ticker band and the seal, ~8% of the viewport. Blue keeps the
 * interactive monopoly. Ember stays live-state.
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
 * twice, so a DB value still naming the town falls through to the new
 * defaults rather than overriding them. Delete this once 0012 has run.
 */
function quarantine(v: string | null | undefined): string | undefined {
  return v && !/khammam|telangana|ఖమ్మం/i.test(v) ? v : undefined;
}

/** Mirrors the calendar in festival-next-band.tsx (shared module is phase 4b). */
const FESTIVALS = [
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

  const heroEyebrowIndic =
    quarantine(hero?.eyebrowIndic) ??
    quarantine(theme?.hero.eyebrow?.split('·')[0]?.trim()) ??
    'రవి స్వీట్స్';
  const heroEyebrowEn = quarantine(hero?.eyebrowEn) ?? quarantine(theme?.hero.eyebrow) ?? 'Family kitchen';
  const heroHeadline =
    quarantine(hero?.headline) ??
    quarantine(theme?.hero.headline) ??
    'Made this morning. Nothing added to make it last.';
  const heroBody =
    quarantine(hero?.body) ??
    quarantine(theme?.hero.body) ??
    `Qubani ka Meetha, Badam ki Jali, Kaju Katli — sweets, namkeens and gift hampers made by one family since ${FOUNDED}. Order from anywhere; delivered fresh to any address in India.`;
  const primaryCtaLabel = hero?.primaryCtaLabel ?? theme?.hero.ctaLabel ?? "Shop today's batch";
  const primaryCtaHref = hero?.primaryCtaHref ?? theme?.hero.ctaHref ?? '/shop';

  /*
   * One span PER WORD, with the spaces as plain text nodes BETWEEN the spans.
   * The first cut grouped words in twos and put the space inside each span;
   * inline-block trims its own trailing whitespace, which fused adjacent
   * groups on the same line ("make itlast"), and a multi-word inline-block
   * cannot wrap internally, which overflowed the whole page at 390px. Words
   * separated by real text-node spaces wrap like normal prose.
   */
  const words = heroHeadline.split(/\s+/);

  const cutouts = CATALOGUE.filter((p) => p.bestseller).slice(0, 3);

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
      <div className="container-site relative z-10 grid items-center gap-8 pb-10 pt-5 md:pb-14 md:pt-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-14">
        {/* ── THE WORD ─────────────────────────────────────────────────── */}
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="font-indic text-theme-accent text-lg leading-none">
              {heroEyebrowIndic}
            </span>
            <span className="field-label">{heroEyebrowEn}</span>
            <span className="field-label">· EST {FOUNDED}</span>
          </p>

          <h1 key={heroHeadline} className="font-display text-display-xl mt-3 text-balance">
            {words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 ? ' ' : null}
                <span className="fb-word" style={{ animationDelay: `${i * 0.06}s` }}>
                  {w}
                </span>
              </Fragment>
            ))}
          </h1>

          {/* The festival line — celebration ink, typed. */}
          <p
            className="fb-tick field-value mt-3 text-sm font-bold"
            style={{ color: 'var(--color-brand)' }}
            suppressHydrationWarning
          >
            {fest.title.toUpperCase()} · ORDER BY {formatDocketDate(orderBy)} · DELIVERED ACROSS
            INDIA
          </p>

          <p className="text-text-muted mt-3 max-w-[52ch] leading-relaxed">{heroBody}</p>

          {/*
            CTAs come BEFORE the proof row — owner feedback: the actions were
            landing below the fold. The proof line is trust garnish under
            them, not a gate in front of them.
          */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={primaryCtaHref} className="stamp">
              {primaryCtaLabel}
            </Link>
            <Link href={`/festivals/${fest.slug}`} className="stamp stamp--ghost">
              {fest.title} hampers
            </Link>
          </div>

          {/* The proof row — the docket compressed to one ruled line. */}
          <p className="fb-tick field-value mt-6 border-y border-[color:var(--color-rule)] py-2.5 text-xs tracking-[0.08em]">
            FAMILY KITCHEN SINCE {FOUNDED} · NO PRESERVATIVES · SAME-DAY DISPATCH
          </p>
        </div>

        {/* ── THE FESTIVAL CARD ────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div
            className="relative rounded-xl border border-[color:var(--color-border)] p-6 pb-5 pt-10 shadow-soft"
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
                specimen marks until then. */}
            {/* gap-3 + w-20 on phones: three 96px chips overflowed a 390px
                viewport, forced the hero's single column wider than the
                screen, and the section's overflow-hidden clipped every line
                on the page at the right edge. */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {cutouts.map((p, i) => (
                <FestivalCutout key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* The live row — ember means exactly this. */}
            <p className="mt-6 flex justify-center">
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
                Fresh batch
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
      ) : (
        <>
          <path d="M0 11 H 320" {...stroke} strokeLinecap="round" />
          <path d="M0 17 H 320" {...stroke} strokeLinecap="round" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

type SpecimenShape = 'diamond' | 'round' | 'coil' | 'scatter';

function shapeFor(product: Product, index: number): SpecimenShape {
  const t = product.title.toLowerCase();
  if (/katli|barfi|burfi|jali|chikki|kalakand/.test(t)) return 'diamond';
  if (/jamun|laddu|ladoo|boondi|pak|peda/.test(t)) return 'round';
  if (/mixture|sev|chivda|murukku|kaju|badam|almond|pista|nut/.test(t)) return 'scatter';
  if (/jalebi|halwa|meetha|khurma/.test(t)) return 'coil';
  return (['diamond', 'round', 'coil', 'scatter'] as const)[index % 4]!;
}

/** A spec-sheet figure in the product's own flavour ink. */
function SpecimenMark({
  shape,
  color,
  className,
}: {
  shape: SpecimenShape;
  color: string;
  className?: string;
}) {
  const stroke = { stroke: color, strokeWidth: 2.5, fill: 'none' } as const;
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden="true">
      {shape === 'diamond' && (
        <>
          <rect
            x="16"
            y="16"
            width="40"
            height="40"
            transform="rotate(45 36 36)"
            strokeLinejoin="round"
            {...stroke}
          />
          <rect
            x="27"
            y="27"
            width="18"
            height="18"
            transform="rotate(45 36 36)"
            fill={color}
            opacity="0.22"
          />
          <rect x="31" y="31" width="10" height="10" transform="rotate(45 36 36)" fill={color} />
        </>
      )}
      {shape === 'round' && (
        <>
          <circle cx="36" cy="36" r="21" {...stroke} />
          <circle cx="36" cy="36" r="13" fill={color} opacity="0.22" />
          <circle cx="30" cy="33" r="2.4" fill={color} />
          <circle cx="40" cy="30" r="2.4" fill={color} />
          <circle cx="37" cy="41" r="2.4" fill={color} />
        </>
      )}
      {shape === 'coil' && (
        <path
          d="M36 36 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0"
          strokeLinecap="round"
          {...stroke}
        />
      )}
      {shape === 'scatter' && (
        <>
          <circle cx="24" cy="26" r="5" fill={color} opacity="0.8" />
          <circle cx="44" cy="20" r="4" fill={color} opacity="0.45" />
          <circle cx="52" cy="38" r="5.5" fill={color} />
          <circle cx="33" cy="44" r="4.5" fill={color} opacity="0.6" />
          <circle cx="20" cy="48" r="3.5" fill={color} opacity="0.35" />
          <circle cx="44" cy="52" r="4" fill={color} opacity="0.8" />
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
  const shape = shapeFor(product, index);
  const pal = product.theme_palette;
  const tilt = [-2.5, 1.5, 3][index % 3];

  const primary = (productImages[product.id] ?? product.images)[0];
  const photo = primary && !imgFailed && isUsableImage(primary.url) ? primary : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'fb-bob group bg-surface-elevated block w-20 rounded-lg border border-[color:var(--color-border)] p-2 pb-1.5 shadow-soft transition-shadow hover:shadow-lifted md:w-28',
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
            sizes="(min-width: 768px) 112px, 80px"
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
