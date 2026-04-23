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
    <footer className="mt-16 border-t border-[color:var(--color-border)] bg-[color:var(--theme-ink)]/[0.02]">
      <div className="container-site py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Paisley size="sm" />
              <p className="font-display text-xl font-bold text-theme-ink">Ravi Sweets</p>
            </div>
            <p className="mt-3 text-sm text-theme-ink/70">
              Hand-made Hyderabadi sweets, rooted in Nizami heritage. FSSAI-certified kitchen. No
              preservatives. Made fresh every day.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-theme-ink/80">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-theme-ink/70 transition-colors hover:text-theme-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pt-6 text-xs text-theme-ink/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Ravi Sweets. All rights reserved.</p>
          <p>FSSAI Lic. No. — pending. GSTIN — pending.</p>
        </div>
      </div>
    </footer>
  );
}
