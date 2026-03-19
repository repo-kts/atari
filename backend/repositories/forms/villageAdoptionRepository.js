const prisma = require('../../config/prisma.js');

const villageAdoptionRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.villageAdoption.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                village: data.village,
                block: data.block,
                actionTaken: data.actionTaken,
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

        return await prisma.villageAdoption.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { villageAdoptionId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.villageAdoption.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { villageAdoptionId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.villageAdoption.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.villageAdoption.update({
            where: { villageAdoptionId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                village: data.village !== undefined ? data.village : existing.village,
                block: data.block !== undefined ? data.block : existing.block,
                actionTaken: data.actionTaken !== undefined ? data.actionTaken : existing.actionTaken,
            }
        });
    },

    delete: async (id, user) => {
        const where = { villageAdoptionId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.villageAdoption.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.villageAdoption.delete({
            where: { villageAdoptionId: id }
        });
    }
};

module.exports = villageAdoptionRepository;
