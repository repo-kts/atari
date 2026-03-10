const prisma = require('../../config/prisma.js');

const craDetailsRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.craDetails.create({
            data: {
                kvkId,
                reportingYearId: parseInt(data.reportingYearId || data.yearId),
                seasonId: parseInt(data.seasonId),
                interventions: data.interventions || '',
                croppingSystem: data.croppingSystem || '',
                farmingSystemId: parseInt(data.farmingSystemId),
                areaInAcre: parseFloat(data.areaInAcre || 0),
                genM: parseInt(data.genM || 0),
                genF: parseInt(data.genF || 0),
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
                kvk: { select: { kvkName: true } }
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
                kvk: { select: { kvkName: true } }
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
                kvk: { select: { kvkName: true } }
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

        const result = await prisma.craDetails.update({
            where: { craDetailsId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : (data.yearId ? parseInt(data.yearId) : existing.reportingYearId),
                seasonId: data.seasonId ? parseInt(data.seasonId) : existing.seasonId,
                interventions: data.interventions !== undefined ? data.interventions : existing.interventions,
                croppingSystem: data.croppingSystem !== undefined ? data.croppingSystem : existing.croppingSystem,
                farmingSystemId: data.farmingSystemId ? parseInt(data.farmingSystemId) : existing.farmingSystemId,
                areaInAcre: data.areaInAcre !== undefined ? parseFloat(data.areaInAcre) : existing.areaInAcre,
                genM: data.genM !== undefined ? parseInt(data.genM || 0) : existing.genM,
                genF: data.genF !== undefined ? parseInt(data.genF || 0) : existing.genF,
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
                kvk: { select: { kvkName: true } }
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
        yearId: r.reportingYearId,
        reportingYearId: r.reportingYearId
    };
}

module.exports = craDetailsRepository;
