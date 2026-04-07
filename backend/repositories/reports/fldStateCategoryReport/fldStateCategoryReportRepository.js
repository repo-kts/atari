const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

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
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName) ? r.kvk.state.stateName : 'Unknown';
    const categoryName = (r.category && r.category.categoryName) ? r.category.categoryName : 'Uncategorized';
    return {
        kvkFldId: r.kvkFldId,
        stateName,
        categoryName,
        cropName: r.crop?.cropName || '—',
        thematicAreaName: r.thematicArea?.thematicAreaName || '—',
        fldName: r.fldName || '—',
        noOfDemonstration: safeInt(r.noOfDemonstration),
        areaHa: Number(r.areaHa) || 0,
        farmers: totalFarmersFromRow(r),
        reportingYear: r.reportingYear,
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

function buildSectionA(records) {
    const categories = [...new Set(records.map((r) => r.categoryName))].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    const states = [...new Set(records.map((r) => r.stateName))].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    const matrix = {};
    states.forEach((s) => {
        matrix[s] = {};
        categories.forEach((c) => {
            matrix[s][c] = { farmers: 0, demos: 0, area: 0 };
        });
    });

    for (const r of records) {
        const cell = matrix[r.stateName]?.[r.categoryName];
        if (cell) {
            cell.farmers += r.farmers;
            cell.demos += r.noOfDemonstration;
            cell.area += r.areaHa;
        }
    }

    const stateRows = states.map((stateName) => ({
        stateName,
        cells: categories.map((c) => ({
            categoryName: c,
            ...matrix[stateName][c],
        })),
    }));

    const totalRow = {
        stateName: 'Total',
        cells: categories.map((c) => {
            let farmers = 0;
            let demos = 0;
            let area = 0;
            states.forEach((s) => {
                const x = matrix[s][c];
                if (x) {
                    farmers += x.farmers;
                    demos += x.demos;
                    area += x.area;
                }
            });
            return { categoryName: c, farmers, demos, area };
        }),
    };

    return { categories, stateRows, totalRow };
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

function buildPayloadFromRecords(records) {
    const norm = records.map((r) => (typeof r.stateName === 'string' ? r : normalizePrismaRow(r)));
    const yearLabel = inferYearLabel(norm);
    if (norm.length === 0) {
        return {
            yearLabel,
            categories: [],
            sectionA: { categories: [], stateRows: [], totalRow: null },
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
        categories: sectionA.categories,
        sectionA,
        sectionB,
    };
}

async function fetchFldRecords(kvkId, filters = {}) {
    const where = {};
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
    const payload = buildPayloadFromRecords(records);
    return {
        payload,
        records,
    };
}

function resolveFldStateCategoryPayload(data) {
    if (!data) {
        return {
            yearLabel: '',
            categories: [],
            sectionA: { categories: [], stateRows: [], totalRow: null },
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
