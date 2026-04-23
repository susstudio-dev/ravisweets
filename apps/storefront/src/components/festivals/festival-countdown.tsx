'use client';

import { useEffect, useState } from 'react';

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function diff(targetIso: string): Parts {
  const now = Date.now();
  const target = new Date(targetIso).getTime();
  const ms = target - now;
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  }
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, past: false };
}

export function FestivalCountdown({ target, accentColor }: { target: string; accentColor: string }) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = window.setInterval(() => setParts(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!parts) {
    // Skeleton on first render — avoids SSR-client mismatch on the live-ticking numbers.
    return (
      <div className="mt-3 flex gap-6" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="h-10 w-14 rounded bg-black/10" />
            <span className="h-3 w-12 rounded bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  if (parts.past) {
    return (
      <p
        className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ borderColor: `${accentColor}66`, color: accentColor }}
        role="status"
      >
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-75"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="relative h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </span>
        Collection now live
      </p>
    );
  }

  const entries: [label: string, value: number][] = [
    ['days', parts.days],
    ['hours', parts.hours],
    ['minutes', parts.minutes],
    ['seconds', parts.seconds],
  ];

  return (
    <div
      className="mt-3 flex flex-wrap gap-6"
      role="timer"
      aria-label={`Countdown: ${parts.days} days, ${parts.hours} hours`}
    >
      {entries.map(([label, v]) => (
        <div key={label} className="flex flex-col items-start gap-0.5">
          <span
            className="font-display text-4xl font-semibold tabular-nums md:text-5xl"
            style={{ color: accentColor }}
          >
            {String(v).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
