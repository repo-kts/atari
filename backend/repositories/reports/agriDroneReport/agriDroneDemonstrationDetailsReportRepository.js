const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('./agriDroneIntroductionReportRepository.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function formatDemoDate(d) {
    if (!d) return '—';
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return '—';
    return dt.toISOString().split('T')[0];
}

function fmtArea(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    return String(Number(n.toFixed(2)));
}

/**
 * Normalized row for PDF / export (all numeric fields as displayable numbers).
 */
function mapDemonstrationRecord(r) {
    if (!r) return null;
    const gM = safeInt(r.generalM);
    const gF = safeInt(r.generalF);
    const oM = safeInt(r.obcM);
    const oF = safeInt(r.obcF);
    const sM = safeInt(r.scM);
    const sF = safeInt(r.scF);
    const tM = safeInt(r.stM);
    const tF = safeInt(r.stF);

    const generalT = gM + gF;
    const obcT = oM + oF;
    const scT = sM + sF;
    const stT = tM + tF;
    const grandM = gM + oM + sM + tM;
    const grandF = gF + oF + sF + tF;
    const grandT = generalT + obcT + scT + stT;

    const demosOn = r.demonstrationsOn?.demonstrationsOnName
        ?? r.demonstrationsOnName
        ?? '';
    const districtName = r.district?.districtName
        ?? r.district
        ?? '';

    return {
        demonstrationsOn: demosOn,
        districtName,
        dateOfDemonstration: formatDemoDate(r.dateOfDemonstration),
        placeOfDemonstration: r.placeOfDemonstration ?? r.placeOfDemons ?? '',
        cropName: r.cropName ?? '',
        noOfDemos: r.noOfDemos != null ? String(r.noOfDemos) : '—',
        areaHa: fmtArea(r.areaHa ?? r.areaCoveredUnderDemos),
        generalM: gM,
        generalF: gF,
        generalT,
        obcM: oM,
        obcF: oF,
        obcT,
        scM: sM,
        scF: sF,
        scT,
        stM: tM,
        stF: tF,
        stT,
        grandM,
        grandF,
        grandT,
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;
    return where;
}

async function getAgriDroneDemonstrationDetailsData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const records = await prisma.kvkAgriDroneDemonstration.findMany({
        where,
        include: {
            district: { select: { districtName: true } },
            demonstrationsOn: { select: { demonstrationsOnName: true } },
        },
        orderBy: [{ dateOfDemonstration: 'desc' }, { agriDroneDemonstrationId: 'desc' }],
    });
    const rows = records.map(mapDemonstrationRecord).filter(Boolean);
    return { rows };
}

/**
 * Normalize report/export input into { rows: [...] }.
 */
function resolveAgriDroneDemonstrationDetailsPayload(data) {
    if (!data) return { rows: [] };
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data) {
        d = d.data;
    }
    if (d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.rows)) {
        const first = d.rows[0];
        if (first && typeof first.grandM === 'number') {
            return { rows: d.rows };
        }
        return { rows: d.rows.map((r) => mapDemonstrationRecord(r)).filter(Boolean) };
    }
    const list = Array.isArray(d) ? d : [d];
    const rows = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const row = mapDemonstrationRecord(item);
        if (row) rows.push(row);
    }
    return { rows };
}

module.exports = {
    getAgriDroneDemonstrationDetailsData,
    resolveAgriDroneDemonstrationDetailsPayload,
    mapDemonstrationRecord,
};
