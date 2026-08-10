/**
 * Honest results for admin writes.
 *
 * PostgREST answers an UPDATE that matched ZERO rows with 204 No Content, and
 * supabase-js reports `error: null`. Under RLS that is byte-identical to a
 * successful write: when `public.is_admin()` is false the target rows are not
 * visible to the statement, nothing is updated, and the caller is told it
 * worked. Every admin screen then shows "Saved ✓" over a database that never
 * changed — the single most expensive failure mode in this codebase, because
 * it looks like success from the UI, the network tab, and the return value
 * alike.
 *
 * Asking for the updated rows back with `.select()` makes the difference
 * observable: zero rows means the write did not land. The two causes worth
 * separating for whoever is staring at the screen are a missing row and a
 * missing permission, and from the client they are indistinguishable — so the
 * message names both rather than guessing.
 *
 * Note this is NOT the same as an RLS *error*. An INSERT that violates a WITH
 * CHECK clause does raise 42501, which supabase-js surfaces as an error. Only
 * UPDATE and DELETE go quiet, because the rows simply fall outside the
 * statement's visible set.
 */
export type WriteResult = { ok: true } | { ok: false; reason: string };

/**
 * Judge a write whose builder chain ended in `.select(...)`.
 *
 * Usage — note the `data` in the destructure and the `.select('id')`, both of
 * which are load-bearing:
 *
 *     const { data, error } = await supa
 *       .from('variants').update({ price_amount: 100 }).eq('id', id).select('id');
 *     return wrote(data, error, 'Variant price');
 *
 * @param what  short noun phrase naming the write, used in the message
 */
export function wrote<T>(
  data: T[] | null,
  error: { message: string } | null,
  what: string,
): WriteResult {
  if (error) return { ok: false, reason: error.message };
  if (!data || data.length === 0) {
    return {
      ok: false,
      reason:
        `${what} was not saved: the database matched no row. Either it no longer ` +
        `exists, or this account is not an admin — check that your user's ` +
        `app_metadata.role is exactly "admin", then sign out and in again so the ` +
        `new token is issued.`,
    };
  }
  return { ok: true };
}
