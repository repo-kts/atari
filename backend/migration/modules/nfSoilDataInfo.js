const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Natural Farming — Soil Information. Source: atariams.org
 * `project/natural-farming/soil-information` (`soil_data_information` table).
 * Writes soil_data_information. KVK + (nullable) season + soil-parameter FKs.
 *
 * Old → new:
 *   reporting_year ("2026")          → year (Int) + reportingYearDate (Jan 1 UTC, nullable)
 *   season.season_name               → seasonId (resolve by name; nullable)
 *   type                             → soilParameterId (resolve by name; on miss → null + soilParameterOther)
 *   crop_name                        → crop
 *   before_ph/ec/oc                  → phBefore/ecBefore/ocBefore
 *   before_n_kg_ha/p_kg_ha/k_kg_ha   → nBefore/pBefore/kBefore
 *   before_soil_microbes             → soilMicrobesBefore
 *   after_*                          → *After (same mapping)
 */

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
    key: 'nf-soil-data-info',
    label: 'Natural Farming — Soil Information',
    model: 'soilDataInformation',
    idField: 'soilDataInformationId',
    naturalKey: ['kvkId', 'year', 'crop'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season' },
        soilParameterId: { master: 'naturalFarmingSoilParameter' },
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

        // 2. year (REQUIRED Int) + reportingYearDate (nullable).
        const year = parseInt(String(row.reporting_year ?? '').trim(), 10);
        if (!Number.isInteger(year)) err('year', `Missing/invalid reporting_year "${row.reporting_year}"`);
        const reportingYearDate = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. season → resolve by nested name (nullable).
        let seasonId = null;
        const seasonObj = asObject(row.season);
        const seasonName = decodeEntities(cleanText(seasonObj?.season_name || row['season.season_name']));
        if (seasonName) {
            const hit = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
            if (hit.matched) seasonId = hit.id;
            else warn('seasonId', `Season "${seasonName}" not in our master — left null`);
        } else {
            warn('seasonId', 'No season on old row — left null');
        }

        // 4. soil parameter → resolve `type` by name; on miss park raw in soilParameterOther.
        let soilParameterId = null;
        let soilParameterOther = null;
        const typeRaw = decodeEntities(cleanText(row.type));
        if (typeRaw) {
            const hit = await r.resolve('naturalFarmingSoilParameterMaster', 'parameterName', 'naturalFarmingSoilParameterId', typeRaw);
            if (hit.matched) soilParameterId = hit.id;
            else { soilParameterOther = typeRaw; warn('soilParameterId', `Soil parameter "${typeRaw}" not in master — parked in soilParameterOther`); }
        }

        const data = {
            kvkId,
            year: Number.isInteger(year) ? year : 0,
            reportingYearDate,
            crop: decodeEntities(cleanText(row.crop_name)) || '',
            seasonId,
            soilParameterId,
            soilParameterOther,
            phBefore: floatOrZero(row.before_ph),
            ecBefore: floatOrZero(row.before_ec),
            ocBefore: floatOrZero(row.before_oc),
            nBefore: floatOrZero(row.before_n_kg_ha),
            pBefore: floatOrZero(row.before_p_kg_ha),
            kBefore: floatOrZero(row.before_k_kg_ha),
            soilMicrobesBefore: floatOrZero(row.before_soil_microbes),
            phAfter: floatOrZero(row.after_ph),
            ecAfter: floatOrZero(row.after_ec),
            ocAfter: floatOrZero(row.after_oc),
            nAfter: floatOrZero(row.after_n_kg_ha),
            pAfter: floatOrZero(row.after_p_kg_ha),
            kAfter: floatOrZero(row.after_k_kg_ha),
            soilMicrobesAfter: floatOrZero(row.after_soil_microbes),
        };

        return { data, issues };
    },
};
