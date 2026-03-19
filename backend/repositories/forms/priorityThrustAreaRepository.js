const prisma = require('../../config/prisma.js');

const priorityThrustAreaRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.priorityThrustArea.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                thrustArea: data.thrustArea,
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

        return await prisma.priorityThrustArea.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.priorityThrustArea.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.priorityThrustArea.update({
            where: { priorityThrustAreaId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                thrustArea: data.thrustArea !== undefined ? data.thrustArea : existing.thrustArea,
            }
        });
    },

    delete: async (id, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.priorityThrustArea.delete({
            where: { priorityThrustAreaId: id }
        });
    }
};

module.exports = priorityThrustAreaRepository;
