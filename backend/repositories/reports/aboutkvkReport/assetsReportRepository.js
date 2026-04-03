const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./commonFilters.js');

async function getKvkInfrastructure(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkInfrastructure.findMany({
        where,
        include: {
            infraMaster: {
                select: { infraMasterId: true, name: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}

async function getKvkVehicles(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkVehicle.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
        },
        orderBy: [
            { yearOfPurchase: 'desc' },
            { vehicleName: 'asc' },
        ],
    });
}

async function getKvkVehicleDetails(kvkId, filters = {}) {
    const where = {
        kvkId,
        reportingYear: {
            not: null,
        },
    };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkVehicle.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
        },
        orderBy: [
            { reportingYear: 'desc' },
            { yearOfPurchase: 'desc' },
            { vehicleName: 'asc' },
        ],
    });
}

async function getKvkEquipments(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkEquipment.findMany({
        where,
        orderBy: [
            { yearOfPurchase: 'desc' },
            { equipmentName: 'asc' },
        ],
    });
}

async function getKvkEquipmentRecords(kvkId, filters = {}) {
    const where = {
        kvkId,
        reportingYear: {
            not: null,
        },
    };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkEquipment.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
        },
        orderBy: [
            { reportingYear: 'desc' },
            { yearOfPurchase: 'desc' },
            { equipmentName: 'asc' },
        ],
    });
}

async function getKvkFarmImplements(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kvkFarmImplement.findMany({
        where,
        orderBy: [
            { yearOfPurchase: 'desc' },
            { implementName: 'asc' },
        ],
    });
}

module.exports = {
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkEquipmentRecords,
    getKvkFarmImplements,
};
