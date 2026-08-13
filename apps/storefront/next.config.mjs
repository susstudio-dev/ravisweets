/** @type {import('next').NextConfig} */

// Static-export targets: 'github-pages' (repo-subpath hosting) and
// 'cloudflare' (Cloudflare Pages, served at the domain root). Any other
// value (or unset) keeps the normal server build for next dev / next start.
const isStaticExport = ['github-pages', 'cloudflare'].includes(
  process.env.BUILD_TARGET ?? '',
);
const repoBasePath = process.env.PAGES_BASE_PATH ?? '';

/**
 * ONE IMAGE CONFIG FOR BOTH TARGETS.
 *
 * This used to be written twice, and the export branch carried
 * `unoptimized: true` with the note "static export cannot use Next's image
 * optimiser". That is half true. It cannot use the BUILT-IN optimiser, but
 * `output: 'export'` does support a CUSTOM loader — and `unoptimized` was
 * costing far more than it admitted: next/image emits no srcset under it, so
 * every device was served the 1400x1400 master and the `sizes` attribute on all
 * ~25 call sites was dead code. A phone spent 130 kB on a tile it painted at
 * 170 CSS px.
 *
 * src/lib/image-loader.ts maps a requested width onto the rungs that
 * scripts/photography/variants.mjs writes beside each master. The two files and
 * `deviceSizes` below are one contract; `pnpm photography:verify` fails if a
 * master is missing a rung.
 *
 * DEV USES THE SAME LOADER. The built-in optimiser would in principle do better
 * on `next dev`, but the only build that ships is the export — and a dev server
 * that resizes images the production one cannot is a dev server that hides this
 * exact class of bug.
 *
 * `formats` is deliberately absent: it configures the built-in optimiser, which
 * is no longer in play. Restore it if the custom loader is ever removed.
 */
const images = {
  loader: 'custom',
  loaderFile: './src/lib/image-loader.ts',
  // Candidate widths offered to the browser. 400 and 640 are the encoded rungs;
  // 1400 is the master. 200 sits in imageSizes so a fixed-size `sizes` (the 80px
  // cart thumb, the 48px order row) is not forced up to 400.
  deviceSizes: [640, 1400],
  imageSizes: [200, 400],
  /*
   * KEPT IN STEP WITH THE CSP IN public/_headers, WHICH IS THE CONTROL THAT
   * ACTUALLY BITES.
   *
   * Two things are true here and both matter. First, `remotePatterns` is inert
   * while `loader: 'custom'` is set — it validates URLs for the built-in
   * optimiser endpoint, which nothing routes through any more. Second, that is
   * exactly why it must not be allowed to drift: the day the custom loader is
   * removed this list starts deciding again, and a stale entry would be a
   * silently re-opened door.
   *
   * The 2026-08-13 security review narrowed img-src to the real Supabase
   * project and dropped two dead hosts. This list now says the same thing:
   * res.cloudinary.com was unused, and ravisweets.com is the retired WordPress
   * host that `lib/images.ts` already refuses at render. A wildcard
   * `*.supabase.co` would have let any Supabase tenant serve images here.
   *
   * If you add a host, add it to the CSP too, or next/image will happily render
   * a URL the browser then refuses — which looks like a broken image with no
   * error anywhere near the cause.
   */
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'ufxzgsygsgyxaxvknpjv.supabase.co' },
  ],
};

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Opt-in build-dir override so `next dev` (NEXT_DIST_DIR=.next-dev) and
  // concurrent `next build` runs never fight over the same .next directory.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  transpilePackages: ['@ravisweets/shared', '@ravisweets/ui'],

  // Static export for GH Pages / Cloudflare Pages. next dev / default build unchanged.
  ...(isStaticExport
    ? {
        output: 'export',
        // basePath / assetPrefix apply when the site lives under a repo-scoped subpath
        // (e.g., https://{user}.github.io/ravisweets/). Leave empty for user/org pages
        // or a custom apex domain.
        ...(repoBasePath
          ? { basePath: repoBasePath, assetPrefix: repoBasePath }
          : {}),
        trailingSlash: true,
      }
    : {}),

  images,

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
