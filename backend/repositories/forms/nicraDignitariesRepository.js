const prisma = require('../../config/prisma.js');

const nicraDignitariesRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraDignitariesVisited.create({
            data: {
                kvkId,
                dateOfVisit: new Date(data.dateOfVisit),
                type: data.type,
                name: data.name,
                remark: data.remark,
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : null,
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

        return await prisma.nicraDignitariesVisited.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraDignitariesVisitedId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraDignitariesVisited.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraDignitariesVisited.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraDignitariesVisited.update({
            where: { nicraDignitariesVisitedId: parseInt(id) },
            data: {
                dateOfVisit: data.dateOfVisit ? new Date(data.dateOfVisit) : existing.dateOfVisit,
                type: data.type !== undefined ? data.type : existing.type,
                name: data.name !== undefined ? data.name : existing.name,
                remark: data.remark !== undefined ? data.remark : existing.remark,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : existing.photographs,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraDignitariesVisited.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraDignitariesVisited.delete({
            where: { nicraDignitariesVisitedId: parseInt(id) }
        });
    }
};

module.exports = nicraDignitariesRepository;
