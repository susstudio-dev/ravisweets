'use client';

import { getSupabase } from './client';

export interface StoreHourEntry {
  days: string;
  time: string;
}
export interface DeliveryZoneEntry {
  label: string;
  pincodes: string;
  leadDays: number;
}

export interface StoreSettings {
  storeHours: StoreHourEntry[];
  deliveryZones: DeliveryZoneEntry[];
  ownerProfile: {
    contactName?: string;
    phone?: string;
    email?: string;
    fssaiNumber?: string;
    gstinNumber?: string;
  };
  filterTaxonomy: Record<string, string[]>;
}

const DEFAULTS: StoreSettings = {
  storeHours: [
    { days: 'Mon — Sat', time: '9:00 am — 9:30 pm' },
    { days: 'Sunday', time: '10:00 am — 9:00 pm' },
  ],
  deliveryZones: [
    { label: 'Khammam + Hyderabad', pincodes: '500*, 507*', leadDays: 1 },
    { label: 'Telangana + Andhra', pincodes: '5*', leadDays: 2 },
    { label: 'Rest of India', pincodes: 'All Indian pincodes', leadDays: 5 },
  ],
  ownerProfile: {},
  filterTaxonomy: {
    Occasion: ['Diwali', 'Wedding', 'Corporate', 'Eid', 'Raksha Bandhan'],
    Dietary: ['Eggless', 'Sugar-free', 'Vegan', 'Nuts'],
  },
};

export async function loadSettings(): Promise<StoreSettings> {
  const supa = await getSupabase();
  if (!supa) return DEFAULTS;
  const { data, error } = await supa
    .from('store_settings')
    .select('*')
    .eq('id', 'singleton')
    .maybeSingle();
  if (error || !data) return DEFAULTS;
  return {
    storeHours: data.store_hours ?? DEFAULTS.storeHours,
    deliveryZones: data.delivery_zones ?? DEFAULTS.deliveryZones,
    ownerProfile: data.owner_profile ?? {},
    filterTaxonomy: data.filter_taxonomy ?? DEFAULTS.filterTaxonomy,
  };
}

export async function saveSettings(s: StoreSettings): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { error } = await supa.from('store_settings').upsert({
    id: 'singleton',
    store_hours: s.storeHours,
    delivery_zones: s.deliveryZones,
    owner_profile: s.ownerProfile,
    filter_taxonomy: s.filterTaxonomy,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
