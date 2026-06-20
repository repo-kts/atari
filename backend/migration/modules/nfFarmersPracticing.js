const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc, parseNfObservation } = require('../util.js');

/**
 * Module spec: Natural Farming — Farmer Details (farmers practicing NF). Source:
 * atariams.org `project/natural-farming/farmer-details`
 * (`farmers_practicing_natural_farming` table). KVK is the only FK; PK is a uuid
 * (auto — never set).
 *
 * Old → new:
 *   reporting_year ("2026")          → reportingYear (Jan 1 UTC, nullable)
 *   farmer_name → farmerName          contact_number → contactNumber
 *   village → villageName             address → address
 *   no_of_indigenous → noOfIndigenousCows   land_holding → landHolding
 *   normal_crops_grown → normalCropsGrown
 *   practicing_year → practicingYearsOfNaturalFarming (String)
 *   area_covered → areaCoveredUnderNaturalFarming
 *   nfr_crop_grown → cropGrownUnderNaturalFarming
 *   technology → naturalFarmingTechnologyPracticingAdopted
 *   observation_recorded (JSON)      → <param>With / <param>Without floats
 *   feedback → farmerFeedback         images → images
 */

function intOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
}

function floatOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : null;
}

function floatOrZero(v) {
    const n = floatOrNull(v);
    return n == null ? 0 : n;
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
    key: 'nf-farmers-practicing',
    label: 'Natural Farming — Farmer Details',
    model: 'farmersPracticingNaturalFarming',
    idField: 'farmersPracticingId',
    naturalKey: ['kvkId', 'farmerName', 'villageName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
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

        // 2. reporting year (nullable).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        const practicingYears = cleanText(row.practicing_year);

        const data = {
            kvkId,
            reportingYear,
            farmerName: decodeEntities(cleanText(row.farmer_name)) || '',
            contactNumber: decodeEntities(cleanText(row.contact_number)) || '',
            villageName: decodeEntities(cleanText(row.village)) || '',
            address: decodeEntities(cleanText(row.address)) || '',
            noOfIndigenousCows: intOrNull(row.no_of_indigenous),
            landHolding: floatOrNull(row.land_holding),
            normalCropsGrown: decodeEntities(cleanText(row.normal_crops_grown)),
            practicingYearsOfNaturalFarming: practicingYears == null ? null : String(practicingYears),
            areaCoveredUnderNaturalFarming: floatOrZero(row.area_covered),
            cropGrownUnderNaturalFarming: decodeEntities(cleanText(row.nfr_crop_grown)) || '',
            naturalFarmingTechnologyPracticingAdopted: decodeEntities(cleanText(row.technology)) || '',
            ...parseNfObservation(row.observation_recorded),
            farmerFeedback: decodeEntities(cleanText(row.feedback)) || '',
            images: extractImgSrc(row.images),
        };

        return { data, issues };
    },
};
