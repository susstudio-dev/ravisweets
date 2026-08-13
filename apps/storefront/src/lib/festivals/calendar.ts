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
