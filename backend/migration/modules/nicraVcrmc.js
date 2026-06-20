const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Others — Village wise VCRMC. Source: atariams.org
 * `project/nicra/village-climate-risk` (`nicra_vcrmc` table). Writes
 * nicra_vcrmc. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   reporting_year ("2025")          → reportingYear (Jan 1 UTC, nullable)
 *   village_name                     → villageName
 *   constitution_date (yyyy-mm-dd)   → constitutionDate (NOT NULL)
 *   meeting_organized ("03")         → meetingsOrganized
 *   meeting_date (yyyy-mm-dd)        → meetingDate (NOT NULL)
 *   secretary_name                   → nameOfSecretary
 *   president_name                   → nameOfPresident
 *   decision_taken                   → majorDecisionTaken
 *   male / female                    → maleMembers / femaleMembers
 *   images                           → photographs (NOT NULL; '' when absent)
 * Old `total` is a derived column → dropped.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
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
    key: 'nicra-vcrmc',
    label: 'NICRA VCRMC',
    model: 'nicraVcrmc',
    idField: 'nicraVcrmcId',
    naturalKey: ['kvkId', 'reportingYear', 'villageName', 'meetingDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
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

        // 2. reporting year ← old "reporting_year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Dates (both REQUIRED).
        const constIso = parseDate(row.constitution_date);
        const meetingIso = parseDate(row.meeting_date);
        const constitutionDate = constIso ? new Date(constIso) : null;
        const meetingDate = meetingIso ? new Date(meetingIso) : null;
        if (!constitutionDate) err('constitutionDate', `Missing/invalid constitution_date "${row.constitution_date}"`);
        if (!meetingDate) err('meetingDate', `Missing/invalid meeting_date "${row.meeting_date}"`);

        const villageName = decodeEntities(cleanText(row.village_name)) || '';
        if (!villageName) warn('villageName', 'No village_name on old row — set to empty string');

        const data = {
            kvkId,
            reportingYear,
            villageName,
            constitutionDate,
            meetingsOrganized: intOrZero(row.meeting_organized),
            meetingDate,
            nameOfSecretary: decodeEntities(cleanText(row.secretary_name)) || '',
            nameOfPresident: decodeEntities(cleanText(row.president_name)) || '',
            majorDecisionTaken: decodeEntities(cleanText(row.decision_taken)) || '',
            maleMembers: intOrZero(row.male),
            femaleMembers: intOrZero(row.female),
            photographs: extractImgSrc(row.images) || '',
        };

        return { data, issues };
    },
};
