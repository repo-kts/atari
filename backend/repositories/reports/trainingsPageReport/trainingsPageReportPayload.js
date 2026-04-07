/**
 * Payload for Trainings form page export only (PDF/Excel/Word) — not modular all-reports.
 * Section A: by training type — thematic summary, ON + OFF campus combined.
 * Section B: by training type — On Campus thematic table, then Off Campus.
 * Section C: row-level training details.
 */

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

function getTrainingTypeName(r) {
    if (r.trainingType && typeof r.trainingType === 'object' && r.trainingType.trainingTypeName) {
        return String(r.trainingType.trainingTypeName).trim();
    }
    if (typeof r.trainingType === 'string' && r.trainingType.trim()) {
        return r.trainingType.trim();
    }
    if (r.trainingProgram) return String(r.trainingProgram).trim();
    if (r.trainingTypeName) return String(r.trainingTypeName).trim();
    return 'Not specified';
}

function getThematicLabel(r) {
    const n = r.thematicArea || r.thematicAreaName;
    if (n) return String(n).trim();
    return '—';
}

function getTrainingAreaLabel(r) {
    const n = r.trainingArea || r.trainingAreaName;
    if (n) return String(n).trim();
    return '—';
}

function getClienteleLabel(r) {
    if (r.clientele && typeof r.clientele === 'string') return r.clientele.trim();
    if (r.clienteleName) return String(r.clienteleName).trim();
    return '—';
}

function normalizeCampus(r) {
    const c = r.campusType;
    if (c === 'ON_CAMPUS' || c === 'on_campus' || c === 'On Campus') return 'ON_CAMPUS';
    if (c === 'OFF_CAMPUS' || c === 'off_campus' || c === 'Off Campus') return 'OFF_CAMPUS';
    return null;
}

function normalizeExportRow(r) {
    const trainingTypeName = getTrainingTypeName(r);
    const thematicAreaName = getThematicLabel(r);
    const trainingAreaName = getTrainingAreaLabel(r);
    const clienteleName = getClienteleLabel(r);
    const title = r.titleOfTraining || r.title || '';
    return {
        trainingAchievementId: r.trainingAchievementId ?? r.id,
        trainingTypeId: r.trainingTypeId != null ? r.trainingTypeId : null,
        trainingTypeName,
        trainingAreaId: r.trainingAreaId != null ? r.trainingAreaId : null,
        trainingAreaName,
        thematicAreaId: r.thematicAreaId != null ? r.thematicAreaId : (r.trainingThematicAreaId != null ? r.trainingThematicAreaId : null),
        thematicAreaName,
        clienteleName,
        titleOfTraining: title,
        startDate: r.startDate,
        endDate: r.endDate,
        venue: r.venue || '',
        campusType: normalizeCampus(r),
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
    };
}

function trainingTypeGroupKey(r) {
    if (r.trainingTypeId != null) return `tid:${r.trainingTypeId}`;
    return `tname:${r.trainingTypeName}`;
}

function aggregateThematicRows(rows) {
    const m = new Map();
    for (const r of rows) {
        const key = r.thematicAreaId != null
            ? `thid:${r.thematicAreaId}`
            : `thn:${r.thematicAreaName || '—'}`;
        if (!m.has(key)) {
            m.set(key, {
                thematicAreaName: r.thematicAreaName || '—',
                agg: emptyParticipantAgg(),
            });
        }
        addRowToAgg(m.get(key).agg, r);
    }
    const order = [...m.keys()].sort((a, b) =>
        sortStr(m.get(a).thematicAreaName, m.get(b).thematicAreaName),
    );
    return order.map((k) => {
        const { thematicAreaName, agg } = m.get(k);
        return { thematicAreaName, ...withTotals(agg) };
    });
}

function durationDays(startDate, endDate) {
    if (!startDate || !endDate) return '';
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
    const days = Math.round((e - s) / 86400000) + 1;
    return days > 0 ? String(days) : '';
}

function formatDateRange(startDate, endDate) {
    const fmt = (d) => {
        if (!d) return '';
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return '';
        const dd = String(x.getDate()).padStart(2, '0');
        const mm = String(x.getMonth() + 1).padStart(2, '0');
        const yy = x.getFullYear();
        return `${dd}/${mm}/${yy}`;
    };
    const a = fmt(startDate);
    const b = fmt(endDate);
    if (a && b) return `${a} – ${b}`;
    return a || b || '—';
}

function buildSectionCRows(norm) {
    const sorted = [...norm].sort((a, b) => {
        const t = sortStr(a.trainingTypeName, b.trainingTypeName);
        if (t !== 0) return t;
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
    });
    return sorted.map((r) => {
        const acc = emptyParticipantAgg();
        addRowToAgg(acc, r);
        return {
            discipline: r.trainingAreaName || '—',
            clientele: r.clienteleName || '—',
            title: r.titleOfTraining || '—',
            dateRange: formatDateRange(r.startDate, r.endDate),
            durationDays: durationDays(r.startDate, r.endDate),
            venue: r.venue || '—',
            campusLabel: r.campusType === 'ON_CAMPUS' ? 'On Campus' : r.campusType === 'OFF_CAMPUS' ? 'Off Campus' : '—',
            ...withTotals(acc),
        };
    });
}

function buildTrainingsPageReportPayload(records) {
    const raw = Array.isArray(records) ? records : [];
    const norm = raw.map(normalizeExportRow);
    const yearLabel = inferYearLabel(norm);

    if (norm.length === 0) {
        return { yearLabel, sectionA: [], sectionB: [], sectionC: [] };
    }

    const byType = new Map();
    for (const r of norm) {
        const k = trainingTypeGroupKey(r);
        if (!byType.has(k)) byType.set(k, []);
        byType.get(k).push(r);
    }

    const typeKeys = [...byType.keys()].sort((ka, kb) => {
        const a = byType.get(ka)[0].trainingTypeName;
        const b = byType.get(kb)[0].trainingTypeName;
        return sortStr(a, b);
    });

    const sectionA = [];
    const sectionB = [];

    typeKeys.forEach((key, idx) => {
        const rows = byType.get(key) || [];
        const trainingTypeName = rows[0].trainingTypeName;
        const n = idx + 1;

        sectionA.push({
            index: n,
            trainingTypeName,
            thematicRows: aggregateThematicRows(rows),
            grandTotal: withTotals(rows.reduce((acc, r) => {
                addRowToAgg(acc, r);
                return acc;
            }, emptyParticipantAgg())),
        });

        const onRows = rows.filter((r) => r.campusType === 'ON_CAMPUS');
        const offRows = rows.filter((r) => r.campusType === 'OFF_CAMPUS');
        const unRows = rows.filter((r) => r.campusType == null);

        sectionB.push({
            index: n,
            trainingTypeName,
            onCampus: {
                label: 'On Campus',
                thematicRows: aggregateThematicRows(onRows),
                grandTotal: withTotals(onRows.reduce((acc, r) => {
                    addRowToAgg(acc, r);
                    return acc;
                }, emptyParticipantAgg())),
                rowCount: onRows.length,
            },
            offCampus: {
                label: 'Off Campus',
                thematicRows: aggregateThematicRows(offRows),
                grandTotal: withTotals(offRows.reduce((acc, r) => {
                    addRowToAgg(acc, r);
                    return acc;
                }, emptyParticipantAgg())),
                rowCount: offRows.length,
            },
            unspecifiedCampus: unRows.length
                ? {
                    label: 'Campus not specified',
                    thematicRows: aggregateThematicRows(unRows),
                    grandTotal: withTotals(unRows.reduce((acc, r) => {
                        addRowToAgg(acc, r);
                        return acc;
                    }, emptyParticipantAgg())),
                    rowCount: unRows.length,
                }
                : null,
        });
    });

    const sectionC = buildSectionCRows(norm);

    return {
        yearLabel,
        sectionA,
        sectionB,
        sectionC,
    };
}

function resolveTrainingsPageReportPayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildTrainingsPageReportPayload(records);
}

module.exports = {
    resolveTrainingsPageReportPayload,
    buildTrainingsPageReportPayload,
};
