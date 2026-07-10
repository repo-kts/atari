const prisma = require('../config/prisma.js');
const cache = require('./cache/redisCacheService.js');
const {
    FISCAL_START_MONTH,
    GEO_DIMENSIONS,
    KVK_FILTERS,
    METRICS,
    groupByKeys,
} = require('../constants/analyticsMetrics.js');

const CACHE_VERSION = 'v1';
const CACHE_TTL_SECONDS = 120;
const FILTERS_CACHE_TTL_SECONDS = 3600;

class AnalyticsError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

/** Fiscal year: 1 Apr YYYY .. 1 Apr YYYY+1 (exclusive). */
function fiscalRange(year) {
    return {
        start: new Date(Date.UTC(year, FISCAL_START_MONTH, 1)),
        endExclusive: new Date(Date.UTC(year + 1, FISCAL_START_MONTH, 1)),
    };
}

function parseYear(raw) {
    if (raw === undefined || raw === null || raw === '') return 'all';
    const s = String(raw).trim().toLowerCase();
    if (s === 'all') return 'all';
    const y = Number(raw);
    if (!Number.isInteger(y) || y < 1900 || y > 3000) {
        throw new AnalyticsError('Invalid reportingYear');
    }
    return y;
}

function parseId(raw, name) {
    if (raw === undefined || raw === null || raw === '' || raw === 'all') return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) {
        throw new AnalyticsError(`Invalid ${name}`);
    }
    return n;
}

/**
 * Resolve the requested grouping into a SQL fragment set.
 *
 * Two shapes:
 *  - geography: the group axis lives on "kvk", so we INNER JOIN the dimension
 *    and LEFT JOIN the metric. Groups with no metric rows survive as
 *    "not started", which is the whole point of the chart.
 *  - metric dimension: the axis lives on the metric row itself, so the metric
 *    join becomes INNER and rows with a NULL FK collapse into "Unspecified".
 */
function resolveGrouping(metricKey, groupBy) {
    const metric = METRICS[metricKey];
    const geo = GEO_DIMENSIONS[groupBy];

    if (geo) {
        return {
            kind: 'geo',
            idExpr: `d."${geo.idCol}"`,
            // orgMaster.org_name is nullable.
            nameExpr: `COALESCE(d."${geo.nameCol}"::text, 'Unnamed')`,
            joinSql: `JOIN "${geo.table}" d ON d."${geo.idCol}" = k."${geo.kvkFk}"`,
            metricJoinType: 'LEFT JOIN',
        };
    }

    const dim = metric.dimensions[groupBy];
    if (!dim) {
        throw new AnalyticsError(`Invalid groupBy for metric ${metricKey}`);
    }

    if (dim.enumCol) {
        return {
            kind: 'enum',
            idExpr: `COALESCE(m."${dim.enumCol}"::text, 'UNSPECIFIED')`,
            nameExpr: `COALESCE(m."${dim.enumCol}"::text, 'Unspecified')`,
            joinSql: '',
            metricJoinType: 'JOIN',
        };
    }

    return {
        kind: 'ref',
        idExpr: `COALESCE(d."${dim.idCol}", -1)`,
        nameExpr: `COALESCE(d."${dim.nameCol}"::text, 'Unspecified')`,
        joinSql: `LEFT JOIN "${dim.table}" d ON d."${dim.idCol}" = m."${dim.metricFk}"`,
        metricJoinType: 'JOIN',
    };
}

/**
 * Build and run the single grouped aggregate.
 *
 * Identifiers come from the registry only. The request selects registry entries
 * by exact key; it never contributes SQL text. Filter *values* are bound as
 * $N parameters through Prisma.sql.
 */
async function runGroupedQuery(metricKey, groupBy, filters) {
    const metric = METRICS[metricKey];
    const grouping = resolveGrouping(metricKey, groupBy);

    // Metric-side predicates live in the JOIN's ON clause. For a LEFT JOIN that
    // is load-bearing: moving them to WHERE would drop the zero-activity groups.
    const metricPredicates = [];
    if (metric.basePredicate) metricPredicates.push(metric.basePredicate);

    const params = [];
    const bind = (value) => {
        params.push(value);
        return `$${params.length}`;
    };

    if (filters.reportingYear !== 'all') {
        const { start, endExclusive } = fiscalRange(filters.reportingYear);
        metricPredicates.push(metric.dateWindow(bind(start), bind(endExclusive)));
    }

    const kvkPredicates = [];
    for (const [param, column] of Object.entries(KVK_FILTERS)) {
        const value = filters[param];
        if (value != null) {
            kvkPredicates.push(`k."${column}" = ${bind(value)}`);
        }
    }

    const metricOn = [`m."${metric.kvkFk}" = k."kvk_id"`, ...metricPredicates].join(' AND ');
    const whereSql = kvkPredicates.length ? `WHERE ${kvkPredicates.join(' AND ')}` : '';

    const measureSql = Object.entries(metric.measures)
        .map(([key, expr]) => `${expr} AS "${key}"`)
        .join(',\n           ');

    const sql = `
        SELECT ${grouping.idExpr} AS "groupId",
               ${grouping.nameExpr} AS "groupName",
               ${measureSql}
        FROM "kvk" k
        ${grouping.kind === 'geo' ? grouping.joinSql : ''}
        ${grouping.metricJoinType} "${metric.table}" m ON ${metricOn}
        ${grouping.kind === 'geo' ? '' : grouping.joinSql}
        ${whereSql}
        GROUP BY 1, 2
        ORDER BY 2 ASC
    `;

    return prisma.$queryRawUnsafe(sql, ...params);
}

function statusFor(records, completed) {
    if (records <= 0) return 'pending';
    if (completed >= records) return 'complete';
    if (completed === 0) return 'pending';
    return 'in-progress';
}

/** Shape rows for StatChartPanel while carrying every measure for offline switching. */
function toRows(metricKey, raw) {
    const metric = METRICS[metricKey];
    const measureNames = Object.keys(metric.measures);

    return raw.map((row) => {
        const measures = {};
        for (const name of measureNames) {
            measures[name] = Number(row[name]) || 0;
        }
        const records = measures.records;
        // A group with no rows is "not started" — one grey bar, matching the
        // existing dashboard's notStarted convention.
        measures.notStarted = records === 0 ? 1 : 0;

        return {
            id: row.groupId,
            name: row.groupName,
            status: statusFor(records, measures.completed),
            primary: measures.completed,
            secondary: records,
            segments: {
                ongoing: measures.ongoing,
                completed: measures.completed,
                notStarted: measures.notStarted,
            },
            measures,
        };
    });
}

/** Totals are summed in JS over <= a few hundred groups — no second query. */
function toTotals(rows) {
    const totals = {};
    for (const row of rows) {
        for (const [key, value] of Object.entries(row.measures)) {
            totals[key] = (totals[key] || 0) + value;
        }
    }
    return totals;
}

function cacheKey(metricKey, groupBy, filters) {
    const parts = Object.keys(KVK_FILTERS)
        .map((k) => `${k}=${filters[k] ?? ''}`)
        .join('|');
    return `analytics:${CACHE_VERSION}:${metricKey}:${groupBy}:y=${filters.reportingYear}|${parts}`;
}

const analyticsService = {
    AnalyticsError,

    listMetrics() {
        return Object.entries(METRICS).map(([key, m]) => ({
            key,
            label: m.label,
            measures: m.measureMeta,
            breakdowns: m.breakdowns,
            groupBy: groupByKeys(key).map((g) => ({
                key: g,
                label: GEO_DIMENSIONS[g]
                    ? { zone: 'Zone', state: 'State', district: 'District', org: 'Institute', kvk: 'KVK' }[g]
                    : m.dimensions[g].label,
            })),
        }));
    },

    /**
     * Whole hierarchy in one query, cached an hour. The client cascades the
     * dropdowns in memory, so changing a filter costs zero network calls.
     */
    async getFilterOptions() {
        return cache.getOrSet(
            `analytics:${CACHE_VERSION}:filters`,
            async () => {
                const kvks = await prisma.kvk.findMany({
                    select: {
                        kvkId: true,
                        kvkName: true,
                        zoneId: true,
                        stateId: true,
                        districtId: true,
                        orgId: true,
                        zone: { select: { zoneName: true } },
                        state: { select: { stateName: true } },
                        district: { select: { districtName: true } },
                        org: { select: { orgName: true } },
                    },
                    orderBy: [{ kvkName: 'asc' }],
                });

                const currentYear = new Date().getFullYear();

                return {
                    yearOptions: Array.from({ length: 20 }, (_, i) => currentYear - i),
                    // Flat list; the client derives each dropdown by filtering it.
                    kvks: kvks.map((k) => ({
                        kvkId: k.kvkId,
                        kvkName: k.kvkName,
                        zoneId: k.zoneId,
                        zoneName: k.zone?.zoneName ?? 'Unnamed',
                        stateId: k.stateId,
                        stateName: k.state?.stateName ?? 'Unnamed',
                        districtId: k.districtId,
                        districtName: k.district?.districtName ?? 'Unnamed',
                        orgId: k.orgId,
                        orgName: k.org?.orgName ?? 'Unnamed',
                    })),
                    metrics: analyticsService.listMetrics(),
                };
            },
            FILTERS_CACHE_TTL_SECONDS
        );
    },

    async getMetricAnalytics(metricKey, query) {
        if (!Object.prototype.hasOwnProperty.call(METRICS, metricKey)) {
            throw new AnalyticsError(`Unknown metric: ${metricKey}`, 404);
        }

        const groupBy = String(query.groupBy || 'zone');
        if (!groupByKeys(metricKey).includes(groupBy)) {
            throw new AnalyticsError(`Invalid groupBy for metric ${metricKey}`);
        }

        const filters = {
            reportingYear: parseYear(query.reportingYear),
            zoneId: parseId(query.zoneId, 'zoneId'),
            stateId: parseId(query.stateId, 'stateId'),
            districtId: parseId(query.districtId, 'districtId'),
            orgId: parseId(query.orgId, 'orgId'),
            kvkId: parseId(query.kvkId, 'kvkId'),
        };

        return cache.getOrSet(
            cacheKey(metricKey, groupBy, filters),
            async () => {
                const raw = await runGroupedQuery(metricKey, groupBy, filters);
                const rows = toRows(metricKey, raw);
                const metric = METRICS[metricKey];
                return {
                    metric: metricKey,
                    label: metric.label,
                    groupBy,
                    reportingYear: filters.reportingYear,
                    filters,
                    rows,
                    totals: toTotals(rows),
                    measures: metric.measureMeta,
                    breakdowns: metric.breakdowns,
                };
            },
            CACHE_TTL_SECONDS
        );
    },
};

module.exports = analyticsService;
