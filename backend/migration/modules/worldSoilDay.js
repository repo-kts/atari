const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK World Soil Day Celebration (Achievements). Source:
 * atariams.org `soil-water-testing/celebration-details`. Writes
 * kvk_world_soil_celebration (model KkvWorldSoilCelebration).
 *
 * Every field lives on the DataTables list row (nested kvk object, flat
 * demographics) — no per-row edit-page fetch. There is no master FK beyond kvk.
 *
 * Old → new: no_of_activity → activitiesConducted, health_card →
 * soilHealthCardDistributed, vip_name → vipNames (free string), participants →
 * participants. The old `total_vip` is a count derived from the VIP-name list and
 * has no column here — dropped (the form/report recompute it).
 *
 * Demographics are the flat list columns (general_m … st_f). The old `_t` totals
 * (general_t, total_*) are derived on the old site and recomputed in our UI —
 * dropped here.
 *
 * reporting_year is nullable; the old row carries it as a bare year int (e.g.
 * 2025) → parseDate turns it into Jan 1 of that year (UTC), which lands inside
 * the calendar-year report filter.
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
    key: 'worldSoilDay',
    label: 'World Soil Day Celebration',
    model: 'kkvWorldSoilCelebration',
    idField: 'worldSoilCelebrationId',
    naturalKey: ['kvkId', 'activitiesConducted', 'soilHealthCardDistributed', 'participants'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });

        // ── KVK ───────────────────────────────────────────────────────────
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

        // ── Counts (REQUIRED ints) ─────────────────────────────────────────
        const activitiesConducted = intOrZero(row.no_of_activity);
        const soilHealthCardDistributed = intOrZero(row.health_card);
        const participants = intOrZero(row.participants);

        // ── VIP names (REQUIRED string) — old `total_vip` count is dropped ──
        const vipNames = decodeEntities(cleanText(row.vip_name || '')) || '';

        // ── Reporting year (nullable) — old bare year int → Jan 1 (UTC) ────
        const reportingYear = row.reporting_year != null
            ? (() => { const iso = parseDate(String(row.reporting_year)); return iso ? new Date(iso) : null; })()
            : null;

        const data = {
            kvkId,
            activitiesConducted,
            soilHealthCardDistributed,
            vipNames,
            participants,
            reportingYear,
            // Demographics ← flat list columns (*_t totals dropped, UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // Always insert — the old site holds genuine duplicate celebration rows
        // (same kvk, counts) that are distinct records. No dedupe.
        await prisma.kkvWorldSoilCelebration.create({ data });
        return 'created';
    },
};
