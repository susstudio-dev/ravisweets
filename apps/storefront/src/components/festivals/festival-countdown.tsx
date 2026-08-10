'use client';

import { useEffect, useState } from 'react';

/**
 * Days remaining to a festival, as a recorded value.
 *
 * The retired world ran a ticking DD:HH:MM:SS clock here, re-rendering once a
 * second forever. A kitchen records an order-by date; it does not run a
 * flash-sale clock. What remains is a single figure resolved on mount — no
 * seconds, no interval — and a live mark once the collection is open.
 *
 * The festival dispatch sheet itself carries the FESTIVAL / ORDER BY
 * field-rows statically; this component exists for any surface that still
 * wants the client-resolved remainder. `accentColor` is accepted for
 * call-site compatibility but no longer used — state colour comes from the
 * docket grammar (.field-label / .field-value / .live-mark), not per-festival
 * inline ink.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function FestivalCountdown({
  target,
}: {
  target: string;
  accentColor?: string;
}) {
  const [state, setState] = useState<{ days: number; past: boolean } | null>(null);

  useEffect(() => {
    // Resolved on mount so a static export never bakes a stale build-time
    // figure into the prerendered HTML.
    const ms = new Date(target).getTime() - Date.now();
    setState({ days: Math.max(0, Math.ceil(ms / DAY_MS)), past: ms <= 0 });
  }, [target]);

  if (!state) {
    // Empty ruled line on first paint — same height, no SSR-client mismatch.
    return <div className="field-row" aria-hidden="true" />;
  }

  if (state.past) {
    return (
      <p className="live-mark" role="status">
        Collection now live
      </p>
    );
  }

  return (
    <div className="field-row">
      <span className="field-label">Days remaining</span>
      <span className="field-value text-sm font-bold">{String(state.days).padStart(2, '0')}</span>
    </div>
  );
}
