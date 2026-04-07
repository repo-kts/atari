/**
 * "Other Extension / content mobilization" — `KvkOtherExtensionActivity`.
 * Page export: 2 columns. Modular: nature × state matrix + Total.
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function inferYearLabel(records) {
    for (const r of records) {
        if (!r.startDate) continue;
        const d = new Date(r.startDate);
        if (Number.isNaN(d.getTime())) continue;
        const month = d.getMonth() + 1;
        const startYear = month >= 4 ? d.getFullYear() : d.getFullYear() - 1;
        return String(startYear);
    }
    return String(new Date().getFullYear());
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        ? String(r.kvk.state.stateName).trim()
        : 'Unknown';
    const natureName = (r.otherExtensionActivity && r.otherExtensionActivity.otherExtensionName)
        ? String(r.otherExtensionActivity.otherExtensionName).trim()
        : 'Not specified';
    return {
        otherExtensionActivityId: r.otherExtensionActivityId,
        kvkId: r.kvkId,
        stateName,
        natureName,
        numberOfActivities: r.numberOfActivities,
        startDate: r.startDate,
    };
}

function normalizeFlexibleRow(r) {
    if (r.kvk && (r.kvk.state || r.otherExtensionActivity)) {
        return normalizePrismaRow(r);
    }
    const natureRaw = r.natureName ?? r.extensionActivityType ?? r.natureOfExtensionActivity ?? '';
    const natureName = String(natureRaw).trim() || 'Not specified';
    return {
        otherExtensionActivityId: r.otherExtensionActivityId ?? r.id,
        kvkId: r.kvkId,
        stateName: r.stateName ? String(r.stateName).trim() : '—',
        natureName,
        numberOfActivities: r.numberOfActivities ?? r.noOfActivities ?? r.activityCount ?? 0,
        startDate: r.startDate,
    };
}

async function fetchMasterActivityNames() {
    const rows = await prisma.otherExtensionActivity.findMany({
        select: { otherExtensionName: true },
        orderBy: { otherExtensionName: 'asc' },
    });
    return rows.map((x) => String(x.otherExtensionName).trim()).filter(Boolean);
}

function buildPagePayloadFromRecords(records) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);
    const byNature = new Map();
    for (const r of norm) {
        const k = r.natureName || 'Not specified';
        byNature.set(k, (byNature.get(k) || 0) + safeInt(r.numberOfActivities));
    }
    const rows = [...byNature.keys()].sort(sortStr).map((label) => ({
        label,
        numActivities: byNature.get(label),
    }));
    const grandTotal = rows.reduce((s, x) => s + safeInt(x.numActivities), 0);
    return { yearLabel, rows, grandTotal };
}

/**
 * @param {Array} records — normalized or raw rows
 * @param {string[]|null} masterNames — from DB for stable row order; null = names from data only (aggregated reports)
 */
function buildMatrixPayloadFromRecords(records, masterNames = null) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);

    const cellMap = new Map();
    const stateSet = new Set();

    for (const r of norm) {
        const nature = r.natureName || 'Not specified';
        const st = (r.stateName && r.stateName !== '—')
            ? String(r.stateName).trim()
            : 'Unknown';
        stateSet.add(st);
        if (!cellMap.has(nature)) cellMap.set(nature, new Map());
        const m = cellMap.get(nature);
        m.set(st, (m.get(st) || 0) + safeInt(r.numberOfActivities));
    }

    let stateColumns = [...stateSet].sort(sortStr);

    let rowLabels;
    if (masterNames && masterNames.length > 0) {
        const seen = new Set(masterNames);
        const extra = [...cellMap.keys()].filter((n) => !seen.has(n)).sort(sortStr);
        rowLabels = [...masterNames, ...extra];
    } else {
        rowLabels = [...cellMap.keys()].sort(sortStr);
    }

    const matrixRows = rowLabels.map((nature) => {
        const m = cellMap.get(nature) || new Map();
        const valuesByState = {};
        let total = 0;
        for (const st of stateColumns) {
            const v = m.get(st) || 0;
            valuesByState[st] = v;
            total += v;
        }
        return { label: nature, valuesByState, total };
    });

    return {
        yearLabel,
        stateColumns,
        matrixRows,
    };
}

async function fetchOtherExtensionActivities(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;

    const rows = await prisma.kvkOtherExtensionActivity.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            otherExtensionActivity: { select: { otherExtensionName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { otherExtensionActivityId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getOtherExtensionContentReportData(kvkId, filters = {}) {
    const records = await fetchOtherExtensionActivities(kvkId, filters);
    const masterNames = await fetchMasterActivityNames();
    const matrixPayload = buildMatrixPayloadFromRecords(records, masterNames);
    return { records, matrixPayload };
}

function resolveOtherExtensionPagePayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildPagePayloadFromRecords(records);
}

function resolveOtherExtensionMatrixPayload(data) {
    if (!data) {
        return { yearLabel: '', stateColumns: [], matrixRows: [] };
    }
    if (data.matrixPayload) return data.matrixPayload;
    if (data.data && data.data.matrixPayload) return data.data.matrixPayload;
    if (data.payload && data.payload.matrixPayload) return data.payload.matrixPayload;
    return data;
}

module.exports = {
    getOtherExtensionContentReportData,
    fetchOtherExtensionActivities,
    buildPagePayloadFromRecords,
    buildMatrixPayloadFromRecords,
    resolveOtherExtensionPagePayload,
    resolveOtherExtensionMatrixPayload,
    normalizePrismaRow,
    normalizeFlexibleRow,
    fetchMasterActivityNames,
};
