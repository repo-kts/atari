const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters, applyDateFilters } = require('./commonFilters.js');

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

// §1.4.B Vehicle Status — reporting-year status rows from KvkVehicleDetail
// (the base KvkVehicle has no reportingYear, so the old query threw and the
// whole section was dropped). Year-wise; includes KVK for the aggregated view.
async function getKvkVehicleDetails(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    applyDateFilters(where, filters, 'reportingYear');

    const rows = await prisma.kvkVehicleDetail.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            vehicle: { select: { vehicleName: true, registrationNo: true, yearOfPurchase: true, totalCost: true } },
            vehicleStatus: { select: { statusLabel: true } },
            assetFundingSource: { select: { name: true } },
        },
        orderBy: [
            { reportingYear: 'desc' },
            { vehicleId: 'asc' },
        ],
    });

    return rows.map((d) => ({
        reportingYear: d.reportingYear,
        kvkId: d.kvkId,
        kvk: d.kvk,
        kvkName: d.kvk?.kvkName || '',
        vehicleName: d.vehicle?.vehicleName || '',
        registrationNo: d.vehicle?.registrationNo || '',
        yearOfPurchase: d.vehicle?.yearOfPurchase ?? '',
        totalCost: d.vehicle?.totalCost ?? '',
        totalRun: d.totalRun ?? '',
        presentStatus: d.vehicleStatus?.statusLabel ?? '',
        repairingCost: d.repairingCost ?? '',
        sourceOfFunding: d.assetFundingSource?.name ?? '',
    }));
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

// §1.5.B Equipment Status — reporting-year status rows from KvkEquipmentDetail.
async function getKvkEquipmentRecords(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    applyDateFilters(where, filters, 'reportingYear');

    const rows = await prisma.kvkEquipmentDetail.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            equipment: {
                select: {
                    equipmentName: true,
                    yearOfPurchase: true,
                    totalCost: true,
                    equipmentMaster: { select: { name: true } },
                },
            },
            equipmentStatus: { select: { statusLabel: true } },
            assetFundingSource: { select: { name: true } },
        },
        orderBy: [
            { reportingYear: 'desc' },
            { equipmentId: 'asc' },
        ],
    });

    return rows.map((d) => ({
        reportingYear: d.reportingYear,
        kvkId: d.kvkId,
        kvk: d.kvk,
        kvkName: d.kvk?.kvkName || '',
        equipmentName: d.equipment?.equipmentName || d.equipment?.equipmentMaster?.name || '',
        yearOfPurchase: d.equipment?.yearOfPurchase ?? '',
        totalCost: d.equipment?.totalCost ?? '',
        presentStatus: d.equipmentStatus?.statusLabel ?? '',
        repairingCost: d.repairingCost ?? '',
        sourceOfFunding: d.assetFundingSource?.name ?? '',
    }));
}

module.exports = {
    getKvkLandDetails,
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkEquipmentRecords,
};
