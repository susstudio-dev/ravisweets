// ─── shot-list.mjs ───────────────────────────────────────────────────────────
// The mapping from the owner's photography drop to catalogue slugs.
//
// WHY THIS FILE IS THE RECORD. The delivered folder is named by the kitchen,
// not by the shop: "Chekodilu.jpg" is the product the catalogue calls
// `chegodilu`, "Mothichoor laddu.jpg" is `motichoor-ladoo`, and
// "Nuvvula laddu ( dates and Sesame).jpg" is `nuvvula-laddu`. Those spellings
// will not survive a second re-import from memory, so the correspondence is
// written down once, here, and every downstream step reads it:
//
//   scripts/photography/process.mjs   crops + encodes to public/products/<slug>.webp
//   packages/shared/src/catalogue/products.ts   references /products/<slug>.webp
//
// Re-running the processor against the same drop is idempotent: same inputs,
// same slugs, same output files.
//
// ROLE. 'primary' is the card/hero/OG photograph. 'secondary' is an extra
// angle that only the product gallery shows. A slug may have exactly one
// primary and any number of secondaries.

/**
 * Photographs that correspond to a product ALREADY in the catalogue.
 * These light up existing SKUs — no new products, no invented prices.
 */
export const MATCHED = [
  { file: 'Atukula mixture_.jpg', slug: 'atukula-mixture', role: 'primary' },
  { file: 'Booster laddu.jpg', slug: 'booster-laddu', role: 'primary' },
  { file: 'Bournvita biscuits_.jpg', slug: 'bournvita-biscuits', role: 'primary' },
  { file: 'Butter scotch bites.jpg', slug: 'butterscotch-bites', role: 'primary' },
  { file: 'Cashew fusion_.jpg', slug: 'kaju-bites', role: 'primary' },
  { file: 'kaju Flavour.jpg', slug: 'kaju-bites', role: 'secondary' },
  { file: 'Chekodilu.jpg', slug: 'chegodilu', role: 'primary' },
  { file: 'Choco crunch_.jpg', slug: 'choco-bites', role: 'primary' },
  { file: 'Cornflakes mixture_.jpg', slug: 'cornflakes-mixture', role: 'primary' },
  { file: 'Diwali gift Hamper_.png', slug: 'diwali-premium-hamper', role: 'primary' },
  { file: 'Dryfruits laddu.jpg', slug: 'dry-fruit-laddu', role: 'primary' },
  { file: 'Gulab jamun_.jpg', slug: 'gulab-jamun', role: 'primary' },
  { file: 'kaju katli.jpg', slug: 'kaju-katli', role: 'primary' },
  { file: 'Kaju masala.jpg', slug: 'masala-kaju', role: 'primary' },
  { file: 'Karapoosa.jpg', slug: 'karapusa', role: 'primary' },
  { file: 'Mothichoor laddu.jpg', slug: 'motichoor-ladoo', role: 'primary' },
  { file: 'Mothichoor laddu(1).jpg', slug: 'motichoor-ladoo', role: 'secondary' },
  { file: 'Nuvvula laddu ( dates and Sesame).jpg', slug: 'nuvvula-laddu', role: 'primary' },
  { file: 'Oreo crunchy bar.jpg', slug: 'oreo-bites', role: 'primary' },
  { file: 'Palli pakodi.jpg', slug: 'palli-pakodi', role: 'primary' },
  { file: 'Pineapple fusion_.jpg', slug: 'pineapple-bites', role: 'primary' },
  { file: 'Ragi murukulu_.jpg', slug: 'murukulu', role: 'primary' },
  { file: 'Rakshabandhan hampers.jpg', slug: 'raksha-bandhan-thali', role: 'primary' },
  { file: 'Silky bar.jpg', slug: 'silky-bites', role: 'primary' },
  { file: 'Tutti frutti bites.jpg', slug: 'tutti-frutti-bites', role: 'primary' },
];

/**
 * Photographs of sweets the catalogue did not carry at all. Each one becomes a
 * NEW product (see NEW_PRODUCTS in products.ts). Prices for these were not
 * supplied with the drop — see PRICING-REVIEW.md.
 */
export const NEW = [
  // ── kalakand bench ──
  { file: 'Ajmeer kalakand.jpg', slug: 'ajmer-kalakand', role: 'primary' },
  { file: 'Badam pista kalakand.jpg', slug: 'badam-pista-kalakand', role: 'primary' },
  { file: 'Bournvita Kalakand_.jpg', slug: 'bournvita-kalakand', role: 'primary' },
  { file: 'kaju kalakand.jpg', slug: 'kaju-kalakand', role: 'primary' },
  { file: 'Plain kalakand.jpg', slug: 'plain-kalakand', role: 'primary' },
  { file: 'loose kalakand_.jpg', slug: 'loose-kalakand', role: 'primary' },
  // ── kova bench ──
  { file: 'chitti kova.jpg', slug: 'chitti-kova', role: 'primary' },
  { file: 'Special kova.jpg', slug: 'special-kova', role: 'primary' },
  { file: 'kova billalu.png', slug: 'kova-billalu', role: 'primary' },
  { file: 'kova Kajjikayalu_.jpg', slug: 'kova-kajjikayalu', role: 'primary' },
  { file: 'Kajjikayalu_.jpg', slug: 'kajjikayalu', role: 'primary' },
  // ── halwa bench ──
  { file: 'Bombay halwa.png', slug: 'bombay-halwa', role: 'primary' },
  { file: 'Pineapple halwa.png', slug: 'pineapple-halwa', role: 'primary' },
  { file: 'Dryfruits halwa.jpg', slug: 'dry-fruit-halwa', role: 'primary' },
  // ── mysore pak / kaja / burelu ──
  { file: 'Ghee Mysorepak_.jpg', slug: 'ghee-mysore-pak', role: 'primary' },
  { file: 'Mysorepak_.jpg', slug: 'mysore-pak', role: 'primary' },
  { file: 'Gottam kaja.jpg', slug: 'gottam-kaja', role: 'primary' },
  { file: 'Madatha kaja.jpg', slug: 'madatha-kaja', role: 'primary' },
  { file: 'Sajja burelu.jpg', slug: 'sajja-burelu', role: 'primary' },
  { file: 'Kobbari burelu.jpg', slug: 'kobbari-burelu', role: 'primary' },
  // ── fried & syrup sweets ──
  { file: 'Badusha_.jpg', slug: 'badusha', role: 'primary' },
  { file: 'Baklava_.jpg', slug: 'baklava', role: 'primary' },
  { file: 'Bellam gavvalu.jpg', slug: 'bellam-gavvalu', role: 'primary' },
  { file: 'Bobbattu.jpg', slug: 'bobbattu', role: 'primary' },
  { file: 'Gujiyaa.jpg', slug: 'gujiya', role: 'primary' },
  { file: 'Jalebi.jpg', slug: 'jalebi', role: 'primary' },
  { file: 'Paneer jilebi.jpg', slug: 'paneer-jalebi', role: 'primary' },
  { file: 'Poornalu.jpg', slug: 'poornalu', role: 'primary' },
  { file: 'Poothareku.jpg', slug: 'pootharekulu', role: 'primary' },
  { file: 'Sweet boondi_.jpg', slug: 'sweet-boondi', role: 'primary' },
  // ── milk sweets & burfi ──
  { file: 'Peda.jpg', slug: 'peda', role: 'primary' },
  { file: 'Badam Butter Burfi_.jpg', slug: 'badam-butter-burfi', role: 'primary' },
  { file: 'MangoCream.jpg', slug: 'mango-cream', role: 'primary' },
  { file: 'kaju bullets.jpg', slug: 'kaju-bullets', role: 'primary' },
  { file: 'kaju chikki.jpg', slug: 'kaju-chikki', role: 'primary' },
  // ── laddu bench ──
  { file: 'Annamaya laddu.jpg', slug: 'annamayya-laddu', role: 'primary' },
  { file: 'Besan laddu_.jpg', slug: 'besan-laddu', role: 'primary' },
  { file: 'Ganesh laddu.jpg', slug: 'ganesh-laddu', role: 'primary' },
  { file: 'Ganesh laddu(1).jpg', slug: 'ganesh-laddu', role: 'secondary' },
  { file: 'Rava laddu.jpg', slug: 'rava-laddu', role: 'primary' },
  // ── biscuits ──
  { file: 'Coconut biscuits_.jpg', slug: 'coconut-biscuits', role: 'primary' },
  { file: 'Kaju biscuits_.jpg', slug: 'kaju-biscuits', role: 'primary' },
  { file: 'Moon biscuits.jpg', slug: 'moon-biscuits', role: 'primary' },
  // ── savouries ──
  { file: 'Navaratna mixture_.jpg', slug: 'navaratna-mixture', role: 'primary' },
  { file: 'Masala pakodi.jpg', slug: 'masala-pakodi', role: 'primary' },
  { file: 'Kaju pakodi.jpg', slug: 'kaju-pakodi', role: 'primary' },
  { file: 'Gorumitulu.jpg', slug: 'gorumitulu', role: 'primary' },
  { file: 'kachuralu.jpg', slug: 'kachuralu', role: 'primary' },
  { file: 'Sanagalu.jpg', slug: 'sanagalu', role: 'primary' },
  { file: 'Vamupoosa.jpg', slug: 'vamu-poosa', role: 'primary' },
  // ── bites ──
  { file: 'Anjeer bites.jpg', slug: 'anjeer-bites', role: 'primary' },
  { file: 'Cranberry bites.jpg', slug: 'cranberry-bites', role: 'primary' },
  { file: 'Mango delight_.jpg', slug: 'mango-delight', role: 'primary' },
  { file: 'Kacha mango delight_.jpg', slug: 'kacha-mango-delight', role: 'primary' },
  { file: 'Panshots.jpg', slug: 'pan-shots', role: 'primary' },
  { file: 'Royal nutty dates_.jpg', slug: 'royal-nutty-dates', role: 'primary' },
  // ── hampers ──
  { file: 'Dryfruits gift hamper.jpg', slug: 'dry-fruits-gift-hamper', role: 'primary' },
  { file: 'Dussehra Gift Box.jpg', slug: 'dussehra-gift-box', role: 'primary' },
];

/**
 * Existing products with no photograph of their own, pointed at a photograph
 * of a DIFFERENT product from the same family.
 *
 * This is a deliberate, owner-approved stand-in — not a claim that the picture
 * is the item. `borrows` is the slug whose file is reused; nothing is copied,
 * the catalogue simply references the same /products/<slug>.webp path. Swap any
 * line for a real shot as it arrives and the stand-in disappears.
 */
export const BORROWED = [
  // savouries
  { slug: 'chekkalu', borrows: 'chegodilu' },
  { slug: 'pappu-chekkalu', borrows: 'chegodilu' },
  { slug: 'pappu-chekodi', borrows: 'chegodilu' },
  { slug: 'janthikalu', borrows: 'murukulu' },
  { slug: 'kara-boondhi', borrows: 'navaratna-mixture' },
  { slug: 'masala-palli', borrows: 'palli-pakodi' },
  { slug: 'onion-ribbon-pakodi', borrows: 'masala-pakodi' },
  { slug: 'dal-mudi-snacks', borrows: 'atukula-mixture' },
  // namkeens
  { slug: 'hyderabadi-mixture', borrows: 'navaratna-mixture' },
  { slug: 'peanut-chivda', borrows: 'atukula-mixture' },
  { slug: 'besan-sev', borrows: 'karapusa' },
  // sweet bites
  { slug: 'kesar-bites', borrows: 'mango-delight' },
  { slug: 'khajoor-bites', borrows: 'royal-nutty-dates' },
  { slug: 'mango-crunch-bites', borrows: 'kacha-mango-delight' },
  { slug: 'mixed-bites', borrows: 'tutti-frutti-bites' },
  { slug: 'strawberry-bites', borrows: 'cranberry-bites' },
  // dry fruits — the two whose fruit actually appears in the drop
  { slug: 'cranberry', borrows: 'cranberry-bites' },
  { slug: 'anjeer-whole', borrows: 'anjeer-bites' },
  // healthy sweets
  { slug: 'gondh-laddu', borrows: 'annamayya-laddu' },
  { slug: 'high-protein-laddu', borrows: 'booster-laddu' },
  { slug: 'millet-laddu', borrows: 'rava-laddu' },
  // hyderabadi specials
  { slug: 'badam-ki-jali', borrows: 'badam-butter-burfi' },
  { slug: 'khubani-dry-fruit-mithai', borrows: 'dry-fruit-halwa' },
  // combos, hampers, festival boxes
  { slug: 'chai-time-combo', borrows: 'navaratna-mixture' },
  { slug: 'festival-essentials-combo', borrows: 'dussehra-gift-box' },
  { slug: 'office-chai-tray', borrows: 'karapusa' },
  { slug: 'classic-gifting-box', borrows: 'dry-fruits-gift-hamper' },
  { slug: 'corporate-essentials-box', borrows: 'dry-fruits-gift-hamper' },
  { slug: 'wedding-trousseau-box', borrows: 'diwali-premium-hamper' },
  { slug: 'eid-signature-box', borrows: 'diwali-premium-hamper' },
  { slug: 'pongal-pot-set', borrows: 'dussehra-gift-box' },
];

/**
 * Products left with the tinted placeholder ON PURPOSE, because the drop
 * contains nothing of the kind. Borrowing here would not be a stand-in, it
 * would be a different foodstuff: there is no jar of pickle, no heap of podi
 * and no bowl of loose nuts anywhere in the 83 photographs.
 *
 * Listed rather than left implicit so the next shoot has its brief.
 */
export const STILL_UNSHOT = [
  // no pickle jar in the drop
  'allam-pickle', 'amla-pickle', 'chicken-pickle', 'chintakaya-pickle',
  'gongura-pickle', 'kakarakaya-pickle', 'lemon-pickle', 'masala-mango-pickle',
  // no podi/powder in the drop
  'kandi-podi', 'karam-podi', 'karivepaku-podi', 'kobbari-karam-podi',
  'nalla-karam-podi', 'nuvvula-karam-podi', 'palli-karam-podi', 'rasam-podi',
  'sambar-podi', 'vellulli-karam-podi',
  // no loose nuts in the drop
  'badam-almonds', 'kaju-cashew', 'pista-whole', 'salted-pista', 'walnuts',
  'roasted-almonds', 'saffron-pistachios',
  // no shot of these specific sweets
  'qubani-ka-meetha', 'double-ka-meetha', 'sheer-khurma', 'cardamom-soan-papdi',
];

/** Every photograph in the drop, matched or new. */
export const ALL_SHOTS = [...MATCHED, ...NEW];

/** slug -> public path. Borrowed slugs resolve to the lender's file. */
export function publicPath(slug) {
  return `/products/${slug}.webp`;
}
