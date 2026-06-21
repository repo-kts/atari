const prisma = require('../config/prisma.js');
const { MasterResolver, normalize } = require('./masterResolver.js');
const { getModule } = require('./registry.js');
const { extractRows } = require('./engine.js');
const { decodeEntities, cleanText } = require('./util.js');

/**
 * Super-migration engine. Same pipeline as engine.js, but the target KVK is NOT
 * chosen up front — a superadmin curl (kvk_id empty) returns rows spanning every
 * KVK, each row carrying its own `kvk.kvk_name`. For each row we resolve that
 * name to OUR kvkId and run the module spec with a per-row context, so one paste
 * fans out across many KVKs. The module specs are reused unchanged: we set
 * ctx.targetKvkName to the row's own name so their internal KVK guard passes.
 */

/** A raw `kvk` cell may be a nested object, a JSON string, or a flat dotted key. */
function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
    return null;
}

/** Pull the old-site KVK name out of a row, decoded the same way the specs do. */
function rowKvkName(row) {
    const kvkObj = asObject(row.kvk);
    return decodeEntities(cleanText(kvkObj?.kvk_name || row['kvk.kvk_name'])) || '';
}

/**
 * Transform every old row, resolving each row's KVK independently. Rows whose
 * KVK name is missing or not present in our DB are reported as errors and
 * skipped (null), exactly like an unmapped row.
 */
async function superTransform(moduleKey, raw) {
    const spec = getModule(moduleKey);
    const resolver = new MasterResolver();
    const rows = extractRows(raw);

    const records = [];
    const rowReports = [];
    let errorCount = 0;
    let warnCount = 0;

    for (let index = 0; index < rows.length; index++) {
        try {
            const row = rows[index];
            const oldKvkName = rowKvkName(row);
            if (!oldKvkName) {
                errorCount++;
                records.push(null);
                rowReports.push({
                    index,
                    issues: [{ field: 'kvkId', message: 'No KVK name on old row — cannot resolve target KVK', severity: 'error' }],
                });
                continue;
            }
            const hit = await resolver.resolve('kvk', 'kvkName', 'kvkId', oldKvkName);
            if (!hit.matched) {
                errorCount++;
                records.push(null);
                rowReports.push({
                    index,
                    issues: [{ field: 'kvkId', message: `KVK "${oldKvkName}" not found in our DB — skipped`, severity: 'error' }],
                });
                continue;
            }

            const ctx = { kvkId: hit.id, targetKvkName: oldKvkName, resolver };
            const { data, issues } = await spec.transform(row, ctx);
            records.push(data);
            for (const it of issues) {
                if (it.severity === 'error') errorCount++;
                else warnCount++;
            }
            if (issues.length) rowReports.push({ index, issues });
        } catch (err) {
            errorCount++;
            records.push(null);
            rowReports.push({
                index,
                issues: [{ field: '*', message: err.message, severity: 'error' }],
            });
        }
    }

    return {
        records,
        report: {
            total: rows.length,
            mapped: records.filter(Boolean).length,
            errorCount,
            warnCount,
            seedable: errorCount === 0,
            rows: rowReports,
        },
    };
}

/**
 * Insert-only seed. Identical to engine.seed but the kvkId for each record comes
 * from the record itself (data.kvkId, set during transform), since rows span
 * multiple KVKs. Skips rows that failed to map (null).
 */
async function superSeed(moduleKey, records) {
    const spec = getModule(moduleKey);
    const model = prisma[spec.model];
    const result = { created: 0, updated: 0, skipped: 0, failed: [], actions: [] };

    for (let index = 0; index < records.length; index++) {
        const data = records[index];
        if (!data) {
            result.skipped++;
            result.actions.push('skipped');
            continue;
        }
        try {
            if (spec.seedRecord) {
                const action = await spec.seedRecord(prisma, data, { kvkId: Number(data.kvkId) });
                const resolved = action === 'updated' ? 'updated' : 'created';
                result[resolved]++;
                result.actions.push(resolved);
                continue;
            }
            await model.create({ data });
            result.created++;
            result.actions.push('created');
        } catch (err) {
            result.failed.push({ index, message: err.message });
            result.actions.push('failed');
        }
    }
    return result;
}

module.exports = { superTransform, superSeed };
