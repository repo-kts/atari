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

/**
 * Pull the old-site KVK name out of a row, decoded the same way the specs do.
 * The KVK object lives under different keys per endpoint — `kvk`, `kvks`
 * (infra/equipment), or nested under a parent relation (`equipment.kvks`,
 * `agri_drone.kvk`). Rather than hard-code every variant, search the row (and
 * its nested objects, depth-bounded) for any `kvk_name`, plus any flat dotted
 * key ending in `.kvk_name`. One row only ever carries its own KVK, so the
 * first match is the right one.
 */
function findKvkName(obj, depth = 0) {
    const o = asObject(obj);
    if (!o || depth > 2) return '';
    if (typeof o.kvk_name === 'string' && o.kvk_name.trim()) return o.kvk_name;
    for (const key of Object.keys(o)) {
        // flat dotted key, e.g. 'equipment.kvks.kvk_name'
        if (key.endsWith('.kvk_name') && typeof o[key] === 'string' && o[key].trim()) {
            return o[key];
        }
        const child = asObject(o[key]);
        if (child) {
            const found = findKvkName(child, depth + 1);
            if (found) return found;
        }
    }
    return '';
}

function rowKvkName(row) {
    return decodeEntities(cleanText(findKvkName(row))) || '';
}

// Module key -> transform-time row enricher (edit-page fetches), for modules
// whose list JSON omits detail fields. Mirrors the fetch-time enrichers, but
// runs over the selected-KVK batch only. Keep in sync with the defer*Enrich
// flags passed by superRoutes /fetch.
const ENRICHERS = {
    oft: (rows, headers) => require('./modules/oft.js').enrichOftRows(rows, headers),
    fld: (rows, headers) => require('./modules/fld.js').enrichFldRows(rows, headers),
};

/**
 * Transform every old row, resolving each row's KVK independently. Rows whose
 * KVK name is missing or not present in our DB are reported as errors and
 * skipped (null), exactly like an unmapped row.
 */
async function superTransform(moduleKey, raw, headers) {
    const spec = getModule(moduleKey);
    const resolver = new MasterResolver();
    let rows = extractRows(raw);

    // Some modules' full detail lives only on each row's edit page, not the list
    // JSON. Fetch defers that enrichment (see engine.fetchFromCurl defer*Enrich)
    // so we do it HERE — over just the rows in this transform batch, which are
    // already filtered to the user's selected KVKs. Needs the old-site session
    // headers, passed through from the pasted curl.
    const enricher = ENRICHERS[moduleKey];
    if (enricher && headers && rows.length) {
        rows = await enricher(rows, headers);
    }

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
