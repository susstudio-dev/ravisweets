import type { StoreCharges } from '@/lib/supabase/site-content';
import type { PaymentMethod } from './types';

/** One order-level fee line, integer rupees. */
export interface OrderFeeLine {
  label: string;
  amount: number;
}

/**
 * The one shipping rule, shared by the cart estimate and the checkout so the
 * two can never quote different numbers. Coupon-granted free shipping wins
 * over everything; the admin threshold applies after it.
 */
export function computeShipping(
  charges: StoreCharges,
  subtotalRupees: number,
  lineCount: number,
  couponFreeShipping: boolean,
): number {
  if (lineCount === 0) return 0;
  if (couponFreeShipping) return 0;
  if (charges.freeShippingAbove !== null && subtotalRupees >= charges.freeShippingAbove) return 0;
  return charges.shippingFlat;
}

/** Fee lines beyond shipping. Zero-valued fees are omitted, not shown as ₹0. */
export function computeOrderFees(
  charges: StoreCharges,
  paymentMethod: PaymentMethod,
): OrderFeeLine[] {
  const fees: OrderFeeLine[] = [];
  if (charges.packingFee > 0) fees.push({ label: 'Packing', amount: charges.packingFee });
  if (paymentMethod === 'cod' && charges.codFee > 0) {
    fees.push({ label: 'COD fee', amount: charges.codFee });
  }
  return fees;
}

export function feesTotal(fees: OrderFeeLine[]): number {
  return fees.reduce((sum, f) => sum + f.amount, 0);
}
