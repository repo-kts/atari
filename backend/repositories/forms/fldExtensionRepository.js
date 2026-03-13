const prisma = require('../../config/prisma.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const {
    validateInput,
    resolveKvkId,
    buildRoleBasedWhere,
    validateRequiredInteger,
    validateOptionalInteger,
    validateRequiredDate,
    validateFarmerCounts,
    buildUpdateData,
    checkRecordOwnership,
    applyFilters,
    validateId,
} = require('../../utils/formRepositoryHelpers.js');

/**
 * FLD Extension Repository Configuration
 */
const FLD_EXTENSION_CONFIG = {
    model: 'fldExtension',
    idField: 'extensionId',
    orderBy: { extensionId: 'desc' },
    includes: {
        kvk: { select: { kvkId: true, kvkName: true } },
        fld: { select: { kvkFldId: true, fldName: true } },
        // Note: activity is not included because FldExtension has no Prisma relation to FldActivity
        // We'll fetch it manually in _mapResponse when needed
        reportingYear: { select: { yearId: true, yearName: true } },
    },
    filterableFields: ['kvkId', 'fldId', 'activityId', 'reportingYearId'],
    farmerCountMapping: {
        gen_m: 'generalM',
        gen_f: 'generalF',
        obc_m: 'obcM',
        obc_f: 'obcF',
        sc_m: 'scM',
        sc_f: 'scF',
        st_m: 'stM',
        st_f: 'stF',
    },
};

/**
 * Field definitions for create operation
 */
const CREATE_FIELD_DEFINITIONS = {
    kvkId: {
        fieldNames: ['kvkId'],
        errorMessage: 'KVK ID is required',
        errorField: 'kvkId',
    },
    fldId: {
        fieldNames: ['fldId'],
        errorMessage: 'FLD ID is required',
        errorField: 'fldId',
    },
    activityId: {
        fieldNames: ['activityId', 'activity'],
        errorMessage: 'Activity is required',
        errorField: 'activityId',
    },
    activityDate: {
        fieldNames: ['activityDate', 'date'],
        errorMessage: 'Activity Date is required',
        errorField: 'activityDate',
        type: 'date',
    },
    numberOfActivities: {
        fieldNames: ['numberOfActivities', 'noOfActivities', 'activityCount'],
        errorMessage: 'Number of Activities is required',
        errorField: 'numberOfActivities',
        type: 'integer',
    },
    reportingYearId: {
        fieldNames: ['reportingYearId', 'reportingYear'],
        errorMessage: 'Reporting Year is required',
        errorField: 'reportingYearId',
        optional: true,
    },
    remarks: {
        fieldNames: ['remarks', 'remark'],
        errorMessage: '',
        errorField: 'remarks',
        optional: true,
        type: 'string',
    },
};

/**
 * Field definitions for update operation
 * Array format required by buildUpdateData function
 */
const UPDATE_FIELD_DEFINITIONS = [
    {
        fieldNames: ['fldId'],
        type: 'integer',
        backendField: 'fldId',
        errorMessage: 'Valid FLD ID is required',
        errorField: 'fldId',
        options: { required: false }, // Allow updates without changing FLD
    },
    {
        fieldNames: ['activityId', 'activity'],
        type: 'integer',
        backendField: 'activityId',
        errorMessage: 'Valid Activity ID is required',
        errorField: 'activityId',
        options: { required: false }, // Allow updates without changing activity
    },
    {
        fieldNames: ['activityDate', 'date'],
        type: 'date',
        backendField: 'activityDate',
        errorMessage: 'Valid Activity Date is required',
        errorField: 'activityDate',
        options: { required: false }, // Allow updates without changing date
    },
    {
        fieldNames: ['numberOfActivities', 'noOfActivities', 'activityCount'],
        type: 'integer',
        backendField: 'numberOfActivities',
        errorMessage: 'Valid Number of Activities is required',
        errorField: 'numberOfActivities',
        options: { required: false }, // Allow updates without changing count
    },
    {
        fieldNames: ['reportingYearId', 'reportingYear'],
        type: 'integer',
        backendField: 'reportingYearId',
        errorMessage: 'Valid Reporting Year ID is required',
        errorField: 'reportingYearId',
        options: { required: false }, // Optional field
    },
    {
        fieldNames: ['remarks', 'remark'],
        type: 'string',
        backendField: 'remarks',
        errorMessage: '',
        errorField: 'remarks',
        options: { required: false }, // Optional field
    },
];

const fldExtensionRepository = {
    /**
     * Create a new FLD Extension record
     */
    create: async (data, user) => {
        validateInput(data, user);

        const kvkId = await resolveKvkId(data, user);
        const fldId = validateRequiredInteger(data, CREATE_FIELD_DEFINITIONS.fldId);
        const activityId = validateRequiredInteger(data, CREATE_FIELD_DEFINITIONS.activityId);
        const activityDate = validateRequiredDate(data, CREATE_FIELD_DEFINITIONS.activityDate);
        const numberOfActivities = validateRequiredInteger(data, CREATE_FIELD_DEFINITIONS.numberOfActivities);
        const reportingYearId = validateOptionalInteger(data, CREATE_FIELD_DEFINITIONS.reportingYearId);
        const remarks = data.remarks || data.remark || null;

        // Validate farmer counts
        const farmerCounts = validateFarmerCounts(data, FLD_EXTENSION_CONFIG.farmerCountMapping);

        // Verify FLD exists and belongs to the same KVK
        const fld = await prisma.kvkFldIntroduction.findFirst({
            where: {
                kvkFldId: fldId,
                kvkId: kvkId,
            },
        });

        if (!fld) {
            throw new ValidationError('FLD not found or does not belong to this KVK', 'fldId');
        }

        // Verify activity exists
        const activity = await prisma.fldActivity.findFirst({
            where: { activityId: activityId },
        });

        if (!activity) {
            throw new ValidationError('Activity not found', 'activityId');
        }

        // Verify reporting year if provided
        if (reportingYearId) {
            const year = await prisma.yearMaster.findFirst({
                where: { yearId: reportingYearId },
            });
            if (!year) {
                throw new ValidationError('Reporting Year not found', 'reportingYearId');
            }
        }

        const createData = {
            kvkId,
            fldId,
            activityId,
            activityDate: new Date(activityDate),
            numberOfActivities,
            remarks,
            reportingYearId,
            ...farmerCounts,
        };

        try {
            const result = await prisma[FLD_EXTENSION_CONFIG.model].create({
                data: createData,
                include: FLD_EXTENSION_CONFIG.includes,
            });

            // Fetch activity manually since there's no Prisma relation
            const activity = await prisma.fldActivity.findFirst({
                where: { activityId: result.activityId },
                select: { activityId: true, activityName: true },
            });

            return _mapResponse(result, activity);
        } catch (error) {
            if (error.code === 'P2003') {
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            throw error;
        }
    },

    /**
     * Get all FLD Extension records
     */
    findAll: async (filters = {}, user) => {
        const where = buildRoleBasedWhere(user);
        if (where === null) {
            return [];
        }

        // Apply filters to the where clause
        applyFilters(where, filters, FLD_EXTENSION_CONFIG.filterableFields);

        const results = await prisma[FLD_EXTENSION_CONFIG.model].findMany({
            where,
            include: FLD_EXTENSION_CONFIG.includes,
            orderBy: FLD_EXTENSION_CONFIG.orderBy,
        });

        // Fetch activities in batch for all results
        const activityIds = [...new Set(results.map(r => r.activityId).filter(Boolean))];
        const activities = activityIds.length > 0
            ? await prisma.fldActivity.findMany({
                where: { activityId: { in: activityIds } },
                select: { activityId: true, activityName: true },
            })
            : [];
        const activityMap = new Map(activities.map(a => [a.activityId, a]));

        return results.map(r => _mapResponse(r, activityMap.get(r.activityId)));
    },

    /**
     * Get a single FLD Extension record by ID
     */
    findById: async (id, user) => {
        // Validate ID with strict regex check
        const parsedId = validateId(id, FLD_EXTENSION_CONFIG.idField);

        const where = buildRoleBasedWhere(user, { [FLD_EXTENSION_CONFIG.idField]: parsedId });
        if (where === null) {
            return null;
        }

        const result = await prisma[FLD_EXTENSION_CONFIG.model].findFirst({
            where,
            include: FLD_EXTENSION_CONFIG.includes,
        });

        if (!result) return null;

        // Fetch activity manually since there's no Prisma relation
        const activity = result.activityId
            ? await prisma.fldActivity.findFirst({
                where: { activityId: result.activityId },
                select: { activityId: true, activityName: true },
            })
            : null;

        return _mapResponse(result, activity);
    },

    /**
     * Update an FLD Extension record
     */
    update: async (id, data, user) => {
        validateInput(data, user);

        const parsedId = validateId(id, FLD_EXTENSION_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_EXTENSION_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma[FLD_EXTENSION_CONFIG.model].findFirst(query),
            where
        );

        const updateData = buildUpdateData(data, UPDATE_FIELD_DEFINITIONS);

        // Handle farmer counts (only if provided)
        const farmerCounts = validateFarmerCounts(data, FLD_EXTENSION_CONFIG.farmerCountMapping, {
            validateNonNegative: true,
            required: false, // All farmer count fields are optional for updates
        });
        if (Object.keys(farmerCounts).length > 0) {
            Object.assign(updateData, farmerCounts);
        }

        // Ensure date is a Date object (sanitizeDate returns Date or null, but double-check)
        if (updateData.activityDate && !(updateData.activityDate instanceof Date)) {
            updateData.activityDate = new Date(updateData.activityDate);
        }

        // Verify FLD exists and belongs to the same KVK if fldId is being updated
        if (updateData.fldId !== undefined) {
            const kvkId = await resolveKvkId(data, user);
            const fld = await prisma.kvkFldIntroduction.findFirst({
                where: {
                    kvkFldId: updateData.fldId,
                    kvkId: kvkId,
                },
            });

            if (!fld) {
                throw new ValidationError('FLD not found or does not belong to this KVK', 'fldId');
            }
        }

        // Verify activity exists if activityId is being updated
        if (updateData.activityId !== undefined) {
            const activity = await prisma.fldActivity.findFirst({
                where: { activityId: updateData.activityId },
            });

            if (!activity) {
                throw new ValidationError('Activity not found', 'activityId');
            }
        }

        // Verify reporting year if provided
        if (updateData.reportingYearId !== undefined && updateData.reportingYearId !== null) {
            const year = await prisma.yearMaster.findFirst({
                where: { yearId: updateData.reportingYearId },
            });
            if (!year) {
                throw new ValidationError('Reporting Year not found', 'reportingYearId');
            }
        }

        const finalUpdateData = removeIdFieldsForUpdate(updateData, [FLD_EXTENSION_CONFIG.idField, 'id']);

        if (Object.keys(finalUpdateData).length === 0) {
            const existing = await prisma[FLD_EXTENSION_CONFIG.model].findFirst({ where, include: FLD_EXTENSION_CONFIG.includes });
            if (!existing) return null;

            // Fetch activity manually since there's no Prisma relation
            const activity = existing.activityId
                ? await prisma.fldActivity.findFirst({
                    where: { activityId: existing.activityId },
                    select: { activityId: true, activityName: true },
                })
                : null;

            return _mapResponse(existing, activity);
        }

        try {
            const result = await prisma[FLD_EXTENSION_CONFIG.model].update({
                where: { [FLD_EXTENSION_CONFIG.idField]: parsedId },
                data: finalUpdateData,
                include: FLD_EXTENSION_CONFIG.includes,
            });

            // Fetch activity manually since there's no Prisma relation
            const activity = result.activityId
                ? await prisma.fldActivity.findFirst({
                    where: { activityId: result.activityId },
                    select: { activityId: true, activityName: true },
                })
                : null;

            return _mapResponse(result, activity);
        } catch (error) {
            if (error.code === 'P2003') {
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            throw error;
        }
    },

    /**
     * Delete an FLD Extension record
     */
    delete: async (id, user) => {
        const parsedId = validateId(id, FLD_EXTENSION_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_EXTENSION_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma[FLD_EXTENSION_CONFIG.model].findFirst(query),
            where
        );

        await prisma[FLD_EXTENSION_CONFIG.model].delete({
            where: { [FLD_EXTENSION_CONFIG.idField]: parsedId },
        });

        return { success: true };
    },
};

/**
 * Map database response to frontend-friendly format
 * @param {object} r - Database record
 * @param {object} activity - Activity object (fetched manually since no Prisma relation exists)
 */
function _mapResponse(r, activity = null) {
    if (!r) return null;

    // Calculate total participants
    const totalParticipants = (r.generalM || 0) + (r.generalF || 0) +
        (r.obcM || 0) + (r.obcF || 0) +
        (r.scM || 0) + (r.scF || 0) +
        (r.stM || 0) + (r.stF || 0);

    return {
        id: r.extensionId,
        extensionId: r.extensionId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        fldId: r.fldId,
        fldName: r.fld?.fldName,
        activityId: r.activityId,
        activityName: activity?.activityName,
        activity: activity?.activityName,
        activityDate: r.activityDate ? r.activityDate.toISOString().split('T')[0] : undefined,
        date: r.activityDate ? r.activityDate.toISOString().split('T')[0] : undefined,
        numberOfActivities: r.numberOfActivities,
        noOfActivities: r.numberOfActivities,
        activityCount: r.numberOfActivities,
        remarks: r.remarks,
        remark: r.remarks,
        reportingYearId: r.reportingYearId,
        reportingYear: r.reportingYear?.yearName,
        gen_m: r.generalM,
        generalM: r.generalM,
        gen_f: r.generalF,
        generalF: r.generalF,
        obc_m: r.obcM,
        obcM: r.obcM,
        obc_f: r.obcF,
        obcF: r.obcF,
        sc_m: r.scM,
        scM: r.scM,
        sc_f: r.scF,
        scF: r.scF,
        st_m: r.stM,
        stM: r.stM,
        st_f: r.stF,
        stF: r.stF,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

module.exports = fldExtensionRepository;
