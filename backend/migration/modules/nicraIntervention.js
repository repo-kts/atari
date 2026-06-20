const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NICRA Others — Intervention. Source: atariams.org
 * `project/nicra/intervention` (`nicra_intervention` table). Writes
 * nicra_intervention. Flat table, KVK + (nullable) seed-bank/fodder-bank FK.
 *
 * Old → new:
 *   start_date/end_date (dd-mm-yyyy) → startDate / endDate (both NOT NULL)
 *   type ("Seed bank"/"Fodder bank") → seedBankFodderBankId (findOrCreate on the
 *                                      2-row master; nullable)
 *   crop    → crop        variety → variety
 *   quantity → quantityQ
 * Old reporting_year, images have no new column → dropped.
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
    key: 'nicra-intervention',
    label: 'NICRA Intervention',
    model: 'nicraIntervention',
    idField: 'nicraInterventionId',
    naturalKey: ['kvkId', 'startDate', 'crop', 'variety'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seedBankFodderBankId: { master: 'nicraSeedBankFodderBank' },
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

        // 3. type → seed-bank/fodder-bank master (nullable). findOrCreate keeps any
        // value the 2-row seed master doesn't already cover.
        let seedBankFodderBankId = null;
        const typeRaw = decodeEntities(cleanText(row.type));
        if (typeRaw) {
            const hit = await r.findOrCreate('nicraSeedBankFodderBankMaster', 'name', 'nicraSeedBankFodderBankId', typeRaw);
            seedBankFodderBankId = hit.id;
            if (hit.created) warn('seedBankFodderBankId', `Created new seed/fodder-bank master "${typeRaw}"`);
        } else {
            warn('seedBankFodderBankId', 'No type on old row — left null');
        }

        const data = {
            kvkId,
            startDate,
            endDate,
            seedBankFodderBankId,
            crop: decodeEntities(cleanText(row.crop)) || '',
            variety: decodeEntities(cleanText(row.variety)) || '',
            quantityQ: floatOrZero(row.quantity),
        };

        return { data, issues };
    },
};
