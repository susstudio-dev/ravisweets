/**
 * `visual_v2` — the elevated storefront experience from
 * openspec/changes/elevate-storefront-visual-experience. Default ON for v1 shipping;
 * kept behind a flag so a stakeholder can flip back to a plain variant if a critical
 * incident demands it. Runtime source is an env var; swap to PostHog remote config later.
 */
export function isVisualV2Enabled(): boolean {
  if (typeof process === 'undefined') return true;
  const v = process.env.NEXT_PUBLIC_VISUAL_V2;
  if (v === undefined) return true;
  return v !== 'off' && v !== 'false' && v !== '0';
}

/**
 * Hero variant flag — one of `still | video | shader | 3d | kinetic-type`.
 * v1 ships `still`; the others are specced but not built.
 */
export type HeroVariant = 'still' | 'video' | 'shader' | '3d' | 'kinetic-type';

export function getHeroVariant(): HeroVariant {
  const raw = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_HERO_VARIANT : undefined;
  const allowed: HeroVariant[] = ['still', 'video', 'shader', '3d', 'kinetic-type'];
  if (raw && (allowed as string[]).includes(raw)) return raw as HeroVariant;
  if (raw) {
    // One-time console warning per spec requirement (unknown values fall back to `still`).
    if (typeof window !== 'undefined' && !(window as unknown as { __heroWarned?: boolean }).__heroWarned) {
      console.warn(`[hero] Unknown NEXT_PUBLIC_HERO_VARIANT=${raw}; falling back to "still".`);
      (window as unknown as { __heroWarned?: boolean }).__heroWarned = true;
    }
  }
  return 'still';
}
