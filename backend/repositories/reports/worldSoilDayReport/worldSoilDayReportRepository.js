/**
 * World Soil Day — `kvk_world_soil_celebration`.
 * KVK / modular: detail table (activities, cards, farmers, VIPs, participants).
 * Aggregated: state-wise summary (KVK counts and sums).
 */
const soilWaterRepository = require('../../forms/soilWaterRepository.js');
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

function farmersBenefittedFromRow(r) {
    return (
        safeInt(r.generalM)
        + safeInt(r.generalF)
        + safeInt(r.obcM)
        + safeInt(r.obcF)
        + safeInt(r.scM)
        + safeInt(r.scF)
        + safeInt(r.stM)
        + safeInt(r.stF)
    );
}

function vipCountFromNames(vipNames) {
    if (vipNames == null || String(vipNames).trim() === '') return 0;
    return String(vipNames)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean).length;
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

// Per-record display year, derived from the record's own reportingYear.
function rowYearLabel(reportingYear) {
    if (reportingYear == null || reportingYear === '') return '';
    const m = String(reportingYear).match(/(\d{4})/);
    if (m) return m[1];
    const d = new Date(reportingYear);
    return Number.isNaN(d.getTime()) ? '' : String(d.getFullYear());
}

function normalizeRow(r, stateNameFallback) {
    const stateName = (r.stateName != null && String(r.stateName).trim() !== '')
        ? String(r.stateName).trim()
        : (stateNameFallback != null && String(stateNameFallback).trim() !== ''
            ? String(stateNameFallback).trim()
            : 'Unknown');
    return {
        worldSoilCelebrationId: r.worldSoilCelebrationId ?? r.id,
        kvkId: r.kvkId != null ? parseInt(r.kvkId, 10) : null,
        kvkName: (r.kvkName && String(r.kvkName).trim()) || '—',
        stateName,
        activitiesConducted: safeInt(r.activitiesConducted),
        soilHealthCardDistributed: safeInt(r.soilHealthCardDistributed),
        vipNames: String(r.vipNames || '').trim(),
        participants: safeInt(r.participants),
        farmersBenefitted: farmersBenefittedFromRow(r),
        vipCount: vipCountFromNames(r.vipNames),
        reportingYear: r.reportingYear,
        // category-wise farmer beneficiaries (carried through for the detail report)
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

function buildKvkDetailRows(records) {
    const sorted = [...records].sort(
        (a, b) => safeInt(b.worldSoilCelebrationId) - safeInt(a.worldSoilCelebrationId),
    );
    return sorted.map((r, i) => ({
        sl: i + 1,
        activitiesConducted: r.activitiesConducted,
        soilHealthCards: r.soilHealthCardDistributed,
        farmersBenefitted: r.farmersBenefitted,
        vipCount: r.vipCount,
        vipNames: r.vipNames || '—',
        participants: r.participants,
    }));
}

/** Rows from `fetchWorldSoilDayRecordsForReport` are already normalized; raw API rows are not. */
function ensureNormalizedRecord(r) {
    if (r && r.stateName != null && typeof r.farmersBenefitted === 'number') {
        return {
            ...r,
            vipCount: r.vipCount != null ? safeInt(r.vipCount) : vipCountFromNames(r.vipNames),
        };
    }
    return normalizeRow(r, r && r.stateName);
}

function buildStateSummaryFromRecords(records) {
    const norm = Array.isArray(records) ? records.map((r) => ensureNormalizedRecord(r)) : [];
    const yearLabel = inferYearLabel(norm);
    const byState = new Map();

    for (const r of norm) {
        const st = r.stateName && String(r.stateName).trim() ? String(r.stateName).trim() : 'Unknown';
        if (!byState.has(st)) {
            byState.set(st, {
                stateName: st,
                kvks: new Set(),
                activitiesConducted: 0,
                farmersBenefitted: 0,
                participants: 0,
            });
        }
        const b = byState.get(st);
        if (r.kvkId != null) {
            b.kvks.add(`id:${Number(r.kvkId)}`);
        } else if (r.kvkName && r.kvkName !== '—') {
            b.kvks.add(`name:${String(r.kvkName).trim().toLowerCase()}`);
        }
        b.activitiesConducted += safeInt(r.activitiesConducted);
        b.farmersBenefitted += safeInt(r.farmersBenefitted);
        b.participants += safeInt(r.participants);
    }

    // BLA-60: the Zone IV summary must always present Bihar and Jharkhand in
    // the agreed order, including a zero row when one state has no records.
    const requestedStates = ['Bihar', 'Jharkhand'];
    const rows = requestedStates.map((stateName) => {
        const match = [...byState.values()].find(
            (entry) => entry.stateName.toLowerCase() === stateName.toLowerCase(),
        );
        return {
            stateName,
            noOfKvks: match ? match.kvks.size : 0,
            activitiesConducted: match ? match.activitiesConducted : 0,
            farmersBenefitted: match ? match.farmersBenefitted : 0,
            participants: match ? match.participants : 0,
        };
    });

    const grandTotal = rows.reduce((total, row) => ({
        stateName: 'Total',
        noOfKvks: total.noOfKvks + safeInt(row.noOfKvks),
        activitiesConducted: total.activitiesConducted + safeInt(row.activitiesConducted),
        farmersBenefitted: total.farmersBenefitted + safeInt(row.farmersBenefitted),
        participants: total.participants + safeInt(row.participants),
    }), {
        stateName: 'Total',
        noOfKvks: 0,
        activitiesConducted: 0,
        farmersBenefitted: 0,
        participants: 0,
    });

    return { yearLabel, rows, grandTotal, layout: 'state' };
}

function buildPagePayloadFromRecords(records, isAggregatedReport) {
    const normBase = Array.isArray(records) ? records : [];
    const yearLabel = inferYearLabel(normBase);

    if (isAggregatedReport) {
        return buildStateSummaryFromRecords(normBase);
    }

    const norm = normBase.map((r) => ensureNormalizedRecord(r));
    const rows = buildKvkDetailRows(norm);
    return { yearLabel, rows, layout: 'kvk' };
}

function extractRecords(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.records)) return data.records;
    if (data.data && Array.isArray(data.data.records)) return data.data.records;
    return [];
}

function resolveWorldSoilDayPagePayload(data, options = {}) {
    const isAgg = Boolean(options.isAggregatedReport);
    const records = extractRecords(data);
    return buildPagePayloadFromRecords(records, isAgg);
}

// KVK-wise detail (no year sectioning, no state aggregation). Each KVK gets its
// own detail block + total; admins (multi-KVK) see every KVK separately with
// a total for each block and a grand total. Same shape used by PDF / Excel / Word.
function sumDetailRows(rows, label) {
    const z = {
        label,
        activitiesConducted: 0,
        soilHealthCards: 0,
        genM: 0, genF: 0, genT: 0,
        obcM: 0, obcF: 0, obcT: 0,
        scM: 0, scF: 0, scT: 0,
        stM: 0, stF: 0, stT: 0,
        vipCount: 0,
        participants: 0,
        vipNames: '',
    };
    for (const r of rows) {
        z.activitiesConducted += safeInt(r.activitiesConducted);
        z.soilHealthCards += safeInt(r.soilHealthCards);
        z.genM += safeInt(r.genM); z.genF += safeInt(r.genF); z.genT += safeInt(r.genT);
        z.obcM += safeInt(r.obcM); z.obcF += safeInt(r.obcF); z.obcT += safeInt(r.obcT);
        z.scM += safeInt(r.scM); z.scF += safeInt(r.scF); z.scT += safeInt(r.scT);
        z.stM += safeInt(r.stM); z.stF += safeInt(r.stF); z.stT += safeInt(r.stT);
        z.vipCount += safeInt(r.vipCount);
        z.participants += safeInt(r.participants);
    }
    return z;
}

function buildKvkGroupedDetailPayload(records) {
    const norm = Array.isArray(records) ? records.map((r) => ensureNormalizedRecord(r)) : [];

    const byKvk = new Map();
    for (const r of norm) {
        const k = (r.kvkName && r.kvkName !== '—') ? r.kvkName : 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }

    const isMultiKvk = byKvk.size > 1;
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const list = [...byKvk.get(kvkName)].sort(
            (a, b) => safeInt(b.worldSoilCelebrationId) - safeInt(a.worldSoilCelebrationId),
        );
        const rows = list.map((r, i) => {
            const genM = safeInt(r.generalM);
            const genF = safeInt(r.generalF);
            const obcM = safeInt(r.obcM);
            const obcF = safeInt(r.obcF);
            const scM = safeInt(r.scM);
            const scF = safeInt(r.scF);
            const stM = safeInt(r.stM);
            const stF = safeInt(r.stF);
            return {
                sl: i + 1,
                year: rowYearLabel(r.reportingYear),
                activitiesConducted: r.activitiesConducted,
                soilHealthCards: r.soilHealthCardDistributed,
                genM, genF, genT: genM + genF,
                obcM, obcF, obcT: obcM + obcF,
                scM, scF, scT: scM + scF,
                stM, stF, stT: stM + stF,
                vipCount: r.vipCount,
                vipNames: r.vipNames || '—',
                participants: r.participants,
            };
        });
        return { kvkName, rows, subtotal: sumDetailRows(rows, 'Total') };
    });

    const grandTotal = sumDetailRows(groups.flatMap((g) => g.rows), 'Grand Total (all KVKs)');
    return { groups, grandTotal, isMultiKvk };
}

function resolveWorldSoilDayGroupedPayload(data) {
    const records = extractRecords(data);
    return buildKvkGroupedDetailPayload(records);
}

function resolveWorldSoilDayStateSummaryPayload(data) {
    if (!data) return buildStateSummaryFromRecords([]);
    if (data.stateSummaryPayload) return data.stateSummaryPayload;
    if (data.data && data.data.stateSummaryPayload) return data.data.stateSummaryPayload;
    return buildStateSummaryFromRecords(extractRecords(data));
}

async function fetchWorldSoilDayRecordsForReport(kvkId, filters = {}) {
    const user = kvkId != null ? { kvkId: String(kvkId) } : null;
    const list = await soilWaterRepository.findAllWorldSoilDay(user);
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
        return normalizeRow(r, stateName);
    });
}

async function getWorldSoilDayReportData(kvkId, filters = {}) {
    const records = await fetchWorldSoilDayRecordsForReport(kvkId, filters);
    const stateSummaryPayload = buildStateSummaryFromRecords(records);
    return { records, stateSummaryPayload };
}

module.exports = {
    getWorldSoilDayReportData,
    fetchWorldSoilDayRecordsForReport,
    buildPagePayloadFromRecords,
    buildStateSummaryFromRecords,
    buildKvkGroupedDetailPayload,
    resolveWorldSoilDayPagePayload,
    resolveWorldSoilDayGroupedPayload,
    resolveWorldSoilDayStateSummaryPayload,
    normalizeRow,
};
