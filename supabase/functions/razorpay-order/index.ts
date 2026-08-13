/**
 * Supabase Edge Function — `razorpay-order`
 *
 * The server half of Razorpay checkout. The storefront is a Next.js STATIC
 * EXPORT on Cloudflare Pages, so there is no Next server route to put this in;
 * this function is the only trusted execution context the project has, which
 * is why order pricing and signature verification both live here.
 *
 * Two actions on one function, so there is one secret to set and one URL to
 * allow-list:
 *
 *   POST { action: 'create', orderId }
 *     → RE-PRICES the order server-side from authoritative variant prices,
 *       writes the corrected amounts back to the row, creates a Razorpay order
 *       for that amount, returns { razorpayOrderId, amount, currency, keyId }.
 *
 *   POST { action: 'verify', orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 *     → recomputes the HMAC-SHA256 signature, RE-FETCHES the payment from
 *       Razorpay to confirm it was captured for the expected amount, and only
 *       then records the payment in the order's `payment` jsonb. Returns
 *       { ok: true }.
 *
 * ─── WHY THE AMOUNT IS RECOMPUTED HERE (2026-08-13 security fix) ───────────
 * The storefront writes the order row from the browser under the buyer's own
 * key, so `total` on that row is CLIENT-CONTROLLED — a buyer could write
 * total=1 for a ₹4,000 cart, and the previous version of this function charged
 * exactly what the row said. The amount is now recomputed from the order's
 * `lines` against `variants.price_amount` (read with the service role, so RLS
 * and the client cannot touch it), the discount is bounded by what the named
 * coupon could legitimately give, and shipping/fees are floored at zero. An
 * honest order re-prices to the same number it already showed; a tampered one
 * re-prices to the truth before a paisa is charged. The corrected numbers are
 * written back so the admin console and receipt show what was actually billed.
 *
 * ─── WHY VERIFICATION IS NOT OPTIONAL ──────────────────────────────────────
 * Razorpay's browser callback can be forged. A payment is recorded only after
 * this function has (a) matched HMAC_SHA256(orderId|paymentId, secret) against
 * the returned signature and (b) re-fetched the payment from Razorpay and
 * confirmed it was captured/authorized for the amount we created the order for.
 *
 * ─── WHO MAY CALL IT ───────────────────────────────────────────────────────
 * The caller's Supabase JWT is validated and must OWN the order — a signed-in
 * customer can only price/verify their own orders, not someone else's.
 *
 * ─── Deploy ────────────────────────────────────────────────────────────────
 *   supabase functions deploy razorpay-order
 *   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
 *   supabase secrets set RAZORPAY_KEY_SECRET=xxx
 *
 * RAZORPAY_KEY_SECRET must NEVER appear in .env.production or any NEXT_PUBLIC_*
 * variable — those ship in the browser bundle. The key ID is public and is
 * returned by `create` so the client never needs it baked in either.
 */

// @ts-expect-error — Deno globals are available in Supabase Edge runtime.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — Deno-style import for Supabase JS, run in Edge runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// @ts-expect-error — Deno global.
const env = (k: string): string | undefined => Deno.env.get(k);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/** The `payment` jsonb on an orders row. Client writes method/reference only. */
interface PaymentBlob {
  method?: string;
  reference?: string;
  provider?: string;
  razorpay_order_id?: string;
  /** Paise we created the Razorpay order for — verify compares the capture to it. */
  amount_paise?: number;
  razorpay_payment_id?: string;
  paid_at?: string;
}

interface OrderLine {
  variantId?: string;
  quantity?: number;
}

interface CouponRow {
  code: string;
  type: string;
  value: number;
  max_discount_cap: number | null;
  valid_from: string | null;
  valid_to: string | null;
  active: boolean;
  per_user_limit: number | null;
  constraints: { minSubtotal?: number } | null;
}

/** Constant-time comparison — a plain `===` on a signature leaks timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * The authoritative payable total, in integer rupees, recomputed from the
 * order's lines against variant prices the client cannot touch. Returns the
 * corrected breakdown; `resolved` is false when a line references a variant not
 * in the DB (an un-seeded SKU), in which case the caller keeps the row's own
 * total rather than risk rejecting a legitimate order for missing seed data.
 */
async function recomputeAmount(
  // deno client type is loose in this runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  order: {
    lines: OrderLine[];
    shipping: number;
    fees: { amount?: number }[] | null;
    discount: number;
    coupon_code: string | null;
  },
): Promise<{ resolved: boolean; subtotal: number; discount: number; total: number }> {
  const lines = Array.isArray(order.lines) ? order.lines : [];
  const variantIds = [...new Set(lines.map((l) => l.variantId).filter(Boolean))] as string[];

  const priceById = new Map<string, number>();
  if (variantIds.length > 0) {
    const { data: variants } = await admin
      .from('variants')
      .select('id, price_amount')
      .in('id', variantIds);
    for (const v of variants ?? []) priceById.set(v.id, Number(v.price_amount));
  }

  let subtotal = 0;
  let resolved = true;
  for (const l of lines) {
    const price = l.variantId ? priceById.get(l.variantId) : undefined;
    const qty = Math.max(0, Math.floor(Number(l.quantity) || 0));
    if (price == null || !Number.isFinite(price)) {
      resolved = false;
      break;
    }
    subtotal += price * qty;
  }

  // Discount: bounded by what the NAMED coupon could legitimately give at this
  // server subtotal. A forged discount (bigger than the coupon allows, or with
  // no coupon at all) collapses to that ceiling — the honest case passes through.
  let maxDiscount = 0;
  if (order.coupon_code) {
    const { data: coupon } = (await admin
      .from('coupons')
      .select('code, type, value, max_discount_cap, valid_from, valid_to, active, per_user_limit, constraints')
      .eq('code', String(order.coupon_code).toUpperCase())
      .maybeSingle()) as { data: CouponRow | null };
    if (coupon && coupon.active) {
      const now = Date.now();
      const fromOk = !coupon.valid_from || Date.parse(coupon.valid_from) <= now;
      const toOk = !coupon.valid_to || Date.parse(coupon.valid_to) >= now;
      const minOk = subtotal >= (coupon.constraints?.minSubtotal ?? 0);
      if (fromOk && toOk && minOk) {
        if (coupon.type === 'percent') {
          maxDiscount = Math.round((subtotal * coupon.value) / 100);
          if (typeof coupon.max_discount_cap === 'number') {
            maxDiscount = Math.min(maxDiscount, coupon.max_discount_cap);
          }
        } else if (coupon.type === 'flat') {
          maxDiscount = Math.min(coupon.value, subtotal);
        }
        // free_shipping / bogo: no cart-total discount here (shipping/item logic
        // is not re-derivable server-side yet) — bounded to 0, so they cannot
        // be abused to zero out the total.
      }
    }
  }
  const discount = Math.min(Math.max(0, Math.floor(Number(order.discount) || 0)), maxDiscount, subtotal);

  const shipping = Math.max(0, Math.floor(Number(order.shipping) || 0));
  const fees = Array.isArray(order.fees)
    ? order.fees.reduce((s, f) => s + Math.max(0, Math.floor(Number(f?.amount) || 0)), 0)
    : 0;

  const total = Math.max(0, subtotal + shipping + fees - discount);
  return { resolved, subtotal, discount, total };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const keyId = env('RAZORPAY_KEY_ID');
  const keySecret = env('RAZORPAY_KEY_SECRET');
  const supabaseUrl = env('SUPABASE_URL');
  const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY');

  if (!keyId || !keySecret) {
    return json({ error: 'Razorpay is not configured on the server.' }, 500);
  }
  if (!supabaseUrl || !serviceRole) {
    return json({ error: 'Supabase service credentials missing.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRole);
  const rpAuth = `Basic ${btoa(`${keyId}:${keySecret}`)}`;

  // ── who is calling ───────────────────────────────────────────────────────
  // The invoke() call forwards the buyer's Supabase JWT. Validate it and, below,
  // require that they own the order — a signed-in customer must not be able to
  // price or verify anyone else's order.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const { data: authData } = token
    ? await admin.auth.getUser(token)
    : { data: { user: null } };
  const caller = authData?.user ?? null;
  if (!caller || caller.is_anonymous) {
    return json({ error: 'sign in to pay' }, 401);
  }

  let body: Record<string, string> & { action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const { action, orderId } = body;
  if (!orderId) return json({ error: 'orderId is required' }, 400);

  // ── CREATE ─────────────────────────────────────────────────────────────
  if (action === 'create') {
    const { data: order, error } = await admin
      .from('orders')
      .select('id, customer_id, total, subtotal, discount, shipping, fees, coupon_code, lines, currency, status, payment')
      .eq('id', orderId)
      .single();

    if (error || !order) return json({ error: 'order not found' }, 404);
    if (order.customer_id !== caller.id) return json({ error: 'not your order' }, 403);
    if (order.status === 'cancelled') return json({ error: 'order is cancelled' }, 409);

    const payment = (order.payment ?? {}) as PaymentBlob;
    if (payment.razorpay_payment_id) return json({ error: 'order is already paid' }, 409);

    // Re-price from authoritative variant data. Never charge the client total.
    const priced = await recomputeAmount(admin, {
      lines: order.lines as OrderLine[],
      shipping: Number(order.shipping) || 0,
      fees: (order.fees ?? null) as { amount?: number }[] | null,
      discount: Number(order.discount) || 0,
      coupon_code: (order.coupon_code ?? null) as string | null,
    });

    // Fully resolved → charge the server total and correct the row. A line with
    // an un-seeded variant (rare) falls back to the row total, logged loudly,
    // rather than reject a legitimate order over missing seed data.
    const chargeRupees = priced.resolved ? priced.total : Math.round(Number(order.total) || 0);
    if (!priced.resolved) {
      console.warn('razorpay create: unresolved variant on order', order.id, '— charging row total');
    } else if (chargeRupees !== Math.round(Number(order.total) || 0)) {
      console.warn(
        'razorpay create: order',
        order.id,
        'client total',
        order.total,
        '→ server total',
        chargeRupees,
      );
    }

    const amountPaise = Math.round(chargeRupees * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return json({ error: 'order total is not payable' }, 422);
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: rpAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency: order.currency ?? 'INR',
        receipt: String(order.id),
        notes: { supabase_order_id: String(order.id) },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('razorpay create failed', res.status, detail);
      return json({ error: 'could not create payment order' }, 502);
    }

    const rp = (await res.json()) as { id: string; amount: number; currency: string };

    // Write the corrected breakdown AND bind the razorpay order + amount. A
    // retried checkout overwrites razorpay_order_id/amount_paise, so verify
    // binds against the latest created order — the one the modal collects for.
    const rowPatch: Record<string, unknown> = {
      payment: {
        ...payment,
        provider: 'razorpay',
        razorpay_order_id: rp.id,
        amount_paise: rp.amount,
      },
    };
    if (priced.resolved) {
      rowPatch.subtotal = priced.subtotal;
      rowPatch.discount = priced.discount;
      rowPatch.total = chargeRupees;
    }
    await admin.from('orders').update(rowPatch).eq('id', order.id);

    return json({
      razorpayOrderId: rp.id,
      amount: rp.amount,
      currency: rp.currency,
      keyId, // public by design — the secret never leaves this function
    });
  }

  // ── VERIFY ─────────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return json({ error: 'missing payment fields' }, 400);
    }

    const expected = await hmacSha256Hex(`${razorpayOrderId}|${razorpayPaymentId}`, keySecret);
    if (!timingSafeEqual(expected, razorpaySignature)) {
      console.warn('razorpay signature mismatch for order', orderId);
      return json({ error: 'payment could not be verified' }, 400);
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, customer_id, payment, coupon_code, discount')
      .eq('id', orderId)
      .single();

    if (!order) return json({ error: 'order not found' }, 404);
    if (order.customer_id !== caller.id) return json({ error: 'not your order' }, 403);

    const payment = (order.payment ?? {}) as PaymentBlob;
    if (payment.razorpay_order_id !== razorpayOrderId) {
      console.warn('razorpay order mismatch', orderId, payment.razorpay_order_id, razorpayOrderId);
      return json({ error: 'payment could not be verified' }, 400);
    }
    if (payment.razorpay_payment_id) return json({ ok: true, alreadyPaid: true });

    // Re-fetch the payment from Razorpay: the signature proves Razorpay issued
    // it, but only the payment object proves it was CAPTURED, for how MUCH, and
    // against WHICH order. A signature for a ₹1 order must not settle a ₹4,000
    // one. If the API call itself fails (transient), fall back to the signature
    // (already verified) rather than block a genuine payment — logged either way.
    try {
      const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
        headers: { Authorization: rpAuth },
      });
      if (payRes.ok) {
        const pay = (await payRes.json()) as { status?: string; amount?: number; order_id?: string };
        const statusOk = pay.status === 'captured' || pay.status === 'authorized';
        const orderOk = !pay.order_id || pay.order_id === razorpayOrderId;
        const amountOk =
          typeof payment.amount_paise !== 'number' || pay.amount === payment.amount_paise;
        if (!statusOk || !orderOk || !amountOk) {
          console.warn('razorpay capture mismatch', orderId, JSON.stringify({ pay, expect: payment.amount_paise }));
          return json({ error: 'payment could not be verified' }, 400);
        }
      } else {
        console.warn('razorpay payment fetch failed', razorpayPaymentId, payRes.status);
      }
    } catch (e) {
      console.warn('razorpay payment fetch threw', String(e));
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({
        payment: {
          ...payment,
          reference: razorpayPaymentId,
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date().toISOString(),
        },
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('order update failed after verified payment', updateError);
      return json({ error: 'payment verified but order update failed', paid: true }, 500);
    }

    // Record the coupon redemption authoritatively (service role), enforcing the
    // per-user cap the client can no longer be trusted to. Best-effort: a failure
    // here must not undo a paid order.
    if (order.coupon_code) {
      try {
        const code = String(order.coupon_code).toUpperCase();
        const { data: coupon } = await admin
          .from('coupons')
          .select('per_user_limit')
          .eq('code', code)
          .maybeSingle();
        const cap = coupon?.per_user_limit ?? 1;
        const { count } = await admin
          .from('coupon_redemptions')
          .select('id', { count: 'exact', head: true })
          .eq('coupon_code', code)
          .eq('customer_id', order.customer_id)
          .is('reversed_at', null);
        if ((count ?? 0) < cap) {
          await admin
            .from('coupon_redemptions')
            .upsert(
              {
                customer_id: order.customer_id,
                coupon_code: code,
                order_id: orderId,
                discount_amount: Math.max(0, Math.floor(Number(order.discount) || 0)),
              },
              { onConflict: 'customer_id,coupon_code,order_id', ignoreDuplicates: true },
            );
        }
      } catch (e) {
        console.warn('coupon redemption record failed', String(e));
      }
    }

    return json({ ok: true });
  }

  return json({ error: "action must be 'create' or 'verify'" }, 400);
});
