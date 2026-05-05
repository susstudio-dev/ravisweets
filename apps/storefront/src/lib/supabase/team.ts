'use client';

import { getSupabase } from './client';

export type StaffRole = 'founder' | 'admin' | 'ops' | 'marketing' | 'accountant';

export interface StaffUser {
  id: string;
  email: string;
  role: StaffRole | string;
  last_sign_in_at: string | null;
  created_at: string | null;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: StaffRole;
  invited_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  notes: string | null;
}

async function callTeamFn<T>(body: Record<string, unknown>): Promise<{ ok: boolean; data?: T; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  try {
    const { data, error } = await supa.functions.invoke('team-management', { body });
    if (error) return { ok: false, reason: error.message };
    if ((data as { error?: string })?.error) {
      return { ok: false, reason: (data as { error?: string }).error };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

export async function listStaffUsers(): Promise<StaffUser[]> {
  const r = await callTeamFn<{ users: StaffUser[] }>({ action: 'list' });
  return r.ok && r.data ? r.data.users : [];
}

export async function inviteStaffMember(input: {
  email: string;
  role: StaffRole;
  notes?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  return callTeamFn({ action: 'invite', ...input });
}

export async function updateStaffRole(
  userId: string,
  role: StaffRole,
): Promise<{ ok: boolean; reason?: string }> {
  return callTeamFn({ action: 'update-role', userId, role });
}

export async function revokeStaffAccess(
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  return callTeamFn({ action: 'revoke', userId });
}

export async function listInvitations(): Promise<TeamInvitation[]> {
  const supa = await getSupabase();
  if (!supa) return [];
  const { data, error } = await supa
    .from('team_invitations')
    .select('*')
    .order('invited_at', { ascending: false });
  if (error || !data) return [];
  return data as TeamInvitation[];
}

export async function setStaffPermissions(
  userId: string,
  permissions: Record<string, boolean>,
): Promise<{ ok: boolean; reason?: string }> {
  const supa = await getSupabase();
  if (!supa) return { ok: false, reason: 'supabase-not-configured' };
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa.from('staff_permissions').upsert({
    user_id: userId,
    permissions,
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
