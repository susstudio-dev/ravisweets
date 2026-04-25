/**
 * Corporate hamper pricing tiers — single source of truth.
 * Referenced by the hamper builder + corporate enquiry form.
 *
 * Tier thresholds are based on total units in the run. Discounts apply to
 * the PER-UNIT price of every item in the hamper, not to the line total.
 */

export type TierId = 'moq-below' | 'essence' | 'premium' | 'grande';

export interface Tier {
  id: TierId;
  label: string;
  /** Inclusive minimum unit count that unlocks this tier. */
  minUnits: number;
  /** Discount applied to every item's per-unit price, 0..1 (0 = no discount). */
  discount: number;
  /** Copy shown in the tier indicator while this tier is active. */
  blurb: string;
  /** Next-tier unlock prompt (undefined for the top tier). */
  nextUnlockAt?: number;
  nextUnlockLabel?: string;
}

/**
 * Custom-build MOQ floor. Below this, the "Submit enquiry" CTA is disabled.
 * The tiered catalogue on /corporate quotes MOQs per template (50 / 50 / 25).
 * In the builder, we adopt the union MOQ of 25 so Grande-tier custom builds still work.
 */
export const BUILDER_MOQ = 25;

export const TIERS: readonly Tier[] = [
  {
    id: 'moq-below',
    label: 'Below MOQ',
    minUnits: 0,
    discount: 0,
    blurb: `Minimum order ${BUILDER_MOQ} units — keep adding to unlock pricing tiers.`,
    nextUnlockAt: BUILDER_MOQ,
    nextUnlockLabel: `Essence tier unlocks at ${BUILDER_MOQ} units`,
  },
  {
    id: 'essence',
    label: 'Essence',
    minUnits: BUILDER_MOQ,
    discount: 0,
    blurb: 'Essence tier · standard per-unit pricing.',
    nextUnlockAt: 100,
    nextUnlockLabel: 'Premium tier unlocks at 100 units (5% off)',
  },
  {
    id: 'premium',
    label: 'Premium',
    minUnits: 100,
    discount: 0.05,
    blurb: 'Premium tier · 5% discount applied per unit.',
    nextUnlockAt: 500,
    nextUnlockLabel: 'Grande tier unlocks at 500 units (10% off)',
  },
  {
    id: 'grande',
    label: 'Grande',
    minUnits: 500,
    discount: 0.1,
    blurb: 'Grande tier · 10% discount applied per unit. White-glove account management included.',
  },
] as const;

export function tierFor(totalUnits: number): Tier {
  // Walk from highest to lowest so we pick the richest matching tier.
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const t = TIERS[i]!;
    if (totalUnits >= t.minUnits) return t;
  }
  return TIERS[0]!;
}

export interface HamperItem {
  /**
   * Stable identifier for this canvas line. Survives variant swaps so motion
   * layoutIds keep morphing the same card. Format: `${productId}:${variantId}:${rand}`
   * or `${productId}:${variantId}` for template-seeded items. Two lines may share
   * (productId, variantId) only as a transient artefact of v1 URL parsing; runtime
   * dedup collapses them on next interaction.
   */
  lineId: string;
  /** Product id (from catalogue). */
  productId: string;
  /** Variant id within the product. */
  variantId: string;
  /** Quantity of this item PER hamper unit (e.g., 2 Kaju Katli tins per gift box). */
  qtyPerHamper: number;
}

export interface PriceBreakdown {
  /** Per-unit price of one assembled hamper at the current tier. */
  perUnit: number;
  /** Per-unit price BEFORE tier discount — shown crossed-out when discount > 0. */
  perUnitUndiscounted: number;
  /** Total = perUnit × totalUnits. */
  total: number;
  /** Currency code (currently always INR). */
  currency: 'INR';
  tier: Tier;
}

export interface PriceInput {
  items: HamperItem[];
  /** How many hampers the buyer wants. */
  totalUnits: number;
  /** Per-item lookup of { variant price, stock ok }. */
  lookup: (productId: string, variantId: string) => { unitPrice: number; currency: 'INR' } | null;
}

export function computePrice({ items, totalUnits, lookup }: PriceInput): PriceBreakdown {
  const tier = tierFor(totalUnits);
  let perUnitUndiscounted = 0;
  for (const item of items) {
    const info = lookup(item.productId, item.variantId);
    if (!info) continue;
    perUnitUndiscounted += info.unitPrice * item.qtyPerHamper;
  }
  const perUnit = Math.round(perUnitUndiscounted * (1 - tier.discount));
  const total = perUnit * totalUnits;
  return {
    perUnit,
    perUnitUndiscounted,
    total,
    currency: 'INR',
    tier,
  };
}
