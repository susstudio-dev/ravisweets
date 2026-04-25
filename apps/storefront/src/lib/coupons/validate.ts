import type {
  Coupon,
  CouponValidationContext,
  CouponValidationResult,
} from './types';

/**
 * Fail-fast validator. Order matches the spec:
 *   1. exists + active
 *   2. date window
 *   3. region
 *   4. customer eligibility (first-order, segment)
 *   5. cart eligibility (target intersects cart)
 *   6. min subtotal
 *   7. per-user usage cap
 *   8. global usage cap
 *   9. stackability vs already-applied codes
 *
 * The client calls this for live preview; the server (Supabase RPC) re-runs
 * the same logic on order commit. The discount in the result is INDICATIVE —
 * server is authoritative.
 */
export function validateCoupon(
  coupon: Coupon | null,
  ctx: CouponValidationContext,
  alreadyApplied: Coupon[] = [],
): CouponValidationResult {
  if (!coupon) {
    return { ok: false, reason: 'unknown', message: 'Code not valid.' };
  }
  if (!coupon.active) {
    return { ok: false, reason: 'inactive', message: 'Code not valid.' };
  }
  const validFrom = new Date(coupon.validFrom).getTime();
  if (ctx.now < validFrom) {
    return {
      ok: false,
      reason: 'not-yet-active',
      message: `Code becomes active on ${new Date(validFrom).toLocaleDateString('en-IN')}.`,
    };
  }
  if (coupon.validTo) {
    const validTo = new Date(coupon.validTo).getTime();
    if (ctx.now > validTo) {
      return {
        ok: false,
        reason: 'expired',
        message: `Code expired on ${new Date(validTo).toLocaleDateString('en-IN')}.`,
      };
    }
  }
  if (coupon.constraints.regions && coupon.constraints.regions.length > 0) {
    if (!coupon.constraints.regions.includes(ctx.region)) {
      return {
        ok: false,
        reason: 'wrong-region',
        message: 'Code not available in your region.',
      };
    }
  }
  if (coupon.constraints.firstOrderOnly && !ctx.firstOrder) {
    return {
      ok: false,
      reason: 'first-order-only',
      message: 'This code is for first orders only.',
    };
  }
  if (coupon.constraints.customerSegment && coupon.constraints.customerSegment.length > 0) {
    const ok = coupon.constraints.customerSegment.some((s) => ctx.segments.includes(s));
    if (!ok) {
      return {
        ok: false,
        reason: 'wrong-segment',
        message: 'Code not available for your account.',
      };
    }
  }
  if (coupon.targetScope !== 'cart') {
    const matches = ctx.items.some((item) => {
      if (coupon.targetScope === 'product') {
        return coupon.targetIds?.includes(item.productId) ?? false;
      }
      if (coupon.targetScope === 'collection') {
        return item.collectionId ? coupon.targetIds?.includes(item.collectionId) ?? false : false;
      }
      if (coupon.targetScope === 'hamper') {
        return item.isHamper ?? false;
      }
      return false;
    });
    if (!matches) {
      return {
        ok: false,
        reason: 'no-target-match',
        message:
          coupon.targetScope === 'hamper'
            ? 'Code applies to gift hampers only.'
            : 'Code does not apply to items in your cart.',
      };
    }
  }
  const minSubtotal = coupon.constraints.minSubtotal ?? 0;
  if (minSubtotal > 0 && ctx.subtotal < minSubtotal) {
    const delta = minSubtotal - ctx.subtotal;
    return {
      ok: false,
      reason: 'min-subtotal',
      message: `Add ₹${Math.ceil(delta).toLocaleString('en-IN')} more to use ${coupon.code}.`,
    };
  }
  const perUserLimit = coupon.perUserLimit ?? 1;
  if (perUserLimit > 0 && ctx.perUserRedeemed >= perUserLimit) {
    return {
      ok: false,
      reason: 'per-user-limit',
      message: 'You have already used this coupon.',
    };
  }
  if (typeof coupon.usageLimit === 'number' && ctx.globalRedeemed >= coupon.usageLimit) {
    return {
      ok: false,
      reason: 'global-limit',
      message: 'This coupon has been fully redeemed.',
    };
  }
  if (!coupon.stackable && alreadyApplied.length > 0) {
    return {
      ok: false,
      reason: 'non-stackable',
      message: `Cannot combine with ${alreadyApplied.map((c) => c.code).join(', ')}.`,
    };
  }
  if (alreadyApplied.some((c) => !c.stackable) && !coupon.stackable) {
    return {
      ok: false,
      reason: 'non-stackable',
      message: `Cannot combine with ${alreadyApplied.map((c) => c.code).join(', ')}.`,
    };
  }

  // Compute discount.
  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round((ctx.subtotal * coupon.value) / 100);
    if (typeof coupon.maxDiscountCap === 'number') {
      discount = Math.min(discount, coupon.maxDiscountCap);
    }
  } else if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, ctx.subtotal);
  } else if (coupon.type === 'free_shipping') {
    discount = 0; // shipping line discount is computed at checkout, not here
  } else if (coupon.type === 'bogo') {
    discount = 0; // BOGO is item-level; computed at checkout
  }

  return {
    ok: true,
    discount,
    message:
      coupon.type === 'percent'
        ? `${coupon.value}% off — saved ₹${discount.toLocaleString('en-IN')}`
        : coupon.type === 'flat'
        ? `₹${discount.toLocaleString('en-IN')} off`
        : coupon.type === 'free_shipping'
        ? 'Free shipping applied'
        : 'Buy-one-get-one applied',
  };
}

/**
 * Reference set of demo coupons baked into the bundle so the cart UI works
 * before Supabase is configured. The admin coupons table will replace this
 * once it's wired (Phase 2.5).
 */
export const DEMO_COUPONS: Coupon[] = [
  {
    code: 'FIRSTDIWALI',
    type: 'percent',
    value: 10,
    maxDiscountCap: 50000, // ₹500 cap (paise)
    targetScope: 'cart',
    constraints: { firstOrderOnly: true, regions: ['IN'] },
    validFrom: '2026-01-01T00:00:00+05:30',
    validTo: '2026-12-31T23:59:59+05:30',
    perUserLimit: 1,
    stackable: false,
    priority: 10,
    active: true,
  },
  {
    code: 'DIWALI500',
    type: 'flat',
    value: 50000, // ₹500 in paise
    targetScope: 'cart',
    constraints: { minSubtotal: 299900, regions: ['IN'] }, // ₹2999 min
    validFrom: '2026-09-01T00:00:00+05:30',
    validTo: '2026-11-15T23:59:59+05:30',
    perUserLimit: 1,
    stackable: false,
    priority: 20,
    active: true,
  },
  {
    code: 'FREESHIP99',
    type: 'free_shipping',
    value: 0,
    targetScope: 'cart',
    constraints: { minSubtotal: 99900 }, // ₹999 min
    validFrom: '2026-01-01T00:00:00+05:30',
    perUserLimit: 5,
    stackable: true,
    priority: 5,
    active: true,
  },
  {
    code: 'HAMPER10',
    type: 'percent',
    value: 10,
    targetScope: 'hamper',
    constraints: { regions: ['IN'] },
    validFrom: '2026-01-01T00:00:00+05:30',
    perUserLimit: 3,
    stackable: false,
    priority: 15,
    active: true,
  },
];

/**
 * Convenience lookup — case-insensitive against DEMO_COUPONS. Replace with a
 * Supabase query once the table is wired.
 */
export function findDemoCoupon(code: string): Coupon | null {
  const up = code.trim().toUpperCase();
  return DEMO_COUPONS.find((c) => c.code === up) ?? null;
}
