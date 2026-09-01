import Link from 'next/link';
import type { CategorySlug } from '@ravisweets/shared';
import { PRODUCT_PALETTES } from '@/lib/theme/tokens';
import { cn } from '@/lib/cn';

/**
 * THE CATEGORY SWITCHER — every aisle, one tap, from inside any aisle.
 *
 * Owner, 2026-08-24: "in all the categories we should be able to see this bar
 * above the sweets to change the category instantly." The homepage rail's
 * vocabulary — the same glyphs and Flavour Atlas tints — laid on its side as
 * a pill row, plus the one thing the rail never needed: an active state,
 * since on a category page one of these is where you already stand.
 *
 * 2026-08-30: the tiles became pills and moved from above the whole page to
 * directly above the grid — see the note on the <ul> below.
 *
 * This is the FULL taxonomy (all 12 routed categories), not the rail's
 * curated eight: a switcher that cannot reach four of the aisles would
 * strand exactly the pages it exists to connect. The homepage rail stays
 * eight tiles by owner decision (2026-08-12) and now imports its glyphs
 * from here, so the icon set lives once.
 *
 * Server component on purpose: `active` arrives as the route param, so every
 * tile is a plain <Link> in the static HTML — the same crawlability rule the
 * category page's range index exists for.
 */

export type GlyphName =
  | 'diamond'
  | 'laddoo'
  | 'strands'
  | 'coil'
  | 'jar'
  | 'nut'
  | 'duo'
  | 'gift'
  | 'leaf'
  | 'mound'
  | 'biscuits'
  | 'diya';

interface SwitcherCategory {
  slug: CategorySlug;
  label: string;
  glyph: GlyphName;
  palette: keyof typeof PRODUCT_PALETTES;
}

/*
 * Order matches ALL_SLUGS in app/category/[slug]/page.tsx — the shop's
 * canonical shelf order — so the bar reads the same on every page and the
 * active tile is the only thing that moves.
 */
const SWITCHER_CATEGORIES: SwitcherCategory[] = [
  { slug: 'sweets', label: 'Sweets', glyph: 'laddoo', palette: 'house' },
  { slug: 'sweet-bites', label: 'Sweet bites', glyph: 'diamond', palette: 'gulkand' },
  { slug: 'healthy-sweets', label: 'Healthy sweets', glyph: 'leaf', palette: 'badam' },
  { slug: 'namkeens', label: 'Namkeens', glyph: 'strands', palette: 'kesar' },
  { slug: 'savouries', label: 'Savouries', glyph: 'coil', palette: 'kesar' },
  { slug: 'dry-fruits', label: 'Dry fruits', glyph: 'nut', palette: 'badam' },
  { slug: 'pickles', label: 'Pickles', glyph: 'jar', palette: 'gulkand' },
  { slug: 'powders', label: 'Podis', glyph: 'mound', palette: 'kesar' },
  { slug: 'biscuits', label: 'Biscuits', glyph: 'biscuits', palette: 'house' },
  { slug: 'combos', label: 'Combos', glyph: 'duo', palette: 'house' },
  { slug: 'gift-hampers', label: 'Gift hampers', glyph: 'gift', palette: 'hamper' },
  { slug: 'festival-specials', label: 'Festival specials', glyph: 'diya', palette: 'gulkand' },
];

/**
 * One consistent 2.25px stroke across all twelve glyphs — an icon set, not
 * clip art. The first eight are the rail's originals; leaf/mound/biscuits/
 * diya joined 2026-08-24 when the switcher extended the set to the full
 * taxonomy.
 */
export function CategoryGlyph({
  name,
  color,
  className = 'h-9 w-9 md:h-11 md:w-11',
}: {
  name: GlyphName;
  color: string;
  /** The rail's circle size by default; the switcher pill passes a small one. */
  className?: string;
}) {
  const s = { stroke: color, strokeWidth: 2.25, fill: 'none', strokeLinecap: 'round' } as const;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {name === 'diamond' && (
        <>
          <rect x="14" y="14" width="20" height="20" transform="rotate(45 24 24)" strokeLinejoin="round" {...s} />
          <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill={color} opacity="0.3" />
        </>
      )}
      {name === 'laddoo' && (
        <>
          <circle cx="24" cy="24" r="13" {...s} />
          <circle cx="19" cy="21" r="1.6" fill={color} />
          <circle cx="27" cy="19" r="1.6" fill={color} />
          <circle cx="24" cy="28" r="1.6" fill={color} />
          <circle cx="30" cy="26" r="1.6" fill={color} />
        </>
      )}
      {name === 'strands' && (
        <>
          <path d="M10 18 C 16 14, 22 22, 28 18 S 38 14, 38 18" {...s} />
          <path d="M10 25 C 16 21, 22 29, 28 25 S 38 21, 38 25" {...s} />
          <path d="M10 32 C 16 28, 22 36, 28 32 S 38 28, 38 32" {...s} />
        </>
      )}
      {name === 'coil' && (
        <path
          d="M24 24 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0"
          {...s}
        />
      )}
      {name === 'jar' && (
        <>
          <path d="M17 14 h14 M16 18 h16 v16 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" strokeLinejoin="round" {...s} />
          <path d="M20 26 c 1.5 -2, 3 2, 4.5 0 s 3 2, 3.5 0" {...s} />
        </>
      )}
      {name === 'nut' && (
        <>
          <path d="M24 12 C 31 16, 33 26, 28 33 C 25 37, 21 37, 19 33 C 14 26, 17 16, 24 12 Z" strokeLinejoin="round" {...s} />
          <path d="M24 17 C 26 21, 26 28, 24 32" {...s} />
        </>
      )}
      {name === 'duo' && (
        <>
          <rect x="11" y="19" width="17" height="17" rx="3" {...s} />
          <rect x="22" y="12" width="15" height="15" rx="3" {...s} fill="var(--color-surface-elevated)" />
        </>
      )}
      {name === 'gift' && (
        <>
          <rect x="12" y="20" width="24" height="17" rx="2" {...s} />
          <path d="M12 26 h24 M24 20 v17" {...s} />
          <path d="M24 20 c -6 0, -8 -7, -3 -7 c 3 0, 3 4, 3 7 c 0 -3, 0 -7, 3 -7 c 5 0, 3 7, -3 7" strokeLinejoin="round" {...s} />
        </>
      )}
      {name === 'leaf' && (
        <>
          <path d="M14 33 C 13 22, 20 13, 34 13 C 35 27, 27 35, 15 34 Z" strokeLinejoin="round" {...s} />
          <path d="M16 32 C 21 27, 26 22, 31 16" {...s} />
        </>
      )}
      {name === 'mound' && (
        <>
          {/* A heap of fresh podi, aroma rising off it. */}
          <path d="M10 34 C 14 24, 20 20, 24 20 C 28 20, 34 24, 38 34 Z" strokeLinejoin="round" {...s} />
          <circle cx="20" cy="14" r="1.4" fill={color} />
          <circle cx="26" cy="11" r="1.4" fill={color} />
          <circle cx="30" cy="15" r="1.4" fill={color} />
        </>
      )}
      {name === 'biscuits' && (
        <>
          {/* Two biscuits, one tucked behind — same trick as the combo duo. */}
          <circle cx="29" cy="20" r="9" {...s} fill="var(--color-surface-elevated)" />
          <circle cx="20" cy="27" r="10" {...s} />
          <circle cx="17" cy="24" r="1.3" fill={color} />
          <circle cx="23" cy="25" r="1.3" fill={color} />
          <circle cx="20" cy="30" r="1.3" fill={color} />
        </>
      )}
      {name === 'diya' && (
        <>
          <path d="M12 29 h24 c 0 6 -5 9 -12 9 c -7 0 -12 -3 -12 -9 Z" strokeLinejoin="round" {...s} />
          <path d="M24 25 c -4 -3.5, -1.5 -9, 0 -11 c 1.5 2, 4 7.5, 0 11 Z" strokeLinejoin="round" {...s} />
        </>
      )}
    </svg>
  );
}

export function CategorySwitcher({ active }: { active?: CategorySlug }) {
  return (
    <nav aria-label="Categories">
      {/*
        A PILL ROW, NOT A TILE GRID (owner, 2026-08-30: "make it smaller, use
        the space efficiently"). The circle tiles this started as cost ~100px
        of vertical space above every category page — a second hero for a
        control the shopper uses once. Laid on their side as 34px pills, the
        same twelve aisles and the same tinted glyphs cost a third of that,
        and now sit directly over the grid they switch rather than over the
        whole page. The homepage rail keeps the circles: there they ARE the
        content.

        Still one scrolling row with snap points — twelve pills do not fit a
        laptop container either, and pretending otherwise at lg would only
        hide the last four aisles. What went with the tiles is the negative-
        margin edge bleed to the viewport: the row now sits in the grid's
        right-hand track, and a box deliberately wider than its own column
        would scroll pills through the rail's gutter. A pill cut in half at
        the column edge advertises the overflow just as well.
      */}
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1">
        {SWITCHER_CATEGORIES.map((cat) => {
          const pal = PRODUCT_PALETTES[cat.palette];
          const on = cat.slug === active;
          return (
            <li key={cat.slug} className="snap-start">
              <Link
                href={`/category/${cat.slug}`}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border pl-1.5 pr-3 text-xs transition-all duration-200 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2',
                  on ? 'text-theme-accent font-semibold' : 'text-theme-ink/80 font-medium',
                )}
                style={{
                  backgroundColor: on ? pal.base : 'transparent',
                  borderColor: on ? pal.accent : 'var(--color-rule)',
                }}
              >
                {/* The tint survives the shrink by moving into a 24px disc —
                    a bare 16px glyph on the page ground reads as grey. */}
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: pal.base }}
                >
                  <CategoryGlyph name={cat.glyph} color={pal.accent} className="h-4 w-4" />
                </span>
                {cat.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
