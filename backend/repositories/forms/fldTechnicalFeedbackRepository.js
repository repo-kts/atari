const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const {
    validateInput,
    resolveKvkId,
    buildRoleBasedWhere,
    validateRequiredInteger,
    validateOptionalInteger,
    validateRequiredString,
    buildUpdateData,
    checkRecordOwnership,
    applyFilters,
    validateId,
} = require('../../utils/formRepositoryHelpers.js');

/**
 * FLD Technical Feedback Repository Configuration
 */
const FLD_TECHNICAL_FEEDBACK_CONFIG = {
    model: 'fldTechnicalFeedback',
    idField: 'feedbackId',
    orderBy: { feedbackId: 'desc' },
    includes: {
        kvk: { select: { kvkId: true, kvkName: true } },
        fld: { select: { kvkFldId: true, fldName: true } },
        crop: { select: { cropId: true, cropName: true } },
        
    },
    filterableFields: ['kvkId', 'fldId', 'cropId'],
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
    cropId: {
        fieldNames: ['cropId', 'crop'],
        errorMessage: 'Crop is required',
        errorField: 'cropId',
        optional: true,
    },
    feedback: {
        fieldNames: ['feedback', 'feedBack'],
        errorMessage: 'Feedback is required',
        errorField: 'feedback',
        type: 'string',
    },
    reportingYear: {
        fieldNames: ['reportingYear'],
        errorMessage: 'Reporting Year is required',
        errorField: 'reportingYear',
        optional: true,
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
        fieldNames: ['cropId', 'crop'],
        type: 'integer',
        backendField: 'cropId',
        errorMessage: 'Valid Crop ID is required',
        errorField: 'cropId',
        options: { required: false }, // Optional field
    },
    {
        fieldNames: ['feedback', 'feedBack'],
        type: 'string',
        backendField: 'feedback',
        errorMessage: 'Feedback is required',
        errorField: 'feedback',
        options: { required: false }, // Allow updates without changing feedback
    },
    
];

const fldTechnicalFeedbackRepository = {
    /**
     * Create a new FLD Technical Feedback record
     */
    create: async (data, user) => {
        validateInput(data, user);

        const kvkId = await resolveKvkId(data, user);
        const fldId = validateRequiredInteger(data, CREATE_FIELD_DEFINITIONS.fldId);
        const cropId = validateOptionalInteger(data, CREATE_FIELD_DEFINITIONS.cropId);
        const feedback = validateRequiredString(data, CREATE_FIELD_DEFINITIONS.feedback);
        const reportingYear = parseReportingYearDate(data.reportingYear);
        ensureNotFutureDate(reportingYear);

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

        // Verify crop if provided
        if (cropId) {
            const crop = await prisma.fldCrop.findFirst({
                where: { cropId: cropId },
            });
            if (!crop) {
                throw new ValidationError('Crop not found', 'cropId');
            }
        }

        const createData = {
            kvkId,
            fldId,
            cropId,
            feedback,
            reportingYear,
        };

        try {
            const result = await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].create({
                data: createData,
                include: FLD_TECHNICAL_FEEDBACK_CONFIG.includes,
            });

            return _mapResponse(result);
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
     * Get all FLD Technical Feedback records
     */
    findAll: async (filters = {}, user) => {
        const baseWhere = buildRoleBasedWhere(user);
        if (baseWhere === null) {
            return [];
        }
        
        // Apply filters to the where clause
        const where = applyFilters(baseWhere, filters, FLD_TECHNICAL_FEEDBACK_CONFIG.filterableFields);
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

        const results = await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].findMany({
            where,
            include: FLD_TECHNICAL_FEEDBACK_CONFIG.includes,
            orderBy: FLD_TECHNICAL_FEEDBACK_CONFIG.orderBy,
        });

        return results.map(_mapResponse);
    },

    /**
     * Get a single FLD Technical Feedback record by ID
     */
    findById: async (id, user) => {
        // Validate ID with strict regex check
        const parsedId = validateId(id, FLD_TECHNICAL_FEEDBACK_CONFIG.idField);

        const where = buildRoleBasedWhere(user, { [FLD_TECHNICAL_FEEDBACK_CONFIG.idField]: parsedId });
        if (where === null) {
            return null;
        }

        const result = await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].findFirst({
            where,
            include: FLD_TECHNICAL_FEEDBACK_CONFIG.includes,
        });

        return result ? _mapResponse(result) : null;
    },

    /**
     * Update an FLD Technical Feedback record
     */
    update: async (id, data, user) => {
        validateInput(data, user);

        // Validate ID first
        const parsedId = validateId(id, FLD_TECHNICAL_FEEDBACK_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_TECHNICAL_FEEDBACK_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        // Load existing record to get kvkId for validation
        const existingRecord = await checkRecordOwnership(
            (query) => prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].findFirst(query),
            where
        );

        const updateData = buildUpdateData(data, UPDATE_FIELD_DEFINITIONS);
        if (data.reportingYear !== undefined) {
            updateData.reportingYear = parseReportingYearDate(data.reportingYear);
            ensureNotFutureDate(updateData.reportingYear);
        }

        // Verify FLD exists and belongs to the same KVK if fldId is being updated
        if (updateData.fldId !== undefined) {
            // Use existing record's kvkId instead of resolving from data/user
            const kvkId = existingRecord.kvkId;
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

        // Verify crop exists if cropId is being updated
        if (updateData.cropId !== undefined && updateData.cropId !== null) {
            const crop = await prisma.fldCrop.findFirst({
                where: { cropId: updateData.cropId },
            });

            if (!crop) {
                throw new ValidationError('Crop not found', 'cropId');
            }
        }

        const finalUpdateData = removeIdFieldsForUpdate(updateData, [FLD_TECHNICAL_FEEDBACK_CONFIG.idField, 'id']);

        if (Object.keys(finalUpdateData).length === 0) {
            const existing = await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].findFirst({ where, include: FLD_TECHNICAL_FEEDBACK_CONFIG.includes });
            return _mapResponse(existing);
        }

        try {
            const result = await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].update({
                where: { [FLD_TECHNICAL_FEEDBACK_CONFIG.idField]: parsedId },
                data: finalUpdateData,
                include: FLD_TECHNICAL_FEEDBACK_CONFIG.includes,
            });

            return _mapResponse(result);
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
     * Delete an FLD Technical Feedback record
     */
    delete: async (id, user) => {
        // Validate ID first
        const parsedId = validateId(id, FLD_TECHNICAL_FEEDBACK_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_TECHNICAL_FEEDBACK_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].findFirst(query),
            where
        );

        await prisma[FLD_TECHNICAL_FEEDBACK_CONFIG.model].delete({
            where: { [FLD_TECHNICAL_FEEDBACK_CONFIG.idField]: parsedId },
        });

        return { success: true };
    },
};

/**
 * Map database response to frontend-friendly format
 */
function _mapResponse(r) {
    if (!r) return null;

    return {
        id: r.feedbackId,
        feedbackId: r.feedbackId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        fldId: r.fldId,
        fldName: r.fld?.fldName,
        cropId: r.cropId,
        cropName: r.crop?.cropName,
        crop: r.crop?.cropName,
        feedback: r.feedback,
        feedBack: r.feedback,
        reportingYear: formatReportingYear(r.reportingYear),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

module.exports = fldTechnicalFeedbackRepository;
