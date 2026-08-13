'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { resolveOrderBy, type OrderByState } from './resolve-order-by';
import type { FestivalSlug } from './calendar';

/**
 * The order-by state for one festival, live.
 *
 * TWO THINGS RESOLVE AFTER HYDRATION, and both must, because this site is a
 * static export:
 *
 *   1. The owner's override, which arrives through SiteContentProvider's
 *      Realtime subscription and 60-second poll.
 *   2. The clock. A prerendered "is it past?" is stale the next morning —
 *      the same reason hero-batch.tsx resolves its date client-side.
 *
 * `now` is seeded to 0, which resolveOrderBy reads as "never closed", so the
 * prerendered HTML and the first hydration pass render identically and React
 * logs no mismatch. The effect then supplies the real clock and the CLOSED
 * marker appears on the next frame. The static HTML still carries the computed
 * default date, so the deadline stays in the indexed markup and there is no
 * empty flash.
 */
export function useOrderBy(slug: FestivalSlug, festivalISO: string): OrderByState {
  const { festivalDates } = useSiteContent();
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  return resolveOrderBy(festivalISO, festivalDates[slug]?.orderBy, nowMs);
}
