import type { Product } from '@ravisweets/shared';

/**
 * Curated placeholder imagery — each product has 2–3 complementary shots so
 * the product gallery has real crossfade variety. Replace all of these when
 * production photography (Task 7.2 of the storefront change) lands.
 *
 * Image sources: Unsplash (free-to-use). Each URL carries `q=85&auto=format` for
 * on-the-fly AVIF/WebP delivery. Alt text is descriptive — no "image of…".
 */

const IMG = {
  // Qubani ka Meetha — amber apricot dessert with almond garnish
  qubani_hero:
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=85&auto=format&fit=crop',
  qubani_plate:
    'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=1400&q=85&auto=format&fit=crop',

  // Kaju Katli — silver-leafed cashew diamonds
  kaju_tray:
    'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=1400&q=85&auto=format&fit=crop',
  kaju_closeup:
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1400&q=85&auto=format&fit=crop',

  // Double ka Meetha — bread pudding with pistachios
  double_plate:
    'https://images.unsplash.com/photo-1601050690294-05eb5b5b4121?w=1400&q=85&auto=format&fit=crop',
  double_topdown:
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1400&q=85&auto=format&fit=crop',

  // Badam ki Jali — lacy almond discs
  badam_hero:
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1400&q=85&auto=format&fit=crop',
  badam_stack:
    'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=1400&q=85&auto=format&fit=crop',

  // Diwali Hamper — gift composition with brass diya
  diwali_open:
    'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1400&q=85&auto=format&fit=crop',
  diwali_closed:
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=85&auto=format&fit=crop',

  // Hyderabadi Mixture — crunchy savoury medley
  mixture_bowl:
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1400&q=85&auto=format&fit=crop',
  mixture_scatter:
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1400&q=85&auto=format&fit=crop',
} as const;

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p_qubani',
    slug: 'qubani-ka-meetha',
    title: 'Qubani ka Meetha',
    description:
      'A Hyderabadi Nizami classic — slow-cooked dried apricots reduced in their own syrup for four hours, finished with almond slivers and a spoonful of malai. Made to a recipe carried down from the royal kitchens.',
    category: 'hyderabadi-specials',
    dietary_tags: ['eggless', 'nuts', 'dairy'],
    ingredients: ['Dried apricots', 'Sugar', 'Almonds', 'Saffron', 'Milk cream', 'Cardamom'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Refrigerate. Best consumed chilled within 3 days of opening.',
    shelf_life_days: 7,
    images: [
      {
        url: IMG.qubani_hero,
        alt: 'Qubani ka Meetha in a brass bowl, apricots glistening in saffron syrup with a cream drizzle',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.qubani_plate,
        alt: 'Close-up of Qubani ka Meetha topped with slivered almonds',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_qubani_500',
        title: '500 g',
        weight_grams: 500,
        price: { amount: 499, currency: 'INR' },
        sku: 'RS-QKM-500',
        stock_available: 24,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: true,
    bestseller: true,
    new: false,
    theme_palette: {
      base: '#fff4e3',
      accent: '#c0592b',
      glow: '#f29f5a',
      ink: '#3a1e0c',
      grainOpacity: 0.06,
    },
    garnish: 'saffron',
  },
  {
    id: 'p_kaju_katli',
    slug: 'kaju-katli',
    title: 'Kaju Katli',
    description:
      'Silky cashew diamonds wrapped in edible silver leaf, ground to a whisper and cooked in small batches with A-grade cashews and a breath of cardamom. Zero preservatives.',
    category: 'sweets',
    dietary_tags: ['eggless', 'nuts', 'dairy'],
    ingredients: ['Cashews', 'Sugar', 'Ghee', 'Cardamom', 'Edible silver leaf'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in an airtight container in a cool, dry place.',
    shelf_life_days: 15,
    images: [
      {
        url: IMG.kaju_tray,
        alt: 'Kaju Katli diamonds arranged on a silver tray, dusted with edible silver leaf',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.kaju_closeup,
        alt: 'Close-up of a stack of Kaju Katli pieces showing the silver-leaf shimmer',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_kaju_250',
        title: '250 g',
        weight_grams: 250,
        price: { amount: 449, currency: 'INR' },
        sku: 'RS-KJ-250',
        stock_available: 48,
        hsn_code: '2106',
      },
      {
        id: 'v_kaju_500',
        title: '500 g',
        weight_grams: 500,
        price: { amount: 849, currency: 'INR' },
        sku: 'RS-KJ-500',
        stock_available: 32,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: true,
    bestseller: true,
    new: false,
    theme_palette: {
      base: '#f8f4ea',
      accent: '#8a6a2e',
      glow: '#d6c796',
      ink: '#2a2010',
      grainOpacity: 0.04,
    },
    garnish: 'silver',
  },
  {
    id: 'p_double_ka_meetha',
    slug: 'double-ka-meetha',
    title: 'Double ka Meetha',
    description:
      "Hyderabad's answer to bread pudding — golden-fried bread soaked overnight in saffron-infused rabri, scattered with chopped pistachios and served warm.",
    category: 'hyderabadi-specials',
    dietary_tags: ['nuts', 'dairy', 'contains-ghee'],
    ingredients: ['Bread', 'Full-fat milk', 'Sugar', 'Ghee', 'Saffron', 'Pistachios', 'Cardamom'],
    allergens: ['Gluten', 'Nuts', 'Dairy'],
    storage_instructions: 'Refrigerate. Warm gently before serving.',
    shelf_life_days: 5,
    images: [
      {
        url: IMG.double_plate,
        alt: 'Double ka Meetha on a ceramic plate, bread slices amber with saffron-rabri and pistachios',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.double_topdown,
        alt: 'Top-down view of Double ka Meetha in a brass serving dish',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_dkm_500',
        title: '500 g',
        weight_grams: 500,
        price: { amount: 399, currency: 'INR' },
        sku: 'RS-DKM-500',
        stock_available: 16,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: true,
    bestseller: false,
    new: true,
    theme_palette: {
      base: '#fbeed0',
      accent: '#8a5a10',
      glow: '#d4b36a',
      ink: '#2a1a04',
      grainOpacity: 0.06,
    },
    garnish: 'pistachio',
  },
  {
    id: 'p_badam_ki_jali',
    slug: 'badam-ki-jali',
    title: 'Badam ki Jali',
    description:
      'Lace-thin almond discs, crisped with sugar and cardamom until they snap like glass. A delicate Hyderabadi gift favourite — arrives in a tissue-lined tin.',
    category: 'hyderabadi-specials',
    dietary_tags: ['eggless', 'nuts', 'gluten-free'],
    ingredients: ['Almonds', 'Sugar', 'Cardamom', 'Ghee'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Store in an airtight container away from humidity.',
    shelf_life_days: 21,
    images: [
      {
        url: IMG.badam_hero,
        alt: 'Badam ki Jali almond discs arranged in a fan, light passing through the lace',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.badam_stack,
        alt: 'Stacked Badam ki Jali with cardamom pods scattered beside them',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_bkj_250',
        title: '250 g',
        weight_grams: 250,
        price: { amount: 549, currency: 'INR' },
        sku: 'RS-BKJ-250',
        stock_available: 40,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: true,
    bestseller: false,
    new: true,
    theme_palette: {
      base: '#fdf3df',
      accent: '#a07024',
      glow: '#e4c17a',
      ink: '#3a280e',
      grainOpacity: 0.05,
    },
    garnish: 'paisley',
  },
  {
    id: 'p_diwali_premium',
    slug: 'diwali-premium-hamper',
    title: 'Diwali Premium Hamper',
    description:
      'A hand-packed celebration box: Kaju Katli, Badam ki Jali, Qubani ka Meetha, roasted almonds, pistachios, and a small brass diya — wrapped in silk and sealed with a paisley tag. Gift-ready.',
    category: 'gift-hampers',
    dietary_tags: ['nuts', 'dairy'],
    ingredients: ['Assorted sweets and dry fruits — see component SKUs for individual details.'],
    allergens: ['Nuts', 'Dairy'],
    storage_instructions: 'Follow storage instructions on each enclosed item.',
    shelf_life_days: 7,
    images: [
      {
        url: IMG.diwali_open,
        alt: 'Open Diwali hamper box with assorted sweets, a brass diya, and silk wrap',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.diwali_closed,
        alt: 'Closed Diwali gift hamper with paisley-tagged ribbon',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_diwali_premium',
        title: 'Premium box',
        weight_grams: 1500,
        price: { amount: 2499, currency: 'INR' },
        sku: 'RS-GH-DIWALI-P',
        stock_available: 60,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: true,
    bestseller: false,
    new: true,
    theme_palette: {
      base: '#2a1505',
      accent: '#e9ad4a',
      glow: '#f2c66f',
      ink: '#fdf6ec',
      grainOpacity: 0.08,
    },
    garnish: 'paisley',
  },
  {
    id: 'p_mixture',
    slug: 'hyderabadi-mixture',
    title: 'Hyderabadi Mixture',
    description:
      'A crunchy medley of gram flour sev, roasted peanuts, curry leaves, and our house masala. Ready for chai and stubbornly moreish.',
    category: 'namkeens',
    dietary_tags: ['vegan', 'nuts'],
    ingredients: ['Gram flour', 'Peanuts', 'Curry leaves', 'Salt', 'House masala', 'Cold-pressed oil'],
    allergens: ['Peanuts', 'Gluten'],
    storage_instructions: 'Store in an airtight container.',
    shelf_life_days: 30,
    images: [
      {
        url: IMG.mixture_bowl,
        alt: 'Hyderabadi Mixture in a copper bowl, chilli red against gram-flour gold',
        width: 1400,
        height: 1400,
      },
      {
        url: IMG.mixture_scatter,
        alt: 'Hyderabadi Mixture scattered on slate showing peanuts and curry leaves',
        width: 1400,
        height: 1400,
      },
    ],
    variants: [
      {
        id: 'v_mix_400',
        title: '400 g',
        weight_grams: 400,
        price: { amount: 249, currency: 'INR' },
        sku: 'RS-MIX-400',
        stock_available: 120,
        hsn_code: '2106',
      },
    ],
    region_availability: ['in'],
    featured: false,
    bestseller: true,
    new: false,
    theme_palette: {
      base: '#f4e9d4',
      accent: '#8b3a1f',
      glow: '#d68854',
      ink: '#2e1a0b',
      grainOpacity: 0.05,
    },
    garnish: 'pistachio',
  },
];
