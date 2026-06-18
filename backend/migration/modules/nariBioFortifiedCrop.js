const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NARI — Details of Bio-fortified crops used in Nutri-Smart
 * village. Source: atariams.org `project/nari/bio-fortified/view`
 * (`nari_bio_fortifieds` table). Writes nari_bio_fortified_crop.
 *
 * Every field lives on the DataTables list row (nested kvk/season_info + flat
 * activity/crop/demographics) — no per-row edit-page fetch. The per-crop
 * production/consumption "results" are a SEPARATE old endpoint
 * (`nari/bio-fortified-detail`) and are NOT migrated here.
 *
 * Three REQUIRED FKs:
 *   season_info.season_name → Season.seasonName       (resolve; error if unmatched)
 *   activity                → NariActivity.activityName (find-or-create, @unique)
 *   crop_category           → CropCategory.name         (find-or-create, @unique)
 * status falls back to the model default (ONGOING). Old `*_t` / total columns
 * are dropped (the UI recomputes them).
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function floatOrZero(v) {
    if (v === null || v === undefined || String(v).trim() === '') return 0;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : 0;
}

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

/**
 * Old site stores crop_category in the singular ("Cereal", "Vegetable"); the
 * new CropCategory master is plural ("Cereals", "Vegetables"). Map the
 * normalized old value → the canonical master name so it resolves without a
 * manual grid pick. Curated, fixed list — both singular and plural keyed.
 */
const CROP_CATEGORY_ALIASES = {
    cereal: 'Cereals', cereals: 'Cereals',
    vegetable: 'Vegetables', vegetables: 'Vegetables',
    pulse: 'Pulses', pulses: 'Pulses',
    oilseed: 'Oilseeds', oilseeds: 'Oilseeds',
    fruit: 'Fruits', fruits: 'Fruits',
    other: 'Other', others: 'Other',
};

module.exports = {
    key: 'nari-bio-fortified-crop',
    label: 'NARI Bio-fortified Crops (Nutri-Smart village)',
    model: 'nariBioFortifiedCrop',
    idField: 'nariBioFortifiedCropId',
    naturalKey: ['kvkId', 'reportingYear', 'seasonId', 'nameOfNutriSmartVillage', 'nameOfCrop'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season' },
        activityId: { master: 'nariActivity', otherField: 'activityOther' },
        cropCategoryId: { master: 'cropCategory' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const error = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match — same guard as the other modules.
        const kvkObj = asObject(row.kvk);
        const oldKvkName = decodeEntities(cleanText(kvkObj?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // 2. Reporting year ← old fiscal int (e.g. 2024) → Jan 1 of that year (UTC).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Season ← season_info.season_name → Season master. REQUIRED FK,
        // resolved by name (ids don't line up across sites); error if unmatched.
        let seasonId = null;
        const seasonName = decodeEntities(cleanText(asObject(row.season_info)?.season_name || row['season_info.season_name'] || ''));
        if (seasonName) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
            if (s.matched) seasonId = s.id;
            else error('seasonId', `Season "${seasonName}" not in master — required`);
        } else {
            error('seasonId', 'No season on old row — required');
        }

        // 4. Activity ← activity string → NariActivity master (find-or-create).
        let activityId = null;
        const activityName = decodeEntities(cleanText(asObject(row.activity)?.activity_name || row.activity)) || '';
        if (activityName) {
            const a = await r.findOrCreate('nariActivity', 'activityName', 'nariActivityId', activityName);
            activityId = a.id;
            if (a.created) warn('activityId', `Activity "${activityName}" not in master — created`);
        } else {
            error('activityId', 'No activity on old row — required');
        }

        // 5. Crop category ← crop_category → CropCategory master. REQUIRED FK,
        // resolved by name only (curated fixed list; old singular "Cereal" vs
        // master "Cereals" must NOT auto-create a dup). On a miss, error + let
        // the human re-pick via the grid FK picker before seeding.
        let cropCategoryId = null;
        const cropCategory = decodeEntities(cleanText(row.crop_category)) || '';
        if (cropCategory) {
            // Canonicalise old singular → master plural before resolving.
            const canonical = CROP_CATEGORY_ALIASES[normalize(cropCategory)] || cropCategory;
            const c = await r.resolve('cropCategory', 'name', 'cropCategoryId', canonical);
            if (c.matched) cropCategoryId = c.id;
            else error('cropCategoryId', `Crop category "${cropCategory}" not in master — pick one in the grid`);
        } else {
            error('cropCategoryId', 'No crop_category on old row — required');
        }

        // 6. Required strings.
        const nameOfNutriSmartVillage = decodeEntities(cleanText(row.village_name)) || '';
        if (!nameOfNutriSmartVillage) warn('nameOfNutriSmartVillage', 'No village_name on old row');
        const nameOfCrop = decodeEntities(cleanText(row.crop_name)) || '';
        if (!nameOfCrop) warn('nameOfCrop', 'No crop_name on old row');
        const variety = decodeEntities(cleanText(row.variety)) || '';

        const data = {
            kvkId,
            reportingYear,
            seasonId,
            activityId,
            cropCategoryId,
            nameOfNutriSmartVillage,
            nameOfCrop,
            variety,
            areaHa: floatOrZero(row.area),
            // Demographics — *_t / total dropped (UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
        };

        return { data, issues };
    },
};
