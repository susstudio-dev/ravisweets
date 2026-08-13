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
