import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCT_PALETTES } from '@/lib/theme/tokens';
import { Reveal } from '@/components/motion/reveal';

/**
 * THE CATEGORY RAIL — every aisle of the shop, one tap from the hero.
 *
 * The reference stores (Food on Farm, Sweet Karam Coffee) both put a
 * horizontally scrollable rail of circular category tiles directly under the
 * masthead; it is the single biggest "easy navigation" device either of them
 * has, and it is what replaces burying the catalogue behind a mega-menu
 * click. Owner-directed, warm pivot 2026-08-10.
 *
 * Each tile is tinted from the Flavour Atlas — the same palettes the product
 * cards use — with a drawn line glyph standing in until category photography
 * exists. When photos land, swap the <CategoryGlyph> for an <Image> inside
 * the same circle; the rail's grammar does not change.
 */

type GlyphName =
  | 'diamond'
  | 'laddoo'
  | 'strands'
  | 'coil'
  | 'jar'
  | 'nut'
  | 'duo'
  | 'gift';

interface RailCategory {
  label: string;
  href: string;
  glyph: GlyphName;
  palette: keyof typeof PRODUCT_PALETTES;
}

/*
 * "Hyderabadi specials" led this rail until 2026-08-12, when the owner pulled
 * it out of the navigation. Sweet bites takes the slot and the freed diamond
 * glyph: at twelve products it is the largest category that was missing from
 * the rail entirely, where Hyderabadi specials had five. The rail stays EIGHT
 * tiles — the glyph set below is written for eight and the row is measured for
 * it. The retired category still exists and is still reachable from /shop.
 */
const CATEGORIES: RailCategory[] = [
  { label: 'Sweet bites', href: '/category/sweet-bites', glyph: 'diamond', palette: 'gulkand' },
  { label: 'Sweets', href: '/category/sweets', glyph: 'laddoo', palette: 'house' },
  { label: 'Namkeens', href: '/category/namkeens', glyph: 'strands', palette: 'kesar' },
  { label: 'Savouries', href: '/category/savouries', glyph: 'coil', palette: 'kesar' },
  { label: 'Pickles', href: '/category/pickles', glyph: 'jar', palette: 'gulkand' },
  { label: 'Dry fruits', href: '/category/dry-fruits', glyph: 'nut', palette: 'badam' },
  { label: 'Combos', href: '/category/combos', glyph: 'duo', palette: 'house' },
  { label: 'Gift hampers', href: '/category/gift-hampers', glyph: 'gift', palette: 'hamper' },
];

/** One consistent 2.25px stroke across all eight glyphs — an icon set, not clip art. */
function CategoryGlyph({ name, color }: { name: GlyphName; color: string }) {
  const s = { stroke: color, strokeWidth: 2.25, fill: 'none', strokeLinecap: 'round' } as const;
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 md:h-11 md:w-11" aria-hidden="true">
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
    </svg>
  );
}

export function CategoryRail() {
  return (
    <section aria-labelledby="category-rail-heading" className="container-site section-y-tight">
      <Reveal>
        <div className="docket-head">
          <h2 id="category-rail-heading" className="font-display text-display-md font-semibold">
            Shop by category
          </h2>
          <Link
            href="/shop"
            className="text-theme-ink hover:text-theme-accent inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            See everything <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
      {/*
        One row, always. Scrolls on narrow screens (edge-bled so the cut-off
        tile advertises the scroll), sits centred with air at lg. Snap points
        keep a tile whole under the thumb.
      */}
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 sm:-mx-6 sm:px-6 sm:scroll-pl-6 lg:mx-0 lg:justify-between lg:gap-6 lg:overflow-visible lg:px-0">
        {CATEGORIES.map((cat) => {
          const pal = PRODUCT_PALETTES[cat.palette];
          return (
            <li key={cat.href} className="snap-start">
              <Link
                href={cat.href}
                className="group flex w-20 flex-col items-center gap-2 focus-visible:outline-none md:w-24"
              >
                <span
                  className="flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-200 group-hover:shadow-lifted group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--color-ring)] group-focus-visible:ring-offset-2 md:h-24 md:w-24"
                  style={{
                    backgroundColor: pal.base,
                    borderColor: `${pal.accent}55`,
                  }}
                >
                  <CategoryGlyph name={cat.glyph} color={pal.accent} />
                </span>
                <span className="group-hover:text-theme-accent text-center text-[13px] font-medium leading-tight transition-colors">
                  {cat.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
