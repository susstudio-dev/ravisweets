/**
 * Derives every themed CSS custom property from the four authored colours.
 *
 * WHY THIS EXISTS
 * ---------------
 * The old system had two layers with different lifetimes: `--theme-*` was
 * written at runtime by the providers, while the semantic `--color-*` layer was
 * hardcoded in globals.css and never written at all. On any dark palette that
 * left 177 `bg-surface` and 137 `bg-surface-elevated` surfaces cream, and 474
 * borders at rgba(31,24,32,.09) — invisible. It already broke a live product
 * page (p_diwali_premium_hamper) and the seeded midnight-saffron preset.
 *
 * Both layers are now derived here, so they cannot drift apart. `--color-border`
 * is the one exception and stays a `color-mix(... transparent)` rule in
 * globals.css, because an alpha border is polarity-agnostic by construction.
 *
 * Polarity cannot be expressed as a single `color-mix` in CSS — "elevated"
 * means lighter than the ground in both directions, which needs the base's
 * relative luminance. Hence a function rather than a stylesheet.
 */

import { contrastRatio, isLightSurface, mix, toChannels } from './contrast';
import type { FlavourPalette } from './palette';

/**
 * How far an elevated surface moves away from the ground.
 *
 * Tuned so the derivation reproduces the spec's authored values: light
 * #F1F0E2 -> ~#FAF9F0, bidri #17181A -> ~#202225. Dark surfaces need a much
 * smaller delta to read as raised, which is why the two constants differ.
 */
const LIFT_LIGHT = 0.57;
const LIFT_DARK = 0.045;

/** How far muted text moves from ink toward the ground. */
const MUTED_TOWARD_GROUND = 0.3;

/** WCAG AA for body text. Muted text is clamped to stay above this. */
const AA_TEXT = 4.5;

export const THEME_VAR_NAMES = [
  '--theme-base',
  '--theme-accent',
  '--theme-glow',
  '--theme-ink',
  '--theme-grain-opacity',
  '--color-surface',
  '--color-surface-elevated',
  '--color-text-primary',
  '--color-text-muted',
  '--color-accent',
  '--color-ring',
  // Channel-valued twins. Tailwind needs `rgb(var(--x) / <alpha-value>)` to
  // support opacity modifiers; a hex-valued var silently emits nothing.
  '--theme-base-rgb',
  '--theme-accent-rgb',
  '--theme-glow-rgb',
  '--theme-ink-rgb',
  '--color-surface-rgb',
  '--color-surface-elevated-rgb',
  '--color-text-primary-rgb',
  '--color-text-muted-rgb',
  '--color-accent-rgb',
] as const;

/**
 * The exact set of custom properties `applyPalette` sets.
 *
 * Naming the keys (rather than returning Record<string, string>) matters under
 * `noUncheckedIndexedAccess`: callers get `string` from a known key instead of
 * `string | undefined`, so neither tests nor consumers need a non-null assertion.
 */
export type ThemeVarName = (typeof THEME_VAR_NAMES)[number];

export type ThemeVars = Record<ThemeVarName, string>;

/**
 * Muted text, pulled toward the ground for hierarchy but never past AA.
 *
 * A fixed mix ratio is not safe for arbitrary admin-authored palettes: on a
 * mid-tone base, 30% toward the ground can drop below 4.5:1. Walk back toward
 * the ink until it passes.
 */
function deriveMuted(ink: string, ground: string): string {
  for (let t = MUTED_TOWARD_GROUND; t > 0; t -= 0.05) {
    const candidate = mix(ink, ground, t);
    if (contrastRatio(candidate, ground) >= AA_TEXT) return candidate;
  }
  return ink;
}

/**
 * Primary text, guaranteed legible on the ground it sits on.
 *
 * `--theme-ink` keeps the authored brand ink. `--color-text-primary` is the
 * SAFE variant: if the admin authors a base/ink pair that fails AA together
 * (a mid-tone grey base with near-black ink lands at 4.47:1, for example),
 * push the text away from the ground until it passes. Legibility is not
 * something an admin should be able to switch off from a colour picker.
 */
function deriveTextPrimary(ink: string, ground: string): string {
  if (contrastRatio(ink, ground) >= AA_TEXT) return ink;
  // Move further from the ground, in whichever direction already has headroom.
  const away = isLightSurface(ground) ? '#000000' : '#FFFFFF';
  for (let t = 0.05; t <= 1; t += 0.05) {
    const candidate = mix(ink, away, t);
    if (contrastRatio(candidate, ground) >= AA_TEXT) return candidate;
  }
  return away;
}

/**
 * Elevated surface, lifted away from the ground but never so far that primary
 * text stops passing AA on it.
 *
 * The clamp is not hypothetical: a mid-tone base like #7A7A7A lifted the full
 * 57% toward white puts ink at 4.47:1 — just under the floor. Admins can type
 * any base into /admin/themes, so the ratio is enforced rather than assumed.
 */
function deriveElevated(base: string, ink: string, light: boolean): string {
  const target = light ? LIFT_LIGHT : LIFT_DARK;
  const lift = light ? '#FFFFFF' : ink;
  for (let t = target; t > 0; t -= 0.02) {
    const candidate = mix(base, lift, t);
    if (contrastRatio(ink, candidate) >= AA_TEXT) return candidate;
  }
  return base;
}

export function applyPalette(p: FlavourPalette): ThemeVars {
  const light = isLightSurface(p.base);

  // The direction "up" is toward white on a light ground and toward the ink
  // (which is itself light) on a dark ground. Either way the result is a
  // surface that reads as raised — clamped so text stays legible on it.
  const textPrimary = deriveTextPrimary(p.ink, p.base);
  const surfaceElevated = deriveElevated(p.base, textPrimary, light);
  const muted = deriveMuted(textPrimary, p.base);

  return {
    '--theme-base': p.base,
    '--theme-accent': p.accent,
    '--theme-glow': p.glow,
    '--theme-ink': p.ink,
    '--theme-grain-opacity': String(p.grainOpacity),
    '--color-surface': p.base,
    '--color-surface-elevated': surfaceElevated,
    '--color-text-primary': textPrimary,
    '--color-text-muted': muted,
    '--color-accent': p.accent,
    '--color-ring': p.accent,
    '--theme-base-rgb': toChannels(p.base),
    '--theme-accent-rgb': toChannels(p.accent),
    '--theme-glow-rgb': toChannels(p.glow),
    '--theme-ink-rgb': toChannels(p.ink),
    '--color-surface-rgb': toChannels(p.base),
    '--color-surface-elevated-rgb': toChannels(surfaceElevated),
    '--color-text-primary-rgb': toChannels(textPrimary),
    '--color-text-muted-rgb': toChannels(muted),
    '--color-accent-rgb': toChannels(p.accent),
  };
}

/** Serialise for an SSR `<style>` body or an inline `style` attribute. */
export function paletteToCss(p: FlavourPalette): string {
  return Object.entries(applyPalette(p))
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/** Imperative writer for the client providers. */
export function writePalette(el: HTMLElement, p: FlavourPalette): void {
  const vars = applyPalette(p);
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }
}
