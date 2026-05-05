'use client';

import { getSupabase } from './client';

/**
 * site_content keys — one row per editable surface. Shapes are
 * loosely typed via the per-key interfaces below.
 */
export type SiteContentKey =
  | 'hero'
  | 'signature_moment'
  | 'editorial_band_heading'
  | 'footer'
  | 'home_trust'
  | 'active_festival';

/**
 * "Active festival" — admin-set in /admin/festivals. When `slug` is set
 * the storefront overlays the festival's theme + banner + curates a
 * featured-products list under the festival hero. `auto_apply_theme`
 * toggles whether the route applies the festival's palette globally vs
 * keeping the default base.
 */
export interface ActiveFestival {
  slug: string | null;
  banner_text: string | null;
  ends_at: string | null;
  curated_product_ids: string[];
  auto_apply_theme: boolean;
}

export interface HeroContent {
  eyebrowIndic?: string;
  eyebrowEn?: string;
  headline?: string;
  body?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface SignatureMomentContent {
  eyebrow?: string;
  headline?: string;
  body?: string;
  imageUrl?: string;
}

export interface EditorialBandHeading {
  eyebrow?: string;
  headline?: string;
}

export interface FooterContent {
  tagline?: string;
  fssaiLine?: string;
  phone?: string;
  email?: string;
}

export interface TrustCard {
  title: string;
  body: string;
}

export interface HomeTrust {
  cards: TrustCard[];
}

type ContentByKey = {
  hero: HeroContent;
  signature_moment: SignatureMomentContent;
  editorial_band_heading: EditorialBandHeading;
  footer: FooterContent;
  home_trust: HomeTrust;
  active_festival: ActiveFestival;
};

export async function loadSiteContent<K extends SiteContentKey>(
  key: K,
): Promise<ContentByKey[K] | null> {
  const supa = await getSupabase();
  if (!supa) return null;
  const { data, error } = await supa
    .from('site_content')
    .select('data')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return null;
  return data.data as ContentByKey[K];
}

export async function loadAllSiteContent(): Promise<Partial<ContentByKey>> {
  const supa = await getSupabase();
  if (!supa) return {};
  const { data, error } = await supa.from('site_content').select('*');
  if (error || !data) return {};
  const out: Partial<ContentByKey> = {};
  for (const row of data as { key: SiteContentKey; data: unknown }[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (out as any)[row.key] = row.data;
  }
  return out;
}

export async function saveSiteContent<K extends SiteContentKey>(
  key: K,
  data: ContentByKey[K],
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa
    .from('site_content')
    .upsert({ key, data, updated_by: user?.id ?? null });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
