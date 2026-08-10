import type { Metadata } from 'next';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata: Metadata = {
  title: 'Checkout — complete your order',
  description:
    'Complete your Ravi Sweets order. Secure payment, and dispatch from our Khammam kitchen the morning after you order.',
  alternates: { canonical: '/checkout' },
  // noindex (a transactional page has nothing to rank) but follow — see cart.
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
