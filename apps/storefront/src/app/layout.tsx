import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Anek_Telugu, Bricolage_Grotesque, Courier_Prime, Figtree } from 'next/font/google';
import { SiteChrome } from '@/components/site-chrome';
import { LayoutGroup } from '@/components/motion/layout-group';
import { CartProvider } from '@/lib/cart/cart-context';
import { CouponsProvider } from '@/lib/coupons/context';
import { SupabaseProvider } from '@/lib/supabase/session-context';
import { SiteContentProvider } from '@/lib/supabase/site-content-context';
import { DemoPurge } from '@/components/demo-purge';
import { RealtimeThemeBridge } from '@/components/theme/realtime-theme-bridge';
import { getVisualVersion } from '@/lib/flags/visual-v2';
import './globals.css';

/*
 * BRICOLAGE GROTESQUE sets the display lines; FIGTREE sets the body.
 *
 * Owner decision 2026-08-24 (krish): Poppins — the 2026-08-10 pivot's single
 * face — read as "too boxy". Poppins is a monoline geometric: perfect
 * circles, uniform strokes, wide flat caps, and at 600/700 in a headline
 * that uniformity IS the boxiness. The fix is a humanist skeleton, not a
 * serif: Bricolage's varied proportions, tight apertures and ink traps give
 * headlines curve and character, and Figtree's soft terminals keep body and
 * UI text friendly at small sizes.
 *
 * A display serif is STILL refused (decision of 2026-08-10 stands): warm
 * serif over cream is the arrangement every Indian sweets brand ships. Two
 * sans voices keep us modern-warm rather than heritage-nostalgic.
 *
 * `opsz` is requested on Bricolage so display sizes draw the display optical
 * cut rather than a scaled text cut.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-body',
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
  THESIS: The paperwork is the proof, read at a warm counter. Ravi Sweets
  makes sweets without preservatives and dispatches the same day; the
  kitchen's own batch record is what demonstrates that, so the record is
  still the interface - but the paper now lives where the customer meets it,
  warm under shop light. Owner pivot 2026-08-10 (krish, after Food on Farm /
  Sweet Karam Coffee research): product-first, customer-friendly, warm.

  OWN-WORLD: halwai cream #FAF6E5 (hue ~49deg - must stay >=42deg so the
  carbon accent clears ember by 25deg), press ink #161C24, stamp-pad blue
  #2046C8 (hue 226, unoccupied in the category; re-confirmed by owner
  2026-08-10 over reference-site orange), gummed manila label #EBC77E, ember
  #E2571F for live state only, kumkum red #CC0000 as celebration/
  certification ink - never interactive, never a flood. Burnt jaggery
  #2B2620 is the dark register. Bricolage Grotesque carries the display
  lines, Figtree the body (owner 2026-08-24: Poppins read too boxy); Courier
  Prime is what was typed into the form. Sweet-box paper: radii 6-24px, pill
  CTAs, elevation is contact not float.

  STORY: The visitor lands on a warm counter: the festival card stamped for
  dispatch, a rail of categories one tap away, today's bestsellers, the
  kitchen rule as four short badges, real reviews when they exist - lots to
  see, little to read.

  FIRST VIEWPORT (the Festival Batch, unchanged in structure): headline
  word-groups rise, body, both CTAs in the fold, the calendar-resolved
  deadline line in kumkum closing the column (the proof claims live in the
  TrustStrip section, not the hero — owner declutter, 2026-08-24); right side
  the manila festival card with tape corners, bobbing product cutouts and the
  red dispatch seal. One authored motion sequence, then stillness; no
  carousels, no tickers.

  FORM: The kitchen batch card re-expressed at the owner's direction as the
  Sweet Counter: the record frames, the warmth fills. Product photography is
  the missing asset - the admin media library overlays it everywhere the
  moment it is uploaded.

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
  /*
   * "Family kitchen" retired from the brand voice 2026-08-11 (owner: global
   * brand, large kitchen — the cottage register undersold it). Heritage
   * stays as the year; scale claims stay out entirely.
   *
   * Extended 2026-08-12: "batch" and the standalone "our kitchen(s)" went the
   * same way, sitewide. These three strings were already clean and are the
   * pattern to copy — they say WHAT is made and WHEN, never how small the
   * operation is. The DB side is 0020_global_kitchen_voice.sql.
   */
  description:
    'Hand-made Indian sweets, namkeens and gift hampers, made fresh since 1983. No preservatives, delivered fresh across India.',
  openGraph: {
    type: 'website',
    siteName: 'Ravi Sweets',
    locale: 'en_IN',
    title: 'Ravi Sweets · Indian sweets and gift hampers, made fresh since 1983',
    description:
      "Hand-made sweets, namkeens and gift hampers. No preservatives, dispatched the day they're made, delivered across India.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ravi Sweets · Made this morning, delivered across India',
    description:
      'Hand-made sweets and gift hampers, made fresh since 1983. No preservatives.',
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
  themeColor: '#FAF6E5',
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
      className={`${bricolage.variable} ${figtree.variable} ${courierPrime.variable} ${anekTelugu.variable}`}
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
                  {/*
                    Was <DemoSeed />, which wrote five invented orders into
                    every visitor's browser so /account "rendered meaningfully
                    out of the box". On a live shop that meant real customers
                    seeing delivered orders they never placed. Removed
                    2026-08-11; this is the cleanup for browsers that already
                    took the seed.
                  */}
                  <DemoPurge />
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
