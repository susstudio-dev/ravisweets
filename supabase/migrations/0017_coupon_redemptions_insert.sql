-- ─── Ravi Sweets — coupon_redemptions INSERT policy ───────────────────────
--
-- 0001 created coupon_redemptions with SELECT policies only, so the
-- best-effort client insert in commitOrderToSupabase was RLS-denied on every
-- couponed order: the table stayed empty and per-user redemption caps were
-- unenforceable. This grants the narrowest useful INSERT: a signed-in
-- customer may record a redemption for THEMSELVES, bound to an order that is
-- provably their own (order_id is required — the FK to coupons already
-- bypasses RLS, so an optional order_id would allow unlimited spam rows
-- against any code, polluting the admin analytics that read this table),
-- with a non-negative amount and never pre-reversed.
--
-- Residual risk, accepted for now: a customer can still record redemptions
-- against their own orders for coupons they didn't really use, skewing their
-- own counts and admin analytics rows tied to their account. True integrity
-- (amount correctness, global caps, price binding) belongs to the
-- commit_order_with_coupon RPC tracked in 0010's not-included list.
--
-- Idempotent — safe to re-run.

drop policy if exists "customer records own redemption" on public.coupon_redemptions;
create policy "customer records own redemption" on public.coupon_redemptions
  for insert with check (
    auth.uid() = customer_id
    and reversed_at is null
    and discount_amount >= 0
    and order_id is not null
    and exists (
      select 1 from public.orders o
      where o.id = coupon_redemptions.order_id and o.customer_id = auth.uid()
    )
  );
