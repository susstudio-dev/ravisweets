import type { Metadata } from 'next';
import { AccountView } from '@/components/account/account-view';

export const metadata: Metadata = {
  title: 'Your account — orders and addresses',
  // This page inherited the site-wide description, which described the shop
  // rather than the page — one of the duplicate descriptions in the crawl.
  description:
    'Your Ravi Sweets account — past orders, saved addresses and delivery preferences, all in one place.',
  alternates: { canonical: '/account' },
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return <AccountView />;
}
