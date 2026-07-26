'use client';

import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ThemePalette } from '@ravisweets/shared';
import { defaultFlavour } from './tokens';
import { applyPalette, writePalette } from './apply-palette';

/**
 * Scopes a palette to a subtree.
 *
 * WHY A WRAPPER AND NOT :root
 * ---------------------------
 * ActiveThemeProvider writes the site palette as INLINE styles on <html>. The
 * old ThemeVars wrote a `:root{...}` stylesheet rule, and an inline style
 * attribute always beats a rule — so the site preset silently overwrote every
 * per-product palette a few hundred ms after first paint. Per-product theming
 * was effectively dead whenever Supabase was configured.
 *
 * Custom properties resolve to the NEAREST declaring ancestor, so declaring
 * them on a wrapper element wins inside that subtree without competing with the
 * root inline write at all. No specificity fight, and it works in SSR — which
 * also removes the need for a separate dangerouslySetInnerHTML <style> tag.
 *
 * This is the same mechanism behind data-register="bidri".
 */
export function FlavourScope({
  palette,
  children,
  className,
}: {
  palette: ThemePalette;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-flavour style={applyPalette(palette) as CSSProperties} className={className}>
      {children}
    </div>
  );
}

/**
 * Client-side palette writer for a subtree that cannot use FlavourScope
 * (a portal, for example). Reverts to the default flavour on unmount.
 */
export function useFlavour(el: HTMLElement | null, palette?: ThemePalette) {
  useEffect(() => {
    if (!el) return;
    writePalette(el, palette ?? defaultFlavour);
    return () => writePalette(el, defaultFlavour);
  }, [el, palette]);
}
