const prisma = require('../../../config/prisma.js');

function applySoilFilters(where, filters = {}) {
    if (filters.year && !filters.startDate && !filters.endDate) {
        const y = Number(filters.year);
        if (Number.isFinite(y)) {
            where.year = y;
        }
    } else if (filters.startDate || filters.endDate) {
        const g = {};
        if (filters.startDate) {
            const d = new Date(filters.startDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(0, 0, 0, 0);
                g.gte = d;
            }
        }
        if (filters.endDate) {
            const d = new Date(filters.endDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                g.lte = d;
            }
        }
        if (Object.keys(g).length > 0) {
            where.reportingYearDate = g;
        }
    }
}

function parseSoilParameterId(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/** Map bucket key — always string so Map lookups match after JSON (number vs string) round-trips. */
function soilParameterIdToBucketKey(v) {
    const n = parseSoilParameterId(v);
    return n === null ? null : String(n);
}

function toSoilMetric(v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
}

function mapSoilRow(r) {
    return {
        soilDataInformationId: r.soilDataInformationId,
        soilParameterId: r.soilParameterId ?? null,
        seasonName: r.season?.seasonName || '',
        crop: r.crop || '',
        parameterName: r.soilParameterMaster?.parameterName || '',
        phBefore: toSoilMetric(r.phBefore),
        ecBefore: toSoilMetric(r.ecBefore),
        ocBefore: toSoilMetric(r.ocBefore),
        nBefore: toSoilMetric(r.nBefore),
        pBefore: toSoilMetric(r.pBefore),
        kBefore: toSoilMetric(r.kBefore),
        soilMicrobesBefore: toSoilMetric(r.soilMicrobesBefore),
        phAfter: toSoilMetric(r.phAfter),
        ecAfter: toSoilMetric(r.ecAfter),
        ocAfter: toSoilMetric(r.ocAfter),
        nAfter: toSoilMetric(r.nAfter),
        pAfter: toSoilMetric(r.pAfter),
        kAfter: toSoilMetric(r.kAfter),
        soilMicrobesAfter: toSoilMetric(r.soilMicrobesAfter),
    };
}

/**
 * One table per distinct Soil Parameter found in the data (by id, else by name).
 * Does not read the parameter master table — only what appears on soil rows.
 */
function inferSoilTablesFromRecords(records) {
    const list = Array.isArray(records) ? records : (records ? [records] : []);
    const byKey = new Map();
    const unassigned = [];

    for (const raw of list) {
        const r = normalizeSoilExportRow(raw);
        if (!r) continue;
        const pid = parseSoilParameterId(r.soilParameterId);
        const name = (r.parameterName || '').trim();
        let key;
        if (pid != null) {
            key = `id:${pid}`;
        } else if (name) {
            key = `name:${name.toLowerCase()}`;
        } else {
            unassigned.push(r);
            continue;
        }
        if (!byKey.has(key)) {
            byKey.set(key, {
                subtitle: name || (pid != null ? `Soil parameter #${pid}` : '—'),
                rows: [],
                _sortId: pid,
                _sortName: name.toLowerCase(),
            });
        }
        const entry = byKey.get(key);
        if (name && (!entry.subtitle || entry.subtitle.startsWith('Soil parameter #'))) {
            entry.subtitle = name;
        }
        entry.rows.push(r);
    }

    const tables = Array.from(byKey.values())
        .map(({ subtitle, rows, _sortId, _sortName }) => ({ subtitle, rows, _sortId, _sortName }))
        .sort((a, b) => {
            if (a._sortId != null && b._sortId != null) return a._sortId - b._sortId;
            if (a._sortId != null) return -1;
            if (b._sortId != null) return 1;
            return (a._sortName || '').localeCompare(b._sortName || '');
        })
        .map(({ subtitle, rows }) => ({ subtitle, rows }));

    return {
        tables,
        unassignedRows: unassigned.length > 0 ? unassigned : null,
    };
}

function isGroupedSoilPayload(d) {
    return Boolean(
        d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.tables),
    );
}

/**
 * Merge multiple { tables, unassignedRows } blocks (e.g. one per KVK from aggregated reports).
 */
function mergeSoilGroupedPayloads(parts) {
    if (!parts || !parts.length) {
        return { tables: [], unassignedRows: null };
    }
    const bySubtitle = new Map();
    const unassigned = [];
    for (const part of parts) {
        if (!part || !Array.isArray(part.tables)) continue;
        for (const t of part.tables) {
            const sub = t.subtitle || '';
            if (!bySubtitle.has(sub)) {
                bySubtitle.set(sub, { subtitle: sub, rows: [] });
            }
            bySubtitle.get(sub).rows.push(...(t.rows || []));
        }
        if (part.unassignedRows && part.unassignedRows.length) {
            unassigned.push(...part.unassignedRows);
        }
    }
    return {
        tables: Array.from(bySubtitle.values()),
        unassignedRows: unassigned.length > 0 ? unassigned : null,
    };
}

/**
 * Normalize what the report/export passes into the PDF template:
 * - unwrap getSectionData shape { sectionId, data: { tables, ... }, metadata }
 * - merge [ { tables, unassignedRows }, ... ] from aggregated custom-format aggregation
 * - otherwise infer from flat record array
 */
function resolveSoilTemplatePayload(data) {
    if (!data) return { tables: [], unassignedRows: null };
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data && isGroupedSoilPayload(d.data)) {
        d = d.data;
    }
    if (isGroupedSoilPayload(d)) {
        return d;
    }
    if (Array.isArray(d)) {
        if (d.length > 0 && d.every((x) => x && isGroupedSoilPayload(x))) {
            return mergeSoilGroupedPayloads(d);
        }
        return inferSoilTablesFromRecords(d);
    }
    return inferSoilTablesFromRecords([d]);
}

function normalizeSoilExportRow(r) {
    if (!r) return null;
    const rawPid = r.soilParameterId ?? r.soil_parameter_id ?? r.naturalFarmingSoilParameterId;
    return {
        soilDataInformationId: r.soilDataInformationId ?? r.id,
        soilParameterId: parseSoilParameterId(rawPid),
        seasonName: r.seasonName ?? (typeof r.season === 'string' ? r.season : r.season?.seasonName) ?? '',
        crop: r.crop ?? '',
        parameterName: r.parameterName ?? r.type ?? r.soilParameter ?? r.soilParameterMaster?.parameterName ?? '',
        phBefore: toSoilMetric(r.phBefore ?? r.beforePh),
        ecBefore: toSoilMetric(r.ecBefore ?? r.beforeEc),
        ocBefore: toSoilMetric(r.ocBefore ?? r.beforeOc),
        nBefore: toSoilMetric(r.nBefore ?? r.beforeN),
        pBefore: toSoilMetric(r.pBefore ?? r.beforeP),
        kBefore: toSoilMetric(r.kBefore ?? r.beforeK),
        soilMicrobesBefore: toSoilMetric(r.soilMicrobesBefore ?? r.beforeMicrobes),
        phAfter: toSoilMetric(r.phAfter ?? r.afterPh),
        ecAfter: toSoilMetric(r.ecAfter ?? r.afterEc),
        ocAfter: toSoilMetric(r.ocAfter ?? r.afterOc),
        nAfter: toSoilMetric(r.nAfter ?? r.afterN),
        pAfter: toSoilMetric(r.pAfter ?? r.afterP),
        kAfter: toSoilMetric(r.kAfter ?? r.afterK),
        soilMicrobesAfter: toSoilMetric(r.soilMicrobesAfter ?? r.afterMicrobes),
    };
}

/**
 * Split unassigned rows into one block per soil parameter type (uses parameterName like the master dropdown label).
 */
function groupUnassignedSoilRowsByParameterName(unassignedRows) {
    if (!unassignedRows || unassignedRows.length === 0) return [];
    const byKey = new Map();
    for (const r of unassignedRows) {
        const name = (r.parameterName || '').trim();
        const pid = parseSoilParameterId(r.soilParameterId);
        let key;
        let subtitle;
        if (name) {
            key = `name:${name.toLowerCase()}`;
            subtitle = name;
        } else if (pid != null) {
            key = `id:${pid}`;
            subtitle = `Soil parameter (master id #${pid})`;
        } else {
            key = '__none__';
            subtitle = 'Soil parameter not specified';
        }
        if (!byKey.has(key)) {
            byKey.set(key, { subtitle, rows: [] });
        }
        byKey.get(key).rows.push(r);
    }
    return Array.from(byKey.values()).sort((a, b) =>
        a.subtitle.localeCompare(b.subtitle, undefined, { sensitivity: 'base' }),
    );
}

/**
 * Grouped soil data for PDF/Excel: one table per Soil Parameter **present in soil data** (from row relation), plus unassigned.
 */
async function getNaturalFarmingSoilData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) {
        where.kvkId = kvkId;
    }
    applySoilFilters(where, filters);

    const rows = await prisma.soilDataInformation.findMany({
        where,
        include: {
            season: true,
            soilParameterMaster: true,
        },
        orderBy: [{ reportingYearDate: 'desc' }, { soilDataInformationId: 'desc' }],
    });

    if (rows.length === 0) {
        return { tables: [], unassignedRows: null };
    }

    const mapped = rows.map((r) => mapSoilRow(r));
    return inferSoilTablesFromRecords(mapped);
}

/**
 * Same shape normalization as the PDF template (unwrap section wrapper, merge aggregated payloads).
 */
async function prepareNfSoilExportPayload(rawData) {
    return resolveSoilTemplatePayload(rawData);
}

module.exports = {
    getNaturalFarmingSoilData,
    prepareNfSoilExportPayload,
    mapSoilRow,
    normalizeSoilExportRow,
    inferSoilTablesFromRecords,
    mergeSoilGroupedPayloads,
    resolveSoilTemplatePayload,
    groupUnassignedSoilRowsByParameterName,
};
