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

// Detailed, one-row-per-record payload (no year-wise sectioning). Grouped by
// KVK so admins see each KVK's rows separately while a KVK user sees a single
// group. Every captured detail is shown — nature, count, start/end date, year.
function normalizeDetailRow(r) {
    const kvkName = (r.kvkName && String(r.kvkName).trim())
        || (r.kvk && r.kvk.kvkName && String(r.kvk.kvkName).trim())
        || 'Unknown KVK';
    const nature = String(
        r.natureOfExtensionActivity
        ?? r.extensionActivityType
        ?? r.natureName
        ?? (r.otherExtensionActivity && r.otherExtensionActivity.otherExtensionName)
        ?? '',
    ).trim() || 'Not specified';
    const num = safeInt(
        r.noOfActivities ?? r.numberOfActivities ?? r.activityCount ?? 0,
    );
    const smsName = String(
        r.staffName
        ?? r.smsName
        ?? (r.staff && r.staff.staffName)
        ?? '',
    ).trim();
    return {
        kvkName,
        nature,
        smsName,
        num,
        startDate: r.startDate ? String(r.startDate).slice(0, 10) : '',
        endDate: r.endDate ? String(r.endDate).slice(0, 10) : '',
        reportingYear: r.reportingYear ? String(r.reportingYear) : '',
    };
}

function buildDetailedPayloadFromRecords(records) {
    const norm = Array.isArray(records) ? records.map(normalizeDetailRow) : [];

    const byKvk = new Map();
    for (const r of norm) {
        if (!byKvk.has(r.kvkName)) byKvk.set(r.kvkName, []);
        byKvk.get(r.kvkName).push(r);
    }

    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const list = byKvk.get(kvkName);
        const rows = list.map((r, i) => ({
            sno: i + 1,
            nature: r.nature,
            smsName: r.smsName,
            num: r.num,
            startDate: r.startDate,
            endDate: r.endDate,
            reportingYear: r.reportingYear,
        }));
        const subtotal = rows.reduce((s, x) => s + safeInt(x.num), 0);
        return { kvkName, rows, subtotal };
    });

    const grandTotal = groups.reduce((s, g) => s + safeInt(g.subtotal), 0);
    const isMultiKvk = groups.length > 1;

    return { groups, grandTotal, isMultiKvk, totalRecords: norm.length };
}

function resolveOtherExtensionDetailedPayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildDetailedPayloadFromRecords(records);
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
    buildDetailedPayloadFromRecords,
    resolveOtherExtensionDetailedPayload,
    resolveOtherExtensionPagePayload,
    resolveOtherExtensionMatrixPayload,
    normalizePrismaRow,
    normalizeFlexibleRow,
    fetchMasterActivityNames,
};
