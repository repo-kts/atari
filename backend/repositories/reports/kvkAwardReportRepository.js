const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        where.reportingYear = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
        };
    } else if (filters.year) {
        const yearStr = String(filters.year);
        where.reportingYear = {
            gte: new Date(`${yearStr}-01-01`),
            lte: new Date(`${yearStr}-12-31T23:59:59.999Z`),
        };
    }

    return where;
}

/**
 * Rows for modular KVK report: one line per award (detailed layout).
 */
async function getKvkAwardReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.kvkAward.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
        },
        orderBy: [{ reportingYear: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        kvkAwardId: r.kvkAwardId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        districtName: r.kvk?.district?.districtName || '',
        awardName: r.awardName || '',
        amount: r.amount != null ? Number(r.amount) : 0,
        achievement: r.achievement || '',
        conferringAuthority: r.conferringAuthority || '',
    }));
}

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function detailRow(r) {
    const awardRaw = r.awardName ?? r.award;
    return {
        award: (awardRaw != null && String(awardRaw).trim()) || '—',
        amount: safeInt(r.amount),
        achievement: (r.achievement != null && String(r.achievement).trim()) || '—',
        conferringAuthority: (r.conferringAuthority != null && String(r.conferringAuthority).trim()) || '—',
    };
}

/**
 * Detailed, one-row-per-award payload grouped by KVK — mirrors Other Extension
 * Activities. A KVK user sees a single group; admins/superadmin see one group
 * per KVK. Sub-total = award count + amount; grand total only when multi-KVK.
 */
function buildKvkAwardDetailedPayload(data) {
    const records = Array.isArray(data) ? data : data ? [data] : [];

    const byKvk = new Map();
    for (const r of records) {
        const kvkName = (r.kvkName && String(r.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(kvkName)) byKvk.set(kvkName, []);
        byKvk.get(kvkName).push(r);
    }

    let grandCount = 0;
    let grandAmount = 0;
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const list = byKvk.get(kvkName);
        const rows = list.map((r, i) => ({ sno: i + 1, ...detailRow(r) }));
        const amount = rows.reduce((s, x) => s + x.amount, 0);
        grandCount += rows.length;
        grandAmount += amount;
        return { kvkName, rows, subtotal: { count: rows.length, amount } };
    });

    return {
        groups,
        grandTotal: { count: grandCount, amount: grandAmount },
        isMultiKvk: groups.length > 1,
    };
}

function resolveKvkAwardDetailedPayload(data) {
    return buildKvkAwardDetailedPayload(data);
}

module.exports = {
    getKvkAwardReportData,
    buildKvkAwardDetailedPayload,
    resolveKvkAwardDetailedPayload,
};
