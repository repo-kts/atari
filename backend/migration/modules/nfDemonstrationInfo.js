const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc, parseNfObservation } = require('../util.js');

/**
 * Module spec: Natural Farming — Demonstration Details. Source: atariams.org
 * `project/natural-farming/demonstration-details` (`demonstration_info` table).
 * Writes demonstration_info. KVK + (nullable) season + staff-category FKs.
 *
 * Old → new:
 *   start_date/end_date (ISO)        → startDate / endDate (both NOT NULL)
 *   farmer_name/contact_number       → farmerName / contactNumber
 *   gender ("male") / category ("general") → gender / category (enums)
 *   village → villageName             address → address
 *   cropping_patter → croppingPattern farming_situation → farmingSituation
 *   latitude / longitude             activity_name → activityName (plain string)
 *   crop / variety                   season_id → seasonId (resolveById; nullable)
 *   technology_demo → technologyDemonstrated   area → areaInHa
 *   farmer_practice → farmerPracticeDetails    feedback → farmerFeedback
 *   observation_recorded (JSON)      → <param>With / <param>Without floats
 *   images → images                  reporting_year → reportingYear (nullable)
 * No old fields for no_of_indigenous_cows / land_holding / staff_category here → null.
 */

const GENDER = { male: 'MALE', female: 'FEMALE', m: 'MALE', f: 'FEMALE' };
const CATEGORY = { general: 'GENERAL', gen: 'GENERAL', obc: 'OBC', sc: 'SC', st: 'ST' };

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
    key: 'nf-demonstration-info',
    label: 'Natural Farming — Demonstration Details',
    model: 'demonstrationInfo',
    idField: 'demonstrationInfoId',
    naturalKey: ['kvkId', 'startDate', 'farmerName', 'crop'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season' },
        staffCategoryId: { master: 'staffCategory' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

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

        // 2. Dates (both REQUIRED). Old format is ISO datetime.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        // 3. reporting year (nullable).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 4. Enums (REQUIRED) — default + warn on unknown.
        const gender = GENDER[String(row.gender ?? '').trim().toLowerCase()] || 'MALE';
        if (!GENDER[String(row.gender ?? '').trim().toLowerCase()]) warn('gender', `Unknown gender "${row.gender}" — defaulted to MALE`);
        const category = CATEGORY[String(row.category ?? '').trim().toLowerCase()] || 'GENERAL';
        if (!CATEGORY[String(row.category ?? '').trim().toLowerCase()]) warn('category', `Unknown category "${row.category}" — defaulted to GENERAL`);

        // 5. season → resolveById (old ids align with ours; nullable).
        let seasonId = null;
        if (row.season_id != null && String(row.season_id).trim() !== '') {
            const hit = await r.resolveById('season', 'seasonName', 'seasonId', row.season_id);
            if (hit.matched) seasonId = hit.id;
            else warn('seasonId', `Old season_id ${row.season_id} not in our master — left null`);
        }

        const data = {
            kvkId,
            reportingYear,
            startDate,
            endDate,
            farmerName: decodeEntities(cleanText(row.farmer_name)) || '',
            villageName: decodeEntities(cleanText(row.village)) || '',
            address: decodeEntities(cleanText(row.address)) || '',
            contactNumber: decodeEntities(cleanText(row.contact_number)) || '',
            noOfIndigenousCows: null,
            landHolding: null,
            gender,
            category,
            croppingPattern: decodeEntities(cleanText(row.cropping_patter)) || '',
            farmingSituation: decodeEntities(cleanText(row.farming_situation)) || '',
            latitude: floatOrZero(row.latitude),
            longitude: floatOrZero(row.longitude),
            activityName: decodeEntities(cleanText(row.activity_name)) || '',
            crop: decodeEntities(cleanText(row.crop)) || '',
            variety: decodeEntities(cleanText(row.variety)) || '',
            seasonId,
            technologyDemonstrated: decodeEntities(cleanText(row.technology_demo)) || '',
            areaInHa: floatOrZero(row.area),
            farmerPracticeDetails: decodeEntities(cleanText(row.farmer_practice)) || '',
            ...parseNfObservation(row.observation_recorded),
            farmerFeedback: decodeEntities(cleanText(row.feedback)) || '',
            images: extractImgSrc(row.images),
            staffCategoryId: null,
        };

        return { data, issues };
    },
};
