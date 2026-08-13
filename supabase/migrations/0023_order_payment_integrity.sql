-- ─── Ravi Sweets — order & payment integrity ──────────────────────────────
--
-- Closes the database half of the checkout money holes found in the
-- 2026-08-13 security review. The AMOUNT is recomputed in the razorpay-order
-- edge function (it holds the service role and can read authoritative variant
-- prices regardless of RLS); this file removes the database-side openings that
-- the "pay ₹1 for anything" and "mark paid without paying" attacks stood on.
--
-- Idempotent — safe to re-run.
--
-- ── Apply ──
--   supabase db push          (or paste into the SQL editor)
--   then: supabase functions deploy razorpay-order

-- ── orders: a customer may CREATE an order, not PRICE it as paid ───────────
-- The old INSERT policy checked ownership only, so the browser could write
-- status, total and a fully-formed `payment` blob — letting a customer insert
-- an order already stamped 'paid' (razorpay_payment_id / paid_at) with no money
-- moved. Payment state is now writable ONLY by the service-role edge function
-- on verified capture; the client may insert an unpaid, freshly-'placed' order
-- and nothing more.
drop policy if exists "customer creates own orders" on public.orders;
create policy "customer creates own orders" on public.orders for insert
  with check (
    auth.uid() = customer_id
    and status = 'placed'
    and not (payment ? 'razorpay_payment_id')
    and not (payment ? 'paid_at')
    and subtotal >= 0
    and discount >= 0
    and discount <= subtotal
    and total >= 0
  );

-- A customer must NOT be able to UPDATE their own order (there was no such
-- policy, so this is belt-and-braces): status transitions and the payment
-- stamp are admin / service-role only. Without this, a future permissive
-- policy could let a buyer flip their own order to 'paid'. RLS default-denies
-- UPDATE for customers already; we simply do not add one.

-- ── coupons: no public enumeration; exact-code preview via a definer RPC ───
-- `select *` on coupons let anyone harvest every active code, value and cap.
-- The table is taken off public read entirely; the storefront now previews a
-- single code it already knows through preview_coupon(), which cannot be used
-- to enumerate. Admin keeps full read/write through the is_admin() "for all"
-- policy.
drop policy if exists "anyone reads active coupons" on public.coupons;

create or replace function public.preview_coupon(p_code text)
returns public.coupons
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.coupons
  where code = upper(trim(p_code))
    and active
    and (valid_to is null or valid_to >= now())
    and (valid_from is null or valid_from <= now())
  limit 1;
$$;

revoke all on function public.preview_coupon(text) from public;
grant execute on function public.preview_coupon(text) to anon, authenticated;

comment on function public.preview_coupon(text) is
  'Returns one coupon by exact code for live checkout preview. SECURITY DEFINER so it works with coupons off public read; cannot enumerate (caller must know the code). The discount is re-derived server-side at charge time in the razorpay-order edge function — this preview is indicative only.';

-- ── variants: do not expose variants of archived (hidden) products ─────────
-- Products are already scoped to non-archived for anon; variants were open
-- (`using (true)`), so an archived product's SKUs, prices and stock stayed
-- readable. Bring variants in line with their product.
drop policy if exists "anyone reads variants" on public.variants;
create policy "anyone reads live variants" on public.variants for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = variants.product_id and not p.archived
    )
  );
