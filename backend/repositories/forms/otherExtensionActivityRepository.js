const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    parseDate,
    validateDateRange,
    validateKvkExists,
    validateFldExists,
    resolveStaffId,
    resolveOtherExtensionActivityTypeId,
} = require('../../utils/repositoryHelpers.js');

const otherExtensionActivityRepository = {
    create: async (data, opts, user) => {
        try {
            // Validate input data
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
            let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);

            if (!kvkId || isNaN(kvkId)) {
                throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            }
            kvkId = parseInt(kvkId);

            // Validate KVK exists
            await validateKvkExists(kvkId);

            // Resolve staff ID
            let staffId = null;
            if (data.staffId !== undefined) {
                staffId = await resolveStaffId(data.staffId, kvkId, false);
            } else if (data.staffName !== undefined) {
                staffId = await resolveStaffId(data.staffName, kvkId, false);
            }

            // Resolve activity type ID
            let activityTypeId = null;
            if (data.activityTypeId !== undefined) {
                activityTypeId = await resolveOtherExtensionActivityTypeId(data.activityTypeId, false);
            } else if (data.extensionActivityType !== undefined) {
                activityTypeId = await resolveOtherExtensionActivityTypeId(data.extensionActivityType, false);
            }

            // Validate and parse fldId
            const fldId = data.fldId ? parseInteger(data.fldId, 'fldId', true) : null;
            if (fldId) {
                await validateFldExists(fldId, kvkId);
            }

            // Validate and parse dates
            const startDate = data.startDate ? parseDate(data.startDate, 'startDate', false) : null;
            const endDate = data.endDate ? parseDate(data.endDate, 'endDate', false) : null;
            validateDateRange(startDate, endDate);

            // Validate numberOfActivities
            const numberOfActivities = parseInteger(
                data.numberOfActivities ?? data.activityCount ?? 0,
                'numberOfActivities',
                false
            );

            // Prepare create data (no participant fields)
            const createData = {
                kvkId,
                fldId,
                staffId,
                activityTypeId,
                numberOfActivities,
                startDate,
                endDate,
            };

            // Create the record using Prisma
            const result = await prisma.kvkOtherExtensionActivity.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    otherExtensionActivity: { select: { otherExtensionName: true } },
                }
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new RepositoryError('A record with these values already exists', 'DUPLICATE_ERROR', 409);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to create other extension activity: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};
            // Strict isolation for KVK-scoped users (like Gaya)
            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            } else if (filters.kvkId) {
                const kvkId = parseInteger(filters.kvkId, 'filters.kvkId', false);
                where.kvkId = kvkId;
            }

            const results = await prisma.kvkOtherExtensionActivity.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    otherExtensionActivity: { select: { otherExtensionName: true } },
                },
                orderBy: { otherExtensionActivityId: 'desc' },
            });
            return results.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch other extension activities: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const otherExtensionActivityId = parseInteger(id, 'id', false);
            const where = { otherExtensionActivityId };

            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const result = await prisma.kvkOtherExtensionActivity.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    otherExtensionActivity: { select: { otherExtensionName: true } },
                },
            });

            if (!result) {
                throw new RepositoryError('Other extension activity not found', 'NOT_FOUND', 404);
            }

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch other extension activity: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    update: async (id, data, user) => {
        try {
            // Validate input
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            const otherExtensionActivityId = parseInteger(id, 'id', false);
            const where = { otherExtensionActivityId };

            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Verify record exists and user has access
            const existing = await prisma.kvkOtherExtensionActivity.findFirst({ where });
            if (!existing) {
                throw new RepositoryError('Record not found or unauthorized', 'NOT_FOUND', 404);
            }

            const kvkId = existing.kvkId;
            const updateData = {};

            // Update fldId
            if (data.fldId !== undefined) {
                const fldId = data.fldId ? parseInteger(data.fldId, 'fldId', true) : null;
                if (fldId) {
                    await validateFldExists(fldId, kvkId);
                }
                updateData.fldId = fldId;
            }

            // Resolve and update staff ID
            if (data.staffName !== undefined) {
                updateData.staffId = await resolveStaffId(data.staffName, kvkId, false);
            } else if (data.staffId !== undefined) {
                updateData.staffId = await resolveStaffId(data.staffId, kvkId, false);
            }

            // Resolve and update activity type ID
            if (data.extensionActivityType !== undefined) {
                updateData.activityTypeId = await resolveOtherExtensionActivityTypeId(data.extensionActivityType, false);
            } else if (data.activityTypeId !== undefined) {
                updateData.activityTypeId = await resolveOtherExtensionActivityTypeId(data.activityTypeId, false);
            }

            // Update numberOfActivities
            const numberOfActivities = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
            if (numberOfActivities !== undefined) {
                updateData.numberOfActivities = parseInteger(numberOfActivities, 'numberOfActivities', false);
            }

            // Update dates
            let startDate = existing.startDate;
            let endDate = existing.endDate;

            if (data.startDate !== undefined) {
                startDate = parseDate(data.startDate, 'startDate', false);
            }
            if (data.endDate !== undefined) {
                endDate = parseDate(data.endDate, 'endDate', false);
            }

            // Validate date range if both dates are present
            if (startDate && endDate) {
                validateDateRange(startDate, endDate);
            }

            if (data.startDate !== undefined) {
                updateData.startDate = startDate;
            }
            if (data.endDate !== undefined) {
                updateData.endDate = endDate;
            }

            // Update the record using Prisma
            if (Object.keys(updateData).length > 0) {
                await prisma.kvkOtherExtensionActivity.update({
                    where: { otherExtensionActivityId },
                    data: updateData
                });
            }

            // Return updated record with relations
            return _mapResponse(await prisma.kvkOtherExtensionActivity.findUnique({
                where: { otherExtensionActivityId },
                include: {
                    kvk: { select: { kvkName: true } },
                    staff: { select: { staffName: true } },
                    otherExtensionActivity: { select: { otherExtensionName: true } },
                },
            }));
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Record not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2002') {
                    throw new RepositoryError('A record with these values already exists', 'DUPLICATE_ERROR', 409);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update other extension activity: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const otherExtensionActivityId = parseInteger(id, 'id', false);
            const where = { otherExtensionActivityId };

            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Verify record exists before attempting delete
            const existing = await prisma.kvkOtherExtensionActivity.findFirst({ where });
            if (!existing) {
                throw new RepositoryError('Record not found or unauthorized', 'NOT_FOUND', 404);
            }

            const result = await prisma.kvkOtherExtensionActivity.deleteMany({
                where
            });

            if (result.count === 0) {
                throw new RepositoryError('Failed to delete record', 'DELETE_ERROR', 500);
            }

            return { success: true };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new RepositoryError('Cannot delete record due to foreign key constraints', 'CONSTRAINT_ERROR', 409);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete other extension activity: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

function _mapResponse(r) {
    if (!r) return null;
    const startDate = r.startDate ? new Date(r.startDate) : null;
    let reportingYear = null;
    if (startDate && !isNaN(startDate.getTime())) {
        const month = startDate.getMonth() + 1;
        const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
        reportingYear = String(startYear);
    }

    const activityName = r.otherExtensionActivity ? r.otherExtensionActivity.otherExtensionName : undefined;

    return {
        ...r,
        id: r.otherExtensionActivityId,
        otherExtensionActivityId: r.otherExtensionActivityId,
        extensionActivityId: r.otherExtensionActivityId, // For compatibility
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        fldId: r.fldId,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        activityTypeId: r.activityTypeId,
        activityId: r.activityTypeId, // For compatibility with frontend
        extensionActivityType: activityName,
        activity: r.otherExtensionActivity ? { activityName } : undefined,
        numberOfActivities: r.numberOfActivities,
        activityCount: r.numberOfActivities, // For compatibility
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
        reportingYear,
        reportingYear: reportingYear,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
        natureOfExtensionActivity: activityName,
        noOfActivities: r.numberOfActivities
    };
}

module.exports = otherExtensionActivityRepository;
module.exports.RepositoryError = RepositoryError;
