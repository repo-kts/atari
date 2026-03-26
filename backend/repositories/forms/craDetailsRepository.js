const prisma = require('../../config/prisma.js');

const craDetailsRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const croppingSystemIdRaw = data.croppingSystemId ?? data.craCropingSystemId
        const croppingSystemId = croppingSystemIdRaw !== undefined && croppingSystemIdRaw !== null && croppingSystemIdRaw !== ''
            ? parseInt(croppingSystemIdRaw)
            : null

        let croppingSystemName = data.croppingSystem || ''
        if (croppingSystemId) {
            const cs = await prisma.craCropingSystem.findFirst({
                where: { craCropingSystemId: croppingSystemId },
                select: { cropName: true }
            })
            if (cs?.cropName) croppingSystemName = cs.cropName
        }

        return await prisma.craDetails.create({
            data: {
                kvkId,
                reportingYearId: parseInt(data.reportingYearId || data.yearId),
                seasonId: parseInt(data.seasonId),
                interventions: data.interventions || '',
                // Persist both the FK and a readable copy for backwards compatibility / reporting
                croppingSystemId,
                croppingSystem: croppingSystemName,
                farmingSystemId: parseInt(data.farmingSystemId),
                areaInAcre: parseFloat(data.areaInAcre || 0),
                // Prisma model uses generalM/generalF; API payload uses genM/genF
                generalM: parseInt((data.generalM ?? data.genM) || 0),
                generalF: parseInt((data.generalF ?? data.genF) || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                cropYield: parseFloat(data.cropYield || 0),
                systemProductivity: parseFloat(data.systemProductivity || 0),
                totalReturn: parseFloat(data.totalReturn || 0),
                farmerPracticeYield: parseFloat(data.farmerPracticeYield || 0)
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.craDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
            },
            orderBy: { craDetailsId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const result = await prisma.craDetails.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.craDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const croppingSystemIdRaw = data.croppingSystemId ?? data.craCropingSystemId
        const croppingSystemId = croppingSystemIdRaw !== undefined && croppingSystemIdRaw !== null && croppingSystemIdRaw !== ''
            ? parseInt(croppingSystemIdRaw)
            : undefined

        let croppingSystemName = data.croppingSystem
        if (croppingSystemName === undefined && croppingSystemId !== undefined) {
            if (croppingSystemId) {
                const cs = await prisma.craCropingSystem.findFirst({
                    where: { craCropingSystemId: croppingSystemId },
                    select: { cropName: true }
                })
                croppingSystemName = cs?.cropName || ''
            } else {
                croppingSystemName = ''
            }
        }

        const result = await prisma.craDetails.update({
            where: { craDetailsId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : (data.yearId ? parseInt(data.yearId) : existing.reportingYearId),
                seasonId: data.seasonId ? parseInt(data.seasonId) : existing.seasonId,
                interventions: data.interventions !== undefined ? data.interventions : existing.interventions,
                croppingSystemId: croppingSystemId !== undefined ? croppingSystemId : existing.croppingSystemId,
                croppingSystem: croppingSystemName !== undefined ? croppingSystemName : existing.croppingSystem,
                farmingSystemId: data.farmingSystemId ? parseInt(data.farmingSystemId) : existing.farmingSystemId,
                areaInAcre: data.areaInAcre !== undefined ? parseFloat(data.areaInAcre) : existing.areaInAcre,
                generalM: (data.generalM !== undefined || data.genM !== undefined)
                    ? parseInt((data.generalM ?? data.genM) || 0)
                    : existing.generalM,
                generalF: (data.generalF !== undefined || data.genF !== undefined)
                    ? parseInt((data.generalF ?? data.genF) || 0)
                    : existing.generalF,
                obcM: data.obcM !== undefined ? parseInt(data.obcM || 0) : existing.obcM,
                obcF: data.obcF !== undefined ? parseInt(data.obcF || 0) : existing.obcF,
                scM: data.scM !== undefined ? parseInt(data.scM || 0) : existing.scM,
                scF: data.scF !== undefined ? parseInt(data.scF || 0) : existing.scF,
                stM: data.stM !== undefined ? parseInt(data.stM || 0) : existing.stM,
                stF: data.stF !== undefined ? parseInt(data.stF || 0) : existing.stF,
                cropYield: data.cropYield !== undefined ? parseFloat(data.cropYield) : existing.cropYield,
                systemProductivity: data.systemProductivity !== undefined ? parseFloat(data.systemProductivity) : existing.systemProductivity,
                totalReturn: data.totalReturn !== undefined ? parseFloat(data.totalReturn) : existing.totalReturn,
                farmerPracticeYield: data.farmerPracticeYield !== undefined ? parseFloat(data.farmerPracticeYield) : existing.farmerPracticeYield
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const where = { craDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
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
        ...r,
        id: r.craDetailsId,
        kvkName: r.kvk ? r.kvk.kvkName : '',
        seasonName: r.season?.seasonName || r.seasonName,
        yearId: r.reportingYearId,
        reportingYearId: r.reportingYearId,
        genM: r.generalM,
        genF: r.generalF,
    };
}

module.exports = craDetailsRepository;
