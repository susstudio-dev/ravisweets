# Storefront Redesign — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the storefront's eight competing colour identities with one self-verifying "Anjeer & Pista" token system, swap in the new typography, and repair the theming architecture so the palette actually holds on every route and register.

**Architecture:** One authored palette module (`src/lib/theme/palette.ts`) becomes the single source of truth. A pure, dependency-free `applyPalette()` derives every CSS custom property — including the semantic `--color-*` layer that is currently static and breaks on dark palettes — and is shared by all three writers (site preset, per-product SSR, per-product client). Per-route palettes stop writing `:root` and scope to a wrapper element instead, which removes the cascade fight that currently kills per-product theming. A `data-register="bidri"` attribute re-declares the same variables for a subtree, giving the dark register with zero component changes.

**Tech Stack:** Next.js 15 (App Router), Tailwind 3, TypeScript 5.6, `motion/react`, Supabase, pnpm 9.15.9 workspaces. New: Vitest 2 for unit tests. Fonts via `next/font/google`.

## Global Constraints

- **Node** `>=20.0.0`; **pnpm** `9.15.9`. Never use `npm install` — this is a pnpm workspace.
- **Fonts must be on Google Fonts** and loaded via `next/font/google`. Verified available: `Young Serif` (static, 400 only), `Anek Latin` (variable `wght 100–800`, `wdth 75–125`), `Anek Telugu` (variable, same axes, `telugu` + `latin` subsets).
- **Palette authored values are fixed by the spec.** Light: base `#F1F0E2`, surfaceElevated `#FAF9F0`, ink `#221E1A`, inkMuted `#5C5347`, accent `#5E2757`, accentDeep `#3E1938`, field `#C9D99C`, varak `#9A9EA3`, varakRule `#7E8286`. Bidri: base `#17181A`, surfaceElevated `#202225`, ink `#F2EDE0`, inkMuted `#A7A49B`, accent `#C9D99C`, field `#3E1938`, accentDeep `#8FA85C`, varak `#C8CBD0`.
- **No new hardcoded hex outside `src/lib/theme/palette.ts`.** Third-party brand colours (WhatsApp `#25d366`, Instagram gradient) are the only permitted exceptions.
- **`ThemePreset` jsonb shape must not change:** `palette{base,accent,glow,ink,grainOpacity?}` + `hero{eyebrow,headline,body,ctaLabel,ctaHref,imageUrl}` + `bannerText`. Renaming a key breaks 13 seeded DB rows and 3 SQL files. The design name `field` maps to the stored key `glow`.
- **The four palette keys stay the only authored inputs.** Richer tokens are _derived_, so `/admin/themes` keeps working unchanged.
- **CI gates you must keep green:** `pnpm -r typecheck`, `pnpm --filter @ravisweets/storefront lint`, `pnpm --filter @ravisweets/storefront link-check`, `next build`, `size-limit`, Lighthouse. (`pnpm format:check` is also a CI step but is **already red on master** — see below.)
- **Lighthouse `categories:accessibility` minScore `0.95` is an `error`.** LCP `error` at 2500 ms, CLS `error` at 0.1.
- **size-limit: home First Load JS ≤ 185 KB gzip. Currently measured 181 KB — about 4 KB of headroom.** Motion subsystem ≤ 9 KB gzip. Do not add client-side dependencies in this plan; `applyPalette` must stay dependency-free (do **not** import `culori` into client code).
- **NEVER run `pnpm format` (repo-wide).** The repo has never been prettier-clean: a repo-wide format rewrites **~250 files**, burying your change in unrelated churn. Format only what you touched:

  ```bash
  # FMT — format only the files changed in this task
  git status --porcelain -- '*.ts' '*.tsx' '*.css' '*.json' '*.md' \
    | awk '{print $NF}' | xargs -r npx prettier --write
  ```

  Every task below refers to this as **`FMT`**.

- **`pnpm format:check` currently FAILS on master and is not a usable gate yet.** Two independent reasons, both pre-existing:
  1. `supabase/functions/send-order-email/index.ts:180` has a **real syntax error** — `order.lines as Array<{...}>.map(...)` is invalid TypeScript; the `as` expression needs parentheses: `(order.lines as Array<{...}>).map(...)`. Confirmed as `TS1005: ',' expected`. Prettier exits 2 on it, which fails the whole gate.
  2. ~250 files are simply unformatted.

  **This file is invisible to CI's typecheck** because `pnpm-workspace.yaml` covers only `apps/*` and `packages/*`, so `supabase/functions/` is never compiled. The transactional order email therefore cannot run. Fixing it is **not** in this plan's scope — it belongs to the revenue-path workstream, which owns that function. Do not treat `format:check` as a signal until it is fixed.

- **All contrast assertions use WCAG 2.1 relative luminance.** Body text ≥ 4.5:1, large display ≥ 3:1, non-text UI ≥ 3:1.

---

## Scope: this is Plan 1 of 3

The spec's §9 lists ten sequenced phases. That is too much for one plan, and phases 4–10 depend on the concrete `applyPalette` API that this plan defines. Decomposition:

| Plan                                    | Covers (spec §9)                                                                       | Ends when                                                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Plan 1 — Foundation** (this document) | Phases 1–3, plus the Bidri mechanism and the audit ratchet                             | Every route renders Anjeer & Pista, dark palettes render correctly, per-product theming works, `pnpm test` + all CI gates pass |
| **Plan 2 — Hero & identity**            | Phases 4–6: rebuilt hero, katli-cut device, dark sections converted to `data-register` | Hero is 8 elements with 2 destinations; paisley count is 0                                                                     |
| **Plan 3 — Propagation & cleanup**      | Phases 7–10: product palettes, festivals, SQL/email/cursor, utility-class migration    | Hardcoded hex outside `palette.ts` ≤ 20                                                                                        |

Plans 2 and 3 are written after Plan 1 lands, so they can use the real API rather than a predicted one.

---

## File Structure

**Create:**

| Path                                                  | Responsibility                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/storefront/vitest.config.ts`                    | Test runner config, `src/` alias                                                             |
| `apps/storefront/src/lib/theme/contrast.ts`           | Pure WCAG maths: relative luminance, contrast ratio, polarity, sRGB mix. No dependencies.    |
| `apps/storefront/src/lib/theme/contrast.test.ts`      | Verifies the maths against known reference values                                            |
| `apps/storefront/src/lib/theme/palette.ts`            | **Single source of truth.** Authored Anjeer & Pista registers + named product palettes.      |
| `apps/storefront/src/lib/theme/palette.test.ts`       | Asserts every contrast pair in spec §3 and every hue clearance. The palette verifies itself. |
| `apps/storefront/src/lib/theme/apply-palette.ts`      | `applyPalette()` — derives all CSS custom properties, polarity-aware                         |
| `apps/storefront/src/lib/theme/apply-palette.test.ts` | Polarity behaviour, completeness, derived-token contrast                                     |
| `apps/storefront/scripts/colour-audit.mjs`            | Ratchet: counts hardcoded hex, fails when the count rises                                    |

**Modify:**

| Path                                                        | Change                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `apps/storefront/package.json`                              | Add `vitest`, `test` + `colour-audit` scripts                                                              |
| `apps/storefront/src/lib/theme/tokens.ts`                   | `rawPalette` re-pointed at `palette.ts`; `defaultFlavour` derived                                          |
| `apps/storefront/src/app/globals.css`                       | Token block, font vars, `font-synthesis`, `--color-border` as `color-mix`, `[data-register='bidri']` block |
| `apps/storefront/tailwind.config.ts`                        | New colour tokens, font families                                                                           |
| `apps/storefront/src/app/layout.tsx`                        | Fonts, `themeColor`, `data-theme`                                                                          |
| `apps/storefront/src/lib/theme/theme-provider.tsx`          | `ThemeVars` scoped to a wrapper, uses `applyPalette`                                                       |
| `apps/storefront/src/lib/theme/active-theme-context.tsx`    | Uses `applyPalette`                                                                                        |
| `apps/storefront/src/lib/flags/visual-v2.ts`                | Add `getVisualVersion()`                                                                                   |
| `apps/storefront/src/components/sections/flavour-atlas.tsx` | Hover-revert fix + undefined-var fix                                                                       |
| `apps/storefront/src/lib/supabase/products.ts`              | Named palette instead of orphan literal                                                                    |
| `apps/storefront/src/components/header.tsx`                 | 38 hardcoded hexes → tokens                                                                                |
| `.github/workflows/ci.yml`                                  | Add `test` + `colour-audit` steps                                                                          |

### Deviation from spec §8.7, recorded deliberately

The spec proposes gating the whole redesign behind `:root[data-theme='v3']` with the old palette retained as the `v2` path. **This plan does not retain a duplicate palette block**, because doing so re-creates the multiple-sources-of-truth problem the spec exists to eliminate, and because the old palette is objectively broken (per-product theming dead; 788 surfaces and borders stay light on any dark palette). `getVisualVersion()` is still added and still stamps `data-theme`, so component-level variants in Plan 2 can branch on it — but the token layer changes unconditionally. Flag this to the engagement owner if a palette-level rollback switch is a hard requirement.

---

## Task 1: Test infrastructure and contrast maths

**Files:**

- Create: `apps/storefront/vitest.config.ts`
- Create: `apps/storefront/src/lib/theme/contrast.ts`
- Test: `apps/storefront/src/lib/theme/contrast.test.ts`
- Modify: `apps/storefront/package.json`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `relativeLuminance(hex: string): number`
  - `contrastRatio(a: string, b: string): number`
  - `isLightSurface(hex: string): boolean`
  - `mix(a: string, b: string, t: number): string` — `t` is the fraction of `b`, returns `#RRGGBB` uppercase
  - `hue(hex: string): number` — 0–359
  - `hueClearance(a: string, b: string): number` — 0–180

- [ ] **Step 1: Add Vitest and scripts**

```bash
cd apps/storefront
pnpm add -D vitest@^2.1.8
```

Then edit `apps/storefront/package.json` and add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"colour-audit": "node scripts/colour-audit.mjs"
```

- [ ] **Step 2: Create the Vitest config**

Create `apps/storefront/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 3: Write the failing test**

Create `apps/storefront/src/lib/theme/contrast.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  hue,
  hueClearance,
  isLightSurface,
  mix,
  relativeLuminance,
} from './contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('accepts lowercase and a missing hash', () => {
    expect(relativeLuminance('ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is 1:1 for a colour against itself', () => {
    expect(contrastRatio('#5E2757', '#5E2757')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#221E1A', '#F1F0E2')).toBeCloseTo(contrastRatio('#F1F0E2', '#221E1A'), 5);
  });

  it('matches the spec ratio for ink on base', () => {
    expect(contrastRatio('#221E1A', '#F1F0E2')).toBeCloseTo(14.43, 1);
  });
});

describe('isLightSurface', () => {
  it('classifies the light register base as light', () => {
    expect(isLightSurface('#F1F0E2')).toBe(true);
  });

  it('classifies the bidri gunmetal base as dark', () => {
    expect(isLightSurface('#17181A')).toBe(false);
  });

  it('classifies the legacy dark product base as dark', () => {
    expect(isLightSurface('#2a1505')).toBe(false);
  });
});

describe('mix', () => {
  it('returns the first colour at t=0 and the second at t=1', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
  });

  it('produces the midpoint at t=0.5', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('clamps t outside 0..1', () => {
    expect(mix('#000000', '#FFFFFF', -1)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 2)).toBe('#FFFFFF');
  });
});

describe('hue', () => {
  it('reads the anjeer accent as fig-purple', () => {
    expect(hue('#5E2757')).toBe(308);
  });

  it('reads the pista field as yellow-green', () => {
    expect(hue('#C9D99C')).toBe(76);
  });
});

describe('hueClearance', () => {
  it('never exceeds 180 degrees', () => {
    expect(hueClearance('#FF0000', '#00FFFF')).toBeLessThanOrEqual(180);
  });

  it('wraps around the colour wheel', () => {
    // hue 350 and hue 10 are 20 degrees apart, not 340
    expect(hueClearance('#FF0D45', '#FF2D0D')).toBeLessThan(40);
  });

  it('clears Cadbury purple from the anjeer accent by at least 40 degrees', () => {
    expect(hueClearance('#5E2757', '#3F1B7A')).toBeGreaterThanOrEqual(40);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
cd apps/storefront && pnpm test
```

Expected: FAIL — `Failed to resolve import "./contrast"`.

- [ ] **Step 5: Implement the contrast module**

Create `apps/storefront/src/lib/theme/contrast.ts`:

```ts
/**
 * Pure colour maths for the theme system — WCAG 2.1 relative luminance,
 * contrast ratio, surface polarity, sRGB mixing and hue distance.
 *
 * DELIBERATELY DEPENDENCY-FREE. This module is imported by `applyPalette`,
 * which runs in the browser on every theme change. `culori` is a devDependency
 * of the design tooling, not of the client bundle — the home route has ~4 KB of
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
 * against a magic threshold — this is robust for the mid-tone bases an admin
 * can enter via /admin/themes.
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
  const [r, g, b] = parse(hex).map((n) => n / 255) as unknown as Rgb;
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

/** Shortest distance between two hues, 0..180 degrees. */
export function hueClearance(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b)) % 360;
  return d > 180 ? 360 - d : d;
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
cd apps/storefront && pnpm test
```

Expected: PASS, all cases in `contrast.test.ts`.

If `hue('#5E2757')` returns 307 or 309 rather than 308, adjust the test to `toBeCloseTo(308, 0)` — rounding at the boundary is acceptable; the _clearance_ assertions are what matter.

- [ ] **Step 7: Format, typecheck and commit**

```bash
cd ../..
FMT
pnpm -r typecheck
cd apps/storefront && pnpm test && pnpm lint
cd ../..
git add apps/storefront/vitest.config.ts apps/storefront/src/lib/theme/contrast.ts apps/storefront/src/lib/theme/contrast.test.ts apps/storefront/package.json pnpm-lock.yaml
git commit -m "test(theme): add vitest and dependency-free WCAG contrast maths

No test runner existed in this repo. Adds vitest plus the pure colour
maths the new token system needs: relative luminance, contrast ratio,
surface polarity, sRGB mix and hue distance.

Deliberately dependency-free — applyPalette runs in the browser on every
theme change and the home route has about 4 KB of First Load JS headroom."
```

---

## Task 2: The authored palette, self-verifying

**Files:**

- Create: `apps/storefront/src/lib/theme/palette.ts`
- Test: `apps/storefront/src/lib/theme/palette.test.ts`

**Interfaces:**

- Consumes: `contrastRatio`, `hueClearance` from `./contrast`.
- Produces:
  - `interface FlavourPalette { base: string; accent: string; glow: string; ink: string; grainOpacity: number }`
  - `LIGHT: FlavourPalette` and `BIDRI: FlavourPalette` — the two registers
  - `ANJEER_PISTA` — the full authored token record (includes `surfaceElevated`, `inkMuted`, `accentDeep`, `varak`, `varakRule`)
  - `BIDRI_TOKENS` — the same shape for the dark register
  - `PRODUCT_PALETTES: Record<ProductPaletteName, FlavourPalette>` and `type ProductPaletteName`
  - `COMPETITOR_HUES: Record<string, string>` — reference colours the accent must clear

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/src/lib/theme/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, hueClearance } from './contrast';
import { ANJEER_PISTA, BIDRI_TOKENS, COMPETITOR_HUES, PRODUCT_PALETTES } from './palette';

const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('light register — every pair in spec section 3', () => {
  const t = ANJEER_PISTA;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['ink on field', t.ink, t.field, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['accent on surfaceElevated', t.accent, t.surfaceElevated, AA_TEXT],
    ['accent on field', t.accent, t.field, AA_TEXT],
    ['field on accent', t.field, t.accent, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_TEXT],
    ['accentDeep on field', t.accentDeep, t.field, AA_TEXT],
    ['varakRule on base', t.varakRule, t.base, AA_UI],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('bidri register — every pair in spec section 3', () => {
  const t = BIDRI_TOKENS;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['varak on base', t.varak, t.base, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_UI],
    ['ink on anjeer panel', t.ink, t.field, AA_TEXT],
    ['accent on anjeer panel', t.accent, t.field, AA_TEXT],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('accent must not collide with the category', () => {
  // Cadbury owns purple in Indian confectionery; Bombay Sweet Shop owns the
  // wine the old Ravi Sweets rose collided with at 3 degrees.
  it.each(Object.entries(COMPETITOR_HUES))(
    'clears %s by at least 25 degrees',
    (_name, competitor) => {
      expect(hueClearance(ANJEER_PISTA.accent, competitor)).toBeGreaterThanOrEqual(25);
    },
  );

  it('does not reintroduce the old rose hue', () => {
    expect(hueClearance(ANJEER_PISTA.accent, '#A8345D')).toBeGreaterThanOrEqual(25);
  });
});

describe('product palettes', () => {
  it('replaces the 26 stale brass literals with a small named set', () => {
    const names = Object.keys(PRODUCT_PALETTES);
    expect(names.length).toBeGreaterThanOrEqual(4);
    expect(names.length).toBeLessThanOrEqual(8);
  });

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps ink readable on its own base',
    (_name, palette) => {
      expect(contrastRatio(palette.ink, palette.base)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps its accent readable on its own base',
    (_name, palette) => {
      expect(contrastRatio(palette.accent, palette.base)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps base readable on its accent, for filled buttons',
    (_name, palette) => {
      expect(contrastRatio(palette.base, palette.accent)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd apps/storefront && pnpm test palette
```

Expected: FAIL — `Failed to resolve import "./palette"`.

- [ ] **Step 3: Implement the palette module**

Create `apps/storefront/src/lib/theme/palette.ts`:

```ts
/**
 * ANJEER & PISTA — the single source of truth for every brand colour.
 *
 * Named for the two most expensive ingredients in the catalogue, which is also
 * why it reads as premium: anjeer (fig) purple and pista (pistachio) green are
 * an established Indian sweet pairing, not an imported colour scheme.
 *
 * Design decisions encoded here, from docs/superpowers/specs/
 * 2026-07-26-storefront-art-direction-design.md:
 *
 *  - GOLD IS DELETED. Every competitor signals premium with gold; silver leaf
 *    (varak) is what is actually on kaju katli, and no sampled competitor uses
 *    a silver/cool-grey cue.
 *  - INK IS WARM CHARCOAL, NOT PLUM-BLACK. The previous #1F1820 sat at hue 292,
 *    only 16 degrees from the accent, which would make links read as body text.
 *    #221E1A is at hue 30 — 82 degrees of separation. Functional, not cosmetic.
 *  - THE ACCENT SITS IN A NARROW WINDOW. Cadbury owns purple in Indian
 *    confectionery (hue 263) and Bombay Sweet Shop owns wine (hue 336). The
 *    usable gap at >=25 degrees clearance from both is hue 288-311; the accent
 *    is at 308, so it reads as fig rather than violet.
 *  - THE TWO BRAND COLOURS SWAP ROLES BETWEEN REGISTERS. Pista is the field on
 *    light and the interactive colour on dark; anjeer is interactive on light
 *    and a panel colour on dark.
 *
 * palette.test.ts asserts every contrast pair and hue clearance, so this file
 * cannot drift out of spec silently.
 */

/**
 * The four colours an admin can author via /admin/themes, plus grain.
 *
 * This shape is the `palette` jsonb column on `theme_presets` and the
 * `theme_palette` field on Product. DO NOT rename these keys — 13 seeded DB
 * rows and 3 SQL files depend on them. Note that `glow` is the stored name for
 * what the design calls the "field".
 */
export interface FlavourPalette {
  base: string;
  accent: string;
  glow: string;
  ink: string;
  grainOpacity: number;
}

/** The full authored token set for a register. Everything else is derived. */
export interface RegisterTokens {
  base: string;
  surfaceElevated: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentDeep: string;
  field: string;
  varak: string;
  varakRule: string;
}

/** Light register — the default, and the only one used for shop/PDP/cart/checkout. */
export const ANJEER_PISTA: RegisterTokens = {
  base: '#F1F0E2', // pista-cream ground; never #ffffff
  surfaceElevated: '#FAF9F0',
  ink: '#221E1A', // warm charcoal, hue 30
  inkMuted: '#5C5347',
  accent: '#5E2757', // anjeer, hue 308
  accentDeep: '#3E1938',
  field: '#C9D99C', // pista, hue 76 — unowned by every competitor measured
  varak: '#9A9EA3', // decorative silver fill
  varakRule: '#7E8286', // informational hairline; must clear 3:1, #9A9EA3 does not
};

/** Bidri register — gunmetal + silver inlay. Story, drops, gifting only. */
export const BIDRI_TOKENS: RegisterTokens = {
  base: '#17181A', // Bidar patina gunmetal
  surfaceElevated: '#202225',
  ink: '#F2EDE0',
  inkMuted: '#A7A49B',
  accent: '#C9D99C', // pista becomes the interactive colour on dark
  accentDeep: '#8FA85C',
  field: '#3E1938', // anjeer becomes a panel colour on dark
  varak: '#C8CBD0', // silver inlay
};

/** Reduce a register to the four authored keys the DB and admin understand. */
function toFlavour(t: RegisterTokens, grainOpacity: number): FlavourPalette {
  return { base: t.base, accent: t.accent, glow: t.field, ink: t.ink, grainOpacity };
}

export const LIGHT: FlavourPalette = toFlavour(ANJEER_PISTA, 0.05);
export const BIDRI: FlavourPalette = toFlavour(BIDRI_TOKENS, 0.07);

/**
 * Named product palettes, replacing 26 hand-typed brass literals that differed
 * by 1-3 hex digits and were all from the pre-2026 "brass & ghee" era.
 *
 * Every one is a tonal variation of Anjeer & Pista, so a product page no longer
 * repaints the site a different brand. Assignment of products to palettes
 * happens in Plan 3.
 */
export const PRODUCT_PALETTES = {
  /** Default for sweets — the house palette. */
  house: LIGHT,
  /** Nut-forward: kaju, badam, pista. Leans further into the field colour. */
  pista: {
    base: '#EDEFDD',
    accent: '#4F6024',
    glow: '#C9D99C',
    ink: '#221E1A',
    grainOpacity: 0.05,
  },
  /** Fig / date / dry-fruit. Anjeer-forward. */
  anjeer: {
    base: '#F2EEE8',
    accent: '#5E2757',
    glow: '#C6A8BE',
    ink: '#221E1A',
    grainOpacity: 0.05,
  },
  /** Savouries and pickles — warmer, earthier ground, still in-system. */
  savoury: {
    base: '#F1ECDD',
    accent: '#5A4A1E',
    glow: '#D3C88F',
    ink: '#221E1A',
    grainOpacity: 0.06,
  },
  /** Premium hampers and the Vault drop — the dark register. */
  vault: BIDRI,
} as const satisfies Record<string, FlavourPalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;

/**
 * Measured competitor colours the accent must clear by >=25 degrees of hue.
 * All extracted from live production CSS on 2026-07-26 except Cadbury, which
 * is Pantone 2685C. Cadbury is the largest confectionery brand in India and was
 * missing from the original research set.
 */
export const COMPETITOR_HUES: Record<string, string> = {
  'Cadbury Dairy Milk (2685C)': '#3F1B7A',
  'Bombay Sweet Shop wine': '#871A45',
  'Anand crimson': '#AF2037',
  'Almond House terracotta': '#C76F46',
  'Anand gold': '#C4A237',
  'Haldiram burnt brick': '#AF431D',
  'Bikanervala vermilion': '#E32E00',
  'Bombay Sweet Shop petrol': '#002C3F',
  'Sweet Karam teal': '#004E4A',
};
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd apps/storefront && pnpm test palette
```

Expected: PASS. Every light and bidri pair, every competitor clearance, and every product palette.

If a `PRODUCT_PALETTES` entry fails a contrast assertion, **fix the palette value, not the test** — the thresholds are the spec's accessibility floor.

- [ ] **Step 5: Format, typecheck and commit**

```bash
cd ../.. && FMT && pnpm -r typecheck
cd apps/storefront && pnpm test && cd ../..
git add apps/storefront/src/lib/theme/palette.ts apps/storefront/src/lib/theme/palette.test.ts
git commit -m "feat(theme): add the Anjeer & Pista palette as a self-verifying module

Single source of truth for every brand colour, replacing five
hand-maintained copies. The test asserts all 21 contrast pairs from the
spec plus hue clearance against nine measured competitors, so the
palette cannot drift out of spec silently.

Includes the Cadbury clearance check — Cadbury owns purple in Indian
confectionery at hue 263 and was missing from the original research."
```

---

## Task 3: `applyPalette()` — polarity-aware derivation

This is the fix for the defect where `--color-surface`, `--color-surface-elevated` and the text tokens are static while `--theme-*` is dynamic, leaving **177 `bg-surface` + 137 `bg-surface-elevated` surfaces cream and 474 borders invisible** on any dark palette.

**Files:**

- Create: `apps/storefront/src/lib/theme/apply-palette.ts`
- Test: `apps/storefront/src/lib/theme/apply-palette.test.ts`

**Interfaces:**

- Consumes: `FlavourPalette` from `./palette`; `isLightSurface`, `mix`, `contrastRatio` from `./contrast`.
- Produces:
  - `THEME_VAR_NAMES: readonly string[]` — every custom property the function sets
  - `applyPalette(p: FlavourPalette): Record<string, string>`
  - `paletteToCss(p: FlavourPalette): string` — `"--a:b;--c:d"`, for SSR `<style>` and inline `style` strings
  - `writePalette(el: HTMLElement, p: FlavourPalette): void` — imperative writer for the client providers

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/src/lib/theme/apply-palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, isLightSurface, relativeLuminance } from './contrast';
import { BIDRI, LIGHT, type FlavourPalette } from './palette';
import { THEME_VAR_NAMES, applyPalette, paletteToCss } from './apply-palette';

/** A mid-tone base an admin could plausibly type into /admin/themes. */
const MIDTONE: FlavourPalette = {
  base: '#7A7A7A',
  accent: '#2A1A40',
  glow: '#C9D99C',
  ink: '#100E12',
  grainOpacity: 0.05,
};

/** The legacy dark product palette that breaks the current system today. */
const LEGACY_DARK: FlavourPalette = {
  base: '#2a1505',
  accent: '#e9ad4a',
  glow: '#f2c66f',
  ink: '#fdf6ec',
  grainOpacity: 0.08,
};

describe('completeness', () => {
  it.each([LIGHT, BIDRI, MIDTONE, LEGACY_DARK])(
    'sets every declared variable for %o',
    (palette) => {
      const vars = applyPalette(palette);
      for (const name of THEME_VAR_NAMES) {
        expect(vars[name], `missing ${name}`).toBeDefined();
        expect(vars[name]).not.toBe('');
      }
    },
  );

  it('sets the semantic --color-* layer, not just --theme-*', () => {
    const vars = applyPalette(LIGHT);
    // This is the whole point: these were static before and broke on dark.
    expect(vars['--color-surface']).toBeDefined();
    expect(vars['--color-surface-elevated']).toBeDefined();
    expect(vars['--color-text-primary']).toBeDefined();
    expect(vars['--color-text-muted']).toBeDefined();
    expect(vars['--color-accent']).toBeDefined();
    expect(vars['--color-ring']).toBeDefined();
  });

  it('passes the four authored colours through unchanged', () => {
    const vars = applyPalette(LIGHT);
    expect(vars['--theme-base']).toBe(LIGHT.base);
    expect(vars['--theme-accent']).toBe(LIGHT.accent);
    expect(vars['--theme-glow']).toBe(LIGHT.glow);
    expect(vars['--theme-ink']).toBe(LIGHT.ink);
    expect(vars['--theme-grain-opacity']).toBe(String(LIGHT.grainOpacity));
  });
});

describe('polarity', () => {
  it('raises an elevated surface away from the ground on a light base', () => {
    const vars = applyPalette(LIGHT);
    expect(relativeLuminance(vars['--color-surface-elevated'])).toBeGreaterThan(
      relativeLuminance(LIGHT.base),
    );
  });

  it('raises an elevated surface away from the ground on a dark base', () => {
    const vars = applyPalette(BIDRI);
    expect(relativeLuminance(vars['--color-surface-elevated'])).toBeGreaterThan(
      relativeLuminance(BIDRI.base),
    );
  });

  it('lands close to the authored light surfaceElevated', () => {
    const vars = applyPalette(LIGHT);
    // Derivation should reproduce the spec's authored #FAF9F0 within tolerance.
    expect(contrastRatio(vars['--color-surface-elevated'], '#FAF9F0')).toBeLessThan(1.06);
  });

  it('lands close to the authored bidri surfaceElevated', () => {
    const vars = applyPalette(BIDRI);
    expect(contrastRatio(vars['--color-surface-elevated'], '#202225')).toBeLessThan(1.15);
  });
});

describe('derived tokens stay readable on every register', () => {
  it.each([
    ['light', LIGHT],
    ['bidri', BIDRI],
    ['midtone', MIDTONE],
    ['legacy dark', LEGACY_DARK],
  ] as const)('%s keeps primary text at AA on both surfaces', (_label, palette) => {
    const vars = applyPalette(palette);
    expect(
      contrastRatio(vars['--color-text-primary'], vars['--color-surface']),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars['--color-text-primary'], vars['--color-surface-elevated']),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['light', LIGHT],
    ['bidri', BIDRI],
    ['legacy dark', LEGACY_DARK],
  ] as const)('%s keeps muted text at AA on the ground', (_label, palette) => {
    const vars = applyPalette(palette);
    expect(
      contrastRatio(vars['--color-text-muted'], vars['--color-surface']),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe('paletteToCss', () => {
  it('emits every variable as a css declaration list', () => {
    const css = paletteToCss(LIGHT);
    for (const name of THEME_VAR_NAMES) {
      expect(css).toContain(`${name}:`);
    }
  });

  it('does not emit anything that could break out of a style attribute', () => {
    const css = paletteToCss(LIGHT);
    expect(css).not.toContain('<');
    expect(css).not.toContain('"');
    expect(css).not.toContain('}');
  });
});

describe('the polarity helper agrees with the registers', () => {
  it('reads light as light and bidri as dark', () => {
    expect(isLightSurface(LIGHT.base)).toBe(true);
    expect(isLightSurface(BIDRI.base)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd apps/storefront && pnpm test apply-palette
```

Expected: FAIL — `Failed to resolve import "./apply-palette"`.

- [ ] **Step 3: Implement `applyPalette`**

Create `apps/storefront/src/lib/theme/apply-palette.ts`:

```ts
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

import { isLightSurface, mix } from './contrast';
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
] as const;

export function applyPalette(p: FlavourPalette): Record<string, string> {
  const light = isLightSurface(p.base);

  // The direction "up" is toward white on a light ground and toward the ink
  // (which is itself light) on a dark ground. Either way the result is a
  // surface that reads as raised.
  const lift = light ? '#FFFFFF' : p.ink;
  const surfaceElevated = mix(p.base, lift, light ? LIFT_LIGHT : LIFT_DARK);

  return {
    '--theme-base': p.base,
    '--theme-accent': p.accent,
    '--theme-glow': p.glow,
    '--theme-ink': p.ink,
    '--theme-grain-opacity': String(p.grainOpacity),
    '--color-surface': p.base,
    '--color-surface-elevated': surfaceElevated,
    '--color-text-primary': p.ink,
    '--color-text-muted': mix(p.ink, p.base, MUTED_TOWARD_GROUND),
    '--color-accent': p.accent,
    '--color-ring': p.accent,
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd apps/storefront && pnpm test apply-palette
```

Expected: PASS.

If `muted text at AA` fails for `MIDTONE` or `LEGACY_DARK`, lower `MUTED_TOWARD_GROUND` until it passes for every register — never relax the 4.5 threshold. If it cannot be satisfied for a mid-tone base, clamp: derive muted from whichever of ink/base gives more contrast against the surface.

- [ ] **Step 5: Format, typecheck and commit**

```bash
cd ../.. && FMT && pnpm -r typecheck
cd apps/storefront && pnpm test && cd ../..
git add apps/storefront/src/lib/theme/apply-palette.ts apps/storefront/src/lib/theme/apply-palette.test.ts
git commit -m "feat(theme): derive the semantic colour layer from the active palette

Fixes the defect where --color-surface, --color-surface-elevated and the
text tokens were hardcoded in globals.css and never written at runtime,
while --theme-* was dynamic. On any dark palette that left 177
bg-surface and 137 bg-surface-elevated surfaces cream and 474 borders
invisible — already broken on a live product page and the seeded
midnight-saffron preset.

Polarity needs the base's relative luminance, so this is a function
rather than a color-mix rule. Tests cover a light base, a dark base, a
mid-tone base an admin could type, and the legacy dark product palette."
```

---

## Task 4: Wire the token layer

After this task the whole site renders Anjeer & Pista, and ~96 token-consuming files change appearance with no edits.

**Files:**

- Modify: `apps/storefront/src/lib/theme/tokens.ts`
- Modify: `apps/storefront/src/app/globals.css`
- Modify: `apps/storefront/tailwind.config.ts`

**Interfaces:**

- Consumes: `ANJEER_PISTA`, `BIDRI_TOKENS`, `LIGHT` from `./palette`; `paletteToCss` from `./apply-palette`.
- Produces: Tailwind colour utilities `field`, `varak`, `varak-rule`, `accent-deep`, `ink-muted`; the `[data-register='bidri']` CSS contract; `defaultFlavour` re-exported from `palette.ts`.

- [ ] **Step 1: Re-point `tokens.ts` at the palette module**

Replace the `rawPalette` and `defaultFlavour` exports in `apps/storefront/src/lib/theme/tokens.ts`. Keep `radii`, `elevation`, `motion`, `grain` and the `FlavourPalette` type re-export so existing importers keep compiling.

```ts
/**
 * Ravi Sweets design tokens.
 *
 * Colour now lives in ./palette.ts — the single source of truth. This file
 * keeps the non-colour scales (radii, elevation, motion, grain) and re-exports
 * colour so the ~96 existing importers do not all have to change at once.
 *
 * The old `rawPalette.brand.*` / `.saffron` / `.rose` scales are GONE. They had
 * zero Tailwind-class usages across the entire tree, so nothing consumed them
 * except by hand-copying hex. Gold is deleted deliberately — see palette.ts.
 */
import { ANJEER_PISTA, BIDRI_TOKENS, LIGHT } from './palette';

export type { FlavourPalette } from './palette';
export { ANJEER_PISTA, BIDRI_TOKENS, LIGHT, PRODUCT_PALETTES } from './palette';

/** Projected into Tailwind. Semantic names only — no numeric brand ramp. */
export const rawPalette = {
  cream: ANJEER_PISTA.base,
  ink: ANJEER_PISTA.ink,
  anjeer: { DEFAULT: ANJEER_PISTA.accent, deep: ANJEER_PISTA.accentDeep },
  pista: { DEFAULT: ANJEER_PISTA.field, deep: '#4F6024' },
  varak: { DEFAULT: ANJEER_PISTA.varak, rule: ANJEER_PISTA.varakRule },
  gunmetal: { DEFAULT: BIDRI_TOKENS.base, elevated: BIDRI_TOKENS.surfaceElevated },
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  semantic: { success: '#2F7A3C', warn: '#8A6A1E', danger: '#9B2F1C' },
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
  soft: '0 1px 2px rgb(34 30 26 / 0.04), 0 2px 8px rgb(34 30 26 / 0.06)',
  lifted: '0 2px 4px rgb(34 30 26 / 0.06), 0 8px 24px rgb(34 30 26 / 0.10)',
} as const;

export const motion = {
  duration: { instant: 100, fast: 150, quick: 200, base: 300, slow: 450, cinematic: 650 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasised: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
} as const;

export const grain = { opacityDefault: 0.05, opacityMax: 0.08 } as const;

/** Consumed when no per-route palette is active. */
export const defaultFlavour = LIGHT;
```

> The `lifted` shadow drops the `inset 0 1px 0 rgba(255,255,255,.6)` highlight — a white inner bevel reads as plastic on the pista field and inverts wrongly on the Bidri register.

- [ ] **Step 2: Rewrite the `globals.css` token block**

Replace lines 1–99 of `apps/storefront/src/app/globals.css`. The `:root` values are the **first-paint defaults only** — the providers overwrite them via `applyPalette`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /*
   * ANJEER & PISTA. These :root values are first-paint defaults only — every
   * one of them is overwritten at runtime by applyPalette() (see
   * src/lib/theme/apply-palette.ts). Keep them byte-identical to
   * ANJEER_PISTA in src/lib/theme/palette.ts.
   */
  :root {
    --theme-base: #f1f0e2;
    --theme-accent: #5e2757;
    --theme-glow: #c9d99c;
    --theme-ink: #221e1a;
    --theme-grain-opacity: 0.05;

    --color-surface: #f1f0e2;
    --color-surface-elevated: #faf9f0;
    --color-text-primary: #221e1a;
    --color-text-muted: #5c5347;
    --color-accent: #5e2757;
    --color-ring: #5e2757;

    /* Non-authored brand constants. */
    --color-field-deep: #3e1938;
    --color-varak: #9a9ea3;
    --color-varak-rule: #7e8286;

    /*
     * Alpha border, so it is polarity-agnostic: 12% of whatever the current ink
     * is, over whatever the current surface is. This is the one semantic token
     * NOT derived in applyPalette, because it needs no polarity branch.
     */
    --color-border: color-mix(in oklab, var(--theme-ink) 12%, transparent);

    --font-display: 'Young Serif', Georgia, serif;
    --font-body: 'Anek Latin', system-ui, sans-serif;
    --font-indic: 'Anek Telugu', var(--font-body);
  }

  /*
   * BIDRI REGISTER. Any subtree opts in with data-register="bidri" and
   * re-themes with zero component changes, because custom properties resolve
   * to the nearest declaring ancestor. Values match BIDRI_TOKENS in palette.ts.
   */
  [data-register='bidri'] {
    --theme-base: #17181a;
    --theme-accent: #c9d99c;
    --theme-glow: #3e1938;
    --theme-ink: #f2ede0;
    --theme-grain-opacity: 0.07;

    --color-surface: #17181a;
    --color-surface-elevated: #202225;
    --color-text-primary: #f2ede0;
    --color-text-muted: #a7a49b;
    --color-accent: #c9d99c;
    --color-ring: #c9d99c;

    --color-field-deep: #3e1938;
    --color-varak: #c8cbd0;
    --color-varak-rule: #c8cbd0;

    background-color: var(--theme-base);
    color: var(--theme-ink);
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    background-color: var(--theme-base);
    color: var(--theme-ink);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition:
      background-color 250ms cubic-bezier(0.2, 0, 0, 1),
      color 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  h1,
  h2,
  h3,
  .font-display {
    font-family: var(--font-display);
    /*
     * Young Serif ships ONE weight (400). Without this the browser
     * synthesises bold wherever font-semibold/font-bold is present — 197 call
     * sites — and faux-bold on a display serif looks broken. Display
     * hierarchy comes from size, never weight.
     */
    font-synthesis: none;
    font-synthesis-weight: none;
  }

  :focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }

  ::selection {
    background: var(--theme-glow);
    color: var(--theme-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  .container-site {
    @apply mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8;
  }

  .grain-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: var(--theme-grain-opacity);
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.85 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    mix-blend-mode: multiply;
  }

  [data-register='bidri'] .grain-overlay {
    mix-blend-mode: screen;
  }

  @media (prefers-reduced-motion: reduce) {
    .grain-overlay {
      display: none;
    }
  }
}
```

> `mix-blend-mode: multiply` makes grain invisible on a dark ground; the Bidri override switches to `screen`.

- [ ] **Step 3: Extend the Tailwind colour and font mapping**

In `apps/storefront/tailwind.config.ts`, extend the `colors` block (keep the existing entries) and update `fontFamily`:

```ts
      colors: {
        ...rawPalette,
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        ring: 'var(--color-ring)',
        'theme-base': 'var(--theme-base)',
        'theme-accent': 'var(--theme-accent)',
        'theme-glow': 'var(--theme-glow)',
        'theme-ink': 'var(--theme-ink)',
        // new brand tokens
        field: 'var(--theme-glow)',
        'field-deep': 'var(--color-field-deep)',
        varak: 'var(--color-varak)',
        'varak-rule': 'var(--color-varak-rule)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        indic: ['var(--font-indic)', 'var(--font-body)', 'sans-serif'],
      },
```

- [ ] **Step 4: Verify the build and check for compile fallout**

```bash
cd ../.. && pnpm -r typecheck
```

Expected: errors **only** where code imported a removed token (`rawPalette.brand.*`, `rawPalette.saffron`, `rawPalette.rose`). Fix each by pointing at the nearest new token. Then:

```bash
cd apps/storefront && pnpm lint && pnpm build
```

Expected: build succeeds. Fonts are not swapped yet, so `'Young Serif'` in `--font-display` falls back to Georgia — expected until Task 5.

- [ ] **Step 5: Confirm the size budget still passes**

```bash
cd apps/storefront && npx --yes size-limit
```

Expected: home First Load JS still under 185 KB. No client JS was added in this task, so it should be flat or slightly down.

- [ ] **Step 6: Format and commit**

```bash
cd ../.. && FMT
git add apps/storefront/src/lib/theme/tokens.ts apps/storefront/src/app/globals.css apps/storefront/tailwind.config.ts
git commit -m "feat(theme): wire the Anjeer & Pista token layer

Deletes the brass/gold/rose raw scales, which had zero Tailwind-class
usages and were only ever consumed by hand-copied hex. Adds the
data-register='bidri' contract so a subtree can go dark with no
component changes, and font-synthesis:none so Young Serif's single
weight is never faux-bolded across the 197 sites that pair
font-display with a weight utility.

--color-border becomes an alpha color-mix so it is polarity-agnostic.
The lifted shadow loses its white inner bevel, which read as plastic on
the pista field and inverted on the dark register."
```

---

## Task 5: Typography

**Files:**

- Modify: `apps/storefront/src/app/layout.tsx`
- Create: `apps/storefront/scripts/strip-display-weights.mjs`

**Interfaces:**

- Consumes: the `--font-display` / `--font-body` / `--font-indic` contract from Task 4.
- Produces: nothing importable.

- [ ] **Step 1: Swap the font declarations**

In `apps/storefront/src/app/layout.tsx`, replace the three `next/font/google` imports and declarations:

```ts
import { Anek_Latin, Anek_Telugu, Young_Serif } from 'next/font/google';

/*
 * Young Serif is a STATIC single-weight face, so next/font requires an explicit
 * weight. That single weight is the point: display hierarchy comes from size,
 * never weight (globals.css sets font-synthesis:none to enforce it).
 *
 * Chosen over the higher-contrast alternatives because its strokes survive on
 * the pista field — a hairline serif would disappear on #C9D99C, and the field
 * is the identity.
 */
const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

/*
 * Anek Latin and Anek Telugu are the same Ek Type superfamily with identical
 * axes, designed together for cross-script harmony — the only true
 * Latin/Telugu pairing on Google Fonts.
 *
 * `wdth` is deliberately NOT requested: each extra axis costs font bytes, the
 * home route has ~4 KB of budget headroom, and nothing in the design varies
 * width. `wght` is included automatically for variable fonts.
 */
const anekLatin = Anek_Latin({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-body',
  display: 'swap',
});

/*
 * preload:false — the Telugu subset is large and is used for one short eyebrow
 * line, not for body copy. Preloading it would compete with the LCP element
 * against a 2500 ms Lighthouse error budget.
 */
const anekTelugu = Anek_Telugu({
  subsets: ['telugu', 'latin'],
  weight: 'variable',
  variable: '--font-indic',
  display: 'swap',
  preload: false,
});
```

Then update `viewport.themeColor` and the `<html>` className:

```ts
export const viewport: Viewport = {
  themeColor: '#F1F0E2',
  width: 'device-width',
  initialScale: 1,
};
```

```tsx
    <html
      lang="en"
      className={`${youngSerif.variable} ${anekLatin.variable} ${anekTelugu.variable}`}
      suppressHydrationWarning
    >
```

Also fix the skip link on the same file — it currently hardcodes `focus:text-white` on a themed accent:

```tsx
className =
  'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-theme-accent focus:px-4 focus:py-2 focus:text-[color:var(--theme-base)]';
```

- [ ] **Step 2: Verify the fonts resolve**

```bash
cd apps/storefront && pnpm build
```

Expected: build succeeds with no `Unknown font` error. A failure naming `Young_Serif`, `Anek_Latin` or `Anek_Telugu` means the export name is wrong — check against `node_modules/next/font/google/index.d.ts`.

- [ ] **Step 3: Write the weight-stripping codemod**

Create `apps/storefront/scripts/strip-display-weights.mjs`:

```js
/**
 * Removes font-weight utilities from elements that also carry font-display.
 *
 * Young Serif has one weight, and globals.css sets font-synthesis:none, so
 * font-semibold / font-bold / font-medium on display text are dead classes.
 * 197 of 255 font-display occurrences across 68 files had one.
 *
 * Conservative by design: only rewrites a className string when BOTH
 * font-display and a weight utility appear inside the SAME quoted literal.
 * Run with --check to fail instead of writing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
// NOTE: do not import globSync from node:fs — it does not exist on Node 20,
// which is what package.json engines and CI both pin. File discovery uses
// `git ls-files` below, which also skips node_modules and untracked files.

const check = process.argv.includes('--check');

const files = execSync('git ls-files "*.tsx"', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && (f.startsWith('apps/storefront/src/') || f.startsWith('packages/ui/src/')));

const WEIGHTS = /\s*\bfont-(?:semibold|bold|medium)\b/g;
let changed = 0;
const touched = [];

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  // Rewrite each quoted string that mentions font-display.
  const after = before.replace(/(["'`])([^"'`]*\bfont-display\b[^"'`]*)\1/g, (m, q, body) => {
    const next = body
      .replace(WEIGHTS, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return next === body.trim() ? m : `${q}${next}${q}`;
  });
  if (after !== before) {
    changed += 1;
    touched.push(file);
    if (!check) writeFileSync(file, after);
  }
}

console.log(`${check ? 'would change' : 'changed'} ${changed} file(s)`);
for (const f of touched) console.log(`  ${f}`);
if (check && changed > 0) process.exit(1);
```

- [ ] **Step 4: Dry-run, then apply the codemod**

```bash
cd ../.. && node apps/storefront/scripts/strip-display-weights.mjs --check
```

Expected: reports roughly 60–70 files. Review the list. Then apply:

```bash
node apps/storefront/scripts/strip-display-weights.mjs
git diff --stat
```

Spot-check three diffs by eye. The codemod only removes weight classes from strings containing `font-display`; if any diff removes something else, revert (`git checkout -- <file>`) and tighten the regex.

- [ ] **Step 5: Verify nothing broke**

```bash
FMT && pnpm -r typecheck
cd apps/storefront && pnpm lint && pnpm test && pnpm build && npx --yes size-limit
```

Expected: all pass. Fonts changed, so **watch `size-limit` and CLS**: if the build warns on layout shift, add `adjustFontFallback` to the Anek declarations.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add apps/storefront/src/app/layout.tsx apps/storefront/scripts/strip-display-weights.mjs
git add -u
git commit -m "feat(type): Young Serif + Anek Latin/Telugu, and fix two font defects

Fixes both defects found in the audit:
- the old Fraunces() call passed weight:['400','600','700'], which loads
  static instances and discards the SOFT and WONK variable axes that are
  Fraunces' entire character
- Tiro Telugu has only 400/400i, so every bold Telugu on the site was
  browser faux-bold, which visibly breaks Indic conjuncts. Anek Telugu is
  variable 100-800.

Anek Latin and Anek Telugu are the same Ek Type superfamily with
identical axes — the only true Latin/Telugu harmony on Google Fonts.
wdth is not requested and the Telugu subset is not preloaded, to protect
the ~4 KB First Load JS headroom and the 2500 ms LCP budget.

Codemod strips the 197 now-dead weight utilities from display text."
```

---

## Task 6: Fix the cascade conflict so per-product theming works

Currently `ActiveThemeProvider` writes **inline styles on `<html>`** while `ThemeVars` writes a **`:root` rule**. Inline always wins, so per-product palettes are dead whenever Supabase is configured. Per-route palettes move to a scoped wrapper.

**Files:**

- Modify: `apps/storefront/src/lib/theme/theme-provider.tsx`
- Modify: `apps/storefront/src/lib/theme/active-theme-context.tsx`
- Modify: `apps/storefront/src/lib/flags/visual-v2.ts`
- Modify: `apps/storefront/src/app/layout.tsx`

**Interfaces:**

- Consumes: `applyPalette`, `paletteToCss`, `writePalette` from `../theme/apply-palette`.
- Produces:
  - `<FlavourScope palette={...}>{children}</FlavourScope>` — server-renderable wrapper replacing `ThemeVars`
  - `getVisualVersion(): 'v2' | 'v3'`

- [ ] **Step 1: Replace `ThemeVars` with a scoped `FlavourScope`**

Rewrite `apps/storefront/src/lib/theme/theme-provider.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FlavourPalette } from './palette';
import { defaultFlavour } from './tokens';
import { paletteToCss, writePalette } from './apply-palette';

/**
 * Scopes a palette to a subtree.
 *
 * WHY A WRAPPER AND NOT :root
 * ---------------------------
 * ActiveThemeProvider writes the site palette as INLINE styles on <html>. The
 * old ThemeVars wrote a `:root{...}` stylesheet rule, and an inline style
 * attribute always beats a rule — so the site preset silently overwrote every
 * per-product palette a few hundred ms after first paint. Per-product theming
 * was effectively dead.
 *
 * Custom properties resolve to the NEAREST declaring ancestor, so declaring
 * them on a wrapper element wins inside that subtree without competing with the
 * root inline write at all. No specificity fight, and it works in SSR.
 *
 * This is also exactly the mechanism behind data-register="bidri".
 */
export function FlavourScope({
  palette,
  children,
  className,
}: {
  palette: FlavourPalette;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-flavour style={cssToStyleObject(paletteToCss(palette))} className={className}>
      {children}
    </div>
  );
}

/** React needs an object, and custom properties are legal keys on it. */
function cssToStyleObject(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i > 0) out[decl.slice(0, i)] = decl.slice(i + 1);
  }
  return out;
}

/**
 * Client-side palette writer for a subtree that cannot use FlavourScope
 * (e.g. a portal). Reverts to the default flavour on unmount.
 */
export function useFlavour(el: HTMLElement | null, palette?: FlavourPalette) {
  useEffect(() => {
    if (!el) return;
    writePalette(el, palette ?? defaultFlavour);
    return () => writePalette(el, defaultFlavour);
  }, [el, palette]);
}
```

- [ ] **Step 2: Update the three `ThemeVars` call sites**

Replace `<ThemeVars palette={x} />` with a wrapper around the page content.

In `apps/storefront/src/app/product/[slug]/page.tsx` (currently line 77), remove the `ThemeVars` element and wrap the returned JSX:

```tsx
import { FlavourScope } from '@/lib/theme/theme-provider';

// ...inside the component's return, replacing <ThemeVars palette={product.theme_palette} />
return <FlavourScope palette={product.theme_palette}>{/* existing page JSX */}</FlavourScope>;
```

Do the same in:

- `apps/storefront/src/app/@modal/(.)product/[slug]/page.tsx` (line 27)
- `apps/storefront/src/app/festivals/[slug]/page.tsx` (line 376)

- [ ] **Step 3: Route `ActiveThemeProvider` through `applyPalette`**

In `apps/storefront/src/lib/theme/active-theme-context.tsx`, replace the block that sets the four properties (currently lines 43–53) with:

```ts
import { writePalette } from './apply-palette';

// ...inside the effect that applied the active palette
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
```

This is what makes the semantic `--color-*` layer follow the active preset — the fix for the 788 broken surfaces and borders.

- [ ] **Step 4: Add the visual-version flag**

Append to `apps/storefront/src/lib/flags/visual-v2.ts`:

```ts
/**
 * Which visual generation the app renders. Stamped onto <html> as data-theme
 * so component-level variants can branch on it.
 *
 * NOTE: unlike the spec's proposal, the TOKEN layer is not gated — keeping a
 * duplicate v2 palette block would re-create the multiple-sources-of-truth
 * problem the redesign exists to remove, and the v2 palette is objectively
 * broken (dead per-product theming; 788 surfaces stay light on dark palettes).
 * This flag gates COMPONENTS only.
 */
export function getVisualVersion(): 'v2' | 'v3' {
  return process.env.NEXT_PUBLIC_VISUAL_VERSION === 'v2' ? 'v2' : 'v3';
}
```

Then in `apps/storefront/src/app/layout.tsx` add `data-theme` to `<html>`:

```tsx
    <html
      lang="en"
      data-theme={getVisualVersion()}
      className={`${youngSerif.variable} ${anekLatin.variable} ${anekTelugu.variable}`}
      suppressHydrationWarning
    >
```

- [ ] **Step 5: Verify per-product theming actually works now**

```bash
cd apps/storefront && pnpm build && pnpm start
```

In a browser at `http://localhost:3000/product/qubani-ka-meetha`:

1. Confirm the page renders its own palette and **does not** revert after ~1 s (the old bug).
2. In devtools, inspect the `[data-flavour]` wrapper and confirm `--color-surface-elevated` is present on it.
3. Open `/product/diwali-premium-hamper` (dark base `#2a1505`) and confirm cards and borders are **dark**, not cream. This is the regression that proves Task 3 landed.

Stop the server.

- [ ] **Step 6: Format, verify, commit**

```bash
cd ../.. && FMT && pnpm -r typecheck
cd apps/storefront && pnpm lint && pnpm test && cd ../..
git add -u
git commit -m "fix(theme): scope per-route palettes so per-product theming works

ActiveThemeProvider writes the site palette as inline styles on <html>;
ThemeVars wrote a :root rule. Inline always wins, so the site preset
silently overwrote every per-product palette shortly after first paint —
per-product theming was dead whenever Supabase was configured.

Per-route palettes now declare on a wrapper element. Custom properties
resolve to the nearest declaring ancestor, so the subtree wins with no
specificity fight, in SSR and on client transitions alike. Same
mechanism as data-register='bidri'.

ActiveThemeProvider now writes through applyPalette, so the semantic
--color-* layer follows the active preset. Dark palettes render dark
surfaces instead of leaving 788 elements light."
```

---

## Task 7: Stop old-brand colour being injected at runtime

Two places actively write pre-redesign colour into the live theme.

**Files:**

- Modify: `apps/storefront/src/components/sections/flavour-atlas.tsx`
- Modify: `apps/storefront/src/lib/supabase/products.ts:210-216`

**Interfaces:**

- Consumes: `PRODUCT_PALETTES`, `LIGHT` from `@/lib/theme/palette`; `useActiveTheme`.
- Produces: nothing importable.

- [ ] **Step 1: Fix the undefined CSS variable**

In `apps/storefront/src/components/sections/flavour-atlas.tsx` lines 122–123, replace `var(--surface-elevated)` with `var(--color-surface-elevated)`. The variable was never defined, so those chips have had no background.

- [ ] **Step 2: Fix the hover-revert bug**

The hover handler writes `--theme-accent`/`--theme-glow` and `revertHoverPalette()` restores them to `defaultFlavour` rather than the **active preset**, so one hover reverts the live palette for up to 60 s.

Replace the six hardcoded `HoverPalette` pairs (lines 30–35) with values derived from `PRODUCT_PALETTES`, and make the revert read the active theme:

```tsx
import { useActiveTheme } from '@/lib/theme/active-theme-context';
import { PRODUCT_PALETTES } from '@/lib/theme/palette';
import { defaultFlavour } from '@/lib/theme/tokens';

// inside the component
const { active } = useActiveTheme();

const revertHoverPalette = useCallback(() => {
  const root = document.documentElement;
  // Revert to the ACTIVE preset, not the compile-time default — otherwise a
  // single hover pins the site to the default palette until the next refresh.
  const accent = active?.palette.accent ?? defaultFlavour.accent;
  const glow = active?.palette.glow ?? defaultFlavour.glow;
  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-glow', glow);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-ring', accent);
}, [active]);
```

Update the hover setter to write `--color-accent` and `--color-ring` alongside `--theme-accent`, so focus rings track the hover state.

- [ ] **Step 3: Replace the orphan admin-product palette**

`apps/storefront/src/lib/supabase/products.ts` lines 210–216 stamp a 27th palette (`brass-ghee`) onto every admin-created product. Replace with:

```ts
import { PRODUCT_PALETTES } from '@/lib/theme/palette';

// ...where the fallback theme_palette was built
  theme_palette: PRODUCT_PALETTES.house,
```

- [ ] **Step 4: Verify**

```bash
cd ../.. && FMT && pnpm -r typecheck
cd apps/storefront && pnpm lint && pnpm test && pnpm build && pnpm start
```

In the browser on `/`: hover a flavour-atlas chip, move away, and confirm the accent returns to anjeer rather than sticking. Stop the server.

- [ ] **Step 5: Commit**

```bash
cd ../..
git add -u
git commit -m "fix(theme): stop old-brand colour entering the live theme

Three defects:
- flavour-atlas referenced var(--surface-elevated), which is not defined
  (the real name is --color-surface-elevated), so those chips never had a
  background
- its hover-revert restored the compile-time default instead of the
  active preset, so a single hover pinned the palette for up to 60s
- lib/supabase/products.ts stamped a 27th orphan brass palette onto every
  admin-created product

Hover now also writes --color-accent/--color-ring so focus rings track it."
```

---

## Task 8: De-hardcode the header

38 hardcoded brass hexes across the megamenu and mobile drawer. The header does not re-theme at all today — the single highest-visibility fix in this plan.

**Files:**

- Modify: `apps/storefront/src/components/header.tsx`

**Interfaces:** none produced.

- [ ] **Step 1: Map every literal to a token**

Work through `header.tsx` and replace using this table. Keep `#25d366` (WhatsApp) — it is a third-party brand colour.

| Old literal                                           | Replacement                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `#fbf3df`, `#f6e8c2`, `#f2e2b6`, `#ecd9a8`, `#e8d8a8` | `bg-surface-elevated` / `bg-surface` / `border-[color:var(--color-border)]` as appropriate to the role |
| `#1f0c02`, `#2e1c04`                                  | `text-theme-ink` / `bg-theme-ink`                                                                      |
| `#1f0c02`/60, `#1f0c02`/70                            | `text-theme-ink/60`, `text-theme-ink/70`                                                               |
| `#8a5a0e`, `#a85a08`, `#f0bd4a`, `#c0592b`            | `text-theme-accent` / `bg-theme-accent`                                                                |
| `#fdf6ec` on a dark ground                            | `text-[color:var(--theme-base)]`                                                                       |
| `#1a0a02`/60 (drawer scrim)                           | `bg-theme-ink/60`                                                                                      |
| `#25d366`                                             | keep — WhatsApp brand                                                                                  |

- [ ] **Step 2: Confirm no hex remains except WhatsApp**

```bash
cd apps/storefront && grep -nE "#[0-9a-fA-F]{3,8}" src/components/header.tsx
```

Expected: only `#25d366`.

- [ ] **Step 3: Verify the header re-themes**

```bash
cd ../.. && FMT && pnpm -r typecheck
cd apps/storefront && pnpm lint && pnpm build && pnpm start
```

In the browser:

1. On `/`, confirm the header and megamenu are on the new palette.
2. On `/product/diwali-premium-hamper` (dark base), confirm the header **inverts correctly** and text stays readable. Previously it stayed brass regardless.
3. Confirm the admin banner still appears when a preset has `bannerText` — `header.tsx:124` is its only consumer.

Stop the server.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add -u
git commit -m "refactor(header): replace 38 hardcoded brass hexes with tokens

The megamenu and mobile drawer used no theme tokens at all, so the
header never re-themed — it stayed brass on every palette, including the
dark product pages. Highest-visibility single fix in the redesign.

Keeps #25d366 (WhatsApp brand) and preserves the bannerText consumer at
header.tsx:124, which is the only reader of the admin theme banner."
```

---

## Task 9: The hardcoded-colour ratchet

Makes the spec's §10 success criteria executable so Plans 2 and 3 can be measured rather than eyeballed.

**Files:**

- Create: `apps/storefront/scripts/colour-audit.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**

- Produces: `pnpm --filter @ravisweets/storefront colour-audit`, exit 1 when the count exceeds the ratchet.

- [ ] **Step 1: Write the audit script**

Create `apps/storefront/scripts/colour-audit.mjs`:

```js
/**
 * Ratchet on hardcoded colour, so the redesign cannot silently regress.
 *
 * The spec's target is <=20 distinct hex literals outside the palette module,
 * covering only third-party brand colours. We start from wherever the tree is
 * now and tighten as Plans 2 and 3 land — the build fails if the number goes UP.
 *
 * Update MAX_* only downward, and say why in the commit message.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

/** Tighten these as Plan 2 and Plan 3 land. Never raise them. */
const MAX_DISTINCT_HEX = 184;
const MAX_PAISLEY = 156;
const MAX_NON_TOKEN_COLOUR_CLASSES = 219;

const ALLOWED = new Set([
  '#25d366', // WhatsApp brand
  '#f58529', // Instagram gradient
  '#dd2a7b',
  '#8134af',
]);

const EXEMPT = ['src/lib/theme/palette.ts', 'src/lib/theme/contrast.ts'];

const files = execSync('git ls-files "apps/storefront/src/**"', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(ts|tsx|css)$/.test(f))
  .filter((f) => !EXEMPT.some((e) => f.endsWith(e)))
  .filter((f) => !f.endsWith('.test.ts'));

const hex = new Set();
let paisley = 0;
let classes = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const v = m[0].toLowerCase();
    if (!ALLOWED.has(v)) hex.add(v);
  }
  paisley += (src.match(/Paisley/g) ?? []).length;
  classes += (
    src.match(
      /\b(?:bg|text|border|ring|from|via|to)-(?:red|emerald|amber|green|blue|slate|gray|zinc|stone)-\d{2,3}\b/g,
    ) ?? []
  ).length;
}

const results = [
  ['distinct hex literals', hex.size, MAX_DISTINCT_HEX],
  ['Paisley references', paisley, MAX_PAISLEY],
  ['non-token colour classes', classes, MAX_NON_TOKEN_COLOUR_CLASSES],
];

let failed = false;
for (const [label, actual, max] of results) {
  const ok = actual <= max;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}: ${actual} (max ${max})`);
}

if (failed) {
  console.error('\nColour ratchet exceeded. Use theme tokens instead of literals.');
  process.exit(1);
}

console.log('\nRatchet headroom — tighten these maxima as Plans 2 and 3 land.');
```

- [ ] **Step 2: Run it and tighten to the actual current numbers**

```bash
cd ../.. && node apps/storefront/scripts/colour-audit.mjs
```

Read the reported actuals and **lower each `MAX_*` to exactly the current value**, so any future increase fails. Re-run to confirm it passes.

- [ ] **Step 3: Wire it into CI**

In `.github/workflows/ci.yml`, add two steps to the `lint` job after `Typecheck all workspaces`:

```yaml
- name: Unit tests
  run: pnpm --filter @ravisweets/storefront test

- name: Colour ratchet
  run: pnpm --filter @ravisweets/storefront colour-audit
```

- [ ] **Step 4: Verify the whole gate suite**

```bash
FMT && pnpm -r typecheck
cd apps/storefront && pnpm lint && pnpm test && pnpm link-check && pnpm build && npx --yes size-limit
cd ../.. && node apps/storefront/scripts/colour-audit.mjs
```

Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/scripts/colour-audit.mjs .github/workflows/ci.yml
git commit -m "ci(theme): ratchet hardcoded colour, paisley and non-token classes

Makes the spec's success criteria executable rather than eyeballed. The
build now fails if the count of hardcoded hex, Paisley references or
non-token colour utilities goes up. Plans 2 and 3 tighten the maxima as
they remove them.

Also runs the unit tests in CI, which had no test step before."
```

---

## Task 10: Verify the foundation end to end

No new code. This task exists because the spec's §10 says verification is by re-running the audit, not by inspection.

**Files:** none.

- [ ] **Step 1: Run every CI gate locally**

```bash
cd /d/2027/susstudio/Projects/ravisweets
pnpm -r typecheck
pnpm --filter @ravisweets/storefront lint
pnpm --filter @ravisweets/storefront test
pnpm --filter @ravisweets/storefront link-check
pnpm --filter @ravisweets/storefront build
node apps/storefront/scripts/colour-audit.mjs
cd apps/storefront && npx --yes size-limit
```

Record each result. **Do not claim success for anything you did not run.**

- [ ] **Step 2: Check accessibility against the hard CI gate**

Lighthouse asserts `categories:accessibility` ≥ 0.95 as an **error**.

```bash
cd apps/storefront && pnpm build && npx --yes @lhci/cli@0.14.x autorun
```

Expected: accessibility ≥ 0.95 on all five audited URLs (`/`, `/category/hyderabadi-specials`, `/product/qubani-ka-meetha`, `/cart`, `/about`). Also confirm LCP < 2500 ms and CLS < 0.1 — **the font swap is the risk here**. If CLS regressed, add `adjustFontFallback: true` to the Anek declarations and re-measure.

- [ ] **Step 3: Manually verify the four things tests cannot cover**

Run `pnpm start` and confirm:

1. `/` renders Anjeer & Pista — pista field, anjeer CTAs, no gold anywhere.
2. `/product/diwali-premium-hamper` renders **dark** surfaces, dark borders and readable text. This is the 788-element bug, fixed.
3. `/product/qubani-ka-meetha` keeps its own palette and does not revert after a second.
4. A `data-register="bidri"` test element re-themes its whole subtree. Add one temporarily to `/about`, confirm, then remove it.

- [ ] **Step 4: Record the outcome in the plan**

Append a short "Plan 1 outcome" section to this file: the measured First Load JS, the Lighthouse accessibility score, the three ratchet numbers, and anything deferred. Commit it.

```bash
cd ../.. && git add docs/superpowers/plans/2026-07-26-storefront-redesign-foundation.md
git commit -m "docs(plan): record Plan 1 foundation outcome and measured budgets"
```

---

## Self-Review

**1. Spec coverage.** Spec §9 phases 1–3 map to Tasks 1–9. §8.1 → Task 2. §8.2 → Task 3. §8.3 → Task 6. §8.4 → Task 4 Step 2. §8.5 partial (flavour-atlas + products.ts fallback in Task 7; header in Task 8; the cursor, order email, `0009` defaults, 26 product-palette assignments, festivals and the stray error reds are **Plan 3**). §8.6 contracts are in Global Constraints and honoured by keeping the four authored keys. §8.7 is implemented with a **documented deviation** (no duplicate v2 palette block). §4 typography → Task 5. §3 palette → Task 2. §10 criteria → Task 9 ratchet + Task 10. §5 katli device, §6 hero and §7 photography are **Plan 2** — correctly out of scope here.

**2. Placeholder scan.** No TBD/TODO. Every code step has real code. The one judgement call left to the implementer (which token replaces which header literal) is given as an explicit mapping table plus a grep that proves completion.

**3. Type consistency.** `FlavourPalette` is defined once in `palette.ts` and re-exported from `tokens.ts`; `applyPalette`/`paletteToCss`/`writePalette` keep the same signatures across Tasks 3, 6 and 7; `PRODUCT_PALETTES` is used in Tasks 2 and 7 with the same shape; `THEME_VAR_NAMES` is asserted in Task 3 and consumed nowhere that could drift. `getVisualVersion()` is defined in Task 6 Step 4 and used in the same step.

**Font signatures verified against the installed typings** (`node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts`), not assumed:

- `Young_Serif` — `options` is **required** and so is `weight: '400' | Array<'400'>`. Subsets are `'latin' | 'latin-ext'` only. The plan matches.
- `Anek_Latin` — subsets `'latin' | 'latin-ext' | 'vietnamese'`; `axes?: 'wdth'[]`, confirming `wght` is implicit and `wdth` is the only optional extra. The plan requests neither `wdth` nor `vietnamese`.
- `Anek_Telugu` — subsets `'latin' | 'latin-ext' | 'telugu'`; same axes shape. The plan matches.

All three declare `weight: 'variable'` where the face is variable, so the axis-discarding defect that broke Fraunces cannot recur silently.

**Two execution bugs caught during review and fixed inline:** `globSync` was imported from `node:fs` in the codemod, which does not exist on Node 20 (pinned by `engines` and CI); and the Anek fonts originally omitted `weight`, which would have relied on implicit variable resolution rather than stating it.
