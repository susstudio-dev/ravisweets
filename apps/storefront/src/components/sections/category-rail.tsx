import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCT_PALETTES } from '@/lib/theme/tokens';
import { Reveal } from '@/components/motion/reveal';
import { CategoryGlyph, type GlyphName } from '@/components/category/category-switcher';

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
 *
 * The glyph set moved to components/category/category-switcher (2026-08-24)
 * when the category pages grew their own switcher bar — one icon set, two
 * surfaces. This rail keeps its own curated tile list.
 */

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
 * tiles — the row is measured for it; the shared glyph set (in
 * category-switcher) covers all twelve for the category pages' bar. The
 * retired category still exists and is still reachable from /shop.
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
