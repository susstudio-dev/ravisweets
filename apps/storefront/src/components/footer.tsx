import Link from 'next/link';
import { Paisley } from '@/components/brand/paisley';

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Sweets', href: '/category/sweets' },
      { label: 'Namkeens', href: '/category/namkeens' },
      { label: 'Hyderabadi Specials', href: '/category/hyderabadi-specials' },
      { label: 'Gift Hampers', href: '/category/gift-hampers' },
    ],
  },
  {
    heading: 'Business',
    links: [
      { label: 'Corporate Gifting', href: '/corporate' },
      { label: 'Bulk Enquiry', href: '/corporate#enquiry' },
      { label: 'Stores & Contact', href: '/stores' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Your Orders', href: '/account' },
      { label: 'Shipping & Delivery', href: '/policies/shipping' },
      { label: 'Returns & Refunds', href: '/policies/returns' },
      { label: 'Cancellation', href: '/policies/cancellation' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Terms', href: '/policies/terms' },
      { label: 'Privacy', href: '/policies/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[color:var(--theme-ink)]/[0.02] mt-16 border-t border-[color:var(--color-border)]">
      <div className="container-site py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Paisley size="sm" />
              <p className="font-display text-theme-ink text-xl">Ravi Sweets</p>
            </div>
            <p className="text-theme-ink/70 mt-3 text-sm">
              Hand-made Telangana sweets from our Khammam kitchen. FSSAI-certified. No
              preservatives. Made fresh every day.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-theme-ink/80 text-sm font-semibold uppercase tracking-wider">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-theme-ink/70 hover:text-theme-accent text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-theme-ink/60 mt-10 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Ravi Sweets. All rights reserved.</p>
          <p>FSSAI · Telangana — pending. GSTIN — Telangana series, pending.</p>
        </div>
      </div>
    </footer>
  );
}
