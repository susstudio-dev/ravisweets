// ─── generate-catalogue.mjs ──────────────────────────────────────────────────
// Emits packages/shared/src/catalogue/products.generated.ts from Supabase.
//
// Run from the repo root:   pnpm run generate:catalogue
// (wired as `node --import tsx scripts/generate-catalogue.mjs` — tsx lets this
// .mjs import the TypeScript catalogue module for its ordering, exactly as
// generate-product-seed.mjs does.)
//
// WHY THIS EXISTS. The admin writes products and variants to Supabase, but the
// storefront is a static export (`output: 'export'`): there is no server at
// request time to read them back, and src/lib/supabase/client.ts deliberately
// returns null off the browser so it cannot be used at build time either. So
// the database is read HERE, once, at build time, and baked into a plain TS
// module that the existing `CATALOGUE` import picks up. An admin edit reaches
// the live site on the next deploy — not instantly, but correctly, and without
// giving up the static export.
//
// This runs with the ANON key. That is sufficient and intentional: RLS grants
// `anyone reads non-archived products` and `anyone reads variants using (true)`,
// so the anon role sees precisely the catalogue a shopper is allowed to see.
// Archived products are filtered out by the database, not by this script.
//
// FAIL SOFT, ALWAYS. Every failure path — no credentials, network down, RLS
// change, zero rows — warns and exits 0 WITHOUT touching the output file. A
// database outage must never break a deploy or blank the shop; the last good
// generated file is committed, so the build simply ships that instead.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderModule } from './lib/catalogue-emitter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'packages', 'shared', 'src', 'catalogue', 'products.generated.ts');
const ENV_FILES = [
  path.join(ROOT, 'apps', 'storefront', '.env.local'),
  path.join(ROOT, 'apps', 'storefront', '.env.production'),
];

/** Prefix every message so it is obvious which build step spoke. */
const say = (msg) => console.log(`[generate:catalogue] ${msg}`);
const warn = (msg) => console.warn(`[generate:catalogue] ${msg}`);

/**
 * Thrown to abandon generation without writing anything. The runner at the
 * bottom turns it into a warning and a zero exit — see FAIL SOFT above.
 *
 * A thrown sentinel rather than `process.exit(0)`: exiting mid-flight kills the
 * process while tsx's esbuild service and undici's still-open sockets are being
 * torn down, and on Windows that races into
 * `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` and a 127 exit —
 * turning the one code path whose entire job is "never fail the build" into a
 * hard failure. Unwinding to the top and letting the event loop drain naturally
 * makes the promised exit code the one actually delivered.
 */
class SkipGeneration extends Error {}

function giveUp(reason) {
  throw new SkipGeneration(reason);
}

// ─── env ─────────────────────────────────────────────────────────────────────

/**
 * Minimal .env reader. Deliberately not `dotenv`: this script must run from a
 * bare `node` in CI where only the root devDependencies are guaranteed, and the
 * two values it needs are plain `KEY=value` lines with no interpolation.
 */
function readEnvFile(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const rawLine of readFileSync(file, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    // Strip one layer of matching quotes — `KEY="value"` and `KEY='value'`.
    out[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

/**
 * Precedence mirrors Next.js: a real environment variable wins, then
 * .env.local (a developer's machine), then .env.production (committed, and the
 * only one of the two that exists on a fresh CI clone — .env.local is
 * gitignored). That ordering means Cloudflare's dashboard variables override
 * the committed file rather than the other way round.
 */
function resolveEnv(key) {
  if (process.env[key]) return process.env[key];
  for (const file of ENV_FILES) {
    const value = readEnvFile(file)[key];
    if (value) return value;
  }
  return undefined;
}

// ─── the ordering source ─────────────────────────────────────────────────────

/*
 * Product order is VISIBLE. /shop renders `CATALOGUE` in array order, the
 * homepage slices off the front of it, and /category/[slug] preserves the
 * order of whatever survives its filter. Sorting the baked catalogue by id —
 * the obvious "deterministic" choice, and what generate-product-seed.mjs does
 * because SQL insert order is invisible — would silently reshuffle the entire
 * shop, opening it on Badam ki Jali instead of the curated opening run.
 *
 * So the hardcoded array stays the ordering authority: products it knows keep
 * their curated position, and anything the admin has since created lands after
 * them, sorted by id. Deterministic either way, and the shop looks the same
 * tomorrow as it does today.
 *
 * HARDCODED_CATALOGUE is read rather than CATALOGUE precisely because CATALOGUE
 * is the *output* of this pipeline — reading it would let one generation's
 * ordering feed the next.
 */
/**
 * Load the hardcoded array, healing the output file if it is in the way.
 *
 * products.ts imports the generated module, so that module must exist AND
 * PARSE before this script can import products.ts at all — the generator
 * depends on its own previous output. Two ways that bites, both recoverable by
 * writing an empty module (a valid answer: CATALOGUE falls back to
 * HARDCODED_CATALOGUE when the generated array is empty):
 *
 *   · the file is missing — a fresh branch, or someone deleted it;
 *   · the file is corrupt — a half-written file from a killed build, or a bad
 *     emitter. Without the retry that is a dead end: the one command that
 *     rewrites the file cannot start until the file is already good.
 */
async function loadHardcodedCatalogue() {
  const specifier = '../packages/shared/src/catalogue/products.ts';
  if (!existsSync(OUT_FILE)) {
    writeFileSync(OUT_FILE, renderModule([]), 'utf8');
    say(`Bootstrapped an empty ${path.relative(ROOT, OUT_FILE)}.`);
  }
  try {
    return (await import(specifier)).HARDCODED_CATALOGUE;
  } catch (err) {
    warn(`${path.relative(ROOT, OUT_FILE)} could not be imported — ${err.message}`);
    warn('Resetting it to an empty catalogue and retrying.');
    writeFileSync(OUT_FILE, renderModule([]), 'utf8');
    // Fresh query string: a module URL that resolved once is cached for the
    // life of the process, so the retry needs a URL the loader has not seen.
    return (await import(`${specifier}?reset=${Date.now()}`)).HARDCODED_CATALOGUE;
  }
}

// ─── value guards ────────────────────────────────────────────────────────────

/*
 * These mirror the string-literal unions in packages/shared/src/types/product.ts
 * and types/region.ts. They have to be duplicated: a TS union has no runtime
 * form, and this script emits TypeScript that must COMPILE. Without the guards,
 * one typo in an admin category field would emit a `category: 'sweetz'` that
 * fails `tsc` and takes the whole build down — the exact opposite of fail-soft.
 * A value outside the union is dropped (or the product skipped) and reported,
 * so the build survives and the mismatch is visible in the log.
 *
 * If you add a member to one of those unions, add it here too.
 */
const CATEGORIES = new Set([
  'sweets',
  'namkeens',
  'savouries',
  'sweet-bites',
  'dry-fruits',
  'pickles',
  'powders',
  'biscuits',
  'healthy-sweets',
  'combos',
  'gift-hampers',
  'festival-specials',
]);
const DIETARY_TAGS = new Set([
  'eggless',
  'sugar-free',
  'vegan',
  'gluten-free',
  'nuts',
  'dairy',
  'contains-ghee',
  'non-veg',
]);
const GARNISHES = new Set(['saffron', 'pistachio', 'silver', 'paisley', 'rose']);
const REGIONS = new Set(['in', 'us', 'uk', 'ae', 'au', 'ca', 'sg']);
const CURRENCIES = new Set(['INR', 'USD', 'GBP', 'AED', 'AUD', 'CAD', 'SGD']);
const UNIT_MODES = new Set(['weight', 'quantity']);

/**
 * Fallback palette. Kept as a literal rather than imported from ./palettes so
 * the emitted module stays a pure data file with a single type-only import.
 * Values are HOUSE from packages/shared/src/catalogue/palettes.ts — change them
 * there and here together. Defensive only: theme_palette is populated on every
 * row today, but the column is nullable and Product.theme_palette is not.
 */
const HOUSE_PALETTE = {
  base: '#FAF6E5',
  accent: '#2046C8',
  glow: '#EBC77E',
  ink: '#161C24',
  grainOpacity: 0.04,
};

const asString = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
const asNumber = (v, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const asBool = (v) => v === true;
const asArray = (v) => (Array.isArray(v) ? v : []);
const inSet = (v, set) => (typeof v === 'string' && set.has(v) ? v : undefined);

// ─── row → Product mapping ───────────────────────────────────────────────────

function mapPalette(raw) {
  if (!raw || typeof raw !== 'object') return { ...HOUSE_PALETTE };
  return {
    base: asString(raw.base, HOUSE_PALETTE.base),
    accent: asString(raw.accent, HOUSE_PALETTE.accent),
    glow: asString(raw.glow, HOUSE_PALETTE.glow),
    ink: asString(raw.ink, HOUSE_PALETTE.ink),
    grainOpacity: asNumber(raw.grainOpacity, HOUSE_PALETTE.grainOpacity),
  };
}

function mapImages(raw) {
  return asArray(raw)
    .filter((img) => img && typeof img === 'object')
    .map((img) => ({
      url: asString(img.url),
      alt: asString(img.alt),
      // 1400×1400 is the catalogue's square default; a missing dimension would
      // otherwise emit 0 and collapse every <Image> that trusts the aspect ratio.
      width: asNumber(img.width, 1400),
      height: asNumber(img.height, 1400),
    }));
}

const NUTRITION_KEYS = [
  'calories',
  'protein_g',
  'fat_g',
  'sugar_g',
  'fibre_g',
  'carbs_g',
  'sodium_mg',
];

function mapNutrition(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const out = {};
  for (const key of NUTRITION_KEYS) {
    if (typeof raw[key] === 'number' && Number.isFinite(raw[key])) out[key] = raw[key];
  }
  return Object.keys(out).length ? out : undefined;
}

/*
 * VARIANT ORDER IS A PRICE. Several components read `variants[0]` as the
 * product's headline price (product cards, the admin's sale preview) and the
 * variant picker lists them top to bottom. PostgREST does not promise an order
 * on an embedded table, so leaving it to chance would let the 1 kg row land
 * first and show ₹1,899 where ₹549 belongs.
 *
 * Ascending weight reproduces the hardcoded order exactly — every variant list
 * in products.ts is already smallest-first, including the pack-count ones
 * (Box of 12 at 250 g before Box of 48 at 1 kg). Price then id break ties so
 * two same-weight variants can never swap places between two runs.
 */
function compareVariants(a, b) {
  const byWeight = asNumber(a.weight_grams) - asNumber(b.weight_grams);
  if (byWeight !== 0) return byWeight;
  const byPrice = asNumber(a.price_amount) - asNumber(b.price_amount);
  if (byPrice !== 0) return byPrice;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function mapVariant(row) {
  const variant = {
    id: asString(row.id),
    title: asString(row.title),
    weight_grams: asNumber(row.weight_grams),
    price: {
      /*
       * price_amount IS RUPEES, AND IS COPIED VERBATIM. No ×100, no ÷100.
       *
       * The column name invites a paise assumption and two stale comments in
       * the app repeat it, so this was checked against the three things that
       * actually touch the column rather than against the naming:
       *
       *   1. generate-product-seed.mjs writes `variant.price.amount` straight
       *      into price_amount ("verbatim — same unit as Money.amount"), and
       *      Money.amount is rupees: formatMoney() hands it to Intl with
       *      maximumFractionDigits 0, so 279 prints as ₹279.
       *   2. The admin's inline variant editor loads `v.price.amount` into the
       *      input and calls upsertVariantPrice(v.id, v.price) with no scaling,
       *      so what a shopkeeper types in rupees is what lands in the column.
       *   3. The live data agrees: the seeded rows read 279 and 3300, which are
       *      the rupee figures, not 27900 and 330000.
       *
       * A ÷100 here would price the whole shop at ₹0–33; a ×100 would price it
       * at ₹27,900 a box. Verified before believing the column name.
       */
      amount: asNumber(row.price_amount),
      currency: inSet(row.price_currency, CURRENCIES) ?? 'INR',
    },
    sku: asString(row.sku),
    stock_available: asNumber(row.stock_available),
  };
  // hsn_code is optional in the type, so it is emitted only when the database
  // has one — an empty string would typecheck but claim a tariff heading the
  // row does not have. It was null on every row until 2026-08-10 (0014's insert
  // column list omitted the column); 0016_variant_hsn_codes.sql backfills the
  // seeded rows and the fixed generator carries it for new ones, so this branch
  // now normally fires. Nothing renders the value yet — it is baked because it
  // is invoicing data, and a bake that drops it makes the restore pointless.
  const hsn = asString(row.hsn_code, '');
  if (hsn) variant.hsn_code = hsn;
  return variant;
}

function mapProduct(row) {
  const category = inSet(row.category, CATEGORIES);
  if (!category) {
    warn(`Skipped ${row.id ?? '(no id)'} — category '${row.category}' is not a CategorySlug.`);
    return null;
  }
  const variants = asArray(row.variants).slice().sort(compareVariants).map(mapVariant);
  if (!variants.length) {
    warn(`Skipped ${row.id} — no variants, so nothing on the site could price it.`);
    return null;
  }

  const product = {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    category,
  };
  // subcategory is optional — omit rather than emit an empty string, so the
  // generated file carries only fields the database actually has a value for.
  const subcategory = asString(row.subcategory, '');
  if (subcategory) product.subcategory = subcategory;

  product.dietary_tags = asArray(row.dietary_tags).filter((t) => DIETARY_TAGS.has(t));
  product.ingredients = asArray(row.ingredients).filter((v) => typeof v === 'string');
  product.allergens = asArray(row.allergens).filter((v) => typeof v === 'string');
  product.storage_instructions = asString(row.storage_instructions);
  product.shelf_life_days = asNumber(row.shelf_life_days);
  product.images = mapImages(row.images);
  product.variants = variants;
  product.region_availability = asArray(row.region_availability).filter((r) => REGIONS.has(r));
  product.featured = asBool(row.featured);
  product.bestseller = asBool(row.bestseller);
  // products.is_new ← Product.new (`new` is a reserved word, hence the rename
  // in the DB; the seed generator does the same mapping in the other direction).
  product.new = asBool(row.is_new);
  product.theme_palette = mapPalette(row.theme_palette);
  product.garnish = inSet(row.garnish, GARNISHES) ?? 'saffron';
  product.builder_eligible = asBool(row.builder_eligible);

  // unit_mode is optional in the type and null on the 24 curated rows (0014
  // lets the column default apply for products that never set one), so a null
  // here means "unspecified" and must stay unspecified — emitting 'weight'
  // would be inventing data, and emitting null would not typecheck.
  const unitMode = inSet(row.unit_mode, UNIT_MODES);
  if (unitMode) product.unit_mode = unitMode;

  // Sale fields. `on_sale` is `not null default false`, so false is the absence
  // of a sale rather than a fact worth recording — it is emitted only when true.
  // The other three are emitted whenever set; computeEffectivePrice ignores them
  // unless on_sale is true, so a stale sale_price cannot leak a discount.
  if (asBool(row.on_sale)) product.on_sale = true;
  if (typeof row.sale_price === 'number') product.sale_price = row.sale_price;
  if (typeof row.sale_percent_off === 'number') product.sale_percent_off = row.sale_percent_off;
  const saleEndsAt = asString(row.sale_ends_at, '');
  if (saleEndsAt) product.sale_ends_at = saleEndsAt;
  const saleLabel = asString(row.sale_label, '');
  if (saleLabel) product.sale_label = saleLabel;

  const nutrition = mapNutrition(row.nutrition);
  if (nutrition) product.nutrition = nutrition;

  product.rubric_passed_on = asString(row.rubric_passed_on);
  product.source_url = asString(row.source_url);
  return product;
}

// ─── TS emitter ──────────────────────────────────────────────────────────────
// Lives in scripts/lib/catalogue-emitter.mjs — see the note there on why the
// serialiser is shared with bake-catalogue-from-source.mjs rather than copied.

// ─── fetch ───────────────────────────────────────────────────────────────────

/**
 * Build the Supabase client.
 *
 * The app's own client (apps/storefront/src/lib/supabase/client.ts) returns
 * null when `typeof window === 'undefined'` — by design, so no server bundle
 * can accidentally hold a session. That makes it useless here, so the SDK is
 * constructed directly.
 *
 * It is resolved out of apps/storefront because @supabase/supabase-js is a
 * storefront dependency, not a root one; pnpm does not hoist it to the root
 * node_modules, so a bare `import '@supabase/supabase-js'` from a script in
 * scripts/ would not resolve. Anchoring on the storefront's package.json also
 * guarantees the generator reads the database through the exact SDK version the
 * app itself uses.
 */
function connect(url, anonKey) {
  let createClient;
  try {
    ({ createClient } = createRequire(path.join(ROOT, 'apps', 'storefront', 'package.json'))(
      '@supabase/supabase-js',
    ));
  } catch (err) {
    giveUp(`@supabase/supabase-js could not be loaded from apps/storefront (${err.message}).`);
  }
  return createClient(url, anonKey, {
    // No session to persist and nothing to refresh — this is a one-shot read in
    // a process that exits. Leaving the defaults on keeps a refresh timer alive
    // and the script never finishes.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const url = resolveEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = resolveEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    giveUp('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.');
  }

  const hardcoded = await loadHardcodedCatalogue();
  const curatedOrder = new Map(hardcoded.map((p, i) => [p.id, i]));

  say(`Reading ${url} …`);
  let rows;
  try {
    // Archived products are excluded by RLS ("anyone reads non-archived
    // products"), not by a filter here — the anon role cannot see them at all.
    const { data, error } = await connect(url, anonKey).from('products').select('*, variants(*)');
    if (error) giveUp(`the products query failed — ${error.message}`);
    rows = data ?? [];
  } catch (err) {
    if (err instanceof SkipGeneration) throw err;
    giveUp(`the products query threw — ${err.message}`);
  }

  if (!rows.length) giveUp('the database returned zero products.');

  const products = rows
    .map(mapProduct)
    .filter((p) => p !== null)
    .sort((a, b) => {
      // Curated products first, in their products.ts order; DB-only products
      // after them, by id. Infinity keeps unknown ids in the second group
      // without needing a separate partition step.
      const ai = curatedOrder.has(a.id) ? curatedOrder.get(a.id) : Infinity;
      const bi = curatedOrder.has(b.id) ? curatedOrder.get(b.id) : Infinity;
      if (ai !== bi) return ai - bi;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

  if (!products.length) {
    giveUp('every row was rejected by the value guards — refusing to blank the catalogue.');
  }

  // A product in products.ts but not in the database will DISAPPEAR from the
  // site, because GENERATED_CATALOGUE replaces the hardcoded array wholesale
  // rather than merging with it. That is correct once the database is the
  // source of truth — an admin must be able to delete a product — but it is
  // silent, so it is reported here.
  const missing = hardcoded.filter((p) => !products.some((q) => q.id === p.id));
  if (missing.length) {
    warn(`${missing.length} hardcoded product(s) are absent from the database and will not ship:`);
    for (const p of missing) warn(`  · ${p.id} (${p.slug})`);
  }

  const added = products.filter((p) => !curatedOrder.has(p.id));
  if (added.length) {
    say(
      `${added.length} product(s) exist only in the database: ${added.map((p) => p.id).join(', ')}`,
    );
  }

  /*
   * REGRESSION GUARD — a build must not un-ship the photography.
   *
   * This generator's whole philosophy is "stale beats blank": every failure
   * path keeps the committed file rather than shipping an empty shop. But the
   * worst case in practice is not a failure — it is a SUCCESS against a
   * database that has not caught up with the repo.
   *
   * That is not hypothetical. The 2026-08-13 photography landed as 57 new
   * products and 111 photographs committed to products.ts and baked into the
   * generated file. The very next `pnpm run build` ran this script, read a
   * database still holding the April rows, and quietly wrote the snapshot back
   * to 83 products with zero images — a complete, silent revert of the work,
   * with the build reporting success.
   *
   * A database that legitimately has fewer photographs than the committed
   * snapshot is possible (an admin deleting images), but it is rare and
   * deliberate, whereas an un-migrated database is common and accidental. So
   * the regression is refused by default and released with an explicit
   * override, which is the same shape as the canonical-URL guard in
   * build-cloudflare.mjs.
   */
  const committed = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, 'utf8') : '';
  const countPhotos = (text) => (text.match(/url: '\/products\//g) ?? []).length;
  const wasPhotographed = countPhotos(committed);
  const nowPhotographed = products.reduce(
    (n, p) => n + p.images.filter((i) => i.url?.startsWith('/products/')).length,
    0,
  );
  if (wasPhotographed > nowPhotographed && process.env.ALLOW_CATALOGUE_REGRESSION !== 'true') {
    warn('');
    warn('  REFUSING TO WRITE — the database has fewer photographs than the repo.');
    warn(`  committed snapshot: ${wasPhotographed} product image(s)`);
    warn(`  database returned:  ${nowPhotographed} product image(s)`);
    warn('');
    warn('  This almost always means the catalogue migrations have not been');
    warn('  applied to this Supabase project yet. Apply them IN THIS ORDER,');
    warn('  then rebuild:');
    warn('    1. supabase/migrations/0014_seed_products.sql        (adds new products)');
    warn('    2. supabase/migrations/0022_retire_qubani_and_hyderabadi_claims.sql');
    warn('         (archives Qubani, merges hyderabadi-specials into sweets,');
    warn('          renames the mixture slug)');
    warn('    3. supabase/migrations/0021_product_photography.sql  (fills in images —');
    warn('         keys on the slug 0022 renames, so it must run after 0022)');
    warn('');
    warn('  If the database really is correct and the images were removed on');
    warn('  purpose, re-run with ALLOW_CATALOGUE_REGRESSION=true.');
    warn('');
    warn(`  Keeping the committed ${path.relative(ROOT, OUT_FILE)} as-is.`);
    return;
  }

  writeFileSync(OUT_FILE, renderModule(products), 'utf8');
  const variantCount = products.reduce((n, p) => n + p.variants.length, 0);
  say(
    `Wrote ${path.relative(ROOT, OUT_FILE)} — ${products.length} products, ${variantCount} variants.`,
  );
}

try {
  await main();
} catch (err) {
  // Every failure lands here, not just the deliberate ones: a bug in the
  // mapping code is no more welcome to break a deploy than a network blip is.
  // The output file is only ever written on the success path, so reaching this
  // point always leaves the committed catalogue intact.
  warn(err instanceof SkipGeneration ? `SKIPPED — ${err.message}` : `SKIPPED — ${err.stack}`);
  warn(`Keeping the committed ${path.relative(ROOT, OUT_FILE)} as-is.`);
  process.exitCode = 0;
}
