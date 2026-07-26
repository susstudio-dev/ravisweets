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
import { getSupabase } from '@/lib/supabase/client';
import { listThemes, type ThemePreset } from '@/lib/supabase/themes';
import { writePalette } from './apply-palette';

interface ActiveThemeValue {
  active: ThemePreset | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<ActiveThemeValue>({
  active: null,
  loading: true,
  refresh: async () => {},
});

/**
 * Pulls the active theme preset from Supabase + reapplies CSS variables on
 * the <html> root so any palette change propagates to every styled element.
 *
 * Wired into <RealtimeThemeBridge> below — that bridge mounts this provider
 * AND subscribes to live updates so admin "Activate Diwali" → storefront
 * theme flip in ~5 seconds without a reload.
 */
export function ActiveThemeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ThemePreset | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const themes = await listThemes();
    const next = themes.find((t) => t.active) ?? null;
    setActive(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Apply the site palette to :root whenever the active theme changes.
  //
  // Goes through writePalette so the semantic --color-* layer follows the
  // preset too. Previously only the four --theme-* vars were written while
  // --color-surface / -elevated / text stayed pinned to the globals.css
  // values, which left 177 + 137 surfaces and 474 borders light on any dark
  // preset.
  useEffect(() => {
    if (!active) return;
    writePalette(document.documentElement, {
      base: active.palette.base,
      accent: active.palette.accent,
      glow: active.palette.glow,
      ink: active.palette.ink,
      grainOpacity:
        typeof active.palette.grainOpacity === 'number' ? active.palette.grainOpacity : 0.05,
    });
  }, [active]);

  const value = useMemo(() => ({ active, loading, refresh }), [active, loading, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveTheme() {
  return useContext(Ctx);
}

/**
 * Hook into Supabase Realtime — when ANY row in `theme_presets` changes,
 * refresh the active theme. Falls back to a 60-second poll for resilience.
 */
export function useThemeRealtime(refresh: () => Promise<void>) {
  useEffect(() => {
    let channelUnsub: (() => void) | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    void (async () => {
      const supa = await getSupabase();
      if (!supa) return;
      const channel = supa
        .channel('theme-presets-watch')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'theme_presets' }, () => {
          void refresh();
        })
        .subscribe();
      channelUnsub = () => {
        void supa.removeChannel(channel);
      };
    })();

    // Belt-and-braces poll in case the WebSocket drops silently.
    pollTimer = setInterval(() => {
      void refresh();
    }, 60_000);

    return () => {
      channelUnsub?.();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [refresh]);
}
