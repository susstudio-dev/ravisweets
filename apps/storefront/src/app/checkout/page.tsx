import type { Metadata } from 'next';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
