'use client';

import { getSupabase } from './client';

/**
 * Idempotent customer-row create. Orders.customer_id has a FK to
 * public.customers(id), which itself FK's auth.users(id) — so a customers
 * row must exist before the first order can be inserted under RLS.
 *
 * Called on every non-anonymous session change. Anonymous sessions are
 * skipped (auth.users row exists but we don't want a customers row until
 * the user claims an identity).
 */
export async function ensureCustomerProfile(): Promise<void> {
  const supa = await getSupabase();
  if (!supa) return;
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user || user.is_anonymous) return;

  const payload: Record<string, unknown> = { id: user.id };
  if (user.email) payload.email = user.email;
  if (user.phone) payload.phone = user.phone;

  // ON CONFLICT id DO NOTHING — first sign-in creates, subsequent are no-ops.
  // Email/phone updates are managed from /account, not auto-overwritten here.
  await supa.from('customers').upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
}
