import { describe, expect, it } from 'vitest';
import { EMPTY_FESTIVAL_DATES, checkOrderByInput, parseFestivalDates } from './festival-dates';

/**
 * The row is admin-typed and a bad value here changes what a customer is told
 * about when their sweets arrive — the same class as `charges`, and the same
 * rule: parse on every read, never trust the row.
 *
 * Dropping is PER ENTRY. One malformed festival must not blank the ten good
 * ones, because the fallback for a dropped entry is the correct computed
 * default and the fallback for a dropped document is ten wrong dates.
 */

const AUG_13_2026_IST = Date.parse('2026-08-13T12:00:00+05:30');

describe('parseFestivalDates', () => {
  it('keeps a valid override', () => {
    expect(parseFestivalDates({ 'independence-day': { orderBy: '2026-08-14' } })).toEqual({
      'independence-day': { orderBy: '2026-08-14' },
    });
  });

  it('keeps a date in the past — that is the closed state, not an error', () => {
    expect(parseFestivalDates({ 'independence-day': { orderBy: '2026-08-01' } })).toEqual({
      'independence-day': { orderBy: '2026-08-01' },
    });
  });

  it('drops a slug that is not on the calendar', () => {
    expect(parseFestivalDates({ navratri: { orderBy: '2026-10-01' } })).toEqual({});
  });

  it('drops a cutoff after the festival — a deadline past the day is incoherent', () => {
    expect(parseFestivalDates({ 'independence-day': { orderBy: '2026-08-16' } })).toEqual({});
  });

  it('keeps a cutoff on the festival day itself', () => {
    expect(parseFestivalDates({ 'independence-day': { orderBy: '2026-08-15' } })).toEqual({
      'independence-day': { orderBy: '2026-08-15' },
    });
  });

  it('drops dates that only look real', () => {
    expect(parseFestivalDates({ eid: { orderBy: '2026-02-30' } })).toEqual({});
    expect(parseFestivalDates({ eid: { orderBy: '30-03-2026' } })).toEqual({});
    expect(parseFestivalDates({ eid: { orderBy: '2026-03-27T00:00:00Z' } })).toEqual({});
  });

  it('drops malformed values without touching the good ones', () => {
    const result = parseFestivalDates({
      'independence-day': { orderBy: '2026-08-14' },
      diwali: { orderBy: 42 },
      christmas: null,
      onam: 'not-an-object',
      eid: {},
    });
    expect(result).toEqual({ 'independence-day': { orderBy: '2026-08-14' } });
  });

  it('returns empty for a row that is not an object at all', () => {
    expect(parseFestivalDates(null)).toEqual(EMPTY_FESTIVAL_DATES);
    expect(parseFestivalDates(undefined)).toEqual(EMPTY_FESTIVAL_DATES);
    expect(parseFestivalDates('nope')).toEqual(EMPTY_FESTIVAL_DATES);
    expect(parseFestivalDates([1, 2, 3])).toEqual(EMPTY_FESTIVAL_DATES);
  });
});

describe('checkOrderByInput', () => {
  it('accepts a blank input — blank means "use the default"', () => {
    expect(checkOrderByInput('independence-day', '', AUG_13_2026_IST)).toEqual({
      error: null,
      warning: null,
    });
  });

  it('accepts a future date with nothing to say', () => {
    expect(checkOrderByInput('independence-day', '2026-08-14', AUG_13_2026_IST)).toEqual({
      error: null,
      warning: null,
    });
  });

  it('rejects a cutoff after the festival, naming the festival date', () => {
    const r = checkOrderByInput('independence-day', '2026-08-16', AUG_13_2026_IST);
    expect(r.error).toContain('15 AUG 2026');
    expect(r.warning).toBeNull();
  });

  it('rejects a date that is not a real day', () => {
    expect(checkOrderByInput('eid', '2026-02-30', AUG_13_2026_IST).error).not.toBeNull();
  });

  it('warns — but does not reject — a date already past', () => {
    // This is the reported bug's own state: 12 Aug, viewed on 13 Aug.
    const r = checkOrderByInput('independence-day', '2026-08-12', AUG_13_2026_IST);
    expect(r.error).toBeNull();
    expect(r.warning).toContain('CLOSED');
  });

  it('does not warn on the cutoff day itself, right up to midnight IST', () => {
    const lastMoment = Date.parse('2026-08-12T23:59:59.999+05:30');
    expect(checkOrderByInput('independence-day', '2026-08-12', lastMoment).warning).toBeNull();
  });
});
