const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { yearLabelFromFilters } = require('../reportYearLabel.js');
const { FLD_STATUS } = require('../../../constants/fldStatus.js');
const { getFldResultTemplate } = require('../../../constants/fldResultTemplate.js');

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

function normalizeFldSectorName(value) {
    const raw = String(value || '')
        .replace(/&amp;/gi, '&')
        .replace(/&#38;/gi, '&')
        .trim();
    if (!raw) return 'Other';
    const compact = raw.replace(/\s+/g, ' ').toLowerCase();

    if (/^crop production$/.test(compact)) return 'Crop Production';
    if (/^horticultural crops?$/.test(compact) || /^horticulture crops?$/.test(compact)) {
        return 'Horticultural Crops';
    }
    if (/^livestock\s*(?:&|and)\s*fisher(?:y|ies)$/.test(compact)) {
        return 'Livestock & Fisheries';
    }
    if (/^other enterprises?$/.test(compact)) return 'Other Enterprises';
    if (/^women empowerment$/.test(compact) || /^home science\s*\/\s*women empowerment$/.test(compact)) {
        return 'Women Empowerment';
    }
    if (/^farm implements(?: and| &)? machinery$/.test(compact)) {
        return 'Farm Implements and Machinery';
    }
    if (/^crop hybrid varieties$/.test(compact)) return 'Crop Hybrid Varieties';

    return raw;
}

function inferFldSectorName(rawSectorName, categoryName) {
    const normalizedSector = normalizeFldSectorName(rawSectorName);
    if (normalizedSector && normalizedSector !== 'Other') return normalizedSector;

    const category = String(categoryName || '').trim().toLowerCase();
    if (!category) return normalizedSector || 'Other';

    if (category.includes('crop hybrid varieties')) return 'Crop Hybrid Varieties';
    if (category.includes('farm implements') || category.includes('machineries')) {
        return 'Farm Implements and Machinery';
    }
    if (category.includes('women empowerment')) return 'Women Empowerment';
    if (category.includes('other enterprises')) return 'Other Enterprises';
    if (category.includes('livestock') || category.includes('fisher')) return 'Livestock & Fisheries';
    if (category.includes('horticultural crops') || category.includes('horticulture crops')) {
        return 'Horticultural Crops';
    }

    return normalizedSector || 'Other';
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName) ? r.kvk.state.stateName : 'Unknown';
    const categoryName = r.categoryOther || (r.category && r.category.categoryName) || 'Uncategorized';
    const sectorName = inferFldSectorName(r.sectorOther
        || (r.sector && r.sector.sectorName)
        || (r.category && r.category.sector && r.category.sector.sectorName)
        || 'Other', categoryName);
    return {
        kvkFldId: r.kvkFldId,
        stateName,
        sectorName,
        categoryName,
        resultTemplate: getFldResultTemplate({ sectorName, categoryName }),
        cropName: r.cropOther || r.crop?.cropName || '—',
        thematicAreaName: r.thematicAreaOther || r.thematicArea?.thematicAreaName || '—',
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
        otherParameterDemo: weightedAvgFromFldRows(rows, (fr) => fr.otherParameterDemo),
        otherParameterCheck: weightedAvgFromFldRows(rows, (fr) => fr.otherParameterCheck),
        laborReductionManDays: weightedAvgFromFldRows(rows, (fr) => fr.laborReductionManDays),
        costReduction: weightedAvgFromFldRows(rows, (fr) => fr.costReduction),
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

function sortSectorNames(a, b) {
    const ia = FLD_SECTOR_ORDER.indexOf(a);
    const ib = FLD_SECTOR_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    }
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

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
            matrix[s][c] = { flds: 0, farmers: 0, demos: 0, area: 0 };
        });
    });

    // Records grouped by sector so per-sector demo/check yields can be
    // area-weighted from each FLD's fldResult (matrix cells drop the raw rows).
    const recordsBySector = {};
    sectors.forEach((c) => { recordsBySector[c] = []; });

    for (const r of records) {
        const cell = matrix[r.stateName]?.[r.sectorName];
        if (cell) {
            cell.flds += 1;
            cell.farmers += r.farmers;
            cell.demos += r.noOfDemonstration;
            cell.area += r.areaHa;
            recordsBySector[r.sectorName].push(r);
        }
    }

    const sumCells = (cells) => cells.reduce(
        (t, c) => ({
            flds: t.flds + c.flds,
            farmers: t.farmers + c.farmers,
            demos: t.demos + c.demos,
            area: t.area + c.area,
        }),
        { flds: 0, farmers: 0, demos: 0, area: 0 },
    );

    const stateRows = states.map((stateName) => {
        const cells = sectors.map((c) => ({ sectorName: c, ...matrix[stateName][c] }));
        return { stateName, cells, total: sumCells(cells) };
    });

    const totalCells = sectors.map((c) => {
        const agg = { sectorName: c, flds: 0, farmers: 0, demos: 0, area: 0 };
        states.forEach((s) => {
            const x = matrix[s][c];
            agg.flds += x.flds;
            agg.farmers += x.farmers;
            agg.demos += x.demos;
            agg.area += x.area;
        });
        // Area-weighted demo/check yields across this sector's FLDs.
        agg.demoYield = weightedAvgFromFldRows(recordsBySector[c], (fr) => fr.demoYield);
        agg.checkYield = weightedAvgFromFldRows(recordsBySector[c], (fr) => fr.checkYield);
        return agg;
    });

    const grandTotal = sumCells(totalCells);
    grandTotal.demoYield = weightedAvgFromFldRows(records, (fr) => fr.demoYield);
    grandTotal.checkYield = weightedAvgFromFldRows(records, (fr) => fr.checkYield);

    return {
        sectors,
        stateRows,
        totalRow: { stateName: 'Total', cells: totalCells, total: grandTotal },
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
                resultTemplate: list[0]?.resultTemplate,
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
                resultTemplate: cropList[0]?.resultTemplate,
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
    const bySector = new Map();
    for (const r of norm) {
        const sectorName = r.sectorName || 'Other';
        if (!bySector.has(sectorName)) bySector.set(sectorName, new Map());
        const byCategory = bySector.get(sectorName);
        const categoryName = r.categoryName || 'Uncategorized';
        if (!byCategory.has(categoryName)) byCategory.set(categoryName, []);
        byCategory.get(categoryName).push(r);
    }

    const sectorOrder = [
        ...FLD_SECTOR_ORDER,
        ...[...bySector.keys()].filter((sectorName) => !FLD_SECTOR_ORDER.includes(sectorName)).sort(sortSectorNames),
    ];
    const sectionB = sectorOrder.map((sectorName) => {
        const byCategory = bySector.get(sectorName) || new Map();
        const categoryOrder = [...byCategory.keys()].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );
        return {
            sectorName,
            categories: categoryOrder.map((categoryName) => {
                const rows = byCategory.get(categoryName) || [];
                return {
                    categoryName,
                    resultTemplate: rows[0]?.resultTemplate,
                    cropGroups: buildDetailRowsForCategory(rows),
                };
            }),
        };
    });

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
