const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Any other programme organized by KVK (not covered elsewhere).
 * Source: atariams.org `project/other-program` (`kvk_other_programme` table).
 * Flat table, KVK only FK. No reporting_year column on the new model — the old
 * reporting_year query param only filters the source list.
 *
 * The old list carries only a single `total` participant count; the new model
 * stores a caste/gender breakdown (all NOT-NULL Int). The breakdown isn't on the
 * list — default each to 0 so the row seeds.
 *
 * Old → new:
 *   kvk.kvk_name → kvkId (match against selected KVK)
 *   name         → programmeName
 *   date         → programmeDate (REQUIRED)
 *   venue        → venue
 *   purpose      → purpose
 */

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

module.exports = {
    key: 'other-programme',
    label: 'Other KVK Programme',
    model: 'kvkOtherProgramme',
    idField: 'kvkOtherProgrammeId',
    naturalKey: ['kvkId', 'programmeName', 'programmeDate'],

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

        // 2. programmeDate (REQUIRED — no default).
        const dateIso = parseDate(row.date);
        if (!dateIso) err('programmeDate', `Missing/invalid date "${row.date}"`);

        // Caste/gender breakdown not on the old list — defaulted (total "${row.total}" not stored).
        warn('*', `Old list has only a single total ("${row.total ?? ''}") — caste/gender breakdown defaulted to 0`);

        const data = {
            kvkId: ctx.kvkId,
            programmeName: decodeEntities(cleanText(row.name)) || '',
            programmeDate: dateIso ? new Date(dateIso) : null,
            venue: decodeEntities(cleanText(row.venue)) || '',
            purpose: decodeEntities(cleanText(row.purpose)) || '',
            farmersGeneralM: 0,
            farmersGeneralF: 0,
            farmersObcM: 0,
            farmersObcF: 0,
            farmersScM: 0,
            farmersScF: 0,
            farmersStM: 0,
            farmersStF: 0,
        };

        return { data, issues };
    },
};
