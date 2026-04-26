'use client';

import { ActiveThemeProvider, useActiveTheme, useThemeRealtime } from '@/lib/theme/active-theme-context';

/**
 * Wraps the realtime subscription inside the provider. Mount once at the
 * root layout. Renders nothing visible — just keeps the active theme
 * (palette + hero copy) in sync with Supabase.
 *
 * When admin clicks "Activate Diwali" in /admin/themes:
 *   1. Supabase RPC flips active flag on the new preset.
 *   2. Realtime channel `theme-presets-watch` fires UPDATE event.
 *   3. ActiveThemeProvider re-fetches, applies new palette to :root.
 *   4. Every styled element reads the new CSS vars on next paint.
 *
 * SLA: ~1-3 seconds for online customers.
 */
export function RealtimeThemeBridge() {
  return (
    <ActiveThemeProvider>
      <Bridge />
    </ActiveThemeProvider>
  );
}

function Bridge() {
  const { refresh } = useActiveTheme();
  useThemeRealtime(refresh);
  return null;
}
