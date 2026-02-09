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
    }
};

function getEntityConfig(entityName) {
    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new Error(`Invalid entity name: ${entityName}`);
    }
    return config;
}

async function findAll(entityName, options = {}) {
    const config = getEntityConfig(entityName);
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

    const where = { ...filters };

    // Add search filter if nameField is defined
    if (search && config.nameField) {
        // Special handling for non-string fields if needed, but usually search is text
        where[config.nameField] = {
            contains: search,
            mode: 'insensitive',
        };
    }

    // Entity specific filtering overrides
    if (entityName === 'kvk-staff-transferred') {
        where.transferStatus = 'TRANSFERRED';
    } else if (entityName === 'kvk-employees') {
        where.transferStatus = 'ACTIVE';
    }

    if (entityName === 'kvk-equipments' || entityName === 'kvk-equipment-details') {
        where.type = 'EQUIPMENT';
    }

    const [data, total] = await Promise.all([
        prisma[config.model].findMany({
            where,
            include: config.includes,
            skip,
            take,
            orderBy: {
                [actualSortBy]: sortOrder,
            },
        }),
        prisma[config.model].count({ where }),
    ]);

    return { data, total };
}

async function findById(entityName, id) {
    const config = getEntityConfig(entityName);
    return await prisma[config.model].findUnique({
        where: { [config.idField]: parseInt(id) },
        include: config.includes,
    });
}

async function create(entityName, data) {
    const config = getEntityConfig(entityName);

    // Auto-set type for equipments/farm implements if not present
    if (entityName === 'kvk-equipments' || entityName === 'kvk-equipment-details') {
        data.type = 'EQUIPMENT';
    }

    return await prisma[config.model].create({
        data,
        include: config.includes,
    });
}

async function update(entityName, id, data) {
    const config = getEntityConfig(entityName);
    return await prisma[config.model].update({
        where: { [config.idField]: parseInt(id) },
        data,
        include: config.includes,
    });
}

async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);
    return await prisma[config.model].delete({
        where: { [config.idField]: parseInt(id) },
    });
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity
};
