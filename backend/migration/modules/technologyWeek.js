const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Technology Week Celebration (Achievements). Source:
 * atariams.org `technology-week`. Writes kvk_technology_week_celebration.
 *
 * Every field lives on the DataTables list row (nested kvk object) — no per-row
 * edit-page fetch. activity_type and related_crop_livestock are free text on the
 * old site (no master), so they map straight to the string columns. Farmer
 * demographics arrive as general/obc/sc/st × m/f on the row; the *_t totals and
 * sub_total are derived on the old site and recomputed in our UI — dropped here.
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
    key: 'technology-week',
    label: 'Technology Week Celebration',
    model: 'kvkTechnologyWeekCelebration',
    idField: 'techWeekId',
    naturalKey: ['kvkId', 'startDate', 'endDate', 'typeOfActivities', 'numberOfActivities'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const err = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match — same guard as other extension activities.
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

        // 2. Free-text activity + technology (REQUIRED string columns).
        const typeOfActivities = decodeEntities(cleanText(row.activity_type || ''));
        const relatedTechnology = decodeEntities(cleanText(row.related_crop_livestock || ''));
        if (!typeOfActivities) warn('typeOfActivities', 'No activity_type on old row');
        if (!relatedTechnology) warn('relatedTechnology', 'No related_crop_livestock on old row');

        // 3. Number of activities (REQUIRED).
        const numberOfActivities = intOrZero(row.no_of_activity);

        // 4. Dates (both REQUIRED) — dd-mm-yyyy; parseDate normalizes (UTC).
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end date "${row.end_date}"`);

        const data = {
            kvkId,
            startDate,
            endDate,
            typeOfActivities,
            numberOfActivities,
            relatedTechnology,
            // Farmer demographics — *_t totals/sub_total dropped (UI recomputes).
            farmersGeneralM: intOrZero(row.general_m),
            farmersGeneralF: intOrZero(row.general_f),
            farmersObcM: intOrZero(row.obc_m),
            farmersObcF: intOrZero(row.obc_f),
            farmersScM: intOrZero(row.sc_m),
            farmersScF: intOrZero(row.sc_f),
            farmersStM: intOrZero(row.st_m),
            farmersStF: intOrZero(row.st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Always insert — the old site holds genuine duplicate celebration rows
        // (same kvk, dates, activity, count) that are distinct records. No dedupe.
        await prisma.kvkTechnologyWeekCelebration.create({ data });
        return 'created';
    },
};
