import { Star } from 'lucide-react';
import { getReviewsForProduct, getReviewSummary, type Review } from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';

interface ProductReviewsProps {
  productSlug: string;
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const reviews = getReviewsForProduct(productSlug);
  const summary = getReviewSummary(productSlug);
  if (reviews.length === 0) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="container-site py-12 md:py-16"
    >
      <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            From people who&rsquo;ve received it
          </p>
          <h2
            id="reviews-heading"
            className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink"
          >
            What customers say.
          </h2>
        </div>
        <Summary count={summary.count} avg={summary.avg} />
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={0.04 + i * 0.04}>
            <ReviewCard review={r} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Summary({ count, avg }: { count: number; avg: number }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-4 py-2">
      <Stars value={avg} />
      <span className="text-sm font-semibold text-theme-ink">{avg.toFixed(1)}</span>
      <span className="text-xs text-theme-ink/55">({count} reviews)</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.date).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        {review.verified && (
          <span className="rounded-full bg-theme-glow/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
            Verified
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-theme-ink">{review.title}</h3>
      <p className="text-sm leading-relaxed text-theme-ink/80">{review.body}</p>
      <p className="mt-auto text-xs text-theme-ink/55">
        {review.author}
        {review.city && ` · ${review.city}`}
        {' · '}
        {date}
      </p>
    </article>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= full ? 'fill-theme-accent text-theme-accent' : 'text-theme-ink/20'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
