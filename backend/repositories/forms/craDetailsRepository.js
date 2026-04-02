const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const craDetailsRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        // Resolve cropping system text from selected master ID when provided.
        let croppingSystem = data.croppingSystem || data.cropingSystem || '';
        let croppingSystemId = null;
        if (data.croppingSystemId) {
            croppingSystemId = parseInt(data.croppingSystemId);
            const cs = await prisma.craCropingSystem.findUnique({
                where: { craCropingSystemId: croppingSystemId }
            });
            if (cs) {
                croppingSystem = cs.croppingSystemName || cs.cropName || croppingSystem;
            }
        }

        return await prisma.craDetails.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                seasonId: data.seasonId ? parseInt(data.seasonId) : null,
                interventions: data.interventions || data.technologyDemonstrated || '',
                croppingSystem,
                croppingSystemId,
                farmingSystemId: data.farmingSystemId ? parseInt(data.farmingSystemId) : null,
                areaInAcre: parseFloat(data.areaInAcre || data.areaUnderDemonstrationAcre || 0),
                generalM: parseInt(data.generalM || data.genM || 0),
                generalF: parseInt(data.generalF || data.genF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                cropYield: parseFloat(data.cropYield || data.cropYieldQha || 0),
                systemProductivity: parseFloat(data.systemProductivity || data.systemProductivityQha || 0),
                totalReturn: parseFloat(data.totalReturn || data.totalReturnRsHa || 0),
                farmerPracticeYield: parseFloat(data.farmerPracticeYield || data.yieldObtainedUnderFarmerPracticesQha || 0)
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                farmingSystem: { select: { farmingSystemName: true } },
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
                farmingSystem: { select: { farmingSystemName: true } },
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
                farmingSystem: { select: { farmingSystemName: true } },
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

        let nextCroppingSystemText;
        if (data.croppingSystem !== undefined || data.cropingSystem !== undefined) {
            nextCroppingSystemText = data.croppingSystem ?? data.cropingSystem;
        }

        if (data.croppingSystemId !== undefined && data.croppingSystemId !== null && data.croppingSystemId !== '') {
            const resolvedCroppingSystemId = parseInt(data.croppingSystemId);
            const cs = await prisma.craCropingSystem.findUnique({
                where: { craCropingSystemId: resolvedCroppingSystemId }
            });
            if (cs) {
                nextCroppingSystemText = cs.croppingSystemName || cs.cropName || nextCroppingSystemText;
            }
        }

        const result = await prisma.craDetails.update({
            where: { craDetailsId: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : undefined,
                seasonId: data.seasonId ? parseInt(data.seasonId) : undefined,
                interventions: data.interventions !== undefined ? data.interventions : (data.technologyDemonstrated !== undefined ? data.technologyDemonstrated : undefined),
                croppingSystem: nextCroppingSystemText !== undefined ? nextCroppingSystemText : undefined,
                croppingSystemId: data.croppingSystemId !== undefined ? (data.croppingSystemId ? parseInt(data.croppingSystemId) : null) : undefined,
                farmingSystemId: data.farmingSystemId !== undefined ? (data.farmingSystemId ? parseInt(data.farmingSystemId) : null) : undefined,
                areaInAcre: (data.areaInAcre !== undefined || data.areaUnderDemonstrationAcre !== undefined) ? parseFloat(data.areaInAcre ?? data.areaUnderDemonstrationAcre) : undefined,
                generalM: (data.genM !== undefined || data.generalM !== undefined) ? parseInt(data.genM ?? data.generalM) : undefined,
                generalF: (data.genF !== undefined || data.generalF !== undefined) ? parseInt(data.genF ?? data.generalF) : undefined,
                obcM: data.obcM !== undefined ? parseInt(data.obcM) : undefined,
                obcF: data.obcF !== undefined ? parseInt(data.obcF) : undefined,
                scM: data.scM !== undefined ? parseInt(data.scM) : undefined,
                scF: data.scF !== undefined ? parseInt(data.scF) : undefined,
                stM: data.stM !== undefined ? parseInt(data.stM) : undefined,
                stF: data.stF !== undefined ? parseInt(data.stF) : undefined,
                cropYield: (data.cropYield !== undefined || data.cropYieldQha !== undefined) ? parseFloat(data.cropYield ?? data.cropYieldQha) : undefined,
                systemProductivity: (data.systemProductivity !== undefined || data.systemProductivityQha !== undefined) ? parseFloat(data.systemProductivity ?? data.systemProductivityQha) : undefined,
                totalReturn: (data.totalReturn !== undefined || data.totalReturnRsHa !== undefined) ? parseFloat(data.totalReturn ?? data.totalReturnRsHa) : undefined,
                farmerPracticeYield: (data.farmerPracticeYield !== undefined || data.yieldObtainedUnderFarmerPracticesQha !== undefined) ? parseFloat(data.farmerPracticeYield ?? data.yieldObtainedUnderFarmerPracticesQha) : undefined
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                farmingSystem: { select: { farmingSystemName: true } },
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
        reportingYear: r.reportingYear,
        yearName: formatReportingYear(r.reportingYear),
        seasonId: r.seasonId,
        season: r.season ? r.season.seasonName : '',
        // Map back to frontend names
        technologyDemonstrated: r.interventions,
        interventions: r.interventions,
        croppingSystem: r.croppingSystem,
        cropingSystem: r.croppingSystem,
        croppingSystemId: r.croppingSystemId ?? null,
        farmingSystemName: r.farmingSystem ? r.farmingSystem.farmingSystemName : '',
        farmingSystemId: r.farmingSystemId ?? null,
        areaInAcre: r.areaInAcre,
        areaHa: r.areaInAcre, // For table display
        numberOfFarmers: (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0),
        genM: r.generalM,
        genF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        cropYield: r.cropYield,
        systemProductivity: r.systemProductivity,
        totalReturn: r.totalReturn,
        farmerPracticeYield: r.farmerPracticeYield        
    };
}

module.exports = craDetailsRepository;
