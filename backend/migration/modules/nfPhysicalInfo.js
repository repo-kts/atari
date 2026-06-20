const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: Natural Farming — Physical Information. Source: atariams.org
 * `project/natural-farming/physical-information` (`physical_info` table).
 * Writes physical_info. KVK + (nullable) activity FK. No reporting_year column.
 *
 * Old → new:
 *   activity.name                 → activityId (resolve by name; nullable)
 *   program_title                 → trainingTitle
 *   date (yyyy-mm-dd)             → trainingDate (nullable)
 *   venue                         → venue
 *   general_m … st_f             → demographics (all nullable)
 *   remarks                       → remarks
 *   significance                  → significanceOfInnovativeProgramme
 *   images                        → images
 * Old *_t totals + total_m/f + sub_total are derived → dropped.
 * innovativeProgrammeName has no old field → left null.
 */

function intOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
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
    key: 'nf-physical-info',
    label: 'Natural Farming — Physical Info',
    model: 'physicalInfo',
    idField: 'physicalInfoId',
    naturalKey: ['kvkId', 'trainingTitle', 'trainingDate'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'naturalFarmingActivity' },
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

        // 2. activity → activity master (nullable). Resolve by nested name.
        let activityId = null;
        const activityObj = asObject(row.activity);
        const activityName = decodeEntities(cleanText(activityObj?.name || row['activity.name']));
        if (activityName) {
            const hit = await r.resolve('naturalFarmingActivityMaster', 'activityName', 'naturalFarmingActivityId', activityName);
            if (hit.matched) activityId = hit.id;
            else warn('activityId', `Activity "${activityName}" not in our master — left null`);
        } else {
            warn('activityId', 'No activity on old row — left null');
        }

        // 3. training date (nullable).
        const dateIso = parseDate(row.date);
        const trainingDate = dateIso ? new Date(dateIso) : null;

        const data = {
            kvkId,
            activityId,
            trainingTitle: decodeEntities(cleanText(row.program_title)),
            trainingDate,
            venue: decodeEntities(cleanText(row.venue)),
            generalM: intOrNull(row.general_m),
            generalF: intOrNull(row.general_f),
            obcM: intOrNull(row.obc_m),
            obcF: intOrNull(row.obc_f),
            scM: intOrNull(row.sc_m),
            scF: intOrNull(row.sc_f),
            stM: intOrNull(row.st_m),
            stF: intOrNull(row.st_f),
            remarks: decodeEntities(cleanText(row.remarks)),
            innovativeProgrammeName: null,
            significanceOfInnovativeProgramme: decodeEntities(cleanText(row.significance)),
            images: extractImgSrc(row.images),
        };

        return { data, issues };
    },
};
