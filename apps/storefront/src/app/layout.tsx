import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Inter, Tiro_Telugu } from 'next/font/google';
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
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const tiroTelugu = Tiro_Telugu({
  subsets: ['telugu', 'latin'],
  variable: '--font-indic',
  display: 'swap',
  weight: ['400'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      'https://aakashraj-aidenai.github.io/V1.0-Ravisweets',
  ),
  title: {
    default: 'Ravi Sweets · Best Sweet Shop in Khammam since 1985 — Telangana Sweets, Namkeens & Gift Hampers',
    template: '%s | Ravi Sweets',
  },
  description:
    'Ravi Sweets — Khammam\'s most-loved sweet shop since 1985, now in Hyderabad (Kondapur). Authentic Telangana sweets, Hyderabadi specials, Andhra savouries, and build-your-own gift hampers. Hand-made, FSSAI certified, no preservatives, fresh daily across India.',
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
  themeColor: '#FFFAF0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${tiroTelugu.variable}`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-screen flex-col bg-theme-base text-theme-ink"
        suppressHydrationWarning
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-theme-accent focus:px-4 focus:py-2 focus:text-white"
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
