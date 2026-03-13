const prisma = require('../../config/prisma.js');

const rainwaterHarvestingRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.rainwaterHarvesting.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                trainingProgrammes: parseInt(data.trainingProgrammes || 0),
                demonstrations: parseInt(data.demonstrations || 0),
                plantMaterial: parseInt(data.plantMaterial || 0),
                farmerVisits: parseInt(data.farmerVisits || 0),
                officialVisits: parseInt(data.officialVisits || 0),
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

        return await prisma.rainwaterHarvesting.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { rainwaterHarvestingId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.rainwaterHarvesting.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { rainwaterHarvestingId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.rainwaterHarvesting.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.rainwaterHarvesting.update({
            where: { rainwaterHarvestingId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                trainingProgrammes: data.trainingProgrammes !== undefined ? parseInt(data.trainingProgrammes || 0) : existing.trainingProgrammes,
                demonstrations: data.demonstrations !== undefined ? parseInt(data.demonstrations || 0) : existing.demonstrations,
                plantMaterial: data.plantMaterial !== undefined ? parseInt(data.plantMaterial || 0) : existing.plantMaterial,
                farmerVisits: data.farmerVisits !== undefined ? parseInt(data.farmerVisits || 0) : existing.farmerVisits,
                officialVisits: data.officialVisits !== undefined ? parseInt(data.officialVisits || 0) : existing.officialVisits,
            }
        });
    },

    delete: async (id, user) => {
        const where = { rainwaterHarvestingId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.rainwaterHarvesting.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.rainwaterHarvesting.delete({
            where: { rainwaterHarvestingId: id }
        });
    }
};

module.exports = rainwaterHarvestingRepository;
