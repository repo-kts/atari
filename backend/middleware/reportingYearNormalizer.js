const prisma = require('../config/prisma.js');
const { normalizeReportingYearPayload } = require('../utils/reportingYearUtils.js');

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
            normalizeReportingYearPayload(req.body, yearRows, {
                stripUnresolvedLegacyFields: true,
            });
        }

        if (shouldProcessQuery) {
            normalizeReportingYearPayload(req.query, yearRows, {
                stripUnresolvedLegacyFields: false,
            });
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    normalizeReportingYearRequest,
};
