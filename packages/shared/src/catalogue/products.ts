import type { CategorySlug, DietaryTag, GarnishMark, Product } from '../types/product';
import { GENERATED_CATALOGUE } from './products.generated';
import { GULKAND, HOUSE, BADAM, KESAR, HAMPER } from './palettes';

/**
 * Ravi Sweets catalogue — single source of truth.
 *
 * Every product here has passed the representativeness rubric at
 * research/catalogue-imagery-rubric.md (see `rubric_passed_on` field).
 * Imagery remains Unsplash-sourced placeholders (watermarked "Dev only"
 * at render time) until the production photography shoot lands per the
 * photography-gating requirement in elevate-storefront-visual-experience.
 *
 * Coverage by category (Apr 2026 — 24 total):
 *   hyderabadi-specials    5   (Qubani, Double ka Meetha, Badam ki Jali, Sheer Khurma, Khubani Mithai)
 *   sweets                 4   (Kaju Katli, Gulab Jamun, Motichoor Ladoo, Cardamom Soan Papdi)
 *   namkeens               3   (Hyderabadi Mixture, Peanut Chivda, Besan Sev)
 *   dry-fruits             2   (Roasted Almonds, Saffron Pistachios)
 *   combos                 3   (Chai-time Combo, Festival Essentials, Office Chai Tray)
 *   gift-hampers           4   (Diwali Premium, Classic Gifting Box, Corporate Essentials, Wedding Trousseau Box)
 *   festival-specials      3   (Raksha Bandhan Thali, Eid Signature, Pongal Pot Set)
 */

const TODAY = '2026-04-25';
const RAVISWEETS_LICENCE = 'https://ravisweets.com';

/**
 * THE PHOTOGRAPH THAT DOES NOT EXIST YET.
 *
 * These used to resolve to `https://ravisweets.com/wp-content/uploads/<file>`
 * — the brand's retired WooCommerce media library. That domain is now this
 * Next site, so every one of the 87 references below returned 404. A crawl of
 * the live site found exactly that: 17 broken internal URLs, and the 10 of
 * them named `*_*-removebg-preview.png` were simultaneously the entire
 * "URLs with underscores" finding. One dead host, two issue classes.
 *
 * Components already refuse to request them (see storefront lib/images.ts),
 * but a URL that is merely un-rendered is still shipped in the RSC payload,
 * still handed to Google in the Product JSON-LD `image` array, and still one
 * careless `.map()` away from being a live 404 again. So the URL is not
 * suppressed at the edge — it is removed at the source.
 *
 * The FILENAME IS DELIBERATELY RETAINED as the argument. It is the shot list:
 * it records which photograph each SKU was matched to, so when the production
 * shoot lands the mapping is still here. Point this at
 * `/products/<file>` once the files exist in public/, and every component,
 * the OG tag and the structured data light up with no other change.
 *
 * THE SHOOT LANDED — 2026-08-13. 83 photographs arrived from the Khammam
 * kitchen and 80 products now call `photo()` below instead. This helper is
 * kept, not deleted, because 29 SKUs are still genuinely unphotographed: the
 * drop contained no jar of pickle, no heap of podi and no bowl of loose nuts.
 * Those keep the placeholder rather than borrow a picture of a different
 * foodstuff. See scripts/photography/shot-list.mjs (STILL_UNSHOT) — that list
 * is the brief for the next shoot.
 */
function pendingPhoto(_file: string): string {
  return '';
}

/**
 * A photograph that EXISTS, in apps/storefront/public/products/.
 *
 * Encoded from the owner's drop by scripts/photography/process.mjs — one
 * 1400×1400 webp per slug, which is why the argument is a slug and not a
 * filename: the processor derives the filename from the same slug, so a name
 * cannot drift out of sync between the two files. Extra gallery angles are
 * `<slug>-2`, `<slug>-3`, … and are passed here in full.
 *
 * Root-relative on purpose. `isUsableImage` accepts any `/`-leading URL
 * unconditionally (it ships with the build, so it always resolves), while the
 * retired ravisweets.com WordPress host stays rejected.
 *
 * BORROWED STAND-INS. Some SKUs pass a slug that is not their own — a product
 * from the same family whose photograph stands in until their own is shot.
 * That is deliberate and owner-approved; every instance is recorded in
 * scripts/photography/shot-list.mjs (BORROWED) and in the generated
 * public/products/manifest.json, and carries alt text describing what the
 * picture actually shows rather than claiming to be the SKU.
 */
function photo(slug: string): string {
  return `/products/${slug}.webp`;
}

/**
 * THEME PALETTES: 26 hand-typed literals, now 5 named ones.
 *
 * Every product carries a `theme_palette` that the storefront swaps onto the
 * :root CSS vars while that product is on screen. Until this commit each of the
 * 31 entries below carried its own inline literal — 26 distinct ones, all from
 * the pre-2026 "brass & ghee" era, all a warm cream base with a brass or rust
 * accent.
 *
 * They were near-identical, but by accident rather than by intent: #f5ead2,
 * #f4ead2 and #f4e9d4 differ by one to three hex digits, which is well under
 * what an eye can resolve. So the catalogue paid for 26 separate brand colours
 * and got the visual benefit of roughly one — while still repainting the site a
 * slightly different brand on every product click, because the values were
 * different enough for the CSS vars to change even when nobody could see it.
 *
 * They now reference five named palettes from ./palettes:
 *
 *   pista    nut-forward — kaju, badam, pista, cashew, walnut
 *   anjeer   dried fruit — fig, date, khajoor, apricot/khubani, cranberry
 *   savoury  savouries, namkeens, mixtures, pickles, podis
 *   vault    premium hampers and the Diwali/Vault drop (the dark register)
 *   house    everything else — the default
 *
 * A product now picks a register, not a colour. Generated groups set one
 * palette for the whole range via `makeProduct` defaults; the handful of SKUs
 * whose defining ingredient sits in a different family (figs inside the
 * nut-heavy dry-fruit range, date laddus inside healthy sweets) override it
 * per SKU with `MiniSku.theme_palette`.
 */
export const HARDCODED_CATALOGUE: Product[] = [
  // ─── Hyderabadi specials ────────────────────────────────────────────────
  {
    id: 'p_qubani',
    slug: 'qubani-ka-meetha',
    title: 'Qubani ka Meetha',
    description:
      'A Hyderabadi Nizami classic — slow-cooked dried apricots reduced in their own syrup for four hours, finished with almond slivers and a spoonful of malai. Made to a recipe carried down from the royal kitchens, and served cold the way Hyderabad has always preferred.',
    category: 'hyderabadi-specials',
    dietary_tags: ['eggless', 'nuts', 'dairy'],
    ingredients: ['Dried apricots', 'Sugar', 'Almonds', 'Saffron', 'Milk cream', 'Cardamom'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Refrigerate. Best consumed chilled within 3 days of opening.',
    shelf_life_days: 7,
    images: [
      { url: pendingPhoto('2025/08/booster.webp'), alt: 'Qubani ka Meetha-style apricot dessert with cream and almonds', width: 1400, height: 1400 },
      { url: pendingPhoto('2025/08/dry-fruit.webp'), alt: 'Close-up showing slivered almonds across the top of the Qubani', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_qubani_250', title: '250 g', weight_grams: 250, price: { amount: 279, currency: 'INR' }, sku: 'RS-QKM-250', stock_available: 32, hsn_code: '2106' },
      { id: 'v_qubani_500', title: '500 g', weight_grams: 500, price: { amount: 499, currency: 'INR' }, sku: 'RS-QKM-500', stock_available: 24, hsn_code: '2106' },
      { id: 'v_qubani_1000', title: '1 kg', weight_grams: 1000, price: { amount: 949, currency: 'INR' }, sku: 'RS-QKM-1000', stock_available: 12, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: GULKAND, // apricot (khubani) reduction
    garnish: 'saffron',
    builder_eligible: true,
    rubric_passed_on: TODAY,
    source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_double_ka_meetha',
    slug: 'double-ka-meetha',
    title: 'Double ka Meetha',
    description:
      "Hyderabad's answer to bread pudding — golden-fried bread soaked overnight in saffron-infused rabri, scattered with chopped pistachios and served warm. The slow soak is what gives it the custard interior and the crisp saffron edge.",
    category: 'hyderabadi-specials',
    dietary_tags: ['nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Bread', 'Full-fat milk', 'Sugar', 'Ghee', 'Saffron', 'Pistachios', 'Cardamom'],
    allergens: ['Gluten', 'Nuts', 'Dairy'],
    storage_instructions: 'Refrigerate. Warm gently before serving.',
    shelf_life_days: 5,
    images: [
      { url: pendingPhoto('2025/09/badam_pista_kalakand-removebg-preview.png'), alt: 'Double ka Meetha-style amber pieces with saffron-rabri and pistachios', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_dkm_250', title: '250 g', weight_grams: 250, price: { amount: 229, currency: 'INR' }, sku: 'RS-DKM-250', stock_available: 24, hsn_code: '2106' },
      { id: 'v_dkm_500', title: '500 g', weight_grams: 500, price: { amount: 399, currency: 'INR' }, sku: 'RS-DKM-500', stock_available: 16, hsn_code: '2106' },
      { id: 'v_dkm_1000', title: '1 kg', weight_grams: 1000, price: { amount: 759, currency: 'INR' }, sku: 'RS-DKM-1000', stock_available: 8, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: HOUSE,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_badam_ki_jali',
    slug: 'badam-ki-jali',
    title: 'Badam ki Jali',
    description:
      'Lace-thin almond discs, crisped with sugar and cardamom until they snap like glass. A delicate Hyderabadi gift favourite — arrives in a tissue-lined tin that keeps them intact through a long journey.',
    category: 'hyderabadi-specials',
    dietary_tags: ['eggless', 'nuts', 'gluten-free'],
    ingredients: ['Almonds', 'Sugar', 'Cardamom', 'Ghee'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in an airtight container away from humidity.',
    shelf_life_days: 21,
    images: [
      { url: photo('badam-butter-burfi'), alt: 'Badam Butter Burfi from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_bkj_250', title: '250 g', weight_grams: 250, price: { amount: 549, currency: 'INR' }, sku: 'RS-BKJ-250', stock_available: 40, hsn_code: '2106' },
      { id: 'v_bkj_500', title: '500 g', weight_grams: 500, price: { amount: 999, currency: 'INR' }, sku: 'RS-BKJ-500', stock_available: 20, hsn_code: '2106' },
      { id: 'v_bkj_1000', title: '1 kg', weight_grams: 1000, price: { amount: 1899, currency: 'INR' }, sku: 'RS-BKJ-1000', stock_available: 10, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: BADAM,
    garnish: 'paisley',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_sheer_khurma',
    slug: 'sheer-khurma',
    title: 'Sheer Khurma',
    description:
      'The Eid and Ramzan morning ritual — vermicelli simmered in full-fat milk with dates, sliced almonds, pistachios, and a breath of rose. We follow the old Deccan method: slow reduce first, garnish later, so the dates give up their perfume without breaking.',
    category: 'hyderabadi-specials',
    dietary_tags: ['nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Vermicelli', 'Full-fat milk', 'Dates', 'Sugar', 'Almonds', 'Pistachios', 'Rose water', 'Cardamom', 'Ghee'],
    allergens: ['Gluten', 'Nuts', 'Dairy'],
    storage_instructions: 'Refrigerate. Warm before serving.',
    shelf_life_days: 5,
    images: [
      { url: pendingPhoto('2025/08/dry-fruit.webp'), alt: 'Sheer Khurma — golden vermicelli with almonds, pistachios and a rose petal', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_skh_250', title: '250 g', weight_grams: 250, price: { amount: 259, currency: 'INR' }, sku: 'RS-SKH-250', stock_available: 28, hsn_code: '2106' },
      { id: 'v_skh_500', title: '500 g', weight_grams: 500, price: { amount: 449, currency: 'INR' }, sku: 'RS-SKH-500', stock_available: 18, hsn_code: '2106' },
      { id: 'v_skh_1000', title: '1 kg', weight_grams: 1000, price: { amount: 849, currency: 'INR' }, sku: 'RS-SKH-1000', stock_available: 9, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: GULKAND, // dates
    garnish: 'rose',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_khubani_mithai',
    slug: 'khubani-dry-fruit-mithai',
    title: 'Khubani Dry-Fruit Mithai',
    description:
      'An opulent cousin of Qubani ka Meetha — apricot paste layered with cashews, almonds, pistachios, and a single thread of edible silver leaf. Cuts cleanly, keeps for weeks, travels well. A Nizami-era trousseau sweet adapted for modern gifting.',
    category: 'hyderabadi-specials',
    dietary_tags: ['eggless', 'nuts', 'gluten-free'],
    ingredients: ['Apricots', 'Cashews', 'Almonds', 'Pistachios', 'Sugar', 'Ghee', 'Cardamom', 'Silver leaf'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in an airtight container in a cool, dry place.',
    shelf_life_days: 30,
    images: [
      { url: photo('dry-fruit-halwa'), alt: 'Dry Fruit Halwa from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_khm_300', title: '300 g', weight_grams: 300, price: { amount: 649, currency: 'INR' }, sku: 'RS-KHM-300', stock_available: 28, hsn_code: '2106' },
      { id: 'v_khm_500', title: '500 g', weight_grams: 500, price: { amount: 999, currency: 'INR' }, sku: 'RS-KHM-500', stock_available: 18, hsn_code: '2106' },
      { id: 'v_khm_1000', title: '1 kg', weight_grams: 1000, price: { amount: 1899, currency: 'INR' }, sku: 'RS-KHM-1000', stock_available: 9, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: GULKAND, // apricot
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Sweets ─────────────────────────────────────────────────────────────
  {
    id: 'p_kaju_katli',
    slug: 'kaju-katli',
    title: 'Kaju Katli',
    description:
      'Silky cashew diamonds wrapped in edible silver leaf, ground to a whisper and cooked in small batches with A-grade cashews and a breath of cardamom. Zero preservatives and no thickeners — just cashew, sugar, ghee.',
    category: 'sweets',
    dietary_tags: ['eggless', 'nuts', 'dairy'],
    ingredients: ['Cashews', 'Sugar', 'Ghee', 'Cardamom', 'Edible silver leaf'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in an airtight container in a cool, dry place.',
    shelf_life_days: 15,
    images: [
      { url: photo('kaju-katli'), alt: 'Kaju Katli diamonds fanned into a star on red cloth, one piece leafed with edible silver, whole cashews scattered beside them', width: 1400, height: 1400 },
      { url: pendingPhoto('2025/09/kaju_kalakand-removebg-preview.png'), alt: 'Cashew Kalakand squares stacked beside the Kaju Katli', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_kaju_250', title: '250 g', weight_grams: 250, price: { amount: 449, currency: 'INR' }, sku: 'RS-KJ-250', stock_available: 48, hsn_code: '2106' },
      { id: 'v_kaju_500', title: '500 g', weight_grams: 500, price: { amount: 849, currency: 'INR' }, sku: 'RS-KJ-500', stock_available: 32, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: BADAM,
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_gulab_jamun',
    slug: 'gulab-jamun',
    title: 'Gulab Jamun',
    description:
      'Khoya dumplings the colour of mahogany, deep-fried and rested overnight in rose-saffron syrup so the sweetness reaches the centre. Served warm, they ooze; served cold, they hold. Either way, the pinch-test at our counter decides when they leave the pan.',
    category: 'sweets',
    dietary_tags: ['dairy', 'contains-ghee'],
    ingredients: ['Khoya (milk solids)', 'Refined flour', 'Sugar', 'Ghee', 'Rose water', 'Saffron', 'Cardamom'],
    allergens: ['Gluten', 'Dairy'],
    storage_instructions: 'Refrigerate. Warm gently before serving.',
    shelf_life_days: 10,
    images: [
      { url: photo('gulab-jamun'), alt: 'Three deep-brown Gulab Jamun, each topped with slivered almond, resting close together on a pale dish', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_gj_500', title: '500 g (12 pieces)', weight_grams: 500, price: { amount: 399, currency: 'INR' }, sku: 'RS-GJ-500', stock_available: 32, hsn_code: '2106' },
      { id: 'v_gj_1000', title: '1 kg (24 pieces)', weight_grams: 1000, price: { amount: 749, currency: 'INR' }, sku: 'RS-GJ-1000', stock_available: 20, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: HOUSE,
    garnish: 'saffron',
    builder_eligible: false, // Too fragile to travel inside a corporate hamper
    rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_motichoor_ladoo',
    slug: 'motichoor-ladoo',
    title: 'Motichoor Ladoo',
    description:
      'The fiddly one — tiny saffron-gold boondi pearls, fried separately, then bound with ghee-scented syrup and formed into ladoos the size of a child\'s fist. Properly made, every pearl keeps its bite. We make them each morning, never overnight.',
    category: 'sweets',
    dietary_tags: ['eggless', 'dairy', 'contains-ghee'],
    ingredients: ['Gram flour', 'Sugar', 'Ghee', 'Saffron', 'Cardamom', 'Melon seeds'],
    allergens: ['Dairy'],
    storage_instructions: 'Store in an airtight container at room temperature.',
    shelf_life_days: 7,
    images: [
      { url: photo('motichoor-ladoo'), alt: 'Motichoor Ladoos with saffron pearls visible across the surface', width: 1400, height: 1400 },
      { url: photo('motichoor-ladoo-2'), alt: 'Four Motichoor Ladoos heaped in a blue-and-white painted bowl against a pink backdrop', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_mtl_6', title: '6 pieces', weight_grams: 300, price: { amount: 279, currency: 'INR' }, sku: 'RS-MTL-6', stock_available: 40, hsn_code: '2106' },
      { id: 'v_mtl_12', title: '12 pieces', weight_grams: 600, price: { amount: 529, currency: 'INR' }, sku: 'RS-MTL-12', stock_available: 24, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE,
    garnish: 'saffron',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Namkeens ───────────────────────────────────────────────────────────
  {
    id: 'p_mixture',
    slug: 'hyderabadi-mixture',
    title: 'Hyderabadi Mixture',
    description:
      'A crunchy medley of gram flour sev, roasted peanuts, curry leaves, and our house masala. Ready for chai and stubbornly moreish. Fried in cold-pressed groundnut oil and sealed the same day.',
    category: 'namkeens',
    dietary_tags: ['vegan', 'nuts'],
    ingredients: ['Gram flour', 'Peanuts', 'Curry leaves', 'Salt', 'House masala', 'Cold-pressed oil'],
    allergens: ['Peanuts', 'Gluten'],
    storage_instructions: 'Store in an airtight container.',
    shelf_life_days: 30,
    images: [
      { url: photo('navaratna-mixture'), alt: 'Navaratna Mixture from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_mix_200', title: '200 g', weight_grams: 200, price: { amount: 139, currency: 'INR' }, sku: 'RS-MIX-200', stock_available: 200, hsn_code: '2106' },
      { id: 'v_mix_400', title: '400 g', weight_grams: 400, price: { amount: 249, currency: 'INR' }, sku: 'RS-MIX-400', stock_available: 120, hsn_code: '2106' },
      { id: 'v_mix_1000', title: '1 kg', weight_grams: 1000, price: { amount: 569, currency: 'INR' }, sku: 'RS-MIX-1000', stock_available: 60, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: KESAR,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_peanut_chivda',
    slug: 'peanut-chivda',
    title: 'Peanut Chivda',
    description:
      'Flattened rice tossed with roasted peanuts, cashew halves, curry leaves, mustard seeds, and a mild chilli tempering. Lighter than the Mixture, perfect for travel. Sealed in a nitrogen-flushed pouch so the first open tastes like the last.',
    category: 'namkeens',
    dietary_tags: ['vegan', 'nuts', 'gluten-free'],
    ingredients: ['Flattened rice', 'Peanuts', 'Cashews', 'Curry leaves', 'Mustard seeds', 'Turmeric', 'Salt'],
    allergens: ['Peanuts', 'Nuts'],
    storage_instructions: 'Store in an airtight container.',
    shelf_life_days: 60,
    images: [
      { url: photo('atukula-mixture'), alt: 'Atukula Mixture from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_pc_150', title: '150 g', weight_grams: 150, price: { amount: 109, currency: 'INR' }, sku: 'RS-PC-150', stock_available: 200, hsn_code: '2106' },
      { id: 'v_pc_300', title: '300 g', weight_grams: 300, price: { amount: 199, currency: 'INR' }, sku: 'RS-PC-300', stock_available: 100, hsn_code: '2106' },
      { id: 'v_pc_1000', title: '1 kg', weight_grams: 1000, price: { amount: 599, currency: 'INR' }, sku: 'RS-PC-1000', stock_available: 50, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: KESAR,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_besan_sev',
    slug: 'besan-sev',
    title: 'Besan Sev',
    description:
      'Thin gram-flour threads, salted and lightly spiced, pressed through a brass mould and crisped in ghee. Clean, pure, unfussy — the namkeen that lives on every Hyderabadi chai tray.',
    category: 'namkeens',
    dietary_tags: ['eggless', 'contains-ghee'],
    ingredients: ['Gram flour', 'Ghee', 'Salt', 'Turmeric', 'Black pepper'],
    allergens: ['Dairy'],
    storage_instructions: 'Store in an airtight container.',
    shelf_life_days: 45,
    images: [
      { url: photo('karapusa'), alt: 'Karapusa — Crispy Karapusa from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_bs_250', title: '250 g', weight_grams: 250, price: { amount: 169, currency: 'INR' }, sku: 'RS-BS-250', stock_available: 80, hsn_code: '2106' },
      { id: 'v_bs_500', title: '500 g', weight_grams: 500, price: { amount: 309, currency: 'INR' }, sku: 'RS-BS-500', stock_available: 40, hsn_code: '2106' },
      { id: 'v_bs_1000', title: '1 kg', weight_grams: 1000, price: { amount: 579, currency: 'INR' }, sku: 'RS-BS-1000', stock_available: 20, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: KESAR,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Dry fruits ─────────────────────────────────────────────────────────
  {
    id: 'p_dry_almonds',
    slug: 'roasted-almonds',
    title: 'Roasted California Almonds',
    description:
      'A-grade California almonds slow-roasted in small trays, lightly salted, and sealed the same hour. Whole nuts, no chaff, no oil slick. A gifting staple that keeps for two months without losing its crunch.',
    category: 'dry-fruits',
    dietary_tags: ['vegan', 'nuts', 'gluten-free'],
    ingredients: ['California almonds', 'Sea salt'],
    allergens: ['Nuts'],
    storage_instructions: 'Store in an airtight container away from humidity.',
    shelf_life_days: 60,
    images: [
      { url: pendingPhoto('2025/08/BADAM.webp'), alt: 'Roasted whole California almonds — whole, hand-sorted, lightly salted', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_alm_200', title: '200 g tin', weight_grams: 200, price: { amount: 399, currency: 'INR' }, sku: 'RS-ALM-200', stock_available: 60, hsn_code: '0802' },
      { id: 'v_alm_500', title: '500 g pack', weight_grams: 500, price: { amount: 949, currency: 'INR' }, sku: 'RS-ALM-500', stock_available: 30, hsn_code: '0802' },
      { id: 'v_alm_1000', title: '1 kg pack', weight_grams: 1000, price: { amount: 1799, currency: 'INR' }, sku: 'RS-ALM-1000', stock_available: 15, hsn_code: '0802' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: false,
    theme_palette: BADAM,
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_dry_pistachios',
    slug: 'saffron-pistachios',
    title: 'Saffron-Salt Pistachios',
    description:
      'Iranian pistachios dry-roasted and finished with a dusting of saffron salt. The salt clings to the shell so each nut arrives with the flavour in the right place. A corporate hamper classic.',
    category: 'dry-fruits',
    dietary_tags: ['vegan', 'nuts', 'gluten-free'],
    ingredients: ['Pistachios', 'Sea salt', 'Saffron'],
    allergens: ['Nuts'],
    storage_instructions: 'Store in an airtight container away from humidity.',
    shelf_life_days: 60,
    images: [
      { url: pendingPhoto('2025/09/anjjeer_katli-removebg-preview.png'), alt: 'Saffron-salt pistachios with shells dusted orange-gold', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_pist_200', title: '200 g tin', weight_grams: 200, price: { amount: 549, currency: 'INR' }, sku: 'RS-PIST-200', stock_available: 48, hsn_code: '0802' },
      { id: 'v_pist_500', title: '500 g pack', weight_grams: 500, price: { amount: 1299, currency: 'INR' }, sku: 'RS-PIST-500', stock_available: 24, hsn_code: '0802' },
      { id: 'v_pist_1000', title: '1 kg pack', weight_grams: 1000, price: { amount: 2499, currency: 'INR' }, sku: 'RS-PIST-1000', stock_available: 12, hsn_code: '0802' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: BADAM,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Combos ─────────────────────────────────────────────────────────────
  {
    id: 'p_combo_chai',
    slug: 'chai-time-combo',
    title: 'Chai-Time Combo',
    description:
      'The afternoon tray: 250 g Besan Sev, 300 g Peanut Chivda, 200 g Roasted Almonds. Enough to feed an office meeting without touching the sweet course. Arrives in a single lacquered box.',
    category: 'combos',
    dietary_tags: ['nuts'],
    ingredients: ['See component SKUs — Besan Sev, Peanut Chivda, Roasted Almonds'],
    allergens: ['Peanuts', 'Nuts', 'Dairy'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 45,
    images: [
      { url: photo('navaratna-mixture'), alt: 'Navaratna Mixture from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cc_750', title: 'Box (750 g total)', weight_grams: 750, price: { amount: 649, currency: 'INR' }, sku: 'RS-CC-750', stock_available: 30, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: KESAR, // sev + chivda + almonds; an all-savoury tray
    garnish: 'pistachio',
    builder_eligible: false, // Meta-item; builders compose directly
    rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_combo_festival',
    slug: 'festival-essentials-combo',
    title: 'Festival Essentials Combo',
    description:
      'A sweet + savoury pair curated for a festival-week table: 500 g Kaju Katli and 400 g Hyderabadi Mixture. The two most requested SKUs from our corporate desk, now as a single package.',
    category: 'combos',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['See component SKUs — Kaju Katli 500g, Hyderabadi Mixture 400g'],
    allergens: ['Nuts', 'Dairy', 'Peanuts'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 15,
    images: [
      { url: photo('dussehra-gift-box'), alt: 'Dussehra Gift Box from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_fc_900', title: 'Box (900 g total)', weight_grams: 900, price: { amount: 999, currency: 'INR' }, sku: 'RS-FC-900', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE, // sweet + savoury pair, neither dominant
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Gift hampers ───────────────────────────────────────────────────────
  {
    id: 'p_diwali_premium',
    slug: 'diwali-premium-hamper',
    title: 'Diwali Premium Hamper',
    description:
      'A hand-packed celebration box: Kaju Katli, Badam ki Jali, Qubani ka Meetha, roasted almonds, pistachios, and a small brass diya — wrapped in silk and sealed with a paisley tag. Our bestselling Diwali gift for 2026.',
    category: 'gift-hampers',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted sweets and dry fruits — see component SKUs for individual details.'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 7,
    images: [
      { url: photo('diwali-premium-hamper'), alt: 'A woven gift basket packed with a tray of assorted sweet bites, dry-fruit pouches, painted clay diyas and wrapped chocolate bars', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_diwali_premium', title: 'Premium box', weight_grams: 1500, price: { amount: 2499, currency: 'INR' }, sku: 'RS-GH-DIWALI-P', stock_available: 60, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: HAMPER,
    garnish: 'paisley',
    builder_eligible: false, // Hampers compose INTO hampers — conflict
    rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_classic_gifting_box',
    slug: 'classic-gifting-box',
    title: 'Classic Gifting Box',
    description:
      'A year-round gifting staple — Kaju Katli, Motichoor Ladoo, Besan Sev, roasted almonds. Matte-cream box with a cream ribbon and a hand-written note card. Sized for a family of four.',
    category: 'gift-hampers',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 10,
    images: [
      { url: photo('dry-fruits-gift-hamper'), alt: 'Dry Fruits Gift Hamper from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cgb_1', title: 'Box', weight_grams: 1200, price: { amount: 1499, currency: 'INR' }, sku: 'RS-GH-CLASSIC', stock_available: 50, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: HOUSE, // the year-round staple, not a premium hamper
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_corporate_essentials',
    slug: 'corporate-essentials-box',
    title: 'Corporate Essentials Box',
    description:
      'Built for a team table — 1 kg of mixed sweets (Kaju Katli + Motichoor Ladoo), 400 g Hyderabadi Mixture, 200 g Roasted Almonds. Plain-cream box, no ribbon, no fuss. Logo-printable for orders of 50+.',
    category: 'gift-hampers',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Peanuts', 'Dairy'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 10,
    images: [
      { url: photo('dry-fruits-gift-hamper'), alt: 'Dry Fruits Gift Hamper from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_ceb_1', title: 'Box', weight_grams: 1600, price: { amount: 1799, currency: 'INR' }, sku: 'RS-GH-CORP', stock_available: 75, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE, // plain-cream corporate box, not a premium hamper
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Festival specials ──────────────────────────────────────────────────
  {
    id: 'p_raksha_thali',
    slug: 'raksha-bandhan-thali',
    title: 'Raksha Bandhan Thali',
    description:
      'A rakhi-ready thali in a travel-safe tin: Motichoor Ladoo, Kaju Katli, Saffron-Salt Pistachios, plus a rakhi thread and roli-chawal kit. Ships anywhere in India; timing is the gift.',
    category: 'festival-specials',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in a cool, dry place.',
    shelf_life_days: 14,
    images: [
      { url: photo('raksha-bandhan-thali'), alt: 'An open green gift box holding a beaded rakhi, wrapped sweets and foil-wrapped chocolates, staged on a mother-of-pearl tray', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_rt_1', title: 'Thali', weight_grams: 800, price: { amount: 999, currency: 'INR' }, sku: 'RS-FS-RAKHI', stock_available: 45, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE,
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_eid_signature',
    slug: 'eid-signature-box',
    title: 'Eid Signature Box',
    description:
      'The full Hyderabadi Eid table in one box: 500 g Sheer Khurma, 500 g Double ka Meetha, Khubani Dry-Fruit Mithai, and Saffron-Salt Pistachios. Ships with reheat instructions for the Sheer Khurma.',
    category: 'festival-specials',
    dietary_tags: ['nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Dairy', 'Gluten'],
    storage_instructions: 'Refrigerate perishable items on arrival. Follow per-item instructions.',
    shelf_life_days: 5,
    images: [
      { url: photo('diwali-premium-hamper'), alt: 'Diwali Premium Hamper from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_es_1', title: 'Box', weight_grams: 2000, price: { amount: 1799, currency: 'INR' }, sku: 'RS-FS-EID', stock_available: 35, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: GULKAND, // sheer khurma + khubani mithai lead the box
    garnish: 'rose',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Catalogue expansion (Apr 2026) ─────────────────────────────────────
  {
    id: 'p_soan_papdi',
    slug: 'cardamom-soan-papdi',
    title: 'Cardamom Soan Papdi',
    description:
      'Flaky, ribbon-thin layers of cardamom-scented sugar and gram flour, folded by hand and pressed into a tin. Each square holds together until you bite, then dissolves like spun silk. Made in our Khammam kitchen the morning it ships.',
    category: 'sweets',
    dietary_tags: ['eggless', 'nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Gram flour', 'Sugar', 'Ghee', 'Cardamom', 'Pistachios', 'Almonds'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in a cool, dry place in an airtight tin.',
    shelf_life_days: 21,
    images: [
      { url: pendingPhoto('2025/09/badam_butter_burfi-removebg-preview.png'), alt: 'Cardamom Soan Papdi-style squares in flaky layers', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_sp_500', title: '500 g tin', weight_grams: 500, price: { amount: 449, currency: 'INR' }, sku: 'RS-SP-500', stock_available: 80, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE,
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_wedding_trousseau',
    slug: 'wedding-trousseau-box',
    title: 'Wedding Trousseau Box',
    description:
      'A premium two-tier box for weddings and engagement gifting — silk-wrapped, paisley-embossed, and packed with Kaju Katli, Badam ki Jali, Saffron-Salt Pistachios, Roasted Almonds, and a sachet of Khubani mithai. Personalised name card included on request.',
    category: 'gift-hampers',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in a cool, dry place. Refrigerate after opening if room temperature exceeds 28°C.',
    shelf_life_days: 30,
    images: [
      { url: photo('diwali-premium-hamper'), alt: 'Diwali Premium Hamper from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_wt_1', title: 'Two-tier box', weight_grams: 2200, price: { amount: 2999, currency: 'INR' }, sku: 'RS-GH-WED', stock_available: 25, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: HAMPER,
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_pongal_pot',
    slug: 'pongal-pot-set',
    title: 'Pongal Pot Set',
    description:
      'A hand-thrown clay pot with a sealed sachet of our Pongal mix — broken cardamom, jaggery, ghee, and de-husked moong — plus a sprig of dried banana leaf. Boil milk, tip in the sachet, and you have Pongal in fifteen minutes. The pot is yours to keep.',
    category: 'festival-specials',
    dietary_tags: ['eggless', 'nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Raw rice', 'Jaggery', 'Ghee', 'Moong dal', 'Cardamom', 'Cashews', 'Raisins'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Sachet keeps 60 days unopened. Pot is gift-only.',
    shelf_life_days: 60,
    images: [
      { url: photo('dussehra-gift-box'), alt: 'Dussehra Gift Box from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_pp_1', title: 'Pot + sachet', weight_grams: 900, price: { amount: 799, currency: 'INR' }, sku: 'RS-FS-PONGAL', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: HOUSE,
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },
  {
    id: 'p_office_chai_tray',
    slug: 'office-chai-tray',
    title: 'Office Chai Tray',
    description:
      'Built for the office tea trolley — a tray with two namkeens, a tin of Besan Sev, a small box of Motichoor Ladoo, and a bag of Roasted Almonds. Lasts an open office a week. Refill SKUs available on subscription.',
    category: 'combos',
    dietary_tags: ['nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Assorted — see component SKUs.'],
    allergens: ['Nuts', 'Dairy', 'Peanuts'],
    storage_instructions: 'Store in a cool, dry place. Reseal each pouch after use.',
    shelf_life_days: 45,
    images: [
      { url: photo('karapusa'), alt: 'Karapusa — Crispy Karapusa from the Ravi Sweets counter', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_oct_1', title: 'Office tray', weight_grams: 1400, price: { amount: 999, currency: 'INR' }, sku: 'RS-CB-OCT', stock_available: 50, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: KESAR, // namkeen-led tray
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: RAVISWEETS_LICENCE,
  },

  // ─── Savouries (Andhra-style chai-time, from ravisweets.com) ────────────
  ...savouriesGroup(),
  // ─── Sweet bites (small-batch flavour bites) ────────────────────────────
  ...sweetBitesGroup(),
  // ─── Dry fruits (whole nuts and dried fruit) ────────────────────────────
  ...dryFruitsGroup(),
  // ─── Pickles (Andhra-style achaar) ──────────────────────────────────────
  ...picklesGroup(),
  // ─── Powders / podis (South-Indian rice-mix podis) ──────────────────────
  ...powdersGroup(),
  // ─── Healthy sweets (laddu range) ───────────────────────────────────────
  ...healthySweetsGroup(),
  // ─── Biscuits ───────────────────────────────────────────────────────────
  ...biscuitsGroup(),

  // ─── THE COUNTER RANGE (added 2026-08-13, with the photography) ─────────
  // 57 sweets that the shop has always sold and this catalogue had never
  // carried. They arrived as photographs, not as a price list — see
  // PRICING-REVIEW.md for every rupee figure below and who has to confirm it.
  ...milkSweetsGroup(),
  ...friedSweetsGroup(),
  ...setSweetsGroup(),
  ...halwaGroup(),
  ...ladduGroup(),
  ...counterHampersGroup(),
];

/**
 * THE CATALOGUE THE SITE ACTUALLY RENDERS.
 *
 * Prefers the database. `products.generated.ts` is baked at build time by
 * `pnpm run generate:catalogue` (scripts/generate-catalogue.mjs), which reads
 * the Supabase `products` and `variants` tables with the anon key and writes
 * them out as a plain module. That is the only way a static export can show
 * database content at all: `output: 'export'` leaves no server to query at
 * request time, so the query happens once, during the build.
 *
 * Until this existed the admin was writing to a database nothing read back —
 * every page, and the admin's own product list, rendered the literal above. A
 * variant edited to ₹1 in Supabase still showed ₹279 on the shop.
 *
 * WHY THE FALLBACK. Reading the database is a network call in a build, and
 * builds run in places where that call can fail: no credentials on a fresh
 * clone, an outage, a paused project, a change to the RLS policy. If any of
 * those blanked the catalogue, a deploy would ship a shop with nothing in it —
 * a far worse outcome than showing slightly stale prices. So the generator
 * refuses to write an empty file, and the `.length` check here is the second
 * line of the same defence: an empty generated array means "I learned nothing",
 * never "the shop is empty".
 *
 * The array above therefore stays the seed of record. It is also what
 * `pnpm run generate:seed` emits into supabase/migrations/0014_seed_products.sql
 * to populate an empty database, which is what closes the loop: hardcoded array
 * → seed → database → admin edits → generated module → site.
 */
export const CATALOGUE: Product[] = GENERATED_CATALOGUE.length
  ? GENERATED_CATALOGUE
  : HARDCODED_CATALOGUE;

// ─── Helpers — group definitions kept at the bottom so the curated SKUs
// above stay easy to scan. Every SKU below is a real Ravi Sweets product
// from ravisweets.com (image URLs verified 2026-04-25).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Pretty-print grams. 1000 → "1 kg", 1500 → "1.5 kg", 250 → "250 g".
 * Avoids the awkward "1000 g" / "2000 g" reading on auto-generated variant
 * titles (the user spotted these on Sweet Bites and similar SKUs).
 */
function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    // Drop trailing .0 so 1000 → "1 kg", 1500 → "1.5 kg".
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1).replace(/\.0$/, '')} kg`;
  }
  return `${grams} g`;
}

interface MiniSku {
  slug: string;
  title: string;
  image: string;
  /**
   * Overrides the generated alt text.
   *
   * Set this whenever `image` points at ANOTHER product's photograph — the
   * owner-approved family stand-ins listed in scripts/photography/shot-list.mjs
   * (BORROWED). The default alt names this SKU, which for a stand-in would tell
   * a screen-reader user the picture is something it is not; the override names
   * what the photograph actually shows.
   */
  imageAlt?: string;
  /**
   * Additional gallery angles, as `photo('<slug>-2')` paths. Only the product
   * page gallery renders these; the card, hero and OG tag all use `image`.
   */
  extraImages?: string[];
  /**
   * Overrides the group's dietary tags and allergens.
   *
   * A group default is a convenience, but a dietary tag is a CLAIM: the
   * biscuits group is declared `vegan`, which is true of the atta-and-Bournvita
   * original and false of the butter shortbreads added beside it. Inheriting
   * the default there would print "vegan" under a butter biscuit. Anything
   * whose ingredients differ from its neighbours' states them here instead.
   */
  dietary_tags?: DietaryTag[];
  allergens?: string[];
  /** Min/max paise — most ravisweets categories sell 250 g + 1 kg variants. */
  variantPaiseSmall: number;
  variantPaiseLarge: number;
  description: string;
  bestseller?: boolean;
  isNew?: boolean;
  builder_eligible?: boolean;
  /**
   * Overrides the group palette for a SKU whose defining ingredient belongs to
   * a different family than the rest of its range — e.g. Anjeer (figs) inside
   * the otherwise nut-forward dry-fruit group.
   */
  theme_palette?: Product['theme_palette'];
}

function makeProduct(
  category: CategorySlug,
  prefix: string,
  s: MiniSku,
  defaults: {
    dietary_tags: DietaryTag[];
    allergens: string[];
    storage_instructions: string;
    shelf_life_days: number;
    theme_palette: Product['theme_palette'];
    garnish: GarnishMark;
    smallTitle?: string;
    largeTitle?: string;
    smallGrams?: number;
    largeGrams?: number;
    /** 'weight' (default) — variants are 250 g / 1 kg etc. 'quantity' — variants are pack-counts. */
    unit_mode?: 'weight' | 'quantity';
  },
): Product {
  const id = `p_${prefix}_${s.slug.replace(/-/g, '_')}`;
  const smallGrams = defaults.smallGrams ?? 250;
  const largeGrams = defaults.largeGrams ?? 1000;
  const smallTitle = defaults.smallTitle ?? formatWeight(smallGrams);
  const largeTitle = defaults.largeTitle ?? formatWeight(largeGrams);
  return {
    id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    category,
    dietary_tags: s.dietary_tags ?? defaults.dietary_tags,
    ingredients: ['See pack label.'],
    allergens: s.allergens ?? defaults.allergens,
    storage_instructions: defaults.storage_instructions,
    shelf_life_days: defaults.shelf_life_days,
    images: [
      { url: s.image, alt: s.imageAlt ?? `${s.title} — photographed at the Khammam kitchen`, width: 1400, height: 1400 },
      ...(s.extraImages ?? []).map((url, i) => ({
        url,
        alt: `${s.title} — additional view ${i + 2}`,
        width: 1400,
        height: 1400,
      })),
    ],
    variants: [
      // Bug fix 2026-05-06: data is stored in paise (matching the field name)
      // but Money.amount is rupees and formatMoney prints it as such. Without
      // the /100 every generated savoury/bite/pickle/etc. was 100× over-priced
      // (e.g. Atukula Mixture showed ₹12,500 instead of ₹125). Round so the
      // displayed amount stays integer-rupee-clean.
      //
      // Bug fix 2026-08-10: the SKU used `slug.slice(0, 6)`, which is not
      // unique. `masala-kaju` and `masala-palli` both truncate to MASALA, and
      // `pappu-chekkalu` and `pappu-chekodi` both to `PAPPU-` — the trailing
      // dash landing inside the 6 characters is also where the malformed
      // `RS-SAV-PAPPU--S` came from. Four SKUs collided in pairs, and because
      // `variants.sku` is `text unique`, 0014_seed_products.sql aborted on its
      // FIRST run with 23505 rather than on a re-run.
      //
      // The whole slug is used now. Slugs are unique across the catalogue, so
      // `RS-<GROUP>-<SLUG>-<SIZE>` is unique by construction rather than by
      // luck. Regenerate the seed after touching this: `pnpm run generate:seed`.
      { id: `${id}_s`, title: smallTitle, weight_grams: smallGrams, price: { amount: Math.round(s.variantPaiseSmall / 100), currency: 'INR' }, sku: `RS-${prefix.toUpperCase()}-${s.slug.toUpperCase()}-S`, stock_available: 60, hsn_code: '2106' },
      { id: `${id}_l`, title: largeTitle, weight_grams: largeGrams, price: { amount: Math.round(s.variantPaiseLarge / 100), currency: 'INR' }, sku: `RS-${prefix.toUpperCase()}-${s.slug.toUpperCase()}-L`, stock_available: 40, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false,
    bestseller: s.bestseller ?? false,
    new: s.isNew ?? true,
    theme_palette: s.theme_palette ?? defaults.theme_palette,
    garnish: defaults.garnish,
    builder_eligible: s.builder_eligible ?? true,
    unit_mode: defaults.unit_mode ?? 'weight',
    rubric_passed_on: TODAY,
    source_url: RAVISWEETS_LICENCE,
  };
}

function savouriesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'atukula-mixture', title: 'Atukula Mixture', image: photo('atukula-mixture'), variantPaiseSmall: 12500, variantPaiseLarge: 50000, description: 'Crisp poha-based mixture with peanuts, curry leaves, and a mild chilli kick — the chai-trolley favourite from our Khammam counter.', bestseller: true },
    { slug: 'chegodilu', title: 'Chegodilu — Crispy Chegodilu', image: photo('chegodilu'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Andhra ring-shaped rice-flour crisps, hand-tied and fried in cold-pressed oil. Snap when you bite, never go soggy in the box.' },
    { slug: 'chekkalu', title: 'Chekkalu — Crunchy Rice Crackers', image: photo('chegodilu'), imageAlt: 'Chegodilu — Crispy Chegodilu from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Thin rice-flour crackers studded with chana dal and ajwain — the Andhra answer to a savoury cookie.' },
    { slug: 'cornflakes-mixture', title: 'Cornflakes Mixture', image: photo('cornflakes-mixture'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Crisp cornflakes tossed with curry leaves, cashew halves, and a saffron tempering. Lighter than the standard mixture.' },
    { slug: 'dal-mudi-snacks', title: 'Dal Mudi Snacks', image: photo('atukula-mixture'), imageAlt: 'Atukula Mixture from the Ravi Sweets counter', variantPaiseSmall: 12500, variantPaiseLarge: 50000, description: 'Puffed rice and split-dal mix, lightly spiced and ready for a chai pour. A house staple since the eighties.', bestseller: true },
    { slug: 'janthikalu', title: 'Janthikalu', image: photo('murukulu'), imageAlt: 'Murukulu from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spiral rice-and-gram-flour twirls pressed through a brass mould — the Andhra-style janthikalu we still hand-press each morning.' },
    { slug: 'kara-boondhi', title: 'Kara Boondhi', image: photo('navaratna-mixture'), imageAlt: 'Navaratna Mixture from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spicy gram-flour pearls tempered with curry leaves and dried red chilli. Pairs with curd-rice or stands alone with chai.' },
    { slug: 'karapusa', title: 'Karapusa — Crispy Karapusa', image: photo('karapusa'), variantPaiseSmall: 11000, variantPaiseLarge: 43000, description: 'Salted gram-flour sev pressed thin and crisped in ghee. Clean, sharp, the namkeen on every Telugu chai tray.' },
    { slug: 'masala-kaju', title: 'Masala Kaju — Spicy Cashew', image: photo('masala-kaju'), variantPaiseSmall: 37000, variantPaiseLarge: 148000, description: 'A-grade cashews tossed in our house masala — chilli, garlic, lime — and slow-roasted. Premium cocktail-hour snack.', bestseller: true },
    { slug: 'masala-palli', title: 'Masala Palli — Spicy Peanut Masala', image: photo('palli-pakodi'), imageAlt: 'Palli Pakodi — Crispy Peanut Pakodi from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Roasted peanuts coated in a thin spiced gram-flour batter. The standard-bearer of an Andhra evening.' },
    { slug: 'murukulu', title: 'Murukulu', image: photo('murukulu'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Concentric rice-flour spirals — South India\'s favourite tea-time twist. Crisp at the edge, tender at the centre.' },
    { slug: 'onion-ribbon-pakodi', title: 'Onion Ribbon Pakodi', image: photo('masala-pakodi'), imageAlt: 'Masala Pakodi from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Wide gram-flour ribbons fried with caramelised onion shards. Sweet-savoury, addictive.' },
    { slug: 'palli-pakodi', title: 'Palli Pakodi — Crispy Peanut Pakodi', image: photo('palli-pakodi'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Bite-sized peanut clusters in a gram-flour batter. The travel-snack we sell most by weight.' },
    { slug: 'pappu-chekkalu', title: 'Pappu Chekkalu — Chekkalu with Chana Dal', image: photo('chegodilu'), imageAlt: 'Chegodilu — Crispy Chegodilu from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Chekkalu loaded with chana dal for a heartier crunch. Stays good for a month in the tin.' },
    { slug: 'pappu-chekodi', title: 'Pappu Chekodi', image: photo('chegodilu'), imageAlt: 'Chegodilu — Crispy Chegodilu from the Ravi Sweets counter', variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spiral chegodilu enriched with chana dal — extra crunch, extra protein, same Andhra recipe.' },
    // ── added 2026-08-13 with the photography (see PRICING-REVIEW.md) ──
    { slug: 'navaratna-mixture', title: 'Navaratna Mixture', image: photo('navaratna-mixture'), variantPaiseSmall: 13000, variantPaiseLarge: 52000, description: 'Nine components in one tin — sev, boondi, peanut, cashew, curry leaf, raisin, dal, poha and chip. The mixture people compare all the others against.', bestseller: true },
    { slug: 'masala-pakodi', title: 'Masala Pakodi', image: photo('masala-pakodi'), variantPaiseSmall: 12500, variantPaiseLarge: 50000, description: 'Ragged gram-flour pakodi thrown with onion, chilli and ajwain, fried dark. Craggy edges hold the masala.' },
    { slug: 'kaju-pakodi', title: 'Kaju Pakodi', image: photo('kaju-pakodi'), variantPaiseSmall: 22500, variantPaiseLarge: 90000, description: 'Whole cashews jacketed in a thin spiced batter and fried until the nut inside toasts. The premium end of the pakodi tray.' },
    { slug: 'gorumitulu', title: 'Gorumitulu', image: photo('gorumitulu'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Knuckle-sized rice-flour nuggets, salted and fried hard — the Andhra snack that keeps a month and never softens.' },
    { slug: 'kachuralu', title: 'Kachuralu', image: photo('kachuralu'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Twisted ribbons of spiced rice dough, fried to a deep crunch. Eaten by the fistful with evening chai.' },
    { slug: 'sanagalu', title: 'Sanagalu', image: photo('sanagalu'), variantPaiseSmall: 11500, variantPaiseLarge: 46000, description: 'Roasted chana tossed with salt, chilli and curry leaf. The plainest thing on the shelf and the one that empties fastest.' },
    { slug: 'vamu-poosa', title: 'Vamu Poosa', image: photo('vamu-poosa'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Ajwain-heavy sev pressed fine — carom seed is the whole point, and it settles a heavy meal.' },
  ];
  return items.map((s) =>
    makeProduct('savouries', 'sav', s, {
      dietary_tags: ['eggless'],
      allergens: ['Gluten', 'Peanuts'],
      storage_instructions: 'Store in an airtight container away from humidity.',
      shelf_life_days: 60,
      theme_palette: KESAR,
      garnish: 'pistachio',
    }),
  );
}

function sweetBitesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'butterscotch-bites', title: 'Butterscotch Bites', image: photo('butterscotch-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Caramel-toffee bites with a crackle of butterscotch. Sized for a single bite, packed for sharing.' },
    { slug: 'choco-bites', title: 'Choco Bites', image: photo('choco-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Dark-chocolate truffle bites rolled in cocoa nibs. Made with single-origin cacao, set firm.' },
    { slug: 'kaju-bites', title: 'Kaju Bites', image: photo('kaju-bites'), extraImages: [photo('kaju-bites-2')], variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Cashew-paste bites finished with a touch of cardamom. The little-cousin of our Kaju Katli.', bestseller: true, theme_palette: BADAM },
    { slug: 'kesar-bites', title: 'Kesar Bites', image: photo('mango-delight'), imageAlt: 'Mango Delight from the Ravi Sweets counter', variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Saffron-perfumed milk-fudge bites with slivered pistachios on top. A festive favourite.' },
    { slug: 'khajoor-bites', title: 'Khajoor Bites', image: photo('royal-nutty-dates'), imageAlt: 'Royal Nutty Dates from the Ravi Sweets counter', variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Date-paste bites bound with cashew and almond — no added sugar, all the natural sweetness of khajoor.', theme_palette: GULKAND },
    { slug: 'mango-crunch-bites', title: 'Mango Crunch Bites', image: photo('kacha-mango-delight'), imageAlt: 'Kacha Mango Delight from the Ravi Sweets counter', variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Aam-paste bites with a layer of crispy crunch through the centre. Summer in a bite.' },
    { slug: 'mixed-bites', title: 'Mixed Bites', image: photo('tutti-frutti-bites'), imageAlt: 'Tutti Frutti Bites from the Ravi Sweets counter', variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'A sampler box — six flavours in one tin so you can pick a favourite before committing.', bestseller: true },
    { slug: 'oreo-bites', title: 'Oreo Bites', image: photo('oreo-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Crushed-cookie bites bound with milk-fudge — the kid-favourite SKU on our counter.' },
    { slug: 'pineapple-bites', title: 'Pineapple Bites', image: photo('pineapple-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Tangy pineapple-paste bites with a citrus snap. Refreshing on a Hyderabadi afternoon.' },
    { slug: 'silky-bites', title: 'Silky Bites', image: photo('silky-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Cream-and-cardamom bites with a silken set. Melts on the tongue, finishes with cardamom.' },
    { slug: 'strawberry-bites', title: 'Strawberry Bites', image: photo('cranberry-bites'), imageAlt: 'Cranberry Bites from the Ravi Sweets counter', variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Strawberry-paste bites with a thin chocolate shell. Sweet meets tart in a clean finish.' },
    { slug: 'tutti-frutti-bites', title: 'Tutti Frutti Bites', image: photo('tutti-frutti-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Candied-fruit bites flecked through soft milk-fudge. The cheerful one in the tin.' },
    // ── added 2026-08-13 with the photography (see PRICING-REVIEW.md) ──
    { slug: 'anjeer-bites', title: 'Anjeer Bites', image: photo('anjeer-bites'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Dried figs minced and pressed with pistachio into a dense bite. No added sugar — the fig carries it.', theme_palette: GULKAND },
    { slug: 'cranberry-bites', title: 'Cranberry Bites', image: photo('cranberry-bites'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Dried cranberry worked through a cashew base — tart against sweet, and the pink runs right through.', theme_palette: GULKAND },
    { slug: 'mango-delight', title: 'Mango Delight', image: photo('mango-delight'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Ripe mango pulp set firm with khoya and cut into squares. Made only while the Banganapalle season runs.' },
    { slug: 'kacha-mango-delight', title: 'Kacha Mango Delight', image: photo('kacha-mango-delight'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'The green-mango version — sharper, more sour, finished with a pinch of salt. Divides the counter down the middle.' },
    { slug: 'pan-shots', title: 'Pan Shots', image: photo('pan-shots'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Betel-leaf, gulkand and fennel set into a single cool bite — the paan you would be handed after dinner, without the leaf to fold.', bestseller: true, theme_palette: GULKAND },
    { slug: 'royal-nutty-dates', title: 'Royal Nutty Dates', image: photo('royal-nutty-dates'), variantPaiseSmall: 35000, variantPaiseLarge: 140000, description: 'Whole dates stoned and stuffed with almond, cashew and pistachio. Sweetened by nothing but the fruit.', theme_palette: GULKAND },
  ];
  return items.map((s) =>
    makeProduct('sweet-bites', 'bite', s, {
      dietary_tags: ['eggless', 'nuts', 'dairy'],
      allergens: ['Nuts', 'Dairy'],
      storage_instructions: 'Refrigerate. Bring to room temperature before serving.',
      shelf_life_days: 21,
      theme_palette: HOUSE,
      garnish: 'rose',
      smallGrams: 250,
      largeGrams: 1000,
      smallTitle: 'Box of 12',
      largeTitle: 'Box of 48',
      unit_mode: 'quantity',
    }),
  );
}

function dryFruitsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'anjeer-whole', title: 'Anjeer — Premium Dried Figs', image: photo('anjeer-bites'), imageAlt: 'Anjeer Bites from the Ravi Sweets counter', variantPaiseSmall: 32500, variantPaiseLarge: 260000, description: 'A-grade dried figs, soft-set and naturally sweet. Our most-asked-for dry fruit at the Kondapur counter.', theme_palette: GULKAND },
    { slug: 'badam-almonds', title: 'Badam — Whole Almonds', image: pendingPhoto('2025/08/BADAM.webp'), variantPaiseSmall: 20000, variantPaiseLarge: 160000, description: 'Whole California almonds, hand-sorted and sealed the same week. Zero broken pieces, no chaff.', bestseller: true },
    { slug: 'cranberry', title: 'Cranberry', image: photo('cranberry-bites'), imageAlt: 'Cranberry Bites from the Ravi Sweets counter', variantPaiseSmall: 25000, variantPaiseLarge: 200000, description: 'Sweet-tart dried cranberries — perfect on a granola plate or stirred into your morning yogurt.', theme_palette: GULKAND },
    { slug: 'kaju-cashew', title: 'Kaju — Whole Cashews', image: pendingPhoto('2025/08/WhatsApp-Image-2023-08-11-at-4.46.50-PM-400x400.jpeg'), variantPaiseSmall: 25500, variantPaiseLarge: 180000, description: 'Premium W240 cashews — whole, plump, no splits. Sealed in nitrogen pouches for a six-month shelf life.', bestseller: true },
    { slug: 'pista-whole', title: 'Pista — Whole Pistachios', image: pendingPhoto('2025/08/PISTA.webp'), variantPaiseSmall: 40000, variantPaiseLarge: 320000, description: 'Iranian pistachios with a generous shell-split. Snack-grade, crunch-grade, gift-grade.' },
    { slug: 'salted-pista', title: 'Salted Pista', image: pendingPhoto('2025/08/SALTED-PISTA.webp'), variantPaiseSmall: 40000, variantPaiseLarge: 320000, description: 'The same Iranian pistachios, dry-roasted and lightly salted. Travel-tin packaging.' },
    { slug: 'walnuts', title: 'Walnuts — Akhrot', image: pendingPhoto('2025/08/WALNUT.webp'), variantPaiseSmall: 41300, variantPaiseLarge: 330000, description: 'Light-amber walnut halves from the Kashmir trade — lower bitterness, higher omega-3.' },
  ];
  return items.map((s) =>
    makeProduct('dry-fruits', 'df', s, {
      dietary_tags: ['vegan', 'nuts', 'gluten-free'],
      allergens: ['Nuts'],
      storage_instructions: 'Store in an airtight container away from humidity.',
      shelf_life_days: 180,
      theme_palette: BADAM, // nut-majority range; figs and cranberry opt out per SKU
      garnish: 'silver',
      smallGrams: 250,
      largeGrams: 2000,
    }),
  );
}

function picklesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'allam-pickle', title: 'Allam Pickle — Homemade Ginger Pickle', image: pendingPhoto('2025/08/allam.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Sharp-fresh ginger pickle in cold-pressed sesame oil and tamarind. Andhra grandmother\'s recipe.' },
    { slug: 'amla-pickle', title: 'Amla Pickle — Usirikaya Pickle', image: pendingPhoto('2025/08/amla-1.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Whole gooseberries cured with mustard, fenugreek and red chilli. Vitamin-C in a jar.' },
    { slug: 'chicken-pickle', title: 'Chicken Pickle', image: pendingPhoto('2025/08/chicken-pickel.webp'), variantPaiseSmall: 25000, variantPaiseLarge: 100000, description: 'Boneless country-chicken simmered down with whole spices and sealed under oil. Travels three weeks unrefrigerated.' },
    { slug: 'chintakaya-pickle', title: 'Chintakaya Pickle — Tamarind Pickle', image: pendingPhoto('2025/08/chintakaya.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Green-tamarind pickle with the Andhra trifecta — chilli, garlic, sesame oil. Pairs with curd-rice.' },
    { slug: 'gongura-pickle', title: 'Gongura Pickle — Sorrel Leaf Pickle', image: pendingPhoto('2025/08/gongura.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'The signature Andhra pickle — sorrel leaves slow-cooked into a fiery, tangy mash. Eat with hot rice and ghee.', bestseller: true },
    { slug: 'kakarakaya-pickle', title: 'Kakarakaya Pickle — Bitter Gourd Pickle', image: pendingPhoto('2025/08/kakarakaya.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Bitter gourd cured with jaggery to take the edge off, then finished with mustard tempering.' },
    { slug: 'lemon-pickle', title: 'Lemon Pickle — Nimmakaya Pachadi', image: pendingPhoto('2025/08/lemon.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Whole lemon segments salted, sun-cured, and finished with chilli. The all-rounder pickle.' },
    { slug: 'masala-mango-pickle', title: 'Masala Mango Pickle', image: pendingPhoto('2025/08/small-pieces-mango.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Raw mango cubes in a thick mustard-fenugreek masala. The Andhra summer pickle, made all year.' },
  ];
  return items.map((s) =>
    makeProduct('pickles', 'pkl', s, {
      dietary_tags: ['eggless'],
      allergens: ['Mustard'],
      storage_instructions: 'Store in a cool, dry place. Always use a dry spoon. Refrigerate after opening.',
      shelf_life_days: 365,
      theme_palette: KESAR,
      garnish: 'paisley',
      smallGrams: 200,
      largeGrams: 1000,
    }),
  );
}

function powdersGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'kandi-podi', title: 'Kandi Podi — Toor Dal Podi', image: pendingPhoto('2025/08/KANDI-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17200, description: 'Roasted toor-dal powder with chilli and garlic. Mix with hot rice and ghee — instant comfort meal.', bestseller: true },
    { slug: 'karam-podi', title: 'Karam Podi — Aromatic Spice Powder', image: pendingPhoto('2025/08/KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'The all-purpose South Indian podi — chilli, urad dal, channa dal, sesame, garlic. Tear, tip, eat.' },
    { slug: 'karivepaku-podi', title: 'Karivepaku Podi — Curry Leaf Powder', image: pendingPhoto('2025/08/CURRY-LEAVES-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Curry-leaf powder with toasted dals — the iron-rich podi grandmothers swear by.' },
    { slug: 'kobbari-karam-podi', title: 'Kobbari Karam Podi — Coconut Powder', image: pendingPhoto('2025/08/KOBARI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Toasted-coconut podi with red chilli — a sweet-spicy contrast to the dal-heavy podis.' },
    { slug: 'nalla-karam-podi', title: 'Nalla Karam Podi — Spicy Black Powder', image: pendingPhoto('2025/08/NALLA-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Black-pepper-forward Andhra podi for the heat-seekers. Use sparingly.' },
    { slug: 'nuvvula-karam-podi', title: 'Nuvvula Karam Podi — Sesame Powder', image: pendingPhoto('2025/08/NUVULA-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Toasted sesame podi with chilli — calcium-rich, deeply nutty.' },
    { slug: 'palli-karam-podi', title: 'Palli Karam Podi — Peanut Powder', image: pendingPhoto('2025/08/PALLI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Roasted-peanut podi with garlic and chilli — sprinkle on idli, dosa, or hot rice.' },
    { slug: 'rasam-podi', title: 'Rasam Podi', image: pendingPhoto('2025/08/RASAM.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Our house rasam masala — coriander, pepper, cumin, dal, curry leaf. Two spoons, one pot of rasam.' },
    { slug: 'sambar-podi', title: 'Sambar Podi', image: pendingPhoto('2025/08/SAMBAR.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'South Indian sambar masala, fresh-ground in small batches so the aroma is still alive when you open the bag.' },
    { slug: 'vellulli-karam-podi', title: 'Vellulli Karam Podi — Garlic Powder', image: pendingPhoto('2025/08/VELLULI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Roasted-garlic podi with chilli — the boldest podi in the rack.' },
  ];
  return items.map((s) =>
    makeProduct('powders', 'pdr', s, {
      dietary_tags: ['vegan', 'gluten-free'],
      allergens: [],
      storage_instructions: 'Store in an airtight jar away from light.',
      shelf_life_days: 180,
      theme_palette: KESAR, // podis
      garnish: 'pistachio',
      smallGrams: 100,
      largeGrams: 250,
      smallTitle: '100 g',
      largeTitle: '250 g',
    }),
  );
}

function healthySweetsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'booster-laddu', title: 'Booster Laddu — Energy Dry-Fruit Laddu', image: photo('booster-laddu'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Pre-workout / new-mother / school-tiffin laddu — dates, almond, cashew, gondh, ghee. No refined sugar.', bestseller: true, theme_palette: GULKAND },
    { slug: 'dry-fruit-laddu', title: 'Dry Fruit Laddu — Protein-Rich', image: photo('dry-fruit-laddu'), variantPaiseSmall: 20000, variantPaiseLarge: 80500, description: 'A bound-fruit-and-nut laddu sweetened only with dates and jaggery. Travel-friendly tin pack.', theme_palette: GULKAND },
    { slug: 'gondh-laddu', title: 'Gondh Laddu — Calcium-Rich Traditional', image: photo('annamayya-laddu'), imageAlt: 'Annamayya Laddu from the Ravi Sweets counter', variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Edible-gum laddu the way the elders made it for new mothers — strengthens bones and joints.' },
    { slug: 'high-protein-laddu', title: 'High Protein Laddu', image: photo('booster-laddu'), imageAlt: 'Booster Laddu — Energy Dry-Fruit Laddu from the Ravi Sweets counter', variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: '14 g of plant protein per laddu — sprouted moong, almonds, dates. The gym-bag laddu.' },
    { slug: 'millet-laddu', title: 'Millet Laddu — Iron-Rich', image: photo('rava-laddu'), imageAlt: 'Rava Laddu from the Ravi Sweets counter', variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Foxtail and ragi millets bound with jaggery and ghee. Iron-rich, low-GI, kid-friendly.' },
    { slug: 'nuvvula-laddu', title: 'Nuvvula Laddu — Bone-Strengthening Sesame Laddu', image: photo('nuvvula-laddu'), variantPaiseSmall: 16300, variantPaiseLarge: 65000, description: 'Roasted sesame and jaggery — the Telugu winter laddu, packed with calcium.' },
  ];
  return items.map((s) =>
    makeProduct('healthy-sweets', 'hs', s, {
      dietary_tags: ['eggless', 'nuts', 'sugar-free'],
      allergens: ['Nuts', 'Dairy', 'Sesame'],
      storage_instructions: 'Store in an airtight container at room temperature.',
      shelf_life_days: 30,
      theme_palette: HOUSE, // seed/millet/gum laddus; the date-led two opt out per SKU
      garnish: 'silver',
      smallGrams: 250,
      largeGrams: 1000,
    }),
  );
}

function biscuitsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'bournvita-biscuits', title: 'Bournvita Biscuits', image: photo('bournvita-biscuits'), variantPaiseSmall: 10800, variantPaiseLarge: 43000, description: 'House-baked biscuits in our Bournvita flavour — no preservatives, no raising agents, just butter, atta, and Bournvita. The chai-time vegan biscuit.' },
    // ── added 2026-08-13 with the photography (see PRICING-REVIEW.md) ──
    // These three are butter-based, so they do NOT inherit the group's `vegan`.
    { slug: 'coconut-biscuits', title: 'Coconut Biscuits', image: photo('coconut-biscuits'), variantPaiseSmall: 10800, variantPaiseLarge: 43000, description: 'Desiccated coconut through a short butter dough, baked until the edges catch. Sandy, not snappy.', dietary_tags: ['eggless', 'dairy'], allergens: ['Gluten', 'Dairy'] },
    { slug: 'kaju-biscuits', title: 'Kaju Biscuits', image: photo('kaju-biscuits'), variantPaiseSmall: 18000, variantPaiseLarge: 72000, description: 'Cashew-meal biscuits with a whole split kaju pressed into each one. The bakery-counter biscuit people buy by the kilo.', bestseller: true, dietary_tags: ['eggless', 'dairy', 'nuts'], allergens: ['Gluten', 'Dairy', 'Nuts'] },
    { slug: 'moon-biscuits', title: 'Moon Biscuits', image: photo('moon-biscuits'), variantPaiseSmall: 11000, variantPaiseLarge: 44000, description: 'Crescent-cut shortbread dusted in icing sugar — the shape is the name, and the tea-time habit of a generation.', dietary_tags: ['eggless', 'dairy'], allergens: ['Gluten', 'Dairy'] },
  ];
  return items.map((s) =>
    makeProduct('biscuits', 'bsk', s, {
      dietary_tags: ['vegan', 'eggless'],
      allergens: ['Gluten', 'Dairy'],
      storage_instructions: 'Store in an airtight container.',
      shelf_life_days: 90,
      theme_palette: HOUSE,
      garnish: 'paisley',
      smallGrams: 200,
      largeGrams: 1000,
    }),
  );
}

// ─── THE COUNTER RANGE ───────────────────────────────────────────────────────
// Added 2026-08-13 alongside the photography drop.
//
// WHY THESE WERE MISSING. The catalogue was assembled from the retired
// WooCommerce export, which only ever listed the packaged/giftable SKUs. The
// glass counter in Khammam sells a great deal more than that — six kalakands,
// four kovas, the kaja bench, the burelu, the halwas — and none of it was on
// the site. The photography drop is what surfaced the gap: 57 of the 83
// photographs were of sweets with no product to attach to.
//
// PRICES ARE PROVISIONAL. The drop contained photographs, not a price list.
// Every figure in this section was derived from the per-kilo rate of the
// nearest comparable SKU already in the catalogue, NOT supplied by the shop.
// They are listed one-by-one in PRICING-REVIEW.md for the owner to confirm or
// correct in a single pass. Treat them as placeholders that happen to be
// plausible, and do not assume any of them is the counter price.

/**
 * Milk-solid sweets — the kalakand and kova bench, plus peda and the set
 * burfis. Everything here is khoya-based, so it shares a fridge instruction
 * and the shortest shelf life on the site.
 */
function milkSweetsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'plain-kalakand', title: 'Plain Kalakand', image: photo('plain-kalakand'), variantPaiseSmall: 19000, variantPaiseLarge: 76000, description: 'Fresh chenna caught at the grainy stage and set overnight — the plain kalakand the counter has sold longest. Milky, barely sweet, faintly caramelised at the edge.', bestseller: true },
    { slug: 'loose-kalakand', title: 'Loose Kalakand', image: photo('loose-kalakand'), variantPaiseSmall: 17500, variantPaiseLarge: 70000, description: 'The same kalakand set softer and sold by scoop rather than cut into blocks. Spoonable, and the one regulars ask for warm.' },
    { slug: 'ajmer-kalakand', title: 'Ajmer Kalakand', image: photo('ajmer-kalakand'), variantPaiseSmall: 22500, variantPaiseLarge: 90000, description: 'The Rajasthani style — reduced longer until the grain coarsens and the colour deepens, then finished with a dusting of powdered sugar.' },
    { slug: 'badam-pista-kalakand', title: 'Badam Pista Kalakand', image: photo('badam-pista-kalakand'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Kalakand layered with slivered almond and pistachio through the set, not merely scattered on top. Cuts to show the nuts in section.', theme_palette: BADAM },
    { slug: 'bournvita-kalakand', title: 'Bournvita Kalakand', image: photo('bournvita-kalakand'), variantPaiseSmall: 22500, variantPaiseLarge: 90000, description: 'A house invention that stuck: malted Bournvita folded into the chenna before setting. Children order it by name.' },
    { slug: 'kaju-kalakand', title: 'Kaju Kalakand', image: photo('kaju-kalakand'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Cashew paste worked into the kalakand for a denser, richer set, then topped with a whole split kaju.', theme_palette: BADAM },
    { slug: 'chitti-kova', title: 'Chitti Kova', image: photo('chitti-kova'), variantPaiseSmall: 20000, variantPaiseLarge: 80000, description: 'Small hand-rolled kova drops — the everyday Telugu milk sweet, reduced slowly in an iron kadai until it pulls from the sides.' },
    { slug: 'special-kova', title: 'Special Kova', image: photo('special-kova'), variantPaiseSmall: 22500, variantPaiseLarge: 90000, description: 'A longer reduction than the chitti, finished with cardamom and a heavier hand of ghee. Darker, chewier, richer.', bestseller: true },
    { slug: 'kova-billalu', title: 'Kova Billalu', image: photo('kova-billalu'), variantPaiseSmall: 21500, variantPaiseLarge: 85000, description: 'Kova pressed into flat discs and lightly griddled so each one carries a toasted face. A Khammam counter regular.' },
    { slug: 'peda', title: 'Peda', image: photo('peda'), variantPaiseSmall: 19500, variantPaiseLarge: 78000, description: 'Classic milk peda, thumb-pressed and marked with a single pistachio. The temple-offering sweet, made fresh each morning.', bestseller: true },
    { slug: 'mango-cream', title: 'Mango Cream', image: photo('mango-cream'), variantPaiseSmall: 20500, variantPaiseLarge: 82000, description: 'Seasonal mango pulp folded through sweetened cream and set soft. Served cold, and only while the fruit is good.' },
    { slug: 'badam-butter-burfi', title: 'Badam Butter Burfi', image: photo('badam-butter-burfi'), variantPaiseSmall: 31500, variantPaiseLarge: 125000, description: 'Ground almond and butter cooked to a short, fudgy set that melts rather than crumbles. The richest square on the counter.', theme_palette: BADAM },
  ];
  return items.map((s) =>
    makeProduct('sweets', 'milk', s, {
      dietary_tags: ['eggless', 'dairy'],
      allergens: ['Dairy', 'Nuts'],
      storage_instructions: 'Refrigerate. Best within 4 days; bring to room temperature before serving.',
      shelf_life_days: 7,
      theme_palette: HOUSE,
      garnish: 'silver',
    }),
  );
}

/**
 * The fried and syrup-soaked bench — kaja, burelu, jalebi, gavvalu and the
 * kajjikayalu. Long keepers, all of them, which is why they travel best.
 */
function friedSweetsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'jalebi', title: 'Jalebi', image: photo('jalebi'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Fermented batter piped straight into hot ghee and dropped into cardamom syrup while it still hisses. Eaten within the hour, ideally.', bestseller: true },
    { slug: 'paneer-jalebi', title: 'Paneer Jalebi', image: photo('paneer-jalebi'), variantPaiseSmall: 18000, variantPaiseLarge: 72000, description: 'The Bengali-style jalebi — chenna in the batter makes it thicker, softer and less brittle than the classic coil.' },
    { slug: 'badusha', title: 'Badusha', image: photo('badusha'), variantPaiseSmall: 14000, variantPaiseLarge: 56000, description: 'Flaky ghee-short pastry fried slow so it layers, then soaked until the syrup reaches the middle. Crisp rim, soft heart.', bestseller: true },
    { slug: 'baklava', title: 'Baklava', image: photo('baklava'), variantPaiseSmall: 45000, variantPaiseLarge: 180000, description: 'Filo layered with chopped pistachio and walnut, baked to a deep gold and finished with honey syrup. The Hyderabadi table has claimed it for generations.', theme_palette: BADAM },
    { slug: 'bellam-gavvalu', title: 'Bellam Gavvalu', image: photo('bellam-gavvalu'), variantPaiseSmall: 13000, variantPaiseLarge: 52000, description: 'Little ridged shells rolled off a gavvalu board and glazed in jaggery. The ridges are what hold the glaze.' },
    { slug: 'bobbattu', title: 'Bobbattu', image: photo('bobbattu'), variantPaiseSmall: 15000, variantPaiseLarge: 60000, description: 'Chana-dal and jaggery sealed inside a paper-thin wheat round, griddled in ghee. The festival bread-sweet of every Telugu house.', bestseller: true },
    { slug: 'gujiya', title: 'Gujiya', image: photo('gujiya'), variantPaiseSmall: 17500, variantPaiseLarge: 70000, description: 'Crimped half-moons filled with khoya, coconut and dry fruit, fried and lightly sugared. Holi in a box.' },
    { slug: 'kajjikayalu', title: 'Kajjikayalu', image: photo('kajjikayalu'), variantPaiseSmall: 16000, variantPaiseLarge: 64000, description: 'The Andhra gujiya — a drier coconut-and-sesame filling, folded and sealed by hand along a rope edge.' },
    { slug: 'kova-kajjikayalu', title: 'Kova Kajjikayalu', image: photo('kova-kajjikayalu'), variantPaiseSmall: 19500, variantPaiseLarge: 78000, description: 'Kajjikayalu filled with reduced kova instead of coconut. Heavier, softer, and the version made for weddings.' },
    { slug: 'gottam-kaja', title: 'Gottam Kaja', image: photo('gottam-kaja'), variantPaiseSmall: 15500, variantPaiseLarge: 62000, description: 'Hollow tube kaja from Tapeswaram — fried until it holds air, then filled with syrup so it floods when bitten.' },
    { slug: 'madatha-kaja', title: 'Madatha Kaja', image: photo('madatha-kaja'), variantPaiseSmall: 16000, variantPaiseLarge: 64000, description: 'The folded kaja: dough laminated, folded and fried so it opens into leaves, each one syrup-soaked.' },
    { slug: 'poornalu', title: 'Poornalu', image: photo('poornalu'), variantPaiseSmall: 15500, variantPaiseLarge: 62000, description: 'Sweet chana-jaggery balls jacketed in a rice-and-urad batter and fried. Crisp shell, warm dense centre.' },
    { slug: 'sajja-burelu', title: 'Sajja Burelu', image: photo('sajja-burelu'), variantPaiseSmall: 14500, variantPaiseLarge: 58000, description: 'Pearl-millet burelu sweetened with jaggery — the winter sweet from the dry belt, nuttier than its rice cousin.' },
    { slug: 'kobbari-burelu', title: 'Kobbari Burelu', image: photo('kobbari-burelu'), variantPaiseSmall: 15000, variantPaiseLarge: 60000, description: 'Fresh coconut and jaggery bound and fried into soft rounds. Made the day the coconuts are broken.' },
    { slug: 'pootharekulu', title: 'Pootharekulu', image: photo('pootharekulu'), variantPaiseSmall: 27500, variantPaiseLarge: 110000, description: 'The paper sweet of Atreyapuram — rice-starch films lifted off an inverted pot, layered with ghee and powdered sugar. It dissolves rather than chews.', bestseller: true },
    { slug: 'sweet-boondi', title: 'Sweet Boondi', image: photo('sweet-boondi'), variantPaiseSmall: 13000, variantPaiseLarge: 52000, description: 'Gram-flour pearls dropped through a jhara and turned in saffron syrup. Loose, not pressed into laddu.' },
  ];
  return items.map((s) =>
    makeProduct('sweets', 'fry', s, {
      dietary_tags: ['eggless', 'contains-ghee'],
      allergens: ['Gluten', 'Dairy', 'Nuts'],
      storage_instructions: 'Store in an airtight container at room temperature.',
      shelf_life_days: 15,
      theme_palette: KESAR,
      garnish: 'paisley',
    }),
  );
}

/**
 * Set sweets cut from a tray — mysore pak and the cashew bench. Grouped
 * separately from the milk sweets because these are sugar-set and keep for
 * weeks rather than days.
 */
function setSweetsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'mysore-pak', title: 'Mysore Pak', image: photo('mysore-pak'), variantPaiseSmall: 19500, variantPaiseLarge: 78000, description: 'Gram flour, sugar and ghee beaten to the porous set — the firm Mysore pak that snaps clean and dissolves slowly.', bestseller: true },
    { slug: 'ghee-mysore-pak', title: 'Ghee Mysore Pak', image: photo('ghee-mysore-pak'), variantPaiseSmall: 25000, variantPaiseLarge: 100000, description: 'The soft, dripping version — far more ghee, pulled off the heat early so it stays molten-textured. Eat with a spoon.', bestseller: true },
    { slug: 'kaju-bullets', title: 'Kaju Bullets', image: photo('kaju-bullets'), variantPaiseSmall: 37500, variantPaiseLarge: 150000, description: 'Cashew fudge rolled into short cylinders and finished with edible silver. The gifting shape of kaju katli.', theme_palette: BADAM },
    { slug: 'kaju-chikki', title: 'Kaju Chikki', image: photo('kaju-chikki'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Whole cashews suspended in a thin jaggery-sugar brittle, rolled while hot and cracked into shards.', theme_palette: BADAM },
  ];
  return items.map((s) =>
    makeProduct('sweets', 'set', s, {
      dietary_tags: ['eggless', 'contains-ghee'],
      allergens: ['Nuts', 'Dairy'],
      storage_instructions: 'Store in an airtight container at room temperature.',
      shelf_life_days: 21,
      theme_palette: HOUSE,
      garnish: 'silver',
    }),
  );
}

/** The halwa tray — spoon sweets, sold by weight, cut warm. */
function halwaGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'bombay-halwa', title: 'Bombay Halwa', image: photo('bombay-halwa'), variantPaiseSmall: 17500, variantPaiseLarge: 70000, description: 'The translucent cornflour halwa — jewel-bright, elastic, studded with cashew. Karachi halwa by its other name.' },
    { slug: 'pineapple-halwa', title: 'Pineapple Halwa', image: photo('pineapple-halwa'), variantPaiseSmall: 18000, variantPaiseLarge: 72000, description: 'The same set worked with pineapple, which cuts the sweetness with a clean acidity. Sold in slabs.' },
    { slug: 'dry-fruit-halwa', title: 'Dry Fruit Halwa', image: photo('dry-fruit-halwa'), variantPaiseSmall: 26500, variantPaiseLarge: 105000, description: 'Loaded with almond, cashew, pistachio and raisin until the halwa is more fruit than base. The one that gets gifted.', bestseller: true, theme_palette: GULKAND },
  ];
  return items.map((s) =>
    makeProduct('sweets', 'hlw', s, {
      dietary_tags: ['eggless', 'nuts', 'contains-ghee'],
      allergens: ['Nuts', 'Dairy'],
      storage_instructions: 'Store in an airtight container. Refrigerate in summer.',
      shelf_life_days: 15,
      theme_palette: KESAR,
      garnish: 'saffron',
    }),
  );
}

/**
 * The counter laddus. Distinct from healthySweetsGroup, which is the
 * no-refined-sugar range — these are the festival and temple laddus.
 */
function ladduGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'besan-laddu', title: 'Besan Laddu', image: photo('besan-laddu'), variantPaiseSmall: 18000, variantPaiseLarge: 72000, description: 'Gram flour roasted in ghee to the point the whole kitchen smells of it, then bound with powdered sugar and cardamom.', bestseller: true },
    { slug: 'rava-laddu', title: 'Rava Laddu', image: photo('rava-laddu'), variantPaiseSmall: 16500, variantPaiseLarge: 66000, description: 'Semolina roasted with ghee, cashew and raisin, bound just firm enough to hold. Crumbles as you bite.' },
    { slug: 'ganesh-laddu', title: 'Ganesh Laddu', image: photo('ganesh-laddu'), extraImages: [photo('ganesh-laddu-2')], variantPaiseSmall: 17500, variantPaiseLarge: 70000, description: 'The boondi laddu made for Vinayaka Chavithi — saffron-tinted, generous with cashew, pressed large by hand.', bestseller: true },
    { slug: 'annamayya-laddu', title: 'Annamayya Laddu', image: photo('annamayya-laddu'), variantPaiseSmall: 17500, variantPaiseLarge: 70000, description: 'The temple-style boondi laddu — coarser pearls, heavier syrup, cardamom and clove through it. Made to the Tirupati proportions.' },
  ];
  return items.map((s) =>
    makeProduct('sweets', 'ldu', s, {
      dietary_tags: ['eggless', 'nuts', 'contains-ghee'],
      allergens: ['Nuts', 'Dairy', 'Gluten'],
      storage_instructions: 'Store in an airtight container at room temperature.',
      shelf_life_days: 15,
      theme_palette: KESAR,
      garnish: 'saffron',
    }),
  );
}

/**
 * The two hampers the drop photographed that the catalogue had never listed.
 * Sized in grams like every other SKU so the shipping-weight maths the cart
 * already does keeps working.
 */
function counterHampersGroup(): Product[] {
  const dryFruits: MiniSku = {
    slug: 'dry-fruits-gift-hamper',
    title: 'Dry Fruits Gift Hamper',
    image: photo('dry-fruits-gift-hamper'),
    variantPaiseSmall: 149900,
    variantPaiseLarge: 279900,
    description: 'Almond, cashew, pistachio, anjeer and raisin portioned into a lined tray with a ribbon and a card. The hamper the office orders by the dozen.',
    builder_eligible: false,
  };
  const dussehra: MiniSku = {
    slug: 'dussehra-gift-box',
    title: 'Dussehra Gift Box',
    image: photo('dussehra-gift-box'),
    variantPaiseSmall: 119900,
    variantPaiseLarge: 219900,
    description: 'A Dussehra assortment — laddu, kaja, kalakand and a savoury, boxed with a marigold band. Built the week before Vijayadashami.',
    builder_eligible: false,
  };
  return [
    makeProduct('gift-hampers', 'gh', dryFruits, {
      dietary_tags: ['eggless', 'nuts'],
      allergens: ['Nuts', 'Dairy'],
      storage_instructions: 'Store in a cool, dry place away from direct sunlight.',
      shelf_life_days: 90,
      theme_palette: HAMPER,
      garnish: 'silver',
      smallGrams: 1000,
      largeGrams: 2000,
      smallTitle: '1 kg hamper',
      largeTitle: '2 kg hamper',
    }),
    makeProduct('festival-specials', 'fsx', dussehra, {
      dietary_tags: ['eggless', 'nuts', 'contains-ghee'],
      allergens: ['Nuts', 'Dairy', 'Gluten'],
      storage_instructions: 'Store in a cool, dry place. Refrigerate the milk sweets if kept beyond three days.',
      shelf_life_days: 15,
      theme_palette: HAMPER,
      garnish: 'saffron',
      smallGrams: 1000,
      largeGrams: 2000,
      smallTitle: '1 kg box',
      largeTitle: '2 kg box',
    }),
  ];
}
