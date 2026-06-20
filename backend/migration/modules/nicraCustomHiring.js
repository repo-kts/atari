const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Others — Custom Hiring (Farm Implements). Source:
 * atariams.org `project/nicra/custom-hiring` (`nicra_farm_implement` table).
 * Writes nicra_farm_implement. Flat table, KVK is the only FK.
 *
 * Old → new:
 *   reporting_year ("2025")        → reportingYear (Jan 1 UTC, nullable)
 *   start_date/end_date (ISO)      → startDate / endDate (both NOT NULL)
 *   name                           → nameOfFarmImplement
 *   area                           → areaCovered
 *   used_in_hours                  → farmImplementUsedHours
 *   revenue                        → revenueGeneratedRs
 *   repairing_expenditure          → expenditureIncurredRepairingRs
 *   general_m … st_f               → demographics
 *   images                         → photographs (NOT NULL; '' when absent)
 * Old *_t totals + total_m/f + sub_total are derived → dropped.
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
    key: 'nicra-custom-hiring',
    label: 'NICRA Custom Hiring',
    model: 'nicraFarmImplement',
    idField: 'nicraFarmImplementId',
    naturalKey: ['kvkId', 'reportingYear', 'nameOfFarmImplement', 'startDate'],

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

        // 3. Dates (both REQUIRED). Old format is ISO datetime.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        const nameOfFarmImplement = decodeEntities(cleanText(row.name)) || '';
        if (!nameOfFarmImplement) warn('nameOfFarmImplement', 'No name on old row — set to empty string');

        const data = {
            kvkId,
            reportingYear,
            startDate,
            endDate,
            nameOfFarmImplement,
            areaCovered: floatOrZero(row.area),
            farmImplementUsedHours: floatOrZero(row.used_in_hours),
            revenueGeneratedRs: floatOrZero(row.revenue),
            expenditureIncurredRepairingRs: floatOrZero(row.repairing_expenditure),
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
            photographs: extractImgSrc(row.images) || '',
        };

        return { data, issues };
    },
};
