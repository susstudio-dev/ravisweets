import type { Product } from '../types/product';

/**
 * Ravi Sweets catalogue — single source of truth.
 *
 * Every product here has passed the representativeness rubric at
 * research/catalogue-imagery-rubric.md (see `rubric_passed_on` field).
 * Imagery remains Unsplash-sourced placeholders (watermarked "Dev only"
 * at render time) until the production photography shoot lands per the
 * photography-gating requirement in elevate-storefront-visual-experience.
 *
 * Coverage by category (Jan 2026 — 20 total):
 *   hyderabadi-specials    5   (Qubani, Double ka Meetha, Badam ki Jali, Sheer Khurma, Khubani Mithai)
 *   sweets                 3   (Kaju Katli, Gulab Jamun, Motichoor Ladoo)
 *   namkeens               3   (Hyderabadi Mixture, Peanut Chivda, Besan Sev)
 *   dry-fruits             2   (Roasted Almonds, Saffron Pistachios)
 *   combos                 2   (Chai-time Combo, Festival Essentials)
 *   gift-hampers           3   (Diwali Premium, Classic Gifting Box, Corporate Essentials)
 *   festival-specials      2   (Raksha Bandhan Thali, Eid Signature)
 *
 * Expand to 24 by adding: one more sweet, one more dry-fruit, one more gift-hamper, one more namkeen.
 */

const TODAY = '2026-04-23';
const UNSPLASH_LICENCE = 'https://unsplash.com/license';

function unsplash(id: string, w = 1400) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`;
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
      { url: unsplash('1601050690597-df0568f70950'), alt: 'Qubani ka Meetha in a brass bowl, apricots glistening in saffron syrup with a cream drizzle', width: 1400, height: 1400 },
      { url: unsplash('1631206753348-db44968fd440'), alt: 'Close-up of Qubani ka Meetha topped with slivered almonds', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_qubani_500', title: '500 g', weight_grams: 500, price: { amount: 499, currency: 'INR' }, sku: 'RS-QKM-500', stock_available: 24, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: { base: '#fff4e3', accent: '#c0592b', glow: '#f29f5a', ink: '#3a1e0c', grainOpacity: 0.06 },
    garnish: 'saffron',
    builder_eligible: true,
    rubric_passed_on: TODAY,
    source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1601050690294-05eb5b5b4121'), alt: 'Double ka Meetha on a ceramic plate, bread slices amber with saffron-rabri and pistachios', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_dkm_500', title: '500 g', weight_grams: 500, price: { amount: 399, currency: 'INR' }, sku: 'RS-DKM-500', stock_available: 16, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#fbeed0', accent: '#8a5a10', glow: '#d4b36a', ink: '#2a1a04', grainOpacity: 0.06 },
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1606312619070-d48b4c652a52'), alt: 'Badam ki Jali almond discs arranged in a fan, light passing through the lace', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_bkj_250', title: '250 g', weight_grams: 250, price: { amount: 549, currency: 'INR' }, sku: 'RS-BKJ-250', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#fdf3df', accent: '#a07024', glow: '#e4c17a', ink: '#3a280e', grainOpacity: 0.05 },
    garnish: 'paisley',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1605197788044-5c7ecd5e0a9f'), alt: 'Sheer Khurma in a small bowl, golden vermicelli topped with almonds and a rose petal', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_skh_500', title: '500 g', weight_grams: 500, price: { amount: 449, currency: 'INR' }, sku: 'RS-SKH-500', stock_available: 18, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fbf0dc', accent: '#9a4a2a', glow: '#e9b07a', ink: '#2e1a08', grainOpacity: 0.06 },
    garnish: 'rose',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1631206753348-db44968fd440'), alt: 'Khubani Dry-Fruit Mithai diamonds layered with nuts and silver leaf', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_khm_300', title: '300 g', weight_grams: 300, price: { amount: 649, currency: 'INR' }, sku: 'RS-KHM-300', stock_available: 28, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff0dc', accent: '#a85a1e', glow: '#efa962', ink: '#321606', grainOpacity: 0.06 },
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1631206753348-db44968fd440'), alt: 'Kaju Katli diamonds arranged on a silver tray, dusted with edible silver leaf', width: 1400, height: 1400 },
      { url: unsplash('1606312619070-d48b4c652a52'), alt: 'Close-up of a stack of Kaju Katli pieces showing the silver-leaf shimmer', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_kaju_250', title: '250 g', weight_grams: 250, price: { amount: 449, currency: 'INR' }, sku: 'RS-KJ-250', stock_available: 48, hsn_code: '2106' },
      { id: 'v_kaju_500', title: '500 g', weight_grams: 500, price: { amount: 849, currency: 'INR' }, sku: 'RS-KJ-500', stock_available: 32, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: true, bestseller: true, new: false,
    theme_palette: { base: '#f8f4ea', accent: '#8a6a2e', glow: '#d6c796', ink: '#2a2010', grainOpacity: 0.04 },
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1601050690597-df0568f70950'), alt: 'Gulab Jamun in a copper bowl, amber spheres glossy with syrup', width: 1400, height: 1400 },
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
    rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1605197788044-5c7ecd5e0a9f'), alt: 'Motichoor Ladoos on a brass platter, saffron pearls visible across the surface', width: 1400, height: 1400 },
    ],
    variants: [
      { id: 'v_mtl_6', title: '6 pieces', weight_grams: 300, price: { amount: 279, currency: 'INR' }, sku: 'RS-MTL-6', stock_available: 40, hsn_code: '2106' },
      { id: 'v_mtl_12', title: '12 pieces', weight_grams: 600, price: { amount: 529, currency: 'INR' }, sku: 'RS-MTL-12', stock_available: 24, hsn_code: '2106' },
    ],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff3d6', accent: '#b05a0e', glow: '#ecb562', ink: '#2a1704', grainOpacity: 0.05 },
    garnish: 'saffron',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1589301760014-d929f3979dbc'), alt: 'Hyderabadi Mixture in a copper bowl, chilli red against gram-flour gold', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_mix_400', title: '400 g', weight_grams: 400, price: { amount: 249, currency: 'INR' }, sku: 'RS-MIX-400', stock_available: 120, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: { base: '#f4e9d4', accent: '#8b3a1f', glow: '#d68854', ink: '#2e1a0b', grainOpacity: 0.05 },
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1589301760014-d929f3979dbc'), alt: 'Peanut Chivda in a ceramic bowl with curry leaves on top', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_pc_300', title: '300 g', weight_grams: 300, price: { amount: 199, currency: 'INR' }, sku: 'RS-PC-300', stock_available: 100, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f5ead2', accent: '#7b4610', glow: '#d6a74c', ink: '#2a1a08', grainOpacity: 0.05 },
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1589301760014-d929f3979dbc'), alt: 'Fine Besan Sev threads piled in a brass bowl', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_bs_250', title: '250 g', weight_grams: 250, price: { amount: 169, currency: 'INR' }, sku: 'RS-BS-250', stock_available: 80, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f8eed0', accent: '#8a5410', glow: '#e2b558', ink: '#2a1a04', grainOpacity: 0.05 },
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1606312619070-d48b4c652a52'), alt: 'Roasted almonds in a tin-lined canister', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_alm_200', title: '200 g tin', weight_grams: 200, price: { amount: 399, currency: 'INR' }, sku: 'RS-ALM-200', stock_available: 60, hsn_code: '0802' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: false,
    theme_palette: { base: '#f4ead2', accent: '#6e4a20', glow: '#c19a62', ink: '#2a1a08', grainOpacity: 0.05 },
    garnish: 'silver',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1606312619070-d48b4c652a52'), alt: 'Saffron-salt pistachios in a glass jar, shells dusted orange-gold', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_pist_200', title: '200 g tin', weight_grams: 200, price: { amount: 549, currency: 'INR' }, sku: 'RS-PIST-200', stock_available: 48, hsn_code: '0802' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f2e9d0', accent: '#5c6a1e', glow: '#a8b860', ink: '#1e2408', grainOpacity: 0.05 },
    garnish: 'pistachio',
    builder_eligible: true, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1589301760014-d929f3979dbc'), alt: 'Chai-time combo box with three compartments of savoury snacks', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cc_750', title: 'Box (750 g total)', weight_grams: 750, price: { amount: 649, currency: 'INR' }, sku: 'RS-CC-750', stock_available: 30, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f3e8d0', accent: '#6e3e10', glow: '#caa060', ink: '#281908', grainOpacity: 0.05 },
    garnish: 'pistachio',
    builder_eligible: false, // Meta-item; builders compose directly
    rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1604068549290-dea0e4a305ca'), alt: 'Festival combo with silver-leaf Kaju Katli and a bowl of mixture', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_fc_900', title: 'Box (900 g total)', weight_grams: 900, price: { amount: 999, currency: 'INR' }, sku: 'RS-FC-900', stock_available: 40, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#faecc8', accent: '#a56a0f', glow: '#e0b870', ink: '#2a1804', grainOpacity: 0.06 },
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1604068549290-dea0e4a305ca'), alt: 'Open Diwali hamper box with assorted sweets, a brass diya, and silk wrap', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_diwali_premium', title: 'Premium box', weight_grams: 1500, price: { amount: 2499, currency: 'INR' }, sku: 'RS-GH-DIWALI-P', stock_available: 60, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: true, bestseller: false, new: true,
    theme_palette: { base: '#2a1505', accent: '#e9ad4a', glow: '#f2c66f', ink: '#fdf6ec', grainOpacity: 0.08 },
    garnish: 'paisley',
    builder_eligible: false, // Hampers compose INTO hampers — conflict
    rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1604068549290-dea0e4a305ca'), alt: 'Classic matte-cream gifting box tied with a ribbon', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_cgb_1', title: 'Box', weight_grams: 1200, price: { amount: 1499, currency: 'INR' }, sku: 'RS-GH-CLASSIC', stock_available: 50, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: true, new: false,
    theme_palette: { base: '#faf2dc', accent: '#8a5a1e', glow: '#d6a85c', ink: '#281804', grainOpacity: 0.06 },
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1604068549290-dea0e4a305ca'), alt: 'Corporate essentials box with labelled compartments', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_ceb_1', title: 'Box', weight_grams: 1600, price: { amount: 1799, currency: 'INR' }, sku: 'RS-GH-CORP', stock_available: 75, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#f4ead2', accent: '#6e4810', glow: '#c79e5c', ink: '#241608', grainOpacity: 0.05 },
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1631206753348-db44968fd440'), alt: 'Raksha Bandhan thali with sweets and a rakhi thread on a brass plate', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_rt_1', title: 'Thali', weight_grams: 800, price: { amount: 999, currency: 'INR' }, sku: 'RS-FS-RAKHI', stock_available: 45, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fdf3df', accent: '#c0592b', glow: '#f29f5a', ink: '#3a1e0c', grainOpacity: 0.06 },
    garnish: 'paisley',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
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
      { url: unsplash('1605197788044-5c7ecd5e0a9f'), alt: 'Eid signature box with sheer khurma, double ka meetha, and dry fruits', width: 1400, height: 1400 },
    ],
    variants: [{ id: 'v_es_1', title: 'Box', weight_grams: 2000, price: { amount: 1799, currency: 'INR' }, sku: 'RS-FS-EID', stock_available: 35, hsn_code: '2106' }],
    region_availability: ['in'],
    featured: false, bestseller: false, new: true,
    theme_palette: { base: '#fff4e3', accent: '#a56a0f', glow: '#e9ad4a', ink: '#2a1a04', grainOpacity: 0.06 },
    garnish: 'rose',
    builder_eligible: false, rubric_passed_on: TODAY, source_url: UNSPLASH_LICENCE,
  },
];
