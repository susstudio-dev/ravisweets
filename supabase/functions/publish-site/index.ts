/**
 * Supabase Edge Function — `publish-site`
 *
 * The server half of the admin's Publish button. The storefront is a Next.js
 * STATIC EXPORT on Cloudflare Pages: admin edits reach Postgres immediately,
 * but the pages that bake catalogue and content at BUILD time only change when
 * Pages rebuilds. This function is the thing that asks Pages to rebuild, and
 * the only place the deploy-hook secret can live (spec §6.3 / D8 — a static
 * site has no server to hide it in).
 *
 *   POST  (no body)
 *     → 200 { ok, triggered: true,  coalesced: false, triggeredAt,
 *             expectedLiveAt, includedPendingSince, deploymentId }
 *     → 200 { ok, triggered: false, coalesced: true,  lastTriggeredAt,
 *             pendingSince, nextEligibleAt, retryAfterSeconds, expectedLiveAt }
 *
 * The request carries NO body. Nothing a caller could put in one should change
 * what happens here; anything it did say would only be another thing to spoof.
 * The identity comes from the verified JWT, the target from a secret.
 *
 * ─── WHY THE CALLER IS RE-VERIFIED HERE ────────────────────────────────
 * `verify_jwt` (on by default) only proves the caller holds SOME valid token,
 * and this project enables anonymous sign-ins (DEPLOYMENT.md §1.3) — every
 * guest browsing the shop holds one. So the real gate is the role claim, and
 * it is checked by asking the Auth server to validate the bearer token
 * (`auth.getUser()`) rather than by decoding it: a decoded JWT is just
 * client-supplied JSON. `app_metadata` is the half of the token the user
 * cannot write — `user_metadata` is user-writable and must never be used for
 * authorisation. The test matches `public.is_admin()` (0001_init.sql:9) so
 * this function and RLS cannot drift apart.
 *
 * ─── WHY COALESCING LIVES IN POSTGRES ──────────────────────────────────
 * Edge function isolates are spawned independently and share no memory, so a
 * module-scope `lastPublishedAt` would coalesce nothing — two clicks ten
 * seconds apart routinely land in two isolates. The window is therefore held
 * in `public.publish_state` (migration 0015), and the claim is a
 * compare-and-swap UPDATE stamped *before* Cloudflare is called — of two
 * simultaneous clicks exactly one can win the row, and the other coalesces.
 * Claiming after the call would let both fire a build.
 *
 * ─── WHY A COALESCED PUBLISH IS NOT A FAILURE (AND NOT A DROP) ─────────
 * Returning "too soon, try later" would lose the edit: the build already
 * running fetched its data before that edit existed. So a coalesced request
 * writes `pending_since`, which records that the live site is behind the
 * database, and the response hands back `nextEligibleAt` / `retryAfterSeconds`
 * so the UI can re-POST when the window closes. The next build that is claimed
 * clears the marker and reports which pending edits it swept up. Status stays
 * 200 — the request was accepted and recorded, it simply did not need a second
 * build of its own.
 *
 * ─── Deploy ────────────────────────────────────────────────────────────
 *   supabase functions deploy publish-site
 *   supabase secrets set CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx
 *   (Pages project → Settings → Builds & deployments → Deploy hooks)
 *
 * Requires supabase/migrations/0015_publish_state.sql.
 *
 * The deploy-hook URL IS the credential — it takes an unauthenticated POST, so
 * whoever holds it can spend the account's build minutes. It must never appear
 * in .env.production or behind any NEXT_PUBLIC_* name, both of which ship in
 * the browser bundle.
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

/** Repeat publishes inside this window collapse into one build (spec §6.3). */
const COALESCE_WINDOW_MS = 5 * 60 * 1000;

/**
 * How long a Pages build of this repo takes end to end (pnpm install + static
 * export of ~83 product pages). Only ever shown to the owner as "live by ~",
 * so it errs long: a build that lands early is a pleasant surprise, a promised
 * time that slips is a support call.
 */
const BUILD_ESTIMATE_MS = 5 * 60 * 1000;

/** The `public.publish_state` singleton — see migration 0015. */
interface PublishState {
  last_triggered_at: string | null;
  last_triggered_by: string | null;
  last_deploy_id: string | null;
  pending_since: string | null;
  pending_by: string | null;
}

const EMPTY_STATE: PublishState = {
  last_triggered_at: null,
  last_triggered_by: null,
  last_deploy_id: null,
  pending_since: null,
  pending_by: null,
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const hookUrl = env('CLOUDFLARE_DEPLOY_HOOK_URL');
  const supabaseUrl = env('SUPABASE_URL');
  const anonKey = env('SUPABASE_ANON_KEY');
  const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY');

  if (!hookUrl) {
    return json({ error: 'Publishing is not configured on the server.' }, 500);
  }
  // A mistyped secret must fail here, loudly, rather than have us POST to
  // whatever it happens to name.
  if (!hookUrl.startsWith('https://')) {
    console.error('CLOUDFLARE_DEPLOY_HOOK_URL is not an https URL');
    return json({ error: 'Publishing is misconfigured on the server.' }, 500);
  }
  if (!supabaseUrl || !anonKey || !serviceRole) {
    return json({ error: 'Supabase service credentials missing.' }, 500);
  }

  // ── AUTHORISE THE CALLER ─────────────────────────────────────────────
  // The caller's own token, handed to an anon client, so the Auth server
  // verifies the signature for us. The service_role client below is reserved
  // for the state writes and must never see a client-supplied token.
  const authHeader = req.headers.get('Authorization') ?? '';
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: callerData, error: callerError } = await caller.auth.getUser();
  if (callerError || !callerData?.user) return json({ error: 'not authenticated' }, 401);
  if (callerData.user.app_metadata?.role !== 'admin') {
    return json({ error: 'forbidden — admin only' }, 403);
  }
  const adminUserId = callerData.user.id;

  const admin = createClient(supabaseUrl, serviceRole);

  // ── READ THE WINDOW ──────────────────────────────────────────────────
  const now = new Date();
  const windowOpenedAt = new Date(now.getTime() - COALESCE_WINDOW_MS);

  const { data: existing, error: readError } = await admin
    .from('publish_state')
    .select('last_triggered_at, last_triggered_by, last_deploy_id, pending_since, pending_by')
    .eq('id', 'site')
    .maybeSingle();

  if (readError) {
    console.error('publish_state read failed', readError);
    // 42P01 = undefined_table. Worth naming: the only way to hit it is a
    // deployed function against a database that never ran 0015.
    if (readError.code === '42P01') {
      return json(
        {
          error:
            'publish state table is missing — apply supabase/migrations/0015_publish_state.sql',
        },
        500,
      );
    }
    return json({ error: 'could not read publish state' }, 500);
  }

  const previous: PublishState = existing ?? EMPTY_STATE;

  if (!existing) {
    // The migration seeds this row; it only goes missing if someone deleted
    // it. Recreate it and carry on — a missing bookkeeping row is not a reason
    // to refuse to publish.
    const { error: seedError } = await admin.from('publish_state').insert({ id: 'site' });
    if (seedError) {
      console.error('publish_state seed failed', seedError);
      return json({ error: 'could not initialise publish state' }, 500);
    }
  }

  // ── COALESCE ─────────────────────────────────────────────────────────
  // Marks the site as behind the database and tells the caller when a retry
  // will get through. `lastTriggeredAt` is whichever build this request is
  // waiting behind — see the two call sites.
  async function coalesce(lastTriggeredAt: string): Promise<Response> {
    const nextEligibleAt = new Date(new Date(lastTriggeredAt).getTime() + COALESCE_WINDOW_MS);

    // `is('pending_since', null)` keeps the EARLIEST marker rather than
    // overwriting it: the useful fact is "the site has been behind since X",
    // and the window runs from the last build, so a later stamp would change
    // nothing except lose that. When a mark already exists this is a no-op and
    // the first requester stays recorded as the one who noticed.
    const { error: pendingError } = await admin
      .from('publish_state')
      .update({ pending_since: now.toISOString(), pending_by: adminUserId })
      .eq('id', 'site')
      .is('pending_since', null);

    if (pendingError) {
      // Surface it: silently swallowing this is exactly the "publish was
      // dropped" failure the pending marker exists to prevent.
      console.error('publish_state pending mark failed', pendingError);
      return json({ error: 'could not record pending publish' }, 500);
    }

    return json({
      ok: true,
      triggered: false,
      coalesced: true,
      lastTriggeredAt,
      pendingSince: previous.pending_since ?? now.toISOString(),
      nextEligibleAt: nextEligibleAt.toISOString(),
      retryAfterSeconds: Math.max(0, Math.ceil((nextEligibleAt.getTime() - now.getTime()) / 1000)),
      // Measured from the build this edit will actually be in — the one that
      // can be triggered once the window closes, not the one already running,
      // which fetched its data before this edit existed.
      expectedLiveAt: new Date(nextEligibleAt.getTime() + BUILD_ESTIMATE_MS).toISOString(),
    });
  }

  const lastTriggeredAt = previous.last_triggered_at;
  if (lastTriggeredAt && new Date(lastTriggeredAt) > windowOpenedAt) {
    return await coalesce(lastTriggeredAt);
  }

  // ── CLAIM THE BUILD ──────────────────────────────────────────────────
  // Compare-and-swap on the timestamp we just read, so the row is stamped
  // BEFORE Cloudflare is called. Two isolates that read the same value both
  // try to swap it; Postgres serialises them and the loser's filter no longer
  // matches, which is how simultaneous clicks become one build. Claiming after
  // the call, or checking then writing in two statements, would let both fire.
  const claim = admin
    .from('publish_state')
    .update({
      last_triggered_at: now.toISOString(),
      last_triggered_by: adminUserId,
      // This build carries everything written up to now, so nothing is pending
      // against it any more.
      pending_since: null,
      pending_by: null,
    })
    .eq('id', 'site');

  const { data: claimed, error: claimError } = await (
    lastTriggeredAt === null
      ? claim.is('last_triggered_at', null)
      : claim.eq('last_triggered_at', lastTriggeredAt)
  )
    .select('id')
    .maybeSingle();

  if (claimError) {
    console.error('publish_state claim failed', claimError);
    return json({ error: 'could not record publish state' }, 500);
  }

  if (!claimed) {
    // Lost the swap: another request triggered a build moments ago. Wait behind
    // that one — dated `now`, because the winner's timestamp is within a
    // round-trip of it and re-reading the row to shave milliseconds off the
    // retry would only earn a second coalesce.
    return await coalesce(now.toISOString());
  }

  // ── TRIGGER ──────────────────────────────────────────────────────────
  // Hands the window back after a build that never started. Leaving the claim
  // in place would block every retry for five minutes AND record this
  // request's edits as built, which is the one outcome this function exists to
  // prevent.
  async function releaseClaim(): Promise<void> {
    const { error } = await admin
      .from('publish_state')
      .update({
        last_triggered_at: previous.last_triggered_at,
        last_triggered_by: previous.last_triggered_by,
        pending_since: previous.pending_since ?? now.toISOString(),
        pending_by: previous.pending_by ?? adminUserId,
      })
      .eq('id', 'site');
    if (error) console.error('publish_state claim release failed', error);
  }

  // The hook takes an unauthenticated POST with no body; the token is the URL.
  // The timeout matters more than it looks: the isolate has its own wall-clock
  // limit, and one that dies mid-fetch leaves the claim stamped with nobody
  // able to say whether a build started.
  let res: Response;
  try {
    res = await fetch(hookUrl, { method: 'POST', signal: AbortSignal.timeout(15_000) });
  } catch (e) {
    console.error('cloudflare deploy hook unreachable', e);
    await releaseClaim();
    return json({ error: 'could not reach the deploy hook' }, 502);
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error('cloudflare deploy hook failed', res.status, detail);
    await releaseClaim();
    return json({ error: 'could not start the site build' }, 502);
  }

  // Cloudflare answers { result: { id }, success: true, … }. The id is only
  // used for tracing, so a shape surprise must not fail a build that started.
  let deploymentId: string | null = null;
  try {
    const payload = (await res.json()) as { result?: { id?: string } };
    deploymentId = payload?.result?.id ?? null;
  } catch {
    // Body absent or not JSON — the 2xx already told us the hook fired.
  }

  if (deploymentId) {
    await admin.from('publish_state').update({ last_deploy_id: deploymentId }).eq('id', 'site');
  }

  return json({
    ok: true,
    triggered: true,
    coalesced: false,
    triggeredAt: now.toISOString(),
    expectedLiveAt: new Date(now.getTime() + BUILD_ESTIMATE_MS).toISOString(),
    // Non-null when this build is also carrying edits that coalesced earlier —
    // the UI can say "including changes waiting since 14:02".
    includedPendingSince: previous.pending_since,
    deploymentId,
  });
});
