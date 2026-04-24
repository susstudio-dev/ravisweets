import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Inter, Tiro_Telugu } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LayoutGroup } from '@/components/motion/layout-group';
import { CartProvider } from '@/lib/cart/cart-context';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Ravi Sweets — Hyderabadi Sweets, Namkeens & Gift Hampers',
    template: '%s | Ravi Sweets',
  },
  description:
    'Authentic Hyderabadi sweets, namkeens and hand-packed gift hampers — made fresh in small batches. Shipped across India, shipping worldwide coming soon.',
  openGraph: {
    type: 'website',
    siteName: 'Ravi Sweets',
    locale: 'en_IN',
  },
  robots: { index: false, follow: false }, // staging-gated — flip when photography lands
  icons: { icon: '/favicon.ico' },
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
        <CartProvider>
          <LayoutGroup>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            {modal}
          </LayoutGroup>
        </CartProvider>
      </body>
    </html>
  );
}
