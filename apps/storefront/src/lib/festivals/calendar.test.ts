import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ORDER_BY_LEAD_DAYS,
  FESTIVAL_CALENDAR,
  FESTIVAL_SLUG_LIST,
  defaultOrderByDay,
  endOfIstDayMs,
  formatDocketDate,
  getFestival,
  isValidIsoDay,
  istDayOf,
  nextFestival,
} from './calendar';

/**
 * THE REGRESSION THIS FILE EXISTS FOR.
 *
 * Before the shared module, five files computed ORDER BY four different ways.
 * On 15 Aug 2026 the dispatch sheet said 12 AUG, the home band said 11 AUG in
 * IST and 10 AUG in a UTC browser, and the hero said 11 AUG in a UTC browser.
 * Both home components are client components, so an NRI customer — the exact
 * audience /send-sweets-to-india exists for — was shown an earlier deadline
 * than the festival page gave, on the same visit.
 *
 * Every assertion below must therefore hold with no reference to the machine's
 * timezone. These functions must not read it at all.
 */

describe('the calendar itself', () => {
  it('carries all eleven festivals with unique slugs', () => {
    expect(FESTIVAL_CALENDAR).toHaveLength(11);
    expect(new Set(FESTIVAL_SLUG_LIST).size).toBe(11);
    expect(FESTIVAL_SLUG_LIST).toContain('independence-day');
  });

  it('is sorted by date — nextFestival() walks it in order', () => {
    const dates = FESTIVAL_CALENDAR.map((f) => f.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('holds only real ISO days', () => {
    for (const f of FESTIVAL_CALENDAR) {
      expect(isValidIsoDay(f.date), `${f.slug} has date ${f.date}`).toBe(true);
    }
  });

  it('looks a festival up by slug, and returns undefined for a stranger', () => {
    expect(getFestival('independence-day')?.date).toBe('2026-08-15');
    expect(getFestival('navratri')).toBeUndefined();
  });
});

describe('defaultOrderByDay', () => {
  it('is three clear days before the festival', () => {
    expect(DEFAULT_ORDER_BY_LEAD_DAYS).toBe(3);
    expect(defaultOrderByDay('2026-08-15')).toBe('2026-08-12');
    expect(defaultOrderByDay('2026-08-28')).toBe('2026-08-25');
  });

  it('rolls back across a month and a year boundary', () => {
    expect(defaultOrderByDay('2027-01-01')).toBe('2026-12-29');
    expect(defaultOrderByDay('2027-03-02')).toBe('2027-02-27');
  });
});

describe('formatDocketDate', () => {
  it('renders the docket form', () => {
    expect(formatDocketDate('2026-08-12')).toBe('12 AUG 2026');
    expect(formatDocketDate('2026-11-05')).toBe('05 NOV 2026');
  });
});

describe('isValidIsoDay', () => {
  it('accepts a real day', () => {
    expect(isValidIsoDay('2026-08-12')).toBe(true);
  });

  it('rejects a day that only looks real', () => {
    // Date.parse('2026-02-30T00:00:00Z') is NOT NaN — it rolls to 2026-03-02.
    // Only the round-trip catches this.
    expect(isValidIsoDay('2026-02-30')).toBe(false);
    expect(isValidIsoDay('2026-02-29')).toBe(false); // 2026 is not a leap year
    expect(isValidIsoDay('2026-13-01')).toBe(false);
  });

  it('rejects anything that is not a bare ISO day', () => {
    expect(isValidIsoDay('2026-08-12T00:00:00Z')).toBe(false);
    expect(isValidIsoDay('12 AUG 2026')).toBe(false);
    expect(isValidIsoDay('')).toBe(false);
    expect(isValidIsoDay(20260812)).toBe(false);
    expect(isValidIsoDay(null)).toBe(false);
    expect(isValidIsoDay(undefined)).toBe(false);
  });
});

describe('endOfIstDayMs', () => {
  it('is the first instant of the next day in IST', () => {
    expect(endOfIstDayMs('2026-08-12')).toBe(Date.parse('2026-08-13T00:00:00+05:30'));
  });

  it('does not move with the machine — it is a fixed offset', () => {
    // 2026-08-12 ends at 18:30Z, which is 14:30 in New York. One instant.
    expect(endOfIstDayMs('2026-08-12')).toBe(Date.parse('2026-08-12T18:30:00Z'));
  });
});

describe('istDayOf', () => {
  it('reads the IST day at midday', () => {
    expect(istDayOf(Date.parse('2026-08-13T12:00:00+05:30'))).toBe('2026-08-13');
  });

  it('reads the IST day at the first instant of the day', () => {
    expect(istDayOf(Date.parse('2026-08-13T00:00:00+05:30'))).toBe('2026-08-13');
  });

  it('reads the IST day at the last instant of the day', () => {
    expect(istDayOf(Date.parse('2026-08-12T23:59:59.999+05:30'))).toBe('2026-08-12');
  });

  it('reads IST, not the machine — still 12 Aug in New York, but 13 Aug in IST', () => {
    // 2026-08-12T19:00:00Z is 2026-08-13T00:30 IST and 2026-08-12T15:00 in
    // New York (UTC-4 in August). Only the IST reading gives 13 Aug.
    expect(istDayOf(Date.parse('2026-08-12T19:00:00Z'))).toBe('2026-08-13');
  });

  it('agrees with the existing IST boundary: the day it names has not yet ended', () => {
    const instants = [
      Date.parse('2026-08-13T12:00:00+05:30'),
      Date.parse('2026-08-13T00:00:00+05:30'),
      Date.parse('2026-08-12T23:59:59.999+05:30'),
      Date.parse('2026-08-12T19:00:00Z'),
    ];
    for (const t of instants) {
      expect(endOfIstDayMs(istDayOf(t))).toBeGreaterThan(t);
    }
  });
});

describe('nextFestival', () => {
  const at = (iso: string) => Date.parse(iso);

  it('keeps the festival through the whole of its own day in IST', () => {
    expect(nextFestival(at('2026-08-15T23:00:00+05:30')).slug).toBe('independence-day');
  });

  it('rolls over once the festival day has ended in IST', () => {
    expect(nextFestival(at('2026-08-16T00:30:00+05:30')).slug).toBe('raksha-bandhan');
  });

  it('reads IST, not the visitor — the same instant gives the same answer', () => {
    // 2026-08-15T20:00:00Z is 2026-08-16T01:30 IST: the festival day is over.
    const instant = at('2026-08-15T20:00:00Z');
    expect(nextFestival(instant).slug).toBe('raksha-bandhan');
  });

  it('falls back to the last entry once the calendar runs out', () => {
    expect(nextFestival(at('2030-01-01T00:00:00Z')).slug).toBe('ganesh-chaturthi');
  });
});
