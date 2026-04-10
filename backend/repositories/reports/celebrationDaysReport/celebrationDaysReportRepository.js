/**
 * Important days celebration — `KvkImportantDayCelebration`.
 * Page export: wide table — activities + Farmers / Extension Officials (Gen/OBC/SC/ST × M,F,T) + row Total.
 * Modular: important day × state matrix with KVK count, activities, participants.
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
        if (!r.eventDate) continue;
        const d = new Date(r.eventDate);
        if (Number.isNaN(d.getTime())) continue;
        const month = d.getMonth() + 1;
        const startYear = month >= 4 ? d.getFullYear() : d.getFullYear() - 1;
        return String(startYear);
    }
    return String(new Date().getFullYear());
}

function pickInt(r, ...keys) {
    for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && r[k] !== '') {
            return safeInt(r[k]);
        }
    }
    return 0;
}

/** Sum of farmer + official M/F participants (matches form storage). */
function countParticipantsFromRow(r) {
    const gm = pickInt(r, 'gen_m', 'farmersGeneralM', 'farmers_general_m');
    const gf = pickInt(r, 'gen_f', 'farmersGeneralF', 'farmers_general_f');
    const om = pickInt(r, 'obc_m', 'farmersObcM', 'farmers_obc_m');
    const of = pickInt(r, 'obc_f', 'farmersObcF', 'farmers_obc_f');
    const sm = pickInt(r, 'sc_m', 'farmersScM', 'farmers_sc_m');
    const sf = pickInt(r, 'sc_f', 'farmersScF', 'farmers_sc_f');
    const stm = pickInt(r, 'st_m', 'farmersStM', 'farmers_st_m');
    const stf = pickInt(r, 'st_f', 'farmersStF', 'farmers_st_f');
    const egm = pickInt(r, 'ext_gen_m', 'officialsGeneralM', 'officials_general_m');
    const egf = pickInt(r, 'ext_gen_f', 'officialsGeneralF', 'officials_general_f');
    const eom = pickInt(r, 'ext_obc_m', 'officialsObcM', 'officials_obc_m');
    const eof = pickInt(r, 'ext_obc_f', 'officialsObcF', 'officials_obc_f');
    const esm = pickInt(r, 'ext_sc_m', 'officialsScM', 'officials_sc_m');
    const esf = pickInt(r, 'ext_sc_f', 'officialsScF', 'officials_sc_f');
    const estm = pickInt(r, 'ext_st_m', 'officialsStM', 'officials_st_m');
    const estf = pickInt(r, 'ext_st_f', 'officialsStF', 'officials_st_f');
    return gm + gf + om + of + sm + sf + stm + stf + egm + egf + eom + eof + esm + esf + estm + estf;
}

/** Farmer + extension official counts (M/F only; T computed when building rows). */
function extractFarmerOfficialBreakdown(r) {
    return {
        farmersGenM: pickInt(r, 'gen_m', 'farmersGeneralM', 'farmers_general_m'),
        farmersGenF: pickInt(r, 'gen_f', 'farmersGeneralF', 'farmers_general_f'),
        farmersObcM: pickInt(r, 'obc_m', 'farmersObcM', 'farmers_obc_m'),
        farmersObcF: pickInt(r, 'obc_f', 'farmersObcF', 'farmers_obc_f'),
        farmersScM: pickInt(r, 'sc_m', 'farmersScM', 'farmers_sc_m'),
        farmersScF: pickInt(r, 'sc_f', 'farmersScF', 'farmers_sc_f'),
        farmersStM: pickInt(r, 'st_m', 'farmersStM', 'farmers_st_m'),
        farmersStF: pickInt(r, 'st_f', 'farmersStF', 'farmers_st_f'),
        offGenM: pickInt(r, 'ext_gen_m', 'officialsGeneralM', 'officials_general_m'),
        offGenF: pickInt(r, 'ext_gen_f', 'officialsGeneralF', 'officials_general_f'),
        offObcM: pickInt(r, 'ext_obc_m', 'officialsObcM', 'officials_obc_m'),
        offObcF: pickInt(r, 'ext_obc_f', 'officialsObcF', 'officials_obc_f'),
        offScM: pickInt(r, 'ext_sc_m', 'officialsScM', 'officials_sc_m'),
        offScF: pickInt(r, 'ext_sc_f', 'officialsScF', 'officials_sc_f'),
        offStM: pickInt(r, 'ext_st_m', 'officialsStM', 'officials_st_m'),
        offStF: pickInt(r, 'ext_st_f', 'officialsStF', 'officials_st_f'),
    };
}

function mfT(m, f) {
    return { m: safeInt(m), f: safeInt(f), t: safeInt(m) + safeInt(f) };
}

function resolveDayName(r) {
    if (r.importantDay && typeof r.importantDay === 'object' && r.importantDay.dayName) {
        return String(r.importantDay.dayName).trim();
    }
    if (typeof r.importantDay === 'string' && r.importantDay.trim()) {
        return r.importantDay.trim();
    }
    const raw = r.dayName ?? r.importantDays ?? '';
    return String(raw || '').trim() || 'Not specified';
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        ? String(r.kvk.state.stateName).trim()
        : 'Unknown';
    const dayName = resolveDayName(r);
    const br = extractFarmerOfficialBreakdown(r);
    return {
        celebrationId: r.celebrationId ?? r.id,
        kvkId: r.kvkId,
        stateName,
        dayName,
        eventDate: r.eventDate,
        numberOfActivities: safeInt(r.numberOfActivities),
        participants: countParticipantsFromRow(r),
        ...br,
    };
}

function normalizeFlexibleRow(r) {
    if (r.kvk && r.importantDay && typeof r.importantDay === 'object') {
        return normalizePrismaRow(r);
    }
    const dayName = resolveDayName(r);
    const br = extractFarmerOfficialBreakdown(r);
    return {
        celebrationId: r.celebrationId ?? r.id,
        kvkId: r.kvkId,
        stateName: r.stateName ? String(r.stateName).trim() : 'Unknown',
        dayName,
        eventDate: r.eventDate,
        numberOfActivities: safeInt(r.numberOfActivities ?? r.noOfActivities ?? r.activityCount ?? r.number_of_activities),
        participants: countParticipantsFromRow(r),
        ...br,
    };
}

async function fetchMasterDayNames() {
    const rows = await prisma.importantDay.findMany({
        select: { dayName: true },
        orderBy: { dayName: 'asc' },
    });
    return rows.map((x) => String(x.dayName).trim()).filter(Boolean);
}

function emptyAgg() {
    return {
        numActivities: 0,
        farmersGenM: 0,
        farmersGenF: 0,
        farmersObcM: 0,
        farmersObcF: 0,
        farmersScM: 0,
        farmersScF: 0,
        farmersStM: 0,
        farmersStF: 0,
        offGenM: 0,
        offGenF: 0,
        offObcM: 0,
        offObcF: 0,
        offScM: 0,
        offScF: 0,
        offStM: 0,
        offStF: 0,
    };
}

function aggFromRow(agg, r) {
    agg.numActivities += safeInt(r.numberOfActivities);
    agg.farmersGenM += safeInt(r.farmersGenM);
    agg.farmersGenF += safeInt(r.farmersGenF);
    agg.farmersObcM += safeInt(r.farmersObcM);
    agg.farmersObcF += safeInt(r.farmersObcF);
    agg.farmersScM += safeInt(r.farmersScM);
    agg.farmersScF += safeInt(r.farmersScF);
    agg.farmersStM += safeInt(r.farmersStM);
    agg.farmersStF += safeInt(r.farmersStF);
    agg.offGenM += safeInt(r.offGenM);
    agg.offGenF += safeInt(r.offGenF);
    agg.offObcM += safeInt(r.offObcM);
    agg.offObcF += safeInt(r.offObcF);
    agg.offScM += safeInt(r.offScM);
    agg.offScF += safeInt(r.offScF);
    agg.offStM += safeInt(r.offStM);
    agg.offStF += safeInt(r.offStF);
}

function pageRowFromAgg(label, a) {
    const fg = mfT(a.farmersGenM, a.farmersGenF);
    const fo = mfT(a.farmersObcM, a.farmersObcF);
    const fs = mfT(a.farmersScM, a.farmersScF);
    const ft = mfT(a.farmersStM, a.farmersStF);
    const og = mfT(a.offGenM, a.offGenF);
    const oo = mfT(a.offObcM, a.offObcF);
    const os = mfT(a.offScM, a.offScF);
    const ot = mfT(a.offStM, a.offStF);
    const totalM = a.farmersGenM + a.farmersObcM + a.farmersScM + a.farmersStM
        + a.offGenM + a.offObcM + a.offScM + a.offStM;
    const totalF = a.farmersGenF + a.farmersObcF + a.farmersScF + a.farmersStF
        + a.offGenF + a.offObcF + a.offScF + a.offStF;
    return {
        label,
        numActivities: a.numActivities,
        farmersGenM: fg.m,
        farmersGenF: fg.f,
        farmersGenT: fg.t,
        farmersObcM: fo.m,
        farmersObcF: fo.f,
        farmersObcT: fo.t,
        farmersScM: fs.m,
        farmersScF: fs.f,
        farmersScT: fs.t,
        farmersStM: ft.m,
        farmersStF: ft.f,
        farmersStT: ft.t,
        offGenM: og.m,
        offGenF: og.f,
        offGenT: og.t,
        offObcM: oo.m,
        offObcF: oo.f,
        offObcT: oo.t,
        offScM: os.m,
        offScF: os.f,
        offScT: os.t,
        offStM: ot.m,
        offStF: ot.f,
        offStT: ot.t,
        totalM,
        totalF,
        totalT: totalM + totalF,
    };
}

function sumPageRowsGrand(rows) {
    const z = emptyAgg();
    z.numActivities = rows.reduce((s, x) => s + safeInt(x.numActivities), 0);
    z.farmersGenM = rows.reduce((s, x) => s + safeInt(x.farmersGenM), 0);
    z.farmersGenF = rows.reduce((s, x) => s + safeInt(x.farmersGenF), 0);
    z.farmersObcM = rows.reduce((s, x) => s + safeInt(x.farmersObcM), 0);
    z.farmersObcF = rows.reduce((s, x) => s + safeInt(x.farmersObcF), 0);
    z.farmersScM = rows.reduce((s, x) => s + safeInt(x.farmersScM), 0);
    z.farmersScF = rows.reduce((s, x) => s + safeInt(x.farmersScF), 0);
    z.farmersStM = rows.reduce((s, x) => s + safeInt(x.farmersStM), 0);
    z.farmersStF = rows.reduce((s, x) => s + safeInt(x.farmersStF), 0);
    z.offGenM = rows.reduce((s, x) => s + safeInt(x.offGenM), 0);
    z.offGenF = rows.reduce((s, x) => s + safeInt(x.offGenF), 0);
    z.offObcM = rows.reduce((s, x) => s + safeInt(x.offObcM), 0);
    z.offObcF = rows.reduce((s, x) => s + safeInt(x.offObcF), 0);
    z.offScM = rows.reduce((s, x) => s + safeInt(x.offScM), 0);
    z.offScF = rows.reduce((s, x) => s + safeInt(x.offScF), 0);
    z.offStM = rows.reduce((s, x) => s + safeInt(x.offStM), 0);
    z.offStF = rows.reduce((s, x) => s + safeInt(x.offStF), 0);
    return pageRowFromAgg('Total', z);
}

function buildPagePayloadFromRecords(records, masterNames = null) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);
    const byDay = new Map();
    for (const r of norm) {
        const k = r.dayName || 'Not specified';
        if (!byDay.has(k)) byDay.set(k, emptyAgg());
        aggFromRow(byDay.get(k), r);
    }

    let rowLabels;
    if (masterNames && masterNames.length > 0) {
        const seen = new Set(masterNames);
        const extra = [...byDay.keys()].filter((n) => !seen.has(n)).sort(sortStr);
        rowLabels = [...masterNames, ...extra];
    } else {
        rowLabels = [...byDay.keys()].sort(sortStr);
    }

    const rows = rowLabels.map((label) => pageRowFromAgg(label, byDay.get(label) || emptyAgg()));
    const grandTotal = sumPageRowsGrand(rows);
    return { yearLabel, rows, grandTotal };
}

/**
 * @param {Array} records
 * @param {string[]|null} masterNames — from DB for row order; null = names from data only (aggregated reports)
 */
function buildStateMatrixFromRecords(records, masterNames = null) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);

    const cellMap = new Map();
    const stateSet = new Set();

    for (const r of norm) {
        const day = r.dayName || 'Not specified';
        const st = (r.stateName && r.stateName !== '—')
            ? String(r.stateName).trim()
            : 'Unknown';
        stateSet.add(st);
        if (!cellMap.has(day)) cellMap.set(day, new Map());
        const m = cellMap.get(day);
        if (!m.has(st)) {
            m.set(st, { kvkIds: new Set(), activities: 0, participants: 0 });
        }
        const c = m.get(st);
        if (r.kvkId != null) c.kvkIds.add(Number(r.kvkId));
        c.activities += safeInt(r.numberOfActivities);
        c.participants += safeInt(r.participants);
    }

    const stateColumns = [...stateSet].sort(sortStr);

    let rowLabels;
    if (masterNames && masterNames.length > 0) {
        const seen = new Set(masterNames);
        const extra = [...cellMap.keys()].filter((n) => !seen.has(n)).sort(sortStr);
        rowLabels = [...masterNames, ...extra];
    } else {
        rowLabels = [...cellMap.keys()].sort(sortStr);
    }

    const matrixRows = rowLabels.map((day) => {
        const m = cellMap.get(day) || new Map();
        const valuesByState = {};
        const unionKvks = new Set();
        let activitiesTotal = 0;
        let participantsTotal = 0;

        for (const st of stateColumns) {
            const c = m.get(st);
            if (!c) {
                valuesByState[st] = { kvks: 0, activities: 0, participants: 0 };
            } else {
                const kv = c.kvkIds.size;
                const act = c.activities;
                const part = c.participants;
                valuesByState[st] = { kvks: kv, activities: act, participants: part };
                c.kvkIds.forEach((id) => unionKvks.add(id));
                activitiesTotal += act;
                participantsTotal += part;
            }
        }

        return {
            label: day,
            valuesByState,
            total: {
                kvks: unionKvks.size,
                activities: activitiesTotal,
                participants: participantsTotal,
            },
        };
    });

    return {
        yearLabel,
        stateColumns,
        matrixRows,
    };
}

async function fetchCelebrationRecords(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.eventDate = ry;

    const rows = await prisma.kvkImportantDayCelebration.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            importantDay: { select: { dayName: true } },
        },
        orderBy: [{ eventDate: 'asc' }, { celebrationId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getCelebrationDaysReportData(kvkId, filters = {}) {
    const records = await fetchCelebrationRecords(kvkId, filters);
    const masterNames = await fetchMasterDayNames();
    const matrixPayload = buildStateMatrixFromRecords(records, masterNames);
    return { records, matrixPayload };
}

function resolveCelebrationDaysPagePayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildPagePayloadFromRecords(records);
}

function resolveCelebrationDaysMatrixPayload(data) {
    if (!data) {
        return { yearLabel: '', stateColumns: [], matrixRows: [] };
    }
    if (data.matrixPayload) return data.matrixPayload;
    if (data.data && data.data.matrixPayload) return data.data.matrixPayload;
    if (data.payload && data.payload.matrixPayload) return data.payload.matrixPayload;
    if (Array.isArray(data.records)) {
        return buildStateMatrixFromRecords(data.records, null);
    }
    return data;
}

module.exports = {
    getCelebrationDaysReportData,
    fetchCelebrationRecords,
    fetchMasterDayNames,
    buildPagePayloadFromRecords,
    buildStateMatrixFromRecords,
    resolveCelebrationDaysPagePayload,
    resolveCelebrationDaysMatrixPayload,
    normalizePrismaRow,
    normalizeFlexibleRow,
};
