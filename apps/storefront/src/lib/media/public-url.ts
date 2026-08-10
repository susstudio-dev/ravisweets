/**
 * storage_path → public URL for the `media` bucket. Pure and node-safe —
 * reads the env at call time so tests can vi.stubEnv it, and so the same
 * function serves both the browser overlay and any future build-time bake.
 */
export function mediaPublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !base.trim()) return null;
  return `${base.replace(/\/+$/, '')}/storage/v1/object/public/media/${storagePath}`;
}
