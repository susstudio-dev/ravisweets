'use client';

import { getSupabase } from './client';

export type StoreLocation = 'khammam-flagship' | 'khammam-second' | 'kondapur';

export const STORE_LOCATIONS: { id: StoreLocation; label: string }[] = [
  { id: 'khammam-flagship', label: 'Khammam Flagship' },
  { id: 'khammam-second', label: 'Khammam — Second branch' },
  { id: 'kondapur', label: 'Kondapur (Hyderabad)' },
];

export interface VariantLocationStock {
  variant_id: string;
  location: StoreLocation;
  on_hand: number;
  reorder_at: number;
  updated_at: string;
}

export type StockAdjustmentReason =
  | 'sale'
  | 'return'
  | 'transfer-in'
  | 'transfer-out'
  | 'damaged'
  | 'expired'
  | 'restock'
  | 'audit-correction';

export async function listLocationStock(): Promise<VariantLocationStock[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa.from('variant_location_stock').select('*');
  if (error || !data) return [];
  return data as VariantLocationStock[];
}

export async function adjustStock(input: {
  variant_id: string;
  location: StoreLocation;
  delta: number;
  reason: StockAdjustmentReason;
  notes?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  // Insert an adjustment row (immutable ledger).
  const { error: insErr } = await supa.from('stock_adjustments').insert({
    variant_id: input.variant_id,
    location: input.location,
    delta: input.delta,
    reason: input.reason,
    notes: input.notes ?? null,
    actor_id: user?.id ?? null,
  });
  if (insErr) return { ok: false, reason: insErr.message };

  // Upsert the running total. RPC would be cleaner but for now we read-mod-write.
  const { data: existing } = await supa
    .from('variant_location_stock')
    .select('on_hand')
    .eq('variant_id', input.variant_id)
    .eq('location', input.location)
    .maybeSingle();
  const next = Math.max(0, (existing?.on_hand ?? 0) + input.delta);
  const { error: upErr } = await supa.from('variant_location_stock').upsert({
    variant_id: input.variant_id,
    location: input.location,
    on_hand: next,
    updated_at: new Date().toISOString(),
  });
  if (upErr) return { ok: false, reason: upErr.message };
  return { ok: true };
}

export interface ProductBatch {
  id: string;
  variant_id: string;
  lot_number: string;
  made_on: string;
  expires_on: string;
  quantity: number;
  consumed: number;
  location: StoreLocation;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listBatches(): Promise<ProductBatch[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('product_batches')
    .select('*')
    .order('expires_on', { ascending: true });
  if (error || !data) return [];
  return data as ProductBatch[];
}

export async function createBatch(input: {
  variant_id: string;
  lot_number: string;
  made_on: string;
  expires_on: string;
  quantity: number;
  location: StoreLocation;
  notes?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('product_batches').insert({
    variant_id: input.variant_id,
    lot_number: input.lot_number,
    made_on: input.made_on,
    expires_on: input.expires_on,
    quantity: input.quantity,
    location: input.location,
    notes: input.notes ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
