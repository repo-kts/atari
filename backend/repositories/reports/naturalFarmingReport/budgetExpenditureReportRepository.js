const prisma = require('../../../config/prisma.js');

function applyFinancialFilters(where, filters = {}) {
    if (filters.year && !filters.startDate && !filters.endDate) {
        const y = Number(filters.year);
        if (Number.isFinite(y)) {
            where.year = y;
        }
    } else if (filters.startDate || filters.endDate) {
        const g = {};
        if (filters.startDate) {
            const d = new Date(filters.startDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(0, 0, 0, 0);
                g.gte = d;
            }
        }
        if (filters.endDate) {
            const d = new Date(filters.endDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                g.lte = d;
            }
        }
        if (Object.keys(g).length > 0) {
            where.reportingYearDate = g;
        }
    }
}

function parseActivityId(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/** Stable key for grouping: prefer master id, else normalized name. */
function budgetGroupKey(r) {
    const id = parseActivityId(r.activityId);
    if (id != null) return `id:${id}`;
    const name = (r.activityName || '').trim().toLowerCase();
    return name ? `name:${name}` : '__none__';
}

function addMetrics(target, r) {
    target.numberOfActivities += Number(r.numberOfActivities) || 0;
    target.budgetSanction += Number(r.budgetSanction) || 0;
    target.budgetExpenditure += Number(r.budgetExpenditure) || 0;
    target.totalBudgetExpenditure += Number(r.totalBudgetExpenditure) || 0;
}

function normalizeBudgetRecord(raw) {
    if (!raw) return null;
    const activityId = parseActivityId(
        raw.activityId ?? raw.activityMaster?.naturalFarmingActivityId,
    );
    const activityName = (raw.activityName
        ?? raw.activity
        ?? raw.activityMaster?.activityName
        ?? '').trim();
    return {
        activityId,
        activityName,
        numberOfActivities: raw.numberOfActivities ?? raw.noOfActivities ?? 0,
        budgetSanction: raw.budgetSanction ?? 0,
        budgetExpenditure: raw.budgetExpenditure ?? 0,
        totalBudgetExpenditure: raw.totalBudgetExpenditure ?? 0,
    };
}

function sortBudgetRows(rows) {
    return [...rows].sort((a, b) => {
        const la = (a.activityLabel || '').toLowerCase();
        const lb = (b.activityLabel || '').toLowerCase();
        return la.localeCompare(lb, undefined, { sensitivity: 'base' });
    });
}

/**
 * One row per distinct activity (master id or name), labels = exact activity name from data/master.
 */
function buildBudgetPayloadFromRecords(records) {
    const list = Array.isArray(records) ? records : (records ? [records] : []);
    const byKey = new Map();

    for (const raw of list) {
        const r = normalizeBudgetRecord(raw);
        if (!r) continue;
        const key = budgetGroupKey(r);
        if (!byKey.has(key)) {
            byKey.set(key, {
                activityId: r.activityId,
                activityLabel: r.activityName || '—',
                numberOfActivities: 0,
                budgetSanction: 0,
                budgetExpenditure: 0,
                totalBudgetExpenditure: 0,
            });
        }
        const agg = byKey.get(key);
        if (r.activityName && (!agg.activityLabel || agg.activityLabel === '—')) {
            agg.activityLabel = r.activityName;
        }
        addMetrics(agg, r);
    }

    const rows = sortBudgetRows(
        Array.from(byKey.values()).map(
            ({ activityLabel, numberOfActivities, budgetSanction, budgetExpenditure, totalBudgetExpenditure }) => ({
                activityLabel,
                numberOfActivities,
                budgetSanction,
                budgetExpenditure,
                totalBudgetExpenditure,
            }),
        ),
    );

    return { rows };
}

function isBudgetPayload(d) {
    return Boolean(d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.rows));
}

function mergeBudgetPayloads(parts) {
    const byKey = new Map();
    for (const p of parts) {
        if (!p?.rows || !Array.isArray(p.rows)) continue;
        for (const row of p.rows) {
            const id = parseActivityId(row.activityId);
            const nameKey = (row.activityLabel || '').trim().toLowerCase();
            const key = id != null
                ? `id:${id}`
                : (nameKey ? `name:${nameKey}` : '__none__');
            if (!byKey.has(key)) {
                byKey.set(key, {
                    activityId: id,
                    activityLabel: row.activityLabel || '—',
                    numberOfActivities: 0,
                    budgetSanction: 0,
                    budgetExpenditure: 0,
                    totalBudgetExpenditure: 0,
                });
            }
            addMetrics(byKey.get(key), {
                numberOfActivities: row.numberOfActivities,
                budgetSanction: row.budgetSanction,
                budgetExpenditure: row.budgetExpenditure,
                totalBudgetExpenditure: row.totalBudgetExpenditure,
            });
        }
    }
    const rows = sortBudgetRows(
        Array.from(byKey.values()).map(
            ({ activityLabel, numberOfActivities, budgetSanction, budgetExpenditure, totalBudgetExpenditure }) => ({
                activityLabel,
                numberOfActivities,
                budgetSanction,
                budgetExpenditure,
                totalBudgetExpenditure,
            }),
        ),
    );
    return { rows };
}

/**
 * Normalize report/export input (unwrap section wrapper, merge aggregated arrays).
 */
function resolveBudgetTemplatePayload(data) {
    if (!data) return { rows: [] };
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data && isBudgetPayload(d.data)) {
        d = d.data;
    }
    if (isBudgetPayload(d)) {
        return d;
    }
    if (Array.isArray(d)) {
        if (d.length > 0 && d.every((x) => x && isBudgetPayload(x))) {
            return mergeBudgetPayloads(d);
        }
        return buildBudgetPayloadFromRecords(d);
    }
    return buildBudgetPayloadFromRecords([d]);
}

async function getNaturalFarmingBudgetExpenditureData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) {
        where.kvkId = kvkId;
    }
    applyFinancialFilters(where, filters);

    const records = await prisma.financialInformation.findMany({
        where,
        include: {
            activityMaster: true,
        },
        orderBy: [{ reportingYearDate: 'desc' }, { financialInformationId: 'desc' }],
    });

    const flat = records.map((r) => ({
        activityId: r.activityId,
        activityName: r.activityMaster?.activityName || '',
        numberOfActivities: r.numberOfActivities,
        budgetSanction: r.budgetSanction,
        budgetExpenditure: r.budgetExpenditure,
        totalBudgetExpenditure: r.totalBudgetExpenditure,
    }));

    return buildBudgetPayloadFromRecords(flat);
}

module.exports = {
    getNaturalFarmingBudgetExpenditureData,
    buildBudgetPayloadFromRecords,
    resolveBudgetTemplatePayload,
    mergeBudgetPayloads,
};
