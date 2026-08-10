'use client';

import { getSupabase } from './client';

/**
 * The client half of the admin's Publish control — see
 * `supabase/functions/publish-site/index.ts` for the server half, whose
 * response contract this file mirrors.
 *
 * WHY A PUBLISH BUTTON EXISTS AT ALL: the storefront is a Next.js STATIC
 * EXPORT on Cloudflare Pages. An admin edit reaches Postgres immediately, but
 * the pages that bake the catalogue at BUILD time (scripts/generate-catalogue
 * .mjs) only change when Pages rebuilds. Between the save and the rebuild the
 * database and the public site disagree, and nothing in the UI would say so.
 * This module is how the owner closes that gap, and how the panel reports
 * where the gap currently stands.
 *
 * ─── WHY A DISCRIMINATED UNION AND NOT THE SIBLINGS' { ok, reason? } ───
 * Everything else in this directory returns `{ ok, reason? }` because its
 * callers branch exactly two ways: it saved, or say why it did not. Publishing
 * has a THIRD outcome that is neither. A coalesced response means no build
 * started — a build was already running — and yet nothing was lost: the edit
 * is recorded as pending and the next build will carry it. Folding that into
 * `ok: true` would let the panel claim a build had started when none had;
 * folding it into `ok: false` would tell the owner their edit was dropped when
 * it was not. Each also carries different facts to show (an ETA vs a retry
 * time). So the caller gets all three kinds and is forced to handle each.
 *
 * Note the two naming conventions below, which are not an inconsistency:
 * `PublishOutcome` is camelCase because it is JSON straight from the edge
 * function, while `PublishState` keeps the row's snake_case, matching the
 * other row-returning modules here (versions.ts, team.ts).
 */

/* ── Outcomes ──────────────────────────────────────────────────────────── */

/** A build was started by THIS request. */
export interface PublishTriggered {
  kind: 'triggered';
  triggeredAt: string;
  /** When the rebuild should be live. Null only if the server omitted it. */
  expectedLiveAt: string | null;
  /** Non-null when this build also swept up edits that had coalesced earlier. */
  includedPendingSince: string | null;
  /** Cloudflare's id for the deployment, for tracing. Null when it did not say. */
  deploymentId: string | null;
}

/**
 * No build was started because one is already running, and this request has
 * been recorded as pending against the next one. A SUCCESS, not a failure —
 * see the header note and the edge function's own §"WHY A COALESCED PUBLISH
 * IS NOT A FAILURE".
 */
export interface PublishCoalesced {
  kind: 'coalesced';
  /** The build this request is waiting behind. */
  lastTriggeredAt: string | null;
  /** Since when the live site has been behind the database. */
  pendingSince: string | null;
  /** The earliest moment a fresh build can be claimed. */
  nextEligibleAt: string | null;
  retryAfterSeconds: number | null;
  /** Measured from the NEXT build, not the one already running. */
  expectedLiveAt: string | null;
}

export interface PublishFailed {
  kind: 'error';
  /** The HTTP status; null when no response came back at all. */
  status: number | null;
  /**
   * The SERVER'S own words. Never a phrase of ours substituted for them —
   * an unfamiliar message that can be searched for beats a familiar one that
   * was invented.
   */
  message: string;
  /** What can be done about it, when that is knowable. See `hintFor`. */
  hint: string | null;
}

export type PublishOutcome = PublishTriggered | PublishCoalesced | PublishFailed;

/* ── Trigger ───────────────────────────────────────────────────────────── */

export async function triggerPublish(): Promise<PublishOutcome> {
  const supa = await getSupabase();
  if (!supa) {
    return {
      kind: 'error',
      status: null,
      message: 'Supabase is not configured in this build.',
      hint:
        'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are unset or still ' +
        'placeholders, so there is no publish service to call.',
    };
  }

  try {
    /*
     * No body, deliberately: the function ignores one, and anything a caller
     * could put there would only be another thing to spoof. `method` is
     * spelled out even though functions-js already defaults to POST — the
     * function answers 405 to anything else, so pinning it here keeps this
     * call correct if that default ever moves.
     *
     * The caller's JWT rides along automatically: supabase-js gives its
     * FunctionsClient a fetch that stamps `Authorization: Bearer
     * <session.access_token>`, which is the claim the function re-verifies.
     */
    const { data, error } = await supa.functions.invoke('publish-site', { method: 'POST' });
    if (error) return await describeInvokeFailure(error);
    return interpretPublishBody(data);
  } catch (e) {
    // invoke() catches its own failures, so landing here means something
    // outside the HTTP path broke. Say so rather than swallow it.
    return { kind: 'error', status: null, message: messageOf(e), hint: null };
  }
}

/**
 * The human message carried by a thrown value or an error-shaped object.
 *
 * Duck-typed rather than `instanceof Error`, which is the obvious version and
 * the wrong one: supabase-js's error classes do extend Error, but `instanceof`
 * is unreliable across bundle and realm boundaries, and the fallback for an
 * object that fails the test is `String(value)` — which prints
 * "[object Object]". That is precisely the content-free message this whole
 * module exists to stop the panel from showing.
 */
function messageOf(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  const message = (value as { message?: unknown } | null | undefined)?.message;
  if (typeof message === 'string' && message.trim()) return message;
  return String(value);
}

/**
 * Turn a supabase-js invoke error into the server's own words.
 *
 * ─── THE TRAP THIS EXISTS TO AVOID ─────────────────────────────────────
 * `functions.invoke` does NOT throw and does NOT reject on a non-2xx. It
 * returns `{ data: null, error }`, and that error's `.message` is a FIXED
 * generic string ("Edge Function returned a non-2xx status code") with the
 * real message sitting unread in `error.context` — the raw `Response`. So a
 * caller that reports `error.message` prints the identical sentence whether
 * the deploy-hook secret is unset, the caller is not an admin, or migration
 * 0015 was never applied. Reading the body is the entire difference between a
 * button that says "something went wrong" and one that says what to fix.
 *
 * `context` is used rather than the `response` field that newer functions-js
 * versions also return, because `context` is the documented, long-stable
 * accessor and this file should not track that package's minor versions.
 *
 * Exported for its unit test — `triggerPublish` is the only caller.
 */
export async function describeInvokeFailure(error: unknown): Promise<PublishFailed> {
  const context = (error as { context?: unknown } | null)?.context;

  // A type test, not a cast: FunctionsHttpError and FunctionsRelayError put
  // the Response here, but FunctionsFetchError puts the underlying fetch
  // error instead, and that one has no status or body to read.
  if (typeof Response !== 'undefined' && context instanceof Response) {
    const status = context.status;
    const message =
      serverMessage(await readBody(context)) ?? `The publish service answered ${status}.`;
    return { kind: 'error', status, message, hint: hintFor(status, message) };
  }

  return {
    kind: 'error',
    status: null,
    // `messageOf`, NOT `error instanceof Error ? … : String(error)`. This is the
    // FunctionsFetchError path, and that class is constructed inside
    // supabase-js — the realm/bundle caveat in `messageOf` is not hypothetical
    // here, and the penalty for guessing wrong is the literal string
    // "[object Object]" shown where the reason should be.
    message: messageOf(error),
    hint:
      'The publish service could not be reached at all — check the connection, and ' +
      'that `supabase functions deploy publish-site` has been run.',
  };
}

/** The body stream can only be read once; if it is gone there is nothing to quote. */
async function readBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

/**
 * Pull the human message out of a failure body.
 *
 * The function answers `{ error: string }` on every one of its own failure
 * paths. Anything else on the wire came from the platform in FRONT of it —
 * the gateway's own 401 for a missing header, a 404 for a function that was
 * never deployed, a 546 for an isolate that died — and those use their own
 * key names. So each known shape is tried and, failing all of them, the raw
 * text is quoted verbatim rather than replaced.
 */
function serverMessage(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      for (const key of ['error', 'message', 'msg'] as const) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    }
  } catch {
    // Not JSON — fall through and quote the text as-is.
  }
  // Capped because an unexpected 5xx can answer with a whole HTML error page,
  // and the panel renders this inline.
  return trimmed.slice(0, 400);
}

/**
 * The action that clears each failure.
 *
 * Kept here, beside the contract it mirrors, rather than in the component:
 * when the function's error list changes, this is the list that has to change
 * with it, and the two should be read together.
 *
 * The 500s are separated by the server's message on purpose. They are three
 * unrelated problems — an unset secret, a malformed secret, and an unapplied
 * migration — with three different fixes in three different places, so one
 * "server error" hint covering all of them would send whoever is fixing it to
 * the wrong one.
 *
 * Exported for its unit test.
 */
export function hintFor(status: number, message: string): string | null {
  if (status === 401) {
    return 'Your session is not signed in as anyone the server recognises. Sign in again, then retry.';
  }
  if (status === 403) {
    return (
      'This account is not an admin. Set its app_metadata.role to exactly "admin", then ' +
      'sign out and in again so a new token is issued.'
    );
  }
  if (status === 404) {
    return 'The publish-site function is not deployed. Run `supabase functions deploy publish-site`.';
  }
  if (status === 500) {
    if (/not configured/i.test(message)) {
      return (
        'The Cloudflare deploy hook is not set on the server. Someone with Supabase access ' +
        'must run `supabase secrets set CLOUDFLARE_DEPLOY_HOOK_URL=…` using the hook from ' +
        'Cloudflare Pages → Settings → Builds & deployments → Deploy hooks. Nothing on this ' +
        'page can fix it.'
      );
    }
    if (/misconfigured/i.test(message)) {
      return (
        'CLOUDFLARE_DEPLOY_HOOK_URL is set but is not an https URL, so the server refused to ' +
        'call it. Re-copy the deploy hook from the Cloudflare Pages dashboard and set it again.'
      );
    }
    if (/publish[ _]state/i.test(message)) {
      return 'Apply supabase/migrations/0015_publish_state.sql to the database, then retry.';
    }
    return null;
  }
  if (status === 502) {
    return (
      'Cloudflare did not accept the build request, so nothing was started and the publish ' +
      'window was handed back — you can retry now. If it keeps failing, the deploy hook may ' +
      'have been deleted or regenerated.'
    );
  }
  return null;
}

/**
 * Read a 2xx body into an outcome.
 *
 * The shape is CHECKED rather than cast. An older deployed copy of the
 * function, or a proxy that answered 200 with an HTML page, would otherwise
 * be rendered as a triggered build that never started — precisely the
 * confident-but-wrong success this codebase has spent a day removing
 * elsewhere (see lib/supabase/write-result.ts). An unrecognised 200 is
 * reported as a failure because, from here, a build that cannot be confirmed
 * is indistinguishable from one that never happened.
 *
 * Individual fields are permitted to be missing and become null rather than
 * being defaulted to a made-up value: the panel can omit an ETA it was not
 * given, but it must never invent one.
 *
 * Exported for its unit test.
 */
export function interpretPublishBody(data: unknown): PublishOutcome {
  const body: Record<string, unknown> =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};

  if (body.triggered === true) {
    return {
      kind: 'triggered',
      // The request returned within a round trip of the stamp, so `now` is a
      // defensible reading — unlike an ETA, which is a claim about the future.
      triggeredAt: text(body.triggeredAt) ?? new Date().toISOString(),
      expectedLiveAt: text(body.expectedLiveAt),
      includedPendingSince: text(body.includedPendingSince),
      deploymentId: text(body.deploymentId),
    };
  }

  if (body.coalesced === true) {
    return {
      kind: 'coalesced',
      lastTriggeredAt: text(body.lastTriggeredAt),
      pendingSince: text(body.pendingSince),
      nextEligibleAt: text(body.nextEligibleAt),
      retryAfterSeconds: count(body.retryAfterSeconds),
      expectedLiveAt: text(body.expectedLiveAt),
    };
  }

  return {
    kind: 'error',
    status: 200,
    message: 'The publish service answered in a shape this admin does not recognise.',
    hint: 'The deployed publish-site function may be older than this admin build. Redeploy it.',
  };
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function count(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/* ── State ─────────────────────────────────────────────────────────────── */

/** The `public.publish_state` singleton (migration 0015), as the row spells it. */
export interface PublishState {
  last_triggered_at: string | null;
  last_deploy_id: string | null;
  pending_since: string | null;
}

export type PublishStateResult = { ok: true; state: PublishState } | { ok: false; reason: string };

/**
 * Read the publish record WITHOUT invoking the function.
 *
 * Rendering "last published 20 minutes ago" must not cost a build, so this
 * goes straight to the table, which migration 0015 gives an admin-only SELECT
 * policy for exactly this purpose. Every failure is returned, never thrown:
 * the panel is a card on a dashboard and a database that cannot answer must
 * not take the page down with it.
 */
export async function readPublishState(): Promise<PublishStateResult> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'Supabase is not configured in this build.' };

  const { data, error } = await supa
    .from('publish_state')
    .select('last_triggered_at, last_deploy_id, pending_since')
    .eq('id', 'site')
    .maybeSingle();

  if (error) {
    /*
     * "The table is not there" arrives under TWO codes, and matching only one
     * silently loses the hint. `42P01` is Postgres's own undefined_table, but
     * a request for a table PostgREST has never seen is rejected before it
     * reaches Postgres at all — by the schema cache, as `PGRST205`. Against
     * this project's PostgREST the second is the one that actually fires; the
     * first is kept because it is what a direct database error would carry.
     * Both mean the same one-line fix, and neither of their own messages
     * ('relation "public.publish_state" does not exist' / 'Could not find the
     * table … in the schema cache') says what that fix is.
     */
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return {
        ok: false,
        reason:
          'The publish record does not exist yet — apply ' +
          'supabase/migrations/0015_publish_state.sql to the database.',
      };
    }
    return { ok: false, reason: error.message };
  }

  if (!data) {
    /*
     * Zero rows, no error — and under RLS that is AMBIGUOUS. SELECT on this
     * table is admin-only, so a non-admin gets an empty set that is
     * byte-identical to what a deleted row would return. Rendering it as
     * "never published" would be a guess, and the wrong one would tell an
     * owner their site has never been built when it has. Same trap that
     * write-result.ts documents for UPDATE, and the same treatment: name both
     * causes instead of picking one.
     */
    return {
      ok: false,
      reason:
        'Could not read the publish record. Either this account is not an admin, or the ' +
        'publish_state row was deleted from the database.',
    };
  }

  return { ok: true, state: data as PublishState };
}
