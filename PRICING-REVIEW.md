# Provisional prices — needs the owner’s eye

Generated 2026-08-13 by `scripts/photography/emit-pricing-review.mjs`.

## What happened

The photography drop of 13 Aug 2026 contained 83 photographs. **57 of them were
sweets the catalogue did not carry at all** — the kalakand bench, the kovas, the
kaja, the burelu, the halwas, Mysore pak, jalebi, pootharekulu and the rest of
the counter range.

Those products are now live on the site. **The drop contained no price list**, so
every rupee figure below was derived here, by taking the per-kilo rate of the
nearest comparable SKU already in the catalogue and rounding to a clean number.

> **None of these came from the shop.** They are plausible, internally consistent
> placeholders — not counter prices. Until each line is confirmed, the site is
> quoting figures nobody at Ravi Sweets has agreed to.

## How to fix a price

Two routes, both fine:

1. **In `/admin`** — edit the variant price. It reaches the live site on the next
   deploy. Best for a handful of corrections.
2. **In the repo** — edit `variantPaiseSmall` / `variantPaiseLarge` in
   `packages/shared/src/catalogue/products.ts` (the values are in paise: `19000`
   renders as ₹190), then run `pnpm run bake:catalogue && pnpm run generate:seed`.
   Best for a full pass down the list.

Then re-run `node --import tsx scripts/photography/emit-pricing-review.mjs` so this
document matches what the site is charging.

## The prices

### biscuits

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Coconut Biscuits | 200 g — **₹108** | 1 kg — **₹430** | ₹430/kg | ☐ |
| Kaju Biscuits | 200 g — **₹180** | 1 kg — **₹720** | ₹720/kg | ☐ |
| Moon Biscuits | 200 g — **₹110** | 1 kg — **₹440** | ₹440/kg | ☐ |

### festival-specials

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Dussehra Gift Box | 1 kg box — **₹1,199** | 2 kg box — **₹2,199** | ₹1,100/kg | ☐ |

### gift-hampers

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Dry Fruits Gift Hamper | 1 kg hamper — **₹1,499** | 2 kg hamper — **₹2,799** | ₹1,400/kg | ☐ |

### savouries

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Gorumitulu | 250 g — **₹120** | 1 kg — **₹480** | ₹480/kg | ☐ |
| Kachuralu | 250 g — **₹120** | 1 kg — **₹480** | ₹480/kg | ☐ |
| Kaju Pakodi | 250 g — **₹225** | 1 kg — **₹900** | ₹900/kg | ☐ |
| Masala Pakodi | 250 g — **₹125** | 1 kg — **₹500** | ₹500/kg | ☐ |
| Navaratna Mixture | 250 g — **₹130** | 1 kg — **₹520** | ₹520/kg | ☐ |
| Sanagalu | 250 g — **₹115** | 1 kg — **₹460** | ₹460/kg | ☐ |
| Vamu Poosa | 250 g — **₹120** | 1 kg — **₹480** | ₹480/kg | ☐ |

### sweet-bites

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Anjeer Bites | Box of 12 — **₹325** | Box of 48 — **₹1,300** | ₹1,300/kg | ☐ |
| Cranberry Bites | Box of 12 — **₹300** | Box of 48 — **₹1,200** | ₹1,200/kg | ☐ |
| Kacha Mango Delight | Box of 12 — **₹300** | Box of 48 — **₹1,200** | ₹1,200/kg | ☐ |
| Mango Delight | Box of 12 — **₹300** | Box of 48 — **₹1,200** | ₹1,200/kg | ☐ |
| Pan Shots | Box of 12 — **₹300** | Box of 48 — **₹1,200** | ₹1,200/kg | ☐ |
| Royal Nutty Dates | Box of 12 — **₹350** | Box of 48 — **₹1,400** | ₹1,400/kg | ☐ |

### sweets

| Product | Small | Large | Implied rate | ✔ |
| --- | --- | --- | --- | --- |
| Ajmer Kalakand | 250 g — **₹225** | 1 kg — **₹900** | ₹900/kg | ☐ |
| Annamayya Laddu | 250 g — **₹175** | 1 kg — **₹700** | ₹700/kg | ☐ |
| Badam Butter Burfi | 250 g — **₹315** | 1 kg — **₹1,250** | ₹1,250/kg | ☐ |
| Badam Pista Kalakand | 250 g — **₹300** | 1 kg — **₹1,200** | ₹1,200/kg | ☐ |
| Badusha | 250 g — **₹140** | 1 kg — **₹560** | ₹560/kg | ☐ |
| Baklava | 250 g — **₹450** | 1 kg — **₹1,800** | ₹1,800/kg | ☐ |
| Bellam Gavvalu | 250 g — **₹130** | 1 kg — **₹520** | ₹520/kg | ☐ |
| Besan Laddu | 250 g — **₹180** | 1 kg — **₹720** | ₹720/kg | ☐ |
| Bobbattu | 250 g — **₹150** | 1 kg — **₹600** | ₹600/kg | ☐ |
| Bombay Halwa | 250 g — **₹175** | 1 kg — **₹700** | ₹700/kg | ☐ |
| Bournvita Kalakand | 250 g — **₹225** | 1 kg — **₹900** | ₹900/kg | ☐ |
| Chitti Kova | 250 g — **₹200** | 1 kg — **₹800** | ₹800/kg | ☐ |
| Dry Fruit Halwa | 250 g — **₹265** | 1 kg — **₹1,050** | ₹1,050/kg | ☐ |
| Ganesh Laddu | 250 g — **₹175** | 1 kg — **₹700** | ₹700/kg | ☐ |
| Ghee Mysore Pak | 250 g — **₹250** | 1 kg — **₹1,000** | ₹1,000/kg | ☐ |
| Gottam Kaja | 250 g — **₹155** | 1 kg — **₹620** | ₹620/kg | ☐ |
| Gujiya | 250 g — **₹175** | 1 kg — **₹700** | ₹700/kg | ☐ |
| Jalebi | 250 g — **₹120** | 1 kg — **₹480** | ₹480/kg | ☐ |
| Kajjikayalu | 250 g — **₹160** | 1 kg — **₹640** | ₹640/kg | ☐ |
| Kaju Bullets | 250 g — **₹375** | 1 kg — **₹1,500** | ₹1,500/kg | ☐ |
| Kaju Chikki | 250 g — **₹300** | 1 kg — **₹1,200** | ₹1,200/kg | ☐ |
| Kaju Kalakand | 250 g — **₹325** | 1 kg — **₹1,300** | ₹1,300/kg | ☐ |
| Kobbari Burelu | 250 g — **₹150** | 1 kg — **₹600** | ₹600/kg | ☐ |
| Kova Billalu | 250 g — **₹215** | 1 kg — **₹850** | ₹850/kg | ☐ |
| Kova Kajjikayalu | 250 g — **₹195** | 1 kg — **₹780** | ₹780/kg | ☐ |
| Loose Kalakand | 250 g — **₹175** | 1 kg — **₹700** | ₹700/kg | ☐ |
| Madatha Kaja | 250 g — **₹160** | 1 kg — **₹640** | ₹640/kg | ☐ |
| Mango Cream | 250 g — **₹205** | 1 kg — **₹820** | ₹820/kg | ☐ |
| Mysore Pak | 250 g — **₹195** | 1 kg — **₹780** | ₹780/kg | ☐ |
| Paneer Jalebi | 250 g — **₹180** | 1 kg — **₹720** | ₹720/kg | ☐ |
| Peda | 250 g — **₹195** | 1 kg — **₹780** | ₹780/kg | ☐ |
| Pineapple Halwa | 250 g — **₹180** | 1 kg — **₹720** | ₹720/kg | ☐ |
| Plain Kalakand | 250 g — **₹190** | 1 kg — **₹760** | ₹760/kg | ☐ |
| Poornalu | 250 g — **₹155** | 1 kg — **₹620** | ₹620/kg | ☐ |
| Pootharekulu | 250 g — **₹275** | 1 kg — **₹1,100** | ₹1,100/kg | ☐ |
| Rava Laddu | 250 g — **₹165** | 1 kg — **₹660** | ₹660/kg | ☐ |
| Sajja Burelu | 250 g — **₹145** | 1 kg — **₹580** | ₹580/kg | ☐ |
| Special Kova | 250 g — **₹225** | 1 kg — **₹900** | ₹900/kg | ☐ |
| Sweet Boondi | 250 g — **₹130** | 1 kg — **₹520** | ₹520/kg | ☐ |

## Also worth a look

- **Descriptions** for all 57 new products were written here too, from what the
  photograph shows and how the sweet is normally made. They read as house copy,
  but nobody at the shop has checked them for accuracy.
- **Weights** default to 250 g / 1 kg (the catalogue’s convention). Anything the
  counter sells by the piece — bobbattu, pootharekulu — may want a count instead.
- **Shelf life and storage** were set by family (7 days for the milk sweets, 15 for
  the fried bench, 21 for the set sweets). Confirm against what the kitchen states.
- **Allergens** are inherited per group. Every sweet here is declared to contain
  dairy and/or nuts, which is the safe direction, but a genuinely nut-free line
  should be corrected so the filter is useful.
