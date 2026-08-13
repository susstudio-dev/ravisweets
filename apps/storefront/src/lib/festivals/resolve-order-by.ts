import { defaultOrderByDay, endOfIstDayMs, formatDocketDate, isValidIsoDay } from './calendar';

/**
 * The order-by decision, as a pure function of (festival, override, clock).
 *
 * The clock is a PARAMETER and not a `Date.now()` call, for two reasons: this
 * repo's vitest runs in `environment: 'node'` with no DOM and cannot test a
 * hook, and the boundary being asserted is a single millisecond. `useOrderBy`
 * supplies the real clock.
 */

export interface OrderByState {
  /** The ISO day actually in force: a valid override, else festival − 3. */
  day: string;
  /** '12 AUG 2026' — ready to render. */
  label: string;
  /** True once IST has passed the end of `day`. */
  closed: boolean;
}

export function resolveOrderBy(
  festivalISO: string,
  override: string | undefined,
  nowMs: number,
): OrderByState {
  const usable = isValidIsoDay(override) && override <= festivalISO;
  const day = usable ? override : defaultOrderByDay(festivalISO);

  return {
    day,
    label: formatDocketDate(day),
    // IST always. The cutoff belongs to the kitchen, not to the visitor.
    closed: nowMs >= endOfIstDayMs(day),
  };
}
