const prisma = require('../../config/prisma.js');

const operationalAreaRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.operationalArea.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                taluk: data.taluk,
                block: data.block,
                village: data.village,
                majorCrops: data.majorCrops,
                majorProblems: data.majorProblems,
                thrustAreas: data.thrustAreas,
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

        return await prisma.operationalArea.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { operationalAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.operationalArea.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { operationalAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.operationalArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.operationalArea.update({
            where: { operationalAreaId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                taluk: data.taluk !== undefined ? data.taluk : existing.taluk,
                block: data.block !== undefined ? data.block : existing.block,
                village: data.village !== undefined ? data.village : existing.village,
                majorCrops: data.majorCrops !== undefined ? data.majorCrops : existing.majorCrops,
                majorProblems: data.majorProblems !== undefined ? data.majorProblems : existing.majorProblems,
                thrustAreas: data.thrustAreas !== undefined ? data.thrustAreas : existing.thrustAreas,
            }
        });
    },

    delete: async (id, user) => {
        const where = { operationalAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.operationalArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.operationalArea.delete({
            where: { operationalAreaId: id }
        });
    }
};

module.exports = operationalAreaRepository;
