'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { SUPABASE_CONFIGURED, getSupabase } from './client';
import { ensureCustomerProfile } from './customers';

type Role = 'admin' | 'customer';

interface SessionContextValue {
  configured: boolean;
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Lazy creates an anonymous session if none exists. Call only after mount. */
  ensureAnonymous: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth changes — supabase-js is dynamic-imported on mount so
  // it only lands in routes that actually mount this provider (the storefront)
  // *after* first paint, not in First Load JS.
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    void (async () => {
      const supa = await getSupabase();
      if (!supa) {
        if (mounted) setLoading(false);
        return;
      }
      const { data } = await supa.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
      const sub = supa.auth.onAuthStateChange((_event, next) => {
        if (!mounted) return;
        setSession(next ?? null);
      });
      unsubscribe = () => sub.data.subscription.unsubscribe();
    })();
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const ensureAnonymous = useCallback(async () => {
    const supa = await getSupabase();
    if (!supa) return;
    const { data } = await supa.auth.getSession();
    if (data.session) return;
    await supa.auth.signInAnonymously();
  }, []);

  // Anonymous-then-claim: on first render with no session, sign in anonymously.
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    if (loading) return;
    if (session) return;
    void ensureAnonymous();
  }, [session, loading, ensureAnonymous]);

  // First-class identity bootstrap: when the user claims an identity (signs
  // in via email-OTP / password / phone), upsert the matching `customers`
  // row so order inserts can satisfy the FK to public.customers(id).
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const u = session?.user;
    if (!u || u.is_anonymous) return;
    void ensureCustomerProfile();
  }, [session?.user?.id, session?.user?.is_anonymous]);

  const signOut = useCallback(async () => {
    const supa = await getSupabase();
    if (!supa) return;
    await supa.auth.signOut();
  }, []);

  const user = session?.user ?? null;
  const isAnonymous = !!user && (user.is_anonymous ?? false);
  const role: Role =
    (user?.app_metadata?.role as Role | undefined) === 'admin' ? 'admin' : 'customer';

  const value = useMemo<SessionContextValue>(
    () => ({
      configured: SUPABASE_CONFIGURED,
      session,
      user,
      isAnonymous,
      role,
      loading,
      signOut,
      ensureAnonymous,
    }),
    [session, user, isAnonymous, role, loading, signOut, ensureAnonymous],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession() must be called inside <SupabaseProvider>');
  }
  return ctx;
}
