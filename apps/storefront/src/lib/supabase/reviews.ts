'use client';

import { getSupabase } from './client';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  orderId: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string;
  status: ReviewStatus;
  helpfulCount: number;
  brandReply: string | null;
  brandRepliedAt: string | null;
  createdAt: string;
  /** Display name; computed client-side from auth.users.email when needed. */
  authorDisplay?: string;
  verified: boolean;
}

interface ReviewRow {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  helpful_count: number;
  brand_reply: string | null;
  brand_replied_at: string | null;
  created_at: string;
}

function fromRow(r: ReviewRow): Review {
  return {
    id: r.id,
    productId: r.product_id,
    customerId: r.customer_id,
    orderId: r.order_id,
    rating: Math.max(1, Math.min(5, r.rating)) as 1 | 2 | 3 | 4 | 5,
    title: r.title,
    body: r.body,
    status: r.status,
    helpfulCount: r.helpful_count,
    brandReply: r.brand_reply,
    brandRepliedAt: r.brand_replied_at,
    createdAt: r.created_at,
    verified: !!r.order_id,
  };
}

export async function listApprovedReviews(productId: string): Promise<Review[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as ReviewRow[]).map(fromRow);
}

export async function listMyReviewForProduct(productId: string): Promise<Review | null> {
  const supa = await getSupabase();
  if (!supa) return null;
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const { data, error } = await supa
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('customer_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data as ReviewRow);
}

/**
 * Admin: list all reviews with optional status filter.
 */
export async function listAllReviews(filter?: ReviewStatus | 'all'): Promise<Review[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  let q = supa.from('reviews').select('*').order('created_at', { ascending: false }).limit(500);
  if (filter && filter !== 'all') {
    q = q.eq('status', filter);
  }
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as ReviewRow[]).map(fromRow);
}

export async function submitReview(input: {
  productId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
}): Promise<{ ok: true; status: ReviewStatus } | { ok: false; reason: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  if (!user || user.is_anonymous) return { ok: false, reason: 'not-signed-in' };

  // Best-effort verified-purchase lookup: did this customer order this product?
  let orderId: string | null = null;
  const { data: orders } = await supa
    .from('orders')
    .select('id, lines')
    .eq('customer_id', user.id)
    .in('status', ['placed', 'packed', 'shipped', 'delivered'])
    .limit(20);
  if (orders) {
    for (const o of orders as { id: string; lines: { productId: string }[] }[]) {
      if (o.lines.some((l) => l.productId === input.productId)) {
        orderId = o.id;
        break;
      }
    }
  }

  // Auto-approve if verified + rating>=4 + body looks clean. Otherwise pending.
  const cleanBody = input.body.toLowerCase();
  const flagged = ['fuck', 'shit', 'spam', 'scam', 'crap'].some((w) => cleanBody.includes(w));
  const autoApprove = !!orderId && input.rating >= 4 && !flagged;
  const status: ReviewStatus = flagged ? 'flagged' : autoApprove ? 'approved' : 'pending';

  const { error } = await supa.from('reviews').insert({
    product_id: input.productId,
    customer_id: user.id,
    order_id: orderId,
    rating: input.rating,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    status,
  });
  if (error) {
    if (error.code === '23505') {
      return { ok: false, reason: "You've already reviewed this product." };
    }
    return { ok: false, reason: error.message };
  }
  return { ok: true, status };
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa.from('reviews').update({ status }).eq('id', id);
  return !error;
}

export async function deleteReview(id: string): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa.from('reviews').delete().eq('id', id);
  return !error;
}

export async function setBrandReply(id: string, reply: string): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa
    .from('reviews')
    .update({ brand_reply: reply || null, brand_replied_at: reply ? new Date().toISOString() : null })
    .eq('id', id);
  return !error;
}

/**
 * Per-product summary: avg rating, count, distribution histogram.
 */
export interface ReviewSummary {
  count: number;
  avg: number;
  histogram: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function computeSummary(reviews: Review[]): ReviewSummary {
  const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary['histogram'];
  if (reviews.length === 0) {
    return { count: 0, avg: 0, histogram };
  }
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    histogram[r.rating]++;
  }
  return {
    count: reviews.length,
    avg: Math.round((sum / reviews.length) * 10) / 10,
    histogram,
  };
}
