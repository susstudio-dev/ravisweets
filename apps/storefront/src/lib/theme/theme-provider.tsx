'use client';

import { useEffect } from 'react';
import type { ThemePalette } from '@ravisweets/shared';
import { defaultFlavour } from './tokens';

interface ThemeProviderProps {
  palette?: ThemePalette;
}

/**
 * Swaps the :root flavour-theme CSS variables when a palette is active.
 * On unmount, reverts to the default palette.
 *
 * SSR note: for product pages that want zero-flash theming, emit the palette's
 * vars in the server-rendered HTML's <style> using <ThemeVars palette={...} />.
 */
export function ThemeProvider({ palette }: ThemeProviderProps) {
  useEffect(() => {
    const p = palette ?? defaultFlavour;
    const root = document.documentElement;
    root.style.setProperty('--theme-base', p.base);
    root.style.setProperty('--theme-accent', p.accent);
    root.style.setProperty('--theme-glow', p.glow);
    root.style.setProperty('--theme-ink', p.ink);
    root.style.setProperty('--theme-grain-opacity', String(p.grainOpacity));
    return () => {
      const d = defaultFlavour;
      root.style.setProperty('--theme-base', d.base);
      root.style.setProperty('--theme-accent', d.accent);
      root.style.setProperty('--theme-glow', d.glow);
      root.style.setProperty('--theme-ink', d.ink);
      root.style.setProperty('--theme-grain-opacity', String(d.grainOpacity));
    };
  }, [palette]);

  return null;
}

/**
 * Server-renderable <style> that seeds the flavour theme vars on :root.
 * Use in page-level server components (product detail, category) to prevent
 * first-paint theme flash. The client ThemeProvider above keeps the vars
 * in sync across client transitions.
 */
export function ThemeVars({ palette }: { palette: ThemePalette }) {
  const css = `:root{--theme-base:${palette.base};--theme-accent:${palette.accent};--theme-glow:${palette.glow};--theme-ink:${palette.ink};--theme-grain-opacity:${palette.grainOpacity}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
