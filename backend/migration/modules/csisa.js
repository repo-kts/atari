const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: CSISA — Achievements / Projects. Source: atariams.org
 * `project/view-csisa` (`csisa` table). Writes a parent csisa row + one
 * csisa_crop_detail child.
 *
 * The old `csisa` row is flat (denormalised): one record holds the trial-level
 * info AND a single crop's agronomy/economics. The new schema splits these into
 * a parent Csisa (trial) + CsisaCropDetail children, so each old row maps to one
 * parent + one crop-detail child. No grouping/dedupe — every old row is its own
 * trial (the engine inserts).
 *
 * Old → new (parent):
 *   season ("Kharif 2024")  → seasonId   (year stripped, matched to season master)
 *   village_covered         → villagesCovered
 *   block_covered           → blocksCovered
 *   district_covered        → districtsCovered
 *   respondent_number       → respondents
 *   trail_name [sic]        → trialName
 *   area_covered            → areaCoveredHa
 * Old → new (crop detail):
 *   crop_name               → cropName
 *   technology_options      → technologyOption
 *   variety_name            → varietyName
 *   duration                → durationDays
 *   sowing_date/harvesting_date → sowingDate / harvestingDate (NOT NULL)
 *   days_of_maturity        → daysOfMaturity
 *   grain_yield             → grainYieldQPerHa
 *   cost_of_cultivation     → costOfCultivation
 *   gross_return/net_return → grossReturn / netReturn
 *   bcr                     → bcr
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

/** "Kharif 2024" → "Kharif" — strip a trailing 4-digit year so it matches the master. */
function stripSeasonYear(s) {
    return String(s ?? '').replace(/\s*\d{4}.*$/, '').trim();
}

module.exports = {
    key: 'csisa',
    label: 'CSISA',
    model: 'csisa',
    idField: 'csisaId',
    naturalKey: ['kvkId', 'reportingYear', 'seasonId', 'trialName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const error = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // 1. KVK match — same guard as the other project modules.
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

        // 2. Reporting year ← old fiscal string (e.g. "2024") → Jan 1 of that year.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Season ← old "Kharif 2024" → strip year → match master (nullable).
        let seasonId = null;
        const seasonRaw = decodeEntities(cleanText(row.season)) || '';
        const seasonName = stripSeasonYear(seasonRaw);
        if (seasonName) {
            const hit = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
            if (hit.matched) seasonId = hit.id;
            else warn('seasonId', `Season "${seasonRaw}" not in master — left null`);
        }

        // 4. Crop-detail dates (both REQUIRED on the child). yyyy-mm-dd.
        const sowingIso = parseDate(row.sowing_date);
        const harvestIso = parseDate(row.harvesting_date);
        if (!sowingIso) error('sowingDate', `Missing/invalid sowing_date "${row.sowing_date}"`);
        if (!harvestIso) error('harvestingDate', `Missing/invalid harvesting_date "${row.harvesting_date}"`);

        const trialName = decodeEntities(cleanText(row.trail_name)) || '';
        if (!trialName) warn('trialName', 'No trail_name on old row — set to empty string');

        const data = {
            kvkId,
            seasonId,
            reportingYear,
            villagesCovered: intOrZero(row.village_covered),
            blocksCovered: intOrZero(row.block_covered),
            districtsCovered: intOrZero(row.district_covered),
            respondents: intOrZero(row.respondent_number),
            trialName,
            areaCoveredHa: floatOrZero(row.area_covered),
            // Child crop detail — carried alongside, split out in seedRecord.
            cropDetail: {
                cropName: decodeEntities(cleanText(row.crop_name)) || '',
                technologyOption: decodeEntities(cleanText(row.technology_options)) || '',
                varietyName: decodeEntities(cleanText(row.variety_name)) || '',
                durationDays: intOrZero(row.duration),
                sowingDate: sowingIso ? new Date(sowingIso) : null,
                harvestingDate: harvestIso ? new Date(harvestIso) : null,
                daysOfMaturity: intOrZero(row.days_of_maturity),
                grainYieldQPerHa: floatOrZero(row.grain_yield),
                costOfCultivation: floatOrZero(row.cost_of_cultivation),
                grossReturn: floatOrZero(row.gross_return),
                netReturn: floatOrZero(row.net_return),
                bcr: floatOrZero(row.bcr),
            },
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        const { cropDetail, ...csisa } = data;
        const created = await prisma.csisa.create({ data: csisa });
        await prisma.csisaCropDetail.create({
            data: { csisaId: created.csisaId, ...cropDetail },
        });
        return 'created';
    },
};
