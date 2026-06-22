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
 * Per-row edit-page enrichment is fine for a single-KVK pull (tens of rows) but
 * a superadmin all-KVK pull is hundreds/thousands of rows × multiple slow PHP
 * fetches each — that overruns the serverless wall-clock and the whole fetch
 * fails ("Failed to fetch"). Cap enrichment by a wall-clock budget: if it wins
 * the race we use the enriched rows; if it overruns we fall back to the raw
 * list rows. The specs already degrade gracefully on a missing edit page
 * (inline list fields + a warning), so callers still get usable data instead of
 * a hard failure. Budget is env-tunable (MIGRATION_ENRICH_BUDGET_MS).
 */
const ENRICH_BUDGET_MS = Number(process.env.MIGRATION_ENRICH_BUDGET_MS) || 45000;

async function enrichWithinBudget(rawRows, enrichFn, headers) {
    let timer;
    const budget = new Promise(resolve => {
        timer = setTimeout(() => resolve({ rows: rawRows, truncated: true }), ENRICH_BUDGET_MS);
    });
    // Resolve (never reject) so a late failure after the budget fires can't
    // surface as an unhandled rejection; an enrich error degrades to the raw
    // list rows (specs fall back to inline fields) instead of failing the fetch.
    const work = Promise.resolve()
        .then(() => enrichFn(rawRows, headers))
        .then(rows => ({ rows, truncated: false }))
        .catch(() => ({ rows: rawRows, truncated: true }));
    const out = await Promise.race([work, budget]);
    clearTimeout(timer);
    return out;
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
    let enrichTruncated = false;

    // oft-data list JSON lacks technology options — enrich from each edit page.
    if (req.url.includes('oft-data') && rows.length) {
        const { enrichOftRows } = require('./modules/oft.js');
        const out = await enrichWithinBudget(rows, enrichOftRows, req.headers);
        rows = out.rows;
        enrichTruncated = enrichTruncated || out.truncated;
        if (Array.isArray(json.data)) json.data = rows;
    }

    // fld-data list JSON lacks full details — enrich from each edit page.
    if (req.url.includes('fld-data') && rows.length) {
        const { enrichFldRows } = require('./modules/fld.js');
        const out = await enrichWithinBudget(rows, enrichFldRows, req.headers);
        rows = out.rows;
        enrichTruncated = enrichTruncated || out.truncated;
        if (Array.isArray(json.data)) json.data = rows;
    }

    // cfld technical parameter list: enrich from each edit page ONLY when the
    // list JSON is the thin variant. The current `/project/cfld` response already
    // embeds every detail field inline (existing_yield, total_produce, …) — for
    // those, per-row edit-page fetches are redundant and (over hundreds of rows
    // on a superadmin pull) blow the serverless time limit → "Failed to fetch".
    if (req.url.includes('/project/cfld') && !req.url.includes('cfld-extension') && !req.url.includes('cfld-budget') && rows.length) {
        const sample = rows[0] || {};
        const hasInlineDetail =
            sample.existing_yield !== undefined ||
            sample.total_produce !== undefined ||
            sample.variety_name !== undefined;
        if (!hasInlineDetail) {
            const { enrichCfldRows } = require('./modules/cfldTechnicalParameter.js');
            const out = await enrichWithinBudget(rows, enrichCfldRows, req.headers);
            rows = out.rows;
            enrichTruncated = enrichTruncated || out.truncated;
            if (Array.isArray(json.data)) json.data = rows;
        }
    }

    // cfld extension activity list lacks demographic fields — enrich from each edit page.
    if (req.url.includes('cfld-extension-activity') && rows.length) {
        const { enrichCfldExtRows } = require('./modules/cfldExtensionActivity.js');
        const out = await enrichWithinBudget(rows, enrichCfldExtRows, req.headers);
        rows = out.rows;
        enrichTruncated = enrichTruncated || out.truncated;
        if (Array.isArray(json.data)) json.data = rows;
    }

    // training list carries a numeric staff/coordinator id — map it to a name via staff-data.
    if (req.url.includes('achievements-of-training') && rows.length) {
        const { enrichTrainingRows } = require('./modules/training.js');
        rows = await enrichTrainingRows(rows, req.headers);
        if (Array.isArray(json.data)) json.data = rows;
    }

    return { raw: json, rowCount: rows.length, enrichTruncated };
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
