/**
 * Soil & water testing — analysis records (`KvkSoilWaterAnalysis`).
 * - Samples “B” table: aggregates by samplesAnalysedThrough (mini kit vs laboratory vs other).
 * - State-wise detail: fixed analysis categories with samples, villages, farmers benefitted.
 */
const prisma = require('../../../config/prisma.js');
const soilWaterRepository = require('../../forms/soilWaterRepository.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

const SAMPLES_MINI = 'Mini soil testing kit';
const SAMPLES_LAB = 'Soil testing laboratory';
const SAMPLES_OTHER = 'Other';

const ANALYSIS_CATEGORIES = ['Soil', 'Water', 'Plant', 'Fertilizers', 'Manures', 'Food', 'Others'];

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function parseReportingYearForFilter(value) {
    if (value == null || value === '') return null;
    const d = new Date(String(value).trim());
    return Number.isNaN(d.getTime()) ? null : d;
}

function rowMatchesReportingFilters(row, filters) {
    const ry = buildReportingYearFilter(filters);
    if (!ry) return true;
    const d = parseReportingYearForFilter(row.reportingYear);
    if (!d) return false;
    const t = d.getTime();
    return t >= ry.gte.getTime() && t <= ry.lte.getTime();
}

function totalFarmersBenefitted(r) {
    return (
        safeInt(r.generalM) + safeInt(r.generalF)
        + safeInt(r.obcM) + safeInt(r.obcF)
        + safeInt(r.scM) + safeInt(r.scF)
        + safeInt(r.stM) + safeInt(r.stF)
    );
}

/** Map master analysis name to one of the seven fixed report categories. */
function classifyAnalysisCategory(analysisName) {
    const s = String(analysisName || '').toLowerCase().trim();
    if (!s) return 'Others';
    if (s.includes('fertilizer') || s.includes('fertiliser')) return 'Fertilizers';
    if (s.includes('manure')) return 'Manures';
    if (s.includes('food')) return 'Food';
    if (s.includes('water')) return 'Water';
    if (s.includes('plant')) return 'Plant';
    if (s.includes('soil')) return 'Soil';
    return 'Others';
}

function bucketSamplesThrough(through) {
    const s = String(through || '').trim();
    if (s === SAMPLES_MINI) return 'mini';
    if (s === SAMPLES_LAB) return 'lab';
    return 'other';
}

function emptyBuckets() {
    return { mini: 0, lab: 0, other: 0, total: 0 };
}

function addToBuckets(acc, r) {
    const n = safeInt(r.samplesAnalysed);
    const b = bucketSamplesThrough(r.samplesAnalysedThrough);
    acc[b] += n;
    acc.total += n;
}

function extractRecords(data) {
    if (!data) return [];
    if (Array.isArray(data)) {
        if (data.length === 1 && data[0] && typeof data[0] === 'object' && Array.isArray(data[0].records)) {
            return data[0].records;
        }
        return data;
    }
    if (Array.isArray(data.records)) return data.records;
    if (data.data && Array.isArray(data.data.records)) return data.data.records;
    return [];
}

function inferYearLabel(records) {
    for (const r of records) {
        const y = r.reportingYear;
        if (y == null) continue;
        const m = String(y).match(/(\d{4})/);
        if (m) return m[1];
    }
    return String(new Date().getFullYear());
}

/**
 * Section B — samples analyzed through mini kit / laboratory / total (+ optional per-state for aggregated).
 */
function resolveSoilWaterSamplesBPayload(data, options = {}) {
    const isAgg = Boolean(options.isAggregatedReport);
    const records = extractRecords(data);
    const yearLabel = inferYearLabel(records);

    if (records.length === 0) {
        return { yearLabel, rows: [], hasData: false };
    }

    if (!isAgg) {
        const acc = emptyBuckets();
        for (const r of records) {
            addToBuckets(acc, r);
        }
        return {
            yearLabel,
            hasData: true,
            rows: [{
                stateName: '',
                mini: acc.mini,
                lab: acc.lab,
                other: acc.other,
                total: acc.total,
            }],
        };
    }

    const byState = new Map();
    for (const r of records) {
        const st = r.stateName && String(r.stateName).trim() ? String(r.stateName).trim() : 'Unknown';
        if (!byState.has(st)) byState.set(st, emptyBuckets());
        addToBuckets(byState.get(st), r);
    }

    const rows = [...byState.entries()]
        .sort((a, b) => sortStr(a[0], b[0]))
        .map(([stateName, acc]) => ({
            stateName,
            mini: acc.mini,
            lab: acc.lab,
            other: acc.other,
            total: acc.total,
        }));

    return { yearLabel, hasData: true, rows };
}

/**
 * State-wise 7 analysis categories + state totals + grand total.
 */
function resolveSoilWaterAnalysisStatePayload(data, options = {}) {
    const records = extractRecords(data);
    const yearLabel = inferYearLabel(records);

    if (records.length === 0) {
        return { yearLabel, stateBlocks: [], grandTotal: { samples: 0, villages: 0, farmers: 0 } };
    }

    const byState = new Map();

    for (const r of records) {
        const st = r.stateName && String(r.stateName).trim() ? String(r.stateName).trim() : 'Unknown';
        const cat = classifyAnalysisCategory(r.analysisName);
        if (!byState.has(st)) {
            byState.set(st, {
                categoryMap: new Map(ANALYSIS_CATEGORIES.map((c) => [c, { samples: 0, villages: 0, farmers: 0 }])),
            });
        }
        const block = byState.get(st);
        const cell = block.categoryMap.get(cat);
        cell.samples += safeInt(r.samplesAnalysed);
        cell.villages += safeInt(r.villagesNumber);
        cell.farmers += totalFarmersBenefitted(r);
    }

    const stateNames = [...byState.keys()].sort(sortStr);
    const stateBlocks = [];
    let gSamples = 0;
    let gVillages = 0;
    let gFarmers = 0;

    for (const stateName of stateNames) {
        const { categoryMap } = byState.get(stateName);
        const rows = ANALYSIS_CATEGORIES.map((category) => {
            const c = categoryMap.get(category);
            return {
                category,
                samples: c.samples,
                villages: c.villages,
                farmers: c.farmers,
            };
        });
        const stSamples = rows.reduce((z, x) => z + x.samples, 0);
        const stVillages = rows.reduce((z, x) => z + x.villages, 0);
        const stFarmers = rows.reduce((z, x) => z + x.farmers, 0);
        gSamples += stSamples;
        gVillages += stVillages;
        gFarmers += stFarmers;
        stateBlocks.push({
            stateName,
            rows,
            stateTotal: { samples: stSamples, villages: stVillages, farmers: stFarmers },
        });
    }

    return {
        yearLabel,
        stateBlocks,
        grandTotal: { samples: gSamples, villages: gVillages, farmers: gFarmers },
    };
}

async function fetchAnalysisRecordsForReport(kvkId, filters = {}) {
    const user = kvkId != null ? { kvkId: String(kvkId) } : null;
    const list = await soilWaterRepository.findAllAnalysis(user);
    let filtered = Array.isArray(list) ? list.filter((row) => rowMatchesReportingFilters(row, filters)) : [];

    const uniqKvkIds = [...new Set(filtered.map((r) => r.kvkId).filter((id) => id != null))]
        .map((id) => parseInt(id, 10))
        .filter((n) => Number.isFinite(n));

    let stateByKvkId = new Map();
    if (uniqKvkIds.length > 0) {
        const kvkRows = await prisma.kvk.findMany({
            where: { kvkId: { in: uniqKvkIds } },
            select: {
                kvkId: true,
                kvkName: true,
                state: { select: { stateName: true } },
            },
        });
        stateByKvkId = new Map(
            kvkRows.map((k) => [
                k.kvkId,
                k.state && k.state.stateName ? String(k.state.stateName).trim() : 'Unknown',
            ]),
        );
    }

    return filtered.map((r) => {
        const kid = r.kvkId != null ? parseInt(r.kvkId, 10) : null;
        const stateName = kid != null && stateByKvkId.has(kid) ? stateByKvkId.get(kid) : 'Unknown';
        const kvkName = (r.kvkName && String(r.kvkName).trim()) || '—';
        return {
            soilWaterAnalysisId: r.soilWaterAnalysisId ?? r.id,
            kvkId: kid,
            kvkName,
            stateName,
            analysisName: r.analysisName || '',
            samplesAnalysedThrough: r.samplesAnalysedThrough || '',
            samplesAnalysed: safeInt(r.samplesAnalysed),
            villagesNumber: safeInt(r.villagesNumber),
            reportingYear: r.reportingYear,
            generalM: r.generalM,
            generalF: r.generalF,
            obcM: r.obcM,
            obcF: r.obcF,
            scM: r.scM,
            scF: r.scF,
            stM: r.stM,
            stF: r.stF,
        };
    });
}

async function getSoilWaterAnalysisReportData(kvkId, filters = {}) {
    const records = await fetchAnalysisRecordsForReport(kvkId, filters);
    return { records };
}

module.exports = {
    getSoilWaterAnalysisReportData,
    fetchAnalysisRecordsForReport,
    resolveSoilWaterSamplesBPayload,
    resolveSoilWaterAnalysisStatePayload,
    extractRecords,
    classifyAnalysisCategory,
    ANALYSIS_CATEGORIES,
};
