import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://susstudio-dev.github.io/ravisweets';

// Required when next.config has `output: 'export'` (the static-export build).
// Without this, Next refuses to statically generate the route handler and
// fails with "export const dynamic = force-static not configured".
export const dynamic = 'force-static';

// Indexing stays disallowed until production photography lands and the real
// domain is flipped (photography-gating requirement in
// elevate-storefront-visual-experience spec). Set
// NEXT_PUBLIC_INDEXING_ENABLED=true at build time to open the site to
// crawlers.
const INDEXING_ENABLED = process.env.NEXT_PUBLIC_INDEXING_ENABLED === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account', '/api/', '/checkout', '/cart'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
