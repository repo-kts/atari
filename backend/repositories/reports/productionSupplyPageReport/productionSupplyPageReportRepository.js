/**
 * Production and supply of Technological products — `KvkProductionSupply`.
 * Page export: product, quantity, value (Rs), Farmers by category (M/F/T), row Total (M/F/T).
 * Modular report: same template with `records` from DB.
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { formatReportingYear } = require('../../../utils/reportingYearUtils.js');
function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function safeFloat(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function pickInt(r, ...keys) {
    for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && r[k] !== '') {
            return safeInt(r[k]);
        }
    }
    return 0;
}

function mfT(m, f) {
    const mi = safeInt(m);
    const fi = safeInt(f);
    return { m: mi, f: fi, t: mi + fi };
}

function formatProductName(r) {
    const parts = [
        r.productCategory || r.category,
        r.productType,
        r.product || r.prodType,
        r.speciesName || r.speciesBreedVariety || r.variety,
    ].filter((x) => x != null && String(x).trim() !== '');
    return parts.length ? parts.map((x) => String(x).trim()).join(' / ') : '—';
}

function formatQuantityCell(r) {
    const q = safeFloat(r.quantity ?? r.quantityKg);
    const u = (r.unit && String(r.unit).trim()) || 'Kg';
    if (!Number.isFinite(q)) return '—';
    const s = Number.isInteger(q) ? String(q) : String(Number(q.toFixed(3)));
    return `${s} ${u}`;
}

function inferYearLabel(records) {
    for (const r of records) {
        const y = r.reportingYear;
        if (y == null) continue;
        if (typeof y === 'string' || typeof y === 'number') {
            const m = String(y).match(/(\d{4})/);
            if (m) return m[1];
        }
        const d = new Date(y);
        if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
    }
    return String(new Date().getFullYear());
}

function extractFarmerBreakdown(r) {
    return {
        genM: pickInt(r, 'gen_m', 'farmersGeneralM', 'farmers_general_m'),
        genF: pickInt(r, 'gen_f', 'farmersGeneralF', 'farmers_general_f'),
        obcM: pickInt(r, 'obc_m', 'farmersObcM', 'farmers_obc_m'),
        obcF: pickInt(r, 'obc_f', 'farmersObcF', 'farmers_obc_f'),
        scM: pickInt(r, 'sc_m', 'farmersScM', 'farmers_sc_m'),
        scF: pickInt(r, 'sc_f', 'farmersScF', 'farmers_sc_f'),
        stM: pickInt(r, 'st_m', 'farmersStM', 'farmers_st_m'),
        stF: pickInt(r, 'st_f', 'farmersStF', 'farmers_st_f'),
    };
}

function pageRowFromRecord(r) {
    const b = extractFarmerBreakdown(r);
    const g = mfT(b.genM, b.genF);
    const o = mfT(b.obcM, b.obcF);
    const s = mfT(b.scM, b.scF);
    const t = mfT(b.stM, b.stF);
    const totalM = b.genM + b.obcM + b.scM + b.stM;
    const totalF = b.genF + b.obcF + b.scF + b.stF;
    return {
        productName: formatProductName(r),
        quantityLabel: formatQuantityCell(r),
        valueRs: safeFloat(r.value ?? r.valueRs),
        unit: (r.unit && String(r.unit).trim()) || '',
        quantityRaw: safeFloat(r.quantity),
        farmersGenM: g.m,
        farmersGenF: g.f,
        farmersGenT: g.t,
        farmersObcM: o.m,
        farmersObcF: o.f,
        farmersObcT: o.t,
        farmersScM: s.m,
        farmersScF: s.f,
        farmersScT: s.t,
        farmersStM: t.m,
        farmersStF: t.f,
        farmersStT: t.t,
        totalM,
        totalF,
        totalT: totalM + totalF,
    };
}

function emptyTotals() {
    return {
        valueRs: 0,
        quantitySum: 0,
        farmersGenM: 0,
        farmersGenF: 0,
        farmersObcM: 0,
        farmersObcF: 0,
        farmersScM: 0,
        farmersScF: 0,
        farmersStM: 0,
        farmersStF: 0,
        totalM: 0,
        totalF: 0,
    };
}

function addToTotals(z, row) {
    z.valueRs += safeFloat(row.valueRs);
    z.quantitySum += safeFloat(row.quantityRaw);
    z.farmersGenM += safeInt(row.farmersGenM);
    z.farmersGenF += safeInt(row.farmersGenF);
    z.farmersObcM += safeInt(row.farmersObcM);
    z.farmersObcF += safeInt(row.farmersObcF);
    z.farmersScM += safeInt(row.farmersScM);
    z.farmersScF += safeInt(row.farmersScF);
    z.farmersStM += safeInt(row.farmersStM);
    z.farmersStF += safeInt(row.farmersStF);
    z.totalM += safeInt(row.totalM);
    z.totalF += safeInt(row.totalF);
}

function grandRowFromTotals(z, quantityGrandLabel) {
    const g = mfT(z.farmersGenM, z.farmersGenF);
    const o = mfT(z.farmersObcM, z.farmersObcF);
    const s = mfT(z.farmersScM, z.farmersScF);
    const t = mfT(z.farmersStM, z.farmersStF);
    return {
        productName: 'Total',
        quantityLabel: quantityGrandLabel,
        valueRs: z.valueRs,
        farmersGenM: g.m,
        farmersGenF: g.f,
        farmersGenT: g.t,
        farmersObcM: o.m,
        farmersObcF: o.f,
        farmersObcT: o.t,
        farmersScM: s.m,
        farmersScF: s.f,
        farmersScT: s.t,
        farmersStM: t.m,
        farmersStF: t.f,
        farmersStT: t.t,
        totalM: z.totalM,
        totalF: z.totalF,
        totalT: z.totalM + z.totalF,
    };
}

function buildPagePayloadFromRecords(records) {
    const list = Array.isArray(records) ? records : [];
    const yearLabel = inferYearLabel(list);
    const rows = list.map((r) => pageRowFromRecord(r));

    const z = emptyTotals();
    const units = new Set();
    for (let i = 0; i < rows.length; i += 1) {
        addToTotals(z, rows[i]);
        units.add((list[i].unit && String(list[i].unit).trim()) || '');
    }
    const unitList = [...units].filter(Boolean);
    const quantityGrandLabel = unitList.length === 1
        ? `${Number.isInteger(z.quantitySum) ? z.quantitySum : Number(z.quantitySum.toFixed(3))} ${unitList[0]}`
        : (rows.length ? `${Number.isInteger(z.quantitySum) ? z.quantitySum : Number(z.quantitySum.toFixed(3))} (mixed units)` : '—');

    const grandTotal = grandRowFromTotals(z, quantityGrandLabel);
    return { yearLabel, rows, grandTotal };
}

function mapPrismaRowToReportRow(r) {
    if (!r) return null;
    const reportingYear = formatReportingYear(r.reportingYear);
    return {
        ...r,
        id: r.productionSupplyId,
        reportingYear,
        productCategory: r.productCategory?.productCategoryName,
        productType: r.productType?.productCategoryType,
        product: r.product?.productName,
        speciesName: r.speciesName,
        unit: r.unit,
        quantity: r.quantity,
        value: r.value,
        valueRs: r.value,
        gen_m: r.farmersGeneralM,
        gen_f: r.farmersGeneralF,
        obc_m: r.farmersObcM,
        obc_f: r.farmersObcF,
        sc_m: r.farmersScM,
        sc_f: r.farmersScF,
        st_m: r.farmersStM,
        st_f: r.farmersStF,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
    };
}

async function fetchProductionSupplyRecordsForReport(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;

    const rows = await prisma.kvkProductionSupply.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
            productCategory: { select: { productCategoryName: true } },
            productType: { select: { productCategoryType: true } },
            product: { select: { productName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return rows.map(mapPrismaRowToReportRow).filter(Boolean);
}

async function getProductionSupplyReportData(kvkId, filters = {}) {
    const records = await fetchProductionSupplyRecordsForReport(kvkId, filters);
    return { records };
}

function resolveProductionSupplyPagePayload(data) {
    if (!data) {
        return buildPagePayloadFromRecords([]);
    }
    if (Array.isArray(data)) {
        return buildPagePayloadFromRecords(data);
    }
    if (Array.isArray(data.records)) {
        return buildPagePayloadFromRecords(data.records);
    }
    if (data.data && Array.isArray(data.data.records)) {
        return buildPagePayloadFromRecords(data.data.records);
    }
    return buildPagePayloadFromRecords([data]);
}

module.exports = {
    buildPagePayloadFromRecords,
    resolveProductionSupplyPagePayload,
    getProductionSupplyReportData,
    fetchProductionSupplyRecordsForReport,
    pageRowFromRecord,
    formatProductName,
};
