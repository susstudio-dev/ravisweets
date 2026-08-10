'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import { listFeaturedReviews, type Review } from '@/lib/supabase/reviews';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';

/**
 * WHAT CUSTOMERS SAY — real quotes only.
 *
 * Renders the best approved reviews from Supabase; if none exist the section
 * renders NOTHING. PRODUCT.md is explicit that testimonials may never be
 * invented or paraphrased, so an empty review table produces an absent
 * section, not placeholder praise. The moment the first approved review with
 * a written body lands, this band appears with no code change.
 */

const TITLE_BY_ID = new Map(CATALOGUE.map((p) => [p.id, { title: p.title, slug: p.slug }]));

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          aria-hidden="true"
          style={{
            color: 'var(--theme-accent)',
            fill: i <= rating ? 'var(--theme-accent)' : 'transparent',
            opacity: i <= rating ? 1 : 0.35,
          }}
        />
      ))}
    </span>
  );
}

export function ReviewsBand() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listFeaturedReviews(6).then((rows) => {
      if (!cancelled) setReviews(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-band-heading" className="container-site section-y">
      <Reveal>
        <div className="docket-head">
          <h2 id="reviews-band-heading" className="font-display text-display-md font-semibold">
            What customers say
          </h2>
        </div>
      </Reveal>
      <Stagger gap={40}>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => {
            const product = TITLE_BY_ID.get(review.productId);
            return (
              <li key={review.id} className="docket flex flex-col p-5">
                <StarRow rating={review.rating} />
                {review.title && (
                  <p className="font-display mt-2.5 text-[15px] font-semibold leading-snug">
                    {review.title}
                  </p>
                )}
                <p className="text-theme-ink/85 mt-2 line-clamp-4 text-sm leading-relaxed">
                  {review.body}
                </p>
                <div className="mt-auto flex items-baseline justify-between gap-3 pt-4">
                  <span className="field-label">
                    {review.verified ? 'Verified buyer' : 'Customer'}
                  </span>
                  {product && (
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-theme-accent truncate text-[13px] font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Stagger>
    </section>
  );
}
