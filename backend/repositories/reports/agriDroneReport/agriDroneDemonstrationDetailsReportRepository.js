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

function payloadLabel(p) {
    if (!p) return '';
    const kvk = String(p.kvkName || '').trim();
    if (!kvk) return '';
    const loc = String(p.stateName || '').trim();
    return loc ? `${kvk} — ${loc}` : kvk;
}

async function getAgriDroneDemonstrationDetailsData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const records = await prisma.kvkAgriDroneDemonstration.findMany({
        where,
        include: {
            district: { select: { districtName: true } },
            demonstrationsOn: { select: { demonstrationsOnName: true } },
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
        },
        orderBy: [{ dateOfDemonstration: 'desc' }, { agriDroneDemonstrationId: 'desc' }],
    });
    const rows = records.map(mapDemonstrationRecord).filter(Boolean);
    const first = records[0];
    return {
        kvkName: first?.kvk?.kvkName || '',
        stateName: first?.kvk?.state?.stateName || '',
        rows,
    };
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
    const list = Array.isArray(d) ? d : [d];

    // One block per KVK so super-admin aggregated output can be labelled.
    const blocks = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;

        if (Array.isArray(item.rows)) {
            // Already-built per-KVK payload. Skip empty ones so KVKs without
            // demonstrations don't render a phantom empty block.
            const mapped = item.rows
                .map((r) => (r && typeof r.grandM === 'number') ? r : mapDemonstrationRecord(r))
                .filter(Boolean);
            if (mapped.length === 0) continue;
            blocks.push({ label: payloadLabel(item), rows: mapped });
            continue;
        }

        const row = mapDemonstrationRecord(item);
        if (row) blocks.push({ label: '', rows: [row] });
    }

    if (blocks.length === 0) return { rows: [] };
    // Single KVK: keep the original look (no per-block header).
    if (blocks.length === 1) return { rows: blocks[0].rows };

    const rows = [];
    blocks.forEach((b, i) => {
        if (i > 0) rows.push({ _spacer: true });
        if (b.label) rows.push({ _header: true, label: b.label });
        rows.push(...b.rows);
    });
    return { rows };
}

module.exports = {
    getAgriDroneDemonstrationDetailsData,
    resolveAgriDroneDemonstrationDetailsPayload,
    mapDemonstrationRecord,
};
