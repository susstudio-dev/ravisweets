# Owner-editable festival order-by dates

**Date:** 2026-08-13
**Status:** Approved design, ready for planning
**Owner request:** "It is already August 13 it shows order by August 12 — this should be customizable in the app."

## The problem

On 13 August 2026, `/festivals/independence-day` renders:

```
EDITION     15 August · 2026
FESTIVAL    15 AUG 2026
ORDER BY    12 AUG 2026
```

The deadline has passed, and the page still states it as a live instruction. Two separate
faults sit behind that one screenshot.

### Fault 1 — the date is not editable

`ORDER BY` is not stored anywhere. It is computed as *festival date − 3 days* from a
constant duplicated verbatim in five files:

| File | Line |
| --- | --- |
| `apps/storefront/src/app/festivals/[slug]/page.tsx` | 503 |
| `apps/storefront/src/app/festivals/page.tsx` | 130 |
| `apps/storefront/src/components/hero/hero-batch.tsx` | 145 |
| `apps/storefront/src/components/sections/festival-next-band.tsx` | 37 |
| `apps/storefront/src/app/send-sweets-to-india/page.tsx` | 45 |

The festival calendar itself (slug, title, Telugu, date) is duplicated across the same five
files. The code already admits this: *"Mirrors the calendar in festival-next-band.tsx
(shared module is phase 4b)"*. Nothing in `/admin` can change either.

Three clear days is also the wrong model for the business. A Diwali corporate run of 200
logo-printed hampers is not the same lead time as a tray of barfi for an office on the 15th.

### Fault 2 — the surfaces already disagree

The five copies use four different date implementations. Executed against Independence Day
(15 Aug 2026) with a 3-day lead:

| Surface | System TZ (IST) | Browser at `TZ=UTC` |
| --- | --- | --- |
| `/festivals/[slug]` dispatch sheet | 12 AUG 2026 | 12 AUG 2026 |
| `/festivals` index cards | 12 AUG 2026 | 12 AUG 2026 |
| `HeroBatch` (home) | 12 AUG 2026 | **11 AUG 2026** |
| `FestivalNextBand` (home) | **11 AUG 2026** | **10 AUG 2026** |

`send-sweets-to-india` does not list Independence Day — it carries only Raksha Bandhan and
Diwali — but its implementation is the one correct outlier: pure `Date.UTC` arithmetic with
no local timezone read, agreeing with the dispatch sheet in every timezone.

`FestivalNextBand` builds an IST-midnight `Date` and then calls `.toISOString()`, which
shifts the instant back 5h30m into the previous UTC day. It is off by one **today, in IST**,
against the festival page. `HeroBatch` formats with the visitor's locale, so it drifts west
of IST.

Both are client components. A customer browsing from New York — the audience
`send-sweets-to-india` exists for — is shown an earlier deadline than the festival page
gives, from the same site, on the same visit.

### Fault 3 — no closed state exists

No surface has any notion of a cutoff that has passed. The row renders identically on
11 August and on 13 August.

## Goals

1. The owner sets the order-by date per festival from `/admin`, with no redeploy.
2. Once the date has passed, every surface says so plainly instead of instructing.
3. All five surfaces read one date, computed one way, independent of the machine or the
   visitor's timezone.

## Non-goals

- **Editing the festival date itself.** Diwali, Eid and Ugadi are lunar; the hardcoded
  2026/2027 dates will eventually be wrong. That is a separate ask. The data shape leaves
  room for it.
- Moving festival copy, palettes, hero images or curated product lists into the database.
  Only identity and dates move to the shared module.
- Unifying the WhatsApp number, hardcoded as `919398859978` in seven files. Noted, not
  in scope; the closed-state CTA uses the same literal as its neighbours.
- Scheduling a future change to a deadline (`scheduled_kind` in migration 0005 exists but
  is not extended here).

## Architecture

Four parts. Each is usable and testable on its own.

### 1. `src/lib/festivals/calendar.ts` — the shared calendar

Owns exactly what drifts today: festival identity, the festival date, and the date maths.
Per-page copy, palettes, blurbs and product picks stay in their current files and are keyed
by slug, so a festival can never exist in one list and not another.

```ts
export type FestivalSlug =
  | 'diwali' | 'independence-day' | 'raksha-bandhan' | 'eid' | 'holi'
  | 'pongal' | 'sankranti' | 'ugadi' | 'onam' | 'ganesh-chaturthi' | 'christmas';

export interface FestivalEntry {
  slug: FestivalSlug;
  title: string;
  telugu: string;
  /** ISO day, 'YYYY-MM-DD'. The festival itself, in IST. */
  date: string;
}

export const FESTIVAL_CALENDAR: readonly FestivalEntry[];

/** Dispatch needs three clear days before the festival for the fresh range. */
export const DEFAULT_ORDER_BY_LEAD_DAYS = 3;

/** '2026-08-15' → '2026-08-12'. Pure UTC arithmetic; no local timezone read. */
export function defaultOrderByDay(festivalISO: string): string;

/** '2026-08-12' → '12 AUG 2026'. String arithmetic; constructs no Date at all. */
export function formatDocketDate(iso: string): string;
```

`formatDocketDate` adopts the implementation already in `send-sweets-to-india/page.tsx:61`
— it slices the ISO string and indexes a `MONTHS` array, so it has no timezone surface
whatsoever. `defaultOrderByDay` uses `Date.UTC(y, m - 1, d - lead)`, which normalises
month and year underflow correctly (1 Jan − 3 → 29 Dec of the prior year).

Adopting these two functions everywhere is what fixes the disagreement table above.

### 2. `festival_dates` — a new `site_content` key

`public.site_content` is an unconstrained `(key text primary key, data jsonb)` table with
`anyone reads` / `is_admin() writes` RLS (migration 0002). Migration 0013 installs a
`security definer` trigger that snapshots **every** write to `site_content_versions`.

Therefore: **no migration is required**, and the new key inherits version history and the
existing admin-only write policy for free. It is delivered as a new key, not as a field on
`active_festival`, because `active_festival` is a singleton describing which festival is
live, whereas deadlines exist for all eleven at once.

```ts
/** Sparse: only festivals the owner has overridden appear. */
export type FestivalDates = Partial<Record<FestivalSlug, { orderBy: string }>>;
```

Reads go through a parser, never the raw row — the rule `site-content.ts:110` already
states for `charges` ("the row is admin-typed and a bad value here changes what customers
are billed"). A dispatch deadline is in the same class: a bad value changes what a customer
is told about when their sweets arrive.

```ts
export function parseFestivalDates(raw: unknown): FestivalDates;
```

Each entry is dropped — falling back to `defaultOrderByDay` — when any of the following
hold. Dropping is per-entry, never whole-document: one bad row must not blank ten good ones.

- The key is not a known `FestivalSlug`.
- The value is not an object with a string `orderBy`.
- `orderBy` does not match `^\d{4}-\d{2}-\d{2}$`, or is not a real calendar day
  (`2026-02-30` is rejected).
- `orderBy` is **after** the festival date. A cutoff later than the festival is incoherent;
  the default is safer than honouring it.

An `orderBy` in the past is **valid** and kept — that is the closed state, not an error.

### 3. `src/lib/festivals/use-order-by.ts` — resolution and closed state

```ts
export interface OrderByState {
  /** The ISO day actually in force: override if valid, else festival − 3. */
  day: string;
  /** '12 AUG 2026' — ready to render. */
  label: string;
  /** True once IST is past the end of `day`. */
  closed: boolean;
}

export function useOrderBy(slug: FestivalSlug, festivalISO: string): OrderByState;
```

**Closed is an IST fact, not a visitor fact.** The kitchen's cutoff does not move with the
customer's timezone — that is precisely the bug in fault 2. Orders are accepted through
`23:59:59.999 IST` on `day`:

```ts
closed = Date.now() >= Date.parse(`${day}T00:00:00+05:30`) + 86_400_000
```

IST observes no DST, so the fixed 24-hour offset is exact.

#### Static export and hydration

The storefront builds with `output: 'export'` for both deploy targets, so festival pages
are prerendered HTML. Both the database value and "has it passed?" must therefore resolve
in the browser. This is the pattern `hero-batch.tsx:165-173` already uses and documents:

> *the static export's prerendered date goes stale the next morning; the build date paints
> first (no LCP flash), the real date corrects it within a frame.*

Applied here:

- **First paint** (static HTML): `defaultOrderByDay(festival)`, `closed: false`. The date
  stays in the indexed markup for SEO, and there is no empty flash.
- **After hydration**: the `festival_dates` row arrives through `SiteContentProvider`
  (Realtime subscription plus a 60-second poll) and `now` is read from the client; the
  label and closed flag correct.

`closed` starts `false` so the server and client render identically on the hydration pass,
avoiding a mismatch warning; the effect flips it on the next frame.

**No reflow.** The closed marker renders inside the existing `dd` as
`12 AUG 2026 · CLOSED` — the same line, the same row height. Only the CTA row changes
below the fold of the heading.

### 4. `<OrderByField>` — one client component at the edge

`/festivals/[slug]`, `/festivals` and `/send-sweets-to-india` are server components and
stay that way. The `dd` becomes a small client component that owns the hook, so `'use
client'` is confined to the field rather than spreading to three routes.

```tsx
<OrderByField slug="independence-day" festivalDate="2026-08-15" />
```

`HeroBatch` and `FestivalNextBand` are already client components and call `useOrderBy`
directly.

## Surfaces changed

| File | Change |
| --- | --- |
| `src/lib/festivals/calendar.ts` | New. Shared calendar and date maths. |
| `src/lib/festivals/festival-dates.ts` | New. `FestivalDates` type and `parseFestivalDates`. |
| `src/lib/festivals/use-order-by.ts` | New. Resolution hook. |
| `src/components/festivals/order-by-field.tsx` | New. Client field component. |
| `src/lib/supabase/site-content.ts` | Add `'festival_dates'` to `SiteContentKey` and `ContentByKey`. |
| `src/lib/supabase/site-content-context.tsx` | Expose `festivalDates`, parsed on every refetch (as `charges` and `pageMedia` already are). |
| `src/app/festivals/[slug]/page.tsx` | Read dates from the calendar; use `<OrderByField>`; closed-state CTA. |
| `src/app/festivals/page.tsx` | Read dates from the calendar; use `<OrderByField>` in the card. |
| `src/app/send-sweets-to-india/page.tsx` | Read dates from the calendar; use `<OrderByField>`. |
| `src/components/hero/hero-batch.tsx` | Drop local calendar and constant; call `useOrderBy`. |
| `src/components/sections/festival-next-band.tsx` | Drop local calendar and constant; call `useOrderBy`. Fixes the off-by-one. |
| `src/components/admin/admin-festivals.tsx` | New "Dispatch deadlines" card. |

No database migration. No change to `active_festival`, themes, or the publish flow.

## The closed state

When `closed` is true on `/festivals/[slug]`:

```
EDITION     15 August · 2026
FESTIVAL    15 AUG 2026
ORDER BY    12 AUG 2026 · CLOSED

[ Ask about last-minute orders ]  [ See the collection ]  [ Corporate enquiry ]
```

- The `ORDER BY` value gains a ` · CLOSED` suffix in the same line. The date stays visible
  as a record — the page reads as history, not as a broken instruction.
- A WhatsApp CTA (`https://wa.me/919398859978`, prefilled with the festival name) becomes
  the primary `stamp`; "See the collection" demotes to `stamp--ghost`. The collection
  itself stays reachable and the products stay purchasable — the deadline is about
  guaranteed dispatch before the festival, not about closing the shop.
- On the compact surfaces (`/festivals` index cards, `FestivalNextBand`, `HeroBatch`) the
  suffix alone is used; no CTA swap.

`FestivalNextBand` and `HeroBatch` select *the next festival by date*, so a closed cutoff
does not remove the festival from the home page — it correctly shows Independence Day with
a closed deadline until 15 August passes, then rolls to Raksha Bandhan.

### One intended behaviour change

The two home-page selectors currently pick from truncated private lists: `HeroBatch` holds
seven festivals, `FestivalNextBand` eight, and neither includes Eid, Onam or Ganesh
Chaturthi — all of which have live `/festivals/*` pages. Reading `FESTIVAL_CALENDAR` widens
both to all eleven, so "next at the counter" can now surface a festival the home page has
never shown. That is the correct behaviour for a shop that sells all eleven boxes, and it
is the point of a single calendar, but it is a visible change and not a side effect to
discover after the fact.

## Admin — "Dispatch deadlines" on `/admin/festivals`

A new card below the existing curation sections on the page the owner already uses to run
festivals.

```
Dispatch deadlines
Blank = three clear days before the festival.

  Festival              Festival date    Order by
  Independence Day      15 AUG 2026      [ 2026-08-12 ]  ⚠ shows as CLOSED on the site
  Raksha Bandhan        28 AUG 2026      [          ]     default — 25 AUG 2026
  Diwali                08 NOV 2026      [ 2026-11-01 ]   7 days
  …all 11, calendar order

                                              [ Save deadlines ]
```

- Rows come from `FESTIVAL_CALENDAR`, so the list can never drift from the storefront.
- Festival date is read-only (see non-goals).
- Blank input clears the override; the row is removed from the saved object rather than
  written as an empty string.
- A date after the festival is rejected inline and blocks the save — it is a data error,
  and the parser would silently discard it anyway.
- A date in the past is **allowed**, with the inline `shows as CLOSED on the site` warning.
  This is what makes the reported bug visible in the place it is fixed.
- Its own `Save deadlines` button writing `festival_dates` via the existing
  `saveSiteContent` + `logAdminAction` pair. The page's existing `Publish festival` button
  keeps writing `active_festival`. Two keys, two independent saves, no coupling.
- Disabled for non-`admin` roles, matching the existing buttons on the page.

## Error handling

| Condition | Behaviour |
| --- | --- |
| Supabase unconfigured (local build, static prerender) | `loadAllSiteContent` returns `{}`; every festival uses the computed default. Current behaviour, preserved. |
| Row absent | Same as above. |
| Row malformed at the document level (not an object) | `parseFestivalDates` returns `{}`; all defaults. |
| One entry malformed | That entry only falls back; the rest are honoured. |
| Save fails | Existing `alert`-with-reason path used by `publish()`, unchanged. |
| Realtime drops | 60-second poll already in `SiteContentProvider` recovers it. |

## Testing

Vitest, alongside the existing `publish.test.ts` and `parseCharges` precedents.

**`calendar.test.ts`**
- `defaultOrderByDay('2026-08-15')` is `'2026-08-12'`.
- Month and year underflow: `'2027-01-01'` → `'2026-12-29'`.
- `formatDocketDate('2026-08-12')` is `'12 AUG 2026'`.
- Both produce identical output under `TZ=UTC` and `TZ=Asia/Kolkata`. **This is the
  regression test for fault 2** and must fail against today's `festival-next-band.tsx`.
- Every slug in `FESTIVAL_CALENDAR` is unique and every date parses.

**`festival-dates.test.ts`**
- Unknown slug dropped; known slugs kept.
- Rejects non-string, wrong format, and impossible days (`2026-02-30`).
- Rejects `orderBy` after the festival date.
- **Keeps** an `orderBy` in the past.
- One bad entry does not discard the good ones.

**`use-order-by.test.ts`**
- Override wins over the computed default.
- Invalid override falls back to the computed default.
- Closed boundary: `23:59:59.999 IST` on the cutoff day is open; `00:00:00 IST` the next
  day is closed — asserted with a fixed injected clock, not `Date.now()`.
- A visitor clock set to `America/New_York` produces the same `closed` verdict as one set
  to IST for the same instant.

**`festival-sources.test.ts`** (guard)
- No file outside `src/lib/festivals/` declares `ORDER_BY_LEAD_DAYS` or its own festival
  date list. A source scan in the spirit of the repo's existing regression guards; this is
  what stops the five copies growing back.

## Verification

The reported case, end to end:

1. With no override, `/festivals/independence-day` on 13 Aug 2026 shows
   `ORDER BY 12 AUG 2026 · CLOSED` and the WhatsApp CTA.
2. Owner opens `/admin/festivals`, sets Independence Day to `2026-08-14`, saves.
3. Within seconds (Realtime, or ≤60s by poll) the same page shows
   `ORDER BY 14 AUG 2026` with no closed marker and the normal CTA.
4. The home band and hero show `14 AUG 2026` too — the same value, in every timezone.
