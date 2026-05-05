/**
 * Supabase Edge Function — `send-order-email`
 *
 * Sends transactional order emails via Resend. Triggered from the
 * storefront (after a successful order commit) via:
 *   await supabase.functions.invoke('send-order-email', {
 *     body: { orderId, kind: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' }
 *   });
 *
 * Reads the order row server-side (by id, RLS-bypass via service_role
 * inside the function), formats the HTML, sends via Resend.
 *
 * ─── Deploy ────────────────────────────────────────────────────────────
 *   supabase functions deploy send-order-email
 *   supabase secrets set RESEND_API_KEY=re_xxx
 *   supabase secrets set ORDER_FROM_EMAIL='Ravi Sweets <orders@ravisweets.com>'
 *
 * Resend free tier: 3,000 emails/month, 100/day. Plenty for v1.
 * Sign up at https://resend.com → API Keys → create one.
 */

// @ts-expect-error — Deno globals are available in Supabase Edge runtime.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — Deno-style import for Supabase JS, run in Edge runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface RequestBody {
  orderId: string;
  kind: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  trackingUrl?: string;
}

const SUBJECTS: Record<RequestBody['kind'], string> = {
  placed: '🍬 Order received — Ravi Sweets',
  packed: '📦 Your order is packed — Ravi Sweets',
  shipped: '🚚 Your order has shipped — Ravi Sweets',
  delivered: '✨ Delivered — Ravi Sweets',
  cancelled: 'Order cancelled — Ravi Sweets',
};

const STATUS_HEADLINE: Record<RequestBody['kind'], string> = {
  placed: 'We got your order.',
  packed: 'Your box is sealed.',
  shipped: 'On its way.',
  delivered: 'Hope you enjoyed it.',
  cancelled: 'Cancelled — refund queued.',
};

function inr(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}

function template(args: {
  kind: RequestBody['kind'];
  number: string;
  customerName: string;
  lines: { productTitle: string; variantTitle: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  trackingUrl?: string;
}): string {
  const linesHtml = args.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ecd9a8;color:#1f0c02;">
          <div style="font-weight:600;">${l.productTitle}</div>
          <div style="font-size:12px;color:#1f0c02aa;">${l.variantTitle} · × ${l.quantity}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #ecd9a8;text-align:right;font-family:'SF Mono',Menlo,monospace;color:#1f0c02;">
          ${inr(l.lineTotal)}
        </td>
      </tr>
    `,
    )
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#fbf3df;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f0c02;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:700;color:#1f0c02;">Ravi Sweets</div>
      <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8a5a0e;margin-top:4px;">
        Khammam · Since 1985
      </div>
    </div>
    <div style="background:#fff8e6;border:1px solid #e8d8a8;border-radius:16px;padding:28px;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a8501f;margin:0 0 8px;">
        Order ${args.number}
      </p>
      <h1 style="font-family:'Fraunces',Georgia,serif;font-size:28px;line-height:1.1;margin:0 0 16px;color:#1f0c02;">
        ${STATUS_HEADLINE[args.kind]}
      </h1>
      <p style="margin:0 0 20px;color:#1f0c02cc;line-height:1.55;">
        Hi ${args.customerName.split(' ')[0]}, here's a summary.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${linesHtml}</tbody>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #ecd9a8;font-size:14px;">
        <div style="display:flex;justify-content:space-between;color:#1f0c02aa;margin-bottom:4px;">
          <span>Subtotal</span><span style="font-family:'SF Mono',Menlo,monospace;">${inr(args.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;color:#1f0c02aa;margin-bottom:8px;">
          <span>Shipping</span><span style="font-family:'SF Mono',Menlo,monospace;">${inr(args.shipping)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-family:'Fraunces',Georgia,serif;font-size:18px;font-weight:600;color:#a8501f;">
          <span>Total</span><span style="font-family:'SF Mono',Menlo,monospace;">${inr(args.total)}</span>
        </div>
      </div>
      ${
        args.trackingUrl
          ? `<a href="${args.trackingUrl}" style="display:block;margin-top:20px;padding:12px 20px;background:#1f0c02;color:#fbf3df;text-align:center;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">Track your order →</a>`
          : ''
      }
      <p style="font-size:11px;color:#1f0c02aa;margin:24px 0 0;line-height:1.6;">
        Shipping to:<br/>
        ${args.address.line1}${args.address.line2 ? ', ' + args.address.line2 : ''}<br/>
        ${args.address.city}, ${args.address.state} ${args.address.pincode}
      </p>
    </div>
    <p style="font-size:11px;color:#1f0c02aa;text-align:center;margin:20px 0 0;line-height:1.6;">
      Questions? WhatsApp +91 93988 59978 — we reply within 30 minutes.<br/>
      Ravi Sweets · Khammam · Telangana · FSSAI 21218180001234
    </p>
  </div>
</body></html>`;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  try {
    const body = (await req.json()) as RequestBody;
    if (!body.orderId || !body.kind) {
      return new Response(JSON.stringify({ error: 'orderId + kind required' }), { status: 400 });
    }
    const supaUrl = Deno.env.get('SUPABASE_URL');
    const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('ORDER_FROM_EMAIL') ?? 'Ravi Sweets <orders@ravisweets.com>';
    if (!supaUrl || !supaKey || !resendKey) {
      return new Response(JSON.stringify({ error: 'env not configured' }), { status: 500 });
    }

    const supa = createClient(supaUrl, supaKey);
    const { data: order, error } = await supa
      .from('orders')
      .select('*')
      .eq('id', body.orderId)
      .maybeSingle();
    if (error || !order) {
      return new Response(JSON.stringify({ error: 'order not found' }), { status: 404 });
    }
    const address = order.address_snapshot as {
      name: string;
      email: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
    if (!address?.email) {
      return new Response(JSON.stringify({ error: 'no email on order' }), { status: 400 });
    }

    const html = template({
      kind: body.kind,
      number: order.number,
      customerName: address.name,
      lines: order.lines as Array<{
        productTitle: string;
        variantTitle: string;
        quantity: number;
        lineTotal: { amount: number };
      }>.map((l) => ({
        productTitle: l.productTitle,
        variantTitle: l.variantTitle,
        quantity: l.quantity,
        lineTotal: l.lineTotal.amount,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      address,
      trackingUrl: body.trackingUrl,
    });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [address.email],
        subject: SUBJECTS[body.kind],
        html,
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: 'resend failed', detail: txt }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

// Tell TypeScript that Deno + globals are valid in this file.
declare const Deno: { env: { get: (k: string) => string | undefined } };
