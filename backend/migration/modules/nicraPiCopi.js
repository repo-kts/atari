const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Others — PI & Co-PI. Source: atariams.org
 * `project/nicra/investigator` (`nicra_pi_copi` table). Writes nicra_pi_copi.
 * Flat table, KVK + (nullable) PI-type FK.
 *
 * Old → new:
 *   start_date/end_date (dd-mm-yyyy) → startDate / endDate (both NOT NULL)
 *   type ("PI"/"CO PI")              → piTypeId (findOrCreate on the master; nullable)
 *   name                             → name
 * Old reporting_year, images have no new column → dropped.
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
    key: 'nicra-pi-copi',
    label: 'NICRA PI & Co-PI',
    model: 'nicraPiCopi',
    idField: 'nicraPiCopiId',
    naturalKey: ['kvkId', 'startDate', 'name'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        piTypeId: { master: 'nicraPiType' },
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

        // 2. Dates (both REQUIRED). Old format is dd-mm-yyyy.
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start_date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end_date "${row.end_date}"`);

        // 3. type → PI-type master (nullable). findOrCreate keeps any value the
        // seed master doesn't already cover.
        let piTypeId = null;
        const typeRaw = decodeEntities(cleanText(row.type));
        if (typeRaw) {
            const hit = await r.findOrCreate('nicraPiTypeMaster', 'name', 'nicraPiTypeId', typeRaw);
            piTypeId = hit.id;
            if (hit.created) warn('piTypeId', `Created new PI-type master "${typeRaw}"`);
        } else {
            warn('piTypeId', 'No type on old row — left null');
        }

        const data = {
            kvkId,
            startDate,
            endDate,
            piTypeId,
            name: decodeEntities(cleanText(row.name)) || '',
        };

        return { data, issues };
    },
};
