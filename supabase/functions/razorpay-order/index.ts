/**
 * Supabase Edge Function — `razorpay-order`
 *
 * The server half of Razorpay checkout. The storefront is a Next.js STATIC
 * EXPORT on Cloudflare Pages, so there is no Next server route to put this in;
 * this function is the only trusted execution context the project has, which
 * is why order creation and signature verification both live here.
 *
 * Two actions on one function, so there is one secret to set and one URL to
 * allow-list:
 *
 *   POST { action: 'create', orderId }
 *     → reads the order row server-side, computes the amount from the DB
 *       (never from the client), creates a Razorpay order, returns
 *       { razorpayOrderId, amount, currency, keyId }.
 *
 *   POST { action: 'verify', orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 *     → recomputes the HMAC-SHA256 signature and, only if it matches, records
 *       the payment in the order's `payment` jsonb. Returns { ok: true }.
 *
 * ─── SCHEMA (matches supabase/migrations 0001 `orders`) ────────────────
 * `total` is an INTEGER IN RUPEES (Money.amount is rupees — see
 * packages/shared/src/money.ts), hence the ×100 below. The `order_status`
 * enum is the FULFILMENT ladder (placed→packed→shipped→delivered|cancelled);
 * there is no 'paid' status — payment state lives in the `payment` jsonb:
 *   { method, reference,                      ← written by the client
 *     provider, razorpay_order_id,            ← written here on 'create'
 *     razorpay_payment_id, paid_at }          ← written here on 'verify'
 * An order counts as paid when payment.razorpay_payment_id is present.
 *
 * ─── WHY THE AMOUNT IS NOT TAKEN FROM THE CLIENT ───────────────────────
 * A client that can name its own price can pay ₹1 for a ₹4,000 hamper. The
 * amount is read from the `orders` row using the service_role key, which
 * bypasses RLS. Do not "optimise" this by passing an amount in the body.
 *
 * ─── WHY VERIFICATION IS NOT OPTIONAL ──────────────────────────────────
 * Razorpay's browser callback can be forged. A payment is only recorded once
 * this function has recomputed HMAC_SHA256(razorpayOrderId + "|" + paymentId,
 * keySecret) and matched it against the signature Razorpay returned.
 *
 * ─── Deploy ────────────────────────────────────────────────────────────
 *   supabase functions deploy razorpay-order
 *   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
 *   supabase secrets set RAZORPAY_KEY_SECRET=xxx
 *
 * RAZORPAY_KEY_SECRET must NEVER appear in .env.production or any
 * NEXT_PUBLIC_* variable — those ship in the browser bundle. The key ID is
 * public and is returned by the `create` action so the client never needs it
 * baked in either.
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

/** The `payment` jsonb on an orders row. Client writes method/reference. */
interface PaymentBlob {
  method?: string;
  reference?: string;
  provider?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  paid_at?: string;
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

  let body: Record<string, string> & { action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const { action, orderId } = body;
  if (!orderId) return json({ error: 'orderId is required' }, 400);

  // ── CREATE ───────────────────────────────────────────────────────────
  if (action === 'create') {
    const { data: order, error } = await admin
      .from('orders')
      .select('id, total, currency, status, payment')
      .eq('id', orderId)
      .single();

    if (error || !order) return json({ error: 'order not found' }, 404);
    if (order.status === 'cancelled') return json({ error: 'order is cancelled' }, 409);

    const payment = (order.payment ?? {}) as PaymentBlob;
    if (payment.razorpay_payment_id) return json({ error: 'order is already paid' }, 409);

    // `total` is integer rupees (see header) — convert to paise for Razorpay.
    // Never trust an amount from the request body.
    const amountPaise = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return json({ error: 'order total is not payable' }, 422);
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json',
      },
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

    // A retried checkout overwrites razorpay_order_id — verify binds against
    // the LATEST created order, which is the one the modal will collect for.
    await admin
      .from('orders')
      .update({
        payment: { ...payment, provider: 'razorpay', razorpay_order_id: rp.id },
      })
      .eq('id', order.id);

    return json({
      razorpayOrderId: rp.id,
      amount: rp.amount,
      currency: rp.currency,
      keyId, // public by design — the secret never leaves this function
    });
  }

  // ── VERIFY ───────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return json({ error: 'missing payment fields' }, 400);
    }

    const expected = await hmacSha256Hex(`${razorpayOrderId}|${razorpayPaymentId}`, keySecret);
    if (!timingSafeEqual(expected, razorpaySignature)) {
      console.warn('razorpay signature mismatch for order', orderId);
      // Deliberately vague to the client; the detail is in the server log.
      return json({ error: 'payment could not be verified' }, 400);
    }

    // Bind the payment to the order we created, so a valid signature from a
    // DIFFERENT order cannot be replayed against this one.
    const { data: order } = await admin
      .from('orders')
      .select('id, payment')
      .eq('id', orderId)
      .single();

    if (!order) return json({ error: 'order not found' }, 404);
    const payment = (order.payment ?? {}) as PaymentBlob;
    if (payment.razorpay_order_id !== razorpayOrderId) {
      console.warn('razorpay order mismatch', orderId, payment.razorpay_order_id, razorpayOrderId);
      return json({ error: 'payment could not be verified' }, 400);
    }
    if (payment.razorpay_payment_id) return json({ ok: true, alreadyPaid: true });

    // `reference` mirrors what the client writes locally on success, so the
    // admin console and /orders show the same id whichever copy they read.
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
      // The money IS taken at this point — surface loudly rather than
      // pretending it failed, so support can reconcile.
      return json({ error: 'payment verified but order update failed', paid: true }, 500);
    }

    return json({ ok: true });
  }

  return json({ error: "action must be 'create' or 'verify'" }, 400);
});
