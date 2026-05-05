/**
 * Supabase Edge Function — `team-management`
 *
 * Founder-only ops on staff users. Routes:
 *   POST /  body: { action: 'invite', email, role, notes? }
 *           → creates auth.users (auto-confirmed), sets app_metadata.role,
 *             writes team_invitations row, returns user id
 *   POST /  body: { action: 'update-role', userId, role }
 *           → updates app_metadata.role on the auth user
 *   POST /  body: { action: 'revoke', userId }
 *           → sets app_metadata.role to 'customer' + writes revoked_at on
 *             the matching invitation
 *   POST /  body: { action: 'list' }
 *           → returns { users: [{id, email, role, last_sign_in_at}] }
 *             (RLS-bypass via service_role; gated by is_role check inside)
 *
 * ─── Deploy ──────────────────────────────────────────────────────────
 *   supabase functions deploy team-management
 *
 * Reuses the SERVICE_ROLE_KEY env that send-order-email already sets.
 * The function calls supabase.auth.admin.* which is server-side only.
 */

// @ts-expect-error — Deno globals available at runtime.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — Deno-style import.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const STAFF_ROLES = ['founder', 'admin', 'ops', 'marketing', 'accountant'] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

interface InviteBody { action: 'invite'; email: string; role: StaffRole; notes?: string }
interface UpdateBody { action: 'update-role'; userId: string; role: StaffRole }
interface RevokeBody { action: 'revoke'; userId: string }
interface ListBody { action: 'list' }
type RequestBody = InviteBody | UpdateBody | RevokeBody | ListBody;

interface AdminUser {
  id: string;
  email?: string;
  app_metadata?: { role?: string };
  last_sign_in_at?: string;
  created_at?: string;
}

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return err('Method not allowed', 405);

  const supaUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supaUrl || !serviceKey || !anonKey) return err('env not configured', 500);

  // Verify caller is a founder/admin via their JWT before proceeding.
  // We pass the caller's bearer token to a normal supabase client and
  // ask it for the user. The service_role client is reserved for the
  // mutation calls below.
  const auth = req.headers.get('Authorization') ?? '';
  const callerSupa = createClient(supaUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });
  const { data: callerData, error: whoErr } = await callerSupa.auth.getUser();
  if (whoErr || !callerData?.user) return err('not authenticated', 401);
  const callerRole = callerData.user.app_metadata?.role;
  if (callerRole !== 'founder' && callerRole !== 'admin') {
    return err('forbidden — founder or admin only', 403);
  }

  const admin = createClient(supaUrl, serviceKey);

  let body: RequestBody;
  try { body = (await req.json()) as RequestBody; }
  catch { return err('invalid JSON body'); }

  try {
    switch (body.action) {
      case 'invite': {
        if (!body.email || !STAFF_ROLES.includes(body.role)) return err('email + role required');
        // Create auth user, auto-confirmed so they can sign in immediately.
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: body.email,
          email_confirm: true,
          app_metadata: { role: body.role },
        });
        if (createErr || !created.user) return err(`createUser: ${createErr?.message}`, 500);

        // Send a password-reset link so they can set their own password.
        await admin.auth.admin.generateLink({
          type: 'recovery',
          email: body.email,
        });

        // Log the invitation row.
        await admin.from('team_invitations').upsert({
          email: body.email,
          role: body.role,
          notes: body.notes ?? null,
          invited_by: callerData.user.id,
          invited_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({ ok: true, userId: created.user.id }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      case 'update-role': {
        if (!body.userId || !STAFF_ROLES.includes(body.role)) return err('userId + role required');
        const { error } = await admin.auth.admin.updateUserById(body.userId, {
          app_metadata: { role: body.role },
        });
        if (error) return err(`updateUser: ${error.message}`, 500);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      case 'revoke': {
        if (!body.userId) return err('userId required');
        const { error } = await admin.auth.admin.updateUserById(body.userId, {
          app_metadata: { role: 'customer' },
        });
        if (error) return err(`updateUser: ${error.message}`, 500);
        await admin
          .from('team_invitations')
          .update({ revoked_at: new Date().toISOString() })
          .eq('email', (await admin.auth.admin.getUserById(body.userId)).data.user?.email ?? '');
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      case 'list': {
        // Returns all users whose app_metadata.role is one of the staff roles.
        // Pagination at 200 — should be plenty for a kitchen of <50.
        const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        if (error) return err(`listUsers: ${error.message}`, 500);
        const users = (data.users as AdminUser[])
          .filter((u) => STAFF_ROLES.includes((u.app_metadata?.role ?? '') as StaffRole))
          .map((u) => ({
            id: u.id,
            email: u.email ?? '',
            role: u.app_metadata?.role ?? '',
            last_sign_in_at: u.last_sign_in_at ?? null,
            created_at: u.created_at ?? null,
          }));
        return new Response(
          JSON.stringify({ users }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      default:
        return err('unknown action');
    }
  } catch (e) {
    return err(`internal: ${String(e)}`, 500);
  }
});

declare const Deno: { env: { get: (k: string) => string | undefined } };
