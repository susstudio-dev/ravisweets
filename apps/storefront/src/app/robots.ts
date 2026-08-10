import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravisweets.com';

// Required when next.config has `output: 'export'` (the static-export build).
// Without this, Next refuses to statically generate the route handler and
// fails with "export const dynamic = force-static not configured".
export const dynamic = 'force-static';

/*
 * INDEXING IS NOW OPT-OUT, NOT OPT-IN.
 *
 * This gate used to be `=== 'true'`, so a build that simply did not set the
 * variable emitted `User-agent: * / Disallow: /`. That is what shipped: the
 * Cloudflare Pages environment never set it, and the live robots.txt told
 * every crawler to stay out of a launched, trading business.
 *
 * It also silently contradicted the page metadata — layout.tsx declares
 * `robots: { index: true, follow: true }`, and a Disallow in robots.txt means
 * Google never fetches the page to read that tag at all. Two mechanisms
 * disagreeing, with the more restrictive one winning by default.
 *
 * The photography condition this gate originally guarded is resolved: the
 * brand is live at its own domain and PRODUCT.md records the launch as done.
 * A launched shop that search engines cannot see is the worse failure.
 *
 * To close the site again (a staging deploy, a preview branch), set
 * NEXT_PUBLIC_INDEXING_ENABLED=false explicitly.
 */
const INDEXING_ENABLED = process.env.NEXT_PUBLIC_INDEXING_ENABLED !== 'false';

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }
  /*
   * ONE MECHANISM PER URL.
   *
   * This list used to disallow /account, /checkout and /cart as well. All
   * three now carry `robots: { index: false, follow: true }` in their page
   * metadata — and a URL that is BOTH disallowed here and noindexed there gets
   * the worst of both: Google never fetches the page, so it never reads the
   * noindex, so the URL can still surface as a bare link from an external
   * reference. A crawlable page with a meta noindex is the reliable exclusion.
   *
   * /admin/ and /api/ stay disallowed because the goal there is genuinely to
   * stop the fetch, not to control the index — and they carry their own
   * X-Robots-Tag from public/_headers as well.
   *
   * The same reasoning covers /orders and /search: both are noindex in page
   * metadata and both are deliberately absent from this list.
   */
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
