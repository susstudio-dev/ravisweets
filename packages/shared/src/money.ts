import { REGIONS, type RegionCode } from './types/region';
import type { Money } from './types/product';

export function formatMoney(money: Money, regionCode: RegionCode = 'in'): string {
  const region = REGIONS[regionCode];
  return new Intl.NumberFormat(region.locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: money.currency === 'INR' ? 0 : 2,
  }).format(money.amount);
}

export function inr(amount: number): Money {
  return { amount, currency: 'INR' };
}
