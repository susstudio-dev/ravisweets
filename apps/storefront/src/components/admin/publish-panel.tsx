'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, UploadCloud } from 'lucide-react';
import {
  readPublishState,
  triggerPublish,
  type PublishOutcome,
  type PublishStateResult,
} from '@/lib/supabase/publish';

/**
 * The Publish card — the one control in this admin that spends Cloudflare
 * build minutes, and the only way an edit reaches the public site.
 *
 * WHY IT NEEDS TO BE THIS TALKATIVE: the storefront is a static export, so
 * "saved" and "live" are two different events separated by a five-minute
 * build. Every other admin screen can say "Saved ✓" and be done. This one
 * cannot: pressing the button may start a build, or may join one already
 * running, or may fail for a reason only the person holding the Supabase
 * secrets can fix. Each of those is a different thing for the owner to do
 * next, so each gets its own words. A single "Published!" toast over all
 * three would be the same silent-failure pattern lib/supabase/write-result.ts
 * exists to prevent, one layer up.
 */

/* ── Time, said the way a person would say it ──────────────────────────── */

/**
 * All three helpers tolerate junk: these strings come off the wire, and a
 * card on the dashboard must not render "Invalid Date" or throw because a
 * timestamp arrived malformed.
 */

/** "just now" / "6 minutes ago" / "3 hours ago" / "8 Aug, 14:02" for older. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 'at an unknown time';
  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return 'just now';
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "14:07" — the wall clock the owner is going to check the site against. */
function atClock(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 'an unknown time';
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/**
 * "in about 4 minutes". Rounded to the minute on purpose — the server's build
 * estimate is a deliberate over-estimate, and a to-the-second countdown over
 * it would imply a precision that does not exist.
 */
function inAbout(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) return 'shortly';
  if (ms <= 0) return 'now';
  const minutes = Math.max(1, Math.round(ms / 60_000));
  return `in about ${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/**
 * The same phrase built from a DURATION rather than an instant, for the
 * coalesced branch's fallback: `retryAfterSeconds` is what the server sends
 * when it wants to be believed over the browser's clock, which on a desktop
 * that has been asleep can be minutes out. Floored at one minute for the same
 * reason `inAbout` is — "in about 0 minutes" reads as a bug.
 */
function inMinutes(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `in about ${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/* ── The card ──────────────────────────────────────────────────────────── */

export function PublishPanel() {
  const [state, setState] = useState<PublishStateResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);

  /*
   * `disabled` alone is not a lock. A double-click can fire twice before
   * React re-renders with the new state, and a second POST would either burn
   * a second build or land the owner in a coalesce they did not ask for. The
   * ref is checked and set synchronously, inside the same tick as the click.
   */
  const inFlight = useRef(false);

  const refresh = useCallback(() => {
    void readPublishState().then(setState);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function publish() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPublishing(true);
    setOutcome(null);

    const result = await triggerPublish();

    setOutcome(result);
    setPublishing(false);
    inFlight.current = false;

    // Both a trigger and a coalesce rewrite the row (via service_role, inside
    // the function), so the "last published" line above is now stale. Re-read
    // rather than patch it from the response: the row is the truth, and this
    // costs a query, not a build.
    refresh();
  }

  return (
    <section className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="field-label">Publishing</p>
          <h2 className="font-display text-theme-ink mt-1 text-lg">
            <UploadCloud className="text-theme-accent mr-1.5 inline h-4 w-4" aria-hidden="true" />
            Publish changes
          </h2>
        </div>
        {/*
         * The design system's state dot, used for the one state on this page
         * that is true *right now*: the live site is behind the database.
         */}
        {state?.ok && state.state.pending_since && (
          <span className="live-mark">Changes waiting</span>
        )}
      </div>

      <p className="text-theme-ink/65 mt-2 text-sm">
        Your edits are in the database the moment you save them, but the public site is{' '}
        <em>built</em> from that database — it only shows them after a rebuild. Publishing starts
        that rebuild. It takes about five minutes, and it is the only control in this admin that
        spends build minutes, so publish once you have finished a batch of changes rather than after
        each one.
      </p>

      {state === null ? (
        <div className="mt-4 flex flex-col gap-2" aria-hidden="true">
          <div className="bg-theme-ink/10 h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-theme-ink/10 h-4 w-1/2 animate-pulse rounded" />
        </div>
      ) : state.ok ? (
        <>
          <dl className="mt-4">
            <div className="field-row">
              <dt className="field-label">Last published</dt>
              <dd className="field-value text-theme-ink text-right text-[13px]">
                {state.state.last_triggered_at
                  ? `${timeAgo(state.state.last_triggered_at)} · ${atClock(state.state.last_triggered_at)}`
                  : 'Never from this admin'}
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Pending changes</dt>
              <dd className="field-value text-theme-ink text-right text-[13px]">
                {state.state.pending_since
                  ? `Waiting since ${atClock(state.state.pending_since)}`
                  : 'None queued'}
              </dd>
            </div>
          </dl>
          {/*
           * Said out loud because the row above is easy to misread as "the
           * site is up to date". `pending_since` is only stamped when a
           * publish arrived while a build was already running — ordinary
           * edits since the last build set nothing, so "None queued" is not a
           * promise that the site matches the database.
           */}
          <p className="text-theme-ink/45 mt-2 text-[11px]">
            &ldquo;Pending&rdquo; counts only publishes that arrived while a build was already
            running. Edits made since the last publish are not tracked here.
          </p>
        </>
      ) : (
        <p className="text-theme-ink/85 mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
          Publish history unavailable — {state.reason} You can still press Publish; it reports its
          own result either way.
        </p>
      )}

      <button
        type="button"
        onClick={() => void publish()}
        disabled={publishing}
        className="stamp mt-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {publishing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
        )}
        {publishing ? 'Starting build…' : 'Publish changes'}
      </button>

      {/*
       * Polite rather than assertive: the outcome always appears next to the
       * button that produced it, so a screen reader should finish the current
       * phrase before reading it.
       */}
      <div aria-live="polite" className="empty:hidden">
        {outcome && <OutcomeNote outcome={outcome} />}
      </div>
    </section>
  );
}

/* ── One shape per outcome, no shared "result" box ─────────────────────── */

/**
 * Each branch is written as the sentence the owner needs, not as a status
 * label. The coalesced branch in particular is worded as a success with a
 * wait attached, because that is what it is — the edit is recorded and the
 * next build carries it; nothing has been dropped.
 */
function OutcomeNote({ outcome }: { outcome: PublishOutcome }) {
  if (outcome.kind === 'triggered') {
    return (
      <NoteBox tone="good" icon={CheckCircle2} title="Build started">
        <p>
          The site is rebuilding now
          {outcome.expectedLiveAt
            ? ` and should be live by about ${atClock(outcome.expectedLiveAt)} (${inAbout(outcome.expectedLiveAt)})`
            : ' — it usually takes about five minutes'}
          . You can leave this page; the build carries on without it.
        </p>
        {outcome.includedPendingSince && (
          <p className="mt-1">
            This build also carries the changes that had been waiting since{' '}
            {atClock(outcome.includedPendingSince)}.
          </p>
        )}
        {outcome.deploymentId && (
          <p className="text-theme-ink/55 mt-1 font-mono text-[11px]">
            Cloudflare deployment {outcome.deploymentId}
          </p>
        )}
      </NoteBox>
    );
  }

  if (outcome.kind === 'coalesced') {
    return (
      <NoteBox tone="wait" icon={Clock} title="Queued into the next build">
        <p>
          A build is already running
          {outcome.lastTriggeredAt ? `, started ${timeAgo(outcome.lastTriggeredAt)}` : ''} — it
          began before these changes existed, so it will not include them. Nothing has been lost:
          your changes are recorded and go out with the next build.
        </p>
        <p className="mt-1">
          {outcome.nextEligibleAt
            ? `That build can start at ${atClock(outcome.nextEligibleAt)} (${inAbout(outcome.nextEligibleAt)})`
            : outcome.retryAfterSeconds !== null
              ? `That build can start ${inMinutes(outcome.retryAfterSeconds)}`
              : 'That build can start once the current one settles'}
          {outcome.expectedLiveAt
            ? `, and the site should be live by about ${atClock(outcome.expectedLiveAt)}`
            : ''}
          . Press Publish again then.
        </p>
      </NoteBox>
    );
  }

  return (
    <NoteBox
      tone="bad"
      icon={AlertTriangle}
      title={outcome.status ? `Publish failed (${outcome.status})` : 'Publish failed'}
    >
      {/* The server's own sentence, verbatim — see publish.ts on why. */}
      <p>{outcome.message}</p>
      {outcome.hint && <p className="mt-1">{outcome.hint}</p>}
      <p className="mt-1">No build was started, and nothing you saved has been lost.</p>
    </NoteBox>
  );
}

/**
 * Three tones, matching the admin's existing convention: amber for "attention,
 * nothing broken" (admin-batches, admin-schedule, admin-login), green for a
 * completed action (admin-photos), red for a failure (admin-dashboard's
 * low-stock rows).
 */
function NoteBox({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: 'good' | 'wait' | 'bad';
  icon: typeof CheckCircle2;
  title: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'good'
      ? 'border-green-600/40 bg-green-500/10'
      : tone === 'wait'
        ? 'border-amber-500/40 bg-amber-500/10'
        : 'border-red-500/40 bg-red-500/10';

  return (
    <div className={`text-theme-ink/85 mt-4 rounded-lg border p-3 text-xs ${toneClass}`}>
      <p className="text-theme-ink flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <div className="mt-1.5 leading-relaxed">{children}</div>
    </div>
  );
}
