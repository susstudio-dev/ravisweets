// ─── emit-pricing-review.mjs ─────────────────────────────────────────────────
// Writes PRICING-REVIEW.md — every price this repo invented, in one table.
//
//   node --import tsx scripts/photography/emit-pricing-review.mjs
//
// Generated rather than hand-written so the figures cannot drift from the
// catalogue. If a price is corrected in products.ts, re-run this and the
// document agrees again.

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HARDCODED_CATALOGUE } from '../../packages/shared/src/catalogue/products.ts';
import { NEW } from './shot-list.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'PRICING-REVIEW.md');

const newSlugs = new Set(NEW.filter((s) => s.role === 'primary').map((s) => s.slug));
const products = HARDCODED_CATALOGUE.filter((p) => newSlugs.has(p.slug));

const byCategory = new Map();
for (const p of products) {
  if (!byCategory.has(p.category)) byCategory.set(p.category, []);
  byCategory.get(p.category).push(p);
}

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;
const perKg = (v) => Math.round((v.price.amount / v.weight_grams) * 1000);

const lines = [
  '# Provisional prices — needs the owner’s eye',
  '',
  `Generated ${'2026-08-13'} by \`scripts/photography/emit-pricing-review.mjs\`.`,
  '',
  '## What happened',
  '',
  `The photography drop of 13 Aug 2026 contained 83 photographs. **${newSlugs.size} of them were`,
  'sweets the catalogue did not carry at all** — the kalakand bench, the kovas, the',
  'kaja, the burelu, the halwas, Mysore pak, jalebi, pootharekulu and the rest of',
  'the counter range.',
  '',
  'Those products are now live on the site. **The drop contained no price list**, so',
  'every rupee figure below was derived here, by taking the per-kilo rate of the',
  'nearest comparable SKU already in the catalogue and rounding to a clean number.',
  '',
  '> **None of these came from the shop.** They are plausible, internally consistent',
  '> placeholders — not counter prices. Until each line is confirmed, the site is',
  '> quoting figures nobody at Ravi Sweets has agreed to.',
  '',
  '## How to fix a price',
  '',
  'Two routes, both fine:',
  '',
  '1. **In `/admin`** — edit the variant price. It reaches the live site on the next',
  '   deploy. Best for a handful of corrections.',
  '2. **In the repo** — edit `variantPaiseSmall` / `variantPaiseLarge` in',
  '   `packages/shared/src/catalogue/products.ts` (the values are in paise: `19000`',
  '   renders as ₹190), then run `pnpm run bake:catalogue && pnpm run generate:seed`.',
  '   Best for a full pass down the list.',
  '',
  'Then re-run `node --import tsx scripts/photography/emit-pricing-review.mjs` so this',
  'document matches what the site is charging.',
  '',
  '## The prices',
  '',
];

for (const [category, items] of [...byCategory].sort()) {
  lines.push(`### ${category}`, '');
  lines.push('| Product | Small | Large | Implied rate | ✔ |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const p of items.sort((a, b) => a.title.localeCompare(b.title))) {
    const [s, l] = p.variants;
    const rate = perKg(l ?? s);
    lines.push(
      `| ${p.title} | ${s.title} — **${inr(s.price.amount)}** | ${l ? `${l.title} — **${inr(l.price.amount)}**` : '—'} | ${inr(rate)}/kg | ☐ |`,
    );
  }
  lines.push('');
}

lines.push(
  '## Also worth a look',
  '',
  '- **Descriptions** for all ' + newSlugs.size + ' new products were written here too, from what the',
  '  photograph shows and how the sweet is normally made. They read as house copy,',
  '  but nobody at the shop has checked them for accuracy.',
  '- **Weights** default to 250 g / 1 kg (the catalogue’s convention). Anything the',
  '  counter sells by the piece — bobbattu, pootharekulu — may want a count instead.',
  '- **Shelf life and storage** were set by family (7 days for the milk sweets, 15 for',
  '  the fried bench, 21 for the set sweets). Confirm against what the kitchen states.',
  '- **Allergens** are inherited per group. Every sweet here is declared to contain',
  '  dairy and/or nuts, which is the safe direction, but a genuinely nut-free line',
  '  should be corrected so the filter is useful.',
  '',
);

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`[photography] Wrote ${path.relative(ROOT, OUT)} — ${products.length} products to confirm.`);
