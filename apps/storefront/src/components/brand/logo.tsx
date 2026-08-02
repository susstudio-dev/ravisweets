/**
 * The brand lockup — self-hosted, zero external dependencies.
 *
 * The old header hotlinked a PNG from the retired WordPress host, which now
 * answers HTTP 402 for every asset; the mark was a broken-image icon on
 * every page. This lockup is drawn in code: the katli diamond (the product's
 * own 45° cut, same mark as the cursor and bullets) beside a Young Serif
 * wordmark. It inherits the current register's ink, so it is cream over the
 * dusk hero and warm charcoal on light pages with no extra props.
 */

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={compact ? 'h-7 w-7 shrink-0' : 'h-8 w-8 shrink-0'}
      >
        <polygon
          points="16,2.5 29.5,16 16,29.5 2.5,16"
          fill="var(--theme-accent)"
          stroke="var(--color-varak)"
          strokeWidth="1.6"
          strokeLinejoin="miter"
        />
        <polygon
          points="16,9 23,16 16,23 9,16"
          fill="none"
          stroke="var(--theme-base)"
          strokeWidth="1.1"
          opacity="0.85"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-theme-ink text-lg tracking-[0.02em]">Ravi Sweets</span>
        {!compact && (
          <span className="text-theme-ink/55 mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.3em] sm:block">
            Khammam · est. 1985
          </span>
        )}
      </span>
    </span>
  );
}
