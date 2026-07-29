/**
 * Pure colour maths for the theme system — WCAG 2.1 relative luminance,
 * contrast ratio, surface polarity, sRGB mixing and hue distance.
 *
 * DELIBERATELY DEPENDENCY-FREE. This module is imported by `applyPalette`,
 * which runs in the browser on every theme change. `culori` is a dependency of
 * the design tooling, not of the client bundle — the home route has ~4 KB of
 * First Load JS headroom (see .size-limit.json), so nothing here may pull in a
 * library.
 */

type Rgb = readonly [number, number, number];

function parse(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ] as const;
}

function toHex([r, g, b]: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** sRGB channel -> linear light. */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance, 0 (black) .. 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parse(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.1 contrast ratio, 1..21. Symmetric in its arguments. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Whether a surface should be treated as light.
 *
 * Compares contrast against black vs white rather than testing luminance
 * against a magic threshold — this stays correct for the mid-tone bases an
 * admin can type into /admin/themes.
 */
export function isLightSurface(hex: string): boolean {
  return contrastRatio(hex, '#000000') > contrastRatio(hex, '#FFFFFF');
}

/** Linear sRGB interpolation. `t` is the fraction of `b`, clamped to 0..1. */
export function mix(a: string, b: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return toHex([ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k]);
}

/** Hue in degrees, 0..359. Returns 0 for greys. */
export function hue(hex: string): number {
  const [r255, g255, b255] = parse(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return Math.round((h + 360) % 360);
}

/**
 * Space-separated sRGB channels, e.g. "34 30 26".
 *
 * Tailwind can only apply an opacity modifier (`text-theme-ink/60`) to a colour
 * declared as `rgb(var(--x) / <alpha-value>)`, which requires the variable to
 * hold CHANNELS, not a hex string. With hex-valued vars the modifier silently
 * emits no CSS at all — 1003 such usages across this codebase were dead.
 */
export function toChannels(hex: string): string {
  return parse(hex).join(' ');
}

/** Shortest distance between two hues, 0..180 degrees. */
export function hueClearance(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b)) % 360;
  return d > 180 ? 360 - d : d;
}
