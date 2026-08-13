import { cn } from '@/lib/cn';

/**
 * The FSSAI food-type mark: green dot for vegetarian, brown triangle (the
 * post-2022 symbol) for non-vegetarian, each inside its square outline.
 *
 * STATUTORY COLOURS, FIXED. Identity may vary per product; a compliance mark
 * may not — it never reads from theme_palette or the theme tokens. The small
 * --theme-base backing plate is what keeps it legible on the cream cards and
 * the dark surfaces alike, exactly as on a printed box.
 *
 * This marks food type only. It must never be captioned "FSSAI certified" —
 * the licence is disclosed as pending in the footer.
 */
const VEG_GREEN = '#1F6238';
const NONVEG_BROWN = '#8B4513';

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
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[3px] bg-[color:var(--theme-base)] p-[2px]',
        className,
      )}
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
