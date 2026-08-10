import Link from 'next/link';

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Sweets', href: '/category/sweets' },
      { label: 'Namkeens', href: '/category/namkeens' },
      { label: 'Hyderabadi Specials', href: '/category/hyderabadi-specials' },
      { label: 'Gift Hampers', href: '/category/gift-hampers' },
      { label: 'Send Sweets to India', href: '/send-sweets-to-india' },
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
    <footer
      data-register="carbon"
      className="bg-theme-base text-theme-ink mt-16 border-t border-[color:var(--color-border)]"
    >
      <div className="container-site py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
              <p className="font-display text-theme-ink text-xl">Ravi Sweets</p>
            </div>
            {/*
              The footer is the correct home for ONE origin mention — this is
              the NAP zone, and it is where the locality now lives in the brand
              voice instead of the hero.

              "FSSAI-certified" is deliberately gone: it contradicted the
              jurisdiction line ~30 lines below on this same component, which
              reads "FSSAI · Telangana — pending". Replaced with the claim
              PRODUCT.md actually substantiates — composition transparency.
            */}
            <p className="text-theme-ink/70 mt-3 text-sm">
              Hand-made sweets from a family kitchen in Khammam, Telangana, since 1983. No
              preservatives. Full ingredient and allergen panel on every product.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="field-label">{col.heading}</h3>
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
        {/* pb-16 reserves a gutter for the at-rest contact slip: compliance
            text is the last thing that should sit under a floating widget. */}
        <div className="text-theme-ink/60 mt-10 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--color-border)] pb-16 pt-6 text-xs sm:flex-row sm:items-center sm:pb-10">
          <p>© {new Date().getFullYear()} Ravi Sweets. All rights reserved.</p>
          <p>FSSAI · Telangana — pending. GSTIN — Telangana series, pending.</p>
        </div>
      </div>
    </footer>
  );
}
