const prisma = require('../config/prisma.js');
const { MasterResolver, normalize } = require('./masterResolver.js');
const { getModule } = require('./registry.js');
const { extractRows } = require('./engine.js');
const { decodeEntities, cleanText, parseYearMonth } = require('./util.js');

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

function intOrZero(value) {
    const n = parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function floatOrZero(value) {
    const n = parseFloat(String(value ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}

function stripTrailingEllipsis(value) {
    return String(value || '').replace(/(?:\.{3,}|…)+\s*$/u, '').trim();
}

function isTruncatedText(value) {
    return /(?:\.{3,}|…)\s*$/u.test(String(value || '').trim());
}

function sameNormalizedText(a, b) {
    return normalize(cleanText(a)) === normalize(cleanText(b));
}

function sourceProblemLooksComplete(sourceProblem, rowProblem) {
    if (!sourceProblem) return false;
    if (isTruncatedText(sourceProblem)) return false;
    const sourceBase = normalize(sourceProblem);
    const rowBase = normalize(stripTrailingEllipsis(rowProblem));
    return !rowBase || sourceBase.length >= rowBase.length;
}

function shouldUpdateProblem(existingProblem, sourceProblem) {
    if (!sourceProblem) return false;
    if (isTruncatedText(existingProblem)) return true;
    if (sameNormalizedText(existingProblem, sourceProblem)) return false;

    const existingBase = normalize(stripTrailingEllipsis(existingProblem));
    const sourceBase = normalize(sourceProblem);
    return Boolean(existingBase && sourceBase.startsWith(existingBase) && sourceBase.length > existingBase.length);
}

async function findExistingOftForProblemUpdate(source) {
    const sameDateRows = await prisma.kvkoft.findMany({
        where: {
            kvkId: source.kvkId,
            oftStartDate: source.oftStartDate,
        },
        select: {
            kvkOftId: true,
            title: true,
            problemDiagnosed: true,
            sourceOfTechnology: true,
            productionSystem: true,
            criticalInput: true,
            quantity: true,
            numberOfTrialReplication: true,
            costOfOft: true,
        },
    });

    const exactTitleRows = sameDateRows.filter(row => sameNormalizedText(row.title, source.title));
    if (exactTitleRows.length === 1) return { matches: exactTitleRows, reason: 'exact-title-date' };
    if (exactTitleRows.length > 1) {
        return { matches: exactTitleRows, reason: `multi-match ${exactTitleRows.length} rows with same KVK, title and start date` };
    }

    const sourceTitlePrefix = normalize(stripTrailingEllipsis(source.rawTitle));
    const prefixRows = sourceTitlePrefix
        ? sameDateRows.filter(row => normalize(row.title).startsWith(sourceTitlePrefix))
        : [];
    if (prefixRows.length === 1) return { matches: prefixRows, reason: 'truncated-title-prefix-date' };
    if (prefixRows.length > 1) {
        return { matches: [], reason: `ambiguous ${prefixRows.length} rows with same KVK, title prefix and start date` };
    }

    return { matches: [], reason: 'no row matched by KVK, title and start date' };
}

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
        try {
            rows = await enricher(rows, headers);
        } catch {
            // Enrichment is best-effort: per-row fetches already degrade to a
            // warning, but if the whole enrich step throws (e.g. the old site
            // drops the connection) keep the un-enriched rows so the transform
            // still completes instead of failing the request.
        }
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

async function listOftProblemDiagnosedIssues() {
    const rows = await prisma.kvkoft.findMany({
        where: {
            OR: [
                { problemDiagnosed: { endsWith: '...' } },
                { problemDiagnosed: { endsWith: '....' } },
                { problemDiagnosed: { endsWith: '…' } },
            ],
        },
        select: {
            kvkOftId: true,
            kvkId: true,
            title: true,
            problemDiagnosed: true,
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ kvkId: 'asc' }, { kvkOftId: 'asc' }],
    });

    const byKvkMap = new Map();
    for (const row of rows) {
        const current = byKvkMap.get(row.kvkId) || {
            kvkId: row.kvkId,
            kvkName: row.kvk?.kvkName || `KVK #${row.kvkId}`,
            count: 0,
        };
        current.count++;
        byKvkMap.set(row.kvkId, current);
    }

    return {
        total: rows.length,
        byKvk: [...byKvkMap.values()].sort((a, b) => a.kvkName.localeCompare(b.kvkName)),
        sample: rows.slice(0, 50).map(row => ({
            kvkOftId: row.kvkOftId,
            kvkId: row.kvkId,
            kvkName: row.kvk?.kvkName || `KVK #${row.kvkId}`,
            title: row.title,
            problemDiagnosed: row.problemDiagnosed,
        })),
    };
}

/**
 * Update-only repair for already-seeded OFT rows whose problem_diagnosed came
 * from truncated list JSON. This does not run the normal module transform or
 * seed path, so it cannot create masters or insert OFTs.
 */
async function superUpdateExisting(moduleKey, raw, headers, opts = {}) {
    if (moduleKey !== 'oft') {
        throw new Error('update-existing currently supports only the oft module');
    }

    const resolver = new MasterResolver();
    let rows = extractRows(raw);
    if (headers && rows.length) {
        rows = await require('./modules/oft.js').enrichOftRows(rows, headers);
    }

    const result = {
        total: rows.length,
        updated: 0,
        unchanged: 0,
        skipped: 0,
        failed: [],
        actions: [],
        rows: [],
    };

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const sourceIndex = Number.isInteger(Number(row?._sourceIndex)) ? Number(row._sourceIndex) : index;
        try {
            const oldKvkName = rowKvkName(row);
            if (!oldKvkName) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({ index, sourceIndex, action: 'skipped', reason: 'No KVK name on old row' });
                continue;
            }

            const hit = await resolver.resolve('kvk', 'kvkName', 'kvkId', oldKvkName);
            if (!hit.matched) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({ index, sourceIndex, action: 'skipped', kvkName: oldKvkName, reason: `KVK "${oldKvkName}" not found in our DB` });
                continue;
            }

            const oftStartDate = parseYearMonth(row.oft_start_date);
            if (!oftStartDate) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({ index, sourceIndex, action: 'skipped', kvkName: oldKvkName, reason: `Missing or invalid oft_start_date "${row.oft_start_date}"` });
                continue;
            }

            const sourceProblem = decodeEntities(cleanText(row.problem_diagnosed)) || '';
            if (!sourceProblemLooksComplete(sourceProblem, row.problem_diagnosed)) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({ index, sourceIndex, action: 'skipped', kvkName: oldKvkName, after: sourceProblem, reason: 'Source problem_diagnosed is still empty or truncated' });
                continue;
            }

            const source = {
                kvkId: hit.id,
                title: decodeEntities(cleanText(row.title_fram_trail)) || '',
                rawTitle: decodeEntities(cleanText(row.title_fram_trail)) || '',
                problemDiagnosed: sourceProblem,
                sourceOfTechnology: cleanText(row.source_of_technology) || '',
                productionSystem: cleanText(row.production_system) || '',
                criticalInput: cleanText(row.critical_input) || '',
                quantity: floatOrZero(row.area),
                numberOfTrialReplication: intOrZero(row.no_of_trial),
                costOfOft: floatOrZero(row.cost_of_oft),
                oftStartDate,
            };

            if (!source.title) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({ index, sourceIndex, action: 'skipped', kvkName: oldKvkName, after: source.problemDiagnosed, reason: 'Missing title_fram_trail' });
                continue;
            }

            const { matches, reason } = await findExistingOftForProblemUpdate(source);
            if (!matches.length) {
                result.skipped++;
                result.actions.push('skipped');
                result.rows.push({
                    index,
                    sourceIndex,
                    action: 'skipped',
                    kvkName: oldKvkName,
                    title: source.title,
                    after: source.problemDiagnosed,
                    reason,
                });
                continue;
            }

            for (const match of matches) {
                if (!opts.force && !shouldUpdateProblem(match.problemDiagnosed, source.problemDiagnosed)) {
                    result.unchanged++;
                    result.actions.push('unchanged');
                    result.rows.push({
                        index,
                        sourceIndex,
                        action: 'unchanged',
                        kvkOftId: match.kvkOftId,
                        kvkName: oldKvkName,
                        title: source.title,
                        before: match.problemDiagnosed,
                        after: source.problemDiagnosed,
                        reason: 'Existing problem_diagnosed is not truncated or already matches source',
                    });
                    continue;
                }

                if (!opts.dryRun) {
                    await prisma.kvkoft.update({
                        where: { kvkOftId: match.kvkOftId },
                        data: { problemDiagnosed: source.problemDiagnosed },
                    });
                }

                result.updated++;
                result.actions.push('updated');
                result.rows.push({
                    index,
                    sourceIndex,
                    action: 'updated',
                    kvkOftId: match.kvkOftId,
                    kvkName: oldKvkName,
                    title: source.title,
                    reason,
                    before: match.problemDiagnosed,
                    after: source.problemDiagnosed,
                });
            }
        } catch (err) {
            result.failed.push({ index, message: err.message });
            result.actions.push('failed');
            result.rows.push({
                index,
                sourceIndex,
                action: 'failed',
                reason: err.message,
            });
        }
    }

    return result;
}

module.exports = { superTransform, superSeed, superUpdateExisting, listOftProblemDiagnosedIssues };
