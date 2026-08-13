import { cn } from '@/lib/cn';

/**
 * The FSSAI food-type mark: green dot for vegetarian, brown triangle (the
 * post-2022 symbol) for non-vegetarian, each inside its square outline.
 *
 * STATUTORY COLOURS, FIXED. Identity may vary per product; a compliance mark
 * may not — it never reads from theme_palette or the theme tokens. The same
 * goes for the backing plate: it is a literal hex, not `--theme-base`, because
 * `--theme-base` is `#2B2620` under `[data-register='carbon']` / `'dusk'`
 * (globals.css), which gives the marks only ~2.04:1 (green) / ~2.11:1 (brown)
 * — short of the 3:1 WCAG 1.4.11 needs for a meaningful graphical object.
 * PLATE_BG (`#EFE7D0`, a warm ivory a step down from the cream card) clears
 * 5.94:1 against the green and 5.75:1 against the brown, on every register,
 * and reads as a calm printed-on patch next to the cream (`#FAF6E5`) rather
 * than a stark white blob — exactly as the mark is printed on a light patch
 * on a real package regardless of the box's own colour.
 *
 * This marks food type only. It must never be captioned "FSSAI certified" —
 * the licence is disclosed as pending in the footer.
 */
export const VEG_GREEN = '#1F6238';
export const NONVEG_BROWN = '#8B4513';
export const PLATE_BG = '#EFE7D0';

export function VegMark({
  nonVeg,
  size = 'sm',
  className,
}: {
  nonVeg: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const px = size === 'sm' ? 14 : 18;
  const colour = nonVeg ? NONVEG_BROWN : VEG_GREEN;
  const label = nonVeg ? 'Non-vegetarian' : 'Vegetarian';
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-[3px] p-[2px]', className)}
      style={{ backgroundColor: PLATE_BG }}
    >
      <svg width={px} height={px} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1.5" y="1.5" width="21" height="21" fill="none" stroke={colour} strokeWidth="2.5" />
        {nonVeg ? (
          <path d="M12 5.5 L19 18 L5 18 Z" fill={colour} />
        ) : (
          <circle cx="12" cy="12" r="5.5" fill={colour} />
        )}
      </svg>
    </span>
  );
}
