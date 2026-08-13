'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductImage } from '@ravisweets/shared';
import { getSupabase } from '@/lib/supabase/client';
import {
  EMPTY_PAGE_MEDIA,
  getSlot,
  parsePageMedia,
  type PageMedia,
  type SlotPath,
} from '@/lib/content/page-media';
import { listMediaAssets, type MediaAsset } from '@/lib/media/assets';
import { mediaPublicUrl } from '@/lib/media/public-url';
import { EMPTY_FESTIVAL_DATES, parseFestivalDates } from '@/lib/festivals/festival-dates';
import type { FestivalDates } from '@/lib/festivals/festival-dates';
import { DEFAULT_CHARGES, loadAllSiteContent, parseCharges } from './site-content';
import type {
  AboutFounder,
  ActiveFestival,
  EditorialBandHeading,
  FooterContent,
  HeroContent,
  HomeTrust,
  SignatureMomentContent,
  StoreCharges,
} from './site-content';

interface SiteContentValue {
  hero: HeroContent | null;
  /** The grandfather section on /about — null until the owner fills it in. */
  aboutFounder: AboutFounder | null;
  signatureMoment: SignatureMomentContent | null;
  editorialBandHeading: EditorialBandHeading | null;
  footer: FooterContent | null;
  homeTrust: HomeTrust | null;
  activeFestival: ActiveFestival | null;
  /** Owner-set order-by dates — parsed (never raw), empty until loaded. */
  festivalDates: FestivalDates;
  /** Order-level charges — parsed (never raw), DEFAULT_CHARGES until loaded. */
  charges: StoreCharges;
  /** Owner-assigned page photo slots — parsed (never raw) page_media row. */
  pageMedia: PageMedia;
  /** media_assets registry, newest first. Empty when Supabase is unconfigured. */
  mediaAssets: MediaAsset[];
  /** products.images overlay keyed by product id — only rows with photos. */
  productImages: Record<string, ProductImage[]>;
  refreshMediaAssets: () => void;
  loading: boolean;
}

const Ctx = createContext<SiteContentValue>({
  hero: null,
  aboutFounder: null,
  signatureMoment: null,
  editorialBandHeading: null,
  footer: null,
  homeTrust: null,
  activeFestival: null,
  festivalDates: EMPTY_FESTIVAL_DATES,
  charges: DEFAULT_CHARGES,
  pageMedia: EMPTY_PAGE_MEDIA,
  mediaAssets: [],
  productImages: {},
  refreshMediaAssets: () => {},
  loading: true,
});

type ContentState = Omit<
  SiteContentValue,
  'mediaAssets' | 'productImages' | 'refreshMediaAssets'
>;

/**
 * Loads all site_content rows on mount + subscribes to changes.
 * Storefront sections call useSiteContent() to render admin-edited copy
 * with the bundled defaults as fallback.
 *
 * Also carries the media overlay (spec §6.4): the parsed `page_media` row,
 * the media_assets registry, and a products.images overlay — all refreshed
 * by Realtime + the same 60s poll, so a photo swapped in /admin reaches
 * live browsers in seconds with no rebuild. Everything degrades to empty
 * defaults when Supabase is unconfigured (SSR and plain static builds).
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({
    hero: null,
    aboutFounder: null,
    signatureMoment: null,
    editorialBandHeading: null,
    footer: null,
    homeTrust: null,
    activeFestival: null,
    festivalDates: EMPTY_FESTIVAL_DATES,
    charges: DEFAULT_CHARGES,
    pageMedia: EMPTY_PAGE_MEDIA,
    loading: true,
  });
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});

  /** Stable refetch for admin surfaces (e.g. after an upload). */
  const refreshMediaAssets = useCallback(() => {
    void listMediaAssets().then(setMediaAssets);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const all = await loadAllSiteContent();
      if (cancelled) return;
      setState({
        hero: all.hero ?? null,
        aboutFounder: all.about_founder ?? null,
        signatureMoment: all.signature_moment ?? null,
        editorialBandHeading: all.editorial_band_heading ?? null,
        footer: all.footer ?? null,
        homeTrust: all.home_trust ?? null,
        activeFestival: all.active_festival ?? null,
        // Re-parsed on every refetch — the raw row is never trusted.
        charges: parseCharges(all.charges),
        festivalDates: parseFestivalDates(all.festival_dates),
        pageMedia: parsePageMedia(all.page_media),
        loading: false,
      });
    }
    async function refreshAssets() {
      const assets = await listMediaAssets();
      if (cancelled) return;
      setMediaAssets(assets);
    }
    async function refreshProductImages() {
      const supa = await getSupabase();
      if (!supa) return;
      const { data, error } = await supa
        .from('products')
        .select('id, images')
        .eq('archived', false);
      if (cancelled || error || !data) return;
      const overlay: Record<string, ProductImage[]> = {};
      for (const row of data as { id: string; images: unknown }[]) {
        if (Array.isArray(row.images) && row.images.length > 0) {
          overlay[row.id] = row.images as ProductImage[];
        }
      }
      setProductImages(overlay);
    }
    function refreshAll() {
      void refresh();
      void refreshAssets();
      void refreshProductImages();
    }
    refreshAll();

    let unsub: (() => void) | null = null;
    void (async () => {
      const supa = await getSupabase();
      if (!supa) return;
      const channel = supa
        .channel('site-content-watch')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_content' },
          () => void refresh(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'media_assets' },
          () => void refreshAssets(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => void refreshProductImages(),
        )
        .subscribe();
      unsub = () => {
        void supa.removeChannel(channel);
      };
    })();

    const poll = setInterval(refreshAll, 60_000);

    return () => {
      cancelled = true;
      unsub?.();
      clearInterval(poll);
    };
  }, []);

  const value = useMemo(
    () => ({ ...state, mediaAssets, productImages, refreshMediaAssets }),
    [state, mediaAssets, productImages, refreshMediaAssets],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteContent() {
  return useContext(Ctx);
}

/** A page slot resolved through the media_assets registry to a renderable URL. */
export interface ResolvedSlotImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

/**
 * Resolve a page photo slot: slot ref → registry asset → public URL.
 * Null when the slot is unset, the asset is gone, or Supabase env is absent
 * — callers fall back to their bundled default.
 */
export function usePageMediaImage(slot: SlotPath): ResolvedSlotImage | null {
  const { pageMedia, mediaAssets } = useContext(Ctx);
  return useMemo(() => {
    const ref = getSlot(pageMedia, slot);
    if (!ref) return null;
    const asset = mediaAssets.find((a) => a.id === ref.assetId);
    if (!asset) return null;
    const url = mediaPublicUrl(asset.storage_path);
    if (!url) return null;
    return {
      url,
      alt: ref.alt || asset.alt,
      width: asset.width,
      height: asset.height,
    };
  }, [pageMedia, mediaAssets, slot]);
}

/** The media library, with an id index and a manual refetch for admin flows. */
export function useMediaAssets(): {
  assets: MediaAsset[];
  byId: Map<string, MediaAsset>;
  refresh: () => void;
} {
  const { mediaAssets, refreshMediaAssets } = useContext(Ctx);
  const byId = useMemo(
    () => new Map(mediaAssets.map((a) => [a.id, a] as const)),
    [mediaAssets],
  );
  return useMemo(
    () => ({ assets: mediaAssets, byId, refresh: refreshMediaAssets }),
    [mediaAssets, byId, refreshMediaAssets],
  );
}

/**
 * DB-edited images for a product, or null when there's no overlay row —
 * callers keep the static catalogue images in that case.
 */
export function useProductImagesOverride(productId: string): ProductImage[] | null {
  const { productImages } = useContext(Ctx);
  return productImages[productId] ?? null;
}
