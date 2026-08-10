import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hueClearance } from './contrast';
import { BRAND_RED, CARBON_TOKENS, DOCKET, EMBER } from './palette';

/**
 * GUARDS THE STYLESHEET, NOT THE MODULE.
 *
 * This file exists because of a real failure. The dark register's accent was
 * changed from a near-ember orange to the inverted stamp in `palette.ts`, the
 * hue-clearance assertion in `palette.test.ts` went green, and **nothing
 * changed in the browser** — because `[data-register='carbon']` in globals.css
 * still declared `--theme-accent: #f2732f`, and a descendant-scoped custom
 * property beats anything `applyPalette()` writes to `:root`.
 *
 * A test asserting against a module the carbon subtree never reads is worse
 * than no test: the next person trusts it. So these assertions parse the CSS.
 *
 * `:root` is genuinely first-paint-only (applyPalette overwrites it at
 * runtime), but it must still agree with the module or the pre-hydration
 * frame paints the wrong brand.
 */

const CSS = readFileSync(join(__dirname, '../../app/globals.css'), 'utf8');

/** Pull a custom property's value out of a named block. */
function declared(blockSelector: string, prop: string): string {
  const start = CSS.indexOf(blockSelector);
  if (start === -1) throw new Error(`block not found: ${blockSelector}`);
  const open = CSS.indexOf('{', start);
  const end = CSS.indexOf('\n  }', open);
  const block = CSS.slice(open, end);
  const m = new RegExp(`${prop}\\s*:\\s*([^;]+);`).exec(block);
  if (!m) throw new Error(`${prop} not declared in ${blockSelector}`);
  return m[1]!.trim().toLowerCase();
}

function channels(hex: string): string {
  return (hex.replace('#', '').match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)).join(' ');
}

describe('globals.css :root agrees with DOCKET', () => {
  it.each([
    ['--theme-base', DOCKET.base],
    ['--theme-accent', DOCKET.accent],
    ['--theme-glow', DOCKET.field],
    ['--theme-ink', DOCKET.ink],
    ['--color-accent', DOCKET.accent],
    ['--color-ring', DOCKET.accent],
    ['--color-surface-elevated', DOCKET.surfaceElevated],
    ['--color-text-muted', DOCKET.inkMuted],
  ])('%s matches the token', (prop, token) => {
    expect(declared(':root', prop)).toBe(token.toLowerCase());
  });

  it.each([
    ['--theme-base-rgb', DOCKET.base],
    ['--theme-accent-rgb', DOCKET.accent],
    ['--color-accent-rgb', DOCKET.accent],
  ])('%s channel twin matches its hex', (prop, token) => {
    expect(declared(':root', prop)).toBe(channels(token));
  });
});

describe("globals.css [data-register='carbon'] agrees with CARBON_TOKENS", () => {
  const BLOCK = "[data-register='carbon']";

  it.each([
    ['--theme-base', CARBON_TOKENS.base],
    ['--theme-accent', CARBON_TOKENS.accent],
    ['--theme-glow', CARBON_TOKENS.field],
    ['--theme-ink', CARBON_TOKENS.ink],
    ['--color-accent', CARBON_TOKENS.accent],
    ['--color-ring', CARBON_TOKENS.accent],
    ['--color-surface-elevated', CARBON_TOKENS.surfaceElevated],
    ['--color-text-muted', CARBON_TOKENS.inkMuted],
  ])('%s matches the token', (prop, token) => {
    expect(declared(BLOCK, prop)).toBe(token.toLowerCase());
  });

  it.each([
    ['--theme-base-rgb', CARBON_TOKENS.base],
    ['--theme-accent-rgb', CARBON_TOKENS.accent],
    ['--color-accent-rgb', CARBON_TOKENS.accent],
  ])('%s channel twin matches its hex', (prop, token) => {
    expect(declared(BLOCK, prop)).toBe(channels(token));
  });
});

describe('ember containment, enforced on the shipped stylesheet', () => {
  it('is declared exactly once, as --color-ember', () => {
    expect(declared(':root', '--color-ember')).toBe(EMBER.toLowerCase());
  });

  it('keeps the brand red in step with BRAND_RED (sample the logo, change both)', () => {
    expect(declared(':root', '--color-brand')).toBe(BRAND_RED.toLowerCase());
    expect(declared(':root', '--color-brand-rgb')).toBe(channels(BRAND_RED));
  });

  it.each([
    [':root', ':root'],
    ["[data-register='carbon']", "[data-register='carbon']"],
  ])('%s accent is not a near-miss of ember', (_label, block) => {
    // This is the assertion that would have caught the #f2732f regression.
    expect(hueClearance(declared(block, '--theme-accent'), EMBER)).toBeGreaterThanOrEqual(25);
  });
});
