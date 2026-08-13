'use client';

import { useSiteContent } from '@/lib/supabase/site-content-context';

/**
 * The footer's statutory line — FSSAI licence and GSTIN.
 *
 * It used to be hardcoded ("FSSAI · Telangana — pending…"), so the admin
 * "FSSAI / GSTIN line" control wrote to `footer.fssaiLine` and nothing ever
 * read it — the edit reached the database and died there (2026-08-13 review,
 * finding 28). This reads that value live, so the moment the owner enters a
 * real licence number it shows on every page; until then it falls back to the
 * honest "pending" wording rather than inventing a number.
 */
export function FooterComplianceLine() {
  const { footer } = useSiteContent();
  const line = footer?.fssaiLine?.trim();
  return <p>{line || 'FSSAI · Telangana — registration pending. GSTIN — pending.'}</p>;
}
