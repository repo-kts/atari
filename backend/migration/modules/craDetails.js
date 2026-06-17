const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Climate Resilient Agriculture details (CRA) — Achievements /
 * Projects. Source: atariams.org `project/climate-resilient`. Writes cra_details.
 *
 * Every field lives on the DataTables list row (nested kvk/season/farming_system
 * objects + flat demographics/yields) — no per-row edit-page fetch.
 *
 * Masters resolved by name:
 *   - season.season_name        → Season (seasonId, nullable)
 *   - croping_system            → CraCropingSystem.cropName; the raw name is
 *     ALWAYS kept in the required `croppingSystem` string, and additionally
 *     matched to croppingSystemId / parked in croppingSystemOther.
 *   - farming_system.name       → CraFarmingSystem.farmingSystemName; matched to
 *     farmingSystemId or parked in farmingSystemOther (no required name column).
 *
 * Old `*_t` totals (general_t, total_m, sub_total, …) are derived on the old
 * site and recomputed in our UI — dropped here.
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
    key: 'cra-details',
    label: 'Climate Resilient Agriculture (CRA)',
    model: 'craDetails',
    idField: 'craDetailsId',
    naturalKey: ['kvkId', 'reportingYear', 'seasonId', 'interventions', 'croppingSystem'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season' },
        croppingSystemId: { master: 'craCropingSystem', otherField: 'croppingSystemOther' },
        farmingSystemId: { master: 'craFarmingSystem', otherField: 'farmingSystemOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });

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

        // 3. Season ← season.season_name (nullable FK).
        let seasonId = null;
        const seasonName = decodeEntities(cleanText(asObject(row.season)?.season_name || row['season.season_name'] || ''));
        if (seasonName) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
            if (s.matched) seasonId = s.id;
            else warn('seasonId', `Season "${seasonName}" not in master — left blank`);
        }

        // 4. Interventions / technology demonstrated (REQUIRED string).
        const interventions = decodeEntities(cleanText(row.technology_demo)) || '';
        if (!interventions) warn('interventions', 'No technology_demo on old row');

        // 5. Cropping system — raw name always kept in the required string field,
        // plus matched to the master (else parked in *_other).
        const croppingSystem = decodeEntities(cleanText(row.croping_system)) || '';
        if (!croppingSystem) warn('croppingSystem', 'No croping_system on old row');
        let croppingSystemId = null, croppingSystemOther = null;
        if (croppingSystem) {
            const c = await r.resolve('craCropingSystem', 'cropName', 'craCropingSystemId', croppingSystem);
            if (c.matched) croppingSystemId = c.id;
            else { croppingSystemOther = croppingSystem; warn('croppingSystemId', `Cropping system "${croppingSystem}" not in master — parked in Other`); }
        }

        // 6. Farming system — match the master, else park name in *_other.
        let farmingSystemId = null, farmingSystemOther = null;
        const farmingName = decodeEntities(cleanText(asObject(row.farming_system)?.name || row['farming_system.name'] || ''));
        if (farmingName) {
            const f = await r.resolve('craFarmingSystem', 'farmingSystemName', 'craFarmingSystemId', farmingName);
            if (f.matched) farmingSystemId = f.id;
            else { farmingSystemOther = farmingName; warn('farmingSystemId', `Farming system "${farmingName}" not in master — parked in Other`); }
        }

        // 7. Area (REQUIRED Float).
        const areaInAcre = floatOrZero(row.area);

        const data = {
            kvkId,
            reportingYear,
            seasonId,
            interventions,
            croppingSystem,
            croppingSystemId,
            croppingSystemOther,
            farmingSystemId,
            farmingSystemOther,
            areaInAcre,
            // Farmer demographics — *_t totals dropped (UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
            // Yields / returns (REQUIRED Floats).
            cropYield: floatOrZero(row.crop_yield),
            systemProductivity: floatOrZero(row.system_productivity),
            totalReturn: floatOrZero(row.total_return),
            farmerPracticeYield: floatOrZero(row.yield_obtained),
        };

        return { data, issues };
    },
};
