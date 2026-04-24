import type { HamperItem } from './pricing';

export type TemplateId = 'essence' | 'premium' | 'grande' | 'blank';

export type RibbonColor = 'saffron' | 'cream' | 'gold' | 'ink' | 'rose';
export type BoxFinish = 'matte-cream' | 'lacquered-brass' | 'silk-wrap';

export interface HamperConfig {
  templateId: TemplateId;
  items: HamperItem[];
  totalUnits: number;
  ribbon: RibbonColor;
  box: BoxFinish;
  logoPrint: boolean;
  message: string;
}

export interface Template {
  id: TemplateId;
  title: string;
  tagline: string;
  startingUnits: number;
  items: HamperItem[];
  ribbon: RibbonColor;
  box: BoxFinish;
  logoPrint: boolean;
  /** Short description for the template-picker card. */
  description: string;
}

/**
 * Four starting points for a corporate hamper build.
 * Item ids reference products defined in ./products.ts — IDs are stable, variants
 * default to each product's first (primary) variant.
 */
export const TEMPLATES: Record<TemplateId, Template> = {
  essence: {
    id: 'essence',
    title: 'Essence',
    tagline: 'Starter',
    startingUnits: 50,
    items: [
      { productId: 'p_kaju_katli', variantId: 'v_kaju_250', qtyPerHamper: 1 },
      { productId: 'p_badam_ki_jali', variantId: 'v_bkj_250', qtyPerHamper: 1 },
      { productId: 'p_dry_almonds', variantId: 'v_alm_200', qtyPerHamper: 1 },
    ],
    ribbon: 'cream',
    box: 'matte-cream',
    logoPrint: false,
    description:
      'Three hand-picked staples in a matte-cream box. Clean, classic, and understated — our starter tier.',
  },
  premium: {
    id: 'premium',
    title: 'Premium',
    tagline: 'Bestseller',
    startingUnits: 100,
    items: [
      { productId: 'p_qubani', variantId: 'v_qubani_500', qtyPerHamper: 1 },
      { productId: 'p_kaju_katli', variantId: 'v_kaju_500', qtyPerHamper: 1 },
      { productId: 'p_badam_ki_jali', variantId: 'v_bkj_250', qtyPerHamper: 1 },
      { productId: 'p_dry_pistachios', variantId: 'v_pist_200', qtyPerHamper: 1 },
      { productId: 'p_dry_almonds', variantId: 'v_alm_200', qtyPerHamper: 1 },
    ],
    ribbon: 'saffron',
    box: 'lacquered-brass',
    logoPrint: false,
    description:
      'Our signature corporate hamper — Hyderabadi specials, two dry-fruit tins, lacquered-brass box.',
  },
  grande: {
    id: 'grande',
    title: 'Grande',
    tagline: 'Signature',
    startingUnits: 25,
    items: [
      { productId: 'p_qubani', variantId: 'v_qubani_500', qtyPerHamper: 1 },
      { productId: 'p_double_ka_meetha', variantId: 'v_dkm_500', qtyPerHamper: 1 },
      { productId: 'p_kaju_katli', variantId: 'v_kaju_500', qtyPerHamper: 1 },
      { productId: 'p_badam_ki_jali', variantId: 'v_bkj_250', qtyPerHamper: 1 },
      { productId: 'p_sheer_khurma', variantId: 'v_skh_500', qtyPerHamper: 1 },
      { productId: 'p_dry_pistachios', variantId: 'v_pist_200', qtyPerHamper: 1 },
      { productId: 'p_dry_almonds', variantId: 'v_alm_200', qtyPerHamper: 1 },
      { productId: 'p_saffron_pistachios', variantId: 'v_saff_100', qtyPerHamper: 1 },
    ],
    ribbon: 'gold',
    box: 'silk-wrap',
    logoPrint: true,
    description:
      'The full Hyderabadi spread in a silk-wrapped box with brass accents. Logo printing included.',
  },
  blank: {
    id: 'blank',
    title: 'Blank',
    tagline: 'Build from scratch',
    startingUnits: 25,
    items: [],
    ribbon: 'cream',
    box: 'matte-cream',
    logoPrint: false,
    description:
      'Start from an empty box and compose your own. Tier pricing still applies based on total units.',
  },
};

export const RIBBON_SWATCHES: { id: RibbonColor; label: string; hex: string }[] = [
  { id: 'saffron', label: 'Saffron', hex: '#f2a365' },
  { id: 'cream', label: 'Cream', hex: '#f0e7d5' },
  { id: 'gold', label: 'Gold', hex: '#d6a352' },
  { id: 'ink', label: 'Ink', hex: '#3a1e0c' },
  { id: 'rose', label: 'Rose', hex: '#c87a8a' },
];

export const BOX_FINISHES: { id: BoxFinish; label: string; sub: string }[] = [
  { id: 'matte-cream', label: 'Matte cream', sub: 'Classic · understated' },
  { id: 'lacquered-brass', label: 'Lacquered brass', sub: 'Festive · statement' },
  { id: 'silk-wrap', label: 'Silk-wrapped', sub: 'Premium · gift-first' },
];
