const prisma = require('../../config/prisma.js');

/**
 * About KVK Repository
 * Handles data access for KVK related forms
 */

const ENTITY_CONFIG = {
    'kvks': {
        model: 'kvk',
        idField: 'kvkId',
        nameField: 'kvkName',
        hostOrganizationName: 'hostOrg',
        includes: {
            zone: {
                select: { zoneId: true, zoneName: true }
            },
            state: {
                select: { stateId: true, stateName: true }
            },
            district: {
                select: { districtId: true, districtName: true }
            },
            org: {
                select: { orgId: true, orgName: true }
            },
            university: {
                select: { universityId: true, universityName: true }
            }
        },
        deleteCountSelect: {
            staff: true,
            infrastructures: true,
            equipments: true,
            vehicles: true,
            bankAccounts: true,
            farmImplements: true,
            transfersFrom: true,
            transfersTo: true,
            originalStaff: true,
            trainingAchievements: true,
            farmerAwards: true,
            kvkAwards: true,
            scientistAwards: true,
            hrdPrograms: true,
            kvkExtensionActivities: true,
            kvkOtherExtensionActivities: true,
            kvkImportantDayCelebrations: true,
            kvkTechnologyWeekCelebrations: true,
            fldExtensions: true,
            kvkFldIntroductions: true,
            fldTechnicalFeedbacks: true,
            kvkBudgetUtilizations: true,
            extensionActivityOrganized: true,
            cfldTechnicalParameters: true,
            users: true,
            kvkOfts: true,
            agriDrones: true,
            fpoCbboDetails: true,
            fpoManagements: true,
            kvkOtherProgrammes: true,
            seedHubPrograms: true,
            soilWaterAnalyses: true,
            soilWaterEquipments: true,
            worldSoilCelebrations: true,
            aryaPrevYear: true,
            aryaCurrentYear: true,
            csisa: true,
            drmrActivity: true,
            drmrDetails: true,
            atariMeeting: true,
            sacMeeting: true,
            swachhtaHiSewa: true,
            swachhQuarterlyExpenditure: true,
            swachhtaPakhwada: true,
            nicraDetails: true,
            nicraBasicInfo: true,
            nicraTraining: true,
            nicraExtensionActivity: true,
            geographicalInfo: true,
            physicalInfo: true,
            demonstrationInfo: true,
            beneficiariesDetails: true,
            financialInformation: true,
            soilDataInformation: true,
        },
        dependencyLabels: {
            staff: 'staff records',
            users: 'users',
            bankAccounts: 'bank accounts',
            infrastructures: 'infrastructure records',
            vehicles: 'vehicle records',
            equipments: 'equipment records',
            farmImplements: 'farm implements',
        },
        relationIdMap: {
            zoneId: { relationField: 'zone', relationIdField: 'zoneId', required: true },
            stateId: { relationField: 'state', relationIdField: 'stateId', required: true },
            districtId: { relationField: 'district', relationIdField: 'districtId', required: true },
            orgId: { relationField: 'org', relationIdField: 'orgId', required: true },
            universityId: { relationField: 'university', relationIdField: 'universityId', required: false },
        },
    },
    'kvk-bank-accounts': {
        model: 'kvkBankAccount',
        idField: 'bankAccountId',
        nameField: 'accountNumber',
        includes: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true
                }
            }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'kvk-employees': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        invalidScalarFields: ['category'],
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            },
            staffCategory: {
                select: { staffCategoryId: true, categoryName: true }
            },
            payLevel: {
                select: { payLevelId: true, levelName: true }
            }
        },
        deleteCountSelect: {
            hrdPrograms: true,
            kvkExtensionActivities: true,
            kvkFldIntroductions: true,
            kvkOtherExtensionActivities: true,
            kvkOfts: true,
            transferHistory: true,
        },
        dependencyLabels: {
            hrdPrograms: 'HRD program records',
            kvkExtensionActivities: 'extension activity records',
            kvkFldIntroductions: 'FLD introduction records',
            kvkOtherExtensionActivities: 'other extension activity records',
            kvkOfts: 'OFT records',
            transferHistory: 'transfer history records',
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
            sanctionedPostId: { relationField: 'sanctionedPost', relationIdField: 'sanctionedPostId', required: true },
            disciplineId: { relationField: 'discipline', relationIdField: 'disciplineId', required: true },
            staffCategoryId: { relationField: 'staffCategory', relationIdField: 'staffCategoryId', required: false },
            payLevelId: { relationField: 'payLevel', relationIdField: 'payLevelId', required: false },
            originalKvkId: { relationField: 'originalKvk', relationIdField: 'kvkId', required: false },
        },
    },
    // Same model as employees but will be filtered by service
    'kvk-staff-transferred': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        invalidScalarFields: ['category'],
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            originalKvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            },
            staffCategory: {
                select: { staffCategoryId: true, categoryName: true }
            },
            payLevel: {
                select: { payLevelId: true, levelName: true }
            }
        },
        deleteCountSelect: {
            hrdPrograms: true,
            kvkExtensionActivities: true,
            kvkFldIntroductions: true,
            kvkOtherExtensionActivities: true,
            kvkOfts: true,
            transferHistory: true,
        },
        dependencyLabels: {
            hrdPrograms: 'HRD program records',
            kvkExtensionActivities: 'extension activity records',
            kvkFldIntroductions: 'FLD introduction records',
            kvkOtherExtensionActivities: 'other extension activity records',
            kvkOfts: 'OFT records',
            transferHistory: 'transfer history records',
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
            sanctionedPostId: { relationField: 'sanctionedPost', relationIdField: 'sanctionedPostId', required: true },
            disciplineId: { relationField: 'discipline', relationIdField: 'disciplineId', required: true },
            staffCategoryId: { relationField: 'staffCategory', relationIdField: 'staffCategoryId', required: false },
            payLevelId: { relationField: 'payLevel', relationIdField: 'payLevelId', required: false },
            originalKvkId: { relationField: 'originalKvk', relationIdField: 'kvkId', required: false },
        },
    },
    'kvk-infrastructure': {
        model: 'kvkInfrastructure',
        idField: 'infraId',
        nameField: 'infraId',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            infraMaster: { select: { infraMasterId: true, name: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
            infraMasterId: { relationField: 'infraMaster', relationIdField: 'infraMasterId', required: true },
        },
    },
    'kvk-vehicles': {
        model: 'kvkVehicle',
        idField: 'vehicleId',
        nameField: 'vehicleName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'kvk-vehicle-details': { // Alias for vehicles
        model: 'kvkVehicle',
        idField: 'vehicleId',
        nameField: 'vehicleName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'kvk-equipments': {
        model: 'kvkEquipment',
        idField: 'equipmentId',
        nameField: 'equipmentName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'kvk-equipment-details': {
        model: 'kvkEquipment',
        idField: 'equipmentId',
        nameField: 'equipmentName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'kvk-farm-implements': {
        model: 'kvkFarmImplement',
        idField: 'implementId',
        nameField: 'implementName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        },
        relationIdMap: {
            kvkId: { relationField: 'kvk', relationIdField: 'kvkId', required: true },
        },
    },
    'staff-transfer-history': {
        model: 'staffTransferHistory',
        idField: 'transferId',
        nameField: 'transferId',
        includes: {
            staff: {
                select: { kvkStaffId: true, staffName: true }
            },
            fromKvk: {
                select: { kvkId: true, kvkName: true }
            },
            toKvk: {
                select: { kvkId: true, kvkName: true }
            },
            transferredByUser: {
                select: { userId: true, name: true, email: true }
            }
        },
        relationIdMap: {
            kvkStaffId: { relationField: 'staff', relationIdField: 'kvkStaffId', required: true },
            fromKvkId: { relationField: 'fromKvk', relationIdField: 'kvkId', required: true },
            toKvkId: { relationField: 'toKvk', relationIdField: 'kvkId', required: true },
            transferredBy: { relationField: 'transferredByUser', relationIdField: 'userId', required: false },
        },
    }
};

function getEntityConfig(entityName) {
    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new Error(`Invalid entity name: ${entityName}`);
    }
    return config;
}

async function findAll(entityName, options = {}, user = null) {
    const config = getEntityConfig(entityName);
    const model = prisma[config.model];
    if (!model) {
        console.warn(`[AboutKVK] Prisma model '${config.model}' not found - schema may need regeneration. Returning empty.`);
        return { data: [], total: 0 };
    }
    const {
        page = 1,
        limit = 100,
        search = '',
        sortBy,
        sortOrder = 'asc',
        filters = {},
    } = options;

    const actualSortBy = sortBy || config.idField;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    let where = {};

    // Entity specific filtering - build where clause from scratch for transfer history
    if (entityName === 'staff-transfer-history') {
        // For transfer history: build where clause explicitly
        if (filters.staffId) {
            where.kvkStaffId = filters.staffId;
        }
        if (filters.fromKvkId) {
            where.fromKvkId = filters.fromKvkId;
        }
        if (filters.toKvkId) {
            where.toKvkId = filters.toKvkId;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.transferDate = {};
            if (filters.dateFrom) {
                where.transferDate.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.transferDate.lte = new Date(filters.dateTo);
            }
        }
        if (filters.isReversal !== undefined) {
            where.isReversal = filters.isReversal;
        }
        // Transfer history doesn't use nameField search
    } else {
        // For other entities: use standard filter spreading
        where = { ...filters };

        // Add search filter if nameField is defined
        if (search && config.nameField) {
            // Special handling for non-string fields if needed, but usually search is text
            where[config.nameField] = {
                contains: search,
                mode: 'insensitive',
            };
        }

        // Entity-specific filtering for other entities
        if (entityName === 'kvk-staff-transferred') {
            // For Staff Transferred: Only show TRANSFERRED employees
            where.transferStatus = 'TRANSFERRED';

            // Filter by sourceKvkIds if provided (for tracking transfer chain)
            // This allows KVK admins to see employees they transferred
            if (filters.sourceKvkIds) {
                const sourceKvkId = filters.sourceKvkIds;
                // Remove sourceKvkIds from where as we'll handle it differently
                delete where.sourceKvkIds;

                // Use Prisma's JSON array contains filter
                // For PostgreSQL, we can use array_contains or path query
                where.sourceKvkIds = {
                    array_contains: sourceKvkId
                };
            }
        } else if (entityName === 'kvk-employees') {
            // For Employee Details: Show all employees that belong to the current KVK
            // This includes both ACTIVE and TRANSFERRED employees that belong to this KVK
            // We explicitly remove transferStatus filter to show all employees for the KVK
            // The kvkId filter (set in service layer) will ensure we only see employees belonging to this KVK
            // This allows the target KVK to see employees that were transferred to them
            // IMPORTANT: Remove transferStatus from where clause to show all employees (ACTIVE and TRANSFERRED)
            if ('transferStatus' in where) {
                delete where.transferStatus;
            }
        }
    }

    // Note: Generated Prisma schema may not have 'type' field on KvkEquipment - omit filter if not present
    // if (entityName === 'kvk-equipments' || entityName === 'kvk-equipment-details') {
    //     where.type = 'EQUIPMENT';
    // }

    // For staff-transferred with sourceKvkIds filter, we need to handle JSON array filtering
    // Prisma's JSON filtering varies by database, so we'll fetch and filter if needed
    let data, total;

    if (entityName === 'kvk-staff-transferred' && filters.sourceKvkIds) {
        // Fetch all transferred employees and filter in memory
        // This is less efficient but works across all databases
        const allData = await model.findMany({
            where: {
                transferStatus: 'TRANSFERRED',
                ...(search && config.nameField ? {
                    [config.nameField]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                } : {}),
            },
            include: config.includes,
        });

        // Filter by sourceKvkIds (check if JSON array contains the KVK ID)
        const filteredData = allData.filter(item => {
            if (!item.sourceKvkIds) return false;
            const sourceIds = Array.isArray(item.sourceKvkIds)
                ? item.sourceKvkIds
                : JSON.parse(item.sourceKvkIds);
            return Array.isArray(sourceIds) && sourceIds.includes(filters.sourceKvkIds);
        });

        // Apply pagination
        const sortedData = filteredData.sort((a, b) => {
            const aVal = a[actualSortBy];
            const bVal = b[actualSortBy];
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        total = filteredData.length;
        data = sortedData.slice(skip, skip + take);
    } else {
        // Standard query for other cases

        [data, total] = await Promise.all([
            model.findMany({
                where,
                include: config.includes,
                skip,
                take,
                orderBy: {
                    [actualSortBy]: sortOrder,
                },
            }),
            model.count({ where }),
        ]);

    }

    // Map ID field to generic 'id' for frontend compatibility
    const mappedData = data.map(item => ({
        ...item,
        id: item[config.idField]
    }));

    return { data: mappedData, total };
}

async function findById(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        const error = new Error(`ID is required for ${entityName}. Received: ${id}`);
        error.statusCode = 400;
        throw error;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        const error = new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
        error.statusCode = 400;
        throw error;
    }

    return await prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
        include: config.includes,
    });
}

/**
 * Sanitize data by removing fields that don't exist in the Prisma schema
 * @param {string} entityName - Entity name
 * @param {object} data - Data to sanitize
 * @returns {object} Sanitized data
 */
function sanitizeData(entityName, data) {
    const sanitized = {};
    const config = getEntityConfig(entityName);
    const invalidScalarFields = new Set(config.invalidScalarFields || []);
    const relationKeys = new Set([
        'kvk', 'zone', 'state', 'district', 'org', 'organization', 'university',
        'sanctionedPost', 'discipline', 'infraMaster', 'staffCategory', 'payLevel',
        'vehicle', 'equipment', 'originalKvk', 'fromKvk', 'toKvk', 'transferredByUser',
    ]);

    for (const [key, value] of Object.entries(data || {})) {
        // Remove common non-schema/meta keys that frequently come from UI payloads.
        if (key === 'id' || key === '_id' || key === '_count') continue;
        if (key === 'createdAt' || key === 'updatedAt') continue;
        if (invalidScalarFields.has(key)) continue;
        if (relationKeys.has(key)) continue;

        // Remove relation objects (but keep Date objects and scalar nulls).
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            continue;
        }

        // Never send undefined to Prisma update/create.
        if (value === undefined) continue;

        // Remove accidental duplicate id aliases while preserving actual model id field.
        if ((key.endsWith('Id') || key.endsWith('_id')) && key !== config.idField && value === '') {
            sanitized[key] = null;
            continue;
        }

        sanitized[key] = value;
    }

    // Remove fields that don't exist in Prisma schema for KVK
    if (entityName === 'kvks') {
        // Prisma schema only has: kvkName, zoneId, stateId, districtId, orgId, universityId,
        // hostOrg, mobile, email, address, yearOfSanction
        // Remove all fields that don't exist in the schema
        const invalidFields = ['hostMobile', 'hostLandline', 'hostFax', 'hostEmail'];
        invalidFields.forEach(field => {
            delete sanitized[field];
        });

        // Handle optional fields: convert empty strings to null
        if (sanitized.universityId === null || sanitized.universityId === undefined || sanitized.universityId === '') {
            sanitized.universityId = null;
        }
    }

    return sanitized;
}

/**
 * Convert scalar foreign key fields into relation connect/disconnect payloads.
 * This avoids Prisma checked/unchecked ambiguity when UI payloads include extra keys.
 */
function applyRelationMappings(entityName, data, { forUpdate = false } = {}) {
    const config = getEntityConfig(entityName);
    const relationIdMap = config.relationIdMap || {};
    const mapped = { ...data };

    for (const [fkField, relationConfig] of Object.entries(relationIdMap)) {
        if (!(fkField in mapped)) continue;

        const rawValue = mapped[fkField];
        delete mapped[fkField];

        if (rawValue === undefined) {
            continue;
        }

        if (rawValue === null || rawValue === '') {
            if (forUpdate && !relationConfig.required) {
                mapped[relationConfig.relationField] = { disconnect: true };
            }
            continue;
        }

        const parsed = parseInt(rawValue, 10);
        if (isNaN(parsed)) continue;

        mapped[relationConfig.relationField] = {
            connect: { [relationConfig.relationIdField]: parsed },
        };
    }

    return mapped;
}

async function create(entityName, data) {
    const config = getEntityConfig(entityName);
    const detailVehicleId = entityName === 'kvk-vehicle-details' ? parseInt(data?.vehicleId, 10) : null;
    const detailEquipmentId = entityName === 'kvk-equipment-details' ? parseInt(data?.equipmentId, 10) : null;

    // Sanitize data to remove fields not in Prisma schema
    const sanitizedData = sanitizeData(entityName, data);
    const relationSafeData = applyRelationMappings(entityName, sanitizedData, { forUpdate: false });

    // For vehicle-details and equipment-details: if vehicleId/equipmentId is provided,
    // update the existing record instead of creating a new one
    if (entityName === 'kvk-vehicle-details' && !isNaN(detailVehicleId) && detailVehicleId > 0) {
        // Update existing vehicle with the details
        const vehicleId = detailVehicleId;
        // Remove vehicleId from update data as it's used in where clause
        const { vehicleId: _, ...updateData } = relationSafeData;
        return await prisma[config.model].update({
            where: { [config.idField]: vehicleId },
            data: updateData,
            include: config.includes,
        });
    }

    if (entityName === 'kvk-equipment-details' && !isNaN(detailEquipmentId) && detailEquipmentId > 0) {
        // Update existing equipment with the details
        const equipmentId = detailEquipmentId;
        // Remove equipmentId from update data as it's used in where clause
        const { equipmentId: _, ...updateData } = relationSafeData;
        return await prisma[config.model].update({
            where: { [config.idField]: equipmentId },
            data: updateData,
            include: config.includes,
        });
    }

    return await prisma[config.model].create({
        data: relationSafeData,
        include: config.includes,
    });
}

async function update(entityName, id, data) {
    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        const error = new Error(`ID is required for ${entityName}. Received: ${id}`);
        error.statusCode = 400;
        throw error;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        const error = new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
        error.statusCode = 400;
        throw error;
    }

    // Sanitize data to remove fields not in Prisma schema
    const sanitizedData = sanitizeData(entityName, data);
    const relationSafeData = applyRelationMappings(entityName, sanitizedData, { forUpdate: true });

    // For vehicle-details and equipment-details, only update the fields provided
    // Don't require base fields like vehicleName/equipmentName
    if (entityName === 'kvk-vehicle-details' || entityName === 'kvk-equipment-details') {
        // Filter out any undefined/null values and only keep the fields that are being updated
        const updateData = {};
        for (const [key, value] of Object.entries(relationSafeData)) {
            // Only include fields that have actual values (not undefined, but allow null for optional fields)
            if (value !== undefined) {
                updateData[key] = value;
            }
        }
        return await prisma[config.model].update({
            where: { [config.idField]: parsedId },
            data: updateData,
            include: config.includes,
        });
    }

    return await prisma[config.model].update({
        where: { [config.idField]: parsedId },
        data: relationSafeData,
        include: config.includes,
    });
}

async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        const error = new Error(`ID is required for ${entityName}. Received: ${id}`);
        error.statusCode = 400;
        throw error;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        const error = new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
        error.statusCode = 400;
        throw error;
    }
    const where = { [config.idField]: parsedId };

    const select = { [config.idField]: true };
    if (config.deleteCountSelect) {
        select._count = { select: config.deleteCountSelect };
    }

    const existing = await prisma[config.model].findUnique({
        where,
        select,
    });

    if (!existing) {
        const error = new Error(`${entityName} with ID ${id} not found`);
        error.statusCode = 404;
        throw error;
    }

    const dependencySummary = [];
    if (existing._count) {
        for (const [key, count] of Object.entries(existing._count)) {
            if (Number(count) > 0) {
                const label = config.dependencyLabels?.[key] || key;
                dependencySummary.push(`${count} ${label}`);
            }
        }
    }

    if (dependencySummary.length > 0) {
        const error = new Error(
            `Cannot delete ${entityName}: linked records exist (${dependencySummary.join(', ')}). Delete dependent records first.`
        );
        error.statusCode = 409;
        throw error;
    }

    try {
        return await prisma[config.model].delete({ where });
    } catch (error) {
        if (error?.code === 'P2003') {
            const dependencyError = new Error(
                `Cannot delete ${entityName}: it is referenced by other records. Delete dependent records first.`
            );
            dependencyError.statusCode = 409;
            throw dependencyError;
        }
        throw error;
    }
}
/**
 * Get all sanctioned posts (for dropdown)
 */
async function getAllSanctionedPosts() {
    return await prisma.sanctionedPost.findMany({
        orderBy: { sanctionedPostId: 'asc' }
    });
}

/**
 * Get all disciplines (for dropdown)
 */
async function getAllDisciplines() {
    return await prisma.discipline.findMany({
        orderBy: { disciplineId: 'asc' }
    });
}

/**
 * Get all infrastructure masters (for dropdown)
 */
async function getAllInfraMasters() {
    return await prisma.kvkInfrastructureMaster.findMany({
        orderBy: { infraMasterId: 'asc' }
    });
}


/**
 * Create transfer history record
 */
async function createTransferHistory(transferData) {
    return await prisma.staffTransferHistory.create({
        data: {
            kvkStaffId: transferData.kvkStaffId,
            fromKvkId: transferData.fromKvkId,
            toKvkId: transferData.toKvkId,
            transferredBy: transferData.transferredBy,
            transferReason: transferData.transferReason,
            notes: transferData.notes,
            isReversal: transferData.isReversal || false,
            reversedTransferId: transferData.reversedTransferId,
        },
        include: {
            staff: {
                select: {
                    kvkStaffId: true,
                    staffName: true,
                }
            },
            fromKvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                }
            },
            toKvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                }
            },
            transferredByUser: {
                select: {
                    userId: true,
                    name: true,
                    email: true,
                }
            }
        }
    });
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    getAllSanctionedPosts,
    getAllDisciplines,
    getAllInfraMasters,
    createTransferHistory
};
