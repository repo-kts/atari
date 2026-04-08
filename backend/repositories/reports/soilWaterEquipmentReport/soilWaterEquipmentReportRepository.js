/**
 * Soil & water testing — laboratory equipment (`KvkSoilWaterEquipment`).
 * PDF/HTML: Sl., Name of the Equipment, Qty; aggregated adds State and KVK columns.
 */
const prisma = require('../../../config/prisma.js');
const soilWaterRepository = require('../../forms/soilWaterRepository.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { formatReportingYear } = require('../../../utils/reportingYearUtils.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
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

function mapPrismaRowToReportRow(r) {
    if (!r) return null;
    const reportingYear = formatReportingYear(r.reportingYear);
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        ? String(r.kvk.state.stateName).trim()
        : 'Unknown';
    const kvkName = (r.kvk && r.kvk.kvkName) ? String(r.kvk.kvkName).trim() : '—';
    return {
        soilWaterEquipmentId: r.soilWaterEquipmentId,
        kvkId: r.kvkId,
        stateName,
        kvkName,
        equipmentName: String(r.equipmentName || '').trim(),
        quantity: safeInt(r.quantity),
        reportingYear,
    };
}

function normalizeFlexibleRow(r) {
    if (r && r.kvk) {
        return mapPrismaRowToReportRow(r);
    }
    return {
        soilWaterEquipmentId: r.soilWaterEquipmentId ?? r.id,
        kvkId: r.kvkId,
        stateName: r.stateName ? String(r.stateName).trim() : 'Unknown',
        kvkName: r.kvkName ? String(r.kvkName).trim() : '—',
        equipmentName: String(r.equipmentName ?? r.name ?? '').trim(),
        quantity: safeInt(r.quantity ?? r.qty),
        reportingYear: r.reportingYear,
    };
}

function buildPagePayloadFromRecords(records, isAggregatedReport) {
    const norm = Array.isArray(records) ? records.map((x) => normalizeFlexibleRow(x)) : [];
    const yearLabel = inferYearLabel(norm);

    if (isAggregatedReport) {
        const sorted = [...norm].sort((a, b) => {
            const s = sortStr(a.stateName, b.stateName);
            if (s !== 0) return s;
            const k = sortStr(a.kvkName, b.kvkName);
            if (k !== 0) return k;
            return sortStr(a.equipmentName, b.equipmentName);
        });
        const rows = sorted.map((r, i) => ({
            stateName: r.stateName || 'Unknown',
            kvkName: r.kvkName || '—',
            sl: i + 1,
            name: r.equipmentName || '—',
            qty: safeInt(r.quantity),
        }));
        return { yearLabel, rows };
    }

    const sorted = [...norm].sort((a, b) => sortStr(a.equipmentName, b.equipmentName));
    const rows = sorted.map((r, i) => ({
        sl: i + 1,
        name: r.equipmentName || '—',
        qty: safeInt(r.quantity),
    }));
    return { yearLabel, rows };
}

function extractRecords(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.records)) return data.records;
    if (data.data && Array.isArray(data.data.records)) return data.data.records;
    return [];
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

function resolveSoilWaterEquipmentPagePayload(data, options = {}) {
    const isAgg = Boolean(options.isAggregatedReport);
    const records = extractRecords(data);
    return buildPagePayloadFromRecords(records, isAgg);
}

async function fetchSoilWaterEquipmentRecordsForReport(kvkId, filters = {}) {
    // Use the same SQL path as the equipment list so modular reports match Data Management.
    const user = kvkId != null ? { kvkId: String(kvkId) } : null;
    const list = await soilWaterRepository.findAllEquipment(user);
    let filtered = Array.isArray(list) ? list.filter((row) => rowMatchesReportingFilters(row, filters)) : [];

    const uniqKvkIds = [...new Set(filtered.map((r) => r.kvkId).filter((id) => id != null))].map((id) => parseInt(id, 10)).filter((n) => Number.isFinite(n));
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

    filtered.sort((a, b) => sortStr(a.equipmentName, b.equipmentName));

    return filtered.map((r) => {
        const kid = r.kvkId != null ? parseInt(r.kvkId, 10) : null;
        const stateName = kid != null && stateByKvkId.has(kid) ? stateByKvkId.get(kid) : 'Unknown';
        const kvkName = (r.kvkName && String(r.kvkName).trim()) || '—';
        return {
            soilWaterEquipmentId: r.soilWaterEquipmentId ?? r.id,
            kvkId: kid,
            stateName,
            kvkName,
            equipmentName: String(r.equipmentName || '').trim(),
            quantity: safeInt(r.quantity),
            reportingYear: r.reportingYear,
        };
    });
}

async function getSoilWaterEquipmentReportData(kvkId, filters = {}) {
    const records = await fetchSoilWaterEquipmentRecordsForReport(kvkId, filters);
    return { records };
}

module.exports = {
    getSoilWaterEquipmentReportData,
    fetchSoilWaterEquipmentRecordsForReport,
    buildPagePayloadFromRecords,
    resolveSoilWaterEquipmentPagePayload,
    mapPrismaRowToReportRow,
};
