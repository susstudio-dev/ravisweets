import type { SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True only when both env vars are populated AND look real (not the .env.example
 * placeholders). The storefront degrades gracefully to localStorage-only when
 * Supabase isn't configured — auth modal still renders but submits return a
 * "not yet configured" toast, and the admin shows a setup screen.
 */
export const SUPABASE_CONFIGURED =
  !!URL && !!ANON && URL.startsWith('https://') && !URL.includes('YOUR_PROJECT_REF');

let cached: SupabaseClient | null = null;
let initialising: Promise<SupabaseClient | null> | null = null;

/**
 * Lazy + dynamic-imported singleton. The supabase-js bundle (~50 KB gz) is NOT
 * included in any route's First Load JS — it's fetched only when getSupabase()
 * is awaited (e.g. when a user clicks Sign in or the SupabaseProvider runs its
 * mount effect). Cart and home pages stay light.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!SUPABASE_CONFIGURED) return null;
  if (typeof window === 'undefined') return null;
  if (cached) return cached;
  if (initialising) return initialising;
  initialising = (async () => {
    const { createClient } = await import('@supabase/supabase-js');
    cached = createClient(URL!, ANON!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'ravi.supabase.auth.v1',
      },
    });
    return cached;
  })();
  return initialising;
}
