'use client';

import { getSupabase } from './client';
import { ensureCustomerProfile } from './customers';
import type { Order, OrderStatus } from '@/lib/orders/types';

export interface OrderCommitInput {
  order: Order;
  /** Total discount in rupees (sum of all applied coupons). */
  discount: number;
  /** Primary coupon code attached to the order row (display + admin filter). */
  primaryCouponCode: string | null;
  /** Codes to write into coupon_redemptions (one row per code). */
  redeemedCouponCodes: string[];
}

/**
 * Order row shape in Supabase. Mirrors the columns in
 * supabase/migrations/0001_init.sql `orders` table. Convert to/from the
 * client-side `Order` shape via `fromRow` / `toInsert`.
 */
interface OrderRow {
  id: string;
  number: string;
  customer_id: string | null;
  status: OrderStatus;
  address_snapshot: Order['address'];
  payment: Order['payment'];
  lines: Order['lines'];
  subtotal: number;
  shipping: number;
  discount: number;
  /** [{label, amount}] in integer rupees; null on pre-charges orders. */
  fees: { label: string; amount: number }[] | null;
  total: number;
  currency: string;
  coupon_code: string | null;
  placed_at: string;
}

function fromRow(r: OrderRow): Order {
  return {
    id: r.id,
    number: r.number,
    placedAt: new Date(r.placed_at).getTime(),
    status: r.status,
    address: r.address_snapshot,
    payment: r.payment,
    lines: r.lines,
    subtotal: { amount: r.subtotal, currency: r.currency as 'INR' },
    shipping: { amount: r.shipping, currency: r.currency as 'INR' },
    discount: { amount: r.discount, currency: r.currency as 'INR' },
    ...(Array.isArray(r.fees) && r.fees.length > 0
      ? {
          fees: r.fees.map((f) => ({
            label: f.label,
            amount: { amount: f.amount, currency: r.currency as 'INR' },
          })),
        }
      : {}),
    total: { amount: r.total, currency: r.currency as 'INR' },
  };
}

export async function commitOrderToSupabase(
  input: OrderCommitInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };

  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, reason: 'no-session' };
  if (user.is_anonymous) return { ok: false, reason: 'anonymous-session' };

  /*
   * THE CUSTOMERS ROW IS A PRECONDITION, NOT A RACE.
   *
   * orders.customer_id FKs public.customers(id) (0001_init.sql:165) and NOTHING
   * in the database creates that row — there is no trigger on auth.users. The
   * only writer is ensureCustomerProfile, which SupabaseProvider fires as an
   * unawaited effect on identity change. So on a buyer's FIRST order the insert
   * below can reach Postgres before the upsert does, and it fails 23503.
   *
   * That used to be masked by accident: checkout resumed the interrupted order
   * through a setTimeout whose stale closure bounced the buyer back to the
   * sign-in modal instead of inserting, which bought the upsert seconds. Fixing
   * that closure (2026-08-11) removed the accident and exposed the race, so the
   * invariant customers.ts has always documented is now actually enforced here.
   *
   * Idempotent (upsert onConflict id, ignoreDuplicates), so the returning-
   * customer path pays one cheap no-op call for a guarantee on the first-order
   * path — where getting it wrong loses a real sale silently.
   */
  await ensureCustomerProfile();

  const { order, discount, primaryCouponCode, redeemedCouponCodes } = input;

  const baseRow = {
    id: order.id,
    number: order.number,
    customer_id: user.id,
    status: order.status,
    address_snapshot: order.address,
    payment: order.payment,
    lines: order.lines,
    subtotal: order.subtotal.amount,
    shipping: order.shipping.amount,
    discount,
    total: order.total.amount,
    currency: order.total.currency,
    coupon_code: primaryCouponCode,
  };
  const feeRows = order.fees?.map((f) => ({ label: f.label, amount: f.amount.amount })) ?? [];

  let { error } = await supa
    .from('orders')
    .insert(feeRows.length > 0 ? { ...baseRow, fees: feeRows } : baseRow);

  // Migration-order tolerance: if 0018 hasn't been applied yet, PostgREST
  // rejects the unknown `fees` column. The order must still commit — the fee
  // is already inside `total`, only the itemisation is lost.
  // PGRST204 = column missing from PostgREST's schema cache; 42703 = Postgres
  // undefined column. The message test is a belt-and-braces fallback.
  if (
    error &&
    feeRows.length > 0 &&
    (error.code === 'PGRST204' || error.code === '42703' || /fees/i.test(error.message))
  ) {
    console.warn('orders.fees column missing (apply 0018) — committing without itemised fees');
    ({ error } = await supa.from('orders').insert(baseRow));
  }

  /*
   * Belt and braces on the FK above. 23503 here can only mean the customers
   * row still is not visible to this insert; re-run the upsert (awaited, so a
   * transient failure surfaces) and try once more. One retry, never a loop —
   * if it fails twice the cause is not timing and the caller must be told.
   */
  if (error?.code === '23503') {
    await ensureCustomerProfile();
    ({ error } = await supa
      .from('orders')
      .insert(feeRows.length > 0 ? { ...baseRow, fees: feeRows } : baseRow));
  }

  if (error) return { ok: false, reason: error.message };

  // Best-effort redemption rows. Failure here does not roll back the order —
  // the redemption table is for analytics + per-user-limit enforcement, and
  // the order has already committed under the customer's RLS-scoped insert.
  if (redeemedCouponCodes.length > 0) {
    const rows = redeemedCouponCodes.map((code) => ({
      customer_id: user.id,
      coupon_code: code,
      order_id: order.id,
      // We don't have per-coupon discount split here — record the total against
      // the primary code only. Spec calls for per-row split once stackability
      // arithmetic moves server-side in the commit_order_with_coupon RPC.
      discount_amount: code === primaryCouponCode ? discount : 0,
    }));
    const { error: redemptionError } = await supa.from('coupon_redemptions').insert(rows);
    if (redemptionError) {

      console.warn('coupon_redemptions insert failed:', redemptionError.message);
    }
  }

  return { ok: true };
}

export async function listMyOrders(): Promise<Order[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false });
  if (error || !data) return [];
  return (data as OrderRow[]).map(fromRow);
}

export async function listAllOrders(): Promise<Order[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return (data as OrderRow[]).map(fromRow);
}

export async function transitionOrderStatus(id: string, next: OrderStatus): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const stamp =
    next === 'packed'
      ? { packed_at: new Date().toISOString() }
      : next === 'shipped'
      ? { shipped_at: new Date().toISOString() }
      : next === 'delivered'
      ? { delivered_at: new Date().toISOString() }
      : next === 'cancelled'
      ? { cancelled_at: new Date().toISOString() }
      : {};
  const { error } = await supa
    .from('orders')
    .update({ status: next, ...stamp })
    .eq('id', id);
  return !error;
}

/**
 * Fire-and-forget transactional email via the `send-order-email` Edge
 * Function. The function is gated behind RESEND_API_KEY in Supabase
 * secrets — when not configured, this silently no-ops so the order
 * commit isn't blocked by missing email infra.
 */
export async function sendOrderEmail(
  orderId: string,
  kind: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled',
  trackingUrl?: string,
): Promise<void> {
  const supa = await getSupabase();
  if (!supa) return;
  try {
    await supa.functions.invoke('send-order-email', {
      body: { orderId, kind, trackingUrl },
    });
  } catch {
    // Non-fatal: the function may not be deployed yet, or RESEND_API_KEY
    // may not be set. The order commit itself succeeded — the email is a
    // best-effort side-effect.
  }
}

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  before: unknown,
  after: unknown,
): Promise<void> {
  const supa = await getSupabase();
  if (!supa) return;
  const { data: { user } } = await supa.auth.getUser();
  await supa.from('audit_log').insert({
    admin_user_id: user?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before_data: before ?? null,
    after_data: after ?? null,
  });
}
