'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Flag, MessageSquare, Star, Trash2, X } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import {
  deleteReview,
  listAllReviews,
  setBrandReply,
  setReviewStatus,
  type Review,
  type ReviewStatus,
} from '@/lib/supabase/reviews';
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

const TABS: { key: ReviewStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

export function AdminReviews() {
  const { configured } = useSession();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [tab, setTab] = useState<ReviewStatus | 'all'>('pending');
  const [replying, setReplying] = useState<Review | null>(null);

  async function load() {
    if (!configured) {
      setReviews([]);
      return;
    }
    setReviews(await listAllReviews(tab));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, tab]);

  // Build per-SKU metrics from ALL reviews (not just current tab) for the
  // dashboard-style sidebar widgets. Cheap second fetch.
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  useEffect(() => {
    if (!configured) return;
    void listAllReviews('all').then(setAllReviews);
  }, [configured, reviews]);

  const metrics = useMemo(() => buildMetrics(allReviews), [allReviews]);

  async function transition(r: Review, next: ReviewStatus) {
    const ok = await setReviewStatus(r.id, next);
    if (ok) {
      await logAdminAction('transition', 'review', r.id, { status: r.status }, { status: next });
      await load();
    }
  }

  async function remove(r: Review) {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    const ok = await deleteReview(r.id);
    if (ok) {
      await logAdminAction('delete', 'review', r.id, r, null);
      await load();
    }
  }

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, approved: 0, flagged: 0, rejected: 0, all: allReviews.length };
    for (const r of allReviews) counts[r.status]!++;
    return counts;
  }, [allReviews]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Customer feedback
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          Moderate, reply, and analyse customer reviews. Auto-approval kicks in for verified
          purchases at 4★+ with clean text.
        </p>
      </header>

      {/* Metrics row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Avg rating · all SKUs"
          value={metrics.totalAvg.toFixed(1)}
          sub={`${metrics.totalCount} reviews · ${metrics.verifiedPct}% verified`}
        />
        <Metric
          label="Pending moderation"
          value={String(tabCounts.pending ?? 0)}
          sub={tabCounts.pending ? 'Needs your attention' : 'All caught up'}
          accent={(tabCounts.pending ?? 0) > 0}
        />
        <Metric
          label="Last 30 days"
          value={String(metrics.last30Count)}
          sub={`Avg ${metrics.last30Avg.toFixed(1)}★`}
        />
        <Metric
          label="Reply rate"
          value={`${metrics.replyRate}%`}
          sub="Brand replies on approved reviews"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Moderation queue */}
        <section>
          <div className="mb-3 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                    : 'border-[color:var(--color-border)] text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent'
                }`}
              >
                {t.label}
                <span className="ml-1.5 opacity-65">({tabCounts[t.key] ?? 0})</span>
              </button>
            ))}
          </div>

          {reviews === null ? (
            <div className="h-32 animate-pulse rounded-2xl bg-theme-ink/5" />
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center text-sm text-theme-ink/55">
              No reviews in this tab yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-xs text-theme-ink/55">
                        {productLabel(r.productId)} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      {r.verified && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          Verified
                        </span>
                      )}
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                  {r.title && (
                    <h3 className="mt-2 font-display text-base font-semibold text-theme-ink">
                      {r.title}
                    </h3>
                  )}
                  <p className="mt-1 text-sm text-theme-ink/85">{r.body}</p>
                  {r.brandReply && (
                    <div className="mt-3 rounded-lg border-l-2 border-theme-accent bg-theme-glow/10 p-3 text-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
                        Your reply
                      </p>
                      <p className="mt-1 text-theme-ink/85">{r.brandReply}</p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.status !== 'approved' && (
                      <Action onClick={() => transition(r, 'approved')} icon={CheckCircle2}>
                        Approve
                      </Action>
                    )}
                    {r.status !== 'rejected' && (
                      <Action onClick={() => transition(r, 'rejected')} icon={X} variant="danger">
                        Reject
                      </Action>
                    )}
                    {r.status !== 'flagged' && (
                      <Action onClick={() => transition(r, 'flagged')} icon={Flag} variant="warn">
                        Flag
                      </Action>
                    )}
                    <Action onClick={() => setReplying(r)} icon={MessageSquare}>
                      {r.brandReply ? 'Edit reply' : 'Reply'}
                    </Action>
                    <Action onClick={() => remove(r)} icon={Trash2} variant="danger">
                      Delete
                    </Action>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Per-SKU sidebar */}
        <aside className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-theme-ink">
            <Star className="mr-1.5 inline h-4 w-4 text-theme-accent" aria-hidden="true" />
            Per-SKU rating
          </h2>
          {metrics.lowSkuAlerts.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                {metrics.lowSkuAlerts.length} SKU{metrics.lowSkuAlerts.length === 1 ? '' : 's'} averaging below 3.5
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-xs">
                {metrics.lowSkuAlerts.map((s) => (
                  <li key={s.productId} className="flex items-center justify-between text-theme-ink">
                    <span>{productLabel(s.productId)}</span>
                    <span className="font-mono">{s.avg.toFixed(1)} · n={s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ul className="mt-4 flex flex-col gap-1 text-xs">
            {metrics.bySku.map((s) => (
              <li
                key={s.productId}
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-theme-glow/15"
              >
                <span className="text-theme-ink/85">{productLabel(s.productId)}</span>
                <span className="font-mono text-theme-ink/65">
                  {s.avg.toFixed(1)}★ · n={s.count}
                </span>
              </li>
            ))}
          </ul>
          {metrics.bySku.length === 0 && (
            <p className="mt-3 text-xs text-theme-ink/55">No reviews yet.</p>
          )}
        </aside>
      </div>

      {replying && (
        <ReplyDialog
          review={replying}
          onClose={() => {
            setReplying(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? 'border-theme-accent/40 bg-theme-glow/15'
          : 'border-[color:var(--color-border)] bg-surface-elevated'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-theme-ink tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-theme-ink/55">{sub}</p>}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(value) ? 'fill-theme-accent text-theme-accent' : 'text-theme-ink/20'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { cls: string; label: string }> = {
    pending: { cls: 'bg-amber-500/15 text-amber-700', label: 'Pending' },
    approved: { cls: 'bg-emerald-500/15 text-emerald-700', label: 'Approved' },
    rejected: { cls: 'bg-theme-ink/10 text-theme-ink/55', label: 'Rejected' },
    flagged: { cls: 'bg-red-500/15 text-red-700', label: 'Flagged' },
  };
  const m = map[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function Action({
  onClick,
  icon: Icon,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  icon: typeof CheckCircle2;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'warn';
}) {
  const cls =
    variant === 'danger'
      ? 'border-red-500/40 text-red-700 hover:bg-red-500/10'
      : variant === 'warn'
      ? 'border-amber-500/40 text-amber-700 hover:bg-amber-500/10'
      : 'border-[color:var(--color-border)] text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </button>
  );
}

function ReplyDialog({ review, onClose }: { review: Review; onClose: () => void }) {
  const [reply, setReply] = useState(review.brandReply ?? '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const ok = await setBrandReply(review.id, reply.trim());
    setBusy(false);
    if (ok) {
      await logAdminAction('brand-reply', 'review', review.id, { reply: review.brandReply }, { reply });
      onClose();
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-surface-elevated p-6 shadow-lifted">
        <h2 className="font-display text-lg font-semibold text-theme-ink">Reply to review</h2>
        <p className="mt-1 text-xs text-theme-ink/65">
          Your reply appears under the customer&rsquo;s review on the product page.
        </p>
        <textarea
          rows={5}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          maxLength={500}
          placeholder="Thank you for the feedback…"
          className="mt-4 w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

function productLabel(productId: string): string {
  const p = CATALOGUE.find((x) => x.id === productId);
  return p?.title ?? productId;
}

function buildMetrics(reviews: Review[]) {
  const totalCount = reviews.length;
  const totalAvg =
    totalCount === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / totalCount;
  const verified = reviews.filter((r) => r.verified).length;
  const verifiedPct = totalCount === 0 ? 0 : Math.round((verified / totalCount) * 100);

  const dayMs = 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - 30 * dayMs;
  const last30 = reviews.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
  const last30Count = last30.length;
  const last30Avg = last30Count === 0 ? 0 : last30.reduce((s, r) => s + r.rating, 0) / last30Count;

  const approved = reviews.filter((r) => r.status === 'approved');
  const repliedCount = approved.filter((r) => !!r.brandReply).length;
  const replyRate = approved.length === 0 ? 0 : Math.round((repliedCount / approved.length) * 100);

  // Per-SKU aggregate from approved-only.
  const map = new Map<string, { sum: number; count: number }>();
  for (const r of approved) {
    const e = map.get(r.productId) ?? { sum: 0, count: 0 };
    e.sum += r.rating;
    e.count++;
    map.set(r.productId, e);
  }
  const bySku = Array.from(map.entries())
    .map(([productId, v]) => ({ productId, avg: v.sum / v.count, count: v.count }))
    .sort((a, b) => a.avg - b.avg);

  const lowSkuAlerts = bySku.filter((s) => s.avg < 3.5 && s.count >= 5);

  return { totalCount, totalAvg, verifiedPct, last30Count, last30Avg, replyRate, bySku, lowSkuAlerts };
}
