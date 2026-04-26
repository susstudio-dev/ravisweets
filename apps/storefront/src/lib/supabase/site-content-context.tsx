'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { loadAllSiteContent } from './site-content';
import type {
  EditorialBandHeading,
  FooterContent,
  HeroContent,
  HomeTrust,
  SignatureMomentContent,
} from './site-content';

interface SiteContentValue {
  hero: HeroContent | null;
  signatureMoment: SignatureMomentContent | null;
  editorialBandHeading: EditorialBandHeading | null;
  footer: FooterContent | null;
  homeTrust: HomeTrust | null;
  loading: boolean;
}

const Ctx = createContext<SiteContentValue>({
  hero: null,
  signatureMoment: null,
  editorialBandHeading: null,
  footer: null,
  homeTrust: null,
  loading: true,
});

/**
 * Loads all site_content rows on mount + subscribes to changes.
 * Storefront sections call useSiteContent() to render admin-edited copy
 * with the bundled defaults as fallback.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteContentValue>({
    hero: null,
    signatureMoment: null,
    editorialBandHeading: null,
    footer: null,
    homeTrust: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const all = await loadAllSiteContent();
      if (cancelled) return;
      setState({
        hero: all.hero ?? null,
        signatureMoment: all.signature_moment ?? null,
        editorialBandHeading: all.editorial_band_heading ?? null,
        footer: all.footer ?? null,
        homeTrust: all.home_trust ?? null,
        loading: false,
      });
    }
    void refresh();

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
        .subscribe();
      unsub = () => {
        void supa.removeChannel(channel);
      };
    })();

    const poll = setInterval(() => void refresh(), 60_000);

    return () => {
      cancelled = true;
      unsub?.();
      clearInterval(poll);
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteContent() {
  return useContext(Ctx);
}
