'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import { parseFilters, writeFilters, type FilterState } from './filters';

/**
 * The browse surfaces' single connection to the URL.
 *
 * Filter state lives in the query string and NOWHERE else, so the panel and
 * the grid each read it independently and no state has to thread between
 * them — that is what lets the category page put the filters in its sticky
 * left rail while the grid sits in another column, and it is why every
 * filtered view is linkable and survives a refresh.
 *
 * `pathname` rather than a hardcoded route: the same hook drives /shop and
 * /category/[slug]. ShopView used to write `/shop` literally, which would
 * have silently redirected the category page to the catalogue.
 *
 * `replace`, not `push`: twelve chip clicks should not cost twelve presses of
 * the back button to leave. `scroll: false` keeps the grid still — re-anchoring
 * to the top on every toggle makes the page feel like it reloaded.
 */
export function useProductFilters(): {
  state: FilterState;
  setState: (next: FilterState) => void;
  pending: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const state = useMemo(() => parseFilters(params), [params]);

  const setState = useCallback(
    (next: FilterState) => {
      const qs = writeFilters(new URLSearchParams(params.toString()), next).toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  return { state, setState, pending };
}
