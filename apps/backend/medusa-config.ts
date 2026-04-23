import { defineConfig, loadEnv } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV ?? 'development', process.cwd());

/**
 * Ravi Sweets Medusa v2 configuration.
 *
 * - Postgres + Redis required (see docker-compose.yml in repo root for local dev).
 * - India region enabled for Phase 1; US / UK / UAE will be added in Phase 2.
 * - Razorpay (India) payment provider configured here; Stripe (international)
 *   will land when Phase 2 begins.
 *
 * See: openspec/changes/build-ravisweets-storefront/design.md decisions 1–3.
 */
export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS ?? 'http://localhost:7001',
      authCors: process.env.AUTH_CORS ?? 'http://localhost:3000,http://localhost:7001',
      jwtSecret: process.env.JWT_SECRET ?? 'change-me',
      cookieSecret: process.env.COOKIE_SECRET ?? 'change-me',
    },
    redisUrl: process.env.REDIS_URL,
  },
  modules: [
    // Payment modules — wired when keys are available.
    // {
    //   resolve: '@medusajs/payment',
    //   options: {
    //     providers: [
    //       { resolve: './src/modules/payment-razorpay', id: 'razorpay' },
    //       { resolve: './src/modules/payment-stripe', id: 'stripe' },
    //     ],
    //   },
    // },
  ],
  admin: {
    disable: false,
    path: '/admin',
  },
});
