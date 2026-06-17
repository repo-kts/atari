const prisma = require('../../config/prisma.js');
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
 *     ALWAYS kept in the required `croppingSystem` string. When it isn't already
 *     a master, a CraCropingSystem row is CREATED under the resolved season and
 *     its id used for croppingSystemId.
 *   - farming_system.name       → CraFarmingSystem.farmingSystemName; same
 *     find-or-create-under-season behaviour for farmingSystemId.
 *
 * Both CRA system masters are season-scoped (NOT NULL seasonId), so creation
 * needs a resolved season. When the season is unmatched we can't create the
 * master — the name is parked in the corresponding *_other column instead and a
 * warning is raised. cropName/farmingSystemName have no unique constraint, so we
 * find-or-create per (season, normalized name): the lookup is cached per season
 * on ctx and any row created here is found on the next Transform, so repeated
 * runs never duplicate.
 */

/**
 * Find a season-scoped CRA system master by normalized name, creating it under
 * that season when absent. @returns {Promise<number|null>} the master id, or
 * null when no season is resolved (caller parks the name in *_other).
 */
async function findOrCreateSeasonScoped(ctx, model, nameField, idField, cacheKey, seasonId, rawName) {
    if (!rawName || !seasonId) return null;
    if (!ctx[cacheKey]) ctx[cacheKey] = new Map();
    let byName = ctx[cacheKey].get(seasonId);
    if (!byName) {
        const rows = await prisma[model].findMany({
            where: { seasonId },
            select: { [idField]: true, [nameField]: true },
        });
        byName = new Map(rows.map(r => [normalize(r[nameField]), r[idField]]));
        ctx[cacheKey].set(seasonId, byName);
    }
    const norm = normalize(rawName);
    if (byName.has(norm)) return byName.get(norm);
    const created = await prisma[model].create({
        data: { [nameField]: rawName, seasonId },
        select: { [idField]: true },
    });
    byName.set(norm, created[idField]);
    return created[idField];
}

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

        // 5. Cropping system — raw name always kept in the required string field.
        // Find the season-scoped master or CREATE it; only fall back to *_other
        // when no season is resolved (the master needs a season).
        const croppingSystem = decodeEntities(cleanText(row.croping_system)) || '';
        if (!croppingSystem) warn('croppingSystem', 'No croping_system on old row');
        let croppingSystemId = null, croppingSystemOther = null;
        if (croppingSystem) {
            if (seasonId) {
                croppingSystemId = await findOrCreateSeasonScoped(
                    ctx, 'craCropingSystem', 'cropName', 'craCropingSystemId',
                    '_craCropBySeason', seasonId, croppingSystem,
                );
            } else {
                croppingSystemOther = croppingSystem;
                warn('croppingSystemId', `Cropping system "${croppingSystem}" — no season resolved, can't create master, parked in Other`);
            }
        }

        // 6. Farming system — same find-or-create-under-season behaviour.
        let farmingSystemId = null, farmingSystemOther = null;
        const farmingName = decodeEntities(cleanText(asObject(row.farming_system)?.name || row['farming_system.name'] || ''));
        if (farmingName) {
            if (seasonId) {
                farmingSystemId = await findOrCreateSeasonScoped(
                    ctx, 'craFarmingSystem', 'farmingSystemName', 'craFarmingSystemId',
                    '_craFarmBySeason', seasonId, farmingName,
                );
            } else {
                farmingSystemOther = farmingName;
                warn('farmingSystemId', `Farming system "${farmingName}" — no season resolved, can't create master, parked in Other`);
            }
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
