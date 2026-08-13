import { z } from 'zod';
import {
  FESTIVAL_CALENDAR,
  endOfIstDayMs,
  formatDocketDate,
  isValidIsoDay,
  type FestivalSlug,
} from './calendar';

/**
 * Owner-set dispatch deadlines — the `festival_dates` row in site_content.
 *
 * Sparse by design: a festival with no entry uses `defaultOrderByDay`, so
 * clearing an override is a deletion, never an empty string.
 *
 * Zod handles the shape (the `page_media` precedent, and zod is already in the
 * client bundle through it); the cross-field rule — a cutoff may not fall
 * after its own festival — runs afterwards, because a record schema cannot
 * see the calendar.
 */

export interface FestivalDeadline {
  /** ISO day, 'YYYY-MM-DD'. The last day an order is taken for this festival. */
  orderBy: string;
}

export type FestivalDates = Partial<Record<FestivalSlug, FestivalDeadline>>;

export const EMPTY_FESTIVAL_DATES: FestivalDates = {};

/** One bad entry degrades to null and is skipped; it never sinks the row. */
const deadlineSchema = z
  .object({ orderBy: z.string() })
  .nullable()
  .catch(null)
  .default(null);

const festivalDatesSchema = z.record(deadlineSchema).catch({}).default({});

const FESTIVAL_DATE_BY_SLUG = new Map<string, string>(
  FESTIVAL_CALENDAR.map((f) => [f.slug, f.date]),
);

export function parseFestivalDates(raw: unknown): FestivalDates {
  const parsed = festivalDatesSchema.safeParse(raw ?? {});
  if (!parsed.success) return EMPTY_FESTIVAL_DATES;

  const out: FestivalDates = {};
  for (const [slug, value] of Object.entries(parsed.data)) {
    const festivalDate = FESTIVAL_DATE_BY_SLUG.get(slug);
    if (!festivalDate || !value) continue;
    if (!isValidIsoDay(value.orderBy)) continue;
    // Lexical comparison is exact for zero-padded ISO days.
    if (value.orderBy > festivalDate) continue;
    out[slug as FestivalSlug] = { orderBy: value.orderBy };
  }
  return out;
}

/**
 * Admin-side validation for one date input.
 *
 * A past date is a WARNING, never an error: it is a legitimate state the site
 * renders as CLOSED, and it is the exact state that prompted this feature. The
 * owner must be able to see it, not be blocked from typing it.
 */
export function checkOrderByInput(
  slug: FestivalSlug,
  value: string,
  nowMs: number,
): { error: string | null; warning: string | null } {
  const trimmed = value.trim();
  if (trimmed === '') return { error: null, warning: null };

  const festivalDate = FESTIVAL_DATE_BY_SLUG.get(slug);
  if (!festivalDate) return { error: 'Not a festival on the calendar.', warning: null };

  if (!isValidIsoDay(trimmed)) {
    return { error: 'Use a real calendar date.', warning: null };
  }
  if (trimmed > festivalDate) {
    return {
      error: `Must be on or before the festival — ${formatDocketDate(festivalDate)}.`,
      warning: null,
    };
  }

  const closed = nowMs >= endOfIstDayMs(trimmed);
  return { error: null, warning: closed ? 'Shows as CLOSED on the site.' : null };
}
