import { describe, expect, it } from 'vitest';
import { resolveOrderBy } from './resolve-order-by';

const INDEPENDENCE_DAY = '2026-08-15';
const at = (iso: string) => Date.parse(iso);

describe('resolveOrderBy — which date is in force', () => {
  it('computes festival − 3 when there is no override', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, undefined, at('2026-08-01T00:00:00+05:30'));
    expect(r.day).toBe('2026-08-12');
    expect(r.label).toBe('12 AUG 2026');
  });

  it('lets a valid override win', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, '2026-08-14', at('2026-08-01T00:00:00+05:30'));
    expect(r.day).toBe('2026-08-14');
    expect(r.label).toBe('14 AUG 2026');
  });

  it('falls back when the override is not a real day', () => {
    expect(resolveOrderBy(INDEPENDENCE_DAY, '2026-02-30', 0).day).toBe('2026-08-12');
    expect(resolveOrderBy(INDEPENDENCE_DAY, '', 0).day).toBe('2026-08-12');
    expect(resolveOrderBy(INDEPENDENCE_DAY, 'soon', 0).day).toBe('2026-08-12');
  });

  it('falls back when the override lands after the festival', () => {
    expect(resolveOrderBy(INDEPENDENCE_DAY, '2026-08-16', 0).day).toBe('2026-08-12');
  });

  it('accepts a cutoff on the festival day itself — the <= is deliberate', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, '2026-08-15', at('2026-08-01T00:00:00+05:30'));
    expect(r.day).toBe('2026-08-15');
    expect(r.label).toBe('15 AUG 2026');
  });
});

describe('resolveOrderBy — closed', () => {
  it('is open through the last millisecond of the cutoff day in IST', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, undefined, at('2026-08-12T23:59:59.999+05:30'));
    expect(r.closed).toBe(false);
  });

  it('is closed the moment IST ticks into the next day', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, undefined, at('2026-08-13T00:00:00+05:30'));
    expect(r.closed).toBe(true);
  });

  it('reproduces the reported bug: 12 AUG cutoff, viewed on 13 AUG', () => {
    const r = resolveOrderBy(INDEPENDENCE_DAY, undefined, at('2026-08-13T12:00:00+05:30'));
    expect(r.label).toBe('12 AUG 2026');
    expect(r.closed).toBe(true);
  });

  it('is never closed at the first-paint seed of 0', () => {
    expect(resolveOrderBy(INDEPENDENCE_DAY, undefined, 0).closed).toBe(false);
  });

  it('closes on IST, not on the visitor — one instant, one verdict', () => {
    /*
     * 2026-08-12T19:00:00Z is 13 Aug 00:30 IST — closed — while it is still
     * 12 Aug 15:00 in New York. Before this module the New York visitor was
     * shown a DIFFERENT deadline from the festival page; the deadline belongs
     * to the kitchen, so the verdict must come from the instant alone.
     */
    const instant = at('2026-08-12T19:00:00Z');
    expect(resolveOrderBy(INDEPENDENCE_DAY, undefined, instant).closed).toBe(true);
  });

  it('tracks the override, not the default, when deciding closed', () => {
    const noon13th = at('2026-08-13T12:00:00+05:30');
    expect(resolveOrderBy(INDEPENDENCE_DAY, '2026-08-14', noon13th).closed).toBe(false);
    expect(resolveOrderBy(INDEPENDENCE_DAY, '2026-08-10', noon13th).closed).toBe(true);
  });
});
