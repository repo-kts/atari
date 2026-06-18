const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Details — Achievements / Projects. Source: atariams.org
 * `project/nicra/details` (`nicra_details` table). Writes nicra_details.
 * Single flat table. KVK + (nullable) category/sub-category/season FKs.
 *
 * The old category_id / subcategory_id / season_name(=id) line up 1:1 with our
 * masters (verified), so they resolve by id (resolveById verifies existence).
 *
 * Old → new:
 *   category_id      → nicraCategoryId       subcategory_id → nicraSubCategoryId
 *   season_name (id) → seasonId              month (1-12)   → month (Month enum)
 *   fst_type         → fstType               crop_name      → cropName
 *   technology_demo  → technologyDemonstrated
 *   area_unit        → areaOrUnit            body_weight    → bodyWeight
 *   yield → yield    gross_cost/gross_return/net_return/bcr → grossCost/grossReturn/netReturn/bcrRatio
 *   general_m … st_f → demographics          images → photographs
 * Old *_t totals + the many category-specific columns (survival_rate_*,
 * storage_capacity, potential, …) have no new column → dropped. month is a
 * REQUIRED enum but the old row is usually null → defaults to JANUARY (+warn).
 */

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

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
    key: 'nicra-details',
    label: 'NICRA Details',
    model: 'nicraDetails',
    idField: 'nicraDetailsId',
    naturalKey: ['kvkId', 'reportingYear', 'cropName', 'fstType'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        nicraCategoryId: { master: 'nicraCategory' },
        nicraSubCategoryId: { master: 'nicraSubCategory' },
        seasonId: { master: 'season' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });

        // 1. KVK match.
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

        // 2. Reporting year ← old "2025" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Category / sub-category / season — old ids align with ours.
        let nicraCategoryId = null;
        if (row.category_id != null) {
            const hit = await r.resolveById('nicraCategory', 'categoryName', 'nicraCategoryId', row.category_id);
            if (hit.matched) nicraCategoryId = hit.id;
            else warn('nicraCategoryId', `Old category_id ${row.category_id} not in our master — left null`);
        }
        let nicraSubCategoryId = null;
        if (row.subcategory_id != null) {
            const hit = await r.resolveById('nicraSubCategory', 'subCategoryName', 'nicraSubCategoryId', row.subcategory_id);
            if (hit.matched) nicraSubCategoryId = hit.id;
            else warn('nicraSubCategoryId', `Old subcategory_id ${row.subcategory_id} not in our master — left null`);
        }
        let seasonId = null;
        if (row.season_name != null && String(row.season_name).trim() !== '') {
            const hit = await r.resolveById('season', 'seasonName', 'seasonId', row.season_name);
            if (hit.matched) seasonId = hit.id;
            else warn('seasonId', `Old season "${row.season_name}" not a known season id — left null`);
        }

        // 4. Month (REQUIRED enum) — old is usually null → default JANUARY.
        const monthNum = parseInt(String(row.month ?? '').trim(), 10);
        let month = 'JANUARY';
        if (monthNum >= 1 && monthNum <= 12) month = MONTHS[monthNum - 1];
        else warn('month', `No usable month on old row ("${row.month}") — defaulted to JANUARY`);

        const data = {
            kvkId,
            reportingYear,
            nicraCategoryId,
            categoryOther: null,
            nicraSubCategoryId,
            seasonId,
            month,
            fstType: decodeEntities(cleanText(row.fst_type)) || '',
            cropName: decodeEntities(cleanText(row.crop_name)) || '',
            technologyDemonstrated: decodeEntities(cleanText(row.technology_demo)) || '',
            areaOrUnit: floatOrZero(row.area_unit),
            bodyWeight: floatOrZero(row.body_weight),
            yield: floatOrZero(row.yield),
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
            grossCost: floatOrZero(row.gross_cost),
            grossReturn: floatOrZero(row.gross_return),
            netReturn: floatOrZero(row.net_return),
            bcrRatio: floatOrZero(row.bcr),
            photographs: extractImgSrc(row.images),
            uploadFile: null,
        };

        return { data, issues };
    },
};
