import type {
  HamperConfig,
  HamperItem,
  BoxFinish,
  RibbonColor,
  TemplateId,
} from '@ravisweets/shared';
import { TEMPLATES } from '@ravisweets/shared';

export const BUILDER_SCHEMA_VERSION = 1;

/**
 * Compact URL schema for hamper configuration.
 *
 * Shape: ?t=<templateId>&items=<id1>:<qty1>,<id2>:<qty2>&qty=<units>&ribbon=<color>
 *        &box=<finish>&logo=<0|1>&msg=<urlEncoded>&v=1
 *
 * Item ids intentionally use the short product-variant form `productId:variantId:qty`
 * to keep URLs compact. The mapping uses a custom short-code table (aliases below)
 * to compress frequently-used product IDs.
 */

/** Short-code aliases for frequently-used product IDs (roundtrip stable). */
const PRODUCT_ALIAS: Record<string, string> = {
  p_qubani: 'qb',
  p_double_ka_meetha: 'dkm',
  p_badam_ki_jali: 'bkj',
  p_sheer_khurma: 'skh',
  p_khubani_mithai: 'khm',
  p_kaju_katli: 'kk',
  p_gulab_jamun: 'gj',
  p_motichoor_ladoo: 'mtl',
  p_mixture: 'mix',
  p_peanut_chivda: 'pc',
  p_besan_sev: 'bs',
  p_dry_almonds: 'alm',
  p_dry_pistachios: 'pist',
  p_saffron_pistachios: 'saff',
  p_combo_chai: 'cc',
  p_combo_festival: 'fc',
  p_diwali_premium: 'ghd',
  p_classic_gifting_box: 'ghc',
  p_corporate_essentials: 'gho',
  p_raksha_thali: 'fsr',
  p_eid_signature: 'fse',
};

const PRODUCT_ALIAS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_ALIAS).map(([k, v]) => [v, k]),
);

/** Variant aliases: `productId:variantId` → short code for the variant part. */
const VARIANT_ALIAS: Record<string, string> = {
  'p_qubani:v_qubani_500': '500',
  'p_double_ka_meetha:v_dkm_500': '500',
  'p_badam_ki_jali:v_bkj_250': '250',
  'p_sheer_khurma:v_skh_500': '500',
  'p_khubani_mithai:v_khm_300': '300',
  'p_kaju_katli:v_kaju_250': '250',
  'p_kaju_katli:v_kaju_500': '500',
  'p_gulab_jamun:v_gj_500': '500',
  'p_gulab_jamun:v_gj_1000': '1k',
  'p_motichoor_ladoo:v_mtl_6': '6',
  'p_motichoor_ladoo:v_mtl_12': '12',
  'p_mixture:v_mix_400': '400',
  'p_peanut_chivda:v_pc_300': '300',
  'p_besan_sev:v_bs_250': '250',
  'p_dry_almonds:v_alm_200': '200',
  'p_dry_pistachios:v_pist_200': '200',
  'p_saffron_pistachios:v_saff_100': '100',
};

const VARIANT_ALIAS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(VARIANT_ALIAS).map(([k, v]) => {
    const [pid, vid] = k.split(':');
    return [`${PRODUCT_ALIAS[pid!]}:${v}`, vid!];
  }),
);

const VALID_TEMPLATES: TemplateId[] = ['essence', 'premium', 'grande', 'blank'];
const VALID_RIBBONS: RibbonColor[] = ['saffron', 'cream', 'gold', 'ink', 'rose'];
const VALID_BOXES: BoxFinish[] = ['matte-cream', 'lacquered-brass', 'silk-wrap'];

export function serialiseConfig(config: HamperConfig): string {
  const params = new URLSearchParams();
  params.set('t', config.templateId);
  const items = config.items
    .map((it) => {
      const pAlias = PRODUCT_ALIAS[it.productId] ?? it.productId;
      const vAlias = VARIANT_ALIAS[`${it.productId}:${it.variantId}`] ?? it.variantId;
      return `${pAlias}:${vAlias}:${it.qtyPerHamper}`;
    })
    .join(',');
  if (items) params.set('items', items);
  params.set('qty', String(config.totalUnits));
  params.set('ribbon', config.ribbon);
  params.set('box', config.box);
  params.set('logo', config.logoPrint ? '1' : '0');
  if (config.message) params.set('msg', config.message);
  params.set('v', String(BUILDER_SCHEMA_VERSION));
  return params.toString();
}

/** Returns null when version mismatch / unknown template / otherwise invalid. */
export function parseConfig(search: URLSearchParams): HamperConfig | null {
  const v = Number(search.get('v'));
  if (v !== BUILDER_SCHEMA_VERSION) return null;

  const t = search.get('t') as TemplateId | null;
  const templateId: TemplateId = t && VALID_TEMPLATES.includes(t) ? t : 'blank';

  const itemsRaw = search.get('items') ?? '';
  const items: HamperItem[] = [];
  if (itemsRaw) {
    for (const entry of itemsRaw.split(',')) {
      const [pA, vA, qA] = entry.split(':');
      if (!pA || !vA) continue;
      const productId = PRODUCT_ALIAS_REVERSE[pA] ?? pA;
      const variantKey = `${pA}:${vA}`;
      const variantId = VARIANT_ALIAS_REVERSE[variantKey] ?? vA;
      const qty = Math.max(1, Math.min(50, Number(qA) || 1));
      items.push({ productId, variantId, qtyPerHamper: qty });
    }
  }

  const qty = Math.max(1, Math.min(10000, Number(search.get('qty')) || TEMPLATES[templateId].startingUnits));

  const ribbon = (search.get('ribbon') as RibbonColor | null) ?? TEMPLATES[templateId].ribbon;
  const box = (search.get('box') as BoxFinish | null) ?? TEMPLATES[templateId].box;
  const logo = search.get('logo') === '1';
  const msg = (search.get('msg') ?? '').slice(0, 240);

  return {
    templateId,
    items,
    totalUnits: qty,
    ribbon: VALID_RIBBONS.includes(ribbon) ? ribbon : 'cream',
    box: VALID_BOXES.includes(box) ? box : 'matte-cream',
    logoPrint: logo,
    message: msg,
  };
}

export function configFromTemplate(id: TemplateId): HamperConfig {
  const t = TEMPLATES[id];
  return {
    templateId: id,
    items: [...t.items],
    totalUnits: t.startingUnits,
    ribbon: t.ribbon,
    box: t.box,
    logoPrint: t.logoPrint,
    message: '',
  };
}

/** Build a summary string suitable for pre-filling the corporate enquiry textarea. */
export function summariseConfig(
  config: HamperConfig,
  lookup: (productId: string) => { title: string } | null,
  lookupVariant: (productId: string, variantId: string) => { title: string } | null,
): string {
  const lines: string[] = [];
  lines.push(`Template: ${config.templateId}`);
  lines.push(`Units: ${config.totalUnits}`);
  if (config.items.length) {
    lines.push('Items per hamper:');
    for (const it of config.items) {
      const p = lookup(it.productId);
      const v = lookupVariant(it.productId, it.variantId);
      const label = p && v ? `${p.title} — ${v.title}` : `${it.productId} / ${it.variantId}`;
      lines.push(`  · ${label} × ${it.qtyPerHamper}`);
    }
  }
  lines.push(`Ribbon: ${config.ribbon}`);
  lines.push(`Box finish: ${config.box}`);
  lines.push(`Logo printing: ${config.logoPrint ? 'yes' : 'no'}`);
  if (config.message) {
    lines.push(`Personalised message: "${config.message}"`);
  }
  return lines.join('\n');
}
