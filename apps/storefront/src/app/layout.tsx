import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Anek_Latin, Anek_Telugu, Young_Serif } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SweetCursor } from '@/components/cursor/sweet-cursor';
import { FloatingContact } from '@/components/contact/floating-contact';
import { PromoStrip } from '@/components/promo/promo-strip';
import { LayoutGroup } from '@/components/motion/layout-group';
import { CartProvider } from '@/lib/cart/cart-context';
import { CouponsProvider } from '@/lib/coupons/context';
import { SupabaseProvider } from '@/lib/supabase/session-context';
import { SiteContentProvider } from '@/lib/supabase/site-content-context';
import { DemoSeed } from '@/components/demo-seed';
import { PageDriftGarnish } from '@/components/decor/page-drift-garnish';
import { RealtimeThemeBridge } from '@/components/theme/realtime-theme-bridge';
import { getVisualVersion } from '@/lib/flags/visual-v2';
import './globals.css';

/*
 * Young Serif is a STATIC single-weight face, so next/font requires an explicit
 * weight. That single weight is the point: display hierarchy comes from size,
 * never weight (globals.css sets font-synthesis:none to enforce it).
 *
 * Chosen over higher-contrast alternatives because its strokes survive on the
 * marigold field — a hairline serif would disappear on #E8A13C, and the field
 * is the identity.
 */
const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

/*
 * Anek Latin and Anek Telugu are the same Ek Type superfamily with identical
 * axes, designed together for cross-script harmony — the only true
 * Latin/Telugu pairing on Google Fonts.
 *
 * `wdth` is deliberately NOT requested: each extra axis costs font bytes and
 * nothing in the design varies width. `weight: 'variable'` is explicit so the
 * axis-discarding defect that silently flattened Fraunces cannot recur.
 */
const anekLatin = Anek_Latin({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-body',
  display: 'swap',
});

/*
 * preload:false — the Telugu subset is large and is used for one short eyebrow
 * line, not body copy. Preloading it would compete with the LCP element against
 * a 2500 ms Lighthouse budget.
 *
 * This also fixes a real defect: Tiro Telugu ships only 400/400i, so every bold
 * Telugu on the site was browser-synthesised faux-bold, which visibly breaks
 * Indic conjuncts. Anek Telugu is variable 100-800.
 */
const anekTelugu = Anek_Telugu({
  subsets: ['telugu', 'latin'],
  weight: 'variable',
  variable: '--font-indic',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://susstudio-dev.github.io/ravisweets',
  ),
  title: {
    default:
      'Ravi Sweets · Best Sweet Shop in Khammam since 1985 — Telangana Sweets, Namkeens & Gift Hampers',
    template: '%s | Ravi Sweets',
  },
  description:
    "Ravi Sweets — Khammam's most-loved sweet shop since 1985, now in Hyderabad (Kondapur). Authentic Telangana sweets, Hyderabadi specials, Andhra savouries, and build-your-own gift hampers. Hand-made, FSSAI certified, no preservatives, fresh daily across India.",
  keywords: [
    'best sweet shop Khammam',
    'sweet shop in Khammam',
    'sweet shop Hyderabad',
    'sweet shop Kondapur',
    'Ravi Sweets',
    'Telangana sweets online',
    'Hyderabadi sweets online',
    'Andhra sweets online',
    'Qubani ka Meetha',
    'Kaju Katli online',
    'gift hampers Hyderabad',
    'corporate gifting Hyderabad',
    'Diwali sweets Khammam',
    'mithai near me Khammam',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Ravi Sweets',
    locale: 'en_IN',
    title: 'Ravi Sweets · Khammam-made Telangana sweets, since 1985',
    description:
      'Hand-made Hyderabadi sweets, Andhra savouries, and corporate gift hampers. Two stores in Khammam + Kondapur (Hyderabad). FSSAI certified, no preservatives, ships across India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ravi Sweets · Khammam-made Telangana sweets',
    description: 'Hand-made sweets and gift hampers, fresh from our Khammam kitchen since 1985.',
  },
  // Allow indexing now that the site has real content + LocalBusiness schema.
  // Once production photography lands, leave this; until then the brand is real
  // and findable by name + locality, which matters more than holding for polish.
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
  category: 'Food & Beverages',
};

export const viewport: Viewport = {
  themeColor: '#FAF5E9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={getVisualVersion()}
      className={`${youngSerif.variable} ${anekLatin.variable} ${anekTelugu.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-theme-base text-theme-ink flex min-h-screen flex-col"
        suppressHydrationWarning
      >
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
                  <PageDriftGarnish />
                  <PromoStrip />
                  <Header />
                  <main id="main" className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <SweetCursor />
                  <FloatingContact />
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
