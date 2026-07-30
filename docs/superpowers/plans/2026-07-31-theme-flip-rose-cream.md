# Phase 1 — Theme Flip: Rose & Cream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Anjeer & Pista colour value with the Rose & Cream / Dusk palette from spec §2, renaming the `bidri` register to `dusk`, so the entire site renders the owner-approved identity with the contrast suite green and the colour-audit budget intact.

**Architecture:** Values change; machinery stays. The colour authority is `apps/storefront/src/lib/theme/palette.ts` (re-exported through `tokens.ts`); a deliberate duplicate lives in `packages/shared/src/catalogue/palettes.ts` (the shared package cannot import upward). Everything downstream — `applyPalette()`, the `data-register` mechanism, admin fallbacks, SQL seeds — either derives from these two files or must be edited in lockstep with them. Tests are updated *first* in each task (TDD): the re-authored expectations fail against the old values, then the values land, then they pass.

**Tech Stack:** pnpm 9.15.9 · Next 15.0.2 (App Router) · TypeScript 5.6.3 · Tailwind 3.4 (CSS-var tokens) · Vitest 2.1.8

**Spec:** [`../specs/2026-07-31-shop-at-dusk-redesign-design.md`](../specs/2026-07-31-shop-at-dusk-redesign-design.md) — §2 (palette), §11 (architecture), §12 phase 1 row, §13 (success criteria).

## Global Constraints

- **Package manager is pnpm** (`pnpm@9.15.9`, workspace protocol). Never run `npm install`.
- **Test commands:** `pnpm --filter @ravisweets/storefront test`, `pnpm --filter @ravisweets/storefront typecheck`, `pnpm --filter @ravisweets/shared typecheck`.
- **Contracts that must not break** (spec §11): `FlavourPalette`/`ThemePreset` jsonb keys `{base, accent, glow, ink, grainOpacity}` never rename; the 8 hero text fields' fallback chain untouched; `SUPABASE_CONFIGURED` demo mode untouched.
- **`0008_palette_presets.sql` and the matching block in `SETUP_ALL.sql` must stay byte-identical to each other** (spec §11).
- **`globals.css` first-paint defaults stay byte-identical to `palette.ts`** (existing convention, documented in `globals.css:5-11`).
- **Commit style:** Conventional Commits, as the existing history.
- **The accepted hue exception:** rose `#A8345D` is 3° from Bombay Sweet Shop's wine — owner-accepted (spec §1/§14). Tests pin this; they do not assert ≥25° against BSS.
- Light-register `ink` is `#2E2118` everywhere a light product palette appears; dusk-family ink is `#F6EAD8`.

## The palette, in one place (copy values exactly)

Light register (`ROSE_CREAM`): base `#FAF5E9` · surfaceElevated `#FFFDF6` · ink `#2E2118` · inkMuted `#6B5A48` · accent `#A8345D` · accentDeep `#7C2344` · field/glow `#E8A13C` · varak `#B08D57` · varakRule `#9C7C45`.

Dusk register (`DUSK_TOKENS`): base `#3A1F31` · surfaceElevated `#4A2A3F` · ink `#F6EAD8` · inkMuted `#CBB3A6` · accent `#E8A13C` · accentDeep `#F2B15C` · field/glow `#7C2344` · varak `#D9C6A8` · varakRule `#D9C6A8`.

Product palettes (name → base / accent / glow / ink / grain):
- `house` → `#FAF5E9` / `#A8345D` / `#E8A13C` / `#2E2118` / 0.05
- `badam` (nut-forward; replaces `pista`) → `#F7EFE2` / `#7A4A21` / `#DDBE8E` / `#2E2118` / 0.05
- `gulkand` (dried fruit & floral; replaces `anjeer`) → `#FAEEE9` / `#962D53` / `#E9B9C9` / `#2E2118` / 0.05
- `kesar` (savouries; replaces `savoury`) → `#F8F0DC` / `#7A5A14` / `#DCC372` / `#2E2118` / 0.06
- `hamper` (premium/dark; replaces `vault`) → `#3A1F31` / `#E8A13C` / `#7C2344` / `#F6EAD8` / 0.07

Precomputed WCAG ratios (the tests verify authoritatively): light ink/base 14.3 · inkMuted/base 6.1 · accent/base 5.8 · accentDeep/base 8.9 · ink/field 7.1 · varakRule/base 3.6. Dusk ink/base 12.4 · inkMuted/base 7.4 · accent/base 6.8 · varak/base 8.9 · accentDeep/base 7.9 · ink/field 8.1 · accentDeep/field 5.2. Products: badam 6.5 · gulkand 6.6 · kesar 5.6 · hamper 6.8. **Dropped pairs** (field's role changed from text-panel to glow): light `accent on field` (2.9) and `field on accent` are no longer asserted; dusk `accent on field` (4.4) is asserted at AA_UI 3.0, not AA_TEXT.

## File Structure

| File | Responsibility |
|---|---|
| `apps/storefront/src/lib/theme/palette.ts` | **Rewrite.** The colour authority: both registers, 5 product palettes, competitor hues. |
| `apps/storefront/src/lib/theme/palette.test.ts` | **Rewrite.** Contrast pairs for both registers + products; hue tests pinning the accepted BSS exception. |
| `apps/storefront/src/lib/theme/tokens.ts` | Modify re-exports (renamed constants). |
| `apps/storefront/src/lib/theme/apply-palette.test.ts` | Modify: `BIDRI`→`DUSK` import + labels. |
| `apps/storefront/src/components/cursor/sweet-cursor.tsx` | Modify: `ANJEER_PISTA`→`ROSE_CREAM` import + comment. |
| `apps/storefront/src/components/sections/flavour-atlas.tsx` | Modify: renamed product-palette keys. |
| `apps/storefront/src/lib/supabase/products.ts` | No change (`PRODUCT_PALETTES.house` survives rename). |
| `packages/shared/src/catalogue/palettes.ts` | **Rewrite.** The deliberate duplicate: 5 constants renamed + revalued. |
| `packages/shared/src/catalogue/products.ts` | Modify: constant references (`PISTA`→`BADAM`, `ANJEER`→`GULKAND`, `SAVOURY`→`KESAR`, `VAULT`→`HAMPER`). |
| `apps/storefront/src/app/globals.css` | Modify: `:root` defaults, `bidri`→`dusk` block + values, grain selector. |
| `apps/storefront/src/app/layout.tsx` | Modify: `themeColor` → `#FAF5E9`. |
| `apps/storefront/src/app/page.tsx`, `app/about/page.tsx`, `components/sections/{editorial-band,editorial-scroll-band,signature-moment,gifting-guide}.tsx`, `lib/theme/theme-provider.tsx` | Modify: `bidri`→`dusk` attribute/comment. |
| `apps/storefront/src/components/footer.tsx` | Modify: wrap in `data-register="dusk"`. |
| `apps/storefront/src/components/admin/admin-themes.tsx` | Modify: `FALLBACK_PRESETS` re-authored. |
| `supabase/migrations/0008_palette_presets.sql` | Modify: seed values re-authored. |
| `supabase/SETUP_ALL.sql` | Modify: same palette block byte-identical; promo defaults. |
| `supabase/migrations/0009_promotions.sql` | Modify: `bg_from`/`bg_to`/`fg` defaults → `''` (opt into tokens). |

---

### Task 1: Re-author the colour authority (`palette.ts`) and its test suite

**Files:**
- Modify: `apps/storefront/src/lib/theme/palette.test.ts` (rewrite)
- Modify: `apps/storefront/src/lib/theme/palette.ts` (rewrite)
- Modify: `apps/storefront/src/lib/theme/tokens.ts:15`
- Modify: `apps/storefront/src/lib/theme/apply-palette.test.ts:84,99`
- Modify: `apps/storefront/src/components/cursor/sweet-cursor.tsx:6,34-37`
- Modify: `apps/storefront/src/components/sections/flavour-atlas.tsx:37,44,51,65,72`

**Interfaces:**
- Consumes: `contrastRatio(fg, bg)`, `hueClearance(a, b)` from `./contrast` (unchanged).
- Produces: `ROSE_CREAM: RegisterTokens`, `DUSK_TOKENS: RegisterTokens`, `LIGHT: FlavourPalette`, `DUSK: FlavourPalette`, `PRODUCT_PALETTES: { house, badam, gulkand, kesar, hamper }`, `ProductPaletteName`, `COMPETITOR_HUES` (values unchanged), types `FlavourPalette`/`RegisterTokens` (keys unchanged). Tasks 2–5 rely on these exact names.

- [ ] **Step 1: Rewrite the test file to the new expectations**

Replace the entire contents of `apps/storefront/src/lib/theme/palette.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, hueClearance } from './contrast';
import { COMPETITOR_HUES, DUSK_TOKENS, PRODUCT_PALETTES, ROSE_CREAM } from './palette';

const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('light register — every pair in spec §2.1', () => {
  const t = ROSE_CREAM;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['inkMuted on surfaceElevated', t.inkMuted, t.surfaceElevated, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    // field is the marigold glow: a wash and panel ground for INK, never for
    // accent-coloured text. The old accent-on-field pair is deliberately gone.
    ['ink on field', t.ink, t.field, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['accent on surfaceElevated', t.accent, t.surfaceElevated, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_TEXT],
    ['accentDeep on field', t.accentDeep, t.field, AA_UI],
    ['varakRule on base', t.varakRule, t.base, AA_UI],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('dusk register — every pair in spec §2.2', () => {
  const t = DUSK_TOKENS;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['varak on base', t.varak, t.base, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_UI],
    ['ink on rose panel', t.ink, t.field, AA_TEXT],
    // marigold on the rose panel is UI-decoration scale only, never body text
    ['accent on rose panel', t.accent, t.field, AA_UI],
    ['accentDeep on rose panel', t.accentDeep, t.field, AA_TEXT],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('hue positioning — spec §1: the collision is accepted, not accidental', () => {
  it('clears Cadbury purple, the category owner, by at least 25 degrees', () => {
    expect(
      hueClearance(ROSE_CREAM.accent, COMPETITOR_HUES['Cadbury Dairy Milk (2685C)']),
    ).toBeGreaterThanOrEqual(25);
  });

  it('pins the owner-accepted Bombay Sweet Shop proximity so a future accent change re-evaluates it', () => {
    // Rose #A8345D sits ~3 degrees from BSS wine. The owner was shown this and
    // chose rose anyway (spec 2026-07-31 §1, §14). If this assertion ever
    // fails, the accent moved — re-read that decision before deleting this.
    expect(hueClearance(ROSE_CREAM.accent, COMPETITOR_HUES['Bombay Sweet Shop wine'])).toBeLessThan(
      25,
    );
  });

  it('is exactly the owner-approved rose', () => {
    expect(ROSE_CREAM.accent.toUpperCase()).toBe('#A8345D');
  });
});

describe('product palettes', () => {
  it('stays a small named set', () => {
    expect(Object.keys(PRODUCT_PALETTES)).toEqual([
      'house',
      'badam',
      'gulkand',
      'kesar',
      'hamper',
    ]);
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

- [ ] **Step 2: Run the suite to verify it fails**

Run: `pnpm --filter @ravisweets/storefront test -- src/lib/theme/palette.test.ts`
Expected: FAIL — `ROSE_CREAM`/`DUSK_TOKENS` are not exported (import error).

- [ ] **Step 3: Rewrite `palette.ts`**

Replace the entire contents of `apps/storefront/src/lib/theme/palette.ts` with:

```ts
/**
 * ROSE & CREAM — the single source of truth for every brand colour.
 *
 * The identity's organising image is the Ravi Sweets shopfront at dusk: cream
 * plaster, the rose-striped awning, marigold lamplight in the display windows,
 * brass scale-weights on the counter. Every token maps to that scene.
 *
 * Design decisions encoded here, from
 * docs/superpowers/specs/2026-07-31-shop-at-dusk-redesign-design.md:
 *
 *  - ROSE IS THE OWNER'S CALL. #A8345D sits ~3 degrees from Bombay Sweet
 *    Shop's wine hue. The owner was shown that finding and chose rose anyway
 *    (spec section 1 and 14); palette.test.ts pins the proximity so any future
 *    accent change re-surfaces the decision instead of silently waiving it.
 *  - GOLD IS DEMOTED, NOT DELETED. varak/varakRule are brass, allowed only as
 *    hairlines, dividers and small marks — never fills, frames or gradients.
 *  - MARIGOLD IS THE LAMPLIGHT. The `field` slot (stored as `glow` in the DB
 *    shape) is a warm wash and hover glow, not a text panel; the only text
 *    asserted on it is ink.
 *  - THE TWO REGISTERS SWAP ROLES. Rose is interactive on light and a panel
 *    on dusk; marigold is the glow on light and interactive on dusk.
 *
 * palette.test.ts asserts every contrast pair, so this file cannot drift out
 * of spec silently.
 */

/**
 * The four colours an admin can author via /admin/themes, plus grain.
 *
 * This shape is the `palette` jsonb column on `theme_presets` and the
 * `theme_palette` field on Product. DO NOT rename these keys — the seed SQL
 * and the admin editor depend on them. Note that `glow` is the stored name
 * for what the design calls the "field".
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

/** Light register — the default, used everywhere commerce happens. */
export const ROSE_CREAM: RegisterTokens = {
  base: '#FAF5E9', // cream plaster; never #ffffff
  surfaceElevated: '#FFFDF6', // butter paper
  ink: '#2E2118', // teak counter
  inkMuted: '#6B5A48',
  accent: '#A8345D', // the awning rose — links, filled CTAs
  accentDeep: '#7C2344', // awning in shadow
  field: '#E8A13C', // marigold lamplight — glow washes, never a text panel
  varak: '#B08D57', // brass, decorative only
  varakRule: '#9C7C45', // brass hairline; must clear 3:1, #B08D57 does not
};

/** Dusk register — the hero scene's own sky. Story, festival, corporate, footer. */
export const DUSK_TOKENS: RegisterTokens = {
  base: '#3A1F31', // deep plum dusk
  surfaceElevated: '#4A2A3F',
  ink: '#F6EAD8',
  inkMuted: '#CBB3A6',
  accent: '#E8A13C', // marigold becomes the interactive colour on dark
  accentDeep: '#F2B15C',
  field: '#7C2344', // rose becomes a panel colour on dark
  varak: '#D9C6A8', // brass inlay
  varakRule: '#D9C6A8',
};

/** Reduce a register to the four authored keys the DB and admin understand. */
function toFlavour(t: RegisterTokens, grainOpacity: number): FlavourPalette {
  return { base: t.base, accent: t.accent, glow: t.field, ink: t.ink, grainOpacity };
}

export const LIGHT: FlavourPalette = toFlavour(ROSE_CREAM, 0.05);
export const DUSK: FlavourPalette = toFlavour(DUSK_TOKENS, 0.07);

/**
 * Named product palettes. Every one is a tonal variation of Rose & Cream, so
 * a product page never repaints the site a different brand.
 *
 * NOTE: this set is deliberately duplicated in
 * packages/shared/src/catalogue/palettes.ts (the shared package cannot import
 * upward). If you change a value here, change it there too.
 */
export const PRODUCT_PALETTES = {
  /** Default for sweets — the house palette. */
  house: LIGHT,
  /** Nut-forward: kaju, badam, pista, cashew. Roasted-almond warmth. */
  badam: {
    base: '#F7EFE2',
    accent: '#7A4A21',
    glow: '#DDBE8E',
    ink: '#2E2118',
    grainOpacity: 0.05,
  },
  /** Dried fruit and floral: fig, date, apricot, rose preserves. */
  gulkand: {
    base: '#FAEEE9',
    accent: '#962D53',
    glow: '#E9B9C9',
    ink: '#2E2118',
    grainOpacity: 0.05,
  },
  /** Savouries, namkeens, podis — fried-gold, turmeric-deep. */
  kesar: {
    base: '#F8F0DC',
    accent: '#7A5A14',
    glow: '#DCC372',
    ink: '#2E2118',
    grainOpacity: 0.06,
  },
  /** Premium hampers and drops — the dusk register as a product palette. */
  hamper: DUSK,
} as const satisfies Record<string, FlavourPalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;

/**
 * Measured competitor colours, extracted from live production CSS on
 * 2026-07-26 except Cadbury, which is Pantone 2685C. The accent must clear
 * Cadbury by >=25 degrees; the Bombay Sweet Shop proximity is an accepted,
 * pinned exception — see palette.test.ts.
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

- [ ] **Step 4: Fix the four in-storefront consumers of the renamed exports**

`apps/storefront/src/lib/theme/tokens.ts` line 15 — replace:

```ts
export { ANJEER_PISTA, BIDRI_TOKENS, LIGHT, BIDRI, PRODUCT_PALETTES } from './palette';
```

with:

```ts
export { ROSE_CREAM, DUSK_TOKENS, LIGHT, DUSK, PRODUCT_PALETTES } from './palette';
```

`apps/storefront/src/lib/theme/apply-palette.test.ts` — change the import of `BIDRI` to `DUSK` (top of file) and the two table rows at lines 84 and 99 from `['bidri', BIDRI]` to `['dusk', DUSK]`.

`apps/storefront/src/components/cursor/sweet-cursor.tsx` — line 6: `import { ROSE_CREAM } from '@/lib/theme/palette';`. Lines 34–37 become (marigold diamond with brass edge, legible on both grounds):

```ts
const KATLI_FIELD = ROSE_CREAM.field;
const KATLI_EDGE = ROSE_CREAM.varak;
const KATLI_SCORE = ROSE_CREAM.varakRule;
const KATLI_SHADOW = ROSE_CREAM.ink;
```

Also update the comment above them: replace the sentence mentioning "Pista field" and "bidri gunmetal" with: `Marigold field with a brass edge and score line — the lamplight colours, legible over both the cream ground and the dusk plum one.`

`apps/storefront/src/components/sections/flavour-atlas.tsx` — replace the five renamed key references: lines 37 and 65 `PRODUCT_PALETTES.anjeer` → `PRODUCT_PALETTES.gulkand`; lines 44 and 51 `PRODUCT_PALETTES.pista` → `PRODUCT_PALETTES.badam`; line 72 `PRODUCT_PALETTES.savoury` → `PRODUCT_PALETTES.kesar`. (Line 58 `.house` is unchanged; `lib/supabase/products.ts:212` uses `.house` and is unchanged.)

- [ ] **Step 5: Run the palette suite to verify it passes**

Run: `pnpm --filter @ravisweets/storefront test -- src/lib/theme/palette.test.ts`
Expected: PASS, all pairs. If any single pair fails, nudge the failing value's lightness minimally and re-run — do not delete the assertion (spec §2.1: "nudged, not waived").

- [ ] **Step 6: Run the full storefront test + typecheck**

Run: `pnpm --filter @ravisweets/storefront test` and `pnpm --filter @ravisweets/storefront typecheck`
Expected: apply-palette tests pass with `DUSK`; typecheck clean (any remaining `ANJEER_PISTA`/`BIDRI` reference is a compile error — fix it by renaming at the reference site).

- [ ] **Step 7: Commit**

```bash
git add apps/storefront/src/lib/theme/palette.ts apps/storefront/src/lib/theme/palette.test.ts apps/storefront/src/lib/theme/tokens.ts apps/storefront/src/lib/theme/apply-palette.test.ts apps/storefront/src/components/cursor/sweet-cursor.tsx apps/storefront/src/components/sections/flavour-atlas.tsx
git commit -m "feat(theme): re-author the colour authority to Rose & Cream / Dusk"
```

---

### Task 2: Re-author the shared catalogue palettes (the deliberate duplicate)

**Files:**
- Modify: `packages/shared/src/catalogue/palettes.ts` (rewrite)
- Modify: `packages/shared/src/catalogue/products.ts` (constant references only)

**Interfaces:**
- Consumes: `ThemePalette` from `../types/product` (unchanged).
- Produces: `HOUSE`, `BADAM`, `GULKAND`, `KESAR`, `HAMPER` constants; `PRODUCT_PALETTES = { house, badam, gulkand, kesar, hamper }`; `ProductPaletteName`. `products.ts` references the constants; nothing else in the repo imports the old names (`PISTA`/`ANJEER`/`SAVOURY`/`VAULT`) outside this package — verify with the grep in Step 3.

- [ ] **Step 1: Rewrite `packages/shared/src/catalogue/palettes.ts`**

Replace the five constants and the map (keep the existing header comment's first two paragraphs about why the file exists twice, updating the palette name):

```ts
import type { ThemePalette } from '../types/product';

/**
 * ROSE & CREAM — the five named palettes a product may paint the site with.
 *
 * WHY THIS FILE EXISTS TWICE. The canonical authoring copy lives in the
 * storefront at `apps/storefront/src/lib/theme/palette.ts`, where it is derived
 * from the register token sets and guarded by palette.test.ts. This package
 * cannot import that file: `@ravisweets/shared` is a workspace *dependency of*
 * the storefront, so importing upward would invert the dependency graph and
 * make the shared package unbuildable on its own. The five values below are
 * therefore duplicated verbatim. They are four hex strings and a number each,
 * they change roughly never, and the alternative — hoisting a third package
 * just to hold twenty constants — costs more than it saves.
 *
 * If you change a value here, change it in the storefront copy too.
 */

/** Default for sweets and anything without a stronger signal. */
export const HOUSE: ThemePalette = {
  base: '#FAF5E9',
  accent: '#A8345D',
  glow: '#E8A13C',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Nut-forward: kaju, badam, pista, cashew. Roasted-almond warmth. */
export const BADAM: ThemePalette = {
  base: '#F7EFE2',
  accent: '#7A4A21',
  glow: '#DDBE8E',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Dried fruit and floral: fig, date, apricot/khubani, rose preserves. */
export const GULKAND: ThemePalette = {
  base: '#FAEEE9',
  accent: '#962D53',
  glow: '#E9B9C9',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Savouries, namkeens, pickles, podis — fried-gold, turmeric-deep. */
export const KESAR: ThemePalette = {
  base: '#F8F0DC',
  accent: '#7A5A14',
  glow: '#DCC372',
  ink: '#2E2118',
  grainOpacity: 0.06,
};

/** Premium hampers and drops — the dusk register as a product palette. */
export const HAMPER: ThemePalette = {
  base: '#3A1F31',
  accent: '#E8A13C',
  glow: '#7C2344',
  ink: '#F6EAD8',
  grainOpacity: 0.07,
};

export const PRODUCT_PALETTES = {
  house: HOUSE,
  badam: BADAM,
  gulkand: GULKAND,
  kesar: KESAR,
  hamper: HAMPER,
} as const satisfies Record<string, ThemePalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;
```

- [ ] **Step 2: Rename the constant references in `products.ts`**

In `packages/shared/src/catalogue/products.ts`, the import from `./palettes` and every usage: `PISTA` → `BADAM`, `ANJEER` → `GULKAND`, `SAVOURY` → `KESAR`, `VAULT` → `HAMPER` (`HOUSE` unchanged). Mechanical find-replace within this one file; the trailing comments like `// apricot (khubani) reduction` stay.

- [ ] **Step 3: Verify nothing else references the old names**

Run: `grep -rn "PISTA\|ANJEER\|SAVOURY\|VAULT" packages/ apps/storefront/src --include="*.ts" --include="*.tsx" | grep -v "ANJEER_PISTA"`
Expected: zero hits outside comments/strings describing history. Any code hit = a missed reference; rename it.

- [ ] **Step 4: Typecheck both packages**

Run: `pnpm --filter @ravisweets/shared typecheck && pnpm --filter @ravisweets/storefront typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/catalogue/palettes.ts packages/shared/src/catalogue/products.ts
git commit -m "feat(catalogue): re-author product palettes to the Rose & Cream family"
```

---

### Task 3: First-paint defaults, the dusk register, and the `bidri` rename

**Files:**
- Modify: `apps/storefront/src/app/globals.css:12-89,159`
- Modify: `apps/storefront/src/app/layout.tsx:118`
- Modify: `apps/storefront/src/app/page.tsx:316`
- Modify: `apps/storefront/src/app/about/page.tsx:224`
- Modify: `apps/storefront/src/components/sections/editorial-band.tsx:35,68`
- Modify: `apps/storefront/src/components/sections/editorial-scroll-band.tsx:116`
- Modify: `apps/storefront/src/components/sections/signature-moment.tsx:36`
- Modify: `apps/storefront/src/components/sections/gifting-guide.tsx:36,68`
- Modify: `apps/storefront/src/lib/theme/theme-provider.tsx:25` (comment)

**Interfaces:**
- Consumes: the values from "The palette, in one place" above — they must match `palette.ts` byte-for-byte.
- Produces: the CSS custom properties every component reads; the `data-register="dusk"` attribute contract Tasks 4–5 and later phases rely on.

- [ ] **Step 1: Re-author the `:root` block in `globals.css`**

Replace lines 5–52 (the comment + `:root` block) with:

```css
  /*
   * ROSE & CREAM. These :root values are first-paint defaults only — every
   * one of them is overwritten at runtime by applyPalette() (see
   * src/lib/theme/apply-palette.ts). Keep them byte-identical to
   * ROSE_CREAM in src/lib/theme/palette.ts.
   */
  :root {
    --theme-base: #faf5e9;
    --theme-accent: #a8345d;
    --theme-glow: #e8a13c;
    --theme-ink: #2e2118;
    --theme-grain-opacity: 0.05;

    --color-surface: #faf5e9;
    --color-surface-elevated: #fffdf6;
    --color-text-primary: #2e2118;
    --color-text-muted: #6b5a48;
    --color-accent: #a8345d;
    --color-ring: #a8345d;

    /* Channel twins so Tailwind opacity modifiers work (see tailwind.config.ts). */
    --theme-base-rgb: 250 245 233;
    --theme-accent-rgb: 168 52 93;
    --theme-glow-rgb: 232 161 60;
    --theme-ink-rgb: 46 33 24;
    --color-surface-rgb: 250 245 233;
    --color-surface-elevated-rgb: 255 253 246;
    --color-text-primary-rgb: 46 33 24;
    --color-text-muted-rgb: 107 90 72;
    --color-accent-rgb: 168 52 93;

    /* Non-authored brand constants. */
    --color-field-deep: #7c2344;
    --color-varak: #b08d57;
    --color-varak-rule: #9c7c45;

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
```

- [ ] **Step 2: Replace the bidri block with the dusk register**

Replace the `[data-register='bidri']` block (comment at old lines 54–89) with:

```css
  /*
   * DUSK REGISTER. Any subtree opts in with data-register="dusk" and
   * re-themes with zero component changes, because custom properties resolve
   * to the nearest declaring ancestor. Values match DUSK_TOKENS in palette.ts.
   */
  [data-register='dusk'] {
    --theme-base: #3a1f31;
    --theme-accent: #e8a13c;
    --theme-glow: #7c2344;
    --theme-ink: #f6ead8;
    --theme-grain-opacity: 0.07;

    --color-surface: #3a1f31;
    --color-surface-elevated: #4a2a3f;
    --color-text-primary: #f6ead8;
    --color-text-muted: #cbb3a6;
    --color-accent: #e8a13c;
    --color-ring: #e8a13c;

    --theme-base-rgb: 58 31 49;
    --theme-accent-rgb: 232 161 60;
    --theme-glow-rgb: 124 35 68;
    --theme-ink-rgb: 246 234 216;
    --color-surface-rgb: 58 31 49;
    --color-surface-elevated-rgb: 74 42 63;
    --color-text-primary-rgb: 246 234 216;
    --color-text-muted-rgb: 203 179 166;
    --color-accent-rgb: 232 161 60;

    --color-field-deep: #7c2344;
    --color-varak: #d9c6a8;
    --color-varak-rule: #d9c6a8;

    background-color: var(--theme-base);
    color: var(--theme-ink);
  }
```

Also update the grain selector at old line 159: `[data-register='bidri'] .grain-overlay` → `[data-register='dusk'] .grain-overlay`.

- [ ] **Step 3: Rename every `bidri` attribute usage to `dusk`**

Exhaustive list (verified by grep; re-run `grep -rn "bidri" apps/storefront/src` after editing — expected zero hits):
- `app/page.tsx:316` — `data-register="bidri"` → `data-register="dusk"`
- `app/about/page.tsx:224` — same
- `components/sections/editorial-band.tsx:68` — same; line 35 comment mention → `data-register="dusk"`
- `components/sections/editorial-scroll-band.tsx:116` — same
- `components/sections/signature-moment.tsx:36` — same
- `components/sections/gifting-guide.tsx:36` — `register?: 'bidri'` → `register?: 'dusk'`; line 68 — `register: 'bidri'` → `register: 'dusk'`
- `lib/theme/theme-provider.tsx:25` — comment mention → `data-register="dusk"`

- [ ] **Step 4: Update the PWA theme colour**

`apps/storefront/src/app/layout.tsx:118`: `themeColor: '#F1F0E2'` → `themeColor: '#FAF5E9'`.

- [ ] **Step 5: Verify build-level consistency**

Run: `grep -rn "bidri" apps/storefront/src` (expected: no output), then `pnpm --filter @ravisweets/storefront typecheck && pnpm --filter @ravisweets/storefront test`
Expected: clean and green.

- [ ] **Step 6: Visual smoke check**

With the dev server running (`pnpm dev`), load `http://localhost:3000`. Expected: cream `#FAF5E9` ground, rose CTAs, dark sections now plum instead of gunmetal. (Full walkthrough happens in Task 5.)

- [ ] **Step 7: Commit**

```bash
git add apps/storefront/src/app/globals.css apps/storefront/src/app/layout.tsx apps/storefront/src/app/page.tsx apps/storefront/src/app/about/page.tsx apps/storefront/src/components/sections/editorial-band.tsx apps/storefront/src/components/sections/editorial-scroll-band.tsx apps/storefront/src/components/sections/signature-moment.tsx apps/storefront/src/components/sections/gifting-guide.tsx apps/storefront/src/lib/theme/theme-provider.tsx
git commit -m "feat(theme): rose & cream first paint, bidri register becomes dusk"
```

---

### Task 4: Admin fallbacks and SQL seeds

**Files:**
- Modify: `apps/storefront/src/components/admin/admin-themes.tsx:9-97`
- Modify: `supabase/migrations/0008_palette_presets.sql`
- Modify: `supabase/migrations/0009_promotions.sql:16-18`
- Modify: `supabase/SETUP_ALL.sql` (palette insert block + promotions column defaults)

**Interfaces:**
- Consumes: `ThemePreset` from `@/lib/supabase/themes` (shape unchanged).
- Produces: preset ids `rose-cream`, `saffron-cardamom`, `midnight-saffron`, `dusk-lamplight` — seeded in SQL and mirrored in the admin fallback array. Phase 3a runs these seeds against the fresh Supabase project.

- [ ] **Step 1: Re-author `FALLBACK_PRESETS` in `admin-themes.tsx`**

Replace the four presets (lines 9–97). `pista-rose` becomes the active house preset; `brass-ghee` (a gold identity the spec demotes) becomes the dusk preset; the two saffron presets stay (they contain no retired hexes and remain useful admin options):

```ts
const FALLBACK_PRESETS: ThemePreset[] = [
  {
    id: 'rose-cream',
    name: 'Rose & Cream — the house palette',
    active: true,
    palette: {
      base: '#FAF5E9',
      accent: '#A8345D',
      glow: '#E8A13C',
      ink: '#2E2118',
      grainOpacity: 0.05,
    },
    hero: {
      eyebrow: 'Khammam · Telangana',
      headline: 'The sweetness of Telangana, slow-cooked in Khammam.',
      body: 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.',
      ctaLabel: 'Shop Hyderabadi specials',
      ctaHref: '/category/hyderabadi-specials',
      imageUrl:
        'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png',
    },
    bannerText: null,
  },
  {
    id: 'saffron-cardamom',
    name: 'Saffron & Cardamom — festival crimson',
    active: false,
    palette: {
      base: '#fbf2e6',
      accent: '#b8312c',
      glow: '#f2b96a',
      ink: '#221008',
      grainOpacity: 0.05,
    },
    hero: {
      eyebrow: 'Festival ready',
      headline: 'A box for every occasion — from rakhi to christmas.',
      body: 'Festival hampers, corporate runs, and pre-order drops timed to every Indian calendar.',
      ctaLabel: 'Shop festival hampers',
      ctaHref: '/category/festival-specials',
      imageUrl:
        'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png',
    },
    bannerText: 'Free festival shipping above ₹1499',
  },
  {
    id: 'dusk-lamplight',
    name: 'Dusk & Lamplight — the shop after sunset',
    active: false,
    palette: {
      base: '#3A1F31',
      accent: '#E8A13C',
      glow: '#7C2344',
      ink: '#F6EAD8',
      grainOpacity: 0.07,
    },
    hero: {
      eyebrow: 'Evening counter',
      headline: 'The counter glows until the last box is tied.',
      body: 'Premium hampers, corporate runs, and drop-night exclusives — packed under the lamplight in Khammam.',
      ctaLabel: 'Shop gift hampers',
      ctaHref: '/category/gift-hampers',
      imageUrl: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
    },
    bannerText: null,
  },
  {
    id: 'midnight-saffron',
    name: 'Midnight Saffron — late-festival',
    active: false,
    palette: {
      base: '#1a1208',
      accent: '#f2b96a',
      glow: '#e9b249',
      ink: '#fdf6ec',
      grainOpacity: 0.07,
    },
    hero: {
      eyebrow: 'Late festival drops',
      headline: 'Sweets for the night before the morning prasad.',
      body: 'Saffron-amber boxes for last-mile festival pickups — Khammam + Hyderabad same-day.',
      ctaLabel: 'Shop tonight',
      ctaHref: '/category/sweets',
      imageUrl:
        'https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png',
    },
    bannerText: 'Same-day pickup · Khammam + Hyderabad',
  },
];
```

- [ ] **Step 2: Re-author `0008_palette_presets.sql` to the same four presets**

Replace the file's four `values` tuples so ids/names/palettes/heroes match Step 1 exactly (same order: `rose-cream` active `true`, `saffron-cardamom`, `dusk-lamplight`, `midnight-saffron`). Keep the `update ... set active = false where active;` preamble and the `on conflict (id) do update` clause untouched. Update the header comment's preset names. jsonb keys stay `base/accent/glow/ink/grainOpacity` — values in the same lowercase style as the surrounding file for unchanged presets, and the new hexes uppercase as authored (`'#FAF5E9'` etc.); byte-for-byte consistency with `SETUP_ALL.sql` is what matters.

- [ ] **Step 3: Mirror into `SETUP_ALL.sql`**

Find the `theme_presets` insert block in `supabase/SETUP_ALL.sql` (search for `'pista-rose'`) and replace it with content byte-identical to the block written in Step 2. Verify with:

Run: `git diff --no-index <(grep -A200 "theme_presets" supabase/migrations/0008_palette_presets.sql) <(grep -A200 "theme_presets" supabase/SETUP_ALL.sql)` — or simply open both and confirm the tuple blocks match exactly.

- [ ] **Step 4: Promotions column defaults opt into tokens**

In `supabase/migrations/0009_promotions.sql:16-18` and the same three column definitions inside `SETUP_ALL.sql` (search `bg_from`):

```sql
  bg_from      text not null default '',
  bg_to        text not null default '',
  fg           text not null default '',
```

Rationale (spec §11): `promo-strip.tsx` treats blank as "no campaign colour" and renders on theme tokens; the old defaults were stale brand hexes.

- [ ] **Step 5: Typecheck + tests still green**

Run: `pnpm --filter @ravisweets/storefront typecheck && pnpm --filter @ravisweets/storefront test`
Expected: clean (SQL is not compiled, but the admin-themes edit is).

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/src/components/admin/admin-themes.tsx supabase/migrations/0008_palette_presets.sql supabase/migrations/0009_promotions.sql supabase/SETUP_ALL.sql
git commit -m "feat(theme): rose & cream presets in admin fallbacks and SQL seeds"
```

---

### Task 5: Footer to dusk, colour audit, and the phase gate

**Files:**
- Modify: `apps/storefront/src/components/footer.tsx` (outermost element)
- Verify only: `apps/storefront/src/components/header.tsx`, `apps/storefront/scripts/colour-audit.mjs` budgets

**Interfaces:**
- Consumes: the `data-register="dusk"` contract from Task 3.
- Produces: the phase-1 gate evidence (spec §12 row 1). Phase 2 builds on a passing gate.

- [ ] **Step 1: Wrap the footer in the dusk register**

In `apps/storefront/src/components/footer.tsx`, add `data-register="dusk"` to the outermost `<footer>` element (spec §2.2: the footer is a dusk surface). If the footer carries hardcoded dark-background utility classes on that same element (e.g. fixed `bg-…` hexes or non-token dark classes), replace them with token classes (`bg-theme-base text-theme-ink`) so the register does the theming — but make no structural/content changes.

- [ ] **Step 2: Header check (verify, don't edit)**

Run: `grep -n "#[0-9a-fA-F]\{3,8\}" apps/storefront/src/components/header.tsx`
Expected: zero brand hexes (commit a74c6cb tokenised it). If any brand hex appears, replace with the equivalent token class — that's the "header re-token pass" the spec assigns to phase 1.

- [ ] **Step 3: Run the colour audit**

Run: `pnpm --filter @ravisweets/storefront colour-audit`
Expected: passes within existing budgets (we removed values, added none outside `palette.ts`). If it flags a regression, the offending hex was introduced by this phase — fix it, don't raise the budget.

- [ ] **Step 4: Retired-hex sweep (spec §13 criterion 1)**

Run: `grep -rni "5E2757\|3E1938\|C9D99C\|8FA85C\|4F6024\|EDEFDD\|C6A8BE" apps/storefront/src packages supabase docs/superpowers/plans/2026-07-31-theme-flip-rose-cream.md --include="*.ts" --include="*.tsx" --include="*.css" --include="*.sql"`
Expected: zero hits (this plan file is exempt — it documents them; the grep above includes it only so the implementer consciously confirms the code hits are gone. Code/SQL hits = missed re-authoring; fix them.)

- [ ] **Step 5: Full verification battery**

Run, in order:
```bash
pnpm --filter @ravisweets/shared typecheck
pnpm --filter @ravisweets/storefront typecheck
pnpm --filter @ravisweets/storefront test
pnpm --filter @ravisweets/storefront lint
pnpm --filter @ravisweets/storefront build
```
Expected: all green. `build` is the expensive one; run it last.

- [ ] **Step 6: The route walkthrough (phase gate)**

With `pnpm dev` running, visually confirm rose & cream (no purple/green brand colour, dark sections plum) on each of: `/` · `/shop` · `/category/sweets` · `/product/kaju-katli` (any product) · `/cart` · `/checkout` · `/orders` · `/account` · `/policies/shipping` (any policy) · a bogus URL for the 404 · `/product/bogus` for the product 404 · `/admin` (login screen is enough). Screenshot the homepage for the owner.

- [ ] **Step 7: Commit**

```bash
git add apps/storefront/src/components/footer.tsx
git commit -m "feat(theme): footer joins the dusk register; phase-1 gate walkthrough"
```

---

## Self-review notes (completed)

- **Spec coverage:** §2.1/§2.2 registers → Tasks 1, 3. §2.3 product palettes (both copies) → Tasks 1, 2. §11 re-authored list: `palette.ts` ✓T1, globals ✓T3, seeds + `SETUP_ALL` byte-identity ✓T4, promo defaults `''` ✓T4, cursor ✓T1, `themeColor` ✓T3, admin fallbacks ✓T4. §12 row 1: rename ✓T3, header pass ✓T5.2, footer dusk ✓T5.1, gate walkthrough ✓T5.6. §13: retired-hex sweep ✓T5.4, contrast ✓T1, ratchet ✓T5.3.
- **Deliberate exclusions:** `apply-palette.ts` logic, `contrast.ts`, Tailwind config (all value-agnostic — they read CSS vars/inputs). `product-card.tsx:142` `#15803d` success-green predates this phase and is phase-6 cleanup. `send-order-email` colours are phase 3b (spec §10.10).
- **Type consistency:** exported names `ROSE_CREAM`/`DUSK_TOKENS`/`LIGHT`/`DUSK`/`PRODUCT_PALETTES{house,badam,gulkand,kesar,hamper}` are used identically in Tasks 1–4.
