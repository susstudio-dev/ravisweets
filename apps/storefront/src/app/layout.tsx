import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Anek_Telugu, Archivo, Courier_Prime } from 'next/font/google';
import { SiteChrome } from '@/components/site-chrome';
import { LayoutGroup } from '@/components/motion/layout-group';
import { CartProvider } from '@/lib/cart/cart-context';
import { CouponsProvider } from '@/lib/coupons/context';
import { SupabaseProvider } from '@/lib/supabase/session-context';
import { SiteContentProvider } from '@/lib/supabase/site-content-context';
import { DemoSeed } from '@/components/demo-seed';
import { RealtimeThemeBridge } from '@/components/theme/realtime-theme-bridge';
import { getVisualVersion } from '@/lib/flags/visual-v2';
import './globals.css';

/*
 * ARCHIVO carries the whole interface — display and body both.
 *
 * The Batch Card world is printed forms, and Archivo descends from the
 * 19th-century American grotesques that job printers actually set forms,
 * dockets and signage in. Its `wdth` axis is requested deliberately: the
 * condensed end sets the ruled column headers on a docket, the expanded end
 * sets the stamped display lines. That width range is the hierarchy device
 * here, which is why one family can do both jobs without a second face.
 *
 * A display serif is specifically refused. The retired world used one, and a
 * warm serif over a cream ground is the arrangement every Indian sweets brand
 * ships; this world's authority comes from the grid and the record, not from
 * heritage lettering.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
});

/*
 * COURIER PRIME sets recorded values only — batch numbers, dates, weights,
 * percentages, prices in a spec table.
 *
 * The distinction is the point: Archivo is the PRINTED form, Courier Prime is
 * what was TYPED into it. Courier Prime over the usual monospace choices
 * because it is a typewriter revival rather than a code face — this is a
 * carbon docket, not a terminal.
 *
 * Static 400/700; no italic requested, nothing on a docket is italic.
 */
const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

/*
 * Anek Telugu is retained from the previous world, and deliberately so: it is
 * a real functional need, not an aesthetic default. The audience is Telugu-
 * first locally and the roadmap carries a /te locale.
 *
 * preload:false — the Telugu subset is large and is used for short marks, not
 * body copy. Preloading it would compete with the LCP element against a
 * 2500 ms Lighthouse budget.
 *
 * Variable 100-800, so Telugu conjuncts are never browser-synthesised into
 * faux-bold.
 */
const anekTelugu = Anek_Telugu({
  subsets: ['telugu', 'latin'],
  weight: 'variable',
  variable: '--font-indic',
  display: 'swap',
  preload: false,
});

/**
 * THE DIRECTION CONTRACT.
 *
 * Emitted verbatim into <body> as an HTML comment. It is the one reminder that
 * survives a long build: a page that looks finished with the FINISH line
 * undischarged is not done.
 *
 * Static, author-written, module-scoped — no interpolation, no request data,
 * no user input reaches it, so the dangerouslySetInnerHTML that renders it
 * carries no injection surface. Keep it that way: never build this string
 * from anything dynamic.
 */
const DIRECTION_CONTRACT = `<!--
  THESIS: The paperwork is the proof. Ravi Sweets makes sweets without
  preservatives and dispatches the same day; the kitchen's own batch record is
  what demonstrates that, so the record is the interface. Refuses the category
  default: warm cream ground, heritage serif display, festive accent, and
  freshness as a claim in a paragraph.

  OWN-WORLD: NCR docket stock #E9EAE4 (cool, never cream), press ink #161C24,
  stamp-pad blue #2046C8 (hue 226, unoccupied in the category; violet measured
  10deg off Cadbury 2685C and was rejected), gummed manila label #EBC77E,
  ember #E2571F for live state only, kumkum red #CC0000 (the logo's own red,
  darkened from #FF0000 to pass AA as ink) as celebration/certification ink - the seal, festival
  line-work, sale stamps - never interactive, never a flood. Carbon copy
  #232A2E is the dark register. Archivo across a wdth axis is the printed
  form, Courier Prime is what was typed into it. Softened paper (owner
  decision 2026-08-03): radii 3-18px, elevation is contact not float.

  STORY: The visitor arrives inside a festival window and sees the kitchen's
  festival card stamped for dispatch - occasion, order-by date, today's date
  on the red seal, one ruled proof row. They believe the freshness because the
  record is legible; they act because the occasion is theirs.

  FIRST VIEWPORT (the Festival Batch, owner-driven iteration of the batch
  card): headline word-groups rise, the calendar-resolved festival line in
  kumkum, body, both CTAs in the fold, the ruled proof row beneath them; right
  side a manila festival card with tape corners, occasion line-work, bobbing
  specimen cutouts and the red dispatch seal that thunks in at ~900ms. One
  authored motion sequence, then stillness; no carousels, no tickers.

  FORM: The kitchen batch card and ingredient spec sheet - candidate 7 of 7 on
  the grounded list, assigned by seed key d96049a4 - re-expressed at the
  owner's direction as the Festival Batch: the system frames, the festival
  fills.

  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravisweets.com',
  ),
  /*
   * THE HOMEPAGE TAKES NATIONAL AND DIASPORA COMMERCE INTENT, NOT LOCAL INTENT.
   *
   * Local intent ("sweet shop in Khammam") moves to /stores, which is the page
   * that can actually satisfy it — addresses, hours, LocalBusiness schema. The
   * local-pack ranking is won by the Google Business Profile, reviews and that
   * page, not by this title tag.
   *
   * "FSSAI certified" is removed here as well: the footer states the licence is
   * pending, and a metadata claim that contradicts the site's own disclosure is
   * worse than no claim.
   *
   * `keywords` is deleted, not rewritten. Google dropped it as a ranking signal
   * in 2009; the array was purely decorative and was the single largest
   * concentration of locality strings in the codebase.
   */
  /*
   * 78 characters and ~818px, well past Google's 60-character / 561-pixel
   * truncation — it was one of the two over-length titles in the crawl, and
   * the truncated tail ("...& Gift Hampers, since 1983") carried the brand's
   * two strongest differentiators where nobody could read them. The line below
   * is 57 characters: name, category, provenance, all inside the cut.
   *
   * `default` is used only by the homepage; every other page supplies its own
   * and gets `| Ravi Sweets` appended by the template, which is why page
   * titles elsewhere are written to a 46-character budget (lib/seo/metadata).
   */
  title: {
    default: 'Ravi Sweets · Hand-made Indian Sweets & Gift Hampers',
    template: '%s | Ravi Sweets',
  },
  description:
    'Hand-made Indian sweets, namkeens and gift hampers from one family kitchen since 1983. No preservatives, delivered fresh across India.',
  openGraph: {
    type: 'website',
    siteName: 'Ravi Sweets',
    locale: 'en_IN',
    title: 'Ravi Sweets · Indian sweets and gift hampers, made by one family since 1983',
    description:
      "Hand-made sweets, namkeens and gift hampers. No preservatives, dispatched the day they're made, delivered across India.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ravi Sweets · Made this morning, delivered across India',
    description:
      'Hand-made sweets and gift hampers from a family kitchen, since 1983. No preservatives.',
  },
  // Allow indexing now that the site has real content + LocalBusiness schema.
  // Once production photography lands, leave this; until then the brand is real
  // and findable by name + locality, which matters more than holding for polish.
  robots: { index: true, follow: true },
  /*
   * These files now EXIST. `icons.icon` previously declared /favicon.ico while
   * public/ contained no such file, so every page in the crawl carried a link
   * to a 404 — the one broken internal link present on 100% of URLs. The mark
   * is the katli diamond from components/brand/logo.tsx, drawn at 16/32/48 in
   * the .ico and 180/192/512 as PNG.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  category: 'Food & Beverages',
};

export const viewport: Viewport = {
  themeColor: '#E9EAE4',
  width: 'device-width',
  initialScale: 1,
};

/*
 * `modal` is OPTIONAL by design: the static export disables the @modal
 * intercept slot (prepare-export.mjs), and a required prop makes Next's
 * generated route validator reject the layout whenever the slot is absent —
 * including when a concurrently running dev server regenerates .next-dev
 * types mid-build. Optional satisfies both trees.
 */
export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal?: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme={getVisualVersion()}
      className={`${archivo.variable} ${courierPrime.variable} ${anekTelugu.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-theme-base text-theme-ink flex min-h-screen flex-col"
        suppressHydrationWarning
      >
        {/*
          The direction contract, emitted as a REAL HTML comment so it survives
          the production build and can be audited in the shipped output — a JSX
          comment is stripped at compile time and would be auditable by nobody.
          Grep the build for the seed key to confirm it is still there.
        */}
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <a
          href="#main"
          className="focus:bg-theme-accent sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:text-[color:var(--theme-base)]"
        >
          Skip to content
        </a>
        <SupabaseProvider>
          <SiteContentProvider>
            <CartProvider>
              <CouponsProvider>
                <LayoutGroup>
                  <DemoSeed />
                  <RealtimeThemeBridge />
                  {/*
                    PageDriftGarnish is retired with the Rose & Cream world.
                    It floated five tinted saffron/almond/paisley marks across
                    every route; in a world built on printed records they read
                    as specks of debris on the paper rather than as ornament.
                    The component stays in the repo, unmounted.
                  */}
                  <SiteChrome>{children}</SiteChrome>
                  {modal}
                </LayoutGroup>
              </CouponsProvider>
            </CartProvider>
          </SiteContentProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
