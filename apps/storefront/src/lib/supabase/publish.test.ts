import { describe, expect, it } from 'vitest';
import { describeInvokeFailure, hintFor, interpretPublishBody } from './publish';

/**
 * These cover the one thing that cannot be caught by reading the code: that a
 * failed publish reports the SERVER'S reason rather than a generic one.
 * `functions.invoke` hands back a fixed generic `error.message` for every
 * non-2xx and hides the real text in `error.context`, so the regression this
 * guards against is silent by construction — the UI keeps working and simply
 * stops saying anything useful.
 *
 * A FunctionsHttpError is imitated rather than imported: it is a plain
 * `{ context: Response }` carrier, and building one by hand keeps the test
 * from depending on supabase-js internals it does not otherwise touch.
 */
function httpError(status: number, body: string, contentType = 'application/json') {
  return {
    name: 'FunctionsHttpError',
    message: 'Edge Function returned a non-2xx status code',
    context: new Response(body, { status, headers: { 'Content-Type': contentType } }),
  };
}

describe('describeInvokeFailure', () => {
  it('quotes the function’s own message instead of the generic invoke error', async () => {
    const result = await describeInvokeFailure(
      httpError(403, JSON.stringify({ error: 'forbidden — admin only' })),
    );
    expect(result.kind).toBe('error');
    expect(result.status).toBe(403);
    expect(result.message).toBe('forbidden — admin only');
    expect(result.message).not.toContain('non-2xx');
    expect(result.hint).toMatch(/app_metadata/);
  });

  it('tells the unset deploy hook apart from every other 500', async () => {
    const unset = await describeInvokeFailure(
      httpError(500, JSON.stringify({ error: 'Publishing is not configured on the server.' })),
    );
    expect(unset.message).toBe('Publishing is not configured on the server.');
    expect(unset.hint).toMatch(/CLOUDFLARE_DEPLOY_HOOK_URL/);

    const bad = await describeInvokeFailure(
      httpError(500, JSON.stringify({ error: 'Publishing is misconfigured on the server.' })),
    );
    expect(bad.hint).toMatch(/https/);
    expect(bad.hint).not.toEqual(unset.hint);

    const noTable = await describeInvokeFailure(
      httpError(500, JSON.stringify({ error: 'could not read publish state' })),
    );
    expect(noTable.hint).toMatch(/0015_publish_state\.sql/);
  });

  it('reads the gateway’s own error shape, which uses `message` not `error`', async () => {
    const result = await describeInvokeFailure(
      httpError(404, JSON.stringify({ code: 404, message: 'Requested function was not found' })),
    );
    expect(result.message).toBe('Requested function was not found');
    expect(result.hint).toMatch(/functions deploy publish-site/);
  });

  it('quotes a non-JSON body verbatim rather than inventing a message', async () => {
    const result = await describeInvokeFailure(httpError(502, 'upstream timeout', 'text/plain'));
    expect(result.status).toBe(502);
    expect(result.message).toBe('upstream timeout');
  });

  it('still reports a status when the body is empty', async () => {
    const result = await describeInvokeFailure(httpError(500, ''));
    expect(result.message).toContain('500');
  });

  it('handles a fetch failure, whose context is an Error and not a Response', async () => {
    const result = await describeInvokeFailure({
      name: 'FunctionsFetchError',
      message: 'Failed to send a request to the Edge Function',
      context: new TypeError('Failed to fetch'),
    });
    expect(result.status).toBeNull();
    expect(result.message).toBe('Failed to send a request to the Edge Function');
    expect(result.hint).toMatch(/could not be reached/);
  });
});

describe('hintFor', () => {
  it('has nothing to add for a status it does not recognise', () => {
    expect(hintFor(418, 'teapot')).toBeNull();
    expect(hintFor(500, 'something else entirely')).toBeNull();
  });
});

describe('interpretPublishBody', () => {
  it('reads a triggered build', () => {
    const result = interpretPublishBody({
      ok: true,
      triggered: true,
      coalesced: false,
      triggeredAt: '2026-08-10T09:00:00.000Z',
      expectedLiveAt: '2026-08-10T09:05:00.000Z',
      includedPendingSince: '2026-08-10T08:41:00.000Z',
      deploymentId: 'dep_123',
    });
    expect(result).toEqual({
      kind: 'triggered',
      triggeredAt: '2026-08-10T09:00:00.000Z',
      expectedLiveAt: '2026-08-10T09:05:00.000Z',
      includedPendingSince: '2026-08-10T08:41:00.000Z',
      deploymentId: 'dep_123',
    });
  });

  it('reads a coalesced publish as its own outcome, not as a failure', () => {
    const result = interpretPublishBody({
      ok: true,
      triggered: false,
      coalesced: true,
      lastTriggeredAt: '2026-08-10T09:00:00.000Z',
      pendingSince: '2026-08-10T09:01:00.000Z',
      nextEligibleAt: '2026-08-10T09:05:00.000Z',
      retryAfterSeconds: 240,
      expectedLiveAt: '2026-08-10T09:10:00.000Z',
    });
    expect(result.kind).toBe('coalesced');
    if (result.kind !== 'coalesced') throw new Error('unreachable');
    expect(result.retryAfterSeconds).toBe(240);
    expect(result.nextEligibleAt).toBe('2026-08-10T09:05:00.000Z');
  });

  it('omits fields the server did not send rather than inventing them', () => {
    const result = interpretPublishBody({ triggered: true });
    if (result.kind !== 'triggered') throw new Error('unreachable');
    expect(result.expectedLiveAt).toBeNull();
    expect(result.deploymentId).toBeNull();
    expect(result.includedPendingSince).toBeNull();
    // The only invented value, and defensible: the response just returned.
    expect(Number.isFinite(new Date(result.triggeredAt).getTime())).toBe(true);
  });

  it('refuses to call an unrecognised 200 a started build', () => {
    for (const body of [null, undefined, '<html>oops</html>', { ok: true }, { triggered: 'yes' }]) {
      const result = interpretPublishBody(body);
      expect(result.kind).toBe('error');
    }
  });
});
