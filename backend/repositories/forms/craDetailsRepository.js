const prisma = require('../../config/prisma.js');

const craDetailsRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        // Look up the farming system name if an ID was provided
        let farmingSystemCrop = data.farmingSystemCrop || data.farmingSystemName || '';
        if (data.farmingSystemId) {
            const fs = await prisma.craFarmingSystem.findUnique({
                where: { craFarmingSystemId: parseInt(data.farmingSystemId) }
            });
            if (fs) farmingSystemCrop = fs.farmingSystemName;
        }

        return await prisma.craDetails.create({
            data: {
                kvkId,
                reportingYearId: (data.reportingYearId || data.yearId) ? parseInt(data.reportingYearId || data.yearId) : null,
                seasonId: data.seasonId ? parseInt(data.seasonId) : null,
                technologyDemonstrated: data.technologyDemonstrated || data.interventions || '',
                cropingSystem: data.cropingSystem || data.croppingSystem || '',
                farmingSystemCrop: farmingSystemCrop,
                areaUnderDemonstrationAcre: parseFloat(data.areaUnderDemonstrationAcre || data.areaInAcre || 0),
                generalM: parseInt(data.generalM || data.genM || 0),
                generalF: parseInt(data.generalF || data.genF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                cropYieldQha: parseFloat(data.cropYieldQha || data.cropYield || 0),
                systemProductivityQha: parseFloat(data.systemProductivityQha || data.systemProductivity || 0),
                totalReturnRsHa: parseFloat(data.totalReturnRsHa || data.totalReturn || 0),
                yieldObtainedUnderFarmerPracticesQha: parseFloat(data.yieldObtainedUnderFarmerPracticesQha || data.farmerPracticeYield || 0)
            },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.craDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { craDetailsId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const result = await prisma.craDetails.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.craDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        let farmingSystemCrop = data.farmingSystemCrop || data.farmingSystemName;
        if (data.farmingSystemId) {
            const fs = await prisma.craFarmingSystem.findUnique({
                where: { craFarmingSystemId: parseInt(data.farmingSystemId) }
            });
            if (fs) farmingSystemCrop = fs.farmingSystemName;
        }

        const result = await prisma.craDetails.update({
            where: { craDetailsId: parseInt(id) },
            data: {
                reportingYearId: (data.reportingYearId || data.yearId) ? parseInt(data.reportingYearId || data.yearId) : undefined,
                seasonId: data.seasonId ? parseInt(data.seasonId) : undefined,
                technologyDemonstrated: data.interventions !== undefined ? data.interventions : (data.technologyDemonstrated !== undefined ? data.technologyDemonstrated : undefined),
                cropingSystem: data.croppingSystem !== undefined ? data.croppingSystem : (data.cropingSystem !== undefined ? data.cropingSystem : undefined),
                farmingSystemCrop: farmingSystemCrop !== undefined ? farmingSystemCrop : undefined,
                areaUnderDemonstrationAcre: (data.areaInAcre !== undefined || data.areaUnderDemonstrationAcre !== undefined) ? parseFloat(data.areaInAcre ?? data.areaUnderDemonstrationAcre) : undefined,
                generalM: (data.genM !== undefined || data.generalM !== undefined) ? parseInt(data.genM ?? data.generalM) : undefined,
                generalF: (data.genF !== undefined || data.generalF !== undefined) ? parseInt(data.genF ?? data.generalF) : undefined,
                obcM: data.obcM !== undefined ? parseInt(data.obcM) : undefined,
                obcF: data.obcF !== undefined ? parseInt(data.obcF) : undefined,
                scM: data.scM !== undefined ? parseInt(data.scM) : undefined,
                scF: data.scF !== undefined ? parseInt(data.scF) : undefined,
                stM: data.stM !== undefined ? parseInt(data.stM) : undefined,
                stF: data.stF !== undefined ? parseInt(data.stF) : undefined,
                cropYieldQha: (data.cropYield !== undefined || data.cropYieldQha !== undefined) ? parseFloat(data.cropYield ?? data.cropYieldQha) : undefined,
                systemProductivityQha: (data.systemProductivity !== undefined || data.systemProductivityQha !== undefined) ? parseFloat(data.systemProductivity ?? data.systemProductivityQha) : undefined,
                totalReturnRsHa: (data.totalReturn !== undefined || data.totalReturnRsHa !== undefined) ? parseFloat(data.totalReturn ?? data.totalReturnRsHa) : undefined,
                yieldObtainedUnderFarmerPracticesQha: (data.farmerPracticeYield !== undefined || data.yieldObtainedUnderFarmerPracticesQha !== undefined) ? parseFloat(data.farmerPracticeYield ?? data.yieldObtainedUnderFarmerPracticesQha) : undefined
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.craDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.craDetails.delete({
            where: { craDetailsId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.craDetailsId,
        kvkName: r.kvk ? r.kvk.kvkName : '',
        reportingYearId: r.reportingYearId,
        yearId: r.reportingYearId,
        reportingYear: r.reportingYear ? r.reportingYear.yearName : '',
        seasonId: r.seasonId,
        season: r.season ? r.season.seasonName : '',
        // Map back to frontend names
        technologyDemonstrated: r.technologyDemonstrated,
        interventions: r.technologyDemonstrated,
        croppingSystem: r.cropingSystem,
        farmingSystemName: r.farmingSystemCrop, 
        areaInAcre: r.areaUnderDemonstrationAcre,
        areaHa: r.areaUnderDemonstrationAcre, // For table display
        numberOfFarmers: (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0),
        genM: r.generalM,
        genF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        cropYield: r.cropYieldQha,
        systemProductivity: r.systemProductivityQha,
        totalReturn: r.totalReturnRsHa,
        farmerPracticeYield: r.yieldObtainedUnderFarmerPracticesQha
    };
}

module.exports = craDetailsRepository;
