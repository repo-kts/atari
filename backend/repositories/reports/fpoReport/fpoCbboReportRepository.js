const prisma = require('../../../config/prisma.js');

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) {
        return null;
    }
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate || filters.endDate) {
        where.reportingYear = {};
        if (filters.startDate) where.reportingYear.gte = new Date(filters.startDate);
        if (filters.endDate) where.reportingYear.lte = new Date(filters.endDate);
    }

    if (filters.year) {
        const range = buildDateRangeForYear(filters.year);
        if (range) {
            where.reportingYear = {
                gte: range.start,
                lte: range.end,
            };
        }
    }

    return where;
}

function toYesNo(value) {
    return value ? 'Yes' : 'No';
}

function mapRecord(record) {
    return {
        fpoCbboDetailsId: record.fpoCbboDetailsId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',
        blocksAllocated: Number(record.blocksAllocated || 0),
        fposRegisteredAsCbbo: Number(record.fposRegisteredAsCbbo || 0),
        avgMembersPerFpo: Number(record.avgMembersPerFpo || 0),
        fposReceivedManagementCost: Number(record.fposReceivedManagementCost || 0),
        fposReceivedEquityGrant: Number(record.fposReceivedEquityGrant || 0),
        techBackstoppingProvided: Number(record.techBackstoppingProvided || 0),
        trainingProgrammeOrganized: Number(record.trainingProgrammeOrganized || 0),
        trainingReceivedByMembers: toYesNo(record.trainingReceivedByMembers),
        assistanceInEconomicActivities: Number(record.assistanceInEconomicActivities || 0),
        businessPlanPreparedWithCbbo: toYesNo(record.businessPlanPreparedWithCbbo),
        businessPlanPreparedWithoutCbbo: toYesNo(record.businessPlanPreparedWithoutCbbo),
        fposDoingBusiness: Number(record.fposDoingBusiness || 0),
        reportingYear: record.reportingYear || null,
    };
}

async function getFpoCbboDetailsData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.fpoCbboDetails.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
        },
        orderBy: [{ reportingYear: 'asc' }, { fpoCbboDetailsId: 'asc' }],
    });

    return rows.map(mapRecord);
}

function mapManagementRecord(record) {
    return {
        fpoManagementId: record.fpoManagementId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        fpoName: record.fpoName || '',
        address: record.address || '',
        registrationNumber: record.registrationNumber || '',
        registrationDate: record.registrationDate || null,
        proposedActivity: record.proposedActivity || '',
        commodityIdentified: record.commodityIdentified || '',
        totalBomMembers: Number(record.totalBomMembers || 0),
        totalFarmersAttached: Number(record.totalFarmersAttached || 0),
        financialPositionLakh: Number(record.financialPositionLakh || 0),
        successIndicator: record.successIndicator || '',
        reportingYear: record.reportingYear || null,
    };
}

async function getFpoManagementData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.fpoManagement.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { fpoManagementId: 'asc' }],
    });

    return rows.map(mapManagementRecord);
}

module.exports = {
    getFpoCbboDetailsData,
    getFpoManagementData,
};
