/**
 * KVK Extension / Outreach activities (achievement form) — modular report + shared aggregation.
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function emptyAgg() {
    return {
        numActivities: 0,
        farmersGeneralM: 0,
        farmersGeneralF: 0,
        farmersObcM: 0,
        farmersObcF: 0,
        farmersScM: 0,
        farmersScF: 0,
        farmersStM: 0,
        farmersStF: 0,
        officialsGeneralM: 0,
        officialsGeneralF: 0,
        officialsObcM: 0,
        officialsObcF: 0,
        officialsScM: 0,
        officialsScF: 0,
        officialsStM: 0,
        officialsStF: 0,
    };
}

function addRecord(agg, r) {
    agg.numActivities += safeInt(r.numberOfActivities);
    agg.farmersGeneralM += safeInt(r.farmersGeneralM);
    agg.farmersGeneralF += safeInt(r.farmersGeneralF);
    agg.farmersObcM += safeInt(r.farmersObcM);
    agg.farmersObcF += safeInt(r.farmersObcF);
    agg.farmersScM += safeInt(r.farmersScM);
    agg.farmersScF += safeInt(r.farmersScF);
    agg.farmersStM += safeInt(r.farmersStM);
    agg.farmersStF += safeInt(r.farmersStF);
    agg.officialsGeneralM += safeInt(r.officialsGeneralM);
    agg.officialsGeneralF += safeInt(r.officialsGeneralF);
    agg.officialsObcM += safeInt(r.officialsObcM);
    agg.officialsObcF += safeInt(r.officialsObcF);
    agg.officialsScM += safeInt(r.officialsScM);
    agg.officialsScF += safeInt(r.officialsScF);
    agg.officialsStM += safeInt(r.officialsStM);
    agg.officialsStF += safeInt(r.officialsStF);
}

function aggToDisplayRow(agg) {
    const t = (m, f) => ({ m, f, t: m + f });
    const fg = t(agg.farmersGeneralM, agg.farmersGeneralF);
    const fo = t(agg.farmersObcM, agg.farmersObcF);
    const fs = t(agg.farmersScM, agg.farmersScF);
    const ft = t(agg.farmersStM, agg.farmersStF);
    const og = t(agg.officialsGeneralM, agg.officialsGeneralF);
    const oo = t(agg.officialsObcM, agg.officialsObcF);
    const os = t(agg.officialsScM, agg.officialsScF);
    const ot = t(agg.officialsStM, agg.officialsStF);
    const grandM = agg.farmersGeneralM + agg.farmersObcM + agg.farmersScM + agg.farmersStM
        + agg.officialsGeneralM + agg.officialsObcM + agg.officialsScM + agg.officialsStM;
    const grandF = agg.farmersGeneralF + agg.farmersObcF + agg.farmersScF + agg.farmersStF
        + agg.officialsGeneralF + agg.officialsObcF + agg.officialsScF + agg.officialsStF;
    return {
        numActivities: agg.numActivities,
        farmersGeneralM: fg.m,
        farmersGeneralF: fg.f,
        farmersGeneralT: fg.t,
        farmersObcM: fo.m,
        farmersObcF: fo.f,
        farmersObcT: fo.t,
        farmersScM: fs.m,
        farmersScF: fs.f,
        farmersScT: fs.t,
        farmersStM: ft.m,
        farmersStF: ft.f,
        farmersStT: ft.t,
        officialsGeneralM: og.m,
        officialsGeneralF: og.f,
        officialsGeneralT: og.t,
        officialsObcM: oo.m,
        officialsObcF: oo.f,
        officialsObcT: oo.t,
        officialsScM: os.m,
        officialsScF: os.f,
        officialsScT: os.t,
        officialsStM: ot.m,
        officialsStF: ot.f,
        officialsStT: ot.t,
        grandM,
        grandF,
        grandT: grandM + grandF,
    };
}

function sumDisplayRows(rows) {
    const a = emptyAgg();
    for (const r of rows) {
        a.numActivities += safeInt(r.numActivities);
        a.farmersGeneralM += safeInt(r.farmersGeneralM);
        a.farmersGeneralF += safeInt(r.farmersGeneralF);
        a.farmersObcM += safeInt(r.farmersObcM);
        a.farmersObcF += safeInt(r.farmersObcF);
        a.farmersScM += safeInt(r.farmersScM);
        a.farmersScF += safeInt(r.farmersScF);
        a.farmersStM += safeInt(r.farmersStM);
        a.farmersStF += safeInt(r.farmersStF);
        a.officialsGeneralM += safeInt(r.officialsGeneralM);
        a.officialsGeneralF += safeInt(r.officialsGeneralF);
        a.officialsObcM += safeInt(r.officialsObcM);
        a.officialsObcF += safeInt(r.officialsObcF);
        a.officialsScM += safeInt(r.officialsScM);
        a.officialsScF += safeInt(r.officialsScF);
        a.officialsStM += safeInt(r.officialsStM);
        a.officialsStF += safeInt(r.officialsStF);
    }
    return aggToDisplayRow(a);
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
    const natureName = (r.fldActivity && r.fldActivity.activityName)
        ? String(r.fldActivity.activityName).trim()
        : 'Not specified';
    return {
        extensionActivityId: r.extensionActivityId,
        kvkId: r.kvkId,
        stateName,
        natureName,
        numberOfActivities: r.numberOfActivities,
        startDate: r.startDate,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
        officialsGeneralM: r.officialsGeneralM,
        officialsGeneralF: r.officialsGeneralF,
        officialsObcM: r.officialsObcM,
        officialsObcF: r.officialsObcF,
        officialsScM: r.officialsScM,
        officialsScF: r.officialsScF,
        officialsStM: r.officialsStM,
        officialsStF: r.officialsStF,
    };
}

/** API / PDF export rows without nested kvk — same participant fields as Prisma. */
function normalizeFlexibleRow(r) {
    if (r.kvk && (r.kvk.state || r.fldActivity)) {
        return normalizePrismaRow(r);
    }
    const natureRaw = r.natureName ?? r.extensionActivityType ?? r.nameOfExtensionActivities ?? '';
    const natureName = String(natureRaw).trim() || 'Not specified';
    return {
        extensionActivityId: r.extensionActivityId ?? r.id,
        kvkId: r.kvkId,
        stateName: r.stateName ? String(r.stateName).trim() : '—',
        natureName,
        numberOfActivities: r.numberOfActivities ?? r.noOfActivities ?? 0,
        startDate: r.startDate,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
        officialsGeneralM: r.officialsGeneralM,
        officialsGeneralF: r.officialsGeneralF,
        officialsObcM: r.officialsObcM,
        officialsObcF: r.officialsObcF,
        officialsScM: r.officialsScM,
        officialsScF: r.officialsScF,
        officialsStM: r.officialsStM,
        officialsStF: r.officialsStF,
    };
}

function buildPayloadFromRecords(records) {
    const norm = Array.isArray(records)
        ? records.map((r) => normalizeFlexibleRow(r))
        : [];
    const yearLabel = inferYearLabel(norm);

    if (norm.length === 0) {
        return {
            yearLabel,
            stateSummary: [],
            stateGrandTotal: aggToDisplayRow(emptyAgg()),
            activityDetails: [],
            activityGrandTotal: aggToDisplayRow(emptyAgg()),
        };
    }

    const byState = new Map();
    const byNature = new Map();

    for (const r of norm) {
        const sk = r.stateName || 'Unknown';
        if (!byState.has(sk)) byState.set(sk, emptyAgg());
        addRecord(byState.get(sk), r);

        const nk = r.natureName || 'Not specified';
        if (!byNature.has(nk)) byNature.set(nk, emptyAgg());
        addRecord(byNature.get(nk), r);
    }

    const stateOrder = [...byState.keys()].sort(sortStr);
    const stateSummary = stateOrder.map((stateName) => ({
        label: stateName,
        ...aggToDisplayRow(byState.get(stateName)),
    }));
    const stateGrandTotal = sumDisplayRows(stateSummary);

    const natureOrder = [...byNature.keys()].sort(sortStr);
    const activityDetails = natureOrder.map((natureName) => ({
        label: natureName,
        ...aggToDisplayRow(byNature.get(natureName)),
    }));
    const activityGrandTotal = sumDisplayRows(activityDetails);

    return {
        yearLabel,
        stateSummary,
        stateGrandTotal,
        activityDetails,
        activityGrandTotal,
    };
}

async function fetchExtensionActivities(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;

    const rows = await prisma.kvkExtensionActivity.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            fldActivity: { select: { activityName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { extensionActivityId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getExtensionOutreachReportData(kvkId, filters = {}) {
    const records = await fetchExtensionActivities(kvkId, filters);
    const payload = buildPayloadFromRecords(records);
    return { payload, records };
}

function resolveExtensionOutreachPayload(data) {
    if (!data) {
        return buildPayloadFromRecords([]);
    }
    if (data.payload) return data.payload;
    if (data.data && data.data.payload) return data.data.payload;
    return data;
}

/** Page export: single table by nature of activity (same columns as modular table 2). */
function resolveExtensionActivityPagePayload(rawData) {
    const records = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const full = buildPayloadFromRecords(records);
    return {
        yearLabel: full.yearLabel,
        rows: full.activityDetails,
        grandTotal: full.activityGrandTotal,
    };
}

module.exports = {
    getExtensionOutreachReportData,
    buildPayloadFromRecords,
    fetchExtensionActivities,
    resolveExtensionOutreachPayload,
    resolveExtensionActivityPagePayload,
    normalizePrismaRow,
    normalizeFlexibleRow,
};
