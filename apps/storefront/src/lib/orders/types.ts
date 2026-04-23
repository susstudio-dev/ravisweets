import type { Money } from '@ravisweets/shared';

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderAddress {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface OrderLine {
  productId: string;
  productSlug: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  imageUrl?: string;
}

export interface Order {
  id: string;
  number: string;
  placedAt: number;
  status: OrderStatus;
  address: OrderAddress;
  payment: {
    method: PaymentMethod;
    reference: string;
  };
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
}
