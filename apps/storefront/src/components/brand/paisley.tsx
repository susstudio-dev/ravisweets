import { cn } from '@/lib/cn';

/**
 * THE KATLI CUT — the brand's single geometric primitive.
 *
 * WHY THIS SHAPE, AND WHY NOT THE OLD ONE
 *
 * This file used to draw a paisley. Paisley is the default reach for anything
 * "Indian premium", and that is precisely the problem:
 *
 *  1. It is condemned by name in the design press. It's Nice That (Sept 2024)
 *     called out paisley-as-branding as shallow "exotic" shorthand — a motif
 *     applied to signal a culture rather than to say anything about the actual
 *     product. Once a device is being written about as a cliché, using it is a
 *     liability, not a shortcut.
 *  2. It is the single most crowded motif field in Indian gifting. Every mithai
 *     box, every festive hamper, every diwali landing page. A mark that every
 *     competitor also owns is a mark nobody owns.
 *
 * The katli cut is the 45-degree diamond that kaju katli is physically sliced
 * into: the knife goes across the tray on the diagonal, and the lozenge that
 * falls out is this shape. It is defensible for the one reason a motif ever is
 * — it is the literal geometry of the thing we make, so it cannot be lifted by
 * anyone who does not make it. Same logic as Tony's Chocolonely's unequally
 * divided bar: the shape of the product carries the argument, so the packaging
 * does not have to decorate its way to a story.
 *
 * DRAWING NOTES
 *
 *  - A true rhombus (all four sides equal) with the horizontal diagonal longer
 *    than the vertical — 28 x 22 half-diagonals of a 64 unit box. A square on
 *    its point reads as a generic "diamond"; the wider lozenge reads as a cut
 *    piece of katli.
 *  - Solid fill, not stroke. The old line-art paisley rendered its 1.2 unit
 *    strokes at 0.22px when the mark was placed at 12px, i.e. as grey mush. A
 *    filled silhouette is what survives at 12px, which is the size the mark is
 *    used at as a list bullet.
 *  - The inner diamond is an incised hairline VOID (evenodd), a nod to
 *    Bidriware — the Bidar metal-inlay craft, where silver is beaten into a
 *    cut groove in blackened alloy — so here too the pattern is cut into the
 *    ground rather than laid on top. It is ~3 units wide, so it resolves at
 *    32px and 48px and closes up into the solid below ~16px. The mark
 *    therefore degrades to a clean solid lozenge at bullet size instead of
 *    breaking up.
 *  - Colour is currentColor throughout, defaulting to the theme accent, so the
 *    mark re-themes with the register (including the dark dusk subtree) with
 *    no per-call-site change.
 *
 * The exported names are deliberately unchanged so this shape swap is a
 * one-file edit across all 156 call sites. Renaming the module and its exports
 * is a separate, mechanical follow-up.
 */
interface PaisleyProps {
  size?: 'sm' | 'md' | 'lg';
  rotate?: number;
  className?: string;
  /** Color source (defaults to theme accent via currentColor). Accepts any valid CSS color. */
  color?: string;
  'aria-hidden'?: boolean;
}

const SIZES = { sm: 20, md: 32, lg: 48 };

/**
 * The katli mark. Prop API is unchanged from the motif it replaces.
 * - Fill via currentColor; wrap in a colored container or set `color`.
 * - `rotate` still tilts the mark; the lozenge is 2-fold symmetric, so 180deg
 *   is a no-op and small angles (12-35deg) are what read as intentional.
 */
export function Paisley({
  size = 'md',
  rotate = 0,
  className,
  color,
  'aria-hidden': ariaHidden = true,
}: PaisleyProps) {
  const px = SIZES[size];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={px}
      height={px}
      fill="currentColor"
      stroke="none"
      aria-hidden={ariaHidden}
      className={cn('inline-block shrink-0', className)}
      style={{
        color: color ?? 'var(--theme-accent)',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {/*
       * Three nested rhombi, one path, evenodd: outer solid body, then a
       * hairline void, then a solid core. Winding depth 1/2/3 = fill/hole/fill.
       */}
      <path
        fillRule="evenodd"
        d="M32 10 L60 32 L32 54 L4 32 Z M32 19 L49 32 L32 45 L15 32 Z M32 23 L44 32 L32 41 L20 32 Z"
      />
    </svg>
  );
}

/**
 * Horizontal section divider — a silver hairline, one centred katli, a second
 * hairline. Used between major page sections.
 *
 * The rules are varak (silver) rather than the accent: silver is the premium
 * cue in this system, and a plum rule at this width competed with the type. The
 * mark is dropped to `sm` because a filled 32px lozenge reads far heavier than
 * the open line-art it replaces and blocked up the centre of the divider.
 */
export function PaisleyDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'text-theme-accent flex w-full items-center justify-center gap-4 py-8',
        className,
      )}
      aria-hidden="true"
    >
      <span className="bg-varak-rule h-px w-full max-w-[12rem] opacity-50" />
      <Paisley size="sm" />
      <span className="bg-varak-rule h-px w-full max-w-[12rem] opacity-50" />
    </div>
  );
}
