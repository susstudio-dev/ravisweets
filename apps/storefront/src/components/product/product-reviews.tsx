'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, MessageSquarePlus, ThumbsUp, ShieldCheck } from 'lucide-react';
import {
  computeSummary,
  listApprovedReviews,
  listMyReviewForProduct,
  submitReview,
  type Review,
} from '@/lib/supabase/reviews';
import { useSession } from '@/lib/supabase/session-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { Reveal } from '@/components/motion/reveal';

interface Props {
  productId: string;
  productSlug: string;
  productTitle: string;
}

export function ProductReviews({ productId, productTitle }: Omit<Props, 'productSlug'>) {
  const { configured, user, isAnonymous } = useSession();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  async function load() {
    if (!configured) {
      setReviews([]);
      return;
    }
    const list = await listApprovedReviews(productId);
    setReviews(list);
    if (user && !isAnonymous) {
      setMyReview(await listMyReviewForProduct(productId));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, productId, user?.id, isAnonymous]);

  const summary = useMemo(() => computeSummary(reviews ?? []), [reviews]);
  const hist = summary.histogram;
  const histMax = Math.max(hist[1], hist[2], hist[3], hist[4], hist[5], 1);

  function tryOpen() {
    if (!configured) {
      window.alert('Reviews go live once Supabase is configured.');
      return;
    }
    if (!user || isAnonymous) {
      setAuthOpen(true);
      return;
    }
    setComposerOpen(true);
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className="container-site section-y grid gap-10 md:grid-cols-[1fr_2fr] md:gap-12"
    >
      {/* Summary column */}
      <div>
        <Reveal>
          <div className="docket-head">
            {/*
              `productTitle` was already a prop and already unused for display.
              Spending it here retires the second of the three headings that
              were byte-identical across all 83 product pages in the crawl.
            */}
            <h2
              id="reviews-heading"
              className="font-display text-display-md text-theme-ink leading-[1.05]"
            >
              What people say about {productTitle}.
            </h2>
          </div>
        </Reveal>

        <div className="mt-6 flex items-baseline gap-3">
          {/* The average is a recorded value — it goes in the typed face. */}
          <span className="field-value text-theme-ink text-5xl font-bold">
            {summary.avg.toFixed(1)}
          </span>
          <Stars value={summary.avg} size="lg" />
        </div>
        <p className="text-theme-ink/65 mt-1 text-sm">
          {summary.count === 0
            ? 'No reviews yet — be the first.'
            : `Based on ${summary.count} review${summary.count === 1 ? '' : 's'}.`}
        </p>

        {summary.count > 0 && (
          <ul className="mt-6 flex flex-col gap-1.5">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = hist[stars];
              const pct = (count / histMax) * 100;
              return (
                <li key={stars} className="flex items-center gap-2 text-xs">
                  <span className="text-theme-ink/65 w-6 text-right">{stars}</span>
                  <Star
                    className="fill-theme-accent text-theme-accent h-3 w-3"
                    aria-hidden="true"
                  />
                  <div className="bg-theme-ink/8 relative h-2 flex-1 overflow-hidden">
                    <div
                      className="bg-theme-accent absolute inset-y-0 left-0"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="field-value text-theme-ink/55 w-7 text-right">{count}</span>
                </li>
              );
            })}
          </ul>
        )}

        <button type="button" onClick={tryOpen} className="stamp mt-7">
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          {myReview ? 'Update your review' : 'Write a review'}
        </button>
      </div>

      {/* Reviews list column — ruled entries on the sheet, not floating cards. */}
      <div>
        {reviews === null ? (
          <div className="bg-theme-ink/5 h-32 animate-pulse rounded-lg" />
        ) : reviews.length === 0 ? (
          <div className="text-theme-ink/55 rounded-lg border border-dashed border-[color:var(--color-border)] p-10 text-center text-sm">
            No reviews yet for {productTitle}. Yours could be the first.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </ul>
        )}
      </div>

      {composerOpen && (
        <ReviewComposer
          productId={productId}
          productTitle={productTitle}
          existing={myReview}
          onClose={() => {
            setComposerOpen(false);
            void load();
          }}
        />
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          window.setTimeout(() => setComposerOpen(true), 200);
        }}
      />
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return (
    <li className="py-5 first:pt-0">
      <div className="flex flex-wrap items-center gap-3">
        <Stars value={review.rating} />
        {review.verified && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Verified buyer
          </span>
        )}
        <span className="field-value text-theme-ink/55 text-xs">{date}</span>
      </div>
      {review.title && <h3 className="font-display text-theme-ink mt-3 text-lg">{review.title}</h3>}
      <p className="text-theme-ink/85 mt-2 text-sm leading-relaxed">{review.body}</p>
      {review.brandReply && (
        <div className="border-theme-accent bg-theme-glow/10 mt-4 rounded-md border-l-2 p-4">
          <p className="field-label text-theme-accent">Reply from Ravi Sweets</p>
          <p className="text-theme-ink/85 mt-1 text-sm">{review.brandReply}</p>
        </div>
      )}
      {review.helpfulCount > 0 && (
        <p className="text-theme-ink/55 mt-3 inline-flex items-center gap-1 text-xs">
          <ThumbsUp className="h-3 w-3" aria-hidden="true" />
          <span className="field-value">{review.helpfulCount}</span> found this helpful
        </p>
      )}
    </li>
  );
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(value) ? 'fill-theme-accent text-theme-accent' : 'text-theme-ink/20'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewComposer({
  productId,
  productTitle,
  existing,
  onClose,
}: {
  productId: string;
  productTitle: string;
  existing: Review | null;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(existing?.rating ?? 5);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tooShort = body.trim().length < 20;
  const tooLong = body.length > 1500;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (tooShort) {
      setError('Tell us a bit more — minimum 20 characters.');
      return;
    }
    if (tooLong) {
      setError('Maximum 1500 characters.');
      return;
    }
    setBusy(true);
    const r = await submitReview({ productId, rating, title, body });
    setBusy(false);
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    setSuccess(
      r.status === 'approved'
        ? 'Thank you — your review is live.'
        : 'Thank you — your review will appear once approved.',
    );
    window.setTimeout(onClose, 1200);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-theme-ink/60 absolute inset-0 focus-visible:outline-none"
      />
      {/* The composer is a docket sheet lifted off the counter. */}
      <form onSubmit={send} className="docket shadow-lifted relative z-10 w-full max-w-lg p-6">
        <h2 className="font-display text-theme-ink text-xl">
          {existing ? 'Update your review' : 'Write a review'}
        </h2>
        <p className="text-theme-ink/65 mt-1 text-xs">{productTitle}</p>

        <fieldset className="mt-5">
          <legend className="field-label">Rating</legend>
          <div className="mt-2 flex gap-1">
            {([1, 2, 3, 4, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`${s} stars`}
                onClick={() => setRating(s)}
                className="hover:bg-theme-ink/5 focus-visible:ring-theme-accent rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2"
              >
                <Star
                  className={`h-7 w-7 ${s <= rating ? 'fill-theme-accent text-theme-accent' : 'text-theme-ink/25'}`}
                />
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="field-label">Title (optional)</span>
          <input
            type="text"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tastes like my grandmother's"
            className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1.5">
          <span className="field-label">
            Your review · <span className="field-value normal-case">{body.length}/1500</span>
          </span>
          <textarea
            rows={5}
            value={body}
            maxLength={1500}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you think? Texture, sweetness, packaging — what stood out?"
            className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        {error && <p className="mt-3 text-xs font-medium text-red-700">{error}</p>}
        {success && <p className="mt-3 text-xs font-medium text-emerald-700">{success}</p>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="stamp stamp--ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || tooShort}
            className="stamp disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Submitting…' : existing ? 'Update review' : 'Submit review'}
          </button>
        </div>
        <p className="text-theme-ink/55 mt-3 text-[10px]">
          Your name and email are not shown publicly. Verified-buyer badge appears automatically
          when we can match your account to a delivered order.
        </p>
      </form>
    </div>
  );
}
