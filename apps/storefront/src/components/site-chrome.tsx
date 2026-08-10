'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SweetCursor } from '@/components/cursor/sweet-cursor';
import { FloatingContact } from '@/components/contact/floating-contact';
import { PromoStrip } from '@/components/promo/promo-strip';

/*
 * The storefront chrome — promo strip, masthead, footer, corner widgets —
 * wraps every route EXCEPT /admin. The admin is an application, not a page:
 * AdminShell owns the whole viewport and its own scroll containers, and the
 * shop's sticky header, footer and floating buttons were previously rendered
 * on top of it, forcing the entire document to scroll (sidebar included).
 *
 * The check lives in a client component because the root layout is a server
 * component and cannot read the pathname under static export.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <PromoStrip />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <SweetCursor />
      <FloatingContact />
    </>
  );
}
