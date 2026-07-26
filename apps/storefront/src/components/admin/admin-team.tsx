'use client';

import { useEffect, useState } from 'react';
import { Mail, Plus, ShieldOff, UserCog, Users } from 'lucide-react';
import {
  inviteStaffMember,
  listInvitations,
  listStaffUsers,
  revokeStaffAccess,
  updateStaffRole,
  type StaffRole,
  type StaffUser,
  type TeamInvitation,
} from '@/lib/supabase/team';
import { useSession } from '@/lib/supabase/session-context';
import { logAdminAction } from '@/lib/supabase/orders';

const ROLE_OPTIONS: { value: StaffRole; label: string; description: string }[] = [
  { value: 'founder', label: 'Founder', description: 'Full access — can manage other staff' },
  { value: 'admin', label: 'Admin', description: 'Full access (except managing other admins)' },
  {
    value: 'ops',
    label: 'Ops',
    description: 'Orders + Inventory + Locations + Batches + Enquiries',
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Promotions + Festivals + Themes + Content + Reviews',
  },
  {
    value: 'accountant',
    label: 'Accountant',
    description: 'Read-only — Orders + Customers + Settings + Export',
  },
];

const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
);

export function AdminTeam() {
  const { configured, hasRole } = useSession();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('ops');
  const [inviteNotes, setInviteNotes] = useState('');

  const canManage = hasRole('founder', 'admin');

  async function refresh() {
    setLoading(true);
    const [s, i] = await Promise.all([listStaffUsers(), listInvitations()]);
    setStaff(s);
    setInvitations(i);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return setFeedback('Email is required.');
    setBusy(true);
    const r = await inviteStaffMember({
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      notes: inviteNotes.trim() || undefined,
    });
    setBusy(false);
    if (!r.ok) {
      setFeedback(
        `Invite failed: ${r.reason}. Make sure the team-management Edge Function is deployed.`,
      );
      return;
    }
    await logAdminAction('invite-staff', 'team', null, null, {
      email: inviteEmail,
      role: inviteRole,
    });
    setFeedback(
      `Invited ${inviteEmail} as ${ROLE_LABEL[inviteRole]}. They can sign in via the password-reset link sent to that email.`,
    );
    setInviteEmail('');
    setInviteNotes('');
    void refresh();
  }

  async function onChangeRole(user: StaffUser, role: StaffRole) {
    if (user.role === role) return;
    if (!window.confirm(`Change ${user.email} from ${user.role} to ${role}?`)) return;
    setBusy(true);
    const r = await updateStaffRole(user.id, role);
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Role update failed: ${r.reason}`);
      return;
    }
    await logAdminAction('update-staff-role', 'team', user.id, { role: user.role }, { role });
    setFeedback(`Updated ${user.email} → ${ROLE_LABEL[role]}.`);
    void refresh();
  }

  async function onRevoke(user: StaffUser) {
    if (
      !window.confirm(
        `Revoke admin access for ${user.email}? They'll be moved back to a customer account.`,
      )
    )
      return;
    setBusy(true);
    const r = await revokeStaffAccess(user.id);
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Revoke failed: ${r.reason}`);
      return;
    }
    await logAdminAction(
      'revoke-staff',
      'team',
      user.id,
      { role: user.role },
      { role: 'customer' },
    );
    setFeedback(`Revoked ${user.email}.`);
    void refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Users className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Team
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">
          Who's in the kitchen.
        </h1>
        <p className="text-theme-ink/65 mt-2 max-w-2xl text-sm">
          Founder + admin can invite teammates, change roles, and revoke access. Each role gates
          what surfaces show in the sidebar — see the role legend below the invite form.
        </p>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase not configured — connect <code>.env.local</code>.
        </div>
      )}

      {!canManage && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm">
          Only <code>founder</code> + <code>admin</code> roles can manage the team. You're signed in
          as a different role.
        </div>
      )}

      {/* Invite form */}
      {canManage && (
        <form
          onSubmit={onInvite}
          className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5"
        >
          <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
            Invite a teammate
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                Email
              </span>
              <div className="relative">
                <Mail
                  className="text-theme-ink/40 absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ops@ravisweets.com"
                  className="bg-surface w-full rounded-lg border border-[color:var(--color-border)] px-9 py-2 text-sm"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                Role
              </span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                Notes (optional)
              </span>
              <input
                type="text"
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
                placeholder='e.g. "kitchen lead — Khammam Flagship"'
                className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-theme-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {busy ? 'Inviting…' : 'Send invitation'}
            </button>
            <p className="text-theme-ink/65 text-[11px]">
              They get a password-reset email and can sign in immediately at /admin/login. Set their
              password from the email link.
            </p>
            {feedback && <p className="text-theme-ink/65 text-xs font-semibold">{feedback}</p>}
          </div>
        </form>
      )}

      {/* Role legend */}
      <section className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5">
        <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
          Role legend
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ROLE_OPTIONS.map((r) => (
            <li
              key={r.value}
              className="bg-surface rounded-xl border border-[color:var(--color-border)] p-3"
            >
              <p className="font-display text-theme-ink text-sm">{r.label}</p>
              <p className="text-theme-ink/55 mt-1 text-[11px]">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Active staff */}
      <section>
        <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
          Active staff ({staff.length})
        </h2>
        {loading ? (
          <div className="bg-theme-ink/10 mt-3 h-12 w-32 animate-pulse rounded" />
        ) : staff.length === 0 ? (
          <p className="text-theme-ink/55 mt-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm">
            No staff yet — invite your first teammate above.
          </p>
        ) : (
          <div className="bg-surface-elevated mt-3 overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-theme-glow/10 text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Last sign-in</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id} className="border-t border-[color:var(--color-border)]">
                    <td className="text-theme-ink px-4 py-2 font-mono">{u.email}</td>
                    <td className="px-4 py-2">
                      {canManage ? (
                        <select
                          value={u.role}
                          onChange={(e) => onChangeRole(u, e.target.value as StaffRole)}
                          className="bg-surface rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="bg-theme-glow/30 text-theme-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      )}
                    </td>
                    <td className="text-theme-ink/65 px-4 py-2">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onRevoke(u)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-3 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-500/10"
                        >
                          <ShieldOff className="h-3 w-3" aria-hidden="true" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invitation log */}
      {invitations.length > 0 && (
        <section>
          <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
            <UserCog className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Invitation log
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {invitations.map((i) => (
              <li
                key={i.id}
                className="bg-surface-elevated flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] p-3 text-sm"
              >
                <div>
                  <p className="text-theme-ink font-mono">{i.email}</p>
                  <p className="text-theme-ink/55 text-[11px]">
                    Invited {new Date(i.invited_at).toLocaleString('en-IN')} as{' '}
                    <span className="font-semibold">{ROLE_LABEL[i.role] ?? i.role}</span>
                    {i.notes && ` · ${i.notes}`}
                    {i.revoked_at &&
                      ` · revoked ${new Date(i.revoked_at).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    i.revoked_at
                      ? 'bg-red-500/15 text-red-700'
                      : i.accepted_at
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-theme-glow/30 text-theme-accent'
                  }`}
                >
                  {i.revoked_at ? 'Revoked' : i.accepted_at ? 'Accepted' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
