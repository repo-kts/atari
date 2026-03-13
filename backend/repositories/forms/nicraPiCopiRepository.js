const prisma = require('../../config/prisma.js');

const nicraPiCopiRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraPiCopi.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                name: data.name,
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

        return await prisma.nicraPiCopi.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraPiCopiId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraPiCopi.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraPiCopi.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraPiCopi.update({
            where: { nicraPiCopiId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                type: data.type !== undefined ? data.type : existing.type,
                name: data.name !== undefined ? data.name : existing.name,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraPiCopi.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraPiCopi.delete({
            where: { nicraPiCopiId: parseInt(id) }
        });
    }
};

module.exports = nicraPiCopiRepository;
