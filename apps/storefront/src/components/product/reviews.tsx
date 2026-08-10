import { Star } from 'lucide-react';
import { getReviewsForProduct, getReviewSummary, type Review } from '@ravisweets/shared';
import { Reveal } from '@/components/motion/reveal';
import { isUsableImage } from '@/lib/images';

interface ProductReviewsProps {
  productSlug: string;
}

/**
 * Reviews as ruled entries on the sheet — a ledger of what people said, not a
 * grid of floating cards. Recorded values (rating, date) go in the typed face.
 */
export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const reviews = getReviewsForProduct(productSlug);
  const summary = getReviewSummary(productSlug);
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading" className="container-site section-y">
      <Reveal>
        <div className="docket-head">
          <h2
            id="reviews-heading"
            className="font-display text-display-md text-theme-ink leading-[1.02]"
          >
            What customers say.
          </h2>
          <Summary count={summary.count} avg={summary.avg} />
        </div>
      </Reveal>

      <div className="max-w-3xl divide-y divide-[color:var(--color-border)]">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={0.04 + i * 0.04}>
            <ReviewEntry review={r} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Summary({ count, avg }: { count: number; avg: number }) {
  return (
    <div className="flex items-center gap-3">
      <Stars value={avg} />
      <span className="field-value text-theme-ink text-sm font-bold">{avg.toFixed(1)}</span>
      <span className="field-value text-theme-ink/55 text-xs">({count} reviews)</span>
    </div>
  );
}

function ReviewEntry({ review }: { review: Review }) {
  const date = new Date(review.date).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
  // Decided at render — a dead photo URL never becomes a request.
  const photos = (review.photos ?? []).filter((p) => isUsableImage(p));
  return (
    <article className="flex flex-col gap-3 py-5">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        {review.verified && (
          <span className="bg-theme-glow/25 text-theme-accent rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
            Verified
          </span>
        )}
      </div>
      <h3 className="font-display text-theme-ink text-lg">{review.title}</h3>
      <p className="text-theme-ink/80 text-sm leading-relaxed">{review.body}</p>
      {photos.length > 0 && (
        <ul className="mt-1 grid grid-cols-4 gap-1.5">
          {photos.slice(0, 4).map((p, i) => (
            <li
              key={i}
              className="bg-theme-glow/10 aspect-square overflow-hidden rounded-md border border-[color:var(--color-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p}
                alt={`${review.title} — customer photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </ul>
      )}
      <p className="text-theme-ink/55 text-xs">
        {review.author}
        {review.city && ` · ${review.city}`}
        {' · '}
        <span className="field-value">{date}</span>
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
