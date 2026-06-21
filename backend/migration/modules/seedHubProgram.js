const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Seed Hub Program. Source: atariams.org
 * `project/seed-hub-program` (`kvk_seed_hub_program` table). Flat, KVK + Season FK.
 *
 * The old list JSON only carries crop/variety/area/yield + season; the new model
 * has many NOT-NULL quantity/amount columns the list never exposes. Mirror the
 * natural-farming modules: default missing required numbers → 0 so the row seeds.
 *
 * Old → new:
 *   kvk.kvk_name               → kvkId (match against selected KVK)
 *   season_detail.season_name  → seasonId (Season master, nullable)
 *   crop_name                  → cropName
 *   variety                    → varietyName
 *   area                       → areaCoveredHa
 *   yield                      → yieldQPerHa
 *   reporting_year ("2025")    → reportingYear (Jan 1 UTC, nullable)
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
    key: 'seed-hub-program',
    label: 'Seed Hub Program',
    model: 'kvkSeedHubProgram',
    idField: 'seedHubId',
    naturalKey: ['kvkId', 'reportingYear', 'seasonId', 'cropName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
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

        // 2. Season → Season master (nullable). Old data path is season_detail.season_name.
        let seasonId = null;
        const seasonObj = asObject(row.season_detail) || asObject(row.season) || {};
        const seasonName = decodeEntities(
            cleanText(seasonObj.season_name || row['season_detail.season_name'] || row['season.season_name'] || ''),
        ) || '';
        if (seasonName) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
            if (s.matched) seasonId = s.id;
            else warn('seasonId', `Season "${seasonName}" not found in master — left null`);
        }

        // 3. reporting year ← "reporting_year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // Columns absent from the old list — defaulted so the NOT-NULL row seeds.
        warn('*', 'Old list lacks quantity/sale/farmers/villages/amount columns — defaulted to 0');

        const data = {
            kvkId: ctx.kvkId,
            seasonId,
            cropName: decodeEntities(cleanText(row.crop_name)) || '',
            varietyName: decodeEntities(cleanText(row.variety)) || '',
            areaCoveredHa: floatOrZero(row.area),
            yieldQPerHa: floatOrZero(row.yield),
            quantityProducedQ: 0,
            quantitySaleOutQ: 0,
            farmersPurchased: 0,
            quantitySaleToFarmersQ: 0,
            villagesCovered: 0,
            quantitySaleToOtherOrgQ: 0,
            amountGeneratedLakh: 0,
            totalAmountPresentLakh: 0,
            reportingYear,
        };

        return { data, issues };
    },
};
