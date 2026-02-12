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
                select: { orgId: true, uniName: true }
            }
        }
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
        }
    },
    'kvk-employees': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            }
        }
    },
    // Same model as employees but will be filtered by service
    'kvk-staff-transferred': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            }
        }
    },
    'kvk-infrastructure': {
        model: 'kvkInfrastructure',
        idField: 'infraId',
        nameField: 'infraId',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            infraMaster: { select: { infraMasterId: true, name: true } }
        }
    },
    'kvk-vehicles': {
        model: 'kvkVehicle',
        idField: 'vehicleId',
        nameField: 'vehicleName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        }
    },
    'kvk-vehicle-details': { // Alias for vehicles
        model: 'kvkVehicle',
        idField: 'vehicleId',
        nameField: 'vehicleName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        }
    },
    'kvk-equipments': {
        model: 'kvkEquipment',
        idField: 'equipmentId',
        nameField: 'equipmentName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        }
    },
    'kvk-equipment-details': {
        model: 'kvkEquipment',
        idField: 'equipmentId',
        nameField: 'equipmentName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        }
    },
    'kvk-farm-implements': {
        model: 'kvkFarmImplement',
        idField: 'implementId',
        nameField: 'implementName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } }
        }
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
        }
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
        // Debug log for kvk-employees to verify filtering
        if (entityName === 'kvk-employees') {
            console.log('🔍 [KVK Employees Query] Entity:', entityName, 'Where clause:', JSON.stringify(where, null, 2));
        }
        
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
        
        // Debug log for kvk-employees to verify results
        if (entityName === 'kvk-employees') {
            console.log('✅ [KVK Employees Query] Found', data.length, 'employees. Total:', total);
            if (data.length > 0) {
                console.log('📋 Employees:', data.map(e => ({ id: e.kvkStaffId, name: e.staffName, kvkId: e.kvkId, transferStatus: e.transferStatus })));
            }
        }
    }

    return { data, total };
}

async function findById(entityName, id) {
    const config = getEntityConfig(entityName);
    
    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new Error(`ID is required for ${entityName}. Received: ${id}`);
    }
    
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
    }
    
    return await prisma[config.model].findUnique({
        where: { [config.idField]: parsedId },
        include: config.includes,
    });
}

async function create(entityName, data) {
    const config = getEntityConfig(entityName);

    // Auto-set type for equipments/farm implements if schema has type field
    // (Generated schema may not include type - omit if Prisma validation fails)
    // if (entityName === 'kvk-equipments' || entityName === 'kvk-equipment-details') {
    //     data.type = 'EQUIPMENT';
    // }

    // For vehicle-details and equipment-details: if vehicleId/equipmentId is provided,
    // update the existing record instead of creating a new one
    if (entityName === 'kvk-vehicle-details' && data.vehicleId) {
        // Update existing vehicle with the details
        const vehicleId = data.vehicleId;
        // Remove vehicleId from update data as it's used in where clause
        const { vehicleId: _, ...updateData } = data;
        return await prisma[config.model].update({
            where: { [config.idField]: vehicleId },
            data: updateData,
            include: config.includes,
        });
    }

    if (entityName === 'kvk-equipment-details' && data.equipmentId) {
        // Update existing equipment with the details
        const equipmentId = data.equipmentId;
        // Remove equipmentId from update data as it's used in where clause
        const { equipmentId: _, ...updateData } = data;
        return await prisma[config.model].update({
            where: { [config.idField]: equipmentId },
            data: updateData,
            include: config.includes,
        });
    }

    return await prisma[config.model].create({
        data,
        include: config.includes,
    });
}

async function update(entityName, id, data) {
    const config = getEntityConfig(entityName);
    
    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new Error(`ID is required for ${entityName}. Received: ${id}`);
    }
    
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
    }
    
    // For vehicle-details and equipment-details, only update the fields provided
    // Don't require base fields like vehicleName/equipmentName
    if (entityName === 'kvk-vehicle-details' || entityName === 'kvk-equipment-details') {
        // Filter out any undefined/null values and only keep the fields that are being updated
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
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
        data,
        include: config.includes,
    });
}

async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);
    
    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new Error(`ID is required for ${entityName}. Received: ${id}`);
    }
    
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
    }
    
    return await prisma[config.model].delete({
        where: { [config.idField]: parsedId },
    });
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
