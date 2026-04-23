const prisma = require('../../config/prisma.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const { FLD_STATUS, normalizeFldStatus } = require('../../constants/fldStatus.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const {
    validateInput,
    resolveKvkId,
    buildRoleBasedWhere,
    validateRequiredInteger,
    validateRequiredString,
    validateRequiredNumber,
    validateRequiredDate,
    validateFarmerCounts,
    buildUpdateData,
    checkRecordOwnership,
    applyFilters,
    validateId,
} = require('../../utils/formRepositoryHelpers.js');

/**
 * FLD Repository Configuration
 * Centralized configuration for FLD entity
 */
const FLD_CONFIG = {
    model: 'kvkFldIntroduction',
    idField: 'kvkFldId',
    orderBy: { kvkFldId: 'desc' },
    includes: {
        kvk: { select: { kvkId: true, kvkName: true } },
        kvkStaff: { select: { kvkStaffId: true, staffName: true } },
        season: { select: { seasonId: true, seasonName: true } },
        sector: { select: { sectorId: true, sectorName: true } },
        thematicArea: { select: { thematicAreaId: true, thematicAreaName: true } },
        category: { select: { categoryId: true, categoryName: true } },
        subCategory: { select: { subCategoryId: true, subCategoryName: true } },
        crop: { select: { cropId: true, cropName: true } },
    },
    filterableFields: ['seasonId', 'sectorId', 'thematicAreaId', 'categoryId', 'subCategoryId', 'cropId'],
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
    kvkStaffId: {
        fieldNames: ['staffId', 'kvkStaffId', 'staffName'],
        errorMessage: 'Staff ID (Name of SMS/KVK Head) is required',
        errorField: 'staffId',
    },
    seasonId: {
        fieldNames: ['seasonId'],
        errorMessage: 'Season is required',
        errorField: 'seasonId',
        optional: true, // Schema allows Int?
    },
    expectedCompletionDate: {
        fieldNames: ['expectedCompletionDate'],
        errorMessage: 'Expected Completion Date is required',
        errorField: 'expectedCompletionDate',
        optional: true,
    },
    sectorId: {
        fieldNames: ['sectorId'],
        errorMessage: 'Sector is required',
        errorField: 'sectorId',
        optional: true, // Schema allows Int?
    },
    thematicAreaId: {
        fieldNames: ['fldThematicAreaId', 'thematicAreaId', 'thematicArea'],
        errorMessage: 'Thematic Area is required',
        errorField: 'fldThematicAreaId',
        optional: true, // Schema allows Int?
    },
    categoryId: {
        fieldNames: ['categoryId'],
        errorMessage: 'Category is required',
        errorField: 'categoryId',
        optional: true, // Schema allows Int?
    },
    subCategoryId: {
        fieldNames: ['subCategoryId'],
        errorMessage: 'Sub Category is required',
        errorField: 'subCategoryId',
        optional: true, // Schema allows Int?
    },
    cropId: {
        fieldNames: ['cropId'],
        errorMessage: 'Crop is required',
        errorField: 'cropId',
        optional: true, // Schema allows Int?
    },
    fldName: {
        fieldNames: ['technologyName', 'fldName'],
        errorMessage: 'Name of Technology Demonstrated (FLD Name) is required',
        errorField: 'technologyName',
        type: 'string',
    },
    noOfDemonstration: {
        fieldNames: ['demoCount', 'noOfDemonstration'],
        errorMessage: 'Number of demonstrations must be a valid non-negative integer',
        errorField: 'demoCount',
        type: 'integer',
        options: { allowNegative: false },
    },
    startDate: {
        fieldNames: ['startDate'],
        errorMessage: 'Start Date is required and must be a valid date',
        errorField: 'startDate',
        type: 'date',
    },
    quantity: {
        fieldNames: ['quantity', 'area', 'areaHa'],
        errorMessage: 'Quantity must be a valid non-negative number',
        errorField: 'quantity',
        type: 'number',
        options: { allowNegative: false },
    },
};

/**
 * Field definitions for update operation
 */
const UPDATE_FIELD_DEFINITIONS = [
    {
        fieldNames: ['staffId', 'kvkStaffId', 'staffName'],
        type: 'integer',
        backendField: 'kvkStaffId',
        errorMessage: 'Valid Staff ID is required',
        errorField: 'staffId',
    },
    
    {
        fieldNames: ['seasonId'],
        type: 'integer',
        backendField: 'seasonId',
        errorMessage: 'Valid Season ID is required',
        errorField: 'seasonId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['sectorId'],
        type: 'integer',
        backendField: 'sectorId',
        errorMessage: 'Valid Sector ID is required',
        errorField: 'sectorId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['fldThematicAreaId', 'thematicAreaId', 'thematicArea'],
        type: 'integer',
        backendField: 'thematicAreaId',
        errorMessage: 'Valid Thematic Area ID is required',
        errorField: 'fldThematicAreaId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['categoryId'],
        type: 'integer',
        backendField: 'categoryId',
        errorMessage: 'Valid Category ID is required',
        errorField: 'categoryId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['subCategoryId'],
        type: 'integer',
        backendField: 'subCategoryId',
        errorMessage: 'Valid Sub Category ID is required',
        errorField: 'subCategoryId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['cropId'],
        type: 'integer',
        backendField: 'cropId',
        errorMessage: 'Valid Crop ID is required',
        errorField: 'cropId',
        options: { required: false }, // Schema allows Int?
    },
    {
        fieldNames: ['technologyName', 'fldName'],
        type: 'string',
        backendField: 'fldName',
        errorMessage: 'Name of Technology Demonstrated (FLD Name) is required',
        errorField: 'technologyName',
        options: { allowEmpty: false },
    },
    {
        fieldNames: ['demoCount', 'noOfDemonstration'],
        type: 'integer',
        backendField: 'noOfDemonstration',
        errorMessage: 'Number of demonstrations must be a valid non-negative integer',
        errorField: 'demoCount',
        options: { allowNegative: false },
    },
    {
        fieldNames: ['startDate'],
        type: 'date',
        backendField: 'startDate',
        errorMessage: 'Start Date must be a valid date',
        errorField: 'startDate',
    },
    {
        fieldNames: ['quantity', 'area', 'areaHa'],
        type: 'number',
        backendField: 'quantity',
        errorMessage: 'Quantity must be a valid non-negative number',
        errorField: 'quantity',
        options: { allowNegative: false },
    },
    {
        fieldNames: ['unit'],
        type: 'string',
        backendField: 'unit',
        errorMessage: 'Unit is invalid',
        errorField: 'unit',
        options: { allowEmpty: true },
    },
];

/**
 * FLD Repository
 * Handles all database operations for Front Line Demonstrations (FLD)
 * Refactored for maximum reusability and maintainability
 */
const fldRepository = {
    /**
     * Create a new FLD record
     */
    create: async (data, user) => {
        validateInput(data, user);
        const kvkId = resolveKvkId(data, user);

        // Validate and sanitize all required fields
        const createData = {
            kvkId,
            kvkStaffId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.kvkStaffId.fieldNames,
                CREATE_FIELD_DEFINITIONS.kvkStaffId.errorMessage,
                CREATE_FIELD_DEFINITIONS.kvkStaffId.errorField
            ),
            expectedCompletionDate: (() => {
                if (!data.expectedCompletionDate) return null;
                const d = new Date(data.expectedCompletionDate);
                return Number.isNaN(d.getTime()) ? null : d;
            })(),
            unit: typeof data.unit === 'string' ? (data.unit.trim() || null) : null,
            seasonId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.seasonId.fieldNames,
                CREATE_FIELD_DEFINITIONS.seasonId.errorMessage,
                CREATE_FIELD_DEFINITIONS.seasonId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.seasonId.optional }
            ),
            sectorId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.sectorId.fieldNames,
                CREATE_FIELD_DEFINITIONS.sectorId.errorMessage,
                CREATE_FIELD_DEFINITIONS.sectorId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.sectorId.optional }
            ),
            thematicAreaId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.thematicAreaId.fieldNames,
                CREATE_FIELD_DEFINITIONS.thematicAreaId.errorMessage,
                CREATE_FIELD_DEFINITIONS.thematicAreaId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.thematicAreaId.optional }
            ),
            categoryId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.categoryId.fieldNames,
                CREATE_FIELD_DEFINITIONS.categoryId.errorMessage,
                CREATE_FIELD_DEFINITIONS.categoryId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.categoryId.optional }
            ),
            subCategoryId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.subCategoryId.fieldNames,
                CREATE_FIELD_DEFINITIONS.subCategoryId.errorMessage,
                CREATE_FIELD_DEFINITIONS.subCategoryId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.subCategoryId.optional }
            ),
            cropId: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.cropId.fieldNames,
                CREATE_FIELD_DEFINITIONS.cropId.errorMessage,
                CREATE_FIELD_DEFINITIONS.cropId.errorField,
                { required: !CREATE_FIELD_DEFINITIONS.cropId.optional }
            ),
            fldName: validateRequiredString(
                data,
                CREATE_FIELD_DEFINITIONS.fldName.fieldNames,
                CREATE_FIELD_DEFINITIONS.fldName.errorMessage,
                CREATE_FIELD_DEFINITIONS.fldName.errorField
            ),
            noOfDemonstration: validateRequiredInteger(
                data,
                CREATE_FIELD_DEFINITIONS.noOfDemonstration.fieldNames,
                CREATE_FIELD_DEFINITIONS.noOfDemonstration.errorMessage,
                CREATE_FIELD_DEFINITIONS.noOfDemonstration.errorField,
                { allowNegative: false }
            ),
            startDate: validateRequiredDate(
                data,
                CREATE_FIELD_DEFINITIONS.startDate.fieldNames,
                CREATE_FIELD_DEFINITIONS.startDate.errorMessage,
                CREATE_FIELD_DEFINITIONS.startDate.errorField
            ),
            quantity: validateRequiredNumber(
                data,
                CREATE_FIELD_DEFINITIONS.quantity.fieldNames,
                CREATE_FIELD_DEFINITIONS.quantity.errorMessage,
                CREATE_FIELD_DEFINITIONS.quantity.errorField,
                { allowNegative: false }
            ),
            ongoingCompleted: FLD_STATUS.ONGOING,
            ...validateFarmerCounts(data, FLD_CONFIG.farmerCountMapping, { validateNonNegative: true }),
        };

        // Remove null values for optional fields (Prisma handles null, but cleaner to omit if not provided)
        Object.keys(createData).forEach(key => {
            if (createData[key] === null && key !== 'kvkId') {
                delete createData[key];
            }
        });

        const finalCreateData = removeIdFieldsForUpdate(createData, [FLD_CONFIG.idField, 'id']);

        try {
            const result = await prisma[FLD_CONFIG.model].create({
                data: finalCreateData,
                include: FLD_CONFIG.includes,
            });

            return _mapResponse(result);
        } catch (error) {
            // Provide better error messages for common Prisma errors
            if (error.code === 'P2003') {
                // Foreign key constraint violation
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            if (error.code === 'P2011' || error.code === 'P2012') {
                // Missing required field
                const fieldName = error.meta?.constraint || error.meta?.path || 'field';
                throw new ValidationError(
                    `Missing required field: ${fieldName}. Please provide a valid value.`,
                    fieldName
                );
            }
            if (error.name === 'PrismaClientValidationError') {
                const message = String(error.message || '');
                if (message.includes('Unknown argument')) {
                    const unknownArgMatch = message.match(/Unknown argument `([^`]+)`/);
                    const unknownArg = unknownArgMatch?.[1] || 'field';
                    throw new ValidationError(
                        `Invalid input field: "${unknownArg}". Please refresh and try again.`,
                        unknownArg
                    );
                }
                throw new ValidationError('Invalid FLD request payload. Please check required fields and formats.');
            }
            // Re-throw other errors
            throw error;
        }
    },

    /**
     * Find all FLD records with optional filtering
     */
    findAll: async (filters = {}, user) => {
        const where = buildRoleBasedWhere(user);
        if (where === null) return []; // User has no KVK access

        applyFilters(where, filters, FLD_CONFIG.filterableFields);
        if (filters.expectedCompletionDateFrom || filters.expectedCompletionDateTo) {
            where.expectedCompletionDate = {};
            if (filters.expectedCompletionDateFrom) {
                const from = parseReportingYearDate(filters.expectedCompletionDateFrom);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.expectedCompletionDate.gte = from;
                }
            }
            if (filters.expectedCompletionDateTo) {
                const to = parseReportingYearDate(filters.expectedCompletionDateTo);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.expectedCompletionDate.lte = to;
                }
            }
        }
        if (filters.createdAtFrom || filters.createdAtTo) {
            where.createdAt = {};
            if (filters.createdAtFrom) {
                const from = new Date(filters.createdAtFrom);
                if (!isNaN(from.getTime())) {
                    from.setHours(0, 0, 0, 0);
                    where.createdAt.gte = from;
                }
            }
            if (filters.createdAtTo) {
                const to = new Date(filters.createdAtTo);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    where.createdAt.lte = to;
                }
            }
        }

        const results = await prisma[FLD_CONFIG.model].findMany({
            where,
            include: FLD_CONFIG.includes,
            orderBy: FLD_CONFIG.orderBy,
        });

        return results.map(_mapResponse);
    },

    /**
     * Find a single FLD record by ID
     */
    findById: async (id, user) => {
        // Validate ID with strict regex check
        const parsedId = validateId(id, FLD_CONFIG.idField);

        const where = buildRoleBasedWhere(user, { [FLD_CONFIG.idField]: parsedId });
        if (where === null) return null; // User has no KVK access

        const result = await prisma[FLD_CONFIG.model].findFirst({
            where,
            include: FLD_CONFIG.includes,
        });

        return result ? _mapResponse(result) : null;
    },

    /**
     * Update an existing FLD record
     */
    update: async (id, data, user) => {
        // Validate and normalize ID at the start
        const parsedId = validateId(id, FLD_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma[FLD_CONFIG.model].findFirst(query),
            where
        );

        // Build update data using field definitions
        const updateData = buildUpdateData(data, UPDATE_FIELD_DEFINITIONS);
        if (data.expectedCompletionDate !== undefined) {
            const d = data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : null;
            updateData.expectedCompletionDate = d && !Number.isNaN(d.getTime()) ? d : null;
        }
        delete updateData.status;
        delete updateData.ongoingCompleted;

        // Handle farmer counts separately
        const farmerCounts = validateFarmerCounts(data, FLD_CONFIG.farmerCountMapping, {
            validateNonNegative: true,
        });
        Object.assign(updateData, farmerCounts);

        const finalUpdateData = removeIdFieldsForUpdate(updateData, [FLD_CONFIG.idField, 'id']);

        if (Object.keys(finalUpdateData).length === 0) {
            const existing = await prisma[FLD_CONFIG.model].findFirst({ where, include: FLD_CONFIG.includes });
            return _mapResponse(existing);
        }

        try {
            const result = await prisma[FLD_CONFIG.model].update({
                where: { [FLD_CONFIG.idField]: parsedId },
                data: finalUpdateData,
                include: FLD_CONFIG.includes,
            });

            return _mapResponse(result);
        } catch (error) {
            // Provide better error messages for common Prisma errors
            if (error.code === 'P2003') {
                // Foreign key constraint violation
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            if (error.code === 'P2011' || error.code === 'P2012') {
                // Missing required field
                const fieldName = error.meta?.constraint || error.meta?.path || 'field';
                throw new ValidationError(
                    `Missing required field: ${fieldName}. Please provide a valid value.`,
                    fieldName
                );
            }
            if (error.name === 'PrismaClientValidationError') {
                const message = String(error.message || '');
                if (message.includes('Unknown argument')) {
                    const unknownArgMatch = message.match(/Unknown argument `([^`]+)`/);
                    const unknownArg = unknownArgMatch?.[1] || 'field';
                    throw new ValidationError(
                        `Invalid update field: "${unknownArg}". Please refresh and try again.`,
                        unknownArg
                    );
                }
                throw new ValidationError('Invalid FLD update payload. Please check the submitted values.');
            }
            // Re-throw other errors
            throw error;
        }
    },

    /**
     * Delete an FLD record
     */
    delete: async (id, user) => {
        // Validate and normalize ID at the start
        const parsedId = validateId(id, FLD_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_CONFIG.idField]: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma[FLD_CONFIG.model].findFirst(query),
            where
        );

        await prisma[FLD_CONFIG.model].delete({
            where: { [FLD_CONFIG.idField]: parsedId },
        });

        return { success: true };
    },

    findRawById: async (id, user) => {
        const parsedId = validateId(id, FLD_CONFIG.idField);
        const where = buildRoleBasedWhere(user, { [FLD_CONFIG.idField]: parsedId });
        if (where === null) return null;
        return prisma[FLD_CONFIG.model].findFirst({ where, include: FLD_CONFIG.includes });
    },

    transferToNextYearTx: async (sourceFld, targetExpectedCompletionDate) => {
        return prisma.$transaction(async (tx) => {
            await tx.kvkFldIntroduction.update({
                where: { kvkFldId: sourceFld.kvkFldId },
                data: { ongoingCompleted: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR },
            });

            const nextStartDate = sourceFld.startDate
                ? new Date(new Date(sourceFld.startDate).setFullYear(new Date(sourceFld.startDate).getFullYear() + 1))
                : new Date();

            const cloneData = removeIdFieldsForUpdate({
                kvkId: sourceFld.kvkId,
                kvkStaffId: sourceFld.kvkStaffId,
                seasonId: sourceFld.seasonId,
                sectorId: sourceFld.sectorId,
                thematicAreaId: sourceFld.thematicAreaId,
                categoryId: sourceFld.categoryId,
                subCategoryId: sourceFld.subCategoryId,
                cropId: sourceFld.cropId,
                fldName: sourceFld.fldName,
                noOfDemonstration: sourceFld.noOfDemonstration,
                quantity: sourceFld.quantity,
                unit: sourceFld.unit,
                startDate: nextStartDate,
                generalM: sourceFld.generalM,
                generalF: sourceFld.generalF,
                obcM: sourceFld.obcM,
                obcF: sourceFld.obcF,
                scM: sourceFld.scM,
                scF: sourceFld.scF,
                stM: sourceFld.stM,
                stF: sourceFld.stF,
                ongoingCompleted: FLD_STATUS.ONGOING,
                expectedCompletionDate: targetExpectedCompletionDate instanceof Date
                    ? targetExpectedCompletionDate
                    : (targetExpectedCompletionDate ? new Date(targetExpectedCompletionDate) : null),
            }, ['kvkFldId', 'id']);

            const newRecord = await tx.kvkFldIntroduction.create({
                data: cloneData,
                include: FLD_CONFIG.includes,
            });

            const sourceRecord = await tx.kvkFldIntroduction.findUnique({
                where: { kvkFldId: sourceFld.kvkFldId },
                include: FLD_CONFIG.includes,
            });

            return {
                source: _mapResponse(sourceRecord),
                transferred: _mapResponse(newRecord),
            };
        });
    },

    updateStatus: async (id, status) => {
        const parsedId = validateId(id, FLD_CONFIG.idField);
        return prisma.kvkFldIntroduction.update({
            where: { kvkFldId: parsedId },
            data: { ongoingCompleted: status },
            include: FLD_CONFIG.includes,
        });
    },

    createResultTx: async (fldId, payload) => {
        const parsedId = validateId(fldId, FLD_CONFIG.idField);
        return prisma.kvkFldResult.create({
            data: {
                kvkFldId: parsedId,
                demoYield: Number(payload.demoYield),
                checkYield: Number(payload.checkYield),
                increasePercent: Number(payload.increasePercent),
                demoGrossCost: Number(payload.demoGrossCost),
                demoGrossReturn: Number(payload.demoGrossReturn),
                demoNetReturn: Number(payload.demoNetReturn),
                demoBcr: Number(payload.demoBcr),
                checkGrossCost: Number(payload.checkGrossCost),
                checkGrossReturn: Number(payload.checkGrossReturn),
                checkNetReturn: Number(payload.checkNetReturn),
                checkBcr: Number(payload.checkBcr),
            },
        });
    },

    updateResultTx: async (fldId, payload) => {
        const parsedId = validateId(fldId, FLD_CONFIG.idField);
        return prisma.kvkFldResult.update({
            where: { kvkFldId: parsedId },
            data: {
                demoYield: Number(payload.demoYield),
                checkYield: Number(payload.checkYield),
                increasePercent: Number(payload.increasePercent),
                demoGrossCost: Number(payload.demoGrossCost),
                demoGrossReturn: Number(payload.demoGrossReturn),
                demoNetReturn: Number(payload.demoNetReturn),
                demoBcr: Number(payload.demoBcr),
                checkGrossCost: Number(payload.checkGrossCost),
                checkGrossReturn: Number(payload.checkGrossReturn),
                checkNetReturn: Number(payload.checkNetReturn),
                checkBcr: Number(payload.checkBcr),
            },
        });
    },

    getResultByFldId: async (fldId) => {
        const parsedId = validateId(fldId, FLD_CONFIG.idField);
        return prisma.kvkFldResult.findUnique({
            where: { kvkFldId: parsedId },
        });
    },
};

/**
 * Map database response to frontend-friendly format
 */
function _mapResponse(r) {
    if (!r) return null;
    const isCompleted = r.ongoingCompleted === FLD_STATUS.COMPLETED;
    const completionDate = isCompleted ? (r.updatedAt || null) : null;

    return {
        id: r.kvkFldId,
        kvkFldId: r.kvkFldId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        staffId: r.kvkStaffId,
        kvkStaffId: r.kvkStaffId,
        staffName: r.kvkStaff?.staffName,
        expectedCompletionDate: r.expectedCompletionDate ? r.expectedCompletionDate.toISOString().split('T')[0] : '',
        seasonId: r.seasonId,
        seasonName: r.season?.seasonName,
        sectorId: r.sectorId,
        sectorName: r.sector?.sectorName,
        fldThematicAreaId: r.thematicAreaId, // Frontend uses fldThematicAreaId, backend uses thematicAreaId
        thematicAreaId: r.thematicAreaId,
        thematicAreaName: r.thematicArea?.thematicAreaName,
        thematicArea: r.thematicArea?.thematicAreaName,
        categoryId: r.categoryId,
        categoryName: r.category?.categoryName,
        subCategoryId: r.subCategoryId,
        subCategoryName: r.subCategory?.subCategoryName,
        cropId: r.cropId,
        cropName: r.crop?.cropName,
        technologyName: r.fldName,
        fldName: r.fldName,
        demoCount: r.noOfDemonstration,
        noOfDemonstration: r.noOfDemonstration,
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : undefined,
        startYear: r.startDate ? new Date(r.startDate).getFullYear() : null,
        completedAt: completionDate,
        quantity: r.quantity,
        unit: r.unit,
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
        totalMale: (r.generalM || 0) + (r.obcM || 0) + (r.scM || 0) + (r.stM || 0),
        totalFemale: (r.generalF || 0) + (r.obcF || 0) + (r.scF || 0) + (r.stF || 0),
        ongoingCompleted: normalizeFldStatus(r.ongoingCompleted),
        status: normalizeFldStatus(r.ongoingCompleted),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

module.exports = fldRepository;
