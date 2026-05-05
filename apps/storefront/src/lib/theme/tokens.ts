/**
 * Ravi Sweets design tokens — single source of truth.
 * Projected to (a) Tailwind config, (b) CSS custom properties on :root, (c) TS exports.
 * No component may hard-code colours, spacing, radii, or shadows outside this file.
 */

export const rawPalette = {
  // Brand scale — re-tuned 2026-05-04 to a "brass & ghee" identity. The
  // previous scale leaned bright/orange-rust which read more fast-food than
  // 1985 heritage mithai. New scale is anchored on warm ghee cream + deep
  // antique brass + saffron-gold leaf, with cocoa as the deepest stop.
  brand: {
    50: '#fbf3df',  // ghee cream (slightly warmer than the prior cold #fdf6ec)
    100: '#f4e4ba', // pale brass
    200: '#e9c97e', // pale gold
    300: '#dba63d', // gold-leaf — the "saffron lift" surface
    400: '#bc841a', // antique brass
    500: '#8a5a0e', // deep brass — primary accent
    600: '#634008', // old gold
    700: '#472d06', // burnt amber
    800: '#2e1c04', // cocoa
    900: '#1f1002', // deep cocoa — primary ink
  },
  // Saffron now reads as antique-gold + deep-brass instead of peach + rust.
  saffron: { DEFAULT: '#e9b249', dark: '#a8501f' },
  // 2026-05-06: pista-rose tokens added so themed components can reach for
  // the new accent + glow without going through the per-route palette.
  rose: { DEFAULT: '#a8345d', soft: '#d8a48c' },
  pista: { DEFAULT: '#c9d99c', deep: '#88a25c' },
  cream: '#f4efde',
  ink: '#1f1820',
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  semantic: {
    success: '#2f7a3c',
    warn: '#c08a2a',
    danger: '#b3361f',
  },
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  pill: '9999px',
  circle: '50%',
} as const;

export const elevation = {
  flat: 'none',
  soft: '0 1px 2px rgba(28, 20, 16, 0.04), 0 2px 8px rgba(28, 20, 16, 0.06)',
  lifted:
    '0 2px 4px rgba(28, 20, 16, 0.06), 0 8px 24px rgba(28, 20, 16, 0.10), 0 1px 0 rgba(255, 255, 255, 0.6) inset',
} as const;

export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    quick: 200,
    base: 300,
    slow: 450,
    cinematic: 650,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasised: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
} as const;

export const grain = {
  opacityDefault: 0.05,
  opacityMax: 0.08,
} as const;

/**
 * Flavour-theme default — consumed when no per-product palette is active.
 * Products override these four vars on :root via ThemeProvider.
 */
export const defaultFlavour = {
  base: rawPalette.cream,
  accent: rawPalette.rose.DEFAULT,
  glow: rawPalette.pista.DEFAULT,
  ink: rawPalette.ink,
  grainOpacity: grain.opacityDefault,
} as const;

export type FlavourPalette = {
  base: string;
  accent: string;
  glow: string;
  ink: string;
  grainOpacity: number;
};
