export type SpecimenShape = 'diamond' | 'round' | 'coil' | 'scatter';

/**
 * THE SPECIMEN FIGURES — the house's stand-in for a photograph.
 *
 * Extracted from hero-batch.tsx (2026-08-12) so /essence can use the same four
 * marks. Production photography has not landed, and every image URL in the
 * catalogue is still empty; rather than ship a grey box or a stock photo of
 * somebody else's sweets, the site draws the sweet's FORM in its own flavour
 * ink. It reads as a deliberate spec-sheet figure instead of a missing asset,
 * and it is the same grammar as the dashed specimen plate in SlotImage.
 *
 * Pure SVG, no client hooks — usable from server and client components alike.
 */
export function shapeForTitle(title: string, index = 0): SpecimenShape {
  const t = title.toLowerCase();
  if (/katli|barfi|burfi|jali|chikki|kalakand|bar\b|glass|pak\b/.test(t)) return 'diamond';
  if (/jamun|laddu|ladoo|boondi|pak|peda|bonbon|cloud|truffle/.test(t)) return 'round';
  if (/mixture|sev|chivda|murukku|kaju|badam|almond|pista|nut|caviar|noir/.test(t)) {
    return 'scatter';
  }
  if (/jalebi|halwa|meetha|khurma|rabri/.test(t)) return 'coil';
  return (['diamond', 'round', 'coil', 'scatter'] as const)[index % 4]!;
}

/** A spec-sheet figure in the product's own flavour ink. */
export function SpecimenMark({
  shape,
  color,
  className,
}: {
  shape: SpecimenShape;
  color: string;
  className?: string;
}) {
  const stroke = { stroke: color, strokeWidth: 2.5, fill: 'none' } as const;
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden="true">
      {shape === 'diamond' && (
        <>
          <rect
            x="16"
            y="16"
            width="40"
            height="40"
            transform="rotate(45 36 36)"
            strokeLinejoin="round"
            {...stroke}
          />
          <rect
            x="27"
            y="27"
            width="18"
            height="18"
            transform="rotate(45 36 36)"
            fill={color}
            opacity="0.22"
          />
          <rect x="31" y="31" width="10" height="10" transform="rotate(45 36 36)" fill={color} />
        </>
      )}
      {shape === 'round' && (
        <>
          <circle cx="36" cy="36" r="21" {...stroke} />
          <circle cx="36" cy="36" r="13" fill={color} opacity="0.22" />
          <circle cx="30" cy="33" r="2.4" fill={color} />
          <circle cx="40" cy="30" r="2.4" fill={color} />
          <circle cx="37" cy="41" r="2.4" fill={color} />
        </>
      )}
      {shape === 'coil' && (
        <path
          d="M36 36 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0"
          strokeLinecap="round"
          {...stroke}
        />
      )}
      {shape === 'scatter' && (
        <>
          <circle cx="24" cy="26" r="5" fill={color} opacity="0.8" />
          <circle cx="44" cy="20" r="4" fill={color} opacity="0.45" />
          <circle cx="52" cy="38" r="5.5" fill={color} />
          <circle cx="33" cy="44" r="4.5" fill={color} opacity="0.6" />
          <circle cx="20" cy="48" r="3.5" fill={color} opacity="0.35" />
          <circle cx="44" cy="52" r="4" fill={color} opacity="0.8" />
        </>
      )}
    </svg>
  );
}
