# Catalogue Imagery Rubric

| Field | Value |
| --- | --- |
| `rubric_captured_on` | 2026-04-23 |
| `owner` | Design / Content |
| `status` | v1 active — enforced by `validate-catalogue.ts` in CI |

Every product's primary image must pass all five criteria below before its `rubric_passed_on` date is set. Until the production photography shoot lands, all imagery is stock (Unsplash / Pexels / public domain) and every rendered instance carries the "Dev only" watermark per the `elevate-storefront-visual-experience` photography-gating requirement.

---

## Pass criteria

### 1. Representativeness
The image must **depict the product as named**. A photo labelled "Kaju Katli" must show silver-leaf cashew diamonds, not a generic sweet tray. A photo labelled "Qubani ka Meetha" must show apricot dessert, not a box of assorted mithai.

**How to check**: a person unfamiliar with the catalogue, given the image alone, must correctly guess the product family (sweet / namkeen / dry fruit / hamper) within 3 seconds. They don't need to name the exact SKU — just the category and plausible subtype.

**Edge case**: composed hampers / combos show an assortment — pass criterion is that the assortment plausibly resembles what's inside the box.

### 2. Palette coherence
The image's **dominant colour family** must match the product's `theme_palette.accent` within a reasonable tolerance so the FlavourAtlas theme-swap feels authentic, not jarring.

**How to check**: squint at the image — if the dominant hue and the `theme_palette.accent` are in the same warm/cool family (amber/brown family; pistachio-green family; ivory/cream family; dark/brass family), pass. If they clash (pistachio-green image paired with a dark-brass palette), fail.

**Fix path**: swap the image, OR override the palette via `theme_palette_override`, OR wait for real photography.

### 3. Resolution and composition
- Minimum **1200 px** on the long edge (for AVIF/WebP responsive-srcset to generate usable variants).
- No blurred product (unless shallow-DoF aesthetic with product in focus).
- No obvious cutting off of the product.
- No competitors' packaging, logos, or watermarks in the frame.

### 4. Rights and attribution
The image source must be one of:
- **Unsplash** with the standard Unsplash Licence (`https://unsplash.com/license`).
- **Pexels** with the Pexels Licence.
- **Public domain** (Wikimedia Commons PD, government-public, etc.).
- **Internal photography** commissioned or owned by Ravi Sweets (once the shoot lands).
- **Explicit written permission** from the creator (archived in `research/licences/`).

Every product entry must set `source_url` to the asset's licence page or its source URL.

### 5. Dev-only watermark still visible
Until the production shoot lands, every rendered hero / card / modal that shows a placeholder image must carry a visible "Dev only" badge in a corner. This is enforced at the component level, not the asset level — the rubric just confirms we haven't mistakenly removed the badge from any surface.

---

## How to pass a new product

1. Pick a candidate image (Unsplash / Pexels).
2. Paste it into the product draft with `alt` text that describes what's actually in the frame.
3. Walk the five criteria above. If any fails, swap.
4. Set `rubric_passed_on` to today's ISO date.
5. Set `source_url` to the licence page.
6. Run `pnpm --filter @ravisweets/storefront validate:catalogue` locally before pushing.

## How to remove a product's pass

If a reviewer flags an image as failing criterion 1 or 2 after merge:

1. Unset the `rubric_passed_on` field (or set it to `''`).
2. The validator will block subsequent builds until a new image is added.
3. Open a quick PR with the fix.

## Edge-case decisions

- **Same image on two products** is permitted if both are plausibly represented (e.g., a sweet-plate macro that could be Kaju Katli OR Gulab Jamun, paired with each). Prefer distinct images; duplicates are technical debt.
- **AI-generated images** are NOT permitted. Stock photography or real photography only.
- **Watermarked stock** from paid services we haven't licensed is NOT permitted. If Unsplash and Pexels don't cover it, commission it.

## Follow-ups

- [ ] When production photography lands, this rubric's criterion 1 & 2 get materially easier — every shot is of the specific SKU, by definition. Re-score every product at that point.
- [ ] Consider adding a criterion 6 (brand-voice consistency — flat vs. angled shot, warm vs. cool lighting) once the photography style guide exists.
