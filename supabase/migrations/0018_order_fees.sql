-- ─── Ravi Sweets — order-level fees column ─────────────────────────────────
--
-- Admin-configurable charges (packing fee, COD fee — site_content key
-- 'charges') are itemised on the order so subtotal + shipping + fees −
-- discount = total stays a checkable identity in the admin views and
-- receipts. Shape: [{ "label": "Packing", "amount": 30 }, …] — amounts are
-- INTEGER RUPEES like every money column here.
--
-- Nullable by design: orders placed before charges existed carry no fees,
-- and the client commit path treats "column missing" as retry-without-fees,
-- so applying this file is not a deploy-order hazard.
--
-- Idempotent — safe to re-run.

alter table public.orders add column if not exists fees jsonb;

comment on column public.orders.fees is
  'Order-level fee lines [{label, amount}] in integer rupees, already included in total. Null = no fees (incl. all pre-charges orders).';
