const prisma = require('../config/prisma.js');
const { normalizeReportingYearPayload, isStrictDateString } = require('../utils/reportingYearUtils.js');
const { ValidationError } = require('../utils/errorHandler.js');

const CACHE_TTL_MS = 60 * 1000;
let cachedYears = null;
let cacheExpiresAt = 0;
let inFlightFetch = null;

function shouldSkipNormalization(req) {
    const path = req.path || '';
    return path.startsWith('/miscellaneous/ppv-fra');
}

async function fetchYearRows() {
    const now = Date.now();
    if (cachedYears && now < cacheExpiresAt) {
        return cachedYears;
    }

    if (inFlightFetch) {
        return inFlightFetch;
    }

    inFlightFetch = prisma.yearMaster.findMany({
        select: { yearId: true, yearName: true },
        orderBy: { yearId: 'asc' },
    })
        .then((rows) => {
            cachedYears = rows;
            cacheExpiresAt = Date.now() + CACHE_TTL_MS;
            return rows;
        })
        .finally(() => {
            inFlightFetch = null;
        });

    return inFlightFetch;
}

async function normalizeReportingYearRequest(req, _res, next) {
    try {
        if (shouldSkipNormalization(req)) {
            return next();
        }

        const shouldProcessBody =
            (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
            req.body &&
            typeof req.body === 'object' &&
            !Array.isArray(req.body);

        const shouldProcessQuery =
            req.query &&
            typeof req.query === 'object' &&
            Object.keys(req.query).length > 0;

        if (!shouldProcessBody && !shouldProcessQuery) {
            return next();
        }

        const yearRows = await fetchYearRows();

        if (shouldProcessBody) {
            const result = normalizeReportingYearPayload(req.body, yearRows, {
                stripUnresolvedLegacyFields: false,
            });
            validateStrictReportingYear(req.body, result);
        }

        if (shouldProcessQuery) {
            const result = normalizeReportingYearPayload(req.query, yearRows, {
                stripUnresolvedLegacyFields: false,
            });
            validateStrictReportingYear(req.query, result);
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

function hasReportingYearKeys(payload) {
    return (
        Object.prototype.hasOwnProperty.call(payload, 'reportingYear') ||
        Object.prototype.hasOwnProperty.call(payload, 'reportingYearId') ||
        Object.prototype.hasOwnProperty.call(payload, 'year') ||
        Object.prototype.hasOwnProperty.call(payload, 'yearId')
    );
}

function isExplicitClearValue(value) {
    return value === null || value === '';
}

function isClearIntent(payload) {
    const values = [
        payload.reportingYearId,
        payload.yearId,
        payload.reportingYear,
        payload.year,
    ].filter((value) => value !== undefined);

    return values.length > 0 && values.every(isExplicitClearValue);
}

function validateStrictReportingYear(payload, normalizationResult) {
    if (!payload || typeof payload !== 'object') return;
    if (!hasReportingYearKeys(payload)) return;
    if (isClearIntent(payload)) return;
    if (normalizationResult && normalizationResult.resolvedId !== null) return;
    if (typeof payload.reportingYear === 'string' && isStrictDateString(payload.reportingYear)) return;
    if (typeof payload.year === 'string' && isStrictDateString(payload.year)) return;
    if (
        payload.reportingYearId !== undefined &&
        payload.reportingYearId !== null &&
        payload.reportingYearId !== '' &&
        !Number.isNaN(parseInt(payload.reportingYearId, 10))
    ) return;
    if (
        payload.yearId !== undefined &&
        payload.yearId !== null &&
        payload.yearId !== '' &&
        !Number.isNaN(parseInt(payload.yearId, 10))
    ) return;

    throw new ValidationError(
        'reportingYear must be a valid date in YYYY-MM-DD format (or provide a valid reportingYearId)',
        'reportingYear'
    );
}

module.exports = {
    normalizeReportingYearRequest,
};
