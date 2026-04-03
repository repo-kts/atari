const prisma = require('../../config/prisma.js');
const { sanitizeForPrisma, sanitizeInteger, sanitizeBoolean, safeGet, removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError, translatePrismaError } = require('../../utils/errorHandler.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const fpoCbboDetailsRepository = {
    create: async (data, user) => {
        // Validate input
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ValidationError('Invalid data: must be an object');
        }

        const kvkId = sanitizeInteger(safeGet(user, 'kvkId') || safeGet(data, 'kvkId'), { defaultValue: 1 });

        try {
            const createData = {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(safeGet(data, 'reportingYear'));
                    ensureNotFutureDate(d);
                    return d;
                })(),
                blocksAllocated: sanitizeInteger(safeGet(data, 'blocksAllocated'), { defaultValue: 0 }),
                fposRegisteredAsCbbo: sanitizeInteger(safeGet(data, 'fposRegisteredAsCbbo'), { defaultValue: 0 }),
                avgMembersPerFpo: sanitizeInteger(safeGet(data, 'avgMembersPerFpo'), { defaultValue: 0 }),
                fposReceivedManagementCost: sanitizeInteger(safeGet(data, 'fposReceivedMgmtCost') || safeGet(data, 'fposReceivedManagementCost'), { defaultValue: 0 }),
                fposReceivedEquityGrant: sanitizeInteger(safeGet(data, 'fposReceivedEquityGrant'), { defaultValue: 0 }),
                techBackstoppingProvided: sanitizeInteger(safeGet(data, 'techBackstoppingFpos') || safeGet(data, 'techBackstoppingProvided'), { defaultValue: 0 }),
                trainingProgrammeOrganized: sanitizeInteger(safeGet(data, 'trainingProgsOrganized') || safeGet(data, 'trainingProgrammeOrganized'), { defaultValue: 0 }),
                trainingReceivedByMembers: sanitizeBoolean(safeGet(data, 'trainingReceivedByMembers'), false),
                assistanceInEconomicActivities: sanitizeInteger(safeGet(data, 'assistanceEconomicActivities') || safeGet(data, 'assistanceInEconomicActivities'), { defaultValue: 0 }),
                businessPlanPreparedWithCbbo: sanitizeBoolean(safeGet(data, 'businessPlanCbbo') || safeGet(data, 'businessPlanPreparedWithCbbo'), false),
                businessPlanPreparedWithoutCbbo: sanitizeBoolean(safeGet(data, 'businessPlanWithoutCbbo') || safeGet(data, 'businessPlanPreparedWithoutCbbo'), false),
                fposDoingBusiness: sanitizeInteger(safeGet(data, 'fposDoingBusiness'), { defaultValue: 0 }),
            };

            // CRITICAL: Remove ID fields from createData - Prisma doesn't accept them in data object
            const finalCreateData = removeIdFieldsForUpdate(createData, ['fpoCbboDetailsId', 'id']);

            const result = await prisma.fpoCbboDetails.create({
                data: finalCreateData,
                include: {
                    kvk: { select: { kvkName: true } },
                }
            });

            return _mapResponse(result);
        } catch (error) {
            throw translatePrismaError(error, 'FPOCbboDetails', 'create');
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        const results = await prisma.fpoCbboDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { fpoCbboDetailsId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.fpoCbboDetails.findUnique({
            where: { fpoCbboDetailsId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        // Validate input
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ValidationError('Invalid data: must be an object');
        }

        const parsedId = sanitizeInteger(id);
        if (!parsedId || parsedId <= 0) {
            throw new ValidationError(`Invalid ID: ${id}`);
        }

        const updateData = {};

        if (safeGet(data, 'reportingYear') !== undefined) {
            updateData.reportingYear = parseReportingYearDate(safeGet(data, 'reportingYear'));
            ensureNotFutureDate(updateData.reportingYear);
        }
        if (safeGet(data, 'blocksAllocated') !== undefined) updateData.blocksAllocated = sanitizeInteger(safeGet(data, 'blocksAllocated'));
        if (safeGet(data, 'fposRegisteredAsCbbo') !== undefined) updateData.fposRegisteredAsCbbo = sanitizeInteger(safeGet(data, 'fposRegisteredAsCbbo'));
        if (safeGet(data, 'avgMembersPerFpo') !== undefined) updateData.avgMembersPerFpo = sanitizeInteger(safeGet(data, 'avgMembersPerFpo'));
        if (safeGet(data, 'fposReceivedMgmtCost') !== undefined || safeGet(data, 'fposReceivedManagementCost') !== undefined) {
            updateData.fposReceivedManagementCost = sanitizeInteger(safeGet(data, 'fposReceivedMgmtCost') || safeGet(data, 'fposReceivedManagementCost'));
        }
        if (safeGet(data, 'fposReceivedEquityGrant') !== undefined) updateData.fposReceivedEquityGrant = sanitizeInteger(safeGet(data, 'fposReceivedEquityGrant'));
        if (safeGet(data, 'techBackstoppingFpos') !== undefined || safeGet(data, 'techBackstoppingProvided') !== undefined) {
            updateData.techBackstoppingProvided = sanitizeInteger(safeGet(data, 'techBackstoppingFpos') || safeGet(data, 'techBackstoppingProvided'));
        }
        if (safeGet(data, 'trainingProgsOrganized') !== undefined || safeGet(data, 'trainingProgrammeOrganized') !== undefined) {
            updateData.trainingProgrammeOrganized = sanitizeInteger(safeGet(data, 'trainingProgsOrganized') || safeGet(data, 'trainingProgrammeOrganized'));
        }
        if (safeGet(data, 'trainingReceivedByMembers') !== undefined) {
            updateData.trainingReceivedByMembers = sanitizeBoolean(safeGet(data, 'trainingReceivedByMembers'), false);
        }
        if (safeGet(data, 'assistanceEconomicActivities') !== undefined || safeGet(data, 'assistanceInEconomicActivities') !== undefined) {
            updateData.assistanceInEconomicActivities = sanitizeInteger(safeGet(data, 'assistanceEconomicActivities') || safeGet(data, 'assistanceInEconomicActivities'));
        }
        if (safeGet(data, 'businessPlanCbbo') !== undefined || safeGet(data, 'businessPlanPreparedWithCbbo') !== undefined) {
            updateData.businessPlanPreparedWithCbbo = sanitizeBoolean(safeGet(data, 'businessPlanCbbo') || safeGet(data, 'businessPlanPreparedWithCbbo'), false);
        }
        if (safeGet(data, 'businessPlanWithoutCbbo') !== undefined || safeGet(data, 'businessPlanPreparedWithoutCbbo') !== undefined) {
            updateData.businessPlanPreparedWithoutCbbo = sanitizeBoolean(safeGet(data, 'businessPlanWithoutCbbo') || safeGet(data, 'businessPlanPreparedWithoutCbbo'), false);
        }
        if (safeGet(data, 'fposDoingBusiness') !== undefined) updateData.fposDoingBusiness = sanitizeInteger(safeGet(data, 'fposDoingBusiness'));

        if (Object.keys(updateData).length === 0) {
            throw new ValidationError('No valid fields provided for update');
        }

        // CRITICAL: Remove ID fields from updateData - Prisma doesn't accept them in data object
        const finalUpdateData = removeIdFieldsForUpdate(updateData, ['fpoCbboDetailsId', 'id']);

        try {
            const result = await prisma.fpoCbboDetails.update({
                where: { fpoCbboDetailsId: parsedId },
                data: finalUpdateData,
                include: {
                    kvk: { select: { kvkName: true } },
                }
            });

            return _mapResponse(result);
        } catch (error) {
            throw translatePrismaError(error, 'FPOCbboDetails', 'update');
        }
    },

    delete: async (id) => {
        const parsedId = sanitizeInteger(id);
        if (!parsedId || parsedId <= 0) {
            throw new ValidationError(`Invalid ID: ${id}`);
        }

        try {
            return await prisma.fpoCbboDetails.delete({
                where: { fpoCbboDetailsId: parsedId }
            });
        } catch (error) {
            throw translatePrismaError(error, 'FPOCbboDetails', 'delete');
        }
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.fpoCbboDetailsId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYear: formatReportingYear(r.reportingYear),
        blocksAllocated: r.blocksAllocated,
        fposRegisteredAsCbbo: r.fposRegisteredAsCbbo,
        avgMembersPerFpo: r.avgMembersPerFpo,
        fposReceivedManagementCost: r.fposReceivedManagementCost,
        fposReceivedMgmtCost: r.fposReceivedManagementCost, // Frontend alias
        fposReceivedEquityGrant: r.fposReceivedEquityGrant,
        techBackstoppingProvided: r.techBackstoppingProvided,
        techBackstoppingFpos: r.techBackstoppingProvided, // Frontend alias
        trainingProgrammeOrganized: r.trainingProgrammeOrganized,
        trainingProgsOrganized: r.trainingProgrammeOrganized, // Frontend alias
        trainingReceivedByMembers: r.trainingReceivedByMembers ? 'Yes' : 'No', // Frontend expected string
        assistanceInEconomicActivities: r.assistanceInEconomicActivities,
        assistanceEconomicActivities: r.assistanceInEconomicActivities, // Frontend alias
        businessPlanPreparedWithCbbo: r.businessPlanPreparedWithCbbo,
        businessPlanCbbo: r.businessPlanPreparedWithCbbo ? 'Yes' : 'No', // Frontend alias
        businessPlanPreparedWithoutCbbo: r.businessPlanPreparedWithoutCbbo,
        businessPlanWithoutCbbo: r.businessPlanPreparedWithoutCbbo ? 'Yes' : 'No', // Frontend alias
        fposDoingBusiness: r.fposDoingBusiness,
    };
}

module.exports = fpoCbboDetailsRepository;
