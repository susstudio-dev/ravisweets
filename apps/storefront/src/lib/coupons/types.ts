/**
 * Coupon engine — schema + validator types.
 *
 * Keep the schema in sync with supabase/migrations/0001_init.sql `coupons` table.
 * Validation is structurally identical client-side and server-side; the server is
 * authoritative on order commit.
 */

export type CouponType = 'percent' | 'flat' | 'free_shipping' | 'bogo';
export type CouponTarget = 'cart' | 'collection' | 'product' | 'hamper';

export interface CouponConstraints {
  minSubtotal?: number;
  firstOrderOnly?: boolean;
  customerSegment?: string[]; // 'corporate', 'nri', etc.
  regions?: string[];          // 'IN', 'US-CA' (DDP only)
  excludeOnSale?: boolean;
}

export interface Coupon {
  code: string;                // case-insensitive, stored uppercase
  type: CouponType;
  value: number;               // percent (1-100) or rupees (flat)
  maxDiscountCap?: number;     // rupees cap on percent
  targetScope: CouponTarget;
  targetIds?: string[];        // collection slugs / product ids / 'hamper'
  constraints: CouponConstraints;
  validFrom: string;           // ISO
  validTo?: string;            // ISO
  usageLimit?: number;
  perUserLimit?: number;       // default 1
  stackable: boolean;
  priority: number;
  active: boolean;
}

export interface CouponValidationContext {
  /** Cart subtotal in rupees (post line-discounts, pre-shipping). */
  subtotal: number;
  /** Customer id (Supabase auth.users.id), or null for anonymous. */
  customerId: string | null;
  /** Whether this is the customer's first order. */
  firstOrder: boolean;
  /** Customer segment tags ('corporate', 'nri'). */
  segments: string[];
  /** Customer's region (e.g. 'IN'). */
  region: string;
  /** Items in the cart for product/collection/hamper targeting. */
  items: { productId: string; collectionId?: string; isHamper?: boolean }[];
  /** Codes already applied to this cart. */
  appliedCodes: string[];
  /** Per-user redemption count of this code, computed from coupon_redemptions. */
  perUserRedeemed: number;
  /** Global redemption count of this code. */
  globalRedeemed: number;
  /** Now (Date.now()) — injected for testability. */
  now: number;
}

export type CouponValidationFailureReason =
  | 'unknown'
  | 'inactive'
  | 'expired'
  | 'not-yet-active'
  | 'wrong-region'
  | 'first-order-only'
  | 'wrong-segment'
  | 'no-target-match'
  | 'min-subtotal'
  | 'per-user-limit'
  | 'global-limit'
  | 'non-stackable';

export interface CouponValidationResult {
  ok: boolean;
  reason?: CouponValidationFailureReason;
  message?: string;
  /** Discount in rupees that would apply if accepted. */
  discount?: number;
}
