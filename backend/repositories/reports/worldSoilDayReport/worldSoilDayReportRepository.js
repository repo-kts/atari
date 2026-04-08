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
                kvkIds: new Set(),
                farmersBenefitted: 0,
                soilHealthCards: 0,
                participants: 0,
                vipsAttended: 0,
            });
        }
        const b = byState.get(st);
        if (r.kvkId != null) b.kvkIds.add(Number(r.kvkId));
        b.farmersBenefitted += safeInt(r.farmersBenefitted);
        b.soilHealthCards += safeInt(r.soilHealthCardDistributed);
        b.participants += safeInt(r.participants);
        b.vipsAttended += safeInt(r.vipCount);
    }

    const rows = [...byState.values()]
        .sort((a, b) => sortStr(a.stateName, b.stateName))
        .map((b) => ({
            stateName: b.stateName,
            noOfKvks: b.kvkIds.size,
            farmersBenefitted: b.farmersBenefitted,
            soilHealthCards: b.soilHealthCards,
            participants: b.participants,
            vipsAttended: b.vipsAttended,
        }));

    return { yearLabel, rows, layout: 'state' };
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
    resolveWorldSoilDayPagePayload,
    normalizeRow,
};
