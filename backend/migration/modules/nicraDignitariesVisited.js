const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, extractImgSrc } = require('../util.js');

/**
 * Module spec: NICRA Others — Dignitaries Visited. Source: atariams.org
 * `project/nicra/dignitaries-visited` (`nicra_dignitaries_visited` table).
 * Writes nicra_dignitaries_visited. Flat table, KVK + (nullable) dignitary-type FK.
 *
 * Old → new:
 *   date (yyyy-mm-dd)         → dateOfVisit (NOT NULL)
 *   type ("VIP"/"Expert")     → dignitaryTypeId (findOrCreate on the master; nullable)
 *   name                      → name
 *   remark                    → remark (NOT NULL; '' when absent)
 *   images                    → photographs (nullable)
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
    key: 'nicra-dignitaries-visited',
    label: 'NICRA Dignitaries Visited',
    model: 'nicraDignitariesVisited',
    idField: 'nicraDignitariesVisitedId',
    naturalKey: ['kvkId', 'dateOfVisit', 'name'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        dignitaryTypeId: { master: 'nicraDignitaryType' },
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

        // 2. Date of visit (REQUIRED).
        const dateIso = parseDate(row.date);
        const dateOfVisit = dateIso ? new Date(dateIso) : null;
        if (!dateOfVisit) err('dateOfVisit', `Missing/invalid date "${row.date}"`);

        // 3. type → dignitary-type master (nullable). findOrCreate keeps any value
        // the seed master doesn't already cover.
        let dignitaryTypeId = null;
        const typeRaw = decodeEntities(cleanText(row.type));
        if (typeRaw) {
            const hit = await r.findOrCreate('nicraDignitaryTypeMaster', 'name', 'nicraDignitaryTypeId', typeRaw);
            dignitaryTypeId = hit.id;
            if (hit.created) warn('dignitaryTypeId', `Created new dignitary-type master "${typeRaw}"`);
        } else {
            warn('dignitaryTypeId', 'No type on old row — left null');
        }

        const data = {
            kvkId,
            dateOfVisit,
            dignitaryTypeId,
            name: decodeEntities(cleanText(row.name)) || '',
            remark: decodeEntities(cleanText(row.remark)) || '',
            photographs: extractImgSrc(row.images),
        };

        return { data, issues };
    },
};
