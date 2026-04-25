'use client';

import { getSupabase } from './client';
import type { Order, OrderStatus } from '@/lib/orders/types';

export interface OrderCommitInput {
  order: Order;
  /** Total discount in paise (sum of all applied coupons). */
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

  const { order, discount, primaryCouponCode, redeemedCouponCodes } = input;

  const { error } = await supa.from('orders').insert({
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
  });

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
