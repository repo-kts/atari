const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters, applyDateFilters } = require('./commonFilters.js');

// Coerce report rows to clean primitives so every consumer (PDF/Excel/Word) gets
// typed data instead of Decimals-as-strings or Date-as-timestamp.
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const yearOf = (v) =>
    v instanceof Date ? v.getUTCFullYear() : v ? Number(v) : null;

async function getKvkLandDetails(kvkId, filters = {}) {
    const where = { kvkId };
    // Land holdings are current-state (no reporting date) — no date filtering.
    return await prisma.kvkLandDetail.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            landItemMaster: { select: { name: true, isOther: true } },
        },
        orderBy: { landId: 'asc' },
    });
}

async function getKvkInfrastructure(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    const rows = await prisma.kvkInfrastructure.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            infraMaster: {
                select: { infraMasterId: true, name: true, isOther: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    // Flatten kvkName so the report field { dbField: 'kvkName' } resolves.
    return rows.map((r) => ({
        ...r,
        kvkName: r.kvk?.kvkName || '',
        infrastructureName: r.infraMaster?.isOther && r.specifyName
            ? r.specifyName
            : (r.infraMaster?.name || r.specifyName || ''),
        sourceOfFunding: r.sourceOfFundingOther || r.sourceOfFunding,
    }));
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
            vehicleType: {
                select: { name: true, isOther: true },
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
            vehicleTypeName: v.vehicleType?.isOther && v.vehicleTypeOther
                ? v.vehicleTypeOther
                : (v.vehicleType?.name || v.vehicleTypeOther || ''),
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
            vehicle: {
                select: {
                    vehicleName: true,
                    registrationNo: true,
                    yearOfPurchase: true,
                    totalCost: true,
                    vehicleTypeOther: true,
                    vehicleType: { select: { name: true, isOther: true } },
                },
            },
            vehicleStatus: { select: { statusLabel: true } },
            assetFundingSource: { select: { name: true } },
        },
        orderBy: [
            { reportingYear: 'desc' },
            { vehicleId: 'asc' },
        ],
    });

    return rows.map((d) => ({
        reportingYear: yearOf(d.reportingYear),
        kvkId: d.kvkId,
        kvk: d.kvk,
        kvkName: d.kvk?.kvkName || '',
        vehicleTypeName: d.vehicle?.vehicleType?.isOther && d.vehicle?.vehicleTypeOther
            ? d.vehicle.vehicleTypeOther
            : (d.vehicle?.vehicleType?.name || d.vehicle?.vehicleTypeOther || ''),
        vehicleName: d.vehicle?.vehicleName || '',
        registrationNo: d.vehicle?.registrationNo || '',
        yearOfPurchase: num(d.vehicle?.yearOfPurchase),
        totalCost: num(d.vehicle?.totalCost),
        totalRun: num(d.totalRun),
        presentStatus: d.vehicleStatusOther || d.vehicleStatus?.statusLabel || '',
        repairingCost: num(d.repairingCost),
        sourceOfFunding: d.assetFundingSourceOther || d.assetFundingSource?.name || '',
        fundingAgencyName: d.fundingAgencyName || '',
    }));
}

async function getKvkEquipments(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    const detailWhere = {};
    applyDateFilters(detailWhere, filters, 'reportingYear');

    const rows = await prisma.kvkEquipment.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            equipmentType: { select: { name: true, isOther: true } },
            // equipmentName is free-text but often blank; fall back to the master.
            equipmentMaster: { select: { name: true } },
            assetFundingSource: { select: { name: true } },
            // Present Status lives on the yearly detail.
            equipmentDetails: {
                where: detailWhere,
                include: {
                    equipmentStatus: { select: { statusLabel: true } },
                    assetFundingSource: { select: { name: true } },
                },
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
            equipmentTypeName: e.equipmentType?.isOther && e.equipmentTypeOther
                ? e.equipmentTypeOther
                : (e.equipmentType?.name || e.equipmentTypeOther || ''),
            equipmentName: e.equipmentName || e.equipmentMaster?.name || '',
            sourceOfFunding: latest?.assetFundingSourceOther
                || latest?.assetFundingSource?.name
                || e.assetFundingSourceOther
                || e.assetFundingSource?.name
                || '',
            fundingAgencyName: latest?.fundingAgencyName || '',
            presentStatus: latest?.equipmentStatusOther || latest?.equipmentStatus?.statusLabel || '',
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
                    equipmentTypeOther: true,
                    equipmentType: { select: { name: true, isOther: true } },
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
        reportingYear: yearOf(d.reportingYear),
        kvkId: d.kvkId,
        kvk: d.kvk,
        kvkName: d.kvk?.kvkName || '',
        equipmentTypeName: d.equipment?.equipmentType?.isOther && d.equipment?.equipmentTypeOther
            ? d.equipment.equipmentTypeOther
            : (d.equipment?.equipmentType?.name || d.equipment?.equipmentTypeOther || ''),
        equipmentName: d.equipment?.equipmentName || d.equipment?.equipmentMaster?.name || '',
        yearOfPurchase: num(d.equipment?.yearOfPurchase),
        totalCost: num(d.equipment?.totalCost),
        presentStatus: d.equipmentStatusOther || d.equipmentStatus?.statusLabel || '',
        repairingCost: num(d.repairingCost),
        sourceOfFunding: d.assetFundingSourceOther || d.assetFundingSource?.name || '',
        fundingAgencyName: d.fundingAgencyName || '',
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
