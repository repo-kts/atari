/**
 * Technology Week Celebration — `KvkTechnologyWeekCelebration`.
 * Page export: wide table (activities, counts, participant M/F/T by category, related technology).
 * Modular report: state rows — KVK count, activity count, participants.
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

function pickInt(r, ...keys) {
    for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && r[k] !== '') {
            return safeInt(r[k]);
        }
    }
    return 0;
}

/** Participant breakdown for one row (farmers only — matches stored fields). */
function participantCells(r) {
    const gm = pickInt(r, 'gen_m', 'genM', 'farmersGeneralM', 'farmers_general_m');
    const gf = pickInt(r, 'gen_f', 'genF', 'farmersGeneralF', 'farmers_general_f');
    const om = pickInt(r, 'obc_m', 'obcM', 'farmersObcM', 'farmers_obc_m');
    const of = pickInt(r, 'obc_f', 'obcF', 'farmersObcF', 'farmers_obc_f');
    const sm = pickInt(r, 'sc_m', 'scM', 'farmersScM', 'farmers_sc_m');
    const sf = pickInt(r, 'sc_f', 'scF', 'farmersScF', 'farmers_sc_f');
    const stm = pickInt(r, 'st_m', 'stM', 'farmersStM', 'farmers_st_m');
    const stf = pickInt(r, 'st_f', 'stF', 'farmersStF', 'farmers_st_f');

    const genT = gm + gf;
    const obcT = om + of;
    const scT = sm + sf;
    const stT = stm + stf;
    const totalM = gm + om + sm + stm;
    const totalF = gf + of + sf + stf;
    const totalT = totalM + totalF;

    return {
        genM: gm,
        genF: gf,
        genT,
        obcM: om,
        obcF: of,
        obcT,
        scM: sm,
        scF: sf,
        scT,
        stM: stm,
        stF: stf,
        stT,
        totalM,
        totalF,
        totalT,
    };
}

function totalParticipants(r) {
    const p = participantCells(r);
    return p.totalT;
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        ? String(r.kvk.state.stateName).trim()
        : 'Unknown';
    const base = {
        techWeekId: r.techWeekId ?? r.id,
        kvkId: r.kvkId,
        stateName,
        startDate: r.startDate,
        typeOfActivities: String(r.typeOfActivities || r.activityType || r.type_of_activities || '').trim(),
        numberOfActivities: safeInt(r.numberOfActivities ?? r.noOfActivities ?? r.activityCount ?? r.number_of_activities),
        relatedTechnology: (r.relatedTechnology != null && String(r.relatedTechnology).trim() !== '')
            ? String(r.relatedTechnology).trim()
            : 'n/a',
    };
    return { ...base, ...participantCells(r) };
}

function normalizeFlexibleRow(r) {
    if (r.kvk) {
        return normalizePrismaRow(r);
    }
    const typeRaw = r.typeOfActivities ?? r.activityType ?? r.type_of_activities ?? '';
    const num = pickInt(r, 'numberOfActivities', 'noOfActivities', 'activityCount', 'number_of_activities');
    const rel = r.relatedTechnology ?? r.relatedCropLivestockTechnology ?? r.related_crop_livestock_technology;
    const base = {
        techWeekId: r.techWeekId ?? r.id,
        kvkId: r.kvkId,
        stateName: r.stateName ? String(r.stateName).trim() : 'Unknown',
        startDate: r.startDate,
        typeOfActivities: String(typeRaw || '').trim() || '—',
        numberOfActivities: num,
        relatedTechnology: (rel != null && String(rel).trim() !== '') ? String(rel).trim() : 'n/a',
    };
    return { ...base, ...participantCells(r) };
}

function buildPagePayloadFromRecords(records) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);
    const rows = norm.map((r) => ({
        typeOfActivities: r.typeOfActivities,
        numberOfActivities: r.numberOfActivities,
        relatedTechnology: r.relatedTechnology,
        ...participantCells(r),
    }));

    const z = {
        numberOfActivities: 0,
        genM: 0,
        genF: 0,
        genT: 0,
        obcM: 0,
        obcF: 0,
        obcT: 0,
        scM: 0,
        scF: 0,
        scT: 0,
        stM: 0,
        stF: 0,
        stT: 0,
        totalM: 0,
        totalF: 0,
        totalT: 0,
    };
    for (const r of rows) {
        z.numberOfActivities += safeInt(r.numberOfActivities);
        z.genM += safeInt(r.genM);
        z.genF += safeInt(r.genF);
        z.genT += safeInt(r.genT);
        z.obcM += safeInt(r.obcM);
        z.obcF += safeInt(r.obcF);
        z.obcT += safeInt(r.obcT);
        z.scM += safeInt(r.scM);
        z.scF += safeInt(r.scF);
        z.scT += safeInt(r.scT);
        z.stM += safeInt(r.stM);
        z.stF += safeInt(r.stF);
        z.stT += safeInt(r.stT);
        z.totalM += safeInt(r.totalM);
        z.totalF += safeInt(r.totalF);
        z.totalT += safeInt(r.totalT);
    }

    const grandTotal = {
        typeOfActivities: 'Total',
        numberOfActivities: z.numberOfActivities,
        relatedTechnology: '—',
        ...z,
    };

    return { yearLabel, rows, grandTotal };
}

/**
 * State-wise summary: unique KVKs per state, sum of activities, sum of participants.
 */
function buildStateSummaryFromRecords(records) {
    const norm = Array.isArray(records) ? records.map((r) => normalizeFlexibleRow(r)) : [];
    const yearLabel = inferYearLabel(norm);
    const byState = new Map();

    for (const r of norm) {
        const st = r.stateName && String(r.stateName).trim() ? String(r.stateName).trim() : 'Unknown';
        if (!byState.has(st)) {
            byState.set(st, { stateName: st, kvkIds: new Set(), activitySum: 0, participantSum: 0 });
        }
        const b = byState.get(st);
        if (r.kvkId != null) b.kvkIds.add(Number(r.kvkId));
        b.activitySum += safeInt(r.numberOfActivities);
        b.participantSum += totalParticipants(r);
    }

    const rows = [...byState.values()]
        .sort((a, b) => sortStr(a.stateName, b.stateName))
        .map((b) => ({
            stateName: b.stateName,
            noOfKvks: b.kvkIds.size,
            milletActivities: b.activitySum,
            participants: b.participantSum,
        }));

    return { yearLabel, rows };
}

async function fetchTechnologyWeekRecords(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;

    const rows = await prisma.kvkTechnologyWeekCelebration.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
        },
        orderBy: [{ startDate: 'asc' }, { techWeekId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getTechnologyWeekCelebrationReportData(kvkId, filters = {}) {
    const records = await fetchTechnologyWeekRecords(kvkId, filters);
    const stateSummaryPayload = buildStateSummaryFromRecords(records);
    return { records, stateSummaryPayload };
}

function resolveTechnologyWeekPagePayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildPagePayloadFromRecords(records);
}

function resolveTechnologyWeekStateSummaryPayload(data) {
    if (!data) {
        return { yearLabel: '', rows: [] };
    }
    if (data.stateSummaryPayload) return data.stateSummaryPayload;
    if (data.data && data.data.stateSummaryPayload) return data.data.stateSummaryPayload;
    if (Array.isArray(data.records)) {
        return buildStateSummaryFromRecords(data.records);
    }
    return { yearLabel: '', rows: [] };
}

module.exports = {
    getTechnologyWeekCelebrationReportData,
    fetchTechnologyWeekRecords,
    buildPagePayloadFromRecords,
    buildStateSummaryFromRecords,
    resolveTechnologyWeekPagePayload,
    resolveTechnologyWeekStateSummaryPayload,
    normalizePrismaRow,
    normalizeFlexibleRow,
    participantCells,
};
