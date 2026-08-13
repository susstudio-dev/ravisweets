# Festival Order-By Dates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner set each festival's order-by date from `/admin/festivals`, show a
CLOSED state once that date has passed, and make all six festival surfaces read one
calendar computed one way.

**Architecture:** A new `src/lib/festivals/` module owns the calendar, the date maths, and
a pure `resolveOrderBy(festivalISO, override, nowMs)`. Owner overrides live in a new
`festival_dates` key on the existing `site_content` KV table, parsed on every read. A thin
`useOrderBy` hook binds the pure function to `SiteContentProvider` and a client clock; two
small client components (`OrderByField`, `FestivalActions`) carry it into pages that stay
server components.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), React 18, TypeScript, Zod 3,
Supabase JS 2, Tailwind, Vitest 2 (`environment: 'node'`), pnpm 9 workspace.

**Spec:** `docs/superpowers/specs/2026-08-13-festival-order-by-design.md`

## Global Constraints

- **All commands run from `apps/storefront/`.** Tests: `pnpm vitest run <path>`. Full
  suite: `pnpm test`. Types: `pnpm typecheck`. Lint: `pnpm lint`.
- **Vitest sees only `src/**/*.test.ts`** (not `.tsx`) and runs `environment: 'node'`.
  There is no DOM. Never write a test that renders a component or calls a hook.
- **No test may call `Date.now()` or construct `new Date()` with no argument.** Clocks are
  injected as a `nowMs: number` parameter.
- **All date maths is UTC or explicit `+05:30`.** No `toLocaleDateString` without an
  explicit `timeZone`, no reliance on the machine's zone. This is the bug being fixed.
- **`Date.parse('2026-02-30T00:00:00Z')` does NOT return NaN** — it rolls over to
  2026-03-02. Verified. Date validation must round-trip through `toISOString()`.
- The storefront is a static export. Anything read from Supabase or from the clock resolves
  **after hydration**; the prerendered HTML must render the computed default.
- Never commit anything under `apps/storefront/out/`, `public/products/`, or the other
  files already dirty on this branch. Each commit lists its paths explicitly.
- Branch: `festival-order-by-dates`. Commit after every task.
- No database migration. `site_content` is an unconstrained `(key, data)` table.

---

### Task 1: The shared festival calendar

The single source for festival identity, dates, and the two date functions everything else
will use.

**Files:**
- Create: `apps/storefront/src/lib/festivals/calendar.ts`
- Test: `apps/storefront/src/lib/festivals/calendar.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `FestivalSlug` (union type), `FestivalEntry` (`{ slug; title; telugu; date }`),
  `FESTIVAL_CALENDAR: readonly FestivalEntry[]`, `FESTIVAL_SLUG_LIST: readonly FestivalSlug[]`,
  `getFestival(slug: string): FestivalEntry | undefined`,
  `DEFAULT_ORDER_BY_LEAD_DAYS: 3`,
  `defaultOrderByDay(festivalISO: string): string`,
  `formatDocketDate(iso: string): string`,
  `isValidIsoDay(value: unknown): value is string`,
  `endOfIstDayMs(iso: string): number`,
  `nextFestival(nowMs: number): FestivalEntry`.

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/src/lib/festivals/calendar.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/calendar.test.ts
```

Expected: FAIL — `Failed to resolve import "./calendar"`.

- [ ] **Step 3: Write the implementation**

Create `apps/storefront/src/lib/festivals/calendar.ts`:

```ts
/**
 * THE festival calendar. One list, one set of date functions.
 *
 * Before this module, the calendar existed in six places — the two /festivals
 * routes, hero-batch, festival-next-band, send-sweets-to-india, and a seventh
 * truncated copy in content/page-media.ts — and the order-by lead was declared
 * five times against four different date implementations that disagreed with
 * each other in IST and disagreed further in any other timezone.
 *
 * NOTHING HERE MAY READ THE MACHINE'S TIMEZONE. `formatDocketDate` does string
 * arithmetic and constructs no Date at all; `defaultOrderByDay` uses Date.UTC;
 * anything about "today" takes an explicit `nowMs` and compares against an
 * explicit +05:30. The kitchen's cutoff is an IST fact and does not move with
 * the customer.
 *
 * Copy, palettes, hero images and curated product lists deliberately stay in
 * the pages that render them — only identity and dates live here.
 */

export type FestivalSlug =
  | 'eid'
  | 'independence-day'
  | 'raksha-bandhan'
  | 'diwali'
  | 'christmas'
  | 'sankranti'
  | 'pongal'
  | 'holi'
  | 'ugadi'
  | 'onam'
  | 'ganesh-chaturthi';

export interface FestivalEntry {
  slug: FestivalSlug;
  title: string;
  /** The festival's name in its own script. Onam's is Malayalam, not Telugu. */
  telugu: string;
  /** ISO day, 'YYYY-MM-DD'. The festival itself, in IST. */
  date: string;
}

/** Sorted by date — `nextFestival` walks it in order and a test enforces this. */
export const FESTIVAL_CALENDAR: readonly FestivalEntry[] = [
  { slug: 'eid', title: 'Eid', telugu: 'ఈద్', date: '2026-03-30' },
  {
    slug: 'independence-day',
    title: 'Independence Day',
    telugu: 'స్వాతంత్ర్య దినోత్సవం',
    date: '2026-08-15',
  },
  { slug: 'raksha-bandhan', title: 'Raksha Bandhan', telugu: 'రక్షా బంధన్', date: '2026-08-28' },
  { slug: 'diwali', title: 'Diwali', telugu: 'దీపావళి', date: '2026-11-08' },
  { slug: 'christmas', title: 'Christmas', telugu: 'క్రిస్మస్', date: '2026-12-25' },
  { slug: 'sankranti', title: 'Sankranti', telugu: 'సంక్రాంతి', date: '2027-01-14' },
  { slug: 'pongal', title: 'Pongal', telugu: 'పొంగల్', date: '2027-01-15' },
  { slug: 'holi', title: 'Holi', telugu: 'హోలీ', date: '2027-03-13' },
  { slug: 'ugadi', title: 'Ugadi', telugu: 'ఉగాది', date: '2027-03-19' },
  { slug: 'onam', title: 'Onam', telugu: 'ഓണം', date: '2027-09-04' },
  {
    slug: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    telugu: 'వినాయక చవితి',
    date: '2027-09-15',
  },
];

export const FESTIVAL_SLUG_LIST: readonly FestivalSlug[] = FESTIVAL_CALENDAR.map((f) => f.slug);

const BY_SLUG = new Map<string, FestivalEntry>(FESTIVAL_CALENDAR.map((f) => [f.slug, f]));

export function getFestival(slug: string): FestivalEntry | undefined {
  return BY_SLUG.get(slug);
}

/** Dispatch needs three clear days before the festival for the fresh range. */
export const DEFAULT_ORDER_BY_LEAD_DAYS = 3;

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const DAY_MS = 86_400_000;

/**
 * '2026-08-12' → '12 AUG 2026'. String slicing only — this function builds no
 * Date, so there is no timezone for it to read.
 */
export function formatDocketDate(iso: string): string {
  const year = iso.slice(0, 4);
  const month = Number(iso.slice(5, 7));
  const day = iso.slice(8, 10);
  return `${day} ${MONTHS[month - 1] ?? ''} ${year}`;
}

/**
 * '2026-08-15' → '2026-08-12'. Date.UTC normalises month and year underflow,
 * so 1 Jan − 3 correctly yields 29 Dec of the previous year.
 */
export function defaultOrderByDay(festivalISO: string): string {
  const year = Number(festivalISO.slice(0, 4));
  const month = Number(festivalISO.slice(5, 7));
  const day = Number(festivalISO.slice(8, 10));
  return new Date(Date.UTC(year, month - 1, day - DEFAULT_ORDER_BY_LEAD_DAYS))
    .toISOString()
    .slice(0, 10);
}

/**
 * A real calendar day in 'YYYY-MM-DD' form.
 *
 * The round-trip is load-bearing and not defensive padding: Date.parse of
 * '2026-02-30T00:00:00Z' does NOT return NaN, it silently rolls over to
 * 2 March. Only comparing the formatted result back against the input rejects
 * a date the owner could plausibly type.
 */
export function isValidIsoDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms)) return false;
  return new Date(ms).toISOString().slice(0, 10) === value;
}

/**
 * The instant an ISO day ends in IST — i.e. midnight that begins the next day.
 *
 * THE ONE PLACE THE +05:30 OFFSET IS WRITTEN. Three callers ask "is this day
 * over?" (the festival selector, the order-by resolver, the admin's past-date
 * warning) and all three must agree to the millisecond, because disagreeing
 * about exactly this is what put a different deadline on the home page than
 * on the festival page. IST observes no DST, so the fixed 24-hour span is
 * exact.
 */
export function endOfIstDayMs(iso: string): number {
  return Date.parse(`${iso}T00:00:00+05:30`) + DAY_MS;
}

/**
 * The soonest festival whose own day has not yet ended in IST; the last entry
 * once the calendar runs out. Selection is by the caller's clock, but the
 * boundary is always IST.
 */
export function nextFestival(nowMs: number): FestivalEntry {
  return (
    FESTIVAL_CALENDAR.find((f) => endOfIstDayMs(f.date) > nowMs) ??
    FESTIVAL_CALENDAR[FESTIVAL_CALENDAR.length - 1]!
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/calendar.test.ts
```

Expected: PASS, 16 tests.

- [ ] **Step 5: Prove the timezone claim**

```bash
cd apps/storefront && TZ=UTC pnpm vitest run src/lib/festivals/calendar.test.ts && TZ=America/New_York pnpm vitest run src/lib/festivals/calendar.test.ts
```

Expected: PASS in both. If either fails, a function is reading the machine's zone — fix it
before moving on; this is the entire point of the module.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/lib/festivals/calendar.ts apps/storefront/src/lib/festivals/calendar.test.ts
git commit -m "feat: one festival calendar with timezone-proof date maths"
```

---

### Task 2: The `festival_dates` parser

The owner's overrides, validated on every read. Nothing trusts the raw row.

**Files:**
- Create: `apps/storefront/src/lib/festivals/festival-dates.ts`
- Test: `apps/storefront/src/lib/festivals/festival-dates.test.ts`

**Interfaces:**
- Consumes: `FESTIVAL_CALENDAR`, `FestivalSlug`, `isValidIsoDay`, `formatDocketDate`,
  `endOfIstDayMs` from `./calendar` (Task 1).
- Produces: `FestivalDeadline` (`{ orderBy: string }`),
  `FestivalDates` (`Partial<Record<FestivalSlug, FestivalDeadline>>`),
  `EMPTY_FESTIVAL_DATES: FestivalDates`,
  `parseFestivalDates(raw: unknown): FestivalDates`,
  `checkOrderByInput(slug, value, nowMs): { error: string | null; warning: string | null }`.

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/src/lib/festivals/festival-dates.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/festival-dates.test.ts
```

Expected: FAIL — `Failed to resolve import "./festival-dates"`.

- [ ] **Step 3: Write the implementation**

Create `apps/storefront/src/lib/festivals/festival-dates.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/festival-dates.test.ts
```

Expected: PASS, 14 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/src/lib/festivals/festival-dates.ts apps/storefront/src/lib/festivals/festival-dates.test.ts
git commit -m "feat: validated festival_dates overrides with admin input checks"
```

---

### Task 3: Pure order-by resolution

Override plus default plus clock, in one pure function. This is the whole behaviour of the
feature; everything after it is wiring.

**Files:**
- Create: `apps/storefront/src/lib/festivals/resolve-order-by.ts`
- Test: `apps/storefront/src/lib/festivals/resolve-order-by.test.ts`

**Interfaces:**
- Consumes: `defaultOrderByDay`, `formatDocketDate`, `isValidIsoDay`, `endOfIstDayMs` from
  `./calendar`.
- Produces: `OrderByState` (`{ day: string; label: string; closed: boolean }`),
  `resolveOrderBy(festivalISO: string, override: string | undefined, nowMs: number): OrderByState`.

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/src/lib/festivals/resolve-order-by.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/resolve-order-by.test.ts
```

Expected: FAIL — `Failed to resolve import "./resolve-order-by"`.

- [ ] **Step 3: Write the implementation**

Create `apps/storefront/src/lib/festivals/resolve-order-by.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/storefront && TZ=UTC pnpm vitest run src/lib/festivals/resolve-order-by.test.ts && TZ=Asia/Kolkata pnpm vitest run src/lib/festivals/resolve-order-by.test.ts
```

Expected: PASS in both zones, 10 tests each.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/src/lib/festivals/resolve-order-by.ts apps/storefront/src/lib/festivals/resolve-order-by.test.ts
git commit -m "feat: pure order-by resolution with an IST-pinned closed boundary"
```

---

### Task 4: Wire `festival_dates` through site content

Plumbing only — the new key joins the existing load / Realtime / 60s-poll path, and a hook
binds the pure function to it. There is no unit test here: every file is React or Supabase
and the suite is node-only. The gate is `pnpm typecheck`.

**Files:**
- Modify: `apps/storefront/src/lib/supabase/site-content.ts` (key union at :12-21, `ContentByKey` at :151-161)
- Modify: `apps/storefront/src/lib/supabase/site-content-context.tsx` (value interface :35-54, default ctx :56-70, initial state :89-100, refresh :114-126)
- Create: `apps/storefront/src/lib/festivals/use-order-by.ts`

**Interfaces:**
- Consumes: `parseFestivalDates`, `FestivalDates` (Task 2); `resolveOrderBy`, `OrderByState`
  (Task 3); `FestivalSlug` (Task 1).
- Produces: `useSiteContent().festivalDates: FestivalDates`;
  `useOrderBy(slug: FestivalSlug, festivalISO: string): OrderByState`.

- [ ] **Step 1: Add the key to `site-content.ts`**

Add the import at the top of the file:

```ts
import type { FestivalDates } from '../festivals/festival-dates';
```

Add `'festival_dates'` to the `SiteContentKey` union (after `'active_festival'`):

```ts
export type SiteContentKey =
  | 'hero'
  | 'signature_moment'
  | 'editorial_band_heading'
  | 'footer'
  | 'home_trust'
  | 'active_festival'
  | 'festival_dates'
  | 'page_media'
  | 'charges'
  | 'about_founder';
```

Add the row to `ContentByKey` (after `active_festival`):

```ts
  active_festival: ActiveFestival;
  /**
   * Owner-set dispatch deadlines, keyed by festival slug. Reads must go
   * through parseFestivalDates — a bad value here tells a customer the wrong
   * day to order by.
   */
  festival_dates: FestivalDates;
```

Re-export the type next to the existing `export type { PageMedia };`:

```ts
export type { FestivalDates };
```

- [ ] **Step 2: Expose it from the provider**

In `site-content-context.tsx`, add the import beside the existing `site-content` imports:

```ts
import { EMPTY_FESTIVAL_DATES, parseFestivalDates } from '@/lib/festivals/festival-dates';
import type { FestivalDates } from '@/lib/festivals/festival-dates';
```

Add to the `SiteContentValue` interface, directly after `activeFestival`:

```ts
  /** Owner-set order-by dates — parsed (never raw), empty until loaded. */
  festivalDates: FestivalDates;
```

Add `festivalDates: EMPTY_FESTIVAL_DATES,` to **both** the `createContext` default object
and the `useState` initial object.

In `refresh()`, add to the `setState` call beside the other parsed rows:

```ts
        // Re-parsed on every refetch — the raw row is never trusted.
        charges: parseCharges(all.charges),
        festivalDates: parseFestivalDates(all.festival_dates),
        pageMedia: parsePageMedia(all.page_media),
```

- [ ] **Step 3: Write the hook**

Create `apps/storefront/src/lib/festivals/use-order-by.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { resolveOrderBy, type OrderByState } from './resolve-order-by';
import type { FestivalSlug } from './calendar';

/**
 * The order-by state for one festival, live.
 *
 * TWO THINGS RESOLVE AFTER HYDRATION, and both must, because this site is a
 * static export:
 *
 *   1. The owner's override, which arrives through SiteContentProvider's
 *      Realtime subscription and 60-second poll.
 *   2. The clock. A prerendered "is it past?" is stale the next morning —
 *      the same reason hero-batch.tsx resolves its date client-side.
 *
 * `now` is seeded to 0, which resolveOrderBy reads as "never closed", so the
 * prerendered HTML and the first hydration pass render identically and React
 * logs no mismatch. The effect then supplies the real clock and the CLOSED
 * marker appears on the next frame. The static HTML still carries the computed
 * default date, so the deadline stays in the indexed markup and there is no
 * empty flash.
 */
export function useOrderBy(slug: FestivalSlug, festivalISO: string): OrderByState {
  const { festivalDates } = useSiteContent();
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  return resolveOrderBy(festivalISO, festivalDates[slug]?.orderBy, nowMs);
}
```

- [ ] **Step 4: Verify types and the untouched suite**

```bash
cd apps/storefront && pnpm typecheck && pnpm test
```

Expected: typecheck clean; all existing tests plus Tasks 1-3 pass.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/src/lib/supabase/site-content.ts apps/storefront/src/lib/supabase/site-content-context.tsx apps/storefront/src/lib/festivals/use-order-by.ts
git commit -m "feat: carry festival_dates through the site content provider"
```

---

### Task 5: The `OrderByField` and `FestivalActions` components

Two small client components so the three pages that render an order-by date can stay server
components.

**Files:**
- Create: `apps/storefront/src/components/festivals/order-by-field.tsx`
- Create: `apps/storefront/src/components/festivals/festival-actions.tsx`

**Interfaces:**
- Consumes: `useOrderBy` (Task 4), `FestivalSlug` (Task 1).
- Produces: `<OrderByField slug festivalDate />` — renders a fragment, drops into an
  existing `<dd>` unchanged. `<FestivalActions slug festivalDate title>{children}</FestivalActions>` —
  renders the festival page's whole button row.

- [ ] **Step 1: Write `OrderByField`**

Create `apps/storefront/src/components/festivals/order-by-field.tsx`:

```tsx
'use client';

import { useOrderBy } from '@/lib/festivals/use-order-by';
import type { FestivalSlug } from '@/lib/festivals/calendar';

/**
 * The ORDER BY value, live.
 *
 * Renders a FRAGMENT, not an element: it drops inside whichever <dd> the
 * calling page already styles, so no surface has to restyle its docket to
 * adopt it, and the CLOSED marker sits on the same line as the date. That is
 * deliberate — a marker on its own line would reflow the sheet the moment the
 * clock resolves after hydration.
 *
 * The date is never removed when closed. It stays as a record, so the page
 * reads as history rather than as a broken instruction.
 */
export function OrderByField({
  slug,
  festivalDate,
}: {
  slug: FestivalSlug;
  festivalDate: string;
}) {
  const { label, closed } = useOrderBy(slug, festivalDate);
  return (
    <>
      {label}
      {closed && (
        <span className="text-text-muted font-normal"> · CLOSED</span>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write `FestivalActions`**

Create `apps/storefront/src/components/festivals/festival-actions.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useOrderBy } from '@/lib/festivals/use-order-by';
import type { FestivalSlug } from '@/lib/festivals/calendar';

/*
 * The same number every other surface uses (footer, header, stores,
 * floating-contact, send-sweets-to-india). Unifying those seven copies is
 * explicitly out of scope for this change.
 */
const WHATSAPP_NUMBER = '919398859978';

/**
 * The festival page's button row, which changes shape once the deadline has
 * passed.
 *
 * The collection stays reachable and the products stay purchasable when
 * closed: the deadline is a promise about dispatch before the festival, not a
 * shuttered shop. What changes is what we lead with — a conversation about
 * whether we can still make it, rather than a browse.
 *
 * `children` carries the AR preview through from the server component that
 * renders this, so this file needs to know nothing about it.
 */
export function FestivalActions({
  slug,
  festivalDate,
  title,
  children,
}: {
  slug: FestivalSlug;
  festivalDate: string;
  title: string;
  children?: ReactNode;
}) {
  const { closed } = useOrderBy(slug, festivalDate);
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi — is it still possible to order the ${title} box?`,
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      {closed && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="stamp">
          Ask about last-minute orders
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <Link href="#hampers" className={closed ? 'stamp stamp--ghost' : 'stamp'}>
        See the collection
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link href="/corporate#enquiry" className="stamp stamp--ghost">
        Corporate enquiry
      </Link>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify types**

```bash
cd apps/storefront && pnpm typecheck
```

Expected: clean. (Nothing imports these yet — Task 6 does.)

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/src/components/festivals/order-by-field.tsx apps/storefront/src/components/festivals/festival-actions.tsx
git commit -m "feat: live order-by field and a closed-state action row"
```

---

### Task 6: The festival page — `/festivals/[slug]`

The page from the report. Its local calendar and date functions go; copy, palette, gifting
cards and curated products stay exactly as they are.

**Files:**
- Modify: `apps/storefront/src/app/festivals/[slug]/page.tsx`

**Interfaces:**
- Consumes: `FESTIVAL_CALENDAR`, `FESTIVAL_SLUG_LIST`, `getFestival`, `formatDocketDate`,
  `FestivalSlug` (Task 1); `<OrderByField>`, `<FestivalActions>` (Task 5).
- Produces: nothing new.

- [ ] **Step 1: Replace the slug type and the local dates**

Delete the local `export type FestivalSlug = …` block (lines 19-30) and import it instead.
Add to the imports at the top:

```ts
import {
  FESTIVAL_SLUG_LIST,
  formatDocketDate,
  getFestival,
  type FestivalSlug,
} from '@/lib/festivals/calendar';
import { OrderByField } from '@/components/festivals/order-by-field';
import { FestivalActions } from '@/components/festivals/festival-actions';
```

Remove `date: string; // ISO` from the `interface Festival` declaration, and delete the
`date:` line from **all eleven** entries in the `FESTIVALS` map. Leave every other field
(`title`, `telugu`, `tagline`, `eyebrow`, `body`, `heroImage`, `theme`, `gifteeFor`,
`productSlugs`) untouched.

Note the map also carries `title` and `telugu`, which now duplicate the calendar. Leave
them: they are read directly by the copy around them, and the guard test in Task 9 checks
for duplicated **dates**, which are what drift into wrong deadlines.

- [ ] **Step 2: Replace the date helpers**

Delete these three declarations entirely (lines 502-525): the `ORDER_BY_LEAD_DAYS` const,
`orderByDay()`, and `formatSheetDate()`. `formatDocketDate` from the calendar replaces the
last of them.

Replace `const SLUGS = Object.keys(FESTIVALS) as FestivalSlug[];` with:

```ts
const SLUGS = FESTIVAL_SLUG_LIST;
```

- [ ] **Step 3: Read the date from the calendar in the page body**

In `FestivalPage`, after the existing `if (!f) notFound();`, add:

```ts
  const entry = getFestival(slug);
  if (!entry) notFound();
```

- [ ] **Step 4: Rewrite the two date rows and the button row**

Replace the `<dl>` block (currently lines 555-570) with:

```tsx
              <dl className="w-full max-w-sm">
                <div className="field-row">
                  <dt className="field-label">Edition</dt>
                  <dd className="field-value text-sm">{f.eyebrow}</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Festival</dt>
                  <dd className="field-value text-sm">{formatDocketDate(entry.date)}</dd>
                </div>
                <div className="field-row">
                  <dt className="field-label">Order by</dt>
                  <dd className="field-value text-sm font-bold">
                    <OrderByField slug={slug as FestivalSlug} festivalDate={entry.date} />
                  </dd>
                </div>
              </dl>
```

Replace the button row (currently lines 574-588) with:

```tsx
              <FestivalActions
                slug={slug as FestivalSlug}
                festivalDate={entry.date}
                title={f.title}
              >
                <HamperARPreview
                  glb={SAMPLE_HAMPER_GLB}
                  usdz={SAMPLE_HAMPER_USDZ}
                  caption={`${f.title} hamper`}
                  bg={f.theme.base}
                />
              </FestivalActions>
```

Update the sheet's block comment so it no longer claims the deadline is always festival
minus three — replace the phrase `ORDER BY is the festival date minus three clear dispatch
days.` with `ORDER BY is owner-set in /admin/festivals, defaulting to three clear dispatch
days before the festival, and marks itself CLOSED once it has passed.`

- [ ] **Step 5: Verify**

```bash
cd apps/storefront && pnpm typecheck && pnpm lint
```

Expected: both clean. A `Property 'date' does not exist` error means a `date:` line was
missed in one of the eleven entries.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/app/festivals/[slug]/page.tsx
git commit -m "feat: the festival sheet reads the shared calendar and closes its deadline"
```

---

### Task 7: The festivals index and the diaspora page

Same treatment, two more server components.

**Files:**
- Modify: `apps/storefront/src/app/festivals/page.tsx`
- Modify: `apps/storefront/src/app/send-sweets-to-india/page.tsx`

**Interfaces:**
- Consumes: `getFestival`, `formatDocketDate`, `nextFestival`, `FestivalSlug` (Task 1);
  `<OrderByField>` (Task 5).
- Produces: nothing new.

- [ ] **Step 1: `/festivals` — drop the local dates**

In `apps/storefront/src/app/festivals/page.tsx`, add the imports:

```ts
import { formatDocketDate, getFestival, type FestivalSlug } from '@/lib/festivals/calendar';
import { OrderByField } from '@/components/festivals/order-by-field';
```

Remove `date: string;` from `interface FestivalRow`, change its `slug: string;` to
`slug: FestivalSlug;`, delete the `date:` line from all eleven `FESTIVALS` entries, and
update the mirror comment above the array to read:

```ts
// Presentation only — dates and identity come from lib/festivals/calendar.
// This array carries what the index card shows on top of them: the month
// label, the one-line blurb, and the palette the Telugu mark is stamped in.
```

Delete `ORDER_BY_LEAD_DAYS`, `orderByDay()` and `formatSheetDate()` (lines 129-151).

- [ ] **Step 2: `/festivals` — sort and render from the calendar**

Replace `compareDate` and the top of `FestivalsIndexPage` with:

```ts
/**
 * Throws rather than returning a blank: this runs during the static export, so
 * a slug that has fallen off the calendar fails the BUILD instead of shipping
 * a card with an empty date where a deadline should be.
 */
function festivalDate(f: FestivalRow): string {
  const entry = getFestival(f.slug);
  if (!entry) throw new Error(`festival card references an unknown slug: ${f.slug}`);
  return entry.date;
}

export default function FestivalsIndexPage() {
  const sorted = [...FESTIVALS].sort((a, b) => festivalDate(a).localeCompare(festivalDate(b)));
  /*
   * Build-time split. The page is statically exported, so this line is
   * evaluated once at build; a festival that passes afterwards stays under
   * "Upcoming" until the next deploy. That is the pre-existing behaviour and
   * the ORDER BY row, which is client-resolved, is the one that self-corrects.
   */
  const now = Date.now();
  const upcoming = sorted.filter((f) => Date.parse(`${festivalDate(f)}T00:00:00+05:30`) > now);
  const past = sorted.filter((f) => Date.parse(`${festivalDate(f)}T00:00:00+05:30`) <= now);
```

Leave the rest of the function body unchanged.

- [ ] **Step 3: `/festivals` — the card**

In `FestivalCard`, replace the `<dl>` block (lines 249-258) with:

```tsx
      <dl className="mt-4">
        <div className="field-row">
          <dt className="field-label">Festival</dt>
          <dd className="field-value text-sm">{formatDocketDate(festivalDate(f))}</dd>
        </div>
        <div className="field-row">
          <dt className="field-label">Order by</dt>
          <dd className="field-value text-sm font-bold">
            <OrderByField slug={f.slug} festivalDate={festivalDate(f)} />
          </dd>
        </div>
      </dl>
```

Update the `FestivalCard` doc comment's last line — `ORDER BY is the festival date minus
three clear dispatch days.` — to `ORDER BY is owner-set, and marks itself CLOSED once it
has passed.`

- [ ] **Step 4: `/send-sweets-to-india`**

Add the imports:

```ts
import { formatDocketDate, getFestival, type FestivalSlug } from '@/lib/festivals/calendar';
import { OrderByField } from '@/components/festivals/order-by-field';
```

Replace the `FESTIVAL_HOOKS` array and everything down to `formatOrderBy` (lines 34-70)
with:

```ts
/**
 * The two festivals the diaspora ships home for first. Identity and dates come
 * from the shared calendar; this list is only the choice of which two to show.
 */
const FESTIVAL_HOOK_SLUGS = ['raksha-bandhan', 'diwali'] as const;

const FESTIVAL_HOOKS = FESTIVAL_HOOK_SLUGS.map((slug) => getFestival(slug)!);

const WHATSAPP_URL = 'https://wa.me/919398859978';
```

Delete the now-unused `MONTHS`, `parseIso`, `formatDocketDate` and `formatOrderBy` local
declarations, and delete the original `const WHATSAPP_URL = …` line (line 72) so it is not
declared twice.

Replace the `<dl>` block (lines 225-238) with:

```tsx
                <dl>
                  <div className="field-row">
                    <dt className="field-label">Festival</dt>
                    <dd className="field-value text-theme-ink text-sm">
                      {formatDocketDate(f.date)}
                    </dd>
                  </div>
                  <div className="field-row">
                    <dt className="field-label">Order by</dt>
                    <dd className="field-value text-theme-ink text-sm font-bold">
                      <OrderByField slug={f.slug as FestivalSlug} festivalDate={f.date} />
                    </dd>
                  </div>
                </dl>
```

- [ ] **Step 5: Verify**

```bash
cd apps/storefront && pnpm typecheck && pnpm lint
```

Expected: both clean. An "unused variable" lint error means a helper survived its last
caller — delete it.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/app/festivals/page.tsx apps/storefront/src/app/send-sweets-to-india/page.tsx
git commit -m "feat: index cards and the diaspora page read one calendar"
```

---

### Task 8: The two home-page surfaces

These carry the off-by-one. `FestivalNextBand` renders 11 AUG where the festival page
renders 12 AUG, and both drift further west of IST.

**Files:**
- Modify: `apps/storefront/src/components/sections/festival-next-band.tsx`
- Modify: `apps/storefront/src/components/hero/hero-batch.tsx`

**Interfaces:**
- Consumes: `nextFestival`, `formatDocketDate` (Task 1); `useOrderBy` (Task 4).
- Produces: nothing new.

- [ ] **Step 1: `FestivalNextBand`**

Replace the imports, the local `FESTIVALS` array, `ORDER_BY_LEAD_DAYS`, `formatBandDate`
and both `useMemo` blocks (lines 1-61) with:

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { formatDocketDate, nextFestival } from '@/lib/festivals/calendar';
import { useOrderBy } from '@/lib/festivals/use-order-by';

/**
 * Festival next — a carbon-register band that always sells the urgent thing:
 * whichever festival is coming up soonest, taken from the shared calendar.
 *
 * This component used to hold its own eight-festival list and its own date
 * maths, and the maths was wrong: it built an IST-midnight Date and then read
 * `.toISOString()`, which shifts the instant back into the previous UTC day.
 * The band rendered 11 AUG against the festival page's 12 AUG in IST, and
 * 10 AUG in a UTC browser. The order-by date is now resolved by the same
 * function every other surface calls.
 *
 * The live countdown was removed with the retired world. A ticking seconds
 * digit re-rendered this section once per second forever, and it is flash-sale
 * theatre: a kitchen records an order-by date, it does not run a clock.
 */
export function FestivalNextBand() {
  /*
   * Seeded at render and re-read after mount: the static export bakes the
   * build-time choice into the HTML, and the browser corrects it. Same reason
   * hero-batch resolves its date client-side.
   */
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const next = nextFestival(nowMs);
  const orderBy = useOrderBy(next.slug, next.date);
```

The old `if (!next) return null;` guard goes with the old array — `nextFestival` always
returns an entry, so keeping it would be unreachable code the linter flags.

Then replace the two `<dd>` values inside the existing `<dl>`:

```tsx
                <dd className="field-value text-sm">{formatDocketDate(next.date)}</dd>
```

and

```tsx
                <dd className="field-value text-sm font-bold">
                  {orderBy.label}
                  {orderBy.closed && (
                    <span className="text-text-muted font-normal"> · CLOSED</span>
                  )}
                </dd>
```

Everything from `return (` onward is otherwise unchanged.

- [ ] **Step 2: `HeroBatch`**

Delete the local `FESTIVALS` array, `ORDER_BY_LEAD_DAYS`, `formatDocketDate` and
`nextFestival` (lines 128-159). Add to the imports:

```ts
import { formatDocketDate, nextFestival } from '@/lib/festivals/calendar';
import { useOrderBy } from '@/lib/festivals/use-order-by';
```

Replace the `now`/`fest`/`orderBy` block (lines 170-177) with:

```tsx
  /*
   * Client-resolved date: the static export's prerendered date goes stale the
   * next morning; the build date paints first (no LCP flash), the real date
   * corrects it within a frame.
   */
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const fest = nextFestival(nowMs);
  const orderBy = useOrderBy(fest.slug, fest.date);
```

Replace the docket line at line 384:

```tsx
              <span>ORDER BY {orderBy.label}{orderBy.closed ? ' · CLOSED' : ''}</span>
```

Check the rest of the component for other reads of `now` or `fest.date` — if any remain,
`formatDocketDate(fest.date)` is the replacement, and `now` as a `Date` no longer exists.

- [ ] **Step 3: Verify**

```bash
cd apps/storefront && pnpm typecheck && pnpm lint && pnpm test
```

Expected: all clean.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/src/components/sections/festival-next-band.tsx apps/storefront/src/components/hero/hero-batch.tsx
git commit -m "fix: the home band no longer renders a day earlier than the festival page"
```

---

### Task 9: Close the duplication, and guard it

The seventh copy — `page-media.ts` — plus the test that stops all of them growing back.

**Files:**
- Modify: `apps/storefront/src/lib/content/page-media.ts:34-46`
- Modify: `apps/storefront/src/lib/content/page-media.test.ts:59-65`
- Create: `apps/storefront/src/lib/festivals/festival-sources.test.ts`

**Interfaces:**
- Consumes: `FESTIVAL_SLUG_LIST`, `FESTIVAL_CALENDAR` (Task 1).
- Produces: nothing new. `FESTIVAL_SLUGS` keeps its name, type and every existing consumer
  (`admin-photos.tsx:173`, `media/usage.ts:49-50`).

- [ ] **Step 1: Derive `FESTIVAL_SLUGS` from the calendar**

In `page-media.ts`, replace the hardcoded array (lines 34-46) with:

```ts
/**
 * Festival pages that get an editable hero slot in /admin/photos.
 *
 * Derived, because the hand-maintained copy of this list had drifted: it held
 * ten slugs and the one it omitted was `independence-day`, so that festival's
 * page had no hero slot in the admin at all. `festivals` below is an open
 * z.record, so adding the eleventh is purely additive — existing rows parse
 * unchanged and media/usage.ts already tolerates extra keys.
 */
export const FESTIVAL_SLUGS: readonly string[] = FESTIVAL_SLUG_LIST;
```

Add the import at the top of the file:

```ts
import { FESTIVAL_SLUG_LIST } from '../festivals/calendar';
```

- [ ] **Step 2: Update the existing assertion**

In `page-media.test.ts`, replace the `FESTIVAL_SLUGS` describe block (lines 59-65) with:

```ts
describe('FESTIVAL_SLUGS', () => {
  it('carries all eleven festival pages, including the one the hand-kept list dropped', () => {
    expect(FESTIVAL_SLUGS).toContain('diwali');
    expect(FESTIVAL_SLUGS).toContain('raksha-bandhan');
    expect(FESTIVAL_SLUGS).toContain('independence-day');
    expect(FESTIVAL_SLUGS).toHaveLength(11);
  });
});
```

- [ ] **Step 3: Write the guard test**

Create `apps/storefront/src/lib/festivals/festival-sources.test.ts`:

```ts
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
```

- [ ] **Step 4: Run the suite**

```bash
cd apps/storefront && pnpm test
```

Expected: PASS, including both new guards.

- [ ] **Step 5: Prove the guard can actually fail**

A guard that has never gone red is not yet a guard. Temporarily append to
`apps/storefront/src/components/hero/hero-batch.tsx`:

```ts
const ORDER_BY_LEAD_DAYS = 3;
const OOPS = ['2026-08-15', '2026-08-28'];
```

Then:

```bash
cd apps/storefront && pnpm vitest run src/lib/festivals/festival-sources.test.ts
```

Expected: FAIL on **both** assertions, each naming `hero-batch.tsx`. Now remove those two
lines and re-run — expected PASS. Confirm the file is clean before committing:

```bash
git diff --stat apps/storefront/src/components/hero/hero-batch.tsx
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/lib/content/page-media.ts apps/storefront/src/lib/content/page-media.test.ts apps/storefront/src/lib/festivals/festival-sources.test.ts
git commit -m "fix: independence day gets its missing photo slot, and the copies get a guard"
```

---

### Task 10: The Dispatch deadlines card in `/admin/festivals`

Where the owner actually fixes the reported bug.

**Files:**
- Modify: `apps/storefront/src/components/admin/admin-festivals.tsx`

**Interfaces:**
- Consumes: `FESTIVAL_CALENDAR`, `formatDocketDate`, `FestivalSlug` (Task 1);
  `parseFestivalDates`, `checkOrderByInput`, `FestivalDates` (Task 2);
  `loadSiteContent`, `saveSiteContent`, `logAdminAction` (existing).
- Produces: nothing new.

- [ ] **Step 1: Add the imports and state**

Add to the imports at the top of `admin-festivals.tsx`:

```tsx
import { CalendarClock } from 'lucide-react';
import { FESTIVAL_CALENDAR, formatDocketDate, type FestivalSlug } from '@/lib/festivals/calendar';
import {
  checkOrderByInput,
  parseFestivalDates,
  type FestivalDates,
} from '@/lib/festivals/festival-dates';
```

Inside `AdminFestivals`, beside the existing `useState` calls, add:

```tsx
  const [deadlines, setDeadlines] = useState<FestivalDates>({});
  const [deadlinesBusy, setDeadlinesBusy] = useState(false);
  const [deadlinesSaved, setDeadlinesSaved] = useState(false);
  /*
   * The clock is read once on mount, never at module scope: this component is
   * also rendered during the static export, where "now" would be the build
   * date and every past-deadline warning would be a lie by the next morning.
   */
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    setNowMs(Date.now());
  }, []);
```

- [ ] **Step 2: Load the row alongside the active festival**

Inside `load()`, below the existing `if (!configured) { … return; }` guard, replace these
four lines:

```tsx
      const cur = await loadSiteContent('active_festival');
      if (cancelled) return;
      setActive(cur ?? DEFAULT_STATE);
      setLoaded(true);
```

with:

```tsx
      const [cur, dates] = await Promise.all([
        loadSiteContent('active_festival'),
        loadSiteContent('festival_dates'),
      ]);
      if (cancelled) return;
      setActive(cur ?? DEFAULT_STATE);
      setDeadlines(parseFestivalDates(dates));
      setLoaded(true);
```

The unconfigured branch is left alone: with no Supabase there is nothing to load and
`deadlines` stays `{}`, which renders every festival at its computed default.

- [ ] **Step 3: Add the edit and save handlers**

Add beside the existing `publish()` and `goOffSeason()`:

```tsx
  function setDeadline(slug: FestivalSlug, value: string) {
    setDeadlines((prev) => {
      const next = { ...prev };
      // Blank clears the override — the row is deleted, never stored empty.
      if (value.trim() === '') delete next[slug];
      else next[slug] = { orderBy: value };
      return next;
    });
  }

  async function saveDeadlines() {
    const blocking = FESTIVAL_CALENDAR.filter(
      (f) => checkOrderByInput(f.slug, deadlines[f.slug]?.orderBy ?? '', nowMs).error !== null,
    );
    if (blocking.length > 0) {
      window.alert(
        `Fix the highlighted dates first: ${blocking.map((f) => f.title).join(', ')}.`,
      );
      return;
    }
    if (!configured) {
      window.alert('Connect Supabase to publish deadline changes.');
      return;
    }
    setDeadlinesBusy(true);
    const r = await saveSiteContent('festival_dates', deadlines);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      setDeadlinesBusy(false);
      return;
    }
    await logAdminAction('publish-festival-dates', 'site_content', 'festival_dates', null, deadlines);
    setDeadlinesBusy(false);
    setDeadlinesSaved(true);
    window.setTimeout(() => setDeadlinesSaved(false), 2400);
  }
```

- [ ] **Step 4: Render the card**

Insert this section in the returned JSX, immediately **after** the curated-products
`{active.slug && (…)}` section and **before** the sticky action bar:

```tsx
      {/* Dispatch deadlines — every festival, not just the active one. */}
      <section className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
            <CalendarClock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
            Dispatch deadlines
          </h2>
          <span className="text-theme-ink/50 text-[11px]">
            Blank = three clear days before the festival.
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {FESTIVAL_CALENDAR.map((f) => {
            const value = deadlines[f.slug]?.orderBy ?? '';
            const { error, warning } = checkOrderByInput(f.slug, value, nowMs);
            return (
              <div
                key={f.slug}
                className="grid items-center gap-2 border-b border-[color:var(--color-border)] pb-2 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <span className="text-theme-ink text-sm font-medium">{f.title}</span>
                <span className="text-theme-ink/55 font-mono text-xs">
                  {formatDocketDate(f.date)}
                </span>
                <div className="flex flex-col items-start gap-1">
                  <input
                    type="date"
                    value={value}
                    max={f.date}
                    onChange={(e) => setDeadline(f.slug, e.target.value)}
                    aria-label={`Order-by date for ${f.title}`}
                    aria-invalid={error !== null}
                    className={`bg-surface text-theme-ink focus-visible:ring-theme-accent/30 rounded-lg border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 ${
                      error
                        ? 'border-red-600'
                        : 'focus-visible:border-theme-accent border-[color:var(--color-border)]'
                    }`}
                  />
                  {error && <span className="text-[11px] font-semibold text-red-700">{error}</span>}
                  {warning && (
                    <span className="text-[11px] font-semibold text-amber-700">{warning}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {deadlinesSaved ? (
            <p className="text-xs font-semibold text-emerald-700">
              <Check className="mr-1 inline h-3.5 w-3.5" />
              Live on the storefront within ~5 seconds.
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={saveDeadlines}
            disabled={deadlinesBusy || !isAdmin}
            className="bg-theme-accent shadow-soft hover:shadow-lifted inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-[color:var(--theme-base)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {deadlinesBusy ? 'Saving…' : 'Save deadlines'}
          </button>
        </div>
      </section>
```

Extend the page's intro paragraph so the card is discoverable — append to the sentence
ending `…return to the default look.`:

```tsx
          Dispatch deadlines below apply to every festival page, active or not.
```

- [ ] **Step 5: Verify**

```bash
cd apps/storefront && pnpm typecheck && pnpm lint && pnpm test
```

Expected: all clean. `isAdmin` is already declared above the return in this component —
if the linter reports it as unused-before-defined, move the card below its declaration.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/components/admin/admin-festivals.tsx
git commit -m "feat: owner sets each festival's dispatch deadline in /admin/festivals"
```

---

### Task 11: Whole-system verification

Everything green, plus the reported bug walked end to end in a browser.

**Files:** none modified unless a check fails.

- [ ] **Step 1: The full suite in two timezones**

```bash
cd apps/storefront && pnpm typecheck && pnpm lint && pnpm test && TZ=UTC pnpm test && TZ=America/New_York pnpm test
```

Expected: clean in all three zones. Record the test count.

- [ ] **Step 2: Confirm the copies are gone**

```bash
cd apps/storefront && rg -n "ORDER_BY_LEAD_DAYS" src && rg -c "2026-08-15" src
```

Expected: `ORDER_BY_LEAD_DAYS` appears only in `src/lib/festivals/calendar.ts` (as
`DEFAULT_ORDER_BY_LEAD_DAYS`) and in `festival-sources.test.ts` (inside the regex).
`2026-08-15` appears only in `calendar.ts` and the test files.

- [ ] **Step 3: Build the static export**

```bash
cd apps/storefront && pnpm build:cloudflare
```

Expected: build succeeds, all eleven `/festivals/*` pages emitted. Then confirm the
prerendered HTML still carries the default date — this is the SEO contract:

```bash
rg -o "ORDER BY|12 AUG 2026" out/festivals/independence-day/index.html | head
```

Expected: `12 AUG 2026` present in the static HTML, and `CLOSED` absent from it (the
marker is added after hydration, by design).

- [ ] **Step 4: Walk the reported bug**

```bash
cd apps/storefront && pnpm dev
```

With Supabase configured, in a browser:

1. `/festivals/independence-day` shows `ORDER BY 12 AUG 2026 · CLOSED` and the
   "Ask about last-minute orders" button.
2. `/` shows the same `12 AUG 2026 · CLOSED` in the hero strip and the festival band —
   **not** 11 AUG. This is the regression that started this work.
3. `/admin/festivals` → Dispatch deadlines → Independence Day shows `2026-08-12` with the
   amber `Shows as CLOSED on the site.` warning.
4. Change it to `2026-08-14`, Save deadlines. Within ~5 seconds and without a reload, all
   three surfaces read `14 AUG 2026` with no CLOSED marker, and the festival page's primary
   button is back to "See the collection".
5. Try `2026-08-16`. The input goes red with *"Must be on or before the festival —
   15 AUG 2026."* and Save refuses.
6. Clear the field and save. All surfaces return to `12 AUG 2026 · CLOSED`.
7. `/admin/photos` now lists an Independence Day festival hero slot.

- [ ] **Step 5: Commit anything the walkthrough fixed**

If steps 1-7 all pass with no code change, there is nothing to commit and the branch is
done. If a fix was needed, commit it with a message naming the step that caught it.

---

## Self-Review

**Spec coverage** — every section maps to a task:

| Spec section | Task |
| --- | --- |
| Shared calendar module | 1 |
| `festival_dates` key, parser, drop rules | 2 |
| Resolution, IST closed boundary | 3 |
| Static-export / hydration contract | 4 (hook), 11 step 3 (verified) |
| `<OrderByField>` at the edge | 5 |
| `/festivals/[slug]`, closed CTA | 5, 6 |
| `/festivals`, `/send-sweets-to-india` | 7 |
| `HeroBatch`, `FestivalNextBand`, off-by-one | 8 |
| Widened next-festival candidate set | 1 (`nextFestival` over 11), 8 |
| `FESTIVAL_SLUGS` derivation | 9 |
| Guard test | 9 |
| Admin Dispatch deadlines card | 10 |
| Error-handling table | 2 (parser), 4 (empty defaults), 10 (save failure) |
| Verification walkthrough | 11 |

**Placeholders:** none. Every code step carries the code; every command carries its
expected output.

**Type consistency:** `FestivalSlug`, `FestivalEntry`, `FESTIVAL_CALENDAR`,
`FESTIVAL_SLUG_LIST`, `getFestival`, `formatDocketDate`, `defaultOrderByDay`,
`isValidIsoDay`, `endOfIstDayMs`, `nextFestival`, `FestivalDates`, `FestivalDeadline`,
`EMPTY_FESTIVAL_DATES`, `parseFestivalDates`, `checkOrderByInput`, `OrderByState`,
`resolveOrderBy`, `useOrderBy`, `OrderByField`, `FestivalActions` — each defined once in
Tasks 1-5 and used under exactly that name afterwards.

One deliberate asymmetry, called out so it does not read as a mistake: `nextFestival` takes
the caller's render clock (seeded `Date.now()`, so the prerender picks a sensible festival),
while `useOrderBy` seeds its clock to `0` (so `closed` is false until hydration). Different
seeds, different jobs — selection must never be empty, closure must never fire before the
browser confirms the time.
