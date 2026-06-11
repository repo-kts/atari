const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { yearLabelFromFilters } = require('../reportYearLabel.js');
const { FLD_STATUS } = require('../../../constants/fldStatus.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function totalFarmersFromRow(r) {
    return (
        safeInt(r.generalM) + safeInt(r.generalF)
        + safeInt(r.obcM) + safeInt(r.obcF)
        + safeInt(r.scM) + safeInt(r.scF)
        + safeInt(r.stM) + safeInt(r.stF)
    );
}

function applyReportingYear(where, filters) {
    // KvkFldIntroduction has no `reportingYear` column — filtering on it threw a
    // Prisma validation error, which dropped the whole FLD section on
    // year/range select (#227). Filter on the real event date `startDate`.
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName) ? r.kvk.state.stateName : 'Unknown';
    const categoryName = (r.category && r.category.categoryName) ? r.category.categoryName : 'Uncategorized';
    const sectorName = (r.sector && r.sector.sectorName)
        ? r.sector.sectorName
        : (r.category && r.category.sector && r.category.sector.sectorName) || 'Other';
    return {
        kvkFldId: r.kvkFldId,
        stateName,
        sectorName,
        categoryName,
        cropName: r.crop?.cropName || '—',
        thematicAreaName: r.thematicArea?.thematicAreaName || '—',
        fldName: r.fldName || '—',
        noOfDemonstration: safeInt(r.noOfDemonstration),
        areaHa: Number(r.quantity ?? r.areaHa) || 0,
        farmers: totalFarmersFromRow(r),
        reportingYear: r.expectedCompletionDate ?? r.reportingYear,
        fldResult: r.fldResult || null,
    };
}

function inferYearLabel(records) {
    for (const r of records) {
        const ry = r.reportingYear;
        if (ry instanceof Date) {
            return String(ry.getFullYear());
        }
        if (typeof ry === 'string' && ry.length >= 4) {
            const y = parseInt(ry.slice(0, 4), 10);
            if (Number.isFinite(y)) return String(y);
        }
    }
    return String(new Date().getFullYear());
}

function weightedAvgFromFldRows(rows, pickFromResult) {
    let num = 0;
    let den = 0;
    for (const r of rows) {
        if (!r.fldResult) continue;
        const a = Number(r.areaHa) || 0;
        if (a <= 0) continue;
        const y = pickFromResult(r.fldResult);
        if (y == null || Number.isNaN(Number(y))) continue;
        num += Number(y) * a;
        den += a;
    }
    if (den <= 0) return null;
    return num / den;
}

function mergeFldResultsForRows(rows) {
    const fr = rows.map((r) => r.fldResult).filter(Boolean);
    if (fr.length === 0) return null;
    return {
        demoYield: weightedAvgFromFldRows(rows, (fr) => fr.demoYield),
        checkYield: weightedAvgFromFldRows(rows, (fr) => fr.checkYield),
        increasePercent: weightedAvgFromFldRows(rows, (fr) => fr.increasePercent),
        demoGrossCost: weightedAvgFromFldRows(rows, (fr) => fr.demoGrossCost),
        demoGrossReturn: weightedAvgFromFldRows(rows, (fr) => fr.demoGrossReturn),
        demoNetReturn: weightedAvgFromFldRows(rows, (fr) => fr.demoNetReturn),
        demoBcr: weightedAvgFromFldRows(rows, (fr) => fr.demoBcr),
        checkGrossCost: weightedAvgFromFldRows(rows, (fr) => fr.checkGrossCost),
        checkGrossReturn: weightedAvgFromFldRows(rows, (fr) => fr.checkGrossReturn),
        checkNetReturn: weightedAvgFromFldRows(rows, (fr) => fr.checkNetReturn),
        checkBcr: weightedAvgFromFldRows(rows, (fr) => fr.checkBcr),
    };
}

// Fixed sector column order for the state-wise FLD table (#232). Exactly these,
// in this order — no "Agriculture" column. Records with other sectors are not
// shown as state-wise columns (they still appear in the category breakdown).
const FLD_SECTOR_ORDER = [
    'Crop Production',
    'Horticultural Crops',
    'Livestock & Fisheries',
    'Other Enterprises',
    'Women Empowerment',
    'Farm Implements and Machinery',
    'Crop Hybrid Varieties',
];

function buildSectionA(records) {
    // State-wise table columns are SECTORS in a fixed canonical order (#232).
    const sectors = FLD_SECTOR_ORDER;
    const states = [...new Set(records.map((r) => r.stateName))].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    const matrix = {};
    states.forEach((s) => {
        matrix[s] = {};
        sectors.forEach((c) => {
            matrix[s][c] = { farmers: 0, demos: 0, area: 0 };
        });
    });

    for (const r of records) {
        const cell = matrix[r.stateName]?.[r.sectorName];
        if (cell) {
            cell.farmers += r.farmers;
            cell.demos += r.noOfDemonstration;
            cell.area += r.areaHa;
        }
    }

    const sumCells = (cells) => cells.reduce(
        (t, c) => ({ farmers: t.farmers + c.farmers, demos: t.demos + c.demos, area: t.area + c.area }),
        { farmers: 0, demos: 0, area: 0 },
    );

    const stateRows = states.map((stateName) => {
        const cells = sectors.map((c) => ({ sectorName: c, ...matrix[stateName][c] }));
        return { stateName, cells, total: sumCells(cells) };
    });

    const totalCells = sectors.map((c) => {
        const agg = { sectorName: c, farmers: 0, demos: 0, area: 0 };
        states.forEach((s) => {
            const x = matrix[s][c];
            agg.farmers += x.farmers;
            agg.demos += x.demos;
            agg.area += x.area;
        });
        return agg;
    });

    return {
        sectors,
        stateRows,
        totalRow: { stateName: 'Total', cells: totalCells, total: sumCells(totalCells) },
    };
}

function buildDetailRowsForCategory(catRecords) {
    const byCrop = new Map();
    for (const r of catRecords) {
        const crop = r.cropName || '—';
        if (!byCrop.has(crop)) byCrop.set(crop, []);
        byCrop.get(crop).push(r);
    }

    const cropNames = [...byCrop.keys()].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    const cropGroups = [];
    for (const cropName of cropNames) {
        const cropList = byCrop.get(cropName) || [];
        const byState = new Map();
        for (const r of cropList) {
            const st = r.stateName || 'Unknown';
            if (!byState.has(st)) byState.set(st, []);
            byState.get(st).push(r);
        }
        const stateNames = [...byState.keys()].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );

        const rows = [];
        for (const st of stateNames) {
            const list = byState.get(st) || [];
            let farmers = 0;
            let demos = 0;
            let area = 0;
            list.forEach((x) => {
                farmers += x.farmers;
                demos += x.noOfDemonstration;
                area += x.areaHa;
            });
            const thematic = list.map((x) => x.thematicAreaName).filter(Boolean);
            const thematicAreaName = thematic.length ? [...new Set(thematic)].join(', ') : '—';
            const tech = list.map((x) => x.fldName).filter(Boolean);
            const technology = tech.length ? [...new Set(tech)].join(', ') : '—';
            const mergedFr = mergeFldResultsForRows(list);
            rows.push({
                crop: cropName,
                state: st,
                thematicAreaName,
                technology,
                farmers,
                demos,
                areaHa: area,
                fldResult: mergedFr,
            });
        }

        let tf = 0;
        let td = 0;
        let ta = 0;
        cropList.forEach((x) => {
            tf += x.farmers;
            td += x.noOfDemonstration;
            ta += x.areaHa;
        });
        const totalFr = mergeFldResultsForRows(cropList);
        cropGroups.push({
            cropName,
            rows,
            totalRow: {
                crop: cropName,
                state: 'Total',
                thematicAreaName: '—',
                technology: '—',
                farmers: tf,
                demos: td,
                areaHa: ta,
                fldResult: totalFr,
            },
        });
    }

    return cropGroups;
}

function buildPayloadFromRecords(records, filters = {}) {
    const norm = records.map((r) => (typeof r.stateName === 'string' ? r : normalizePrismaRow(r)));
    // Year label from the selected filter, not the data (#231/#223).
    const yearLabel = yearLabelFromFilters(filters);
    if (norm.length === 0) {
        return {
            yearLabel,
            sectors: [],
            sectionA: { sectors: [], stateRows: [], totalRow: null },
            sectionB: [],
        };
    }

    const sectionA = buildSectionA(norm);
    const byCategory = new Map();
    for (const r of norm) {
        const c = r.categoryName || 'Uncategorized';
        if (!byCategory.has(c)) byCategory.set(c, []);
        byCategory.get(c).push(r);
    }

    const catOrder = [...byCategory.keys()].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    const sectionB = catOrder.map((categoryName) => ({
        categoryName,
        cropGroups: buildDetailRowsForCategory(byCategory.get(categoryName) || []),
    }));

    return {
        yearLabel,
        sectors: sectionA.sectors,
        sectionA,
        sectionB,
    };
}

async function fetchFldRecords(kvkId, filters = {}) {
    // Transferred rows are stale clones of the same demonstration — exclude to avoid double counting.
    const where = { ongoingCompleted: { not: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR } };
    if (kvkId) where.kvkId = kvkId;
    applyReportingYear(where, filters);

    const rows = await prisma.kvkFldIntroduction.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            category: { select: { categoryId: true, categoryName: true } },
            sector: { select: { sectorName: true } },
            crop: { select: { cropName: true } },
            thematicArea: { select: { thematicAreaName: true } },
            fldResult: true,
        },
        orderBy: [{ kvkId: 'asc' }, { kvkFldId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getFldStateCategoryReportData(kvkId, filters = {}) {
    const records = await fetchFldRecords(kvkId, filters);
    const payload = buildPayloadFromRecords(records, filters);
    return {
        payload,
        records,
    };
}

function resolveFldStateCategoryPayload(data) {
    if (!data) {
        return {
            yearLabel: '',
            sectors: [],
            sectionA: { sectors: [], stateRows: [], totalRow: null },
            sectionB: [],
        };
    }
    if (data.payload) return data.payload;
    if (data.data && data.data.payload) return data.data.payload;
    return data;
}

module.exports = {
    getFldStateCategoryReportData,
    buildPayloadFromRecords,
    fetchFldRecords,
    resolveFldStateCategoryPayload,
};
