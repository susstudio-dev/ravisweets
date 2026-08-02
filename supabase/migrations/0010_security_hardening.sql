-- ─── Ravi Sweets — security hardening (audit follow-up) ──────────────────
--
-- Tightens RLS write paths that were checking ownership only, plus scopes
-- two over-broad public reads. All statements are idempotent (drop-if-exists
-- then recreate) so this file is safe to re-run and safe to fold into
-- SETUP_ALL.sql later.
--
-- NOT included here (needs a server-side RPC, tracked separately):
--   • orders INSERT price/total integrity  → commit_order_with_coupon RPC
--   • coupons public read / coupon_redemptions caps → same RPC
--   • is_admin() least-privilege split across staff roles

-- 1. reviews INSERT — the client may only file a PENDING review it owns, with
--    no pre-set helpful_count and an order_id that is either null or one of
--    the caller's own orders. Moderation (pending→approved) stays admin-only.
drop policy if exists "customer inserts own review" on public.reviews;
create policy "customer inserts own review" on public.reviews for insert
  with check (
    auth.uid() = customer_id
    and status = 'pending'
    and helpful_count = 0
    and (
      order_id is null
      or exists (
        select 1 from public.orders o
        where o.id = reviews.order_id and o.customer_id = auth.uid()
      )
    )
  );

-- 2. promotions SELECT — expose only the live promotion, not drafts/expired
--    rows or their unlaunched codes.
drop policy if exists "anyone reads promotions" on public.promotions;
drop policy if exists "anyone reads active promotion" on public.promotions;
create policy "anyone reads active promotion" on public.promotions
  for select using (active and (expires_at is null or expires_at >= now()));

-- 3. enquiries INSERT — a public contact form may stay open to guests, but an
--    authenticated submitter can no longer spoof another customer's id.
drop policy if exists "anyone creates enquiry" on public.enquiries;
create policy "anyone creates enquiry" on public.enquiries for insert
  with check (customer_id is null or auth.uid() = customer_id);

-- 4. review-photos bucket — constrain uploads to a per-user folder, block
--    anonymous identities, and cap size / MIME at the bucket level so the
--    public bucket can't be used as open file hosting.
update storage.buckets
  set file_size_limit = 5242880,  -- 5 MB
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  where id = 'review-photos';

drop policy if exists "any signed-in user uploads review photo" on storage.objects;
create policy "verified user uploads own review photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'review-photos'
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin/owner may remove review photos for moderation.
drop policy if exists "admin deletes review photo" on storage.objects;
create policy "admin deletes review photo"
  on storage.objects for delete to authenticated
  using (bucket_id = 'review-photos' and public.is_admin());
