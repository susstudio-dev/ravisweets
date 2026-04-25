# Supabase setup runbook — Ravi Sweets

Your Supabase project is provisioned at **https://soriromiepeoacibhpex.supabase.co**. Credentials are already saved in `.env.local` (gitignored). Follow this once to land schema + create your admin user.

## 1 · Run the schema migration (no CLI needed)

> **Important:** the SQL editor expects raw SQL. The error you saw —
> `42601: syntax error at or near "supabase" LINE 1: supabase/migrations/0001_init.sql` —
> means you pasted the *file path* instead of the file *contents*.

The SQL file at `supabase/migrations/0001_init.sql` creates every table, RLS policy, and seeds the default theme preset.

**Step-by-step:**

1. Open the file in your editor: **`c:\aidenai\Bhu\Ravisweets\supabase\migrations\0001_init.sql`**
   - VS Code: `Ctrl+P` → type `0001_init.sql` → Enter
2. Press `Ctrl+A` to select all, then `Ctrl+C` to copy the entire file contents (it's ~250 lines starting with `-- ─── Ravi Sweets — initial Supabase schema ──`).
3. Open the Supabase SQL editor: https://supabase.com/dashboard/project/soriromiepeoacibhpex/sql/new
4. Click into the editor and `Ctrl+V` to paste the SQL.
5. Click **Run** (bottom right).
6. You should see "Success. No rows returned" or similar. Verify by visiting **Table Editor** — you should see `customers`, `addresses`, `products`, `variants`, `orders`, `enquiries`, `coupons`, `coupon_redemptions`, `theme_presets`, `store_settings`, `audit_log`.

**If the editor truncates the paste:** save the SQL file as a `.sql` upload via the dashboard's **Database → Migrations** page instead.

## 2 · Create your admin user

The brand-owner login. Done from the Supabase dashboard so the JWT custom claim `role: 'admin'` is set:

1. Open https://supabase.com/dashboard/project/soriromiepeoacibhpex/auth/users
2. Click **Add user** → **Create new user**
3. Email: `you@ravisweets.com` (or any address you control)
4. Set a strong password
5. Check **Auto Confirm User** (skips email verification for admin)
6. Click **Create user**
7. Click the new user row → scroll to **Raw user meta data** / **App metadata** section
8. Edit the **app_metadata** JSON to:
   ```json
   { "role": "admin" }
   ```
9. Save

Now `/admin/login` will accept this email + password and route you into the admin shell.

## 3 · (Optional) Enable phone OTP via MSG91

Phone OTP lights up once DLT (TRAI mandate) clears — typically 2-7 days.

1. Sign up at https://msg91.com/signup
2. **Approve a sender ID** with your DLT operator (Vodafone Idea / Airtel) — MSG91 walks you through this.
3. **Approve an OTP template** — sample: `Your Ravi Sweets verification code is {{otp}}. Valid for 10 minutes. Don't share with anyone.`
4. In Supabase Dashboard → **Authentication → Providers → Phone**, configure:
   - Provider: **MSG91**
   - Auth Key: from MSG91 dashboard
   - Sender ID: your DLT-approved sender
   - Template ID: your approved template
5. In `.env.local`, flip `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` and restart dev.

## 4 · Verify the wiring

```bash
# Start dev server
pnpm --filter @ravisweets/storefront dev
```

Open http://localhost:3000:
- **Storefront** loads as before
- **Add to cart → Checkout → Place order** triggers the `<AuthModal>` (anonymous-to-claim flow)
- **Sign in with email** sends an OTP to the email you entered
- **Account page** shows orders for the logged-in identity once orders write to Supabase

Open http://localhost:3000/admin:
- Should redirect to `/admin/login`
- Sign in with your admin email + password
- Land on the Dashboard — revenue cards / pending orders / low stock / top SKUs

## 5 · Phase 2.5 — Storefront writes to Supabase (wired)

The storefront now mirrors every write to Supabase when the env vars are configured, falling back to localStorage-only when they aren't. Entry points:

- **Order commit** — `apps/storefront/src/lib/supabase/orders.ts → commitOrderToSupabase`. Inserts the row under `auth.uid()` (RLS-scoped) with `discount`, `coupon_code`, `address_snapshot`. Called from `checkout-flow.tsx` after the simulated payment.
- **Coupon redemptions** — same call writes one row per applied code into `coupon_redemptions` (best-effort; failure does not roll back the order).
- **Customer profile bootstrap** — `apps/storefront/src/lib/supabase/customers.ts → ensureCustomerProfile`. Idempotent upsert into `customers`, fired from `<SupabaseProvider>` whenever a non-anonymous session lands. Required because `orders.customer_id` FK's `public.customers(id)`.
- **Coupon state** — `apps/storefront/src/lib/coupons/context.tsx`. Lifted out of `<CouponInput>` into a context wrapped above `<Header>` so checkout can read the active discount and free-shipping flag.
- **Account orders** — `account-view.tsx` reads from Supabase via `listMyOrders` and merges with localStorage (so demo orders survive).
- **Corporate enquiries** — `corporate-enquiry.tsx` writes to `enquiries` via `submitEnquiry`.
- **Admin reads** — `/admin/orders`, `/admin/enquiries`, `/admin/coupons` all read from Supabase under the admin RLS policies.

Outstanding for the full Phase 2 cut (deferred):
- Server-side `commit_order_with_coupon` RPC (re-validates the coupon, splits per-redemption discount).
- Address-book persistence (`addresses` table) — currently only `address_snapshot` on the order.
- Server-side rate limit on coupon submissions.

## 6 · Optional — Supabase CLI for migrations

If you want to manage migrations as code (recommended once the schema starts evolving), install the Supabase CLI:

```powershell
# Windows PowerShell
scoop install supabase
# or
npm install -g supabase
```

Then in this repo:

```bash
supabase login            # opens browser for OAuth
supabase init             # if not already
supabase link --project-ref soriromiepeoacibhpex
supabase db push          # applies supabase/migrations/*.sql to remote
```

Until then, the dashboard SQL editor is your migration runner.

## Cost

Free tier covers:
- 50K monthly active users
- 500MB Postgres
- 1GB storage
- 2GB egress per month
- Unlimited API calls

Ravi Sweets at launch volume (≤ 1000 customers, 24 SKUs, < 1GB images) sits comfortably inside this. Expected cost: **₹0/month** until you exceed any one of those quotas.

## Security notes

- The **anon key** (`sb_publishable_Ck6S11...`) is designed for browser bundles. It identifies your project but cannot bypass Row-Level Security. Do NOT confuse it with the service-role key (which DOES bypass RLS and must never ship to the client).
- The DB connection string in chat (`postgresql://postgres:[YOUR-PASSWORD]@...`) is for direct DB access only. Don't paste it into any client code; only use it for `psql` or migration tools.
- Every admin write hits `audit_log` so you have an audit trail.
- Admin login enforces MFA on first login (TOTP).

## Roll back

If anything goes sideways, you can disable Supabase wiring without redeploying:

```bash
# In .env.local, flip:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

The storefront detects the placeholder URL and falls back to localStorage-only behaviour. Admin shows the "Connect Supabase to enable admin" setup screen.
