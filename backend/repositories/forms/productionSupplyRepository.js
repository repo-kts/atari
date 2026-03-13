const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
    normalizeFarmersData,
    validateUUID,
} = require('../../utils/repositoryHelpers');

/**
 * Production Supply Repository
 * Handles all database operations for Production and Supply of Technological Products
 */

/**
 * Parse float value with validation
 * @param {any} value - Value to parse
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {number|null} Parsed float or null
 * @throws {RepositoryError} If value is invalid
 */
const _parseFloat = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
        throw new RepositoryError(`Invalid ${fieldName}: must be a non-negative number`, 'VALIDATION_ERROR', 400);
    }
    return parsed;
};

/**
 * Normalize string value
 * @param {any} value - Value to normalize
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} allowNull - Whether null is allowed
 * @returns {string|null} Normalized string or null
 * @throws {RepositoryError} If value is invalid
 */
const _normalizeString = (value, fieldName, allowNull = true) => {
    if (value === null || value === undefined) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
    }
    const str = String(value).trim();
    if (str.length === 0) {
        if (allowNull) return null;
        throw new RepositoryError(`${fieldName} cannot be empty`, 'VALIDATION_ERROR', 400);
    }
    return str;
};

/**
 * Validate foreign key references
 * @param {number|null} id - ID to validate
 * @param {string} modelName - Prisma model name
 * @param {string} idField - ID field name
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} required - Whether the field is required
 * @throws {RepositoryError} If validation fails
 */
const _validateForeignKey = async (id, modelName, idField, fieldName, required = false) => {
    if (!id) {
        if (required) {
            throw new RepositoryError(`${fieldName} is required`, 'VALIDATION_ERROR', 400);
        }
        return;
    }

    const idNum = parseInteger(id, fieldName, false);
    try {
        const exists = await prisma[modelName].findUnique({
            where: { [idField]: idNum },
            select: { [idField]: true },
        });
        if (!exists) {
            throw new RepositoryError(`${fieldName} with ID ${idNum} does not exist`, 'NOT_FOUND', 404);
        }
    } catch (error) {
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(`Error validating ${fieldName}: ${error.message}`, 'DATABASE_ERROR', 500);
    }
};

/**
 * Map database response to API format
 * @param {object} r - Database record
 * @returns {object} Mapped response
 */
const _mapResponse = (r) => {
    if (!r) return null;

    // Calculate reporting year from yearId if available
    const reportingYear = r.reportingYear?.yearName || r.reportingYearId || null;

    // Calculate total participants
    const totalParticipants = (r.farmersGeneralM || 0) + (r.farmersGeneralF || 0) +
        (r.farmersObcM || 0) + (r.farmersObcF || 0) +
        (r.farmersScM || 0) + (r.farmersScF || 0) +
        (r.farmersStM || 0) + (r.farmersStF || 0);

    return {
        ...r,
        id: r.productionSupplyId,
        reportingYear,
        kvkName: r.kvk?.kvkName,
        category: r.productCategory?.productCategoryName,
        variety: r.speciesName,
        productCategory: r.productCategory?.productCategoryName,
        productType: r.productType?.productCategoryType,
        product: r.product?.productName,
        speciesBreedVariety: r.speciesName,
        unit: r.unit,
        quantity: r.quantity,
        valueRs: r.value,
        noOfParticipants: totalParticipants,
        // Participant fields (frontend format)
        gen_m: r.farmersGeneralM,
        gen_f: r.farmersGeneralF,
        obc_m: r.farmersObcM,
        obc_f: r.farmersObcF,
        sc_m: r.farmersScM,
        sc_f: r.farmersScF,
        st_m: r.farmersStM,
        st_f: r.farmersStF,
        // Participant fields (backend format)
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
    };
};

const productionSupplyRepository = {
    create: async (data, user) => {
        try {
            // Validate input
            if (!data || typeof data !== 'object') {
                throw new RepositoryError('Invalid input data', 'VALIDATION_ERROR', 400);
            }

            // Resolve kvkId: prioritized from user session, then from data
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) {
                throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            }

            // Validate KVK exists
            await validateKvkExists(kvkId);

            // Validate and resolve foreign keys
            const reportingYearId = data.reportingYearId || data.reportingYear || data.yearId;
            if (reportingYearId) {
                await _validateForeignKey(reportingYearId, 'yearMaster', 'yearId', 'Reporting Year', false);
            }

            const productCategoryId = data.productCategoryId || data.prodCategory;
            if (productCategoryId) {
                await _validateForeignKey(productCategoryId, 'productCategory', 'productCategoryId', 'Product Category', false);
            }

            const productTypeId = data.productTypeId || data.prodSubCategory;
            if (productTypeId) {
                await _validateForeignKey(productTypeId, 'productType', 'productTypeId', 'Product Type', false);
            }

            const productId = data.productId || data.prodType;
            if (productId) {
                await _validateForeignKey(productId, 'product', 'productId', 'Product', false);
            }

            // Validate required fields
            const speciesName = _normalizeString(data.speciesName, 'Species / Breed / Variety', false);
            const unit = _normalizeString(data.unit, 'Unit', false);
            const quantity = _parseFloat(data.quantity, 'Quantity', false);
            const value = _parseFloat(data.value, 'Value', false);

            // Validate unit is one of allowed values
            const allowedUnits = ['Kg', 'Quintal', 'Nos'];
            if (!allowedUnits.includes(unit)) {
                throw new RepositoryError(`Invalid unit: must be one of ${allowedUnits.join(', ')}`, 'VALIDATION_ERROR', 400);
            }

            // Prepare create data
            const createData = {
                kvkId,
                reportingYearId: reportingYearId ? parseInteger(reportingYearId, 'reportingYearId', false) : null,
                productCategoryId: productCategoryId ? parseInteger(productCategoryId, 'productCategoryId', false) : null,
                productTypeId: productTypeId ? parseInteger(productTypeId, 'productTypeId', false) : null,
                productId: productId ? parseInteger(productId, 'productId', false) : null,
                speciesName,
                unit,
                quantity,
                value,
                ...normalizeFarmersData(data, true), // Include all farmer participant fields with defaults
            };

            // Create the record using Prisma
            const result = await prisma.kvkProductionSupply.create({
                data: createData,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    productCategory: { select: { productCategoryName: true } },
                    productType: { select: { productCategoryType: true } },
                    product: { select: { productName: true } },
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
            throw new RepositoryError(`Failed to create production supply record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};

            // Strict isolation for KVK-scoped users
            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            } else if (filters.kvkId) {
                const kvkId = parseInteger(filters.kvkId, 'filters.kvkId', false);
                where.kvkId = kvkId;
            }

            // Additional filters
            if (filters.reportingYearId) {
                where.reportingYearId = parseInteger(filters.reportingYearId, 'reportingYearId', false);
            }
            if (filters.productCategoryId) {
                where.productCategoryId = parseInteger(filters.productCategoryId, 'productCategoryId', false);
            }
            if (filters.productTypeId) {
                where.productTypeId = parseInteger(filters.productTypeId, 'productTypeId', false);
            }

            const results = await prisma.kvkProductionSupply.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    productCategory: { select: { productCategoryName: true } },
                    productType: { select: { productCategoryType: true } },
                    product: { select: { productName: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return results.map(_mapResponse);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch production supply records: ${error.message}`, 'FETCH_ERROR', 500);
        }
    },

    findById: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const productionSupplyId = validateUUID(id, 'id', false);
            const where = { productionSupplyId };

            if (user && user.kvkId) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            const result = await prisma.kvkProductionSupply.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    productCategory: { select: { productCategoryName: true } },
                    productType: { select: { productCategoryType: true } },
                    product: { select: { productName: true } },
                },
            });

            if (!result) {
                throw new RepositoryError('Production supply record not found', 'NOT_FOUND', 404);
            }

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(`Failed to fetch production supply record: ${error.message}`, 'FETCH_ERROR', 500);
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

            const productionSupplyId = validateUUID(id, 'id', false);
            const where = { productionSupplyId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.kvkProductionSupply.findFirst({
                where,
                select: { productionSupplyId: true, kvkId: true },
            });

            if (!existing) {
                throw new RepositoryError('Production supply record not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Build update data
            const updateData = {};

            // Update kvkId if provided
            if (data.kvkId !== undefined) {
                const kvkId = parseInteger(data.kvkId, 'kvkId', false);
                await validateKvkExists(kvkId);
                updateData.kvkId = kvkId;
            }

            // Update foreign keys if provided
            if (data.reportingYearId !== undefined || data.reportingYear !== undefined || data.yearId !== undefined) {
                const reportingYearId = data.reportingYearId || data.reportingYear || data.yearId;
                if (reportingYearId) {
                    await _validateForeignKey(reportingYearId, 'yearMaster', 'yearId', 'Reporting Year', false);
                    updateData.reportingYearId = parseInteger(reportingYearId, 'reportingYearId', false);
                } else {
                    updateData.reportingYearId = null;
                }
            }

            if (data.productCategoryId !== undefined || data.prodCategory !== undefined) {
                const productCategoryId = data.productCategoryId || data.prodCategory;
                if (productCategoryId) {
                    await _validateForeignKey(productCategoryId, 'productCategory', 'productCategoryId', 'Product Category', false);
                    updateData.productCategoryId = parseInteger(productCategoryId, 'productCategoryId', false);
                } else {
                    updateData.productCategoryId = null;
                }
            }

            if (data.productTypeId !== undefined || data.prodSubCategory !== undefined) {
                const productTypeId = data.productTypeId || data.prodSubCategory;
                if (productTypeId) {
                    await _validateForeignKey(productTypeId, 'productType', 'productTypeId', 'Product Type', false);
                    updateData.productTypeId = parseInteger(productTypeId, 'productTypeId', false);
                } else {
                    updateData.productTypeId = null;
                }
            }

            if (data.productId !== undefined || data.prodType !== undefined) {
                const productId = data.productId || data.prodType;
                if (productId) {
                    await _validateForeignKey(productId, 'product', 'productId', 'Product', false);
                    updateData.productId = parseInteger(productId, 'productId', false);
                } else {
                    updateData.productId = null;
                }
            }

            // Update required fields if provided
            if (data.speciesName !== undefined) {
                updateData.speciesName = _normalizeString(data.speciesName, 'Species / Breed / Variety', false);
            }

            if (data.unit !== undefined) {
                const unit = _normalizeString(data.unit, 'Unit', false);
                const allowedUnits = ['Kg', 'Quintal', 'Nos'];
                if (!allowedUnits.includes(unit)) {
                    throw new RepositoryError(`Invalid unit: must be one of ${allowedUnits.join(', ')}`, 'VALIDATION_ERROR', 400);
                }
                updateData.unit = unit;
            }

            if (data.quantity !== undefined) {
                updateData.quantity = _parseFloat(data.quantity, 'Quantity', false);
            }

            if (data.value !== undefined) {
                updateData.value = _parseFloat(data.value, 'Value', false);
            }

            // Update participant data if provided (only farmer fields for production supply)
            const participantData = normalizeFarmersData(data, false);
            Object.assign(updateData, participantData);

            // Update the record
            const result = await prisma.kvkProductionSupply.update({
                where: { productionSupplyId },
                data: updateData,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: { select: { yearName: true } },
                    productCategory: { select: { productCategoryName: true } },
                    productType: { select: { productCategoryType: true } },
                    product: { select: { productName: true } },
                },
            });

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Production supply record not found', 'NOT_FOUND', 404);
                }
                if (error.code === 'P2003') {
                    throw new RepositoryError('Invalid foreign key reference', 'VALIDATION_ERROR', 400);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to update production supply record: ${error.message}`, 'UPDATE_ERROR', 500);
        }
    },

    delete: async (id, user) => {
        try {
            if (!id) {
                throw new RepositoryError('ID is required', 'VALIDATION_ERROR', 400);
            }

            const productionSupplyId = validateUUID(id, 'id', false);
            const where = { productionSupplyId };

            // Check authorization
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                const kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
                where.kvkId = kvkId;
            }

            // Check if record exists
            const existing = await prisma.kvkProductionSupply.findFirst({
                where,
                select: { productionSupplyId: true },
            });

            if (!existing) {
                throw new RepositoryError('Production supply record not found or unauthorized', 'NOT_FOUND', 404);
            }

            // Delete the record
            await prisma.kvkProductionSupply.delete({
                where: { productionSupplyId },
            });

            return { success: true, message: 'Production supply record deleted successfully' };
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new RepositoryError('Production supply record not found', 'NOT_FOUND', 404);
                }
                throw new RepositoryError(`Database error: ${error.message}`, 'DATABASE_ERROR', 500);
            }
            throw new RepositoryError(`Failed to delete production supply record: ${error.message}`, 'DELETE_ERROR', 500);
        }
    },
};

module.exports = productionSupplyRepository;
