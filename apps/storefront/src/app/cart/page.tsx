import type { Metadata } from 'next';
import { CartView } from '@/components/cart/cart-view';

/*
 * NOINDEX, BUT FOLLOW.
 *
 * A cart is a per-visitor page with nothing to rank, so it should not be in
 * the index — robots.txt already disallows it. It should still pass link
 * equity onward to the products it links to, which is why `follow` is true.
 * The crawl flagged `nofollow` on four URLs precisely because the pairing is
 * usually accidental: it stops PageRank dead for no benefit.
 */
export const metadata: Metadata = {
  title: 'Your cart — review your order',
  description:
    'Review and adjust the sweets, namkeens and hampers in your Ravi Sweets cart before checkout.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
