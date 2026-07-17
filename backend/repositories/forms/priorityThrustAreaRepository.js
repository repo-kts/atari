const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');
const { ValidationError, translatePrismaError } = require('../../utils/errorHandler.js');

const { buildFormListOrderBy, sortFormListRows } = require('../../utils/formListOrderBy.js');

const KVK_SCOPED_ROLES = ['kvk_admin', 'kvk_user'];
const PRISMA_RESOURCE = 'Priority thrust area';

function isKvkScopedUser(user) {
    return Boolean(user && KVK_SCOPED_ROLES.includes(user.roleName));
}

function isPrismaClientError(error) {
    return typeof error?.code === 'string' && /^P\d{4}$/.test(error.code);
}

/** Maps Prisma/unexpected errors to friendly app errors; rethrows domain errors as-is. */
async function withRepoErrors(operation, fn) {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof ValidationError ||
            (typeof error.statusCode === 'number' && error.statusCode < 500)) {
            throw error;
        }
        if (isPrismaClientError(error)) {
            throw translatePrismaError(error, PRISMA_RESOURCE, operation);
        }
        throw error;
    }
}

function parseRequiredKvkId(data, user) {
    const source = isKvkScopedUser(user) ? user.kvkId : data.kvkId;
    const kvkId = source !== undefined && source !== null ? parseInt(source, 10) : NaN;
    if (Number.isNaN(kvkId) || kvkId < 1) {
        throw new ValidationError('Valid kvkId is required', 'kvkId');
    }
    return kvkId;
}

/** Trims and enforces a non-empty text value for a required field. */
function requireText(value, field, label) {
    const text = String(value ?? '').trim();
    if (text === '') {
        throw new ValidationError(`${label} is required`, field);
    }
    return text;
}

function parseReportingYear(value) {
    const d = parseReportingYearDate(value);
    ensureNotFutureDate(d);
    return d;
}

const priorityThrustAreaRepository = {
    create: async (data, user) => withRepoErrors('create', async () => {
        const kvkId = parseRequiredKvkId(data, user);

        const created = await prisma.priorityThrustArea.create({
            data: {
                kvkId,
                reportingYear: parseReportingYear(data.reportingYear),
                thrustArea: requireText(data.thrustArea, 'thrustArea', 'Thrust area'),
                majorFocus: requireText(data.majorFocus, 'majorFocus', 'Major Focus'),
                achievement: requireText(data.achievement, 'achievement', 'Achievement'),
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', kvkId);
        return created;
    }),

    findAll: async (filters = {}, user) => {
        const where = {};
        if (isKvkScopedUser(user)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const _sortRows = await prisma.priorityThrustArea.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: buildFormListOrderBy(user, { reportingYear: true, kvkRelation: 'kvk', createdAt: true, tiebreak: 'priorityThrustAreaId' })
        });
        return sortFormListRows(_sortRows, user, { tiebreak: 'priorityThrustAreaId' });
    },

    findById: async (id, user) => {
        const where = { priorityThrustAreaId: id };
        if (isKvkScopedUser(user)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.priorityThrustArea.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => withRepoErrors('update', async () => {
        const where = { priorityThrustAreaId: id };
        if (isKvkScopedUser(user)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new ValidationError('Record not found or unauthorized');

        const updated = await prisma.priorityThrustArea.update({
            where: { priorityThrustAreaId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? parseReportingYear(data.reportingYear)
                    : existing.reportingYear,
                thrustArea: data.thrustArea !== undefined
                    ? requireText(data.thrustArea, 'thrustArea', 'Thrust area')
                    : existing.thrustArea,
                majorFocus: data.majorFocus !== undefined
                    ? requireText(data.majorFocus, 'majorFocus', 'Major Focus')
                    : existing.majorFocus,
                achievement: data.achievement !== undefined
                    ? requireText(data.achievement, 'achievement', 'Achievement')
                    : existing.achievement,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', existing.kvkId);
        return updated;
    }),

    delete: async (id, user) => withRepoErrors('delete', async () => {
        const where = { priorityThrustAreaId: id };
        if (isKvkScopedUser(user)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new ValidationError('Record not found or unauthorized');

        const removed = await prisma.priorityThrustArea.delete({
            where: { priorityThrustAreaId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', existing.kvkId);
        return removed;
    })
};

module.exports = priorityThrustAreaRepository;
