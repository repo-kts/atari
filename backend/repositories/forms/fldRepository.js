const prisma = require('../../config/prisma.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const { FLD_STATUS, normalizeFldStatus } = require('../../constants/fldStatus.js');
const { getFldResultTemplate, isWomenEmpowermentName } = require('../../constants/fldResultTemplate.js');
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
    orderBy: [{ reportingYear: 'desc' }, { kvkFldId: 'desc' }],
    includes: {
        kvk: { select: { kvkId: true, kvkName: true } },
        kvkStaff: { select: { kvkStaffId: true, staffName: true } },
        season: { select: { seasonId: true, seasonName: true } },
        sector: { select: { sectorId: true, sectorName: true } },
        thematicArea: { select: { thematicAreaId: true, thematicAreaName: true } },
        category: { select: { categoryId: true, categoryName: true } },
        subCategory: { select: { subCategoryId: true, subCategoryName: true } },
        crop: { select: { cropId: true, cropName: true } },
        unitMaster: { select: { unitId: true, unitName: true } },
        fldResult: true,
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
        options: { required: false },
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
    {
        fieldNames: ['unitId'],
        type: 'integer',
        backendField: 'unitId',
        errorMessage: 'Unit ID is invalid',
        errorField: 'unitId',
        options: { required: false },
    },
    {
        fieldNames: ['quantityText'],
        type: 'string',
        backendField: 'quantityText',
        errorMessage: 'Quantity (text) is invalid',
        errorField: 'quantityText',
        options: { allowEmpty: true },
    },
    {
        fieldNames: ['sectorOther'],
        type: 'string',
        backendField: 'sectorOther',
        errorMessage: 'Sector (other) is invalid',
        errorField: 'sectorOther',
        options: { allowEmpty: true },
    },
    {
        fieldNames: ['thematicAreaOther'],
        type: 'string',
        backendField: 'thematicAreaOther',
        errorMessage: 'Thematic area (other) is invalid',
        errorField: 'thematicAreaOther',
        options: { allowEmpty: true },
    },
    {
        fieldNames: ['categoryOther'],
        type: 'string',
        backendField: 'categoryOther',
        errorMessage: 'Category (other) is invalid',
        errorField: 'categoryOther',
        options: { allowEmpty: true },
    },
    {
        fieldNames: ['subCategoryOther'],
        type: 'string',
        backendField: 'subCategoryOther',
        errorMessage: 'Sub category (other) is invalid',
        errorField: 'subCategoryOther',
        options: { allowEmpty: true },
    },
    {
        fieldNames: ['cropOther'],
        type: 'string',
        backendField: 'cropOther',
        errorMessage: 'Crop (other) is invalid',
        errorField: 'cropOther',
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

        // Women Empowerment FLDs have no measurable quantity/unit — sector lookup decides whether to skip those validators.
        let isWomenEmpowermentSector = false;
        const sectorIdRaw = data?.sectorId;
        if (sectorIdRaw !== undefined && sectorIdRaw !== null && sectorIdRaw !== '') {
            const parsedSectorId = parseInt(sectorIdRaw, 10);
            if (!Number.isNaN(parsedSectorId)) {
                const sector = await prisma.sector.findUnique({
                    where: { sectorId: parsedSectorId },
                    select: { sectorName: true },
                });
                isWomenEmpowermentSector = isWomenEmpowermentName(sector?.sectorName);
            }
        }

        // Validate and sanitize all required fields
        const startDate = (() => {
            if (!data.startDate) return null;
            const d = new Date(data.startDate);
            return Number.isNaN(d.getTime()) ? null : d;
        })();
        const reportingYear = _parseReportingYearOrFallback(data.reportingYear, startDate);

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
            unit: isWomenEmpowermentSector
                ? null
                : (typeof data.unit === 'string' ? (data.unit.trim() || null) : null),
            unitId: isWomenEmpowermentSector
                ? null
                : (data.unitId != null ? (parseInt(String(data.unitId), 10) || null) : null),
            // Free-text quantity for crops whose master quantity data type is
            // string/boolean (e.g. "N/A"); numeric types use `quantity`.
            quantityText: isWomenEmpowermentSector
                ? null
                : (typeof data.quantityText === 'string' ? (data.quantityText.trim() || null) : null),
            // "Other" free-text: only meaningful when the chosen master row is flagged isOther.
            sectorOther: typeof data.sectorOther === 'string' ? (data.sectorOther.trim() || null) : null,
            thematicAreaOther: typeof data.thematicAreaOther === 'string' ? (data.thematicAreaOther.trim() || null) : null,
            categoryOther: typeof data.categoryOther === 'string' ? (data.categoryOther.trim() || null) : null,
            subCategoryOther: typeof data.subCategoryOther === 'string' ? (data.subCategoryOther.trim() || null) : null,
            cropOther: typeof data.cropOther === 'string' ? (data.cropOther.trim() || null) : null,
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
            startDate,
            reportingYear,
            quantity: isWomenEmpowermentSector
                ? 0
                : validateRequiredNumber(
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

        const existingRecord = await prisma[FLD_CONFIG.model].findFirst({
            where,
            include: {
                sector: { select: { sectorName: true } },
            },
        });
        if (!existingRecord) {
            throw new ValidationError('Record not found or unauthorized');
        }

        const updatePayload = { ...(data || {}) };
        const incomingSectorId = updatePayload.sectorId ?? existingRecord.sectorId;
        let sectorName = existingRecord.sector?.sectorName || '';
        if (incomingSectorId !== existingRecord.sectorId && incomingSectorId !== undefined && incomingSectorId !== null && incomingSectorId !== '') {
            const nextSector = await prisma.sector.findUnique({
                where: { sectorId: parseInt(String(incomingSectorId), 10) },
                select: { sectorName: true },
            });
            sectorName = nextSector?.sectorName || sectorName;
        }

        if (isWomenEmpowermentName(sectorName)) {
            delete updatePayload.quantity;
            delete updatePayload.area;
            delete updatePayload.areaHa;
            delete updatePayload.quantityText;
            updatePayload.unit = '';
            updatePayload.unitId = null;
        }

        // Build update data using field definitions
        const updateData = buildUpdateData(updatePayload, UPDATE_FIELD_DEFINITIONS);
        if (updatePayload.expectedCompletionDate !== undefined) {
            const d = updatePayload.expectedCompletionDate ? new Date(updatePayload.expectedCompletionDate) : null;
            updateData.expectedCompletionDate = d && !Number.isNaN(d.getTime()) ? d : null;
        }
        if (updatePayload.reportingYear !== undefined) {
            updateData.reportingYear = _parseReportingYearOrFallback(
                updatePayload.reportingYear,
                existingRecord.reportingYear || existingRecord.startDate
            );
        }
        delete updateData.status;
        delete updateData.ongoingCompleted;

        // Handle farmer counts separately
        const farmerCounts = validateFarmerCounts(updatePayload, FLD_CONFIG.farmerCountMapping, {
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

    transferToNextYearTx: async (sourceFld, targetReportingYear, targetExpectedCompletionDate) => {
        return prisma.$transaction(async (tx) => {
            await tx.kvkFldIntroduction.update({
                where: { kvkFldId: sourceFld.kvkFldId },
                data: { ongoingCompleted: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR },
            });

            const nextReportingYear = targetReportingYear instanceof Date
                ? targetReportingYear
                : (targetReportingYear
                    ? new Date(targetReportingYear)
                    : _nextYearDate(_effectiveFldReportingYear(sourceFld)));

            const cloneData = removeIdFieldsForUpdate({
                kvkId: sourceFld.kvkId,
                kvkStaffId: sourceFld.kvkStaffId,
                seasonId: sourceFld.seasonId,
                sectorId: sourceFld.sectorId,
                sectorOther: sourceFld.sectorOther,
                thematicAreaId: sourceFld.thematicAreaId,
                thematicAreaOther: sourceFld.thematicAreaOther,
                categoryId: sourceFld.categoryId,
                categoryOther: sourceFld.categoryOther,
                subCategoryId: sourceFld.subCategoryId,
                subCategoryOther: sourceFld.subCategoryOther,
                cropId: sourceFld.cropId,
                cropOther: sourceFld.cropOther,
                fldName: sourceFld.fldName,
                noOfDemonstration: sourceFld.noOfDemonstration,
                quantity: sourceFld.quantity,
                unit: sourceFld.unit,
                unitId: sourceFld.unitId,
                startDate: sourceFld.startDate,
                reportingYear: nextReportingYear,
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
            data: _buildFldResultData(parsedId, payload),
        });
    },

    updateResultTx: async (fldId, payload) => {
        const parsedId = validateId(fldId, FLD_CONFIG.idField);
        return prisma.kvkFldResult.update({
            where: { kvkFldId: parsedId },
            data: _buildFldResultData(parsedId, payload, { includeId: false }),
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
    const effectiveReportingYear = _effectiveFldReportingYear(r);

    return {
        id: r.kvkFldId,
        kvkFldId: r.kvkFldId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        staffId: r.kvkStaffId,
        kvkStaffId: r.kvkStaffId,
        staffName: r.kvkStaff?.staffName,
        expectedCompletionDate: r.expectedCompletionDate ? r.expectedCompletionDate.toISOString().split('T')[0] : '',
        reportingYear: formatReportingYear(effectiveReportingYear),
        seasonId: r.seasonId,
        seasonName: r.season?.seasonName,
        sectorId: r.sectorId,
        // Prefer the typed "Other" text over the generic master name so lists/reports show the real value.
        sectorName: r.sectorOther || r.sector?.sectorName,
        sectorOther: r.sectorOther ?? '',
        fldThematicAreaId: r.thematicAreaId, // Frontend uses fldThematicAreaId, backend uses thematicAreaId
        thematicAreaId: r.thematicAreaId,
        thematicAreaName: r.thematicAreaOther || r.thematicArea?.thematicAreaName,
        thematicArea: r.thematicAreaOther || r.thematicArea?.thematicAreaName,
        thematicAreaOther: r.thematicAreaOther ?? '',
        categoryId: r.categoryId,
        categoryName: r.categoryOther || r.category?.categoryName,
        categoryOther: r.categoryOther ?? '',
        subCategoryId: r.subCategoryId,
        subCategoryName: r.subCategoryOther || r.subCategory?.subCategoryName,
        subCategoryOther: r.subCategoryOther ?? '',
        cropId: r.cropId,
        cropName: r.cropOther || r.crop?.cropName,
        cropOther: r.cropOther ?? '',
        technologyName: r.fldName,
        fldName: r.fldName,
        demoCount: r.noOfDemonstration,
        noOfDemonstration: r.noOfDemonstration,
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : undefined,
        startYear: r.startDate ? new Date(r.startDate).getFullYear() : null,
        completedAt: completionDate,
        quantity: r.quantity,
        quantityText: r.quantityText,
        unit: r.unitMaster?.unitName ?? r.unit,
        unitId: r.unitId,
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
        ongoingCompleted: normalizeFldStatus(r.ongoingCompleted),
        status: normalizeFldStatus(r.ongoingCompleted),
        fldResult: r.fldResult ? {
            fldResultId: r.fldResult.fldResultId,
            kvkFldId: r.fldResult.kvkFldId,
            resultTemplate: getFldResultTemplate(r),
            demoYield: r.fldResult.demoYield,
            checkYield: r.fldResult.checkYield,
            increasePercent: r.fldResult.increasePercent,
            demoGrossCost: r.fldResult.demoGrossCost,
            demoGrossReturn: r.fldResult.demoGrossReturn,
            demoNetReturn: r.fldResult.demoNetReturn,
            demoBcr: r.fldResult.demoBcr,
            checkGrossCost: r.fldResult.checkGrossCost,
            checkGrossReturn: r.fldResult.checkGrossReturn,
            checkNetReturn: r.fldResult.checkNetReturn,
            checkBcr: r.fldResult.checkBcr,
            otherParameterDemo: r.fldResult.otherParameterDemo,
            otherParameterCheck: r.fldResult.otherParameterCheck,
            laborReductionManDays: r.fldResult.laborReductionManDays,
            costReduction: r.fldResult.costReduction,
        } : null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

function _parseReportingYearOrFallback(value, fallbackDate) {
    const parsed = parseReportingYearDate(value);
    ensureNotFutureDate(parsed);
    if (parsed) return parsed;
    return fallbackDate ? new Date(fallbackDate) : null;
}

function _effectiveFldReportingYear(record) {
    return record?.reportingYear || record?.startDate || null;
}

function _nextYearDate(dateValue) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) return null;
    const next = new Date(date);
    next.setFullYear(next.getFullYear() + 1);
    return next;
}

function _optionalNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function _requiredNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function _buildFldResultData(fldId, payload, options = {}) {
    const includeId = options.includeId !== false;
    return {
        ...(includeId ? { kvkFldId: fldId } : {}),
        demoYield: _requiredNumber(payload.demoYield),
        checkYield: _requiredNumber(payload.checkYield),
        increasePercent: _requiredNumber(payload.increasePercent),
        demoGrossCost: _optionalNumber(payload.demoGrossCost),
        demoGrossReturn: _optionalNumber(payload.demoGrossReturn),
        demoNetReturn: _optionalNumber(payload.demoNetReturn),
        demoBcr: _optionalNumber(payload.demoBcr),
        checkGrossCost: _optionalNumber(payload.checkGrossCost),
        checkGrossReturn: _optionalNumber(payload.checkGrossReturn),
        checkNetReturn: _optionalNumber(payload.checkNetReturn),
        checkBcr: _optionalNumber(payload.checkBcr),
        otherParameterDemo: _optionalNumber(payload.otherParameterDemo),
        otherParameterCheck: _optionalNumber(payload.otherParameterCheck),
        laborReductionManDays: _optionalNumber(payload.laborReductionManDays),
        costReduction: _optionalNumber(payload.costReduction),
    };
}

module.exports = fldRepository;
