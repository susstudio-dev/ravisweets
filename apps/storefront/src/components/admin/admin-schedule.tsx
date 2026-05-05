'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Check, Trash2 } from 'lucide-react';
import {
  deleteScheduledChange,
  listScheduledChanges,
  publishDueChanges,
  scheduleChange,
  type ScheduledChange,
  type ScheduledKind,
} from '@/lib/supabase/schedule';
import { useSession } from '@/lib/supabase/session-context';

const KIND_LABEL: Record<ScheduledKind, string> = {
  theme: 'Theme swap',
  banner: 'Banner copy',
  active_festival: 'Active festival',
  promo: 'Site-wide promo',
};

export function AdminSchedule() {
  const { configured } = useSession();
  const [rows, setRows] = useState<ScheduledChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New change form
  const [kind, setKind] = useState<ScheduledKind>('active_festival');
  const [payload, setPayload] = useState<string>('{}');
  const [effectiveAt, setEffectiveAt] = useState<string>('');

  async function refresh() {
    setLoading(true);
    setRows(await listScheduledChanges());
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveAt) {
      setFeedback('Pick a date/time first.');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch (err) {
      setFeedback(`Payload must be valid JSON: ${(err as Error).message}`);
      return;
    }
    setBusy(true);
    const r = await scheduleChange(kind, parsed, new Date(effectiveAt));
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Schedule failed: ${r.reason}. Run migration 0005.`);
      return;
    }
    setFeedback(`Scheduled — will publish at ${new Date(effectiveAt).toLocaleString('en-IN')}`);
    setEffectiveAt('');
    setPayload('{}');
    void refresh();
  }

  async function onPublishDue() {
    setBusy(true);
    const r = await publishDueChanges();
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Publish failed: ${r.reason}`);
      return;
    }
    setFeedback(r.applied === 0 ? 'No changes due right now.' : `Published ${r.applied} change(s).`);
    void refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm('Cancel this scheduled change?')) return;
    await deleteScheduledChange(id);
    void refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          <CalendarClock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Schedule
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Plan changes ahead.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-ink/65">
          Queue a banner swap, festival activation, or theme change for a
          specific moment. The brand owner taps "Publish due" once a day to
          flip everything that's ready (Phase D adds an automatic cron).
        </p>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase not configured — connect <code>.env.local</code> to use schedule.
        </div>
      )}

      {/* New scheduled change form */}
      <form onSubmit={onSchedule} className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Queue a new change
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
              What changes
            </span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ScheduledKind)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              {(Object.keys(KIND_LABEL) as ScheduledKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
              Effective at
            </span>
            <input
              type="datetime-local"
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
              Payload (JSON)
            </span>
            <textarea
              rows={6}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-xs"
              placeholder={
                kind === 'active_festival'
                  ? '{ "slug": "diwali", "banner_text": "Diwali pre-orders open", "ends_at": "2026-11-08T18:30:00Z", "curated_product_ids": [], "auto_apply_theme": true }'
                  : '{ ...the payload to upsert into site_content }'
              }
            />
            <span className="text-[10px] text-theme-ink/55">
              Shape depends on kind. For active_festival — the same JSON the
              Festival manager writes. Phase D adds a friendly form per kind.
            </span>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-ink px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            Queue change
          </button>
          <button
            type="button"
            onClick={onPublishDue}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Publish due now
          </button>
          {feedback && <p className="text-xs font-semibold text-theme-ink/65">{feedback}</p>}
        </div>
      </form>

      {/* Queued list */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Queue
        </h2>
        {loading ? (
          <div className="mt-3 h-12 w-32 animate-pulse rounded bg-theme-ink/10" />
        ) : rows.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-theme-ink/55">
            Nothing queued. Queue a change above.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {rows.map((r) => {
              const due = new Date(r.effective_at).getTime() <= Date.now();
              return (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-surface-elevated p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold text-theme-ink">
                      {KIND_LABEL[r.kind]}
                      {r.applied_at ? (
                        <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          Published
                        </span>
                      ) : due ? (
                        <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                          Due now
                        </span>
                      ) : (
                        <span className="ml-2 rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
                          Scheduled
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-theme-ink/55">
                      Effective {new Date(r.effective_at).toLocaleString('en-IN')}
                      {r.applied_at && ` · Applied ${new Date(r.applied_at).toLocaleString('en-IN')}`}
                    </p>
                    <pre className="mt-2 max-h-28 overflow-auto rounded bg-theme-ink/5 p-2 font-mono text-[10px] text-theme-ink/75">
                      {JSON.stringify(r.payload, null, 2)}
                    </pre>
                  </div>
                  {!r.applied_at && (
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      aria-label="Cancel scheduled change"
                      className="rounded-full p-1.5 text-theme-ink/55 transition-colors hover:bg-red-500/10 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
