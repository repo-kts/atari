/**
 * Section 2.4 training capacity report. Set DEBUG_TRAINING_CAPACITY_REPORT=1 when starting
 * the backend to log training type vs campus per row and each section A,B,… (sections by training type).
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

const DEBUG = process.env.DEBUG_TRAINING_CAPACITY_REPORT === '1' || process.env.DEBUG_TRAINING_CAPACITY_REPORT === 'true';

function debugLog(...args) {
    if (DEBUG) {
        console.log('[trainingCapacityReport]', new Date().toISOString(), ...args);
    }
}

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function emptyParticipantAgg() {
    return {
        courses: 0,
        generalM: 0,
        generalF: 0,
        obcM: 0,
        obcF: 0,
        scM: 0,
        scF: 0,
        stM: 0,
        stF: 0,
    };
}

function addRowToAgg(acc, r) {
    acc.courses += 1;
    acc.generalM += safeInt(r.generalM);
    acc.generalF += safeInt(r.generalF);
    acc.obcM += safeInt(r.obcM);
    acc.obcF += safeInt(r.obcF);
    acc.scM += safeInt(r.scM);
    acc.scF += safeInt(r.scF);
    acc.stM += safeInt(r.stM);
    acc.stF += safeInt(r.stF);
}

function withTotals(agg) {
    const genT = agg.generalM + agg.generalF;
    const obcT = agg.obcM + agg.obcF;
    const scT = agg.scM + agg.scF;
    const stT = agg.stM + agg.stF;
    const grandM = agg.generalM + agg.obcM + agg.scM + agg.stM;
    const grandF = agg.generalF + agg.obcF + agg.scF + agg.stF;
    const grandT = grandM + grandF;
    return {
        ...agg,
        genT,
        obcT,
        scT,
        stT,
        grandM,
        grandF,
        grandT,
    };
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
        ? r.kvk.state.stateName
        : 'Unknown';
    const trainingTypeName = (r.trainingType && r.trainingType.trainingTypeName)
        ? String(r.trainingType.trainingTypeName).trim()
        : 'Not specified';
    const trainingAreaName = (r.trainingArea && r.trainingArea.trainingAreaName)
        ? String(r.trainingArea.trainingAreaName).trim()
        : 'Not specified';
    const thematicAreaName = (r.trainingThematicArea && r.trainingThematicArea.trainingThematicAreaName)
        ? String(r.trainingThematicArea.trainingThematicAreaName).trim()
        : '—';
    const clienteleName = (r.clientele && r.clientele.name)
        ? String(r.clientele.name).trim()
        : null;

    const campusType = r.campusType != null ? String(r.campusType) : null;

    return {
        trainingAchievementId: r.trainingAchievementId,
        kvkId: r.kvkId,
        stateName,
        clienteleId: r.clienteleId,
        clienteleName,
        trainingTypeId: r.trainingTypeId,
        trainingTypeName,
        campusType,
        trainingAreaId: r.trainingAreaId,
        trainingAreaName,
        thematicAreaId: r.thematicAreaId,
        thematicAreaName,
        startDate: r.startDate,
        generalM: safeInt(r.generalM),
        generalF: safeInt(r.generalF),
        obcM: safeInt(r.obcM),
        obcF: safeInt(r.obcF),
        scM: safeInt(r.scM),
        scF: safeInt(r.scF),
        stM: safeInt(r.stM),
        stF: safeInt(r.stF),
    };
}

function sortStr(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

/** Primary section key: **training type** (`trainingTypeId` → superadmin `TrainingType`). Campus is never used for A/B. */
function primarySectionKey(r) {
    if (r.trainingTypeId != null) return `tid:${r.trainingTypeId}`;
    return 'tid:none';
}

function sectionTitleFromRows(rows) {
    const f = rows[0];
    if (f && f.trainingTypeName) return f.trainingTypeName;
    return 'Not specified';
}

/**
 * Build hierarchical payload. Sections A, B, … group by **training type** — not clientele or campus.
 * Use `campusType` on each record for on/off campus only.
 * Per section: state-wise → training-area summary → thematic-area detail per training area.
 */
function buildPayloadFromRecords(records) {
    const norm = Array.isArray(records)
        ? records.map((r) => {
            const looksNormalized = typeof r.stateName === 'string'
                && r.trainingAchievementId != null
                && r.trainingTypeName != null;
            return looksNormalized ? r : normalizePrismaRow(r);
        })
        : [];
    const yearLabel = inferYearLabel(norm);

    if (norm.length === 0) {
        debugLog('buildPayloadFromRecords: no rows after normalize');
        return { yearLabel, sections: [] };
    }

    debugLog('buildPayloadFromRecords: row sample (up to 15) — sections keyed by trainingTypeId / trainingTypeName; campusType for venue only');
    norm.slice(0, 15).forEach((r) => {
        debugLog({
            trainingAchievementId: r.trainingAchievementId,
            kvkId: r.kvkId,
            trainingTypeId: r.trainingTypeId,
            trainingTypeName: r.trainingTypeName,
            campusType: r.campusType ?? '(null)',
            primarySectionKey: primarySectionKey(r),
            sectionTitleWouldBe: sectionTitleFromRows([r]),
        });
    });

    const bySection = new Map();
    for (const r of norm) {
        const key = primarySectionKey(r);
        if (!bySection.has(key)) bySection.set(key, []);
        bySection.get(key).push(r);
    }

    const sectionKeys = [...bySection.keys()].sort((ka, kb) => {
        const a = sectionTitleFromRows(bySection.get(ka) || []);
        const b = sectionTitleFromRows(bySection.get(kb) || []);
        return sortStr(a, b);
    });

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const sections = [];

    sectionKeys.forEach((sectionKey, idx) => {
        const typeRows = bySection.get(sectionKey) || [];
        const sectionTitle = sectionTitleFromRows(typeRows);
        const letter = letters[idx] || String(idx + 1);

        const stateMap = new Map();
        for (const r of typeRows) {
            const st = r.stateName || 'Unknown';
            if (!stateMap.has(st)) stateMap.set(st, emptyParticipantAgg());
            addRowToAgg(stateMap.get(st), r);
        }
        const stateOrder = [...stateMap.keys()].sort(sortStr);
        const stateRows = stateOrder.map((stateName) => ({
            stateName,
            ...withTotals(stateMap.get(stateName)),
        }));
        let stateGrand = emptyParticipantAgg();
        for (const r of typeRows) addRowToAgg(stateGrand, r);
        stateGrand = withTotals(stateGrand);

        const areaMap = new Map();
        for (const r of typeRows) {
            const ak = r.trainingAreaId != null ? `aid:${r.trainingAreaId}` : 'aid:none';
            if (!areaMap.has(ak)) {
                areaMap.set(ak, {
                    key: ak,
                    trainingAreaName: r.trainingAreaName || 'Not specified',
                    agg: emptyParticipantAgg(),
                });
            }
            addRowToAgg(areaMap.get(ak).agg, r);
        }
        const areaOrder = [...areaMap.keys()].sort((a, b) =>
            sortStr(areaMap.get(a).trainingAreaName, areaMap.get(b).trainingAreaName),
        );
        const trainingAreaSummary = areaOrder.map((ak) => {
            const entry = areaMap.get(ak);
            return {
                trainingAreaName: entry.trainingAreaName,
                ...withTotals(entry.agg),
            };
        });
        let areaSummaryGrand = emptyParticipantAgg();
        for (const r of typeRows) addRowToAgg(areaSummaryGrand, r);
        areaSummaryGrand = withTotals(areaSummaryGrand);

        const thematicDetailBlocks = [];
        for (const ak of areaOrder) {
            const areaName = areaMap.get(ak).trainingAreaName;
            const rowsForArea = typeRows.filter((r) => {
                const k = r.trainingAreaId != null ? `aid:${r.trainingAreaId}` : 'aid:none';
                return k === ak;
            });
            const thematicMap = new Map();
            for (const r of rowsForArea) {
                const tk = r.thematicAreaId != null ? `thid:${r.thematicAreaId}` : 'thid:none';
                if (!thematicMap.has(tk)) {
                    thematicMap.set(tk, {
                        thematicAreaName: r.thematicAreaName || '—',
                        agg: emptyParticipantAgg(),
                    });
                }
                addRowToAgg(thematicMap.get(tk).agg, r);
            }
            const thOrder = [...thematicMap.keys()].sort((a, b) =>
                sortStr(thematicMap.get(a).thematicAreaName, thematicMap.get(b).thematicAreaName),
            );
            const detailRows = thOrder.map((tk) => {
                const e = thematicMap.get(tk);
                return {
                    thematicAreaName: e.thematicAreaName,
                    ...withTotals(e.agg),
                };
            });
            let detailGrand = emptyParticipantAgg();
            for (const r of rowsForArea) addRowToAgg(detailGrand, r);
            detailGrand = withTotals(detailGrand);

            thematicDetailBlocks.push({
                trainingAreaName: areaName,
                rows: detailRows,
                grandTotal: detailGrand,
            });
        }

        debugLog(`section ${letter}: key=${sectionKey} groupedBy=trainingTypeId sectionTitle="${sectionTitle}" rowCount=${typeRows.length}`);

        sections.push({
            letter,
            sectionTitle,
            trainingTypeName: sectionTitle,
            stateRows,
            stateGrandTotal: stateGrand,
            trainingAreaSummary,
            trainingAreaSummaryGrand: areaSummaryGrand,
            thematicDetailBlocks,
        });
    });

    debugLog('buildPayloadFromRecords: done', { yearLabel, sectionCount: sections.length });

    return { yearLabel, sections };
}

async function fetchTrainingAchievements(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;

    const rows = await prisma.trainingAchievement.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            clientele: { select: { name: true } },
            trainingType: { select: { trainingTypeName: true } },
            trainingArea: { select: { trainingAreaName: true } },
            trainingThematicArea: { select: { trainingThematicAreaName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { trainingAchievementId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getTrainingCapacityReportData(kvkId, filters = {}) {
    debugLog('getTrainingCapacityReportData start', { kvkId, filters, DEBUG });
    const records = await fetchTrainingAchievements(kvkId, filters);
    debugLog(`fetched ${records.length} training_achievement row(s)`);
    const payload = buildPayloadFromRecords(records);
    return { payload, records };
}

function resolveTrainingCapacityPayload(data) {
    if (!data) {
        return { yearLabel: '', sections: [] };
    }
    if (data.payload) return data.payload;
    if (data.data && data.data.payload) return data.data.payload;
    return data;
}

module.exports = {
    getTrainingCapacityReportData,
    buildPayloadFromRecords,
    fetchTrainingAchievements,
    resolveTrainingCapacityPayload,
};
