import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://susstudio-dev.github.io/ravisweets';

// Required when next.config has `output: 'export'` (the GH Pages build).
// Without this, Next refuses to statically generate the route handler and
// fails with "export const dynamic = force-static not configured".
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
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
