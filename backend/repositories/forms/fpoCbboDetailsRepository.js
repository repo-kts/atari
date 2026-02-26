const prisma = require('../../config/prisma.js');

const fpoCbboDetailsRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        const result = await prisma.fpoCbboDetails.create({
            data: {
                kvkId,
                reportingYear: parseInt(data.yearId ?? data.reportingYear) || new Date().getFullYear(),
                blocksAllocated: parseInt(data.blocksAllocated) || 0,
                fposRegisteredAsCbbo: parseInt(data.fposRegisteredAsCbbo) || 0,
                avgMembersPerFpo: parseInt(data.avgMembersPerFpo) || 0,
                fposReceivedManagementCost: parseInt(data.fposReceivedMgmtCost ?? data.fposReceivedManagementCost) || 0,
                fposReceivedEquityGrant: parseInt(data.fposReceivedEquityGrant) || 0,
                techBackstoppingProvided: parseInt(data.techBackstoppingFpos ?? data.techBackstoppingProvided) || 0,
                trainingProgrammeOrganized: parseInt(data.trainingProgsOrganized ?? data.trainingProgrammeOrganized) || 0,
                trainingReceivedByMembers: data.trainingReceivedByMembers === 'Yes' || data.trainingReceivedByMembers === true,
                assistanceInEconomicActivities: parseInt(data.assistanceEconomicActivities ?? data.assistanceInEconomicActivities) || 0,
                businessPlanPreparedWithCbbo: data.businessPlanCbbo === 'Yes' || data.businessPlanCbbo === true || !!data.businessPlanPreparedWithCbbo,
                businessPlanPreparedWithoutCbbo: data.businessPlanWithoutCbbo === 'Yes' || data.businessPlanWithoutCbbo === true || !!data.businessPlanPreparedWithoutCbbo,
                fposDoingBusiness: parseInt(data.fposDoingBusiness) || 0,
            },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYear) {
            where.reportingYear = parseInt(filters.reportingYear);
        }

        const results = await prisma.fpoCbboDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { fpoCbboDetailsId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.fpoCbboDetails.findUnique({
            where: { fpoCbboDetailsId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const updateData = {};

        if (data.yearId !== undefined || data.reportingYear !== undefined) updateData.reportingYear = parseInt(data.yearId ?? data.reportingYear);
        if (data.blocksAllocated !== undefined) updateData.blocksAllocated = parseInt(data.blocksAllocated);
        if (data.fposRegisteredAsCbbo !== undefined) updateData.fposRegisteredAsCbbo = parseInt(data.fposRegisteredAsCbbo);
        if (data.avgMembersPerFpo !== undefined) updateData.avgMembersPerFpo = parseInt(data.avgMembersPerFpo);
        if (data.fposReceivedMgmtCost !== undefined || data.fposReceivedManagementCost !== undefined) updateData.fposReceivedManagementCost = parseInt(data.fposReceivedMgmtCost ?? data.fposReceivedManagementCost);
        if (data.fposReceivedEquityGrant !== undefined) updateData.fposReceivedEquityGrant = parseInt(data.fposReceivedEquityGrant);
        if (data.techBackstoppingFpos !== undefined || data.techBackstoppingProvided !== undefined) updateData.techBackstoppingProvided = parseInt(data.techBackstoppingFpos ?? data.techBackstoppingProvided);
        if (data.trainingProgsOrganized !== undefined || data.trainingProgrammeOrganized !== undefined) updateData.trainingProgrammeOrganized = parseInt(data.trainingProgsOrganized ?? data.trainingProgrammeOrganized);
        if (data.trainingReceivedByMembers !== undefined) updateData.trainingReceivedByMembers = data.trainingReceivedByMembers === 'Yes' || data.trainingReceivedByMembers === true;
        if (data.assistanceEconomicActivities !== undefined || data.assistanceInEconomicActivities !== undefined) updateData.assistanceInEconomicActivities = parseInt(data.assistanceEconomicActivities ?? data.assistanceInEconomicActivities);
        if (data.businessPlanCbbo !== undefined || data.businessPlanPreparedWithCbbo !== undefined) updateData.businessPlanPreparedWithCbbo = data.businessPlanCbbo === 'Yes' || data.businessPlanCbbo === true || !!data.businessPlanPreparedWithCbbo;
        if (data.businessPlanWithoutCbbo !== undefined || data.businessPlanPreparedWithoutCbbo !== undefined) updateData.businessPlanPreparedWithoutCbbo = data.businessPlanWithoutCbbo === 'Yes' || data.businessPlanWithoutCbbo === true || !!data.businessPlanPreparedWithoutCbbo;
        if (data.fposDoingBusiness !== undefined) updateData.fposDoingBusiness = parseInt(data.fposDoingBusiness);

        const result = await prisma.fpoCbboDetails.update({
            where: { fpoCbboDetailsId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.fpoCbboDetails.delete({
            where: { fpoCbboDetailsId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.fpoCbboDetailsId,
        kvkId: r.kvkId,
        yearId: r.reportingYear, // Frontend alias
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYear: r.reportingYear,
        blocksAllocated: r.blocksAllocated,
        fposRegisteredAsCbbo: r.fposRegisteredAsCbbo,
        avgMembersPerFpo: r.avgMembersPerFpo,
        fposReceivedManagementCost: r.fposReceivedManagementCost,
        fposReceivedMgmtCost: r.fposReceivedManagementCost, // Frontend alias
        fposReceivedEquityGrant: r.fposReceivedEquityGrant,
        techBackstoppingProvided: r.techBackstoppingProvided,
        techBackstoppingFpos: r.techBackstoppingProvided, // Frontend alias
        trainingProgrammeOrganized: r.trainingProgrammeOrganized,
        trainingProgsOrganized: r.trainingProgrammeOrganized, // Frontend alias
        trainingReceivedByMembers: r.trainingReceivedByMembers ? 'Yes' : 'No', // Frontend expected string
        assistanceInEconomicActivities: r.assistanceInEconomicActivities,
        assistanceEconomicActivities: r.assistanceInEconomicActivities, // Frontend alias
        businessPlanPreparedWithCbbo: r.businessPlanPreparedWithCbbo,
        businessPlanCbbo: r.businessPlanPreparedWithCbbo ? 'Yes' : 'No', // Frontend alias
        businessPlanPreparedWithoutCbbo: r.businessPlanPreparedWithoutCbbo,
        businessPlanWithoutCbbo: r.businessPlanPreparedWithoutCbbo ? 'Yes' : 'No', // Frontend alias
        fposDoingBusiness: r.fposDoingBusiness,
    };
}

module.exports = fpoCbboDetailsRepository;
