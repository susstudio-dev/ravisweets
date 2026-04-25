/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.BUILD_TARGET === 'github-pages';
const repoBasePath = process.env.PAGES_BASE_PATH ?? '';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@ravisweets/shared', '@ravisweets/ui'],

  // GitHub Pages = static export. next dev / vercel / default build are unchanged.
  ...(isGitHubPages
    ? {
        output: 'export',
        // basePath / assetPrefix apply when the site lives under a repo-scoped subpath
        // (e.g., https://{user}.github.io/ravisweets/). Leave empty for user/org pages
        // or a custom apex domain.
        ...(repoBasePath
          ? { basePath: repoBasePath, assetPrefix: repoBasePath }
          : {}),
        trailingSlash: true,
        images: {
          // Static export cannot use Next's image optimiser; unoptimise it.
          unoptimized: true,
          formats: ['image/avif', 'image/webp'],
          remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'ravisweets.com' },
          ],
        },
      }
    : {
        images: {
          formats: ['image/avif', 'image/webp'],
          remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'ravisweets.com' },
          ],
        },
      }),

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
