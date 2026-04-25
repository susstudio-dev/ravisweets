'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import { getSupabase, SUPABASE_CONFIGURED } from '@/lib/supabase/client';
import { useSession } from '@/lib/supabase/session-context';

export function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, role, loading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = params.get('from') ?? '/admin';
  const reason = params.get('reason');

  useEffect(() => {
    if (loading) return;
    if (user && role === 'admin') router.replace(from);
  }, [user, role, loading, from, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supa = await getSupabase();
      if (!supa) throw new Error('Supabase not configured. Check .env.local and restart dev.');
      const { error: e2 } = await supa.auth.signInWithPassword({ email, password });
      if (e2) {
        // Friendlier wording for the two most common failures.
        const msg = e2.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          throw new Error(
            'Invalid email or password. If you created the user via Supabase dashboard without setting a password, send a password-reset link from Authentication → Users → {your user} → Send password reset.',
          );
        }
        if (msg.includes('email not confirmed')) {
          throw new Error(
            'Email not confirmed. In Supabase dashboard → Authentication → Users, click your admin user and toggle "Auto Confirm User", or click the confirmation link in the invite email.',
          );
        }
        throw e2;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-theme-base px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-8 shadow-soft">
        <Paisley size="md" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Ravi admin
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink">
          Sign in to manage the brand.
        </h1>

        {!SUPABASE_CONFIGURED && (
          <div className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-theme-ink">
            <p className="font-semibold">Supabase not configured</p>
            <p className="mt-1 text-theme-ink/70">
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, run{' '}
              <code>supabase/migrations/0001_init.sql</code>, and create an admin user in the
              Supabase dashboard with <code>{'{ "role": "admin" }'}</code> in their{' '}
              <code>app_metadata</code>.
            </p>
          </div>
        )}

        {reason === 'forbidden' && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-theme-ink">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-red-600" aria-hidden="true" />
            <span>This account doesn&rsquo;t have admin access. Sign in with an admin email.</span>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3.5 py-2.5 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3.5 py-2.5 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          {error && (
            <p className="text-xs font-medium text-[#c0392b]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {busy ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <details className="mt-6 rounded-lg border border-[color:var(--color-border)] bg-surface p-3 text-[11px] text-theme-ink/70">
          <summary className="cursor-pointer font-semibold text-theme-ink">
            Can&rsquo;t sign in? Quick checklist
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-4">
            <li>
              In Supabase Dashboard → Authentication → Users, your admin user must exist
              with a password set (not just an OTP/magic-link account).
            </li>
            <li>
              That user&rsquo;s <code className="font-mono">app_metadata</code> must contain{' '}
              <code className="font-mono">{'{ "role": "admin" }'}</code>. The storefront
              gates <code className="font-mono">/admin/*</code> on this claim.
            </li>
            <li>
              Email Confirmation must be done — either toggle <em>Auto Confirm User</em>
              when creating, or click the link in the confirmation email.
            </li>
            <li>
              SQL shortcut to set the role:
              <pre className="mt-1 overflow-x-auto rounded bg-[color:var(--theme-ink)]/5 p-2 font-mono text-[10px]">
                {`update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'you@ravisweets.com';`}
              </pre>
            </li>
          </ol>
        </details>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label}
      </span>
      {children}
    </label>
  );
}
