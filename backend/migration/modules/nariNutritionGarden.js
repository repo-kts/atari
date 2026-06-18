const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NARI — Details of established Nutrition Garden in Nutri-Smart
 * village. Source: atariams.org `project/nari/nutri-smart/view`
 * (`nari_nutri_smarts` table). Writes nari_nutritional_garden.
 *
 * Every field lives on the DataTables list row (nested kvk + flat
 * activity/village/type/demographics) — no per-row edit-page fetch. The
 * per-garden production/consumption "results" are a SEPARATE old endpoint
 * (`nari/prod-consum`) and are NOT migrated here.
 *
 * Two REQUIRED FKs, both @unique-name masters with an `is_other` flag:
 *   activity            → NariActivity.activityName        (find-or-create)
 *   type_nutri_gardern  → NutritionGardenType.name         (find-or-create)
 * The raw name is find-or-created on the master and its id used; the matching
 * *_other columns stay null (only the new form's explicit "Other" pick uses
 * them). status falls back to the model default (ONGOING). The old `*_t` totals
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

module.exports = {
    key: 'nari-nutrition-garden',
    label: 'NARI Nutrition Garden (Nutri-Smart village)',
    model: 'nariNutritionalGarden',
    idField: 'nariNutritionalGardenId',
    naturalKey: ['kvkId', 'reportingYear', 'nameOfNutriSmartVillage', 'typeOfNutritionalGardenId'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'nariActivity', otherField: 'activityOther' },
        typeOfNutritionalGardenId: { master: 'nutritionGardenType', otherField: 'typeOfNutritionalGardenOther' },
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

        // 3. Activity ← activity string → NariActivity master. REQUIRED FK, no
        // *_other used (raw name find-or-created on the @unique master).
        let activityId = null;
        const activityName = decodeEntities(cleanText(asObject(row.activity)?.activity_name || row.activity)) || '';
        if (activityName) {
            const a = await r.findOrCreate('nariActivity', 'activityName', 'nariActivityId', activityName);
            activityId = a.id;
            if (a.created) warn('activityId', `Activity "${activityName}" not in master — created`);
        } else {
            error('activityId', 'No activity on old row — required');
        }

        // 4. Type of nutritional garden ← type_nutri_gardern → NutritionGardenType
        // master. REQUIRED FK, find-or-create on the @unique name.
        let typeOfNutritionalGardenId = null;
        const typeName = decodeEntities(cleanText(row.type_nutri_gardern)) || '';
        if (typeName) {
            const t = await r.findOrCreate('nutritionGardenType', 'name', 'nutritionGardenTypeId', typeName);
            typeOfNutritionalGardenId = t.id;
            if (t.created) warn('typeOfNutritionalGardenId', `Garden type "${typeName}" not in master — created`);
        } else {
            error('typeOfNutritionalGardenId', 'No type_nutri_gardern on old row — required');
        }

        // 5. Village name (REQUIRED string).
        const nameOfNutriSmartVillage = decodeEntities(cleanText(row.village_name)) || '';
        if (!nameOfNutriSmartVillage) warn('nameOfNutriSmartVillage', 'No village_name on old row');

        const data = {
            kvkId,
            reportingYear,
            activityId,
            typeOfNutritionalGardenId,
            nameOfNutriSmartVillage,
            number: intOrZero(row.number),
            areaSqm: floatOrZero(row.area),
            // Demographics — *_t totals dropped (UI recomputes).
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
