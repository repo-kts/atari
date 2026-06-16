const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Important Day Celebration (Achievements). Source:
 * atariams.org `celebration-days`. Writes kvk_important_day_celebration.
 *
 * Every field lives on the DataTables list row (nested kvk/event objects) — no
 * per-row edit-page fetch. The day FK points at the ImportantDay master
 * (important_day, dayName @unique). The old `event.name` is a finite controlled
 * list mirrored by that master, so unmatched names are findOrCreate'd into it
 * (matching the form's create path) rather than parked. There is no staff column
 * on this model — old `staff` is ignored. The old `date` is YYYY-MM-DD.
 *
 * Demographics: old `farmer_*` → farmers_*, old `extension_*` → officials_*
 * (Gen/OBC/SC/ST × M,F). The *_t totals + total_* are derived on the old site
 * and recomputed in our UI — dropped here.
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
    key: 'celebration-day',
    label: 'Important Day Celebration',
    model: 'kvkImportantDayCelebration',
    idField: 'celebrationId',
    naturalKey: ['kvkId', 'eventDate', 'importantDayId', 'numberOfActivities'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        importantDayId: { master: 'importantDay' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const err = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match — same guard as the other extension-activity modules.
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

        // 2. Important day ← event.name → ImportantDay master (REQUIRED, non-null FK).
        // Resolve; if unmatched, create the master row (mirrors form create path).
        let importantDayId = null;
        const eventObj = asObject(row.event);
        const eventName = decodeEntities(cleanText(eventObj?.name || row['event.name'] || ''));
        if (eventName) {
            const hit = await r.findOrCreate('importantDay', 'dayName', 'importantDayId', eventName);
            importantDayId = hit.id;
            if (hit.created) warn('importantDayId', `Day "${eventName}" not in master — created`);
        } else {
            err('importantDayId', 'No event name on old row — required');
        }

        // 3. Number of activities (REQUIRED).
        const numberOfActivities = intOrZero(row.no_of_activity);

        // 4. Event date (REQUIRED) — old `date` is YYYY-MM-DD; parseDate normalizes (UTC).
        const dateIso = parseDate(row.date);
        const eventDate = dateIso ? new Date(dateIso) : null;
        if (!eventDate) err('eventDate', `Missing/invalid date "${row.date}"`);

        const data = {
            kvkId,
            importantDayId,
            importantDayOther: null,
            eventDate,
            numberOfActivities,
            // Farmers ← old farmer_* (*_t totals dropped, UI recomputes).
            farmersGeneralM: intOrZero(row.farmer_general_m),
            farmersGeneralF: intOrZero(row.farmer_general_f),
            farmersObcM: intOrZero(row.farmer_obc_m),
            farmersObcF: intOrZero(row.farmer_obc_f),
            farmersScM: intOrZero(row.farmer_sc_m),
            farmersScF: intOrZero(row.farmer_sc_f),
            farmersStM: intOrZero(row.farmer_st_m),
            farmersStF: intOrZero(row.farmer_st_f),
            // Officials ← old extension_*.
            officialsGeneralM: intOrZero(row.extension_general_m),
            officialsGeneralF: intOrZero(row.extension_general_f),
            officialsObcM: intOrZero(row.extension_obc_m),
            officialsObcF: intOrZero(row.extension_obc_f),
            officialsScM: intOrZero(row.extension_sc_m),
            officialsScF: intOrZero(row.extension_sc_f),
            officialsStM: intOrZero(row.extension_st_m),
            officialsStF: intOrZero(row.extension_st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Always insert — the old site holds genuine duplicate celebration rows
        // (same kvk, day, date, count) that are distinct records. No dedupe.
        await prisma.kvkImportantDayCelebration.create({ data });
        return 'created';
    },
};
