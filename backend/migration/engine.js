const prisma = require('../config/prisma.js');
const { parseCurl } = require('./curlParser.js');
const { MasterResolver } = require('./masterResolver.js');
const { getModule } = require('./registry.js');

/** Pull the record array out of a raw api response (DataTables `data`, or array). */
function extractRows(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    if (raw && raw.data && Array.isArray(raw.data.data)) return raw.data.data;
    return [];
}

/**
 * Replay a pasted curl command server-side (browser can't — cross-origin +
 * the old site's session cookie). Returns the parsed JSON body.
 */
async function fetchFromCurl(curl) {
    const req = parseCurl(curl);
    const res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body || undefined,
    });
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        throw new Error(
            `Old site did not return JSON (status ${res.status}). ` +
                `Likely an expired/stale session cookie — recopy the curl from a fresh browser tab. ` +
                `First 200 chars: ${text.slice(0, 200)}`,
        );
    }
    let rows = extractRows(json);

    // oft-data list JSON lacks technology options — enrich from each edit page.
    if (req.url.includes('oft-data') && rows.length) {
        const { enrichOftRows } = require('./modules/oft.js');
        rows = await enrichOftRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    // fld-data list JSON lacks full details — enrich from each edit page.
    if (req.url.includes('fld-data') && rows.length) {
        const { enrichFldRows } = require('./modules/fld.js');
        rows = await enrichFldRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    // cfld technical parameter list lacks detail fields — enrich from each edit page.
    if (req.url.includes('/project/cfld') && !req.url.includes('cfld-extension') && !req.url.includes('cfld-budget') && rows.length) {
        const { enrichCfldRows } = require('./modules/cfldTechnicalParameter.js');
        rows = await enrichCfldRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    // cfld extension activity list lacks demographic fields — enrich from each edit page.
    if (req.url.includes('cfld-extension-activity') && rows.length) {
        const { enrichCfldExtRows } = require('./modules/cfldExtensionActivity.js');
        rows = await enrichCfldExtRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    // training list carries a numeric staff/coordinator id — map it to a name via staff-data.
    if (req.url.includes('achievements-of-training') && rows.length) {
        const { enrichTrainingRows } = require('./modules/training.js');
        rows = await enrichTrainingRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    return { raw: json, rowCount: rows.length };
}

/**
 * Run a module's transform over every old row for the chosen target KVK.
 * Returns mapped records plus a per-row + aggregate validation report.
 */
async function transform(moduleKey, kvkId, raw) {
    const spec = getModule(moduleKey);
    const resolver = new MasterResolver();
    const targetKvk = await prisma.kvk.findUnique({
        where: { kvkId: Number(kvkId) },
        select: { kvkId: true, kvkName: true },
    });
    if (!targetKvk) {
        throw new Error(`Target KVK #${kvkId} not found in database`);
    }
    const ctx = {
        kvkId: targetKvk.kvkId,
        targetKvkName: targetKvk.kvkName,
        resolver,
    };
    const rows = extractRows(raw);

    const records = [];
    const rowReports = [];
    let errorCount = 0;
    let warnCount = 0;

    for (let index = 0; index < rows.length; index++) {
        try {
            const { data, issues } = await spec.transform(rows[index], ctx);
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
 * Insert-only seed: every mapped row is created as a new record. The old site
 * has genuine duplicate-looking rows that differ only in fields not covered by a
 * naturalKey, so matching/updating would collapse distinct records into one.
 * Never dedupe — always insert. Skips rows that failed to map (null).
 */
async function seed(moduleKey, kvkId, records) {
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
            // Specs that span multiple tables (e.g. vehicle -> parent + per-year
            // detail) provide their own seedRecord; it returns 'created'/'updated'.
            if (spec.seedRecord) {
                const action = await spec.seedRecord(prisma, data, { kvkId: Number(kvkId) });
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

async function listKvks() {
    return prisma.kvk.findMany({
        select: { kvkId: true, kvkName: true },
        orderBy: { kvkName: 'asc' },
    });
}

module.exports = { fetchFromCurl, transform, seed, listKvks, extractRows };
