const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('./commonFilters.js');

async function getKvkLandDetails(kvkId, filters = {}) {
    const where = { kvkId };
    // Land holdings are current-state (no reporting date) — no date filtering.
    return await prisma.kvkLandDetail.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: { landId: 'asc' },
    });
}

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

    const rows = await prisma.kvkVehicle.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
            // Total Run + Present Status live on the yearly detail, not on the
            // base vehicle. Pull the latest detail so the report can show them.
            vehicleDetails: {
                include: { vehicleStatus: { select: { statusLabel: true } } },
                orderBy: { reportingYear: 'desc' },
            },
        },
        orderBy: [
            { yearOfPurchase: 'desc' },
            { vehicleName: 'asc' },
        ],
    });

    return rows.map((v) => {
        const latest = Array.isArray(v.vehicleDetails) ? v.vehicleDetails[0] : null;
        return {
            ...v,
            kvkName: v.kvk?.kvkName || '',
            totalRun: latest?.totalRun ?? '',
            presentStatus: latest?.vehicleStatus?.statusLabel ?? '',
        };
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

    const rows = await prisma.kvkEquipment.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            // equipmentName is free-text but often blank; fall back to the master.
            equipmentMaster: { select: { name: true } },
            assetFundingSource: { select: { name: true } },
            // Present Status lives on the yearly detail.
            equipmentDetails: {
                include: { equipmentStatus: { select: { statusLabel: true } } },
                orderBy: { reportingYear: 'desc' },
            },
        },
        orderBy: [
            { yearOfPurchase: 'desc' },
            { equipmentName: 'asc' },
        ],
    });

    return rows.map((e) => {
        const latest = Array.isArray(e.equipmentDetails) ? e.equipmentDetails[0] : null;
        return {
            ...e,
            kvkName: e.kvk?.kvkName || '',
            equipmentName: e.equipmentName || e.equipmentMaster?.name || '',
            sourceOfFunding: e.assetFundingSource?.name || '',
            presentStatus: latest?.equipmentStatus?.statusLabel ?? '',
        };
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

module.exports = {
    getKvkLandDetails,
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkEquipmentRecords,
};
