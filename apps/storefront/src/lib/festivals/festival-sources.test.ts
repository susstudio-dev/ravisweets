import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FESTIVAL_CALENDAR } from './calendar';

/**
 * GUARDS THE SOURCE TREE, NOT A MODULE.
 *
 * This feature existed because the festival calendar had been copied into six
 * files and the order-by lead into five, and the copies had silently diverged
 * — the home band told a customer 11 AUG while the festival page told them
 * 12 AUG. A unit test on the shared module cannot see that happen again; only
 * a scan of the tree can.
 *
 * If this fails, the fix is never to relax the assertion. Import from
 * lib/festivals/calendar.
 */

const SRC = join(__dirname, '..', '..');
const OWNED = `${sep}lib${sep}festivals${sep}`;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).filter((f) => !f.includes(OWNED));
const CALENDAR_DATES = FESTIVAL_CALENDAR.map((f) => f.date);

describe('the calendar lives in exactly one place', () => {
  it('declares the order-by lead nowhere else', () => {
    const offenders = FILES.filter((f) =>
      /\b(?:const|let|var)\s+\w*ORDER_BY_LEAD_DAYS\b/.test(readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('holds no second copy of the festival dates', () => {
    /*
     * TWO OR MORE, not one. A single calendar date can legitimately coincide
     * with something else — admin-promotions.tsx carries a promo expiring on
     * 2026-11-08, which happens to be Diwali. A file carrying two or more is a
     * copied calendar, every time.
     */
    const offenders = FILES.filter((f) => {
      const source = readFileSync(f, 'utf8');
      return CALENDAR_DATES.filter((d) => source.includes(d)).length >= 2;
    });
    expect(offenders).toEqual([]);
  });
});
