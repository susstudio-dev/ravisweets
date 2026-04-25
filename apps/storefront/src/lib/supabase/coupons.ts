'use client';

import { getSupabase } from './client';
import type { Coupon, CouponConstraints, CouponTarget, CouponType } from '@/lib/coupons/types';

interface CouponRow {
  code: string;
  type: CouponType;
  value: number;
  max_discount_cap: number | null;
  target_scope: CouponTarget;
  target_ids: string[] | null;
  constraints: CouponConstraints | null;
  valid_from: string;
  valid_to: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  stackable: boolean;
  priority: number;
  active: boolean;
}

function fromRow(r: CouponRow): Coupon {
  return {
    code: r.code,
    type: r.type,
    value: r.value,
    maxDiscountCap: r.max_discount_cap ?? undefined,
    targetScope: r.target_scope,
    targetIds: r.target_ids ?? undefined,
    constraints: r.constraints ?? {},
    validFrom: r.valid_from,
    validTo: r.valid_to ?? undefined,
    usageLimit: r.usage_limit ?? undefined,
    perUserLimit: r.per_user_limit ?? undefined,
    stackable: r.stackable,
    priority: r.priority,
    active: r.active,
  };
}

function toRow(c: Coupon): CouponRow {
  return {
    code: c.code.toUpperCase(),
    type: c.type,
    value: c.value,
    max_discount_cap: c.maxDiscountCap ?? null,
    target_scope: c.targetScope,
    target_ids: c.targetIds ?? null,
    constraints: c.constraints,
    valid_from: c.validFrom,
    valid_to: c.validTo ?? null,
    usage_limit: c.usageLimit ?? null,
    per_user_limit: c.perUserLimit ?? null,
    stackable: c.stackable,
    priority: c.priority,
    active: c.active,
  };
}

export async function listCoupons(): Promise<Coupon[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('coupons')
    .select('*')
    .order('priority', { ascending: false });
  if (error || !data) return [];
  return (data as CouponRow[]).map(fromRow);
}

export async function upsertCoupon(c: Coupon): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('coupons').upsert(toRow(c));
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function setCouponActive(code: string, active: boolean): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa.from('coupons').update({ active }).eq('code', code.toUpperCase());
  return !error;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const supa = await getSupabase();
  if (!supa) return false;
  const { error } = await supa.from('coupons').delete().eq('code', code.toUpperCase());
  return !error;
}
