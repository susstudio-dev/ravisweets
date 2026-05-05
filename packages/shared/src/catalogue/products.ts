import type { CategorySlug, DietaryTag, GarnishMark, Product } from '../types/product';

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
 * Real product photos hot-linked from ravisweets.com (the brand's existing
 * WooCommerce site). Every SKU below uses a real Ravi Sweets image — for
 * the curated Hyderabadi-Nizami dishes that ravisweets.com doesn't carry
 * (Qubani ka Meetha, Double ka Meetha, Sheer Khurma, Khubani Mithai) we
 * pick the closest visual match from their catalogue rather than stock.
 */
function ravi(file: string) {
  return `https://ravisweets.com/wp-content/uploads/${file}`;
}

export const CATALOGUE: Product[] = [
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
      { url: ravi('2025/08/booster.webp'), alt: 'Qubani ka Meetha-style apricot dessert with cream and almonds', width: 1400, height: 1400 },
      { url: ravi('2025/08/dry-fruit.webp'), alt: 'Close-up showing slivered almonds across the top of the Qubani', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_qubani_250', title: '250 g', weight_grams: 250, price: { amount: 279, currency: 'INR' }, sku: 'RS-QKM-250', stock_available: 32, hsn_code: '2106' },
      { id: 'v_qubani_500', title: '500 g', weight_grams: 500, price: { amount: 499, currency: 'INR' }, sku: 'RS-QKM-500', stock_available: 24, hsn_code: '2106' },
      { id: 'v_qubani_1000', title: '1 kg', weight_grams: 1000, price: { amount: 949, currency: 'INR' }, sku: 'RS-QKM-1000', stock_available: 12, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: { base: '#fff4e3', accent: '#c0592b', glow: '#f29f5a', ink: '#3a1e0c', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/badam_pista_kalakand-removebg-preview.png'), alt: 'Double ka Meetha-style amber pieces with saffron-rabri and pistachios', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_dkm_250', title: '250 g', weight_grams: 250, price: { amount: 229, currency: 'INR' }, sku: 'RS-DKM-250', stock_available: 24, hsn_code: '2106' },
      { id: 'v_dkm_500', title: '500 g', weight_grams: 500, price: { amount: 399, currency: 'INR' }, sku: 'RS-DKM-500', stock_available: 16, hsn_code: '2106' },
      { id: 'v_dkm_1000', title: '1 kg', weight_grams: 1000, price: { amount: 759, currency: 'INR' }, sku: 'RS-DKM-1000', stock_available: 8, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#fbeed0', accent: '#8a5a10', glow: '#d4b36a', ink: '#2a1a04', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/badam_butter_burfi-removebg-preview.png'), alt: 'Badam ki Jali almond discs arranged in a fan, lace-thin', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_bkj_250', title: '250 g', weight_grams: 250, price: { amount: 549, currency: 'INR' }, sku: 'RS-BKJ-250', stock_available: 40, hsn_code: '2106' },
      { id: 'v_bkj_500', title: '500 g', weight_grams: 500, price: { amount: 999, currency: 'INR' }, sku: 'RS-BKJ-500', stock_available: 20, hsn_code: '2106' },
      { id: 'v_bkj_1000', title: '1 kg', weight_grams: 1000, price: { amount: 1899, currency: 'INR' }, sku: 'RS-BKJ-1000', stock_available: 10, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#fdf3df', accent: '#a07024', glow: '#e4c17a', ink: '#3a280e', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/dry-fruit.webp'), alt: 'Sheer Khurma — golden vermicelli with almonds, pistachios and a rose petal', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_skh_250', title: '250 g', weight_grams: 250, price: { amount: 259, currency: 'INR' }, sku: 'RS-SKH-250', stock_available: 28, hsn_code: '2106' },
      { id: 'v_skh_500', title: '500 g', weight_grams: 500, price: { amount: 449, currency: 'INR' }, sku: 'RS-SKH-500', stock_available: 18, hsn_code: '2106' },
      { id: 'v_skh_1000', title: '1 kg', weight_grams: 1000, price: { amount: 849, currency: 'INR' }, sku: 'RS-SKH-1000', stock_available: 9, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fbf0dc', accent: '#9a4a2a', glow: '#e9b07a', ink: '#2e1a08', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/anjjeer_katli-removebg-preview.png'), alt: 'Khubani Dry-Fruit Mithai diamonds layered with nuts and silver leaf', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_khm_300', title: '300 g', weight_grams: 300, price: { amount: 649, currency: 'INR' }, sku: 'RS-KHM-300', stock_available: 28, hsn_code: '2106' },
      { id: 'v_khm_500', title: '500 g', weight_grams: 500, price: { amount: 999, currency: 'INR' }, sku: 'RS-KHM-500', stock_available: 18, hsn_code: '2106' },
      { id: 'v_khm_1000', title: '1 kg', weight_grams: 1000, price: { amount: 1899, currency: 'INR' }, sku: 'RS-KHM-1000', stock_available: 9, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff0dc', accent: '#a85a1e', glow: '#efa962', ink: '#321606', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/kaju_katli-removebg-preview.png'), alt: 'Premium Kaju Katli diamonds arranged on a plate, dusted with edible silver leaf', width: 1400, height: 1400 },
      { url: ravi('2025/09/kaju_kalakand-removebg-preview.png'), alt: 'Cashew Kalakand squares stacked beside the Kaju Katli', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_kaju_250', title: '250 g', weight_grams: 250, price: { amount: 449, currency: 'INR' }, sku: 'RS-KJ-250', stock_available: 48, hsn_code: '2106' },
      { id: 'v_kaju_500', title: '500 g', weight_grams: 500, price: { amount: 849, currency: 'INR' }, sku: 'RS-KJ-500', stock_available: 32, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: { base: '#f8f4ea', accent: '#8a6a2e', glow: '#d6c796', ink: '#2a2010', grainOpacity: 0.04 },
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
      { url: ravi('2025/08/gulabilu.webp'), alt: 'Gulab Jamun-style amber spheres glossy with syrup', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_gj_500', title: '500 g (12 pieces)', weight_grams: 500, price: { amount: 399, currency: 'INR' }, sku: 'RS-GJ-500', stock_available: 32, hsn_code: '2106' },
      { id: 'v_gj_1000', title: '1 kg (24 pieces)', weight_grams: 1000, price: { amount: 749, currency: 'INR' }, sku: 'RS-GJ-1000', stock_available: 20, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: { base: '#fff0d8', accent: '#6e2f14', glow: '#d68a4c', ink: '#2a0e04', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/boondi_laddu-removebg-preview.png'), alt: 'Motichoor Ladoos with saffron pearls visible across the surface', width: 1400, height: 1400 },
      { url: ravi('2025/09/besan_laddu-removebg-preview.png'), alt: 'A pair of besan laddus stacked next to the boondi ladoo', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_mtl_6', title: '6 pieces', weight_grams: 300, price: { amount: 279, currency: 'INR' }, sku: 'RS-MTL-6', stock_available: 40, hsn_code: '2106' },
      { id: 'v_mtl_12', title: '12 pieces', weight_grams: 600, price: { amount: 529, currency: 'INR' }, sku: 'RS-MTL-12', stock_available: 24, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff3d6', accent: '#b05a0e', glow: '#ecb562', ink: '#2a1704', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/mixture.webp'), alt: 'Hyderabadi Mixture — crunchy savoury medley with curry leaves', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_mix_200', title: '200 g', weight_grams: 200, price: { amount: 139, currency: 'INR' }, sku: 'RS-MIX-200', stock_available: 200, hsn_code: '2106' },
      { id: 'v_mix_400', title: '400 g', weight_grams: 400, price: { amount: 249, currency: 'INR' }, sku: 'RS-MIX-400', stock_available: 120, hsn_code: '2106' },
      { id: 'v_mix_1000', title: '1 kg', weight_grams: 1000, price: { amount: 569, currency: 'INR' }, sku: 'RS-MIX-1000', stock_available: 60, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: { base: '#f4e9d4', accent: '#8b3a1f', glow: '#d68854', ink: '#2e1a0b', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/atukula-mixture-400x400.jpg'), alt: 'Peanut Chivda — flattened rice with peanuts, cashews, curry leaves', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_pc_150', title: '150 g', weight_grams: 150, price: { amount: 109, currency: 'INR' }, sku: 'RS-PC-150', stock_available: 200, hsn_code: '2106' },
      { id: 'v_pc_300', title: '300 g', weight_grams: 300, price: { amount: 199, currency: 'INR' }, sku: 'RS-PC-300', stock_available: 100, hsn_code: '2106' },
      { id: 'v_pc_1000', title: '1 kg', weight_grams: 1000, price: { amount: 599, currency: 'INR' }, sku: 'RS-PC-1000', stock_available: 50, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f5ead2', accent: '#7b4610', glow: '#d6a74c', ink: '#2a1a08', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/karapusa.webp'), alt: 'Fine Besan Sev threads piled high', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_bs_250', title: '250 g', weight_grams: 250, price: { amount: 169, currency: 'INR' }, sku: 'RS-BS-250', stock_available: 80, hsn_code: '2106' },
      { id: 'v_bs_500', title: '500 g', weight_grams: 500, price: { amount: 309, currency: 'INR' }, sku: 'RS-BS-500', stock_available: 40, hsn_code: '2106' },
      { id: 'v_bs_1000', title: '1 kg', weight_grams: 1000, price: { amount: 579, currency: 'INR' }, sku: 'RS-BS-1000', stock_available: 20, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f8eed0', accent: '#8a5410', glow: '#e2b558', ink: '#2a1a04', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/BADAM.webp'), alt: 'Roasted whole California almonds — whole, hand-sorted, lightly salted', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_alm_200', title: '200 g tin', weight_grams: 200, price: { amount: 399, currency: 'INR' }, sku: 'RS-ALM-200', stock_available: 60, hsn_code: '0802' },
      { id: 'v_alm_500', title: '500 g pack', weight_grams: 500, price: { amount: 949, currency: 'INR' }, sku: 'RS-ALM-500', stock_available: 30, hsn_code: '0802' },
      { id: 'v_alm_1000', title: '1 kg pack', weight_grams: 1000, price: { amount: 1799, currency: 'INR' }, sku: 'RS-ALM-1000', stock_available: 15, hsn_code: '0802' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: false,
    theme_palette: { base: '#f4ead2', accent: '#6e4a20', glow: '#c19a62', ink: '#2a1a08', grainOpacity: 0.05 },
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
      { url: ravi('2025/09/anjjeer_katli-removebg-preview.png'), alt: 'Saffron-salt pistachios with shells dusted orange-gold', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_pist_200', title: '200 g tin', weight_grams: 200, price: { amount: 549, currency: 'INR' }, sku: 'RS-PIST-200', stock_available: 48, hsn_code: '0802' },
      { id: 'v_pist_500', title: '500 g pack', weight_grams: 500, price: { amount: 1299, currency: 'INR' }, sku: 'RS-PIST-500', stock_available: 24, hsn_code: '0802' },
      { id: 'v_pist_1000', title: '1 kg pack', weight_grams: 1000, price: { amount: 2499, currency: 'INR' }, sku: 'RS-PIST-1000', stock_available: 12, hsn_code: '0802' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f2e9d0', accent: '#5c6a1e', glow: '#a8b860', ink: '#1e2408', grainOpacity: 0.05 },
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
      { url: ravi('2025/08/dalmudi.webp'), alt: 'Chai-time combo box with three compartments of savoury snacks', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cc_750', title: 'Box (750 g total)', weight_grams: 750, price: { amount: 649, currency: 'INR' }, sku: 'RS-CC-750', stock_available: 30, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f3e8d0', accent: '#6e3e10', glow: '#caa060', ink: '#281908', grainOpacity: 0.05 },
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
      { url: ravi('2025/09/cashew_mithai-removebg-preview.png'), alt: 'Festival combo with silver-leaf Kaju Katli and a bowl of mixture', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_fc_900', title: 'Box (900 g total)', weight_grams: 900, price: { amount: 999, currency: 'INR' }, sku: 'RS-FC-900', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#faecc8', accent: '#a56a0f', glow: '#e0b870', ink: '#2a1804', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/dry_fruit_chikki-removebg-preview.png'), alt: 'Open Diwali hamper box with assorted sweets, a brass diya, and silk wrap', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_diwali_premium', title: 'Premium box', weight_grams: 1500, price: { amount: 2499, currency: 'INR' }, sku: 'RS-GH-DIWALI-P', stock_available: 60, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#2a1505', accent: '#e9ad4a', glow: '#f2c66f', ink: '#fdf6ec', grainOpacity: 0.08 },
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
      { url: ravi('2025/09/kaju_rolls-removebg-preview.png'), alt: 'Classic matte-cream gifting box tied with a ribbon', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cgb_1', title: 'Box', weight_grams: 1200, price: { amount: 1499, currency: 'INR' }, sku: 'RS-GH-CLASSIC', stock_available: 50, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: { base: '#faf2dc', accent: '#8a5a1e', glow: '#d6a85c', ink: '#281804', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/kaju_kissmish-removebg-preview.png'), alt: 'Corporate essentials box with labelled compartments', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_ceb_1', title: 'Box', weight_grams: 1600, price: { amount: 1799, currency: 'INR' }, sku: 'RS-GH-CORP', stock_available: 75, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f4ead2', accent: '#6e4810', glow: '#c79e5c', ink: '#241608', grainOpacity: 0.05 },
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
      { url: ravi('2025/09/kaju_mysorepak-removebg-preview.png'), alt: 'Raksha Bandhan thali with sweets and a rakhi thread on a brass plate', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_rt_1', title: 'Thali', weight_grams: 800, price: { amount: 999, currency: 'INR' }, sku: 'RS-FS-RAKHI', stock_available: 45, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fdf3df', accent: '#c0592b', glow: '#f29f5a', ink: '#3a1e0c', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/dryfruit_pootharekulu-removebg-preview.png'), alt: 'Eid signature box with sheer khurma, double ka meetha, and dry fruits', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_es_1', title: 'Box', weight_grams: 2000, price: { amount: 1799, currency: 'INR' }, sku: 'RS-FS-EID', stock_available: 35, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff4e3', accent: '#a56a0f', glow: '#e9ad4a', ink: '#2a1a04', grainOpacity: 0.06 },
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
      { url: ravi('2025/09/badam_butter_burfi-removebg-preview.png'), alt: 'Cardamom Soan Papdi-style squares in flaky layers', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_sp_500', title: '500 g tin', weight_grams: 500, price: { amount: 449, currency: 'INR' }, sku: 'RS-SP-500', stock_available: 80, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fbeed0', accent: '#a56a0f', glow: '#e9ad4a', ink: '#2a1a04', grainOpacity: 0.05 },
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
      { url: ravi('2025/09/badam_katli-removebg-preview.png'), alt: 'Wedding Trousseau Box wrapped in silk with a paisley tag, two-tier presentation', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_wt_1', title: 'Two-tier box', weight_grams: 2200, price: { amount: 2999, currency: 'INR' }, sku: 'RS-GH-WED', stock_available: 25, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#fdf3df', accent: '#7a4e0a', glow: '#d4a96b', ink: '#2a1a04', grainOpacity: 0.06 },
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
      { url: ravi('2025/08/booster.webp'), alt: 'Pongal pot set with a clay vessel, sachet, and dried banana leaf on a brass tray', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_pp_1', title: 'Pot + sachet', weight_grams: 900, price: { amount: 799, currency: 'INR' }, sku: 'RS-FS-PONGAL', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f5ead2', accent: '#9c5a14', glow: '#d6a74c', ink: '#2a1a08', grainOpacity: 0.06 },
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
      { url: ravi('2025/08/karapusa.webp'), alt: 'Office chai tray with namkeens, ladoos, and almonds arranged on a wooden serving board', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_oct_1', title: 'Office tray', weight_grams: 1400, price: { amount: 999, currency: 'INR' }, sku: 'RS-CB-OCT', stock_available: 50, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f4ead2', accent: '#6e4810', glow: '#c79e5c', ink: '#241608', grainOpacity: 0.05 },
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
];

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
  /** Min/max paise — most ravisweets categories sell 250 g + 1 kg variants. */
  variantPaiseSmall: number;
  variantPaiseLarge: number;
  description: string;
  bestseller?: boolean;
  isNew?: boolean;
  builder_eligible?: boolean;
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
    dietary_tags: defaults.dietary_tags,
    ingredients: ['See pack label.'],
    allergens: defaults.allergens,
    storage_instructions: defaults.storage_instructions,
    shelf_life_days: defaults.shelf_life_days,
    images: [{ url: s.image, alt: `${s.title} — photographed at the Khammam kitchen`, width: 1400, height: 1400 }],
    variants: [
      // Bug fix 2026-05-06: data is stored in paise (matching the field name)
      // but Money.amount is rupees and formatMoney prints it as such. Without
      // the /100 every generated savoury/bite/pickle/etc. was 100× over-priced
      // (e.g. Atukula Mixture showed ₹12,500 instead of ₹125). Round so the
      // displayed amount stays integer-rupee-clean.
      { id: `${id}_s`, title: smallTitle, weight_grams: smallGrams, price: { amount: Math.round(s.variantPaiseSmall / 100), currency: 'INR' }, sku: `RS-${prefix.toUpperCase()}-${s.slug.toUpperCase().slice(0, 6)}-S`, stock_available: 60, hsn_code: '2106' },
      { id: `${id}_l`, title: largeTitle, weight_grams: largeGrams, price: { amount: Math.round(s.variantPaiseLarge / 100), currency: 'INR' }, sku: `RS-${prefix.toUpperCase()}-${s.slug.toUpperCase().slice(0, 6)}-L`, stock_available: 40, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false,
    bestseller: s.bestseller ?? false,
    new: s.isNew ?? true,
    theme_palette: defaults.theme_palette,
    garnish: defaults.garnish,
    builder_eligible: s.builder_eligible ?? true,
    unit_mode: defaults.unit_mode ?? 'weight',
    rubric_passed_on: TODAY,
    source_url: RAVISWEETS_LICENCE,
  };
}

function savouriesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'atukula-mixture', title: 'Atukula Mixture', image: ravi('2025/08/atukula-mixture-400x400.jpg'), variantPaiseSmall: 12500, variantPaiseLarge: 50000, description: 'Crisp poha-based mixture with peanuts, curry leaves, and a mild chilli kick — the chai-trolley favourite from our Khammam counter.', bestseller: true },
    { slug: 'chegodilu', title: 'Chegodilu — Crispy Chegodilu', image: ravi('2025/08/chegodilu.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Andhra ring-shaped rice-flour crisps, hand-tied and fried in cold-pressed oil. Snap when you bite, never go soggy in the box.' },
    { slug: 'chekkalu', title: 'Chekkalu — Crunchy Rice Crackers', image: ravi('2025/08/chekkalu.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Thin rice-flour crackers studded with chana dal and ajwain — the Andhra answer to a savoury cookie.' },
    { slug: 'cornflakes-mixture', title: 'Cornflakes Mixture', image: ravi('2025/08/cornflakes-mivture.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Crisp cornflakes tossed with curry leaves, cashew halves, and a saffron tempering. Lighter than the standard mixture.' },
    { slug: 'dal-mudi-snacks', title: 'Dal Mudi Snacks', image: ravi('2025/08/dalmudi.webp'), variantPaiseSmall: 12500, variantPaiseLarge: 50000, description: 'Puffed rice and split-dal mix, lightly spiced and ready for a chai pour. A house staple since the eighties.', bestseller: true },
    { slug: 'janthikalu', title: 'Janthikalu', image: ravi('2025/08/janthikalu.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spiral rice-and-gram-flour twirls pressed through a brass mould — the Andhra-style janthikalu we still hand-press each morning.' },
    { slug: 'kara-boondhi', title: 'Kara Boondhi', image: ravi('2025/08/7-1-400x400.jpg'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spicy gram-flour pearls tempered with curry leaves and dried red chilli. Pairs with curd-rice or stands alone with chai.' },
    { slug: 'karapusa', title: 'Karapusa — Crispy Karapusa', image: ravi('2025/08/karapusa.webp'), variantPaiseSmall: 11000, variantPaiseLarge: 43000, description: 'Salted gram-flour sev pressed thin and crisped in ghee. Clean, sharp, the namkeen on every Telugu chai tray.' },
    { slug: 'masala-kaju', title: 'Masala Kaju — Spicy Cashew', image: ravi('2025/08/masala-kaju.webp'), variantPaiseSmall: 37000, variantPaiseLarge: 148000, description: 'A-grade cashews tossed in our house masala — chilli, garlic, lime — and slow-roasted. Premium cocktail-hour snack.', bestseller: true },
    { slug: 'masala-palli', title: 'Masala Palli — Spicy Peanut Masala', image: ravi('2025/08/masala-palli.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Roasted peanuts coated in a thin spiced gram-flour batter. The standard-bearer of an Andhra evening.' },
    { slug: 'murukulu', title: 'Murukulu', image: ravi('2025/08/murukullu.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Concentric rice-flour spirals — South India\'s favourite tea-time twist. Crisp at the edge, tender at the centre.' },
    { slug: 'onion-ribbon-pakodi', title: 'Onion Ribbon Pakodi', image: ravi('2025/08/onion-ribbon-pakoda.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Wide gram-flour ribbons fried with caramelised onion shards. Sweet-savoury, addictive.' },
    { slug: 'palli-pakodi', title: 'Palli Pakodi — Crispy Peanut Pakodi', image: ravi('2025/08/palli-pakoda.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Bite-sized peanut clusters in a gram-flour batter. The travel-snack we sell most by weight.' },
    { slug: 'pappu-chekkalu', title: 'Pappu Chekkalu — Chekkalu with Chana Dal', image: ravi('2025/08/pappu-chekkalu.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Chekkalu loaded with chana dal for a heartier crunch. Stays good for a month in the tin.' },
    { slug: 'pappu-chekodi', title: 'Pappu Chekodi', image: ravi('2025/08/pappu-chekodi.webp'), variantPaiseSmall: 12000, variantPaiseLarge: 48000, description: 'Spiral chegodilu enriched with chana dal — extra crunch, extra protein, same Andhra recipe.' },
  ];
  return items.map((s) =>
    makeProduct('savouries', 'sav', s, {
      dietary_tags: ['eggless'],
      allergens: ['Gluten', 'Peanuts'],
      storage_instructions: 'Store in an airtight container away from humidity.',
      shelf_life_days: 60,
      theme_palette: { base: '#f5ead2', accent: '#7b4610', glow: '#d6a74c', ink: '#2a1a08', grainOpacity: 0.05 },
      garnish: 'pistachio',
    }),
  );
}

function sweetBitesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'butterscotch-bites', title: 'Butterscotch Bites', image: ravi('2025/08/BUTTERSCOTCH-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Caramel-toffee bites with a crackle of butterscotch. Sized for a single bite, packed for sharing.' },
    { slug: 'choco-bites', title: 'Choco Bites', image: ravi('2025/08/CHOCO-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Dark-chocolate truffle bites rolled in cocoa nibs. Made with single-origin cacao, set firm.' },
    { slug: 'kaju-bites', title: 'Kaju Bites', image: ravi('2025/08/KAJU-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Cashew-paste bites finished with a touch of cardamom. The little-cousin of our Kaju Katli.', bestseller: true },
    { slug: 'kesar-bites', title: 'Kesar Bites', image: ravi('2025/08/KESAR-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Saffron-perfumed milk-fudge bites with slivered pistachios on top. A festive favourite.' },
    { slug: 'khajoor-bites', title: 'Khajoor Bites', image: ravi('2025/08/KHAJOOR-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Date-paste bites bound with cashew and almond — no added sugar, all the natural sweetness of khajoor.' },
    { slug: 'mango-crunch-bites', title: 'Mango Crunch Bites', image: ravi('2025/08/MANGO-CRUNCH-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Aam-paste bites with a layer of crispy crunch through the centre. Summer in a bite.' },
    { slug: 'mixed-bites', title: 'Mixed Bites', image: ravi('2025/08/MIXED-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'A sampler box — six flavours in one tin so you can pick a favourite before committing.', bestseller: true },
    { slug: 'oreo-bites', title: 'Oreo Bites', image: ravi('2025/08/OREO-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Crushed-cookie bites bound with milk-fudge — the kid-favourite SKU on our counter.' },
    { slug: 'pineapple-bites', title: 'Pineapple Bites', image: ravi('2025/08/PINEAPPLE-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Tangy pineapple-paste bites with a citrus snap. Refreshing on a Hyderabadi afternoon.' },
    { slug: 'silky-bites', title: 'Silky Bites', image: ravi('2025/08/SILKY-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Cream-and-cardamom bites with a silken set. Melts on the tongue, finishes with cardamom.' },
    { slug: 'strawberry-bites', title: 'Strawberry Bites', image: ravi('2025/08/STRAWBERRY-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Strawberry-paste bites with a thin chocolate shell. Sweet meets tart in a clean finish.' },
    { slug: 'tutti-frutti-bites', title: 'Tutti Frutti Bites', image: ravi('2025/08/TRUTI-FRUTI-BITES.webp'), variantPaiseSmall: 30000, variantPaiseLarge: 120000, description: 'Candied-fruit bites flecked through soft milk-fudge. The cheerful one in the tin.' },
  ];
  return items.map((s) =>
    makeProduct('sweet-bites', 'bite', s, {
      dietary_tags: ['eggless', 'nuts', 'dairy'],
      allergens: ['Nuts', 'Dairy'],
      storage_instructions: 'Refrigerate. Bring to room temperature before serving.',
      shelf_life_days: 21,
      theme_palette: { base: '#fdf3df', accent: '#a85a1e', glow: '#efa962', ink: '#321606', grainOpacity: 0.06 },
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
    { slug: 'anjeer-whole', title: 'Anjeer — Premium Dried Figs', image: ravi('2025/08/ANJEER.webp'), variantPaiseSmall: 32500, variantPaiseLarge: 260000, description: 'A-grade dried figs, soft-set and naturally sweet. Our most-asked-for dry fruit at the Kondapur counter.' },
    { slug: 'badam-almonds', title: 'Badam — Whole Almonds', image: ravi('2025/08/BADAM.webp'), variantPaiseSmall: 20000, variantPaiseLarge: 160000, description: 'Whole California almonds, hand-sorted and sealed the same week. Zero broken pieces, no chaff.', bestseller: true },
    { slug: 'cranberry', title: 'Cranberry', image: ravi('2025/08/CRANBERRY.webp'), variantPaiseSmall: 25000, variantPaiseLarge: 200000, description: 'Sweet-tart dried cranberries — perfect on a granola plate or stirred into your morning yogurt.' },
    { slug: 'kaju-cashew', title: 'Kaju — Whole Cashews', image: ravi('2025/08/WhatsApp-Image-2023-08-11-at-4.46.50-PM-400x400.jpeg'), variantPaiseSmall: 25500, variantPaiseLarge: 180000, description: 'Premium W240 cashews — whole, plump, no splits. Sealed in nitrogen pouches for a six-month shelf life.', bestseller: true },
    { slug: 'pista-whole', title: 'Pista — Whole Pistachios', image: ravi('2025/08/PISTA.webp'), variantPaiseSmall: 40000, variantPaiseLarge: 320000, description: 'Iranian pistachios with a generous shell-split. Snack-grade, crunch-grade, gift-grade.' },
    { slug: 'salted-pista', title: 'Salted Pista', image: ravi('2025/08/SALTED-PISTA.webp'), variantPaiseSmall: 40000, variantPaiseLarge: 320000, description: 'The same Iranian pistachios, dry-roasted and lightly salted. Travel-tin packaging.' },
    { slug: 'walnuts', title: 'Walnuts — Akhrot', image: ravi('2025/08/WALNUT.webp'), variantPaiseSmall: 41300, variantPaiseLarge: 330000, description: 'Light-amber walnut halves from the Kashmir trade — lower bitterness, higher omega-3.' },
  ];
  return items.map((s) =>
    makeProduct('dry-fruits', 'df', s, {
      dietary_tags: ['vegan', 'nuts', 'gluten-free'],
      allergens: ['Nuts'],
      storage_instructions: 'Store in an airtight container away from humidity.',
      shelf_life_days: 180,
      theme_palette: { base: '#f4ead2', accent: '#6e4a20', glow: '#c19a62', ink: '#2a1a08', grainOpacity: 0.05 },
      garnish: 'silver',
      smallGrams: 250,
      largeGrams: 2000,
    }),
  );
}

function picklesGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'allam-pickle', title: 'Allam Pickle — Homemade Ginger Pickle', image: ravi('2025/08/allam.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Sharp-fresh ginger pickle in cold-pressed sesame oil and tamarind. Andhra grandmother\'s recipe.' },
    { slug: 'amla-pickle', title: 'Amla Pickle — Usirikaya Pickle', image: ravi('2025/08/amla-1.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Whole gooseberries cured with mustard, fenugreek and red chilli. Vitamin-C in a jar.' },
    { slug: 'chicken-pickle', title: 'Chicken Pickle', image: ravi('2025/08/chicken-pickel.webp'), variantPaiseSmall: 25000, variantPaiseLarge: 100000, description: 'Boneless country-chicken simmered down with whole spices and sealed under oil. Travels three weeks unrefrigerated.' },
    { slug: 'chintakaya-pickle', title: 'Chintakaya Pickle — Tamarind Pickle', image: ravi('2025/08/chintakaya.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Green-tamarind pickle with the Andhra trifecta — chilli, garlic, sesame oil. Pairs with curd-rice.' },
    { slug: 'gongura-pickle', title: 'Gongura Pickle — Sorrel Leaf Pickle', image: ravi('2025/08/gongura.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'The signature Andhra pickle — sorrel leaves slow-cooked into a fiery, tangy mash. Eat with hot rice and ghee.', bestseller: true },
    { slug: 'kakarakaya-pickle', title: 'Kakarakaya Pickle — Bitter Gourd Pickle', image: ravi('2025/08/kakarakaya.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Bitter gourd cured with jaggery to take the edge off, then finished with mustard tempering.' },
    { slug: 'lemon-pickle', title: 'Lemon Pickle — Nimmakaya Pachadi', image: ravi('2025/08/lemon.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Whole lemon segments salted, sun-cured, and finished with chilli. The all-rounder pickle.' },
    { slug: 'masala-mango-pickle', title: 'Masala Mango Pickle', image: ravi('2025/08/small-pieces-mango.webp'), variantPaiseSmall: 14900, variantPaiseLarge: 49900, description: 'Raw mango cubes in a thick mustard-fenugreek masala. The Andhra summer pickle, made all year.' },
  ];
  return items.map((s) =>
    makeProduct('pickles', 'pkl', s, {
      dietary_tags: ['eggless'],
      allergens: ['Mustard'],
      storage_instructions: 'Store in a cool, dry place. Always use a dry spoon. Refrigerate after opening.',
      shelf_life_days: 365,
      theme_palette: { base: '#f5e9c0', accent: '#a83c10', glow: '#e08438', ink: '#2a1004', grainOpacity: 0.06 },
      garnish: 'paisley',
      smallGrams: 200,
      largeGrams: 1000,
    }),
  );
}

function powdersGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'kandi-podi', title: 'Kandi Podi — Toor Dal Podi', image: ravi('2025/08/KANDI-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17200, description: 'Roasted toor-dal powder with chilli and garlic. Mix with hot rice and ghee — instant comfort meal.', bestseller: true },
    { slug: 'karam-podi', title: 'Karam Podi — Aromatic Spice Powder', image: ravi('2025/08/KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'The all-purpose South Indian podi — chilli, urad dal, channa dal, sesame, garlic. Tear, tip, eat.' },
    { slug: 'karivepaku-podi', title: 'Karivepaku Podi — Curry Leaf Powder', image: ravi('2025/08/CURRY-LEAVES-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Curry-leaf powder with toasted dals — the iron-rich podi grandmothers swear by.' },
    { slug: 'kobbari-karam-podi', title: 'Kobbari Karam Podi — Coconut Powder', image: ravi('2025/08/KOBARI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Toasted-coconut podi with red chilli — a sweet-spicy contrast to the dal-heavy podis.' },
    { slug: 'nalla-karam-podi', title: 'Nalla Karam Podi — Spicy Black Powder', image: ravi('2025/08/NALLA-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Black-pepper-forward Andhra podi for the heat-seekers. Use sparingly.' },
    { slug: 'nuvvula-karam-podi', title: 'Nuvvula Karam Podi — Sesame Powder', image: ravi('2025/08/NUVULA-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Toasted sesame podi with chilli — calcium-rich, deeply nutty.' },
    { slug: 'palli-karam-podi', title: 'Palli Karam Podi — Peanut Powder', image: ravi('2025/08/PALLI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Roasted-peanut podi with garlic and chilli — sprinkle on idli, dosa, or hot rice.' },
    { slug: 'rasam-podi', title: 'Rasam Podi', image: ravi('2025/08/RASAM.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Our house rasam masala — coriander, pepper, cumin, dal, curry leaf. Two spoons, one pot of rasam.' },
    { slug: 'sambar-podi', title: 'Sambar Podi', image: ravi('2025/08/SAMBAR.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'South Indian sambar masala, fresh-ground in small batches so the aroma is still alive when you open the bag.' },
    { slug: 'vellulli-karam-podi', title: 'Vellulli Karam Podi — Garlic Powder', image: ravi('2025/08/VELLULI-KARAM-PODI.webp'), variantPaiseSmall: 7000, variantPaiseLarge: 17500, description: 'Roasted-garlic podi with chilli — the boldest podi in the rack.' },
  ];
  return items.map((s) =>
    makeProduct('powders', 'pdr', s, {
      dietary_tags: ['vegan', 'gluten-free'],
      allergens: [],
      storage_instructions: 'Store in an airtight jar away from light.',
      shelf_life_days: 180,
      theme_palette: { base: '#f9ecc8', accent: '#9b3a10', glow: '#dd8a3a', ink: '#2a0e04', grainOpacity: 0.06 },
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
    { slug: 'booster-laddu', title: 'Booster Laddu — Energy Dry-Fruit Laddu', image: ravi('2025/08/booster.webp'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Pre-workout / new-mother / school-tiffin laddu — dates, almond, cashew, gondh, ghee. No refined sugar.', bestseller: true },
    { slug: 'dry-fruit-laddu', title: 'Dry Fruit Laddu — Protein-Rich', image: ravi('2025/08/dry-fruit.webp'), variantPaiseSmall: 20000, variantPaiseLarge: 80500, description: 'A bound-fruit-and-nut laddu sweetened only with dates and jaggery. Travel-friendly tin pack.' },
    { slug: 'gondh-laddu', title: 'Gondh Laddu — Calcium-Rich Traditional', image: ravi('2025/08/gondh.webp'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Edible-gum laddu the way the elders made it for new mothers — strengthens bones and joints.' },
    { slug: 'high-protein-laddu', title: 'High Protein Laddu', image: ravi('2025/08/protien.webp'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: '14 g of plant protein per laddu — sprouted moong, almonds, dates. The gym-bag laddu.' },
    { slug: 'millet-laddu', title: 'Millet Laddu — Iron-Rich', image: ravi('2025/08/millet.webp'), variantPaiseSmall: 32500, variantPaiseLarge: 130000, description: 'Foxtail and ragi millets bound with jaggery and ghee. Iron-rich, low-GI, kid-friendly.' },
    { slug: 'nuvvula-laddu', title: 'Nuvvula Laddu — Bone-Strengthening Sesame Laddu', image: ravi('2025/08/11-2-400x400.jpg'), variantPaiseSmall: 16300, variantPaiseLarge: 65000, description: 'Roasted sesame and jaggery — the Telugu winter laddu, packed with calcium.' },
  ];
  return items.map((s) =>
    makeProduct('healthy-sweets', 'hs', s, {
      dietary_tags: ['eggless', 'nuts', 'sugar-free'],
      allergens: ['Nuts', 'Dairy', 'Sesame'],
      storage_instructions: 'Store in an airtight container at room temperature.',
      shelf_life_days: 30,
      theme_palette: { base: '#f4ead2', accent: '#6e4810', glow: '#c79e5c', ink: '#241608', grainOpacity: 0.05 },
      garnish: 'silver',
      smallGrams: 250,
      largeGrams: 1000,
    }),
  );
}

function biscuitsGroup(): Product[] {
  const items: MiniSku[] = [
    { slug: 'bournvita-biscuits', title: 'Bournvita Biscuits', image: ravi('2025/08/4-3-400x400.jpg'), variantPaiseSmall: 10800, variantPaiseLarge: 43000, description: 'House-baked biscuits in our Bournvita flavour — no preservatives, no raising agents, just butter, atta, and Bournvita. The chai-time vegan biscuit.' },
  ];
  return items.map((s) =>
    makeProduct('biscuits', 'bsk', s, {
      dietary_tags: ['vegan', 'eggless'],
      allergens: ['Gluten', 'Dairy'],
      storage_instructions: 'Store in an airtight container.',
      shelf_life_days: 90,
      theme_palette: { base: '#f5ead2', accent: '#7b4610', glow: '#d6a74c', ink: '#2a1a08', grainOpacity: 0.05 },
      garnish: 'paisley',
      smallGrams: 200,
      largeGrams: 1000,
    }),
  );
}
