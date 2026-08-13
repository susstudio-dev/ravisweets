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
