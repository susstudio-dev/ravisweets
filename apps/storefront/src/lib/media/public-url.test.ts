import { afterEach, describe, expect, it, vi } from 'vitest';
import { mediaPublicUrl } from './public-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('mediaPublicUrl', () => {
  it('joins the project URL and the storage path', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    expect(mediaPublicUrl('hero/x.webp')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/media/hero/x.webp',
    );
  });

  it('strips a trailing slash from the env URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co/');
    expect(mediaPublicUrl('hero/x.webp')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/media/hero/x.webp',
    );
  });

  it('returns null when the env is blank or missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(mediaPublicUrl('hero/x.webp')).toBeNull();
  });
});
